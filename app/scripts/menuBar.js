const { app, Menu, shell} = require('electron');
const defaultMenu = require('electron-default-menu');
const { autoUpdater } = require('electron-updater');
const link = require('./link');

exports.menuBar;

exports.initializeMenuBar = function() {
  const menuBarDefault = defaultMenu(app, shell);
  menuBar = [...menuBarDefault];
  menuBar[0].submenu.splice(0, 1, {
    label: "About Parallel",
    click: () => {
      link.menuBarFunctions('about');
    },
  });

  menuBar[0].submenu.splice(1, 1, {
    label: "Preferences",
    click: () => {
      link.menuBarFunctions('preferences');
    },
    accelerator: 'CmdOrCtrl+,'
  })

  menuBar[0].submenu.splice(2, 0, {
    label: "Check for Updates",
    click: () => {
      updateStatusNotify = true;
      menuBar[0].submenu[2].enabled = false;
      Menu.setApplicationMenu(Menu.buildFromTemplate(menuBar));
      autoUpdater.checkForUpdates();
    }
  });

  menuBar.splice(1, 0, {
    label: "File",
    submenu: [
      {
        label: "New Playlist",
        click: () => {
          link.menuBarFunctions('newPlaylist');
        },
        accelerator: 'CmdOrCtrl+N'
      },
      {
        label: "New Playlist Folder",
        click: () => {
          link.menuBarFunctions('newPlaylistFolder');
        },
        accelerator: 'CmdOrCtrl+Shift+N'
      },
      // Expand menu to show new server 
      {
        label: "New Group",
        submenu: [
          {
            label: "Create",
            click: () => {
              link.menuBarFunctions('newGroup');
            }
          },
          {
            label: "Join",
            click: () => {
              link.menuBarFunctions('joinGroup');
            }
          }
        ],
      }
    ]
  });

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuBar));
}

exports.updateStatusNotify = false;