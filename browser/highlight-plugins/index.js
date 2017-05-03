const DefaultHighlighter = require('./default.js');
const FlowchartJSHighlighter = require('./flowchart.js');
const MathjaxHighlighter = require('./mathjax.js');
const MermaidHighlighter = require('./mermaid.js');
const UndefinedHighlighter = require('./undefined.js');

module.exports = {
  'undefined': new UndefinedHighlighter(),
  'default': new DefaultHighlighter(),
  'mathjax': new MathjaxHighlighter(),
  'mermaid': new MermaidHighlighter(),
  'flowchart.js': new FlowchartJSHighlighter(),
};
