const mjAPI = require('mathjax-node/lib/mj-single.js');

const MarkdownHighlightPlugin = require('./markdown-highlight.js');

mjAPI.config({
  MathJax: {
    // traditional MathJax configuration
  },
});
mjAPI.start();

class MathjaxHighlighter extends MarkdownHighlightPlugin {
  highlight(code, lang, callback) {
    mjAPI.typeset({
      math: code,
      format: 'TeX', // 'inline-TeX', 'MathML'
      renderer: 'SVG',
      svg: true,
    }, (data) => {
      if (data.errors) {
        callback(null, data.errors[0], code);
      } else {
        callback(null, null, data.svg);
      }
    });
  }
}

module.exports = MathjaxHighlighter;
