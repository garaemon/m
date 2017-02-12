'use strict';

// main.js
// This file is included from index.html by RendererProcess.
// BrowserProcess will send file to watch via ipc 'notify-file' event.

const electron = require('electron');
const markdown_renderer = electron.remote.require('./lib/markdown_renderer.js');
const path = electron.remote.require('path');
const ipcRenderer = electron.ipcRenderer;

function updateView(filename, content, toc) {
  var main_view = document.getElementById('main-view'); // main-view should be an instance of <m-view>
  console.log(main_view);
  const filename_without_directory = path.basename(filename);
  const filename_fullpath = path.resolve(filename);
  main_view.file = filename_without_directory;
  main_view.fullpath = filename_fullpath;
  main_view.setMarkdownHTML(content);
  main_view.setTOCHTML(toc);
};

ipcRenderer.on('notify-file', function(event, file) {
  console.log('received notify-file message');
  markdown_renderer.renderMarkdown(file, function(err, rendered_result) {
    updateView(file, rendered_result['contents'], rendered_result['toc']);
  });
});
