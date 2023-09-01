import { getFirestore, onSnapshot, doc, setDoc, serverTimestamp } from '@firebase/firestore';
import { getDatabase, off, onDisconnect, onValue, query, ref, remove, set, update } from '@firebase/database';
import { closeModal, commonArrayDifference, createEmptyAudioTrack, createEmptyVideoTrack, disableButton, disableDMCallUI, displayImageAnimation, dmKEYify, enableButton, hideServerCallUI, isObjEmpty, openModal, setNoTrackUI, showDMCall, showServerCallUI, timer } from './app';
import { leaveListeningParty } from './vcMusic';
import { retrieveSetting, returnActiveDeviceID, returnActiveDeviceIDOutput } from './settings';
import { endCallDM } from './friends';
import { playDeafen, playMute, playRingtone } from './sounds';
import { checkAppInitialized } from './firebaseChecks';
import { getSources } from './electronApp';

checkAppInitialized();
const db = getFirestore();
const rtdb = getDatabase();

const callDurationConstant = 18 // seconds

window.connectedUsers = [];
window.connectedPeers = [];
window.voiceIndicatorsUsers = [];
window.cacheVoiceChatConnections = [];
window.friendActiveCallLibrary = {};
window.cacheMediaConnectedMembers = [];
window.cacheChannelData = {};
window.channelData = {};
window.peerIDstoUIDs = {};
window.voiceTimeouts = {};

window.myPeer = new Peer(); 
window.myPeerID = null;
window.myPeerVideo = new Peer(); 
window.myPeerVideoID = null;
window.currentCall = null;

window.callUserTimeout = null;
window.searchInterval = null;
window.searchIntervalMedia = null;
window.inactivityTimeout = null;
window.incomingCallTimeouts = {};

window.mediaStream = null;
window.videoMediaStream = null;
window.audioContext = null;

window.onDisconnectRef = null;
window.miniCallListener = null;
window.voiceChatConnectionsListener = null;

window.currentCallMedia = null;
window.connectedMediaUsers = [];
window.connectedToVideo = false;

window.isMuted = false;
window.isDeafened = false;
window.deafenCausedByMute = false;

myPeer.on('open', (ID) => {
  myPeerID = ID
});

myPeerVideo.on('open', (ID) => {
  myPeerVideoID = ID
});


export async function listenCalls() {
  onSnapshot(doc(db, `calls/${user.uid}`), async (snapshot) => {
    if (!snapshot.exists()) {
      return;
    }

    // My incoming calls.
    const keys = Object.keys(snapshot.data());
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = snapshot.data()[key]
      const uID = key.split('.')[0]
      const username = key.split('.')[1]

      if (value == 'Rejected' || value == 'Accepted' || value == 'Missed' || value == 'Cancelled') {
        // Hide the incoming call.

        window.clearTimeout(incomingCallTimeouts[uID]);
        $(`#incomingCall${uID}`).addClass('incomingCallGone');
        $(`#incomingCall${uID}`).removeClass('fadeInRight');
        $(`#incomingCall${uID}`).addClass('fadeOutRight');
        window.setTimeout(() => {
          $(`#incomingCall${uID}`).remove();
          playRingtone(); // See if it should be stopped.
        }, 599);

        continue;
      }

      if (value.toDate() > new Date(new Date().getTime() - callDurationConstant*1000))  {        
        // May run multiple times. Show the incoming call
        if ($(`#incomingCall${uID}`).length) {
          continue;
        }

        const a = document.createElement('div');
        a.setAttribute('class', 'incomingCall animated fadeInRight faster')
        a.id = `incomingCall${uID}`;
        a.innerHTML = `
          <div class="incomingCallContent">
            <div class="incomingCallContentHeader">
              <img class="incomingCallContentImage" id="incomingCallContentImage${uID}" />
              <div>
                <p><i class="bx bx-phone-incoming"></i> Incoming Call</p>
                <h3 class="incomingCallContentName">${username}</h3>
              </div>
            </div>
            <center>
              <button id="rejectIncomingCallButton${uID}" class="btn rejectCallButton">
                <i class="bx bx-x-circle"></i>
              </button>
              <button id="acceptIncomingCallButton${uID}" class="btn acceptCallButton">
                <i class="bx bx-phone-call"></i>
              </button>
            </center>
            <button id="noActionCallButton${uID}" class="btn noActionCallButton">
              <i class="bx bx-x"></i>
            </button>
          </div>
        `
        $(`#incomingCallContainer`).get(0).appendChild(a);
        $(`#incomingCallContentImage${uID}`).get(0).src = await returnProperURL(uID);
        displayImageAnimation(`incomingCallContentImage${uID}`);

        $(`#acceptIncomingCallButton${uID}`).get(0).onclick = () => {acceptIncomingCall(uID, key)};
        $(`#rejectIncomingCallButton${uID}`).get(0).onclick = () => {rejectIncomingCall(uID, key)};
        $(`#noActionCallButton${uID}`).get(0).onclick = () => {noActionCall(uID, key)};
        playRingtone() // Start ringtone if it hasnt already.

        // If it doesn't get removed automatically.
        window.clearTimeout(incomingCallTimeouts[uID]);
        incomingCallTimeouts[uID] = window.setTimeout(() => {
          $(`#incomingCall${uID}`).addClass('incomingCallGone');
          $(`#incomingCall${uID}`).removeClass('fadeInRight');
          $(`#incomingCall${uID}`).addClass('fadeOutRight');
          window.setTimeout(() => {
            $(`#incomingCall${uID}`).remove();
            playRingtone(); // See if it should be stopped.
          }, 599);
        }, callDurationConstant*1000);
      }
    }
  });
}

window.callUser = async (uID, username) => {
  $(`#callUserButton${uID}`).addClass('disabled');

  endCallDM(uID); // For display purposes.

  window.setTimeout(() => {
  $(`#callUserButton${uID}`).removeClass('disabled');
  }, 3499);

  if (currentCall == dmKEYify(user.uid, uID)) {
    if (localStorage.getItem('helperNotifyThree') !== 'true') {
      localStorage.setItem('helperNotifyThree', 'true');
      notifyTiny('You are already in this call.')
    }
    return;
  }

  await endAllCalls();

  if (friendActiveCallLibrary[uID] && friendActiveCallLibrary[uID][uID] && friendActiveCallLibrary[uID][uID].connected) {
    acceptIncomingCall(uID, `${uID}.${username}`);
    return;
  }

  // If incoming call, accept it instead of creating new one.
  if ($(`#incomingCall${uID}`).length) {
    acceptIncomingCall(uID, `${uID}.${username}`);
    return;
  }

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: returnActiveDeviceID(),
        echoCancellation: retrieveSetting('echoCancellation'),
        noiseSuppression: retrieveSetting('noiseSuppression'),
      },
      video: false
    });
  } catch (error) {
    snac('No permission', 'Unable to connect to the selected audio device.', 'danger');
    return;
  }

  await setDoc(doc(db, `calls/${uID}`), {
    [`${user.uid}.${cacheUser.username}`]: serverTimestamp()
  }, { merge: true }); // Call request sent. Listen to their response.

  $(`#dmconnectedbolt`).get(0).setAttribute('class', 'bx bxs-planet');
  $(`#dmconnectedstatus`).html('Ringing');

  const callObserver = onSnapshot(doc(db, `calls/${uID}`), (snapshot) => {

    const value = snapshot.data()[`${user.uid}.${cacheUser.username}`];

    switch (value) {
      case 'Rejected':
        callObserver();
        window.clearTimeout(callUserTimeout);
        $(`#dmconnectedbolt`).get(0).setAttribute('class', 'bx');
        $(`#dmconnectedstatus`).html('💔 Rejected');
        twemoji.parse($(`#dmconnectedstatus`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });
        break;
      case 'Accepted':
        callObserver();
        window.clearTimeout(callUserTimeout);
        break;
      case 'Missed':
        callObserver();
        window.clearTimeout(callUserTimeout);
        $(`#dmconnectedbolt`).get(0).setAttribute('class', 'bx bxs-planet');
        $(`#dmconnectedstatus`).html('Not Connected');
        break;
      default:
        break;
    }
  });

  window.clearTimeout(callUserTimeout);
  callUserTimeout = window.setTimeout(async () => {
    await setDoc(doc(db, `calls/${uID}`), {
      [`${user.uid}.${cacheUser.username}`]: 'Missed'
    }, { merge: true })
  }, callDurationConstant * 1000);

  joinVoiceChannel(dmKEYify(user.uid, uID), () => {
    showDMCall(uID, username)
  }, uID);
}

async function acceptIncomingCall(uID, docKey) {
  disableButton($(`#acceptIncomingCallButton${uID}`));
  disableButton($(`#rejectIncomingCallButton${uID}`));
  disableButton($(`#noActionCallButton${uID}`));
  
  await endAllCalls();

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: returnActiveDeviceID(),
        echoCancellation: retrieveSetting('echoCancellation'),
        noiseSuppression: retrieveSetting('noiseSuppression'),
      },
      video: false
    });
  } catch (error) {
    snac('No permission', 'Unable to connect to the selected audio device.', 'danger');
    return;
  }
  
  await setDoc(doc(db, `calls/${user.uid}`), {
    [docKey]: 'Accepted'
  }, {merge: true});  

  joinVoiceChannel(dmKEYify(user.uid, uID), () => {
    showDMCall(uID, docKey.split('.')[1]);
    $(`#dmconnectedbolt`).get(0).setAttribute('class', 'bx bxs-bolt lightningAnimation');
    $('#dmconnectedstatus').html(`Connected`);
  }, uID);
}

async function rejectIncomingCall(uID, docKey) {
  disableButton($(`#acceptIncomingCallButton${uID}`));
  disableButton($(`#rejectIncomingCallButton${uID}`));
  disableButton($(`#noActionCallButton${uID}`));
  
  
  await setDoc(doc(db, `calls/${user.uid}`), {
    [docKey]: 'Rejected'
  }, {merge: true});
}

