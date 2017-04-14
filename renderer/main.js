'use strict';

// main.js
// This file is included from index.html by RendererProcess.
// BrowserProcess will send file to watch via ipc 'notify-file' event.

const electron = require('electron');
const markdown_renderer = electron.remote.require('./browser/markdown_renderer.js');
const path = electron.remote.require('path');

const frontend_plugins = require('./renderer/frontend_plugins.js');

const ipcRenderer = electron.ipcRenderer;

function updateView(filename, content, toc) {
  // main-view should be an instance of <m-view>
  const main_view = document.getElementById('main-view');
  const filename_without_directory = path.basename(filename);
  const filename_fullpath = path.resolve(filename);
  main_view.file = filename_without_directory;
  main_view.fullpath = filename_fullpath;
  main_view.setMarkdownHTML(content);
  main_view.setTOCHTML(toc);
  for (let i = 0; i < frontend_plugins.plugins.length; ++i) {
    frontend_plugins.plugins[i].runPostprocess();
  }
};

function showError(err) {
  // main-view should be an instance of <m-view>
  const main_view = document.getElementById('main-view');
  main_view.showError(err);
}

ipcRenderer.on('notify-file', function(event, file) {
  const renderer = new markdown_renderer.MarkdownRenderer();
  renderer.render(file, function(err, rendered_result) {
    if (!!err) {
      showError(err);
    } else {
      updateView(file, rendered_result['contents'], rendered_result['toc']);
    }
  });
});

ipcRenderer.on('notify-error', function(event, error) {
  if (!!err) {
    showError(err);
  }
});

// Initialize
for (let i = 0; i < frontend_plugins.plugins.length; ++i) {
    frontend_plugins.plugins[i].runPreprocess();
}
