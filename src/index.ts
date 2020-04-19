/* Entry file for main process */

import { BrowserWindow, app, App, Menu, dialog, ipcMain, shell, Event } from 'electron';
import contextMenu from 'electron-context-menu';
import { statSync, readFileSync, writeFileSync, mkdirSync, copyFile } from 'fs';
import * as log4js from 'log4js';
import * as path from 'path';
import * as yargs from 'yargs';
import sourceMapSupport from 'source-map-support';

import { IAppConfig } from './IAppConfig';
import { AppConfig } from './AppConfig';
import { IDropFile } from './IDropFile';

class MainApp {
  private mainWindow: BrowserWindow | null = null;
  private settingsWindow: BrowserWindow | null = null;
  private app: App;
  private mainURL: string = `file://${__dirname}/scripts/html/index.html`;
  private settingsURL: string = `file://${__dirname}/scripts/html/settings.html`;
  private targetFile: string | null = null;
  private debugMode: boolean = false;
  private config: AppConfig = new AppConfig();
  private logger: log4js.Logger = log4js.getLogger('MainApp');
  private isModified: boolean = false;
  private quitAfterSave: boolean = false;

  constructor(app: App) {
    sourceMapSupport.install();
    this.app = app;

    // Parse command line argument
    const argv = yargs.option('debug', {
      description: 'Run with dev tools',
      alias: 'd',
      type: 'boolean',
    }).argv;
    if (argv._.length != 0) {
      this.targetFile = argv._[0];
    }
    if (argv.debug) {
      this.debugMode = true;
      this.logger.level = 'debug';
    } else {
      this.logger.level = 'info';
    }

    this.config.initializeAndReadConfig();
    this.app.on('window-all-closed', this.onWindowAllClosed.bind(this));
    this.app.on('ready', this.onReady.bind(this));
    this.app.on('activate', this.onActivated.bind(this));
  }

  private onWindowAllClosed() {
    this.app.quit();
  }

  private createWindow() {
    /* TODO: window size parameter sholed be specified by command line argument */
    this.mainWindow = new BrowserWindow({
      width: 800,
      height: 400,
      minWidth: 500,
      minHeight: 200,
      acceptFirstMouse: true,
      webPreferences: {
        nodeIntegration: true,
      },
    });
    if (this.debugMode) {
      this.mainWindow.webContents.openDevTools();
    }
    this.mainWindow.loadURL(this.mainURL);
    this.mainWindow.on('closed', () => {
      this.onClosed();
    });
    this.mainWindow.on('close', (e) => {
      this.onClose(e);
    });
  }

  private onClose(event: Event) {
    if (this.isModified) {
      this.logger.info('File content is not saved');
      const result = dialog.showMessageBoxSync({
        buttons: ['Yes', 'No'],
        message: 'You have not saved updated file.\nSave the updated file content?',
      });
      if (result === 0) {
        // Yes
        event.preventDefault(); // Do not close window untill save file content.
        this.logger.info('Save file before close window');
        this.quitAfterSave = true;
        this.saveFileContent();
      }
    }
  }

  private onClosed() {
    this.mainWindow = null;
  }

