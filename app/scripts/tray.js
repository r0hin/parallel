const { app, Menu, Tray } = require('electron');
let tray = null;

const link = require('./link');


exports.initializeTray = () => {
  tray = new Tray('./build/IconTemplate.png');
  const contextMenu = Menu.buildFromTemplate([
    {
      type: 'normal',
      label: "Toggle Play",
      click: () => {
        link.menuBarFunctions('play');
      }
    },
    {
      type: "separator"
    },
    {
      label: "Toggle Mute",
      click: () => {
        link.menuBarFunctions('mute');
      },
      accelerator: "Alt+m"
    },
    {
      label: "Toggle Deafen",
      click: () => {
        link.menuBarFunctions('deafen');
      },
      accelerator: "Alt+D"
    },
    {
      type: "separator"
    },
    {
      label: "Quit",
      click: () => {
        app.quit();
      },
    }
  ]);

  tray.setToolTip('This is my application.');
  tray.setContextMenu(contextMenu);
}