const { app, BrowserWindow } = require('electron');
const path = require('path');

const link = require('./link');

// Deep link handler
exports.setLinkHandler = () => {
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('parallel', process.execPath, [path.resolve(process.argv[1])])
    }
  } else {
    app.setAsDefaultProtocolClient('parallel')
  }
}

// Force single application instance
exports.singleInstanceMode = (win) => {
  const gotTheLock = app.requestSingleInstanceLock()
  if (!gotTheLock) {
    app.quit();
    return;
  } else {
    app.on('second-instance', (e, argv) => {
      // If on windows
      (process.platform === 'win32') && (() => {
        deeplinkingUrl = argv.find((arg) => arg.startsWith('parallel://'));
        deeplinkingUrl && this.handleLink(win, deeplinkingUrl);
      })
      if (win) {
        if (win.isMinimized()) myWindow.restore();
        win.focus();
      }
    });
  }
}

exports.handleLink = (url) => {
  const win = BrowserWindow.getAllWindows()[0]; // Get the first window
  const arguments = url.replace('parallel://', '').split('.');

  switch (arguments[0]) {
    case 'playlist':
      link.sendDeepLink(win, {
        type: 'playlist',
        uid: arguments[1],
        id: arguments[2],
      });
      break;
    case 'album':
      link.sendDeepLink(win, {
        type: 'album',
        id: arguments[1],
      });
      break;
    default:
      break;
  }
}