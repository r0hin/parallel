import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.8.4/firebase-app.js'

const timeago2 = new timeago();

const fbApp = initializeApp({
  apiKey: "AIzaSyDusrpo9Bxk7uvnFUCLBJjxrPT8hCb81Z8",
  authDomain: "parallel-by-wop.firebaseapp.com",
  databaseURL: "https://parallel-by-wop-default-rtdb.firebaseio.com",
  projectId: "parallel-by-wop",
  storageBucket: "parallel-by-wop.appspot.com",
  messagingSenderId: "77839003871",
  appId: "1:77839003871:web:6ea87ec99c5aa7c5b2396a",
});

import { getPerformance } from 'https://www.gstatic.com/firebasejs/9.8.4/firebase-performance.js'
import { getFirestore, getDoc, doc} from 'https://www.gstatic.com/firebasejs/9.8.4/firebase-firestore.js'

window.snacks = {};
window.timeoutNotifyTiny = null;
window.timeoutNotifyTiny2 = null;
window.cacheTracksInfo = {};
window.musicPlaying = {};
window.musicCatalogue = {};

const perf = getPerformance();
const db = getFirestore();

// Get ID from URL Params
const url = new URL(window.location.href);
const playlistUID = url.searchParams.get("playlistUID");
const playlistID = url.searchParams.get("playlistID");
const artist = url.searchParams.get("artist");
const album = url.searchParams.get("albumID");
const track = url.searchParams.get("track");

if (playlistUID && playlistID) {
  getPlaylist(playlistUID, playlistID);
}
else if (artist) {
  // Artist
}
else if (album) {
  // Album
  getAlbum(album)
}
else if (track) {
  // Track
}
else {
  window.location.replace(`https://parallelsocial.net`);
}

async function getAlbum(albumID) {
 
  const album = (await makeMusicRequest(`albums/${albumID}?include=tracks`)).data[0];

  console.log(album);

  const tracks = album.relationships.tracks.data;

  console.log(tracks)

  $(`#content`).html(`
    <div class="playlistView">
      <div class="playlistTopLevel">
        <div class="playlistCover animated fadeIn"><img src="${album.attributes.artwork.url.replaceAll(`{w}`, 500).replaceAll('{h}', 500)}" /></div>
        <div class="playlistDetails">
          <h2 class="playlistTitle animated fadeInUp">${securityConfirmText(album.attributes.name)}</h2>
          <p class="playlistDetailsLine animated fadeIn" id="${playlistID}playlistDetailsLine">
            By ${album.attributes.artistName} <span class="playlistDetailsSeparator"><i class="bx bxs-circle"></i></span> 
            ${album.attributes.releaseDate} <span class="playlistDetailsSeparator"><i class="bx bxs-circle"></i></span> 
            ${tracks.length} track${tracks.length == 1 ? "" : "s"}
          </p>
          <button onclick="openAlbumInApp('${albumID}')" class="btn b-1 playButton"><i class="bx bx-rocket"></i>Open</button> 
          <p id="playlistDescription" class="playlistDescription">${album.attributes.editorialNotes ? album.attributes.editorialNotes.standard : ''}</p>
        </div>
      </div>
      <div class="hr"></div>
      <div class="musicViewContent">
        <div class="tracksContainer" id="albumViewTracksContainer"></div>
      </div>
    <div>
  `);

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    createTrack(track, `albumViewTracksContainer`, i, false, []);
  }
}

