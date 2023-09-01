import { getFirestore, onSnapshot, getDoc, doc, updateDoc, serverTimestamp as dbts } from '@firebase/firestore';
import { getDatabase, off, remove, ref, get as rtdbget, set, query, endBefore, orderByKey, limitToLast, onChildAdded, onChildChanged, onChildRemoved, onValue, push, update, serverTimestamp as rtdbts} from '@firebase/database';
import { getStorage, ref as storageRef, uploadBytesResumable } from '@firebase/storage';
import { getFunctions, httpsCallable } from '@firebase/functions';

import * as timeago from 'timeago.js';

import { securityConfirmText, displayInputEffect, dmKEYify, tConvert, linkify, scrollBottomMessagesDM, showDroplet, disableButton, enableButton, closeModal, showUploadProgress, hideUploadProgress, timer, displayImageAnimation, displaySystemNotification, returnProperAttachmentURL, openModal, messageHTMLtoText, returnProperLinkThumbnail, fileTypeMatches, searchGifs, switchViewsToContent } from './app';
import { showTippyListenerPresence, updatePresenceForUser } from './presence';
import { checkValidSubscription } from './stripe';
import { hideMediaViewDM, joinScreenDM, joinVideoDM, manageVCFriendsDisplay } from './voice';
import { blockUser, unblockUser } from './users';
import { retrieveSetting } from './settings';
import { playMessageSound } from './sounds';
import { joinGroup } from './servers';
import { checkAppInitialized } from './firebaseChecks';
import { sendToElectron } from './electron';

window.activeMessageListener = '';
window.activePinnedListener = '';
window.activeReadListener = '';
window.activeFriendsSort = 'date';
window.activeDM = '';

window.DMListenerCreated = false;

window.DMLatestMessagesPagination = {};
window.DMLatestMessageTimestamp = {};
window.DMCachedEditMessages = {};
window.DMunreadIndicatorsData = {};
window.DMPendingAttachments = {};
Window.cacheDirectUnread = {};
window.DMunreadIndicators = {};
window.DMCachedPins = {};
window.DMServerData = {};
window.pendingPlayers = {};
window.friendPlayers = {};
window.pendingGif = null;

window.cacheFriendsData = [];
window.cacheFriendsIncomingData = [];
window.cacheFriendsOutgoingData = [];
window.cacheFriendsBlockedData = [];

window.searchHiddenTimeout = null;
window.onLoadTime = new Date().getTime();

checkAppInitialized();
const db = getFirestore();
const functions = getFunctions();
const storage = getStorage();
const rtdb = getDatabase();

window.prepareFriendRequest = async () => {
  disableButton($(`#previewRequestButtonFriends`));

  const name = $('#newFriendName').val().toLowerCase();

  if (name === cacheUser.username) {
    snac('Friend Request Error', 'You cannot send a friend request to yourself.', 'danger');
    enableButton($(`#previewRequestButtonFriends`), 'Preview Request');
    return;
  }

  const appDoc = await getDoc(doc(db, `store/${name}`));

  if (!appDoc.exists()) {
    $('#errorNoUser').removeClass('hidden');
    $('#friendPreview').addClass('hidden');
    enableButton($(`#previewRequestButtonFriends`), 'Preview Request');
    return;
  }

  const userDoc = await getDoc(doc(db, `users/${appDoc.data().map}`));

  $('#errorNoUser').addClass('hidden');
  $('#friendPreview').removeClass('hidden');
  $('#friendPreview').html(`<img id="previewImageSendRequest" src="${await returnProperURL(appDoc.data().map)}" class="invisible" /> <b>${userDoc.data().username.capitalize()}</b>`);
  displayImageAnimation(`previewImageSendRequest`);

  $('#previewRequestButtonFriends').get(0).onclick = () => { confirmFriendRequest();};
  enableButton($(`#previewRequestButtonFriends`), 'Confirm Request');
}

export function friendEventListeners() {
  $(`#newFriendName`).get(0).addEventListener("keyup", function(event) {
    $('#previewRequestButtonFriends').html('Preview Request');
    if (event.keyCode === 13) { $(`#previewRequestButtonFriends`).get(0).click() }
    $('#previewRequestButtonFriends').get(0).onclick = () => { prepareFriendRequest();};
  });
}

window.confirmFriendRequest = async (userID) => {
  let uID = userID;
  if (!userID) {
    disableButton($(`#previewRequestButtonFriends`));
    const name = $('#newFriendName').val().toLowerCase();
    const appDoc = await getDoc(doc(db, `store/${name}`));
    uID = appDoc.data().map;
  }

  const userDoc = await getDoc(doc(db, `users/${uID}`));

  if (userDoc.data().incomingFriendRequests.some(e => e.u == user.uid)) {
    snac('Friend Request Error', 'You already have an outgoing friend request to this person.', 'danger');
    $('#previewRequestButtonFriends').attr('onclick', 'prepareFriendRequest()');
    enableButton($(`#previewRequestButtonFriends`), 'Preview Request');
    return; 
  }
  
  if (cacheUser.friends.some(e => e.u === uID)) {
    snac('Friend Request Error', 'You are already friends with this person.', 'danger');
    $('#previewRequestButtonFriends').attr('onclick', 'prepareFriendRequest()');
    enableButton($(`#previewRequestButtonFriends`), 'Preview Request');
    return;
  }

  if (cacheUser.blockedUsers && cacheUser.blockedUsers.some(e => e.u === uID)) {
    snac('Friend Request Error', 'You have blocked this user. Unblock them to send a friend request.', 'danger');
    $('#previewRequestButtonFriends').attr('onclick', 'prepareFriendRequest()');
    enableButton($(`#previewRequestButtonFriends`), 'Preview Request');
    return;
  }
  
  if (cacheUser.incomingFriendRequests.some(e => e.u == uID)) {
    // Accept friend request
    acceptRequest(uID, userDoc.data().username);
    return;
  }

  notifyTiny('Adding friend...', true);
  closeModal();

  const addFriendRequest = httpsCallable(functions, "addFriendRequest");
  const result = await addFriendRequest({target: uID});

  if (result.data.data === false) {
    snac('Friend Request Error', 'Contact support or try again.', 'danger');
    $('#previewRequestButtonFriends').attr('onclick', 'prepareFriendRequest()');
    enableButton($(`#previewRequestButtonFriends`), 'Preview Request');
    return;
  }
  
  snac('Friend Request Sent', 'A friend request was successfully sent to this user.', 'success');
}

window.friendsTab = (tab, el) => {
  $(`.friendsTab`).addClass('hidden');
  $(`#friendsList${tab}`).removeClass('hidden');
  
  $('.friendsTabButtonActive').removeClass('friendsTabButtonActive');
  $(el).addClass('friendsTabButtonActive');
}

export function loadFriends() {
  loadFriendsActive(cacheUser.friends || []);
  loadIncoming(cacheUser.incomingFriendRequests || []);
  loadOutgoing(cacheUser.outgoingFriendRequests || []);
  loadBlocked(cacheUser.blockedUsers || []);
  createPresenceListeners();
}

async function loadFriendsActive(friends) {
  const friendsListForward = friendsArrayDifference(cacheFriendsData, friends);
  const friendsListBackward = friendsArrayDifference(friends, cacheFriendsData);
  cacheFriendsData = friends;
  
  for (let i = 0; i < friendsListForward.length; i++) {
    const friend = friendsListForward[i];
    
    const a = document.createElement('div');
    a.setAttribute('class', 'friendCardList activeFriendCard userContextItem');
    a.setAttribute('userID', friend.u);
    a.setAttribute('username', friend.n);
    a.onclick = () => {
      openFriendsDM(friend.u, friend.n);
    }
    a.id = `${friend.u}FriendItem`;
    
    a.innerHTML = `
      ${`
        <div id="InComingItemContent${friend.u}" class="friendListItemContent">
          <div class="firstBox"><img class="friendcardlistimagepfp" id="${friend.u}frienditemimage" src="${await returnProperURL(friend.u)}"/><div id="${friend.u}PresenceIndicatorFriendsActiveList" class="presenceIndicator ${friend.u}presence"></div><span>${friend.n.capitalize()}<div id="${friend.u}MSGPreview" class="MSGPreview"></div></span></div>
          <div class="dateItem" id="${friend.u}prevMSGDate">
          </div>
        </div>
      `}
    `;

    if (!$(`#${friend.u}FriendItem`).length) {
      $(`#friendsListfriendsContent`).get(0).appendChild(a);
      displayImageAnimation(`${friend.u}frienditemimage`);
    }

    if (DMunreadIndicators[friend.u]) {
      addDMIndicator(friend.u);
    }

    tippy($(`#${friend.u}PresenceIndicatorFriendsActiveList`).get(0), {
      content: '',
      placement: 'top',
      onTrigger: () => showTippyListenerPresence(friend.u, $(`#${friend.u}PresenceIndicatorFriendsActiveList`))
    }); // Prepare tooltip for 'online' | 'offline' | 'last online x days ago'

    $(`#${friend.u}FriendCardButton`).removeClass('disabled');
    $(`#${friend.u}FriendCardButton`).html(`<i class='bx bx-message-square-dots'></i>`);
    if ($(`#${friend.u}FriendCardButton`).length) {
      $(`#${friend.u}FriendCardButton`).get(0)._tippy.setContent("Message");
      $(`#${friend.u}FriendCardButton`).get(0).onclick = () => {
        switchAndOpenFriendsDM(friend.u, friend.n);
        disableButton($(`#${friend.u}FriendCardButton`));
      }
    }


    updatePresenceForUser(friend.u);
  }
  
  for (let i = 0; i < friendsListBackward.length; i++) {
    const friend = friendsListBackward[i];
    $(`#${friend.u}FriendItem`).remove();
    $(`#${friend.u}friendView`).remove();
    $(`#${friend.u}MusicListeningCard`).remove(); // Things in music social.
    $(`#${friend.u}userContainerItem`).remove(); 

    // Clear indicator if exists.
    if (DMunreadIndicators[friend.u]) {
      markDMRead(friend.u);
    }

    if (currentChannel == friend.u) {
      currentChannel = '';
      activeDM = '';
    }

    $(`#${friend.u}FriendCardButton`).removeClass('disabled');
    $(`#${friend.u}FriendCardButton`).html(`<i class='bx bx-user-plus'></i>`);
    if ($(`#${friend.u}FriendCardButton`).length) {
      $(`#${friend.u}FriendCardButton`).get(0)._tippy.setContent("Add Friend");
      $(`#${friend.u}FriendCardButton`).get(0).onclick = () => {
        confirmFriendRequest(friend.u);
        disableButton($(`#${friend.u}FriendCardButton`));
      }
    }
  }

  if (!DMListenerCreated) {
    DMListenerCreated = true;
    createDMListener();
  }

  $('#activeNonMessage').addClass('hidden');
  if (!cacheFriendsData.length) {
    $('#activeNonMessage').removeClass('hidden');
  }
}

