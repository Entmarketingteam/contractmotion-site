const { loadPage } = require('./helpers/loadPage');

describe('Signal Report subscribe form (data-center.html)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    loadPage('data-center.html', { url: 'http://localhost/data-center.html' });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    delete global.fetch;
  });

  function submit() {
    document.getElementById('subscribeForm').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
  }

  test('rejects an empty email', () => {
    submit();
    expect(document.getElementById('subError').textContent).toBe('A valid email address is required.');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('rejects an email missing a TLD (adversarial malformed input)', () => {
    document.getElementById('subEmail').value = 'person@company';
    submit();
    expect(document.getElementById('subError').textContent).toBe('A valid email address is required.');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('submits a valid email to the subscribe webhook with attribution metadata', async () => {
    document.getElementById('subEmail').value = 'reader@company.com';
    submit();
    await Promise.resolve();
    await Promise.resolve();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe('https://entagency.app.n8n.cloud/webhook/contractmotion-subscribe');
    const body = JSON.parse(opts.body);
    expect(body.email).toBe('reader@company.com');
    expect(body.siteSlug).toBe('data-center');

    expect(document.getElementById('subscribeForm').style.display).toBe('none');
    expect(document.getElementById('subSuccess').style.display).toBe('flex');
  });

  test('BEHAVIOR NOTE: still reports success to the user when the webhook call fails outright', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network down'));
    document.getElementById('subEmail').value = 'reader@company.com';
    submit();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    // The lead is silently dropped client-side on network failure, but the UI
    // still shows the success state. Documented here, not fixed (out of scope).
    expect(document.getElementById('subSuccess').style.display).toBe('flex');
  });
});
