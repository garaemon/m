const he = require('he');

const MarkdownHighlightPlugin = require('./markdown-highlight.js');

class MermaidHighlighter extends MarkdownHighlightPlugin {
  highlight(code, lang, callback) {
    const encodedCode = he.encode(code);
    callback(null, null, `<div class="mermaid">${encodedCode}</div>`);
  }
}

module.exports = MermaidHighlighter;
