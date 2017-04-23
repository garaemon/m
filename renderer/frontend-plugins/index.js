const MermaidFrontendPlugin = require('./mermaid.js');
const FlowchartJSFrontendPlugin = require('./flowchart.js');

module.exports = {
  plugins: [new MermaidFrontendPlugin(), new FlowchartJSFrontendPlugin()]
};
