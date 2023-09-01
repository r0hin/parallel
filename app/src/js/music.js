import { getFirestore, getDocs, query, collection, where, limit, onSnapshot, doc, orderBy, runTransaction, startAfter, updateDoc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from '@firebase/functions';
import * as timeago from 'timeago.js';

checkAppInitialized();
const db = getFirestore();
const functions = getFunctions();

import { closeModal, disableButton, displayImageAnimation, enableButton, hidePlaybackView, openModal, playlistArrayDifference, securityConfirmText, setNoTrackUI, setTrackUI, shuffleArray, switchViewsToContent, timer } from './app';
import { addPlaylistToLibrary, albumLibraryListener, artistLibraryListener, clonePlaylistToLibrary, createPlaylist, createPlaylistFolder, openPlaylist, removePlaylistFromLibrary, trackLibraryListener, prepareRemovePlaylistFromLibrary, reviewViewCheck, refreshReviews } from './library';
import { sendTrackToPlayerRevamp } from './playback';
import { setMusicStatus, updatePresenceForUser } from './presence';
import { openSpecialServer } from './servers';
import { checkValidSubscription } from './stripe';
import { playlistSelector } from './context';
import { leaveListeningParty, skipTrackVCMusic } from './vcMusic';
import { createAlbum, createApplePlaylist, createArtist, createGenre, createTrack } from './componentse';
import { checkAppInitialized } from './firebaseChecks';

window.musicLoaded = false;

window.musicQueue = [];
window.musicHistory = [];
window.musicBack = [];
window.musicPlaying = {};

window.skipTimeout = null;

window.enableLoopConst = null;

window.playbackViewActive = null;
window.clearHidePlayback = null;
window.musicSocialExpandTimeout = null;
window.activeMusicTab = '';
window.openedTabs = [];
window.libraryPlayer = new Plyr(`#libraryPlayer`, { controls: ['progress', 'current-time', 'mute', 'volume'] });
window.libraryPlayerElement = $('#libraryPlayer').get(0);

window.friendsPlaylistPaginationIndex = null;
window.spotifyToken = null;

const placeholderAlbumImage = 'https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/app%2FdefaultAlbum.png?alt=media';

libraryPlayer.on('playing', event => {
  setMusicStatus(musicPlaying, true);
  $('#playerPauseButton').html(`<i class="bx bx-pause"></i>`)
  $('#playerPauseButton').get(0).onclick = () => {pauseMusicButton()}
  $('#playerPauseButtonMini').html(`<i class="bx bx-pause"></i>`)
  $('#playerPauseButtonMini').get(0).onclick = () => {pauseMusicButton()}
})

libraryPlayer.on('pause', event => {
  setMusicStatus(musicPlaying, false);
  $('#playerPauseButton').html(`<i class="bx bx-play"></i>`)
  $('#playerPauseButton').get(0).onclick = () => {playMusicButton()}
  $('#playerPauseButtonMini').html(`<i class="bx bx-play"></i>`)
  $('#playerPauseButtonMini').get(0).onclick = () => {playMusicButton()}
})

libraryPlayer.on('volumechange', event => {
  const inputVolume = event;
});

navigator.mediaSession.setActionHandler('play', function() { $(`#libraryPlayer`).get(0).play() });
navigator.mediaSession.setActionHandler('pause', function() { $(`#libraryPlayer`).get(0).pause() });
navigator.mediaSession.setActionHandler('seekbackward', function() { });
navigator.mediaSession.setActionHandler('seekforward', function() { });
navigator.mediaSession.setActionHandler('previoustrack', function() {if (musicPlaying.id) {backwardSong()} });
navigator.mediaSession.setActionHandler('nexttrack', function() {
  if (musicPlaying.id) {
    if (activeListeningParty) {
      const guildUID = activeListeningParty.split('/')[0];
      const guildID = activeListeningParty.split('/')[1];
      if (serverData[guildUID + guildID].owner == user.uid || serverData[guildUID + guildID].staff.includes(`${user.uid}`)) {
        skipTrackVCMusic(guildUID, guildID, activeListeningParty.split('/')[2]);
      }
    }
    else if (musicPlaying.id) {
      forwardSong();
    }
  }
});

window.setInterval(() => {
  if ((libraryPlayerElement.duration - libraryPlayerElement.currentTime) < 0.7) {
    playerDidEnd();
  }
}, 999)

// openSpecialServer('music'); // Remove this.

export function musicTab(tab) {
  if (currentChannel == tab || tab == 'search') {
    clearMusicViews(tab);
  }

  if (window.innerWidth < 600) {
    switchViewsToContent()
  }

  currentChannel = tab; // Use current channel for this as well.
  activeMusicTab = tab;

  try { playlistListener() } catch(e) { };

  $('#musicTab_socialContent').removeClass('hidden');

  // Quick tabs function here
  $('.sidebarButtonActive').removeClass('sidebarButtonActive');
  $(`#musicTabButton_${tab}`).addClass('sidebarButtonActive');

  $('.musicTab').addClass('hidden');
  $(`#musicTab_${tab}`).removeClass('hidden');

  if (tab == 'search') {
    $('#searchMusic').focus();
  }

  // Clear music views within the tab.

  if (!openedTabs.includes(tab)) {
    openedTabs.push(tab);
    // Load for first time/
    switch (tab) {
      case 'explore':
        loadMusicExplore();
        break;
      case 'friends': 
        disableButton($(`#refreshFriendsButton`));
        $(`#activeFriendsPlaylistsContainer`).empty();
        loadMusicSocial();
        window.setTimeout(() => {
          enableButton($('#refreshFriendsButton'), '<i class="bx bx-refresh"></i>');
        }, 2999);
        break;
      default:
        break;
    }
  }
}


window.makeMusicRequest = (q) => {
  if (!appleMusicKey) {
    alert("Error");
  }

  return new Promise(async (resolve, reject) => {
    const fetched = await fetch(`https://api.music.apple.com/v1/catalog/us/${q}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${appleMusicKey}`,
      }
    });

    resolve(await fetched.json());
  });
}

export function loadMusic() {
  // Ran everytime tab is open.

  window.setTimeout(() => {
    const trackTitleWidth = $(`#currentTrackTitle`).width();
    const trackAuthorWidth = $(`#currentTrackAuthor`).width();
    let targetContainerWidth = trackTitleWidth;
    if (trackAuthorWidth > trackTitleWidth) {
      targetContainerWidth = trackAuthorWidth;
    }

    if (targetContainerWidth < 5) { // Error
      return;
    }
  
    $(`#currentTrackDetailsContainer`).css('width', `${targetContainerWidth}px`);
  }, 499);

  if (typeof(user) == 'undefined') {
    const musicInterval = window.setInterval(() => {
      if (typeof(user) !== 'undefined' && !musicLoaded) {
        musicLoaded = true;
        confirmLoadMusic();
        window.clearInterval(musicInterval);
      }
    }, 200)
  }
  else {
    if (!musicLoaded) {
      musicLoaded = true;
      confirmLoadMusic();
    }
  }
}

function confirmLoadMusic() {
  $('#musicSidebar').removeClass('hidden');
  window.setTimeout(() => {
    $('#musicSidebar').removeClass('animated');
  }, 950);
  // Open music tab for first time. Show explore tab?
  musicTab('explore');

  // Setup the listeners. Need this to happen quickly so that we know which songs are favorited or not.
  artistLibraryListener();
  albumLibraryListener();
  trackLibraryListener();
}

async function loadMusicExplore() {

  // Get charts
  const charts = await makeMusicRequest('charts?types=albums,songs');

  const albums = charts.results.albums[0].data;
  const songs = charts.results.songs[0].data;

  for (let i = 0; i < albums.length; i++) {
    const album = albums[i];
    createAlbum(album, `exploreAlbums`);
  }

  for (let i = 0; i < songs.length; i++) {
    const track = songs[i];
    createTrack(track, `exploreTracks`, i);
  }

  // Get genres
  const genres = (await makeMusicRequest('genres')).data;
  for (let i = 0; i < genres.length; i++) {
    const genre = genres[i];
    createGenre(genre, `exploreGenres`);
  }
  

  $('#exploreContent').removeClass('hidden');
}

export async function reloadSocialTab() {
  disableButton($(`#refreshFriendsButton`));

  $(`#activeFriendsPlaylistsContainer`).empty();
  friendsPlaylistPaginationIndex = null;
  loadMusicSocial(true);

  window.setTimeout(() => {
    enableButton($('#refreshFriendsButton'), '<i class="bx bx-refresh"></i>');
  }, 9999);
}

async function loadMusicSocial(skipTop) {
  // Get list of friends who are currently listening to music!

  if (!skipTop) {
    for (let i = 0; i < cacheUser.friends.length; i++) {
      const friend = cacheUser.friends[i];
      buildMusicSocialCard(friend);
    }
  }

  const friendDocs = await getDocs(query(collection(db, `users`), where("friends", "array-contains", {n: cacheUser.username, u: user.uid}), where('playlistCount', '>', 0), orderBy('playlistCount', 'desc'), limit(6)));
  friendsPlaylistPaginationIndex = friendDocs.docs[friendDocs.docs.length - 1];
  
  if (!friendDocs.docs) {
    $('#activeFriendsPlaylistsNotice').removeClass('hidden');
  }
  else if (friendDocs.docs.length < 6) {
    // Didnt get the full 6.
    console.log('NO friends with playlists left');

    $(`#loadMoreButton`).removeClass('zoomIn');
    $(`#loadMoreButton`).addClass('zoomOut');
    window.setTimeout(() => {
      $(`#loadMoreButton`).addClass('hidden');
    }, 1000);
  }
  else {
    // There is more left.
    $(`#loadMoreButton`).removeClass('zoomOut');
    $(`#loadMoreButton`).addClass('zoomIn');
    $(`#loadMoreButton`).removeClass('hidden');
  }

  for (let i = 0; i < friendDocs.docs.length; i++) {
    console.log('Building friend: ' + friendDocs.docs[i].data().username);
    const doc = friendDocs.docs[i];
    buildFriendsPlaylistGridWithDoc(doc);
  }

  $(`#loadMoreButton`).get(0).onclick = () => {
    disableButton($(`#loadMoreButton`));
    loadMoreFriendsPlaylists();
  }
}

export async function buildMusicSocialCard(friend) {
  if ($(`#${friend.u}MusicListeningCard`).length) {
    // Already exists.
    return;
  }

  const a = document.createElement('div');
  a.id = `${friend.u}MusicListeningCard`
  a.innerHTML = `
    <img id="${friend.u}musiclisteningimageitem" class="profileImage" src="${await returnProperURL(friend.u)}" />
    <img id="${friend.u}musiclisteningalbumitem" class="albumImage" id="${friend.u}MusicListeningCardAlbum" src="" />
    <p onclick="openUserCard('${friend.u}')">${friend.n.capitalize()}</p>
  `;
  a.setAttribute('class', 'musicSocialItem animated fadeIn hidden');
  $(`#activeFriendsContainer`).get(0).appendChild(a);

  tippy($(`#${friend.u}musiclisteningalbumitem`).get(0), {
    content: '',
    placement: 'top',
  });

  displayImageAnimation(`${friend.u}musiclisteningimageitem`);
  displayImageAnimation(`${friend.u}musiclisteningalbumitem`);

  updatePresenceForUser(friend.u);
}

async function loadMoreFriendsPlaylists() {
  const friendDocs = await getDocs(query(collection(db, `users`), where("friends", "array-contains", {n: cacheUser.username, u: user.uid}), where('playlistCount', '>', 0), limit(6), orderBy('playlistCount', 'desc'), startAfter(friendsPlaylistPaginationIndex)));
  friendsPlaylistPaginationIndex = friendDocs.docs[friendDocs.docs.length - 1];

  if (friendDocs.docs.length < 6) {
    // Didnt get the full 6.
    $(`#loadMoreButton`).removeClass('zoomIn');
    $(`#loadMoreButton`).addClass('zoomOut');
    window.setTimeout(() => {
      $(`#loadMoreButton`).addClass('hidden');
    }, 1000);
  }

  for (let i = 0; i < friendDocs.docs.length; i++) {
    const doc = friendDocs.docs[i];
    await buildFriendsPlaylistGridWithDoc(doc)
  }

  window.setTimeout(() => {
    enableButton($(`#loadMoreButton`), 'Load More');
  }, 3999);
}

