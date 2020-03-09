/* Entry file for main process */

import { BrowserWindow, app, App, Menu, dialog, ipcMain} from 'electron'
import { statSync, readFileSync, writeFileSync } from 'fs';

class MainApp {
    private mainWindow: BrowserWindow | null = null;
    private app: App;
    private mainURL: string = `file://${__dirname}/index.html`
    private targetFile : string | null = null;

    constructor(app: App) {
        this.app = app;
        this.app.on('window-all-closed', this.onWindowAllClosed.bind(this))
        this.app.on('ready', this.create.bind(this));
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
        // this.mainWindow.webContents.openDevTools();
        this.mainWindow.loadURL(this.mainURL);
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
        this.mainWindow.on('show', () => {
            if (this.targetFile != null) {
                if (this.targetFile != null) {
                    this.openFile(this.targetFile);
                }
            }
        });
    }

    private createMenuBar() {
        const template : Electron.MenuItemConstructorOptions[] = [
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

    private create() {
        // process.argv[0] -- path to electron
        // process.argv[1] -- path to package
        // process.argv[2] -- path to file (optional)
        if (process.argv.length > 2) {
            this.targetFile = process.argv[2];
        }
        ipcMain.on('retrieve-content-result-for-save', (_event, content : string) => {
            this.onRetrieveContentResultForSave(content);
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
        dialog.showOpenDialog(this.mainWindow, {properties: ['openFile'], filters: [{
            name: 'Markdown', extensions: ['md']
        }, {
            name: 'All Files', extensions: ['*']
        }]}).then((result) => {
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
            const content = readFileSync(file, 'utf-8');
            if (this.mainWindow != null) {
                this.mainWindow.webContents.send('file-content', content);
            }
        } catch (error) {
            console.error('${file} does not exist');
        }
    }

    private onReady() {
        this.create();
    }

    private onActivated() {
        if (this.mainWindow === null) {
            this.create();
        }
    }
}

const MyApp: MainApp = new MainApp(app)
