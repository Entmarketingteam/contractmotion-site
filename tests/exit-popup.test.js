const { loadPage } = require('./helpers/loadPage');

function submitExitForm() {
  document.getElementById('exit-form-el').dispatchEvent(
    new Event('submit', { bubbles: true, cancelable: true })
  );
}

describe('Exit-intent lead capture popup (data-center.html)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    window.localStorage.clear();
    window.alert = jest.fn();
    const { triggerLoad } = loadPage('data-center.html', { url: 'http://localhost/data-center.html' });
    triggerLoad();
    jest.advanceTimersByTime(1000);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    delete global.fetch;
  });

  test('rejects a malformed email without calling the webhook', () => {
    global.fetch = jest.fn();
    document.getElementById('exit-email').value = 'not-an-email';
    document.getElementById('exit-metro').value = 'Dallas, TX';
    submitExitForm();

    expect(window.alert).toHaveBeenCalledWith('Please enter a valid work email.');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('rejects a missing target market without calling the webhook', () => {
    global.fetch = jest.fn();
    document.getElementById('exit-email').value = 'ops@acme.com';
    document.getElementById('exit-metro').value = '';
    submitExitForm();

    expect(window.alert).toHaveBeenCalledWith('Please enter your target market.');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('submits a valid lead to the direct-response webhook and shows a confirmation', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    document.getElementById('exit-email').value = 'ops@acme.com';
    document.getElementById('exit-metro').value = 'Dallas, TX';
    submitExitForm();
    await Promise.resolve();
    await Promise.resolve();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe('https://entagency.app.n8n.cloud/webhook/cm-direct-response-lead');
    const body = JSON.parse(opts.body);
    expect(body).toMatchObject({
      email: 'ops@acme.com',
      metro: 'Dallas, TX',
      source: 'exit-intent-popup',
    });

    expect(document.getElementById('exit-popup-content').innerHTML).toContain('Dallas, TX');
    expect(window.localStorage.getItem('cm_exit_popup_closed')).toBe('true');
  });

  test('adversarial: falls back to a mailto link when the webhook request fails', async () => {
    // jsdom's window.location own-property is non-configurable (by design, for
    // security) and real navigation isn't implemented, so intercept the `href`
    // setter on Location.prototype instead of trying to replace `window.location`.
    const locationProto = Object.getPrototypeOf(window.location);
    const originalDescriptor = Object.getOwnPropertyDescriptor(locationProto, 'href');
    let capturedHref = null;
    Object.defineProperty(locationProto, 'href', {
      configurable: true,
      get() { return originalDescriptor.get.call(this); },
      set(value) { capturedHref = value; },
    });

    try {
      global.fetch = jest.fn().mockRejectedValue(new Error('network down'));
      document.getElementById('exit-email').value = 'ops@acme.com';
      document.getElementById('exit-metro').value = 'Dallas, TX';
      submitExitForm();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();

      expect(capturedHref).toContain('mailto:ethan@contractmotion.com');
      expect(capturedHref).toContain(encodeURIComponent('Dallas, TX'));
    } finally {
      Object.defineProperty(locationProto, 'href', originalDescriptor);
    }
  });
});
