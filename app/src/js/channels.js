import { getFirestore, deleteField, doc, updateDoc, serverTimestamp as dbts, arrayUnion, arrayRemove, runTransaction } from '@firebase/firestore';
import { getDatabase, off, remove, ref, get as rtdbget, query, endBefore, orderByKey, limitToLast, onChildAdded, onChildChanged, onChildRemoved, onValue, push, update, serverTimestamp as rtdbts} from '@firebase/database';
import { getStorage, ref as storageRef, uploadBytesResumable } from '@firebase/storage';
import { getFunctions, httpsCallable } from '@firebase/functions';
import { closeModal, disableButton, displayImageAnimation, displayInputEffect, enableButton, fileTypeMatches, hideUploadProgress, insertAtCursor, messageHTMLtoText, openModal, returnProperAttachmentURL, returnProperLinkThumbnail, scrollBottomMessages, searchGifs, securityConfirmText, showDroplet, showUploadProgress, switchViewsToContent, tConvert, timer } from './app';
import { endAllCalls, manageVoiceChatDisplay } from './voice';
import { clearQueueVCMusic, joinMusicParty, searchInChannel, skipTrackVCMusic } from './vcMusic';
import { addIndicator, checkServerUnread, removeIndicator } from './servers';
import { messageify } from './friends';
import { checkValidSubscription } from './stripe';
import { retrieveSetting, returnActiveDeviceIDOutput } from './settings';

import * as timeago from 'timeago.js';
import { playMessageSound } from './sounds';
import { checkAppInitialized } from './firebaseChecks';

window.activeVCMusicListener = '';
window.activePinnedListener = '';
window.activeMessageListener = '';
window.LatestMessageTimestamp = {};
window.PendingAttachments = {};
window.LatestMessagesPagination = {};
window.cachedPins = {};
window.loungeTypesCache = {};
window.channelTabLibrary = {};
window.cachedEditMessages = {};
window.channelPendingPlayers = {};
window.channelPlayers = {};

window.autocompleteTimeout = null; // Ping autocomplete.
window.autocompleteTimeout2 = null; // Ping list.
window.openPinnedCooldown = false;
window.pinnedMessagesTimeout = null;
window.messagePings = {};
window.autoCompleteOpen = {};
window.skipOptimisticEvaluation = false;
window.disableMessageSending = false;
window.channelPinnedOpen = false;
window.disablePagination = {};
window.completePagination = {};
window.pendingGif = null;

checkAppInitialized();
const db = getFirestore();
const rtdb = getDatabase();
const storage = getStorage();
const functions = getFunctions();

window.newGuildChannel = (guildUID, guildID) => {
  // Create a dialog with input. 
  openModal('newChannel');
  $('#newChannelName').val('')
  $('#newChannelName').get(0).addEventListener("keyup", function(event) {
    if (event.keyCode === 13) { event.preventDefault(); $('#newGuildChannelCreateButton').get(0).click(); }
  });
  $('#newGuildChannelCreateButton').get(0).onclick = () => newGuildChannelConfirm(`${guildUID}`, `${guildID}`);
}

window.newGuildQAChannel = (guildUID, guildID) => {
  // Create a dialog with input.
  openModal('newChannelQA');

  $('#newChannelQAName').val('')
  $('#newChannelQAName').get(0).addEventListener("keyup", function(event) {
    if (event.keyCode === 13) { event.preventDefault(); $('#newGuildChannelQACreateButton').get(0).click(); }
  });

  $(`#newGuildChannelQACreateButton`).get(0).onclick = () => {
    newGuildChannelQAConfirm(`${guildUID}`, `${guildID}`);
  }
}

async function newGuildChannelQAConfirm(guildUID, guildID) {
  const channelName = securityConfirmTextIDs($('#newChannelQAName').val(), true);

  if (channelName.length > 25) {
    snac('Invalid Lounge Name', 'Your channel name cannot be more than 25 characters.', 'danger');
    return;
  }
  
  closeModal();

  const channelID = `${new Date().getTime()}`; // Switch to current date.

  await updateDoc(doc(db, `users/${guildUID}/servers/${guildID}`), {
    channels: arrayUnion(`${channelID}.${channelName}.qa`),
    [`channelData.${channelID}`]: {
      disablePublicView: false,
      disablePublicEdit: false,
    }
  });

  await update(ref(rtdb, `servers/${guildUID}${guildID}/channelData/${channelID}`), {
    disablePublicView: false,
    disablePublicEdit: false,
  });
  
  await update(ref(rtdb, `servers/${guildUID}${guildID}`), {
    [channelID]: null
  });
}

async function newGuildChannelConfirm(guildUID, guildID) {
  const channelName = securityConfirmTextIDs($('#newChannelName').val(), true);

  if (channelName.length > 25) {
    snac('Invalid Lounge Name', 'Your lounge name cannot be more than 25 characters.', 'danger');
    return;
  }
  
  closeModal();

  const channelID = `${new Date().getTime()}`; // Switch to current date.

  await updateDoc(doc(db, `users/${guildUID}/servers/${guildID}`), {
    channels: arrayUnion(`${channelID}.${channelName}`),
    [`channelData.${channelID}`]: {
      disablePublicView: false,
      disablePublicEdit: false,
    }
  });

  await update(ref(rtdb, `servers/${guildUID}${guildID}/channelData/${channelID}`), {
    disablePublicView: false,
    disablePublicEdit: false,
  });
  
  await update(ref(rtdb, `servers/${guildUID}${guildID}`), {
    [channelID]: null
  });
}

window.modifyChannelTab = (guildUID, guildID, channelID, grouping) => {
  const scopedActiveChannel = `${guildUID}${guildID}${channelID}`;
  $(`.${scopedActiveChannel}TabItem`).removeClass('tabButtonActive');
  $(`#${scopedActiveChannel}TabItem${grouping}`).addClass('tabButtonActive');

  $(`.${scopedActiveChannel}TabView`).addClass('hidden');
  $(`#${scopedActiveChannel}TabView${grouping}`).removeClass('hidden');

  channelTabLibrary[scopedActiveChannel] = grouping;
  $(`#${scopedActiveChannel}pinnedMessagesButton`).removeClass('invisibleOpacityAnimated');
  $(`#${scopedActiveChannel}LoadMoreMessagesButton`).removeClass('invisibleOpacityAnimated');

  if (grouping == 'Chat' && addPendingIndicator[scopedActiveChannel]) { // Its chat & unread
    markChannelAsRead(guildUID, guildID, channelID);
    window.setTimeout(() => {
      $(`#${scopedActiveChannel}ChatMessageInput`).get(0).focus();
    }, 150);
  }
  else if (grouping == "Chat") { // Its chat
    $(`#${scopedActiveChannel}ChatMessageInput`).get(0).focus();
  }
  else { // Its not chat.
    $(`#${scopedActiveChannel}pinnedMessagesButton`).addClass('invisibleOpacityAnimated');
    $(`#${scopedActiveChannel}LoadMoreMessagesButton`).addClass('invisibleOpacityAnimated');
  }

  if (grouping == 'Music') {
    $(`#${scopedActiveChannel}SongSearchInput`).get(0).focus();
  }
}

window.openServerSettings = ((guildUID, guildID) => {
  closeCurrentChannel();
  currentChannel = `${guildUID}${guildID}Settings`;

  $(`#${guildUID}${guildID}Settings`).removeClass('hidden');
  $(`#${guildUID}${guildID}Settings`).addClass(`${guildUID}${guildID}guildChannelViewActive`);
});

