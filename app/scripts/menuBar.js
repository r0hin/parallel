const { app, Menu, shell} = require('electron');
const defaultMenu = require('electron-default-menu');
const { autoUpdater } = require('electron-updater');
const link = require('./link');

let updateStatusNotify = false;
let menuBar = null;

exports.initializeMenuBar = function(win) {
  const menuBarDefault = defaultMenu(app, shell);
  menuBar = [...menuBarDefault];
  menuBar[0].submenu.splice(0, 1, {
    label: "About Parallel",
    click: () => {
      link.menuBarFunctions(win, 'about');
    },
  });

  menuBar[0].submenu.splice(1, 1, {
    label: "Preferences",
    click: () => {
      link.menuBarFunctions(win, 'preferences');
    },
    accelerator: 'CmdOrCtrl+,'
  })

  menuBar[0].submenu.splice(2, 0, {
    type: 'separator'
  });

  menuBar[0].submenu.splice(3, 0, {
    label: "Check for Updates",
    click: () => {
      updateStatusNotify = true;
      menuBar[0].submenu[2].enabled = false;
      Menu.setApplicationMenu(Menu.buildFromTemplate(menuBar));
      autoUpdater.checkForUpdates();
    }
  });

  menuBar[0].submenu.splice(4, 0, {
    type: 'separator'
  });

  menuBar.splice(1, 0, {
    label: "File",
    submenu: [
      {
        label: "New Playlist",
        click: () => {
          link.menuBarFunctions(win, 'newPlaylist');
        },
        accelerator: 'CmdOrCtrl+N'
      },
      {
        label: "New Playlist Folder",
        click: () => {
          link.menuBarFunctions(win, 'newPlaylistFolder');
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
              link.menuBarFunctions(win, 'newGroup');
            }
          },
          {
            label: "Join",
            click: () => {
              link.menuBarFunctions(win, 'joinGroup');
            }
          }
        ],
      }
    ]
  });

  menuBar.splice(3, 0, {
    label: "Playback",
    submenu: [
      {
        label: "Seek Forward",
        click: () => {
          link.menuBarFunctions(win, 'forward');
        },
        accelerator: 'CmdOrCtrl+Right',
        enabled: false
      },
      {
        label: "Seek Backward",
        click: () => {
          link.menuBarFunctions(win, 'previous');
        },
        accelerator: 'CmdOrCtrl+Left',
        enabled: false
      },
      {
        label: "Skip Forward",
        click: () => {
          link.menuBarFunctions(win, 'skip');
        },
        accelerator: 'CmdOrCtrl+Shift+Right',
        enabled: false
      },
      {
        label: "Skip Backward",
        click: () => {
          link.menuBarFunctions(win, 'skipBackward');
        },
        accelerator: 'CmdOrCtrl+Shift+Left',
        enabled: false
      },
      {
        type: 'separator'
      },
      {
        label: "Volume Up",
        click: () => {
          link.menuBarFunctions(win, 'volumeUp');
        },
        accelerator: 'CmdOrCtrl+Up',
        enabled: false
      },
      {
        label: "Volume Down",
        click: () => {
          link.menuBarFunctions(win, 'volumeDown');
        },
        accelerator: 'CmdOrCtrl+Down',
        enabled: false
      }
    ]
  });

  menuBar[4].submenu.splice(0, 0, {
    label: "Open Friends",
    click: () => {
      link.menuBarFunctions(win, 'friends');
    },
    accelerator: 'CmdOrCtrl+1',
    enabled: true
  });

  menuBar[4].submenu.splice(1, 0, {
    label: "Open Music",
    click: () => {
      link.menuBarFunctions(win, 'music');
    },
    accelerator: 'CmdOrCtrl+2',
    enabled: true
  });

  menuBar[4].submenu.splice(2, 0, {
    label: "Open Groups",
    click: () => {
      link.menuBarFunctions(win, 'servers');
    },
    accelerator: 'CmdOrCtrl+3',
    enabled: true
  });

  menuBar[4].submenu.splice(3, 0, {
    label: "Open Infinite",
    click: () => {
      link.menuBarFunctions(win, 'infinite');
    },
    accelerator: 'CmdOrCtrl+4',
    enabled: true
  });

  menuBar[4].submenu.splice(4, 0, {
    label: "Open Settings",
    click: () => {
      link.menuBarFunctions(win, 'account');
    },
    accelerator: 'CmdOrCtrl+5',
    enabled: true
  });

  menuBar[4].submenu.splice(5, 0, {
    type: 'separator'
  });

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuBar));
}

exports.enablePlaybackControls = function() {
  menuBar[3].submenu[0].enabled = true;
  menuBar[3].submenu[1].enabled = true;
  menuBar[3].submenu[2].enabled = true;
  menuBar[3].submenu[3].enabled = true;
  menuBar[3].submenu[4].enabled = true;
  menuBar[3].submenu[5].enabled = true;
  menuBar[3].submenu[6].enabled = true;

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuBar));
}

exports.disablePlaybackControls = function() {
  menuBar[3].submenu[0].enabled = false;
  menuBar[3].submenu[1].enabled = false;
  menuBar[3].submenu[2].enabled = false;
  menuBar[3].submenu[3].enabled = false;
  menuBar[3].submenu[4].enabled = false;
  menuBar[3].submenu[5].enabled = false;
  menuBar[3].submenu[6].enabled = false;

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuBar));
}


exports.getUpdateStatusNotify = () => {
  return updateStatusNotify;
};

exports.setUpdateStatusNotify = (status) => {
  updateStatusNotify = status;

  if (status = false) {
    menuBar[0].submenu[2].enabled = false;
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuBar));
  }
}