'use strict';

const electron = require('electron');
const electron_reload = require('electron-reload');
const util = require('util');
const ejs = require('ejs');
const fs = require('fs');
const log = require('color-log');

const app = electron.app;
// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// reload if any change is detected.
electron_reload(__dirname);

const target_file = process.argv[2];
// prevent window being garbage collected
let mainWindow;

function onClosed() {
  // dereference the window
  // for multiple windows store them in an array
  mainWindow = null;
}

function createMainWindow() {
  const win = new electron.BrowserWindow({
    width: 600,
    height: 400
  });
  const html_file = `file://${__dirname}/index.html`;
  win.loadURL(html_file);
  win.on('closed', onClosed);
  return win;
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (!mainWindow) {
    mainWindow = createMainWindow();
  }
});

app.on('ready', () => {
  mainWindow = createMainWindow();
  mainWindow.webContents.on('did-finish-load', function() {
    log.info(`send notify-file event to open ${target_file}`);
    mainWindow.send('notify-file', target_file);
  });
  // start watching file
  fs.watch(target_file, function() {
    log.info(`detect change on ${target_file}`);
    mainWindow.send('notify-file', target_file);
  });
  electron.ipcMain.on('copy-to-clipboard', function(event, arg) {
    if (arg) {
      log.info(`write to clipboard: ${arg}`);
      // CAVEAT: writeText does not work in tmux environment on OS X.
      electron.clipboard.writeText(arg);
    }
  });
});