export async function openGuildChannel(guildUID, guildID, channelID, channelName, channelType) {
  if (currentChannel == channelID) {
    return;
  }

  currentChannel = channelID;

  const scopedActiveChannel = guildUID + guildID + channelID; // Temporary.

  if (window.innerWidth < 600) {
    switchViewsToContent()
  }

  // Clear messages.
  try { $(`#${scopedActiveChannel}ChatMessages`).find('.chatMessage').remove() } catch (error) { };
  
  closeCurrentChannel()
  currentChannel = channelID; // Set agin.
  
  $(`#${scopedActiveChannel}guildChannelElement`).addClass('guildChannelActive');
  $(`#${scopedActiveChannel}guildChannelElement`).addClass(`${guildUID}${guildID}guildChannelActive`);
  
  $(`#${scopedActiveChannel}guildChannel`).addClass(`${guildUID}${guildID}guildChannelViewActive`);
  $(`#${scopedActiveChannel}guildChannel`).removeClass('hidden');

  if (channelID.toLowerCase().includes('settings')) { resolve(false); return; } // Ignore settings channel.

  if ($(`#${scopedActiveChannel}guildChannel`).children().length) {
    addChannelListeners(guildUID, guildID, channelID, true, channelType);
    manageVoiceChatDisplay(guildUID, guildID, channelID, undefined);
    $(`#${scopedActiveChannel}ChatMessageInput`).get(0).focus();
    reevaluatePermissionsChannel(guildUID, guildID, channelID);
    updateLoungeTypes(guildUID, guildID, channelID, serverData[guildUID + guildID].channelData ? serverData[guildUID + guildID].channelData[channelID] : {});
    modifyChannelTab(guildUID, guildID, channelID, 'Chat');
    return;
  }

  // Not built.
  channelTabLibrary[scopedActiveChannel] = 'Chat';

  if (channelType == "qa") {
    $(`#${scopedActiveChannel}guildChannel`).html(`
      <div class="channelPrimaryGrid ${scopedActiveChannel}Grid channelPrimaryGridQa" id="${scopedActiveChannel}PrimaryGrid">
      <div id="${scopedActiveChannel}DropTarget" class="dropTarget animated fadeIn faster">
        <button onclick="$('#${scopedActiveChannel}DropTarget').css('display', '')" class="btn b-1 dropTargetButton"><i class="bx bx-x"></i></button>
      </div>
      <div class="channelTabListBanner">
        <div>
          <button onclick="modifyChannelTab('${guildUID}', '${guildID}', '${channelID}', 'Chat')" id="${scopedActiveChannel}TabItemChat" class="btn tabButton tabButtonActive ${scopedActiveChannel}TabItem roundedButton"><i class='bx bx-chat'></i></button>
          <div id="${scopedActiveChannel}channelTabIndicator" class="channelTabIndicator animated invisible"></div>
          <button onclick="loadMoreChannelMessages('${guildUID}', '${guildID}', '${channelID}', '${channelType}')" class="btn tabButton roundedButton" id="${scopedActiveChannel}LoadMoreMessagesButton"><i class="bx bx-up-arrow-alt"></i></button>
          <button onclick="openChannelPinned('${scopedActiveChannel}')" class="btn tabButton roundedButton pinnedButton" id="${scopedActiveChannel}pinnedMessagesButton"><i class="bx bx-pin"></i></button>
        </div>
        <h3 class="guildChannelViewTitle" id="${scopedActiveChannel}guildChannelViewTitle">${securityConfirmTextIDs(channelName, true)}</h3>
        <div>
          <button onclick="openChannelPinned('${scopedActiveChannel}')" class="btn tabButton roundedButton invisible" id="${scopedActiveChannel}pinnedMessagesButtonCounterpoart"><i class="bx bx-pin"></i></button>
          <button onclick="modifyChannelTab('${guildUID}', '${guildID}', '${channelID}', 'Music')" id="${scopedActiveChannel}TabItemMusic" class="btn hidden tabButton ${scopedActiveChannel}TabItem roundedButton invisibleOpacityAnimated musicButton"><i class='bx bx-music'></i></button>
          <div class="dropdown">
            <button onclick="openDropdown('${scopedActiveChannel}SettingsChannelDropdown')" id="${scopedActiveChannel}TabItemSettings" class="btn tabButton ${scopedActiveChannel}TabItem roundedButton dropdownButton"><i class='bx bx-cog'></i></button>
            <div id="${scopedActiveChannel}SettingsChannelDropdown" class="dropdown-content dropdownContentAlignedRight">
              <a id="channelMarkButton${scopedActiveChannel}" class="btn"></a>
              <a id="${scopedActiveChannel}channelMuteButton" class="btn"></a>
              <div id="${scopedActiveChannel}channelSettingsDivider1" class="dropdownDivider"></div>
              <a id="channelRenameButton${scopedActiveChannel}" class="btn">Rename Lounge</a>
              <a id="channelDeleteButton${scopedActiveChannel}" class="btn">Delete Lounge</a>
              <div id="${scopedActiveChannel}channelSettingsDivider2" class="dropdownDivider"></div>
              <a id="disablePublicView${scopedActiveChannel}" class="btn"></a>
              <a id="disablePublicEdit${scopedActiveChannel}" class="btn"></a>
            </div>
          </div>
        </div>
      </div>  
      <div id="${scopedActiveChannel}TabViewChat" class="${scopedActiveChannel}TabView ${scopedActiveChannel}TabView messagesContainerTabView">
        <div id="${scopedActiveChannel}PingSelect" class="pingselect faster animated hidden">
        <button onclick="closePingSelector('${scopedActiveChannel}')" class="btn b-2 closePingButton animated zoomIn"><i class="bx bx-x"></i></button>
          <div class="form formLabelFix"><div>
            <label for="${scopedActiveChannel}ChatMessageInputAutocomplete">Username:</label>
            <input autocomplete="off" text="text" id="${scopedActiveChannel}ChatMessageInputAutocomplete"> </input>
          </div></div>
          <div id="${scopedActiveChannel}AutoCompleteResults" class="autocompleteResults"></div>
        </div>
        <div id="${scopedActiveChannel}PaginationPreview" class="hidden"></div>
        <div id="${scopedActiveChannel}ChatMessages" class="${scopedActiveChannel}ChatMessages chatMessageContainer">
          <div class="emptyChannel animated fadeIn hidden" id="emptyChannel${scopedActiveChannel}"><i class='bx bx-file-blank animated pulse infinite fast' ></i><br><b>No Questions</b><p>Be the first to ask a question!</p></div>
        </div>
        <center id="${scopedActiveChannel}CenterElement">
          <div id="${scopedActiveChannel}PingAutocomplete" class="pingautocomplete animated fadeInUp faster hidden"></div>
          <div class="AttachmentManager hidden" id="${scopedActiveChannel}AttachmentManager">
            <div class="AttachmentManagerContent hidden animated faster" id="${scopedActiveChannel}AttachmentManagerContent"> </div>
          </div>
          <div class="gifsPickerContainer gifPicker preStandardAnimationBottom hidden" id="${scopedActiveChannel}gifsPickerContainer">
            <div class="gifsPickerContainerHeader gifPicker">
              <div class="gifsHeaderTitle gifPicker">GIFs</div>
              <button id="closeGifsButton${scopedActiveChannel}" class="btn b-3 roundedButton"><i class="bx bx-x"></i></button>
            </div>
            
            <div class="gifsPickerContent">
              <!-- Search Box -->
              <div class="gifsPickerSearchContainer gifPicker">
                <input autocomplete="off" type="text" id="gifsPickerSearchBox${scopedActiveChannel}" class="gifsPickerSearchBoxInput gifPicker" placeholder="Search GIFs">
                <i class="bx bx-search"></i>
              </div>
      
              <!-- GIFs -->
              <div class="gifsPickerGifsContainer gifPicker">
                <div id="${scopedActiveChannel}gifsPickerGifsContainerTrending" class="gifsPickerGifsContainerTrending gifPicker hidden"> </div>
                <div id="${scopedActiveChannel}gifsPickerGifsContainerSearch" class="gifsPickerGifsContainerSearch gifPicker"> </div>
                <p class="poweredByTenor">Powered by Tenor.</p>
              </div>
            </div>
          </div>
          <div class="emojiPickerContainer preStandardAnimationBottom hidden" id="${scopedActiveChannel}emojiPickerContainer"></div>
          <div class="pinnedMessagesContainer preStandardAnimation hidden" id="${scopedActiveChannel}pinnedMessagesContainer">
            <div class="pinnedHeader">
              <div class="pinnedHeaderTitle">Pinned Messages</div>
              <div>
                <button id="closePinnedButton${scopedActiveChannel}" class="btn b-3 roundedButton"><i class="bx bx-x"></i></button>
              </div>
            </div>
            <div class="pinnedMessages" id="${scopedActiveChannel}pinnedMessages"></div>
            <div id="emptyPinned${scopedActiveChannel}" class="noPinned"><h2><i class="bx bx-pin"></i></h2>No pinned messages.</div>
          </div>
        </center>
        <div class="chatMessageBar channelChatMessageBar" id="${scopedActiveChannel}ChatMessageBar">
          <div class="form"><div>
            <label for="${scopedActiveChannel}ChatMessageInput" id="messageLabel${scopedActiveChannel}">Ask a question:</label>
            <input autocomplete="off" text="text" id="${scopedActiveChannel}ChatMessageInput"> </input>
          </div></div>
          <div class="quickActions">
            <button class="btn b-0 roundedButton gifPicker" id="gifsButton${scopedActiveChannel}" onclick="openGifPicker('${scopedActiveChannel}')"><i class="bx bx-search-alt gifPicker"></i></button>
            <button class="btn b-0 roundedButton emojiButton" id="emojiButton${scopedActiveChannel}" onclick="openEmojiPicker('${scopedActiveChannel}')">😺</button>
            <button class="btn b-0 roundedButton" id="${scopedActiveChannel}AttachmentButton" onclick="addAttachment('${scopedActiveChannel}', '${channelType}')"><i class='bx bxs-file-plus'></i></button>
            <button class="btn b-1 roundedButton" id="${scopedActiveChannel}SendMessageButton" onclick="sendChannelChatMessage('${guildUID}','${guildID}', '${channelID}')"><i class='bx bx-send bx-rotate-270'></i></button>
          </div>
        </div>
      </div>
      <div id="${scopedActiveChannel}TabViewMusic" class="hidden ${scopedActiveChannel}TabView musicContainerTabView musicContainerTabViewNonChat">
        <div id="channelMusicQueue${scopedActiveChannel}" class="channelMusicQueue">
          <audio class="channelMusicAudio" id="channelMusicAudio${scopedActiveChannel}"></audio>
          <h3 id="connectedUsersText${scopedActiveChannel}">Connected Users</h3>
          <div class="connectedUsersContainer" id="connectedUsersContainer${scopedActiveChannel}"></div>
          <h3>Music Volume</h3>
          <input type="range" min="0" max="100" value="100" class="slider" oninput="updateVolumeFromSlider('${scopedActiveChannel}')" id="sliderOnMusicVolume${scopedActiveChannel}" class="sliderOnMusicVolume" />
          <h3 id="${scopedActiveChannel}NowPlayingText"><span style="color: var(--secondary)">Nothing Playing</span></h3>
          <div id="channelMusicNowPlayingContent${scopedActiveChannel}" class="nowPlayingContent"></div>
          <h3 id="channelQueueText${scopedActiveChannel}">Queue</h3>
          <div id="channelMusicQueueContent${scopedActiveChannel}" class="channelQueueContainer"> </div>  
        </div>

        <div class="musicAdminBar" id="${scopedActiveChannel}musicAdminBar">
          <button id="${scopedActiveChannel}musicAdminClearQueue" class="btn b-1 roundedButton"><i class="bx bx-trash-alt"></i></button>
          <button id="${scopedActiveChannel}musicAdminFastForward" class="btn b-1 roundedButton"><i class="bx bx-fast-forward"></i></button>
        </div>

        <button id="searchResultsCloseButton${scopedActiveChannel}" onclick="closeChannelSearchResults('${scopedActiveChannel}')" class="btn b-1 closeChannelSearchButton animated faster hidden"><i class="bx bx-x"></i></button>
        <div id="searchResults${scopedActiveChannel}" class="channelMusicSearchResults animated faster hidden"> </div>
        <div class="searchResultsChannelForm" id="${scopedActiveChannel}searchResultsChannelForm">
          <div class="form formLabelFix"><div>
            <label for="${scopedActiveChannel}SongSearchInput">Add to queue:</label>
            <input autocomplete="off" text="text" id="${scopedActiveChannel}SongSearchInput"> </input>
          </div></div>
        </div>
      </div>
    </div>
    <div class="channelSecondaryGrid hidden" id="channelSecondaryGrid${scopedActiveChannel}">
      <div class="voiceSectionHeader">
        <h3 class="guildChannelViewTitle">Voice</h3>
      </div>
      <div id="${scopedActiveChannel}channelSecondaryGridContent" class="channelSecondaryGridContent">
        <div id="${scopedActiveChannel}VoiceList" class="voiceChatList ${scopedActiveChannel}VCList"> </div>
        <div class="voiceChatButtonsContainer">
          <button class="btn b-1 voiceChannelJoin musicPartyJoin" id="${scopedActiveChannel}musicPartyButton"> <i class="bx bx-music"></i></button>
          <button class="btn b-1 voiceChannelJoin" id="${scopedActiveChannel}voiceChatButton"> <i class="bx bx-phone"></i></button>
          <button class="btn b-1 voiceChannelJoin voiceChannelJoinStopWatching hidden" id="${scopedActiveChannel}voiceChatStopWatchingButton"> <i class="bx bx-window-close"></i></button>
        </div>
      </div>
    </div>

    <div class="channelMediaContainer hidden" id="${scopedActiveChannel}channelMediaContainer">
      <div class="channelMediaHeader">
        <h3 class="guildChannelViewTitle" id="mediaGuildChannelViewTitle${scopedActiveChannel}"></h3>
      </div>
      <div class="verticalContainerFill"></div>
      <video controls id="${scopedActiveChannel}channelMediaVideo"></video>
      <div class="verticalContainerFill"></div>
      <div class="channelMediaFooter">
        <div id="${scopedActiveChannel}WatchingUsers" class="watchingUsersContainer"></div>
        <button class="btn b-1 voiceChannelMediaLeave" id="${scopedActiveChannel}voiceChatStopWatchingButton2"> <i class="bx bx-window-close"></i></button>
        <div id="${scopedActiveChannel}MediaWatching" class="numWatchingText"></div>
      </div>
    </div>
    `);
  }
  else { // Chat channel.
    $(`#${scopedActiveChannel}guildChannel`).html(`
      <div class="channelPrimaryGrid ${scopedActiveChannel}Grid" id="${scopedActiveChannel}PrimaryGrid">
        <div id="${scopedActiveChannel}DropTarget" class="dropTarget animated fadeIn faster">
          <button onclick="$('#${scopedActiveChannel}DropTarget').css('display', '')" class="btn b-1 dropTargetButton"><i class="bx bx-x"></i></button>
        </div>
        <div class="channelTabListBanner">
          <div>
            <button onclick="modifyChannelTab('${guildUID}', '${guildID}', '${channelID}', 'Chat')" id="${scopedActiveChannel}TabItemChat" class="btn tabButton tabButtonActive ${scopedActiveChannel}TabItem roundedButton"><i class='bx bx-chat'></i></button>
            <div id="${scopedActiveChannel}channelTabIndicator" class="channelTabIndicator animated invisible"></div>
            <button onclick="loadMoreChannelMessages('${guildUID}', '${guildID}', '${channelID}', '${channelType}')" class="btn tabButton roundedButton" id="${scopedActiveChannel}LoadMoreMessagesButton"><i class="bx bx-up-arrow-alt"></i></button>
            <button onclick="openChannelPinned('${scopedActiveChannel}')" class="btn tabButton roundedButton pinnedButton" id="${scopedActiveChannel}pinnedMessagesButton"><i class="bx bx-pin"></i></button>
          </div>
          <h3 class="guildChannelViewTitle" id="${scopedActiveChannel}guildChannelViewTitle">${securityConfirmTextIDs(channelName, true)}</h3>
          <div>
            <button onclick="openChannelPinned('${scopedActiveChannel}')" class="btn tabButton roundedButton invisible" id="${scopedActiveChannel}pinnedMessagesButtonCounterpoart"><i class="bx bx-pin"></i></button>
            <button onclick="modifyChannelTab('${guildUID}', '${guildID}', '${channelID}', 'Music')" id="${scopedActiveChannel}TabItemMusic" class="btn tabButton ${scopedActiveChannel}TabItem roundedButton invisibleOpacityAnimated musicButton"><i class='bx bx-music'></i></button>
            <div class="dropdown">
              <button onclick="openDropdown('${scopedActiveChannel}SettingsChannelDropdown')" id="${scopedActiveChannel}TabItemSettings" class="btn tabButton ${scopedActiveChannel}TabItem roundedButton dropdownButton"><i class='bx bx-cog'></i></button>
              <div id="${scopedActiveChannel}SettingsChannelDropdown" class="dropdown-content">
                <a id="channelMarkButton${scopedActiveChannel}" class="btn"></a>
                <a id="${scopedActiveChannel}channelMuteButton" class="btn"></a>
                <div id="${scopedActiveChannel}channelSettingsDivider1" class="dropdownDivider"></div>
                <a id="channelRenameButton${scopedActiveChannel}" class="btn">Rename Lounge</a>
                <a id="channelDeleteButton${scopedActiveChannel}" class="btn">Delete Lounge</a>
                <div id="${scopedActiveChannel}channelSettingsDivider2" class="dropdownDivider"></div>
                <a id="disablePublicView${scopedActiveChannel}" class="btn"></a>
                <a id="disablePublicEdit${scopedActiveChannel}" class="btn"></a>
              </div>
            </div>
          </div>
        </div>  
        <div id="${scopedActiveChannel}TabViewChat" class="${scopedActiveChannel}TabView ${scopedActiveChannel}TabView messagesContainerTabView">
          <div id="${scopedActiveChannel}PingSelect" class="pingselect faster animated hidden">
          <button onclick="closePingSelector('${scopedActiveChannel}')" class="btn b-2 closePingButton animated zoomIn"><i class="bx bx-x"></i></button>
            <div class="form formLabelFix"><div>
              <label for="${scopedActiveChannel}ChatMessageInputAutocomplete">Username:</label>
              <input autocomplete="off" text="text" id="${scopedActiveChannel}ChatMessageInputAutocomplete"> </input>
            </div></div>
            <div id="${scopedActiveChannel}AutoCompleteResults" class="autocompleteResults"></div>
          </div>
          <div id="${scopedActiveChannel}PaginationPreview" class="hidden"></div>
          <div id="${scopedActiveChannel}ChatMessages" class="${scopedActiveChannel}ChatMessages chatMessageContainer">
            <div class="emptyChannel animated fadeIn hidden" id="emptyChannel${scopedActiveChannel}"><i class='bx bx-file-blank animated pulse infinite fast' ></i><br><b>No Messages</b><p>Be the first to send a message!</p></div>
          </div>
          <center id="${scopedActiveChannel}CenterElement">
            <div id="${scopedActiveChannel}PingAutocomplete" class="pingautocomplete animated fadeInUp faster hidden"></div>
            <div class="AttachmentManager hidden" id="${scopedActiveChannel}AttachmentManager">
              <div class="AttachmentManagerContent hidden animated faster" id="${scopedActiveChannel}AttachmentManagerContent"> </div>
            </div>
            <div class="gifsPickerContainer gifPicker preStandardAnimationBottom hidden" id="${scopedActiveChannel}gifsPickerContainer">
              <div class="gifsPickerContainerHeader gifPicker">
                <div class="gifsHeaderTitle gifPicker">GIFs</div>
                <button id="closeGifsButton${scopedActiveChannel}" class="btn b-3 roundedButton"><i class="bx bx-x"></i></button>
              </div>
              
              <div class="gifsPickerContent">
                <!-- Search Box -->
                <div class="gifsPickerSearchContainer gifPicker">
                  <input autocomplete="off" type="text" id="gifsPickerSearchBox${scopedActiveChannel}" class="gifsPickerSearchBoxInput gifPicker" placeholder="Search GIFs">
                  <i class="bx bx-search"></i>
                </div>
        
                <!-- GIFs -->
                <div class="gifsPickerGifsContainer gifPicker">
                  <div id="${scopedActiveChannel}gifsPickerGifsContainerTrending" class="gifsPickerGifsContainerTrending gifPicker hidden"> </div>
                  <div id="${scopedActiveChannel}gifsPickerGifsContainerSearch" class="gifsPickerGifsContainerSearch gifPicker"> </div>
                  <p class="poweredByTenor">Powered by Tenor.</p>
                </div>
              </div>
            </div>
            <div class="emojiPickerContainer preStandardAnimationBottom hidden" id="${scopedActiveChannel}emojiPickerContainer"></div>
            <div class="pinnedMessagesContainer preStandardAnimation hidden" id="${scopedActiveChannel}pinnedMessagesContainer">
              <div class="pinnedHeader">
                <div class="pinnedHeaderTitle">Pinned Messages</div>
                <div>
                  <button id="closePinnedButton${scopedActiveChannel}" class="btn b-3 roundedButton"><i class="bx bx-x"></i></button>
                </div>
              </div>
              <div class="pinnedMessages" id="${scopedActiveChannel}pinnedMessages"></div>
              <div id="emptyPinned${scopedActiveChannel}" class="noPinned"><h2><i class="bx bx-pin"></i></h2>No pinned messages.</div>
            </div>
          </center>
          <div class="chatMessageBar channelChatMessageBar" id="${scopedActiveChannel}ChatMessageBar">
            <div class="form"><div>
              <label for="${scopedActiveChannel}ChatMessageInput" id="messageLabel${scopedActiveChannel}">Send a message:</label>
              <input autocomplete="off" text="text" id="${scopedActiveChannel}ChatMessageInput"> </input>
            </div></div>
            <div class="quickActions">
              <button class="btn b-0 roundedButton gifPicker" id="gifsButton${scopedActiveChannel}" onclick="openGifPicker('${scopedActiveChannel}')"><i class="bx bx-search-alt gifPicker"></i></button>
              <button class="btn b-0 roundedButton emojiButton" id="emojiButton${scopedActiveChannel}" onclick="openEmojiPicker('${scopedActiveChannel}')">😺</button>
              <button class="btn b-0 roundedButton" id="${scopedActiveChannel}AttachmentButton" onclick="addAttachment('${scopedActiveChannel}, '${channelType}')"><i class='bx bxs-file-plus'></i></button>
              <button class="btn b-1 roundedButton" id="${scopedActiveChannel}SendMessageButton" onclick="sendChannelChatMessage('${guildUID}','${guildID}', '${channelID}')"><i class='bx bx-send bx-rotate-270'></i></button>
            </div>
          </div>
        </div>
        <div id="${scopedActiveChannel}TabViewMusic" class="hidden ${scopedActiveChannel}TabView musicContainerTabView musicContainerTabViewNonChat">
          <div id="channelMusicQueue${scopedActiveChannel}" class="channelMusicQueue">
            <audio class="channelMusicAudio" id="channelMusicAudio${scopedActiveChannel}"></audio>
            <h3 id="connectedUsersText${scopedActiveChannel}">Connected Users</h3>
            <div class="connectedUsersContainer" id="connectedUsersContainer${scopedActiveChannel}"></div>
            <h3>Music Volume</h3>
            <input type="range" min="0" max="100" value="100" class="slider" oninput="updateVolumeFromSlider('${scopedActiveChannel}')" id="sliderOnMusicVolume${scopedActiveChannel}" class="sliderOnMusicVolume" />
            <h3 id="${scopedActiveChannel}NowPlayingText"><span style="color: var(--secondary)">Nothing Playing</span></h3>
            <div id="channelMusicNowPlayingContent${scopedActiveChannel}" class="nowPlayingContent"></div>
            <h3 id="channelQueueText${scopedActiveChannel}">Queue</h3>
            <div id="channelMusicQueueContent${scopedActiveChannel}" class="channelQueueContainer"> </div>  
          </div>

          <div class="musicAdminBar" id="${scopedActiveChannel}musicAdminBar">
            <button id="${scopedActiveChannel}musicAdminClearQueue" class="btn b-1 roundedButton"><i class="bx bx-trash-alt"></i></button>
            <button id="${scopedActiveChannel}musicAdminFastForward" class="btn b-1 roundedButton"><i class="bx bx-fast-forward"></i></button>
          </div>

          <button id="searchResultsCloseButton${scopedActiveChannel}" onclick="closeChannelSearchResults('${scopedActiveChannel}')" class="btn b-1 closeChannelSearchButton animated faster hidden"><i class="bx bx-x"></i></button>
          <div id="searchResults${scopedActiveChannel}" class="channelMusicSearchResults animated faster hidden"> </div>
          <div class="searchResultsChannelForm" id="${scopedActiveChannel}searchResultsChannelForm">
            <div class="form formLabelFix"><div>
              <label for="${scopedActiveChannel}SongSearchInput">Add to queue:</label>
              <input autocomplete="off" text="text" id="${scopedActiveChannel}SongSearchInput"> </input>
            </div></div>
          </div>
        </div>
      </div>

      <div class="channelSecondaryGrid" id="channelSecondaryGrid${scopedActiveChannel}">
        <div class="voiceSectionHeader">
          <h3 class="guildChannelViewTitle">Voice</h3>
        </div>
        <div id="${scopedActiveChannel}channelSecondaryGridContent" class="channelSecondaryGridContent">
          <div id="${scopedActiveChannel}VoiceList" class="voiceChatList ${scopedActiveChannel}VCList"> </div>
          <div class="voiceChatButtonsContainer">
            <button class="btn b-1 voiceChannelJoin musicPartyJoin" id="${scopedActiveChannel}musicPartyButton"> <i class="bx bx-music"></i></button>
            <button class="btn b-1 voiceChannelJoin" id="${scopedActiveChannel}voiceChatButton"> <i class="bx bx-phone"></i></button>
            <button class="btn b-1 voiceChannelJoin voiceChannelJoinStopWatching hidden" id="${scopedActiveChannel}voiceChatStopWatchingButton"> <i class="bx bx-window-close"></i></button>
          </div>
        </div>
      </div>

      <div class="channelMediaContainer" id="${scopedActiveChannel}channelMediaContainer">
        <div class="channelMediaHeader">
          <h3 class="guildChannelViewTitle" id="mediaGuildChannelViewTitle${scopedActiveChannel}"></h3>
        </div>
        <div class="verticalContainerFill"></div>
        <video controls id="${scopedActiveChannel}channelMediaVideo"></video>
        <div class="verticalContainerFill"></div>
        <div class="channelMediaFooter">
          <div id="${scopedActiveChannel}WatchingUsers" class="watchingUsersContainer"></div>
          <button class="btn b-1 voiceChannelMediaLeave" id="${scopedActiveChannel}voiceChatStopWatchingButton2"> <i class="bx bx-window-close"></i></button>
          <div id="${scopedActiveChannel}MediaWatching" class="numWatchingText"></div>
        </div>
      </div>
    `);
  }

  twemoji.parse($(`#${scopedActiveChannel}guildChannelViewTitle`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });
  
  $(`#channelMusicAudio${scopedActiveChannel}`).get(0).volume = parseInt(retrieveSetting('defaultVolume', '100')) / 100;
  $(`#channelMusicAudio${scopedActiveChannel}`).get(0).setSinkId(returnActiveDeviceIDOutput());
  $(`#sliderOnMusicVolume${scopedActiveChannel}`).get(0).value = retrieveSetting('defaultVolume', '100');
  
  twemoji.parse($(`#emojiButton${scopedActiveChannel}`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });

  if (mutedServers.includes(`${scopedActiveChannel}`)) {
    $(`#${scopedActiveChannel}channelMuteButton`).html(`Unmute Lounge`);
    $(`#${scopedActiveChannel}channelMuteButton`).get(0).onclick = () => unmuteChannel(guildUID, guildID, channelID);
  }
  else {
    $(`#${scopedActiveChannel}channelMuteButton`).html(`Mute Lounge`);
    $(`#${scopedActiveChannel}channelMuteButton`).get(0).onclick = () => muteChannel(guildUID, guildID, channelID);
  }

  tippy($(`#${scopedActiveChannel}musicAdminClearQueue`).get(0), {
    content: 'Clear Queue',
    placement: 'top',
  });

  $(`#${scopedActiveChannel}musicAdminClearQueue`).get(0).onclick = () => clearQueueVCMusic(guildUID, guildID, channelID);

  tippy($(`#${scopedActiveChannel}musicAdminFastForward`).get(0), {
    content: 'Skip Track',
    placement: 'top',
  });

  $(`#${scopedActiveChannel}musicAdminFastForward`).get(0).onclick = () => skipTrackVCMusic(guildUID, guildID, channelID);

  tippy($(`#gifsButton${scopedActiveChannel}`).get(0), {
    content: `GIFs`,
    placement: 'top',
  });

  tippy($(`#emojiButton${scopedActiveChannel}`).get(0), {
    content: `Emojis`,
    placement: 'top',
  });

  tippy($(`#${scopedActiveChannel}AttachmentButton`).get(0), {
    content: `Add Attachment`,
    placement: 'top',
  });

  tippy($(`#${scopedActiveChannel}SendMessageButton`).get(0), {
    content: `Send`,
    placement: 'top',
  });

  tippy($(`#${scopedActiveChannel}musicPartyButton`).get(0), {
    content: 'Join Listening Party',
    placement: 'top',
  });

  tippy($(`#${scopedActiveChannel}voiceChatButton`).get(0), {
    content: 'Join Voice',
    placement: 'top',
  });

  tippy($(`#${scopedActiveChannel}voiceChatStopWatchingButton`).get(0), {
    content: 'Stop Watching',
    placement: 'top',
  });

  tippy($(`#${scopedActiveChannel}voiceChatStopWatchingButton2`).get(0), {
    content: 'Stop Watching',
    placement: 'top',
  });

  tippy($(`#${scopedActiveChannel}pinnedMessagesButton`).get(0), {
    content: 'Pinned Messages',
    placement: 'top',
  });

  tippy($(`#closePinnedButton${scopedActiveChannel}`).get(0), {
    content: 'Close',
    placement: 'top',
  });

  tippy($(`#closeGifsButton${scopedActiveChannel}`).get(0), {
    content: 'Close',
    placement: 'top',
  });

  if (addPendingIndicator[scopedActiveChannel]) {
    $(`#channelMarkButton${scopedActiveChannel}`).html(`Mark as Read`);
    $(`#channelMarkButton${scopedActiveChannel}`).get(0).onclick = () => markChannelAsRead(guildUID, guildID, channelID);
  }
  else {
    $(`#channelMarkButton${scopedActiveChannel}`).html(`Mark as Unread`);
    $(`#channelMarkButton${scopedActiveChannel}`).get(0).onclick = () => markChannelAsUnread(guildUID, guildID, channelID);
  }

  $(`#channelRenameButton${scopedActiveChannel}`).get(0).onclick = () => {
    renameLoungePrepare(guildUID, guildID, channelID);
  }

  $(`#channelDeleteButton${scopedActiveChannel}`).get(0).onclick = () => {
    deleteLoungePrepare(guildUID, guildID, channelID, channelName);
  }

  tippy($(`#${scopedActiveChannel}LoadMoreMessagesButton`).get(0), {
    content: 'Load More',
    placement: 'top'
  });

  tippy($(`#${scopedActiveChannel}TabItemMusic`).get(0), {
    content: 'Music',
    placement: 'top'
  });

  tippy($(`#${scopedActiveChannel}TabItemChat`).get(0), {
    content: 'Messages',
    placement: 'top'
  });

  tippy($(`#${scopedActiveChannel}TabItemSettings`).get(0), {
    content: 'Settings',
    placement: 'top'
  });

  // Drag & Drop
  $(`#${scopedActiveChannel}DropTarget`).get(0).ondragenter = (e) => {
    e.preventDefault();
  }

  $(`.${scopedActiveChannel}Grid`).get(0).ondragenter = (e) => {
    $(`#${scopedActiveChannel}DropTarget`).css('display', 'block');
  }

  $(`#${scopedActiveChannel}DropTarget`).get(0).ondragleave = (e) => {
    $(`#${scopedActiveChannel}DropTarget`).css('display', '');
    e.preventDefault();
  }

  $(`#${scopedActiveChannel}DropTarget`).get(0).ondragover = (e) => {
    e.preventDefault();
  }

  $(`.${scopedActiveChannel}Grid`).get(0).ondrop = (e) => {
    showDroplet();
    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      processAttachment(scopedActiveChannel, [e.dataTransfer.files[i]], channelType);
    }

    $(`#${scopedActiveChannel}DropTarget`).css('display', '');
    e.preventDefault();
  }

  $(`#${scopedActiveChannel}voiceChatButton`).get(0).onclick = () => {
    joinChannelVC(guildUID, guildID, channelID);
  }

  $(`#${scopedActiveChannel}musicPartyButton`).get(0).onclick = () => {
    joinMusicParty(guildUID, guildID, channelID);
  }

  displayInputEffect();
  addChannelListeners(guildUID, guildID, channelID, false, channelType);

  $(`#${scopedActiveChannel}ChatMessageInput`).get(0).focus();

  $(`#gifsPickerSearchBox${scopedActiveChannel}`).get(0).addEventListener("keyup", (event) => {
    searchGifs(scopedActiveChannel);
  })

  // Voice chat
  manageVoiceChatDisplay(guildUID, guildID, channelID, undefined);

  $(`#${scopedActiveChannel}SongSearchInput`).get(0).addEventListener('keyup', (event) => {
    if (event.keyCode === 13) { event.preventDefault(); searchInChannel(guildUID, guildID, channelID)}
  })

  pingDialog(guildUID, guildID, channelID, channelType); // Ping dialog & button on enter.

  // Permissions
  reevaluatePermissionsChannel(guildUID, guildID, channelID);
  updateLoungeTypes(guildUID, guildID, channelID, serverData[guildUID + guildID].channelData ? serverData[guildUID + guildID].channelData[channelID] : {});
}