async function noActionCall(uID, docKey) {
  disableButton($(`#acceptIncomingCallButton${uID}`));
  disableButton($(`#rejectIncomingCallButton${uID}`));
  disableButton($(`#noActionCallButton${uID}`));

  window.clearTimeout(incomingCallTimeouts[uID]);
  $(`#incomingCall${uID}`).addClass('incomingCallGone');
  $(`#incomingCall${uID}`).removeClass('fadeInRight');
  $(`#incomingCall${uID}`).addClass('fadeOutRight');
  window.setTimeout(() => {
    $(`#incomingCall${uID}`).remove();
    playRingtone(); // See if it should be stopped.
  }, 599);
}

window.joinChannelVC = async (serverUID, serverID, channelID) => {
  // Half legacy function.
  const scopedActiveChannel = `${serverUID}${serverID}${channelID}`;
  disableButton($(`#${scopedActiveChannel}voiceChatButton`));
  await endAllCalls();

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: returnActiveDeviceID(),
        echoCancellation: retrieveSetting('echoCancellation'),
        noiseSuppression: retrieveSetting('noiseSuppression'),
      },
      video: false
    });
  } catch (error) {
    snac('No permission', 'Unable to connect to the selected audio device.', 'danger');
    enableButton($(`#${scopedActiveChannel}voiceChatButton`), '<i class="bx bx-phone"></i>');
    return;
  }

  joinVoiceChannel(`${serverUID}${serverID}/${channelID}`, () => {
    enableButton($(`#${scopedActiveChannel}voiceChatButton`), '<i class="bx bx-phone-off"></i>');
    $(`#${scopedActiveChannel}voiceChatButton`).addClass('disconnectButton');
    $(`#${scopedActiveChannel}voiceChatButton`).get(0).onclick = () => { endAllCalls() };
    showServerCallUI(serverUID, serverID, channelID);

    $(`#voiceChatButtonVideo${serverUID}${serverID}`).get(0).onclick = () => { shareVideo(serverUID + serverID, channelID) };
    $(`#voiceChatButtonScreen${serverUID}${serverID}`).get(0).onclick = () => { shareScreen(serverUID + serverID, channelID) };
  });
}

async function joinVoiceChannel(key, callback, otherUser) {
  $(`#accountServer`).addClass('inCall');

  connectedUsers = [];
  voiceIndicatorsUsers = [];
  connectedPeers = [];
  connectedMediaUsers = [];
  cacheMediaConnectedMembers = [];
  peerIDstoUIDs = {};
  cacheVoiceChatConnections = [];

  window.clearTimeout(inactivityTimeout);

  window.setTimeout(async () => {
    try { 
      if (audioContext.state == 'running') {
        await audioContext.close()
      }
    } catch (error) { }; // Close the previous audio context if available.
    setVoiceIndicators();
  }, 499);
  
  myPeer.on('call', function(call) {
    call.answer(mediaStream);

    connectedPeers.push(call.peer);
    if (peerIDstoUIDs[call.peer]) {
      connectedUsers.push(peerIDstoUIDs[call.peer]);
    }

    call.on('stream', async function(stream) {
      console.log('recieved stream')

      if (peerIDstoUIDs[call.peer]) {
        if ($(`.${peerIDstoUIDs[call.peer]}usersAudio`).length) {
          $(`.${peerIDstoUIDs[call.peer]}`).get(0).srcObject = stream;
          $(`.${peerIDstoUIDs[call.peer]}`).get(0).play();
          putVolumeOnStream(peerIDstoUIDs[call.peer]);
        }
        else {
          $(`#${peerIDstoUIDs[call.peer]}usersAudio`).remove();
          const a = document.createElement('audio');
          a.classList.add('usersAudio');
          a.srcObject = stream;
          a.volume = 0.5;
          a.muted = isDeafened
          try {
            await a.setSinkId(returnActiveDeviceIDOutput());
          } catch (error) {
            snac('No permission', 'Unable to connect to the selected audio device.', 'danger');
          }
          a.id = peerIDstoUIDs[call.peer] + 'usersAudio';
          $(`#mediaStreamsContainer`).get(0).appendChild(a);
          a.play();
          putVolumeOnStream(peerIDstoUIDs[call.peer]);
        }
      }
      else {
        // Don't have the UID yet.
        $(`#${call.peer}usersAudio`).remove();
        const a = document.createElement('audio');
        a.classList.add('usersAudio');
        a.srcObject = stream;
        a.volume = 0.5;
        a.muted = isDeafened
        try {
          await a.setSinkId(returnActiveDeviceIDOutput());
        } catch (error) {
          snac('No permission', 'Unable to connect to the selected audio device.', 'danger');
        }
        a.id = call.peer + 'usersAudio'
        $(`#mediaStreamsContainer`).get(0).appendChild(a);
        a.play();
      }
    });
  });

  currentCall = key;
  notifyTiny('Voice Chat: Connected', false);

  voiceChatConnectionsListener = onValue(query(ref(rtdb, `voice/${key}`)), (snapshot) => {
    // Connect to each partner.
    if (snapshot.val()) {
      const keys = Object.keys(snapshot.val());

      try {
        if (otherUser) { // DM Call
          if (keys.length == 1) {
            // Put sound here?
            if (connectedToVideo) {
              leaveVideoDM(connectedToVideo);
            }
            connectedUsers = [];
            voiceIndicatorsUsers = [];
            connectedPeers = [];
            connectedMediaUsers = [];
            cacheMediaConnectedMembers = [];
            cacheVoiceChatConnections = [];
            peerIDstoUIDs = {};
            $(`#dmconnectedbolt`).get(0).setAttribute('class', 'bx bxs-planet');
            if ($('#dmconnectedstatus').html() !== 'Ringing') {
              $('#dmconnectedstatus').html(`Not Connected`);
            }
            inactivityTimeout = window.setTimeout(() => {
              if (retrieveSetting('inactivityTimeout', true)) {
                snac('Disconnected', 'You have been disconnected due to inactivity.');
                endAllCalls();
              }
            }, 15 * 1000 * 60); // 15 minutes
          }
          else {
            // Connected
            window.clearTimeout(inactivityTimeout);
            if (snapshot.val()[otherUser].deafened) { // Deafen takes priority
              $(`#dmconnectedbolt`).get(0).setAttribute('class', 'bx bx-volume-mute redText');
              $('#dmconnectedstatus').html(`Deafened`);
            }
            else if (snapshot.val()[otherUser].muted) {
              $(`#dmconnectedbolt`).get(0).setAttribute('class', 'bx bx-microphone-off redText');
              $('#dmconnectedstatus').html(`Muted`);
            }
            else {
              $(`#dmconnectedbolt`).get(0).setAttribute('class', 'bx bxs-bolt');
              $('#dmconnectedstatus').html(`Connected`);
            }

          }
        } 
      } catch (error) { }


      // Forwad, backward

      const connectedUsersForward = commonArrayDifference(keys, cacheVoiceChatConnections);
      const connectedUsersBackward = commonArrayDifference(cacheVoiceChatConnections, keys);
      cacheVoiceChatConnections = keys;

      for (let i = 0; i < connectedUsersForward.length; i++) { // Connected
        const key = connectedUsersForward[i];
        const value = snapshot.val()[key];
        if (key !== user.uid) {
          makeConnection(value.uid, value.peer, value.username);
        }  
      }

      for (let i = 0; i < connectedUsersBackward.length; i++) {
        const key = connectedUsersForward[i];
        connectedUsers.splice(connectedUsers.indexOf(key), 1);
        voiceIndicatorsUsers.splice(voiceIndicatorsUsers.indexOf(key), 1);
      }
    }
    
  })

  await set(ref(rtdb, `voice/${key}/${user.uid}`), {
    connected: true,
    peer: myPeerID,
    username: cacheUser.username,
    uid: user.uid,
  });

  onDisconnectRef = `voice/${key}/${user.uid}`
  onDisconnect(ref(rtdb, `voice/${key}/${user.uid}`)).remove();

  if (isMuted) {
    muteSelf(); // Unmute self.
  }
  if (isDeafened) {
    deafenSelf(); // Deafen self.
  }
  deafenCausedByMute = false;

  callback();
}

async function makeConnection(uID, peerID, username) {  
  if (!connectedUsers.includes(uID)) {
    console.log('Connecting to ' + username)
    if (user.uid > uID) {
      connectedUsers.push(uID);
      connectedPeers.push(peerID);
      peerIDstoUIDs[peerID] = uID;
      // I am the one to make the connection and the connection
      // has not already been made to this user. Create now:
      window.setTimeout(() => {
        const call = myPeer.call(peerID, mediaStream);
        call.on('stream', async function(stream) {
          console.log('recieved stream')

          if ($(`.${uID}usersAudio`).length) {
            $(`.${uID}`).get(0).srcObject = stream;
            $(`.${uID}`).get(0).play();
            putVolumeOnStream(uID);
          }
          else {
            $(`#${uID}usersAudio`).remove();
            const a = document.createElement('audio');
            a.classList.add('usersAudio');
            a.srcObject = stream;
            a.volume = 0.5;
            a.muted = isDeafened
            try {
              await a.setSinkId(returnActiveDeviceIDOutput());
            } catch (error) {
              snac('No permission', 'Unable to connect to the selected audio device.', 'danger');
            }
            a.id = uID + 'usersAudio';
            $(`#mediaStreamsContainer`).get(0).appendChild(a);
            a.play();
            putVolumeOnStream(peerIDstoUIDs[call.peer]);
          }
        });
      }, 999)
    }
    else {
      // Will be recieving connection, attach peerid to uid
      if (connectedPeers.includes(peerID)) {
        connectedUsers.push(uID);
      }
      else {
        peerIDstoUIDs[peerID] = uID;
      }

      console.log('a')

      if (!$(`#${uID}usersAudio`).length) {
        // Issues with registering the ID.
        console.log('a')

        if (!$(`#${peerID}usersAudio`).length) {
          // No element is built yet, other function will find the ID from vars.
      console.log('a')

        }
        else {
      console.log('a')

          // Element is built. Replace PeerID with userID and set volume
          $(`#${peerID}usersAudio`).get(0).id = uID + 'usersAudio';
          putVolumeOnStream(uID);
        }

      }
      else {
        // Element is built already with the proper UID ID.
      }
    }
  }
  
}