async function loadIncoming(friends) {
  const friendsListForward = friendsArrayDifference(cacheFriendsIncomingData, friends);
  const friendsListBackward = friendsArrayDifference(friends, cacheFriendsIncomingData);
  cacheFriendsIncomingData = friends;
  
  for (let i = 0; i < friendsListForward.length; i++) {
    const friend = friendsListForward[i];
  
    const a = document.createElement('div');
    a.setAttribute('class', 'friendCardList incomingCard userContextItem');
    a.setAttribute('userID', friend.u);
    a.setAttribute('username', friend.n);
    a.id = `${friend.u}InComingItem`;
    a.innerHTML = `
      ${`
        <div id="InComingItemContent${friend.u}" class="friendListItemContent">
          <div class="firstBox"><img class="friendcardlistimagepfp" id="${friend.u}frienditemimageincoming" src="${await returnProperURL(friend.u)}" /><span>${friend.n.capitalize()}</span></div>
          <div>
          <button id="incomingAcceptButton${friend.u}" class="btn b-0 roundedButton"><i class="bx bx-check"></i></button>
          <button id="incomingRejectButton${friend.u}" class="btn b-0 roundedButton"><i class="bx bx-x"></i></button>
          </div>
        </div>
      `}
    `

    if (!$(`#${friend.u}InComingItem`).length) {
      $(`#friendsListincoming`).get(0).appendChild(a);
      displayImageAnimation(`${friend.u}frienditemimageincoming`);
    }

    $(`#incomingAcceptButton${friend.u}`).get(0).onclick = () => acceptRequest(friend.u, friend.n)
    $(`#incomingRejectButton${friend.u}`).get(0).onclick = () => rejectRequest(friend.u, friend.n)

    tippy(`#incomingAcceptButton${friend.u}`, {
      content: 'Accept Request',
      placement: 'top',
    });

    tippy(`#incomingRejectButton${friend.u}`, {
      content: 'Reject Request',
      placement: 'top',
    });
  
    $(`#${friend.u}FriendCardButton`).removeClass('disabled');
    $(`#${friend.u}FriendCardButton`).html(`<i class='bx bx-check'></i>`);
    if ($(`#${friend.u}FriendCardButton`).length) {
      $(`#${friend.u}FriendCardButton`).get(0)._tippy.setContent("Accept Request");
      $(`#${friend.u}FriendCardButton`).get(0).onclick = () => {
        acceptRequest(friend.u, friend.n);
        disableButton($(`#${friend.u}FriendCardButton`));
      }
    }
  }

  for (let i = 0; i < friendsListBackward.length; i++) {
    const friend = friendsListBackward[i];
    $(`#${friend.u}InComingItem`).remove();

    if (!cacheUser.friends.some(x => x.u == friend.u)) {
      $(`#${friend.u}FriendCardButton`).removeClass('disabled');
      $(`#${friend.u}FriendCardButton`).html(`<i class='bx bx-user-plus'></i>`);
      if ($(`#${friend.u}FriendCardButton`).length) {
        $(`#${friend.u}FriendCardButton`).get(0)._tippy.setContent("Add Friend");
        $(`#${friend.u}FriendCardButton`).get(0).onclick = () => {
          confirmFriendRequest(friend.u);
          disableButton($(`#${friend.u}FriendCardButton`));
        }
      }
    }
  }

  $('#incomingFriendsCount').html(cacheFriendsIncomingData.length);

  $('#incomingFriendsCount').removeClass("hidden");
  $('#incomingNonMessage').addClass('hidden');

  if (!cacheFriendsIncomingData.length) {
    $('#incomingFriendsCount').addClass("hidden");
    $('#incomingNonMessage').removeClass('hidden');
  }
}

export async function acceptRequest(targetUID, targetName) {
  disableButton($(`#incomingAcceptButton${targetUID}`));
  disableButton($(`#incomingRejectButton${targetUID}`));

  $(`#${targetUID}InComingItem`).css('height', '48px');
  $(`#${targetUID}InComingItem`).css('transition', 'all 0.45s');
  $(`#${targetUID}InComingItem`).css('background-color', 'lime');
  $(`#InComingItemContent${targetUID}`).css('opacity', '0')

  $(`#${targetUID}InComingItem`).css('padding', '0px');
  $(`#${targetUID}InComingItem`).css('margin', '0px');
  window.setTimeout(() => {
    $(`#${targetUID}InComingItem`).css('height', '0px');
  }, 100);

  notifyTiny('Accepting request...', true);

  const acceptRequest = httpsCallable(functions, "acceptRequest");
  const result = await acceptRequest({target: targetUID});

  if (result.data.data === false) {
    snac('Friend Request Error', `Contact support or try again.`, 'danger');
  }

  else {
    snac('Friend Request Accepted', `The friend request from ${targetName} was accepted successfully.`, 'success');
  }
}

async function rejectRequest(targetUID, targetName) {
  disableButton($(`#incomingAcceptButton${targetUID}`));
  disableButton($(`#incomingRejectButton${targetUID}`));

  $(`#${targetUID}InComingItem`).css('height', '48px');
  $(`#${targetUID}InComingItem`).css('transition', 'all 0.45s');
  $(`#${targetUID}InComingItem`).css('background-color', 'red');
  $(`#InComingItemContent${targetUID}`).css('opacity', '0');

  $(`#${targetUID}InComingItem`).css('padding', '0px');
  $(`#${targetUID}InComingItem`).css('margin', '0px');

  window.setTimeout(() => {
    $(`#${targetUID}InComingItem`).css('height', '0px')
  }, 100);

  const rejectRequest = httpsCallable(functions, "rejectRequest");
  const result = await rejectRequest({target: targetUID});

  if (result.data.data === false) {
    snac('Friend Request Error', `Contact support or try again.`, 'danger');
  }

  else {
    snac('Friend Request Rejected', `The friend request from ${targetName} was rejected successfully.`, 'success');
  }
}

async function loadOutgoing(friends) {
  const friendsListForward = friendsArrayDifference(cacheFriendsOutgoingData, friends);
  const friendsListBackward = friendsArrayDifference(friends, cacheFriendsOutgoingData);
  cacheFriendsOutgoingData = friends;
  
  for (let i = 0; i < friendsListForward.length; i++) {
    const friend = friendsListForward[i];
  
    const a = document.createElement('div');
    a.setAttribute('class', 'friendCardList outgoingCard userContextItem ');
    a.setAttribute('userID', friend.u);
    a.setAttribute('username', friend.n);
    a.id = `${friend.u}OutGoingItem`;
    a.innerHTML = `
      ${`
        <div id="OutGoingItemContent${friend.u}" class="friendListItemContent">
          <div class="firstBox"><img class="friendcardlistimagepfp" id="${friend.u}frienditemimageoutogingi" src="${await returnProperURL(friend.u)}" /><span>${friend.n.capitalize()}</span></div>
          <button onclick="cancelRequest('${friend.u}', '${friend.n}')" id="outgoingTrashButton${friend.u}" class="btn b-0 roundedButton"><i class='bx bx-trash'></i></
        </div>
      `}
    `

    if (!$(`#${friend.u}OutGoingItem`).length) {
      $(`#friendsListOutgoingContent`).get(0).appendChild(a);
      displayImageAnimation(`${friend.u}frienditemimageoutogingi`);
    }

    tippy(`#outgoingTrashButton${friend.u}`, {
      content: 'Cancel Request',
      placement: 'top',
    });

    $(`#${friend.u}FriendCardButton`).removeClass('disabled');
    $(`#${friend.u}FriendCardButton`).html(`<i class='bx bx-x'></i>`);
    if ($(`#${friend.u}FriendCardButton`).length) {
      $(`#${friend.u}FriendCardButton`).get(0)._tippy.setContent("Cancel Request");
      $(`#${friend.u}FriendCardButton`).get(0).onclick = () => {
        cancelRequest(friend.u)
        disableButton($(`#${friend.u}FriendCardButton`));
      }
    }
  }

  for (let i = 0; i < friendsListBackward.length; i++) {
    const friend = friendsListBackward[i];
    $(`#${friend.u}OutGoingItem`).remove();

    if (!cacheUser.friends.some(x => x.u === friend.u)) {
      $(`#${friend.u}FriendCardButton`).removeClass('disabled');
      $(`#${friend.u}FriendCardButton`).html(`<i class='bx bx-user-plus'></i>`);
      if ($(`#${friend.u}FriendCardButton`).length) {
        $(`#${friend.u}FriendCardButton`).get(0)._tippy.setContent("Add Friend");
        $(`#${friend.u}FriendCardButton`).get(0).onclick = () => {
          confirmFriendRequest(friend.u);
          disableButton($(`#${friend.u}FriendCardButton`));
        }
      }
    }
  }

  $('#outgoingFriendsCount').html(cacheFriendsOutgoingData.length);

  $('#outgoingFriendsCount').removeClass("hidden");
  $('#outgoingNonMessage').addClass('hidden');

  if (!cacheFriendsOutgoingData.length) {
    $('#outgoingFriendsCount').addClass("hidden");
    $('#outgoingNonMessage').removeClass('hidden');
  }
}

window.cancelRequest = (targetUID, targetNameInput) => {
  return new Promise(async () => {
    let targetName = targetNameInput; 
    if (!targetName) {
      const userDoc = await getDoc(doc(db, `users/${targetUID}`));
      targetName = userDoc.data().username;
    }
  
    // Do somethin special with that div item lol
    disableButton($(`#outgoingTrashButton${targetUID}`));
  
    $(`#${targetUID}OutGoingItem`).css('height', '48px');
    $(`#${targetUID}OutGoingItem`).css('transition', 'all 0.45s');
    $(`#OutGoingItemContent${targetUID}`).css('opacity', '0');
    $(`#${targetUID}OutGoingItem`).css('padding', '0px');
    $(`#${targetUID}OutGoingItem`).css('margin', '0px');
  
    window.setTimeout(() => {
      $(`#${targetUID}OutGoingItem`).css('height', '0px');
    }, 100);
  
    notifyTiny('Cancelling request...', true);
  
    const cancelRequestFunc = httpsCallable(functions, "cancelRequest");
    const result = await cancelRequestFunc({target: targetUID});
  
    if (result.data.data === false) {
      snac('Friend Request Error', `Contact support or try again.`, 'danger');
    }
    else {
      snac('Friend Request Cancelled', `The friend request to ${targetName} was cancelled successfully.`, 'success');
    }
  });
}