export function updateLoungeTypes(guildUID, guildID, channelID, dataInput) {
  const scopedActiveChannel = `${guildUID}${guildID}${channelID}`;
  let data = dataInput
  if (!dataInput) { data = {} };

  if (!loungeTypesCache[scopedActiveChannel] == data) {
    loungeTypesCache[scopedActiveChannel] = data;
    // We know it's different data, so it's worth checking unreads again.
    checkServerUnread(guildID);
  }


  // View
  $(`#${scopedActiveChannel}sidebarIcon`).addClass('bx-hash');
  $(`#${scopedActiveChannel}sidebarIcon`).removeClass('bx-lock-alt');
  $(`#${scopedActiveChannel}sidebarIcon`).removeClass('bx-lock-open-alt');
  $(`#${scopedActiveChannel}sidebarIcon`).removeClass('bx-book');
  $(`#${scopedActiveChannel}sidebarIcon`).removeClass('bx-pencil');
  $(`#${scopedActiveChannel}guildChannelElement`).removeClass('channelNoAccess')

  if (data.disablePublicEdit) {
    if (guildUID == user.uid || serverData[guildUID + guildID].staff.includes(user.uid)) {
      $(`#${scopedActiveChannel}sidebarIcon`).addClass('bx-pencil');
      // Enable writing.
      $(`#${scopedActiveChannel}ChatMessages`).removeClass('ChatMessagesComposeOff');
      $(`#${scopedActiveChannel}CenterElement`).removeClass('CenterElementComposeOff');
      $(`#${scopedActiveChannel}ChatMessageBar`).removeClass('ChatMessageBarComposeOff');
    }
    else {
      $(`#${scopedActiveChannel}sidebarIcon`).removeClass('bx-hash');
      $(`#${scopedActiveChannel}sidebarIcon`).addClass('bx-book');

      // Disable writing.
      $(`#${scopedActiveChannel}ChatMessages`).addClass('ChatMessagesComposeOff');
      $(`#${scopedActiveChannel}CenterElement`).addClass('CenterElementComposeOff');
      $(`#${scopedActiveChannel}ChatMessageBar`).addClass('ChatMessageBarComposeOff');
    }

    // Change message styling.
    $(`#${scopedActiveChannel}ChatMessages`).addClass('viewOnlyChatMessages');
    $(`#${scopedActiveChannel}guildChannel`).addClass('viewOnlyGuildChannel');
  }
  else {
    // Enable writing.
    $(`#${scopedActiveChannel}ChatMessages`).removeClass('ChatMessagesComposeOff');
    $(`#${scopedActiveChannel}CenterElement`).removeClass('CenterElementComposeOff');
    $(`#${scopedActiveChannel}ChatMessageBar`).removeClass('ChatMessageBarComposeOff');

    // Change message styling.
    $(`#${scopedActiveChannel}ChatMessages`).removeClass('viewOnlyChatMessages');
    $(`#${scopedActiveChannel}guildChannel`).removeClass('viewOnlyGuildChannel');
  }

  if (data.disablePublicView) {
    if (serverData[guildUID + guildID].staff.includes(user.uid) || guildUID == user.uid) {
      $(`#${scopedActiveChannel}sidebarIcon`).addClass('bx-lock-open-alt');
    }
    else {
      // Disable viewing
      if (currentChannel == channelID) { closeCurrentChannel(true) };
      $(`#${scopedActiveChannel}guildChannelElement`).addClass('channelNoAccess');
      $(`#${scopedActiveChannel}sidebarIcon`).addClass('bx-lock-alt');
    }
  }
  else {
    // Enable viewing
    $(`#${scopedActiveChannel}guildChannelElement`).removeClass('channelNoAccess');
  }

  // Edits for owner.
  if ($(`#disablePublicView${scopedActiveChannel}`).length) { // It's built.
    if (guildUID == user.uid) {
      if (!data.disablePublicView) { // Public view is on
        $(`#disablePublicView${scopedActiveChannel}`).html(`Restrict to Staff`);
        $(`#disablePublicView${scopedActiveChannel}`).get(0).onclick = () => {
          changeLoungeType(guildUID, guildID, channelID, 'disablePublicView', true);
        }
      }
      else { // Public view is off
        $(`#disablePublicView${scopedActiveChannel}`).html(`Make Public`);
        $(`#disablePublicView${scopedActiveChannel}`).get(0).onclick = () => {
          changeLoungeType(guildUID, guildID, channelID, 'disablePublicView', false);
        }
      }
  
      if (!data.disablePublicEdit) { // Public edit is on
        $(`#disablePublicEdit${scopedActiveChannel}`).html(`Disable Messages`);
        $(`#disablePublicEdit${scopedActiveChannel}`).get(0).onclick = () => {
          changeLoungeType(guildUID, guildID, channelID, 'disablePublicEdit', true);
        }
      }
      else { // Public edit is off
        $(`#disablePublicEdit${scopedActiveChannel}`).html(`Allow Messages`);
        $(`#disablePublicEdit${scopedActiveChannel}`).get(0).onclick = () => {
          changeLoungeType(guildUID, guildID, channelID, 'disablePublicEdit', false);
        }
      }
    }
  }
}

