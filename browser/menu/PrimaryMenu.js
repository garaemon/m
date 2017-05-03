const electron = require('electron');

const Menu = require('./Menu.js');

class PrimaryMenu extends Menu {
  constructor(app) {
    super();
    this.app = app;
    this.label = 'm';
    this.items = [
      {
        label: 'About m',
        click: () => {
          this.app.showAboutApplication();
        },
      },
      {
        label: 'Print',
        accelerator: 'Command+P',
        click: () => {
          this.app.print();
        },
      },
      {
        label: 'Export to PDF',
        click: () => {
          this.app.saveToPDF();
        },
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: () => {
          electron.app.quit();
        },
      },
    ];
  }
}

module.exports = PrimaryMenu;
