/* global mermaidAPI, he */
const FrontendPluginBase = require('./frontend-plugin-base.js');
const getCodeBlockElements = require('./util.js').getCodeBlockElements;

// Global variable to check if mermeid is initialized.
let isMermaidInitialized = false;

class MermaidFrontendPlugin extends FrontendPluginBase {
  runPreprocess() {
    if (!isMermaidInitialized) {
      console.log('Initialize mermaid');
      mermaidAPI.initialize({
        startOnLoad: true
      });
      isMermaidInitialized = true;
    }
  }

  runPostprocess() {
    const mermaidElements = getCodeBlockElements('mermaid');
    console.log(`${mermaidElements.length} mermaid elements are found`);
    mermaidElements.forEach(function(element, index) {
      const mermaidCode = he.decode(element.innerHTML);
      mermaidAPI.render(`rendered-mermaid-${index}`, mermaidCode, function(svg) {
        element.innerHTML = svg;
      });
    });
  }
}

module.exports = MermaidFrontendPlugin;
