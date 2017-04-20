const electron = require('electron');

const FileMenu = require('./FileMenu.js');
const PrimaryMenu = require('./PrimaryMenu.js');
const ViewMenu = require('./ViewMenu.js');

module.exports = function(app) {
  const menus = [new PrimaryMenu(app), new FileMenu(app), new ViewMenu(app)];
  return electron.Menu.buildFromTemplate(menus.map(function(menu) {
    return menu.buildTemplate();
  }));
};
