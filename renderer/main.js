// main.js
// This file is included from index.html by RendererProcess.
// BrowserProcess will send file to watch via ipc 'notify-file' event.

const electron = require('electron');
const markdownRenderer = electron.remote.require('./browser/markdown_renderer.js');
const path = electron.remote.require('path');

const frontendPlugins = require('./renderer/frontend_plugins.js');

const ipcRenderer = electron.ipcRenderer;

function updateView(filename, content, toc) {
  // main-view should be an instance of <m-view>
  const mainView = document.getElementById('main-view');
  const filenameWithoutDirectory = path.basename(filename);
  const filenameFullpath = path.resolve(filename);
  mainView.file = filenameWithoutDirectory;
  mainView.fullpath = filenameFullpath;
  mainView.setMarkdownHTML(content);
  mainView.setTOCHTML(toc);
  for (let i = 0; i < frontendPlugins.plugins.length; ++i) {
    frontendPlugins.plugins[i].runPostprocess();
  }
};

function showError(err) {
  // main-view should be an instance of <m-view>
  const mainView = document.getElementById('main-view');
  mainView.showError(err);
}

ipcRenderer.on('notify-file', function(event, file) {
  const renderer = new markdownRenderer.MarkdownRenderer();
  renderer.render(file, function(err, renderedResult) {
    if (!!err) {
      showError(err);
    } else {
      updateView(file, renderedResult['contents'], renderedResult['toc']);
    }
  });
});

ipcRenderer.on('notify-error', function(event, error) {
  if (!!error) {
    showError(error);
  }
});

ipcRenderer.on('toggle-toc', function(event, error) {
  const mainView = document.getElementById('main-view');
  mainView.toggleTOC();
});

// Initialize
for (let i = 0; i < frontendPlugins.plugins.length; ++i) {
    frontendPlugins.plugins[i].runPreprocess();
}
