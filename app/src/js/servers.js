import { getFirestore, getDoc, doc, onSnapshot, updateDoc, addDoc, collection, arrayUnion, arrayRemove, serverTimestamp as dbts, deleteField} from '@firebase/firestore';
import { getDatabase, update, remove, off, query, ref, onValue } from '@firebase/database';
import { getStorage, ref as storageRef, uploadBytesResumable } from '@firebase/storage';
import { getFunctions, httpsCallable } from '@firebase/functions';

import * as timeago from 'timeago.js';

import { clearMusicViews, loadMusic } from './music';
import { commonArrayDifference, displayInputEffect, securityConfirmText, showPlaybackButton, windowSelected, hidePlaybackButton, disableButton, enableButton, timer, showUploadProgress, hideUploadProgress, openModal, closeModal, displayImageAnimation, switchViewsToList } from './app';
import { endAllCalls, manageVoiceChatDisplay } from './voice';
import { addChannelListeners, closeCurrentChannel, markChannelAsRead, markChannelAsUnread, openGuildChannel, reevaluatePermissionsChannel, updateLoungeTypes } from './channels';
import { showTippyListenerPresence, updatePresenceForUser } from './presence';
import { addDMListeners, markDMRead } from './friends';
import { getCroppedPhoto } from './app';
import { exitEditorModePlaylist } from './library';
import { checkAppInitialized } from './firebaseChecks';
import { sendToElectron } from './electron';

window.serverData = {};
window.firstLog = {};
window.runOnOpen = {};
window.activeMusicTab = '';
window.unreadIndicatorsData = {};
window.addPendingIndicator = {};
window.indicatorTimeouts = {};
window.outgoingGuilds = [];
window.cacheServerList = [];
window.mutedServers = [];
window.voiceChatRef = '';
window.loungeReorderSetup = {};
window.sortableLibrary = {};
window.animatedFolderGuildOut = [];

window.endBroadListener = undefined;
window.unreadSnapshot = undefined;
window.guildTimeouts = {};

window.currentServerUser = ''
window.currentServer = ''

window.currentChannel = ''

checkAppInitialized();
const db = getFirestore();
const rtdb = getDatabase();
const functions = getFunctions();
const storage = getStorage();

export async function loadMuted() {
  mutedServers = [];
  if (cacheUser.mutedServers) {
    mutedServers = cacheUser.mutedServers;
  }

  $('.mutedNotification').removeClass('mutedNotification');
  $('.mutedChannelNotification').removeClass('mutedChannelNotification');
  $('.mutedStatus').html('<i class="bx bx-bell"></i>');

  for (let i = 0; i < mutedServers.length; i++) {
    $(`#${mutedServers[i]}mutedStatus`).html('<i class="bx bx-bell"></i>');
    $(`#${mutedServers[i]}serverNotification`).addClass('mutedNotification');
    $(`#${mutedServers[i]}guildChannelElement`).addClass('mutedChannelNotification');
  }
}

export async function updateServersOrder() {
  const serverList = [];
  $('.guildFolderContent').children('.server').each((index, object) => {
    serverList.push(`${object.getAttribute('guildUID')}.${object.getAttribute('guildID')}`);
  });

  $(`#serverListNonFolders`).children('.server').each((index, object) => {
    serverList.push(`${object.getAttribute('guildUID')}.${object.getAttribute('guildID')}`);
  });

  await updateDoc(doc(db, `users/${user.uid}`), {
    guilds: serverList
  });
}

Sortable.create($('#serverListFolders').get(0), {
  ghostClass: 'sortableSidebarItemGhost',
  onEnd: async () => { // Overwrite playlists.
    let newFoldersSort = [];

    $('#serverListFolders').children('.guildFolderContainer').each((index, object) => {
      const id = $(object).get(0).getAttribute('folderID');
      newFoldersSort.push(id);
    })

    await updateDoc(doc(db, `users/${user.uid}`), {
      guildFoldersSort: newFoldersSort
    });
  }
})

export async function loadServers() {
  const serverListForward = commonArrayDifference(cacheUser.guilds, cacheServerList)
  const serverListBackward = commonArrayDifference(cacheServerList, cacheUser.guilds)
  cacheServerList = cacheUser.guilds;
  
  for (let i = 0; i < serverListForward.length; i++) {
    const guildUID = serverListForward[i].split('.')[0];
    const guildID = serverListForward[i].split('.')[1];
    const guildMeta = await getDoc(doc(db, `users/${guildUID}/servers/${guildID}`));
    
    buildGroup(guildUID, guildID, guildMeta);
  }
  
  for (let i = 0; i < serverListBackward.length; i++) {
    const guildUID = serverListBackward[i].split('.')[0];
    const guildID = serverListBackward[i].split('.')[1]; 
    
    $(`#${guildUID}${guildID}Server`).addClass('serverGone'); // left button.
    window.setTimeout(() => {
      $(`#${guildUID}${guildID}Server`).remove();
      $(`#${guildUID}${guildID}View`).remove();
    }, 1000);
    
    off(query(ref(rtdb, `servers/${guildUID}${guildID}`)));
    off(query(ref(rtdb, `voice/${guildUID}${guildID}`)));
    
    $(`#${guildUID}${guildID}View`).remove();
    
    if (currentServer == guildID) {
      currentServerUser = '';
      currentServer = '';
    }
      currentChannel = '';
    
    // VC
    if (currentCall && currentCall.includes(guildID)) {
      endAllCalls();
    }

    window.setTimeout(() => {
      sendToElectron('notificationBadges', $('.serverNotification:not(.hidden,.zoomOut,.invisible,.invisibleOpacity,.folderIndicator)').length);
    }, 199); // For deleted groups, the server is gone, but the notification BADGE is still there.
  }

  // Move all into one place.
  $(`.guildFolderContent`).children().each((index, element) => {
    $(element).appendTo(`#serverListNonFolders`);
    $(element).get(0).removeAttribute('inFolder');

    const animationKey = `${element.getAttribute('guildUID')}${element.getAttribute('guildID')}`;
    if (animatedFolderGuildOut.includes(animationKey)) { // LEAVING PLAYLIST FOLDER.
      animatedFolderTrackOut.splice(animatedFolderTrackOut.indexOf(animationKey), 1);
      // Animate in MAIN AREA. Since, its moving OUT a playlist folder.
      $(element).addClass('instantTransitions');
      $(element).addClass('serverGone');
      $(element).removeClass('instantTransitions');
      window.setTimeout(() => {
        $(element).removeClass('serverGone');
      }, 99);
    }
  });

  // Sort
  for (let i = 0; i < cacheUser.guilds.length; i++) {
    let guildUID = cacheUser.guilds[i].split('.')[0];
    let guildID = cacheUser.guilds[i].split('.')[1];
    $(`#${guildUID}${guildID}Server`).get(0).setAttribute('data-order', i);        
  }

  let sorted = $(`#serverListNonFolders`).children('.server').sort((a, b) => {
    return parseInt($(a).attr('data-order')) - parseInt($(b).attr('data-order'));
  });

  $(`#serverListNonFolders`).append(sorted);

  // Load folders
  if (!cacheUser.guildFolders) { $(`.server`).removeClass('hidden'); return }
  const folders = cacheUser.guildFolders;

  const keys = Object.keys(cacheUser.guildFolders);
  $(`.guildFolderContainer`).addClass('hidden');
  $(`#serverListFolders`).addClass('hidden');

  if (keys.length) {
    $(`#serverListFolders`).removeClass('hidden');
  }

  for (let i = 0; i < keys.length; i++) {
    const folderName = keys[i].split('<')[0];
    const folderID = keys[i].split('<')[1];
    const guilds = folders[`${folderName}<${folderID}`];

    // If element not already created.
    if (!$(`#${folderID}Container`).length) {
      const a = document.createElement('div');
      a.classList.add('guildFolderContainer');
      a.setAttribute('folderID', folderID);
      a.id = `${folderID}Container`;
      a.innerHTML = `
        <button id="${folderID}Button" folderID="${folderID}" folderName="${folderName}" class="guildFolder animated zoomIn"><i id="folder${folderID}" class="bx bx-folder"></i><span class="folderCount" id="folderCount${folderID}">0</span></button>
        <div id="${folderID}FolderIndicator" class="serverNotification animated folderIndicator hidden"></div>
        <div id="guildFolderContent${folderID}" class="guildFolderContent hidden" style=""></div>
      `;
      
      a.ondragover = (ev) => {
        ev.preventDefault();
      }
      a.ondrop = (ev) => {
        guildFoldersDrop(ev, folderID, folderName);
      }

      if (!$(`#${folderID}Container`).length) {
        $(`#serverListFolders`).get(0).appendChild(a);
        tippy($(`#${folderID}Button`).get(0), {
          content: folderName,
          placement: 'right',
        });
  
        window.setTimeout(() => {
          $(`#${folderID}Button`).removeClass('animated');
        }, 499);  
  
        $(`#${folderID}Button`).get(0).onclick = () => {
          expandGuildFolder(folderID);
        }
  
        // Setup a sortable.
        Sortable.create($(`#guildFolderContent${folderID}`).get(0), {
          ghostClass: 'sortableSidebarItemGhost',
          onEnd: async (e) => {
            updateServersOrder();
          }
        });
      }
    
    }
    else {
      if ($(`#${folderID}Button`).get(0).getAttribute('folderName') !== folderName) {
        // Folder was renamed.
        $(`#${folderID}Button`).get(0)._tippy.setContent(folderName);
        $(`#${folderID}Button`).get(0).setAttribute('folderName', folderName);
      }

      $(`#${folderID}Container`).removeClass('hidden');
    }

    // Add all the groups into the folder.
    for (let i = 0; i < guilds.length; i++) {
      const guildSplit = guilds[i].split('.');
      const guildUID = guildSplit[0];
      const guildID = guildSplit[1];

      // Move the button into the container.
      $(`#${guildUID}${guildID}Server`).appendTo(`#guildFolderContent${folderID}`);
      $(`#${guildUID}${guildID}Server`).get(0).setAttribute('inFolder', `${folderName}<${folderID}`)
      $(`#${guildUID}${guildID}Server`).get(0).ondragstart = (ev) => {
        ev.dataTransfer.setData("targetGuildUID", guildUID);
        ev.dataTransfer.setData("targetGuildID", guildID);
        ev.dataTransfer.setData("targetFolderKey", `${folderName}<${folderID}`);
      }
    }

    $(`#folderCount${folderID}`).html(guilds.length);

    // Check notifications for the folder
    checkFolderIndicator(null, null, folderID)
    console.log('checking')

    // Sort the  according to cacheUser.guilds
    for (let i = 0; i < cacheUser.guilds.length; i++) {
      const guildSplit = cacheUser.guilds[i].split('.');
      const guildUID = guildSplit[0];
      const guildID = guildSplit[1];

      if ($(`#${guildUID}${guildID}Server`).attr('inFolder') == `${folderName}<${folderID}`) {
        $(`#${guildUID}${guildID}Server`).get(0).setAttribute('data-order', i)
      }
    }

    let sorted = $(`#guildFolderContent${folderID}`).children('.server').sort((a, b) => {
      return parseInt($(a).attr('data-order')) - parseInt($(b).attr('data-order'));
    });
  
    $(`#guildFolderContent${folderID}`).append(sorted);
  }

  // Sort the folders
  if (cacheUser.guildFoldersSort) {
    for (let i = 0; i < cacheUser.guildFoldersSort.length; i++) {
      const folderID = cacheUser.guildFoldersSort[i];
      $(`#${folderID}Container`).attr('data-order', i);
    }
  
    let sorted = $(`#serverListFolders`).children('.guildFolderContainer').sort((a, b) => {
      return parseInt($(a).attr('data-order')) - parseInt($(b).attr('data-order'));
    });
  
    $(`#serverListFolders`).append(sorted);
  }

  // Show all groups.
  $(`.server`).removeClass('hidden');

}

