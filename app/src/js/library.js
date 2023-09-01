import { getFirestore, getDoc, setDoc, updateDoc, deleteDoc, doc, onSnapshot, writeBatch, arrayRemove, arrayUnion, serverTimestamp, addDoc, collection, deleteField, runTransaction, increment} from '@firebase/firestore';
import { getFunctions, httpsCallable } from '@firebase/functions'
import { getStorage, ref as storageRef, uploadBytesResumable } from '@firebase/storage';

import * as timeago from 'timeago.js';
import { disableButton, enableButton, getCroppedPhoto } from './app';
import { createAlbum, createArtist, createTrack } from './componentse';

import { commonArrayDifference, playlistArrayDifference, openModal, closeModal, timer, showUploadProgress, hideUploadProgress, displayImageAnimation, securityConfirmText, messageHTMLtoText, displayInputEffect, windowSelected } from './app'
import { manageDeepLink } from './electronApp';
import { checkAppInitialized } from './firebaseChecks';
import { clearMusicViewsPlaylist, musicTab, openOtherPlaylist } from './music';
import { checkValidSubscription } from './stripe';

window.loadedSections = [];

window.cacheLibraryArtists = [];
window.cacheLibraryAlbums = [];
window.cacheLibraryTracks = [];

window.cachePlaylists = [];
window.firstPlaylistLoad = true;
window.playlistListener = null;
window.cachePlaylistData = {};
window.playlistMetaData = {};
window.playlistDataImages = {};
window.editorModeTimeouts = {};
window.editorModePlaylist = null;
window.editorModeTracks = new Set();
window.editorLastSelected = null;

checkAppInitialized();
const db = getFirestore();
const storage = getStorage();
const functions = getFunctions();

window.addToLibrary = async (type, contentID) => {
  // Disable button temporarily
  $(`.likedButton${type}${contentID}`).html(`<i class='bx bx-time loadingIcon'></i>`);

  await setDoc(doc(db, `users/${user.uid}/library/${type}`), {
    content: arrayUnion(contentID)
  }, {
    merge: true
  });

  await timer(399);

  $(`.likedButton${type}${contentID}`).html(`<i class="bx bxs-heart"></i>`);
  $(`.likedButton${type}${contentID}`).get(0).onclick = () => {
    removeFromLibrary(type, contentID);
  }

  checkEmptySaved();
}

window.removeFromLibrary = async (type, contentID) => {
  // Disable button temporarily
  $(`.likedButton${type}${contentID}`).html(`<i class='bx bx-time loadingIcon'></i>`);

  await timer(199);
  
  await updateDoc(doc(db, `users/${user.uid}/library/${type}`), {
    content: arrayRemove(contentID)
  });

  $(`.likedButton${type}${contentID}`).html(`<i class="bx bx-heart"></i>`);
  $(`.likedButton${type}${contentID}`).get(0).onclick = () => {
    addToLibrary(type, contentID);
  }

  checkEmptySaved();
}

export function artistLibraryListener() {
  onSnapshot(doc(db, `users/${user.uid}/library/artists`), async (doc) => {
    if (!doc.exists()) {
      $('#artistsLibraryDivider').addClass('hidden');
      $('#savedContent_artists').addClass('hidden');
      checkEmptySaved();
      return;
    }

    if (doc.data().content.length) {
      // Fade in
      $('#artistsLibraryDivider').removeClass('fadeOut');
      $('#savedContent_artists').removeClass('fadeOut');
      $('#artistsLibraryDivider').addClass('fadeIn');
      $('#savedContent_artists').addClass('fadeIn');
      $('#artistsLibraryDivider').removeClass('hidden');
      $('#savedContent_artists').removeClass('hidden');
    }
    else {
      // Fade out
      $('#artistsLibraryDivider').addClass('fadeOut');
      $('#savedContent_artists').addClass('fadeOut');
      $('#artistsLibraryDivider').removeClass('fadeIn');
      $('#savedContent_artists').removeClass('fadeIn');
      window.setTimeout(() => {
        $('#artistsLibraryDivider').addClass('hidden');
        $('#savedContent_artists').addClass('hidden');
      }, 950);
    }

    const artistsList = doc.data().content;
    const artistsListForward = commonArrayDifference(artistsList, cacheLibraryArtists);
    const artistsListBackward = commonArrayDifference(cacheLibraryArtists, artistsList);
    cacheLibraryArtists = artistsList;

    if (artistsListForward.length) {
      let finalArtistsArray = [];
      while (artistsListForward.length) {
        finalArtistsArray.push(artistsListForward.splice(0, 250));
      }

      for (let i = 0; i < finalArtistsArray.length; i++) {
        const data = await makeMusicRequest(`artists?ids=${finalArtistsArray[i].join(',')}`);
        for (let j = 0; j < data.data.length; j++) {
          const artist = data.data[j];
          createArtist(artist, 'savedContent_artists', `savedArtist${artist.id}`);
        }
      }
    }

    for (let i = 0; i < artistsListBackward.length; i++) {
      $(`#savedArtist${artistsListBackward[i]}`).addClass('music-artist-gone');
      window.setTimeout(() => {
        $(`#savedArtist${artistsListBackward[i]}`).remove();
      }, 550);
    }

    checkEmptySaved();
  })
}

export function albumLibraryListener() {
  onSnapshot(doc(db, `users/${user.uid}/library/albums`), async (doc) => {
    if (!doc.exists()) {
      $('#albumsLibraryDivider').addClass('hidden');
      $('#savedContent_albums').addClass('hidden');
      checkEmptySaved();
      return;
    }
    
    if (doc.data().content.length) {
      // Fade in
      $('#albumsLibraryDivider').removeClass('fadeOut');
      $('#savedContent_albums').removeClass('fadeOut');
      $('#albumsLibraryDivider').addClass('fadeIn');
      $('#savedContent_albums').addClass('fadeIn');
      $('#albumsLibraryDivider').removeClass('hidden');
      $('#savedContent_albums').removeClass('hidden');
    }
    else {
      // Fade out
      $('#albumsLibraryDivider').addClass('fadeOut');
      $('#savedContent_albums').addClass('fadeOut');
      $('#albumsLibraryDivider').removeClass('fadeIn');
      $('#savedContent_albums').removeClass('fadeIn');
      window.setTimeout(() => {
        $('#albumsLibraryDivider').addClass('hidden');
        $('#savedContent_albums').addClass('hidden');
      }, 950)
    }

    const albumsList = doc.data().content;
    const albumsListForward = commonArrayDifference(albumsList, cacheLibraryAlbums);
    const albumsListBackward = commonArrayDifference(cacheLibraryAlbums, albumsList);
    cacheLibraryAlbums = albumsList;

    if (albumsListForward.length) {
      let finalAlbumsArray = [];
      while (albumsListForward.length) {
        finalAlbumsArray.push(albumsListForward.splice(0, 250));
      }
      for (let i = 0; i < finalAlbumsArray.length; i++) {
        const data = await makeMusicRequest(`albums?ids=${finalAlbumsArray[i].join(',')}`);
        for (let j = 0; j < data.data.length; j++) {
          const album = data.data[j];
          createAlbum(album, 'savedContent_albums', `savedAlbum${album.id}`);
        }
      }
    }

    for (let i = 0; i < albumsListBackward.length; i++) {
      $(`#savedAlbum${albumsListBackward[i]}`).addClass('music-album-gone');
      window.setTimeout(() => {
        $(`#savedAlbum${albumsListBackward[i]}`).remove();
      }, 550)
    }

    checkEmptySaved();
  })
}

export function trackLibraryListener() {
  onSnapshot(doc(db, `users/${user.uid}/library/tracks`), async (doc) => {
    if (!doc.exists()) {
      $('#tracksLibraryDivider').addClass('hidden');
      $('#savedContent_tracks').addClass('hidden');
      checkEmptySaved();
      return;
    }
    
    if (doc.data().content.length) {
      // Fade in
      $('#tracksLibraryDivider').removeClass('fadeOut');
      $('#savedContent_tracks').removeClass('fadeOut');
      $('#tracksLibraryDivider').addClass('fadeIn');
      $('#savedContent_tracks').addClass('fadeIn');
      $('#tracksLibraryDivider').removeClass('hidden');
      $('#savedContent_tracks').removeClass('hidden');
    }
    else {
      // Fade out
      $('#tracksLibraryDivider').addClass('fadeOut');
      $('#savedContent_tracks').addClass('fadeOut');
      $('#tracksLibraryDivider').removeClass('fadeIn');
      $('#savedContent_tracks').removeClass('fadeIn');
      window.setTimeout(() => {
        $('#tracksLibraryDivider').addClass('hidden');
        $('#savedContent_tracks').addClass('hidden');
      }, 950)
    }

    const tracksList = doc.data().content;
    const tracksListForward = commonArrayDifference(tracksList, cacheLibraryTracks);
    const tracksListBackward = commonArrayDifference(cacheLibraryTracks, tracksList);
    cacheLibraryTracks = tracksList;

    if (tracksListForward.length) {
      let finalTracksArray = [];
      while (tracksListForward.length) {
        finalTracksArray.push(tracksListForward.splice(0, 250));
      }

      for (let i = 0; i < finalTracksArray.length; i++) {
        const data = await makeMusicRequest(`songs?ids=${finalTracksArray[i].join(',')}`);
        for (let j = 0; j < data.data.length; j++) {
          const track = data.data[j];
          createTrack(track, 'savedContent_tracks', null, `savedTrack${track.id}`, []);
        }
      }
    }

    for (let i = 0; i < tracksListBackward.length; i++) {
      $(`#savedTrack${tracksListBackward[i]}`).addClass('music-track-gone');
      window.setTimeout(() => {
        $(`#savedTrack${tracksListBackward[i]}`).remove();
      }, 550);
    }


    checkEmptySaved();
  })
}

function checkEmptySaved() {
  if (!cacheLibraryAlbums.length && !cacheLibraryArtists.length && !cacheLibraryTracks.length ) {
    $('#noSavedContent').removeClass('hidden');
  }
  else {
    $('#noSavedContent').addClass('hidden');
  }
}

export function createPlaylist(addTrackIDToPlaylist, playlistNameInput, skipNotify, addAlbumIDToPlaylist, playlistDescription) {
  return new Promise(async (resolve, reject) => {
    // Check if limit on playlists.
    if (checkValidSubscription(cacheUser.subscription)) {
      if (cachePlaylists.length > 72) {
        snac(`Playlist Creation Error`, `You have reached the maximum playlist count.`, 'danger');
        resolve(false);
        return;
      }  
    }
    else {
      if (cachePlaylists.length > 42) {
        snac(`Playlist Creation Error`, `You have reached the maximum playlist count. Upgrade to Parallel Infinite to create 40 more.`, 'danger');
        resolve(false);
        return;
      }
    }

    let playlistName;
    if (playlistNameInput) {
      playlistName = securityConfirmTextIDs(playlistNameInput, true).trim();
    }
    else {
      playlistName = securityConfirmTextIDs($('#newPlaylistName').val(), true).trim();
    }

    closeModal();

    if (playlistName.length > 48) {
      snac('Playlist Creation Error', `Your playlist's title cannot be more than 48 characters. Proceeding with only the first 48 characters...`, 'danger');
      playlistName = `${playlistName.substring(0, 48)}...`;
    }

    if (!playlistName.length) {
      snac('Playlist Creation Error', `Your playlist's title cannot be empty.`, 'danger');
      window.setTimeout(() => {
        openNewPlaylistDialog();
      }, 1500)
      resolve(false);
      return;
    }

    const playlistDoc = await addDoc(collection(db, `users/${user.uid}/playlists/`), {
      title: playlistName,
      creator: `${user.uid}.${cacheUser.username}`,
      dateCreated: serverTimestamp(),
      dateModified: serverTimestamp(),
      description: playlistDescription || "",
      tracks: [],
      imageURL: '',
    })

    const playlistID = playlistDoc.id

    await updateDoc(doc(db, `users/${user.uid}`), {
      playlists: arrayUnion(`${playlistID}.${playlistName}`),
      playlistCount: increment(1)
    });

    if (!skipNotify) {
      snac('Playlist Created', 'This playlist was created successfully.', 'success');
    }

    if (addTrackIDToPlaylist) {
      await addTrackToPlaylist(playlistID, addTrackIDToPlaylist);
    }
    if (addAlbumIDToPlaylist) {
      await addAlbumToPlaylist(playlistID, addAlbumIDToPlaylist)
    }

    resolve(playlistID);
    return;
  })
}

