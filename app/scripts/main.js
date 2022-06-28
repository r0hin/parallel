const { app, BrowserWindow, shell, nativeTheme} = require('electron');
const { autoUpdater } = require("electron-updater");
const windowStateKeeper = require('electron-window-state');
require('@electron/remote/main').initialize();

const link = require('./link');
const deeplinks = require('./deeplink');
const discord = require('./discord');
const host = require('./host');
const menuBar = require('./menuBar');

autoUpdater.autoDownload = true;
process.setMaxListeners(15);

// Deep link handler
deeplinks.setLinkHandler();

let URLARGUMENTS = "";

const createWindow = () => {
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1200,
    defaultHeight: 800,
  });

  let bgColor;
  if (nativeTheme.shouldUseDarkColors) {
    bgColor = '0c0c0d';
  }
  else {
    bgColor = 'ffffff';
  }

  const win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      nativeWindowOpen: true,
      enableRemoteModule: true,
    },
    titleBarStyle: 'hiddenInset',
    frame: false,
    autoHideMenuBar: true,
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: 1133,
    show: false,
    minHeight: 735,
    backgroundColor: `#${bgColor}`,
  });

  win.removeMenu();
  mainWindowState.manage(win);

  win.once('ready-to-show', () => {
    win.show();
  });

  win.on('focus', () => {
    link.sendFocusEvent(win, true);
  });

  win.on('blur', () => {
    link.sendFocusEvent(win, false);
  });


  require("@electron/remote/main").enable(win.webContents);

  win.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    shell.openExternal(url);
  });

  win.webContents.on('render-process-gone', function (event, detailed) {
    if (detailed.reason == "crashed"){
        // relaunch app
        app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) });
        app.exit(0);
    }
  });
  
  nativeTheme.on('updated', () => {
    if (nativeTheme.shouldUseDarkColors) {
      bgColor = '0c0c0d';
    }
    else {
      bgColor = 'ffffff';
    }
    win.setBackgroundColor(bgColor);
  });

  autoUpdater.addListener('update-downloaded', (updateInfo) => {
    console.log('Update downloaded.')
    link.sendUpdateEvent(win, updateInfo)
  });

  link.listenNotifications(win);
  link.listenFunctions(win);
  link.listenMusic(win);
  deeplinks.singleInstanceMode(win);
  discord.startDiscord();

  app.on('open-url', function (event, url) {
    event.preventDefault();
    deeplinks.handleLink(url);
  });

  // In development:
  // win.loadURL(`http://localhost:1234/app.html${URLARGUMENTS}`)

  // In production:
  host.startServer(win, URLARGUMENTS); 
}

app.on('open-url', function (event, url) {
  // If no windows open
  if (BrowserWindow.getAllWindows().length === 0) {
    URLARGUMENTS = `?deepLink=${url}`;
  }
});

app.on('ready', () => {
  if (process.platform === 'win32') {
    app.setAppUserModelId("ParallelInc.Parallel");
  }

  createWindow();
  // Create the Application's main menu
  menuBar.initializeMenuBar();
});

app.on('window-all-closed', () => {
  app.quit();
});