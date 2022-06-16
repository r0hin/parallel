import { markChannelAsRead } from './channels';
import { markDMRead } from './friends';
import { openOtherPlaylist } from './music';
import { openSpecialServer } from './servers';

window.winBrowserWindow = null;
window.isElectron = null;
window.electronLink = null;
window.markAsReadAfterFocus = {
  type: '',
  id: '',
}

export function returnIsElectron() {
  return isElectron;
}
export function checkElectron() {
  isElectron = false;
  try {
    eval(`window.electronLink = window.require('electron')`);
    if (electronLink) {
      winBrowserWindow = window.require('@electron/remote');
      isElectron = true; // Will be set to true if it doesn't fail and if its running in electron.
    }
  } catch ( e ) { console.log(e); isElectron = false }

  if (isElectron) { startElectronStuff() };
}

function startElectronStuff() { // Definitely electron.
  electronLink.webFrame.setZoomFactor(parseInt(localStorage.getItem('setting_zoom')) || 1) 
  
  electronLink.ipcRenderer.on('open-media', (event, message) => {
    console.log(event, message);
    manageDeeplink(message.split('parallel://')[1]);
  });
  
  electronLink.ipcRenderer.on('focus', (event, message) => {
    if (message == 'unfocus') {
      // Clear shades of grey.
      $('#unfocusedStyles').html(`
        :root {
          --primary: grey !important;
          --secondary: grey !important;
        }
      `);
    }
    else if (message === 'focus') {
      $('#unfocusedStyles').html(``);

      // Check if there is a message to be marked as read.
      if (markAsReadAfterFocus.type !== '' && markAsReadAfterFocus.id !== '') {
        // Check if the message is a dm message.
        if (markAsReadAfterFocus.type == 'dm') {
          markDMRead(markAsReadAfterFocus.id);
        }
        else {
          markChannelAsRead(markAsReadAfterFocus.id.split('.')[0], markAsReadAfterFocus.id.split('.')[1], markAsReadAfterFocus.id.split('.')[2]);
        }

        markAsReadAfterFocus.type = '';
        markAsReadAfterFocus.id = '';
      }
    }
  });
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
    case 'linux':
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

window.sendToElectron = (dataType, dataContent) => {
  if (isElectron) {
    electronLink.ipcRenderer.send(dataType, dataContent);
  }
}

export function zoomIn() {
  if (isElectron) {
    if (electronLink.webFrame.getZoomFactor() < 1.6) {
      notifyTiny('Zoomed in.', true);
      electronLink.webFrame.setZoomFactor(electronLink.webFrame.getZoomFactor() + 0.1);
      localStorage.setItem('setting_zoom', (electronLink.webFrame.getZoomFactor()).toString());
    }
  }
}

export function zoomOut() {
  if (isElectron) {
    if (electronLink.webFrame.getZoomFactor() > 0.5) {
      notifyTiny('Zoomed out.', true);
      electronLink.webFrame.setZoomFactor(electronLink.webFrame.getZoomFactor() - 0.1);
      localStorage.setItem('setting_zoom', (electronLink.webFrame.getZoomFactor()).toString());
    }
  }
}

export function resetZoom() {
  if (isElectron) {
    electronLink.webFrame.setZoomFactor(1);
    localStorage.setItem('setting_zoom', (electronLink.webFrame.getZoomFactor()).toString());
    notifyTiny('Zoom reset.', true);
  }
}

export function manageDeeplink(text) {
  window.parts = text.split('.');
  console.log(text)

  switch (parts[0]) {
    case 'playlist':
      openSpecialServer('music');
      openOtherPlaylist(parts[1], parts[2], null, null, null);
      break;
    case 'album':
      openSpecialServer('music');
      openAlbum(parts[1]);
      break;
    default:
      break;
  }

  window.history.replaceState(null, null, window.location.pathname);
}