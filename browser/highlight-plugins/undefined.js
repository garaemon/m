const MarkdownHighlightPlugin = require('./markdown-highlight.js');

class UndefinedHighlighter extends MarkdownHighlightPlugin {
  highlight(code, lang, callback) {
    // Do nothing
    callback(null, null, code);
  }
}

module.exports = UndefinedHighlighter;
