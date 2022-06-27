// Presence system. Create real-time listeners for each of the user's friends.
// Demanding if 100+ friends. The listeners will be created and then not changed.
// Similar system to servers. Maybe hard cap on both for 110 ish.

import { getDatabase, ref, onValue, onDisconnect, set, serverTimestamp, off, query, remove } from "firebase/database";
import * as timeago from 'timeago.js';

import { displayImageAnimation } from "./app";
import { sendMusicStatus } from "./electronApp";
import { checkAppInitialized } from "./firebaseChecks";
import { buildMusicSocialCard } from "./music";
import { retrieveSetting } from "./settings";

checkAppInitialized();
const rtdb = getDatabase();

window.presenceFriends = [];
window.onlineBook = {};
window.presencecon = null;
window.mouseThrottle = false;
window.setAwayInterval= null;
window.isIdle = false;
window.isDBConnected = false;

window.createPresenceListeners = () => {
  const presenceListForward = friendsArrayDifference(presenceFriends, cacheUser.friends);
  const presenceListBackward = friendsArrayDifference(cacheUser.friends, presenceFriends);
  presenceFriends = cacheUser.friends;

  for (let i = 0; i < presenceListForward.length; i++) {
    const friend = presenceListForward[i];

    buildMusicSocialCard(friend);

    onValue(ref(rtdb, `users/${friend.u}`), (snapshot) => {
      if (snapshot.val()) {
        const friendStatus = snapshot.val().online;
        let friendIdle = false;
        let friendOnline = false;
        if (friendStatus == 'idle') {
          friendIdle = true;
        }
        else if (friendStatus == true) {
          friendOnline = true;
        }

        if (friendOnline || friendIdle) {
          onlineBook[friend.u] = { online: friendOnline ? friendOnline : friendIdle, lastOnline: null, currentlyListening: snapshot.val().currentlyListening };
          updatePresenceForUser(friend.u);
        }
        else {
          onlineBook[friend.u] = { online: friendOnline ? friendOnline : friendIdle, lastOnline: snapshot.val().lastOnline, currentlyListening: snapshot.val().currentlyListening };
          updatePresenceForUser(friend.u);
        }
      }
      else {
        onlineBook[friend.u] = { online: false, lastOnline: null };
        updatePresenceForUser(friend.u);
      }
    });

  } 

  for (let i = 0; i < presenceListBackward.length; i++) {
    const friend = presenceListBackward[i];

    off(query(ref(rtdb, `users/${friend.u}`)));
    const selector = $(`.${friend.u}presence`);
    selector.removeClass('presenceOffline');
    selector.removeClass('presenceOnline');
  }
}

export function updatePresenceForUser(uID) {
  if (!onlineBook[uID]) {
    return; // Will be loaded. Function to be re-called. OR not friends.
  }

  const selector = $(`.${uID}presence`); // Get all instances of the indicator.

  if (onlineBook[uID].online) {
    // Update listening to music tab!
    if (onlineBook[uID].currentlyListening && $(`#${uID}MusicListeningCard`).length) {
      $(`#${uID}MusicListeningCard`).removeClass('hidden');
      $(`#${uID}MusicListeningCard`).addClass('notHidden');
      $(`#${uID}musiclisteningalbumitem`).get(0)._tippy.setContent(`${onlineBook[uID].currentlyListening.title} by ${onlineBook[uID].currentlyListening.artist}`)
      $(`#${uID}musiclisteningalbumitem`).get(0).src = onlineBook[uID].currentlyListening.album;
      $(`#${uID}musiclisteningalbumitem`).get(0).onclick = () => {
        if (onlineBook[uID].currentlyListening.albumID) {
          openAlbum(onlineBook[uID].currentlyListening.albumID);
        }
        else {
          snac(`Album Error`, 'Unable to open album.', 'danger')
        }
      }
      displayImageAnimation(`${uID}musiclisteningalbumitem`);
      $('#activeFriendsMusicNotice').addClass('hidden');
    }
    else {
      $(`#${uID}MusicListeningCard`).addClass('hidden');
      $(`#${uID}MusicListeningCard`).removeClass('notHidden');
      if (!$(`#activeFriendsContainer`).children('.notHidden').length) {
        $('#activeFriendsMusicNotice').removeClass('hidden');
      }
    }
  }
  if (onlineBook[uID].online == true) { // Directly online.
    selector.each((i, obj) => {
      try { $(obj).get(0)._tippy.setContent('Online'); } catch (error) { }
    });
    selector.removeClass('presenceOffline');
    selector.removeClass('presenceIdle');
    selector.addClass('presenceOnline');
  }
  else if (onlineBook[uID].online == 'idle') {
    selector.each((i, obj) => {
      try { $(obj).get(0)._tippy.setContent('Idle'); } catch (error) { }
    });
    selector.removeClass('presenceOffline');
    selector.removeClass('presenceOnline');
    selector.addClass('presenceIdle');
  }
  else {
    selector.removeClass('presenceOnline');
    selector.removeClass('presenceIdle');
    selector.addClass('presenceOffline');
    if (!onlineBook[uID].lastOnline) {
      selector.each((i, obj) => {
        try { $(obj).get(0)._tippy.setContent('Offline'); } catch (error) { }
      });
    }

    // Remove from music currently listening tab.
    $(`#${uID}MusicListeningCard`).addClass('hidden');
    $(`#${uID}MusicListeningCard`).removeClass('notHidden');
    if (!$(`#activeFriendsContainer`).children('.notHidden').length) {
      $('#activeFriendsMusicNotice').removeClass('hidden');
    }
  }

}

