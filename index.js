'use strict';

// system files
const fs = require('fs');
const path = require('path');
const util = require('util');

// 3rd party libraries
const electron = require('electron');
const electron_reload = require('electron-reload');
const electron_debug = require('electron-debug');
const log = require('winston');
const minimist = require('minimist');
const openAboutWindow = require('about-window').default;

// local libraries
const menu = require('./browser/menu');

const argv = minimist(process.argv.slice(2));

const app = electron.app;
// adds debug features like hotkeys for triggering dev tools and reload
electron_debug();

// reload if any change is detected.
electron_reload(__dirname);

log.addColors({
    debug: 'green',
    info:  'cyan',
    silly: 'magenta',
    warn:  'yellow',
    error: 'red'
});

log.remove(log.transports.Console);
log.add(log.transports.Console, {level: 'debug', colorize:true, timestamp: true});

// prevent window being garbage collected
let mainWindow;

function openWithFile(target_file, is_debug_mode) {
  if (!fs.existsSync(target_file)) {
    log.error(`${target_file} does not exists.`);
    process.exit(1);
  }
  electron.Menu.setApplicationMenu(menu);
  if (is_debug_mode) {
    mainWindow.webContents.openDevTools();
  }
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
};

function main() {
  // TODO: remove options from process.argv
  const is_debug_mode = 'debug' in argv && argv['debug'];
  if (!mainWindow) {
    mainWindow = createMainWindow();
  }

  if (process.argv.length < 3) {
    // Open dialog file if no file is specified
    electron.dialog.showOpenDialog(mainWindow, function(file_paths) {
      if (!file_paths || file_paths.length != 1) {
        log.error(`Please choose one file`);
        process.exit(1);
      } else {
        openWithFile(file_paths[0], is_debug_mode);
      }
    });
  } else {
    const target_file = process.argv[2];
    openWithFile(target_file, is_debug_mode);
  }
};

function onClosed() {
  // dereference the window
  // for multiple windows store them in an array
  mainWindow = null;
}

function createMainWindow() {
  const win = new electron.BrowserWindow({
    width: 1200,
    height: 800
  });
  const html_file = `file://${__dirname}/index.html`;
  win.loadURL(html_file);
  win.on('closed', onClosed);
  return win;
}

function showAboutApplication() {
  openAboutWindow({
    icon_path: path.join(__dirname, 'resources/logo.png'),
    copyright: 'Copyright (c) 2017 garaemon'
  });
};

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
  main();
});
