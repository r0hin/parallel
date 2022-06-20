import { changePassword, changeProfilePhoto, completeProfile, deleteAccount, ghChangelog, hideBookmarks, openEmailInput, removeBio, removeLyrics, removeTrackFromProfile, sendVerify, showBookmarks, signOutParallel, updateBiography, updateLyrics, requestNewTrack, startTutorial, prepareDestroyAllFiles } from './app';
import { cancelFriendsSearch, friendEventListeners, friendsTab, toggleFriendsSort } from './friends';
import { createPlaylist } from './library';
import { backwardSong, clearHistory, clearQueue, forwardSong, loginSpotify, musicTab, openNewPlaylistDialog, openNewPlaylistFolderDialog, reloadSocialTab, searchMusicButton, spotifyPlaylistLookup, switchToHistory } from './music';
import { expandTab, refreshInputDevices, refreshOutputDevices, retrieveSetting, settingsTab } from './settings';
import { createGroup, createGroupFolder, joinGroup, openSpecialServer } from './servers';
import { clearMusicStatus } from './presence';
import { endAllCalls, leaveVideoDM, shareScreenDM, shareVideoDM } from './voice';

import { Picker } from 'emoji-picker-element';
import { playNotification } from './sounds';
import { goToCheckout, manageSubscription } from './stripe';
import { updateApp } from './electronApp';

window.noTrackTimeout = null;
window.modalOpen = false;
window.closeOnEnter = false;
window.primaryActionFunc = () => {}
window.musicPoppedOut = false;
window.emojiPickerOpen = false;
window.gifPickerOpen = false;
window.emojiTimeout = null;
window.gifTimeout = null;
window.playbackViewTimeout = null;
window.fullScreenActive = false;
window.uploadProgressTimeout = null;
window.gifsPickerSearchTimeout = null;
window.gifsPickerSearchTyping = false;
window.searchTimeout = null;

const placeholderAlbumImage = 'https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/app%2FdefaultAlbum.png?alt=media';
const tenorKey = `LFKPD848ETKW`;

export function timer(ms) {
  return new Promise(res => setTimeout(res, ms));
} 

tippy.setDefaultProps({
  // Props
  placement: 'right',
  arrow: false,
  dynamicTitle: true,
  animation: 'shift-toward',
});

$(`#pfpseudoelement`).get(0).onclick = () => openSpecialServer('account');

tippy('#serverAddButton', {
  content: 'Join a Group',
  placement: 'top',
});

tippy('#serverViewRequestsButton', {
  content: 'View Outgoing Requests',
  placement: 'top',
});

tippy('#musicPopoutFront', {
  content: 'Expand',
  placement: 'top',
});

tippy('#collapsePopout', {
  content: 'Collapse',
  placement: 'top',
});

tippy('#bookmarksCloseButton', {
  content: 'Close',
  placement: 'top',
});

tippy('#trackMoreOptions', {
  content: 'More Options',
  placement: 'top',
});

tippy(`#newFriendButton`, {
  content: 'Add Friend',
  placement: 'top',
});

tippy(`#friendSortButton`, {
  content: 'Toggle Sort',
  placement: 'top',
});

tippy(`#storageSortButton`, {
  content: 'Toggle Sort',
  placement: 'top',
});

tippy(`#bookmarksButton`, {
  content: 'Bookmarks',
  placement: 'top',
});

tippy(`#keycodesButton`, {
  content: 'Details',
  placement: 'top',
});

tippy('#friendsServer', {
  content: 'Friends',
});

tippy(`#refreshFriendsButton`, {
  content: 'Refresh Playlists',
  placement: 'top',
});

tippy(`#voiceChatButtonVideoFriends`, {
  content: 'Stream Video',
  placement: 'top',
});

tippy(`#voiceChatButtonScreenFriends`, {
  content: 'Stream Screen',
  placement: 'top',
});

tippy('#voiceChatStopWatchingButton3', {
  content: 'Stop Watching',
  placement: 'top',
});

tippy('#DMEndCall', {
  content: 'Leave Voice',
  placement: 'top',
});

tippy('#dmMuteButton', {
  content: 'Mute',
  placement: 'top',
});

tippy('#dmDeafenButton', {
  content: 'Deafen',
  placement: 'top',
});

tippy(`#questionMarkButton`, {
  content: 'Request a Track',
  placement: 'top',
})

$(`#voiceChatStopWatchingButton3`).onclick = () => {
  leaveVideoDM(connectedToVideo);
}

$(`#friendsServer`).get(0).onclick = () => openSpecialServer('friends');

tippy('#newPlaylistButton', {
  content: 'New Playlist',
  placement: 'top',
});

tippy('#newPlaylistFolderButton', {
  content: 'New Playlist Folder',
  placement: 'top',
});

tippy('#musicServer', {
  content: 'Music',
});

$(`#musicServer`).get(0).onclick = () => openSpecialServer('music');

tippy('#addServer', {
  content: 'Add a Group',
});

$(`#addServer`).get(0).onclick = () => openDropdown('addServerDropdown');

tippy('#infiniteServer', {
  content: 'Parallel Infinite',
});

$(`#infiniteServer`).get(0).onclick = () => openSpecialServer('infinite');

try {
  Object.defineProperty(String.prototype, 'capitalize', {
    value: function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false
  }); 
} catch (error) {}

displayInputEffect();
export function displayInputEffect() {
  $('input').on('focusin', function() {
    $(this).parent().find('label').addClass('active');
  });
  
  $('input').on('focusout', function() {
    if (!this.value) {
      $(this).parent().find('label').removeClass('active');
    }
  });
}; 

export async function openModal(id) {
  // currentChannel = '';
  window.modalOpen = true;
  $('#modalContent').html($('#modalContent_' + id).html());
  twemoji.parse($('#modalContent').get(0));

  $('#modal-background').removeClass('fadeOut');
  $('#modal-background').addClass('fadeIn');

  $('#modal-background').removeClass('hidden');
  $('#modal').removeClass('hidden');

  $('#modalAnimationContainer').removeClass('modalAnimationOut');
  $('#modalAnimationContainer').addClass('modalAnimationIn');
  $(`#modalAnimationContainer`).get(0).focus();
  
  displayInputEffect();

  window.primaryActionFunc = () => {};
  window.closeOnEnter = false;
  switch (id) {
    case 'newFriend':
      friendEventListeners();
      $(`#newFriendName`).get(0).focus();
      break;
    case 'newBio':
      bioEventListeners();
      $(`#aboutMeBio`).get(0).focus();
      break;
    case 'newLyrics':
      lyricsEventListeners();
      break;
    case 'keyCodes':
      addOnclickByID('supportContactButtonModal', () => { closeModal(); window.setTimeout(() => { openModal('contact') }, 619) });
      closeOnEnter = true;
      break;
    case 'userProfile':
      closeOnEnter = true;
      break;
    case 'updatedApp':
      closeOnEnter = true;

      // Fetch update data.
      const data = await ghChangelog();
      console.log(data)
      $(`#whatsChangedTitle`).html(`What's New?`)
      $(`#whatsChanged`).html(data)
      break;
    case 'updateAvailable':
      // Click the primary action button. 
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'leavePartyCheck':
      // Click the primary action button. 
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'confirmTransfer':
      // Click the primary action button.
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'mediaStreamUpdate':
      // Click the primary action button.
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'requestTrack':
      // Click the primary action button.
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      $(`#addTrackBox`).get(0).focus();
      break;
    case 'acceptNotifications':
      closeOnEnter = true;
      break;
    case 'contact':
      closeOnEnter = true;
      break;
    case 'thanksPremium':
      closeOnEnter = true;
      break;
    case 'credits':
      closeOnEnter = true;
      break;
    case 'leaveServer':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'createGroup':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      $(`#newGroupName`).get(0).focus();
      break;
    case 'createGroupFolder':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      $(`#newGroupFolderName`).get(0).focus();
      break;
    case 'joinGroup':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      $(`#inviteCodeField`).get(0).focus();
      break;
    case 'reportItem':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'kickMember':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'blockUser':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'updateSharing':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'unblockUser':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'deleteFolder':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'deleteLounge':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'deleteFriend':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); closeModal(); }
      break;
    case 'deletePlaylist':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'mobileWarning':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'desktopWarning':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'clonePlaylist':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'removePlaylistFromLibrary':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'newChannel':
      $(`#newChannelName`).get(0).focus();
      break;
    case 'reorderPlaylist':
      $(`#newPlaylistIndex`).get(0).focus();
      break;
    case 'renamePlaylist':
      $(`#renamePlaylistName`).get(0).focus();
      break;
    case 'renameFolder':
      $(`#renameFolderName`).get(0).focus();
      break;
    case 'updateEmail':
      $(`#updateEmailInput`).get(0).focus();
      break;
    case 'renameLounge':
      $(`#renameLoungeName`).get(0).focus();
      break;
    case 'newPlaylist':
      $(`#newPlaylistName`).get(0).focus();
      break;
    case 'newPlaylistFolder':
      $(`#newPlaylistFolderName`).get(0).focus();
      break;
    case 'renameGuild':
      $(`#newGroupName`).get(0).focus();
      break;
    case 'getPassword':
      $(`#reAuthPassword`).get(0).focus();
      break;
    
    default:
      break;
  }

  $('.closeModalButtonOnclick').each((index, object) => {
    $(object).get(0).onclick = () => closeModal()
  });
}

