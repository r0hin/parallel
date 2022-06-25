const { app, Menu, shell} = require('electron');
const defaultMenu = require('electron-default-menu');

const link = require('./link');

exports.initializeMenuBar = function() {
  const menu = defaultMenu(app, shell);

  menu[0].submenu.splice(0, 1, {
    label: "About Parallel",
    click: () => {
      link.menuBarFunctions('about')
    },
  });

  menu[0].submenu.splice(1, 1, {
    label: "Check for Updates",
    click: () => {
      console.log('Check for updates');
    }
  })

  menu[0].submenu.splice(2, 0, {
    label: "Preferences",
    click: () => {
      console.log('Show preferences');
    },
    accelerator: 'CmdOrCtrl+,'
  });

  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
}