async function guildFoldersDrop(ev, folderID, folderName) {
  const guildUID = ev.dataTransfer.getData("targetGuildUID");
  const guildID = ev.dataTransfer.getData("targetGuildID");
  const folderKey = ev.dataTransfer.getData("targetFolderKey");

  if (!guildUID || !guildID) { return }

  if (folderKey) {
    await removeGroupFromFolder(guildUID, guildID, folderKey, true);
  }

  addGroupToFolder(guildUID, guildID, `${folderName}<${folderID}`, true)
}

$(`#serverListNonFolders`).get(0).ondrop = async (ev) => {
  const guildUID = ev.dataTransfer.getData("targetGuildUID");
  const guildID = ev.dataTransfer.getData("targetGuildID");
  const folderKey = ev.dataTransfer.getData("targetFolderKey");

  if (!guildUID || !guildID) { return }

  if (folderKey) {
    await removeGroupFromFolder(guildUID, guildID, folderKey, true);
  }
} 

export function expandGuildFolder(folderID) {
  const hidden = $(`#guildFolderContent${folderID}`).get(0).getAttribute('style') == '';
  
  if (hidden) {
    $(`#guildFolderContent${folderID}`).removeClass('hidden');
    $(`#guildFolderContent${folderID}`).removeClass('zeroHeight');
    const naturalHeight = $(`#guildFolderContent${folderID}`).height();
    $(`#guildFolderContent${folderID}`).addClass('zeroHeight');
    $(`#guildFolderContent${folderID}`).addClass('guildFolderContentActive');
    $(`#guildFolderContent${folderID}`).css(`height`, `${naturalHeight - 5}px`);
    $(`#chevron${folderID}`).removeClass('bx-chevron-down');
    $(`#chevron${folderID}`).addClass('bx-chevron-up');
    $(`#folder${folderID}`).addClass('folderFolderIconActive');
    $(`#folder${folderID}`).removeClass('bx-folder');
    $(`#folder${folderID}`).addClass('bx-folder-open');
    $(`#${folderID}Button`).addClass('guildFolderActive');
  }
  else {
    $(`#guildFolderContent${folderID}`).get(0).setAttribute('style', '');
    $(`#chevron${folderID}`).addClass('bx-chevron-down');
    $(`#chevron${folderID}`).removeClass('bx-chevron-up');
    $(`#folder${folderID}`).removeClass('folderFolderIconActive');
    $(`#folder${folderID}`).removeClass('bx-folder-open');
    $(`#folder${folderID}`).addClass('bx-folder');
    $(`#guildFolderContent${folderID}`).removeClass('guildFolderContentActive');
    $(`#${folderID}Button`).removeClass('guildFolderActive');

    // IF screen less than 600px
    if (window.innerWidth < 600) {
      $(`#guildFolderContent${folderID}`).addClass('hidden');
    }
  }
}

function buildGroup(guildUID, guildID, guildMeta) {
  const a = document.createElement('div');
  a.id = `${guildUID}${guildID}Server`;
  a.setAttribute('guildUID', guildUID);
  a.setAttribute('guildID', guildID);
  a.setAttribute('class', `server ${guildID}ServerIcon imageServer animated zoomIn hidden`);
  a.draggable = true;
  a.ondragstart = (ev) => {
    ev.dataTransfer.setData("targetGuildUID", guildUID);
    ev.dataTransfer.setData("targetGuildID", guildID);
    ev.dataTransfer.setData("targetFolderKey", '');
  }
  
  let serverMuted = '';
  if (mutedServers.includes(guildUID + guildID)) {
    serverMuted = 'mutedNotification';
  }
  if (guildMeta.exists()) {
    if (guildMeta.data().url) {
      a.style.backgroundImage = `url('${guildMeta.data().url}')`  ;
      
      if (addPendingIndicator[`${guildUID}${guildID}`]) {
        a.innerHTML = `<div id="${guildUID}${guildID}serverNotification" class="serverNotification animated zoomIn ${serverMuted}"></div>`;  
      }
      else {
        a.innerHTML = `<div id="${guildUID}${guildID}serverNotification" class="serverNotification animated hidden ${serverMuted}"></div>`;
      }
    }
    else {
      a.setAttribute('style', '')
      if (addPendingIndicator[`${guildUID}${guildID}`]) {
        a.innerHTML = `<i class="bx bx-group"></i><div id="${guildUID}${guildID}serverNotification" class="serverNotification animated zoomIn ${serverMuted}"></div>`;
      }
      else {
        a.innerHTML = `<i class="bx bx-group"></i><div id="${guildUID}${guildID}serverNotification" class="serverNotification animated hidden ${serverMuted}"></div>`;
      }
    }
  }
  else {
    a.setAttribute('style', '')
    a.innerHTML = `<i class="bx bx-trash-alt animated zoomIn slower"></i><div id="${guildUID}${guildID}serverNotification" class="serverNotification animated ${serverMuted}"></div>`;
  }
  
  
  if (!$(`#${guildUID}${guildID}Server`).length) {
    if (guildMeta.exists()) {
      serverData[guildUID + guildID] = guildMeta.data();
      createNotificationsListener(guildUID, guildID);
      a.onclick = () => openServer(guildUID, guildID);

      $('#serverListNonFolders').get(0).appendChild(a);
      tippy($(`#${guildUID}${guildID}Server`).get(0), {
        content: guildMeta.data().name,
      });
    }
    else {
      a.onclick = () => clearServer(guildUID, guildID);
      $('#serverListNonFolders').get(0).appendChild(a);
      tippy($(`#${guildUID}${guildID}Server`).get(0), {
        content: 'Deleted Group',
      });
    }
  }

  window.setTimeout(() => {
    $(`#${guildUID}${guildID}Server`).removeClass('animated');
  }, 999);

  firstLog[guildUID + guildID] = true;
}

export function openSpecialServer(id) {
  closeUserPopout();
  if (window.innerWidth < 600) {
    switchViewsToList()
  }

  if (currentServer == id) {
    if (currentServer == 'music') {
      (editorModePlaylist ? exitEditorModePlaylist(editorModePlaylist) : null);
    }
    return;
  }

  try { endBroadListener() } catch (e) { };
  try { playlistListener() } catch(e) { };
  try { off(query(ref(rtdb, voiceChatRef))); voiceChatRef = ''; } catch (e) {};
  try { off(query(ref(rtdb, activeMessageListener))); activeMessageListener = ''; } catch(e) {};
  try { off(query(ref(rtdb, activePinnedListener))); activePinnedListener = ''; } catch(e) {};
  try { activeReadListener() } catch(e) {};
  $('#specialFullViewContent').removeClass('hidden');
  $('#nonSpecialContent').addClass('hidden');
  $('.view').addClass('hidden');

  $(`#${id}ServerView`).removeClass('hidden');
  $(`.serverActive`).removeClass('serverActive');
  $(`#${id}Server`).addClass('serverActive');

  if (id === 'music') {
    loadMusic();
    hidePlaybackButton();

    (editorModePlaylist ? exitEditorModePlaylist(editorModePlaylist) : null);
  }
  else {
    try { showPlaybackButton(); } catch (error) { }
  }

  currentServerUser = '';
  currentServer = '';
  currentChannel = '';

  if (id === 'friends' && currentServer !== 'friends') {
    // Check which channel is currently being displayed.
    if ( $('#friendViewRight').children().not('.hidden').length ) {
      const userID = $('#friendViewRight').children().not('.hidden').get(0).id.split('friend')[0];
      addDMListeners(userID);
      markDMRead(userID);
      $(`#${userID}ChatMessageInput`).get(0).focus();
      currentChannel = userID;
    }

    friendsTab('friends', $(`#friendsTabFriendsButton`).get(0));
  }

  else if (id === 'music' ** currentServer !== 'music') {
    clearMusicViews('search');
    currentChannel = activeMusicTab;
  }

  currentServer = id;
}