export function endAllCalls() {
  return new Promise( async (resolve, reject) => {
    console.log('Calls ending.')

    $(`#accountServer`).removeClass('inCall');

    if (currentCall) {
      console.log('Voice disconnected. Notify maybe.')
    }

    try { await voiceChatConnectionsListener(); } catch (error) {}
    if (onDisconnectRef) {
      await onDisconnect(ref(rtdb, onDisconnectRef)).cancel();
      await remove(ref(rtdb, onDisconnectRef));
    }
  
    window.clearInterval(connectedMusicInterval)

    myPeer.destroy();

    disableDMCallUI();
    if (mediaStream) {
      mediaStream.getTracks().forEach(function(track) {
        track.stop();
      });
    }

    if (audioContext) {
      audioContext.close()
    }
    
    if (videoMediaStream) {
      videoMediaStream.getTracks().forEach(function(track) {
        track.stop();
      });
    }

    if (currentCall && currentCall.includes('/')) { // Lounge
      hideServerCallUI(currentCall.substring(0, 28), currentCall.substring(28, 48), currentCall.split('/')[1]);
      const nonModifiedServerID = currentCall.replaceAll('/', '');
      enableButton($(`#${nonModifiedServerID}voiceChatButton`), '<i class="bx bx-phone"></i>');
      $(`#${nonModifiedServerID}voiceChatButton`).removeClass('disconnectButton');
      const currentCallRecord = `${currentCall}`
      $(`#${nonModifiedServerID}voiceChatButton`).get(0).onclick = () => {
        joinChannelVC(currentCallRecord.substring(0, 28), currentCallRecord.substring(28, 48), currentCallRecord.split('/')[1]);
      }

      if (activeListeningParty) {
        // Ask to leave listening party
        openModal('leavePartyCheck');
        $(`#confirmLeaveParty`).get(0).onclick = () => {
          if (activeListeningParty) {
            leaveListeningParty(activeListeningParty.split('/')[0], activeListeningParty.split('/')[1], activeListeningParty.split('/')[2]);
            closeModal();
          }
          else {
            closeModal();
          }
        }
      }

      leaveVideo(currentCallRecord.substring(0, 28), currentCallRecord.substring(28, 48), currentCallRecord.split('/')[1]);
      $(`#voiceChatButtonScreen${currentCallRecord.split('/')[0]}`).removeClass('disabled');
      $(`#voiceChatButtonVideo${currentCallRecord.split('/')[0]}`).removeClass('disabled');
      $(`#voiceChatButtonVideo${currentCallRecord.split('/')[0]}`).html('<i class="bx bx-video"></i>');
      $(`#voiceChatButtonScreen${currentCallRecord.split('/')[0]}`).removeClass('screenButtonActive');
      $(`#voiceChatButtonScreen${currentCallRecord.split('/')[0]}`).html('<i class="bx bx-desktop"></i>');
      $(`#voiceChatButtonVideo${currentCallRecord.split('/')[0]}`).removeClass('videoButtonActive');
      window.setTimeout(() => {
        $(`#voiceChatButtonScreen${currentCallRecord.split('/')[0]}`).get(0)._tippy.setContent(`Stream Screen`);
        $(`#voiceChatButtonVideo${currentCallRecord.split('/')[0]}`).get(0)._tippy.setContent(`Stream Video`);
      }, 1599);
      // Turn off actively playing music.

      if (channelTabLibrary[nonModifiedServerID] == 'Music') { // Kick off music tab when leave call.
        modifyChannelTab(currentCall.substring(0, 28), currentCall.substring(28, 48), currentCall.split('/')[1], 'Chat');
      }
    }
    else {
      $(`#voiceChatButtonVideoFriends`).removeClass('disabled');
      $(`#voiceChatButtonScreenFriends`).removeClass('disabled');
      $(`#voiceChatButtonScreenFriends`).html(`<i class="bx bx-desktop"></i>`);
      $(`#voiceChatButtonVideoFriends`).html(`<i class="bx bx-video"></i>`);
      $(`#voiceChatButtonVideoFriends`).removeClass('videoButtonActive');
      $(`#voiceChatButtonScreenFriends`).removeClass('screenButtonActive');
      window.setTimeout(() => {
        $(`#voiceChatButtonScreenFriends`).get(0)._tippy.setContent(`Stream Screen`);
        $(`#voiceChatButtonVideoFriends`).get(0)._tippy.setContent(`Stream Video`);
      }, 1599);
      leaveVideoDM(currentCall);

      // Might be worth updating the call status here to cancelled.
      if (currentCall) {
        await setDoc(doc(db, `calls/${currentCall.replace(user.uid, '')}`), {
          [`${user.uid}.${cacheUser.username}`]: "Cancelled"
        }, { merge: true }); // Call request sent. Listen to their response.
      }
    }
  
    currentCall = null;
    connectedMediaUsers = [];
    cacheMediaConnectedMembers = [];
    connectedUsers = [];
    voiceIndicatorsUsers = [];
    connectedPeers = [];
    cacheVoiceChatConnections = [];
    peerIDstoUIDs = {};

    searchInterval = window.setInterval(() => {
      if (myPeer.destroyed) {
        window.clearInterval(searchInterval);
        myPeer = new Peer();
        myPeer.on('open', (ID) => {
          console.log('Peer opened.')
          myPeerID = ID;
          resolve(true)
        });
      }
    }, 99); // Run every 99ms.
  });
}

// Friends VC
export async function manageVCFriendsDisplay(uID, data) {
  // Recieving VC data beacuse the channel is active.
  friendActiveCallLibrary[uID] = data;

  if (data && data[uID] && data[uID].connected) {
    $(`#friendHeaderCallTag${uID}`).removeClass('hidden');
  }
  else {
    $(`#friendHeaderCallTag${uID}`).addClass('hidden');
  }

  // Screen share / video share

  if (data && data[uID] && data[uID].video) {
    $(`#friendHeaderVideo${uID}`).removeClass('hidden');
  }
  else {
    $(`#friendHeaderVideo${uID}`).addClass('hidden');
  }

  if (data && data[uID] && data[uID].screen) {
    $(`#friendHeaderScreen${uID}`).removeClass('hidden');
  }
  else {
    $(`#friendHeaderScreen${uID}`).addClass('hidden');
  }
}

// Lounge VC 

