const highlightjs = require('highlight.js');
const log = require('winston');
const mjAPI = require("mathjax-node/lib/mj-single.js");

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

class UndefinedHighlighter extends MarkdownHighlightPlugin {
  highlight(code, lang, callback) {
    // Do nothing
    callback(null, null, code);
  }
}

mjAPI.config({
  MathJax: {
    // traditional MathJax configuration
  }
});
mjAPI.start();

class MathjaxHighlighter extends MarkdownHighlightPlugin {
  constructor() {
    // setup mathjax

  }

  highlight(code, lang, callback) {
    mjAPI.typeset({
      math: code,
      format: 'TeX', // 'inline-TeX', 'MathML'
      renderer: 'SVG',
      svg: true
    }, function (data) {
      if (data.errors) {
        callback(null, data.errors[0], code);
      } else {
        callback(null, null, data.svg);
      }
    });
  }
}

class DefaultHighlighter extends MarkdownHighlightPlugin {
  highlight(code, lang, callback) {
    try {
      const highlighted_html = highlightjs.highlight(lang, code).value;
      callback(null, null, highlighted_html);
    } catch (e) {
      callback(null, 'highlight.js error: ' + e.message, code);
    }
  }
}

module.exports.DefaultHighlighter = DefaultHighlighter;
module.exports.UndefinedHighlighter = UndefinedHighlighter;
module.exports.MathjaxHighlighter = MathjaxHighlighter;
