const { app, BrowserWindow, Menu, shell, nativeTheme } = require('electron');
const { autoUpdater } = require("electron-updater");
const defaultMenu = require('electron-default-menu');
const windowStateKeeper = require('electron-window-state');

const link = require('./link');
const deeplinks = require('./deeplink');

autoUpdater.autoDownload = true;

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
  deeplinks.singleInstanceMode(win);

  app.on('open-url', function (event, url) {
    event.preventDefault();
    deeplinks.handleLink(win, url);
  });

  // win.loadFile(`output/app.html${URLARGUMENTS}`)
  win.loadURL(`http://localhost:1234/app.html${URLARGUMENTS}`)
}

app.on('open-url', function (event, url) {
  // If no windows open
  if (BrowserWindow.getAllWindows().length === 0) {
    URLARGUMENTS = `?deepLink=${url}`;
  }
});

app.on('ready', () => {
  createWindow();

  const menu = defaultMenu(app, shell);
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
});

app.on('window-all-closed', () => {
  app.quit();
});