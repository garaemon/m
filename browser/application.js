'use strict';

const fs = require('fs');
const path = require('path');

const electron = require('electron');
const electronReload = require('electron-reload');
const electronDebug = require('electron-debug');
const openAboutWindow = require('about-window').default;

const log = require('winston');

const Menu = require('./menu');

class Application {
  constructor(commandLineArgs) {
    this.args = commandLineArgs;
    // adds debug features like hotkeys for triggering dev tools and reload
    electronDebug();

    // reload if any change is detected.
    electronReload(path.join(__dirname, '..'));

    this._setupLogger();

    this._registerAppCallbacks();
  }

  /**
   * setup log info and coloring.
   */
  _setupLogger() {
    log.addColors({
      debug: 'green',
      info:  'cyan',
      silly: 'magenta',
      warn:  'yellow',
      error: 'red'
    });

    log.remove(log.transports.Console);
    log.add(log.transports.Console, {level: 'debug', colorize: true, timestamp: true});
  }

  /**
   * register callback methods to electron.app.
   */
  _registerAppCallbacks() {
    electron.app.on('activate', () => { this._onActivate(); });
    electron.app.on('window-all-closed', () => { this._onWindowAllClosed(); });
    electron.app.on('ready', () => { this._onReady(); });
  }

  _createMainWindow() {
    const win = new electron.BrowserWindow({
      width: 1200,
      height: 800
    });
    const htmlFile = `file://${__dirname}/../index.html`;
    win.loadURL(htmlFile);
    this.mainWindow = win;
    win.on('closed', () => { this._onClosed(); });
    return win;
  }

  showAboutApplication() {
    /*eslint-disable camelcase*/
    openAboutWindow({
      icon_path: path.join(__dirname, '../resources/logo.png'),
      copyright: 'Copyright (c) 2017 garaemon'
    });
    /*eslint-enable camelcase*/
  }

  _run() {
    if (!this.mainWindow) {
      this._createMainWindow();
    }
    const isDebugMode = this.args.debug;
    if (this.args._.length == 0) {
      electron.dialog.showOpenDialog(this.mainWindow, (filePaths) => {
        if (!filePaths || filePaths.length != 1) {
          log.error(`Please choose one file`);
          process.exit(1);
        } else {
          this._openWithFile(filePaths[0], isDebugMode);
        }
      });
    } else {
      const targetFile = this.args._[0];
      this._openWithFile(targetFile, isDebugMode);
    }
  }

  _openWithFile(targetFile, isDebugMode) {
    if (!fs.existsSync(targetFile)) {
      log.error(`${targetFile} does not exists.`);
      process.exit(1);
    }

    electron.Menu.setApplicationMenu(Menu());
    if (isDebugMode) {
      this.mainWindow.webContents.openDevTools();
    }
    this.mainWindow.webContents.on('did-finish-load', () => {
      log.info(`send notify-file event to open ${targetFile}`);
      this.mainWindow.send('notify-file', targetFile);
    });
    // start watching file
    fs.watch(targetFile, function() {
      log.info(`detect change on ${targetFile}`);
      this.mainWindow.send('notify-file', targetFile);
    });
    electron.ipcMain.on('copy-to-clipboard', function(event, arg) {
      if (arg) {
        log.info(`write to clipboard: ${arg}`);
        // CAVEAT: writeText does not work in tmux environment on OS X.
        electron.clipboard.writeText(arg);
      }
    });

  }

  // Callback methods

  /**
   * Callback method when 'closed' event of electron.app is fired.
   */
  _onClosed() {
    this.mainWindow = null;
  }

  /**
   * Callback method when 'activate' event of electron.app is fired.
   */
  _onActivate() {
    log.info('_onActivate');
    if (this.mainWindow) {
      this.mainWindow = this._createMainWindow();
    }
  }

  /**
   * callback method when 'window-all-closed' event of electron.app is fired.
   */
  _onWindowAllClosed() {
    if (process.platform !== 'darwin') {
      electron.app.quit();
    }
  }

  /**
   * callback method when 'ready' event of electron.app is fired.
   */
  _onReady() {
    log.info('_onReady');
    this._run();
  }
}

module.exports = Application;