export async function addPlaylistToLibrary(playlistUID, playlistID, playlistNameInput) {
  let playlistName = playlistNameInput;
  if (!playlistName) {
    const playlistDoc = await getDoc(doc(db, `users/${playlistUID}/playlists/${playlistID}`));
    playlistName = playlistDoc.data().title;
  }
  
  await updateDoc(doc(db, `users/${user.uid}`), {
    playlists: arrayUnion(`${playlistUID}.${playlistID}.${playlistName}`),
    playlistCount: increment(1)
  });

  // Display.
  closeMusicView('Playlist', `${playlistUID}${playlistID}`)
  $(`PlaylistView${playlistUID}${playlistID}`).remove();
  window.setTimeout(() => {
    openOtherPlaylist(playlistUID, playlistID, playlistName, true, false)
  }, 499); 

  snac('Playlist Added', '', 'success');
}

export function clonePlaylistToLibrary(playlistUID, playlistID) {
  openModal('clonePlaylist');
  $(`#clonePlaylistConfirm`).get(0).onclick = async () => {
    closeModal();

    const playlistDoc = await getDoc(doc(db, `users/${playlistUID}/playlists/${playlistID}`));
    let playlistData = playlistDoc.data();
    if (playlistData.clone) { // Clone already exists
      playlistData.clonedMultiple = true;
    }
    playlistData.clone = `${user.uid}.${cacheUser.username}`;
    playlistData.dateModified = serverTimestamp();
    playlistData.imageURL = '';
    playlistData.title = `Copy of ${playlistData.title}`;

    const newPlaylistID = await createPlaylist(null, playlistData.title, true);

    if (newPlaylistID) {
      await updateDoc(doc(db, `users/${user.uid}/playlists/${newPlaylistID}`), playlistData);
      snac('Playlist Cloned', 'The playlist was cloned to your library successfully.', 'success');
    }

  }
  
}

export async function removePlaylistFromLibrary(playlistUID, playlistID, playlistName, folderContext, skipNotify, deleteView) {
  closeModal();

  if (folderContext) {
    await updateDoc(doc(db, `users/${user.uid}`), {
      playlists: arrayRemove(`${playlistUID}.${playlistID}.${playlistName}`),
      [`playlistFolders.${folderContext}`]: arrayRemove(`${playlistUID}.${playlistID}`),
      playlistCount: increment(-1)
    });

    const folderID = folderContext.split('<')[1];
    if ($(`#playlistFolderContent${folderID}`).hasClass('playlistFolderContentActive')) {
      const oldHeight = $(`#playlistFolderContent${folderID}`).css('height').split('px')[0]; 
      $(`#playlistFolderContent${folderID}`).css('height', `${parseInt(oldHeight) - 16 - 8 - 8 - 12}px`);
    }
  }

  else {
    await updateDoc(doc(db, `users/${user.uid}`), {
      playlists: arrayRemove(`${playlistUID}.${playlistID}.${playlistName}`),
      playlistCount: increment(-1)
    });
  }

  if (deleteView) {
    $(`#PlaylistView${playlistUID}${playlistID}`).remove();
  }

  if (!skipNotify) {
    snac('Playlist Removed', '', 'success');
  }
}

export async function createPlaylistFolder(playlistUID, playlistID) {
  const folderName = securityConfirmTextIDs($('#newPlaylistFolderName').val(), true).trim().replaceAll(`<`, '');
  
  if (folderName.length > 48) {
    snac('Invalid Folder Title', `Your folder's title cannot be more than 48 characters.`, 'danger');
    return;
  }

  if (!folderName.length) {
    snac('Invalid Folder Title', `Your folder's title cannot be empty.`, 'danger');
    return;
  }
  
  closeModal();
  const folderID = new Date().getTime();

  await updateDoc(doc(db, `users/${user.uid}`), {
    [`playlistFolders.${folderName}<${folderID}`]: [],
    playlistFoldersSort: arrayUnion(folderID)
  });

  snac('Folder Created', '', 'success');

  if (playlistID) {
    addPlaylistToFolder(folderID, folderName, playlistUID, playlistID);
  }
}

Sortable.create($('#musicSidebarPlaylistsPlaylists').get(0), {
  ghostClass: 'sortableSidebarItemGhost',
  onEnd: async () => updatePlaylistsOrder()
});

Sortable.create($('#musicSidebarPlaylistFolders').get(0), {
  ghostClass: 'sortableSidebarItemGhost',
  onEnd: async () => { // Overwrite playlists.

    let newFoldersSort = [];

    $('#musicSidebarPlaylistFolders').children('.folderContainer').each((index, object) => {
      const id = $(object).get(0).getAttribute('folderID');
      newFoldersSort.push(id);
    })

    await updateDoc(doc(db, `users/${user.uid}`), {
      playlistFoldersSort: newFoldersSort
    });

    console.log('Updated folders sidebar order.')
  }
})

async function updatePlaylistsOrder() {
  let newPlaylists = [];

  // Top down from folders
  $('.playlistFolderContent').children('.playlistItem').each((index, object) => {
    const playlistUID = $(object).get(0).getAttribute('playlistUID');
    const playlistID = $(object).get(0).getAttribute('playlistID');
    const playlistName = $(object).get(0).getAttribute('playlistName');
    newPlaylists.push(`${playlistUID}.${playlistID}.${playlistName}`);
  });

  $('#musicSidebarPlaylistsPlaylists').children('.playlistItem').each((index, object) => {
    const playlistUID = $(object).get(0).getAttribute('playlistUID');
    const playlistID = $(object).get(0).getAttribute('playlistID');
    const playlistName = $(object).get(0).getAttribute('playlistName');
    newPlaylists.push(`${playlistUID}.${playlistID}.${playlistName}`);
  });

  await updateDoc(doc(db, `users/${user.uid}`), {
    playlists: newPlaylists
  });

  console.log('Updated playlists sidebar order.')
}

export async function loadPlaylists() {
  if (!cacheUser.playlists.length && !Object.keys(cacheUser.playlistFolders).length) { 
    cachePlaylists = cacheUser.playlists;
    $(`#noPlaylistsText`).removeClass('hidden');
    manageDeepLink()

    $(`.playlistItem`).addClass('playlistItemGone');
    $(`.playlistView`).remove();
    window.setTimeout(() => {
      $(`.playlistItem`).remove();
    }, 500);

    // From no playlist folders:
    $(`#musicSidebarPlaylistFolders`).addClass("hidden"); 
    $(`.folderContainer`).addClass('hidden'); 
    setPlaylistHandlers(); 
    return; 
  }
  $(`#noPlaylistsText`).addClass('hidden');
  let playlistForward = [];
  let playlistBackward = [];
  
  if (cacheUser.playlists.length !== cachePlaylists.length) {
    playlistForward = commonArrayDifference(cacheUser.playlists, cachePlaylists)
    playlistBackward = commonArrayDifference(cachePlaylists, cacheUser.playlists)
  }

  cachePlaylists = cacheUser.playlists;

  if (firstPlaylistLoad) {
    firstPlaylistLoad = false;

    for (let i = 0; i < cacheUser.playlists.length; i++) {
      buildPlaylist(cacheUser.playlists[i]);
    }

    manageDeepLink();
  }
  else {
    for (let i = 0; i < playlistForward.length; i++) {
      buildPlaylist(playlistForward[i]); 
    }

    for (let i = 0; i < playlistBackward.length; i++) {
      const playlist = playlistBackward[i].split('.');
      let playlistUID = user.uid;
      let playlistID = playlist[0];
      if (playlist.length == 3) { // Other playlist
        playlistUID = playlist[0];
        playlistID = playlist[1];
      }
      $(`#playlistButton${playlistUID}${playlistID}`).addClass('playlistItemGone');
      $(`#PlaylistView${playlistUID}${playlistID}`).remove();
      window.setTimeout(() => {
        $(`#playlistButton${playlistUID}${playlistID}`).remove();
      }, 500);
    }
  }

  for (let i = 0; i < cacheUser.playlists.length; i++) {
    const playlist = cacheUser.playlists[i].split('.');
    let playlistUID = user.uid;
    let playlistID = playlist[0];
    let playlistName = playlist[1];

    if (playlist.length == 3) { // Other playlist
      playlistUID = playlist[0];
      playlistID = playlist[1];
      playlistName = securityConfirmTextIDs(playlist[2], true);
    }
    
    $(`#${playlistUID}${playlistID}PlaylistName`).html(playlistName);
    $(`#playlistButton${playlistUID}${playlistID}`).removeClass("hidden"); // From moving playlists around.
    $(`#playlistButton${playlistUID}${playlistID}`).get(0).setAttribute('playlistName', playlistName);
    twemoji.parse($(`#${playlistUID}${playlistID}PlaylistName`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });

    $(`#playlistButton${playlistUID}${playlistID}`).get(0).ondragstart = (ev) => {
      // No folder by default. 
      ev.dataTransfer.setData("targetPlaylistUID", playlistUID);
      ev.dataTransfer.setData("targetPlaylistID", playlistID);
      ev.dataTransfer.setData("targetFolderKey", ``);
    }
  }

  resetFoldersLayout();
  loadPlaylistFolders(cacheUser.playlists, cacheUser.playlistFolders);
}

function sortNonFolderPlaylists() {
  for (let i = 0; i < cacheUser.playlists.length; i++) {
    let playlistUID = user.uid;
    let playlistID = cacheUser.playlists[i].split('.')[0];
    if (cacheUser.playlists[i].split('.').length == 3) { // Other playlist
      playlistUID = cacheUser.playlists[i].split('.')[0];
      playlistID = cacheUser.playlists[i].split('.')[1];
    }
    $(`#playlistButton${playlistUID}${playlistID}`).get(0).setAttribute('data-order', i);        
  }

  let sorted = $(`#musicSidebarPlaylistsPlaylists`).children('.playlistItem').sort((a, b) => {
    return parseInt($(a).attr('data-order')) - parseInt($(b).attr('data-order'));
  });

  $(`#musicSidebarPlaylistsPlaylists`).append(sorted);
}

export async function addPlaylistToFolder(folderID, folderName, playlistUID, playlistID) {
  $(`#playlistButton${playlistUID}${playlistID}`).addClass("hidden");
  $(`#playlistButton${playlistUID}${playlistID}`).get(0).setAttribute('inFolder', `${folderName}<${folderID}`);
  await updateDoc(doc(db, `users/${user.uid}`), {
    [`playlistFolders.${folderName}<${folderID}`]: arrayUnion(`${playlistUID}.${playlistID}`)
  });

  // Sort now.
  await updatePlaylistsOrder();

  if ($(`#playlistFolderContent${folderID}`).hasClass('playlistFolderContentActive')) {
    $(`#playlistFolderContent${folderID}`).addClass('instantAnimations');
    const oldHeight = $(`#playlistFolderContent${folderID}`).css('height').split('px')[0]; 
    $(`#playlistFolderContent${folderID}`).css('height', `${parseInt(oldHeight) + 38}px`);
    window.setTimeout(() => {
      $(`#playlistFolderContent${folderID}`).removeClass('instantAnimations');
    }, 99);
  }
}

export function removePlaylistFromFolder(folderKey, playlistUID, playlistID, hide) {
  return new Promise(async (resolve, reject) => {
    const folderID = folderKey.split('<')[1];
  
    $(`#playlistButton${playlistUID}${playlistID}`).addClass("hidden")
    $(`#playlistFolderContent${folderID}`).addClass('instantAnimations');
    const oldHeight = $(`#playlistFolderContent${folderID}`).css('height').split('px')[0]; 
    $(`#playlistFolderContent${folderID}`).css('height', `${parseInt(oldHeight) - 38}px`);
    window.setTimeout(() => {
      $(`#playlistFolderContent${folderID}`).removeClass('instantAnimations');
    }, 99);

    await updateDoc(doc(db, `users/${user.uid}`), {
      [`playlistFolders.${folderKey}`]: arrayRemove(`${playlistUID}.${playlistID}`, `${playlistID}`)
    });

    resolve(true);
  });
}

function resetFoldersLayout() {
  // Reset layout before dealing with playlist folders.
  $(`.playlistFolderContent`).children().each((index, element) => {
    $(element).appendTo(`#musicSidebarPlaylistsPlaylists`);
    $(element).get(0).removeAttribute('inFolder');
  });
  
  sortNonFolderPlaylists();
}