  private createMenuBar() {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: this.app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          {
            label: 'Preferences',
            accelerator: 'Command+,',
            click: (_item, focusedWindow) => {
              this.openSettingsView();
            },
          },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' },
        ],
      },
      {
        label: 'File',
        submenu: [
          {
            label: 'Open',
            accelerator: 'Command+F',
            click: (_item, _focusedWindow) => {
              this.openFileWithDialog();
            },
          },
          {
            label: 'save',
            accelerator: 'Command+S',
            click: (_item, _focusedWindow) => {
              if (this.targetFile) {
                this.saveFileContent();
              } else {
                this.saveAsWithDialog();
              }
            },
          },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          {
            label: 'Insert Date',
            accelerator: 'Command+Shift+D',
            click: () => {
              if (this.mainWindow !== null) {
                this.mainWindow.webContents.send('insert-date');
              }
            },
          },
        ],
      },
    ];
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  private openSettingsView() {
    if (this.settingsWindow !== null) {
      return;
    }
    this.settingsWindow = new BrowserWindow({
      width: 400,
      height: 400,
      minWidth: 500,
      minHeight: 200,
      acceptFirstMouse: true,
      webPreferences: {
        nodeIntegration: true,
      },
    });
    this.settingsWindow.loadURL(this.settingsURL);
    this.settingsWindow.on('closed', () => {
      this.settingsWindow = null;
    });
  }

  private saveAsWithDialog() {
    if (this.mainWindow === null) {
      this.logger.error('No valid window exists');
      return;
    }
    dialog
      .showSaveDialog(this.mainWindow, {
        title: 'Save file as',
        filters: [
          {
            name: 'Markdown',
            extensions: ['md'],
          },
        ],
        properties: ['createDirectory'],
      })
      .then((result: Electron.SaveDialogReturnValue) => {
        if (!result.filePath) {
          return;
        }
        this.targetFile = result.filePath;
        this.saveFileContent();
      });
  }

  private onRetrieveContentResultForSave(content: string) {
    if (this.targetFile == null) {
      return;
    }
    writeFileSync(this.targetFile, content);
    this.isModified = false;
    if (this.quitAfterSave) {
      this.app.quit();
    }
  }

  private onReady() {
    this.logger.info('onReady is called');
    this.create();
  }

  private create() {
    // Register callbacks
    // editor window
    ipcMain.on('retrieve-content-result-for-save', (_event, content: string) => {
      this.onRetrieveContentResultForSave(content);
    });
    ipcMain.on('open-url', (_event, url: string) => {
      this.logger.info(`Opening url ${url}`);
      shell.openExternal(url);
    });
    ipcMain.on('render-process-ready', (_event) => {
      if (this.mainWindow === null) {
        return;
      }
      // Wait for 'render-process-ready' event to be sent from render process
      // before opening file.
      if (this.targetFile != null) {
        if (this.targetFile != null) {
          this.openFile(this.targetFile);
        }
      }
      this.mainWindow.webContents.send('update-config', this.config.toDictionaryObject());
    });
    ipcMain.on('changed', () => {
      this.isModified = true;
    });
    ipcMain.on('drag-and-drop', (_event, content: IDropFile) => {
      this.logger.info('received drag-and-drop event');
      if (content.type.startsWith('image')) {
        this.copyAndInsertImage(content);
      }
    });

    // settings
    ipcMain.on('settings-render-process-ready', () => {
      this.settingsWindow?.webContents.send('settings', this.config.toDictionaryObject());
    });

    ipcMain.on('close-settings-window', () => {
      this.logger.info('Close sttings window');
      if (this.settingsWindow === null) {
        return;
      }
      this.settingsWindow.close();
    });
    ipcMain.on('save-settings', (_event, content: IAppConfig) => {
      this.logger.info(`save settings: ${JSON.stringify(content)}`);
      this.config.updateFromDictionaryObject(content);
      this.config.save();
      if (this.mainWindow === null) {
        this.logger.error('no mainwindow is available');
        return;
      }
      this.mainWindow.webContents.send('update-config', this.config.toDictionaryObject());
    });

    this.createMenuBar();
    contextMenu({
      append: (_defaultActions, params, browserWindow) => [
        {
          label: 'Search Google for "{selection}"',
          // Only show it when right-clicking text
          visible: params.selectionText.trim().length > 0,
          click: () => {
            shell.openExternal(this.getGoogleQueryUrl(params.selectionText));
          },
        },
        {
          label: 'Insert date (YYYY-MM-DD HH:MM:SS)',
          click: () => {
            if (browserWindow instanceof BrowserWindow) {
              browserWindow.webContents.send('insert-date');
            }
          },
        },
      ],
    });
    this.createWindow();
  }

  private getGoogleQueryUrl(text: string): string {
    return `https://google.com/search?q=${encodeURIComponent(text)}`;
  }

  private copyAndInsertImage(content: IDropFile) {
    if (this.targetFile === null) {
      this.logger.error('no active target file is specified, do nothing');
      return;
    }
    const imageDir = path.join(path.dirname(path.resolve(this.targetFile)), '.images');
    try {
      mkdirSync(imageDir);
    } catch {
      this.logger.warn(`Failed to create ${imageDir}`);
    }
    const targetFile = path.join(imageDir, content.name);
    // overwrite file without any question.
    // TODO: should ask user to overwrite the existing file.
    copyFile(content.path, targetFile, (err) => {
      if (err) {
        this.logger.error(err.stack);
      } else {
        this.logger.info(`copied file ${content.path} => ${targetFile}`);
        if (this.mainWindow != null) {
          this.mainWindow.webContents.send('insert-image-link', {
            path: encodeURI(targetFile),
            name: content.name,
          });
        }
      }
    });
  }

  private saveFileContent() {
    if (this.mainWindow != null) {
      this.mainWindow.webContents.send('retrieve-content-for-save');
    }
  }

  private openFileWithDialog() {
    if (this.mainWindow == null) {
      this.logger.error('no main window exists');
      return;
    }
    dialog
      .showOpenDialog(this.mainWindow, {
        properties: ['openFile'],
        filters: [
          {
            name: 'Markdown',
            extensions: ['md'],
          },
          {
            name: 'All Files',
            extensions: ['*'],
          },
        ],
      })
      .then((result) => {
        if (result.filePaths.length > 0) {
          const targetFile = result.filePaths[0];
          this.targetFile = targetFile;
          this.openFile(targetFile);
        } else {
          this.logger.info('No file is selected');
        }
      });
  }

  private openFile(file: string) {
    try {
      statSync(file);
      this.logger.info(`Reading file: ${file}`);
      const content = readFileSync(file, 'utf-8');
      this.logger.info('Read file');
      if (this.mainWindow != null) {
        this.logger.info('sending...');
        this.mainWindow.webContents.send('file-content', content);
        this.mainWindow.webContents.send('set-title', file);
      }
    } catch (error) {
      this.logger.info(`${file} does not exist, create it`);
      if (this.mainWindow != null) {
        this.mainWindow.webContents.send('set-title', file);
      }
    }
  }

  private onActivated() {
    if (this.mainWindow === null) {
      this.create();
    }
  }
}

const MyApp: MainApp = new MainApp(app);
