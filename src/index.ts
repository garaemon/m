/* Entry file for main process */

import { BrowserWindow, app, App, Menu, dialog, ipcMain, shell } from 'electron'
import { statSync, readFileSync, writeFileSync } from 'fs';
import * as yargs from 'yargs';
import sourceMapSupport from 'source-map-support'
import * as log4js from 'log4js';

import { AppConfig } from './AppConfig';

class MainApp {
    private mainWindow: BrowserWindow | null = null;
    private app: App;
    private mainURL: string = `file://${__dirname}/scripts/html/index.html`
    private targetFile: string | null = null;
    private debugMode: boolean = false;
    private config: AppConfig = new AppConfig();
    private logger: log4js.Logger = log4js.getLogger('MainApp');

    constructor(app: App) {
        sourceMapSupport.install();
        this.app = app;

        // Parse command line argument
        const argv = yargs.
            option('debug', {
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
        this.app.on('window-all-closed', this.onWindowAllClosed.bind(this))
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
            }
        });
        if (this.debugMode) {
            this.mainWindow.webContents.openDevTools();
        }
        this.mainWindow.loadURL(this.mainURL);
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
    }

    private createMenuBar() {
        const template: Electron.MenuItemConstructorOptions[] = [
            {
                label: this.app.name,
                submenu: [
                    { role: 'about' },
                    { type: 'separator' },
                    { role: 'services' },
                    { type: 'separator' },
                    { role: 'hide' },
                    { role: 'unhide' },
                    { type: 'separator' },
                    { role: 'quit' },
                ]
            },
            {
                label: 'File',
                submenu: [
                    {
                        label: 'Open',
                        accelerator: 'Command+F',
                        click: (_item, _focusedWindow) => {
                            this.openFileWithDialog();
                        }
                    },
                    {
                        label: 'save',
                        accelerator: 'Command+S',
                        click: (_item, _focusedWindow) => {
                            this.saveFileContent();
                        }
                    }
                ]
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
                ]
            },
        ];
        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    }

    private onRetrieveContentResultForSave(content: string) {
        if (this.targetFile == null) {
            return;
        }
        writeFileSync(this.targetFile, content);
    }

    private onReady() {
        this.logger.info('onReady is called');
        this.create();
    }

    private create() {
        // Register callbacks
        ipcMain.on('retrieve-content-result-for-save', (_event, content: string) => {
            this.onRetrieveContentResultForSave(content);
        });
        ipcMain.on('open-url', (_event, content: string) => {
            shell.openExternal(content);
        });
        ipcMain.on('render-process-ready', (_event) => {
            // Wait for 'render-process-ready' event to be sent from render process
            // before opening file.
            if (this.targetFile != null) {
                if (this.targetFile != null) {
                    this.openFile(this.targetFile);
                }
            }
        });
        this.createMenuBar();
        this.createWindow();
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
        dialog.showOpenDialog(this.mainWindow, {
            properties: ['openFile'], filters: [{
                name: 'Markdown', extensions: ['md']
            }, {
                name: 'All Files', extensions: ['*']
            }]
        }).then((result) => {
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
        }
        catch (error) {
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

const MyApp: MainApp = new MainApp(app)