async function loadPlaylistFolders(playlists, folders) {
  if (!Object.keys(folders).length) {
    // If folders empty.
    $(`#musicSidebarPlaylistFolders`).addClass("hidden"); 
    $(`.folderContainer`).addClass('hidden'); 
    setPlaylistHandlers(); 
    return 
  }

  $(`#musicSidebarPlaylistFolders`).removeClass("hidden");
  const keys = Object.keys(folders);
  $(`.folderContainer`).addClass('hidden');

  for (let i = 0; i < keys.length; i++) {
    const folderName = keys[i].split('<')[0];
    const folderID = keys[i].split('<')[1];
    const playlistIDs = folders[`${folderName}<${folderID}`];

    // If element not already created.
    if (!$(`#${folderID}Container`).length) {
      const a = document.createElement('div');
      a.classList.add('folderContainer');

      a.ondragover = (ev) => {
        ev.preventDefault();
      }
      a.ondrop = (ev) => {
        foldersDrop(ev, folderID, folderName);
      }    

      a.setAttribute('folderID', folderID);
      a.id = `${folderID}Container`;
      a.innerHTML = `
        <button id="${folderID}Button" folderID="${folderID}" folderName="${folderName}" onclick="expandPlaylistFolder('${folderID}')" class="sidebarButton musicSidebarButton playlistFolder"><i id="folder${folderID}" class="bx bx-folder"></i> <span class="sidebarText">${folderName}</span><i id="chevron${folderID}" class="bx bx-chevron-down chevronIndicator"></i></button>
        <div id="playlistFolderContent${folderID}" class="playlistFolderContent hidden" style=""></div>
      `;
      
      $(`#musicSidebarPlaylistFolders`).get(0).appendChild(a);
      twemoji.parse($(`#${folderID}Button`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });

      // Setup a sortable.
      Sortable.create($(`#playlistFolderContent${folderID}`).get(0), {
        ghostClass: 'sortableSidebarItemGhost',
        onEnd: async (e) => updatePlaylistsOrder()
      });
    }
    else {
      if ($(`#${folderID}Button`).get(0).getAttribute('folderName') !== folderName) {
        // Folder was renamed.
        $(`#${folderID}Button`).get(0).setAttribute('folderName', folderName);
        $(`#${folderID}Button`).html(`<i id="folder${folderID}" class="bx bx-folder"></i> <span class="sidebarText">${folderName}</span><i id="chevron${folderID}" class="bx bx-chevron-down chevronIndicator"></i>`)
        twemoji.parse($(`#${folderID}Button`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });
      }
      $(`#${folderID}Container`).removeClass('hidden');
    }

    // Add all the playlists into the folder.
    for (let i = 0; i < playlistIDs.length; i++) {
      const playlistSplit = playlistIDs[i].split('.');
      let playlistUID = user.uid
      let playlistID = playlistSplit[0];
      if (playlistSplit.length == 2) {
        playlistUID = playlistSplit[0];
        playlistID = playlistSplit[1];
      }
      // Move the button into the container.

      $(`#playlistButton${playlistUID}${playlistID}`).appendTo(`#playlistFolderContent${folderID}`);
      $(`#playlistButton${playlistUID}${playlistID}`).get(0).setAttribute('inFolder', `${folderName}<${folderID}`);
      $(`#playlistButton${playlistUID}${playlistID}`).get(0).ondragstart = (ev) => {
        ev.dataTransfer.setData("targetPlaylistUID", playlistUID);
        ev.dataTransfer.setData("targetPlaylistID", playlistID);
        ev.dataTransfer.setData("targetFolderKey", `${folderName}<${folderID}`);
      }

      if (playlistUID == user.uid) {
        $(`#playlistButton${playlistUID}${playlistID}`).get(0).onclick = () => {
          openPlaylist(user.uid, playlistID, null, true, `${folderName}<${folderID}`);
        }
        if ($(`#deletePlaylistButton${playlistUID}${playlistID}`).length) {
          $(`#deletePlaylistButton${playlistUID}${playlistID}`).get(0).onclick = () => { prepareDeletePlaylist(playlistID, null, `${folderName}<${folderID}`) }
        }
      }
      else {
        $(`#playlistButton${playlistUID}${playlistID}`).get(0).onclick = () => {
          openOtherPlaylist(playlistUID, playlistID, null, true, `${folderName}<${folderID}`);
        }
        if ($(`#deletePlaylistButton${playlistUID}${playlistID}`).length) {
          $(`#deletePlaylistButton${playlistUID}${playlistID}`).get(0).onclick = () => { prepareRemovePlaylistFromLibrary(playlistUID, playlistID, null, `${folderName}<${folderID}`) };
        }
      }
    }

    // Sort the playlists according to cacheUser.playlists
    for (let i = 0; i < cacheUser.playlists.length; i++) {
      const playlistSplit = cacheUser.playlists[i].split('.');
      let playlistUID = user.uid
      let playlistID = playlistSplit[0];
      if (playlistSplit.length == 3) {
        playlistUID = playlistSplit[0];
        playlistID = playlistSplit[1];
      }
      if ($(`#playlistButton${playlistUID}${playlistID}`).attr('inFolder') == `${folderName}<${folderID}`) {
        $(`#playlistButton${playlistUID}${playlistID}`).get(0).setAttribute('data-order', i)
      }
    }

    let sorted = $(`#playlistFolderContent${folderID}`).children('.playlistItem').sort((a, b) => {
      return parseInt($(a).attr('data-order')) - parseInt($(b).attr('data-order'));
    });
  
    $(`#playlistFolderContent${folderID}`).append(sorted);
  }

  // Sort the folders
  if (cacheUser.playlistFoldersSort) {
    for (let i = 0; i < cacheUser.playlistFoldersSort.length; i++) {
      const folderID = cacheUser.playlistFoldersSort[i];
      $(`#${folderID}Container`).attr('data-order', i);
    }
  
    let sorted = $(`#musicSidebarPlaylistFolders`).children('.folderContainer').sort((a, b) => {
      return parseInt($(a).attr('data-order')) - parseInt($(b).attr('data-order'));
    });
  
    $(`#musicSidebarPlaylistFolders`).append(sorted);
  }

  setPlaylistHandlers(); // For non-folders
}

function setPlaylistHandlers() {  
  for (let i = 0; i < cacheUser.playlists.length; i++) {
    let playlistUID = user.uid;
    let playlistID = cacheUser.playlists[i].split('.')[0];
    let playlistName = cacheUser.playlists[i].split('.')[1];
    if (cacheUser.playlists[i].split('.').length == 3) { // Other playlist
      playlistUID = cacheUser.playlists[i].split('.')[0];
      playlistID = cacheUser.playlists[i].split('.')[1];
      playlistName = cacheUser.playlists[i].split('.')[2];
    }

    // If belongs to a folder
    if ($(`#playlistButton${playlistUID}${playlistID}`).attr('inFolder')) {
      continue;
    }

    if (playlistUID == user.uid) {
      $(`#playlistButton${playlistUID}${playlistID}`).get(0).onclick = () => {
        openPlaylist(user.uid, playlistID, playlistName, true, false);
      }
      if ($(`#deletePlaylistButton${playlistUID}${playlistID}`).length) {
        $(`#deletePlaylistButton${playlistUID}${playlistID}`).get(0).onclick = () => { prepareDeletePlaylist(playlistID, playlistName, false) }
      }
    }
    else {
      $(`#playlistButton${playlistUID}${playlistID}`).get(0).onclick = () => {
        openOtherPlaylist(playlistUID, playlistID, playlistName, true, false);
      }
      if ($(`#deletePlaylistButton${playlistUID}${playlistID}`).length) {
        $(`#deletePlaylistButton${playlistUID}${playlistID}`).get(0).onclick = () => { prepareRemovePlaylistFromLibrary(playlistUID, playlistID, playlistName, false) };
      }
    }

    
  }
}

export function deletePlaylistFolder(folderID, folderName, skipNotify, keepSort) {
  return new Promise(async (resolve, reject) => {
    if (keepSort) {
      await updateDoc(doc(db, `users/${user.uid}`), {
        [`playlistFolders.${folderName}<${folderID}`]: deleteField(),
      });
    }
    else {
      await updateDoc(doc(db, `users/${user.uid}`), {
        [`playlistFolders.${folderName}<${folderID}`]: deleteField(),
        playlistFoldersSort: arrayRemove(parseInt(folderID), folderID)
      });
    }
  
    if (!skipNotify) {
      snac('Folder Deleted', '', 'success');
    }

    resolve(true);
  })
}

window.expandPlaylistFolder = (folderID) => {
  const hidden = $(`#playlistFolderContent${folderID}`).get(0).getAttribute('style') == '';
  
  if (hidden) {
    $(`#playlistFolderContent${folderID}`).removeClass('hidden');
    $(`#playlistFolderContent${folderID}`).removeClass('zeroHeight');
    const naturalHeight = $(`#playlistFolderContent${folderID}`).height();
    $(`#playlistFolderContent${folderID}`).addClass('zeroHeight');
    $(`#playlistFolderContent${folderID}`).addClass('playlistFolderContentActive');
    $(`#playlistFolderContent${folderID}`).css(`height`, `${naturalHeight}px`);
    $(`#chevron${folderID}`).removeClass('bx-chevron-down');
    $(`#chevron${folderID}`).addClass('bx-chevron-up');
    $(`#folder${folderID}`).addClass('folderFolderIconActive');
    $(`#folder${folderID}`).removeClass('bx-folder');
    $(`#folder${folderID}`).addClass('bx-folder-open');
  }
  else {
    $(`#playlistFolderContent${folderID}`).get(0).setAttribute('style', '');
    $(`#chevron${folderID}`).addClass('bx-chevron-down');
    $(`#chevron${folderID}`).removeClass('bx-chevron-up');
    $(`#folder${folderID}`).removeClass('folderFolderIconActive');
    $(`#folder${folderID}`).removeClass('bx-folder-open');
    $(`#folder${folderID}`).addClass('bx-folder');
    $(`#playlistFolderContent${folderID}`).removeClass('playlistFolderContentActive');
  }
}

function buildPlaylist(playlist) {
  let playlistUID = user.uid;
  let playlistID = playlist.split('.')[0];
  let playlistName = playlist.split('.')[1];
  if (playlist.split('.').length == 3) { // Other playlist.
    playlistUID = playlist.split('.')[0];
    playlistID = playlist.split('.')[1];
    playlistName = playlist.split('.')[2];
  }

  const a = document.createElement('button');
  a.setAttribute('class', `sidebarButton musicSidebarButton playlistItem`)
  a.ondragover = (ev) => {
    ev.preventDefault();
  }
  a.ondrop = (ev) => {
    playlistsDrop(ev, playlistID);
  }

  a.draggable = true;
  a.ondragstart = (ev) => {
    ev.dataTransfer.setData("targetPlaylistUID", playlistUID);
    ev.dataTransfer.setData("targetPlaylistID", playlistID);
    ev.dataTransfer.setData("targetFolderKey", '');
  }

  a.setAttribute('playlistID', playlistID);
  a.setAttribute('playlistUID', playlistUID);
  a.setAttribute('playlistName', playlistName);
  a.id = `playlistButton${playlistUID}${playlistID}`;
  a.innerHTML = `
    <i class="bx bxs-playlist"></i>
    <span class="sidebarText" id="${playlistUID}${playlistID}PlaylistName"><div class="sidebarText">${playlistName}</div></span>
  `
  $(`#musicSidebarPlaylistsPlaylists`).get(0).appendChild(a);
  
  twemoji.parse($(`#${playlistUID}${playlistID}PlaylistName`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });
}