async function changeLoungeType(guildUID, guildID, channelID, type, value) {
  const scopedActiveChannel = `${guildUID}${guildID}${channelID}`;

  $(`#${type}${scopedActiveChannel}`).addClass('disabled');
  console.log(guildUID, guildID)
  await updateDoc(doc(db, `users/${guildUID}/servers/${guildID}`), {
    [`channelData.${channelID}.${type}`]: value,
  });

  await update(ref(rtdb, `servers/${guildUID}${guildID}/channelData/${channelID}`), {
    [`${type}`]: value,
  });

  window.setTimeout(() => {
    $(`#${type}${scopedActiveChannel}`).removeClass('disabled');
  }, 999);
}

window.openChannelPinned = async (scopedActiveChannel) => {
  if (!channelPinnedOpen) { // Not open
    channelPinnedOpen = scopedActiveChannel;
    openPinnedCooldown = true;
    console.log(channelPinnedOpen)
    window.clearInterval(pinnedMessagesTimeout);
    $(`#${scopedActiveChannel}pinnedMessagesContainer`).removeClass('hidden');
    window.setTimeout(() => {
      $(`#${scopedActiveChannel}pinnedMessagesContainer`).addClass('postStandardAnimation');
      openPinnedCooldown = false;
    }, 9);
  }
  else {
    if (openPinnedCooldown) { return; }
    channelPinnedOpen = false; // Not open
    $(`#${scopedActiveChannel}pinnedMessagesContainer`).removeClass('postStandardAnimation');
    pinnedMessagesTimeout = window.setTimeout(() => {
      $(`#${scopedActiveChannel}pinnedMessagesContainer`).addClass('hidden');
    }, 299)
  }
}

export async function pinMessage(scopedActiveChannel, messageID, messageSender, username) {
  await update(ref(rtdb, `channels/${scopedActiveChannel}/pinned/${messageID}`), {
    u: username,
    s: messageSender,
    c: messageHTMLtoText(null, $(`#messageContentOfID${messageID}`).get(0))
  });

  snac('Message Pinned', 'A message was successfully pinned in this lounge.', 'success')
}

export async function unpinMessage(messageID, scopedActiveChannel, skipNotify) {
  await remove(ref(rtdb, `channels/${scopedActiveChannel}/pinned/${messageID}`));
  
  if (!skipNotify) {
    snac('Message Unpinned', 'A message was succesfully unpinned in this lounge.', 'success');
  }
}