export async function manageVoiceChatDisplay(guildUID, guildID, channelIDInput, data) {
  let channelID = currentChannel;
  if (channelIDInput) {
    channelID = channelIDInput;
  }
  if (channelID) { // Channel request
    if (data !== undefined) { // New data is here
      channelData[`${guildUID}${guildID}`] = data;
      createVCChannelsIndicators(guildUID, guildID, data);
    }

    if (!channelData[`${guildUID}${guildID}`] || !channelData[`${guildUID}${guildID}`][channelID] || isObjEmpty(channelData[`${guildUID}${guildID}`][channelID])) {
      if (channelData[`${guildUID}${guildID}`] == null) { // If the whole server is empty.
        channelData[`${guildUID}${guildID}`] = {};
      }
      channelData[`${guildUID}${guildID}`][channelID] = {};
    }

  }
  else { // Its a general request. Store data to the correct variables. Only occurs when NOT in channel.
    channelData[`${guildUID}${guildID}`] = data;
    if (!data) { channelData[`${guildUID}${guildID}`] = {} }
    createVCChannelsIndicators(guildUID, guildID, data);
    return;
  }
  
  // Its a channel request. Display information in UI.
  const channelSpecificData = channelData[`${guildUID}${guildID}`][channelID];
  const channelSpecificDataKeys = Object.keys(channelData[`${guildUID}${guildID}`][channelID]);
  
  if (!cacheChannelData[`${guildUID}${guildID}`] || !cacheChannelData[`${guildUID}${guildID}`][channelID]) {
    cacheChannelData[`${guildUID}${guildID}`] = {};
    cacheChannelData[`${guildUID}${guildID}`][channelID] = {};
  }

  let cacheChannelSpecificData = cacheChannelData[`${guildUID}${guildID}`][channelID];
  let cacheChannelSpecificDataKeys = Object.keys(cacheChannelData[`${guildUID}${guildID}`][channelID]);
  
  if (!Object.entries(channelSpecificData).length) {
    $(`#channelSecondaryGrid${guildUID}${guildID}${channelID}`).removeClass('vcActive');
    voiceTimeouts[guildUID + guildID + channelID] = window.setTimeout(() => {
      if ($(`#${guildUID}${guildID}${channelID}VoiceList`).html() !== `<div class="inactiveChannel animated zoomIn"> <i class="bx bx-user-voice"></i> </div>`) {
        $(`#${guildUID}${guildID}${channelID}VoiceList`).html('<div class="inactiveChannel animated zoomIn"> <i class="bx bx-user-voice"></i> </div>');
      }
    }, 500);
  }
  else {
    $(`#channelSecondaryGrid${guildUID}${guildID}${channelID}`).addClass('vcActive');
    $(`.inactiveChannel`).removeClass('zoomIn')
    $(`.inactiveChannel`).addClass('zoomOut')
    clearTimeout(voiceTimeouts[guildUID + guildID + channelID]);
  }

  // Get differences.
  const voiceMembersForward = commonArrayDifference(Object.keys(channelData[`${guildUID}${guildID}`][channelID]), cacheChannelSpecificDataKeys);
  const voiceMembersBackward = commonArrayDifference(cacheChannelSpecificDataKeys, Object.keys(channelData[`${guildUID}${guildID}`][channelID]));

  cacheChannelData[`${guildUID}${guildID}`][channelID] = channelData[`${guildUID}${guildID}`][channelID];
  cacheChannelSpecificDataKeys = Object.keys(cacheChannelData[`${guildUID}${guildID}`][channelID]);

  for (let i = 0; i < voiceMembersForward.length; i++) {
    const userStatus = channelSpecificData[voiceMembersForward[i]];
    const uid = voiceMembersForward[i];

    window.clearTimeout(voiceTimeouts[`${userStatus.uid}${guildUID}${guildID}${channelID}`]);

    const a = document.createElement('div');
    a.id = `${userStatus.uid}${guildUID}${guildID}${channelID}CallItemContainer`;
    a.setAttribute('class', 'voiceChatUser callItemContainerGone ');
    a.setAttribute('userID', userStatus.uid);
    a.setAttribute('userName', userStatus.username);
    a.innerHTML = `
      <img userName="${userStatus.username}" userContext="voice" userID="${userStatus.uid}" id="${userStatus.uid}${guildUID}${guildID}${channelID}CallItem" class="invisible userContextItem acceptLeftClick voiceIndicatorAll voiceIndicator${userStatus.uid}" />
      <div id="${userStatus.uid}${guildUID}${guildID}${channelID}CallItemMute" class="animated fast hidden muteIcon">
        <i class="bx bx-microphone-off"></i>
      </div>
      <div id="${userStatus.uid}${guildUID}${guildID}${channelID}CallItemDeafen" class="animated fast hidden deafenIcon">
        <i class="bx bx-volume-mute"></i>
      </div>

      <button onclick="joinVideo('${guildUID}', '${guildID}', '${channelID}', '${userStatus.uid}', '${userStatus.username}')" id="${userStatus.uid}${guildUID}${guildID}${channelID}CallItemVideo" class="btn b-2 roundedButton animated fast hidden videoIcon">
        <i class="bx bx-video"></i>
      </button>

      <button onclick="joinScreen('${guildUID}', '${guildID}', '${channelID}', '${userStatus.uid}', '${userStatus.username}')" id="${userStatus.uid}${guildUID}${guildID}${channelID}CallItemScreen" class="btn b-2 roundedButton animated fast hidden screenIcon">
        <i class="bx bx-desktop"></i>
      </button>
    `;

    $(`#${guildUID}${guildID}${channelID}VoiceList`).get(0).appendChild(a);

    window.setTimeout(() => {
      $(`#${userStatus.uid}${guildUID}${guildID}${channelID}CallItemContainer`).removeClass('callItemContainerGone');

      tippy($(`#${userStatus.uid}${guildUID}${guildID}${channelID}CallItemVideo`).get(0), {
        content: 'Watch Stream',
        placement: 'top',
      });
  
      tippy($(`#${userStatus.uid}${guildUID}${guildID}${channelID}CallItemScreen`).get(0), {
        content: 'Watch Stream',
        placement: 'top',
      });
  
      tippy($(`#${userStatus.uid}${guildUID}${guildID}${channelID}CallItem`).get(0), {
        content: userStatus.username,
        placement: 'top',
      });
    }, 99);
    $(`#${userStatus.uid}${guildUID}${guildID}${channelID}CallItem`).get(0).src = await returnProperURL(userStatus.uid);
    displayImageAnimation(`${userStatus.uid}${guildUID}${guildID}${channelID}CallItem`);
  }

  for (let i = 0; i < voiceMembersBackward.length; i++) {
    const userID = voiceMembersBackward[i];
    $(`#${userID}${guildUID}${guildID}${channelID}CallItemContainer`).addClass('callItemContainerGone');
    voiceTimeouts[`${userID}${guildUID}${guildID}${channelID}`] = window.setTimeout(() => {
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemContainer`).remove();
    }, 500);
  }

  // Mutes and deafens. Videos and screenshares
  for (let i = 0; i < cacheChannelSpecificDataKeys.length; i++) {
    const value = cacheChannelData[`${guildUID}${guildID}`][channelID][cacheChannelSpecificDataKeys[i]]
    const userID = value.uid;

    clearTimeout(voiceTimeouts[`${userID}${guildUID}${guildID}${channelID}deafen`])
    clearTimeout(voiceTimeouts[`${userID}${guildUID}${guildID}${channelID}mute`])

    if (value.deafened) {
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemMute`).removeClass('zoomIn');
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemMute`).addClass('zoomOut');
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemDeafen`).removeClass('zoomOut');
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemDeafen`).addClass('zoomIn');
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemDeafen`).removeClass('hidden');
      voiceTimeouts[`${userID}${userID}${guildUID}${channelID}mute`] = window.setTimeout(() => {
        $(`#${userID}${guildUID}${guildID}${channelID}CallItemMute`).addClass('hidden');
      }, 499);
    }
    else if (value.muted) {
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemMute`).removeClass('zoomOut');
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemMute`).addClass('zoomIn');
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemMute`).removeClass('hidden');
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemDeafen`).removeClass('zoomIn');
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemDeafen`).addClass('zoomOut');
      voiceTimeouts[`${userID}${userID}${guildUID}${channelID}deafen`] = window.setTimeout(() => {
        $(`#${userID}${guildUID}${guildID}${channelID}CallItemDeafen`).addClass('hidden');
      }, 499);
    }
    else {
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemMute`).removeClass('zoomIn');
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemMute`).addClass('zoomOut');
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemDeafen`).removeClass('zoomIn');
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemDeafen`).addClass('zoomOut');
      voiceTimeouts[`${userID}${userID}${guildUID}${channelID}mute`] = window.setTimeout(() => {
        $(`#${userID}${guildUID}${guildID}${channelID}CallItemMute`).addClass('hidden');
      }, 499);
      voiceTimeouts[`${userID}${userID}${guildUID}${channelID}deafen`] = window.setTimeout(() => {
        $(`#${userID}${guildUID}${guildID}${channelID}CallItemDeafen`).addClass('hidden');
      }, 499);
    }

    if (value.video) {
      // Video is on.
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemVideo`).addClass('animated');
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemVideo`).removeClass('zoomOut');
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemVideo`).addClass('zoomIn');
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemVideo`).removeClass('hidden');
      window.setTimeout(() => {
        $(`#${userID}${guildUID}${guildID}${channelID}CallItemVideo`).removeClass('animated');
      }, 499);
    }
    else {
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemVideo`).addClass('animated');
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemVideo`).removeClass('zoomIn');
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemVideo`).addClass('zoomOut');
      window.setTimeout(() => {
        $(`#${userID}${guildUID}${guildID}${channelID}CallItemVideo`).addClass('hidden');
      }, 499);
    }

    if (value.screen) {
      // Screen is on.
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemScreen`).addClass('animated');
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemScreen`).removeClass('zoomOut');
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemScreen`).addClass('zoomIn');
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemScreen`).removeClass('hidden');
      window.setTimeout(() => {
        $(`#${userID}${guildUID}${guildID}${channelID}CallItemScreen`).removeClass('animated');
      }, 499);
    }
    else {
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemScreen`).addClass('animated');
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemScreen`).removeClass('zoomIn');
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemScreen`).addClass('zoomOut');
      window.setTimeout(() => {
        $(`#${userID}${guildUID}${guildID}${channelID}CallItemScreen`).addClass('hidden');
      }, 499);
    }
  }
}

function createVCChannelsIndicators(guildUID, guildID, inputData) {
  let data = inputData;
  if (!data || Object.keys(data).length == 0) {
    data = {};
  }

  $(`.${guildUID}${guildID}guildChannel`).removeClass('voiceGuildChannel');

  for (let i = 0; i < serverData[guildUID + guildID].channels.length; i++) {
    const channelID = serverData[guildUID + guildID].channels[i].split('.')[0];
    if (data[channelID] && Object.keys(data[channelID]).length) {
      $(`#${guildUID}${guildID}${channelID}guildChannelElement`).addClass('voiceGuildChannel');
    }
  }
}

window.muteSelf = async (deafenCaused, skipAudio) => {
  isMuted = !isMuted;
  mediaStream.getAudioTracks().forEach(track => track.enabled = !isMuted);

  $(`.muteButton`).addClass('disabled');

  $(`.muteButton`).removeClass('mutedButtonActive');
  $(`.muteButton`).html(`<i class="bx bx-microphone"></i>`);
  
  await update(ref(rtdb, `voice/${currentCall}/${user.uid}`), {
    muted: isMuted
  });

  if (isMuted) {
    $(`.muteButton`).addClass('mutedButtonActive');
    $(`.muteButton`).html(`<i class="bx bx-microphone-off"></i>`);
    if (!deafenCaused) {
      deafenCausedByMute = false;
    }
    if (!skipAudio) {
      // Play mute sound.
      playMute();
    }
  }
  else {
    if (isDeafened) {
      deafenSelf();
    }
  }

  if (currentCall.includes('/')) {
    // Group Call
    if (isMuted) {
      $(`#voiceChatButtonMute${currentCall.split('/')[0]}`).get(0)._tippy.setContent(`Unmute`);
    }
    else {
      $(`#voiceChatButtonMute${currentCall.split('/')[0]}`).get(0)._tippy.setContent(`Mute`);
    }
  }

  window.setTimeout(() => {
    $(`.muteButton`).removeClass('disabled');
  }, 999)
}

window.deafenSelf = async () => {
  isDeafened = !isDeafened;
  $('.usersAudio').prop('muted', isDeafened);

  $(`.deafenButton`).addClass('disabled');

  $(`.deafenButton`).removeClass('deafenButtonActive');
  $(`.deafenButton`).html(`<i class="bx bx-volume-full"></i>`);

  await update(ref(rtdb, `voice/${currentCall}/${user.uid}`), {
    deafened: isDeafened
  });

  if (isDeafened) {
    $(`.deafenButton`).addClass('deafenButtonActive');
    $(`.deafenButton`).html(`<i class="bx bx-volume-mute"></i>`);
    if (!isMuted) {
      deafenCausedByMute = true;
      muteSelf(true);
    }
    // Play deafen sound.
    playDeafen();
  }
  else {
    if (deafenCausedByMute) {
      if (isMuted) {
        muteSelf(false, true);
      }
    }
  }

  if (currentCall.includes('/')) {
    // Group Call
    if (isDeafened) {
      $(`#voiceChatButtonDeafen${currentCall.split('/')[0]}`).get(0)._tippy.setContent(`Undeafen`);
    }
    else {
      $(`#voiceChatButtonDeafen${currentCall.split('/')[0]}`).get(0)._tippy.setContent(`Deafen`);
    }
  }

  window.setTimeout(() => {
    $(`.deafenButton`).removeClass('disabled');
  }, 999)
}

