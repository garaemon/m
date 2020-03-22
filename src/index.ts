/* Entry file for main process */

import { BrowserWindow, app, App, Menu, dialog, ipcMain } from 'electron'
import { statSync, readFileSync, writeFileSync } from 'fs';
import * as yargs from 'yargs';

class MainApp {
    private mainWindow: BrowserWindow | null = null;
    private app: App;
    private mainURL: string = `file://${__dirname}/index.html`
    private targetFile: string | null = null;
    private debugMode: boolean = false;

    constructor(app: App) {
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
        }

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
        console.log('onReady is called');
        this.create();
    }

    private create() {
        // Register callbacks
        ipcMain.on('retrieve-content-result-for-save', (_event, content: string) => {
            this.onRetrieveContentResultForSave(content);
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
            console.error('no main window exists');
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
                this.openFile(result.filePaths[0]);
            } else {
                console.log('No file is selected');
            }
        });
    }

    private openFile(file: string) {
        try {

            statSync(file);
            console.log(`Reading file: ${file}`);
            const content = readFileSync(file, 'utf-8');
            console.log('Read file');
            if (this.mainWindow != null) {
                console.log('sending...');
                this.mainWindow.webContents.send('file-content', content);
            }
        }
        catch (error) {
            console.error('${file} does not exist');
        }
    }

    private onActivated() {
        if (this.mainWindow === null) {
            this.create();
        }
    }
}

const MyApp: MainApp = new MainApp(app)