export function showTippyListenerPresence(uID, toolElement) {
  if (onlineBook[uID] && onlineBook[uID].lastOnline) {
    // The reason for this is to make sure the last online tooltip is updated on hover.
    toolElement.get(0)._tippy.setContent(`Last online ${timeago.format(new Date(onlineBook[uID].lastOnline))}`);
  }
}


export async function setMusicStatus(track, status) {
  if (retrieveSetting('discordSongs', true)) {
    if (track) {
      if (status) {
        sendMusicStatus('playing', `${track.attributes.name} by ${track.attributes.artistName}`);
      }
      else {
        sendMusicStatus('paused', `${track.attributes.name} by ${track.attributes.artistName}`);
      }
    }
    else {
      sendMusicStatus('stopped', null);
    }
  }
  if (retrieveSetting('shareSongs', true)) {
    if (track) {
      // Update personal presence with the track details::
      await set(ref(rtdb, `users/${user.uid}/currentlyListening`), {
        id: track.id,
        title: track.attributes.name,
        artist: track.relationships.artists.data[0].attributes.name,
        album: track.attributes.artwork.url.replace('{w}', '500').replace('{h}', '500'),
        albumID: track.relationships.albums.data[0].id || "",
      });
    }
  }
}

export async function clearMusicStatus() {
  await remove(ref(rtdb, `users/${user.uid}/currentlyListening`));
}

export async function loadIdle() {
  window.addEventListener('mousemove', async function(e) {
    if (!mouseThrottle) {
      setTimeout(function () {
        activityReset();
        mouseThrottle = false;
      }, 2000);
    }
    mouseThrottle = true;

    if (isIdle) {
      isIdle = false;
      if (isDBConnected) {
        await set(presencecon, true);
      }
    }
  });

}

// SO: Timeouts to set the presence to idle after 8 minutes. Offline after 55 minutes.
// An existing test case I have is a user has a remaining connection which hadn't gotten deleted that' still on idle.
// I believe they had left after idle timeout before offline timeout and the value did not get updated.

async function activityReset() {
  window.clearTimeout(setAwayInterval);

  if (isDBConnected) {
    setAwayInterval = setTimeout(async () => {
      await set(presencecon, 'idle');
      isIdle = true;
    }, 8 * 60 * 1000) // 8 minutes
    // }, 5000) // 5 seconds
  }
}

// SO: Start presence listeners.
// This is called once when the user is logged in.
export function selfPresence() {
  onValue(ref(rtdb, '.info/connected'), (snap) => {
    isDBConnected = snap.val();
    if (snap.val() === true) {
      presencecon = ref(rtdb, `users/${user.uid}/online`);
      onDisconnect(presencecon).set(false);
      onDisconnect(ref(rtdb, `users/${user.uid}/lastOnline`)).set(serverTimestamp());
      onDisconnect(ref(rtdb, `users/${user.uid}/currentlyListening`)).remove();
      set(presencecon, true);
    }
    else {
      if (presencecon) {
        remove(presencecon);
      }
    }
  });

  onValue(ref(rtdb, `users/${user.uid}/online`), (snap) => {
    if (snap.val() === "idle") { // If another device went idle, remain online.
      if (!isIdle) {
        set(presencecon, true);
      }
    }
  });
}