async function loadBlocked(friends) {
  const friendsListForward = friendsArrayDifference(cacheFriendsBlockedData, friends);
  const friendsListBackward = friendsArrayDifference(friends, cacheFriendsBlockedData);
  cacheFriendsBlockedData = friends;
  
  for (let i = 0; i < friendsListForward.length; i++) {
    const friend = friendsListForward[i];
  
    const a = document.createElement('div');
    a.setAttribute('class', 'friendCardList blockedCard userContextItem');
    a.setAttribute('userID', friend.u);
    a.setAttribute('username', friend.n);
    a.id = `${friend.u}BlockedItem`;
    a.innerHTML = `
      ${`
        <div id="blockedItemContent${friend.u}" class="friendListItemContent">
          <div class="firstBox"><img class="friendcardlistimagepfp" id="${friend.u}frienditemimageblocked" src="${await returnProperURL(friend.u)}" /><span>${friend.n.capitalize()}</span></div>
          <button id="blockedCancelButton${friend.u}" class="btn b-0 roundedButton"><i class='bx bx-heart'></i></
        </div>
      `}
    `

    if (!$(`#${friend.u}BlockedItem`).length) {
      $(`#friendsListblocked`).get(0).appendChild(a);
      displayImageAnimation(`${friend.u}frienditemimageblocked`);
    }

    $(`#blockedCancelButton${friend.u}`).get(0).onclick = () => {
      unblockUser(friend.u, friend.n);
    }

    tippy(`#blockedCancelButton${friend.u}`, {
      content: 'Unblock',
      placement: 'top',
    });
  }

  for (let i = 0; i < friendsListBackward.length; i++) {
    const friend = friendsListBackward[i];
    $(`#${friend.u}BlockedItem`).remove();
  }

  $('#blockedFriendsCount').html(cacheFriendsBlockedData.length);

  $('#blockedFriendsCount').removeClass("hidden");
  $('#blockedNonMessage').addClass('hidden');

  if (!cacheFriendsBlockedData.length) {
    $('#blockedFriendsCount').addClass("hidden");
    $('#blockedNonMessage').removeClass('hidden');
  }
}

export async function openFriendsDM(uID, inputUsername) {
  currentChannel = uID;
  let username = inputUsername

  hideMediaViewDM(uID, true);
  if (window.innerWidth < 600) {
    switchViewsToContent()
  }

  if (!inputUsername) {
    for (let i = 0; i < cacheUser.friends.length; i++) {
      if (cacheUser.friends[i].u === uID) {
        username = cacheUser.friends[i].u 
        break;
      };      
    }
  }

  if (!username) {
    snac('Friends Error', 'Contact support or try again.', 'danger');
  }

  if (activeDM == uID) {
    return;
  }
  
  try {
    off(query(ref(rtdb, `direct/${dmKEYify(uID, user.uid)}/messages`)));
  } catch (error) { }
  
  activeDM = uID;
  
  if ($(`#${uID}friendView`).length) {
    $('.friendViewContentView').addClass('hidden');
    $('.friendsListItemActive').removeClass('friendsListItemActive');

    $(`#${uID}friendView`).removeClass('hidden');
    $(`#${uID}FriendItem`).addClass('friendsListItemActive');

    $(`#${uID}ChatMessageInput`).get(0).focus();

    addDMListeners(uID, true);
    scrollBottomMessagesDM(uID);
    return;
  }

  const a = document.createElement('div')
  a.setAttribute('class', 'friendViewContentView hidden')
  a.id = `${uID}friendView`
  a.innerHTML = `
  <div id="${uID}MostlyChatView" class="friendViewChatView ${uID}Grid">
    <div id="${uID}DropTarget" class="dropTarget animated fadeIn faster">
      <button onclick="$('#${uID}DropTarget').css('display', '')" class="btn b-1 dropTargetButton"><i class="bx bx-x"></i></button>
    </div>
    <div class="friendViewHeader">
      <div><b onclick="openUserCard('${uID}')">${username.capitalize()}</b><div id="read${uID}Notice" class="hidden animated fadeIn faster readRecipet"></div></div>
      <div class="voiceItems">
        <div class="friendHeaderCallTag hidden animated fadeIn" id="friendHeaderCallTag${uID}">On Call</div>
        <button class="btn b-2 friendHeaderJoinButton hidden animated fadeIn" id="friendHeaderVideo${uID}">View Video</button>
        <button class="btn b-2 friendHeaderJoinButton hidden animated fadeIn" id="friendHeaderScreen${uID}">View Screen</button>
      </div>
      <div class="friendViewButtons">
        <div class="dropdown">
          <button onclick="openDropdown('${uID}Dropdown')" class="btn b-3 roundedButton dropdownButton" id="${uID}moreOptionsButton"><i class="bx bx-dots-vertical-rounded"></i></button>
          <div id="${uID}Dropdown" class="dropdown-content">
            <a onclick="openUserCard('${uID}')" class="btn">Profile</a>
            <div class="dropdownDivider"></div>
            <a onclick="prepareRemoveFriend('${uID}', true); disableButton($('#${uID}RemoveFriendButton'))" id="${uID}RemoveFriendButton" class="btn">Remove Friend</a>
            <a onclick="reportUser('${uID}')" class="btn">Report</a>
            <a id="blockUserButton${uID}" class="btn">Block</a>
            <div class="dropdownDivider"></div>
            <a onclick="copyToClipboard('${uID}')" class="btn">Copy ID</a>
          </div>
        </div>
        <button onclick="loadMoreDMMessages('${uID}')" class="btn b-3 roundedButton" id="${uID}LoadMoreMessagesButton"><i class="bx bx-up-arrow-alt"></i></button>
        <button onclick="openChannelPinned('${uID}')" class="btn b-3 roundedButton pinnedButton" id="${uID}pinnedMessagesButton"><i class="bx bx-pin"></i></button>
        <button onclick="startCallDM('${uID}')" class="btn b-3 roundedButton" id="${uID}callUserButtonInitial"><i class="bx bx-phone"></i></button>
      </div>
    </div>
    <div class="hidden" id="PaginationPreview${uID}"></div>
    <div class="messagesContainerDM" id="DMMessages${uID}">
      <div class="emptyChannel animated fadeIn hidden" id="emptyChannel${uID}"><i class='bx bx-file-blank animated pulse infinite fast'></i><br><b>No Messages</b><p>Be the first to send a message!</p></div>
    </div>
    <center>
      <div class="DMAttachmentManager hidden" id="${uID}DMAttachmentManager">
        <div class="DMAttachmentManagerContent hidden animated faster" id="${uID}DMAttachmentManagerContent"> </div>
      </div>
      <div class="gifsPickerContainer gifPicker preStandardAnimationBottom hidden" id="${uID}gifsPickerContainer">
        <div class="gifsPickerContainerHeader gifPicker">
          <div class="gifsHeaderTitle gifPicker">GIFs</div>
          <button id="closeGifsButton${uID}" class="btn b-3 roundedButton"><i class="bx bx-x"></i></button>
        </div>
        <div class="gifsPickerContent">
          <!-- Search Box -->
          <div class="gifsPickerSearchContainer gifPicker">
            <input autocomplete="off" type="text" id="gifsPickerSearchBox${uID}" class="gifsPickerSearchBoxInput gifPicker" placeholder="Search GIFs">
            <i class="bx bx-search"></i>
          </div>

          <!-- GIFs -->
          <div class="gifsPickerGifsContainer gifPicker">
            <div id="${uID}gifsPickerGifsContainerTrending" class="gifsPickerGifsContainerTrending gifPicker hidden"> </div>
            <div id="${uID}gifsPickerGifsContainerSearch" class="gifsPickerGifsContainerSearch gifPicker"> </div>
            <p class="poweredByTenor">Powered by Tenor.</p>
          </div>

        </div>
      </div>
      <div class="emojiPickerContainer preStandardAnimationBottom hidden" id="${uID}emojiPickerContainer"></div>
      <div class="pinnedMessagesContainer pinnedMessagesContainerDM preStandardAnimation hidden" id="${uID}pinnedMessagesContainer">
        <div class="pinnedHeader">
          <div class="pinnedHeaderTitle">Pinned Messages</div>
          <div>
            <button id="closePinnedButton${uID}" class="btn b-3 roundedButton"><i class="bx bx-x"></i></button>
          </div>
        </div>
        <div class="pinnedMessages" id="${uID}pinnedMessages"></div>
        <div id="emptyPinned${uID}" class="noPinned"><h2><i class="bx bx-pin"></i></h2>No pinned messages.</div>
      </div>
    </center>
    <div class="chatMessageBar chatMessageBarDM">
      <div class="form"><div>
        <label for="${uID}ChatMessageInput" id="${uID}chatMessageLabel">Send a message:</label>
        <input autocomplete="off" text="text" id="${uID}ChatMessageInput"> </input>
      </div></div>
      <div class="quickActions">
        <button class="btn b-0 roundedButton gifPicker" id="gifsButton${uID}" onclick="openGifPicker('${uID}')"><i class="bx bx-search-alt gifPicker"></i></button>
        <button class="btn b-0 roundedButton emojiButton" id="${uID}emojiButton" onclick="openEmojiPicker('${uID}')">😺</button>
        <button class="btn b-0 roundedButton" id="${uID}AttachmentButton" onclick="addDMAttachment('${uID}')"><i class='bx bxs-file-plus'></i></button>
        <button class="btn b-1 roundedButton" id="${uID}SendMessageButton" onclick="sendDMMessage('${uID}')"><i class='bx bx-send bx-rotate-270'></i></button>
      </div>
    </div>
  </div>
  <div id="${uID}MostlyVoiceView" class="hidden friendVoiceView">
    <div id="${uID}MostlyVoiceViewContent" class="hidden animated faster">
      <center><br>
        <img class="voiceChatIllustrationLeft" src="https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/app%2Fundraw_Group_selfie_re_h8gb.svg?alt=media" />
        <img class="voiceChatIllustrationRight" src="https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/app%2Fundraw_Hang_out_re_udl4.svg?alt=media" />
        <svg class="voiceChatWavesGraphic" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#3267FF" fill-opacity="1" d="M0,32L17.1,48C34.3,64,69,96,103,96C137.1,96,171,64,206,96C240,128,274,224,309,229.3C342.9,235,377,149,411,112C445.7,75,480,85,514,85.3C548.6,85,583,75,617,64C651.4,53,686,43,720,32C754.3,21,789,11,823,10.7C857.1,11,891,21,926,48C960,75,994,117,1029,160C1062.9,203,1097,245,1131,218.7C1165.7,192,1200,96,1234,53.3C1268.6,11,1303,21,1337,42.7C1371.4,64,1406,96,1423,112L1440,128L1440,320L1422.9,320C1405.7,320,1371,320,1337,320C1302.9,320,1269,320,1234,320C1200,320,1166,320,1131,320C1097.1,320,1063,320,1029,320C994.3,320,960,320,926,320C891.4,320,857,320,823,320C788.6,320,754,320,720,320C685.7,320,651,320,617,320C582.9,320,549,320,514,320C480,320,446,320,411,320C377.1,320,343,320,309,320C274.3,320,240,320,206,320C171.4,320,137,320,103,320C68.6,320,34,320,17,320L0,320Z"></path></svg>
        <h2 class="voiceChatTitle">Start a Call</h2>
        <button class="btn closeVoiceChatButton roundedButton" onclick="startCallDM('${uID}')"><i class="bx bx-x"></i></button>
        <div class="voiceChatButtons">
          <button id="callUserButton${uID}" onclick="callUser('${uID}', '${username}')" class="btn b-1 voiceChatAudio"><i class='bx bx-phone-call'></i> audio call</button>
          <p>Free, unlimited duration.</p>
        </div>
      </center>
    </div>
  </div>
  `
  
  $('#friendViewRight').get(0).appendChild(a);
  
  twemoji.parse($(`#${uID}emojiButton`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });

  $(`#friendHeaderVideo${uID}`).get(0).onclick = () => {
    joinVideoDM(uID, username);
  }

  $(`#friendHeaderScreen${uID}`).get(0).onclick = () => {
    joinScreenDM(uID, username);
  }

  tippy($(`#gifsButton${uID}`).get(0), {
    content: `GIFs`,
    placement: 'top',
  });

  tippy($(`#${uID}emojiButton`).get(0), {
    content: `Emojis`,
    placement: 'top',
  });

  tippy($(`#${uID}AttachmentButton`).get(0), {
    content: `Add Attachment`,
    placement: 'top',
  });

  tippy($(`#${uID}SendMessageButton`).get(0), {
    content: `Send`,
    placement: 'top',
  });

  tippy($(`#${uID}pinnedMessagesButton`).get(0), {
    content: 'Pinned Messages',
    placement: 'top',
  });

  tippy($(`#closePinnedButton${uID}`).get(0), {
    content: 'Close',
    placement: 'top',
  });

  tippy($(`#closeGifsButton${uID}`).get(0), {
    content: 'Close',
    placement: 'top',
  });

  tippy($(`#${uID}LoadMoreMessagesButton`).get(0), {
    content: 'Load More',
    placement: 'top'
  });

  tippy($(`#${uID}callUserButtonInitial`).get(0), {
    content: 'Call',
    placement: 'top'
  });

  tippy($(`#${uID}moreOptionsButton`).get(0), {
    content: 'More Options',
    placement: 'top'
  });

  // Drag & Drop
  $(`#${uID}DropTarget`).get(0).ondragenter = (e) => {
    e.preventDefault();
  }

  $(`.${uID}Grid`).get(0).ondragenter = (e) => {
    $(`#${uID}DropTarget`).css('display', 'block');
  }

  $(`#${uID}DropTarget`).get(0).ondragleave = (e) => {
    $(`#${uID}DropTarget`).css('display', '');
    e.preventDefault();
  }

  $(`#${uID}DropTarget`).get(0).ondragover = (e) => {
    e.preventDefault();
  }

  $(`.${uID}Grid`).get(0).ondrop = (e) => {
    showDroplet();

    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      processDMAttachments(uID, [e.dataTransfer.files[i]]);
    }

    $(`#${uID}DropTarget`).css('display', '');
    e.preventDefault();
  }

  // FOR LATER: <button id="callUserButton('${uID}')" onclick="callUser('${uID}')" class="btn b-1 voiceChatVideo"><i class='bx bx-video' ></i> video call</button>
  displayInputEffect();

  // button on enter.
  $(`#${uID}ChatMessageInput`).get(0).addEventListener("keyup", function(event) {
    if (event.keyCode === 13) { event.preventDefault(); sendDMMessage(uID) }
  });

  $(`#gifsPickerSearchBox${uID}`).get(0).addEventListener("keyup", (event) => {
    searchGifs(uID);
  })

  $('.friendViewContentView').addClass('hidden');
  $(`#${uID}friendView`).removeClass('hidden');

  $('.friendsListItemActive').removeClass('friendsListItemActive');
  $(`#${uID}FriendItem`).addClass('friendsListItemActive');
  
  $(`#${uID}ChatMessageInput`).get(0).focus();

  $(`#blockUserButton${uID}`).get(0).onclick = () => {
    blockUser(uID, username);
  }

  addDMListeners(uID);
}

