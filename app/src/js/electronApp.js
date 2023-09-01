import { markChannelAsRead } from './channels';
import { openModal } from './app';
import { markDMRead } from './friends';
import { backwardSong, forwardSong, openNewPlaylistDialog, openNewPlaylistFolderDialog, openOtherPlaylist } from './music';
import { createGroup, joinGroup, openSpecialServer } from './servers';

window.winBrowserWindow = null;
window.startTime = new Date().getTime();
window.muteCooldown = false;
window.deafenCooldown = false;
window.markAsReadAfterFocus = {
  type: '',
  id: '',
}

window.serverPort = null; // Important for music playback.

let electron;

if (window.require) {
  winBrowserWindow = window.require('@electron/remote');
  electron = window.require('electron');
}

window.sendToElectron = (dataType, dataContent) => {
  if (window.require) {
    electron.ipcRenderer.send(dataType, dataContent);
  }
}

export function startElectronProcesses() {
  window.electron = window.require('electron');
  electron.ipcRenderer.send('functions', 'checkUpdate'); // Starts the hourly update checker.
  electron.ipcRenderer.send('music', 'startServer'); // Starts the internal server in Electron.

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

  electron.ipcRenderer.on('update', (event, arg) => {
    localStorage.setItem('recentNotes', arg.releaseNotes);
    $(`#updateServer`).removeClass('serverGone');
    // If within first three minutes of app launch, don't allow skip update
    if (new Date().getTime() - startTime < (180 * 1000)) {
      openModal('updateAvailableUrgent');
      $(`#updateNowButton`).get(0).onclick = () => {
        updateApp();
      }
      window.setTimeout(() => {
        updateApp();
      }, 1000 * 30);
  
      $(`#whatsChanged1`).html(arg.releaseNotes);
    }
    else {
      openModal('updateAvailable');
      $(`#whatsChanged2`).html(arg.releaseNotes);
      $(`#updateNowButtonNonUrgent`).get(0).onclick = () => {
        updateApp();
      }
    }
  });

  electron.ipcRenderer.on('updateAvailable', (event, arg) => {
    snac("Downloading Update", "A new update was recently released. We are automatically downloading this update for you.");
  })
  
  electron.ipcRenderer.on('serverPort', (event, arg) => {
    serverPort = arg; // `http://localhost:${serverPort}`  
  });

  electron.ipcRenderer.on('menuBar', (event, arg) => {
    console.log(event, arg)
    switch (arg) {
      case 'about':
        openModal('credits');
        break;
      case 'preferences':
        openSpecialServer('account')
        break;
      case 'newPlaylist':
        openSpecialServer('music');
        openNewPlaylistDialog();
        break;
      case 'newPlaylistFolder':
        openSpecialServer('music');
        openNewPlaylistFolderDialog();
        break;
      case 'newGroup': 
        createGroup();
        break;
      case 'joinGroup':
        joinGroup();
        break;
      case 'forward':
        // Seek fowrad
        if (musicPlaying.id && !activeListeningParty) {
          libraryPlayer.currentTime += 10;
        }
        break;
      case 'skip':
        if (musicPlaying.id) {
          forwardSong();
        }
        break;
      case 'previous':
        if (musicPlaying.id && !activeListeningParty) {
          libraryPlayer.currentTime -= 10;
        }
        break;
      case 'skipBackward':
        if (!activeListeningParty && musicPlaying.id) {
          backwardSong();
        }
        break;
      case 'volumeUp':
        libraryPlayer.volume += 0.05;
        break;
      case 'volumeDown':
        libraryPlayer.volume -= 0.05;
        break;
      case 'friends':
        openSpecialServer('friends');
        break;
      case 'music':
        openSpecialServer('music');
        break;
      case 'servers':
        $(`#addServer`).get(0).click();
        break;
      case 'infinite':
        openSpecialServer('infinite');
        break;
      case 'account':
        openSpecialServer('account');
        break;
      case 'play':
        if (musicPlaying.id && !activeListeningParty) {
          $(`#playerPauseButton`).get(0).click();
        }
        break;
      case 'mute':
        if (!muteCooldown) {
          muteCooldown = true;
          window.setTimeout(() => {
            muteCooldown = false;
          }, 499);
          muteSelf();
        }
        else {
          snac("Mute Cooldown", "You must wait a moment before you can mute again.", 'danger');
        }
        break;
      case 'deafen':
        if (!deafenCooldown) {
          deafenCooldown = true;
          window.setTimeout(() => {
            deafenCooldown = false;
          }, 499);
          deafenSelf();
        }
        else {
          snac("Deafen Cooldown", "You must wait a moment before you can deafen again.", 'danger');
        }
        break;
      default:
        break;
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
}

export function getSources(opts) {
  return new Promise(async (resolve, reject) => {
    electron.ipcRenderer.invoke('DESKTOP_CAPTURER_GET_SOURCES', opts).then((sources) => {
      resolve(sources);
    });
  });
}

export function updateApp() {
  $(`#updateServer`).addClass('serverGone');
  jsConfetti.addConfetti({
    confettiColors: [
      '#F25E92', '#3267FF'
    ],
  });
  window.setTimeout(() => {
    electron.ipcRenderer.send('functions', 'update');
  }, 1500);
}

export function manageDeepLink() {
  const url = new URL(window.location.href);
  const searchParams = new URLSearchParams(url.search);
  const linkRaw = searchParams.get('deepLink');
  if (!linkRaw) return;
  const link = linkRaw.replace("parallel://", "").split('.');

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

export function sendMusicStatus(status, detail) {
  if (window.require) {
    if (activeListeningParty) {
      electron.ipcRenderer.send('music', status, detail, true);
    }
    else {
      electron.ipcRenderer.send('music', status, detail, false);
    }
  }
}