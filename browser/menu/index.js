const electron = require('electron');

const FileMenu = require('./FileMenu.js');
const PrimaryMenu = require('./PrimaryMenu.js');

const menus = [new PrimaryMenu(), new FileMenu()];

module.exports = electron.Menu.buildFromTemplate(menus.map(function(menu) {
  return menu.buildTemplate();
}));