async function getPlaylist(playlistUID, playlistID) {
  try {
    const playlistDoc = await getDoc(doc(db, `users/${playlistUID}/playlists/${playlistID}`));
    if (!playlistDoc.exists) { throw new Error("Playlist does not exist"); }

    if (playlistDoc.data().sharing == 'friends') { throw new Error("This playlist is private"); }

    const coverURL = playlistDoc.data().imageURL || `https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/app%2FdefaultAlbum.png?alt=media&token=589fb415-f487-4f4c-b6b5-5c150eb1ceec`;

    // const doc = playlistDoc;
    
    
    let lengthString = '';
    if (playlistDoc.data().totalDuration) {
      const hours = Math.floor((Math.floor(playlistDoc.data().totalDuration / 1000)) / 3600);
      const minutes = Math.floor((Math.floor(playlistDoc.data().totalDuration / 1000)) % 3600 / 60);
      const seconds = Math.floor((Math.floor(playlistDoc.data().totalDuration / 1000)) % 3600 % 60);
      lengthString = `<span class="playlistDetailsSeparator"><i class="bx bxs-circle"></i></span> ${hours}h ${minutes}m ${seconds}s`;
    }

    const modifiedDate = playlistDoc.data().dateModified.toDate();

    let cloneText = '';
    if (playlistDoc.data().clone) {
      if (playlistDoc.data().clonedMultiple) {
        cloneText = `<span class="playlistCreator">${playlistDoc.data().creator.split('.')[1].capitalize()}</span>, <span class="playlistCreator">${playlistDoc.data().clone.split('.')[1].capitalize()}</span>, and <span class="playlistCreator noHighlight">several others</span>`;
      }
      else {
        cloneText = `<span class="playlistCreator">${playlistDoc.data().creator.split('.')[1].capitalize()}</span> ${playlistDoc.data().clone ? `and <span class="playlistCreator">${playlistDoc.data().clone.split('.')[1].capitalize()}</span>` : ""}`
      }
    }
    else {
      cloneText = `<span class="playlistCreator">${playlistDoc.data().creator.split('.')[1].capitalize()}</span>`
    }

    let lockText = '';
    if (playlistDoc.data().sharing && playlistDoc.data().sharing == 'none') {
      lockText = `<span class="playlistDetailsSeparator"><i class="bx bxs-circle"></i></span> <i onclick="openSharing('${playlistUID}', '${playlistID}')" class="bx bx-lock-alt clickableIcon"></i>`;
    }

    $(`#content`).html(`
      <div class="playlistView">
        <div class="playlistTopLevel">
          <div class="playlistCover animated fadeIn"><img src="${coverURL}" /></div>
          <div class="playlistDetails">
            <h2 class="playlistTitle animated fadeInUp">${securityConfirmText(playlistDoc.data().title)}</h2>
            <p class="playlistDetailsLine animated fadeIn" id="${playlistUID}${playlistID}playlistDetailsLine"></p>
            <button onclick="openPlaylistInApp('${playlistUID}', '${playlistID}')" class="btn b-1 playButton"><i class="bx bx-rocket"></i>Open</button> 
            <p id="playlistDescription" class="playlistDescription">${securityConfirmText(playlistDoc.data().description || "No description")}</p>
          </div>
        </div>
        <div class="hr"></div>
        <div class="musicViewContent">
          <div class="notice hidden animated fadeIn" id="noTrackNotice">No tracks added to this playlist.</div>
          <div class="tracksContainer" id="playlistViewTracksContainer"></div>
        </div>
        <p style="color: grey; font-size: 14px; text-align: center; width: 100%;">View reviews for this playlist on Parallel.</p>
      <div>
    `);

    twemoji.parse($(`#playlistDescription`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });
    
    $(`#${playlistUID}${playlistID}playlistDetailsLine`).html(`By ${cloneText} <span class="playlistDetailsSeparator"><i class="bx bxs-circle"></i></span> Updated ${timeago2.format(modifiedDate)} <span class="playlistDetailsSeparator"><i class="bx bxs-circle"></i></span> ${playlistDoc.data().tracks ? playlistDoc.data().tracks.length : 0 } track${playlistDoc.data().tracks && playlistDoc.data().tracks.length == 1 ? "" : "s"} ${lengthString}${lockText}`);
    
    // Tracks Rendering (Feb 9, 2022): 250 batches, paginatated.

    const tracks = playlistDoc.data().tracks || [];

    const tempPlaylistForward = [...tracks]

    if (tracks.length) {
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

    for (let i = 0; i < tracks.length; i++) {
      createTrack(musicCatalogue[tracks[i].trackID], `playlistViewTracksContainer`, i, `${playlistUID}${playlistID}${tracks[i].randomID}${tracks[i].trackID}`, ["playlistUID", playlistUID, "playlistID", playlistID, "playlistRandomID", tracks[i].randomID]);
    }

    $(`#${playlistUID}${playlistID}noTrackNotice`).addClass('hidden');
    if (!tracks.length) {
      $(`#${playlistUID}${playlistID}noTrackNotice`).removeClass('hidden');
    }

  } catch (error) {
    console.log(error);
    snac('No Access', 'This playlist does not exist or is not public.', 'error')
    $(`#statusText`).html('No access.')
  }
}

function playlistArrayDifference(oldArray, newArray) {
  const difference = newArray.filter(({ trackID: id1, randomID: uint1 }) => !oldArray.some(({ trackID: id2, randomID: uint2 }) => (id2 === id1 && uint1 === uint2)));
  return difference;
}

function makeMusicRequest(q) {
  return new Promise(async (resolve, reject) => {

    const onLoad = await getDoc(doc(db, `app/onLoad`));

    const appleMusicToken = onLoad.data().appleMusicToken;

    const fetched = await fetch(`https://api.music.apple.com/v1/catalog/us/${q}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${appleMusicToken}`,
      }
    });

    resolve(await fetched.json());
  });
}

window.openPlaylistInApp = (playlistUID, playlistID) => {
  snac('Opening...', `If you do not have the app, you can download it <a href="${window.location.origin}">here</a> or use the <a href="${window.location.origin}/app?deeplink=playlistpcdiff${playlistUID}pcdiff${playlistID}">web version</a>.`);
  window.location.replace(`parallel://playlist.${playlistUID}.${playlistID}`);
}

window.openAlbumInApp = (albumID) => {
  snac('Opening...', `If you do not have the app, you can download it <a href="${window.location.origin}">here</a> or use the <a href="${window.location.origin}/app?deeplink=albumpcdiff${albumID}">web version</a>.`);
  window.location.replace(`parallel://album.${albumID}`);
}

