import { addTrackToProfile, reportGroup, reportLounge, reportTrack, saveMessage, unsaveMessage, removeTrackFromProfile } from './app';
import { answerQuestion, deleteMessage, editAnswerQuestion, markChannelAsRead, markChannelAsUnread, muteChannel, pinMessage, prepareEditMessage, removeAnswer, unmuteChannel, unpinMessage } from './channels';
import { closeModal, disableButton, messageHTMLtoText, openModal } from './app';
import { deleteDMMessage, markDMRead, markDMUnread, openFriendsDM, pinDMMessage, prepareDMEditMessage, prepareRemoveFriend, unpinDMMessage } from './friends';
import { addAlbumToPlaylist, addPlaylistToFolder, deletePlaylistFolder, openPlaylist, prepareDeletePlaylist, prepareRemovePlaylistFromLibrary, prepareRenameFolder, prepareRenamePlaylist, removePlaylistFromFolder, removePlaylistFromLibrary, removeTrackFromPlaylist } from './library';
import { disableLoop, enableLoop, musicTab, openModifyPointerModal, openNewPlaylistDialog, openNewPlaylistFolderDialog, updateQueue } from './music';
import { addGroupToFolder, createGroupFolder, deleteGuildPlaylistFolder, demoteUser, expandGuildFolder, kickMember, leaveServer, markServerRead,  openSpecialServer, prepareRenameGuildFolder, promoteUser, removeGroupFromFolder, removeIndicator } from './servers';
import { blockUser, unblockUser } from './users';
import { removeTrackFromVCQueue } from './vcMusic';

window.menuOpen = false;

document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  checkElements(e);
});

window.showContextOf = (item, e, element, trackID) => {
  console.log('Showing context menu');
  if (item !== 'addToPlaylist' && item !== 'addToFolder' && item !== 'selectArtist') {
    $('.contextMenuActive').removeClass('contextMenuActive');
  }

  if (item !== 'selectArtist') {
    $(`#${item}_context`).addClass('contextMenuActive');
    menuOpen = true;
  }

  switch (item) {
    case 'user':
      setContextUserItems(item, element);
      break;
    case 'server':
      setContextServerItems(item, element);
      break;
    case 'channel':
      setContextChannelItems(item, element);
      break;
    case 'message':
      setContextMessageItems(item, element);
      break;
    case 'track':
      setContextTrackItems(item, element);
      break;
    case 'playlist':
      setContextPlaylistItems(item, element);
      break;
    case 'album':
      setContextAlbumItems(item, element);
      break;
    case 'artist':
      setContextArtistItems(item, element);
      break;
    case 'genre':
      setContextGenreItems(item, element);
      break;
    case 'radio':
      setContextRadioItems(item, element);
      break;
    case 'folder':
      setContextFolderItems(item, element);
      break;
    case 'guildFolder':
      setContextGuildFolderItems(item, element);
      break;
    case 'selectArtist':
      setContextSelectArtistItems(item, element, trackID, null, e);
      break;
    default:
      break;
  }

  if (item !== 'selectArtist') {
    positionMenu(e, $(`#${item}_context`).get(0));
  }
}

window.checkElements = (e) => {
  let click = null;

  click = clickInsideElement(e, "userContextItem");
  if (click) {
    showContextOf('user', e, click);
    return;
  } 

  click = clickInsideElement(e, "imageServer");
  if (click) {
    showContextOf('server', e, click);
    return;
  } 

  click = clickInsideElement(e, "guildChannel");
  if (click) {
    showContextOf('channel', e, click);
    return;
  } 

  click = clickInsideElement(e, "messageContentItemForContext");
  if (click) {
    showContextOf('message', e, click);
    return;
  }

  click = clickInsideElement(e, "playlistButtonContext");
  if (click) {
    showContextOf('addToPlaylist', e, click);
    return;
  }

  click = clickInsideElement(e, "artistButtonContext");
  if (click) {
    e.stopPropagation();
    showContextOf('selectArtist', e, click, click.getAttribute('trackID'));
    return;
  }

  click = clickInsideElement(e, "folderButtonContext");
  if (click) {
    showContextOf('addToFolder', e, 'click');
    return;
  }

  click = clickInsideElement(e, "trackContext");
  if (click) {
    showContextOf('track', e, click);
    return;
  }

  click = clickInsideElement(e, 'playlistItem');
  if (click) {
    showContextOf('playlist', e, click);
    return;
  }

  click = clickInsideElement(e, 'album');
  if (click) {
    showContextOf('album', e, click);
    return;
  }

  click = clickInsideElement(e, 'artistContext');
  if (click) {
    showContextOf('artist', e, click);
    return;
  }

  click = clickInsideElement(e, 'genre');
  if (click) {
    showContextOf('genre', e, click);
    return;
  }

  click = clickInsideElement(e, 'radio');
  if (click) {
    showContextOf('radio', e, click);
    return;
  }

  click = clickInsideElement(e, 'playlistFolder');
  if (click) {
    showContextOf('folder', e, click);
    return;
  }

  click = clickInsideElement(e, 'guildFolder');
  if (click) {
    showContextOf('guildFolder', e, click);
    return;
  }
}