export function closeModal() {
  modalOpen = false;
  $('#modalAnimationContainer').removeClass('modalAnimationIn');
  $('#modalAnimationContainer').addClass('modalAnimationOut');

  $('#modal-background').removeClass('fadeIn');
  $('#modal-background').addClass('fadeOut');

  window.setTimeout(() => {
    $('#modal').addClass('hidden');
    $('#modal-background').addClass('hidden');
    cropping = false;
    passwording = false;
  }, 300)
  
  // If user modal, cancel the query.
  try { cancelUserQuery() } catch (error) { }
  fullProfileActive = false;
}

// Enter on click

$('#searchMusic').get(0).addEventListener("keyup", (event) => {
  if (event.keyCode === 13) { $('#musicSearchButton').get(0).click() }

  // Gather search suggesstions with timeouts
  window.clearTimeout(searchTimeout);
  searchTimeout = window.setTimeout(async () => {
    if (!$('#searchMusic').val()) { $('#searchSuggestions').empty(); return };

    const suggestions = await makeMusicRequest(`search/suggestions?kinds=terms&term=${$('#searchMusic').val()}`);
    $('#searchSuggestions').empty();
    suggestions.results.suggestions.forEach((suggestion) => {
      const a = document.createElement('div');
      a.setAttribute('class', 'searchSuggestionMusic');
      a.innerHTML = suggestion.displayTerm;
      a.onclick = () => {
        $('#searchMusic').val(suggestion.searchTerm);
        $('#musicSearchButton').get(0).click();
      }
      $('#searchSuggestions').append(a);
    });
  }, 299);
});

$(`#searchSpotifyPlaylistID`).get(0).addEventListener("keyup", (event) => {
  if (event.keyCode === 13) {
    spotifyPlaylistLookup();
  }
});

