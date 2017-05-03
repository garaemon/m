const log = require('winston');

const Menu = require('./Menu.js');

class FileMenu extends Menu {
  constructor(app) {
    super();
    this.label = 'File';
    this.items = [
      {
        label: 'Open a new file',
        click: function() {
          app.openFileDialog((err, file) => {
            if (err != null) {
              // TODO: show pop up error dialog
              log.error('no such file');
            } else {
              app.notifyFile(file);
            }
          });
        },
      },
    ];
  }
}

module.exports = FileMenu;