// Context positioning logic.
function getPosition(t){var e=0,i=0;if(!t)t=window.event;return t.pageX||t.pageY?(e=t.pageX,i=t.pageY):(t.clientX||t.clientY)&&(e=t.clientX+document.body.scrollLeft+document.documentElement.scrollLeft,i=t.clientY+document.body.scrollTop+document.documentElement.scrollTop),{x:e,y:i}}function clickInsideElement(t,e){var i=t.srcElement||t.Target;if(i.classList.contains(e))return i;for(;i=i.parentNode;)if(i.classList&&i.classList.contains(e))return i;return!1}
function positionMenu(t,e, h){
  const clickCoords=getPosition(t);const clickCoordsX=clickCoords.x;const clickCoordsY=clickCoords.y;
  const menuWidth = e.offsetWidth + 28 ;
  let menuHeight = e.offsetHeight + 8; 
  const windowWidth=window.innerWidth;
  const windowHeight=window.innerHeight;

  if (h) {
    menuHeight = (h * 48) + 8
    console.log(menuHeight)
  }

  ((windowWidth - clickCoordsX) < menuWidth) ? e.style.left = windowWidth - menuWidth + "px" : e.style.left = clickCoordsX + "px";
  ((windowHeight - clickCoordsY) < menuHeight) ? e.style.top = windowHeight - menuHeight + "px" : e.style.top = clickCoordsY + "px";
}

function setContextFolderItems(item, element) {
  const contextItemList = $(`#${item}_context`).children().first().children().first().children();
  const folderID = element.getAttribute('folderID');
  const folderName = element.getAttribute('folderName');

  contextItemList.eq(0).get(0).onclick = () => expandPlaylistFolder(folderID);
  if ($(`#playlistFolderContent${folderID}`).get(0).getAttribute('style') !== '') {
    contextItemList.eq(0).html('Close Folder');
  }
  else {
    contextItemList.eq(0).html('Open Folder');
  }

  contextItemList.eq(2).get(0).onclick = () => prepareRenameFolder(folderID, folderName);
  contextItemList.eq(3).get(0).onclick = () => {
    openModal('deleteFolder');
    $(`#deleteFolderConfirm`).get(0).onclick = () => {
      closeModal();
      deletePlaylistFolder(folderID, folderName, false, false);
    }
  }

  contextItemList.eq(5).get(0).onclick = () => copyToClipboard(folderID);
}

function setContextGuildFolderItems(item, element) {
  const contextItemList = $(`#${item}_context`).children().first().children().first().children();
  const folderID = element.getAttribute('folderID');
  const folderName = element.getAttribute('folderName');

  contextItemList.eq(0).get(0).onclick = () => expandGuildFolder(folderID);
  if ($(`#guildFolderContent${folderID}`).get(0).getAttribute('style') !== '') {
    contextItemList.eq(0).html('Close Folder');
  }
  else {
    contextItemList.eq(0).html('Open Folder');
  }

  contextItemList.eq(2).get(0).onclick = () => prepareRenameGuildFolder(folderID, folderName);
  contextItemList.eq(3).get(0).onclick = () => {
    openModal('deleteFolder');
    $(`#deleteFolderConfirm`).get(0).onclick = () => {
      closeModal();
      deleteGuildPlaylistFolder(folderID, folderName);
    }
  }

  contextItemList.eq(5).get(0).onclick = () => copyToClipboard(folderID);
}

function setContextRadioItems(item, element) {
  const contextItemList = $(`#${item}_context`).children().first().children().first().children();
  const radioID = element.getAttribute('radioID');

  contextItemList.eq(0).get(0).onclick = () => playRadio(radioID);
  contextItemList.eq(2).get(0).onclick = () => copyToClipboard(radioID);
}

function setContextGenreItems(item, element) {
  const contextItemList = $(`#${item}_context`).children().first().children().first().children();
  const genreID = element.getAttribute('genreID');

  contextItemList.eq(0).get(0).onclick = () => openGenre(genreID);
  contextItemList.eq(2).get(0).onclick = () => copyToClipboard(genreID);
}

function setContextArtistItems(item, element) {
  const contextItemList = $(`#${item}_context`).children().first().children().first().children();
  
  const artistID = element.getAttribute('artistID');

  contextItemList.eq(0).get(0).onclick = () => openArtist(artistID);
  
  if (cacheLibraryArtists.includes(artistID)) {
    contextItemList.eq(2).html('Remove from Saved');
    contextItemList.eq(2).get(0).onclick = () => {
      removeFromLibrary('artists', artistID);
    }
  }
  else {
    contextItemList.eq(2).html('Add to Saved');
    contextItemList.eq(2).get(0).onclick = () => {
      addToLibrary('artists', artistID);
    }
  }

  contextItemList.eq(4).get(0).onclick = () => copyToClipboard(artistID)
}

