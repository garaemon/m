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
        click: () => { this.app.showAboutApplication(); }
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: () => { electron.app.quit(); }
      }
    ];
  }
}

module.exports = PrimaryMenu;