export function openPlaylist(playlistUID, playlistID, playlistNameInput, fromLibrary, folderContext) {
  if ($(`#playlistButton${playlistUID}${playlistID}`).hasClass('sidebarButtonActive')) {
    // Already open!
    clearMusicViewsPlaylist();
    return;
  }

  musicTab('playlists');
  $(`.playlistView`).addClass('hidden');
  $(`#playlistButton${playlistUID}${playlistID}`).addClass('sidebarButtonActive');

  // Expand enclosing folder if it's not already expanded.
  if (!$(`#playlistButton${playlistUID}${playlistID}`).parent().hasClass('playlistFolderContentActive')) {
    $(`#playlistButton${playlistUID}${playlistID}`).parent().parent().children().first().click();
  }

  if ($(`#PlaylistView${playlistUID}${playlistID}`).length) {
    $(`#PlaylistView${playlistUID}${playlistID}`).removeClass('hidden');
    addPlaylistListeners(playlistUID, playlistID, fromLibrary);
    return;
  }

  let playlistName = playlistNameInput;
  if (!playlistNameInput) {
    for (let i = 0; i < cacheUser.playlists.length; i++) {
      const playlistSplit = cacheUser.playlists[i].split('.');
      let playlistIDSearch = playlistSplit[0];
      let playlistNameSearch = playlistSplit[1];
      if (playlistSplit.length == 3) { // New playlist format.
        playlistIDSearch = playlistSplit[1];
        playlistNameSearch = playlistSplit[2];
      }

      if (playlistID == playlistIDSearch) {
        playlistName = playlistNameSearch;
      }
    }
  }
  
  const a = document.createElement('div');
  a.id = `PlaylistView${playlistUID}${playlistID}`;
  a.setAttribute('class', 'musicView playlistView');
  a.innerHTML = `
    <div class="musicViewHeader animated fadeInDown faster">
      <p>Playlist</p>
      <button id="Playlist${playlistUID}${playlistID}Close" onclick="closeMusicView('Playlist', '${playlistUID}${playlistID}')" class="btn b-3 roundedButton closeButton hidden"><i class="bx bx-x"></i></button>
    </div>
    <div class="musicViewContentContainer">
      <div class="playlistTopLevel">
        <div id="${playlistUID}${playlistID}playlistViewImage" class="playlistCover"></div>
        <div id="${playlistUID}${playlistID}playlistDetailsOne" class="playlistDetails">
          <h2 id="${playlistUID}${playlistID}playlistTitle" class="playlistTitle myPlaylistTitle animated fadeInUp"></h2>
          <p id="${playlistUID}${playlistID}playlistDetailsLine" class="playlistDetailsLine animated fadeIn"></p>
          <button id="${playlistUID}${playlistID}PlayTrackButton" class="btn b-1 playButton2"><i class='bx bx-play'></i></button> 
          <button id="${playlistUID}${playlistID}ShuffleTrackButton" onclick="playTrack(null, '${playlistUID}${playlistID}playlistViewTracksContainer', 0, true)" class="btn b-2 playButton2"><i class='bx bx-shuffle'></i></button>
          <div class="dropdown">
            <button id="playlistDropdownButton${playlistUID}${playlistID}" onclick="openDropdown('${playlistUID}${playlistID}Dropdown')" class="btn b-4 playlistDropdownButton iconButton dropdownButton"><i class="bx bx-dots-vertical-rounded"></i></button>
            <div id="${playlistUID}${playlistID}Dropdown" class="dropdown-content">
              <a id="editorPlaylistButton${playlistUID}${playlistID}" class="btn">Editor</a>
              <a onclick="openReviews('${playlistUID}', '${playlistID}')" id="reviewsPlaylistButton${playlistUID}${playlistID}" class="btn">Reviews</a>
              <a onclick="openSharing('${playlistUID}', '${playlistID}')" class="btn">Sharing</a>
              <div class="dropdownDivider"></div>
              <a id="renamePlaylistButton${playlistUID}${playlistID}" class="btn">Rename</a>
              <a id="deletePlaylistButton${playlistUID}${playlistID}" class="btn btnDanger">Delete</a>
              <div class="dropdownDivider"></div>
              <a onclick="recalculateDetails('${playlistUID}', '${playlistID}')" class="btn">Reclculate Metadata</a>
              <a onclick="copyToClipboard('https://parallel.r0h.in/preview?playlistUID=${playlistUID}&playlistID=${playlistID}')" class="btn">Copy Link</a>
              <a onclick="copyToClipboard('${playlistID}')" class="btn">Copy ID</a>
            </div>
          </div>
          <p id="${playlistUID}${playlistID}contentEditable" class="playlistDescription" spellcheck="false" contenteditable="plaintext-only"></p>
        </div>
        <div id="${playlistUID}${playlistID}playlistDetailsTwo" class="playlistDetails playlistDetailsTwo hidden">
          <h2 class="playlistTitle animated fadeInUp">Playlist Editor</h2>
          <p>Click a track to select it.</p>
          <button id="exitEditorPlaylistButton${playlistUID}${playlistID}" class="btn b-1"> <i class='bx bx-arrow-back'></i> Exit </button>
        </div>
      </div>
      <div class="hr"></div>
      <div class="musicViewContent">
        <div class="notice hidden animated fadeIn" id="${playlistUID}${playlistID}noTrackNotice">No tracks added to this playlist.</div>
        <div class="tracksContainer" id="${playlistUID}${playlistID}playlistViewTracksContainer"></div>

        <div class="editModeToolbarContainer">
          <div class="editModeToolbar animated hidden" id="${playlistUID}${playlistID}EditToolbar">
            <button id="${playlistUID}${playlistID}CopyButton" class="btn b-3 roundedButton playlistButtonContext acceptLeftClick"><i class="bx bx-copy"></i></button>
            <button id="${playlistUID}${playlistID}TrashButton" class="btn b-3 roundedButton"><i class="bx bx-trash-alt"></i></button>
          </div>
        </div>

        <div class="form formLabelFix hidden animated fadeIn" id="playlistSearch${playlistUID}${playlistID}">
          <label for="${playlistUID}${playlistID}SongSearchInput" class="">Add to playlist:</label>
          <input autocomplete="off" text="text" id="${playlistUID}${playlistID}SongSearchInput"> 
        </div>

        <div id="${playlistUID}${playlistID}playlistTrackSearchResults" class="playlistTrackSearchResults animated fadeIn"></div>
        <p class="playlistSearchNoResults animated fadeIn hidden" id="${playlistUID}${playlistID}SearchResults">No results found.</p>

        <div id="${playlistUID}${playlistID}reviewSection" class="reviewSection animated fadeIn hidden">
          <div class="reviewSectionHeader">
            <b>Reviews</b>
            <div>
              <button id="${playlistUID}${playlistID}addReviewButton" class="btn b-0"><i class="bx bx-plus"></i></button>
              <button id="${playlistUID}${playlistID}refreshReviewButton" class="btn b-0"><i class="bx bx-refresh"></i></button>
              <button id="${playlistUID}${playlistID}sortReviewButton" mode="0" class="btn b-0">
                <i class="bx bx-sort"></i>
                <i class="bx bx-time"></i>
              </button>
            </div>
          </div>
          <div class="reviewSectionContent" id="${playlistUID}${playlistID}reviewSectionContent">
            <div class="noReviews hidden animated fadeIn" id="${playlistUID}${playlistID}reviewSectionContentNone">
              <i class="bx bx-file-blank"></i>
              <p>No reviews yet. Be the first to add one.</p>
            </div>
            <div class="reviewSectionContentContent" id="${playlistUID}${playlistID}reviewSectionContentContent"></div>
          </div>
        </div>
      </div>
    </div>
    <div></div>
  ` // Bottom div for cumulative playlist time maybe/
  
  $(`#musicTab_playlists`).get(0).appendChild(a);
  
  displayInputEffect();
  $(`#${playlistUID}${playlistID}SongSearchInput`).get(0).addEventListener('keyup', async (e) => {
    if (e.keyCode == 13) {
      const value = $(`#${playlistUID}${playlistID}SongSearchInput`).val();
      $(`#${playlistUID}${playlistID}SongSearchInput`).val('');
      if (value) {
        const search = await makeMusicRequest(`search?term=${encodeURIComponent(value)}&types=songs&limit=12`);
        $(`#${playlistUID}${playlistID}playlistTrackSearchResults`).empty();
        $(`#${playlistUID}${playlistID}SearchResults`).addClass('hidden');
        if (typeof(search.results) !== 'undefined' && typeof(search.results.songs) !== 'undefined' && typeof(search.results.songs.data) !== 'undefined') {
          for (let i = 0; i < search.results.songs.data.length; i++) {
            const track = search.results.songs.data[i];
            createTrack(track, `${playlistUID}${playlistID}playlistTrackSearchResults`, i, null, null, null, `addTrackToPlaylist('${playlistID}', '${track.id}')`);
          }
        }
        else {
          $(`#${playlistUID}${playlistID}SearchResults`).removeClass('hidden');
        }
      }
      else {
        $(`#${playlistUID}${playlistID}playlistTrackSearchResults`).empty();
      }
    }
  })

  $(`#${playlistUID}${playlistID}PlayTrackButton`).get(0).onclick = () => {
    playTrack(null, `${playlistUID}${playlistID}playlistViewTracksContainer`, 0);
  }

  $(`#${playlistUID}${playlistID}ShuffleTrackButton`).get(0).onclick = () => {
    playTrack(null, `${playlistUID}${playlistID}playlistViewTracksContainer`, 0, true);
  }

  $(`#${playlistUID}${playlistID}contentEditable`).get(0).addEventListener("focusout", async () => {
    const newDescription = messageHTMLtoText(null, $(`#${playlistUID}${playlistID}contentEditable`).get(0));
    if (newDescription !== 'No description. Click here to set one.') {
      if (newDescription.length > 500) {
        snac('Playlist Description Error', 'The description must be 500 characters or less. Your changes were not saved.', 'error');
        return;
      }
      await updateDoc(doc(db, `users/${playlistUID}/playlists/${playlistID}`), {
        description: newDescription,
        dateModified: serverTimestamp(),
      });
      snac('Playlist Description Updated', 'Your changes were saved.', 'success');
    }
  }, false);

  // Onclicks

  $(`#${playlistUID}${playlistID}refreshReviewButton`).get(0).onclick = () => {
    // Disable button
    disableButton($(`#${playlistUID}${playlistID}refreshReviewButton`));
    refreshReviews(playlistUID, playlistID);
    window.setTimeout(() => {
      enableButton($(`#${playlistUID}${playlistID}refreshReviewButton`), `<i class="bx bx-refresh"></i>`);
    }, 1999);
  }

  $(`#${playlistUID}${playlistID}sortReviewButton`).get(0).onclick = () => {
    const mode = $(`#${playlistUID}${playlistID}sortReviewButton`).get(0).getAttribute('mode');

    if (mode === '0') {
      $(`#${playlistUID}${playlistID}sortReviewButton`).get(0).setAttribute('mode', '1');
      $(`#${playlistUID}${playlistID}sortReviewButton`).get(0).innerHTML = `
        <i class="bx bx-sort"></i>
        <i class="bx bx-time-five"></i>
      `;

      // Sort all elements in container
      $(`#${playlistUID}${playlistID}reviewSectionContentContent`).find('.review').sort(function(a, b) {
        return +b.getAttribute('ts') - +a.getAttribute('ts');
      }).appendTo($(`#${playlistUID}${playlistID}reviewSectionContentContent`));
    }
    else {
      $(`#${playlistUID}${playlistID}sortReviewButton`).get(0).setAttribute('mode', '0');
      $(`#${playlistUID}${playlistID}sortReviewButton`).get(0).innerHTML = `
        <i class="bx bx-sort"></i>
        <i class="bx bx-time"></i>
      `;

      // Sort all elements in container
      $(`#${playlistUID}${playlistID}reviewSectionContentContent`).find('.review').sort(function(a, b) {
        return +a.getAttribute('ts') - +b.getAttribute('ts');
      }).appendTo($(`#${playlistUID}${playlistID}reviewSectionContentContent`));
    }
  }

  tippy($(`#${playlistUID}${playlistID}PlayTrackButton`).get(0), {
    content: 'Play',
    placement: 'top',
  });

  tippy($(`#${playlistUID}${playlistID}ShuffleTrackButton`).get(0), {
    content: 'Shuffle',
    placement: 'top',
  });

  tippy($(`#${playlistUID}${playlistID}refreshReviewButton`).get(0), {
    content: 'Refresh',
    placement: 'top',
  });

  tippy($(`#${playlistUID}${playlistID}sortReviewButton`).get(0), {
    content: 'Toggle Sort Direction',
    placement: 'top',
  });

  tippy($(`#Playlist${playlistUID}${playlistID}Close`).get(0), {
    content: 'Close',
    placement: 'top',
  });

  tippy($(`#${playlistUID}${playlistID}CopyButton`).get(0), {
    content: 'Copy to Playlist',
    placement: 'top',
  });

  tippy($(`#${playlistUID}${playlistID}TrashButton`).get(0), {
    content: 'Remove Tracks',
    placement: 'top',
  });

  $(`#${playlistUID}${playlistID}CopyButton`).get(0).onclick = () => {
    editorModeCopy(playlistID);
  }

  $(`#${playlistUID}${playlistID}TrashButton`).get(0).onclick = () => {
    editorModeTrash(playlistID);
  }

  $(`#deletePlaylistButton${playlistUID}${playlistID}`).get(0).onclick = () => { 
    prepareDeletePlaylist(playlistID, playlistName, folderContext);
  }

  $(`#renamePlaylistButton${playlistUID}${playlistID}`).get(0).onclick = () => {
    prepareRenamePlaylist(playlistID);
  }

  $(`#editorPlaylistButton${playlistUID}${playlistID}`).get(0).onclick = () => {
    openEditorModePlaylist(playlistID);
  }

  $(`#exitEditorPlaylistButton${playlistUID}${playlistID}`).get(0).onclick = () => {
    exitEditorModePlaylist(playlistID);
  }

  // Sortable
  Sortable.create($(`#${playlistUID}${playlistID}playlistViewTracksContainer`).get(0), {
    ghostClass: 'sortableGhost',
    onEnd: async (e) => {
      const element = e.item;
      const oldIndex = e.oldIndex;
      const newIndex = e.newIndex;

      if (oldIndex == newIndex) {
        return;
      }

      managePlaylistOrder(playlistUID, playlistID)

      console.log(`Performed sort from ${oldIndex} to ${newIndex}`)
    }
  });

  addPlaylistListeners(playlistUID, playlistID, fromLibrary);
}

