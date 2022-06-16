process.env.HMR_PORT=0;process.env.HMR_HOSTNAME="localhost";// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"js/firebaseChecks.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkAppInitialized = checkAppInitialized;

var _app = require("firebase/app");

var _performance = require("firebase/performance");

window.isAppInitialized = false;

function checkAppInitialized() {
  if (!window.isAppInitialized) {
    window.isAppInitialized = true;
    const fbApp = (0, _app.initializeApp)({
      apiKey: "AIzaSyDusrpo9Bxk7uvnFUCLBJjxrPT8hCb81Z8",
      authDomain: "parallel-by-wop.firebaseapp.com",
      databaseURL: "https://parallel-by-wop-default-rtdb.firebaseio.com",
      projectId: "parallel-by-wop",
      storageBucket: "parallel-by-wop.appspot.com",
      messagingSenderId: "77839003871",
      appId: "1:77839003871:web:6ea87ec99c5aa7c5b2396a"
    });
  }
}

;
checkAppInitialized();
const perf = (0, _performance.getPerformance)();
window.snacks = {};
window.timeoutNotifyTiny = null;
window.timeoutNotifyTiny2 = null;

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
  `;
  snacks[id] = window.setTimeout(() => {
    hideSnack(id);
  }, timestamp || 3900);
  $(`#snacksContainer`).append(a);
};

window.hideSnack = id => {
  window.clearTimeout(snacks[id]);
  $(`#snack-${id}`).css(`height`, $(`#snack-${id}`).height());
  window.setTimeout(() => {
    $(`#snack-${id}`).addClass('snackGone');
    window.setTimeout(() => {
      $(`#snack-${id}`).remove();
    }, 499);
  }, 99);
};

window.notifyTiny = (text, short) => {
  // Little popout from the top.
  $(`#notifyTinyText`).html(text);
  $('#notifyTiny').removeClass('hidden');
  $('#notifyTinyContent').removeClass('fadeOutUp');
  $('#notifyTinyContent').addClass('fadeInDown');
  let timer = 3999;

  if (short) {
    timer = 1999;
  }

  window.clearTimeout(timeoutNotifyTiny);
  timeoutNotifyTiny = window.setTimeout(() => {
    $('#notifyTinyContent').addClass('fadeOutUp');
    $('#notifyTinyContent').removeClass('fadeInDown');
    window.clearTimeout(timeoutNotifyTiny2);
    timeoutNotifyTiny2 = window.setTimeout(() => {
      $('#notifyTiny').addClass('hidden');
    }, 800);
  }, timer);
};
},{}],"js/componentse.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createAlbum = createAlbum;
exports.createApplePlaylist = createApplePlaylist;
exports.createArtist = createArtist;
exports.createGenre = createGenre;
exports.createTrack = createTrack;

var _functions = require("@firebase/functions");

var _firebaseChecks = require("./firebaseChecks");

(0, _firebaseChecks.checkAppInitialized)();
const functions = (0, _functions.getFunctions)();
window.musicCatalogue = {};

