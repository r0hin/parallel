// Detect browser or electron setting:
let winBrowserWindow;
let electron;

if (window.require) {
  winBrowserWindow = window.require('@electron/remote');
  electron = window.require('electron');
}

export function startMainElectronProcesses() {
  electron.ipcRenderer.on('focus', (event, message) => {
    if (message) {
      $('#unfocusedStyles').html(``);
    }
    else {
      $('#unfocusedStyles').html(`
        :root {
          --primary: grey !important;
          --secondary: grey !important;
        }
      `);
    }
  });

  electron.ipcRenderer.on('menuBar', (event, message) => {
    // About, settings, check for updates, etc.
    if (!window.user) {
      alert("Please sign in to use this feature.")
    }
  });

  electron.webFrame.setZoomFactor(parseInt(localStorage.getItem('setting_zoom')) || 1) ;

  switch (window.require('os').platform()) {
    case 'darwin':
      $('#pointerStyles').html(`
        :root {
          --defaultByPointer: default;
          --defaultLabelPadding: 0px;
          --iconPlacementDefault: 50%; 
          --iconPlacementGuild: 54%;
          --defaultInputPadding: 13px;
          --questionMarkTop: 19px; 
          --questionMarkRight: 4px;
          --trackAuthorHeight: 20px;
          --chatMessagePadding: 4px;
        }
      `);
      break;
    case 'win32':
      $(`#windowsControls`).removeClass('hidden');
      startWindowControlsListeners();
      break;
  }
}

function startWindowControlsListeners() {
  $('#min-button').get(0).onclick = () => {
    winBrowserWindow.getCurrentWindow().minimize();
  }

  $('#max-button').get(0).onclick = () => {
    if (winBrowserWindow.getCurrentWindow().isMaximized()) {
      winBrowserWindow.getCurrentWindow().unmaximize();
    }
    else {
      winBrowserWindow.getCurrentWindow().maximize();
    }
  }

  $('#close-button').get(0).onclick = () => {
    winBrowserWindow.getCurrentWindow().close();
  }
}

export function sendToElectron(dataType, dataContent) {
  if (window.require) {
    electron.ipcRenderer.send(dataType, dataContent);
  }
}

export function zoomIn() {
  if (electron.webFrame.getZoomFactor() < 1.6) {
    notifyTiny('Zoomed in.', true);
    electron.webFrame.setZoomFactor(electron.webFrame.getZoomFactor() + 0.1);
    localStorage.setItem('setting_zoom', (electron.webFrame.getZoomFactor()).toString());
  }
}

export function zoomOut() {
  if (electron.webFrame.getZoomFactor() > 0.5) {
    notifyTiny('Zoomed out.', true);
    electron.webFrame.setZoomFactor(electron.webFrame.getZoomFactor() - 0.1);
    localStorage.setItem('setting_zoom', (electron.webFrame.getZoomFactor()).toString());
  }
}

export function resetZoom() {
  electron.webFrame.setZoomFactor(1);
  localStorage.setItem('setting_zoom', (electron.webFrame.getZoomFactor()).toString());
  notifyTiny('Zoom reset.', true);
}