window.prepareSetTrackIndexByInput = (playlistUID, playlistID, oldIndex) => {
  openModal('reorderPlaylist');
  
  $('#newPlaylistIndex').get(0).addEventListener("keyup", function(event) {
    if (event.keyCode === 13) { event.preventDefault(); $('#newIndexCreateButton').get(0).click(); }
  });

  $(`#newIndexCreateButton`).get(0).onclick = () => {
    const newIndex = $(`#newPlaylistIndex`).val();
    closeModal();
    $(`#newPlaylistIndex`).val('');
    setTrackIndexByInput(user.uid, playlistID, oldIndex, newIndex);
  }
}

async function setTrackIndexByInput(playlistUID, playlistID, oldIndex, newIndex) {
  if (newIndex.includes('-')) {
    snac('Invalid Index', 'You must submit a positive integer as the updated index', 'danger');
  }
  if (!parseInt(newIndex)) {
    snac('Invalid Index', 'You must submit a positive integer as the updated index', 'danger');
    return;
  }

  $(`#${playlistUID}${playlistID}playlistViewTracksContainer`).children('.music-track').eq(oldIndex).insertIndex((parseInt(newIndex) - 1));

  managePlaylistOrder(playlistUID, playlistID);
}

async function managePlaylistOrder(playlistUID, playlistID) {
  const children = $(`#${playlistUID}${playlistID}playlistViewTracksContainer`).children('.music-track');

  let updatedTracks = [];
  children.each((index, object) => {
    const trackID = object.getAttribute('trackID');
    const randomID = object.getAttribute('playlistRandomID'); 
    updatedTracks.push({
      trackID: `${trackID}`,
      randomID: `${randomID}`,
    })
  })

  await updateDoc(doc(db, `users/${user.uid}/playlists/${playlistID}`), {
    tracks: updatedTracks,
    dateModified: serverTimestamp(),
  });
}

window.setPlaylistImage = (playlistUID, playlistID) => {
  $('#NewPlaylistIconInput').off();

  $('#NewPlaylistIconInput').change(async () => {
    if (!document.getElementById("NewPlaylistIconInput").files.length) {
      snac('Error', 'Contact support or try again.', 'danger');
      return;
    }

    const fileInput = document.getElementById("NewPlaylistIconInput").files[0];
    document.getElementById("NewPlaylistIconInput").value = '';
    const file = await getCroppedPhoto(fileInput);
    const ext = file.name.split(".").pop();

    if (file.size > (12 * 1000000)) {
      snac(`File Size Error`, `Your file, ${file.name}, is too large. There is a 12MB limit on playlist covers.`, 'danger');
      return;
    }

    showUploadProgress();
    
    const uploadTask = uploadBytesResumable(storageRef(storage, `playlists/${playlistUID}/${playlistID}/icon.${ext}`), file)

    uploadTask.on('state_changed', (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      $('#uploadProgressNumber').html(`Upload Progress: ${progress.toFixed(0)}%`);
    });

    uploadTask.then(async () => {
      hideUploadProgress();
      snac('Upload Success', 'Your playlist icon is being processed.', 'success')
      if (ext === 'png') {
        await updateDoc(doc(db, `users/${playlistUID}/playlists/${playlistID}`), {
          imageURL: `https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/playlists%2F${playlistUID}%2F${playlistID}%2Ficon.png?alt=media&ts=${new Date().getTime()}`,
          dateModified: serverTimestamp(),
        });
      }
    });
  });

  $('#NewPlaylistIconInput').click();
}

window.removePlaylistImage = async (playlistUID, playlistID) => {
  await updateDoc(doc(db, `users/${playlistUID}/playlists/${playlistID}`), {
    imageURL: '',
    dateModified: serverTimestamp(),
  });
}

async function addPlaylistListeners(playlistUID, playlistID, fromLibrary) {
  try { await playlistListener() } catch(e) { };

  $(`#Playlist${playlistUID}${playlistID}Close`).addClass('hidden');
  if (!fromLibrary) {
    $(`#Playlist${playlistUID}${playlistID}Close`).removeClass('hidden');
  }

  $(`#${playlistUID}${playlistID}playlistTrackSearchResults`).empty();
  $(`#${playlistUID}${playlistID}playlistViewTracksContainer`).html(`
    <div class="notice fetchingTracksNotice animated fadeIn hidden" id="${playlistUID}${playlistID}waitingNotice">Fetching tracks...</div>
  `); // Clear the tracks container.
  
  cachePlaylistData[playlistUID + playlistID] = [];

  playlistListener = onSnapshot(doc(db, `users/${playlistUID}/playlists/${playlistID}`), async (doc) => {
    if (!doc.exists()) {
      return;
    }
    if (!doc.data().dateModified) { // Recieved two updates. One is date upload, one is date confirm.
      return; // Ignore if initial upload event. Only update on final.
    }

    $(`#${playlistUID}${playlistID}playlistTitle`).get(0).onclick = () => {
      prepareRenamePlaylist(playlistID);
    }
    $(`#${playlistUID}${playlistID}playlistTitle`).html(securityConfirmTextIDs(doc.data().title, true)); // Playlist title
    twemoji.parse($(`#${playlistUID}${playlistID}playlistTitle`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });

    $(`#${playlistUID}${playlistID}contentEditable`).html(securityConfirmText(doc.data().description || "No description. Click here to set one."));
    twemoji.parse($(`#${playlistUID}${playlistID}contentEditable`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });

    if (playlistDataImages[playlistUID + playlistID] !== doc.data().imageURL) {
      if (doc.data().imageURL) {
        $(`#${playlistUID}${playlistID}playlistViewImage`).html(`<img class="invisible" id="${playlistUID}${playlistID}playlistViewImageElement" src="${doc.data().imageURL}"/><button onclick="setPlaylistImage('${playlistUID}', '${playlistID}')" class="btn playlistCoverButton playlistCoverEdit"><i class="bx bx-pencil"></i></button><button onclick="removePlaylistImage('${playlistUID}', '${playlistID}')" class="btn playlistCoverButton playlistCoverRemove"><i class="bx bx-x"></i></button>`);
        displayImageAnimation(`${playlistUID}${playlistID}playlistViewImageElement`);
      }
      else {
        $(`#${playlistUID}${playlistID}playlistViewImage`).html(`<button onclick="setPlaylistImage('${playlistUID}', '${playlistID}')" class="btn playlistCoverButton playlistCoverEdit"><i class="bx bx-upload"></i></button><i class="missingIconIcon bx bxs-playlist"></i>`);
      }
    }

    playlistDataImages[playlistUID + playlistID] = doc.data().imageURL;
    
    let lengthString = '';
    if (doc.data().totalDuration) {
      const hours = Math.floor((Math.floor(doc.data().totalDuration / 1000)) / 3600);
      const minutes = Math.floor((Math.floor(doc.data().totalDuration / 1000)) % 3600 / 60);
      const seconds = Math.floor((Math.floor(doc.data().totalDuration / 1000)) % 3600 % 60);
      lengthString = `<span class="playlistDetailsSeparator"><i class="bx bxs-circle"></i></span> ${hours}h ${minutes}m ${seconds}s`;
    }

    const modifiedDate = doc.data().dateModified.toDate();

    let cloneText = '';
    if (doc.data().clone) {
      if (doc.data().clonedMultiple) {
        cloneText = `<span onclick="openUserCard('${doc.data().creator.split('.')[0]}')" class="playlistCreator">${doc.data().creator.split('.')[1].capitalize()}</span>, <span onclick="openUserCard('${doc.data().clone.split('.')[0]}')" class="playlistCreator">${doc.data().clone.split('.')[1].capitalize()}</span>, and <span class="playlistCreator noHighlight">several others</span>`;
      }
      else {
        cloneText = `<span onclick="openUserCard('${doc.data().creator.split('.')[0]}')" class="playlistCreator">${doc.data().creator.split('.')[1].capitalize()}</span> ${doc.data().clone ? `and <span onclick="openUserCard('${doc.data().clone.split('.')[0]}')" class="playlistCreator">${doc.data().clone.split('.')[1].capitalize()}</span>` : ""}`
      }
    }
    else {
      cloneText = `<span onclick="openUserCard('${doc.data().creator.split('.')[0]}')" class="playlistCreator">${doc.data().creator.split('.')[1].capitalize()}</span>`
    }

    let lockText = '';
    if (doc.data().sharing && doc.data().sharing == 'none') {
      lockText = `<span class="playlistDetailsSeparator"><i class="bx bxs-circle"></i></span> <i onclick="openSharing('${playlistUID}', '${playlistID}')" class="bx bx-lock-alt clickableIcon"></i>`;
    }

    $(`#${playlistUID}${playlistID}playlistDetailsLine`).html(`By ${cloneText} <span class="playlistDetailsSeparator"><i class="bx bxs-circle"></i></span> Updated ${timeago.format(modifiedDate)} <span class="playlistDetailsSeparator"><i class="bx bxs-circle"></i></span> ${doc.data().tracks.length} Track${doc.data().tracks.length == 1 ? "" : "s"} ${lengthString}${lockText}`);
    
    // Tracks Rendering (Feb 9, 2022): 250 batches, paginatated.

    const tracks = doc.data().tracks || [];

    const arrayPlaylistForward = playlistArrayDifference(cachePlaylistData[playlistUID + playlistID] || [], tracks);
    const arrayPlaylistBackward = playlistArrayDifference(tracks, cachePlaylistData[playlistUID + playlistID] || []);
    
    if (arrayPlaylistForward.length) {
      $(`#${playlistUID}${playlistID}waitingNotice`).removeClass('hidden');
    }
    else {
      $(`#${playlistUID}${playlistID}waitingNotice`).addClass('hidden');
    }

    cachePlaylistData[playlistUID + playlistID] = doc.data().tracks
    playlistMetaData[playlistUID + playlistID] = doc.data();
    playlistMetaData[playlistUID + playlistID].tracks = []; // No need. Waste of space.

    reviewViewCheck(playlistUID, playlistID);

    const tempPlaylistForward = [...arrayPlaylistForward]

    if (arrayPlaylistForward.length) {
      let finalTracksArray = [];
      while (tempPlaylistForward.length) {
        finalTracksArray.push(tempPlaylistForward.splice(0, 250));
      }

      for (let i = 0; i < finalTracksArray.length; i++) {
        let trackIDs = [];
        for (let j = 0; j < finalTracksArray[i].length; j++) {
          trackIDs.push(finalTracksArray[i][j].trackID);
        }

        const data = await makeMusicRequest(`songs?ids=${trackIDs.join(',')}`);
        for (let j = 0; j < data.data.length; j++) {
          musicCatalogue[data.data[j].id] = data.data[j];
        }
      }
    }

    for (let i = 0; i < arrayPlaylistForward.length; i++) {
      createTrack(musicCatalogue[arrayPlaylistForward[i].trackID], `${playlistUID}${playlistID}playlistViewTracksContainer`, i, `${playlistUID}${playlistID}${arrayPlaylistForward[i].randomID}${arrayPlaylistForward[i].trackID}`, ["playlistUID", playlistUID, "playlistID", playlistID, "playlistRandomID", arrayPlaylistForward[i].randomID], false, false, arrayPlaylistForward[i].trackID);
    }

    for (let i = 0; i < arrayPlaylistBackward.length; i++) {
      $(`#${playlistUID}${playlistID}${arrayPlaylistBackward[i].randomID}${arrayPlaylistBackward[i].trackID}`).addClass('music-track-gone');
      window.setTimeout(() => {
        $(`#${playlistUID}${playlistID}${arrayPlaylistBackward[i].randomID}${arrayPlaylistBackward[i].trackID}`).remove();
      }, 550);
    }

    if (arrayPlaylistBackward || arrayPlaylistForward) {
      updatePlaylistIndexes(playlistID);
    }

    $(`#${playlistUID}${playlistID}waitingNotice`).addClass('hidden');

    $(`#${playlistUID}${playlistID}noTrackNotice`).addClass('hidden');
    if (!tracks.length) {
      $(`#${playlistUID}${playlistID}noTrackNotice`).removeClass('hidden');
    }

    // Don't deal with playlist ORDER.
    $(`#playlistSearch${playlistUID}${playlistID}`).removeClass('hidden');
  });

  refreshReviews(playlistUID, playlistID);
}