export async function openServer(guildUID, guildID) {
  if (window.innerWidth < 600) {
    switchViewsToList()
  }
  
  if (currentServer == guildID && currentServerUser == guildUID) {
    return;
  } 

  currentServerUser = guildUID;
  currentServer = guildID

  showPlaybackButton();
  try { endBroadListener() } catch (e) { };
  try { playlistListener() } catch(e) { };
  try { off(query(ref(rtdb, voiceChatRef))); voiceChatRef = ''; } catch (e) {};
  try { off(query(ref(rtdb, activeMessageListener))); activeMessageListener = ''; } catch(e) {};
  try { off(query(ref(rtdb, activePinnedListener))); activePinnedListener = ''; } catch(e) {};
  try { activeReadListener() } catch(e) {};
  
  // UI
  $(`.serverActive`).removeClass('serverActive');
  $(`#${guildUID + guildID}Server`).addClass('serverActive');
  $('#specialFullViewContent').addClass('hidden');
  $('#nonSpecialContent').removeClass('hidden');
  $('.serverView').addClass('hidden');

  if ($(`#${guildUID + guildID}View`).length) {
    // Element exists.
    $('.serverView').addClass('hidden');
    $(`#${guildUID + guildID}View`).removeClass('hidden');
  }
  
  else {
    // Element doesnt exist. Create it.
    const a = document.createElement('div');
    a.setAttribute('class', 'serverView');
    a.innerHTML = `
      <div class="channelLeftGridBackground"></div>
      <div class="sidebarLeft animated fadeIn fast hidden" id="sidebarLeft${guildUID}${guildID}">
        <div class="guildTop" id="${guildUID}${guildID}GuildTop">
          <div class="guildTopIcon invisibleOpacity" id="${guildUID}${guildID}GuildTopIcon"></div>
          <img class="hidden" id="${guildUID}${guildID}GuildTopIconImg"></img>
          <div class="guildTopName"><p id="${guildUID}${guildID}GuildTopName"></p></div>
          <div class="guildTopIcons">
            <div>
              <button id="${guildUID}${guildID}HomeIcon" class="animated btn b-0 roundedButton"> <i class="bx bx-home"></i> </button>
              <i id="${guildUID}${guildID}verifiedGroupIcon" class="bx bx-badge-check verifiedGroupIcon hidden animated fadeIn"></i>
            </div>
            <div>
              <button id="${guildUID}${guildID}InviteIcon" onclick="copyToClipboard('inv:${guildUID}.${guildID}')" class="animated btn b-0 roundedButton"> <i class="bx bx-paper-plane"></i> </button>
              <button id="${guildUID}${guildID}MutedStatus" class="animated btn b-0 roundedButton mutedStatus"> <i class="bx bx-bell"></i> </button>
              <button id="${guildUID}${guildID}guildSettingsIcon" onclick="openServerSettings('${guildUID}', '${guildID}')" class="btn b-0 roundedButton hidden"> <i class="bx bx-cog"></i> </button>
            </div>
          </div>
        </div>
        <div class="sidebarLeftContent" id="sidebarLeftContent${guildUID}${guildID}">
          <div class="incomingRequestBanner hidden animated fadeIn" id="${guildUID}${guildID}incomingRequestNotify">
            <b>Incoming Request</b>
            <p>There are one or more incoming requests.</p>
            <center><button onclick="openServerSettings('${guildUID}', '${guildID}')" class="btn b-1">View</button></center>
          </div>

          <div class="guildChannelTitle">
            <p class="subtitle">Lounges</p>
            <div class="dropdown">
              <button onclick="openDropdown('${guildUID}${guildID}newLoungeDropdown')" class="btn b-3 dropdownButton roundedButton hidden" id="${guildUID}${guildID}guildAddChannelButton"> <i class="bx bx-plus-circle"></i> </button>
              <div id="${guildUID}${guildID}newLoungeDropdown" class="dropdown-content loungeCreateDropdownContent">
                <a onclick="newGuildChannel('${guildUID}', '${guildID}')" class="btn">Lounge</a>
                <div class="dropdownDivider"></div>
                <a onclick="newGuildQAChannel('${guildUID}', '${guildID}')" class="btn">Q&A Lounge</a>
              </div>
            </div>
          </div>

          <div class="guildChannelList" id="${guildUID}${guildID}guildChannelList">
            <div id="${guildUID}${guildID}guildChannelNotice"></div>
          </div>

          <div class="guildChannelTitle" id="${guildUID}${guildID}guildChannelTitle">
            <p class="subtitle" id="${guildUID}${guildID}MemberTitle">...</p>
            <button class="btn b-3 roundedButton" onclick="openMemberSearch('${guildUID}', '${guildID}')" id="${guildUID}${guildID}guildSearchMembersButton"><i class="bx bx-search-alt"></i> </button>
          </div>

          <div class="guildChannelTitle hidden guildChannelTitleSearch" id="${guildUID}${guildID}guildChannelTitleSearch">
            <input autocomplete="off" id="guildChannelSearchField${guildUID}${guildID}" placeholder="Search" type="text">
            <button class="btn b-3 roundedButton" onclick="closeMemberSearch('${guildUID}', '${guildID}')" id="${guildUID}${guildID}closeGuildSearchMembersButton"><i class="bx bx-x-circle"></i> </button>
          </div>

          <div class="guildMemberList" id="${guildUID}${guildID}guildMemberList">
            <div id="${guildUID}${guildID}guildMemberListStaff" class="guildMemberListStaff"></div>
            <div id="${guildUID}${guildID}guildMemberListAll"></div>
          </div>
          <div id="${guildUID}${guildID}guildMemberNotice"></div>
        </div>
      </div>

      <div class="voiceChatSidebarLeft animated hidden" id="VCsidebarLeft${guildUID}${guildID}">
        <h3 id="connectedName${guildUID}${guildID}" class="ConnectedName"></h3>
        <button id="${guildUID}${guildID}EndCallButton" class="btn endCall"><i class='bx bx-x-circle' ></i></button>
        <br>
        <div class="ConnectedControls">
          <div>
            <button id="voiceChatButtonMute${guildUID}${guildID}" onclick="muteSelf()" class="btn muteButton"><i class='bx bx-microphone'></i></button>
            <button id="voiceChatButtonDeafen${guildUID}${guildID}" onclick="deafenSelf()" class="btn deafenButton"><i class='bx bx-volume-full'></i></button>
          </div>
          <div>
            <button id="voiceChatButtonVideo${guildUID}${guildID}" class="btn videoButton"><i class='bx bx-video'></i></button>
            <button id="voiceChatButtonScreen${guildUID}${guildID}" class="btn screenButton"><i class='bx bx-desktop'></i></button>
          </div>
        </div>
      </div>

      <div class="sidebarRight" id="sidebarRight${guildUID}${guildID}">
        <div id="${guildUID}${guildID}Home" class="guildChannelView ${guildUID}${guildID}guildChannelViewActive homeChannelView">
          <div class="centered">

            <h2 id="${guildUID}${guildID}HomeTitle"></h2>
            <br>
            <div class="homeContent">
              <div id="${guildUID}${guildID}NumMembers"></div>
              <div id="${guildUID}${guildID}DateCreated"></div>
              <div id="${guildUID}${guildID}Private"></div>
            </div>
            <br><br>
            <p>Select a lounge from the left sidebar.</p>
          </div>
        </div>
        <div id="${guildUID}${guildID}Settings" class="guildChannelView settingsChannelView hidden">
          <h1>Group Settings</h1>
          <div class="settingsContent">
            <div class="settingsSectionOne">
              <div id="${guildUID}${guildID}guildRequests" class="guildRequests animated faster">
                <h2>Incoming Requests <i class="bx bx-inbox"></i></h2>
                <div class="guildRequestsContainer" id="${guildUID}${guildID}guildRequestsContainer"></div>
              </div>
            </div>

            <div class="cardSection">
              <div class="guildProfileCard" id="${guildUID}${guildID}ProfileCard">
                <br>
                <div id="${guildUID}${guildID}newIconPhoto" class="groupIconPreview animated zoomIn"></div>
                <br>
                <button id="${guildUID}${guildID}newGroupIconButton" onclick="newGroupIcon('${guildUID}', '${guildID}')" class="btn b-1 editGroupIconButton"><i class="bx bx-cloud-upload"></i></button>
                <button id="${guildUID}${guildID}removeGroupIconButton" onclick="removeGroupIcon('${guildUID}', '${guildID}')" class="btn b-2 removeGroupIconButton"><i class='bx bx-message-square-x'></i></button>
                <br><br>
                <h3 id="${guildUID}${guildID}newGroupName"></h3> <button onclick="prepareUpdateGroupName('${guildUID}', '${guildID}')" class="btn b-3 updateNameButton"><i class="bx bx-edit"></i></button>
                <br><br>
                <span class="checkbox">
                  <input id="privateGroupCheck${guildUID}${guildID}" onchange="updateGuildPrivacy('${guildUID}', '${guildID}')" type="checkbox" />
                  <svg> <use xlink:href="#checkbox" class="checkbox"></use> </svg>
                </span>
                <p class="checkboxLabel">Private Group <i id="${guildUID}${guildID}privateInfo" class="bx bx-info-square"></i></p>
                <br>
              </div>
              <br>
              <div class="deleteGuildCard" id="${guildUID}${guildID}deleteCard">
                <h2>More Options</h2> <br>
                <center><a class="grey" onclick="deleteGroup('${guildID}')">Delete Group</a></center>
              </div>
            </div>
          </div>
        </div>
      </div>
    `

    a.id = `${guildUID}${guildID}View`;
    $('#nonSpecialContent').get(0).appendChild(a);

    displayInputEffect();
    tippy($(`#${guildUID}${guildID}InviteIcon`).get(0), {placement: 'bottom', content: 'Copy Invite Link'});
    tippy($(`#${guildUID}${guildID}HomeIcon`).get(0), {placement: 'bottom', content: 'Home'});
    tippy($(`#${guildUID}${guildID}verifiedGroupIcon`).get(0), {placement: 'bottom', content: 'Verified Group'});
    tippy($(`#${guildUID}${guildID}MutedStatus`).get(0), {placement: 'bottom', content: 'Mute Group'});
    tippy($(`#${guildUID}${guildID}guildSettingsIcon`).get(0), {placement: 'bottom', content: 'Group Settings'});
    tippy($(`#${guildUID}${guildID}privateInfo`).get(0), {placement: 'top', content: 'Members will require approval to join.'});
    tippy($(`#${guildUID}${guildID}guildAddChannelButton`).get(0), {placement: 'top', content: 'New Lounge'});
    tippy($(`#${guildUID}${guildID}guildSearchMembersButton`).get(0), {placement: 'top', content: 'Search Members'});
    tippy($(`#${guildUID}${guildID}closeGuildSearchMembersButton`).get(0), {placement: 'top', content: 'Close Search'});
    tippy($(`#${guildUID}${guildID}newGroupIconButton`).get(0), {placement: 'top', content: 'Upload Icon'})
    tippy($(`#${guildUID}${guildID}removeGroupIconButton`).get(0), {placement: 'top', content: 'Remove Icon'})
    tippy($(`#${guildUID}${guildID}EndCallButton`).get(0), {placement: 'top', content: 'Leave Voice'});
    tippy($(`#voiceChatButtonMute${guildUID}${guildID}`).get(0), {placement: 'top', content: 'Mute'});
    tippy($(`#voiceChatButtonDeafen${guildUID}${guildID}`).get(0), {placement: 'top', content: 'Deafen'});
    tippy($(`#voiceChatButtonVideo${guildUID}${guildID}`).get(0), {placement: 'top', content: 'Stream Video'});
    tippy($(`#voiceChatButtonScreen${guildUID}${guildID}`).get(0), {placement: 'top', content: 'Stream Screen'});
  }

  $(`#${guildUID}${guildID}HomeIcon`).get(0).onclick = () => {
    closeCurrentChannel();
    $(`#${guildUID}${guildID}Home`).removeClass('hidden');
    $(`#${guildUID}${guildID}Home`).addClass(`${guildUID}${guildID}guildChannelViewActive`);
  }

  if (cacheUser.mutedServers && cacheUser.mutedServers.includes(`${guildUID}${guildID}`)) {
    $(`#${guildUID}${guildID}MutedStatus`).html('<i class="bx bx-bell-off"></i>');
    $(`#${guildUID}${guildID}MutedStatus`).get(0).onclick = () => unmuteServer(guildUID, guildID);
    $(`#${guildUID}${guildID}MutedStatus`).get(0)._tippy.setContent('Unmute Group');
  }

  else {
    $(`#${guildUID}${guildID}MutedStatus`).html('<i class="bx bx-bell"></i>');
    $(`#${guildUID}${guildID}MutedStatus`).get(0).onclick = () => muteServer(guildUID, guildID);
    $(`#${guildUID}${guildID}MutedStatus`).get(0)._tippy.setContent('Mute Group');
  }

  runOnOpen[guildUID + guildID] = true;
  endBroadListener = onSnapshot(doc(db, `users/${guildUID}/servers/${guildID}`), async (snapshot) => {
    if ($(`#sidebarLeft${guildUID}${guildID}`).hasClass('hidden')) {
      $(`#sidebarLeft${guildUID}${guildID}`).removeClass('hidden');
      window.setTimeout(() => {
        $(`#sidebarLeft${guildUID}${guildID}`).removeClass('animated'); // Only animate on the first load.
      }, 500);
    }

    if (!snapshot.exists()) {
      // Server got deleted.
      if (guildUID !== user.uid) {
        snac('This group is deleted.', '', '');
      }
      clearServer(guildUID, guildID);
      return;
    }

    if (!snapshot.data().members.includes(`${cacheUser.username}.${user.uid}`)) {
      // Kicked from server.
      snac('You were kicked from this group.', '', '');
      clearServer(guildUID, guildID);
      return;
    }

    let memberChangeForward = [];
    let memberChangeBackward = [];

    memberChangeForward = commonArrayDifference(snapshot.data().members, serverData[`${guildUID}${guildID}`].members);
    memberChangeBackward = commonArrayDifference(serverData[`${guildUID}${guildID}`].members, snapshot.data().members);

    let staffChangeForward = [];
    let staffChangeBackward = [];

    if (serverData[guildUID + guildID].staff) { // Account for old guilds.
      staffChangeForward = commonArrayDifference(snapshot.data().staff, serverData[`${guildUID}${guildID}`].staff);
      staffChangeBackward = commonArrayDifference(serverData[`${guildUID}${guildID}`].staff, snapshot.data().staff);
    }
    else {
      serverData[guildUID + guildID].staff = [];
    }

    let channelChangeForward = commonArrayDifference(snapshot.data().channels, serverData[`${guildUID}${guildID}`].channels);
    let channelChangeBackward = commonArrayDifference(serverData[`${guildUID}${guildID}`].channels, snapshot.data().channels);

    if (serverData[`${guildUID}${guildID}`].channels.length == snapshot.data().channels.length) {
      channelChangeForward = [];
      channelChangeBackward = [];
    }

    let incomingRequestForward = [];
    let incomingRequestBackward = [];

    if (serverData[`${guildUID}${guildID}`].owner == user.uid || serverData[`${guildUID}${guildID}`].staff.includes(user.uid)) {
      incomingRequestForward = commonArrayDifference(snapshot.data().incomingRequests, serverData[`${guildUID}${guildID}`].incomingRequests);
      incomingRequestBackward = commonArrayDifference(serverData[`${guildUID}${guildID}`].incomingRequests, snapshot.data().incomingRequests);
    }

    let change = diff(serverData[`${guildUID}${guildID}`], snapshot.data());
    const channelDataChanged = serverData[guildUID + guildID].channelData != snapshot.data().channelData;
    serverData[`${guildUID}${guildID}`] = snapshot.data();

    if (firstLog[`${guildUID}${guildID}`]) {
      change = serverData[`${guildUID}${guildID}`]
      staffChangeForward = snapshot.data().staff;
      channelChangeForward = snapshot.data().channels;
      memberChangeForward = snapshot.data().members;
      incomingRequestForward = snapshot.data().incomingRequests;
      incomingRequestBackward = [];
    }

    // Go through changes!
    if (change.name) {
      $(`#${guildUID}${guildID}Server`).get(0)._tippy.setContent(securityConfirmText(change.name));
      $(`#${guildUID}${guildID}GuildTopName`).html(securityConfirmText(change.name));
      $(`#${guildUID}${guildID}HomeTitle`).html(securityConfirmText(change.name));
      $(`#${guildUID}${guildID}newGroupName`).html(securityConfirmText(change.name));
    }

    // Date created
    $(`#${guildUID}${guildID}DateCreated`).html(`Created ${snapshot.data().dateCreated ? timeago.format(snapshot.data().dateCreated.toDate()) : "before the dawn of time"}`);

    // Private
    $(`#${guildUID}${guildID}Private`).html('Public');
    $(`#privateGroupCheck${guildUID}${guildID}`).get(0).checked = serverData[`${guildUID}${guildID}`].isPrivate;
    if (serverData[`${guildUID}${guildID}`].isPrivate) {
      $(`#${guildUID}${guildID}Private`).html('Private');
    }

    // Muted
    let serverMuted = '';
    for (let i = 0; i < mutedServers.length; i++) { if (mutedServers[i] == guildUID + guildID) {
      serverMuted = 'mutedNotification'; break;
    }}

    if (serverData[`${guildUID}${guildID}`].url) {
      $(`#${guildUID}${guildID}Server`).get(0).style.backgroundImage = `url('${serverData[guildUID + guildID].url}')`;

      if (addPendingIndicator[`${guildUID}${guildID}`]) {
        $(`#${guildUID}${guildID}serverNotification`).addClass(serverMuted);
        $(`#${guildUID}${guildID}serverNotification`).addClass('zoomIn');
      }
      else {
        $(`#${guildUID}${guildID}Server`).html(`<div id="${guildUID}${guildID}serverNotification" class="serverNotification animated hidden ${serverMuted}"></div>`);
      }

      $(`#${guildUID}${guildID}newIconPhoto`).get(0).style.backgroundImage = `url('${serverData[guildUID + guildID].url}')`;
      $(`#${guildUID}${guildID}newIconPhoto`).html('');

      $(`#${guildUID}${guildID}GuildTopIcon`).get(0).style.backgroundImage = `url('${serverData[guildUID + guildID].url}')`;
      $(`#${guildUID}${guildID}GuildTopIcon`).html('');
      
      $(`#${guildUID}${guildID}GuildTopIconImg`).off();
      $(`#${guildUID}${guildID}GuildTopIconImg`).get(0).setAttribute('crossOrigin', '');
      $(`#${guildUID}${guildID}GuildTopIconImg`).addClass('hidden');
      $(`#${guildUID}${guildID}GuildTopIconImg`).bind('load', function() {
        const colors = colorThief.getColor($(`#${guildUID}${guildID}GuildTopIconImg`).get(0));
        $(`#${guildUID}${guildID}ProfileCard`).css('border-bottom', `10px solid rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, 1)`);
        $(`#${guildUID}${guildID}GuildTop`).css('border-bottom', `6px solid rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, 1)`);
        
        $(`#${guildUID}${guildID}GuildTopIcon`).html('');
        $(`#${guildUID}${guildID}GuildTopIcon`).addClass('notInvisible');

        // Custom CSS for active channel color
        const targetServerCSS = `
          .${guildUID}${guildID}ServerIcon::before {
            background-color: rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, 1) !important;
          }
          .${guildUID}${guildID}guildChannelActive {
            border-left: 5px solid rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, 1) !important;
          }
        `;

        if (!$(`#${guildUID}${guildID}ThemeInjection`).length) {
          const a = document.createElement('style');
          a.id = `${guildUID}${guildID}ThemeInjection`;
          a.innerHTML = targetServerCSS;
          $('#serverCSSInjections').get(0).appendChild(a);
        }
        else {
          $(`#${guildUID}${guildID}ThemeInjection`).html(targetServerCSS);
        }
      });
      $(`#${guildUID}${guildID}GuildTopIconImg`).get(0).src = `${serverData[guildUID + guildID].url}`;
    }
    else {
      if (addPendingIndicator[`${guildUID}${guildID}`]) {
        $(`#${guildUID}${guildID}serverNotification`).addClass(serverMuted);
        $(`#${guildUID}${guildID}serverNotification`).addClass('zoomIn');
      }
      else {
        $(`#${guildUID}${guildID}Server`).html(`<i class="bx bx-group"></i><div id="${guildUID}${guildID}serverNotification" class="serverNotification animated hidden ${serverMuted}"></div>`);
      }

      $(`#${guildUID}${guildID}Server`).get(0).setAttribute('style', '');
      $(`#${guildUID}${guildID}GuildTopIcon`).get(0).setAttribute('style', '');
      $(`#${guildUID}${guildID}GuildTopIcon`).html(`<i class="bx bx-group"></i>`);
      $(`#${guildUID}${guildID}GuildTopIcon`).addClass('notInvisible');
      $(`#${guildUID}${guildID}newIconPhoto`).html('No group icon added.');
      $(`#${guildUID}${guildID}newIconPhoto`).get(0).setAttribute('style', '');
      $(`#${guildUID}${guildID}ProfileCard`).css('border-bottom', '');
      $(`#${guildUID}${guildID}GuildTop`).css('border-bottom', '');
    }

    // Incoming requests
    if (serverData[guildUID + guildID].owner == user.uid || serverData[guildUID + guildID].staff.includes(user.uid)) {
      for (let i = 0; i < incomingRequestForward.length; i++) {
        const incomingRequest = incomingRequestForward[i];
        buildMemberGuildRequestItem(guildUID, guildID, incomingRequest);
      }

      for (let i = 0; i < incomingRequestBackward.length; i++) {
        const incomingRequest = incomingRequestBackward[i];
        console.log('deleting')
        $(`#incomingGuildRequest${guildUID}${guildID}${incomingRequest.u}`).addClass('incomingGuildRequestGone');
        window.setTimeout(() => {
          $(`#incomingGuildRequest${guildUID}${guildID}${incomingRequest.u}`).remove();
        }, 1000)
      }
    }

    $(`#${guildUID}${guildID}incomingRequestNotify`).addClass('hidden');
    if (snapshot.data().incomingRequests.length) {
      if (snapshot.data().owner == user.uid || snapshot.data().staff.includes(user.uid)) {
        window.clearTimeout(guildTimeouts[guildUID + guildID + `guildRequests`]);
        $(`#${guildUID}${guildID}incomingRequestNotify`).removeClass('hidden');
        $(`#${guildUID}${guildID}guildRequests`).removeClass('hidden');
        $(`#${guildUID}${guildID}guildRequests`).addClass('fadeIn');
        $(`#${guildUID}${guildID}guildRequests`).removeClass('fadeOut');
      }
    }
    else {
      $(`#${guildUID}${guildID}guildRequests`).removeClass('fadeIn');
      $(`#${guildUID}${guildID}guildRequests`).addClass('fadeOut');
      guildTimeouts[guildUID + guildID + `guildRequests`] = window.setTimeout(() => {
        $(`#${guildUID}${guildID}guildRequests`).addClass('hidden');
      }, 1000);
    }
    
    // Lounges / Channels
    for (let i = 0; i < channelChangeForward.length; i++) {
      const channelID = channelChangeForward[i].split('.')[0];
      const channelName = channelChangeForward[i].split('.')[1];
      const channelType = channelChangeForward[i].split('.')[2];
      buildGuildChannel(guildUID, guildID, channelID, channelName, channelType);
    }
    
    for (let i = 0; i < channelChangeBackward.length; i++) {
      const channelID = channelChangeBackward[i].split('.')[0];
      const channelName = channelChangeBackward[i].split('.')[1];
      $(`#${guildUID}${guildID}${channelID}guildChannel`).remove()
      $(`#${guildUID}${guildID}${channelID}guildChannelElement`).addClass('channelGone');
      window.setTimeout(() => {
        $(`#${guildUID}${guildID}${channelID}guildChannelElement`).remove();
      }, 1000)
    }

    // Reorder.
    if (!channelChangeForward.length && !channelChangeBackward.length) {
      // Potentially, there is a new order.
      for (let i = 0; i < snapshot.data().channels.length; i++) {
        const channelID = snapshot.data().channels[i].split('.')[0];
        $(`#${guildUID}${guildID}${channelID}guildChannelElement`).get(0).setAttribute('data-order', i);
      }

      let sorted = $(`#${guildUID}${guildID}guildChannelList`).children('.guildChannel').sort((a, b) => {
        return parseInt($(a).attr('data-order')) - parseInt($(b).attr('data-order'));
      });

      $(`#${guildUID}${guildID}guildChannelList`).append(sorted);
    }
    
    for (let i = 0; i < serverData[guildUID + guildID].channels.length; i++) {
      const channelID = serverData[guildUID + guildID].channels[i].split('.')[0];
      const channelName = serverData[guildUID + guildID].channels[i].split('.')[1];
      const channelType = serverData[guildUID + guildID].channels[i].split('.')[2];
      
      // Sidebar list.
      $(`#${guildUID}${guildID}${channelID}channeListName`).html(`${securityConfirmTextIDs(channelName, true)}`);
      $(`#${guildUID}${guildID}${channelID}guildChannelElement`).get(0).onclick = () => {
        openGuildChannel(guildUID, guildID, channelID, channelName, channelType);
      }

      twemoji.parse($(`#${guildUID}${guildID}${channelID}channeListName`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });
      
      // Update channel elements *if it is a modified channel!*
      $(`#${guildUID}${guildID}${channelID}guildChannelViewTitle`).html(securityConfirmTextIDs(channelName, true)); // Title
      if ($(`#${guildUID}${guildID}${channelID}guildChannelViewTitle`).length) {
        twemoji.parse($(`#${guildUID}${guildID}${channelID}guildChannelViewTitle`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });
      }

      // Update VC Active if connected:
      if (currentCall == `${guildUID}${guildID}/${channelID}`) {
        $(`#${guildUID}${guildID}VCConnectedText`).html(securityConfirmTextIDs(channelName, true));
      }
    }
    
    if (snapshot.data().channels.length) {
      $(`#${guildUID}${guildID}guildChannelNotice`).html('');
    }
    else {
      $(`#${guildUID}${guildID}guildChannelNotice`).html('<div class="notice">There are no lounges available.</div>');
    }

    // Member List (rebuilt)
    $(`#${guildUID}${guildID}MemberTitle`).html(`${serverData[guildUID + guildID].members.length} members`)


    for (let i = 0; i < memberChangeForward.length; i++) {
      buildMemberItem(guildUID, guildID, memberChangeForward[i], i);
    }

    for (let i = 0; i < memberChangeBackward.length; i++) {
      $(`#${guildUID}${guildID}${memberChangeBackward[i].split('.')[1]}guildMemberElement`).addClass('guildMemberGone');
      window.setTimeout(() => {
        $(`#${guildUID}${guildID}${memberChangeBackward[i].split('.')[1]}guildMemberElement`).remove();
      }, 1001)
    }

    // Verified icon
    if (verifiedGroups && verifiedGroups.includes(`${guildUID}.${guildID}`)) {
      $(`#${guildUID}${guildID}verifiedGroupIcon`).removeClass('hidden');
    }
    else {
      $(`#${guildUID}${guildID}verifiedGroupIcon`).addClass('hidden');
    }

    // Staff list (rebuilt)

    for (let i = 0; i < staffChangeForward.length; i++) {
      const userID = staffChangeForward[i];
      $(`#${guildUID}${guildID}${userID}userBadgeIcon`).removeClass('bx-user-pin');
      $(`#${guildUID}${guildID}${userID}userBadgeIcon`).addClass('bx-id-card');
      $(`#${guildUID}${guildID}${userID}userBadgeIcon`).get(0)._tippy.setContent('Staff');  
      $(`#${guildUID}${guildID}${userID}guildMemberElement`).appendTo(`#${guildUID}${guildID}guildMemberListStaff`);
    }

    if (staffChangeForward.length) { // Sort staff list.
      let sorted = $(`#${guildUID}${guildID}guildMemberListStaff`).children('.guildMember').sort((a, b) => {
        return parseInt($(a).attr('data-order')) - parseInt($(b).attr('data-order'));
      });
    
      $(`#${guildUID}${guildID}guildMemberListStaff`).append(sorted);
    }
    
    for (let i = 0; i < staffChangeBackward.length; i++) {
      const userID = staffChangeBackward[i];
      $(`#${guildUID}${guildID}${userID}userBadgeIcon`).removeClass('bx-id-card');
      $(`#${guildUID}${guildID}${userID}userBadgeIcon`).addClass('bx-user-pin');
      $(`#${guildUID}${guildID}${userID}userBadgeIcon`).get(0)._tippy.setContent('Member');
      $(`#${guildUID}${guildID}${userID}guildMemberElement`).appendTo(`#${guildUID}${guildID}guildMemberListAll`);
    }

    if (staffChangeBackward.length) { // Sort member list.
      let sorted = $(`#${guildUID}${guildID}guildMemberListAll`).children('.guildMember').sort((a, b) => {
        return parseInt($(a).attr('data-order')) - parseInt($(b).attr('data-order'));
      });
    
      $(`#${guildUID}${guildID}guildMemberListAll`).append(sorted);
    }

    if (serverData[guildUID + guildID].members.length == 1) {
      $(`#${guildUID}${guildID}${user.uid}guildMemberElement`).addClass('hiddenImportant');
      $(`#${guildUID}${guildID}guildMemberNotice`).html(`<div class="notice">There are no <b>other</b> members.</div>`);
      $(`#${guildUID}${guildID}MemberTitle`).html(`members`);
      $(`#${guildUID}${guildID}NumMembers`).html(`1 member`);
    }
    else {
      $(`#${guildUID}${guildID}${user.uid}guildMemberElement`).removeClass('hiddenImportant');
      $(`#${guildUID}${guildID}NumMembers`).html(`${serverData[guildUID + guildID].members.length} members`);
      $(`#${guildUID}${guildID}guildMemberNotice`).html(``);
    }

    // Permissions
    if (currentChannel && currentChannel !== currentServer + 'settings' && currentChannel !== currentServer + 'Home') { // A channel is selected
      reevaluatePermissionsChannel(guildUID, guildID, currentChannel);
    }
  
    if (channelDataChanged) {
      for (let i = 0; i < serverData[guildUID + guildID].channels.length; i++) { // Go through lounges.
        const channelID = serverData[guildUID + guildID].channels[i].split('.')[0];
        updateLoungeTypes(guildUID, guildID, channelID, serverData[guildUID + guildID].channelData ? serverData[guildUID + guildID].channelData[channelID] : {});
      }
    }

    if (snapshot.data().owner === user.uid || serverData[guildUID + guildID].staff.includes(`${user.uid}`)) {
      $(`#${guildUID}${guildID}deleteCard`).addClass('hidden');

      if (snapshot.data().owner === user.uid) {
        $(`#${guildUID}${guildID}deleteCard`).removeClass('hidden');
      }

      $(`#${guildUID}${guildID}guildAddChannelButton`).removeClass('hidden');
      $(`#${guildUID}${guildID}guildSettingsIcon`).removeClass('hidden');

      if (!loungeReorderSetup[guildUID + guildID]) {
        loungeReorderSetup[guildUID + guildID] = true;
        sortableLibrary[guildUID + guildID] = Sortable.create($(`#${guildUID}${guildID}guildChannelList`).get(0), {
          ghostClass: 'sortableSidebarItemGhost',
          onEnd: async () => { // Overwrite array.
            let newLoungeArray = [];

            $(`#${guildUID}${guildID}guildChannelList`).children('.guildChannel').each((i, obj) => {
              const name = $(obj).children().last().html();
              const id = $(obj).attr('channelid');
              newLoungeArray.push(`${id}.${name}`)
            });

            await updateDoc(doc(db, `users/${guildUID}/servers/${guildID}`), {
              channels: newLoungeArray
            });
          }
        });
      }
    }
    else {
      $(`#${guildUID}${guildID}deleteCard`).addClass('hidden');
      $(`#${guildUID}${guildID}guildAddChannelButton`).addClass('hidden');
      $(`#${guildUID}${guildID}guildSettingsIcon`).addClass('hidden');
      if (loungeReorderSetup[guildUID + guildID]) { // Remove it.
        try {
          sortableLibrary[guildUID + guildID].destroy();
        } catch (error) {
          console.log('Sortable destroy error occured.');
        }
      }
      sortableLibrary[guildUID + guildID] = null;
      loungeReorderSetup[guildUID + guildID] = null;

      if (currentChannel == guildID + 'settings') {
        closeCurrentChannel();
      }
    }

    if (runOnOpen[guildUID + guildID]) { 
      runOnOpen[guildUID + guildID] = false;
      // Will only run when the guild is clicked. Not when is refreshed.
      // Check which channel is currently being displayed.
      // TO DO: get it working.
      if ($(`.${guildUID}${guildID}guildChannelActive`).length) {
        const channelID = $(`.${guildUID}${guildID}guildChannelActive`).get(0).getAttribute('channelID');
        const channelType = $(`.${guildUID}${guildID}guildChannelActive`).get(0).getAttribute('channelType');
        currentChannel = channelID

        // Mark as read.
        if (channelTabLibrary[`${guildUID}${guildID}${channelID}`] == 'Chat') {
          markChannelAsRead(guildUID, guildID, channelID);
          $(`#${guildUID}${guildID}${channelID}ChatMessageInput`).get(0).focus();
        }
        
        // Re-engage listeners.
        addChannelListeners(guildUID, guildID, channelID, true), channelType;
        manageVoiceChatDisplay(guildUID, guildID, channelID, undefined);
      }

      // Only setup listener after everything is finished.
      if (voiceChatRef !== `voice/${guildUID}${guildID}`) {
        try {
          if (voiceChatRef) {
            off(query(ref(rtdb, voiceChatRef)));
          }
        } catch (error) { }
      
        voiceChatRef = `voice/${guildUID}${guildID}`;
        onValue(query(ref(rtdb, voiceChatRef)), (snapshot) => {
          manageVoiceChatDisplay(guildUID, guildID, undefined, snapshot.val());
        });
      }
      else {
        console.log('Skipping VC Ref listener. Already set.')
      }
    }

    if (firstLog[guildUID + guildID]) { // One-time setup
      $(`#${guildUID}${guildID}${guildUID}userBadgeIcon`).removeClass('bx-user-pin');
      $(`#${guildUID}${guildID}${guildUID}userBadgeIcon`).addClass('bx-crown');
      $(`#${guildUID}${guildID}${guildUID}userBadgeIcon`).get(0)._tippy.setContent('Owner'); 

      firstLog[guildUID + guildID] = false;
    }
  });
}

