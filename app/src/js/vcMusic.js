import { getDatabase, off, ref, push, onValue, query, remove, set, update, onDisconnect } from '@firebase/database';
import { createTrack } from './componentse';
import { commonArrayDifference, disableButton, displayImageAnimation, enableButton } from './app';
import { sendMusicStatus } from './electronApp';
import { checkAppInitialized } from './firebaseChecks';
import { getPlaybackURL, sendTrackToPlayerRevamp } from './playback';
import { setMusicStatus } from './presence';

window.defaultCacheChannelVCMusic = {
  connected: {},
  queue: {},
  nowPlaying: {},
};

window.currentChannelMusicCode = '';
window.cacheChannelVCMusic = {};
window.serverInterval = null; 
window.connectedMusicInterval = null;
window.cachePausedMusic = false;
window.activeListeningParty = null;
window.listeningPartyDisconnect = null;

checkAppInitialized();
const rtdb = getDatabase();

export async function searchInChannel(guildUID, guildID, channelID) {
  const scopedActiveChannel = `${guildUID}${guildID}${channelID}`;

  $(`#searchResults${scopedActiveChannel}`).removeClass('fadeOut');
  $(`#searchResults${scopedActiveChannel}`).removeClass('hidden');
  $(`#searchResults${scopedActiveChannel}`).addClass('fadeIn');
  $(`#searchResultsCloseButton${scopedActiveChannel}`).removeClass('zoomOut');
  $(`#searchResultsCloseButton${scopedActiveChannel}`).removeClass('hidden');
  $(`#searchResultsCloseButton${scopedActiveChannel}`).addClass('zoomIn');

  const query = $(`#${scopedActiveChannel}SongSearchInput`).val();
  if (!query) {
    closeChannelSearchResults(scopedActiveChannel);
    return;
  }

  $(`#${scopedActiveChannel}SongSearchInput`).val('');
  $(`#searchResults${scopedActiveChannel}`).empty();

  const searchTracks = await makeMusicRequest(`search?term=${encodeURIComponent(query)}&limit=10`);

  const tracks = searchTracks.results.songs.data;
  console.log(tracks)
  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    createTrack(track, `searchResults${scopedActiveChannel}`, i, null, [], false, `addTrackToChannelQueue('${track.id}', '${guildUID}', '${guildID}', '${channelID}')`);
  }
}

window.closeChannelSearchResults = (activeChannel) => {
  $(`#searchResults${activeChannel}`).removeClass('fadeIn');
  $(`#searchResults${activeChannel}`).addClass('fadeOut');
  $(`#searchResultsCloseButton${activeChannel}`).removeClass('zoomIn');
  $(`#searchResultsCloseButton${activeChannel}`).addClass('zoomOut');

  window.setTimeout(() => {
    $(`#searchResults${activeChannel}`).addClass('hidden');
    $(`#searchResultsCloseButton${activeChannel}`).addClass('hidden');
  }, 600);
}

window.addTrackToChannelQueue = async (trackID, guildUID, guildID, channelID) => {
  const scopedActiveChannel = `${guildUID}${guildID}${channelID}`;
  closeChannelSearchResults(scopedActiveChannel);

  if (!activeListeningParty || activeListeningParty !== `${guildUID}/${guildID}/${channelID}`) {
    snac(`Not Connected`, `Connect to this lounge's voice chat to listen to tracks here.`);
    return;
  }
  
  const trackDetails = (await makeMusicRequest(`songs/${trackID}?include=artists`)).data[0];

  console.log(trackDetails);

  await push(ref(rtdb, `${activeVCMusicListener}/queue`), {
    trackData: trackDetails,
    author: `${user.uid}.${cacheUser.username}`
  });

  $(`#${scopedActiveChannel}SongSearchInput`).get(0).focus()
}

