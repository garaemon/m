const electron = require('electron');

const Menu = require('./Menu.js');


class FileMenu extends Menu {
  constructor() {
    super();
    this.label = 'File';
    this.items = [
      {
        label: 'Open a new file',
        click: function() {

        }
      }
    ];
  }
}

module.exports = FileMenu;