function buildGuildChannel(guildUID, guildID, channelID, channelName, channelType) { // Redone
  let iconSnippet = `<i id="${guildUID}${guildID}${channelID}sidebarIcon" class="bx bx-hash"></i>`;
  if (channelType == 'qa') {
    iconSnippet = `<i id="${guildUID}${guildID}${channelID}sidebarIcon" class="bx bx-message-square-dots"></i>`;
  }
  let channelNoAccess = false;
  // Staff will always be able to see all channels.

  const a = document.createElement('div');
  a.setAttribute('class', `sidebarButton guildChannel ${currentChannel == channelID ? guildUID + guildID + 'guildChannelActive' : ''} ${guildUID + guildID}guildChannel ${mutedServers.includes(`${guildUID}${guildID}${channelID}`) ? 'mutedChannelNotification' : ''}`);
  a.setAttribute('guildUID', guildUID);
  a.setAttribute('guildID', guildID);
  a.setAttribute('channelID', channelID);
  a.setAttribute('channelName', channelName);
  a.setAttribute('channelType', channelType);

  $(`#${guildUID}${guildID}${channelID}guildChannelElement`).remove();
  a.id = `${guildUID}${guildID}${channelID}guildChannelElement`;

  a.onclick = () => openGuildChannel(guildUID, guildID, channelID, channelName, channelType);
  
  a.innerHTML = `${iconSnippet}
    <div class="channelNotify animated invisible" id="${guildUID}${guildID}${channelID}channelNotify"></div> 
    <div class="sidebarText" id="${guildUID}${guildID}${channelID}channeListName">${securityConfirmTextIDs(channelName, true)}</div>
  `;
  
  $(`#${guildUID}${guildID}guildChannelList`).get(0).appendChild(a);
  twemoji.parse($(`#${guildUID}${guildID}${channelID}channeListName`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });

  const b = document.createElement('div');

  $(`#${guildUID}${guildID}${channelID}guildChannel`).remove();
  b.id = `${guildUID}${guildID}${channelID}guildChannel`;

  b.setAttribute('class', `guildChannelView ${currentChannel == channelID ? '' : 'hidden'}`);

  if (!$(`#${b.id}`).length) {
    $(`#sidebarRight${guildUID}${guildID}`).get(0).appendChild(b);
  }

  checkIndicator(guildUID, guildID, channelID);

  if (toOpenChannelWhenReady == channelID) {
    openGuildChannel(guildUID, guildID, channelID, channelName, channelType);
  }
}