export async function joinMusicParty(guildUID, guildID, channelID) {
  let scopedActiveChannel = `${guildUID}${guildID}${channelID}`;
  disableButton($(`#${scopedActiveChannel}musicPartyButton`));
  
  if (activeListeningParty) {
    const prevPartySplit = activeListeningParty.split('/');
    leaveListeningParty(prevPartySplit[0], prevPartySplit[1], prevPartySplit[2]);
  }

  listeningPartyDisconnect = onDisconnect(ref(rtdb, `voiceMusic/${guildUID}${guildID}/${channelID}/connected/${user.uid}`));
  listeningPartyDisconnect.remove();
  await set(ref(rtdb, `voiceMusic/${guildUID}${guildID}/${channelID}/connected/${user.uid}`), {
    username: cacheUser.username,
    uid: user.uid,
  });

  addVCMusicListeners(guildUID, guildID, channelID);
  activeListeningParty = `${guildUID}/${guildID}/${channelID}`;
  
  window.setTimeout(() => {
    // snac('Listening Party', `You are now connected to a listening party.`);
    sendMusicStatus('listeningPartyJoin');
    $(`#libraryPlayer`).get(0).pause();
    notifyTiny('Listening Party: Connected', false);
    $(`#${guildUID}${guildID}${channelID}TabItemMusic`).removeClass('invisibleOpacityAnimated')
    enableButton($(`#${scopedActiveChannel}musicPartyButton`), '<i class="bx bx-x"></i>');
    $(`#${scopedActiveChannel}musicPartyButton`).get(0)._tippy.setContent(`Leave Music Party`);
    $(`#${scopedActiveChannel}musicPartyButton`).get(0).onclick = () => {
      leaveListeningParty(guildUID, guildID, channelID);
    }

    $(`#${guildUID}${guildID}Server`).addClass('listeningPartyServer');
  }, 999);
}

export async function leaveListeningParty(guildUID, guildID, channelID) {
  let scopedActiveChannel = `${guildUID}${guildID}${channelID}`;
  disableButton($(`#${scopedActiveChannel}musicPartyButton`));
  $(`#${guildUID}${guildID}${channelID}TabItemMusic`).addClass('invisibleOpacityAnimated')
  // snac('Listening Party', `You are now disconnected from a listening party.`);
  // notifyTiny('Listening Party: Disconnected', false);
  $(`#channelMusicAudio${guildUID}${guildID}${channelID}`).get(0).pause();
  try { off(query(ref(rtdb, activeVCMusicListener))); } catch (error) {};
  activeListeningParty = null;

  await remove(ref(rtdb, `voiceMusic/${guildUID}${guildID}/${channelID}/connected/${user.uid}`));
  listeningPartyDisconnect.cancel();

  window.setTimeout(() => {
    sendMusicStatus('listeningPartyLeave');
    $(`#${guildUID}${guildID}Server`).removeClass('listeningPartyServer');
    notifyTiny('Listening Party: Disconnected', false);
    enableButton($(`#${scopedActiveChannel}musicPartyButton`), '<i class="bx bx-music"></i>');
    $(`#${scopedActiveChannel}musicPartyButton`).get(0)._tippy.setContent(`Join Music Party`);
    $(`#${scopedActiveChannel}musicPartyButton`).get(0).onclick = () => {
      joinMusicParty(guildUID, guildID, channelID);
    }
  }, 999);
  $(`#connectedUsersContainer${scopedActiveChannel}`).empty();

  if (channelTabLibrary[scopedActiveChannel] == 'Music') {
    modifyChannelTab(guildUID, guildID, channelID, 'Chat');
  }

  if (musicPlaying.id) {
    setMusicStatus(musicPlaying, false);
  }
  else {
    setMusicStatus(false);
  }
}