function buildFriendsPlaylistGridWithDoc(doc) {
  return new Promise(async (resolve, reject) => {
    // Create user container
    const hiddenPlaylists = doc.data().hiddenPlaylists || [];

    const a = document.createElement('div');
    a.id = doc.id + 'userContainerItem'
    a.setAttribute('class', 'friendPlaylistUserContainer')
    a.setAttribute('style', "");
    a.innerHTML = `
      <div id="friendPlaylistHeader${doc.id}" class="friendPlaylistHeader userContextItem" username=${doc.data().username} userID="${doc.id}">
        <div>
          <img class="invisible" id="${doc.id}friendplaylistlistpfp"/>
          <span class="${checkValidSubscription(doc.data().subscription) ? "infiniteTextSpan" : ""}">${doc.data().username.capitalize()}</span>
        </div>
        <div>
          <div class="numPlaylistsFriendList animated fadeIn">${(doc.data().playlists.length - hiddenPlaylists.length)}</div>
          <i id="friendPlaylistUserChevron${doc.id}" class="bx bx-chevron-down"></i>
        </div>
      </div>
      <div class="friendPlaylistContent hidden" id="friendPlaylistContent${doc.id}" style="">
        <div id="friendFolders${doc.id}"></div>
      </div>
    `
    $(`#activeFriendsPlaylistsContainer`).get(0).appendChild(a);
    
    $(`#${doc.id}friendplaylistlistpfp`).get(0).src = await returnProperURL(doc.id);
    displayImageAnimation(`${doc.id}friendplaylistlistpfp`);

    $(`#friendPlaylistHeader${doc.id}`).get(0).onclick = () => showPlaylistsAndFolders(doc.id);

    // Put playlists in.
    const ownerUID = doc.id;
    
    for (let i = 0; i < doc.data().playlists.length; i++) {
      const playlist = doc.data().playlists[i].split('.');

      let playlistUID = doc.data().uid;
      let playlistID = playlist[0];
      let playlistName = playlist[1];
      if (playlist.length == 3) {
        playlistUID = playlist[0];
        playlistID = playlist[1];
        playlistName = playlist[2];
      }

      if (hiddenPlaylists.includes(playlistID)) {
        continue;
      }

      const coverURL = `https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/playlists%2F${playlistUID}%2F${playlistID}%2Ficon.png?alt=media`

      const a = document.createElement('div');
      a.setAttribute('class', 'playlist friendPlaylist');
      a.id = ownerUID + playlistUID + playlistID + 'friendPlaylistButton'
      a.innerHTML = `
        <div id="${ownerUID}${playlistID}friendPlaylistCoverContainer${playlistUID}" class="friendPlaylistCover"><img id="${ownerUID}${playlistID}friendPlaylistCover${playlistUID}" src="${coverURL}" /></div>
        <p id="${ownerUID}${playlistID}friendPlaylistCoverContainerText${playlistUID}" >${playlistName}</p>
      `

      $(`#friendPlaylistContent${ownerUID}`).get(0).appendChild(a); 

      $(`#${ownerUID}${playlistID}friendPlaylistCoverContainer${playlistUID}`).get(0).onclick = () => {
        openOtherPlaylist(playlistUID, playlistID, playlistName, false);
      }

      twemoji.parse($(`#${ownerUID}${playlistID}friendPlaylistCoverContainerText${playlistUID}`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });
  
      $(`#${ownerUID}${playlistID}friendPlaylistCoverContainerText${playlistUID}`).get(0).onclick = () => {
          openOtherPlaylist(playlistUID, playlistID, playlistName, false);
      }
  
      $(`#${ownerUID}${playlistID}friendPlaylistCover${playlistUID}`).get(0).onerror = () => {
        $(`#${ownerUID}${playlistID}friendPlaylistCoverContainer${playlistUID}`).html(`<i class="missingIconIcon bx bxs-playlist"></i>`)
      }
    }

    const folders = doc.data().playlistFolders;

    if (folders) {
      const keys = Object.keys(folders);

      for (let i = 0; i < keys.length; i++) {
        const folderName = keys[i].split('<')[0];
        const folderID = doc.id + keys[i].split('<')[1];
        const playlistIDs = folders[`${folderName}<${keys[i].split('<')[1]}`];
    
        const a = document.createElement('div');
        a.classList.add('friendFolderContainer');
        a.id = `${folderID}Container`;
        a.innerHTML = `
          <button id="${folderID}Button" folderID="${folderID}" folderName="${folderName}" class="friendPlaylistFolder"><i id="folder${folderID}" class="bx bx-folder"></i> <span class="sidebarText">${folderName}</span><i id="chevron${folderID}" class="bx bx-chevron-down chevronIndicator"></i></button>
          <div id="playlistFolderContent${folderID}" class="friendPlaylistFolderContent hidden" style=""></div>
        `;
        
        $(`#friendFolders${doc.id}`).get(0).appendChild(a);
        twemoji.parse($(`#${folderID}Button`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });
        $(`#${folderID}Button`).get(0).onclick = () => expandFriendPlaylistFolder(folderID, doc.id)
      
        // Add all the playlists into the folder.
        for (let i = 0; i < playlistIDs.length; i++) {
          let playlistUID = ownerUID;
          let playlistID = playlistIDs[i].split('.')[0];
          let playlistName = playlistIDs[i].split('.')[1];
          if (playlistIDs[i].split('.').length == 2) {
            playlistUID = playlistIDs[i].split('.')[0];
            playlistID = playlistIDs[i].split('.')[1];
            playlistName = playlistIDs[i].split('.')[2];
          }

          if (hiddenPlaylists.includes(playlistID)) {
            continue;
          }

          $(`#${ownerUID}${playlistID}friendPlaylistCoverContainer${playlistUID}`).get(0).onclick = () => {
            openOtherPlaylist(playlistUID, playlistID, playlistName, false, keys[i]);
          }
    
          $(`#${ownerUID}${playlistID}friendPlaylistCoverContainerText${playlistUID}`).get(0).onclick = () => {
              openOtherPlaylist(playlistUID, playlistID, playlistName, false, keys[i]);
          }

          $(`#${ownerUID}${playlistUID}${playlistID}friendPlaylistButton`).appendTo(`#playlistFolderContent${folderID}`);        
        }

        if (!$(`#playlistFolderContent${folderID}`).children()) {
          $(`#${ownerUID}${folderID}Container`).remove();
        }
      }

      // Sort the folders.
      const foldersSortMapping = doc.data().playlistFoldersSort;
      if (foldersSortMapping) {
        for (let i = 0; i < foldersSortMapping.length; i++) {
          const folderID = doc.id + foldersSortMapping[i];
          $(`#${folderID}Container`).attr('data-order', i);
        }
      
        let sorted = $(`#friendFolders${doc.id}`).children('.friendFolderContainer').sort((a, b) => {
          return parseInt($(a).attr('data-order')) - parseInt($(b).attr('data-order'));
        });
      
        $(`#friendFolders${doc.id}`).append(sorted);
      }
    }
    

    function expandFriendPlaylistFolder(folderID, userID) {
      const hidden = $(`#playlistFolderContent${folderID}`).get(0).getAttribute('style') == '';

      if (hidden) {
        window.clearTimeout(musicSocialExpandTimeout);

        $(`#playlistFolderContent${folderID}`).removeClass("hidden");
        $(`#playlistFolderContent${folderID}`).removeClass("zeroHeight");
        const naturalHeight = $(`#playlistFolderContent${folderID}`).height();
        
        const oldHeight = $(`#${userID}userContainerItem`).get(0).getAttribute('style')
        $(`#${userID}userContainerItem`).get(0).removeAttribute('style');
        $(`#${userID}userContainerItem`).removeClass('zeroHeightFriendExpand');
        const containerNaturalHeight = $(`#${userID}userContainerItem`).height();
        $(`#${userID}userContainerItem`).get(0).setAttribute('style', oldHeight);
        $(`#${userID}userContainerItem`).addClass('zeroHeightFriendExpand');
        window.setTimeout(() => {
          $(`#${userID}userContainerItem`).css('height', `${containerNaturalHeight + 10}px`); // +10 for padding.
        }, 9);


        // Window
        $(`#${folderID}Button`).addClass("friendFolderExpandedButton");
        $(`#playlistFolderContent${folderID}`).addClass("friendFolderExpandedContent");

        $(`#playlistFolderContent${folderID}`).addClass("zeroHeight");
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
        $(`#folder${folderID}`).addClass('bx-folder');
        $(`#folder${folderID}`).removeClass('bx-folder-open');

        musicSocialExpandTimeout = window.setTimeout(() => {
          // Window
          $(`#${folderID}Button`).removeClass("friendFolderExpandedButton");
          $(`#playlistFolderContent${folderID}`).removeClass("friendFolderExpandedContent");

        const oldHeight = $(`#${userID}userContainerItem`).get(0).getAttribute('style')
          $(`#${userID}userContainerItem`).css('height', ``);
          $(`#${userID}userContainerItem`).removeClass('zeroHeightFriendExpand');
          const containerNaturalHeight = $(`#${userID}userContainerItem`).height();
          $(`#${userID}userContainerItem`).get(0).setAttribute('style', oldHeight);
          $(`#${userID}userContainerItem`).addClass('zeroHeightFriendExpand');
          window.setTimeout(() => {
            $(`#${userID}userContainerItem`).css('height', `${containerNaturalHeight}px`); 
          }, 9);
        }, 249);
      }
    }

    function showPlaylistsAndFolders() {
      const hidden = $(`#${doc.id}userContainerItem`).get(0).getAttribute('style') == '';
  
      if (hidden) {
        window.clearTimeout(musicSocialExpandTimeout);
        $(`#${doc.id}userContainerItem`).removeClass('zeroHeightFriendExpand');
        $(`#friendPlaylistContent${doc.id}`).removeClass('hidden');
        const naturalHeight = $(`#${doc.id}userContainerItem`).height();
        $(`#${doc.id}userContainerItem`).addClass('zeroHeightFriendExpand');
        $(`#${doc.id}userContainerItem`).css('height', `${naturalHeight}px`);
        $(`#friendPlaylistContent${doc.id}`).addClass('friendPlaylistContentActive');
        $(`#friendPlaylistHeader${doc.id}`).addClass('friendPlaylistHeaderActive');
        $(`#friendPlaylistUserChevron${doc.id}`).removeClass('bx-chevron-down');
        $(`#friendPlaylistUserChevron${doc.id}`).addClass('bx-chevron-up');
      }
      else {
        $(`#${doc.id}userContainerItem`).get(0).setAttribute('style', '');
        $(`#friendPlaylistContent${doc.id}`).removeClass('friendPlaylistContentActive');
        $(`#friendPlaylistHeader${doc.id}`).removeClass('friendPlaylistHeaderActive');
        $(`#friendPlaylistUserChevron${doc.id}`).addClass('bx-chevron-down');
        $(`#friendPlaylistUserChevron${doc.id}`).removeClass('bx-chevron-up');
      }
    }

    resolve(true)
  });
}

export function openNewPlaylistFolderDialog(playlistUID, playlistID) {
  openModal('newPlaylistFolder');

  $('#newPlaylistFolderName').val('')
  $('#newPlaylistFolderName').get(0).addEventListener("keyup", function(event) {
    if (event.keyCode === 13) { event.preventDefault(); $('#newPlaylistFolderCreateButton').get(0).click(); }
  });

  $('#newPlaylistFolderCreateButton').get(0).onclick = () => {
    createPlaylistFolder(playlistUID, playlistID);
  }
}

export function openNewPlaylistDialog(addTrackIDToPlaylist, addAlbumIDToPlaylist) {
  openModal('newPlaylist');
  $('#newPlaylistName').val('')
  $('#newPlaylistName').get(0).addEventListener("keyup", function(event) {
    if (event.keyCode === 13) { event.preventDefault(); $('#newPlaylistCreateButton').get(0).click(); }
  });

  $('#newPlaylistCreateButton').get(0).onclick = () => {
    createPlaylist();
  }
  
  if (addTrackIDToPlaylist || addAlbumIDToPlaylist) { // If we are adding a track or album to a playlist
    $('#newPlaylistCreateButton').get(0).onclick = () => {
      createPlaylist(addTrackIDToPlaylist, false, false, addAlbumIDToPlaylist);
    }
  }
}

