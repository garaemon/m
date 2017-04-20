const Menu = require('./Menu.js');

class ViewMenu extends Menu {
  constructor(app) {
    super();
    this.label = 'View';
    this.items = [
      {
        label: 'Toggle Table of Contents',
        click: function() {
          app.toggleTOC();
        }
      }
    ];
  }
}

module.exports = ViewMenu;