// Shuffle array
export function shuffleArray(array) { // Fisher-Yates shuffle
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

// Difference objects function.  https://gomakethings.com/getting-the-differences-between-two-objects-with-vanilla-js/
window.diff=function(t,e){if(!e||"[object Object]"!==Object.prototype.toString.call(e))return t;var r,n={},o=function(t,e,r){var o=Object.prototype.toString.call(t),i=Object.prototype.toString.call(e);if("[object Undefined]"!==i)if(o===i)if("[object Object]"!==o)"[object Array]"!==o?"[object Function]"===o?t.toString()!==e.toString()&&(n[r]=e):t!==e&&(n[r]=e):function(t,e){if(t.length!==e.length)return!1;for(var r=0;r<t.length;r++)if(t[r]!==e[r])return!1;return!0}(t,e)||(n[r]=e);else{var c=diff(t,e);Object.keys(c).length>0&&(n[r]=c)}else n[r]=e;else n[r]=null};for(r in t)t.hasOwnProperty(r)&&o(t[r],e[r],r);for(r in e)e.hasOwnProperty(r)&&(t[r]||t[r]===e[r]||(n[r]=e[r]));return n};

// Insert el at index via $().insertIndex()
$.fn.insertIndex=function(e){var t=this.parent().children().eq(e);return this.index()>e?t.before(this):t.after(this),this};

// is object empty
export function isObjEmpty(obj) { return Object.keys(obj).length === 0 }

export function arrayDifference(oldArray, newArray) {
  const difference = newArray.filter(({ id: id1 }) => !oldArray.some(({ id: id2 }) => id2 === id1));
  return difference;
}

export function playlistArrayDifference(oldArray, newArray) {
  const difference = newArray.filter(({ trackID: id1, randomID: uint1 }) => !oldArray.some(({ trackID: id2, randomID: uint2 }) => (id2 === id1 && uint1 === uint2)));
  return difference;
}

export function friendsArrayDifference(oldArray, newArray) {
  const difference = newArray.filter(({ u: id1}) => !oldArray.some(({ u: id2,}) => (id2 === id1)));
  return difference;
}

export function commonArrayDifference(oldArray, newArray) {
  let difference = oldArray.filter(x => !newArray.includes(x));
  return difference;
}

export function filesArrayDifference(oldArray, newArray) {
  const difference = newArray.filter(({ filePath: filePath1 }) => !oldArray.some(({ filePath: filePath2 }) => filePath1 === filePath2));
  return difference;
}

export function bookmarksArrayDifference(oldArray, newArray) {
  const difference = newArray.filter(({ id: messageid1 }) => !oldArray.some(({ id: messageid2 }) => messageid1 === messageid2));
  return difference;
}

export function linkify(message) {
  return message.replace(/((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a target="_blank" href=" $1 ">$1</a> ');
}

export function messageHTMLtoText(elementID, elementInput) {
  let element = null;
  if (elementInput) {
    element = $(elementInput);
  }
  else {
    element = $(`#${elementID}`);
  }
  element.children('img.emoji').each(function() {
    const alt = $(this).get(0).alt;
    $(this).replaceWith(alt);
  });

  const savedInnerText = element.get(0).innerText;

  twemoji.parse(element.get(0));

  return savedInnerText;
}

export function decode(r){for(var e="",n=(r=r.slice(2)).length,o=0;o<n;){var t=r.slice(o,o+=2);e+=String.fromCharCode(parseInt(t,16))}return e}
export function encode(n){for(var r="0x",t=n.length,e=0;e<t;e++)r+=n.charCodeAt(e).toString(16);return r}

window.decode2 = (r) => {for(var e="",n=(r=r.slice(2)).length,o=0;o<n;){var t=r.slice(o,o+=2);e+=String.fromCharCode(parseInt(t,16))}return e}
window.encode2 = (n) => {for(var r="0x",t=n.length,e=0;e<t;e++)r+=n.charCodeAt(e).toString(16);return r}

window.addEventListener('online', function(e) {
  window.location.reload();
}, false);

window.addEventListener('offline', function(e) {
  console.log('Client has become offline.');
  $('#offlineView').removeClass('fadeOut');
  $('#offlineView').addClass('fadeIn');
  $('#offlineView').removeClass('hidden');
}, false);

export function tConvert(t){return 1<(t=t.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/)||[t]).length&&((t=t.slice(1))[5]=+t[0]<12?":AM":":PM",t[0]=+t[0]%12||12),t=(t=(t=t.join("")).split(":"))[0]+":"+t[1]+" "+t[3]}

export function securityConfirmText(str) {
  let doc = new DOMParser().parseFromString(str, 'text/html');
  return doc.body.textContent || "";
}

export function securityConfirmTextIDs(stringInput, allowSpaces) {
  let str = stringInput
  str = str.replaceAll(`'`, '');
  str = str.replaceAll(`"`, '');
  str = str.replaceAll('`', '');
  str = str.replaceAll('.', '');
  if (!allowSpaces) {
    str = str.replaceAll(' ', '');
  }
  str = securityConfirmText(str);
  str = str.replaceAll('{', '');
  str = str.replaceAll('}', '');
  str = str.replaceAll('[', '');
  str = str.replaceAll(']', '');
  str = str.replaceAll(`/`, '');
  str = str.replaceAll(`///\\`, '');
  return str;
}

export function disableButton(jQElement) {
  jQElement.addClass('disabled');
  jQElement.html(`<i style="font-size: 15px;" class='bx bx-time animated pulse faster infinite'></i>`);
}

export function enableButton(jQElement, newText) {
  window.setTimeout(() => {
    jQElement.removeClass('disabled');
    jQElement.addClass('animated');
    jQElement.addClass('pulse');
    jQElement.html(newText);

    window.setTimeout(() => {
      jQElement.removeClass('pulse');
    }, 800);

  }, 500);
}

export function dmKEYify(a, b) {
  const array = [a, b];
  array.sort();
  return array[0] + array[1];
}

export function scrollBottomMessages(cID) {
  // Only scroll down if you're near the bottom.
  const obj = $(`#${cID}ChatMessages`).get(0)

  if (obj.scrollHeight - obj.offsetHeight - obj.scrollTop < 1000) {
    // Scroll is less than 1000px from the bottom.
    $(`#${cID}ChatMessages`).get(0).scrollTop = $(`#${cID}ChatMessages`).get(0).scrollHeight - $(`#${cID}ChatMessages`).get(0).clientHeight;
    // $(`#${cID}ChatMessages`).animate({
    //   scrollTop: $(`#${cID}ChatMessages`).get(0).scrollHeight - $(`#${cID}ChatMessages`).get(0).clientHeight
    // }, 250);
  }
}

export function scrollBottomMessagesDM(uID) {
  const obj = $(`#DMMessages${uID}`).get(0);

  if (obj.scrollHeight - obj.offsetHeight - obj.scrollTop < 1000) {
    // Scroll is less than 1000px from the bottom.
    $(`#DMMessages${uID}`).get(0).scrollTop = $(`#DMMessages${uID}`).get(0).scrollHeight - $(`#DMMessages${uID}`).get(0).clientHeight;
    // $(`#DMMessages${uID}`).animate({
    //   scrollTop: $(`#DMMessages${uID}`).get(0).scrollHeight - $(`#DMMessages${uID}`).get(0).clientHeight
    // }, 250);
  }
}

export function windowSelected() {
  // Window selected AND activity timer.
  return true;
  // To do
}

window.copyToClipboard = (textToCopy) => {
  navigator.clipboard.writeText(textToCopy).then(() => {
    snac('Copied', 'Text copied to clipboard');
  })
  .catch(err => {
    window.prompt("Copy to clipboard:", textToCopy);
  })
}

window.onclick = function(event) {
  if (!event.target.matches('.dropdownButton') && !event.target.matches('.playlistButtonContext')) {
    $('.dropdown-content').removeClass('show');
  }

  if (emojiPickerOpen && !event.target.matches('.emojiButton') && event.target.tagName !== 'EMOJI-PICKER') {
    closeEmojiPicker(emojiPickerOpen);
  }

  if (gifPickerOpen && !event.target.matches('.gifPicker')) {
    closeGifPicker(gifPickerOpen);
  }

  if (channelPinnedOpen && !event.target.matches('.pinnedButton')) {
    openChannelPinned(channelPinnedOpen);
  }

  if (menuOpen && !event.target.matches('.playlistButtonContext') && !event.target.matches('.folderButtonContext') && !event.target.matches('.artistButtonContext') && !event.target.matches('#sliderOnUser')) {
    menuOpen = false;
    $('.contextMenuActive').removeClass('contextMenuActive');
  }

  if (event.target.matches('.acceptLeftClick')) {
    checkElements(event);
  }
}

window.openDropdown = (dropdownID) => {
  if ($(`#${dropdownID}`).hasClass('show')) {
    $(`#${dropdownID}`).removeClass('show');
    return;
  }

  $(`#${dropdownID}`).addClass('show');
}

function lyricsEventListeners() {
  if (cacheUser.lyrics && cacheUser.lyrics.lyrics) {
    $('#lyricsField').val(cacheUser.lyrics.lyrics);
  }

  if (cacheUser.lyrics && cacheUser.lyrics.author) {
    $(`#lyricsAuthorField`).val(cacheUser.lyrics.author)
  }

  $(`#updateLyricsConfirmButton`).get(0).onclick = () => updateLyrics();
}

function bioEventListeners() {
  if (cacheUser.bio) {
    $('#aboutMeBio').val(cacheUser.bio);
  }
  
  $(`#updateBiographyConfirmButton`).get(0).onclick = () => updateBiography();
}

document.onpaste = function (event) {
  const items = (event.clipboardData || event.originalEvent.clipboardData).items;

  for (const index in items) {
    const item = items[index];
    if (item.kind === 'file') {
      const blob = [item.getAsFile()];
      if (currentServer == 'friends' && currentChannel) {
        processDMAttachments(currentChannel, blob);
      }
      else if (currentServer && currentServerUser && currentChannel){
        processAttachment(`${currentServerUser}${currentServer}${currentChannel}`, blob);
      }
    }
  }
};

export function showUploadProgress() {
  $('#uploadProgressNumber').html('Upload Progress: 0%');
  $('#uploadProgress').removeClass('hidden');

  $('#uploadProgressContent').removeClass('fadeOutUp');
  $('#uploadProgressContent').addClass('fadeInDown');

  window.clearTimeout(uploadProgressTimeout);
}

export function hideUploadProgress() {
  $('#uploadProgressContent').removeClass('fadeInDown');
  $('#uploadProgressContent').addClass('fadeOutUp');

  uploadProgressTimeout = window.setTimeout(() => {
    $('#uploadProgress').addClass('hidden');
  }, 450);
}

export function showDroplet() {
  const leftPosition = event.clientX;
  const topPosition = event.clientY;

  const a = document.createElement('div');
  a.setAttribute('class', 'droplet animated fadeIn');
  a.setAttribute('style', `left: ${leftPosition}px; top: ${topPosition}px`);
  a.id = 'dropletTemporary';
  document.body.appendChild(a)

  window.setTimeout(() => {
    a.classList.add('dropletAnimation')
  }, 250);

  window.setTimeout(() => {
    $('#dropletTemporary').remove();
  }, 1750);
}

window.fullscreenImage = (imageID) => {
  fullScreenActive = true;
  const imageElement = $(`#${imageID}`);
  $('.fullscreenImageElementDefault').remove();
  const fullSource = imageElement.attr('fullSrc');

  const a = document.createElement('img');
  a.id = 'fullscreenImageElement';
  a.onclick = () => {
    const b = document.createElement('a');
    b.target = "_blank";
    b.href = fullSource;
    b.download = `${new Date().getTime()}.png`;
    document.body.appendChild(b);
    b.click();
    document.body.removeChild(b);
  }
  a.src = fullSource;
  a.setAttribute('class', 'fullscreenImageElement hidden');
  document.body.appendChild(a);

  $('#fullscreenImageElementWallpaper').removeClass('hidden');
  $('#fullscreenImageElementWallpaper').removeClass('fadeOut');
  $('#fullscreenImageElementWallpaper').addClass('fadeIn');

  $(`#fullscreenImageElement`).get(0).addEventListener('load', () => {
    $(`#fullscreenImageElement`).removeClass('hidden')
    window.setTimeout(() => {
      $(`#fullscreenImageElement`).addClass('fullscreenImageAnimation')
    }, 9);
  });

}

export function fadeOutFullscreenImage() {
  fullScreenActive = false;
  $('#fullscreenImageElementWallpaper').removeClass('fadeIn');
  $('#fullscreenImageElementWallpaper').addClass('fadeOut');

  $('#fullscreenImageElement').removeClass('fullscreenImageAnimation');

  window.setTimeout(() => {
    $(`#fullscreenImageElementWallpaper`).addClass('hidden');
    $(`#fullscreenImageElement`).remove();
  }, 299);

  // Select text field.
  if (currentServerUser) {
    $(`#${currentServerUser}${currentServer}${currentChannel}ChatMessageInput`).get(0).focus();
  }
  else {
    $(`#${currentChannel}ChatMessageInput`).get(0).focus();
  }
}

$('#DMEndCall').get(0).onclick = async () => { endAllCalls() }

export async function showDMCall(uID, username) {
  enableDMCallUI();
  $('#dmconnectedusername').html(`${username}`);

  $(`#voiceChatButtonVideoFriends`).get(0).onclick = () => {
    shareVideoDM(uID);
  }

  $(`#voiceChatButtonScreenFriends`).get(0).onclick = () => {
    shareScreenDM(uID);
  }

  $('#DMConnectedImg').get(0).setAttribute('userID', uID);
  $('#DMConnectedImg').get(0).setAttribute('userContext', 'voice');
  $('#DMConnectedImg').addClass(`voiceIndicator${uID}`);
  $('#DMConnectedImg').get(0).src = await returnProperURL(uID);
  displayImageAnimation('DMConnectedImg');
}

function enableDMCallUI() {
  $("#friendsServer").addClass('inCallServer');
  $(".friendCallView").removeClass('fadeOutDown');
  $(".friendCallView").addClass('fadeInUp');
  $(`#topFriendViewLeft`).addClass("topFriendViewLeftInCall");
  $(".friendCallView").removeClass('hidden');
}

export function disableDMCallUI() {
  $("#friendsServer").removeClass('inCallServer');
  $(".friendCallView").addClass('fadeOutDown');
  $(".friendCallView").removeClass('fadeInUp');
  $(`#topFriendViewLeft`).removeClass("topFriendViewLeftInCall");

  window.setTimeout(() => {
    $(".friendCallView").addClass('hidden');
  }, 200)
}

// Music
export async function setNoTrackUI() {
  showPlaybackView()

  $(`#currentTrackLoading`).removeClass('zoomOut');
  $(`#currentTrackLoadingMini`).removeClass('zoomOut');
  $(`#currentTrackLoading`).addClass('zoomIn');
  $(`#currentTrackLoadingMini`).addClass('zoomIn');

  $(`#currentTrackCover`).addClass('zoomOut');
  $(`#currentTrackCoverMini`).addClass('zoomOut');
  $(`#currentTrackCover`).removeClass('zoomIn');
  $(`#currentTrackCoverMini`).removeClass('zoomIn');

  window.clearTimeout(noTrackTimeout);
  noTrackTimeout = window.setTimeout(() => {
    $(`#currentTrackLoadingMini`).removeClass('hidden');
    $(`#currentTrackLoading`).removeClass('hidden');
    $(`#currentTrackCoverMini`).addClass('hidden');
    $(`#currentTrackCover`).get(0).src = '';
    $(`#currentTrackCoverMini`).get(0).src = '';
  }, 999)

  // Animate track title & author
  $(`#currentTrackTitle`).html('Fetching..');
  $(`#currentTrackAuthor`).addClass('waiting');

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
}

export async function setTrackUI(trackDetails) {
  showPlaybackView();

  $(`#currentTrackLoading`).removeClass('zoomIn');
  $(`#currentTrackLoadingMini`).removeClass('zoomIn');
  $(`#currentTrackLoading`).addClass('zoomOut');
  $(`#currentTrackLoadingMini`).addClass('zoomOut');
  $(`#currentTrackAuthor`).removeClass('waiting');

  window.clearTimeout(noTrackTimeout)
  noTrackTimeout = window.setTimeout(() => {
    $(`#currentTrackLoading`).addClass('hidden');
    $(`#currentTrackLoadingMini`).addClass('hidden');

    $(`#currentTrackCover`).removeClass('zoomOut');
    $(`#currentTrackCoverMini`).removeClass('zoomOut');
    $(`#currentTrackCover`).addClass('zoomIn');
    $(`#currentTrackCoverMini`).addClass('zoomIn');

    $(`#currentTrackCover`).removeClass('hidden');
    $(`#currentTrackCoverMini`).removeClass('hidden');
  }, 500)

  $(`#currentTrackCover`).attr('trackID', trackDetails.id);
  $(`#currentTrackCoverMini`).attr('trackID', trackDetails.id);
  $(`#currentTrackTitle`).attr('trackID', trackDetails.id);
  $(`#currentTrackAuthor`).attr('trackID', trackDetails.id);
  
  $(`#currentTrackCover`).get(0).src = trackDetails.attributes.artwork.url.replace('{w}', '500').replace('{h}', '500') || placeholderAlbumImage;
  $(`#currentTrackCoverMini`).get(0).src = trackDetails.attributes.artwork.url.replace('{w}', '500').replace('{h}', '500') || placeholderAlbumImage;
  $(`#currentTrackCover`).addClass('zoomIn');
  $(`#currentTrackDetails`).addClass('zoomIn');
  $(`#currentTrackCover`).removeClass('zoomOut');
  $(`#currentTrackDetails`).removeClass('zoomOut');
  $(`#currentTrackTitle`).html(trackDetails.attributes.name || 'Unknown');
  $(`#currentTrackAuthor`).html(trackDetails.attributes.artistName || 'Unknown');

  $('#trackMoreOptions').get(0).setAttribute('trackID', trackDetails.id);
  $('#trackMoreOptions').get(0).setAttribute('albumID', trackDetails.relationships.albums.data[0].id);

  $(`#currentTrackTitle`).get(0).onclick = () => {
    (trackDetails.relationships.albums.data[0].id && openAlbum(trackDetails.relationships.albums.data[0].id));
  }


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
}

export function expandMusicPopout() {
  musicPoppedOut = true;
  $('#musicPopoutButton').addClass('musicPopoutExpanded')
  $(`#musicPopoutFront`).addClass('fadeOut');
  $(`#musicPopoutFront`).removeClass('fadeIn');
  window.setTimeout(() => {
    $(`#musicPopoutFront`).addClass('hidden');

    $('#musicPopoutHidden').removeClass('hidden');
    $('#musicPopoutHidden').removeClass('fadeOut');
    $('#musicPopoutHidden').addClass('fadeIn');
  }, 400);

}

export function collapseMusicPopout() {
  musicPoppedOut = false;
  $('#musicPopoutHidden').removeClass('fadeIn');
  $('#musicPopoutHidden').addClass('fadeOut');
  $(`#musicPopoutFront`).removeClass('fadeOut');
  $(`#musicPopoutFront`).addClass('fadeIn');

  window.setTimeout(() => {
    $('#musicPopoutButton').removeClass('musicPopoutExpanded')
    $('#musicPopoutHidden').addClass('hidden');
    $(`#musicPopoutFront`).removeClass('hidden');
  }, 400);
}

export function showPlaybackView() {
  window.playbackViewActive = true;

  window.clearTimeout(playbackViewTimeout);

  showQueueButton();

  $('#musicContent').addClass('musicContentMusicShown');
  $('#musicPlayback').removeClass('hidden');
  $('#musicPlayback').removeClass('fadeOutDown');
  $('#musicPlayback').addClass('fadeInUp');

  $(`#musicServer`).addClass('inCallServer');
  
  $(`#musicViewInjection`).html(`
    :root {
      --musicContentSpaceNeeded: 92px !important;
      --sidebarSpaceNeeded: 148px !important;
      --sidebarSpaceNeededSecondary: 86px !important;
    }

    .friendViewLeft {
      height: calc(100% - 84px) !important;
    }

    #accountSidebar {
      height: calc(100% - 160px) !important;
    }

    .topFriendViewLeftInCall {
      height: calc(100% - 248px) !important;
    }

    .playlistView .musicViewContent {
      padding-bottom: 16px;
    }

    #friendCallView {
      bottom: 110px;
    }

    .serverView .sidebarLeft {
      border-radius: 12px 0px 12px 0px
    }

    .sidebarLeftContent {
      height: calc(100% - 138px) !important; 
    }

    .voiceChatSidebarLeft {
      bottom: 114px !important;
    }

    .channelSecondaryJoinedMedia {
      height: calc(100% - 364px) !important;
    }

    .editModeToolbarContainer {
      bottom: 128px;
    }
  `)

  if (currentServer !== 'music') {
    showPlaybackButton();  
  }
}

export function fileTypeMatches(matches) {
  let boxIcon = 'bx bx-file';
  switch (matches[1].toString().toLowerCase()) {
    case 'pdf':
      boxIcon = 'bxs-file-pdf';            
      break;
    case 'doc':
      boxIcon = 'bxs-file-doc';            
      break;
    case 'docx':
      boxIcon = 'bxs-file-doc';            
      break;
    case 'docx':
      boxIcon = 'bxs-file-doc';            
      break;
    case 'ppt':
      boxIcon = 'bxs-file-doc';            
      break;
    case 'pptx':
      boxIcon = 'bxs-file-doc';            
      break;
    case 'html':
      boxIcon = 'bxs-file-html';            
      break;
    case 'css':
      boxIcon = 'bxs-file-css';            
      break;
    case 'js':
      boxIcon = 'bxs-file-js';            
      break;
    case 'json':
      boxIcon = 'bxs-file-json';            
      break;
    case 'md':
      boxIcon = 'bxs-file-md';            
      break;
    case 'txt':
      boxIcon = 'bxs-file-txt';            
      break;    
    default:
      break;
  }
  return boxIcon;
}

export function hidePlaybackView() {
  clearMusicStatus();
  window.playbackViewActive = false;

  hideQueueButton();

  $('#musicContent').removeClass('musicContentMusicShown');
  $('#musicPlayback').addClass('fadeOutDown');
  $('#musicPlayback').removeClass('fadeInUp');
  playbackViewTimeout = window.setTimeout(() => {
    $('#musicPlayback').addClass('hidden');
  }, 850)

  $('.friendViewLeft').css('height', '');

  $(`#musicViewInjection`).html(``);
  $(`#musicServer`).removeClass('inCallServer');

  $(`#libraryPlayer`).get(0).src = '';
  hidePlaybackButton();
}

export function showPlaybackButton() {
  if (!playbackViewActive) {
    return;
  }

  window.clearTimeout(clearHidePlayback);

  $(`#musicPopoutButton`).removeClass('hidden');
  $(`#musicPopoutButton`).removeClass('fadeOutDown');
  $(`#musicPopoutButton`).addClass('fadeInUp');
}

export function hidePlaybackButton() {
  collapseMusicPopout();

  $(`#musicPopoutButton`).addClass('fadeOutDown');
  $(`#musicPopoutButton`).removeClass('fadeInUp');
  clearHidePlayback = window.setTimeout(() => {
    $(`#musicPopoutButton`).addClass('hidden');
  }, 800);
}

// Voice chat

export function showServerCallUI(guildUID, guildID, channelID) {
  for (let i = 0; i < serverData[guildUID + guildID].channels.length; i++) {
    if (serverData[guildUID + guildID].channels[i].split('.').shift() == channelID)  {
      $(`#connectedName${guildUID}${guildID}`).html(`<span><i class="bx bxs-bolt lightningAnimation"></i><p>Connected</p></span><br><div id="${guildUID}${guildID}VCConnectedText">${serverData[guildUID + guildID].channels[i].split('.').pop()}</div>`);
      break;
    }
  }

  $(`#${guildUID}${guildID}Server`).addClass('inCallServer');
  $(`#VCsidebarLeft${guildUID}${guildID}`).removeClass('fadeOutDown');
  $(`#VCsidebarLeft${guildUID}${guildID}`).addClass('fadeInUp');
  $(`#VCsidebarLeft${guildUID}${guildID}`).removeClass('hidden');

  $(`#${guildUID}${guildID}EndCallButton`).get(0).onclick = () => {
    endAllCalls()
  }

  $(`#${guildUID}${guildID}${channelID}voiceChatButton`).get(0)._tippy.setContent(`Leave Voice`);

  $(`#sidebarLeft${guildUID}${guildID}`).addClass('sidebarLeftInCall');
}

export function hideServerCallUI(guildUID, guildID, channelID) {
  $(`#${guildUID}${guildID}Server`).removeClass('inCallServer');

  $(`#VCsidebarLeft${guildUID}${guildID}`).addClass('fadeOutDown');
  $(`#VCsidebarLeft${guildUID}${guildID}`).removeClass('fadeInUp');
  
  window.setTimeout(() => {
    $(`#sidebarLeft${guildUID}${guildID}`).removeClass('sidebarLeftInCall');
    $(`#sidebarLeftContent${guildUID}${guildID}`).css('height', '');
    $(`#VCsidebarLeft${guildUID}${guildID}`).addClass('hidden');
  }, 200);

  $(`#${guildUID}${guildID}${channelID}voiceChatButton`).get(0)._tippy.setContent(`Join Voice`);
}

export function returnProperURL(uID) {
  return new Promise((resolve, reject) => {
    var img = new Image();
    img.onload = () => {
      resolve(`https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/pfp%2F${uID}%2Fprofile.png?alt=media`);
    }; 
    img.onerror = () => {
      resolve(`https://avatars.dicebear.com/api/bottts/${uID}.svg`);
    };
    img.src = `https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/pfp%2F${uID}%2Fprofile.png?alt=media`;
    img = null;
  })
}

export function returnProperAttachmentURL(imageURL) {
  return new Promise((resolve, reject) => {

    if (imageURL.toLowerCase().endsWith('.mp4?alt=media') || imageURL.toLowerCase().endsWith('.mov?alt=media') || imageURL.toLowerCase().endsWith('.webm?alt=media')) {
      var video = document.createElement('video');

      video.onloadeddata = function() {
        resolve(imageURL);
        console.log('here')
      }

      video.onerror = function() {
        resolve(`https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/app%2FmissingFile.png?alt=media`);
      }

      console.log('here')

      video.src = imageURL;
      video = null;
    }
    else if (imageURL.toLowerCase().endsWith('.png?alt=media') || imageURL.toLowerCase().endsWith('.jpg?alt=media') || imageURL.toLowerCase().endsWith('.jpeg?alt=media')) {
      var img = new Image();
      const previewURL = imageURL.replace(/\.[^/.]+$/, '') + '.png?alt=media';
      img.onload = () => {
        resolve(previewURL);
      }; 
      img.onerror = () => {
        resolve(`https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/app%2FmissingFile.png?alt=media`);
      };
      img.src = previewURL;
      img = null;
    }
    else if (imageURL.toLowerCase().endsWith('.mp3?alt=media')) {
      resolve(imageURL);
    }
    else {
      var img = new Image();
      img.onload = () => {
        resolve(imageURL);
      }; 
      img.onerror = () => {
        resolve(`https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/app%2FmissingFile.png?alt=media`);
      };
      img.src = imageURL;
      img = null;
    }
  })
}

export function returnProperLinkThumbnail(link, index, messageID) {
  return new Promise((resolve, reject) => {
    $(`#${messageID}LinkNum${index}`).get(0).onerror = () => {
      $(`#${messageID}LinkNum${index}`).addClass('hidden');
    }
    $(`#${messageID}LinkNum${index}`).get(0).onload = () => {
      $(`#${messageID}LinkNum${index}`).removeClass('invisible');
    }
    $(`#${messageID}LinkNum${index}`).get(0).setAttribute('src', link.image);
    resolve(true);
  });
}

export function displayImageAnimation(imageID) {
  if ($(`#${imageID}`).length) {
    $(`#${imageID}`).addClass('invisible');
    $(`#${imageID}`).get(0).onload = () => {
      $(`#${imageID}`).addClass('animated');
      $(`#${imageID}`).addClass('zoomIn');
      $(`#${imageID}`).removeClass('hidden');
      $(`#${imageID}`).removeClass('invisible');
      window.setTimeout(() => {
        $(`#${imageID}`).removeClass('zoomIn');
        $(`#${imageID}`).removeClass('animated');
        $(`#${imageID}`).removeClass('invisible');
      }, 1000);
    }
  }
}

export function displaySystemNotification(TITLE, BODY, HANDLER, UID, username) {
  playNotification();

  if (document.hasFocus()) {
    showInAppNotification(TITLE, BODY, UID, HANDLER); // In-app notification
  }
  else {
    if (Notification.permission !== 'granted') {
      // Show a little popup.
      if (localStorage.getItem('helperNotifyTwo') !== 'true') {
        localStorage.setItem('helperNotifyTwo', 'true');
  
        openModal('acceptNotifations');
        Notification.requestPermission();
      }

      showInAppNotification(TITLE, BODY, UID, HANDLER); // send in-app notification anyway.
      return;
    }

    if (retrieveSetting('desktopNotifications', true)) {
      sendToElectron('notification', {
        title: TITLE,
        body: BODY,
        hasReply: true,
        uid: UID,
        silent: true,
        username: username,
      });
    }
  }
}

// $('#incomingCallImage').get(0).setAttribute('crossOrigin', '');
// $('#incomingCallImage').get(0).addEventListener('load', () => processCallColors());

$('#DMConnectedImg').get(0).setAttribute('crossOrigin', '');
$('#DMConnectedImg').get(0).addEventListener('load', () => processConnectingColors());

function processCallColors() {
  const colors = colorThief.getColor($(`#incomingCallImage`).get(0));
  $(`#incomingCall`).get(0).setAttribute('style', `background-color: rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, 1)`);

  if ((colors[0]*0.299 + colors[1]*0.587 + colors[2]*0.114) > 186) {
    $(`#incomingCall`).get(0).style.color = '#000';
    $(`#incomingCall`).get(0).style.color = '#000';
  } else {
    $(`#incomingCall`).get(0).style.color = '#fff';
    $(`#incomingCall`).get(0).style.color = '#fff';
  }
}

function processConnectingColors() {
  try {
    const colors = colorThief.getColor($(`#DMConnectedImg`).get(0));
    $(`.friendCallView`).get(0).setAttribute('style', `background-color: rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, 1)`);
  
    if ((colors[0]*0.299 + colors[1]*0.587 + colors[2]*0.114) > 186) {
      $(`.friendCallView`).get(0).style.color = '#000';
      $(`.friendCallView`).get(0).style.color = '#000';
    } else {
      $(`.friendCallView`).get(0).style.color = '#fff';
      $(`.friendCallView`).get(0).style.color = '#fff';
    }
  
    window.setTimeout(() => {
      $(`#DMConnectedImg`).removeClass('invisible');
      $(`#DMConnectedImg`).addClass('zoomIn');
    }, 800) 
  } catch (error) { }
}

export const createEmptyAudioTrack = () => {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const dst = oscillator.connect(ctx.createMediaStreamDestination());
  oscillator.start();
  const track = dst.stream.getAudioTracks()[0];
  return Object.assign(track, { enabled: false });
};

export const createEmptyVideoTrack = ({ width, height }) => {
  const canvas = Object.assign(document.createElement('canvas'), { width, height });
  canvas.getContext('2d').fillRect(0, 0, width, height);

  const stream = canvas.captureStream();
  const track = stream.getVideoTracks()[0];

  return Object.assign(track, { enabled: false });
};

export async function showInAppNotification(title, subtitle, profilePhoto, handler) {
  const a = document.createElement('div');
  const date = new Date().getTime();
  a.id = `${date}inAppNotification`;
  a.setAttribute('class', 'inAppNotification animated fadeInRight faster');
  a.onclick = (() => {
    handler && handler();
    $(`#${date}inAppNotification`).addClass('inAppNotificationGone');
  });
  a.innerHTML = `
    <img class="hidden" id="inApp${profilePhoto}${date}"></img>
    <b>${title}</b>
    <p>${subtitle}</p>  
  `
  $(`#inAppNotificationsContainer`).get(0).appendChild(a);

  window.setTimeout(() => {
    $(`#${date}inAppNotification`).removeClass('animated');
  }, 399);

  $(`#inApp${profilePhoto}${date}`).attr('src', await returnProperURL(profilePhoto));
  displayImageAnimation(`inApp${profilePhoto}${date}`);

  window.setTimeout(() => {
    $(`#${date}inAppNotification`).addClass('inAppNotificationGone');
    window.setTimeout(() => {
      $(`#${date}inAppNotification`).remove();
    }, 499);
  }, 3499);
}

window.openGifPicker = async (ID) => {
  gifPickerOpen = ID;

  // All to have classes gifPicker
  if ($(`#${ID}gifsPickerContainer`).hasClass('hidden')) {
    $(`#${ID}gifsPickerContainer`).removeClass('hidden');

    clearInterval(gifTimeout);
    window.setTimeout(() => {
      $(`#${ID}gifsPickerContainer`).addClass('postStandardAnimationBottom');
      $(`#gifsPickerSearchBox${ID}`).val('');
      $(`#gifsPickerSearchBox${ID}`).focus();
      $(`#${ID}gifsPickerGifsContainerSearch`).addClass('hidden');
      $(`#${ID}gifsPickerGifsContainerTrending`).removeClass('hidden'); 
    }, 9);


    if ($(`#${ID}gifsPickerGifsContainerTrending`).hasClass('hidden')) {
      $(`#${ID}gifsPickerGifsContainerTrending`).removeClass('hidden');

      // Populate trending gifs https://g.tenor.com/v1/categories
      const fetchResponse = await fetch(`https://g.tenor.com/v1/categories?key=${tenorKey}&contentfilter=low`);
      const response = await fetchResponse.json();

      console.log(response);

      response.tags.map((tag) => {
        const a = document.createElement('div');
        a.setAttribute('class', 'trendingGif gifPicker');
        a.innerHTML = `
          <img class="gifPicker" src="${tag.image}" />
          <b class="gifPicker">${tag.searchterm}</b>
        `
        a.onclick = () => {
          $(`#gifsPickerSearchBox${ID}`).val(tag.searchterm);
          $(`#gifsPickerSearchBox${ID}`).focus();
          searchGifs(ID, true);
        }
        $(`#${ID}gifsPickerGifsContainerTrending`).get(0).appendChild(a);
      });


      $(`#${ID}gifsPickerGifsContainerTrending`).addClass('animated fadeIn faster');
    }
  }
  else {
    closeGifPicker(ID);
  }
}

export async function searchGifs(ID, fast) {
  const searchTerm = $(`#gifsPickerSearchBox${ID}`).val();
  const searchTermLower = searchTerm.toLowerCase().trim();

  if (!searchTermLower) {
    $(`#${ID}gifsPickerGifsContainerSearch`).addClass('hidden');
    $(`#${ID}gifsPickerGifsContainerTrending`).removeClass('hidden');  
    return;
  }

  $(`#${ID}gifsPickerGifsContainerTrending`).addClass('hidden');
  $(`#${ID}gifsPickerGifsContainerSearch`).removeClass('hidden');

  // Rate limit
  window.clearTimeout(gifsPickerSearchTimeout);
  gifsPickerSearchTimeout = setTimeout(async () => {
    const fetchResponse = await fetch(`https://g.tenor.com/v1/search?key=${tenorKey}&q=${searchTermLower}&contentfilter=low&limit=30`);
    const response = await fetchResponse.json();
    
    const fetchResponse2 = await fetch(`https://g.tenor.com/v1/search_suggestions?key=${tenorKey}&q=${searchTermLower}&limit=6`);
    const autocompleteResult = await fetchResponse2.json();

    $(`#${ID}gifsPickerGifsContainerSearch`).empty();

    console.log(autocompleteResult);

    autocompleteResult.results.map((result, index) => {
      const a = document.createElement('div');
      a.setAttribute('class', 'gifSearch gifPicker');
      a.id = `gifSearch${index}`
      a.innerHTML = `<b class="gifPicker">${result}</b>`
      a.onclick = () => {
        $(`#gifsPickerSearchBox${ID}`).val(result);
        $(`#gifsPickerSearchBox${ID}`).focus();
        searchGifs(ID, true);
      }
      $(`#${ID}gifsPickerGifsContainerSearch`).get(0).appendChild(a);
    });

    response.results.map((result) => {
      const a = document.createElement('div');
      a.setAttribute('class', 'gif');
      a.id = `gifSearch${result.id}`;
      a.onclick = () => {
        closeGifPicker(ID);
        pendingGif = result.media[0].tinygif.url;

        if (currentServerUser && currentServer !== 'friends') {
          sendChannelChatMessage(currentServerUser, currentServer, currentChannel, true);
        }
        else {
          sendDMMessage(currentChannel, false, true)
        }

      }
      a.innerHTML = `
        <img id="gifSearchImage${result.id}" src="${result.media[0].tinygif.preview}" />
      `
      $(`#${ID}gifsPickerGifsContainerSearch`).get(0).appendChild(a);
      $(`#gifSearch${result.id}`).hover(() => {
        $(`#gifSearchImage${result.id}`).attr('src', result.media[0].tinygif.url)
      }, () => {
        $(`#gifSearchImage${result.id}`).attr('src', result.media[0].tinygif.preview)
      })
    });
  }, fast ? 9 : 499);
}

export function closeGifPicker(ID) {
  // Close it.
  gifPickerOpen = false;
  $(`#${ID}gifsPickerContainer`).removeClass('postStandardAnimationBottom');
  gifTimeout = window.setTimeout(() => {
    $(`#${ID}gifsPickerContainer`).addClass('hidden');
  }, 299);
}

window.openEmojiPicker = (ID) => {
  emojiPickerOpen = ID;
  
  if (!$(`#${ID}emojiPickerContainer`).children().length) {
    const picker = new Picker({
      locale: 'en'
    });
    $(`#${ID}emojiPickerContainer`).get(0).appendChild(picker);

    const observer = new MutationObserver((mutations) => {
      twemoji.parse(picker.shadowRoot, {
        className: 'twemoji'
      });
    });

    observer.observe(picker.shadowRoot, {
      subtree: true,
      childList: true
    });

    const style = document.createElement('style');
    style.textContent = `
      .picker {
        border-radius: 12px;
        box-shadow: 0px 1px 14px -3px rgba(0,0,0,0.32);
      }

      #search {
        padding-left: 12px !important;
        color: var(--fg1) !important;
        border: 1px solid var(--afg2) !important;
      }

      .emoji-menu {
        padding-right: 10px !important;
        margin-bottom: 8px !important;
      }

      .favorites  {
        border-top: 3px solid var(--afg2) !important;
        margin-bottom: 0px !important;
        padding-right: 0px !important;
      }

      .tabpanel {
        margin-top: 4px;
        border-top: 3px solid var(--afg2) !important;
      }

      .nav {
        margin: 0px 8px 0px 8px !important;
      }

      .indicator-wrapper {
        margin: 0px 8px 4px 8px !important;
      }

      ::-webkit-scrollbar {
        width: 0.4em;
        height: 0.4em;
        border-radius: 12px;
      }
      
      /* Track */
      ::-webkit-scrollbar-track {
        background-color: var(--bg1);
        border-radius: 0px 12px 12px 0px;
      }
      
      /* Handle */
      ::-webkit-scrollbar-thumb {
        background: var(--primary);
        width: 0.8em;
        border-radius: 12px;
        transition: all 0.5s;
      }
      
      /* Handle on hover */
      ::-webkit-scrollbar-thumb:hover {
        cursor: pointer;
        border-radius: 0px;
        transition: all 0.5s;
      }

      button.emoji {
        border-bottom: 2px solid transparent !important;
        transition: all 0.5s;
        outline: none !important;
      }

      button {
        outline: none !important;
      }

      button.emoji:hover {
        background-color: transparent !important;
        cursor: var(--defaultByPointer) !important;
        border-bottom: 2px solid var(--secondary) !important;
        border-radius: 8px !important;
      }

      .indicator {
        background-color: var(--primary) !important;
        border-radius: 36px;
      }

      @media
      not screen and (-webkit-min-device-pixel-ratio: 2),
      not screen and (   min--moz-device-pixel-ratio: 2),
      not screen and (     -o-min-device-pixel-ratio: 2/1),
      not screen and (        min-device-pixel-ratio: 2),
      not screen and (                min-resolution: 192dpi),
      not screen and (                min-resolution: 2dppx) { 

        div.emoji {
          padding-right: 3px;
        }

      }

      .skintone-list {
        right: 6px;
        border-radius: 12px !important;
      }

      div.emoji {
        padding-right: 3px;
        outline: none !important;
        background: transparent !important;
        transition: all 0.5s;
        box-sizing: border-box !important;
      }

      .nav-button {
        transition: all 0.5s !important;
        outline: none !important;
        border-bottom: 2px solid transparent !important;
        box-sizing: border-box !important;
      }

      #skintone-button {
        margin-right: 8px !important;
        margin-left: 8px !important;
      }

      .tabpanel  {
        background-color: var(--bg2) !important;
      }

      .nav-button:hover {
        transition: all 0.5s !important;
        background-color: transparent !important;
        cursor: var(--defaultByPointer) !important;
        border-bottom: 2px solid var(--secondary) !important;
        border-radius: 8px !important;
      }

      .twemoji {
        width: 24px !important;
        pointer-events: none !important;
      }
    `
    picker.shadowRoot.appendChild(style);
    picker.addEventListener('emoji-click', event => {
      insertAtCursor($(`#${ID}ChatMessageInput`), event.detail.unicode);
      $(`#messageLabel${ID}`).addClass('active'); // On lounges.
      $(`#${ID}chatMessageLabel`).addClass('active'); // On DMs.
    });
  }

  if ($(`#${ID}emojiPickerContainer`).hasClass('hidden')) {
    $(`#${ID}emojiPickerContainer`).removeClass('hidden')
    clearInterval(emojiTimeout);
    window.setTimeout(() => {
      $(`#${ID}emojiPickerContainer`).addClass('postStandardAnimationBottom');
    }, 9);
  }
  else {
    closeEmojiPicker(ID);
  }
}

export function closeEmojiPicker(ID) {
  emojiPickerOpen = false;
  $(`#${ID}emojiPickerContainer`).removeClass('postStandardAnimationBottom');
  emojiTimeout = window.setTimeout(() => {
    $(`#${ID}emojiPickerContainer`).addClass('hidden');
  }, 299);
}

export function insertAtCursor(myField, txtToAdd) {
  myField[0].focus();
  const [start, end] = [$(myField)[0].selectionStart, $(myField)[0].selectionEnd];
  $(myField)[0].setRangeText(txtToAdd, start, end, 'select');
  window.setTimeout(() => {
    $(myField)[0].selectionStart = start + txtToAdd.length;
    $(myField)[0].selectionEnd = start + txtToAdd.length;
  }, 9);
}

export function isThisAFile(maybeFile) {
  return new Promise(function (resolve, reject) {
    if (maybeFile.type !== '') {
      return resolve(maybeFile)
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      if (reader.error && reader.error.name === 'NotFoundError') {
        return reject(reader.error.name)
      }
      resolve(maybeFile)
    }
  })
}

function showQueueButton() {
  $(`#musicTabButton_queue`).removeClass('hidden');
  window.setTimeout(() => {
    $(`#musicTabButton_queue`).removeClass('musicSidebarButtonGone');
  }, 9);
}

function hideQueueButton() {
  $(`#musicTabButton_queue`).addClass('musicSidebarButtonGone');
  window.setTimeout(() => {
    $(`#musicTabButton_queue`).addClass('hidden');
  }, 499);
}

// !! ONCLICKS !!
export function addOnclickByID(ObjectID, directFunction) {
  $(`#${ObjectID}`).get(0).onclick = directFunction;
}

$(`.infiniteNotice`).each((index, object) => {
  $(object).get(0).onclick = () => {
    openSpecialServer('infinite');
  }
})


addOnclickByID('userPopoutsContainerBackground', () => {closeUserPopout()});
addOnclickByID('fullscreenImageElementWallpaper', () => {fadeOutFullscreenImage()});
addOnclickByID('musicPopoutFront', () => {expandMusicPopout()});
addOnclickByID('playerBackwardButtonMini', () => {backwardSong(); document.activeElement.blur();});
addOnclickByID('playerForwardButtonMini', () => {forwardSong(); document.activeElement.blur();});
addOnclickByID('collapsePopout', () => {collapseMusicPopout()});
addOnclickByID('modal-background', () => {closeModal()});

addOnclickByID('newPlaylistCreateButton', () => {createPlaylist()});
addOnclickByID('previewRequestButtonFriends', () => {prepareFriendRequest()});
addOnclickByID('submitbtnprofile', () => {completeProfile()});
addOnclickByID('verifyButton', () => {sendVerify()});
addOnclickByID('replayIntro', () => {startTutorial()});

addOnclickByID('settingsTabButton_general', () => {expandTab('general')});
addOnclickByID('settingsTabButton_profile', () => {settingsTab('profile')});
addOnclickByID('settingsTabButton_account', () => {settingsTab('account')});
addOnclickByID('settingsTabButton_appearance', () => {settingsTab('appearance')});
addOnclickByID('settingsTabButton_notifications', () => {settingsTab('notifications')});
addOnclickByID('settingsTabButton_feedback', () => {window.open(`https://docs.google.com/forms/d/18Y82qsZ_eMTsIXu3EpygzUor2LUOen4G_ZAzscFPpsw/`)});
addOnclickByID('settingsTabButton_getStarted', () => {settingsTab('getStarted')})
addOnclickByID('settingsTabButton_storage', () => {settingsTab('storage')});
addOnclickByID('settingsTabButton_advanced', () => {settingsTab('advanced')});
addOnclickByID('settingsTabButton_sounds', () => {settingsTab('sounds')});
addOnclickByID('settingsTabButton_playback', () => {expandTab('playback')});
addOnclickByID('settingsTabButton_guide', () => {expandTab('guide')});
addOnclickByID('settingsTabButton_updates', () => {window.open('https://github.com/r0hin/parallel/releases/latest')});
addOnclickByID('settingsTabButton_support', () => {window.open('https://parallelsocial.net/support')});
addOnclickByID('settingsTabButton_questions', () => {window.open('https://github.com/r0hin/parallel/discussions')});
addOnclickByID('settingsTabButton_features', () => {window.open('https://github.com/r0hin/parallel/issues')});
addOnclickByID('settingsTabButton_bugs', () => {window.open('https://github.com/r0hin/parallel/issues')});

// todo: acceptable use policy
addOnclickByID('linkToAcceptableUse', () => {window.open('https://parallelsocial.net/support')});

addOnclickByID('settingsTabButton_playbackSettings', () => {settingsTab('playbackSettings')});
addOnclickByID('settingsTabButton_playbackOutput', () => {settingsTab('playbackOutput')})
addOnclickByID('settingsTabButton_transfer', () => {settingsTab('transfer')});

addOnclickByID('linkSpotifyButton', () => {loginSpotify()});
addOnclickByID('inputDevicesRefreshButton', () => {refreshInputDevices()});
addOnclickByID('outputDevicesRefreshButton', () => {refreshOutputDevices()});

addOnclickByID('changePFPButton', () => {changeProfilePhoto()});
addOnclickByID('signOutButton', () => {signOutParallel()});
addOnclickByID('newBioButton', () => {openModal('newBio')});
addOnclickByID('newLyricsButton', () => {openModal('newLyrics')});
addOnclickByID('removeLyricsButton', () => {removeLyrics()});
addOnclickByID('removeBioButton', () => {removeBio()});
addOnclickByID('openModalContactButton', () => {openModal('contact')});
addOnclickByID('openModalCreditsButton', () => {openModal('credits')});

addOnclickByID('setThemeLightButton', () => {setTheme('light')});
addOnclickByID('setThemeAutoButton', () => {setTheme('auto')});
addOnclickByID('setThemeDarkButton', () => {setTheme('dark')});
addOnclickByID('newFriendButton', () => {openModal('newFriend')});
addOnclickByID('friendSortButton', () => {toggleFriendsSort()});
addOnclickByID('friendsTabFriendsButton', () => {friendsTab('friends', $(`#friendsTabFriendsButton`).get(0)) });
addOnclickByID('friendsTabIncomingButton', () => {friendsTab('incoming', $(`#friendsTabIncomingButton`).get(0)) });
addOnclickByID('friendsTabOutgoingButton', () => {friendsTab('outgoing', $(`#friendsTabOtherButton`).get(0)) });
addOnclickByID('friendsTabBlockedButton', () => {friendsTab('blocked', $(`#friendsTabOtherButton`).get(0)) });
addOnclickByID('noFriendsAddFriendButton', () => {openModal('newFriend')});
addOnclickByID('cancelFriendsSearchIcon', () => {cancelFriendsSearch()});
addOnclickByID('musicTabButton_explore', () => {musicTab('explore')});
addOnclickByID('musicTabButton_friends', () => {musicTab('friends')});
addOnclickByID('musicTabButton_search', () => {musicTab('search')});
addOnclickByID('musicTabButton_queue', () => {musicTab('queue')});
addOnclickByID('newPlaylistButton', () => {openNewPlaylistDialog()});
addOnclickByID('newPlaylistFolderButton', () => {openNewPlaylistFolderDialog()});
addOnclickByID('musicTabButton_saved', () => {musicTab('saved')});
addOnclickByID('musicSearchButton', () => {searchMusicButton()});
addOnclickByID('refreshFriendsButton', () => {reloadSocialTab()});
addOnclickByID('updateQueueText', () => {switchToHistory()});
addOnclickByID('queueClearButton', () => {clearQueue()});
addOnclickByID('historyClearButton', () => {clearHistory()});
addOnclickByID('playerBackwardButton', () => {backwardSong(); document.activeElement.blur();});
addOnclickByID('playerForwardButton', () => {forwardSong(); document.activeElement.blur();});

addOnclickByID('checkoutOne', () => {goToCheckout("price_1KFmL0Ba3MWDKrNRw1Q45Hx4")});
addOnclickByID('checkoutTwo', () => {goToCheckout("price_1KFmLWBa3MWDKrNRy95tTKwo")});
addOnclickByID('checkoutThree', () => {goToCheckout("price_1KFmMWBa3MWDKrNRvyTENeRA")});
addOnclickByID('manageSubscriptionButton', () => {manageSubscription()});

addOnclickByID('changeEmailButton', () => {openEmailInput()});
addOnclickByID('changePasswordButton', () => {changePassword()});
addOnclickByID('bookmarksButton', () => { showBookmarks() });
addOnclickByID('bookmarksBackground', () => {hideBookmarks()});
addOnclickByID('bookmarksCloseButton', () => {hideBookmarks()});
addOnclickByID('keycodesButton', () => {openModal('keyCodes')});
addOnclickByID('removeLinkedTrackButton', () => {removeTrackFromProfile()});
addOnclickByID('deleteAccountButton', () => {deleteAccount()});
addOnclickByID('gettingStartedProfilePhoto', () => { settingsTab('account'); });
addOnclickByID('gettingStartedSpotify', () => { settingsTab('transfer'); });
addOnclickByID('gettingStartedAppearance', () => { settingsTab('appearance'); });
addOnclickByID('gettingStartedInfinite', () => { openSpecialServer('infinite'); });
addOnclickByID('gettingStartedAddFriends', () => { openSpecialServer('friends'); });
addOnclickByID('gettingStartedGroup', () => { openSpecialServer('add'); });
addOnclickByID('gettingStartedMusic', () => { openSpecialServer('music'); });
addOnclickByID('gettingStartedSupport', () => { openModal('contact'); });
addOnclickByID('questionMarkButton', () => { requestNewTrack() })
addOnclickByID('createGroupButton', () => { createGroup() });
addOnclickByID('openJoinGroupButton', () => { joinGroup() });
addOnclickByID('createGroupFolderButton', () => { createGroupFolder() });
addOnclickByID('updateServer', () => updateApp()) ;
addOnclickByID('clearAllUploadsButton', () => prepareDestroyAllFiles() );

// Emojis
twemoji.parse($(`#musicTab_getStarted`).get(0));

if (window.location.href.includes('.ca')) {
  $(`#emaillink1`).attr('href', 'mailto:support@parallelsocial.ca');
  $(`#emaillink1`).html('support@parallelsocial.ca');
  $(`#emaillink2`).attr('href', 'mailto:support@parallelsocial.ca');
  $(`#emaillink2`).html('support@parallelsocial.ca');

  $(`#weblink1`).attr('href', 'https://parallelsocial.ca/policies.pdf');
  $(`#weblink2`).attr('href', 'https://parallelsocial.ca/policies.pdf');
  $(`#weblink3`).attr('href', 'https://parallelsocial.ca/policies.pdf');
}