function securityConfirmText(str) {
  let doc = new DOMParser().parseFromString(str, 'text/html');
  return doc.body.textContent || "";
}

try {
  Object.defineProperty(String.prototype, 'capitalize', {
    value: function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false
  }); 
} catch (error) {}

// Insert el at index via $().insertIndex()
$.fn.insertIndex=function(e){var t=this.parent().children().eq(e);return this.index()>e?t.before(this):t.after(this),this};

window.snac = (title, description, themeInput, timestamp) => {
  const theme = themeInput || '';
  const id = new Date().getTime();
  const a = document.createElement('div');
  a.id = `snack-${id}`;
  a.setAttribute('class', `snack ${theme.toLowerCase()}Snack`);
  a.innerHTML = `
    <div>
      <h3>${title}</h3>
      <button onclick="hideSnack('${id}')" class="btn roundedButton"><i class="bx bx-x"></i></button>
    </div>
    ${description && `<p>${description}</p>`}
  `
  
  snacks[id] = window.setTimeout(() => {
    hideSnack(id);
  }, timestamp || 3900);

  $(`#snacksContainer`).append(a);
}

window.hideSnack = (id) => {
  window.clearTimeout(snacks[id]);
  $(`#snack-${id}`).css(`height`, $(`#snack-${id}`).height());
  window.setTimeout(() => {
    $(`#snack-${id}`).addClass('snackGone');
  
    window.setTimeout(() => {
      $(`#snack-${id}`).remove();
    }, 499);
  }, 99);
}


window.notifyTiny = (text, short) => {
  // Little popout from the top.
  $(`#notifyTinyText`).html(text);

  $('#notifyTiny').removeClass('hidden');

  $('#notifyTinyContent').removeClass('fadeOutUp');
  $('#notifyTinyContent').addClass('fadeInDown');

  let timer = 3999;
  if (short) {
    timer = 1999
  }

  window.clearTimeout(timeoutNotifyTiny);
  timeoutNotifyTiny = window.setTimeout(() => {
    $('#notifyTinyContent').addClass('fadeOutUp');
    $('#notifyTinyContent').removeClass('fadeInDown');
    window.clearTimeout(timeoutNotifyTiny2);
    timeoutNotifyTiny2 = window.setTimeout(() => {
      $('#notifyTiny').addClass('hidden');
    }, 800)
  }, timer)
}

function createTrack(track, targetElementID, index, customID, attributes) {
  if (!track) {
    const a = document.createElement('div');
    a.id = customID || `TRACK${new Date().getTime()}${track.id}`;
    a.setAttribute('class', 'erroredTrack');
    a.innerHTML = `<p>Unable to load this track.</p>`;
    $(`#${targetElementID}`).append(a);
    return;
  }

  const temporaryTrackID = customID || `TRACK${new Date().getTime()}${track.id}`;
  const ms = track.attributes.durationInMillis;
  const minutes = Math.floor(ms / 60000);
  let seconds = ((ms % 60000) / 1000).toFixed(0);
  if (`${seconds}`.length == 1) {
    seconds = `0${seconds}`;
  }

  musicCatalogue[`${track.id}`] = track;

  const a = document.createElement('div');
  a.setAttribute('class', 'music-track trackContext');
  a.setAttribute('trackID', track.id);
  
  if (attributes) {
    for (let i = 0; i < attributes.length; i = i + 2) {
      const key = attributes[i];
      const value = attributes[i + 1];
      a.setAttribute(key, value);
    }
  }

  a.id = temporaryTrackID;
  a.innerHTML = `
    <div class="music-track-left">
      <div class="music-track-index-container ${((typeof(index) == 'object' || typeof(index) == 'boolean') ? 'hidden' : '')}" onclick="event.stopPropagation();">
      <div id="music-track-icon-${temporaryTrackID}" class="music-track-icon ${((typeof(index) == 'object' || typeof(index) == 'boolean') ? 'hidden' : '')}">${index+1}</div>
      </div>
      <div class="music-track-cover">
        <img src="${track.attributes.artwork.url.replace('{h}', '128').replace('{w}', '128')}"></img>
      </div>
      <div class="music-track-title-container">
        <div class="music-track-title trackTitle${track.id}" title="${track.attributes.name}">${track.attributes.name}</div>
        <div class="music-track-album" onclick="event.stopPropagation(); openAlbum('${track.relationships ? track.relationships.albums.data[0].id : null}', '${track.id}')" title="${track.attributes.albumName}">${track.attributes.albumName}</div>
      </div>
    </div>
    <div id="${temporaryTrackID}ArtistName" trackID="${track.id}" class="music-track-artist artistButtonContext acceptLeftClick" title="${track.attributes.artistName}">${track.attributes.artistName}</div>
    <div class="music-track-details" >
      <div class="music-track-explicit ${track.attributes.contentRating == 'explicit' ? '' : 'hidden'}">E</div>
      <div class="music-track-duration">${minutes}:${seconds}</div>
    </div>
  
  `
  $(`#${targetElementID}`).append(a);
}
