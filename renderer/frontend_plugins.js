/* global mermaidAPI, he, flowchart*/
// This file is required from frontend process.

function buildSelectorForCodeBlock(classSelector) {
  return `.markdown-body > pre > code > div.${classSelector}`;
}

function getCodeBlockElements(classSelector) {
  return document.querySelectorAll(buildSelectorForCodeBlock(classSelector));
}

class FrontendPlugin {
  runPreprocess() {
  }

  runPostprocess() {
  }

}

// Global variable to check if mermeid is initialized.
let isMermaidInitialized = false;

class MermaidFrontendPlugin extends FrontendPlugin {
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

class FlowchartJSFrontendPlugin extends FrontendPlugin {
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

module.exports = {
  plugins: [new MermaidFrontendPlugin(), new FlowchartJSFrontendPlugin()]
};