export async function searchMusicButton() {
  let secondSearch = false;

  const searchQuery = $('#searchMusic').val();
  $('#searchMusic').val('');
  
  if (!searchQuery || searchQuery == '' || searchQuery == ' ') {
    disableSearchView();
    return;
  }

  window.setTimeout(() => {
    addToRecentSearches(searchQuery);
  }, 899);
  
  if ($('#musicSearchBox').hasClass('musicSearchBoxActive')) {
    $('#musicSearchResultsGhost').removeClass('hidden');
    $('#musicSearchResults').addClass('hidden');
    secondSearch = true;
  }

  $('#noResults').addClass('hidden');
  
  enableSearchView();
  $('#searchSuggestions').empty();
  
  const search = await makeMusicRequest(`search?term=${encodeURIComponent(searchQuery)}&types=albums,artists,songs,playlists&limit=12`);


  $(`#parallelSearchResultsTracks`).empty();
  $('#musicSearchResultsTracks').empty();
  $('#musicSearchResultsArtists').empty();
  $('#musicSearchResultsAlbums').empty();
  $(`#topSearchResultsTracks`).empty();
  $(`#topResultSearchDivider`).addClass('hidden');
  $('#topResultContainer').empty();

  window.search = search;

  $('#albumsSearchDivider').addClass('hidden');
  if (typeof(search.results) !== 'undefined' && typeof(search.results.albums) !== 'undefined' && typeof(search.results.albums.data) !== 'undefined') {
    $('#albumsSearchDivider').removeClass('hidden');
    for (let i = 0; i < search.results.albums.data.length; i++) {
      const album = search.results.albums.data[i];
      createAlbum(album, `musicSearchResultsAlbums`);
    }
  }

  $('#artistsSearchDivider').addClass('hidden');
  if (typeof(search.results) !== 'undefined' && typeof(search.results.artists) !== 'undefined' && typeof(search.results.artists.data) !== 'undefined') {
    $('#artistsSearchDivider').removeClass('hidden');
    for (let i = 0; i < search.results.artists.data.length; i++) {
      const artist = search.results.artists.data[i];
      createArtist(artist, `musicSearchResultsArtists`);
    }
  }
  
  $('#tracksSearchDivider').addClass('hidden');
  if (typeof(search.results) !== 'undefined' && typeof(search.results.songs) !== 'undefined' && typeof(search.results.songs.data) !== 'undefined') {
    $('#tracksSearchDivider').removeClass('hidden');
    for (let i = 0; i < search.results.songs.data.length; i++) {
      const track = search.results.songs.data[i];
      createTrack(track, `musicSearchResultsTracks`, i);
    }
  }

  $('#playlistsSearchDivider').addClass('hidden');
  if (typeof(search.results) !== 'undefined' && typeof(search.results.playlists) !== 'undefined' && typeof(search.results.playlists.data) !== 'undefined') {
    $('#playlistsSearchDivider').removeClass('hidden');
    for (let i = 0; i < search.results.playlists.data.length; i++) {
      const playlist = search.results.playlists.data[i];
      createApplePlaylist(playlist, `musicSearchResultsPlaylists`);
    }
  }

  if (!Object.keys(search.results).length) {
    $('#noResults').removeClass('hidden');
  }

  if (parseInt(searchQuery)) {
    try {
      const track = (await makeMusicRequest(`songs/${searchQuery}`)).data[0];
      $('#noResults').addClass('hidden');
      if (track.attributes.name) {
        createTrack(track, `topSearchResultsTracks`, 0);
        $(`#topResultSearchDivider`).removeClass('hidden');
      }
    } catch (error) {
      console.log(error)
    }
  }

  if (secondSearch) {
    $('#musicSearchResultsGhost').addClass('hidden')
    $('#musicSearchResults').removeClass('hidden')
  }

  // Search Parallel library..
  $('#parallelSearchDivider').addClass('hidden');

  // const searchParallelLibrary = httpsCallable(functions, 'searchParallelLibrary');
  // const result = await searchParallelLibrary({query: searchQuery});
  
  // if (result.data.data.length) {
  //   $('#parallelSearchDivider').removeClass('hidden');
  //   $('#noResults').addClass('hidden');
  // }

  // for (let i = 0; i < result.data.data.length; i++) {
  //   const track = result.data.data[i];
  //   createTrack(track, `#parallelSearchResultsTracks`, i)
  // }
}

function enableSearchView() {
  if (!$('#musicSearchBox').hasClass('musicSearchBoxActive')) {
    $('#musicSearchBox').addClass('musicSearchBoxActive');
    $('#searchMusicTitle').removeClass('fadeIn');
    $('#searchMusicTitle').addClass('fadeOut');
    $(`#recentSearches2`).removeClass('fadeIn')
    $(`#recentSearches2`).addClass('fadeOut')
    window.setTimeout(() => {
      $('#searchSuggestions').empty();
      $('#musicSearchResults').removeClass('fadeOut');
      $('#musicSearchResults').addClass('fadeIn');
      $('#musicSearchResults').removeClass('hidden');
      $('#searchMusicTitle').addClass('hidden');
      $(`#recentSearches2`).addClass('hidden')
    }, 1001);
  }
}

function disableSearchView() {
  $('#musicSearchResults').addClass('fadeOut');
  $('#musicSearchResults').removeClass('fadeIn');
  window.setTimeout(() => {
    $('#searchSuggestions').empty();
    $('#musicSearchResults').addClass('hidden');
    $('#musicSearchBox').removeClass('musicSearchBoxActive');
    $('#searchMusicTitle').removeClass('hidden');
    $('#searchMusicTitle').addClass('fadeIn');
    $('#searchMusicTitle').removeClass('fadeOut');
    $('#recentSearches2').removeClass('hidden');
    $('#recentSearches2').addClass('fadeIn');
    $('#recentSearches2').removeClass('fadeOut');
  }, 445)
}

window.openArtist = async (artistID) => {
  if (currentServer !== 'music') {
    openSpecialServer('music');
  }

  (editorModePlaylist ? exitEditorModePlaylist(editorModePlaylist) : null);

  if ($(`#ArtistView${artistID}`).length) {
    $(`#ArtistView${artistID}`).removeClass('hidden');
    $(`#ArtistView${artistID}`).appendTo(`#musicTab_${activeMusicTab}`);
    return;
  }

  const a = document.createElement('div');
  a.innerHTML = `
    <div class="musicViewHeader animated fadeInDown faster">
      <p>Artist</p>
      <button id="Artist${artistID}Close" onclick="closeMusicView('Artist', '${artistID}')" class="btn b-3 roundedButton closeButton"><i class="bx bx-x"></i></button>
    </div>
    <div class="musicViewContentContainer">
      <div class="heroImageContainer">
        <img class="heroImage invisible" id="Artist${artistID}Image"/>
      </div>
      <div class="artistTitle" id="Artist${artistID}Title"></div>
      <p class="artistDescription" id="Artist${artistID}Description"></p>
      <div class="artistGenres" id="Artist${artistID}Genres"></div>
      <button id="Artist${artistID}DiscographyButton" class="btn b-1 artistViewButton">Open Discography <i class='bx bx-right-arrow-alt'></i></button>
      <div class="musicViewContentDirectContainer">
        <div id="Artist${artistID}Home" class="musicViewContent">
          <h3 id="Artist${artistID}AlbumsTitle" class="artistSectionTitle">Albums</h3>
          <div class="artistAlbumsSection">
            <div class="artistLatestRelease" id="Artist${artistID}Latest"></div>
            <div class="artistOtherReleases" id="Artist${artistID}Albums"></div>
          </div>
          <h3 id="Artist${artistID}SinglesTitle" class="artistSectionTitle">Singles</h3>
          <div class="artistSingles" id="Artist${artistID}Singles"></div>
          
          <h3 class="artistSectionTitle">Top Tracks</h3>
          <div class="artistTracks" id="Artist${artistID}Tracks"></div>

          <div id="Artist${artistID}AppearancesContainer" class="hidden">
            <h3 class="artistSectionTitle">Appears on</h3>
            <div class="artistAppears" id="Artist${artistID}Appearances"></div>
          </div>

          <div class="hidden" id="Artist${artistID}ArtistsContainer">
            <h3 class="artistSectionTitle">Similar Artists</h3>
            <div class="artistArtists" id="Artist${artistID}Artists"></div>
          </div>
        </div>
        <div id="Artist${artistID}Discography" class="musicViewContent hidden">
          <h3 class="artistSectionTitle">Discography</h3>
          <center>
            <div class="artistDiscographyAlbums" id="Artist${artistID}DiscographyAlbums"></div>
          </center>
        </div>
      </div>
    </div>
  `
  a.setAttribute('class', 'musicView artistView ');
  a.id = `ArtistView${artistID}`;
  $('#musicTab_' + activeMusicTab).get(0).appendChild(a);

  $(`#Artist${artistID}DiscographyButton`).get(0).onclick = () => {
    openArtistDiscography(artistID);
  }

  let artist, artistData;

  let likeSnippet = '';
  if (cacheLibraryArtists.includes(artistID)) {
    likeSnippet = `<div class="mainFavButton"><button onclick="removeFromLibrary('artists', '${artistID}')" class="btn b-1 iconButton favButton likedButtonartists${artistID}"> <i class="bx bxs-heart"></i> </button></div>`;
  }
  else {
    likeSnippet = `<div class="mainFavButton"><button onclick="addToLibrary('artists', '${artistID}')" class="btn b-1 iconButton favButton likedButtonartists${artistID}"> <i class="bx bx-heart"></i> </button></div>`;
  }

  artist = await makeMusicRequest(`artists/${artistID}`);
  artistData = artist.data[0];

  $(`#Artist${artistID}Title`).html(`
    <h2 title="${artistData.attributes.name}">${artistData.attributes.name}</h2>
    ${likeSnippet}
  `)

  tippy($(`#Artist${artistID}Close`).get(0), {
    content: 'Close',
    placement: 'top',
  });

  if (Object.keys(artistData.attributes).includes('editorialNotes') && artistData.attributes.editorialNotes.short) {
    $(`#Artist${artistID}Description`).html(artistData.attributes.editorialNotes.short);
  }

  for (let i = 0; i < artistData.attributes.genreNames.length; i++) {
    const genre = artistData.attributes.genreNames[i];
    $(`#Artist${artistID}Genres`).append(`<span class="artistGenre">${genre}</span>`);
  }

  artist = await makeMusicRequest(`artists/${artistID}?views=latest-release,full-albums`);
  artistData = artist.data[0];

  let latestReleaseID = '';
  $(`#Artist${artistID}Latest`).addClass('hidden');
  if (artistData.views['latest-release'].data.length) {
    $(`#Artist${artistID}Latest`).removeClass('hidden');
    const latestRelease = artistData.views['latest-release'].data[0];
    latestReleaseID = latestRelease.id;
    createAlbum(latestRelease, `Artist${artistID}Latest`);
  }

  const fullAlbums = artistData.views['full-albums'].data;
  if (fullAlbums.length) {
    for (let i = 0; i < fullAlbums.length; i++) {
      if (latestReleaseID === fullAlbums[i].id) { continue } // No duplicates
      const album = fullAlbums[i];
      createAlbum(album, `Artist${artistID}Albums`);
    }
  }
  else {
    $(`#Artist${artistID}Albums`).addClass('hidden');
  }

  if (!fullAlbums.length && !artistData.views['latest-release'].data.length) {
    $(`#Artist${artistID}AlbumsTitle`).addClass('hidden');
  }

  artist = await makeMusicRequest(`artists/${artistID}?views=singles`);
  artistData = artist.data[0];

  const singles = artistData.views['singles'].data;
  if (!singles.length) {
    $(`#Artist${artistID}SinglesTitle`).addClass('hidden');
  }
  for (let i = 0; i < singles.length; i++) {
    if (latestReleaseID === singles[i].id) { continue } // No duplicates
    const album = singles[i];
    createAlbum(album, `Artist${artistID}Singles`);
  }

  artist = await makeMusicRequest(`artists/${artistID}?views=top-songs`);
  artistData = artist.data[0];

  const top = artistData.views['top-songs'].data;
  for (let i = 0; i < top.length; i++) {
    const track = top[i];
    createTrack(track, `Artist${artistID}Tracks`, i, null);
  }

  artist = await makeMusicRequest(`artists/${artistID}?views=similar-artists,appears-on-albums&include=albums`);
  artistData = artist.data[0];

  const similar = artistData.views['similar-artists'].data;
  if (similar.length) {
    $(`#Artist${artistID}ArtistsContainer`).removeClass('hidden');
    for (let i = 0; i < similar.length; i++) {
      const artist = similar[i];
      createArtist(artist, `Artist${artistID}Artists`);
    }
  }
  
  const appears = artistData.views['appears-on-albums'].data;
  if (appears.length) {
    $(`#Artist${artistID}AppearancesContainer`).removeClass('hidden');
    for (let i = 0; i < appears.length; i++) {
      const album = appears[i];
      createAlbum(album, `Artist${artistID}Appearances`);
    }
  }

  // Discography  
  const albums = artistData.relationships.albums.data;
  for (let i = 0; i < albums.length; i++) {
    const album = albums[i];
    createAlbum(album, `Artist${artistID}DiscographyAlbums`);
  } 

  const getArtistProfilePhoto = httpsCallable(functions, 'getArtistProfilePhoto');
  const artistURL = (await getArtistProfilePhoto({artistID: artistID})).data.data.replace('cw.png', 'cc.webp').replace('{w}', 1024).replace('{h}', 1024);
  $(`#Artist${artistID}Image`).attr('src', artistURL);
  displayImageAnimation(`Artist${artistID}Image`);
}

async function openArtistDiscography(artistID) {
  $(`#Artist${artistID}DiscographyButton`).html(`Close Discography <i class='bx bx-left-arrow-alt'></i>`);
  
  $(`#Artist${artistID}Home`).addClass('animated');
  $(`#Artist${artistID}Home`).addClass('fadeOutLeft');
  $(`#Artist${artistID}Home`).removeClass('fadeInLeft');
  $(`#Artist${artistID}Discography`).addClass('animated');
  $(`#Artist${artistID}Discography`).removeClass('fadeOutRight');
  $(`#Artist${artistID}Discography`).removeClass('hidden');
  $(`#Artist${artistID}Discography`).addClass('fadeInRight');

  $(`#Artist${artistID}DiscographyButton`).addClass('disabled');
  await timer(999);
  $(`#Artist${artistID}DiscographyButton`).removeClass('disabled');
  $(`#Artist${artistID}Home`).addClass('hidden');
  $(`#Artist${artistID}Home`).removeClass('animated');
  $(`#Artist${artistID}Discography`).removeClass('animated');

  $(`#Artist${artistID}DiscographyButton`).get(0).onclick = () => {
    closeArtistDiscography(artistID);
  }
}

