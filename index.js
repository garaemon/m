'use strict';

const electron = require('electron');
const electron_reload = require('electron-reload');
const util = require('util');
const ejs = require('ejs');
const fs = require('fs');
const log = require('winston');
const minimist = require('minimist');
const openAboutWindow = require('about-window').default;
const path = require('path');

const argv = minimist(process.argv.slice(2));

const app = electron.app;
// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

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

const target_file = process.argv[2];
const is_debug_mode = 'debug' in argv && argv['debug'];

if (!fs.existsSync(target_file)) {
  log.error(`${target_file} does not exists.`);
  process.exit(1);
}

// prevent window being garbage collected
let mainWindow;

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

function setupMenu() {
  const menu_template = [
    {
      label: 'm',
      submenu: [
        {
          label: 'About m',
          click: function() { showAboutApplication(); }
        },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: function() { app.quit(); }
        }
      ]
    }
  ];
  const menu = electron.Menu.buildFromTemplate(menu_template);
  electron.Menu.setApplicationMenu(menu);
}

function showAboutApplication() {
  openAboutWindow({
    icon_path: path.join(__dirname, 'resources/logo.png'),
    copyright: 'Copyright (c) 2017 garaemon',
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
  if (!mainWindow) {
    mainWindow = createMainWindow();
  }
  setupMenu();
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
});