export function reviewViewCheck(playlistUID, playlistID) {
  // Check playlist review settings.
  $(`#${playlistUID}${playlistID}addReviewButton`).removeClass('disabled');
  $(`#${playlistUID}${playlistID}reviewSection`).removeClass('hidden');

  if (playlistMetaData[playlistUID + playlistID].reviews == 'none') {
    $(`#${playlistUID}${playlistID}reviewSection`).addClass('hidden');
  }

  if (playlistUID !== user.uid) {
    if (playlistMetaData[playlistUID + playlistID].reviews == 'friends') {
      if (!(cacheUser.friends.some(e => e.u === playlistUID))) {
        $(`#${playlistUID}${playlistID}addReviewButton`).addClass('disabled')
      }
    }
  }
  else { // Cant review self
    $(`#${playlistUID}${playlistID}addReviewButton`).addClass('disabled')
  }
}

function editReview(playlistUID, playlistID, reviewText) {
  openModal('reviewEdit');
  $('#reviewEditTextarea').val(reviewText);
  $('#confirmReviewEdit').get(0).onclick = async () => {
    closeModal();

    const reviewText = $('#reviewEditTextarea').val();

    if (reviewText.length < 10) {
      snac('Review Error', 'Reviews must be at least 10 characters long.', 'danger');
      return;
    }

    if (reviewText.length > 3000) {
      copyToClipboard(reviewText, true);
      snac('Review Error', 'Reviews cannot be longer than 3000 characters. Your review draft was copied to your clipboard.', 'danger');
      return;
    }

    notifyTiny('Processing review...');

    const editReviewFunc = httpsCallable(functions, 'editReview');
    const result = await editReviewFunc({
      playlistUID: playlistUID,
      playlistID: playlistID,
      reviewText: $('#reviewEditTextarea').val(),
    });

    if (result.data.data == true) {
      snac('Review Updated', 'Your review was edited successfully.', 'success');
      $(`#${playlistUID}${playlistID}${user.uid}ReviewText`).html(reviewText);

      $(`#${playlistUID}${playlistID}editReviewButton`).get(0).onclick = () => {
        editReview(playlistUID, playlistID, reviewText)
      }
    }
    else {
      copyToClipboard(reviewText, true);
      console.log(reviewText);
      snac('Review Error', `${result.data.data} Your review draft was copied to your clipboard.`, 'danger');
    }
  };
}

export async function loadReviews(playlistUID, playlistID) {
  getDoc(doc(db, `users/${playlistUID}/playlists/${playlistID}/views/reviews`)).then(async (doc) => {
    $(`#${playlistUID}${playlistID}reviewSection`).removeClass('hidden');
    $(`#${playlistUID}${playlistID}reviewSectionContentNone`).addClass('hidden');

    $(`#${playlistUID}${playlistID}addReviewButton`).removeClass('hidden');
    $(`#${playlistUID}${playlistID}removeReviewButton`).addClass('hidden');
    $(`#${playlistUID}${playlistID}editReviewButton`).addClass('hidden');

    console.log(doc.data())

    if (!doc.exists() || !Object.keys(doc.data()).length) {
      $(`#${playlistUID}${playlistID}reviewSectionContentNone`).removeClass('hidden');
    }
    else {
      if (doc.data()[user.uid] && Object.keys(doc.data()[user.uid]).length) {
        $(`#${playlistUID}${playlistID}addReviewButton`).addClass('hidden');
        $(`#${playlistUID}${playlistID}removeReviewButton`).removeClass('hidden');
        $(`#${playlistUID}${playlistID}editReviewButton`).removeClass('hidden');

        $(`#${playlistUID}${playlistID}editReviewButton`).get(0).onclick = () => {
          editReview(playlistUID, playlistID, doc.data()[user.uid]['text'])
        }

        $(`#${playlistUID}${playlistID}removeReviewButton`).get(0).onclick = () => {
          removeOwnReview(playlistUID, playlistID);
        }
      }

      // Build the reviews now
      const reviews = Object.keys(doc.data());
      for (let i = 0; i < reviews.length; i++) {
        const review = doc.data()[reviews[i]];

        const a = document.createElement('div');
        a.classList.add('review');
        a.id = `${playlistUID}${playlistID}Review${review.uid}Container`;
        a.setAttribute('ts', review.timestamp);
        a.innerHTML = `
          <div class="review-header">
            <div class="review-header-left">
              <img onclick="openUserCard('${review.uid}')" id="${playlistUID}${playlistID}${review.uid}ReviewPhoto"></img>
              <div onclick="openUserCard('${review.uid}')" class="review-header-left-text">${review.username.capitalize()}</div>
            </div>
            <div class="review-header-right">
              <div class="review-header-right-text">
                <div class="review-header-right-text-name">Updated ${timeago.format(new Date(review.timestamp))}.</div>
              </div>
              <button id="${playlistUID}${playlistID}${review.uid}ReviewDelete" class="btn b-4 hidden"><i class="bx bx-trash"></i></button>
            </div>
          </div>
          <div class="review-content">
            <p id="${playlistUID}${playlistID}${review.uid}ReviewText">${review.text}</p>
          </div>
        `;
        $(`#${playlistUID}${playlistID}reviewSectionContentContent`).append(a);

        tippy($(`#${playlistUID}${playlistID}${review.uid}ReviewDelete`).get(0), {
          content: 'Delete Review',
          placement: 'top',
        });

        if (review.uid == user.uid) {
          $(`#${playlistUID}${playlistID}${review.uid}ReviewDelete`).removeClass('hidden');
          $(`#${playlistUID}${playlistID}${review.uid}ReviewDelete`).get(0).onclick = () => {
            removeOwnReview(playlistUID, playlistID);
          }
        }
        else if (playlistUID == user.uid) {
          $(`#${playlistUID}${playlistID}${review.uid}ReviewDelete`).removeClass('hidden');
          $(`#${playlistUID}${playlistID}${review.uid}ReviewDelete`).get(0).onclick = () => {
            removeReview(playlistUID, playlistID, review.uid);
          }
        }

        $(`#${playlistUID}${playlistID}${review.uid}ReviewPhoto`).get(0).src = await returnProperURL(review.uid);
        displayImageAnimation(`${playlistUID}${playlistID}${review.uid}ReviewPhoto`);
      }

      // Sort all elements in container
      $(`#${playlistUID}${playlistID}reviewSectionContentContent`).find('.review').sort(function(a, b) {
        return +a.getAttribute('ts') - +b.getAttribute('ts');
      }).appendTo($(`#${playlistUID}${playlistID}reviewSectionContentContent`));
    }
  });
}

function removeOwnReview(playlistUID, playlistID) {
  openModal('confirmDeleteReview');
  $('#reviewConfirmDelete').get(0).onclick = async () => {
    closeModal();
    disableButton($(`#${playlistUID}${playlistID}${user.uid}ReviewDelete`));
    notifyTiny('Deleting review...');

    const deleteReview = httpsCallable(functions, 'deleteReview');
    const result = await deleteReview({
      playlistUID: playlistUID,
      playlistID: playlistID,
    });
    
    if (result.data.data == true) {
      $(`#${playlistUID}${playlistID}addReviewButton`).removeClass('hidden')
      $(`#${playlistUID}${playlistID}editReviewButton`).addClass('hidden')
      $(`#${playlistUID}${playlistID}removeReviewButton`).addClass('hidden')
      
      snac('Review Deleted', 'Your review was deleted successfully.', 'success');
      $(`#${playlistUID}${playlistID}Review${user.uid}Container`).css('height', $(`#${playlistUID}${playlistID}Review${user.uid}Container`).height());
      window.setTimeout(() => {
        $(`#${playlistUID}${playlistID}Review${user.uid}Container`).addClass("reviewGone")
        window.setTimeout(() => {
          $(`#${playlistUID}${playlistID}Review${user.uid}Container`).remove();
        }, 999);
      }, 99);
    }
    else {
      snac('Review Error', `${result.data.data}`, 'danger');
    }
  };
}

async function updatePlaylistIndexes(playlistID) {
  // Update indexes
  const tracks = cachePlaylistData[`${user.uid}${playlistID}`] || [];
  for (let j = 0; j < tracks.length; j++) {
    $(`#music-track-icon-${user.uid}${playlistID}${tracks[j].randomID}${tracks[j].trackID}`).html(j+1);
    if ($(`#${user.uid}${playlistID}${tracks[j].randomID}${tracks[j].trackID}`).hasClass("music-track")) {
      if (editorModePlaylist !== playlistID) {
        $(`#${user.uid}${playlistID}${tracks[j].randomID}${tracks[j].trackID}`).get(0).onclick = () => {
          playTrack(tracks[j].trackID, `${user.uid}${playlistID}playlistViewTracksContainer`, j);
        }
      }
      $(`#music-track-icon-${user.uid}${playlistID}${tracks[j].randomID}${tracks[j].trackID}`).get(0).onclick = () => {
        prepareSetTrackIndexByInput(user.uid, playlistID, j);
      }
    }
  }
}

window.addTrackToPlaylist = (playlistID, trackID, skipNotify) => {
  return new Promise(async (resolve, reject) => {
    const playlistDoc = await getDoc(doc(db, `users/${user.uid}/playlists/${playlistID}`));

    if (checkValidSubscription(cacheUser.subscription)) {
      if (playlistDoc.data().tracks && playlistDoc.data().tracks.length >= 900) {
        snac('Track Limit', 'You have reached the maximum playlist length.', 'danger');
        return;
      }
    }
    else {
      if (playlistDoc.data().tracks && playlistDoc.data().tracks.length >= 400) {
        snac('Track Limit', 'You have reached the maximum playlist length. Upgrade to Parallel Infinite to add 500 more.', 'danger');
        return;
      }
    }

    const track = await makeMusicRequest(`songs/${trackID}`);

    updateDoc(doc(db, `users/${user.uid}/playlists/${playlistID}`), {
        tracks: arrayUnion({
          trackID: `${trackID}`,
          randomID: `${new Date().getTime()}`
        }),
        dateModified: serverTimestamp(),
        totalDuration: increment(track.data[0].attributes.durationInMillis)
    });

    if (!skipNotify) {
      notifyTiny(`Track added.`, true);
    }

    resolve(true);
  });
}

export async function removeTrackFromPlaylist(playlistID, trackID, randomID) {
  const track = await makeMusicRequest(`songs/${trackID}`);
  await updateDoc(doc(db, `users/${user.uid}/playlists/${playlistID}`), {
    tracks: arrayRemove({
      randomID: `${randomID}`,
      trackID: `${trackID}`,
    }, {
      randomID: parseInt(randomID),
      trackID: `${trackID}`, 
    }),
    dateModified: serverTimestamp(),
    totalDuration: increment((track.data ? -track.data[0].attributes.durationInMillis : 0))
  }); 
}

window.removeBrokenTrackFromPlaylist = (playlistID, trackID, randomID) => {
  // Function imports on components will break app!
  removeTrackFromPlaylist(playlistID, trackID, randomID);
}

export function prepareRenamePlaylist(playlistID) {
  openModal('renamePlaylist');
  $('#renamePlaylistName').val('')
  $('#renamePlaylistName').get(0).addEventListener("keyup", function(event) {
    if (event.keyCode === 13) { event.preventDefault(); $('#renamePlaylistButton').get(0).click(); }
  });
  $('#renamePlaylistButton').get(0).onclick = () => renamePlaylistConfirm(`${playlistID}`);
}

export function prepareRenameFolder(folderID, folderName) {
  openModal('renameFolder');
  $('#renameFolderName').val('')
  $('#renameFolderName').get(0).addEventListener("keyup", function(event) {
    if (event.keyCode === 13) { event.preventDefault(); $('#renameFolderButton').get(0).click(); }
  });
  $('#renameFolderButton').get(0).onclick = () => renameFolderConfirm(`${folderID}`, `${folderName}`);
}