window.updateGuildPrivacy = async (guildUID, guildID) => {
  if ($(`#privateGroupCheck${guildUID}${guildID}`).get(0).checked == serverData[guildUID + guildID].isPrivate) {
    snac('Nothing Changed', 'This setting has already been applied.');
    return;
  }

  $(`#privateGroupCheck${guildUID}${guildID}`).addClass('disabled');

  await updateDoc(doc(db, `users/${guildUID}/servers/${guildID}`), {
    isPrivate: $(`#privateGroupCheck${guildUID}${guildID}`).get(0).checked 
  });

  snac('Group Privacy Updated', '', 'success');

  await timer(3500);
  $(`#privateGroupCheck${guildUID}${guildID}`).removeClass('disabled');
}

window.acceptGuildRequest = async (guildUID, guildID, userID, targetUserName) => {
  disableButton($(`#acceptButton${guildUID}${guildID}${userID}`));
  $(`#rejectButton${guildUID}${guildID}${userID}`).get(0).setAttribute('onclick', '');

  const acceptGuildRequest = httpsCallable(functions, "acceptGuildRequest");
  const result = await acceptGuildRequest({ guildUID: guildUID, guildID: guildID, userID: userID, username: targetUserName});
}

window.rejectGuildRequest = async (guildUID, guildID, userID, targetUserName) => {
  $(`#acceptButton${guildUID}${guildID}${userID}`).get(0).setAttribute('onclick', '')
  disableButton($(`#rejectButton${guildUID}${guildID}${userID}`));

  const rejectGuildRequest = httpsCallable(functions, "rejectGuildRequest");
  const result = await rejectGuildRequest({ guildUID: guildUID, guildID: guildID, userID: userID, username: targetUserName});
}

async function buildMemberGuildRequestItem(guildUID, guildID, incomingRequest) {
  console.log(guildUID, guildID, incomingRequest);
  const a = document.createElement('div');
  a.setAttribute('class', 'guildMemberIncomingContainer');
  a.id = `incomingGuildRequest${guildUID}${guildID}${incomingRequest.u}`;
  a.innerHTML = `
    <div onclick="openUserCard('${incomingRequest.u}')" userID="${incomingRequest.u}" class="guildMember userContextItem">
      <div class="incomingGuildFlexLeft"><img id="${guildUID}${guildID}incomingGuild${incomingRequest.u}request" src="${await returnProperURL(incomingRequest.u)}" /> <span>${incomingRequest.n.capitalize()}</span></div>
    </div>
    <button id="acceptButton${guildUID}${guildID}${incomingRequest.u}" onclick="acceptGuildRequest('${guildUID}', '${guildID}', '${incomingRequest.u}', '${incomingRequest.n}')" class="btn btnAccept"><i class='bx bx-check'></i></button>
    <button id="rejectButton${guildUID}${guildID}${incomingRequest.u}" onclick="rejectGuildRequest('${guildUID}', '${guildID}', '${incomingRequest.u}', '${incomingRequest.n}')" class="btn btnReject"><i class='bx bx-x' ></i></button>
  `
  $(`#${guildUID}${guildID}guildRequestsContainer`).get(0).appendChild(a);
  console.log( $(`#${guildUID}${guildID}guildRequestsContainer`))
  displayImageAnimation(`${guildUID}${guildID}incomingGuild${incomingRequest.u}request`);
}