function putVolumeOnStream(userID) { // Called when the stream is fully processed & added.
  let vol = localStorage.getItem('volumeOf' + userID);
  if (!vol || vol == 'null') {
    vol = `100`;
  }

  const audioVol = parseInt(vol) / 2;
  localStorage.setItem('volumeOf' + userID, vol);

  $(`#${userID}usersAudio`).get(0).volume = audioVol / 100;
  setVoiceIndicatorsOnUser(userID, $(`#${userID}usersAudio`).get(0).srcObject);
}

async function shareScreen(fullServerID, channelID, inDM) {
  connectedMediaUsers = [];
  cacheMediaConnectedMembers = [];

  $(`#voiceChatButtonVideo${fullServerID}`).addClass('disabled');
  $(`#voiceChatButtonScreen${fullServerID}`).addClass('disabled');
  window.setTimeout(() => {
    $(`#voiceChatButtonScreen${fullServerID}`).removeClass('disabled');
    $(`#voiceChatButtonScreen${fullServerID}`).get(0)._tippy.setContent(`End Stream`);
  }, 1500);

  if (!await handleScreenShare()) {
    snac('No permission', 'Unable to access your screen.', 'danger');
    $(`#voiceChatButtonVideo${fullServerID}`).removeClass('disabled');
    window.setTimeout(() => {
      $(`#voiceChatButtonScreen${fullServerID}`).get(0)._tippy.setContent(`Stream Screen`);
    }, 1599);
    return;
  }

  $(`#voiceChatButtonScreen${fullServerID}`).html(`<i class="bx bx-window-close"></i>`);
  $(`#voiceChatButtonScreen${fullServerID}`).addClass('screenButtonActive');
  $(`#voiceChatButtonScreen${fullServerID}`).get(0).onclick = () => {
    unShareScreen(fullServerID, channelID)
  }

  // Create a mini-voice channel within the voice channel.
  // Create listeners, handle requests, etc for it.
  // User will act as host. To join, create user field in the mini. 
  
  //Functions for closing streams to be added.
  miniCallListener = `voice/${fullServerID}/${channelID}/${user.uid}/media`;
  onValue(ref(rtdb, `${miniCallListener}`), async (value) => {
    // Call the user.

    if (value.val()) {
      const keys = Object.keys(value.val());

      const mediaVoiceForward = commonArrayDifference(keys, cacheMediaConnectedMembers);
      const mediaVoiceBackward = commonArrayDifference(cacheMediaConnectedMembers, keys);
      cacheMediaConnectedMembers = keys;

      for (let i = 0; i < mediaVoiceForward.length; i++) {
        const uid = mediaVoiceForward[i];
        if (!connectedMediaUsers.includes(uid)) {
          connectedMediaUsers.push(uid);
          myPeerVideo.call(value.val()[uid].peer, videoMediaStream);
        }

        try {
          if (channelData[fullServerID][channelID][uid].username) {
            snac(`New Viewer`, `${channelData[fullServerID][channelID][uid].username} has joined your stream.`, 'success');
          }  
        } catch (error) {
          // Probably left the channel or something.
        }
      }

      for (let i = 0; i < mediaVoiceBackward.length; i++) {
        const uid = mediaVoiceBackward[i];
        connectedMediaUsers.splice(connectedMediaUsers.indexOf(uid), 1);
      }
    }
    else {
      connectedMediaUsers = [];
      cacheMediaConnectedMembers = [];
    }
  });

  await update(ref(rtdb, `voice/${currentCall}/${user.uid}`), {
    screen: true
  });

  videoMediaStream.getVideoTracks()[0].onended = function () {
    unShareScreen(fullServerID, channelID);
  };
}

export async function shareScreenDM(uID) {
  connectedMediaUsers = [];
  cacheMediaConnectedMembers = [];

  $(`#voiceChatButtonVideoFriends`).addClass('disabled');
  $(`#voiceChatButtonScreenFriends`).addClass('disabled');
  window.setTimeout(() => {
    $(`#voiceChatButtonScreenFriends`).removeClass('disabled');
    $(`#voiceChatButtonScreenFriends`).get(0)._tippy.setContent(`End Stream`);
  }, 1500);

  console.log('here');


  if (!await handleScreenShare()) {
    snac('No permission', 'Unable to access your screen.', 'danger');
    $(`#voiceChatButtonVideoFriends`).removeClass('disabled');
    window.setTimeout(() => {
      $(`#voiceChatButtonScreenFriends`).get(0)._tippy.setContent(`Stream Screen`);
    }, 1599);
    return;
  }

  console.log('here');


  $(`#voiceChatButtonScreenFriends`).html(`<i class="bx bx-window-close"></i>`);
  $(`#voiceChatButtonScreenFriends`).addClass('screenButtonActive');
  $(`#voiceChatButtonScreenFriends`).get(0).onclick = () => {
    unShareScreenDM(uID)
  }

  miniCallListener = `voice/${currentCall}/${user.uid}/media`;
  onValue(ref(rtdb, `${miniCallListener}`), async (value) => {
    // Call the user.
    if (value.val()) {
      myPeerVideo.call(value.val()[uID].peer, videoMediaStream);
    }
    else {
      connectedMediaUsers = [];
      cacheMediaConnectedMembers = [];
    }
  });

  console.log('here');
  await update(ref(rtdb, `voice/${currentCall}/${user.uid}`), {
    screen: true
  });

  videoMediaStream.getVideoTracks()[0].onended = function () {
    unShareScreenDM(uID);
  };
}

export async function shareVideoDM(uID) {
  connectedMediaUsers = [];
  cacheMediaConnectedMembers = [];

  $(`#voiceChatButtonVideoFriends`).addClass('disabled');
  $(`#voiceChatButtonScreenFriends`).addClass('disabled');
  window.setTimeout(() => {
    $(`#voiceChatButtonVideoFriends`).removeClass('disabled');
    $(`#voiceChatButtonVideoFriends`).get(0)._tippy.setContent(`End Stream`);
  }, 1500);

  try {
    videoMediaStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true
    });
  } catch (error) {
    snac('No permission', 'Unable to find/connect to your video device.', 'danger');
    $(`#voiceChatButtonScreenFriends`).removeClass('disabled');
    window.setTimeout(() => {
      $(`#voiceChatButtonVideoFriends`).get(0)._tippy.setContent(`Stream Video`);
    }, 1599);
    return;
  }

  
  $(`#voiceChatButtonVideoFriends`).html(`<i class="bx bx-video-off"></i>`);
  $(`#voiceChatButtonVideoFriends`).addClass('videoButtonActive');
  $(`#voiceChatButtonVideoFriends`).get(0).onclick = () => {
    unShareVideoDM(uID);
  }

  miniCallListener = `voice/${dmKEYify(user.uid, uID)}/${user.uid}/media`;

  onValue(ref(rtdb, miniCallListener), async (value) => {
    // Call the user.
    if (value.val()) {
      myPeerVideo.call(value.val()[uID].peer, videoMediaStream);
    }
    else {
      connectedMediaUsers = [];
      cacheMediaConnectedMembers = [];
    }
  });

  await update(ref(rtdb, `voice/${currentCall}/${user.uid}`), {
    video: true
  });
}

async function shareVideo(fullServerID, channelID) {
  connectedMediaUsers = [];
  cacheMediaConnectedMembers = [];

  $(`#voiceChatButtonVideo${fullServerID}`).addClass('disabled');
  $(`#voiceChatButtonScreen${fullServerID}`).addClass('disabled');
  window.setTimeout(() => {
    $(`#voiceChatButtonVideo${fullServerID}`).removeClass('disabled');
    $(`#voiceChatButtonVideo${fullServerID}`).get(0)._tippy.setContent(`End Stream`);
  }, 1500);

  try {
    videoMediaStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true
    });
  } catch (error) {
    snac('No permission', 'Unable to find/connect to your video device.', 'danger');
    $(`#voiceChatButtonScreen${fullServerID}`).removeClass('disabled');
    window.setTimeout(() => {
      $(`#voiceChatButtonVideo${fullServerID}`).get(0)._tippy.setContent(`Stream Video`);
    }, 1599);
    return;
  }

  $(`#voiceChatButtonVideo${fullServerID}`).html(`<i class="bx bx-video-off"></i>`);
  $(`#voiceChatButtonVideo${fullServerID}`).addClass('videoButtonActive');
  $(`#voiceChatButtonVideo${fullServerID}`).get(0).onclick = () => {
    unShareVideo(fullServerID, channelID);
  }

  miniCallListener = `voice/${fullServerID}/${channelID}/${user.uid}/media`;

  onValue(ref(rtdb, miniCallListener), async (value) => {
    // Call the user.

    if (value.val()) {
      const keys = Object.keys(value.val());

      const mediaVoiceForward = commonArrayDifference(keys, cacheMediaConnectedMembers);
      const mediaVoiceBackward = commonArrayDifference(cacheMediaConnectedMembers, keys);
      cacheMediaConnectedMembers = keys;

      for (let i = 0; i < mediaVoiceForward.length; i++) {
        const uid = mediaVoiceForward[i];
        if (!connectedMediaUsers.includes(uid)) {
          connectedMediaUsers.push(uid);
          myPeerVideo.call(value.val()[uid].peer, videoMediaStream);
        }

        try {
          if (channelData[fullServerID][channelID][uid].username) {
            snac(`New Viewer`, `${channelData[fullServerID][channelID][uid].username} has joined your stream.`, 'success');
          }  
        } catch (error) {
          // Probably left the channel or something.
        }
      }

      for (let i = 0; i < mediaVoiceBackward.length; i++) {
        const uid = mediaVoiceBackward[i];
        connectedMediaUsers.splice(connectedMediaUsers.indexOf(uid), 1);
      }

    }
    else {
      connectedMediaUsers = [];
      cacheMediaConnectedMembers = [];
    }
  });

  await update(ref(rtdb, `voice/${currentCall}/${user.uid}`), {
    video: true
  });
}

