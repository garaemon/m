const highlightjs = require('highlight.js');
const mjAPI = require("mathjax-node/lib/mj-single.js");
const he = require('he');

// class MarkdownHighlightPlugin {
//   /**
//    * - code: text of code
//    * - lang: laguage
//    * - callback: function(error, highlight_error, rendered code) { ... }
//    */
//   highlight(code, lang, callback) {
//     log.error('highlight method should be overloaded');
//   }
// }

class UndefinedHighlighter {
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

class MathjaxHighlighter {
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

class DefaultHighlighter {
  highlight(code, lang, callback) {
    try {
      const highlightedHtml = highlightjs.highlight(lang, code).value;
      callback(null, null, highlightedHtml);
    } catch (e) {
      callback(null, 'highlight.js error: ' + e.message, code);
    }
  }
}

/**
 *
 */
class MermaidHighlighter {
  highlight(code, lang, callback) {
    const encodedCode = he.encode(code);
    callback(null, null, `<div class="mermaid">${encodedCode}</div>`);
  }
}

module.exports.DefaultHighlighter = DefaultHighlighter;
module.exports.UndefinedHighlighter = UndefinedHighlighter;
module.exports.MathjaxHighlighter = MathjaxHighlighter;
module.exports.MermaidHighlighter = MermaidHighlighter;