function setContextAlbumItems(item, element) {
  const contextItemList = $(`#${item}_context`).children().first().children().first().children();
  
  const albumID = element.getAttribute('albumID');

  contextItemList.eq(0).get(0).onclick = () => openAlbum(albumID);
  
  if (cacheLibraryAlbums.includes(albumID)) {
    contextItemList.eq(2).html('Remove from Saved');
    contextItemList.eq(2).get(0).onclick = () => {
      removeFromLibrary('albums', albumID);
    }
  }
  else {
    contextItemList.eq(2).html('Add to Saved');
    contextItemList.eq(2).get(0).onclick = () => {
      addToLibrary('albums', albumID);
    }
  }

  contextItemList.eq(4).get(0).onclick = () => copyToClipboard(albumID)
}

window.setContextSelectArtistItems = async (item, element, trackID, data, event) => {
  let artists = data;
  if (!data) {
    artists = (await makeMusicRequest(`songs/${trackID}?include=artists`)).data[0].relationships.artists.data;
  }
  console.log(artists)
  if (artists.length == 1) {
    menuOpen = false;
    $('.contextMenuActive').removeClass('contextMenuActive');
    openArtist(artists[0].id);
    return;
  }

  $(`#selectArtistContextList`).empty();
  $(`#selectArtist_context`).addClass('contextMenuActive');
  menuOpen = true;

  for (let i = 0; i < artists.length; i++) {
    const a = document.createElement('button');
    a.setAttribute('class', 'btn contextButton');
    a.innerHTML = artists[i].attributes.name
    a.onclick = () => {
      openArtist(artists[i].id);
      menuOpen = false;
      $('.contextMenuActive').removeClass('contextMenuActive');
    }
      $('#selectArtistContextList').get(0).appendChild(a);
  }

  if (event) {
    console.log(artists.length)
    positionMenu(event, $(`#selectArtist_context`).get(0), artists.length);
  }
}

function setContextPlaylistItems(item, element) {
  const contextItemList = $(`#${item}_context`).children().first().children().first().children();
  const playlistID = element.getAttribute('playlistID');
  const playlistUID = element.getAttribute('playlistUID');
  const playlistName = element.getAttribute('playlistName');
  const folderContext = element.getAttribute('inFolder');

  contextItemList.eq(0).get(0).onclick = () => {
    openPlaylist(playlistUID, playlistID, playlistName);
  }

  if (playlistUID == user.uid) {
    contextItemList.eq(2).removeClass('hidden');
    contextItemList.eq(2).get(0).onclick = () => {
      prepareRenamePlaylist(playlistID);
    }
  }
  else {
    contextItemList.eq(2).addClass('hidden');
  }


  if (folderContext) {
    contextItemList.eq(3).addClass('hidden');
    contextItemList.eq(4).removeClass('hidden');
    contextItemList.eq(4).get(0).onclick = () => {
      $('.contextMenuActive').removeClass('contextMenuActive');
      removePlaylistFromFolder(folderContext, playlistUID, playlistID);
    }
  }
  else {
    contextItemList.eq(4).addClass('hidden');
    contextItemList.eq(3).removeClass('hidden');
    contextItemList.eq(3).get(0).onclick = () => {
      // Add to folder
      $(`#folderContextList`).empty();
  
      const a = document.createElement('button');
      a.setAttribute('class', 'btn contextButton contextButtonImportant');
      a.innerHTML = `<i class="bx bx-plus"></i> New Folder`
      a.onclick = () => openNewPlaylistFolderDialog(playlistUID, playlistID);
      $('#folderContextList').get(0).appendChild(a);
  
      let keys = [];
      if (cacheUser.playlistFolders) {
        keys = Object.keys(cacheUser.playlistFolders);
      }
  
      for (let i = 0; i < keys.length; i++) {
        const a = document.createElement('button');
        a.setAttribute('class', 'btn contextButton');
        a.id = `${keys[i].split('<')[1]}AddFolderButton`
        a.innerHTML = keys[i].split('<')[0];
        a.onclick = () => addPlaylistToFolder(keys[i].split('<')[1], keys[i].split('<')[0], playlistUID, playlistID);
        $('#folderContextList').get(0).appendChild(a);
      }

      // Sort the folders
      if (cacheUser.playlistFoldersSort) {
        for (let i = 0; i < cacheUser.playlistFoldersSort.length; i++) {
          const folderID = cacheUser.playlistFoldersSort[i];
          $(`#${folderID}AddFolderButton`).attr('data-order', i);
        }
        
        let sorted = $(`#folderContextList`).children('.contextButton').sort((a, b) => {
          return parseInt($(a).attr('data-order')) - parseInt($(b).attr('data-order'));
        });
      
        $(`#folderContextList`).append(sorted);
      }

      twemoji.parse($(`#folderContextList`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });
    }
  }
  
  if (playlistUID == user.uid) { // Only show delete for own playlists
    contextItemList.eq(5).html('Delete Playlist');
    contextItemList.eq(5).get(0).onclick = () => {
      prepareDeletePlaylist(playlistID, playlistName, folderContext);
    }
  }
  else {
    contextItemList.eq(5).html('Remove from Library');
    contextItemList.eq(5).get(0).onclick = () => {
      prepareRemovePlaylistFromLibrary(playlistUID, playlistID, playlistName, folderContext);
    }
  }

  contextItemList.eq(7).get(0).onclick = () => {
    copyToClipboard(`${playlistID}`);
  }
}