window.loadMoreChannelMessages = async (guildUID, guildID, channelID, channelType) => {
  const scopedActiveChannel = `${guildUID}${guildID}${channelID}`;
  disableButton($(`#${scopedActiveChannel}LoadMoreMessagesButton`));

  const response = addChannelMessagesPagination(guildUID, guildID, channelID, channelType);
  if (response == 'topOfMessages' || !LatestMessagesPagination[scopedActiveChannel]) {
    enableButton($(`#${scopedActiveChannel}LoadMoreMessagesButton`), `<i class="bx bx-chat"></i>`);
    $(`#${scopedActiveChannel}LoadMoreMessagesButton`).get(0)._tippy.setContent('No more messages.');
  }
  else {
    await timer(3200);
    enableButton($(`#${scopedActiveChannel}LoadMoreMessagesButton`), `<i class="bx bx-up-arrow-alt"></i>`);
  }
}

export function reevaluatePermissionsChannel(guildUID, guildID, channelID) {
  const scopedActiveChannel = `${guildUID}${guildID}${channelID}`;
  $(`#${scopedActiveChannel}channelSettingsDivider1`).addClass('hidden');
  $(`#${scopedActiveChannel}channelSettingsDivider2`).addClass('hidden');
  $(`#channelRenameButton${scopedActiveChannel}`).addClass('hidden');
  $(`#channelDeleteButton${scopedActiveChannel}`).addClass('hidden');
  $(`#disablePublicView${scopedActiveChannel}`).addClass('hidden');
  $(`#disablePublicEdit${scopedActiveChannel}`).addClass('hidden');
  $(`#${scopedActiveChannel}musicAdminBar`).addClass('hidden');
  $(`#${scopedActiveChannel}searchResultsChannelForm`).removeClass('searchResultsChannelFormAdmin');

  if (serverData[guildUID + guildID].owner == user.uid || serverData[guildUID + guildID].staff.includes(`${user.uid}`)) {
    // Staff member
    $(`#${scopedActiveChannel}channelSettingsDivider1`).removeClass('hidden');
    $(`#channelRenameButton${scopedActiveChannel}`).removeClass('hidden');
    $(`#channelDeleteButton${scopedActiveChannel}`).removeClass('hidden');

    $(`#${scopedActiveChannel}musicAdminBar`).removeClass('hidden');
    $(`#${scopedActiveChannel}searchResultsChannelForm`).addClass('searchResultsChannelFormAdmin');
  }

  if (serverData[guildUID + guildID].owner == user.uid) {
    // Owner
    $(`#${scopedActiveChannel}channelSettingsDivider2`).removeClass('hidden');
    $(`#disablePublicView${scopedActiveChannel}`).removeClass('hidden');
    $(`#disablePublicEdit${scopedActiveChannel}`).removeClass('hidden');
    $(`#${scopedActiveChannel}TabViewSettingsOwner`).removeClass('hidden');
  }

}

async function addChannelMessagesPagination(guildUID, guildID, channelID, channelType) {
  const scopedActiveChannel = `${guildUID}${guildID}${channelID}`;
  if (!LatestMessagesPagination[scopedActiveChannel]) {
    disablePagination[scopedActiveChannel] = true;
    completePagination[scopedActiveChannel] = true;
    return 'topOfMessages';
  }

  // Add messages without a listener. 
  await rtdbget(query(ref(rtdb, `channels/${scopedActiveChannel}/messages`), orderByKey(), limitToLast(18), endBefore(LatestMessagesPagination[scopedActiveChannel]))).then(async (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      let newPagination = ''
      
      const bottomMostNew = new Date(data[Object.keys(data)[Object.keys(data).length - 1]].timestamp);
      const topMostOld = new Date(parseInt($(`#${scopedActiveChannel}ChatMessages`).children('.containsDivider').first().get(0).getAttribute('ts')));

      if (bottomMostNew.getFullYear() == topMostOld.getFullYear() && bottomMostNew.getMonth() == topMostOld.getMonth() && bottomMostNew.getDate() == topMostOld.getDate()) {
        // Same day, delete topmost timestamp.
        $(`#${scopedActiveChannel}ChatMessages`).children('.containsDivider').first().children('.chatMessageDivider').first().remove();
        $(`#${scopedActiveChannel}ChatMessages`).children('.containsDivider').first().removeClass('containsDivider')
      }
      
      // Ordered by oldest to newest.
      for (const key of Object.keys(data)) {
        const value = data[key];
        
        if (!newPagination) {
          newPagination = key;
        }

        await buildMessage(guildUID, guildID, channelID, value, key, `PaginationPreview`, channelType);
        if ($(`#messageContentOfID${key}`).length){
          twemoji.parse($(`#messageContentOfID${key}`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });
        }
      }

      LatestMessagesPagination[scopedActiveChannel] = newPagination;

      const newContent = $(`#${scopedActiveChannel}PaginationPreview`).html();
      $(`#${scopedActiveChannel}PaginationPreview`).html('');
      $(`#${scopedActiveChannel}ChatMessages`).prepend(newContent);
    }
    else {
      LatestMessagesPagination[scopedActiveChannel] = '';
    }
  });

  disablePagination[scopedActiveChannel] = false;
}

export async function addChannelListeners(guildUID, guildID, channelID, secondTime, channelType) {
  const scopedActiveChannel = `${guildUID}${guildID}${channelID}`;

  // Always clear
  LatestMessageTimestamp[scopedActiveChannel] = new Date(0);
  LatestMessagesPagination[scopedActiveChannel] = null;
  
  try { off(query(ref(rtdb, `${activeMessageListener}`)));
  } catch (error) {};

  try {
    off(query(ref(rtdb, `${activePinnedListener}`)));
  } catch (error) {}

  activeMessageListener = `channels/${scopedActiveChannel}/messages`;
  activePinnedListener = `channels/${scopedActiveChannel}/pinned`;

  if (channelTabLibrary[scopedActiveChannel] == 'Chat' && addPendingIndicator[`${guildUID}${guildID}${channelID}`]) {
    markChannelAsRead(guildUID, guildID, channelID);
  }

  onChildAdded(query(ref(rtdb, `${activeMessageListener}`), orderByKey(), limitToLast(24)), async (snapshot) => {
    if (new Date(snapshot.val().timestamp) < LatestMessageTimestamp[scopedActiveChannel]) {
      return;
    };

    LatestMessageTimestamp[scopedActiveChannel] = new Date(snapshot.val().timestamp);

    if (LatestMessagesPagination[scopedActiveChannel] == null) {
      // farthest message / first message / first run.
      LatestMessagesPagination[scopedActiveChannel] = snapshot.key;
    }

    if (!$(`#messageContentContainerOfID${snapshot.key}`).length) {
      await buildMessage(guildUID, guildID, channelID, snapshot.val(), snapshot.key, 'ChatMessages', channelType);
      twemoji.parse($(`#messageContentOfID${snapshot.key}`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });
    }
  });

  onChildRemoved(query(ref(rtdb, `${activeMessageListener}`)), (snapshot) => {
    displayDeleteMessage(snapshot.key)
  })

  onChildChanged(query(ref(rtdb, `${activeMessageListener}`)), (snapshot) => {
    $(`#messageContentOfID${snapshot.key}`).html(messageify(snapshot.val().content));
    
    twemoji.parse($(`#messageContentOfID${snapshot.key}`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });
    if (snapshot.val().edited) {
      $(`#messageContentOfID${snapshot.key}`).addClass('editedMessage');
      $(`#editedMessageOfID${snapshot.key}`).removeClass('hidden');
      $(`#editedMessageIconOfID${snapshot.key}`).get(0)._tippy.setContent(`Edited ${timeago.format(new Date(snapshot.val().editedDate))}`);
    }

    // TODO: Check for answers.
    if (snapshot.val().answered) {
      $(`#${snapshot.key}AnswerArea`).removeClass('hidden');
      $(`#${snapshot.key}AnswerArea`).html(`
        ${snapshot.val().answer}
        <div class="qaTextAnswerBottom">
          Answered by <span onclick="openUserCard('${snapshot.val().answeredBy.split('.')[1]}')">${snapshot.val().answeredBy.split('.')[0].capitalize()}</span>
        </div>
      `);
      $(`#messageContentOfID${snapshot.key}`).get(0).setAttribute('messageChannelQAAnswered', snapshot.val().answer)
    }
    else {
      $(`#${snapshot.key}AnswerArea`).addClass('hidden');
      $(`#messageContentOfID${snapshot.key}`).get(0).setAttribute('messageChannelQAAnswered', "")
    }

    // If sent a message, its approved now.
  })

  onValue(query(ref(rtdb, `${activeMessageListener}`), limitToLast(1)), (snapshot) => {
    if (snapshot.exists() && snapshot.val()) {
      $(`#emptyChannel${scopedActiveChannel}`).addClass('hidden');
    }
    else {
      $(`#emptyChannel${scopedActiveChannel}`).removeClass('hidden');
    }
  });

  if (cachedPins[scopedActiveChannel] == undefined) {
    cachedPins[scopedActiveChannel] = new Set();
  }

  $(`#${scopedActiveChannel}pinnedMessages`).empty();

  onChildAdded(query(ref(rtdb, `${activePinnedListener}`), limitToLast(50)), async (snapshot) => {
    cachedPins[scopedActiveChannel].add(snapshot.key);
    const a = document.createElement('div');
    a.setAttribute('class', 'messageReplay');
    a.id = `messageReplayOfID${snapshot.key}`;
    a.innerHTML = `
      <img class="profilePhotoReplay" id="${snapshot.key}pinimage"></img>
      <span class="chatMessageNameplate">${snapshot.val().u.capitalize()}</span>
      <p>${snapshot.val().c}</p>
      <button id="unpin${snapshot.key}" class="btn b-4 roundedButton pinnedButton unPinButton"><i class="bx bx-checkbox-minus"></i></button>
    `
    $(`#${scopedActiveChannel}pinnedMessages`).get(0).appendChild(a);
    twemoji.parse($(`#messageReplayOfID${snapshot.key}`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });
    $(`#${snapshot.key}pinimage`).attr('src', await returnProperURL(snapshot.val().s));
    $(`#unpin${snapshot.key}`).get(0).onclick = () => {
      disableButton($(`#unpin${snapshot.key}`));
      unpinMessage(snapshot.key, scopedActiveChannel, true);
    }
  });

  onChildRemoved(query(ref(rtdb, `${activePinnedListener}`), limitToLast(50)), (snapshot) => {
    cachedPins[scopedActiveChannel].delete(snapshot.key);
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
      $(`#emptyPinned${scopedActiveChannel}`).addClass('hidden');
    }
    else {
      $(`#emptyPinned${scopedActiveChannel}`).removeClass('hidden');
    }
  });

  $(`#${scopedActiveChannel}ChatMessages`).get(0).onscroll = () => {};

  window.setTimeout(() => {
    $(`#${scopedActiveChannel}ChatMessages`).get(0).onscroll = (function (event) {
      const scroll = $(`#${scopedActiveChannel}ChatMessages`).scrollTop();
      if (scroll < 599) {
        if (completePagination[scopedActiveChannel]) { return };
        if (!disablePagination[scopedActiveChannel]) { disablePagination[scopedActiveChannel] = true; 
          addChannelMessagesPagination(guildUID, guildID, channelID, channelType);
        }
      }
    });
  }, 1800);
}

