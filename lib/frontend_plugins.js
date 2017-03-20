// This file is required from frontend process.

class FrontendPlugin {
  runPreprocess() {
  }

  runPostprocess() {
  }

}

// Global variable to check if mermeid is initialized.
var is_mermaid_initialized = false;

class MermaidFrontendPlugin extends FrontendPlugin {
  runPreprocess() {
    if (!is_mermaid_initialized) {
      console.log('Initialize mermaid');
      mermaidAPI.initialize({
        startOnLoad: true,
      });
      // mermaid.initialize({
      //   flowchart: {
      //     htmLabels: false
      //   }
      // });
      is_mermaid_initialized = true;
    }
  }

  runPostprocess() {
    const mermaid_elements = document.querySelectorAll('.markdown-body > pre > code > div.mermaid');
    console.log(`${mermaid_elements.length} mermaid elements are found`);
    mermaid_elements.forEach(function(element, index) {
      const mermaid_code = he.decode(element.innerHTML);
      mermaidAPI.render(`rendered-mermaid-${index}`, mermaid_code, function(svg) {
        element.innerHTML = svg;
      });
    });
  }
}

module.exports = {
  plugins: [new MermaidFrontendPlugin()]
};