window.loadMoreDMMessages = async (uID) => {
  disableButton($(`#${uID}LoadMoreMessagesButton`));

  const response = addMessagesPagination(uID);
  if (response == 'topOfMessages' || !DMLatestMessagesPagination[uID]) {
    enableButton($(`#${uID}LoadMoreMessagesButton`), `<i class="bx bx-chat"></i>`);
    $(`#${uID}LoadMoreMessagesButton`).get(0)._tippy.setContent('No more messages.');
  }
  else {
    await timer(3200);
    enableButton($(`#${uID}LoadMoreMessagesButton`), `<i class="bx bx-up-arrow-alt"></i>`);
  }
}

function addMessagesPagination(uID) {
  if (!DMLatestMessagesPagination[uID]) {
    disablePagination[uID] = true;
    completePagination[uID] = true;
    return 'topOfMessages';
  }

  // Add messages without a listener. 
  rtdbget(query(ref(rtdb, `direct/${dmKEYify(uID, user.uid)}/messages`), orderByKey(), limitToLast(18), endBefore(DMLatestMessagesPagination[uID]))).then(async (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      let newPagination = ''
      // Ordered by farthest to newest aka higher to lower
      
      const bottomMostNew = new Date(data[Object.keys(data)[Object.keys(data).length - 1]].timestamp);
      const topMostOld = new Date(parseInt($(`#DMMessages${uID}`).children('.containsDivider').first().get(0).getAttribute('ts')));

      if (bottomMostNew.getFullYear() == topMostOld.getFullYear() && bottomMostNew.getMonth() == topMostOld.getMonth() && bottomMostNew.getDate() == topMostOld.getDate()) {
        // Same day, delete topmost timestamp.
        $(`#DMMessages${uID}`).children('.containsDivider').first().children('.chatMessageDivider').first().remove();
        $(`#DMMessages${uID}`).children('.containsDivider').first().removeClass('containsDivider')
      }

      for (const key of Object.keys(data)) {
        const value = data[key]
        
        if (!newPagination) {
          newPagination = key
        }

        await buildDMMessage(value, uID, key, `PaginationPreview`)
        twemoji.parse($(`#DMMessageContentOfID${key}`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });
      }

      DMLatestMessagesPagination[uID] = newPagination
      // $(`#DMMessages${uID}`).scrollTop($(`#DMMessages${uID}`).get(0).scrollHeight - bottomScroll - 840);

      const newContent = $(`#PaginationPreview${uID}`).html();
      $(`#PaginationPreview${uID}`).html('');
      $(`#DMMessages${uID}`).prepend(newContent);
    }
    else {
      DMLatestMessagesPagination[uID] = '';
    }
  });

  disablePagination[uID] = false;
}

export async function pinDMMessage(uID, messageID, messageSender, username) {
  await update(ref(rtdb, `direct/${dmKEYify(uID, user.uid)}/pinned/${messageID}`), {
    u: username,
    s: messageSender,
    c: messageHTMLtoText(null, $(`#DMMessageContentOfID${messageID}`).get(0))
  });

  snac('Message Pinned', 'A message was successfully pinned in this DM.', 'success');
}

export async function unpinDMMessage(uID, messageID, skipNotify) {
  await remove(ref(rtdb, `direct/${dmKEYify(uID, user.uid)}/pinned/${messageID}`));

  if (!skipNotify) {
    snac('Message Unpinned', 'A message was successfully unpinned in this DM.', 'success');
  }
}

export async function addDMListeners(uID, secondTime) {
  // Always clear.
  $(`#DMMessages${uID}`).find('.chatMessage').remove();
  DMLatestMessageTimestamp[uID] = new Date(0);
  DMLatestMessagesPagination[uID] = null;
  
  try { 
    off(query(ref(rtdb, `${activeMessageListener}`)));
  } catch (error) {};

  try {
    off(query(ref(rtdb, `${activePinnedListener}`)));
  } catch (error) {}

  try {
    activeReadListener();
  } catch (error) {}

  activeMessageListener = `direct/${dmKEYify(uID, user.uid)}/messages`;
  activePinnedListener = `direct/${dmKEYify(uID, user.uid)}/pinned`;

  if (DMunreadIndicators[`${uID}`]) {
    markDMRead(uID);
  }

  // Set message listener now that the channel has been opened.
  onChildAdded(query(ref(rtdb, `${activeMessageListener}`), orderByKey(), limitToLast(24)), async (snapshot) => {
    // Make sure latest message is newer.
    if (new Date(snapshot.val().timestamp) < DMLatestMessageTimestamp[uID]) {
      // The purpose for this is to disable old messages that enter the window through newer, deleted messages
      // don't get added to the DOM in the latest position.
      return;
    };

    if (DMLatestMessagesPagination[uID] == null) {
      // farthest message / first message / first run.
      DMLatestMessagesPagination[uID] = snapshot.key
    }

    DMLatestMessageTimestamp[uID] = new Date(snapshot.val().timestamp);

    // if ($(`#DMMessageOfID${snapshot.key}`).length) {
    //   displayDMDeleteMessage(snapshot.key);
    // }

    if (!$(`#messageContentContainerOfID${snapshot.key}`).length) {
      await buildDMMessage(snapshot.val(), uID, snapshot.key);
      twemoji.parse($(`#DMMessageContentOfID${snapshot.key}`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });
    }
  });

  // Delete message listener.
  onChildRemoved(query(ref(rtdb, `${activeMessageListener}`)), (snapshot) => {
    displayDMDeleteMessage(snapshot.key);
  });

  // Edit message listener.
  onChildChanged(query(ref(rtdb, `${activeMessageListener}`)), (snapshot) => {
    $(`#DMMessageContentOfID${snapshot.key}`).html(messageify(snapshot.val().content));
    twemoji.parse($(`#DMMessageContentOfID${snapshot.key}`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });
    if (snapshot.val().edited) {
      $(`#DMMessageContentOfID${snapshot.key}`).addClass('editedMessage');
      $(`#DMEditedMessageOfID${snapshot.key}`).removeClass('hidden');
      $(`#DMEditedMessageIconOfID${snapshot.key}`).get(0)._tippy.setContent(`Edited ${timeago.format(new Date(snapshot.val().editedDate))}`);
    }
    // If sent a message, its approved now.
  });

  onValue(query(ref(rtdb, `${activeMessageListener}`), limitToLast(1)), (snapshot) => {
    if (snapshot.exists() && snapshot.val()) {
      $(`#emptyChannel${uID}`).addClass('hidden');
    }
    else {
      $(`#emptyChannel${uID}`).removeClass('hidden');
    }
  });

  if (!DMCachedPins[uID]) {
    DMCachedPins[uID] = new Set();
  }

  $(`#${uID}pinnedMessages`).empty();
  onChildAdded(query(ref(rtdb, `${activePinnedListener}`), limitToLast(50)), async (snapshot) => {
    DMCachedPins[uID].add(snapshot.key);
    const a = document.createElement('div');
    a.setAttribute('class', 'messageReplay');
    a.id = `messageReplayOfID${snapshot.key}`;
    a.innerHTML = `
      <img class="profilePhotoReplay" id="${snapshot.key}pinimage"></img>
      <span class="chatMessageNameplate">${snapshot.val().u.capitalize()}</span>
      <p>${snapshot.val().c}</p>
      <button id="unpin${snapshot.key}" class="btn b-4 roundedButton pinnedButton unPinButton"><i class="bx bx-checkbox-minus"></i></button>
    `
    $(`#${uID}pinnedMessages`).get(0).appendChild(a);
    twemoji.parse($(`#messageReplayOfID${snapshot.key}`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });
    $(`#${snapshot.key}pinimage`).attr('src', await returnProperURL(snapshot.val().s));
    $(`#unpin${snapshot.key}`).get(0).onclick = () => {
      disableButton($(`#unpin${snapshot.key}`));
      unpinDMMessage(uID, snapshot.key, true);
    }
  });

  onChildRemoved(query(ref(rtdb, `${activePinnedListener}`), limitToLast(50)), (snapshot) => {
    DMCachedPins[uID].delete(snapshot.key);
    $(`#messageReplayOfID${snapshot.key}`).css('height', $(`#messageReplayOfID${snapshot.key}`).height() + 'px');
    window.setTimeout(() => {
      $(`#messageReplayOfID${snapshot.key}`).addClass('bookmarkGone');
      window.setTimeout(() => {
        $(`#messageReplayOfID${snapshot.key}`).remove();
      }, 499);
    }, 9);
  });

  onValue(query(ref(rtdb, `${activePinnedListener}`), limitToLast(1)), (snapshot) => {
    if (snapshot.exists() && snapshot.val()) {
      $(`#emptyPinned${uID}`).addClass('hidden');
    }
    else {
      $(`#emptyPinned${uID}`).removeClass('hidden');
    }
  });

  // VC
  if (voiceChatRef !== `voice/${dmKEYify(uID, user.uid)}`) {
    try {
      if (voiceChatRef) {
        off(query(ref(rtdb, voiceChatRef)));
      }
    } catch (error) { }
  
    voiceChatRef = `voice/${dmKEYify(uID, user.uid)}`;
    onValue(query(ref(rtdb, voiceChatRef)), (snapshot) => {
      manageVCFriendsDisplay(uID, snapshot.val());
    });
  }
  else {
    console.log('Skipping VC Ref listener. Already set.')
  }

  activeReadListener = onSnapshot(doc(db, `DMUnread/${uID}`), (doc) => {

    // DMunreadIndicatorsData is my own unread!
    // Look at the official last message DMServerData.
    if (doc.exists() && doc.data()[user.uid] && DMServerData[uID].latest) {
      // 200ms buffer.
      if (doc.data()[user.uid].toDate().getTime() + 200 >= new Date(DMServerData[uID].latest).getTime() && !doc.data().hideRead) {
        console.log('read latest')
        // Read latest message.
        $(`#read${uID}Notice`).html(`Read ${timeago.format(doc.data()[user.uid].toDate())}.`);
        $(`#read${uID}Notice`).removeClass('hidden');
      }
      else {
        // Hasn't read latest message.
        $(`#read${uID}Notice`).addClass('hidden');
      }
    }
  });

  $(`#DMMessages${uID}`).get(0).onscroll = () => {};
  window.setTimeout(() => {
    // Paginatoion
    $(`#DMMessages${uID}`).get(0).onscroll = (function (event) {
      const scroll = $(`#DMMessages${uID}`).scrollTop();
      if (scroll < 599) {
        if (completePagination[uID]) { return; }
        if (!disablePagination[uID]) { disablePagination[uID] = true; addMessagesPagination(uID); }
      }
    });
  }, 1800);
}

