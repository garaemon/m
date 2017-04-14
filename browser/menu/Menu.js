// Menu is an interface class for menu.
class Menu {
  getLabel() {
    return this.label;
  }

  getItems() {
    return this.items;
  }

  buildTemplate() {
    return {
      label: this.getLabel(),
      submenu: this.items
    };
  }
}

module.exports = Menu;