async function buildMemberItem(guildUID, guildID, user, index) {
  const userID = user.split('.')[1];
  const specifiedUserName = user.split('.')[0];

  const a = document.createElement('div');
  a.setAttribute('class', `guildMember ${guildUID}${guildID}guildMember userContextItem`);
  a.setAttribute('userID', userID);
  a.setAttribute('userName', specifiedUserName);
  a.setAttribute('data-order', index); // Index is placement in array by join date.
  a.setAttribute('guildUID', guildUID);
  a.setAttribute('guildID', guildID);
  $(`#${guildUID}${guildID}${userID}guildMemberElement`).remove();
  a.id = `${guildUID}${guildID}${userID}guildMemberElement`;
  a.onclick = () => openUserCard(userID);
  a.innerHTML = `
    <div>
      <img class="animated fast invisible" id="${guildUID}${guildID}${userID}SmallImage" />
      <div id="${guildUID}${guildID}${userID}PresenceIndicator" class="presenceIndicator ${userID}presence"></div> 
      <span>${specifiedUserName.capitalize()}</span>
    </div>
    <div id="${guildUID}${guildID}${userID}badgeContainer" class="${guildUID}${guildID}BadgeContainer">
      <i id="${guildUID}${guildID}${userID}userBadgeIcon" class="bx bx-user-pin"></i>
    </div>
  `;

  if (guildUID == userID) {
    $(`#${guildUID}${guildID}guildMemberListStaff`).get(0).appendChild(a);
  }
  else {
    $(`#${guildUID}${guildID}guildMemberListAll`).get(0).appendChild(a);
  }
  
  // Tooltip:
  tippy($(`#${guildUID}${guildID}${userID}userBadgeIcon`).get(0), {
    placement: 'top',
    content: 'Member',
  });
  
  $(`#${guildUID}${guildID}${userID}SmallImage`).attr('src', await returnProperURL(userID));
  displayImageAnimation(`${guildUID}${guildID}${userID}SmallImage`);

  tippy($(`#${guildUID}${guildID}${userID}PresenceIndicator`).get(0), {
    content: '',
    placement: 'top',
    onTrigger: () => showTippyListenerPresence(userID, $(`#${guildUID}${guildID}${userID}PresenceIndicator`))
  }); // Prepare tooltip for 'online' | 'offline' | 'last online x days ago'

  updatePresenceForUser(userID);
}

export async function loadOutgoingServerRequests() {  
  if (!cacheUser.outgoingGuilds || !cacheUser.outgoingGuilds.length) {
    cacheUser.outgoingGuilds = [];
    $('#outgoingGuildRequests').empty();
    $('#pendingRequestsLength').removeClass('hidden')
    return;
  }

  if (outgoingGuilds == cacheUser.outgoingGuilds) {
    return; // No changes. No need to update.
  }

  outgoingGuilds = cacheUser.outgoingGuilds;
  $('#pendingRequestsLength').addClass('hidden')

  $('#outgoingGuildRequests').empty();

  for (let i = 0; i < outgoingGuilds.length; i++) {
    const outgoingGuild = outgoingGuilds[i];


    const imageValid = (() => {
      return new Promise((resolve, reject) => {
        var img = new Image();
        img.onload = () => {
          resolve(true);
        }; 
        img.onerror = () => { 
          resolve(false);
        };
        img.src = outgoingGuild.u;
        img = null;
      })
    })

    let imageSnippet = `<img src="${outgoingGuild.u}"></img>`;
    if (imageValid) {
      imageSnippet = `<div class="serverOutgoingNoImage"><i class="bx bx-group"></i></div>`;
    }

    const a = document.createElement('div');
    a.classList.add('outgoingGuild');
    a.innerHTML = `
      <button id="cancelRequestButton${outgoingGuild.targetID}" onclick="cancelOutgoingGuildRequest('${outgoingGuild.targetUID}', '${outgoingGuild.targetID}', '${outgoingGuild.n}')" class="btn guildRejectButton"><i class="bx bx-x"></i></button>
      ${imageSnippet}
      <p>${outgoingGuild.n.capitalize()}</p>
    `
    $('#outgoingGuildRequests').get(0).appendChild(a);
  } 
}

window.cancelOutgoingGuildRequest = async (targetUID, targetID, targetName) => {
  $(`#cancelRequestButton${targetID}`).addClass('disabled');
  $(`#cancelRequestButton${targetID}`).html(`<i style="font-size: 15px;" class='bx bx-time'></i>`);

  const cancelRequestJoinGuild = httpsCallable(functions, "cancelRequestJoinGuild");
  const result = await cancelRequestJoinGuild({ targetUID: targetUID, targetGuild: targetID, targetName: targetName});
  snac('Cancelled Request...', '', 'success');
}

export function createGroup() {
  openModal('createGroup');

  tippy('#privateInfo', {
    content: 'Members require approval to join.',
    placement: 'top',
  });

  $(`#newGroupCreateButton`).get(0).onclick = async () => {

    const groupName = securityConfirmTextIDs($(`#newGroupName`).val(), true).trim();

    if (groupName.length > 35) {
      snac('Group Name Error', 'Group name must be 35 characters or less.', 'danger');
      return;
    }

    if (!groupName.length) {
      snac('Group Name Error', 'Group name cannot be empty.', 'danger');
      return;
    }

    closeModal(); // Approved

    const isPrivate = $('#privateGroupCheck').get(0).checked;

    const ref = await addDoc(collection(db, `users/${user.uid}/servers`), {
      name: groupName,
      owner: user.uid,
      dateCreated: dbts(),
      channels: [],
      channelData: {},
      members: [`${cacheUser.username}.${user.uid}`],
      incomingRequests: [],
      isPrivate: isPrivate,
      staff: [],
    })
  
    await updateDoc(doc(db, `users/${user.uid}/servers/${ref.id}`), {
      id: ref.id
    });
  
    await updateDoc(doc(db, `users/${user.uid}`), {
      guilds: arrayUnion(`${user.uid}.${ref.id}`)
    });

    snac('Group Created', '', 'success');
  }
}

export function createGroupFolder(groupUID, groupID) {
  openModal('createGroupFolder');

  $(`#newGroupFolderCreateButton`).get(0).onclick = () => {
    const folderName = securityConfirmTextIDs($(`#newGroupFolderName`).val().trim(), true).replaceAll(`<`, '');
    const folderID = new Date().getTime();

    confirmGroupFolder(folderName, folderID, groupUID, groupID);
  }
}

export async function addGroupToFolder(groupUID, groupID, folderKey, unHide) {
  const folderName = folderKey.split('<')[0];
  const folderID = folderKey.split('<')[1];
  if (!unHide) { // If hidden, its hidden so no need.
    $(`#${groupUID}${groupID}Server`).addClass('serverGone');
    await timer(500);
  }

  $(`#${groupUID}${groupID}Server`).get(0).setAttribute('inFolder', `${folderName}<${folderID}`);

  await updateDoc(doc(db, `users/${user.uid}`), {
    [`guildFolders.${folderName}<${folderID}`]: arrayUnion(`${groupUID}.${groupID}`)
  });

  if (!$(`#guildFolderContent${folderID}`).hasClass('guildFolderContentActive')) {
    expandGuildFolder(folderID);
  }

  window.setTimeout(() => {
    const oldHeight = $(`#guildFolderContent${folderID}`).css('height');
    $(`#guildFolderContent${folderID}`).css('height', `${parseInt(oldHeight) + 74}px`);
  }, 199);

  if (unHide) {
    $(`#${groupUID}${groupID}Server`).removeClass('hidden');
  }

  $(`#${groupUID}${groupID}Server`).removeClass('serverGone');
}

export async function removeGroupFromFolder(groupUID, groupID, folderKey, hide) {
  return new Promise((resolve, reject) => {
    const folderID = folderKey.split('<')[1];
    $(`#${groupUID}${groupID}Server`).addClass('serverGone');
    if ($(`#guildFolderContent${folderID}`).hasClass('guildFolderContentActive')) {
      const oldHeight = $(`#guildFolderContent${folderID}`).css('height');  
      $(`#guildFolderContent${folderID}`).css('height', `${parseInt(oldHeight) - 74}px`);
    }
  
    window.setTimeout(async () => {
      if (hide) {
        $(`#${groupUID}${groupID}Server`).addClass('hidden');
      }

      animatedFolderGuildOut.push(`${groupUID}${groupID}`);
      await updateDoc(doc(db, `users/${user.uid}`), {
        [`guildFolders.${folderKey}`]: arrayRemove(`${groupUID}.${groupID}`)
      });

      resolve(true);
    }, 500);
  });
}

async function confirmGroupFolder(folderName, folderID, groupUID, groupID) {
  if (folderName.length > 48) {
    snac('Invalid Folder Title', `Your folder's title cannot be more than 48 characters.`, 'danger');
    return;
  }

  if (!folderName.length) {
    snac('Invalid Folder Title', `Your folder's title cannot be empty.`, 'danger');
    return;
  }

  closeModal(); // Approved

  await updateDoc(doc(db, `users/${user.uid}`), {
    [`guildFolders.${folderName}<${folderID}`]: [],
    guildFoldersSort: arrayUnion(folderID)
  });

  snac('Folder Created', '', 'success');

  if (groupUID && groupID) {
    addGroupToFolder(groupUID, groupID, `${folderName}<${folderID}`);
  }
}

export function joinGroup() {
  openModal('joinGroup');

  $(`#joinGroupButton`).get(0).onclick = async () => {
    const inviteCode = $(`#inviteCodeField`).val().trim();
    if (!inviteCode.length) {
      snac('Invite Code Error', 'Invite code cannot be empty.', 'danger');
      return;
    }

    disableButton($(`#joinGroupButton`));
    $('#inviteCodeField').val('');

    let invite;
    if (inviteCode.includes('inv:')) {
      invite = inviteCode.split('inv:')[1].split('.');
    }
    else {
      invite = inviteCode.split('.');
    }

    if (cacheUser.guilds.includes(`${invite[0]}.${invite[1]}`)) {
      snac('Join Error', 'You are already part of this group.', 'danger');
      window.setTimeout(() => {
        enableButton($(`#joinGroupButton`), 'join');
      }, 499);
      return;
    }

    closeModal();

    const serverMeta = await getDoc(doc(db, `users/${invite[0]}/servers/${invite[1]}`));

    if (!serverMeta.exists()) {
      snac('Join Error', 'Your invitation code is invalid.', 'danger');
      window.setTimeout(() => {
        enableButton($(`#joinGroupButton`), 'join');
      }, 499);
      return;
    }

    if (serverMeta.data().isPrivate) {
      let alreadySending = false;
      for (let i = 0; i < cacheUser.outgoingGuilds.length; i++) {
        if (cacheUser.outgoingGuilds[i].targetID == invite[1]) {
          alreadySending = true;
          break;
        }    
      }

      if (alreadySending) {
        snac('Join Error', 'You already have an outgoing request to join this group.', 'danger');
        window.setTimeout(() => {
          enableButton($(`#joinGroupButton`), 'join');
        }, 499);
        return;
      }

      notifyTiny('Sending join request...', true);

      const requestJoinGuild = httpsCallable(functions, "requestJoinGuild");
      const result = await requestJoinGuild({targetUID: invite[0], targetGuild: invite[1]});
      
      snac('Request Sent', '', 'success');
    }
    else {
      notifyTiny('Joining group...', true);

      const joinGuild = httpsCallable(functions, "joinGuild");
      const result = await joinGuild({inviteUser: invite[0], inviteGuild: invite[1]});

      snac('Joined Group', '', 'success');
    }
  }
}

export function leaveServer(guildUID, guildID) {
  return new Promise(async (resolve, reject) => {
    if (currentServerUser == guildUID && currentServer == guildID) {
      openSpecialServer('friends');
    }
  
    $(`#${guildUID}${guildID}Server`).get(0).onclick = () => {console.log('No Action.')};
    $(`#${guildUID}${guildID}Server`).addClass('groupLeavingServerUI')
    const leaveGuild = httpsCallable(functions, "leaveGuild");
    const result = await leaveGuild({targetUID: guildUID, targetID: guildID});
    snac('Left Group', '', 'success');
    resolve(true)
  });
}

