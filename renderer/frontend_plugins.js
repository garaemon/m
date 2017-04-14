// This file is required from frontend process.

class FrontendPlugin {
  runPreprocess() {
  }

  runPostprocess() {
  }

}

// Global variable to check if mermeid is initialized.
var isMermaidInitialized = false;

class MermaidFrontendPlugin extends FrontendPlugin {
  runPreprocess() {
    if (!isMermaidInitialized) {
      console.log('Initialize mermaid');
      mermaidAPI.initialize({
        startOnLoad: true,
      });
      // mermaid.initialize({
      //   flowchart: {
      //     htmLabels: false
      //   }
      // });
      isMermaidInitialized = true;
    }
  }

  runPostprocess() {
    const mermaidElements = document.querySelectorAll('.markdown-body > pre > code > div.mermaid');
    console.log(`${mermaidElements.length} mermaid elements are found`);
    mermaidElements.forEach(function(element, index) {
      const mermaidCode = he.decode(element.innerHTML);
      mermaidAPI.render(`rendered-mermaid-${index}`, mermaidCode, function(svg) {
        element.innerHTML = svg;
      });
    });
  }
}

module.exports = {
  plugins: [new MermaidFrontendPlugin()]
};