async function unShareScreen(fullServerID, channelID) {
  $(`#voiceChatButtonScreen${fullServerID}`).html(`<i class="bx bx-desktop"></i>`);
  $(`#voiceChatButtonScreen${fullServerID}`).removeClass('screenButtonActive');
  $(`#voiceChatButtonScreen${fullServerID}`).addClass('disabled');
  $(`#voiceChatButtonScreen${fullServerID}`).get(0).onclick = () => {
    shareScreen(fullServerID, channelID);
  }

  await update(ref(rtdb, `voice/${currentCall}/${user.uid}`), {
    screen: false
  });

  await remove(ref(rtdb, `${miniCallListener}`));

  off(ref(rtdb, `${miniCallListener}`));

  if (videoMediaStream) {
    videoMediaStream.getTracks().forEach(function(track) {
      track.stop();
    });
  }

  connectedMediaUsers = [];
  cacheMediaConnectedMembers = [];

  myPeerVideo.destroy();
  searchIntervalMedia = window.setInterval(() => {
    if (myPeerVideo.destroyed) {
      window.clearInterval(searchIntervalMedia);
      myPeerVideo = new Peer();
      myPeerVideo.on('open', (ID) => {
        myPeerVideoID = ID;
        $(`#voiceChatButtonVideo${fullServerID}`).removeClass('disabled');
        $(`#voiceChatButtonScreen${fullServerID}`).removeClass('disabled');
        $(`#voiceChatButtonScreen${fullServerID}`).get(0)._tippy.setContent(`Stream Screen`);
      });
    }
  }, 99); // Run every 99ms.

  miniCallListener = null;

  videoMediaStream.getVideoTracks()[0].onended = function () {};
}

async function unShareScreenDM(uID) {
  $(`#voiceChatButtonScreenFriends`).html(`<i class="bx bx-desktop"></i>`);
  $(`#voiceChatButtonScreenFriends`).removeClass('screenButtonActive');
  $(`#voiceChatButtonScreenFriends`).addClass('disabled');
  $(`#voiceChatButtonScreenFriends`).get(0).onclick = () => {
    shareScreenDM(uID);
  }

  await update(ref(rtdb, `voice/${currentCall}/${user.uid}`), {
    screen: false
  });

  await remove(ref(rtdb, `${miniCallListener}`));

  off(ref(rtdb, `${miniCallListener}`));

  if (videoMediaStream) {
    videoMediaStream.getTracks().forEach(function(track) {
      track.stop();
    });
  }

  connectedMediaUsers = [];
  cacheMediaConnectedMembers = [];

  myPeerVideo.destroy();
  searchIntervalMedia = window.setInterval(() => {
    if (myPeerVideo.destroyed) {
      window.clearInterval(searchIntervalMedia);
      myPeerVideo = new Peer();
      myPeerVideo.on('open', (ID) => {
        console.log('Peer opened.')
        myPeerVideoID = ID;

        window.setTimeout(() => {
          $(`#voiceChatButtonVideoFriends`).removeClass('disabled');
          $(`#voiceChatButtonScreenFriends`).removeClass('disabled');
          $(`#voiceChatButtonScreenFriends`).get(0)._tippy.setContent(`Stream Screen`);
        }, 1500);
      });
    }
  }, 99); // Run every 99ms.

  miniCallListener = null;

  videoMediaStream.getVideoTracks()[0].onended = function () {};
}

async function unShareVideo(fullServerID, channelID) {
  $(`#voiceChatButtonVideo${fullServerID}`).html(`<i class="bx bx-video"></i>`);
  $(`#voiceChatButtonVideo${fullServerID}`).removeClass('videoButtonActive');
  $(`#voiceChatButtonVideo${fullServerID}`).addClass('disabled');
  $(`#voiceChatButtonVideo${fullServerID}`).get(0).onclick = () => {
    shareVideo(fullServerID, channelID);
  }

  await update(ref(rtdb, `voice/${currentCall}/${user.uid}`), {
    video: false
  });

  await remove(ref(rtdb, `${miniCallListener}`))

  off(ref(rtdb, `${miniCallListener}`))

  if (videoMediaStream) {
    videoMediaStream.getTracks().forEach(function(track) {
      track.stop();
    });
  }

  connectedMediaUsers = [];
  cacheMediaConnectedMembers = [];

  myPeerVideo.destroy();
  searchIntervalMedia = window.setInterval(() => {
    if (myPeerVideo.destroyed) {
      window.clearInterval(searchIntervalMedia);
      myPeerVideo = new Peer();
      myPeerVideo.on('open', (ID) => {
        console.log('Peer opened.')
        myPeerVideoID = ID;
        $(`#voiceChatButtonScreen${fullServerID}`).removeClass('disabled');
        $(`#voiceChatButtonVideo${fullServerID}`).removeClass('disabled');
        $(`#voiceChatButtonVideo${fullServerID}`).get(0)._tippy.setContent(`Stream Video`);
      });
    }
  }, 99); // Run every 99ms.

  miniCallListener = null;
}

async function unShareVideoDM(uID) {
  $(`#voiceChatButtonVideoFriends`).html(`<i class="bx bx-video"></i>`);
  $(`#voiceChatButtonVideoFriends`).removeClass('videoButtonActive');
  $(`#voiceChatButtonVideoFriends`).addClass('disabled');
  $(`#voiceChatButtonVideoFriends`).get(0).onclick = () => {
    shareVideoDM(uID);
  }
  
  await update(ref(rtdb, `voice/${currentCall}/${user.uid}`), {
    video: false
  });

  await remove(ref(rtdb, `${miniCallListener}`))

  off(ref(rtdb, `${miniCallListener}`))

  if (videoMediaStream) {
    videoMediaStream.getTracks().forEach(function(track) {
      track.stop();
    });
  }

  connectedMediaUsers = [];
  cacheMediaConnectedMembers = [];

  myPeerVideo.destroy();
  searchIntervalMedia = window.setInterval(() => {
    if (myPeerVideo.destroyed) {
      window.clearInterval(searchIntervalMedia);
      myPeerVideo = new Peer();
      myPeerVideo.on('open', (ID) => {
        console.log('Peer opened.')
        myPeerVideoID = ID;

        window.setTimeout(() => {
          $(`#voiceChatButtonScreenFriends`).removeClass('disabled');
          $(`#voiceChatButtonVideoFriends`).removeClass('disabled');
          $(`#voiceChatButtonVideoFriends`).get(0)._tippy.setContent(`Stream Video`);
        }, 1500);
      });
    }
  }, 99); // Run every 99ms.

  miniCallListener = null;
}

window.joinScreen = async (serverUID, serverID, channelID, userID, username) => {
  if (currentCall !== `${serverUID}${serverID}/${channelID}`) {
    snac('Stream Viewing Error', "Unable to join this stream.", 'danger');
    return;
  }

  if (user.uid == userID) {
    snac('Stream Viewing Error', "You cannot view your own stream", 'danger');
    return;
  }

  if (connectedToVideo == userID) {
    snac('Stream Viewing Error', "You are already watching this stream.", 'danger');
    return;
  }

  if (connectedToVideo) {
    // Leave current without removing media view.
    await leaveVideo(serverUID, serverID, channelID, true);
    // Leave video is same as leave screen
  }
  
  connectedToVideo = userID;
  // Users joining another stream.
  showMediaViewVoiceChannel(serverUID, serverID, channelID);
  // Add the user to the mini channel.

  $(`#${serverUID}${serverID}${channelID}channelMediaVideo`).get(0).srcObject = null;

  myPeerVideo.on('call', call => {
    const emptyAudioTrack = createEmptyAudioTrack();
    const emptyVideoTrack = createEmptyVideoTrack({ width:640, height:480 });
    const emptyMediaStream = new MediaStream([emptyAudioTrack, emptyVideoTrack]);
    call.answer(emptyMediaStream);
    call.on('stream', stream => {
      console.log('stream recieved')
      $(`#${serverUID}${serverID}${channelID}channelMediaVideo`).get(0).srcObject = stream;
      $(`#${serverUID}${serverID}${channelID}channelMediaVideo`).get(0).play();
    });
  });

  window.setTimeout(async () => {
    await update(ref(rtdb, `voice/${serverUID}${serverID}/${channelID}/${userID}/media/${user.uid}`), {
      username: cacheUser.username,
      uid: user.uid,
      peer: myPeerVideoID,
      connected: true
    });
  
    onDisconnect(ref(rtdb, `voice/${serverUID}${serverID}/${channelID}/${userID}/media/${user.uid}`)).remove();
  
    $(`#mediaGuildChannelViewTitle${serverUID}${serverID}${channelID}`).html(`${username.capitalize()}'s Screen Stream`);
    $(`#${serverUID}${serverID}${channelID}voiceChatStopWatchingButton`).get(0).onclick = () => {
      leaveVideo(serverUID, serverID, channelID);
      // Leave video is same as leave screen
    }
  
    $(`#${serverUID}${serverID}${channelID}voiceChatStopWatchingButton2`).get(0).onclick = () => {
      leaveVideo(serverUID, serverID, channelID);
    }
  
    miniCallListener = `voice/${serverUID}${serverID}/${channelID}/${userID}/media`;
    onValue(ref(rtdb, `${miniCallListener}`), async (value) => {
      if (value.val()) {
        const keys = Object.keys(value.val());
  
        $(`#${serverUID}${serverID}${channelID}WatchingUsers`).empty();
  
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const a = document.createElement(`img`);
          a.setAttribute('class', 'invisible userContextItem acceptLeftClick');
          a.setAttribute('userID', value.val()[key].uid);
          a.id = `watchingIcon${serverUID}${serverID}${channelID}`;
          $(`#${serverUID}${serverID}${channelID}WatchingUsers`).get(0).appendChild(a);
          a.setAttribute(`src`, await returnProperURL(value.val()[key].uid));
          displayImageAnimation(`watchingIcon${serverUID}${serverID}${channelID}`);
        }
  
        $(`#${serverUID}${serverID}${channelID}MediaWatching`).html(`${keys.length} Watching.`);
      }
      else {
        // Probably it was deleted!
        leaveVideo(serverUID, serverID, channelID);
      }
    });
  }, 999);
}