export async function addVCMusicListeners(guildUID, guildID, channelID) {
  let scopedActiveChannel = `${guildUID}${guildID}${channelID}`;

  cacheChannelVCMusic[scopedActiveChannel] = defaultCacheChannelVCMusic;
  
  try { off(query(ref(rtdb, activeVCMusicListener))); } catch (error) {};
  activeVCMusicListener = `voiceMusic/${guildUID}${guildID}/${channelID}`;

  currentChannelMusicCode = '';
  serverInterval = null; 
  cachePausedMusic = false;

  // Reset everything./
  $(`#channelMusicQueueContent${scopedActiveChannel}`).empty();
  $(`#channelMusicNowPlayingContent${scopedActiveChannel}`).empty();
  $(`#channelMusicAudio${scopedActiveChannel}`).get(0).src = '';

  onValue(query(ref(rtdb, `${activeVCMusicListener}`)), async (snapshot) => {
    let connected = {};
    let queue = {};
    let nowPlaying = {};
    if (snapshot.val()) {
      if (snapshot.val().connected) {
        connected = snapshot.val().connected;
      }
      if (snapshot.val().queue) {
        $(`#channelQueueText${scopedActiveChannel}`).removeClass('hidden');
        $(`#${scopedActiveChannel}musicAdminClearQueue`).removeClass('disabled');
        queue = snapshot.val().queue;
      }
      else {
        $(`#${scopedActiveChannel}musicAdminClearQueue`).addClass('disabled');
        $(`#channelQueueText${scopedActiveChannel}`).addClass('hidden');
      }
      if (snapshot.val().nowPlaying) {
        nowPlaying = snapshot.val().nowPlaying;
        $(`#${scopedActiveChannel}musicAdminFastForward`).removeClass('disabled');
      }
      else {
        $(`#${scopedActiveChannel}musicAdminFastForward`).addClass('disabled');
        $(`#channelMusicAudio${scopedActiveChannel}`).get(0).src = "";
      }
    }
    else {
      $(`#${scopedActiveChannel}musicAdminClearQueue`).addClass('disabled');
      $(`#${scopedActiveChannel}musicAdminFastForward`).addClass('disabled');
      $(`#channelMusicAudio${scopedActiveChannel}`).get(0).src = "";
    }

    if (!cacheChannelVCMusic[scopedActiveChannel].queue) {
      cacheChannelVCMusic[scopedActiveChannel].queue = {};
    }
    if (!cacheChannelVCMusic[scopedActiveChannel].connected) {
      cacheChannelVCMusic[scopedActiveChannel].connected = {};
    }
    if (!cacheChannelVCMusic[scopedActiveChannel].nowPlaying) {
      cacheChannelVCMusic[scopedActiveChannel].nowPlaying = {};
    }

    const connectedChangeForward = commonArrayDifference(Object.keys(connected), Object.keys(cacheChannelVCMusic[scopedActiveChannel].connected));
    const connectedChangeBackward = commonArrayDifference(Object.keys(cacheChannelVCMusic[scopedActiveChannel].connected), Object.keys(connected));

    $(`#connectedUsersText${scopedActiveChannel}`).text(`${Object.keys(connected).length} Connected User${Object.keys(connected).length > 1 ? 's' : ''}`);

    for (let i = 0; i < connectedChangeForward.length; i++) {
      const connectedUser = connected[connectedChangeForward[i]];
      const a = document.createElement('div');
      a.setAttribute('class', 'listenConnectedUser animated zoomIn fast');
      a.onclick = () => {
        openUserCard(connectedUser.uid);
      }
      a.setAttribute('id', `${scopedActiveChannel}listenConnectedUser${connectedUser.uid}`);
      a.innerHTML = `<img class="invisible" id="${scopedActiveChannel}listenConnectedUser${connectedUser.uid}Image" /><b>${connectedUser.username}</b>`;
      $(`#connectedUsersContainer${scopedActiveChannel}`).append(a);

      window.setTimeout(() => {
        $(`#${scopedActiveChannel}listenConnectedUser${connectedUser.uid}`).removeClass('animated');
      }, 599);

      $(`#${scopedActiveChannel}listenConnectedUser${connectedUser.uid}Image`).attr('src', await returnProperURL(connectedUser.uid));
      displayImageAnimation(`${scopedActiveChannel}listenConnectedUser${connectedUser.uid}Image`);
    }

    for (let i = 0; i < connectedChangeBackward.length; i++) {
      $(`#${scopedActiveChannel}listenConnectedUser${connectedChangeBackward[i]}`).addClass("listenConnectedUserGone");
      window.setTimeout(() => {
        $(`#${scopedActiveChannel}listenConnectedUser${connectedChangeBackward[i]}`).remove();
      }, 500);
    }

    const queueChangeForward = commonArrayDifference(Object.keys(queue), Object.keys(cacheChannelVCMusic[scopedActiveChannel].queue));
    const queueChangeBackward = commonArrayDifference(Object.keys(cacheChannelVCMusic[scopedActiveChannel].queue), Object.keys(queue));

    for (let i = 0; i < queueChangeForward.length; i++) {
      const queueID = queueChangeForward[i];
      const queueData = queue[queueID];
      
      const a = document.createElement('div');
      a.id = `queueItem${queueID}`;
      a.innerHTML = `
        <img id="${queueID}queueItemPfp" src="${await returnProperURL(queueData.author.split('.')[0])}" />
      `
      a.setAttribute('class', 'requestedByImg');
      $(`#channelMusicQueueContent${scopedActiveChannel}`).get(0).appendChild(a);
      
      createTrack(queueData.trackData, `queueItem${queueID}`, i, null, ["fromLP", queueID, "guildUID", guildUID, "guildID", guildID], null, "console.log('no action')");
      
      tippy($(`#${queueID}queueItemPfp`).get(0), {
        content: `Requested by ${queueData.author.split('.')[1].capitalize()}`,
        placement: 'top',
      });

      $(`#${queueID}queueItemPfp`).get(0).onclick = () => {
        openUserCard(queueData.author.split('.')[0]);
      }
    }

    for (let i = 0; i < queueChangeBackward.length; i++) {
      const queueID = queueChangeBackward[i];
      console.log(queueID)
      $(`#queueItem${queueID}`).remove();
    }

    $(`#channelMusicQueueContent${scopedActiveChannel}`).children('.track').each((index, object) => {
      $(object).find('.trackIndex').html(index+1);
    });

    // Now playing
    $(`#${scopedActiveChannel}NowPlayingText`).html('Now Playing');
    if (!snapshot.val() || !nowPlaying || !Object.keys(nowPlaying).length) {
      $(`#${scopedActiveChannel}NowPlayingText`).html('<span style="color: var(--secondary)">Nothing Playing</span>');
      $(`#channelMusicNowPlayingContent${scopedActiveChannel}`).empty();
    }

    if (snapshot.val() && nowPlaying && nowPlaying.trackURL && nowPlaying.randomInt !== cacheChannelVCMusic[scopedActiveChannel].nowPlaying.randomInt) {
      const trackStarted = nowPlaying.startedAt;
      const trackDurationMS = nowPlaying.trackData.attributes.durationInMillis;
      const trackWillEndAt = new Date(trackStarted).getTime() + trackDurationMS;

      if (trackWillEndAt > new Date().getTime()) { // Track has not ended. Play current track
        $(`#channelMusicNowPlayingContent${scopedActiveChannel}`).empty();
        const track = nowPlaying.trackData;
        createTrack(track, `channelMusicNowPlayingContent${scopedActiveChannel}`, null, null, [], false, "console.log('no action')");
        sendToServerPlayer(track, guildUID, guildID, channelID, trackWillEndAt - new Date().getTime());
      }
      else { // Track has ended. Play next track WILL happen.
      
      }
    }

    if (snapshot.val()) {
      cacheChannelVCMusic[scopedActiveChannel] = snapshot.val();
    }
    else {
      cacheChannelVCMusic[scopedActiveChannel] = defaultCacheChannelVCMusic;
    }
    updateVCState(guildUID, guildID, channelID, cacheChannelVCMusic[scopedActiveChannel]);
  })
}

