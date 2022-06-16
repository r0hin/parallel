const { app, BrowserWindow, dialog } = require('electron');
const { autoUpdater } = require("electron-updater");

autoUpdater.autoDownload = true;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })
  
  // win.loadFile('output/app.html')
  win.loadURL('http://localhost:1234/login.html')
}

app.whenReady().then(() => {
  createWindow();
})

app.on('ready', () => {
  autoUpdater.addListener('update-downloaded', (updateInfo) => {

    dialog.showMessageBox({
      type: 'info',
      title: 'Application Update',
      message: 'A new version has been downloaded. Restart the application to apply the updates. Changelog: \n' + updateInfo.releaseNotes,
      buttons: ['Restart']
    });  
    autoUpdater.quitAndInstall();
  });

  autoUpdater.checkForUpdates();
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 1000 * 60 * 60); // every hour
});

app.on('window-all-closed', () => {
  app.quit();
})