window.joinVideo = async (serverUID, serverID, channelID, userID, username) => {
  if (currentCall !== `${serverUID}${serverID}/${channelID}`) {
    snac('Stream Viewing Error', "Unable to join this stream.", 'danger');
    return;
  }

  if (user.uid == userID) {
    snac('Stream Viewing Error', "You cannot view your own stream", 'danger');
    return;
  }

  if (connectedToVideo == userID) {
    snac('Stream Viewing Error', "You are already watching this stream.", 'danger');
    return;
  }

  if (connectedToVideo) {
    // Leave current without removing media view.
    await leaveVideoDM(serverUID, serverID, channelID, true);
  }
  
  connectedToVideo = userID;

  // Users joining another stream.
  showMediaViewVoiceChannel(serverUID, serverID, channelID);
  // Add the user to the mini channel.

  console.log('call listener set')
  $(`#${serverUID}${serverID}${channelID}channelMediaVideo`).get(0).srcObject = null;
  myPeerVideo.on('call', call => {
    const emptyAudioTrack = createEmptyAudioTrack();
    const emptyVideoTrack = createEmptyVideoTrack({ width:640, height:480 });
    const emptyMediaStream = new MediaStream([emptyAudioTrack, emptyVideoTrack]);
    call.answer(emptyMediaStream);
    console.log('answered')
    call.on('stream', stream => {
      console.log('stream recieved')
      $(`#${serverUID}${serverID}${channelID}channelMediaVideo`).get(0).srcObject = stream;
      $(`#${serverUID}${serverID}${channelID}channelMediaVideo`).get(0).play();
    });
  });

  window.setTimeout(async () => {
    await update(ref(rtdb, `voice/${serverUID}${serverID}/${channelID}/${userID}/media/${user.uid}`), {
      username: cacheUser.username,
      uid: user.uid,
      peer: myPeerVideoID,
      connected: true
    });
  
    onDisconnect(ref(rtdb, `voice/${serverUID}${serverID}/${channelID}/${userID}/media/${user.uid}`)).remove();
  
    $(`#mediaGuildChannelViewTitle${serverUID}${serverID}${channelID}`).html(`${username.capitalize()}'s Video Stream`);
    $(`#${serverUID}${serverID}${channelID}voiceChatStopWatchingButton`).get(0).onclick = () => {
      leaveVideo(serverUID, serverID, channelID);
    }
  
    $(`#${serverUID}${serverID}${channelID}voiceChatStopWatchingButton2`).get(0).onclick = () => {
      leaveVideo(serverUID, serverID, channelID);
    }
  
    miniCallListener = `voice/${serverUID}${serverID}/${channelID}/${userID}/media`;
    onValue(ref(rtdb, `${miniCallListener}`), async (value) => {
      if (value.val()) {
        const keys = Object.keys(value.val());
  
        $(`#${serverUID}${serverID}${channelID}WatchingUsers`).empty();
  
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const a = document.createElement(`img`);
          a.setAttribute('class', 'invisible userContextItem acceptLeftClick');
          a.setAttribute('userID', value.val()[key].uid);
          a.id = `watchingIcon${serverUID}${serverID}${channelID}`;
          $(`#${serverUID}${serverID}${channelID}WatchingUsers`).get(0).appendChild(a);
          a.setAttribute(`src`, await returnProperURL(value.val()[key].uid));
          displayImageAnimation(`watchingIcon${serverUID}${serverID}${channelID}`);
        }
  
        $(`#${serverUID}${serverID}${channelID}MediaWatching`).html(`${keys.length} Watching.`);
      }
      else {
        // Probably it was deleted!
        leaveVideo(serverUID, serverID, channelID);
      }
    });
  }, 999);
}

export async function joinVideoDM(userID, username) {
  if (currentCall !== dmKEYify(user.uid, userID)) {
    snac('Stream Viewing Error', "Unable to join this stream.", 'danger');
    return;
  }

  if (user.uid == userID) {
    snac('Stream Viewing Error', "You cannot view your own stream", 'danger');
    return;
  }

  if (connectedToVideo == userID) {
    snac('Stream Viewing Error', "You are already watching this stream.", 'danger');
    return;
  }

  if (connectedToVideo) {
    // Leave current without removing media view.
    await leaveVideoDM(userID, true);
  }
  
  connectedToVideo = userID;

  // Users joining another stream.
  showMediaViewDM(userID);
  // Add the user to the mini channel.

  $(`#mediaGuildFriendsVideo`).get(0).srcObject = null;
  myPeerVideo.on('call', call => {
    const emptyAudioTrack = createEmptyAudioTrack();
    const emptyVideoTrack = createEmptyVideoTrack({ width:640, height:480 });
    const emptyMediaStream = new MediaStream([emptyAudioTrack, emptyVideoTrack]);
    call.answer(emptyMediaStream);
    console.log('answered')
    call.on('stream', stream => {
      console.log('stream recieved')
      $(`#mediaGuildFriendsVideo`).get(0).srcObject = stream;
      $(`#mediaGuildFriendsVideo`).get(0).play();
    });
  });

  window.setTimeout(async () => {
    await update(ref(rtdb, `voice/${dmKEYify(user.uid, userID)}/${userID}/media/${user.uid}`), {
      username: cacheUser.username,
      uid: user.uid,
      peer: myPeerVideoID,
      connected: true
    });
  
    onDisconnect(ref(rtdb, `voice/${dmKEYify(user.uid, userID)}/${userID}/media/${user.uid}`)).remove();
  
    $(`#mediaGuildFriendsViewTitle`).html(`${username.capitalize()}'s Video Stream`);
    $(`#voiceChatStopWatchingButton3`).get(0).onclick = () => {
      leaveVideoDM(userID);
    }
  
    miniCallListener = `voice/${dmKEYify(user.uid, userID)}/${userID}/media`;
    onValue(ref(rtdb, `${miniCallListener}`), async (value) => {
      if (!value.val()) {
        // Probably it was deleted!
        leaveVideoDM(userID);
      }
    });
  }, 999);
}

export async function joinScreenDM(userID, username) {
  if (currentCall !== dmKEYify(user.uid, userID)) {
    snac('Stream Viewing Error', "Unable to join this stream.", 'danger');
    return;
  }

  if (user.uid == userID) {
    snac('Stream Viewing Error', "You cannot view your own stream", 'danger');
    return;
  }

  if (connectedToVideo == userID) {
    snac('Stream Viewing Error', "You are already watching this stream.", 'danger');
    return;
  }

  if (connectedToVideo) {
    // Leave current without removing media view.
    await leaveVideo(userID, true);
    // Leave video is same as leave screen
  }
  
  connectedToVideo = userID;
  // Users joining another stream.
  showMediaViewDM(userID);
  // Add the user to the mini channel.

  $(`#mediaGuildFriendsVideo`).get(0).srcObject = null;

  myPeerVideo.on('call', call => {
    const emptyAudioTrack = createEmptyAudioTrack();
    const emptyVideoTrack = createEmptyVideoTrack({ width:640, height:480 });
    const emptyMediaStream = new MediaStream([emptyAudioTrack, emptyVideoTrack]);
    call.answer(emptyMediaStream);
    call.on('stream', stream => {
      console.log('stream recieved')
      $(`#mediaGuildFriendsVideo`).get(0).srcObject = stream;
      $(`#mediaGuildFriendsVideo`).css(`width`, stream.getVideoTracks()[0].getSettings().width);
      $(`#mediaGuildFriendsVideo`).get(0).play();
    });
  });

  window.setTimeout(async () => {
    await update(ref(rtdb, `voice/${dmKEYify(user.uid, userID)}/${userID}/media/${user.uid}`), {
      username: cacheUser.username,
      uid: user.uid,
      peer: myPeerVideoID,
      connected: true
    });
  
    onDisconnect(ref(rtdb, `voice/${dmKEYify(user.uid, userID)}/${userID}/media/${user.uid}`)).remove();
  
    $(`#mediaGuildFriendsViewTitle`).html(`${username.capitalize()}'s Screen Stream`);
    $(`#voiceChatStopWatchingButton3`).get(0).onclick = () => {
      leaveVideoDM(userID);
    }

    miniCallListener = `voice/${dmKEYify(user.uid, userID)}/${userID}/media`;
    onValue(ref(rtdb, `${miniCallListener}`), async (value) => {
      if (!value.val()) {
        // Probably it was deleted!
        leaveVideoDM(userID);
      }
    });
  }, 999);
}

function leaveVideo(serverUID, serverID, channelID, skipDisplay) {
  return new Promise(async (resolve, reject) => {
    // Exit fullscreen if in it.
    if (document.fullscreenElement) {
      snac("Closing Fullscreen", "The stream has been ended. Please wait while fullscreen is disabled.")
      await document.exitFullscreen();
      await timer(2000);
    }

    if (!skipDisplay) {
      hideMediaViewVoiceChannel(serverUID, serverID, channelID);
    }
    if (connectedToVideo && miniCallListener) {
      // Remove user from mini channel.
      await remove(ref(rtdb, `voice/${serverUID}${serverID}/${channelID}/${connectedToVideo}/media/${user.uid}`));
      await onDisconnect(ref(rtdb, `voice/${serverUID}${serverID}/${channelID}/${connectedToVideo}/media/${user.uid}`)).cancel();
      off(ref(rtdb, miniCallListener));
      connectedToVideo = null;
    }
  
    myPeerVideo.destroy();
    searchIntervalMedia = window.setInterval(() => {
      if (myPeerVideo.destroyed) {
        window.clearInterval(searchIntervalMedia);
        myPeerVideo = new Peer();
        myPeerVideo.on('open', (ID) => {
          console.log('Peer opened.')
          myPeerVideoID = ID;
          resolve(true);
        });
      }
    }, 99); // Run every 99ms.
  });
}

export function leaveVideoDM(userID, skipDisplay) {
  return new Promise(async (resolve, reject) => {
    // Exit fullscreen if in it.
    if (document.fullscreenElement) {
      snac("Closing Fullscreen", "The stream has been ended. Please wait while fullscreen is disabled.")
      await document.exitFullscreen();
      await timer(2000);
    }

    if (!skipDisplay) {
      hideMediaViewDM(userID);
    }
    if (connectedToVideo && miniCallListener) {
      // Remove user from mini channel.
      await remove(ref(rtdb, `voice/${dmKEYify(user.uid, userID)}/${connectedToVideo}/media/${user.uid}`));
      await onDisconnect(ref(rtdb, `voice/${dmKEYify(user.uid, userID)}/${connectedToVideo}/media/${user.uid}`)).cancel();
      off(ref(rtdb, miniCallListener));
      connectedToVideo = null;
    }
  
    myPeerVideo.destroy();
    searchIntervalMedia = window.setInterval(() => {
      if (myPeerVideo.destroyed) {
        window.clearInterval(searchIntervalMedia);
        myPeerVideo = new Peer();
        myPeerVideo.on('open', (ID) => {
          console.log('Peer opened.')
          myPeerVideoID = ID;
          resolve(true);
        });
      }
    }, 99); // Run every 99ms.
  });
}

