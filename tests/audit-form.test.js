const { loadPage } = require('./helpers/loadPage');

describe('Signal Audit form (data-center.html)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    loadPage('data-center.html', {
      url: 'http://localhost/data-center.html?utm_source=google&utm_medium=cpc&utm_campaign=fall-launch',
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    delete global.fetch;
  });

  function submit() {
    document.getElementById('auditForm').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
  }

  test('rejects an empty submission and requires company first', () => {
    submit();
    expect(document.getElementById('formError').textContent).toBe('Company name is required.');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('rejects a malformed work email', () => {
    document.getElementById('company').value = 'Acme Contracting';
    document.getElementById('workEmail').value = 'not-an-email';
    submit();
    expect(document.getElementById('formError').textContent).toBe('A valid work email is required.');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('requires role, then revenue, then remaining vertical selects in order', () => {
    document.getElementById('company').value = 'Acme Contracting';
    document.getElementById('workEmail').value = 'ops@acme.com';

    submit();
    expect(document.getElementById('formError').textContent).toBe('Please select your role.');

    document.getElementById('role').value = 'owner';
    submit();
    expect(document.getElementById('formError').textContent).toBe('Please select your revenue range.');

    document.getElementById('revenue').value = '30-75m';
    submit();
    // "region" select (the data-center-specific field) is still unset
    expect(document.getElementById('formError').textContent).toBe('Please complete all fields.');
  });

  test('submits a valid lead with vertical segmentation and attribution to the correct webhook', async () => {
    document.getElementById('company').value = 'Acme Contracting';
    document.getElementById('workEmail').value = 'ops@acme.com';
    document.getElementById('role').value = 'owner';
    document.getElementById('revenue').value = '30-75m';
    document.getElementById('region').value = 'ercot';

    submit();
    await Promise.resolve();
    await Promise.resolve();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toBe('https://entagency.app.n8n.cloud/webhook/contractmotion-signal-audit');
    expect(opts.method).toBe('POST');

    const body = JSON.parse(opts.body);
    expect(body).toMatchObject({
      company: 'Acme Contracting',
      email: 'ops@acme.com',
      role: 'owner',
      revenue: '30-75m',
      region: 'region: ercot',
      siteSlug: 'data-center',
      utmSource: 'google',
      utmMedium: 'cpc',
      utmCampaign: 'fall-launch',
    });
    expect(body.pageUrl).toContain('/data-center.html');
    expect(() => new Date(body.submittedAt).toISOString()).not.toThrow();

    expect(document.getElementById('auditForm').style.display).toBe('none');
    expect(document.getElementById('formSuccess').style.display).toBe('block');
  });

  test('still shows success state when the webhook request fails (fire-and-forget submission)', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network down'));
    document.getElementById('company').value = 'Acme Contracting';
    document.getElementById('workEmail').value = 'ops@acme.com';
    document.getElementById('role').value = 'owner';
    document.getElementById('revenue').value = '30-75m';
    document.getElementById('region').value = 'ercot';

    submit();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(document.getElementById('formSuccess').style.display).toBe('block');
  });
});

describe('Signal Audit form generic segmentation capture across verticals', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    delete global.fetch;
  });

  function submit() {
    document.getElementById('auditForm').dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    );
  }

  test('captures the "trade" select on commercial-trades.html into region', async () => {
    loadPage('commercial-trades.html', { url: 'http://localhost/commercial-trades.html' });

    document.getElementById('company').value = 'Beta Mechanical';
    document.getElementById('workEmail').value = 'info@beta.com';
    document.getElementById('role').value = document.querySelector('#role option[value]:not([value=""])').value;
    document.getElementById('revenue').value = document.querySelector('#revenue option[value]:not([value=""])').value;
    document.getElementById('trade').value = document.querySelector('#trade option[value]:not([value=""])').value;

    submit();
    await Promise.resolve();
    await Promise.resolve();

    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.region).toMatch(/^trade: /);
  });

  test('captures the "facility-type" select on industrial.html into region', async () => {
    loadPage('industrial.html', { url: 'http://localhost/industrial.html' });

    document.getElementById('company').value = 'Gamma Industrial';
    document.getElementById('workEmail').value = 'info@gamma.com';
    document.getElementById('role').value = document.querySelector('#role option[value]:not([value=""])').value;
    document.getElementById('revenue').value = document.querySelector('#revenue option[value]:not([value=""])').value;
    document.getElementById('facility-type').value = document.querySelector('#facility-type option[value]:not([value=""])').value;

    submit();
    await Promise.resolve();
    await Promise.resolve();

    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.region).toMatch(/^facility-type: /);
  });
});
