const path = require('path');

const openAboutWindow = require('about-window').default;

const Menu = require('./Menu.js');

class PrimaryMenu extends Menu {
  constructor(app) {
    super();
    this.label = 'm';
    this.items = [
      {
        label: 'About m',
        click: () => { app.showAboutApplication(); }
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: function() { app.quit(); }
      }
    ];
  }
}

module.exports = PrimaryMenu;
