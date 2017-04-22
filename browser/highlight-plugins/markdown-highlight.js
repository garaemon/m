const log = require('winston');

/**
 * Base class of highlight plugins.
 */
class MarkdownHighlightPlugin {
  /**
   * - code: text of code
   * - lang: laguage
   * - callback: function(error, highlight_error, rendered code) { ... }
   */
  highlight(code, lang, callback) {
    log.error('highlight method should be overloaded');
  }
}

module.exports = MarkdownHighlightPlugin;