async function closeArtistDiscography(artistID) {
  $(`#Artist${artistID}DiscographyButton`).html(`Open Discography <i class='bx bx-right-arrow-alt'></i>`);

  $(`#Artist${artistID}Home`).addClass('animated');
  $(`#Artist${artistID}Home`).removeClass('fadeOutLeft');
  $(`#Artist${artistID}Home`).addClass('fadeInLeft');
  $(`#Artist${artistID}Home`).removeClass('hidden');
  $(`#Artist${artistID}Discography`).addClass('animated');
  $(`#Artist${artistID}Discography`).addClass('fadeOutRight');
  $(`#Artist${artistID}Discography`).removeClass('fadeInRight');

  $(`#Artist${artistID}DiscographyButton`).addClass('disabled');
  await timer(999);
  $(`#Artist${artistID}DiscographyButton`).removeClass('disabled');
  $(`#Artist${artistID}Home`).removeClass('animated');
  $(`#Artist${artistID}Discography`).addClass('hidden');
  $(`#Artist${artistID}Discography`).removeClass('animated');

  $(`#Artist${artistID}DiscographyButton`).get(0).onclick = () => {
    openArtistDiscography(artistID);
  }
}

export async function openOtherPlaylist(playlistUID, playlistID, playlistNameInput, fromLibrary, folderContext) {
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

  // Check if this is a playlist that I own!
  if (playlistUID == user.uid) {
    // If the playlist exists
    if (cachePlaylists.includes(`${playlistUID}.${playlistID}.${playlistName}`) || cachePlaylists.includes(`${playlistID}.${playlistName}`)) {
      openPlaylist(playlistUID, playlistID, playlistName, false, folderContext);
    }
    else {
      snac('Playlist Deleted', 'The linked playlist no longer exists. You might have deleted it.', 'danger');
    }
    return;
  }

  if (playlistUID == 'apple') {
    openApplePlaylist(playlistID, playlistName, fromLibrary, folderContext);
    return;
  }

  if ($(`#playlistButton${playlistUID}${playlistID}`).hasClass('sidebarButtonActive')) {
    // Already open!
    clearMusicViewsPlaylist();
    return;
  }

  if (fromLibrary) {
    // Expand enclosing folder if it's not already expanded.
    if (!$(`#playlistButton${playlistUID}${playlistID}`).parent().hasClass('playlistFolderContentActive')) {
      $(`#playlistButton${playlistUID}${playlistID}`).parent().parent().children().first().click();
    }
  }

  if (currentServer !== 'music') {
    openSpecialServer('music');
  }


  musicTab('playlists');
  $(`.playlistView`).addClass('hidden');
  $(`#playlistButton${playlistUID}${playlistID}`).addClass('sidebarButtonActive');

  if ($(`#PlaylistView${playlistUID}${playlistID}`).length) {
    $(`#PlaylistView${playlistUID}${playlistID}`).removeClass('hidden');
    const allowed = await addOtherPlaylistListeners(playlistUID, playlistID, playlistName, fromLibrary, folderContext);
    if (!allowed) {
      if (fromLibrary) {
        removePlaylistFromLibrary(playlistUID, playlistID, playlistNameInput, $(`#playlistButton${playlistUID}${playlistID}`).attr('infolder') || false, true, true);
        snac('Playlist Private', `This playlist has recently been made private. It has been removed from your library.`, 'danger');
      }
      else {
        closeMusicView('Playlist', `${playlistUID}${playlistID}`);
        snac('Playlist Private', 'This playlist is private.', 'danger');
      }
    }
    return;
  }
  
  const a = document.createElement('div');
  a.id = `PlaylistView${playlistUID}${playlistID}`;
  a.setAttribute('class', 'musicView playlistView');
  a.innerHTML = `
    <div class="musicViewHeader animated fadeInDown faster">
      <p>Playlist (View Only)</p>
      ${fromLibrary ? "" : `<button id="Playlist${playlistUID}${playlistID}Close" onclick="closeMusicView('Playlist', '${playlistUID}${playlistID}')" class="btn b-3 roundedButton closeButton"><i class="bx bx-x"></i></button>`}
    </div>
    <div class="musicViewContentContainer">
      <div class="playlistTopLevel">
        <div id="${playlistUID}${playlistID}playlistViewImage" class="playlistCover animated fadeIn"></div>
        <div class="playlistDetails">
          <h2 id="${playlistUID}${playlistID}playlistTitle" class="playlistTitle animated fadeInUp"></h2>
          <p id="${playlistUID}${playlistID}playlistDetailsLine" class="playlistDetailsLine animated fadeIn"></p>
          <button id="${playlistUID}${playlistID}PlayTrackButton" class="btn b-1 playButton2"><i class='bx bx-play'></i></button> 
          <button id="${playlistUID}${playlistID}ShuffleTrackButton" onclick="playTrack(null, '${playlistUID}${playlistID}playlistViewTracksContainer', 0, true)" class="btn b-2 playButton"><i class='bx bx-shuffle'></i></button>     
          ${fromLibrary ? `
            <div class="dropdown">
              <button id="playlistDropdownButton${playlistUID}${playlistID}" onclick="openDropdown('${playlistUID}${playlistID}Dropdown')" class="btn b-4 playlistDropdownButton iconButton dropdownButton"><i class="bx bx-dots-vertical-rounded"></i></button>
              <div id="${playlistUID}${playlistID}Dropdown" class="dropdown-content">
              <a id="deletePlaylistButton${playlistUID}${playlistID}" class="btn btnDanger">Remove from Library</a>
              <a id="clonePlaylistButton${playlistUID}${playlistID}" class="btn btnDanger">Clone Playlist</a>
                <div class="dropdownDivider"></div>
                <a onclick="copyToClipboard('https://parallel.r0h.in/preview?playlistUID=${playlistUID}&playlistID=${playlistID}')" class="btn">Copy Link</a>
                <a onclick="copyToClipboard('${playlistID}')" class="btn">Copy ID</a>
              </div>
            </div>
          ` : `
            <div class="dropdown">
              <button id="playlistDropdownButton${playlistUID}${playlistID}" onclick="openDropdown('${playlistUID}${playlistID}Dropdown')" class="btn b-4 playlistDropdownButton iconButton dropdownButton"><i class="bx bx-dots-vertical-rounded"></i></button>
              <div id="${playlistUID}${playlistID}Dropdown" class="dropdown-content">
                <a id="${playlistUID}${playlistID}AddButton" class="btn">Add to Library</a>
                <a id="${playlistUID}${playlistID}CloneButton" class="btn">Clone Playlist</a>
                <div class="dropdownDivider"></div>
                <a onclick="copyToClipboard('https://parallel.r0h.in/preview?playlistUID=${playlistUID}&playlistID=${playlistID}')" class="btn">Copy Link</a>
                <a onclick="copyToClipboard('${playlistID}')" class="btn">Copy ID</a>
              </div>
            </div>
          `}
          <p id="${playlistUID}${playlistID}contentEditable" class="playlistDescription" spellcheck="false" contenteditable="false"></p>
        </div>
      </div>
      <div class="hr"></div>
      <div class="musicViewContent">
        <div class="notice hidden animated fadeIn" id="${playlistUID}${playlistID}noTrackNotice">No tracks added to this playlist.</div>
        <div class="tracksContainer" id="${playlistUID}${playlistID}playlistViewTracksContainer">
          <div class="notice fetchingTracksNotice animated fadeIn hidden" id="${playlistUID}${playlistID}waitingNotice">Fetching tracks...</div>
        </div>
        <div id="${playlistUID}${playlistID}reviewSection" class="reviewSection reviewSectionOther animated fadeIn hidden">
          <div class="reviewSectionHeader">
            <b>Reviews</b>
            <div>
              <button id="${playlistUID}${playlistID}addReviewButton" class="btn b-0 hidden"><i class="bx bx-plus"></i></button>
              <button id="${playlistUID}${playlistID}editReviewButton" class="btn b-0 hidden"><i class="bx bx-pencil"></i></button>
              <button id="${playlistUID}${playlistID}removeReviewButton" class="btn b-0 hidden"><i class="bx bx-trash"></i></button>
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
  `
  
  $(`#musicTab_playlists`).get(0).appendChild(a);

  tippy($(`#Playlist${playlistUID}${playlistID}Close`).get(0), {
    content: 'Close',
    placement: 'top',
  });

  const allowed = await addOtherPlaylistListeners(playlistUID, playlistID, playlistName, fromLibrary, folderContext);
  if (!allowed) {
    if (fromLibrary) {
      removePlaylistFromLibrary(playlistUID, playlistID, playlistNameInput, $(`#playlistButton${playlistUID}${playlistID}`).attr('infolder') || false, true, true);
      snac('Playlist Private', `This playlist has recently been made private. It has been removed from your library.`, 'danger');
    }
    else {
      closeMusicView('Playlist', `${playlistUID}${playlistID}`);
      snac('Playlist Private', 'This playlist is private.', 'danger');
    }
    return;
  }
}

function addOtherPlaylistListeners(playlistUID, playlistID, inputPlaylistName, fromLibrary, folderContext) {
  return new Promise(async (resolve, reject) => {
    try { await playlistListener() } catch(e) {resolve(true)};
    playlistListener = onSnapshot(doc(db, `users/${playlistUID}/playlists/${playlistID}`), async (playlistDoc) => {
      if (!playlistDoc.exists() && fromLibrary) {
        removePlaylistFromLibrary(playlistUID, playlistID, inputPlaylistName, $(`#playlistButton${playlistUID}${playlistID}`).attr('infolder') || false, true, true);
        snac('Playlist Deleted', `This playlist has recently been deleted. It has been removed from your library.`, 'danger');
        return;
      }
  
      else if (!playlistDoc.exists() && !fromLibrary) {
        closeMusicView('Playlist', `${playlistUID}${playlistID}`);
        snac('Playlist Deleted', 'This playlist no longer exists.', 'danger');
        return;
      }
  
      if (!playlistDoc.exists()) { // Straight up doesn't exist. Not sure what to do..
        closeMusicView('Playlist', `${playlistUID}${playlistID}`);
        snac('Playlist Deleted', 'This playlist no longer exists.', 'danger');
        return;
      }
  
      if (!playlistDoc.data().dateModified) { // Recieved two updates. One is date upload, one is date confirm.
        return; // Ignore if initial upload event. Only update on final.
      }
  
      // Onclicks
      $(`#${playlistUID}${playlistID}addReviewButton`).get(0).onclick = () => {
        openModal('reviewDraft');
    
        $('#confirmReviewPost').get(0).onclick = async () => {
          closeModal();

          const reviewText = $('#reviewDraftTextarea').val();

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
          const addReviewToPlaylist = httpsCallable(functions, 'addReviewToPlaylist');
          const result = await addReviewToPlaylist({
            playlistUID: playlistUID,
            playlistID: playlistID,
            reviewText: $('#reviewDraftTextarea').val(),
          });
    
          if (result.data.data == true) {
            snac('Review Added', 'Your review was added to the playlist.', 'success');
            refreshReviews(playlistUID, playlistID);
          }
          else {
            copyToClipboard(reviewText, true);
            console.log(reviewText);
            snac('Review Error', `${result.data.data} Your review draft was copied to your clipboard.`, 'danger');
          }
        };
      }
    
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
    
      tippy($(`#${playlistUID}${playlistID}addReviewButton`).get(0), {
        content: 'Add Review',
        placement: 'top',
      });
    
      tippy($(`#${playlistUID}${playlistID}editReviewButton`).get(0), {
        content: 'Edit Review',
        placement: 'top',
      });

      tippy($(`#${playlistUID}${playlistID}removeReviewButton`).get(0), {
        content: 'Delete Review',
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

      if ($(`#deletePlaylistButton${playlistUID}${playlistID}`).length) {
        $(`#deletePlaylistButton${playlistUID}${playlistID}`).get(0).onclick = () => { prepareRemovePlaylistFromLibrary(playlistUID, playlistID, inputPlaylistName, folderContext) };
      }

      if ($(`#clonePlaylistButton${playlistUID}${playlistID}`).length) {
        $(`#clonePlaylistButton${playlistUID}${playlistID}`).get(0).onclick = () => { clonePlaylistToLibrary(playlistUID, playlistID) };
      }
  
      if ($(`#${playlistUID}${playlistID}AddButton`).length) {
        $(`#${playlistUID}${playlistID}AddButton`).get(0).onclick = () => { addPlaylistToLibrary(playlistUID, playlistID) };
      }
  
      if ($(`#${playlistUID}${playlistID}CloneButton`).length) {
        $(`#${playlistUID}${playlistID}CloneButton`).get(0).onclick = () => { clonePlaylistToLibrary(playlistUID, playlistID) };
      }
  
  
      if (inputPlaylistName !== playlistDoc.data().title && fromLibrary) {
        // The playlist has changed since adding it.
        await runTransaction(db, async (transaction) => {
          const sfDoc = await transaction.get(doc(db, `users/${user.uid}`));
      
          let newPlaylistList = [];
      
          for (let i = 0; i < sfDoc.data().playlists.length; i++) {
            const playlist = sfDoc.data().playlists[i].split('.');
            let playlistUIDSearch = user.uid;
            let playlistIDSearch = playlist[0];
            let playlistNameOld = playlist[1];
      
            if (playlist.length == 3) {
              playlistUIDSearch = playlist[0];
              playlistIDSearch = playlist[1];
              playlistNameOld = playlist[2];
            }
      
            if (playlistIDSearch == `${playlistID}` && playlistUIDSearch == playlistUID) {
              newPlaylistList.push(`${playlistUID}.${playlistIDSearch}.${playlistDoc.data().title}`);
            }
            else {
              newPlaylistList.push(sfDoc.data().playlists[i]);
            }
          }
      
          transaction.update(doc(db, `users/${user.uid}`), {
            playlists: newPlaylistList,
          });
        });
  
        snac('Playlist Updated', `This playlist has recently been renamed. We've synced the changes for you. `, 'success');
      }
  
      $(`#${playlistUID}${playlistID}playlistTitle`).html(securityConfirmTextIDs(playlistDoc.data().title, true)); // Playlist title
      twemoji.parse($(`#${playlistUID}${playlistID}playlistTitle`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });
  
      $(`#${playlistUID}${playlistID}contentEditable`).html(securityConfirmText(playlistDoc.data().description || ""));
      twemoji.parse($(`#${playlistUID}${playlistID}contentEditable`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });
  
      $(`#${playlistUID}${playlistID}AddButton`).removeClass('hidden');
      if (cachePlaylists.includes(`${playlistUID}.${playlistID}.${inputPlaylistName}`) || cachePlaylists.includes(`${playlistUID}.${playlistID}.${playlistDoc.data().title}`)) {
        $(`#${playlistUID}${playlistID}AddButton`).addClass('hidden');
      }
  
      if (playlistDataImages[playlistUID + playlistID] !== playlistDoc.data().imageURL) {
        if (playlistDoc.data().imageURL) {
          $(`#${playlistUID}${playlistID}playlistViewImage`).html(`<img class="invisible faster" id="${playlistUID}${playlistID}playlistViewImageElement" src="${playlistDoc.data().imageURL}"/>`);
          displayImageAnimation(`${playlistUID}${playlistID}playlistViewImageElement`);
        }
        else {
          $(`#${playlistUID}${playlistID}playlistViewImage`).html(`<i class="missingIconIcon bx bxs-playlist"></i>`);
        }
      }
          
      $(`#${playlistUID}${playlistID}PlayTrackButton`).get(0).onclick = () => {
        playTrack(null, `${playlistUID}${playlistID}playlistViewTracksContainer`, 0);
      }

      $(`#${playlistUID}${playlistID}ShuffleTrackButton`).get(0).onclick = () => {
        playTrack(null, `${playlistUID}${playlistID}playlistViewTracksContainer`, 0, true);
      }
      
      playlistDataImages[playlistUID + playlistID] = playlistDoc.data().imageURL;
      
      const doc = playlistDoc;
      
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
  
      $(`#${playlistUID}${playlistID}playlistDetailsLine`).html(`By ${cloneText} <span class="playlistDetailsSeparator"><i class="bx bxs-circle"></i></span> Updated ${timeago.format(modifiedDate)} <span class="playlistDetailsSeparator"><i class="bx bxs-circle"></i></span> ${doc.data().tracks ? doc.data().tracks.length : 0 } Track${doc.data().tracks && doc.data().tracks.length == 1 ? "" : "s"} ${lengthString}${lockText}`);
      
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
  
          // Update indexes
          for (let j = 0; j < tracks.length; j++) {
            $(`#music-track-icon-${playlistUID}${playlistID}${tracks[j].randomID}${tracks[j].trackID}`).html(j+1);
          }
        }, 550);
      }

      $(`#${playlistUID}${playlistID}waitingNotice`).addClass('hidden');
  
      $(`#${playlistUID}${playlistID}noTrackNotice`).addClass('hidden');
      if (!tracks.length) {
        $(`#${playlistUID}${playlistID}noTrackNotice`).removeClass('hidden');
      }

      // Success
      resolve(true);
    }, (error) => {
      console.log(error);
      if (`${error}`.includes('insufficient permissions')) {
        resolve(false);
      }
    });

    refreshReviews(playlistUID, playlistID);
  });
}

