const highlightjs = require('highlight.js');

const MarkdownHighlightPlugin = require('./markdown-highlight.js');

class DefaultHighlighter extends MarkdownHighlightPlugin {
  highlight(code, lang, callback) {
    try {
      const highlightedHtml = highlightjs.highlight(lang, code).value;
      callback(null, null, highlightedHtml);
    } catch (e) {
      callback(null, 'highlight.js error: ' + e.message, code);
    }
  }
}

module.exports = DefaultHighlighter;
