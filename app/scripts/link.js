const { ipcMain, Notification } = require('electron');
const { autoUpdater } = require("electron-updater");

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
}

exports.listenFunctions = (win) => {
  ipcMain.on('functions', async (event, arg) => {
    switch (arg) {
      case 'update':
        autoUpdater.quitAndInstall()
        break;
      case "checkUpdate":
        console.log('Starting check updates.')
        autoUpdater.checkForUpdates();
        setInterval(() => {
          autoUpdater.checkForUpdates();
        }, 1000 * 60 * 60); // every hour
      default:
        break;
    }

  });
}

exports.sendUpdateEvent = (win, data) => {
  console.log('sending update event.')
  win.webContents.send('update', data);
}