export async function setReadReciepts(setting) {
  await updateDoc(doc(db, `DMUnread/${user.uid}`), {
    hideRead: setting
  });
}

function displayDMDeleteMessage(key) {
  // Delete the message firstly
  const parentElement = $(`#messageContentContainerOfID${key}`).parent().parent();

  $(`#messageContentContainerOfID${key}`).remove();

  if (parentElement.hasClass('otherChatMessage')) {
    if (parentElement.children('.topLevelMessageContentTwo').first().children().length == 2) {
      parentElement.remove();
    }
  }
  else {
    if (parentElement.children('.topLevelMessageContentTwo').first().children().length == 1) {
      parentElement.remove();
    }
  }
}

window.sendDMMessage = async (uID, messageInput, force) => {
  let message = $(`#${uID}ChatMessageInput`).val();
  if (messageInput) {
    message = messageInput;
  }

  $(`#${uID}ChatMessageInput`).val()

  if (!message.length && !force) {
    if (DMPendingAttachments[uID] && DMPendingAttachments[uID].length) {
      message = ``;
    }
    else {
      return; 
    }
  }

  if (message.length > 1200) {
    snac('Invalid Message', 'Your message cannot be longer than 1200 characters.', 'danger')
    return;
  }
  
  if (disableMessageSending) {
    return;
  }

  $(`#${uID}ChatMessageInput`).val('');

  disableMessageSending = true; 

  $(`#read${uID}Notice`).addClass('hidden');

  const reg = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*?[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig;
  const matches = message.match(reg);

  let linkPreviewContent = message;
  let result = [];
  
  if ( matches ) {
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      linkPreviewContent = linkPreviewContent.replaceAll(match, ``);
    }
  }
  if ( linkPreviewContent.includes('https') || linkPreviewContent.includes('http') ) {
    notifyTiny('Generating preview.', true);
    const getLinkPreview = httpsCallable(functions, "getLinkPreview");
    result = await getLinkPreview({ content: linkPreviewContent });
    result = result.data.data
  }

  // Change message content track: into track:id.artist.name
  const words = message.split(' ');
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (word.includes('track:')) {
      const trackID = word.split('track:')[1];
      const trackDetails = await makeMusicRequest(`songs/${trackID}`);  // Get track details.
      console.log(trackDetails)
      if (trackDetails.data[0].attributes.name) {
        message = message.replace(word, `track:${trackID}.${trackDetails.data[0].attributes.name.replaceAll(".", "&ParallelPeriod&")}.${trackDetails.data[0].attributes.artistName.replaceAll(".", "&ParallelPeriod&")}`.replaceAll(" ", "&ParallelSpace&"));
      }
    }
  }

  // Upload all attachments.
  hideDMAttachmentManager(uID);
  if (!DMPendingAttachments[uID]) {
    DMPendingAttachments[uID] = [];
  }

  let DMFinalAttachments = [];
  for (let i = 0; i < DMPendingAttachments[uID].length; i++) {
    const file = DMPendingAttachments[uID][i];
    showUploadProgress();
    const imageID = new Date().getTime()
    DMFinalAttachments.push(await uploadDMAttachmentFile(uID, imageID, file));

    if (['jpg', 'jpeg', 'png'].includes(file.name.split('.').pop().toLowerCase())) {
      const resizeImages = httpsCallable(functions, "resizeImages");
      await resizeImages({targetChannel: dmKEYify(uID, user.uid), filePath: `attachments/${dmKEYify(user.uid, uID)}/${user.uid}/${imageID}.${file.name.split(".").pop()}`});
    }

    hideUploadProgress();
  }

  if (pendingGif) {
    DMFinalAttachments.push(pendingGif);
    pendingGif = null;
    // Select text field
    $(`#${uID}ChatMessageInput`).focus();
  }

  DMPendingAttachments[uID] = [];
  $(`#${uID}DMAttachmentManagerContent`).empty()

  playMessageSound();
  window.setTimeout(() => {
    disableMessageSending = false;
  }, 499);

  await push(ref(rtdb, `direct/${dmKEYify(uID, user.uid)}/messages`), {
    attachments: DMFinalAttachments,
    author: cacheUser.username,
    timestamp: rtdbts(),
    content: message,
    uid: user.uid,
    links: result
  });

  await set(ref(rtdb, `directUnread/${user.uid}/${uID}`), {
    latest: rtdbts(),
    latestContent: message || `${DMFinalAttachments.length} Attachment(s)`,
    username: `${cacheUser.username}`,
  });

  await set(ref(rtdb, `directUnread/${uID}/${user.uid}`), {
    latest: rtdbts(),
    latestContent: message || `${DMFinalAttachments.length} Attachment(s)`,
    username: `${cacheUser.username}`,
  });

  const perspectiveapi = await fetch("https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=AIzaSyDwSVIkiXmE5CFqOkqyew75zX5pRbpuboo", { body: `{comment: {text: "${securityConfirmTextIDs(message, true)}"}, languages: ["en"], requestedAttributes: {TOXICITY:{}, SEVERE_TOXICITY: {}} }`, headers: { "Content-Type": "application/json" }, method: "POST"});
  const perspective = await perspectiveapi.json();

  if (perspective && perspective.attributeScores && perspective.attributeScores["SEVERE_TOXICITY"] && perspective.attributeScores["SEVERE_TOXICITY"].summaryScore.value > 0.8) {
    openModal('toxicityWarning');
  }
}

export function messageify(content) {
  // Get invite codes.

  let messageDraft = linkify(securityConfirmText(content));

  const words = content.split(' ');
  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    if (word.includes('inv:')) {
      if (word.split('inv:')[1].length == 49) {
        messageDraft = messageDraft.replace(word, `
          <button class="btn inMessageButton" onclick="previewJoinWithInvite('${word.split('inv:')[1]}')">Join Group</button>
        `)
      }
    }

    else if (word.includes('track:')) {
      const track = word.split('track:')[1].split('.');
      if (track[0] && track[1] && track[2]) {
        messageDraft = messageDraft.replace(word, `
          <button onclick="playTrackByMessage(this, '${track[0]}')" class="btn inMessageButton" ">${track[2].replaceAll("&ParallelSpace&", " ").replaceAll('&ParallelPeriod&', ".")} - ${track[1].replaceAll("&ParallelSpace&", " ").replaceAll('&ParallelPeriod&', ".")}</button>
        `)
      }
    }
  }

  messageDraft = messageDraft.replaceAll(`/alexa end call`, '🤳 <span class="pronouncedText">Alexa, end call.</span>');
  messageDraft = messageDraft.replaceAll(`/to the moon`, '<span class="pronouncedText">to the moon</span> 🚀🌔');
  messageDraft = messageDraft.replaceAll(`/kovi fans`, '🦋 <span class="pronouncedText">Kovi🧡 Fans</span> 🧡');
  messageDraft = messageDraft.replaceAll(`/whispurr alert`, '<span class="pronouncedText">Whispurr accidentally</span> 🍺❓');
  messageDraft = messageDraft.replaceAll(`/funny man`, '😂 <span class="pronouncedText">Amar Funny Man</span> 😂😳');
  messageDraft = messageDraft.replaceAll(`/td bank`, '💸 <span class="pronouncedText">Trust Fund Daddy Banking Institution</span> 🏦');
  messageDraft = messageDraft.replaceAll(`/parallel social`, '<span class="pronouncedText">Parallel Social</span> ✨');
  messageDraft = messageDraft.replaceAll(`/x4nn@gmail.com`, '🧑‍✈️ <span class="pronouncedText">Heffe Bozo (alert)</span> 💸💸');

  return messageDraft;
}

window.previewJoinWithInvite = (invitation) => {
  joinGroup();
  $(`#inviteCodeField`).val(invitation);
  $(`#inviteCodeField`).addClass('active');
  $(`#inviteCodeField`).get(0).focus();
  notifyTiny("Invitation code pasted.")
}

