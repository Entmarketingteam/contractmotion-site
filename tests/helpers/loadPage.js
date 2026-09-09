const fs = require('fs');
const path = require('path');

/**
 * Loads a real site HTML fixture into the jsdom document, then executes the
 * real script.js against it (fresh module instance per call).
 */
function loadPage(htmlFile, { url } = {}) {
  if (url) {
    window.history.pushState({}, '', url);
  }

  const html = fs.readFileSync(path.join(__dirname, '..', '..', htmlFile), 'utf8');
  document.open();
  document.write(html);
  document.close();

  // script.js registers its exit-popup init via window.addEventListener('load', ...).
  // jsdom keeps one `window` per test file, so dispatching a real 'load' event would
  // re-fire every previous test's stale listener too. Capture this call's own
  // listener instead so each test can trigger only its own instance deterministically.
  const originalAddEventListener = window.addEventListener.bind(window);
  let capturedLoadListener = null;
  window.addEventListener = function (type, listener, options) {
    if (type === 'load' && capturedLoadListener === null) {
      capturedLoadListener = listener;
    }
    return originalAddEventListener(type, listener, options);
  };

  jest.resetModules();
  require(path.join(__dirname, '..', '..', 'script.js'));

  window.addEventListener = originalAddEventListener;

  return { triggerLoad: capturedLoadListener || function () {} };
}

module.exports = { loadPage };