window.openGenre = async (genreID) => {
  if (currentServer !== 'music') {
    openSpecialServer('music');  
  }
  
  if ($(`#GenreView${genreID}`).length) {
    $(`#GenreView${genreID}`).removeClass('hidden');
    $(`#GenreView${genreID}`).appendTo(`#musicTab_${activeMusicTab}`);
    return;
  }

  const a = document.createElement('div');
  a.innerHTML = `
    <div class="musicViewHeader animated fadeInDown faster">
      <p>Category</p>
      <button id="Genre${genreID}Close" onclick="closeMusicView('Genre', '${genreID}')" class="btn b-3 roundedButton closeButton"><i class="bx bx-x"></i></button>
    </div>
    <div class="musicViewContentContainer">
      <div class="genreTopLevel">
        <h2 id="${genreID}genreTitle" class="genreTitle animated fadeInUp"></h2>
      </div>
      <div class="musicViewContent">
        <h3>Top Albums</h3>
        <div id="Genre${genreID}Albums" class="genreAlbums"></div>
        <h3>Top Tracks</h3>
        <div id="Genre${genreID}Tracks" class="genreTracks"></div>
      </div>
    </div>
  `
  a.setAttribute('class', 'musicView genreView');
  a.id = `GenreView${genreID}`;
  $('#musicTab_' + activeMusicTab).get(0).appendChild(a);

  const genreData = await makeMusicRequest(`genres/${genreID}`);

  $(`#${genreID}genreTitle`).html(genreData.data[0].attributes.name);
  $(`#${genreID}genreTitle`).attr('title', genreData.data[0].attributes.name);

  const charts = await makeMusicRequest(`charts?genre=${genreID}&types=albums,songs,playlists`);
  
  const albums = charts.results.albums[0].data;
  for (let i = 0; i < albums.length; i++) {
    const album = albums[i];
    createAlbum(album, `Genre${genreID}Albums`);
  }

  const tracks = charts.results.songs[0].data;
  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    createTrack(track, `Genre${genreID}Tracks`, i);
  }




  tippy($(`#Genre${genreID}Close`).get(0), {
    content: 'Close',
    placement: 'top',
  });
}

window.openApplePlaylist = async (playlistID, playlistName, fromLibrary, folderContext) => {
  if (fromLibrary) {
    // Expand enclosing folder if it's not already expanded.
    if (!$(`#playlistButtonapple${playlistID}`).parent().hasClass('playlistFolderContentActive')) {
      $(`#playlistButtonapple${playlistID}`).parent().parent().children().first().click();
    }
  }

  if (currentServer !== 'music') {
    openSpecialServer('music');
  }

  musicTab('playlists');
  $(`.playlistView`).addClass('hidden');
  $(`#playlistButtonapple${playlistID}`).addClass('sidebarButtonActive');

  if ($(`#ApplePlaylistView${playlistID}`).length) {
    $(`#ApplePlaylistView${playlistID}`).removeClass('hidden');
    $(`#ApplePlaylistView${playlistID}`).appendTo(`#musicTab_${activeMusicTab}`);

    if (cacheUser.playlists.includes(`apple.${playlistID}.${playlistName}`)) {
      $(`#${playlistID}AddButton`).addClass('hidden');
      $(`#${playlistID}RemoveButton`).removeClass('hidden');
    } else {
      $(`#${playlistID}AddButton`).removeClass('hidden');
      $(`#${playlistID}RemoveButton`).addClass('hidden');
    }

    if (fromLibrary) {
      $(`#ApplePlaylist${playlistID}Close`).addClass('hidden');
    }
    else {
      $(`#ApplePlaylist${playlistID}Close`).removeClass('hidden');
    }
    return;
  }

  const a = document.createElement('div');
  a.innerHTML = `
    <div class="musicViewHeader animated fadeInDown faster">
      <p>Playlist</p>
      <button id="ApplePlaylist${playlistID}Close" onclick="closeMusicView('ApplePlaylist', '${playlistID}')" class="btn b-3 roundedButton closeButton"><i class="bx bx-x"></i></button>
    </div>
    <div class="musicViewContentContainer">
      <div class="playlistTopLevel">
      <img id="${playlistID}playlistViewImage" class="playlistCover invisible fadeIn"></img>
      <div class="playlistDetails">
        <h2 id="${playlistID}playlistTitle" class="playlistTitle animated fadeInUp"></h2>
        <p id="${playlistID}playlistDetailsLine" class="playlistDetailsLine animated fadeIn"></p>
        <button id="${playlistID}PlayTrackButton" class="btn b-1 playButton"><i class='bx bx-play'></i></button> 
        <button id="${playlistID}ShuffleTrackButton"  onclick="playTrack(null, '${playlistID}playlistViewTracksContainer', 0, true)" class="btn b-2 playButton"><i class='bx bx-shuffle'></i></button>     
        <div class="dropdown">
          <button id="playlistDropdownButton${playlistID}" onclick="openDropdown('${playlistID}Dropdown')" class="btn b-4 playlistDropdownButton iconButton dropdownButton"><i class="bx bx-dots-vertical-rounded"></i></button>
          <div id="${playlistID}Dropdown" class="dropdown-content">
            <a id="${playlistID}AddButton" class="btn">Add to Library</a>
            <a id="${playlistID}RemoveButton" class="btn btnDanger">Remove from Library</a>
            <a id="${playlistID}CloneButton" class="btn">Clone Playlist</a>
            <div class="dropdownDivider"></div>
            <a id="${playlistID}copyButton" class="btn">Copy Link</a>
            <a onclick="copyToClipboard('${playlistID}')" class="btn">Copy ID</a>
          </div>
        </div>
        <p id="${playlistID}contentEditable" class="playlistDescription" spellcheck="false" contenteditable="false"></p>
      </div>
    </div>
    <div class="hr"></div>
    <div class="musicViewContent">
      <div class="notice hidden animated fadeIn" id="${playlistID}noTrackNotice">No tracks added to this playlist.</div>
      <div class="tracksContainer" id="${playlistID}playlistViewTracksContainer">
        <div class="notice fetchingTracksNotice animated fadeIn" id="${playlistID}waitingNotice">Fetching tracks...</div>
      </div>
    </div>
    </div>
  `
  a.setAttribute('class', 'musicView applePlaylistView playlistView');
  a.id = `ApplePlaylistView${playlistID}`;
  $(`#musicTab_playlists`).get(0).appendChild(a);

  if (fromLibrary) {
    $(`#ApplePlaylist${playlistID}Close`).addClass('hidden');
  }
  else {
    $(`#ApplePlaylist${playlistID}Close`).removeClass('hidden');
  }

  tippy($(`#ApplePlaylist${playlistID}Close`).get(0), {
    content: 'Close',
    placement: 'top',
  });

  // Make request
  let playlist;
  try {
    playlist = (await makeMusicRequest(`playlists/${playlistID.replaceAll('_', '.')}`)).data[0];
  } catch (error) {
    if (fromLibrary) {
      // Playlist must have been deleted.
      removePlaylistFromLibrary('apple', playlistID, playlistName, folderContext, false, true);
      snac('Playlist Removed', `This playlist has recently been removed. It has been removed from your library.`, 'danger');
    }
  }

  if (playlist.attributes.name !== playlistName && fromLibrary) {
    // Playlist must have been renamed.
    await runTransaction(db, async (transaction) => {
      const sfDoc = await transaction.get(doc(db, `users/${user.uid}`));
  
      let newPlaylistList = [];
  
      for (let i = 0; i < sfDoc.data().playlists.length; i++) {
        const playlist = sfDoc.data().playlists[i].split('.');
        playlistUIDSearch = playlist[0];
        playlistIDSearch = playlist[1];
        playlistNameOld = playlist[2];
  
        if (playlistIDSearch == `${playlistID}` && playlistUID == playlistUIDSearch) {
          newPlaylistList.push(`${playlistUID}.${playlistIDSearch}.${playlist.attributes.name}`);
        }
        else {
          newPlaylistList.push(sfDoc.data().playlists[i]);
        }
      }
  
      transaction.update(doc(db, `users/${user.uid}`), {
        playlists: newPlaylistList,
      });
    });

    snac('Playlist Updated', `This playlist has recently been renamed. We've synced the changes for you. `, 'success');
  }

  $(`#${playlistID}playlistTitle`).html(playlist.attributes.name);
  $(`#${playlistID}playlistTitle`).attr('title', playlist.attributes.name);
  $(`#${playlistID}playlistDetailsLine`).html(`Apple Music <span class="playlistDetailsSeparator"><i class="bx bxs-circle"></i></span> Updated ${timeago.format(playlist.attributes.lastModifiedDate)}`);
  $(`#${playlistID}contentEditable`).html(playlist.attributes.description.standard);

  $(`#${playlistID}playlistViewImage`).attr('src', `${playlist.attributes.artwork.url.replaceAll(`{w}`, '800').replaceAll(`{h}`, '800')}`);
  displayImageAnimation(`${playlistID}playlistViewImage`);

  const tracks = (await makeMusicRequest(`playlists/${playlistID.replaceAll('_', '.')}?include=tracks&extend=`)).data[0].relationships.tracks.data;

  $(`#${playlistID}waitingNotice`).addClass('hidden');

  if (tracks.length === 0) {
    $(`#${playlistID}noTrackNotice`).removeClass('hidden');
    $(`#${playlistID}playlistViewTracksContainer`).addClass('hidden');
  }

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    createTrack(track, `${playlistID}playlistViewTracksContainer`, i, false, [], false, false, false);
  }

  if (cacheUser.playlists.includes(`apple.${playlistID}.${playlist.attributes.name}`)) {
    $(`#${playlistID}AddButton`).addClass('hidden');
    $(`#${playlistID}RemoveButton`).removeClass('hidden');
  } else {
    $(`#${playlistID}AddButton`).removeClass('hidden');
    $(`#${playlistID}RemoveButton`).addClass('hidden');
  }

  $(`#${playlistID}copyButton`).get(0).onclick = () => {
    copyToClipboard(`${playlist.attributes.url}`);
  }

  $(`#${playlistID}AddButton`).get(0).onclick = () => {
    addPlaylistToLibrary('apple', playlistID, playlist.attributes.name);
  }

  $(`#${playlistID}RemoveButton`).get(0).onclick = () => {
    removePlaylistFromLibrary('apple', playlistID, playlist.attributes.name, folderContext, false, true);
  }

  $(`#${playlistID}PlayTrackButton`).get(0).onclick = () => {
    playTrack(null, `${playlistID}playlistViewTracksContainer`, 0);
  }

  $(`#${playlistID}ShuffleTrackButton`).get(0).onclick = () => {
    playTrack(null, `${playlistID}playlistViewTracksContainer`, 0, true);
  }

  $(`#${playlistID}CloneButton`).get(0).onclick = async () => {
    const playlistID = await createPlaylist(false, securityConfirmTextIDs(playlist.attributes.name, true), true, false);
    let playlistTracks = [];
    let totalDuration = 0; 
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      playlistTracks.push({
        randomID: `${new Date().getTime()}`,
        trackID: `${track.id}`,
      });
      totalDuration += track.attributes.durationInMillis;
    }
    await updateDoc(doc(db, `users/${user.uid}/playlists/${playlistID}`), {
      tracks: playlistTracks,
      totalDuration: totalDuration,
      description: playlist.attributes.description.standard,
    });
    snac('Playlist Cloned', 'The playlist was cloned to your library successfully.', 'success');
  }

}