function buildDMMessage(messageItem, uID, messageID, targetDirectoryInput) {
  return new Promise(async (resolve, reject) => {
    let targetDirectory = targetDirectoryInput;
    if (!targetDirectoryInput) {
      targetDirectory = 'DMMessages'
    }
  
    const messageContent = messageify(messageItem.content);

    const prevMessageDate = new Date(parseInt($(`#${targetDirectory}${uID}`).children().last().attr('tS')));
    const newMessageDate = new Date(messageItem.timestamp);
    let bonusContent = {attachments: messageItem.attachments || '', classes: '', edited: messageItem.edited || false, containerClasses: '', links: '', YouTube: '', insertHTML: ''};
    let dividerCode = '';
    let dividerCode2 = '';
    let availableToAdd = true;
    let availableToAddedTo = true;

    // Type of message.
    if (messageContent) {
      bonusContent.classes = '';
      bonusContent.containerClasses = '';
      bonusContent.insertHTML = '';

    }
    else {
      bonusContent.classes = ''
      bonusContent.containerClasses = 'messageBoxNoTextContainer';
      if (messageItem.uid == user.uid) {
        bonusContent.insertHTML = `<button onclick="deleteDMLoneImage('${uID}', '${messageID}')" id="deleteButton${messageID}" class="btn roundedButton"><i class="bx bx-trash"></i></button>`;
      }
      availableToAddedTo = false;
    }

    if (bonusContent.attachments) {
      bonusContent.containerClasses = bonusContent.containerClasses + ' messageBoxContainsImages';
      bonusContent.attachments = `<div class="messageBoxImages">${bonusContent.insertHTML}`;
      for (let i = 0; i < messageItem.attachments.length; i++) {
        let attachmentItem = '';
        if (messageItem.attachments[i].toLowerCase().endsWith(`.png?alt=media`) || messageItem.attachments[i].toLowerCase().endsWith(`.jpg?alt=media`) || messageItem.attachments[i].toLowerCase().endsWith(`.gif?alt=media`) || messageItem.attachments[i].toLowerCase().endsWith(`.jpeg?alt=media`)) {
          attachmentItem = `<img onclick="fullscreenImage('${messageID}Attachment${i}')" id="${messageID}Attachment${i}"  class="bonusContentAttachmentImage"> </img>`;
        }
        else if (messageItem.attachments[i].toLowerCase().endsWith(`.mp4?alt=media`) || messageItem.attachments[i].toLowerCase().endsWith(`.mov?alt=media`) || messageItem.attachments[i].toLowerCase().endsWith(`.webm?alt=media`)) {
          attachmentItem = `<video id="${messageID}Attachment${i}"> </video>`;
        }
        else if (messageItem.attachments[i].toLowerCase().endsWith(`.mp3?alt=media`) || messageItem.attachments[i].toLowerCase().endsWith(`.wav?alt=media`) || messageItem.attachments[i].toLowerCase().endsWith(`.ogg?alt=media`) || messageItem.attachments[i].toLowerCase().endsWith(`.aac?alt=media`) || messageItem.attachments[i].toLowerCase().endsWith(`.m4a?alt=media`)) {
          attachmentItem = `<audio controls id="${messageID}Attachment${i}"> </audio>`;
        }
        else if (messageItem.attachments[i].toLowerCase().endsWith(`.gif`)) {
          attachmentItem = `<img onclick="fullscreenImage('${messageID}Attachment${i}', true)" id="${messageID}Attachment${i}"  class="bonusContentAttachmentImage"> </img>`;
        }
        else {
          const matches = /\.([0-9a-z]+)(?:[\?#]|$)/i.exec(messageItem.attachments[i]);
          const boxIcon = fileTypeMatches(matches);
          attachmentItem = `<div id="${messageID}NoAttachment${i}" class="bonusContentAttachmentImage bonusContentNoImage"><div><b>${matches[1].toLowerCase().capitalize()} File</b><i class="bx ${boxIcon}"></i></div></div>`;
        }

        bonusContent.attachments = bonusContent.attachments + attachmentItem;
      }
      bonusContent.attachments = bonusContent.attachments + '</div>';
      availableToAdd = false;
      availableToAddedTo = false;
    }

    if (messageItem.links && messageItem.links.length) {
      bonusContent.containerClasses = bonusContent.containerClasses + ` messageBoxContainsLinks linksCount${messageItem.links.length}`
      bonusContent.links = `<div class="messageBoxLinks">`;
      for (let i = 0; i < messageItem.links.length; i++) {
        const link = messageItem.links[i];
        if (link.title) {
          bonusContent.links = bonusContent.links + `
            <div class="linkPreviewBox">
              <b><a target="_blank" href="${link.url}">${link.title}</a></b>
              <p>${link.description || ""}</p>
              <img id="${messageID}LinkNum${i}" class="invisible animated fadeIn"/>
            </div>
          `
        }
      }
      bonusContent.links = bonusContent.links + `</div>`;
      availableToAdd = false;
      availableToAddedTo = false;
    }

    const reg = new RegExp(/https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*?[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig)

    const matches = messageContent.match(reg);

    if (matches && matches.length) {
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        let id = match.split(`?v=`)[1];
        if (!id) {
          id = match.split('.be/')[1];
        }
        
        bonusContent.containerClasses = bonusContent.containerClasses + ` messageBoxContainsYouTube`
        bonusContent.YouTube = `<div class="messageBoxYouTube">`;
  
        bonusContent.YouTube = bonusContent.YouTube + `
          <div class="YouTubeEmbed">
            <div class="plyr__video-embed">
              <iframe src="https://www.youtube.com/embed/${id}" allowfullscreen allowtransparency></iframe>
            </div>
          </div>
        `
      }
  
      bonusContent.YouTube = bonusContent.YouTube + `</div>`;
      availableToAdd = false;
      availableToAddedTo = false;
    }

    if (prevMessageDate.getFullYear() !== newMessageDate.getFullYear() || prevMessageDate.getMonth() !== newMessageDate.getMonth() || prevMessageDate.getDate() !== newMessageDate.getDate()) {
      dividerCode = `<span class="chatMessageDivider">${newMessageDate.toLocaleDateString("en-US", {weekday: 'long', month: 'long', day: 'numeric', year: '2-digit'})}</span>`;
      dividerCode2 = 'containsDivider';
      availableToAdd = false;
    }
  
    // Create the same message either way.
    const a = document.createElement('div');
    a.setAttribute('sentBy', messageItem.uid);
    a.setAttribute('tS', messageItem.timestamp);
    a.setAttribute('availableToBeAddedTo', availableToAddedTo || '');
    a.setAttribute('class', `chatMessage ${messageItem.uid === user.uid ? 'selfChatMessage' : 'otherChatMessage'} ${dividerCode2} ${bonusContent.containerClasses}`)
    a.id = `DMMessageOfID${messageID}`;

    let containerStart = ``;
    let containerEnd = ``;

    let innerMessageContent = `
      <div class="relative" id="messageContentContainerOfID${messageID}">
        <div id="DMMessageOfID${messageID}" messageID="${messageID}" class="messageContentContentContainer ${bonusContent.classes}">
          <div class="messageContentItemForContext loneEmoji${messageContent.length}match${/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi.test(messageContent)} acceptLeftClick ${bonusContent.edited ? 'editedMessage' : ''} " messageID="${messageID}" messageSenderName="${messageItem.author}" messageSender="${messageItem.uid}" messageType="DM" channelID="${uID}" id="DMMessageContentOfID${messageID}">${messageContent}</div>
        </div>
        <div id="DMEditedMessageOfID${messageID}" class="editedMessageIcon ${bonusContent.edited ? '' : 'hidden'} animated zoomIn">
          <i id="DMEditedMessageIconOfID${messageID}" class="bx bx-pencil"></i>
        </div>
      </div>
    `
    if (messageItem.uid == user.uid) {
      containerStart = `${dividerCode}<div class="topLevelMessageContentTwo">`;
      containerEnd = `</div>`
    }
    else {
      containerStart = `${dividerCode}<div class="topLevelMessageContentTwo"><img id="profilePhotoOfMessageID${messageID}" onclick="openUserCard('${messageItem.uid}')" userid="${messageItem.uid}" username="${messageItem.author}" class="otherChatMessageImageProfile userContextItem hidden" src="" />`
      containerEnd = `</div>`
    }
    
    a.innerHTML = `${containerStart}<div class="topLevelContainerMessage"><span class="chatMessageNameplate">${messageItem.author.capitalize()}</span><span id="chatMessageTimestamp${messageID}" class="chatMessageTimestamp">${tConvert(new Date(messageItem.timestamp).toTimeString().split(' ')[0])}</span></div>${innerMessageContent}${containerEnd}${bonusContent.attachments}${bonusContent.links}${bonusContent.YouTube}`;

    if ($(`#${targetDirectory}${uID}`).children().last().attr('sentBy') === messageItem.uid && $(`#${targetDirectory}${uID}`).children().last().attr('availableToBeAddedTo') && availableToAdd) {
      $(`#${targetDirectory}${uID}`).children().last().children().last().append(innerMessageContent);
    }
    else {
      $(`#${targetDirectory}${uID}`).get(0).appendChild(a);
      window.setTimeout(async () => {
        if ($(`#profilePhotoOfMessageID${messageID}`).length) {
          $(`#profilePhotoOfMessageID${messageID}`).get(0).src = await returnProperURL(messageItem.uid);
          displayImageAnimation(`profilePhotoOfMessageID${messageID}`);
        }
  
        if (messageItem.attachments) {
          for (let i = 0; i < messageItem.attachments.length; i++) {
            if ($(`#${messageID}NoAttachment${i}`).length) {
              $(`#${messageID}NoAttachment${i}`).get(0).setAttribute(`onclick`, `window.open('${messageItem.attachments[i]}')`);
            }
            else {
              const src = await returnProperAttachmentURL(messageItem.attachments[i]);
              $(`#${messageID}Attachment${i}`).get(0).setAttribute(`src`, src);
              $(`#${messageID}Attachment${i}`).get(0).setAttribute(`fullSrc`, messageItem.attachments[i].replaceAll(`attachmentsPreview`, `attachments`).replaceAll(`-resized`, ''));
              if (src.includes(`https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/app%2FmissingFile.png?alt=media`)) {
                $(`#${messageID}Attachment${i}`).get(0).setAttribute(`poster`, src);
              }
              else {
                console.log('plyring')
                friendPlayers[messageID] = new Plyr(`#${messageID}Attachment${i}`, {
                  controls: ['play', 'progress', 'current-time', 'mute', 'fullscreen'],
                });
                friendPlayers[messageID].volume = defaultVolume;
              }
            }
          }
        }

        window.setTimeout(async () => {
          if (messageItem.links) {
            for (let i = 0; i < messageItem.links.length; i++) {
              const link = messageItem.links[i];
              if ($(`#${messageID}LinkNum${i}`).length) {
                returnProperLinkThumbnail(link, i, messageID);
              }
            }
          }
        }, 49);
  
      }, 49);
    }
  
    if ($(`#deleteButton${messageID}`).length) {
      tippy(`#deleteButton${messageID}`, {
        content: 'Delete Message',
        placement: 'top',
      });
    }

    tippy(`#DMEditedMessageIconOfID${messageID}`, {
      content: `Edited ${messageItem.edited ? timeago.format(new Date(messageItem.editedDate)) : 'not'}`,
      placement: 'top',
    });

    if (messageItem.edited) {
      $(`#DMEditedMessageOfID${messageID}`).removeClass('hidden');
    }

    if (targetDirectory == 'DMMessages') { scrollBottomMessagesDM(uID) };
    resolve(true)
  });
}

window.deleteDMLoneImage = (uID, messageID) => {
  deleteDMMessage(uID, messageID);
}

export async function unreadIndicatorsDM() {
  return new Promise(async (resolve, reject) => {
    onSnapshot(doc(db, `DMUnread/${user.uid}`), (doc) => {

      if (retrieveSetting('hideReadReciepts', false) !== doc.data().hideRead) {
        if (doc.data().hideRead) {
          $(`#hideReadRecieptsCheck`).get(0).checked = true;
        }
        else {
          $(`#hideReadRecieptsCheck`).get(0).checked = false;
        }
      }

      const change = diff(DMunreadIndicatorsData, doc.data());
      DMunreadIndicatorsData = doc.data();
      if (!DMListenerCreated) { }
      else {
        for (let [key, value] of Object.entries(change)) {
          if (value === null) {
            return;
          }
          else {
            try {
              if (DMServerData[key]) {
                // There are no messages. Ignore
                if (new Date(DMServerData[key].latest) > new Date(value)) {
                  addDMIndicator(key);
                }
                else { removeDMIndicator(key); };
              }
            } catch (error) { addDMIndicator(key); }
          }
        }
      }
    });
    resolve(true);
  })
}

async function createDMListener() {
  onValue(query(ref(rtdb, `directUnread/${user.uid}`)), (snapshot) => {
    if (!snapshot.val()) {
      sortFriendsList(); // Show no friends.
      return;
    }

    // Find the most latest message on the snapshot and display it as a notification!
    let latest = new Date(0);
    let latestKey = null;
    let latestVal = null;

    for (let [key, value] of Object.entries(snapshot.val())) {
      if (new Date(value.latest) > latest) {
        latest = new Date(value.latest);
        latestVal = value;
        latestKey = key;
      }
    }

    if (latest.getTime() > onLoadTime && latestVal.username !== cacheUser.username) {
      if (currentChannel == latestKey && !document.hasFocus()) {
        displaySystemNotification(latestVal.username, securityConfirmText(latestVal.latestContent), () => {
          if (currentChannel !== latestKey) {
            switchAndOpenFriendsDM(latestKey, latestVal.username);
          }
        }, latestKey, latestVal.username);
      }
      else if (currentChannel !== latestKey) {
        displaySystemNotification(latestVal.username, securityConfirmText(latestVal.latestContent), () => {
          if (currentChannel !== latestKey) {
            switchAndOpenFriendsDM(latestKey, latestVal.username);
          }
        }, latestKey, latestVal.username);
      }
    }


    for (const [key, value] of Object.entries(snapshot.val())) {
      DMServerData[key] = value;

      $(`#${key}prevMSGDate`).html(timeago.format(new Date(value.latest)));

      if (value.latestContent) {
        let textToPost = securityConfirmText(value.latestContent)
        if (textToPost.includes('inv:')) {
          textToPost = '(Group Invitation)'
        }
        if (textToPost.includes('track:')) {
          textToPost = '(Track)'
        }
        $(`#${key}MSGPreview`).html(messageify(textToPost));
        if ($(`#${key}MSGPreview`).length) {
          twemoji.parse($(`#${key}MSGPreview`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });
        }
      }

      $(`#${key}FriendItem`).attr('lastMessage', value.latest);
      
      // Compare
      const serverTime = new Date(value.latest);
      let localTime = new Date(0);
      if (DMunreadIndicatorsData[key]) {
        try { localTime = DMunreadIndicatorsData[`${key}`].toDate() } catch (error) { localTime = new Date(0); }
      }

      if (isNaN(localTime.getTime())) { 
        localTime = new Date(0);
      }

      if (serverTime > localTime) {
        addDMIndicator(key);
      }
      else {
        removeDMIndicator(key);
      }
    }

    sortFriendsList();
    checkTotalUnread();
  })
}

export async function markDMRead(userID) {
  let query = false;
  
  if (DMunreadIndicatorsData[userID] === null) { return; }

  try {
    query = new Date(DMServerData[userID].latest) > DMunreadIndicatorsData[userID].toDate();
  } catch (error) {
    query = true;
  }

  if (query) {
    await updateDoc(doc(db, `DMUnread/${user.uid}`), {
      [`${userID}`]: dbts()
    });

    DMunreadIndicators[userID] = false;

    console.log('Marked DM as read.');
  }
}

export async function markDMUnread(userID) {
  if (activeDM === userID) {
    activeDM = ''; currentChannel = ''; $('.friendViewContentView').addClass('hidden'); $('.friendsListItemActive').removeClass('friendsListItemActive');
  }

  await updateDoc(doc(db, `DMUnread/${user.uid}`), {
    [`${userID}`]: 0
  });
}

async function addDMIndicator(uID) {
  if (document.hasFocus()) {
    if (currentServer === 'friends' && currentChannel === uID) {
      // All boxes checked for electron
      markDMRead(uID);
      return;
    }
  }
  else {
    if (currentServer === 'friends' && currentChannel === uID) {
      // Can't detect window focus outside of desktop app. All other boxes checked though.
      markAsReadAfterFocus.type = 'dm';
      markAsReadAfterFocus.id = uID;
    }
  }

  DMunreadIndicators[uID] = true;
  $(`#${uID}FriendItem`).addClass("unReadItem");

  checkTotalUnread();
}

async function removeDMIndicator(uID) {
  DMunreadIndicators[uID] = false;
  $(`#${uID}FriendItem`).removeClass("unReadItem");
  checkTotalUnread();
}

async function checkTotalUnread() {
  let DMsRead = true;
  for (let i = 0; i < cacheUser.friends.length; i++) {
    if (DMunreadIndicators[`${cacheUser.friends[i].u}`]) {
      DMsRead = false;
      break;
    }
  }

  if (DMsRead) {
    // No unread indicator
    $('#FRIENDSserverNotification').removeClass('zoomIn');
    $('#FRIENDSserverNotification').addClass('zoomOut');
  }

  else {
    // Unread indicator
    $('#FRIENDSserverNotification').removeClass('hidden');
    $('#FRIENDSserverNotification').removeClass('zoomOut');
    $('#FRIENDSserverNotification').addClass('zoomIn');
  }

  window.setTimeout(() => {
    sendToElectron('notificationBadges', $('.serverNotification:not(.hidden,.zoomOut,.invisible,.invisibleOpacity)').length);
  }, 199);
}

export function prepareRemoveFriend(uID, notify) {
  openModal('deleteFriend');
  $(`#friendConfirmDelete`).get(0).onclick = () => {
    removeFriend(uID, notify);
  }
};

window.removeFriend = (uID, notify) => {
  return new Promise(async (resolve, reject) => {
    closeModal();
    $(`#${uID}FriendItem`).addClass('friendGone');

    if (notify) {
      notifyTiny('Removing friend...', true);
    }
  
    const removeFriend = httpsCallable(functions, "removeFriend");
    const result = await removeFriend({target: uID});
  
    if (result.data.data === false) {
      snac('Friend Remove Error', 'Contact support or try again.', 'danger');
      resolve(false);
      return;
    }
  
    if (notify) {
      snac(`Friend Removed`, 'This user was removed from your friends list successfully.', 'success');
    }

    resolve(true);
  });
}

export function toggleFriendsSort() {
  if (activeFriendsSort === 'date') {
    $('#friendSortButton').html('<i class="bx bx-sort"></i><i class="bx bx-sort-a-z"></i>');
    activeFriendsSort = 'alphabetically';
  }

  else if (activeFriendsSort === 'alphabetically'){
    $('#friendSortButton').html('<i class="bx bx-sort"></i><i class="bx bx-time"></i>');
    activeFriendsSort = 'date';
  }

  sortFriendsList();
}

function sortFriendsList() {
  const container = $('#friendsListfriendsContent');
  container.removeClass('hidden');

  if (activeFriendsSort === 'date') {
    container.find('.activeFriendCard').sort(function(a, b) {
      return +b.getAttribute('lastMessage') - +a.getAttribute('lastMessage');
    }).appendTo(container);

    return;
  }

  if (activeFriendsSort === 'alphabetically') {
    container.find('.activeFriendCard').sort((a, b) => {
      if(a.getAttribute('username') < b.getAttribute('username')) { return -1; }
      if(a.getAttribute('username') > b.getAttribute('username')) { return 1; }
    }).appendTo(container);

    return;
  }
}

export async function deleteDMMessage(userID, messageID) {
  await remove(ref(rtdb, `direct/${dmKEYify(userID, user.uid)}/messages/${messageID}`));
  await update(ref(rtdb, `directUnread/${userID}/${user.uid}`), {
    latestContent: `${cacheUser.username} deleted a message.`,
    username: `${cacheUser.username}`,
  });
  await update(ref(rtdb, `directUnread/${user.uid}/${userID}`), {
    latestContent: `You deleted a message.`,
    username: `${cacheUser.username}`,
  });
  console.log('Message deleted. ')
}

window.startCallDM = (uID) => {
  if (!$(`#${uID}MostlyVoiceViewContent`).hasClass('hidden')) {
    // Already shown.
    endCallDM(uID)
    return;
  }

  $(`#${uID}MostlyChatView`).css('height', 'calc(100% - 252px)');  
  $(`#${uID}MostlyVoiceView`).removeClass('hidden');
  $(`#${uID}MostlyVoiceView`).css('height', '230px');

  window.setTimeout(() => {
    $(`#${uID}MostlyVoiceViewContent`).removeClass('fadeOut');
    $(`#${uID}MostlyVoiceViewContent`).addClass('fadeIn');
    $(`#${uID}MostlyVoiceViewContent`).removeClass('hidden');
  }, 300);
}

export async function endCallDM(uID) {
  $(`#${uID}MostlyVoiceViewContent`).removeClass('fadeIn');
  $(`#${uID}MostlyVoiceViewContent`).addClass('fadeOut');

  window.setTimeout(() => {
    $(`#${uID}MostlyChatView`).css('height', '100%');
    $(`#${uID}MostlyVoiceViewContent`).addClass('hidden');
    $(`#${uID}MostlyVoiceView`).css('height', '0%');
    window.setTimeout(() => {
      $(`#${uID}MostlyVoiceView`).removeClass('hidden');
    }, 400);
  }, 200);
}

function showDMAttachmentManager(uID) {
  $(`#${uID}DMAttachmentManagerContent`).removeClass('hidden');
  $(`#${uID}DMAttachmentManagerContent`).removeClass('fadeOut');
  $(`#${uID}DMAttachmentManagerContent`).addClass('fadeIn');
  $(`#${uID}DMAttachmentManager`).removeClass('hidden');

  window.setTimeout(() => {
    $(`#${uID}DMAttachmentManager`).addClass('DMManagerShown');
  }, 49);

  $(`#DMMessages${uID}`).css('height', 'calc(100% - 200px - 130px)');
  $(`#${uID}chatMessageLabel`).html('Add a caption:');
}

function hideDMAttachmentManager(uID) {
  $(`#${uID}DMAttachmentManager`).removeClass('DMManagerShown');
  $(`#${uID}DMAttachmentManagerContent`).removeClass('fadeIn');
  $(`#${uID}DMAttachmentManagerContent`).addClass('fadeOut');

  $(`#DMMessages${uID}`).css('height', '');
  $(`#${uID}chatMessageLabel`).html('Send a message:');

  window.setTimeout(() => {
    $(`#${uID}DMAttachmentManager`).addClass('hidden');
    $(`#${uID}DMAttachmentManagerContent`).addClass('hidden');
  }, 1000);
}

window.addDMAttachment = (uID) => {
  $("#standardImageInput").off();
  $("#standardImageInput").val('');
  
  $("#standardImageInput").change(async () => {
    processDMAttachments(uID);
  });

  $('#standardImageInput').get(0).click();
}

export async function processDMAttachments(uID, files) {
  let filesList = files;
  if (!$(`#${uID}DMAttachmentManagerContent`).length) {
    return;
  }

  if (!files) {
    filesList = document.getElementById("standardImageInput").files;
  }
  
  // Redone processor.  
  for (let i = 0; i < filesList.length; i++) {
    if (checkValidSubscription(cacheUser.subscription)) {
      if (filesList[i].size > (32 * 1000000)) {
        snac(`File Size Limit`, `Your file, ${filesList[i].name}, is too large. There is a 32MB limit per file.`, 'danger');
        continue;
      }
    }
    else {
      if (filesList[i].size > (10 * 1000000)) {
        snac(`File Size Limit`, `Your file, ${filesList[i].name}, is too large. There is a 10MB limit per file. Upgrade to Parallel Infinite to increase this limit to 32MB.`, 'danger');
        continue;
      }
    }

    if (!filesList[i].type) {
      snac(`File Type Error`, `Your file is invalid.`, 'danger');
      continue;
    }
    
    if (DMPendingAttachments[uID] && DMPendingAttachments[uID].length > 8) {
      snac(`File Limit`, `Your file, ${filesList[i].name}, could not be uploaded. You can only add 8 files to each message.`, 'danger');
      return;
    }

    if (blockUploads) {
      if (checkValidSubscription(cacheUser.subscription)) {
        snac('Storage Limit', `You may only upload 9GB of files. Manage your uploads in "Settings > General > Storage".`)
      }
      else {
        snac('Storage Limit', `You may only upload 3GB of files. Manage your uploads in "Settings > General > Storage". Upgrade to Parallel Infinite to increase this limit to 9GB.`)
      }
      return;
    }

    showDMAttachmentManager(uID);

    $(`#${uID}ChatMessageInput`).get(0).focus();
  
    if (DMPendingAttachments[uID] == undefined) {
      DMPendingAttachments[uID] = [];
    }  
    DMPendingAttachments[uID].push(filesList[i]);
  
    updateCaptionPreview(uID);
  }
}

function uploadDMAttachmentFile(uID, timeOrID, file) {
  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef(storage, `attachments/${dmKEYify(user.uid, uID)}/${user.uid}/${timeOrID}.${file.name.split(".").pop()}`), file);

    uploadTask.on('state_changed', (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      $('#uploadProgressNumber').html(`Upload Progress: ${progress.toFixed(0)}%`);
    })

    if (['jpg', 'jpeg', 'png'].includes(file.name.split('.').pop().toLowerCase())) {
      uploadTask.then(() => { // Resolve with the resized path.
        resolve(`https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/attachmentsPreview%2F${dmKEYify(user.uid, uID)}%2F${user.uid}%2F${timeOrID}-resized.${file.name.split(".").pop()}?alt=media`);
      })
    }
    else {
      uploadTask.then(() => {
        resolve(`https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/attachments%2F${dmKEYify(user.uid, uID)}%2F${user.uid}%2F${timeOrID}.${file.name.split(".").pop()}?alt=media`);
      })
    }
  })
}

