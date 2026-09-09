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

  jest.resetModules();
  require(path.join(__dirname, '..', '..', 'script.js'));
}

module.exports = { loadPage };
