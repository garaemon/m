/* global flowchart, he */
const FrontendPluginBase = require('./frontend-plugin-base.js');
const getCodeBlockElements = require('./util.js').getCodeBlockElements;

class FlowchartJSFrontendPlugin extends FrontendPluginBase {
  runPreprocess() {
  }
  runPostprocess() {
    const flowchartElements = getCodeBlockElements('flowchart-js');
    console.log(`${flowchartElements.length} mermaid elements are found`);
    flowchartElements.forEach((element, index) => {
      const code = he.decode(element.innerHTML);
      const chart = flowchart.parse(code);
      element.innerHTML = '';   // clear innerHTML and replace it with svg.
      chart.drawSVG(element);
    });
  }
}

module.exports = FlowchartJSFrontendPlugin;