function setContextTrackItems(item, element) {
  const contextItemList = $(`#${item}_context`).children().first().children().first().children();

  const trackID = element.getAttribute('trackID');
  
  const playlistID = element.getAttribute('playlistID');
  const playlistUID = element.getAttribute('playlistUID');
  const playlistRandomID = element.getAttribute('playlistRandomID');

  const guildUID = element.getAttribute('guildUID');
  const guildID = element.getAttribute('guildID');

  const specialContext = element.getAttribute('specialContext');
  const fromQueue = element.getAttribute('fromQueue');
  const fromLP = element.getAttribute('fromLP');

  contextItemList.eq(0).get(0).onclick = () => {playASong(trackID)};

  contextItemList.eq(1).get(0).onclick = () => {
    if (musicQueue.length || musicPlaying.id) {
      musicQueue.push(trackID) // If song is playing or queue exists, add to queue.
      updateQueue('appendQueue', musicCatalogue[trackID], false, false);
    }
    else {
      playASong(trackID) // If no song, no queue, play it.
    }
  };

  contextItemList.eq(2).addClass('hidden');
  if (activeListeningParty) {
    contextItemList.eq(2).removeClass('hidden');
    contextItemList.eq(2).get(0).onclick = () => {
      addTrackToChannelQueue(trackID, activeListeningParty.split('/')[0], activeListeningParty.split('/')[1], activeListeningParty.split('/')[2]);
      snac('Queue Updated', 'This track has been added to the listening party queue.', 'success');
    }
  }

  contextItemList.eq(4).removeClass('hidden'); // artist
  contextItemList.eq(4).get(0).setAttribute('trackID', trackID); // artist

  contextItemList.eq(5).removeClass('hidden');
  contextItemList.eq(5).get(0).onclick = () => {
    openAlbum(musicCatalogue[trackID].relationships.albums.data[0].id);
  }

  contextItemList.eq(6).removeClass('hidden'); // Divider (Must need if showing album & artist options.


  contextItemList.eq(7).get(0).onclick = () => {
    playlistSelector(trackID, false);
  }

  contextItemList.eq(8).addClass('hidden');
  if (playlistID && playlistUID == user.uid) {
    contextItemList.eq(8).removeClass('hidden');
    contextItemList.eq(8).get(0).onclick = () => {
      removeTrackFromPlaylist(playlistID, trackID, playlistRandomID);
    }
  }

  if (cacheLibraryTracks.includes(trackID)) {
    contextItemList.eq(9).html('Remove from Saved');
    contextItemList.eq(9).get(0).onclick = () => {
      removeFromLibrary('tracks', trackID);
    }
  }
  else {
    contextItemList.eq(9).html('Add to Saved');
    contextItemList.eq(9).get(0).onclick = () => {
      addToLibrary('tracks', trackID);
    }
  }

  contextItemList.eq(10).addClass('hidden');
  if (fromQueue == 'true') {
    contextItemList.eq(10).removeClass('hidden');

    contextItemList.eq(10).get(0).onclick = () => {
      // Get Nth index of the track 
      let nthIndex = 0;
      $(`#queueItems`).children(`.track${trackID}`).each((index, object) => {
        if (object == element) {
          nthIndex = index;
        }
      })

      let searchIndex = 0
      for (let i = 0; i < musicQueue.length; i++) {
        if (`${musicQueue[i]}` == `${trackID}`) {
          if (searchIndex == nthIndex) {
            musicQueue.splice(i, 1);
          }
          else {
            searchIndex = searchIndex + 1
          }
        }
      }

      updateQueue('removeQueue', trackID, false, nthIndex);
    }
  }
  if (fromLP && activeListeningParty && (serverData[`${guildUID}${guildID}`].owner == user.uid || serverData[`${guildUID}${guildID}`].staff.includes(user.uid))) {
    contextItemList.eq(10).removeClass('hidden');
    contextItemList.eq(10).get(0).onclick = () => {
      // Remove track from listening party queue.
      removeTrackFromVCQueue(fromLP);

    }
  }

  contextItemList.eq(11).addClass('hidden');
  if (specialContext == 'nowPlaying') { // dedicated loop button
    contextItemList.eq(11).removeClass('hidden'); 
    if (enableLoopConst) {
      contextItemList.eq(11).html('Disable Loop')
      contextItemList.eq(11).get(0).onclick = () => {disableLoop(trackID)};
    }
    else {
      contextItemList.eq(11).html('Enable Loop')
      contextItemList.eq(11).get(0).onclick = () => {enableLoop(trackID)};
    }
  }


  if (cacheUser.track == trackID) {
    contextItemList.eq(12).html('Remove from Profile');
    contextItemList.eq(12).get(0).onclick = () => {
      removeTrackFromProfile();
    }
  }
  else {
    contextItemList.eq(12).html('Add to Profile');
    contextItemList.eq(12).get(0).onclick = () => {
      addTrackToProfile(trackID);
    }
  }

  contextItemList.eq(14).addClass('hidden');
  if (adminUser) {
    contextItemList.eq(14).removeClass('hidden');
    contextItemList.eq(14).get(0).onclick = () => {openModifyPointerModal(trackID)};
  }

  contextItemList.eq(15).get(0).onclick = () => { reportTrack(trackID) };
  contextItemList.eq(16).get(0).onclick = () => {
    copyToClipboard(`track:${trackID}`, true);
    snac('Copied to Clipboard', 'Share code copied to clipboard. Paste this in a lounge or DM to share this track.', 'success');
  };
  contextItemList.eq(17).get(0).onclick = () => {copyToClipboard(`${trackID}`)};
}

