const electron = require('electron');

const frontendPlugins = require('./frontend-plugins');

const MarkdownRenderer = electron.remote.require('./browser/markdown-renderer.js');

// Application class for render process
class RenderApplication {
  constructor() {
    this.registerIpcCallbacks();
    this.runPreprocessPlugins();
  }

  runPreprocessPlugins() {
    for (const plugin of frontendPlugins.plugins) {
      plugin.runPreprocess();
    }
  }

  runPostprocessPlugins() {
    for (const plugin of frontendPlugins.plugins) {
      plugin.runPostprocess();
    }
  }

  // register callback methods for ipc
  registerIpcCallbacks() {
    const ipcRenderer = electron.ipcRenderer;
    ipcRenderer.on('notify-file', (event, file) => this.notifyFileCallback(file));
    ipcRenderer.on('notify-error', (event, error) => this.notifyErrorCallback(error));
    ipcRenderer.on('toggle-toc', () => this.toggleTocCallback());
  }

  getMainView() {
    return document.getElementById('main-view');
  }

  renderFile(file) {
    const renderer = new MarkdownRenderer();
    const mainView = this.getMainView();
    renderer.render(file, (err, renderedResult) => {
      if (err) {
        mainView.showError(err);
      } else {
        mainView.updateView(renderedResult);
        this.runPostprocessPlugins();
        electron.ipcRenderer.send('rendered');
      }
    });
  }

  toggleTocCallback() {
    const mainView = this.getMainView();
    mainView.toggleTOC();
  }

  notifyErrorCallback(error) {
    if (error) {
      const mainView = this.getMainView();
      mainView.showError(error);
    }
  }

  notifyFileCallback(file) {
    this.renderFile(file);
  }

  run() {
    // Do nothing
  }
}

module.exports = RenderApplication;