// Heavy on server listeners. Create a notifications/unread listener 
// ...for each server on a dedicated index that gets updated on each
// message so all connected clients can be notified and upon connecting,
// can tell when the last message was to determine if there is an
// unread dot. Constantly update the 'unread' doc with the latest date of
// activity so that it can be compared with the personal latest view date


async function createNotificationsListener(guildUID, guildID) {
  onValue(query(ref(rtdb, `servers/${guildUID}${guildID}`)), (snapshot) => {
    if (!snapshot.val()) {
      console.log('No notifications snapshot for this server.. Probably because no messages.')
      return;
    }

    for (let [key, value] of Object.entries(snapshot.val())) {
      if (key == 'channelData') {
        continue;
      }

      // console.log(key, value)

      // Look at the key and value. Check if local copy of this notification is AFTER. ELSE.
      const serverTime = new Date(value);
      // Set date to 0 if the item does not exist (meaning that they have never entered that channel.)
      let localTime = new Date(0);
      if (typeof(unreadIndicatorsData[`${guildUID}${guildID}${key}`]) !== 'undefined') {
        try { 
          localTime = unreadIndicatorsData[`${guildUID}${guildID}${key}`].toDate() 
        } catch (error) { 
          localTime = new Date(0); 
        }
      }

      if (serverTime.getTime() > localTime.getTime() || serverTime.getTime() == localTime.getTime()) { // == If they're both 0. Happens when mark as unread with no messages.
        if (snapshot.val()['channelData'] && snapshot.val()['channelData'][key] && snapshot.val()['channelData'][key].disablePublicView) {
          if (serverData[guildUID + guildID].staff.includes(user.uid) || guildUID == user.uid) {
            addIndicator(guildUID, guildID, key);
          }
        }
        else {
          addIndicator(guildUID, guildID, key);
        }
      }
      else {
        removeIndicator(guildUID, guildID, key);
      }
    }
    window.setTimeout(() => {
      checkServerUnread(guildUID, guildID, snapshot.val()['channelData']);
    }, 99);
  });

  checkServerUnread(guildUID, guildID);
}

export async function unreadIndicators() {
  return new Promise(async (resolve, reject) => {
    onSnapshot(doc(db, `Unread/${user.uid}`), (snapshot) => {
      unreadIndicatorsData = snapshot.data();
      if (!unreadIndicatorsData) {
        unreadIndicatorsData = {};
      }
    });
    resolve(true);
  })
}

export async function checkIndicator(guildUID, guildID, channelID) {
  if (addPendingIndicator[`${guildUID}${guildID}${channelID}`]) {
    addIndicator(guildUID, guildID, channelID);
  }
}

export async function addIndicator(guildUID, guildID, channelID) {
  addPendingIndicator[`${guildUID}${guildID}${channelID}`] = true; // Must go first. Probably bad code.

  if (document.hasFocus()) {
    // All boxes checked for electron
    if (channelTabLibrary[`${guildUID}${guildID}${channelID}`] == 'Chat' && currentServer == guildID && currentChannel == channelID && guildUID == currentServerUser) {
      await markChannelAsRead(guildUID, guildID, channelID);
      return; // No need to add indicator
    }
  }
  else {
    // Can't detect window focus outside of desktop app. All other boxes checked though.
    if (channelTabLibrary[`${guildUID}${guildID}${channelID}`] == 'Chat' && currentServer == guildID && currentChannel == channelID && guildUID == currentServerUser) {
      markAsReadAfterFocus.type = 'channel';
      markAsReadAfterFocus.id = `${guildUID}.${guildID}.${channelID}`;
    }
  }
  
  // Confirmed add indicator.
  window.clearInterval(indicatorTimeouts[guildUID + guildID + channelID]);

  const JQEL = $(`#${guildUID}${guildID}${channelID}channelNotify`);
  JQEL.removeClass('zoomOut');
  JQEL.addClass('activeIndicator');
  JQEL.removeClass('invisible');
  JQEL.addClass('zoomIn');

  const JQEL2 = $(`#${guildUID}${guildID}${channelID}channelTabIndicator`);
  JQEL2.removeClass('zoomOut');
  JQEL2.addClass('activeTabIndicator');
  JQEL2.removeClass('invisible');
  JQEL2.addClass('zoomIn');

  if ($(`#channelMarkButton${guildUID + guildID + channelID}`).length) {
    $(`#channelMarkButton${guildUID + guildID + channelID}`).addClass('disabled');
    $(`#channelMarkButton${guildUID + guildID + channelID}`).html(`Mark as Read`);
    window.setTimeout(() => {
      $(`#channelMarkButton${guildUID + guildID + channelID}`).removeClass('disabled');
      $(`#channelMarkButton${guildUID + guildID + channelID}`).get(0).onclick = () => {
        markChannelAsRead(guildUID, guildID, channelID);
      }
    }, 999); // Cooldown for pressing button again. 
  }
}

export function removeIndicator(guildUID, guildID, channelID) {
  addPendingIndicator[`${guildUID}${guildID}${channelID}`] = false;

  const JQEL = $(`#${guildUID}${guildID}${channelID}channelNotify`)
  JQEL.removeClass('zoomIn');
  JQEL.removeClass('activeIndicator');
  JQEL.addClass('zoomOut');

  const JQEL2 = $(`#${guildUID}${guildID}${channelID}channelTabIndicator`);
  JQEL2.removeClass('zoomIn');
  JQEL2.removeClass('activeTabIndicator');
  JQEL2.addClass('zoomOut');

  
  indicatorTimeouts[guildUID + guildID + channelID] = window.setTimeout(() => {
    JQEL.addClass('invisible');
  }, 500);
  
  if ($(`#channelMarkButton${guildUID + guildID + channelID}`).length) {
    $(`#channelMarkButton${guildUID + guildID + channelID}`).addClass('disabled');
    $(`#channelMarkButton${guildUID + guildID + channelID}`).html(`Mark as Unread`);
    window.setTimeout(() => {
      $(`#channelMarkButton${guildUID + guildID + channelID}`).removeClass('disabled');
      $(`#channelMarkButton${guildUID + guildID + channelID}`).get(0).onclick = () => {
        markChannelAsUnread(guildUID, guildID, channelID);
      }
    }, 999); // Cooldown for pressing button again.
  }
}

export function checkServerUnread(guildUID, guildID, channelDataInput) {
  let channelData = channelDataInput;
  if (!channelDataInput) {
    channelData = serverData[guildUID + guildID].channelData;
  }

  let serverRead = true;

  for (let i = 0; i < serverData[guildUID + guildID].channels.length; i++) {
    const channelID = serverData[guildUID + guildID].channels[i].split('.')[0];
    
    if (addPendingIndicator[`${guildUID}${guildID}${channelID}`]) {

      let channelMuted = false;
      if (mutedServers.includes(`${guildUID}${guildID}${channelID}`)) {
        channelMuted = true;
      }

      if (!channelMuted) {
        if (serverData[guildUID + guildID].channelData && serverData[guildUID + guildID].channelData[channelID] && serverData[guildUID + guildID].channelData[channelID].disablePublicView && !serverData[guildUID + guildID].staff.includes(user.uid) && !serverData[guildUID + guildID].owner !== user.uid) {
          // No notification
        }
        else {
          serverRead = false;
          break; // No need to check other channels
        }

      }
    }
  }
  
  if (!serverRead) {
    makeServerUnread(guildUID, guildID);
  }
  else {
    makeServerRead(guildUID, guildID);
  }
}

function makeServerUnread(guildUID, guildID) {
  const valBefore = addPendingIndicator[`${guildUID + guildID}`];
  addPendingIndicator[`${guildUID + guildID}`] = true;
  const JQEL = $(`#${guildUID}${guildID}serverNotification`);

  if (mutedServers.includes(guildUID + guildID)) {
    JQEL.addClass('mutedNotification');
  }

  window.clearTimeout(indicatorTimeouts[guildUID + guildID]);

  JQEL.removeClass('invisibleOpacity');
  JQEL.removeClass('zoomOut');
  JQEL.removeClass('hidden');
  if (valBefore == false) { // No indicator previously,
    window.clearTimeout(indicatorTimeouts[guildUID + guildID + '2']);
    JQEL.removeClass('zoomOut');
    JQEL.addClass('zoomIn');

    indicatorTimeouts[guildUID + guildID + '2'] = window.setTimeout(() => {
      JQEL.removeClass('zoomIn');
    }, 699);
  }
  
  window.setTimeout(() => {
    sendToElectron('notificationBadges', $('.serverNotification:not(.hidden,.zoomOut,.invisible,.invisibleOpacity,.folderIndicator)').length);
  }, 199);

  checkFolderIndicator(guildUID, guildID)
}

function makeServerRead(guildUID, guildID, force) {
  addPendingIndicator[`${guildUID + guildID}`] = false;
  const JQEL = $(`#${guildUID}${guildID}serverNotification`);

  if (mutedServers.includes(guildUID + guildID)) {
    JQEL.addClass('mutedNotification');
  }

  JQEL.removeClass('zoomIn');
  JQEL.addClass('zoomOut');

  indicatorTimeouts[guildUID + guildID] = window.setTimeout(() => {
    JQEL.addClass('invisibleOpacity');
    JQEL.removeClass('zoomOut');
  }, 699)

  if (force) {
    window.setTimeout(() => {
      JQEL.addClass('hidden');
    }, 1)
  }

  window.setTimeout(() => {
    sendToElectron('notificationBadges', $('.serverNotification:not(.hidden,.zoomOut,.invisible,.invisibleOpacity,.folderIndicator)').length);
  }, 199);

  checkFolderIndicator(guildUID, guildID)
}

window.checkFolderINdicator2 = (guildUID, guildID) => {
  checkFolderIndicator(guildUID, guildID);
}

function checkFolderIndicator(guildUID, guildID, folderIDInput) {
  let folderID
  if (folderIDInput) {
    folderID = folderIDInput;
  }
  else {
    if (!$(`#${guildUID}${guildID}Server`).length) { return };

    // Check which folder the server is in
    const folderKey = $(`#${guildUID}${guildID}Server`).get(0).getAttribute('inFolder');
  
    if (!folderKey) { return };
  
    folderID = folderKey.split('<')[1];
  }

  let folderRead = true;
  $(`#guildFolderContent${folderID}`).children('.server').each((index, element) => {
    if (addPendingIndicator[`${$(element).get(0).getAttribute('guildUID')}${$(element).get(0).getAttribute('guildID')}`]) {
      folderRead = false;
      return false;
    }
  });

  console.log(folderRead);
  
  if (folderRead) {
    // Only if it's not already hidden
    if (!$(`#${folderID}FolderIndicator`).hasClass('invisibleOpacity')) {
      $(`#${folderID}FolderIndicator`).addClass('animated');
      $(`#${folderID}FolderIndicator`).removeClass('zoomIn');
      $(`#${folderID}FolderIndicator`).addClass('zoomOut');
      window.clearTimeout(indicatorTimeouts[folderID]);
      window.clearTimeout(indicatorTimeouts[folderID + '2']);
      indicatorTimeouts[folderID] = window.setTimeout(() => {
        $(`#${folderID}FolderIndicator`).addClass('invisibleOpacity');
        $(`#${folderID}FolderIndicator`).removeClass('zoomOut');
        $(`#${folderID}FolderIndicator`).removeClass('animated');
      }, 699);
    }
  }
  else {
    if ($(`#${folderID}FolderIndicator`).hasClass('invisibleOpacity') || $(`#${folderID}FolderIndicator`).hasClass('hidden')) {
      $(`#${folderID}FolderIndicator`).addClass('animated');
      $(`#${folderID}FolderIndicator`).removeClass('hidden');
      $(`#${folderID}FolderIndicator`).removeClass('invisibleOpacity');
      $(`#${folderID}FolderIndicator`).removeClass('zoomOut');
      $(`#${folderID}FolderIndicator`).addClass('zoomIn');
      window.clearTimeout(indicatorTimeouts[folderID]);
      window.clearTimeout(indicatorTimeouts[folderID + '2']);
      indicatorTimeouts[folderID + '2'] = window.setTimeout(() => {
        $(`#${folderID}FolderIndicator`).removeClass('zoomIn');
        $(`#${folderID}FolderIndicator`).removeClass('animated');
      }, 699);
    }
  }
}