async function renameFolderConfirm(folderID, folderName) {
  const newFolderName = securityConfirmTextIDs($('#renameFolderName').val(), true).trim();

  if (newFolderName.length > 48) {
    snac('Invalid Folder Title', `Your folder's title cannot be more than 48 characters.`, 'danger');
    return;
  }

  if (!newFolderName.length) {
    snac('Invalid Folder Title', `Your folder's title cannot be empty.`, 'danger');
    return;
  }

  closeModal();

  // Cache data in the folder
  const cacheFolderData = cacheUser.playlistFolders[`${folderName}<${folderID}`];

  await deletePlaylistFolder(folderID, folderName, true);

  await updateDoc(doc(db, `users/${user.uid}`), {
    [`playlistFolders.${newFolderName}<${folderID}`]: cacheFolderData
  });

  window.setTimeout(() => {
    if ($(`#playlistFolderContent${folderID}`).hasClass('playlistFolderContentActive')) {
      $(`#chevron${folderID}`).removeClass('bx-chevron-down');
      $(`#chevron${folderID}`).addClass('bx-chevron-up');
      $(`#folder${folderID}`).addClass('folderFolderIconActive');
      $(`#folder${folderID}`).removeClass('bx-folder');
      $(`#folder${folderID}`).addClass('bx-folder-open');
    }
  }, 499);
}

async function renamePlaylistConfirm(playlistID) {
  const playlistName = securityConfirmTextIDs($('#renamePlaylistName').val(), true).trim();
  
  if (playlistName.length > 48) {
    snac('Invalid Playlist Title', `Your playlist's title cannot be more than 48 characters.`, 'danger');
    return;
  }

  if (!playlistName.length) {
    snac('Invalid Playlist Title', `Your playlist's title cannot be empty.`, 'danger');
    return;
  }
  
  closeModal();

  await updateDoc(doc(db, `users/${user.uid}/playlists/${playlistID}`), {
    title: playlistName,
    dateModified: serverTimestamp(),
  });

  await runTransaction(db, async (transaction) => {
    const sfDoc = await transaction.get(doc(db, `users/${user.uid}`));

    let newPlaylistList = [];

    for (let i = 0; i < sfDoc.data().playlists.length; i++) {
      const playlist = sfDoc.data().playlists[i].split('.');
      let playlistUID = user.uid;
      let playlistIDSearch = playlist[0];
      let playlistNameOld = playlist[1];

      if (playlist.length == 3) {
        playlistUID = playlist[0];
        playlistIDSearch = playlist[1];
        playlistNameOld = playlist[2];
      }

      if (playlistIDSearch == `${playlistID}`) {
        newPlaylistList.push(`${playlistUID}.${playlistIDSearch}.${playlistName}`);
      }
      else {
        newPlaylistList.push(sfDoc.data().playlists[i]);
      }
    }

    transaction.update(doc(db, `users/${user.uid}`), {
      playlists: newPlaylistList,
    });
  });

  console.log('transaction update success.');
}

export function prepareDeletePlaylist(playlistID, playlistNameInput, folderContext) {
  let playlistName = playlistNameInput;
  if (!playlistNameInput) {
    for (let i = 0; i < cacheUser.playlists.length; i++) {
      const playlistSplit = cacheUser.playlists[i].split('.');
      let playlistIDSearch = playlistSplit[0];
      let playlistNameSearch = playlistSplit[1];
      if (playlistSplit.length == 3) { // New playlist format.
        playlistIDSearch = playlistSplit[1];
        playlistNameSearch = playlistSplit[2];
      }

      if (playlistID == playlistIDSearch) {
        playlistName = playlistNameSearch;
      }
    }
  }

  openModal('deletePlaylist');
  $('#playlistConfirmDelete').get(0).onclick = () => deletePlaylist(playlistID, playlistName, folderContext);
}

export function prepareRemovePlaylistFromLibrary(playlistUID, playlistID, playlistNameInput, folderContext) {
  let playlistName = playlistNameInput;
  if (!playlistNameInput) {
    for (let i = 0; i < cacheUser.playlists.length; i++) {
      const playlistSplit = cacheUser.playlists[i].split('.');
      let playlistIDSearch = playlistSplit[0];
      let playlistNameSearch = playlistSplit[1];
      if (playlistSplit.length == 3) { // New playlist format.
        playlistIDSearch = playlistSplit[1];
        playlistNameSearch = playlistSplit[2];
      }

      if (playlistID == playlistIDSearch) {
        playlistName = playlistNameSearch;
      }
    }
  }

  openModal('removePlaylistFromLibrary');
  $('#playlistConfirmRemove').get(0).onclick = () => removePlaylistFromLibrary(playlistUID, playlistID, playlistName, folderContext);
}

async function deletePlaylist(playlistID, playlistName, folderContext) {
  closeModal();

  if (folderContext) {
    await updateDoc(doc(db, `users/${user.uid}`), {
      playlists: arrayRemove(`${playlistID}.${playlistName}`, `${user.uid}.${playlistID}.${playlistName}`),
      [`playlistFolders.${folderContext}`]: arrayRemove(playlistID),
      playlistCount: increment(-1),
    });

    const folderID = folderContext.split('<')[1];
    if ($(`#playlistFolderContent${folderID}`).hasClass('playlistFolderContentActive')) {
      const oldHeight = $(`#playlistFolderContent${folderID}`).css('height').split('px')[0]; 
      $(`#playlistFolderContent${folderID}`).css('height', `${parseInt(oldHeight) - 16 - 8 - 8 - 12}px`);
    }
  }
  else {
    await updateDoc(doc(db, `users/${user.uid}`), {
      playlists: arrayRemove(`${playlistID}.${playlistName}`, `${user.uid}.${playlistID}.${playlistName}`),
      playlistCount: increment(-1)
    });
  }
  
  await deleteDoc(doc(db, `users/${user.uid}/playlists/${playlistID}`));

  snac('Playlist Deleted', '', 'danger');
}

function playlistsDrop(ev, playlistID) {
  const trackID = ev.dataTransfer.getData("targetTrackID");
  if (!trackID) { return }

  addTrackToPlaylist(playlistID, trackID, false);
}

async function foldersDrop(ev, folderID, folderName) {
  console.log("Folders drop:", ev, folderID, folderName);
  const playlistUID = ev.dataTransfer.getData("targetPlaylistUID");
  const playlistID = ev.dataTransfer.getData("targetPlaylistID");
  const folderKey = ev.dataTransfer.getData("targetFolderKey");
  if (!playlistUID || !playlistID) { return }

  console.log(folderKey, `${folderName}<${folderID}`);

  if (folderKey == `${folderName}<${folderID}`) {
    // Dropping playlist item onto same folder.
    // Probably only a sort.
    return;
  }

  if (folderKey) {
    await removePlaylistFromFolder(folderKey, playlistUID, playlistID);
  }

  addPlaylistToFolder(folderID, folderName, playlistUID, playlistID);
}

$(`#musicSidebarPlaylistsPlaylists`).get(0).ondrop = async (ev) => {
  const playlistUID = ev.dataTransfer.getData("targetPlaylistUID");
  const playlistID = ev.dataTransfer.getData("targetPlaylistID");
  const folderKey = ev.dataTransfer.getData("targetFolderKey");

  if (!playlistUID || !playlistID) { return }

  if (folderKey) {
    await removePlaylistFromFolder(folderKey, playlistUID, playlistID);
  }
} 

export function addAlbumToPlaylist(playlistID, albumID) {
  return new Promise(async (resolve, reject) => {
    
    // Get tracks.
    const albumDetails = await makeMusicRequest(`albums/${albumID}`);

    let tracks = [];
    let cumulativeDuration = 0;

    const trackList = albumDetails.data[0].relationships.tracks.data;
    for (let i = 0; i < trackList.length; i++) {
      if (trackList[i].type == 'music-videos') { continue };
      const trackID = trackList[i].id;
      tracks.push({
        trackID: `${trackID}`,
        randomID: `${new Date().getTime()}`
      });
      cumulativeDuration += trackList[i].attributes.durationInMillis;
    }

    updateDoc(doc(db, `users/${user.uid}/playlists/${playlistID}`), {
      tracks: arrayUnion(...tracks),
      dateModified: serverTimestamp(),
      totalDuration: increment(cumulativeDuration)
    });

    snac(`Album Added`, `"${albumDetails.data[0].attributes.name}" has been added to your playlist.`, 'success');
    resolve(true);
  });
}

window.openReviews = (playlistUID, playlistID) => {
  openModal('updateReviews');

  switch (playlistMetaData[`${playlistUID}${playlistID}`].reviews) {
    case 'everyone':
      $(`#playlistReviewsCheckOne`).get(0).checked = true;
      break;
    case 'friends':
      $(`#playlistReviewsCheckTwo`).get(0).checked = true;
      break;
    case 'none':
      $(`#playlistReviewsCheckThree`).get(0).checked = true;
      break;
    default:
      $(`#playlistReviewsCheckOne`).get(0).checked = true;
      break;
  }

  $(`#savePlaylistReviews`).get(0).onclick = async () => {
    const isEveryone = $(`#playlistReviewsCheckOne`).get(0).checked;
    const isFriends = $(`#playlistReviewsCheckTwo`).get(0).checked;
    const isNone = $(`#playlistReviewsCheckThree`).get(0).checked;

    if (!isEveryone && !isFriends && !isNone) {
      snac('Reviews Error', 'You must select an option.', 'danger');
      return;
    }

    closeModal();

    if (isEveryone) {
      await updateDoc(doc(db, `users/${user.uid}/playlists/${playlistID}`), {
        reviews: 'everyone'
      });
    }
    else if (isFriends) {
      await updateDoc(doc(db, `users/${user.uid}/playlists/${playlistID}`), {
        reviews: 'friends'
      });
    }
    else if (isNone) {
      await updateDoc(doc(db, `users/${user.uid}/playlists/${playlistID}`), {
        reviews: 'none'
      });
    }
  
    snac('Review Policy Updated', 'Your playlist review settings has been updated.', 'success');
  }
}

window.openSharing = (playlistUID, playlistID) => {
  openModal('updateSharing');

  $(`#copyLinkPlaylistButton`).get(0).onclick = () => {
    copyToClipboard(`https://parallelsocial.net/preview?playlistUID=${playlistUID}&playlistID=${playlistID}`);
  }

  $(`#ifEveryone`).addClass('hidden');
  switch (playlistMetaData[`${playlistUID}${playlistID}`].sharing) {
    case 'everyone':
      $(`#playlistSharingCheckOne`).get(0).checked = true;
      $(`#ifEveryone`).removeClass('hidden');
      break;
    case 'friends':
      $(`#playlistSharingCheckTwo`).get(0).checked = true;
      break;
    case 'none':
      $(`#playlistSharingCheckThree`).get(0).checked = true;
      break;
    default:
      $(`#ifEveryone`).removeClass('hidden');
      $(`#playlistSharingCheckOne`).get(0).checked = true;
      break;
  }
  
  $(`#savePlaylistSharing`).get(0).onclick = async () => {
    const isEveryone = $(`#playlistSharingCheckOne`).get(0).checked;
    const isFriends = $(`#playlistSharingCheckTwo`).get(0).checked;
    const isNone = $(`#playlistSharingCheckThree`).get(0).checked;

    if (!isEveryone && !isFriends && !isNone) {
      snac('Sharing Error', 'You must select an option.', 'danger');
      return;
    }

    closeModal();

    if (isEveryone) {
      await updateDoc(doc(db, `users/${user.uid}/playlists/${playlistID}`), {
        sharing: 'everyone'
      });
      await updateDoc(doc(db, `users/${user.uid}`), {
        hiddenPlaylists: arrayRemove(playlistID)
      });
    }
    else if (isFriends) {
      await updateDoc(doc(db, `users/${user.uid}/playlists/${playlistID}`), {
        sharing: 'friends'
      });
      await updateDoc(doc(db, `users/${user.uid}`), {
        hiddenPlaylists: arrayRemove(playlistID)
      });
    }
    else if (isNone) {
      await updateDoc(doc(db, `users/${user.uid}/playlists/${playlistID}`), {
        sharing: 'none'
      });
      await updateDoc(doc(db, `users/${user.uid}`), {
        hiddenPlaylists: arrayUnion(playlistID)
      });
    }
  
    snac('Sharing Updated', 'Your playlist sharing settings has been updated.', 'success');
  }
}

window.sharingSelectHandler = (skip) => {
  $(`.sharingCheckbox`).each(function(index, element) {
    if (element.id !== skip) {
      $(element).get(0).checked = false;
    }

    if (skip == 'playlistSharingCheckOne') {
      $(`#ifEveryone`).removeClass('hidden');
    }
    else {
      $(`#ifEveryone`).addClass('hidden');
    }
  });
}

window.reviewsSelectHandler = (skip) => {
  $(`.reviewsCheckbox`).each(function(index, element) {
    if (element.id !== skip) {
      $(element).get(0).checked = false;
    }
  });
}


window.recalculateDetails = async (playlistUID, playlistID) => {
  let duration = 0;
  for (let i = 0; i < cachePlaylistData[`${playlistUID}${playlistID}`].length; i++) {
    const track = cachePlaylistData[`${playlistUID}${playlistID}`][i];
    duration += musicCatalogue[track.trackID].attributes.durationInMillis;
  }

  await updateDoc(doc(db, `users/${playlistUID}/playlists/${playlistID}`), {
    totalDuration: duration
  });

  snac('Recalculated', 'Your playlist has been recalculated.', 'success');
}