function buildMessage(guildUID, guildID, channelID, messageItem, messageID, targetDirectoryInput, channelType) {
  return new Promise(async (resolve, reject) => {
    const scopedActiveChannel = `${guildUID}${guildID}${channelID}`;
    let targetDirectory = targetDirectoryInput;
    if (!targetDirectoryInput) {
      targetDirectory = 'ChatMessages';
    }

    const messageContent = messageify(messageItem.content);
  
    const prevMessageDate = new Date(parseInt($(`#${scopedActiveChannel}${targetDirectory}`).children().last().attr('tS')));
    const newMessageDate = new Date(messageItem.timestamp);
    let bonusContent = {attachments: '', classes: '', pings: '', edited: messageItem.edited || false, containerClasses: '', links: '', YouTube: '', insertHTML: ''};
    let dividerCode = '';
    let dividerCode2 = '';
    let availableToAdd = true;
    let availableToAddedTo = true;

    if (channelType == 'qa') {
      availableToAdd = false;
      availableToAddedTo = false;
    }
  
    // Message type
    if (messageContent) {
      bonusContent.classes = '';
      bonusContent.containerClasses = '';
      bonusContent.insertHTML = ``;
    }
    else {
      bonusContent.classes = ''
      bonusContent.containerClasses = 'messageBoxNoTextContainer';
      if (messageItem.uid == user.uid) {
        bonusContent.insertHTML = `<button onclick="deleteLoneImage('${scopedActiveChannel}','${messageID}')" id="deleteButton${messageID}" class="btn roundedButton"><i class="bx bx-trash"></i></button>`;
      }
      availableToAddedTo = false;
    }

  
    if (messageItem.attachments && messageItem.attachments.length) {
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

    if (messageItem.pings && messageItem.pings.length) {
      bonusContent.containerClasses = bonusContent.containerClasses + ' messageBoxContainsPings'
      bonusContent.pings = `<div class="messageBoxPings">`;
      for (let i = 0; i < messageItem.pings.length; i++) {
        const ping = messageItem.pings[i].split('.');
        bonusContent.pings = bonusContent.pings + `<img class="imgClickablePing hidden userContextItem" guildUID="${ping[1]}" onclick="openUserCard('${ping[1]}')" id="${messageID}Ping${ping[1]}"/>`
      }
  
      bonusContent.pings = bonusContent.pings + '</div>'
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

        var img = new Image();
        img.onload = () => {
          $(`#${messageID}LinkNum${i}`).removeClass('invisible');
          $(`#${messageID}LinkNum${i}`).attr('src', img.src);
        }; 
        img.onerror = () => {
          $(`#${messageID}LinkNum${i}`).addClass('hidden');
        }
        img.src = link.image;
      }
      bonusContent.links = bonusContent.links + `</div>`;
      availableToAdd = false;
      availableToAddedTo = false;
    }

    const reg = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*?[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig;
    
    const matches = messageContent.match(reg);
    if (matches && matches.length) {
      console.log(matches)
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
      // Different days. Send divider and subsequently clear previous chat message UID.
      dividerCode = `<span class="chatMessageDivider">${newMessageDate.toLocaleDateString("en-US", {weekday: 'long', month: 'long', day: 'numeric', year: '2-digit'})}</span>`;
      dividerCode2 = 'containsDivider';
      availableToAdd = false;
    }
  
    const a = document.createElement('div');
    a.setAttribute('sentBy', messageItem.uid);
    a.setAttribute('tS', messageItem.timestamp);
    a.setAttribute('availableToBeAddedTo', availableToAddedTo || '');
    a.setAttribute('availableToAdd', availableToAdd);
    a.setAttribute('class', `chatMessage channelChatMessage ${messageItem.uid === user.uid ? 'selfChatMessage' : 'otherChatMessage'} ${dividerCode2} ${bonusContent.containerClasses}`)
    a.id = `MessageOfID${messageID}`;

    let containerStart = ``;
    let containerEnd = ``;

    let innerMessageContent = `
      <div class="relative" id="messageContentContainerOfID${messageID}">
        ${bonusContent.pings}
        <div class="messageContentContentContainer messageContentItemForContext loneEmoji${messageContent.length}match${/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi.test(messageContent)} acceptLeftClick ${bonusContent.edited ? 'editedMessage' : ''} ${bonusContent.classes}" guildUID="${guildUID}" guildID="${guildID}" channelType="${channelType}" messageID="${messageID}" messageSenderName="${messageItem.author}" messageSender="${messageItem.uid}" messageType="Channel" channelID="${scopedActiveChannel}" messageChannelQAAnswered="${messageItem.answer}" id="messageContentOfID${messageID}">
          ${messageContent}
        </div>
        ${(channelType == "qa") ? `${messageItem.answered ? ` 
        <div class="qaTextAnswerArea" id="${messageID}AnswerArea">
          ${messageItem.answer}
          <div class="qaTextAnswerBottom">
            Answered by <span onclick="openUserCard('${messageItem.answeredBy.split('.')[1]}')">${messageItem.answeredBy.split('.')[0].capitalize()}</span>
          </div>
        </div>
      ` : `<div class="hidden qaTextAnswerArea" id="${messageID}AnswerArea"></div>`}` : ``}
        <div id="editedMessageOfID${messageID}" class="editedMessageIcon ${bonusContent.edited ? '' : 'hidden'} animated zoomIn">
          <i id="editedMessageIconOfID${messageID}" class="bx bx-pencil"></i>
        </div>
      </div>
    `

    if (messageItem.uid == user.uid) {
      containerStart = `${dividerCode}<div class="topLevelMessageContentTwo">`;
      containerEnd = `</div>`
    }
    else {
      containerStart = `${dividerCode}
        <div class="topLevelMessageContentTwo"> <img userID="${messageItem.uid}" username="${messageItem.author}" guildUID="${guildUID}" guildID="${guildID}" guildID="${guildID}" id="profilePhotoOfMessageID${messageID}" onclick="openUserCard('${messageItem.uid}')" class="otherChatMessageImageProfile userContextItem hidden" src="" />`
      containerEnd = `</div>`
    }

    a.innerHTML = `${containerStart}<div class="topLevelContainerMessage"><span class="chatMessageNameplate">${messageItem.author.capitalize()}</span><span id="chatMessageTimestamp${messageID}" class="chatMessageTimestamp">${tConvert(new Date(messageItem.timestamp).toTimeString().split(' ')[0])}</span></div>${innerMessageContent}${containerEnd}${bonusContent.attachments}${bonusContent.links}${bonusContent.YouTube}`;

    if ($(`#${scopedActiveChannel}${targetDirectory}`).children().last().attr('sentBy') === messageItem.uid && $(`#${scopedActiveChannel}${targetDirectory}`).children().last().attr('availableToBeAddedTo') && availableToAdd) {
      $(`#${scopedActiveChannel}${targetDirectory}`).children().last().children().last().append(innerMessageContent);
      // Becuase of pings, another children().last().
    }
    else {
      $(`#${scopedActiveChannel}${targetDirectory}`).get(0).appendChild(a);
    }

    if (messageItem.pings && messageItem.pings.length) {
      for (let i = 0; i < messageItem.pings.length; i++) {
        const ping = messageItem.pings[i].split('.');
        const imageURL = await returnProperURL(ping[1]);
        $(`#${messageID}Ping${ping[1]}`).attr(`src`, imageURL);
        displayImageAnimation(`${messageID}Ping${ping[1]}`)
      }
    }

    window.setTimeout(async () => {
      if ($(`#profilePhotoOfMessageID${messageID}`).length) {
        $(`#profilePhotoOfMessageID${messageID}`).attr('src', await returnProperURL(messageItem.uid));
        displayImageAnimation(`profilePhotoOfMessageID${messageID}`);
      }

      if (messageItem.attachments) {
        for (let i = 0; i < messageItem.attachments.length; i++) {
          if ($(`#${messageID}NoAttachment${i}`).length) {
            $(`#${messageID}NoAttachment${i}`).get(0).setAttribute(`onclick`, `window.open('${messageItem.attachments[i]}')`)
          }
          else {
            const src = await returnProperAttachmentURL(messageItem.attachments[i])
            $(`#${messageID}Attachment${i}`).get(0).setAttribute(`src`, src);
            $(`#${messageID}Attachment${i}`).get(0).setAttribute(`fullSrc`, messageItem.attachments[i].replaceAll(`attachmentsPreview`, `attachments`).replaceAll(`-resized`, ''));
            if (src.includes(`https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/app%2FmissingFile.png?alt=media`)) {
              $(`#${messageID}Attachment${i}`).get(0).setAttribute(`poster`, src);
            }
            else {
              channelPlayers[messageID] = new Plyr(`#${messageID}Attachment${i}`, {
                controls: ['play', 'progress', 'current-time', 'mute', 'fullscreen'],
              })
              channelPlayers[messageID].volume = defaultVolume;
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

    }, 99);

    if ($(`#deleteButton${messageID}`).length) {
      tippy(`#deleteButton${messageID}`, {
        content: 'Delete Message',
        placement: 'top',
      });
    }

    tippy(`#editedMessageIconOfID${messageID}`, {
      content: `Edited ${messageItem.edited ? timeago.format(new Date(messageItem.editedDate)) : 'not'}`,
      placement: 'top',
    });

    if (messageItem.edited) {
      $(`#editedMessageOfID${messageID}`).removeClass('hidden');
    }

    if (targetDirectory == 'ChatMessages') { scrollBottomMessages(scopedActiveChannel) }
    resolve(true);
  });
}

window.deleteLoneImage = (channelID, messageID) => {
  deleteMessage(channelID, messageID)
}

window.sendChannelChatMessage = async (guildUID, guildID, channelID, force, channelType) => {
  const scopedActiveChannel = `${guildUID}${guildID}${channelID}`;
  
  let message = $(`#${scopedActiveChannel}ChatMessageInput`).val();

  if (!message.length && !force) {
    if (PendingAttachments[scopedActiveChannel] && PendingAttachments[scopedActiveChannel].length) {
      message = ``;
    }
    else {
      return;
    } 
  }
  if (message.length > 1200) {
    snac('Invalid Message', 'Your message cannot be longer than 1200 characters.', 'danger');
    return;
  }

  if (serverData[guildUID + guildID] && serverData[guildUID + guildID].channelData && serverData[guildUID + guildID].channelData[channelID] && serverData[guildUID + guildID].channelData[channelID].disablePublicEdit) {
    if (!serverData[guildUID + guildID].staff.includes(user.uid) && guildUID !== user.uid) {
      return;
    }
  }

  if (disableMessageSending) {
    return;
  }
  $(`#${scopedActiveChannel}ChatMessageInput`).val('');

  disableMessageSending = true; 
    
  if (!messagePings[scopedActiveChannel]) {
    messagePings[scopedActiveChannel] = [];
  }

  hidePingSelectors(scopedActiveChannel);

  
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
    result = await getLinkPreview({ content: linkPreviewContent })
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

  hideAttachmentManager(scopedActiveChannel, channelType);
  if (!PendingAttachments[scopedActiveChannel]) {
    PendingAttachments[scopedActiveChannel] = [];
  }

  let finalAttachments = [];
  for (let i = 0; i < PendingAttachments[scopedActiveChannel].length; i++) {
    const file = PendingAttachments[scopedActiveChannel][i];
    const imageID = new Date().getTime()
    showUploadProgress();
    finalAttachments.push(await uploadAttachmentFile(scopedActiveChannel, imageID, file));
    
    if (['jpg', 'jpeg', 'png'].includes(file.name.split('.').pop().toLowerCase())) {
      const resizeImages = httpsCallable(functions, "resizeImages");
      await resizeImages({targetChannel: scopedActiveChannel, filePath: `attachments/${scopedActiveChannel}/${user.uid}/${imageID}.${file.name.split(".").pop()}`});
    }
    
    hideUploadProgress();
  }

  if (pendingGif) {
    finalAttachments.push(pendingGif);
    pendingGif = null;
    // Select text field
    $(`#${scopedActiveChannel}ChatMessageInput`).focus();
  }

  PendingAttachments[scopedActiveChannel] = [];
  $(`#${scopedActiveChannel}AttachmentManagerContent`).empty()

  playMessageSound();

  window.setTimeout(() => {
    disableMessageSending = false;
  }, 999);

  await push(ref(rtdb, `channels/${scopedActiveChannel}/messages`), {
    pings: messagePings[scopedActiveChannel],
    attachments: finalAttachments,
    author: cacheUser.username,
    timestamp: rtdbts(),
    content: message,
    uid: user.uid,
    links: result
  });

  messagePings[scopedActiveChannel] = [];
  skipOptimisticEvaluation = true; // This will prevent an unnecessary mark as read. When the message is confirmed, channel will be marked.

  await update(ref(rtdb, `servers/${guildUID}${guildID}`), {
    [channelID]: rtdbts(),
  });

  const perspectiveapi = await fetch("https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=AIzaSyDwSVIkiXmE5CFqOkqyew75zX5pRbpuboo", { body: `{comment: {text: "${securityConfirmTextIDs(message, true)}"}, languages: ["en"], requestedAttributes: {TOXICITY:{}, SEVERE_TOXICITY: {}} }`, headers: { "Content-Type": "application/json" }, method: "POST"});
  const perspective = await perspectiveapi.json();

  if (perspective && perspective.attributeScores && perspective.attributeScores["SEVERE_TOXICITY"] && perspective.attributeScores["SEVERE_TOXICITY"].summaryScore.value > 0.8) {
    openModal('toxicityWarning');
  }
}

export async function answerQuestion(scopedActiveChannel, messageID, answerText) {
  if (answerText.length < 2) {
    snac('Invalid Answer', 'Your answer cannot be less than 2 characters.', 'danger');
    return;
  }

  if (answerText.length > 500) {
    snac('Invalid Answer', 'Your answer cannot be more than 500 characters.', 'danger');
    return;
  }

  closeModal();

  await update(ref(rtdb, `channels/${scopedActiveChannel}/messages/${messageID}`), {
    answer: answerText,
    answered: true,
    answeredBy: `${cacheUser.username}.${user.uid}`,
  });

  snac("Answer Added", "Your answer has been posted successfully.", "success");
}

export async function removeAnswer(scopedActiveChannel, messageID) {
  await update(ref(rtdb, `channels/${scopedActiveChannel}/messages/${messageID}`), {
    answer: "",
    answered: false,
    answeredBy: ``,
  });

  snac("Answer Deleted", "The answer has been deleted successfully.", "success");
}

export async function editAnswerQuestion(scopedActiveChannel, messageID, answerText) {
  if (answerText.length < 2) {
    snac('Invalid Answer', 'Your answer cannot be less than 2 characters.', 'danger');
    return;
  }

  if (answerText.length > 500) {
    snac('Invalid Answer', 'Your answer cannot be more than 500 characters.', 'danger');
    return;
  }

  closeModal();

  await update(ref(rtdb, `channels/${scopedActiveChannel}/messages/${messageID}`), {
    answer: answerText,
    answered: true,
    answeredBy: `${cacheUser.username}.${user.uid}`,
  });

  snac("Answer Edited", "The answer has been edited successfully.", "success");
}

export function markChannelAsRead(guildUID, guildID, channelID) {
  return new Promise(async (resolve, reject) => {
    if (channelID.includes('Settings')) { resolve(false); return; } // Ignore settings channel.

    if (!addPendingIndicator[`${guildUID}${guildID}${channelID}`]) { resolve(false); return; } // No unread indicator.
    addPendingIndicator[`${guildUID}${guildID}${channelID}`] = false;

    if (skipOptimisticEvaluation) {
      console.log(`Skipping optimistic evaluation.`);
      skipOptimisticEvaluation = false;
      resolve(false);
      return;
    }

    removeIndicator(guildUID, guildID, channelID);

    await updateDoc(doc(db, `Unread/${user.uid}`), {
      [`${guildUID}${guildID}${channelID}`]: dbts()
    });
  
    checkServerUnread(guildUID, guildID);

    resolve(true);
  })
}


export async function markChannelAsUnread(guildUID, guildID, channelID) {
  if (currentServerUser == guildUID && currentServer == guildID && currentChannel == channelID && channelTabLibrary[`${guildUID}${guildID}${channelID}`] == 'Chat') {
    closeCurrentChannel();
  }

  addIndicator(guildUID, guildID, channelID);

  await updateDoc(doc(db, `Unread/${user.uid}`), {
    [`${guildUID}${guildID}${channelID}`]: 0
  })

  console.log('Marked channel as unread.');
  checkServerUnread(guildUID, guildID);
}

export async function muteChannel(guildUID, guildID, channelID, showNotification) {
  $(`#${guildUID}${guildID}${channelID}guildChannelElement`).addClass('mutedChannelNotificationTransition');
  $(`#${guildUID}${guildID}${channelID}channelNotify`).removeClass('zoomIn');
  $(`#${guildUID}${guildID}${channelID}channelNotify`).removeClass('zoomOut');

  $(`#${guildUID}${guildID}${channelID}channelMuteButton`).addClass('disabled');

  await updateDoc(doc(db, `users/${user.uid}`), {
    mutedServers: arrayUnion(`${guildUID}${guildID}${channelID}`)
  });

  if (showNotification) {
    snac('Lounge Muted', '', 'success');
  }

  window.setTimeout(() => {
    $(`#${guildUID}${guildID}${channelID}channelMuteButton`).html('Unmute Lounge');
    try {
      $(`#${guildUID}${guildID}${channelID}channelMuteButton`).get(0).onclick = () => unmuteChannel(guildUID, guildID, channelID, false);
    } catch (error) { }
    $(`#${guildUID}${guildID}${channelID}channelMuteButton`).removeClass('disabled');

    $(`#${guildUID}${guildID}${channelID}guildChannelElement`).removeClass('mutedChannelNotificationTransition');  
  }, 800);

  mutedServers.push(`${guildUID}${guildID}${channelID}`);
  checkServerUnread(guildUID, guildID);
}

export async function unmuteChannel(guildUID, guildID, channelID, showNotification) {
  $(`#${guildUID}${guildID}${channelID}guildChannelElement`).addClass('mutedChannelNotificationTransition');
  $(`#${guildUID}${guildID}${channelID}channelNotify`).removeClass('zoomIn');
  $(`#${guildUID}${guildID}${channelID}channelNotify`).removeClass('zoomOut');

  $(`#${guildUID}${guildID}${channelID}channelMuteButton`).addClass('disabled');

  await updateDoc(doc(db, `users/${user.uid}`), {
    mutedServers: arrayRemove(`${guildUID}${guildID}${channelID}`)
  });

  if (showNotification) {
    snac('Lounge Unmuted', '', 'success');
  }

  window.setTimeout(() => {
    $(`#${guildUID}${guildID}${channelID}channelMuteButton`).html('Mute Lounge');
    try {
      $(`#${guildUID}${guildID}${channelID}channelMuteButton`).get(0).onclick = () => muteChannel(guildUID, guildID, channelID, false);
    } catch (error) { }
    $(`#${guildUID}${guildID}${channelID}channelMuteButton`).removeClass('disabled');

    $(`#${guildUID}${guildID}${channelID}guildChannelElement`).removeClass('mutedChannelNotificationTransition');
  }, 800)
  
  mutedServers = mutedServers.filter(x => x != `${guildUID}${guildID}${channelID}`);
  checkServerUnread(guildUID, guildID);
}

export async function deleteMessage(channelID, messageID) {
  await remove(ref(rtdb, `channels/${channelID}/messages/${messageID}`));
  console.log('Message deleted. ');
}

function displayDeleteMessage(key) {
  // Delete the message firstly
  const parentElement = $(`#messageContentOfID${key}`).parent().parent().parent();

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

function showAttachmentManager(scopedActiveChannel) {
  $(`#${scopedActiveChannel}AttachmentManagerContent`).removeClass('hidden');
  $(`#${scopedActiveChannel}AttachmentManagerContent`).removeClass('fadeOut');
  $(`#${scopedActiveChannel}AttachmentManagerContent`).addClass('fadeIn');
  $(`#${scopedActiveChannel}AttachmentManager`).removeClass('hidden');

  window.setTimeout(() => {
    $(`#${scopedActiveChannel}AttachmentManager`).addClass('ManagerShown');
  }, 9);

  $(`#${scopedActiveChannel}ChatMessages`).css('height', 'calc(100% - 125px)');
  $(`#attachmentManagerInjection`).html(`  
    #${scopedActiveChannel}PingAutocomplete {
      bottom: 236px;
    }
  `)
  $(`#messageLabel${scopedActiveChannel}`).html('Add a caption:');
}

function hideAttachmentManager(scopedActiveChannel, channelType) {
  $(`#${scopedActiveChannel}AttachmentManager`).removeClass('ManagerShown');
  $(`#${scopedActiveChannel}AttachmentManagerContent`).removeClass('fadeIn');
  $(`#${scopedActiveChannel}AttachmentManagerContent`).addClass('fadeOut');

  $(`#${scopedActiveChannel}ChatMessages`).css('height', '');;
  $(`#messageLabel${scopedActiveChannel}`).html('Send a message:');

  if (channelType == 'qa') {
    $(`#messageLabel${scopedActiveChannel}`).html('Ask a question:');
  }

  window.setTimeout(() => {
    $(`#${scopedActiveChannel}AttachmentManager`).addClass('hidden');
    $(`#${scopedActiveChannel}AttachmentManagerContent`).addClass('hidden');
  }, 1000);
}

window.addAttachment = (scopedActiveChannel, channelType) => {
  $("#standardImageInput").off();
  $("#standardImageInput").val('');

  $("#standardImageInput").change(async () => {
    processAttachment(scopedActiveChannel, null, channelType);
  });

  $('#standardImageInput').get(0).click();
}

export async function processAttachment(scopedActiveChannel, files, channelType) {
  let filesList = files;
  if (!$(`#${scopedActiveChannel}AttachmentManagerContent`).length) {
    return;
  }

  if (!files) {
    filesList = document.getElementById("standardImageInput").files;
  }

  // Redone processor.

  for (let i = 0; i < filesList.length; i++) {
    if (checkValidSubscription(cacheUser.subscription)) {
      if (filesList[i].size > (32 * 1000000)) {
        snac(`File Size Error`, `Your file, ${filesList[i].name}, is too large. There is a 32MB limit per file.`, 'danger');
        continue;
      }
    }
    else {
      if (filesList[i].size > (10 * 1000000)) {
        snac(`File Size Error`, `Your file, ${filesList[i].name}, is too large. There is a 10MB limit per file. Upgrade to Parallel Infinite to increase this limit to 32MB.`, 'danger');
        continue;
      }
    }

    if (!filesList[i].type) {
      snac(`File Type Error`, `Your file is invalid.`, 'danger');
      continue;
    }

    if (PendingAttachments[scopedActiveChannel] && PendingAttachments[scopedActiveChannel].length > 8 ) {
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

    showAttachmentManager(scopedActiveChannel);

    $(`#${scopedActiveChannel}ChatMessageInput`).get(0).focus();

    if (PendingAttachments[scopedActiveChannel] == undefined) {
      PendingAttachments[scopedActiveChannel] = [];
    }
  
    PendingAttachments[scopedActiveChannel].push(filesList[i]);
  
    updateChannelCaptionPreview(scopedActiveChannel, channelType);
  }
}

function uploadAttachmentFile(scopedActiveChannel, timeOrID, file) {
  return new Promise(async (resolve, reject) => {

    const uploadTask = uploadBytesResumable(storageRef(storage, `attachments/${scopedActiveChannel}/${user.uid}/${timeOrID}.${file.name.split('.').pop()}`), file)

    uploadTask.on('state_changed', (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      $('#uploadProgressNumber').html(`Upload Progress: ${progress.toFixed(0)}%`);
    });

    if (['jpg', 'jpeg', 'png'].includes(file.name.split('.').pop().toLowerCase())) {
      uploadTask.then(() => { // Resolve with the resized path.
        resolve(`https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/attachmentsPreview%2F${scopedActiveChannel}%2F${user.uid}%2F${timeOrID}-resized.${file.name.split(".").pop()}?alt=media`);
      })
    }
    else {
      uploadTask.then(() => {
        resolve(`https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/attachments%2F${scopedActiveChannel}%2F${user.uid}%2F${timeOrID}.${file.name.split(".").pop()}?alt=media`);
      })
    }
  });
}

function updateChannelCaptionPreview(scopedActiveChannel, channelType) {
  $(`.PLYRON${scopedActiveChannel}`).each((index, element) => {
    channelPendingPlayers[scopedActiveChannel + index].destroy();
  });

  $(`#${scopedActiveChannel}AttachmentManagerContent`).empty();

  for (let i = 0; i < PendingAttachments[scopedActiveChannel].length; i++) {
    const file = PendingAttachments[scopedActiveChannel][i];
    const url = URL.createObjectURL(file);
    const a = document.createElement('div');
    a.setAttribute('class', 'PendingAttachmentImage');
    
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

    a.innerHTML = `${attachmentItem}<button onclick="removeChannelAttachmentFromList('${scopedActiveChannel}', '${i}', '${channelType}')" class="btn attachmentRemoveButton"><i class='bx bx-x'></i></button>`;
    $(`#${scopedActiveChannel}AttachmentManagerContent`).get(0).appendChild(a);
  }

  $(`.PendingAttachmentVideo${scopedActiveChannel}`).each((index, element) => {
    if (!$(element).hasClass(`PLYRON${scopedActiveChannel}`)) {
      $(element).addClass(`PLYRON${scopedActiveChannel}`);
      channelPendingPlayers[scopedActiveChannel + index] = new Plyr(element, {
        controls: ['play', 'progress',  'mute', 'fullscreen'],
      });
      channelPendingPlayers[scopedActiveChannel + index].volume = defaultVolume;
    } 
  });

  if (PendingAttachments[scopedActiveChannel].length === 0) {
    hideAttachmentManager(scopedActiveChannel, channelType);
  }
}

window.removeChannelAttachmentFromList = (scopedActiveChannel, index, channelType) => {
  PendingAttachments[scopedActiveChannel].splice(parseInt(index), 1);
  updateChannelCaptionPreview(scopedActiveChannel, channelType);
}

async function deleteChannel(guildUID, guildID, channelID, channelName) {
  await updateDoc(doc(db, `users/${guildUID}/servers/${guildID}`), {
    channels: arrayRemove(channelID + '.' + channelName),
    [`channelData.${channelID}`]: deleteField(),
  });

  await remove(ref(rtdb, `servers/${guildUID}${guildID}/channelData/${channelID}`));
  await remove(ref(rtdb, `servers/${guildUID}${guildID}/${channelID}`));

  markChannelAsRead(guildUID, guildID, channelID);

  const deleteLounge = httpsCallable(functions, "deleteLounge");
  const result = await deleteLounge({ guildUID: guildUID, guildID: guildID, loungeID: channelID, loungeName: channelName});
}

export async function closeCurrentChannel(leaveVoiceToo) {
  try {
    off(query(ref(rtdb, `${activeMessageListener}`)));
  } catch (error) { }

  try {
    off(query(ref(rtdb, `${activePinnedListener}`)));
  } catch (error) {}

  try {
    off(query(ref(rtdb, `${activeVCMusicListener}`)));
    activeVCMusicListener = '';
  } catch (error) { }
  
  $(`.${currentServerUser}${currentServer}guildChannelActive`).removeClass('guildChannelActive');
  $(`.${currentServerUser}${currentServer}guildChannelActive`).removeClass(`${currentServerUser}${currentServer}guildChannelActive`);


  $(`.${currentServerUser}${currentServer}guildChannelViewActive`).addClass('hidden');
  $(`.${currentServerUser}${currentServer}guildChannelViewActive`).removeClass(`${currentServerUser}${currentServer}guildChannelViewActive`);

  if (leaveVoiceToo) {
    if (currentCall && currentCall.includes('/') && currentCall.split('/')[1] == currentChannel) {
      endAllCalls();
    }
  }

  currentChannel = '';
}

window.deleteLoungePrepare = (guildUID, guildID, channelID, channelName) => {
  openModal('deleteLounge');
  $('#loungeConfirmDelete').get(0).onclick = () => {
    disableButton($('#loungeConfirmDelete'));
    deleteChannel(guildUID, guildID, channelID, channelName);
    closeModal();
  }
}

window.renameLoungePrepare = (guildUID, guildID, channelID) => {
  openModal('renameLounge');
  $('#renameLoungeName').val('')
  $('#renameLoungeName').get(0).addEventListener("keyup", function(event) {
    if (event.keyCode === 13) { event.preventDefault(); $('#renameLoungeButton').get(0).click(); }
  });
  $('#renameLoungeButton').get(0).onclick = () => renameLoungeConfirm(`${guildUID}`, `${guildID}`, `${channelID}`);
}

async function renameLoungeConfirm(guildUID, guildID, channelID) {
  const newChannelName = securityConfirmTextIDs($('#renameLoungeName').val(), true)
  closeModal();


  await runTransaction(db, async (transaction) => {
    const sfDoc = await transaction.get(doc(db, `users/${guildUID}/servers/${guildID}`));

    let newChannelList = [];

    for (let i = 0; i < sfDoc.data().channels.length; i++) {
      if (sfDoc.data().channels[i].split('.')[0] == `${channelID}`) {
        newChannelList.push(`${sfDoc.data().channels[i].split('.')[0]}.${newChannelName}`);
      }
      else {
        newChannelList.push(sfDoc.data().channels[i]);
      }
    }

    transaction.update(doc(db, `users/${guildUID}/servers/${guildID}`), {
      channels: newChannelList
    });
  });


  console.log('transaction update success.');

  snac('Lounge Renamed', '', 'success');

}

function pingDialog(guildUID, guildID, channelID, channelType) {
  const scopedActiveChannel = `${guildUID}${guildID}${channelID}`;  
  $(`#${scopedActiveChannel}ChatMessageInput`).get(0).addEventListener("keydown", function(event) {
    if (event.keyCode === 13) { event.preventDefault(); sendChannelChatMessage(guildUID, guildID, channelID, channelType) };

    if (event.keyCode === 50 && event.shiftKey) {
      event.preventDefault();
      // Start Search
      window.clearInterval(autocompleteTimeout);
      $(`#${scopedActiveChannel}PingSelect`).removeClass('fadeOut');
      $(`#${scopedActiveChannel}PingSelect`).addClass('fadeIn');
      $(`#${scopedActiveChannel}PingSelect`).removeClass('hidden');
      autoCompleteOpen[scopedActiveChannel] = true;

      $(`#${scopedActiveChannel}ChatMessageInputAutocomplete`).get(0).focus();
      $(`#${scopedActiveChannel}AutoCompleteResults`).empty();
      $(`#${scopedActiveChannel}AutoCompleteResults`).html(`<p class="notice">Enter a username.</p>`);
      $(`#${scopedActiveChannel}ChatMessageInputAutocomplete`).val('');

      const handler = (event) => {
        if (event && event.keyCode === 27) {
          closePingSelector(scopedActiveChannel);
          $(`#${scopedActiveChannel}ChatMessageInput`).get(0).focus();
          return;
        }

        if (event && event.keyCode === 13) { event.preventDefault();
          const firstItem = $(`#${scopedActiveChannel}AutoCompleteResults`).children().first().get(0)
          if (firstItem) {
            addPingToMessage(scopedActiveChannel, firstItem.id.split('PingSelector')[1], firstItem.getAttribute('userName'));
          }
          return;
        };

        const inputVal = $(`#${scopedActiveChannel}ChatMessageInputAutocomplete`).val();
        $(`#${scopedActiveChannel}AutoCompleteResults`).empty();
        for (let i = 0; i < serverData[guildUID + guildID].members.length; i++) {
          const member = serverData[guildUID + guildID].members[i].split('.');
          if (member[0].includes(inputVal) && member[1] !== user.uid) {
            if (!messagePings[scopedActiveChannel] || !messagePings[scopedActiveChannel].includes(`${member[0]}.${member[1]}`)) {
              const a = document.createElement('div');
              a.innerHTML = member[0];
              a.id = `PingSelector${member[1]}`;
              a.setAttribute('userName', member[0]);
              a.setAttribute('onclick', `addPingToMessage('${scopedActiveChannel}', '${member[1]}', '${member[0]}')`);
              $(`#${scopedActiveChannel}AutoCompleteResults`).get(0).appendChild(a);
            }
          }
        }
      }

      handler(null);
      $(`#${scopedActiveChannel}ChatMessageInputAutocomplete`).get(0).removeEventListener('keyup', handler);
      $(`#${scopedActiveChannel}ChatMessageInputAutocomplete`).get(0).addEventListener('keyup', handler);
    }

    if (event.keyCode === 32 || event.keyCode === 8 || event.keyCode === 27) {
      if (autoCompleteOpen[scopedActiveChannel]) {
        closePingSelector(scopedActiveChannel);
      }
    }
  });
}

window.removePingFromMessage = (scopedActiveChannel, guildUID, userName) => {
  $(`#${scopedActiveChannel}${guildUID}pingMessage`).remove();
  messagePings[scopedActiveChannel].splice(messagePings[scopedActiveChannel].indexOf(`${userName}.${guildUID}`), 1);
  if (!messagePings[scopedActiveChannel].length) {
    hidePingSelectors(scopedActiveChannel);
  }
}

window.addPingToMessage = (scopedActiveChannel, guildUID, userName) => {
  closePingSelector(scopedActiveChannel);
  $(`#${scopedActiveChannel}ChatMessageInput`).get(0).focus();
  
  window.clearTimeout(autocompleteTimeout2);
  $(`#${scopedActiveChannel}PingAutocomplete`).removeClass('hidden');
  $(`#${scopedActiveChannel}PingAutocomplete`).addClass('fadeInUp');
  $(`#${scopedActiveChannel}PingAutocomplete`).removeClass('fadeOutDown');
  
  if (!messagePings[scopedActiveChannel] || !messagePings[scopedActiveChannel].length) {
    $(`#${scopedActiveChannel}PingAutocomplete`).empty();
  }

  if (!$(`#${scopedActiveChannel}${guildUID}pingMessage`).length) { // If element does not exist
    const a = document.createElement('div');
    a.classList.add('pingPreviewItem');
    a.id = scopedActiveChannel + guildUID + 'pingMessage'
    a.innerHTML = `${userName}<button onclick="removePingFromMessage('${scopedActiveChannel}', '${guildUID}', '${userName}')" class="btn closeButtonPing"><i class="bx bx-x"></i></button>`;
    $(`#${scopedActiveChannel}PingAutocomplete`).get(0).appendChild(a);
    console.log('here');
    if (!messagePings[scopedActiveChannel]) {
      messagePings[scopedActiveChannel] = [];
    }
    messagePings[scopedActiveChannel].push(`${userName}.${guildUID}`);

    insertAtCursor($(`#${scopedActiveChannel}ChatMessageInput`), `@${userName} `);
  }
}

function hidePingSelectors(scopedActiveChannel) {
  $(`#${scopedActiveChannel}PingAutocomplete`).removeClass('fadeInUp');
  $(`#${scopedActiveChannel}PingAutocomplete`).addClass('fadeOutDown');
  autocompleteTimeout2 = window.setTimeout(() => {
    $(`#${scopedActiveChannel}PingAutocomplete`).addClass('hidden');
    $(`#${scopedActiveChannel}PingAutocomplete`).empty();
  }, 500)
}

window.closePingSelector = (scopedActiveChannel) => {
  $(`#${scopedActiveChannel}PingSelect`).removeClass('fadeIn');
  $(`#${scopedActiveChannel}PingSelect`).addClass('fadeOut');
  autocompleteTimeout = window.setTimeout(() => {
    $(`#${scopedActiveChannel}PingSelect`).addClass('hidden');
  }, 500);
}

export function prepareEditMessage(scopedActiveChannel, messageID) {
  // Delete old element, create new one. Do this to remove listenrs
  $(`#messageContentOfID${messageID}`).get(0).parentNode.replaceChild($(`#messageContentOfID${messageID}`).get(0).cloneNode(true), $(`#messageContentOfID${messageID}`).get(0));
  cachedEditMessages[messageID] = messageHTMLtoText(null, $(`#messageContentOfID${messageID}`).get(0));
  $(`#messageContentOfID${messageID}`).html(messageHTMLtoText(null, $(`#messageContentOfID${messageID}`).get(0)));
  $(`#messageContentOfID${messageID}`).attr('contenteditable', 'true');
  $(`#messageContentOfID${messageID}`).addClass('contentEditableMessage');
  $(`#messageContentOfID${messageID}`).removeClass('acceptLeftClick');
  $(`#messageContentOfID${messageID}`).get(0).focus();
  window.setTimeout(() => {
    const contentEditableElement = $(`#messageContentOfID${messageID}`).get(0);
    const range = document.createRange();
    range.selectNodeContents(contentEditableElement);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }, 9);

  // Set listeners
  $(`#messageContentOfID${messageID}`).get(0).addEventListener("keyup", async (event) => {
    if (event.code == "Enter") {
      event.preventDefault();
      const content = $(`#messageContentOfID${messageID}`).get(0).innerHTML;

      if (cachedEditMessages[messageID] == content) {
        unEditMessage(messageID, scopedActiveChannel);
        return;
      }

      // Make firebase request
      await update(ref(rtdb, `channels/${scopedActiveChannel}/messages/${messageID}`), {
        content: content,
        editedDate: rtdbts(),
        edited: true
      }); // Do not create indicator.
      cachedEditMessages[messageID] = content;
      unEditMessage(messageID, scopedActiveChannel);
      console.log('Edited message.');
    }
    else if (event.code == 'Escape') {
      event.preventDefault();
      unEditMessage(messageID, scopedActiveChannel);
    }
  });
}

function unEditMessage(messageID, scopedActiveChannel) {
  $(`#messageContentOfID${messageID}`).get(0).blur();
  $(`#messageContentOfID${messageID}`).attr('contenteditable', 'false');
  $(`#messageContentOfID${messageID}`).removeClass('contentEditableMessage');
  $(`#messageContentOfID${messageID}`).addClass('acceptLeftClick');
  $(`#messageContentOfID${messageID}`).html(cachedEditMessages[messageID]);
  twemoji.parse($(`#messageContentOfID${messageID}`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });
  $(`#${scopedActiveChannel}ChatMessageInput`).get(0).focus();
}