function createAlbum(album, targetElementID, customID) {
  const temporaryAlbumID = customID || `ALBUM${new Date().getTime()}${album.id}`;
  let likeSnippet = `<button onclick="addToLibrary('albums', '${album.id}')" class="btn roundedButton likedButtonalbums${album.id}"><i class="bx bx-heart"></i></button>`;

  if (cacheLibraryAlbums.includes(album.id)) {
    likeSnippet = `<button onclick="removeFromLibrary('albums', '${album.id}')" class="btn roundedButton likedButtonalbums${album.id}"><i class="bx bxs-heart"></i></button> `;
  }

  let explicitSnippet = '';

  if (album.attributes.contentRating && album.attributes.contentRating == 'explicit') {
    explicitSnippet = `<div class="music-album-explicit">E</div>`;
  }

  const a = document.createElement('div');
  a.id = temporaryAlbumID;
  a.setAttribute('class', 'music-album invisible fadeIn faster');
  a.innerHTML = `
    <img onclick="openAlbum('${album.id}')" draggable="false" id="${temporaryAlbumID}Photo" class="${temporaryAlbumID}Photo invisible animated"/>
    ${explicitSnippet}
    <div class="music-album-details">
      <p title="${album.attributes.name}" onclick="openAlbum('${album.id}')" class="music-album-title">${album.attributes.name}</p>
      ${likeSnippet}
    </div>
    <div class="music-album-details">
      <p id="Album${temporaryAlbumID}Artist" class="music-album-artist" title="${album.attributes.artistName}">${album.attributes.artistName}</p>
      <p class="music-album-date">${album.attributes.releaseDate}</p>
    </div>
  `;
  $(`#${targetElementID}`).append(a);

  $(`#Album${temporaryAlbumID}Artist`).get(0).onclick = async event => {
    const artist = await makeMusicRequest(`albums/${album.id}/artists`);
    setContextSelectArtistItems(null, null, null, artist.data, event);
  };

  $(`#${temporaryAlbumID}Photo`).get(0).setAttribute('src', album.attributes.artwork.url.replace('{w}', '500').replace('{h}', '500'));

  $(`#${temporaryAlbumID}Photo`).get(0).onload = () => {
    $(`#${temporaryAlbumID}Photo`).addClass('zoomIn');
    $(`#${temporaryAlbumID}`).removeClass('invisible');
    $(`#${temporaryAlbumID}Photo`).removeClass('invisible');
    cosha(`${temporaryAlbumID}Photo`);
    window.setTimeout(() => {
      $(`#${temporaryAlbumID}`).removeClass('animated');
      $(`#${temporaryAlbumID}Photo`).removeClass('animated');
    }, 999);
  };
}

async function createArtist(artist, targetElementID, customID) {
  const temporaryArtistID = customID || `ARTIST${new Date().getTime()}${artist.id}`;
  let likeSnippet = `<button onclick="addToLibrary('artists', '${artist.id}')" class="btn roundedButton likedButtonartists${artist.id}"><i class="bx bx-heart"></i></button>`;

  if (cacheLibraryArtists.includes(artist.id)) {
    likeSnippet = `<button onclick="removeFromLibrary('artists', '${artist.id}')" class="btn roundedButton likedButtonartists${artist.id}"><i class="bx bxs-heart"></i></button> `;
  }

  const a = document.createElement('div');
  a.setAttribute('class', 'music-artist invisible animated fadeIn faster');
  a.id = temporaryArtistID;

  a.onclick = () => {
    openArtist(artist.id);
  };

  a.innerHTML = `
    <img draggable="false" id="${temporaryArtistID}Photo" class="${temporaryArtistID}Photo invisible animated"/>
    <p class="music-artist-name" title="${artist.attributes.name}">${artist.attributes.name}</p>
    ${likeSnippet}
  `;
  $(`#${targetElementID}`).append(a);
  const getArtistProfilePhoto = (0, _functions.httpsCallable)(functions, 'getArtistProfilePhoto');
  const artistURL = (await getArtistProfilePhoto({
    artistID: artist.id
  })).data.data.replace('cw.png', 'cc.webp').replace('{w}', 240).replace('{h}', 240);
  $(`#${temporaryArtistID}Photo`).get(0).setAttribute('src', artistURL);

  $(`#${temporaryArtistID}Photo`).get(0).onload = () => {
    $(`#${temporaryArtistID}Photo`).addClass('zoomIn');
    $(`#${temporaryArtistID}Photo`).removeClass('invisible');
    $(`#${temporaryArtistID}`).removeClass('invisible');
    cosha(`${temporaryArtistID}Photo`);
    window.setTimeout(() => {
      $(`#${temporaryArtistID}`).removeClass('animated');
      $(`#${temporaryArtistID}Photo`).removeClass('animated');
    }, 999);
  };
}