window.openAlbum = async (albumIDInput, trackID) => {
  if (currentServer !== 'music') {
    openSpecialServer('music');  
  }

  (editorModePlaylist ? exitEditorModePlaylist(editorModePlaylist) : null);

  let albumID = albumIDInput;
  if (trackID) {
    const trackData = await makeMusicRequest(`songs/${trackID}`);
    albumID = trackData.data[0].relationships.albums.data[0].id
  }

  if ($(`#AlbumView${albumID}`).length) {
    $(`#AlbumView${albumID}`).removeClass('hidden');
    $(`#AlbumView${albumID}`).appendTo(`#musicTab_${activeMusicTab}`);
    return;
  }

  const a = document.createElement('div');
  a.innerHTML = `
    <div class="musicViewHeader animated fadeInDown faster">
      <p>Album</p>
      <button id="Album${albumID}Close" onclick="closeMusicView('Album', '${albumID}')" class="btn b-3 roundedButton closeButton"><i class="bx bx-x"></i></button>
    </div>
    <div class="musicViewContentContainer">
      <div id="${albumID}heroBanner" class="heroBanner"></div>
      <div class="albumTopLevel">
        <img id="${albumID}albumViewImage" class="albumCover invisible"/>
        <div class="albumDetails">
          <h2 id="${albumID}albumTitle" class="albumName animated fadeInUp"></h2>
          <p id="${albumID}albumDetailsLine" class="albumDetailsLine animated fadeIn"></p>
          <div class="albumFlexRow">
            <div>
              <button id="Album${albumID}PlayButton" class="btn b-1 playButton2"><i class='bx bx-play'></i></button> 
              <button id="Album${albumID}ShuffleButton" class="btn b-2 playButton2"><i class='bx bx-shuffle'></i></button>
              <div class="dropdown">
                <button id="albumDropdownButton${albumID}" onclick="openDropdown('${albumID}AlbumDropdown')" class="btn b-4 playlistDropdownButton iconButton dropdownButton"><i class="bx bx-dots-vertical-rounded"></i></button>
                <div id="${albumID}AlbumDropdown" class="dropdown-content">
                  <a id="${albumID}AddButton" class="btn playlistButtonContext acceptLeftClick">Add to Playlist</a>
                  <div class="dropdownDivider"></div>
                  <a onclick="copyToClipboard('https://parallel.r0h.in/preview?albumID=${albumID}')" class="btn">Copy Link</a>
                  <a onclick="copyToClipboard('${albumID}')" class="btn">Copy ID</a>
                </div>
              </div>
            </div>
            <div id="Album${albumID}LikeContainer"></div>
          </div>
          <p id="Album${albumID}Description" class="albumDescription"></p>
        </div>
      </div>
      <div class="hr"></div>
      <div class="musicViewContent">
        <div class="tracksContainer" id="${albumID}albumViewTracksContainer"></div>
        <div class="hr"></div>
        <div id="album${albumID}VersionsContainer" class="hidden">
          <h3 class="albumSectionTitle">Other Versions</h3>
          <div class="versionAlbums" id="Album${albumID}Versions"></div>
        </div>

        <div id="album${albumID}SimilarContainer" class="hidden">
          <h3 class="albumSectionTitle">Related Albums</h3>
          <div class="similarAlbums" id="Album${albumID}Similar"></div>
        </div>

        <div id="${albumID}reviewSection" class="reviewSection animated fadeIn hidden">
          <div class="reviewSectionHeader">
            <b>Reviews</b>
            <div>
            <button id="${albumID}addReviewButton" class="btn b-0 hidden"><i class="bx bx-plus"></i></button>
            <button id="${albumID}editReviewButton" class="btn b-0 hidden"><i class="bx bx-pencil"></i></button>
            <button id="${albumID}removeReviewButton" class="btn b-0 hidden"><i class="bx bx-trash"></i></button>
            <button id="${albumID}refreshReviewButton" class="btn b-0"><i class="bx bx-refresh"></i></button>
            <button id="${albumID}sortReviewButton" mode="0" class="btn b-0">
              <i class="bx bx-sort"></i>
              <i class="bx bx-time"></i>
            </button>
            </div>
          </div>
          <div class="reviewSectionContent" id="${albumID}reviewSectionContent">
            <div class="noReviews hidden animated fadeIn" id="${albumID}reviewSectionContentNone">
              <i class="bx bx-file-blank"></i>
              <p>No reviews yet. Be the first to add one.</p>
            </div>
            <div class="reviewSectionContentContent" id="${albumID}reviewSectionContentContent"></div>
          </div>
        </div>
      </div>
      <div></div>
    </div>
  `
  a.setAttribute('class', 'musicView albumView');
  a.id = `AlbumView${albumID}`;
  $('#musicTab_' + activeMusicTab).get(0).appendChild(a);

  $(`#Album${albumID}PlayButton`).get(0).onclick = () => {
    playTrack(null, `${albumID}albumViewTracksContainer`, 0, false)
  }

  $(`#Album${albumID}ShuffleButton`).get(0).onclick = () => {
    playTrack(null, `${albumID}albumViewTracksContainer`, 0, true)
  }

  let likeSnippet = '';
  if (cacheLibraryAlbums.includes(albumID)) {
    likeSnippet = `<div class="mainFavButton"><button onclick="removeFromLibrary('albums', '${albumID}')" class="btn b-1 iconButton favButton likedButtonalbums${albumID}"> <i class="bx bxs-heart"></i> </button></div>`
  }
  else {
    likeSnippet = `<div class="mainFavButton"><button onclick="addToLibrary('albums', '${albumID}')" class="btn b-1 iconButton favButton likedButtonalbums${albumID}"> <i class="bx bx-heart"></i> </button></div>`
  }

  $(`#Album${albumID}LikeContainer`).html(likeSnippet);

  const album = await makeMusicRequest(`albums/${albumID}?views=related-albums,other-versions`);
  const albumData = album.data[0];

  if (albumData.attributes.editorialNotes && albumData.attributes.editorialNotes.short)
  $(`#Album${albumID}Description`).html(albumData.attributes.editorialNotes.short);
  
  $(`#${albumID}albumViewImage`).get(0).src = `${albumData.attributes.artwork.url.replace('{w}', 500).replace('{h}', 500) || placeholderAlbumImage}`;
  displayImageAnimation(`${albumID}albumViewImage`);

  $(`#${albumID}albumDetailsLine`).html(`By <span id="Album${albumID}ArtistText" class="albumArtist">${albumData.attributes.artistName}</span> <span class="albumDetailsSeparator"><i class="bx bxs-circle"></i></span> ${albumData.attributes.releaseDate} `)
  $(`#Album${albumID}ArtistText`).get(0).onclick = (event) => {
    setContextSelectArtistItems(null, null, null, albumData.relationships.artists.data, event);
  }

  $(`#${albumID}albumTitle`).html(albumData.attributes.name);
  $(`#${albumID}albumTitle`).attr('title', albumData.attributes.name);

  tippy($(`#Album${albumID}Close`).get(0), {
    content: 'Close',
    placement: 'top',
  });

  tippy($(`#Album${albumID}PlayButton`).get(0), {
    content: 'Play',
    placement: 'top',
  });

  tippy($(`#Album${albumID}ShuffleButton`).get(0), {
    content: 'Shuffle',
    placement: 'top',
  });

  $(`#${albumID}AddButton`).get(0).onclick = () => {
    playlistSelector(null, albumID);
  }

  $(`#${albumID}albumViewImage`).get(0).setAttribute('crossOrigin', '');
  $(`#${albumID}albumViewImage`).get(0).addEventListener('load', () => {
    // Color banner.
    $(`#${albumID}albumViewImage`).removeClass('invisible');
    const colors = colorThief.getColor($(`#${albumID}albumViewImage`).get(0));
    $(`#${albumID}heroBanner`).get(0).setAttribute('style', `background-color: rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, 1)`);
  });

  const tracks = albumData.relationships.tracks.data;
  let index = 0; // Index to not be affected by music-videos.
  for (let i = 0; i < tracks.length; i++) {
    if (tracks[i].type == 'music-videos') { continue };
    const track = tracks[i];
    createTrack(track, `${albumID}albumViewTracksContainer`, index, null, []);
    index++;
  }

  const similarAlbums = albumData.views['related-albums'].data;
  if (similarAlbums.length) {
    $(`#album${albumID}SimilarContainer`).removeClass('hidden');
  }
  for (let i = 0; i < similarAlbums.length; i++) {
    const album = similarAlbums[i];
    createAlbum(album, `Album${albumID}Similar`);
  }

  const versions = albumData.views['other-versions'].data;
  if (versions.length) {
    $(`#album${albumID}VersionsContainer`).removeClass('hidden');
  }
  for (let i = 0; i < versions.length; i++) {
    const album = versions[i];
    createAlbum(album, `Album${albumID}Versions`);
  }

  $(`#${albumID}addReviewButton`).get(0).onclick = () => {
    openModal('reviewDraft');

    $('#confirmReviewPost').get(0).onclick = async () => {
      closeModal();

      const reviewText = $('#reviewDraftTextarea').val();

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
      const addReviewToAlbum = httpsCallable(functions, 'addReviewToAlbum');
      const result = await addReviewToAlbum({
        albumID: albumID,
        reviewText: $('#reviewDraftTextarea').val(),
      });

      if (result.data.data == true) {
        snac('Review Added', 'Your review was added to the playlist.', 'success');
        refreshAlbumReviews(albumID);
      }
      else {
        copyToClipboard(reviewText, true);
        console.log(reviewText);
        snac('Review Error', `${result.data.data} Your review draft was copied to your clipboard.`, 'danger');
      }
    };
  }

  $(`#${albumID}refreshReviewButton`).get(0).onclick = () => {
    // Disable button
    disableButton($(`#${albumID}refreshReviewButton`));
    refreshAlbumReviews(albumID);
    window.setTimeout(() => {
      enableButton($(`#${albumID}refreshReviewButton`), `<i class="bx bx-refresh"></i>`);
    }, 1999);
  }

  $(`#${albumID}sortReviewButton`).get(0).onclick = () => {
    const mode = $(`#${albumID}sortReviewButton`).get(0).getAttribute('mode');

    if (mode === '0') {
      $(`#${albumID}sortReviewButton`).get(0).setAttribute('mode', '1');
      $(`#${albumID}sortReviewButton`).get(0).innerHTML = `
        <i class="bx bx-sort"></i>
        <i class="bx bx-time-five"></i>
      `;

      // Sort all elements in container
      $(`#${albumID}reviewSectionContentContent`).find('.review').sort(function(a, b) {
        return +b.getAttribute('ts') - +a.getAttribute('ts');
      }).appendTo($(`#${albumID}reviewSectionContentContent`));
    }
    else {
      $(`#${albumID}sortReviewButton`).get(0).setAttribute('mode', '0');
      $(`#${albumID}sortReviewButton`).get(0).innerHTML = `
        <i class="bx bx-sort"></i>
        <i class="bx bx-time"></i>
      `;

      // Sort all elements in container
      $(`#${albumID}reviewSectionContentContent`).find('.review').sort(function(a, b) {
        return +a.getAttribute('ts') - +b.getAttribute('ts');
      }).appendTo($(`#${albumID}reviewSectionContentContent`));
    }
  }

  tippy($(`#${albumID}addReviewButton`).get(0), {
    content: 'Add Review',
    placement: 'top',
  });

  tippy($(`#${albumID}editReviewButton`).get(0), {
    content: 'Edit Review',
    placement: 'top',
  });

  tippy($(`#${albumID}removeReviewButton`).get(0), {
    content: 'Delete Review',
    placement: 'top',
  });

  tippy($(`#${albumID}refreshReviewButton`).get(0), {
    content: 'Refresh',
    placement: 'top',
  });

  tippy($(`#${albumID}sortReviewButton`).get(0), {
    content: 'Toggle Sort Direction',
    placement: 'top',
  });

  refreshAlbumReviews(albumID);
}

