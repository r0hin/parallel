const { app, Menu, Tray } = require('electron');
const path = require('path');
let tray = null;

const link = require('./link');


exports.initializeTray = (win) => {

  const trayIcnName = process.platform === 'win32' ? 'IconTemplate@2x.png' : 'IconTemplate.png';
  // Dev
  const trayIcnPath = path.join(__dirname, '../public/', trayIcnName);
  tray = new Tray(trayIcnPath);


  const contextMenu = Menu.buildFromTemplate([
    {
      type: 'normal',
      label: "Toggle Play",
      click: () => {
        link.menuBarFunctions(win, 'play');
      }
    },
    {
      type: "separator"
    },
    {
      label: "Toggle Mute",
      click: () => {
        link.menuBarFunctions(win, 'mute');
      },
      accelerator: "Alt+m"
    },
    {
      label: "Toggle Deafen",
      click: () => {
        link.menuBarFunctions(win, 'deafen');
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

  tray.setToolTip('Parallel Control Panel');
  tray.setContextMenu(contextMenu);
}