function updateCaptionPreview(uID) {
  $(`.PLYRON${uID}`).each((index, element) => {
    pendingPlayers[uID + index].destroy();
  });

  $(`#${uID}DMAttachmentManagerContent`).empty()

  for (let i = 0; i < DMPendingAttachments[uID].length; i++) {
    const file = DMPendingAttachments[uID][i];
    const url = URL.createObjectURL(file);
    const a = document.createElement('div');
    a.setAttribute('class', 'DMPendingAttachmentImage');

    let attachmentItem = '';
    if (file.name.toLowerCase().endsWith(`.png`)  || file.name.toLowerCase().endsWith(`.jpg`) || file.name.toLowerCase().endsWith(`.gif`) || file.name.toLowerCase().endsWith(`.jpeg`)) {
      attachmentItem = `<img src="${url}" class="PendingAttachmentFile"> </img>`;
    }
    else if (file.name.toLowerCase().endsWith(`.mp4`) || file.name.toLowerCase().endsWith(`.webm`) || file.name.toLowerCase().endsWith(`.mov`)) {
      attachmentItem = `<video src="${url}" class="PendingAttachmentFile PendingAttachmentVideo${uID}"> </video>`;
    }
    else {
      attachmentItem = `<div onclick="window.open('${url}')" class="PendingAttachmentFile NoMediaAttachment"><i class="bx bx-file"></i></div>`;
    }

    a.innerHTML = `${attachmentItem}<button onclick="removeAttachmentFromList('${uID}', '${i}')" class="btn attachmentRemoveButton"><i class='bx bx-x'></i></button>`;
    $(`#${uID}DMAttachmentManagerContent`).get(0).appendChild(a);

  }

  $(`.PendingAttachmentVideo${uID}`).each((index, element) => {
    if (!$(element).hasClass(`PLYRON${uID}`)) {
      $(element).addClass(`PLYRON${uID}`);
      pendingPlayers[uID + index] = new Plyr(element, {
        controls: ['play', 'progress',  'mute', 'fullscreen'],
      });
      pendingPlayers[uID + index].volume = defaultVolume;
    } 
  });

  if (DMPendingAttachments[uID].length === 0) {
    hideDMAttachmentManager(uID);
  }
}

