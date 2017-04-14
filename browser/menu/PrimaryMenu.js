const path = require('path');

const openAboutWindow = require('about-window').default;

const Menu = require('./Menu.js');


function showAboutApplication() {
  openAboutWindow({
    icon_path: path.join(__dirname, '../../resources/logo.png'),
    copyright: 'Copyright (c) 2017 garaemon'
  });
};

class PrimaryMenu extends Menu {
  constructor() {
    super();
    this.label = 'm';
    this.items = [
      {
        label: 'About m',
        click: function() { showAboutApplication(); }
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