function setContextMessageItems(item, element) {
  const contextItemList = $(`#${item}_context`).children().first().children().first().children();
  const messageID = element.getAttribute('messageID');
  const messageSender = element.getAttribute('messageSender');
  const messageType = element.getAttribute('messageType');
  const messageGuildUID = element.getAttribute('guildUID');
  const messageGuildID = element.getAttribute('guildID');
  const messageChannel = element.getAttribute('channelID');
  const messageChannelType = element.getAttribute('channelType');
  const messageChannelQAAnswered = element.getAttribute('messageChannelQAAnswered');
  const messageSenderName = element.getAttribute('messageSenderName');

  if (cacheUserPracticalBookmarks[messageID]) {
    contextItemList.eq(2).html('Remove Bookmark');
    contextItemList.eq(2).get(0).onclick = () => {
      unsaveMessage(cacheUserPracticalBookmarks[messageID]);
    }
  }
  else {
    contextItemList.eq(2).html('Bookmark');
    contextItemList.eq(2).get(0).onclick = () => {
      saveMessage(element);
    }
  }

  contextItemList.eq(0).get(0).onclick = () => {
    copyToClipboard(messageHTMLtoText(null, element));
  }

  if (messageType == 'DM') {
    if (!DMCachedPins[messageChannel].has(messageID)) {
      contextItemList.eq(3).html('Pin');
      contextItemList.eq(3).get(0).onclick = () => {
        pinDMMessage(messageChannel, messageID, messageSender, messageSenderName);
      }
    }
    else {
      contextItemList.eq(3).html('Unpin');
      contextItemList.eq(3).get(0).onclick = () => {
        unpinDMMessage(messageChannel, messageID)
      };
    }
  }
  else {
    if (!cachedPins[messageChannel].has(messageID)) {
      contextItemList.eq(3).html('Pin');
      contextItemList.eq(3).get(0).onclick = () => {
        pinMessage(messageChannel, messageID, messageSender, messageSenderName);
      }
    }
    else {
      contextItemList.eq(3).html('Unpin');
      contextItemList.eq(3).get(0).onclick = () => {
        unpinMessage(messageID, messageChannel);
      }
    }
  }

  // Q&A Channels
  contextItemList.eq(4).addClass('hidden');
  contextItemList.eq(5).addClass('hidden');
  contextItemList.eq(6).addClass('hidden');
  if (messageChannelType == 'qa' && (serverData[messageGuildUID + messageGuildID].staff.includes(user.uid) || messageGuildUID == user.uid) ) {
    contextItemList.eq(4).removeClass('hidden');
    contextItemList.eq(5).removeClass('hidden');
    if (messageChannelQAAnswered) {
      contextItemList.eq(5).html("Edit Answer")
      contextItemList.eq(6).removeClass('hidden');
    }
    else {
      contextItemList.eq(5).html("Answer")
    }
  }

  contextItemList.eq(6).get(0).onclick = () => {
    removeAnswer(messageChannel, messageID)
  }

  contextItemList.eq(5).get(0).onclick = () => {
    if (messageChannelQAAnswered) {
      openModal('answerEdit');
      $(`#answerDraftEditTextarea`).focus();
      $(`#answerDraftEditTextarea`).val(messageChannelQAAnswered);
      $(`#confirmEditAnswer`).get(0).onclick = () => {
        const answerText = $(`#answerDraftEditTextarea`).val();
        editAnswerQuestion(messageChannel, messageID, answerText)
      }
    }
    else {
      openModal('answerDraft');
      $(`#answerDraftTextarea`).focus();
      $(`#confirmAnswer`).get(0).onclick = () => {
        const answerText = $(`#answerDraftTextarea`).val();
        answerQuestion(messageChannel, messageID, answerText)
      }
    }
  }

  if (messageSender === user.uid) { contextItemList.eq(8).removeClass("hidden"); contextItemList.eq(9).removeClass("hidden"); contextItemList.eq(10).removeClass("hidden") } else { contextItemList.eq(8).addClass("hidden"); contextItemList.eq(9).addClass("hidden"); contextItemList.eq(10).addClass("hidden") };

  // Full support for non-stndard messages.

  contextItemList.eq(8).get(0).onclick = () => {
    // Edit Message
    if (messageType == 'DM') {
      prepareDMEditMessage(messageChannel, messageID);
    }
    else {
      prepareEditMessage(messageChannel, messageID);
    }
  }

  contextItemList.eq(9).get(0).onclick = () => {
    // Delete Message
    openModal('deleteMessage');
    $(`#deleteMessageConfirm`).get(0).onclick = () => {
      closeModal();
      if (messageType == 'DM') {
        deleteDMMessage(messageChannel, messageID);
      }
      else if (messageType == 'Channel') {
        deleteMessage(messageChannel, messageID);
      }
    }
  }

  if (messageGuildUID == user.uid) {
    contextItemList.eq(9).removeClass("hidden");
    contextItemList.eq(10).removeClass("hidden"); // Divider
  }

  contextItemList.eq(11).get(0).onclick = () => {
    copyToClipboard(messageID);
  }
}

