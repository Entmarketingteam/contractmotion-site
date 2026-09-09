// jsdom does not implement layout/scroll APIs; the site's real code calls
// scrollIntoView on submit, so stub it rather than letting it throw.
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = jest.fn();
}
