const electron = window.require('electron');
import { markChannelAsRead } from './channels';
import { openModal } from './display';
import { markDMRead } from './friends';
import { openOtherPlaylist } from './music';
import { openSpecialServer } from './servers';

window.winBrowserWindow = null;
window.startTime = new Date().getTime();
window.markAsReadAfterFocus = {
  type: '',
  id: '',
}

electron.ipcRenderer.on('focus', (event, message) => {
  if (message) {
    if (markAsReadAfterFocus.type !== '' && markAsReadAfterFocus.id !== '') {
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

electron.ipcRenderer.on('notificationClicked', (event, arg) => {
  if (arg.uid && arg.username) {
    switchAndOpenFriendsDM(arg.uid, arg.username);
  }
});

electron.ipcRenderer.on('notificationReplied', (event, arg) => {
  if (arg.uid && arg.reply && arg.username) {
    switchAndOpenFriendsDM(arg.uid, arg.username);
    sendDMMessage(arg.uid, arg.reply);
  }  
});

electron.ipcRenderer.send('functions', 'checkUpdate'); // Starts the hourly update checker.

electron.ipcRenderer.on('update', (event, arg) => {
  console.log('Receieved update eevent')
  console.log(arg)
  // If within first three minutes of app launch, don't allow skip update
  if (new Date().getTime() - startTime < (180 * 1000)) {
    openModal('updateAvailableUrgent');
    $(`#updateNowButton`).get(0).onclick = () => {
      electron.ipcRenderer.send('functions', 'update');
    }
    window.setTimeout(() => {
      electron.ipcRenderer.send('functions', 'update');
    }, 1000 * 30);

    $(`#whatsChanged1`).html(arg.releaseNotes);
  }
  else {
    openModal('updateAvailable');
    $(`#whatsChanged2`).html(arg.releaseNotes);
    $(`#updateNowButtonNonUrgent`).get(0).onclick = () => {
      electron.ipcRenderer.send('functions', 'update');
    }
  }
});


electron.ipcRenderer.on('deeplink', (event, arg) => {
  switch (arg.type) {
    case 'playlist':
      openSpecialServer('music');
      openOtherPlaylist(arg.uid, arg.id, null, null, null);
      break;
    case 'album':
      openSpecialServer('music');
      openAlbum(arg.id);
      break;
    default:
      break;
  }
});

export function manageDeepLink() {
  const url = new URL(window.location.href);
  const searchParams = new URLSearchParams(url.search);
  const link = searchParams.get('deepLink').replace("parallel://", "").split('.');

  switch (link[0]) {
    case 'playlist':
      openSpecialServer('music');
      openOtherPlaylist(link[1], link[2], null, null, null);
      break;
    case 'album':
      openSpecialServer('music');
      openAlbum(link[1]);
    default:
      break;
  }
  
}


window.sendToElectron = (dataType, dataContent) => {
  if (isElectron) {
    electron.ipcRenderer.send(dataType, dataContent);
  }
}