function createTrack(track, targetElementID, index, customID, attributes, prependInstead, customOnclick, backupID) {
  if (!track) {
    const a = document.createElement('div');
    a.id = customID || `TRACK${new Date().getTime()}${track.id}`;
    a.setAttribute('class', 'erroredTrack');

    if (attributes[attributes.indexOf('playlistUID') + 1] == user.uid) {
      // My playlist, offer to delete it.
      a.innerHTML = `<p>Unable to load this track. <a id="${a.id}removeFromPlaylistButton">Remove from playlist?</a></p>`;
      $(`#${targetElementID}`).append(a);

      $(`#${a.id}removeFromPlaylistButton`).get(0).onclick = async () => {
        $(`#${a.id}`).html('<p>Removing...</p>');
        removeBrokenTrackFromPlaylist(attributes[attributes.indexOf('playlistID') + 1], backupID, attributes[attributes.indexOf('playlistRandomID') + 1]);
      };
    } else {
      a.innerHTML = `<p>Unable to load this track.</p>`;
      $(`#${targetElementID}`).append(a);
    }

    return;
  }

  const temporaryTrackID = customID || `TRACK${new Date().getTime()}${track.id}`;
  const ms = track.attributes.durationInMillis;
  const minutes = Math.floor(ms / 60000);
  let seconds = (ms % 60000 / 1000).toFixed(0);

  if (`${seconds}`.length == 1) {
    seconds = `0${seconds}`;
  }

  musicCatalogue[`${track.id}`] = track;
  let likeSnippet = `<button onclick="event.stopPropagation(); addToLibrary('tracks', '${track.id}')" class="btn roundedButton likedButtontracks${track.id}"><i class="bx bx-heart"></i></button>`;

  if (cacheLibraryTracks.includes(track.id)) {
    likeSnippet = `<button onclick="event.stopPropagation(); removeFromLibrary('tracks', '${track.id}')" class="btn roundedButton likedButtontracks${track.id}"><i class="bx bxs-heart"></i></button> `;
  }

  const a = document.createElement('div');
  a.setAttribute('class', `music-track trackContext music-track-${track.id}`);
  a.setAttribute('trackID', track.id);

  if (customOnclick) {
    a.setAttribute('onclick', customOnclick);
  } else {
    a.onclick = () => {
      playTrack(track.id, targetElementID, index);
    };
  }

  if (attributes) {
    for (let i = 0; i < attributes.length; i = i + 2) {
      const key = attributes[i];
      const value = attributes[i + 1];
      a.setAttribute(key, value);
    }
  }

  let indexSnippet = `<div id="music-track-icon-${temporaryTrackID}" class="music-track-icon ${typeof index == 'object' || typeof index == 'boolean' ? 'hidden' : ''}">${index + 1}</div>`;

  if (a.getAttribute('playlistUID') == user.uid) {
    indexSnippet = `<div onclick="event.stopPropagation(); prepareSetTrackIndexByInput('${user.uid}', '${a.getAttribute('playlistID')}', ${index})" id="music-track-icon-${temporaryTrackID}" class="music-track-icon music-track-icon-hover ${typeof index == 'object' || typeof index == 'boolean' ? 'hidden' : ''}">${index + 1}</div>`;
  }

  a.id = temporaryTrackID;
  a.innerHTML = `
    <div class="music-track-left">
      <div class="music-track-index-container ${typeof index == 'object' || typeof index == 'boolean' ? 'hidden' : ''}" onclick="event.stopPropagation();">
        ${indexSnippet}  
      </div>
      <div class="music-track-cover">
        <img src="${track.attributes.artwork.url.replace('{h}', '128').replace('{w}', '128')}"></img>
      </div>
      <div class="music-track-title-container">
        <div class="music-track-title ${`${musicPlaying.id}` == `${track.id}` ? 'nowPlayingTitle' : ''} trackTitle${track.id}" title="${track.attributes.name}">${track.attributes.name}</div>
        <div class="music-track-album" onclick="event.stopPropagation(); openAlbum('${track.relationships ? track.relationships.albums.data[0].id : null}', '${track.id}')" title="${track.attributes.albumName}">${track.attributes.albumName}</div>
      </div>
    </div>
    <div id="${temporaryTrackID}ArtistName" trackID="${track.id}" class="music-track-artist artistButtonContext acceptLeftClick" title="${track.attributes.artistName}">${track.attributes.artistName}</div>
    <div class="music-track-details" onclick="event.stopPropagation();">
      <div class="music-track-explicit ${track.attributes.contentRating == 'explicit' ? '' : 'hidden'}">E</div>
      ${likeSnippet}
      <div class="music-track-duration">${minutes}:${seconds}</div>
      <button id="${temporaryTrackID}DropdownButton" class="btn roundedButton"><i class="bx bx-dots-horizontal-rounded"></i></button>
    </div>
  
  `;

  if (prependInstead) {
    $(`#${targetElementID}`).prepend(a);
  } else {
    $(`#${targetElementID}`).append(a);
  }

  $(`#${temporaryTrackID}ArtistName`).get(0).onclick = () => {
    event.stopPropagation();
    checkElements(event);
  };

  $(`#${temporaryTrackID}DropdownButton`).get(0).onclick = () => {
    event.stopPropagation();
    showContextOf('track', event, $(`#${temporaryTrackID}`).get(0), track.id);
  };
}