function refreshAlbumReviews(albumID) {
  $(`#${albumID}reviewSectionContentContent`).empty();
  loadAlbumReviews(albumID);
}

function editAlbumReview(albumID, reviewText) {
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

    const editAlbumReviewFunc = httpsCallable(functions, 'editAlbumReview');
    const result = await editAlbumReviewFunc({
      albumID: albumID,
      reviewText: $('#reviewEditTextarea').val(),
    });

    if (result.data.data == true) {
      snac('Review Updated', 'Your review was edited successfully.', 'success');
      $(`#${albumID}${user.uid}ReviewText`).html(reviewText);

      $(`#${albumID}editReviewButton`).get(0).onclick = () => {
        editAlbumReview(albumID, reviewText)
      }
    }
    else {
      copyToClipboard(reviewText, true);
      console.log(reviewText);
      snac('Review Error', `${result.data.data} Your review draft was copied to your clipboard.`, 'danger');
    }
  };
}

function removeOwnAlbumReview(albumID) {
  openModal('confirmDeleteReview');
  $('#reviewConfirmDelete').get(0).onclick = async () => {
    closeModal();
    disableButton($(`#${albumID}${user.uid}ReviewDelete`));
    disableButton($(`#${albumID}removeReviewButton`));
    notifyTiny('Deleting review...');

    const deleteAlbumReview = httpsCallable(functions, 'deleteAlbumReview');
    const result = await deleteAlbumReview({
      albumID: albumID,
    });

    enableButton($(`#${albumID}removeReviewButton`), `<i class="bx bx-trash"></i>`);

    if (result.data.data == true) {
      $(`#${albumID}addReviewButton`).removeClass('hidden')
      $(`#${albumID}editReviewButton`).addClass('hidden')
      $(`#${albumID}removeReviewButton`).addClass('hidden')
      snac('Review Deleted', 'Your review was deleted successfully.', 'success');
      $(`#${albumID}Review${user.uid}Container`).css('height', $(`#${albumID}Review${user.uid}Container`).height());
      window.setTimeout(() => {
        $(`#${albumID}Review${user.uid}Container`).addClass("reviewGone")
        window.setTimeout(() => {
          $(`#${albumID}Review${user.uid}Container`).remove();
        }, 999);
      }, 99);
    }
    else {
      snac('Review Error', `${result.data.data}`, 'danger');
    }
  };
}

function loadAlbumReviews(albumID) {
  getDoc(doc(db, `reviews/${albumID}`)).then(async (doc) => {
    $(`#${albumID}reviewSection`).removeClass('hidden');
    $(`#${albumID}reviewSectionContentNone`).addClass('hidden');

    $(`#${albumID}addReviewButton`).removeClass('hidden');
    $(`#${albumID}removeReviewButton`).addClass('hidden');
    $(`#${albumID}editReviewButton`).addClass('hidden');

    console.log(doc.data())

    if (!doc.exists() || !Object.keys(doc.data()).length) {
      $(`#${albumID}reviewSectionContentNone`).removeClass('hidden');
    }
    else {
      if (doc.data()[user.uid] && Object.keys(doc.data()[user.uid]).length) {
        $(`#${albumID}addReviewButton`).addClass('hidden');
        $(`#${albumID}removeReviewButton`).removeClass('hidden');
        $(`#${albumID}editReviewButton`).removeClass('hidden');

        $(`#${albumID}editReviewButton`).get(0).onclick = () => {
          editAlbumReview(albumID, doc.data()[user.uid]['text'])
        }

        $(`#${albumID}removeReviewButton`).get(0).onclick = () => {
          removeOwnAlbumReview(albumID);
        }
      }

      // Build the reviews now
      const reviews = Object.keys(doc.data());
      for (let i = 0; i < reviews.length; i++) {
        const review = doc.data()[reviews[i]];

        const a = document.createElement('div');
        a.classList.add('review');
        a.id = `${albumID}Review${review.uid}Container`;
        a.setAttribute('ts', review.timestamp);
        a.innerHTML = `
          <div class="review-header">
            <div class="review-header-left">
              <img onclick="openUserCard('${review.uid}')" id="${albumID}${review.uid}ReviewPhoto"></img>
              <div onclick="openUserCard('${review.uid}')" class="review-header-left-text">${review.username.capitalize()}</div>
            </div>
            <div class="review-header-right">
              <div class="review-header-right-text">
                <div class="review-header-right-text-name">Updated ${timeago.format(new Date(review.timestamp))}.</div>
              </div>
              <button id="${albumID}${review.uid}ReviewDelete" class="btn b-4 hidden"><i class="bx bx-trash"></i></button>
            </div>
          </div>
          <div class="review-content">
            <p id="${albumID}${review.uid}ReviewText">${review.text}</p>
          </div>
        `;
        $(`#${albumID}reviewSectionContentContent`).append(a);

        tippy($(`#${albumID}${review.uid}ReviewDelete`).get(0), {
          content: 'Delete Review',
          placement: 'top',
        });

        if (review.uid == user.uid) {
          $(`#${albumID}${review.uid}ReviewDelete`).removeClass('hidden');
          $(`#${albumID}${review.uid}ReviewDelete`).get(0).onclick = () => {
            removeOwnAlbumReview(albumID);
          }
        }

        $(`#${albumID}${review.uid}ReviewPhoto`).get(0).src = await returnProperURL(review.uid);
        displayImageAnimation(`${albumID}${review.uid}ReviewPhoto`);
      }

      // Sort all elements in container
      $(`#${albumID}reviewSectionContentContent`).find('.review').sort(function(a, b) {
        return +a.getAttribute('ts') - +b.getAttribute('ts');
      }).appendTo($(`#${albumID}reviewSectionContentContent`));
    }
  });
}

window.closeMusicView = (musicType, musicID) => {
  if (musicType == 'Playlist') {
    // Social playlist;
    musicTab('friends');
    return;
  }
  $(`#${musicType}View${musicID}`).addClass('hidden');
}

window.shuffleList = (container) => {
  musicQueue = [];
  clearQueue()

  $(container).children('.track').each((i, obj) => {
    const trackID = $(obj).get(0).getAttribute('trackid');
    musicQueue.push(trackID)
  });
  
  shuffleArray(musicQueue); // Randomize array.

  for (let i = 0; i < musicQueue.length; i++) {
    updateQueue('appendQueue', musicCatalogue[musicQueue[i]], false);    
  }

  if (musicQueue.length) {
    initalizePlayback(musicQueue[0]) // Play first song.

    updateQueue('removeQueue', musicQueue[0], false, 0);
    musicQueue.splice(0, 1); // Remove first from queue.
  }
  else {
    snac("Shuffle Error", "No tracks available to shuffle.", "danger");
  }

}

window.playASong = (trackID) => {
  if (activeListeningParty) {
    openModal('leavePartyCheck');
    $(`#confirmLeaveParty`).get(0).onclick = () => {
      leaveListeningParty(activeListeningParty.split('/')[0], activeListeningParty.split('/')[1], activeListeningParty.split('/')[2]);
      playASong(trackID);
      closeModal();
    }
    return;
  }

  document.activeElement.blur();
  musicQueue = [];
  updateQueue('removeQueue');
  initalizePlayback(trackID);
}

export async function initalizePlayback(trackID) {
  if (activeListeningParty) {
    openModal('leavePartyCheck');
    $(`#confirmLeaveParty`).get(0).onclick = () => {
      leaveListeningParty(activeListeningParty.split('/')[0], activeListeningParty.split('/')[1], activeListeningParty.split('/')[2]);
      initalizePlayback(trackID);
      closeModal();
    }
    return;
  }

  setNoTrackUI();

  const trackDetails = await makeMusicRequest(`songs/${trackID}?include=artists`);  

  musicPlaying = trackDetails.data[0];
  
  updateQueue('nowPlaying', musicPlaying, false);
  
  sendTrackToPlayerRevamp(musicPlaying, `#libraryPlayer`);
  
  window.setTimeout(() => {
    setTrackUI(musicPlaying);
  }, 1499);

  setMusicStatus(musicPlaying, true);
}

export function pauseMusicButton() {
  $(`#libraryPlayer`).get(0).pause();
  document.activeElement.blur();
}

function playMusicButton() {
  $(`#libraryPlayer`).get(0).play();
  document.activeElement.blur();
}

function playerDidEnd() {
  if (enableLoopConst) {
    libraryPlayer.restart();
    $(`#libraryPlayer`).get(0).play();
    // snac('Replaying current track.', '', '');
    return;
  }

  console.log('Source cleared.')
  libraryPlayerElement.src = '';
  forwardSong();
}

export function backwardSong() {
  if (libraryPlayer.currentTime < 10) {
    // Under six seconds. Go to previous song.
    if (musicBack.length) {
      musicQueue.unshift(musicPlaying.id); // Add to first element of queue
      updateQueue('appendQueue', musicCatalogue[musicPlaying.id], true);

      initalizePlayback(musicBack[musicBack .length-1])

      // Remove first element of music history
      musicBack.splice((musicBack.length-1), 1);
      return;
    }
    else {
      libraryPlayer.restart();
    }
  }
  // Over six seconds. Go to beggining of song.
  libraryPlayer.restart();
}

export function forwardSong() {
  if (skipTimeout) {
    notifyTiny('Please wait a few moments.');
    return;
  }
  else {
    skipTimeout = true;
    window.setTimeout(() => {
      skipTimeout = false;
    }, 2999);
  }

  if (Object.keys(musicPlaying).length) {
    updateQueue('appendHistory', musicPlaying, true);
    musicHistory.push(musicPlaying.id);
  }
  musicPlaying = {};
  
  if (musicQueue.length) { // To next song in queue
    updateQueue('removeQueue', musicQueue[0], false, 0);
    initalizePlayback(musicQueue[0]);
    musicQueue.splice(0, 1); // Delete first element from queue

  }
  else { // no song next in queue
    $(`#libraryPlayer`).get(0).pause();
    hidePlaybackView();
    updateQueue('nowPlaying');
    setMusicStatus(false);
  }
}

export function switchToHistory() {
  $(`#updateQueueText`).html('View Queue');
  $(`#updateQueueText`).get(0).onclick = () => switchToQueue();

  $('#queueItems').addClass('hidden');
  $('#historyItems').removeClass('hidden');
  $('#queueClear').addClass('hidden');
  $('#historyClear').removeClass('hidden');
  $('#queueNotice').addClass('hidden');
  $('#historyNotice').removeClass('hidden');
  
  $('#upNowText').html('History');
}

function switchToQueue() {
  $(`#updateQueueText`).html('View History');
  $(`#updateQueueText`).get(0).onclick = () => switchToHistory();

  $('#historyItems').addClass('hidden');
  $('#queueItems').removeClass('hidden');
  $('#historyClear').addClass('hidden');
  $('#queueClear').removeClass('hidden');
  $('#historyNotice').addClass('hidden');
  $('#queueNotice').removeClass('hidden');

  $('#upNowText').html('Up Next');
}

export function updateQueue(operationType, track, prependInstead, removeNthInstance) {

  switch (operationType) {
    case 'appendQueue':
      createTrack(track, 'queueItems', 2, `QueueItem${track.id}${new Date().getTime()}`, ["fromQueue", true], prependInstead);
      redoQueueIndexes();
      break;
    case 'removeQueue':
      if (!track) {
        console.log('empty queue')
        $(`#queueItems`).empty(); // Empty queue if unspecified
      }
      else {
        // Find the special ID with track ID and nth index.
        $(`#queueItems`).children(`.music-track-${track}`).eq(removeNthInstance).remove();
        redoQueueIndexes();
      }
      break;
    case 'appendHistory':
      createTrack(track, 'historyItems', false, `QueueItem${track.id}${new Date().getTime()}`, ["fromQueue", true], prependInstead);
      break;
    case 'removeHistory':
      if (!track) {
        $(`#historyItems`).empty();
      }
      else {
        $(`#historyItems`).children(`.music-track-${track.id}`).eq(removeNthInstance).remove();
        redoQueueIndexes();
      }
      break;
    case 'nowPlaying':
      // Replace now playing div
      $(`.nowPlayingTitle`).removeClass('nowPlayingTitle');
      $('#nowPlaying').empty();
      if (track) {
        $('#nowPlayingText').html('Now Playing');
        createTrack(track, `nowPlaying`, true, true, false, false, false, false, false, false);
        $(`.trackTitle${track.id}`).addClass('nowPlayingTitle');
      }
      else {
        $('#nowPlayingText').html('<span style="color: var(--secondary)">Nothing Playing</span>');
      }
      break;
    default:
      break;
  }

  if (musicQueue.length) {
    $('#queueClearButton').removeClass('hidden');
    $('#queueNoticeText').addClass('hidden');
  }
  else {
    $('#queueNoticeText').removeClass('hidden');
    $('#queueClearButton').addClass('hidden');
  }

  if (musicHistory.length) {
    $('#historyNoticeText').addClass('hidden');
    $('#historyClearButton').removeClass('hidden');
  }
  else {
    $('#historyNoticeText').removeClass('hidden');
    $('#historyClearButton').addClass('hidden');
  }

  $(`#queueHeader`).removeClass('hidden');
  if (!musicHistory.length && !musicQueue.length) {
    $(`#queueHeader`).addClass("hidden");
  }
}