export async function markServerRead(guildUID, guildID) {  
  // Go through all lounges and mark as read.
  for (let i = 0; i < serverData[guildUID + guildID].channels.length; i++) {
    const channelID = serverData[guildUID + guildID].channels[i].split('.')[0];
    if (addPendingIndicator[`${guildUID}${guildID}${channelID}`]) {
      markChannelAsRead(guildUID, guildID, channelID);
    }
  }

  checkServerUnread(guildUID, guildID);
}

window.muteServer = async (guildUID, guildID, showNotification) => {
  $(`#${guildUID}${guildID}serverNotification`).addClass('mutedNotificationTransition');
  $(`#${guildUID}${guildID}serverNotification`).removeClass('zoomIn');
  $(`#${guildUID}${guildID}serverNotification`).addClass('zoomOut');
  $(`#${guildUID}${guildID}MutedStatus`).addClass('disabled');

  await updateDoc(doc(db, `users/${user.uid}`), {
    mutedServers: arrayUnion(guildUID + guildID)
  });

  if (showNotification) {
    snac('Group Muted', '', 'success');
  }

  window.setTimeout(() => {
    $(`#${guildUID}${guildID}MutedStatus`).html('<i class="bx bx-bell-off"></i>');
    try {
      $(`#${guildUID}${guildID}MutedStatus`).get(0).onclick = () => unmuteServer(guildUID, guildID);
      $(`#${guildUID}${guildID}MutedStatus`).get(0)._tippy.setContent('Unmute Group'); 
    } catch (error) { }
    $(`#${guildUID}${guildID}MutedStatus`).removeClass('disabled');

    $(`#${guildUID}${guildID}serverNotification`).removeClass('mutedNotificationTransition');

    window.setTimeout(() => {
      sendToElectron('notificationBadges', $('.serverNotification:not(.hidden,.zoomOut,.invisible,.invisibleOpacity,.folderIndicator)').length);
    }, 199);
  }, 500)
}

window.unmuteServer = async (guildUID, guildID, showNotification) => {
  $(`#${guildUID}${guildID}serverNotification`).addClass('mutedNotificationTransition');

  checkServerUnread(guildUID, guildID);

  $(`#${guildUID}${guildID}MutedStatus`).addClass('disabled');

  await updateDoc(doc(db, `users/${user.uid}`), {
    mutedServers: arrayRemove(guildUID + guildID)
  });

  if (showNotification) {
    snac('Group Unmuted', '', 'success');
  }

  window.setTimeout(() => {
    $(`#${guildUID}${guildID}MutedStatus`).html('<i class="bx bx-bell"></i>')
    try {
      $(`#${guildUID}${guildID}MutedStatus`).get(0).onclick = () => muteServer(guildUID, guildID)
      $(`#${guildUID}${guildID}MutedStatus`).get(0)._tippy.setContent('Mute Group') 
    } catch (error) { }
    $(`#${guildUID}${guildID}MutedStatus`).removeClass('disabled')

    $(`#${guildUID}${guildID}serverNotification`).removeClass('mutedNotificationTransition');
  }, 800);
}

window.newGroupIcon = async (guildUID, guildID) => {
  $('#NewServerIconInput').off();
  document.getElementById("NewServerIconInput").files = null;
  $('#NewServerIconInput').change(async () => {
    if (!document.getElementById("NewServerIconInput").files.length) {
      return;
    }

    const fileInput = document.getElementById("NewServerIconInput").files[0];
    document.getElementById("NewServerIconInput").value = '';
    
    const file = await getCroppedPhoto(fileInput);

    const ext = file.name.split(".").pop();

    if (file.size > (12 * 1000000)) {
      snac(`File Size Error`, `Your file, ${file.name}, is too large. There is a 12MB limit on group icons.`, 'danger');
      return;
    }

    showUploadProgress();

    const uploadTask = uploadBytesResumable(storageRef(storage, `groups/${guildUID}/${guildID}/icon.${ext}`), file);

    uploadTask.on('state_changed', (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      $('#uploadProgressNumber').html(`Upload Progress: ${progress.toFixed(0)}%`);
    });

    uploadTask.then(async () => {
      hideUploadProgress();
      snac('Upload Success', 'Your group icon is being processed.', 'success')
      if (ext === 'png') {
        await updateDoc(doc(db, `users/${guildUID}/servers/${guildID}`), {
          url: `https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/groups%2F${guildUID}%2F${guildID}%2Ficon.png?alt=media&ts=${new Date().getTime()}`
        })
      }
    });
  });
  $('#NewServerIconInput').click();
}

async function updateGroupName(guildUID, guildID) {
  disableButton($(`#renameGuildConfirmButton`));
  const newName = $(`#newGroupRenameName`).val();

  if (newName.length > 35) {
    snac('Error', 'Your group name is too long. Try using a name under 35 characters instead.', 'danger');
    enableButton($(`#renameGuildConfirmButton`), 'Rename');
    return;
  }

  $(`#newGroupRenameName`).val('');

  await updateDoc(doc(db, `users/${guildUID}/servers/${guildID}`), {
    name: securityConfirmTextIDs(newName, true)
  });

  closeModal();

  snac('Group Name Updated', '', 'success');
}

window.prepareUpdateGroupName = (guildUID, guildID) => {
  openModal('renameGuild');

  $('#newGroupRenameName').get(0).addEventListener("keyup", function(event) {
    if (event.keyCode === 13) { event.preventDefault(); $('#renameGuildConfirmButton').get(0).click() }
  });

  $('#renameGuildConfirmButton').get(0).onclick = () => {
    updateGroupName(guildUID, guildID);
  }
}

window.removeGroupIcon = async (guildUID, guildID) => {
  if (!serverData[guildUID + guildID].url) {
    snac('No Icon', 'There is no currently active icon.');
    return;
  }

  await updateDoc(doc(db, `users/${guildUID}/servers/${guildID}`), {
    url: ''
  });

  snac('Icon Removed', '', 'success');
}

export async function demoteUser(guildID, userID) {
  await updateDoc(doc(db, `users/${user.uid}/servers/${guildID}`), {
    staff: arrayRemove(`${userID}`)
  });

  await remove(ref(rtdb, `servers/${user.uid}${guildID}/userData/${userID}`));

  snac('Demoted Member', '', 'success');
}

export async function promoteUser(guildID, userID) {
  await updateDoc(doc(db, `users/${user.uid}/servers/${guildID}`), {
    staff: arrayUnion(`${userID}`)
  });

  await update(ref(rtdb, `servers/${user.uid}${guildID}/userData`), {
    [userID]: true
  });

  snac('Promoted Member', '', 'success');
}

window.openMemberSearch = (guildUID, guildID) => {
  $(`#${guildUID}${guildID}guildChannelTitle`).addClass('hidden');
  $(`#${guildUID}${guildID}guildChannelTitleSearch`).removeClass('hidden');

  $(`#guildChannelSearchField${guildUID}${guildID}`).off();
  $(`#guildChannelSearchField${guildUID}${guildID}`).focus();

  $(`#guildChannelSearchField${guildUID}${guildID}`).on('keyup', (event) => {
    if (event.keyCode === 27) { closeMemberSearch(guildUID, guildID) } // If escape.
  })

  $(`#guildChannelSearchField${guildUID}${guildID}`).on('input', (event) => {
    const textValue = event.target.value.trim().toLowerCase();
    if (textValue.length) {
      $(`#${guildUID}${guildID}guildMemberListAll`).children('.guildMember').each((_index, obj) => {
        if ($(obj).get(0).getAttribute('userName').toLowerCase().includes(textValue)) {
          $(obj).removeClass('hidden');
        }
        else {
          $(obj).addClass('hidden');
        }
      });

      $(`#${guildUID}${guildID}guildMemberListStaff`).children('.guildMember').each((_index, obj) => {
        if ($(obj).get(0).getAttribute('userName').toLowerCase().includes(textValue)) {
          $(obj).removeClass('hidden');
        }
        else {
          $(obj).addClass('hidden');
        }
      });
    }
    else {
      $(`#${guildUID}${guildID}guildMemberListAll`).children('.guildMember').each((_index, obj) => {
        $(obj).removeClass('hidden');
      });
      $(`#${guildUID}${guildID}guildMemberListStaff`).children('.guildMember').each((_index, obj) => {
        $(obj).removeClass('hidden');
      });
    }
  });
}

window.closeMemberSearch = (guildUID, guildID) => {
  $(`#${guildUID}${guildID}guildChannelTitle`).removeClass('hidden');
  $(`#${guildUID}${guildID}guildChannelTitleSearch`).addClass('hidden');
  
  $(`#${guildUID}${guildID}guildMemberListAll`).children('.guildMember').each((_index, obj) => {
    $(obj).removeClass('hidden');
  });
   
  $(`#${guildUID}${guildID}guildMemberListStaff`).children('.guildMember').each((_index, obj) => {
    $(obj).removeClass('hidden');
  });
}

window.deleteGroup = (guildID, skipNotify) => {
  return new Promise(async (resolve, reject) => {
    if (!skipNotify) {
      const a = confirm(`Are you sure that you would like to delete this group?\n\nGroup ID: ${guildID}.\n\nThis action is irreversible.`)
      if (!a) { resolve(false) }
    }
    
    notifyTiny(`Deleting group...`, true)
    openSpecialServer('friends');

    const deleteGuild = httpsCallable(functions, "deleteGuild");
    const result = await deleteGuild({ guildUID: user.uid, guildID: guildID });

    snac('Group Deleted', '', 'success');
    resolve(true);
  });
}

async function clearServer(guildUID, guildID) {
  await updateDoc(doc(db, `users/${user.uid}`), {
    guilds: arrayRemove(`${guildUID}.${guildID}`)
  });

  if (guildUID == currentServerUser && guildID == currentServer) {
    openSpecialServer('friends');
  }
}

export function kickMember(guildID, userID, userName) {
  // Ask for confirmation.
  openModal('kickMember');
  $('#guildKickMemberConfirm').get(0).onclick = async () => {
    closeModal();

    await updateDoc(doc(db, `users/${user.uid}/servers/${guildID}`), {
      members: arrayRemove(`${userName}.${userID}`),
      staff: arrayRemove(`${userID}.${userName}`) 
    });
  }
}

export function prepareRenameGuildFolder(folderID, folderName) {
  openModal('renameFolder');
  $('#renameFolderName').val('')
  $('#renameFolderName').get(0).addEventListener("keyup", function(event) {
    if (event.keyCode === 13) { event.preventDefault(); $('#renameFolderButton').get(0).click(); }
  });
  $('#renameFolderButton').get(0).onclick = () => renameGuildFolderConfirm(`${folderID}`, `${folderName}`);
}

async function renameGuildFolderConfirm(folderID, folderName) {
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
  const cacheFolderData = cacheUser.guildFolders[`${folderName}<${folderID}`];

  deleteGuildPlaylistFolder(folderID, folderName, true, true);

  await updateDoc(doc(db, `users/${user.uid}`), {
    [`guildFolders.${newFolderName}<${folderID}`]: cacheFolderData
  });
}

export async function deleteGuildPlaylistFolder(folderID, folderName, skipNotify, keepSort) {
  if (keepSort) {
    await updateDoc(doc(db, `users/${user.uid}`), {
      [`guildFolders.${folderName}<${folderID}`]: deleteField(),
    });
  }
  else {
    await updateDoc(doc(db, `users/${user.uid}`), {
      [`guildFolders.${folderName}<${folderID}`]: deleteField(),
      playlistFoldersSort: arrayRemove(folderID)
    });
  }
  
  if (!skipNotify) {
    snac('Folder Deleted', '', 'success');
  }
}