function createApplePlaylist(playlist, targetElementID) {
  playlist.id = playlist.id.replaceAll('.', '_');
  const temporaryPlaylistID = `PLAYLIST${new Date().getTime()}${playlist.id}`;
  const a = document.createElement('div');
  a.id = temporaryPlaylistID;
  a.setAttribute('class', 'music-playlist invisible fadeIn faster');
  a.innerHTML = `
    <img onclick="openApplePlaylist('${playlist.id}')" draggable="false" id="${temporaryPlaylistID}Photo" class="${temporaryPlaylistID}Photo invisible animated"/>
    <div class="music-playlist-details">
      <p title="${playlist.attributes.name}" onclick="openApplePlaylist('${playlist.id}')" class="music-playlist-title">${playlist.attributes.name}</p>
    </div>
  `;
  $(`#${targetElementID}`).append(a);
  $(`#${temporaryPlaylistID}Photo`).get(0).setAttribute('src', playlist.attributes.artwork.url.replace('{w}', '500').replace('{h}', '500'));

  $(`#${temporaryPlaylistID}Photo`).get(0).onload = () => {
    $(`#${temporaryPlaylistID}Photo`).addClass('zoomIn');
    $(`#${temporaryPlaylistID}`).removeClass('invisible');
    $(`#${temporaryPlaylistID}Photo`).removeClass('invisible');
    cosha(`${temporaryPlaylistID}Photo`);
    window.setTimeout(() => {
      $(`#${temporaryPlaylistID}`).removeClass('animated');
      $(`#${temporaryPlaylistID}Photo`).removeClass('animated');
    }, 999);
  };
}

function createGenre(genre, targetElementID) {
  const temporaryGenreID = `GENRE${new Date().getTime()}${genre.id}`;
  const a = document.createElement('div');

  a.onclick = () => {
    openGenre(genre.id);
  };

  a.setAttribute('class', 'music-genre'); // Create randomized gradient:

  const valueOne = Math.floor(Math.random() * 256);
  const valueTwo = Math.floor(Math.random() * 256);
  const valueThree = Math.floor(Math.random() * 256);
  const valueFour = Math.floor(Math.random() * 256);
  const valueFive = Math.floor(Math.random() * 256);
  const valueSix = Math.floor(Math.random() * 256);
  a.setAttribute('style', `background: linear-gradient(to right, rgba(${valueOne}, ${valueTwo}, ${valueThree}, 0.2), rgba(${valueFour}, ${valueFive}, ${valueSix}, 0.2));`);
  a.id = temporaryGenreID;
  a.innerHTML = `
    <div class="music-genre-name" title="${genre.attributes.name}">${genre.attributes.name}</div>
  `;
  $(`#${targetElementID}`).append(a);
}
},{"./firebaseChecks":"js/firebaseChecks.js"}]},{},["js/componentse.js"], null)