function redoQueueIndexes() {
  window.setTimeout(() => {
    for (let i = 0; i < musicQueue.length; i++) {
      $(`#queueItems`).children().eq(i).children().eq(0).children().eq(0).html((i+1));
      $(`#queueItems`).children().eq(i).get(0).onclick = () => {
        playTrack(musicQueue[i], 'queueItems', i);
      };
    }
  }, 150);
}

// Sortable Stuff
enableQueueSort();
function enableQueueSort() {
  if (!$(`#queueItems`).length) { return };
  Sortable.create($(`#queueItems`).get(0), {
    ghostClass: 'sortableGhost',
    onEnd: (e) => {
      const oldIndex = e.oldIndex;
      const newIndex = e.newIndex;
      
      musicQueue = [];
      $(`#queueItems`).children().each((index, object) => {
        musicQueue.push(`${$(object).attr('trackID')}`);
      })

      redoQueueIndexes();

      console.log(`Performed sort from ${oldIndex} to ${newIndex}`);
    }
  });
}

export function clearQueue() {
  musicQueue = [];
  updateQueue('removeQueue');
}

export function clearHistory() {
  musicHistory = [];
  updateQueue('removeHistory')
}

export function clearMusicViews(tab) {
  $(`#musicTab_${tab}`).children('.musicView').each((index, obj) => {
    $(obj).addClass('hidden');
  });
}

export function clearMusicViewsPlaylist() {
  $(`#musicTab_playlists`).children('.artistView,.albumView').each((index, obj) => {
    $(obj).addClass('hidden');
  });
}

export function enableLoop(trackID) {
  enableLoopConst = trackID;

  $(`#currentTrackTitle`).addClass("loopedSongHighlight");
  
  snac('Track Loop', 'Now looping current song.', 'success');
}

export function disableLoop(trackID) {
  enableLoopConst = '';
  
  $(`#currentTrackTitle`).removeClass("loopedSongHighlight");

  snac('Track Loop', 'No longer looping current song.', 'success');
}

// Copy Spotify Playlists

window.stateKey = 'spotify_auth_state';

export async function loginSpotify() {
  const clientID = 'b2b0e41d0a3e4464b12eba666a1de36d';
  const redirectURL = window.location.origin + "/app.html";

  var state = generateRandomString(16);

  localStorage.setItem(stateKey, state);
  var scope = 'user-read-private playlist-read-private playlist-read-collaborative user-library-read';

  var url = 'https://accounts.spotify.com/authorize';
  url += '?response_type=token';
  url += '&client_id=' + encodeURIComponent(clientID);
  url += '&scope=' + encodeURIComponent(scope);
  url += '&redirect_uri=' + encodeURIComponent(redirectURL);
  url += '&state=' + encodeURIComponent(state);

  window.location.replace(url);
}

function getHashParams() {
  var hashParams = {};
  var e, r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
  while ( e = r.exec(q)) {
     hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}

function generateRandomString(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

export function manageSpotify() {
  const params = getHashParams();
  const access_token = params.access_token,
    state = params.state,
    storedState = localStorage.getItem(stateKey);
  
  $(`#spotifyUnsigned`).removeClass('hidden');
  $(`#spotifySigned`).addClass('hidden');
  $(`#spotifySigned2`).addClass('hidden');

  if (access_token) {
    localStorage.removeItem(stateKey);
    if (access_token) {
      $(`#spotifyUnsigned`).addClass('hidden');
      $(`#spotifySigned`).removeClass('hidden');
      $(`#spotifySigned2`).removeClass('hidden');
      loadSignedInSpotify(access_token);
      spotifyToken = access_token;
    }
  }
}

async function loadSignedInSpotify(token) {
  snac("Spotify Connected", "Your Spotify account is now connected to Parallel for this session. Navigate to <b>Settings > More > Transfer</b> to start managing playlists.", "success");

  const myProfileFetch = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + token,
      "Content-Type": "application/json"
    }
  });

  const myProfile = await myProfileFetch.json();


  $(`#spotifySignedInDetails`).html(`
    Signed in as
    <img src="${myProfile.images[0].url}" />
    ${myProfile.display_name}
  `)

  // Get playlists!

  const myPlaylistsFetch = await fetch("https://api.spotify.com/v1/me/playlists", {
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + token,
      "Content-Type": "application/json"
    }
  });

  const myPlaylists = await myPlaylistsFetch.json();

  $(`#spotifyPlaylistList`).empty();

  for (let i = 0; i < myPlaylists.items.length; i++) {
    const playlist = myPlaylists.items[i];
    
    const a = document.createElement('div');
    a.setAttribute('class', 'spotifyPlaylistItem');
    a.onclick = () => prepareTransferPlaylist(playlist.id, token, playlist.name);
    a.innerHTML = `${playlist.name}`;
    $(`#spotifyPlaylistList`).get(0).appendChild(a);

  }

}

function prepareTransferPlaylist(playlistID, token, playlistName) {
  // Open confirmation modal
  openModal('confirmTransfer');
  $(`#confirmTransferText`).html(`Are you sure you would like to transfer the playlist, "${playlistName}", to your Parallel library? Please keep Parallel open until completion. This process may take a few moments.`);
  $(`#confirmTransferButton`).get(0).onclick = async () => {
    // convert playlist of PlaylistID 
    closeModal();

    const aPlaylistFetch = await fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + token,
        "Content-Type": "application/json"
      }
    });

    const aPlaylist = await aPlaylistFetch.json();

    // Create Parallel playlist
    const parallelPlaylistID = await createPlaylist(null, `${securityConfirmTextIDs(playlistName, true)}`, true, false, "Imported from Spotify.");

    if (!parallelPlaylistID) {
      snac('Could not create playlist.', '', 'error')
      return;
    }

    let tracksToAdd = [];
    let cumulativeLength = 0;
    let erroredTracks = [];

    for (let i = 0; i < aPlaylist.items.length; i++) {
      const spotifyTrack = aPlaylist.items[i];
 
      const trackData = await makeMusicRequest(`search?term=${encodeURIComponent(spotifyTrack.track.artists[0].name)} ${encodeURIComponent(spotifyTrack.track.name)}&limit=1`);

      try {
        if (trackData.results.songs.data.length) {
          tracksToAdd.push({
            trackID: `${trackData.results.songs.data[0].id}`,
            randomID: `${new Date().getTime()}`
          });
          cumulativeLength += trackData.results.songs.data[0].durationInMillis;
        }
      } catch (error) {
        erroredTracks.push(`${spotifyTrack.track.artists[0].name} - ${spotifyTrack.track.name}`);
      }

      notifyTiny(`${i + 1} / ${aPlaylist.items.length} done.`);
    }

    await updateDoc(doc(db, `users/${user.uid}/playlists/${parallelPlaylistID}`), {
      totalDuration: cumulativeLength,
      tracks: tracksToAdd,
    });

    snac('Playlist Transferred.', 'Your playlist has been successfully transferred to Parallel. Happy listening!', 'success');

    if (erroredTracks.length) {
      openModal('errorTransfer');
      $(`#trackListError`).html(``)
      for (let i = 0; i < erroredTracks.length; i++) {
        $(`#trackListError`).append(`<li>${erroredTracks[i]}</li>`);
      }
    }
  }
}

export function openModifyPointerModal(trackID) {
  openModal('updateTargetURL');

  $('#newYouTubeID').get(0).addEventListener("keyup", function(event) {
    if (event.keyCode === 13) { event.preventDefault(); $(`#updateYouTubeIDConfirm`).get(0).click(); }
  });

  $(`#clearYouTubeIDConfirm`).get(0).onclick = async () => {
    const confirmBox = confirm('Confirm request. Sent by user ' + user.uid);
    
    closeModal();
    if (confirmBox) {
      const updateTrackURL = httpsCallable(functions, 'updateTrackURL');
      const result = await updateTrackURL({trackID: trackID, linkURL: ''});
  
      snac('Request Returned', JSON.stringify(result));
    }
  }

  $(`#updateYouTubeIDConfirm`).get(0).onclick = async () => {
    const confirmBox = confirm('Confirm request. Sent by user ' + user.uid);
    
    closeModal();
    const newLink = $(`#newYouTubeID`).val();
    $(`#newYouTubeID`).val('');

    if (confirmBox) {
      const updateTrackURL = httpsCallable(functions, 'updateTrackURL');
      const result = await updateTrackURL({trackID: trackID, linkURL: newLink});

      snac('Request Returned', JSON.stringify(result));
    }
    
  }
}

window.playTrackByMessage = (el, id) => {
  $(el).addClass('disabled');
  playASong(id);
  window.setTimeout(() => {
    $(el).removeClass('disabled');
  }, 2900);
}

export function loadRecentSearches() {
  $(`#recentSearches`).empty();
  $(`#recentSearches2`).empty();

  const recentSearches = JSON.parse(sessionStorage.getItem('recentSearches'));
  
  if (!recentSearches) {
    return;
  }
  
  recentSearches.reverse();

  for (let i = 0; i < recentSearches.length; i++) {
    const a = document.createElement('div');
    const b = document.createElement('div');
    a.setAttribute('class', 'recentSearchItem');
    b.setAttribute('class', 'recentSearchItem');
    a.onclick = () => {
      $('#searchMusic').val(recentSearches[i]);
      searchMusicButton();
    }
    b.onclick = () => {
      $('#searchMusic').val(recentSearches[i]);
      searchMusicButton();
    }
    a.innerHTML = `${recentSearches[i]}`;
    b.innerHTML = `${recentSearches[i]}`;
    $(`#recentSearches`).get(0).appendChild(a);
    $(`#recentSearches2`).get(0).appendChild(b);
  }
}

function addToRecentSearches(searchTerm) {
  let recentSearches = JSON.parse(sessionStorage.getItem('recentSearches'));
  if (!recentSearches) {
    recentSearches = [];
  }
  
  let included = false;
  for (let i = 0; i < recentSearches.length; i++) {
    if (recentSearches[i].toLowerCase() == searchTerm.toLowerCase()) {
      included = true;
      break;
    }
  }

  if (!included) {
    recentSearches.push(searchTerm);
    if (recentSearches.length > 10) {
      recentSearches.splice(0, 1); // Remove earliest
    }
    sessionStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    loadRecentSearches();
  }
}

export async function spotifyPlaylistLookup() {
  const Id = $(`#searchSpotifyPlaylistID`).val();
  $(`#searchSpotifyPlaylistID`).val('');
  let playlistID = Id
  if (Id.includes('/')) { // Link to playlist
    const temp = Id.split('/')[4];
    playlistID = temp.split('?')[0];
  }

  const aPlaylistFetch = await fetch(`https://api.spotify.com/v1/playlists/${playlistID}`, {
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + spotifyToken,
      "Content-Type": "application/json"
    }
  });

  const aPlaylist = await aPlaylistFetch.json();

  if (aPlaylist.error) {
    snac('Invalid ID', 'Sorry, we could not find a Spotify playlist with the ID you provided.', 'error');
    return;
  }

  prepareTransferPlaylist(playlistID, spotifyToken, aPlaylist.name);
}


window.playTrack = async (trackID, containerID, index, shuffle) => {
  musicBack = [];
  if (containerID && typeof(index) == 'number') {
    let childrenList = $(`#${containerID}`).children('.music-track');
    let stuffToBack = [...childrenList];
    childrenList.splice(0, index); // Delete from 0 to index
    // Delete from index to end
    stuffToBack.splice(index, stuffToBack.length - index);
    for (let i = 0; i < stuffToBack.length; i++) {
      const activeTrackID = parseInt(stuffToBack[i].getAttribute('trackID'));
      musicBack.push(activeTrackID)
    }

    clearQueue();
    
    if (shuffle) {
      childrenList = shuffleArray(childrenList);
    }

    const first = childrenList[0];
    initalizePlayback(first.getAttribute('trackID'));

    for (let i = 1; i < childrenList.length; i++) { // To queue
      const activeTrackID = parseInt(childrenList[i].getAttribute('trackID'));
      musicQueue.push(activeTrackID)
      updateQueue('appendQueue', musicCatalogue[activeTrackID], false);
    }
  }
  else {
    clearQueue();
    initalizePlayback(trackID);
  }
}