function setContextChannelItems(item, element) {
  const contextItemList = $(`#${item}_context`).children().first().children().first().children();
  const guildUID = element.getAttribute('guildUID');
  const guildID = element.getAttribute('guildID');
  const channelID = element.getAttribute('channelID');
  const channelName = element.getAttribute('channelName');

  contextItemList.eq(0).get(0).onclick = () => {
    element.click();
  }

  // Check if channel has unread indicator.
  if (addPendingIndicator[guildUID + guildID + channelID]) {
    contextItemList.eq(2).html('Mark as Read');
    contextItemList.eq(2).get(0).onclick = () => {
      markChannelAsRead(guildUID, guildID, channelID, true);
    }
  }

  else {
    contextItemList.eq(2).html('Mark as Unread');
    contextItemList.eq(2).get(0).onclick = () => {
      markChannelAsUnread(guildUID, guildID, channelID);
    }
  }

  let channelMuted = false;
  if (mutedServers.includes(`${guildUID}${guildID}${channelID}`)) {
    channelMuted = true;
  }

  if (channelMuted) {
    contextItemList.eq(3).html('Unmute Lounge');
    contextItemList.eq(3).get(0).onclick = () => {
      unmuteChannel(guildUID, guildID, channelID, true);
    }
  }
  else {
    contextItemList.eq(3).html('Mute Lounge');
    contextItemList.eq(3).get(0).onclick = () => {
      muteChannel(guildUID, guildID, channelID, true);
    }
  }

  contextItemList.eq(5).addClass('hidden');
  contextItemList.eq(6).addClass('hidden');
  contextItemList.eq(7).addClass('hidden');

  // If server admin / owner
  if (guildUID == user.uid || serverData[guildUID + guildID].staff.includes(`${user.uid}`)) {
    contextItemList.eq(6).removeClass('hidden');
    contextItemList.eq(6).get(0).onclick = () => {
      deleteLoungePrepare(guildUID, guildID, channelID, channelName);
    }
    contextItemList.eq(5).removeClass('hidden');
    contextItemList.eq(5).get(0).onclick = () => {
      renameLoungePrepare(guildUID, guildID, channelID);
    }

    contextItemList.eq(7).removeClass('hidden');
  }

  contextItemList.eq(8).get(0).onclick = () => {
    reportLounge(guildUID, guildID, channelID);
  }

  contextItemList.eq(9).get(0).onclick = () => {
    copyToClipboard(channelID);
  }
}

