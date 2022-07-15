const { ipcMain, Notification, BrowserWindow, dialog, app, desktopCapturer, systemPreferences } = require('electron');
const { autoUpdater } = require("electron-updater");
const music = require('./music');
const discord = require('./discord');
const { getUpdateStatusNotify, enablePlaybackControls, disablePlaybackControls, setUpdateStatusNotify } = require('./menuBar');

// Focus outgoing event
exports.sendFocusEvent = (win, boolean) => {
  win.webContents.send('focus', boolean);
}

// Notification incoming event
exports.listenNotifications = (win) => {
  ipcMain.on('notification', async (event, arg) => {
    const notification = new Notification({
      title: arg.title,
      body: arg.body,
      hasReply: arg.hasReply,
      silent: arg.silent,
    });

    notification.on('click', () => {
      win.webContents.send('notificationClicked', {
        uid: arg.uid || null,
        username: arg.username || null,
      });
    });

    notification.on('reply', (event, reply) => {
      win.webContents.send('notificationReplied', {
        uid: arg.uid || null,
        username: arg.username || null,
        reply: reply || null,
      });
    });

    notification.show();
  });

  ipcMain.on('notificationBadges', async (event, arg) => {
    app.setBadgeCount(arg);
  });
}

exports.listenFunctions = (win) => {
  ipcMain.on('functions', async (event, arg) => {
    switch (arg) {
      case 'update':
        autoUpdater.quitAndInstall()
        break;
      case 'oneTimeCheckUpdate':
        setUpdateStatusNotify(true);
        autoUpdater.checkForUpdates();
        break;
      case "checkUpdate":
        console.log('Starting check updates.')
        console.log('here4');
        autoUpdater.on('update-available', () => {
          console.log('here3');
          win.webContents.send('updateAvailable', true);
          if (getUpdateStatusNotify()) {
            console.log('here5');
            // Show dialog
            dialog.showMessageBox(win, {
              type: 'info',
              title: "Update Available",
              message: "A new update is available! We will start downloading it for you now.",
              buttons: ['OK']
            });
            setUpdateStatusNotify(false);
            
          }
        });

        autoUpdater.on('update-not-available', () => {
           console.log('here1');
          if (getUpdateStatusNotify()) {
            console.log('here2')
            // Show dialog
            dialog.showMessageBox(win, {
              type: 'info',
              title: "No Update Available",
              message: "You are running the latest version of Parallel.",
              buttons: ['OK']
            });
            setUpdateStatusNotify(false);
          }
        });

        autoUpdater.on('error', (error) => {
          console.log(error);
        });

        autoUpdater.checkForUpdates();
        setInterval(() => {
          autoUpdater.checkForUpdates();
        }, 1000 * 60 * 30); // Check for updates every 30 minutes
        break;
      default:
        break;
    }
  });
}

exports.listenMedia = (win) => {
  ipcMain.handle(
    'DESKTOP_CAPTURER_GET_SOURCES',
    (event, opts) => {
      // check permissions for sources 
      return new Promise(async (resolve, reject) => {
        if (["denied", "restricted"].includes(systemPreferences.getMediaAccessStatus('screen'))) {
          resolve(false)
        }
        const sources = await desktopCapturer.getSources(opts);
        resolve(sources);
      })

    }
  )
}

exports.listenMusic = (win) => {
  ipcMain.on('music', (event, args, args2, args3) => {
    switch (args) {
      case 'startServer':
        music.startServer(win);
        break;
      case 'playing':
        if (!args3) { // If not listening party
          enablePlaybackControls();
        }
        discord.setStatus(`▶️: ${args2}`);
        break;
      case 'paused':
        discord.setStatus(`⏸️: ${args2}`);
        break;
      case 'stopped':
        disablePlaybackControls();
        discord.clearStatus();
        break;
      case 'listeningPartyJoin':
        disablePlaybackControls();
        break;
      case 'listeningPartyLeave':
        enablePlaybackControls();
        break;
      default:
        break;
    }
  });
}

exports.sendServerPort = (win, data) => {
  win.webContents.send('serverPort', data);
}

exports.sendUpdateEvent = (win, data) => {
  win.webContents.send('update', data);
}

exports.sendDeepLink = (win, data) => {
  win.webContents.send('deeplink', data);
}

exports.menuBarFunctions = (win, data) => {
  win.webContents.send('menuBar', data);
}