window.removeAttachmentFromList = (uID, index) => {
  DMPendingAttachments[uID].splice(parseInt(index), 1);
  updateCaptionPreview(uID);
}

$('#searchFriends').on('input', () => {
  const textValue = $('#searchFriends').val();
  if (textValue !== '' && textValue && textValue !== ' '  ) {
    $('#friendsListfriendsContent').children('.friendCardList ').each((index, obj) => {
      if ($(obj).get(0).getAttribute('username').toLowerCase().includes(textValue.toLowerCase())) {
        $(obj).removeClass('hidden');
      }
      else {
        $(obj).addClass('hidden');
      }
    });

    makeSearchActive();
  }
  else {
    $('#friendsListfriendsContent').children('.friendCardList ').each((index, obj) => {
      $(obj).removeClass('hidden');
    });

    makeSearchInactive();
  }
})

function makeSearchActive() {
  $('#friendsListfriendsContent').addClass('friendsListfriendsContentActive');
  $('#friendsSearchItem').removeClass('hidden');

  $('#friendsSearchItem').removeClass('fadeOutDown');
  $('#friendsSearchItem').addClass('fadeInUp');

  try { window.clearTimeout(searchHiddenTimeout) } catch (error) { }
  searchHiddenTimeout = window.setTimeout(() => {
    $('#friendsSearchItem').removeClass('hidden');
  }, 450)
}

function makeSearchInactive() {
  $('#friendsListfriendsContent').removeClass('friendsListfriendsContentActive');

  $('#friendsSearchItem').removeClass('fadeInUp');
  $('#friendsSearchItem').addClass('fadeOutDown');

  try { window.clearTimeout(searchHiddenTimeout) } catch (error) { }
  searchHiddenTimeout = window.setTimeout(() => {
    $('#friendsSearchItem').addClass('hidden');
  }, 450)
}

export function cancelFriendsSearch() {
  $('#searchFriends').val('');
  $('#searchFriendsLabel').removeClass('active');

  makeSearchInactive();

  $('#friendsListfriendsContent').children('.friendCardList ').each((index, obj) => {
    $(obj).removeClass('hidden')
  });
}

export function prepareDMEditMessage(UID, messageID) {
  // Delete old element, create new one. Do this to remove listenrs
  $(`#DMMessageContentOfID${messageID}`).get(0).parentNode.replaceChild($(`#DMMessageContentOfID${messageID}`).get(0).cloneNode(true), $(`#DMMessageContentOfID${messageID}`).get(0));
  DMCachedEditMessages[messageID] = messageHTMLtoText(null, $(`#DMMessageContentOfID${messageID}`).get(0));
  $(`#DMMessageContentOfID${messageID}`).html(messageHTMLtoText(null, $(`#DMMessageContentOfID${messageID}`).get(0)));
  $(`#DMMessageContentOfID${messageID}`).attr('contenteditable', 'true');
  $(`#DMMessageContentOfID${messageID}`).addClass('contentEditableMessage');
  $(`#DMMessageContentOfID${messageID}`).removeClass('acceptLeftClick');
  $(`#DMMessageContentOfID${messageID}`).get(0).focus();
  window.setTimeout(() => {
    const contentEditableElement = $(`#DMMessageContentOfID${messageID}`).get(0);
    const range = document.createRange();
    range.selectNodeContents(contentEditableElement);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }, 9);

  // Set listeners
  $(`#DMMessageContentOfID${messageID}`).get(0).addEventListener("keyup", async (event) => {
    if (event.code == "Enter") {
      event.preventDefault();
      const content = $(`#DMMessageContentOfID${messageID}`).get(0).innerHTML;

      if (DMCachedEditMessages[messageID] == content) {
        unEditDMMessage(messageID, UID);
        return;
      }
      // Make firebase request
      await update(ref(rtdb, `direct/${dmKEYify(user.uid, UID)}/messages/${messageID}`), {
        content: content,
        editedDate: rtdbts(),
        edited: true
      });
      await update(ref(rtdb, `directUnread/${UID}/${user.uid}`), {
        latestContent: `${cacheUser.username} edited a message.`,
        username: `${cacheUser.username}`,
      });
      await update(ref(rtdb, `directUnread/${user.uid}/${UID}`), {
        latestContent: `You edited a message.`,
        username: `${cacheUser.username}`,
      });
      DMCachedEditMessages[messageID] = content;
      unEditDMMessage(messageID, UID);
      console.log('Edited message.');
    }
    else if (event.code == 'Escape') {
      unEditDMMessage(messageID, UID);
    }
  });
}

function unEditDMMessage(messageID, uID) {
  $(`#DMMessageContentOfID${messageID}`).get(0).blur();
  $(`#DMMessageContentOfID${messageID}`).attr('contenteditable', 'false');
  $(`#DMMessageContentOfID${messageID}`).removeClass('contentEditableMessage');
  $(`#DMMessageContentOfID${messageID}`).addClass('acceptLeftClick');
  $(`#DMMessageContentOfID${messageID}`).html(DMCachedEditMessages[messageID]);
  twemoji.parse($(`#DMMessageContentOfID${messageID}`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });
  $(`#${uID}ChatMessageInput`).get(0).focus();
}