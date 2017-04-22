const he = require('he');

const MarkdownHighlightPlugin = require('./markdown-highlight.js');

class FlowchartJSHighlighter extends MarkdownHighlightPlugin {
  highlight(code, lang, callback) {
    const encodedCode = he.encode(code);
    callback(null, null, `<div class="flowchart-js">${encodedCode}</div>`);
  }
}

module.exports = FlowchartJSHighlighter;