export async function removeTrackFromVCQueue(queueID) {
  await remove(ref(rtdb, `voiceMusic/${activeListeningParty.split('/')[0]}${activeListeningParty.split('/')[1]}/${activeListeningParty.split('/')[2]}/queue/${queueID}`));
}

export function clearQueueVCMusic(guildUID, guildID, channelID) {
  update(ref(rtdb, `voiceMusic/${guildUID}${guildID}/${channelID}`), {
    queue: {},
  })
}

export function skipTrackVCMusic(guildUID, guildID, channelID) {
  update(ref(rtdb, `voiceMusic/${guildUID}${guildID}/${channelID}`), {
    nowPlaying: {},
  })
}

function updateVCState(guildUID, guildID, channelID, data, action) {
  const scopedActiveChannel = `${guildUID}${guildID}${channelID}`
 
  if (!activeListeningParty || activeListeningParty !== `${guildUID}/${guildID}/${channelID}`) {
    return;
  }

  let VCLeader = true;
  for (let i = 0; i < connectedUsers.length; i++) {
    const peerID = connectedUsers[i];
    if (myPeerID !== peerID && peerID > myPeerID) {
      VCLeader = false;
      break;
    }
  }

  if (VCLeader) {

    try {
      window.clearInterval(connectedMusicInterval);
      connectedMusicInterval = null;
    } catch (error) { }
    if (!connectedMusicInterval) {
      connectedMusicInterval = window.setInterval(() => {
        const playerElement = $(`#channelMusicAudio${scopedActiveChannel}`).get(0);
        if ((playerElement.duration - playerElement.currentTime) < 0.7) {
          serverPlayerDidEnd(guildUID, guildID, channelID);
        }
      }, 999);
    }
    
    
    if (data.nowPlaying && Object.keys(data.nowPlaying).length) {
      // Check to see if it ended
      const trackStarted = data.nowPlaying.startedAt;
      const trackDurationMS = data.nowPlaying.trackData.attributes.durationInMillis;
      const trackWillEndAt = new Date(trackStarted).getTime() + trackDurationMS;

      if (trackWillEndAt < new Date().getTime()) {
        // Track already ended.
        goChannelNextTrack(guildUID, guildID, channelID);
      }
    }
    else {
      if (data.queue && Object.keys(data.queue).length) {
        goChannelNextTrack(guildUID, guildID, channelID);
      }
    }

    if (action == 'forwardSong') {
      goChannelNextTrack(guildUID, guildID, channelID);
    }
  }
  else {
    try {
      window.clearInterval(connectedMusicInterval);
    } catch (error) { }
  }
}

