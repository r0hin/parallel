const { ipcMain, Notification, BrowserWindow } = require('electron');
const { autoUpdater } = require("electron-updater");
const music = require('./music');
const discord = require('./discord');

// Focus outgoing event
exports.sendFocusEvent = (win, boolean) => {
  win.webContents.send('focus', boolean);
}

// Notification incoming event
exports.listenNotifications = () => {
  const win = BrowserWindow.getFocusedWindow();
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

exports.listenFunctions = () => {
  const win = BrowserWindow.getFocusedWindow();
  ipcMain.on('functions', async (event, arg) => {
    switch (arg) {
      case 'update':
        autoUpdater.quitAndInstall()
        break;
      case "checkUpdate":
        console.log('Starting check updates.')

        autoUpdater.on('update-available', () => {
          win.webContents.send('updateAvailable', true);
        });

        autoUpdater.checkForUpdates();
        setInterval(() => {
          autoUpdater.checkForUpdates();
        }, 1000 * 60 * 60); // every hour
      default:
        break;
    }

  });
}

exports.listenMusic = () => {
  const win = BrowserWindow.getFocusedWindow();
  ipcMain.on('music', (event, args, args2) => {
    switch (args) {
      case 'startServer':
        music.startServer(win);
        break;
      case 'playing':
        discord.setStatus(`▶️: ${args2}`);
        break;
      case 'paused':
        discord.setStatus(`⏸️: ${args2}`);
        break;
      case 'stopped':
        discord.clearStatus();
        break;
      default:
        break;
    }
  });
}

exports.sendServerPort = (data) => {
  const win = BrowserWindow.getFocusedWindow();
  win.webContents.send('serverPort', data);
}

exports.sendUpdateEvent = (data) => {
  const win = BrowserWindow.getFocusedWindow();
  win.webContents.send('update', data);
}

exports.sendDeepLink = (data) => {
  const win = BrowserWindow.getFocusedWindow();
  win.webContents.send('deeplink', data);
}

exports.menuBarFunctions = (data) => {
  const win = BrowserWindow.getFocusedWindow();

  switch (data) {
    case 'about':
      win.webContents.send('menuBar', 'about');
      break;
    default:
      break;
  }
}