function setContextServerItems(item, element) {
  const contextItemList = $(`#${item}_context`).children().first().children().first().children();
  const guildUID = element.getAttribute('guildUID');
  const guildID = element.getAttribute('guildID');
  const folderID = element.getAttribute('inFolder');

  contextItemList.eq(0).get(0).onclick = () => {
    element.click();
  }

  // Check if server has unread indicator.
  if (addPendingIndicator[guildUID + guildID]) {
    contextItemList.eq(3).removeClass('hidden');
    contextItemList.eq(3).get(0).onclick = () => {
      markServerRead(guildUID, guildID);
    }
  }
  else {
    contextItemList.eq(3).addClass('hidden');
  }


  if (folderID) {
    contextItemList.eq(2).html('Remove from Folder');
    contextItemList.eq(2).get(0).onclick = () => {
      $('.contextMenuActive').removeClass('contextMenuActive');
      removeGroupFromFolder(guildUID, guildID, folderID, false);
    }
  }
  else {
    contextItemList.eq(2).html('Add to Folder');
    contextItemList.eq(2).get(0).onclick = () => {
      // add to folder
      $(`#folderContextList`).empty();
  
      const a = document.createElement('button');
      a.setAttribute('class', 'btn contextButton contextButtonImportant');
      a.innerHTML = `<i class="bx bx-plus"></i> New Folder`
      a.onclick = () => createGroupFolder(guildUID, guildID);
      $('#folderContextList').get(0).appendChild(a);
  
      let keys = [];
      if (cacheUser.guildFolders) {
        keys = Object.keys(cacheUser.guildFolders);
      }
  
      for (let i = 0; i < keys.length; i++) {
        const a = document.createElement('button');
        a.setAttribute('class', 'btn contextButton');
        a.id = `${keys[i].split('<')[1]}AddFolderButton`
        a.innerHTML = keys[i].split('<')[0];
        a.onclick = () => addGroupToFolder(guildUID, guildID, keys[i]);
        $('#folderContextList').get(0).appendChild(a);
      }

      // Sort the folders
      if (cacheUser.guildFoldersSort) {
        for (let i = 0; i < cacheUser.guildFoldersSort.length; i++) {
          const folderID = cacheUser.guildFoldersSort[i];
          $(`#${folderID}AddFolderButton`).attr('data-order', i);
        }
        
        let sorted = $(`#folderContextList`).children('.contextButton').sort((a, b) => {
          return parseInt($(a).attr('data-order')) - parseInt($(b).attr('data-order'));
        });
      
        $(`#folderContextList`).append(sorted);
      }

      twemoji.parse($(`#folderContextList`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' })
    }
  }


  // Check if server is muted
  let serverMuted = false;
  if (mutedServers.includes(`${guildUID}${guildID}`)) {
    serverMuted = true;
  }

  if (serverMuted) {
    contextItemList.eq(4).html('Unmute Group');
    contextItemList.eq(4).get(0).onclick = () => {
      unmuteServer(guildUID, guildID, true);
    }
  }
  else {
    contextItemList.eq(4).html('Mute Group');
    contextItemList.eq(4).get(0).onclick = () => {
      muteServer(guildUID, guildID, true);
    }
  }

  contextItemList.eq(7).addClass('hidden');

  if (guildUID !== user.uid) {
    contextItemList.eq(7).removeClass('hidden');
    contextItemList.eq(7).get(0).onclick = () => {
      openModal('leaveServer')
      $('#guildConfirmLeave').get(0).onclick = () => {
        disableButton($('#guildConfirmLeave'));
        leaveServer(guildUID, guildID);
        closeModal();
      }
    }
  }

  contextItemList.eq(6).get(0).onclick = () => {
    reportGroup(guildUID, guildID);
  }

  contextItemList.eq(8).get(0).onclick = () => {
    copyToClipboard(guildID);
  }
}

function setContextUserItems(item, element) {
  const contextItemList = $(`#${item}_context`).children().first().children().first().children();
  contextItemList.removeClass('hidden');
  const userID = element.getAttribute('userID');
  const userName = element.getAttribute('userName');
  const guildUID = element.getAttribute('guildUID');
  const guildID = element.getAttribute('guildID');
  const userContext = element.getAttribute('userContext');

  let areFriends = false;
  for (let i = 0; i < cacheUser.friends.length; i++) {
    if (cacheUser.friends[i].u === userID) {
      areFriends = true; 
      break;
    }
  }

  contextItemList.children().removeClass('hidden');
  if (user.uid == userID) {
    // Own profile, hide message,call, etc.
    contextItemList.eq(1).addClass('hidden');
    contextItemList.eq(2).addClass('hidden');
    contextItemList.eq(3).addClass('hidden');
    contextItemList.eq(4).addClass('hidden');
    contextItemList.eq(5).addClass('hidden');
    contextItemList.eq(6).addClass('hidden');
    contextItemList.eq(7).addClass('hidden');
    contextItemList.eq(8).addClass('hidden');
    contextItemList.eq(9).addClass('hidden');
    contextItemList.eq(10).addClass('hidden');
    contextItemList.eq(12).addClass('hidden');
    contextItemList.eq(13).addClass('hidden');
  }

  if (!areFriends) {
    contextItemList.eq(1).addClass('hidden');
    contextItemList.eq(2).addClass('hidden');
    contextItemList.eq(3).addClass('hidden');
    contextItemList.eq(8).addClass('hidden');
    contextItemList.eq(9).addClass('hidden');
  }

  let serverOwner = false;
  if (guildID) {
    if (serverData[guildUID + guildID].owner == user.uid) {
      serverOwner = true;
    }
  }

  if (!guildID || !serverOwner) {
    contextItemList.eq(4).addClass('hidden');
    contextItemList.eq(5).addClass('hidden');
    contextItemList.eq(6).addClass('hidden');
    contextItemList.eq(7).addClass('hidden');
  }

  contextItemList.eq(0).get(0).setAttribute('onclick', `openUserCard('${userID}')`);

  contextItemList.eq(1).get(0).onclick = () => {
    openSpecialServer('music');
    window.setTimeout(() => {
      musicTab('friends')
    }, 500)
  }

  contextItemList.eq(2).get(0).onclick = () => {
    if ($(`#${userID}FriendItem`).length) {
      openSpecialServer('friends');
      openFriendsDM(userID, userName);
      return;
    }
    snac('Message Error', 'You must first be friends with this person to message them.');
  }

  contextItemList.eq(3).get(0).onclick = () => {
    if ($(`#${userID}FriendItem`).length) {
      openSpecialServer('friends');
      openFriendsDM(userID, userName);
      window.setTimeout(() => {
        startCallDM(userID);
      }, 350)
      return;
    }
    snac('Message Error', 'You must be friends with this person to call them.')
  }

  // Guild stuff
  if (serverOwner) {
    let isStaff = false;
    if (serverData[guildUID + guildID].staff.includes(`${userID}`)) {
      contextItemList.eq(7).get(0).onclick = () => {
        demoteUser(guildID, userID);
      }

      contextItemList.eq(6).addClass('hidden');
    }
    else {
      contextItemList.eq(6).get(0).onclick = () => {
        promoteUser(guildID, userID);
      }
      contextItemList.eq(7).addClass('hidden');
    }

    // Kick member
    contextItemList.eq(5).get(0).onclick = () => {
      kickMember(guildID, userID, userName);
    }

  }

  if (DMunreadIndicators[userID] === true) {
    contextItemList.eq(9).html('Mark as Read');
    contextItemList.eq(9).get(0).onclick = () => {
      markDMRead(userID);
    }
  }

  else {
    contextItemList.eq(9).html('Mark as Unread');
    contextItemList.eq(9).get(0).onclick = () => {
      markDMUnread(userID);
    }
  }
  
  if (areFriends) {
    contextItemList.eq(10).html('Remove Friend');
    contextItemList.eq(10).get(0).onclick = () => {
      prepareRemoveFriend(userID, true)
    }
  }

  else {
    if (cacheUser.outgoingFriendRequests.some(e => e.u === userID)) {
      // Outgoing.
      contextItemList.eq(10).html('Cancel Request');
      contextItemList.eq(10).get(0).onclick = () => {
        cancelRequest(userID);
      }
    }
    else {
      contextItemList.eq(10).html('Add Friend');
      contextItemList.eq(10).get(0).onclick = () => {
        confirmFriendRequest(userID);
      }
    }
  }

  contextItemList.eq(13).addClass('hidden');
  contextItemList.eq(12).addClass('hidden');
  if (userContext == 'voice' && userID !== user.uid && currentCall) {
    contextItemList.eq(13).removeClass('hidden');
    contextItemList.eq(12).removeClass('hidden');

    // Initialize slider on eq(11)
    const vol = localStorage.getItem('volumeOf' + userID);
    $(`#sliderOnUser`).get(0).value = vol;
    $(`#sliderOnUser`).get(0).oninput = function() {
      localStorage.setItem('volumeOf' + userID, this.value);
      $(`#${userID}usersAudio`).get(0).volume = parseInt(this.value) / 2 / 100;
    }
  }

  contextItemList.eq(14).get(0).onclick = () => {
    reportUser(userID);
  }

  let isBlocked = false;
  if (cacheUser.blockedUsers) {
    for (let i = 0; i < cacheUser.blockedUsers.length; i++) {
      if (cacheUser.blockedUsers[i].u === userID) {
        isBlocked = true; 
        break;
      }
    }
  }

  if (isBlocked) {
    contextItemList.eq(15).html('Unblock')
    contextItemList.eq(15).get(0).onclick = () => {
      unblockUser(userID, userName);
    }
  }
  else {
    contextItemList.eq(15).html('Block')
    contextItemList.eq(15).get(0).onclick = () => {
      blockUser(userID, userName);
    }
  }

  contextItemList.eq(16).get(0).onclick = () => {
    copyToClipboard(userID);
  }
}

export function playlistSelector(trackID, albumID) {
  $(`#playlistContextList`).empty();

  const a = document.createElement('button');
  a.setAttribute('class', 'btn contextButton contextButtonImportant');
  a.innerHTML = `<i class="bx bx-plus"></i> New Playlist`
  a.onclick = () => openNewPlaylistDialog(trackID, albumID);
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
      if (trackID) {
        a.onclick = () => addTrackToPlaylist(playlistID, trackID);
      }
      else {
        a.onclick = () => addAlbumToPlaylist(playlistID, albumID)
      }
      $('#playlistContextList').get(0).appendChild(a);
    }
  }

  twemoji.parse($(`#playlistContextList`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });
}