async function goChannelNextTrack(guildUID, guildID, channelID) {
  const scopedActiveChannel = `${guildUID}${guildID}${channelID}`

  if (!cacheChannelVCMusic[scopedActiveChannel].queue) {
    await remove(ref(rtdb, `${activeVCMusicListener}/nowPlaying`));
    return; // No available queue.
  }

  const nextQueueID = Object.keys(cacheChannelVCMusic[scopedActiveChannel].queue)[0]
  
  let nextQueueData = cacheChannelVCMusic[scopedActiveChannel].queue[nextQueueID];

  const trackURL = await getPlaybackURL(nextQueueData.trackData, false);

  nextQueueData.startedAt = new Date().getTime();
  nextQueueData.randomInt = new Date().getTime();
  nextQueueData.trackURL = trackURL;

  await remove(ref(rtdb, `${activeVCMusicListener}/queue/${nextQueueID}`));
  await set(ref(rtdb, `${activeVCMusicListener}/nowPlaying`), nextQueueData);
}

function sendToServerPlayer(nowPlaying, guildUID, guildID, channelID, timeOffset) {
  const scopedActiveChannel = `${guildUID}${guildID}${channelID}`;
  if (!activeListeningParty || activeListeningParty !== `${guildUID}/${guildID}/${channelID}`) { return };
  if (currentChannelMusicCode == nowPlaying) { return };

  console.log(timeOffset)
  console.log(nowPlaying)
  sendTrackToPlayerRevamp(nowPlaying, `#channelMusicAudio${scopedActiveChannel}`, timeOffset, nowPlaying.trackURL);
  setMusicStatus(nowPlaying, true);
}

function serverPlayerDidEnd(guildUID, guildID, channelID) {
  const scopedActiveChannel = `${guildUID}${guildID}${channelID}`;

  $(`#channelMusicAudio${scopedActiveChannel}`).get(0).src = '';
  updateVCState(guildUID, guildID, channelID, cacheChannelVCMusic[scopedActiveChannel], 'forwardSong');
}

window.updateVolumeFromSlider = (scopedActiveChannel) => {
  $(`#channelMusicAudio${scopedActiveChannel}`).get(0).volume = $(`#sliderOnMusicVolume${scopedActiveChannel}`).get(0).value / 100;
}