function showMediaViewDM(uID) {
  $(`#friendViewMedia`).removeClass('hiddenImportant');

  window.setTimeout(() => {
    $(`#friendViewRight`).addClass("friendViewRightMediaActive");
    $(`#friendViewMedia`).addClass('friendViewMediaMediaActive');
    window.setTimeout(() => {
      $(`#friendViewRight`).addClass('hiddenImportant');
    }, 499);
  }, 99);
}

export function hideMediaViewDM(uID, switchingDMs) {
  $(`#friendViewRight`).removeClass('hiddenImportant');
  if (switchingDMs) {
    $(`#friendViewRight`).removeClass("friendViewRightMediaActive");
    $(`#friendViewMedia`).removeClass('friendViewMediaMediaActive');
    if (connectedToVideo) {
      leaveVideoDM(connectedToVideo, true)
    }
  }
  else {
    window.setTimeout(() => {
      $(`#friendViewRight`).removeClass("friendViewRightMediaActive");
      $(`#friendViewMedia`).removeClass('friendViewMediaMediaActive');
      window.setTimeout(() => {
        $(`#friendViewMedia`).addClass('hiddenImportant');
      }, 1499);
    }, 99)
  }
}
// mediaGuildFriendsViewTitle
function showMediaViewVoiceChannel(serverUID, serverID, channelID) {
  $(`#sidebarLeft${serverUID}${serverID}`).addClass('sidebarLeftJoinedMedia');
  $(`#sidebarRight${serverID}`).addClass('sidebarRightJoinedMedia');
  
  $(`#${serverUID}${serverID}${channelID}PrimaryGrid`).addClass('channelPrimaryGridJoinedMedia');
  $(`#channelSecondaryGrid${serverUID}${serverID}${channelID}`).addClass('channelSecondaryJoinedMedia');
  $(`#${serverUID}${serverID}${channelID}channelMediaContainer`).addClass('channelMediaContainerJoinedMedia');
  $(`#${serverUID}${serverID}${channelID}voiceChatStopWatchingButton`).removeClass('hidden');
  
  console.log('Joined media styles added.')
}

function hideMediaViewVoiceChannel(serverUID, serverID, channelID) {
  $(`#sidebarLeft${serverUID}${serverID}`).removeClass('sidebarLeftJoinedMedia');
  $(`#sidebarRight${serverID}`).removeClass('sidebarRightJoinedMedia');
  
  $(`#${serverUID}${serverID}${channelID}PrimaryGrid`).removeClass('channelPrimaryGridJoinedMedia');
  $(`#channelSecondaryGrid${serverUID}${serverID}${channelID}`).removeClass('channelSecondaryJoinedMedia');
  $(`#${serverUID}${serverID}${channelID}channelMediaContainer`).removeClass('channelMediaContainerJoinedMedia');
  $(`#${serverUID}${serverID}${channelID}voiceChatStopWatchingButton`).addClass('hidden');

  $(`#voiceChatButtonVideo${serverUID}${serverID}`).html(`<i class="bx bx-video"></i>`);
  $(`#voiceChatButtonScreen${serverUID}${serverID}`).removeClass('disabled');
  $(`#voiceChatButtonVideo${serverUID}${serverID}`).removeClass('videoButtonActive');
  $(`#voiceChatButtonVideo${serverUID}${serverID}`).get(0).onclick = () => {
    shareVideo(`${serverUID}${serverID}`, channelID);
  }
}

window.testHandleScreenShare = async () => {
  console.log(await handleScreenShare());
}

function handleScreenShare() {
  return new Promise(async (resolve, reject) => {
    const sources = await getSources({ types: ['window', 'screen'] });
    if (!sources) {
      resolve(false);
      return;
    }

    console.log(sources)

    showScreenShareWindow();

    $(`#screenScreens`).empty();
    $(`#screenWindows`).empty();

    $(`#screenSharingWallpaper`).get(0).onclick = () => {
      resolve(false);
      hideScreenShareWindow();
    }

    $(`#screenSharingClose`).get(0).onclick = () => {
      resolve(false);
      hideScreenShareWindow();
    }

    for (let i = 0; i < sources.length; i++) {
      const source = sources[i];
      
      const a = document.createElement('div');
      a.setAttribute('class', 'screenSource');
      a.innerHTML = `
        <img src="${source.thumbnail.toDataURL()}"></img>
        <div class="screenSourceTitle">${source.name}</div>
      `;
      // If its a screen
      if (source.id.includes('screen:')) {
        a.onclick = async () => {
          hideScreenShareWindow();
          try {
            videoMediaStream = await navigator.mediaDevices.getUserMedia({
              audio: retrieveSetting('streamAudio', true) ? {
                mandatory: {
                  chromeMediaSource: 'desktop'
                }
              } : false,
              video: {
                mandatory: {
                  chromeMediaSource: 'desktop',
                }
              }
            }); 
          } catch (error) {
            if (`${error}`.includes("Could not start audio")) {
              snac('Stream Error', "System audio is unavailable. Proceeding without audio...", "danger");
              try {
                videoMediaStream = await navigator.mediaDevices.getUserMedia({
                  audio: false,
                  video: {
                    mandatory: {
                      chromeMediaSource: 'desktop',
                    }
                  }
                });

                resolve(true);
              }
              catch (error) {
                console.log(error);
                resolve(false);
                return;
              }
            }
            console.log(error);
            resolve(false);
            return;
          }
          resolve(true);
        }
        $(`#screenScreens`).append(a);
      }
      else {
        a.onclick = async () => {
          hideScreenShareWindow();
          try {
            videoMediaStream = await navigator.mediaDevices.getUserMedia({
              audio: false,
              video: {
                mandatory: {
                  chromeMediaSource: 'desktop',
                  chromeMediaSourceId: source.id,
                }
              }
            }); 
          } catch (error) {
            console.log(error);
            resolve(false);
            return;
          }
          resolve(true);
        }
        $(`#screenWindows`).append(a);
      }
    }
  });
}

function showScreenShareWindow() {
  $(`#screenSharingWallpaper`).removeClass('hidden');
  $(`#screenSharingWallpaper`).removeClass('fadeOut');
  $(`#screenSharingWallpaper`).addClass('fadeIn');

  $(`#screenShareSelect`).removeClass('hidden');
  $(`#screenShareSelect`).removeClass('screenShareSelectClose');
}

export function hideScreenShareWindow() {
  $(`#screenSharingWallpaper`).removeClass('fadeIn');
  $(`#screenSharingWallpaper`).addClass('fadeOut');
  $(`#screenShareSelect`).addClass('screenShareSelectClose');
  
  window.setTimeout(() => {
    $(`#screenSharingWallpaper`).addClass('hidden');
    $(`#screenShareSelect`).addClass('hidden');
  }, 299);
}

function setVoiceIndicators() {
  audioContext = new AudioContext();
  const mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(mediaStream);
  const analyserNode = audioContext.createAnalyser();
  mediaStreamAudioSourceNode.connect(analyserNode);

  const pcmData = new Float32Array(analyserNode.fftSize);
  const onFrame = () => {
      analyserNode.getFloatTimeDomainData(pcmData);
      let sumSquares = 0.0;
      for (const amplitude of pcmData) { sumSquares += amplitude*amplitude; }
      const magnitude = Math.sqrt(sumSquares / pcmData.length);

      // Border width on magnitude * multiplier

      let displayMagnitude = (magnitude * 200);
      if (displayMagnitude > 4) {
        displayMagnitude = 4;
      }
      else if (displayMagnitude < 0.2) {
        displayMagnitude = 0;
      }

      $(`.voiceIndicator${user.uid}`).css('border-width', `${displayMagnitude}px`);


      if (currentCall) {
        window.setTimeout(() => {
          window.requestAnimationFrame(onFrame);
        }, retrieveSetting(`responsiveVoiceActivity`, false) ? 99 : 249);
      }
      else {
        $(`.voiceIndicatorAll`).css('border-width', `0px`);
      }
  };

  window.requestAnimationFrame(onFrame);
}

function setVoiceIndicatorsOnUser(uID, mediaStreamInput) {
  if (voiceIndicatorsUsers.includes(uID)) {
    return;
  }

  voiceIndicatorsUsers.push(uID);

  audioContext = new AudioContext();
  const mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(mediaStreamInput);
  const analyserNode = audioContext.createAnalyser();
  mediaStreamAudioSourceNode.connect(analyserNode);

  const pcmData = new Float32Array(analyserNode.fftSize);
  const onFrame = () => {
      analyserNode.getFloatTimeDomainData(pcmData);
      let sumSquares = 0.0;
      for (const amplitude of pcmData) { sumSquares += amplitude*amplitude; }
      const magnitude = Math.sqrt(sumSquares / pcmData.length);

      // Border width on magnitude * multiplier

      let displayMagnitude = (magnitude * 200);
      if (displayMagnitude > 4) {
        displayMagnitude = 4;
      }
      else if (displayMagnitude < 0.2) {
        displayMagnitude = 0;
      }

      $(`.voiceIndicator${uID}`).css('border-width', `${displayMagnitude}px`);

      window.setTimeout(() => {
        if (voiceIndicatorsUsers.includes(uID)) {
          window.requestAnimationFrame(onFrame);
        }
        else {
          $(`.voiceIndicator${uID}`).css('border-width', `0px`);
          console.log('stopped voice indicator thing')
        }
      }, retrieveSetting(`responsiveVoiceActivity`, false) ? 99 : 249);
  };
  window.requestAnimationFrame(onFrame);  
}