function openEditorModePlaylist(playlistID) {
  window.clearTimeout(editorModeTimeouts[`${playlistID}`]);
  window.clearTimeout(editorModeTimeouts[`${playlistID}2`]);

  $(`#musicSidebar`).get(0).setAttribute('class', 'sidebarLeft animated fadeOutDown');
  editorModeTimeouts[`${playlistID}`] = window.setTimeout(() => {
    $(`#musicSidebar`).get(0).setAttribute('class', 'sidebarLeft hidden');
  }, 999);

  $(`#PlaylistView${user.uid}${playlistID}`).addClass('playlistEditorView');
  $(`#${user.uid}${playlistID}playlistDetailsOne`).removeClass('fadeIn');
  $(`#${user.uid}${playlistID}playlistDetailsOne`).addClass('animated');
  $(`#${user.uid}${playlistID}playlistDetailsOne`).addClass('fadeOut');
  $(`#playlistSearch${user.uid}${playlistID}`).addClass('fadeOut');
  $(`#playlistSearch${user.uid}${playlistID}`).removeClass('fadeIn');
  $(`#${user.uid}${playlistID}reviewSection`).addClass('hidden');
  $(`#${user.uid}${playlistID}playlistTrackSearchResults`).addClass('fadeOut');
  $(`#${user.uid}${playlistID}playlistTrackSearchResults`).removeClass('fadeIn');
  $(`#${user.uid}${playlistID}SearchResults`).addClass('fadeOut');
  $(`#${user.uid}${playlistID}SearchResults`).removeClass('fadeIn');
  editorModeTimeouts[`${playlistID}2`] = window.setTimeout(() => {
    $(`#${user.uid}${playlistID}playlistDetailsOne`).addClass('hidden');
    $(`#${user.uid}${playlistID}playlistDetailsTwo`).removeClass('hidden');
    $(`#${user.uid}${playlistID}playlistDetailsTwo`).removeClass('fadeOut');
    $(`#${user.uid}${playlistID}playlistDetailsTwo`).addClass('animated');
    $(`#${user.uid}${playlistID}playlistDetailsTwo`).addClass('fadeIn');
    $(`#playlistSearch${user.uid}${playlistID}`).addClass('hidden');
    $(`#${user.uid}${playlistID}playlistTrackSearchResults`).addClass('hidden');
    $(`#${user.uid}${playlistID}SearchResults`).addClass('hidden');
  }, 999);

  editorModePlaylist = `${playlistID}`;
  editorModeTracks.clear();
  editorLastSelected = null;

  $(`#editorModeInjection`).html(`
    #musicPlayback {
      left: calc(128px) !important;
      width: calc(100% - 128px - 48px) !important;
    }
  `)

  // Edit each track element.
  $(`#${user.uid}${playlistID}playlistViewTracksContainer`).children('.music-track').each((index, element) => {
    $(element).get(0).onclick = (event) => {
      editorSelectTrack(playlistID, $(element).get(0).getAttribute('trackID'), $(element).get(0).getAttribute('playlistRandomID'), event);
    }
  });
}

function editorSelectTrack(playlistID, trackID, randomID, ev) {
  $(`#${user.uid}${playlistID}${randomID}${trackID}`).toggleClass('selectedTrack');

  if ($(`#${user.uid}${playlistID}${randomID}${trackID}`).hasClass('selectedTrack')) {
    editorModeTracks.add({
      trackID: `${trackID}`,
      randomID: `${randomID}}`
    });
  }
  else {
    editorModeTracks.forEach((x) => {
      (x.trackID == trackID && x.randomID == randomID) ? editorModeTracks.delete(x) : x;
    });
  }

  if (editorLastSelected != null && ev && ev.shiftKey) {
    let low, high;
    const lastIndex = $(`#${user.uid}${playlistID}${editorLastSelected.split('.')[1]}${editorLastSelected.split('.')[0]}`).index() - 1;
    const currentIndex = $(`#${user.uid}${playlistID}${randomID}${trackID}`).index() - 1;

    if (lastIndex < currentIndex) {
      low = lastIndex;
      high = currentIndex;
    }
    else {
      low = currentIndex;
      high = lastIndex;
    }

    const children = $(`#${user.uid}${playlistID}playlistViewTracksContainer`).children('.music-track');
    const lastSelectedState = $(`#${user.uid}${playlistID}${editorLastSelected.split('.')[1]}${editorLastSelected.split('.')[0]}`).hasClass('selectedTrack');

    for (let i = low; i <= high; i++) {
      if (lastSelectedState) {
        // Make everything in between selected.
        $(children[i]).addClass('selectedTrack');
        editorModeTracks.add({
          trackID: children[i].getAttribute('trackID'),
          randomID: children[i].getAttribute('playlistRandomID')
        });
      }
      else {
        if ($(children[i]).hasClass('selectedTrack')) {
          // Make everything in between unselected.
          $(children[i]).removeClass('selectedTrack');
          editorModeTracks.delete({
            trackID: children[i].getAttribute('trackID'),
            randomID: children[i].getAttribute('playlistRandomID')
          });
        }
      }
    }
  }

  editorLastSelected = `${trackID}.${randomID}`;

  window.clearTimeout(editorModeTimeouts[`${playlistID}3`]);
  if (editorModeTracks.size) {
    $(`#${user.uid}${playlistID}EditToolbar`).removeClass('hidden');
    $(`#${user.uid}${playlistID}EditToolbar`).removeClass('fadeOutDown');
    $(`#${user.uid}${playlistID}EditToolbar`).addClass('fadeInUp');
  }
  else {
    $(`#${user.uid}${playlistID}EditToolbar`).removeClass('fadeInUp');
    $(`#${user.uid}${playlistID}EditToolbar`).addClass('fadeOutDown');
    editorModeTimeouts[`${playlistID}3`] = window.setTimeout(() => {
      $(`#${user.uid}${playlistID}EditToolbar`).addClass('hidden');
    }, 999);
  }
}

function editorModeCopy(fromPlaylistID) {
  $(`#playlistContextList`).empty();

  const a = document.createElement('button');
  a.setAttribute('class', 'btn contextButton contextButtonImportant');
  a.innerHTML = `<i class="bx bx-plus"></i> New Playlist`
  a.onclick = () => openNewPlaylistDialog(null, null, true, fromPlaylistID);
  $('#playlistContextList').get(0).appendChild(a);

  for (let i = 0; i < cachePlaylists.length; i++) {
    const playlistSplit = cachePlaylists[i].split('.');
    let playlistUID = user.uid;
    let playlistID = playlistSplit[0];
    let playlistName = playlistSplit[1];
    if (playlistSplit.length == 3) {
      playlistUID = playlistSplit[0];
      playlistID = playlistSplit[1];
      playlistName = playlistSplit[2];
    }

    if (playlistUID == user.uid) {
      const a = document.createElement('button');
      a.setAttribute('class', 'btn contextButton');
      a.innerHTML = playlistName;
      a.onclick = () => addTracksToPlaylist(playlistID)
      $('#playlistContextList').get(0).appendChild(a);
    }
  }

  twemoji.parse($(`#playlistContextList`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });
}

function addTracksToPlaylist(playlistID) {
  let tracks = [];
  editorModeTracks.forEach((x) => {
    tracks.push(x);
  });

  updateDoc(doc(db, `users/${user.uid}/playlists/${playlistID}`), {
    tracks: arrayUnion(...tracks)
  });

  snac('Tracks Added', `Successfully added ${tracks.length} tracks.`, 'success'); 
}

function editorModeTrash(playlistID) {
  let tracks = [];
  editorModeTracks.forEach((x) => {
    tracks.push(x);
    editorModeTracks.delete(x);
  });

  updateDoc(doc(db, `users/${user.uid}/playlists/${playlistID}`), {
    tracks: arrayRemove(...tracks)
  });

  $(`#${user.uid}${playlistID}EditToolbar`).removeClass('fadeInUp');
  $(`#${user.uid}${playlistID}EditToolbar`).addClass('fadeOutDown');
  editorModeTimeouts[`${playlistID}3`] = window.setTimeout(() => {
    $(`#${user.uid}${playlistID}EditToolbar`).addClass('hidden');
  }, 999);

  snac('Tracks Removed', `Successfully removed ${tracks.length} tracks.`, 'success'); 
}

export function exitEditorModePlaylist(playlistID) {
  window.clearTimeout(editorModeTimeouts[`${playlistID}`]);
  window.clearTimeout(editorModeTimeouts[`${playlistID}2`]);

  $(`#musicSidebar`).get(0).setAttribute('class', 'sidebarLeft animated fadeInUp');
  editorModeTimeouts[`${playlistID}`] = window.setTimeout(() => {
    $(`#musicSidebar`).get(0).setAttribute('class', 'sidebarLeft');
  }, 999);

  $(`#PlaylistView${user.uid}${playlistID}`).removeClass('playlistEditorView')

  $(`#${user.uid}${playlistID}playlistDetailsTwo`).removeClass('fadeIn');
  $(`#${user.uid}${playlistID}playlistDetailsTwo`).addClass('animated');
  $(`#${user.uid}${playlistID}playlistDetailsTwo`).addClass('fadeOut');
  $(`#playlistSearch${user.uid}${playlistID}`).removeClass('fadeOut');
  $(`#playlistSearch${user.uid}${playlistID}`).addClass('fadeIn');
  $(`#playlistSearch${user.uid}${playlistID}`).removeClass('hidden');
  $(`#${user.uid}${playlistID}playlistTrackSearchResults`).removeClass('fadeOut');
  $(`#${user.uid}${playlistID}playlistTrackSearchResults`).removeClass('hidden');
  $(`#${user.uid}${playlistID}playlistTrackSearchResults`).addClass('fadeIn');
  $(`#${user.uid}${playlistID}SearchResults`).removeClass('fadeOut');
  $(`#${user.uid}${playlistID}reviewSection`).removeClass('hidden');
  $(`#${user.uid}${playlistID}SearchResults`).removeClass('hidden');
  $(`#${user.uid}${playlistID}SearchResults`).addClass('fadeIn');
  editorModeTimeouts[`${playlistID}2`] = window.setTimeout(() => {
    $(`#${user.uid}${playlistID}playlistDetailsTwo`).addClass('hidden');
    $(`#${user.uid}${playlistID}playlistDetailsOne`).removeClass('hidden');
    $(`#${user.uid}${playlistID}playlistDetailsOne`).removeClass('fadeOut');
    $(`#${user.uid}${playlistID}playlistDetailsOne`).addClass('animated');
    $(`#${user.uid}${playlistID}playlistDetailsOne`).addClass('fadeIn');
  }, 999);

  $(`#${user.uid}${playlistID}EditToolbar`).removeClass('fadeInUp');
  $(`#${user.uid}${playlistID}EditToolbar`).addClass('fadeOutDown');
  editorModeTimeouts[`${playlistID}3`] = window.setTimeout(() => {
    $(`#${user.uid}${playlistID}EditToolbar`).addClass('hidden');
  }, 999);

  editorModePlaylist = null;
  editorModeTracks.clear();
  editorLastSelected = null;

  $(`#editorModeInjection`).html(``);
  updatePlaylistIndexes(playlistID);
  $('.selectedTrack').removeClass('selectedTrack');
}

export function refreshReviews(playlistUID, playlistID) {
  $(`#${playlistUID}${playlistID}reviewSectionContentContent`).empty();
  loadReviews(playlistUID, playlistID);
}

async function removeReview(playlistUID, playlistID, userID) {
  // Set height to its height
  disableButton($(`#${playlistUID}${playlistID}${userID}ReviewDelete`));
  $(`#${playlistUID}${playlistID}Review${userID}Container`).css('height', $(`#${playlistUID}${playlistID}Review${userID}Container`).height());
  window.setTimeout(() => {
    $(`#${playlistUID}${playlistID}Review${userID}Container`).addClass("reviewGone")
    window.setTimeout(() => {
      $(`#${playlistUID}${playlistID}Review${userID}Container`).remove();
    }, 999);
  }, 99);

  await updateDoc(doc(db, `users/${userID}/playlists/${playlistID}/views/reviews`), {
    [userID]: deleteField()
  });

  $(`#${playlistUID}${playlistID}addReviewButton`).removeClass('hidden')
  $(`#${playlistUID}${playlistID}editReviewButton`).addClass('hidden')
  $(`#${playlistUID}${playlistID}removeReviewButton`).addClass('hidden')
}

