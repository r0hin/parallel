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
})({"css/home.css":[function(require,module,exports) {

},{}],"js/firebaseChecks.js":[function(require,module,exports) {
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
},{"./firebaseChecks":"js/firebaseChecks.js"}],"js/stripe.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkValidSubscription = checkValidSubscription;
exports.goToCheckout = goToCheckout;
exports.loadSubscription = loadSubscription;
exports.manageSubscription = manageSubscription;
exports.showPremiumThanks = showPremiumThanks;

var _functions = require("@firebase/functions");

var timeago = _interopRequireWildcard(require("timeago.js"));

var _jsConfetti = _interopRequireDefault(require("js-confetti"));

var _display = require("./display");

var _firebaseChecks = require("./firebaseChecks");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

window.currentSubscription = null;
window.jsConfetti = new _jsConfetti.default(); // const stripe = new Stripe(`pk_live_51HiZ1SBa3MWDKrNRDi6Gl1mfeAhFmUGtP7EmEjWFB32FIF6d44fR0a2IPw7OBaJle88TSq5OS6qRxvhIh2wVMd9X00Fpw3SMEG`);
// const stripe = new Stripe(`pk_test_51HiZ1SBa3MWDKrNRytrkn8KhWYxL1bZHqe6QMLojrnW3RO8swyyi1pefyz9FPWH1wYdhsHraVJ2ltIYdHItccyAu009epSj6MP`);

(0, _firebaseChecks.checkAppInitialized)();
const functions = (0, _functions.getFunctions)();

switch (new URL(window.location.href).searchParams.get('a')) {
  case 'stripeSuccess':
    window.history.replaceState("Parallel", "Parallel", "/app.html");
    showPremiumThanks();
    break;

  case 'stripeCancel':
    window.history.replaceState("Parallel", "Parallel", "/app.html");
    snac('Purchase Cancelled', '');
    break;

  default:
    break;
}

function loadSubscription() {
  // Update options.
  $(`#infinitePerkName`).html(cacheUser.username);

  if (cacheUser.subscription) {
    if (cacheUser.subscription == 'infinite') {
      setUserPremium();
      return;
    } else if (checkValidSubscription(cacheUser.subscription)) {
      setUserPremium();
      return;
    } else {
      userNotPremium();
      return;
    }
  } else {
    userNotPremium();
    return;
  }
}

function checkValidSubscription(date) {
  if (!date) {
    return false;
  }

  if (date == 'infinite') {
    return true;
  }

  if (date > new Date().getTime()) {
    return true;
  }

  return false;
}

async function goToCheckout(priceID) {
  $(`.purchaseButton`).addClass('disabled');
  notifyTiny('Requesting checkout...');
  const startPayment = (0, _functions.httpsCallable)(functions, 'startPayment');
  const result = await startPayment({
    priceID: priceID,
    successURL: `${window.location.href}?a=stripeSuccess`,
    cancelURL: `${window.location.href}?a=stripeCancel`
  });
  window.location.replace(result.data.data);
}

async function manageSubscription() {
  notifyTiny('Requesting portal...');
  $(`#manageSubscriptionButton`).addClass('disabled');
  const customerPortal = (0, _functions.httpsCallable)(functions, 'customerPortal');
  const result = await customerPortal({
    successURL: `${window.location.href}`
  });
  window.location.replace(result.data.data);
}

function setUserPremium() {
  $(`.freeTrialBadges`).removeClass("hidden");

  if (cacheUser.hadSubscription) {
    $(`.freeTrialBadges`).addClass("hidden");
  }

  const absoluteDate = cacheUser.subscription;
  $(`#purchaseExpiry`).html(`${timeago.format(absoluteDate)} (${new Date(absoluteDate).toLocaleDateString()})`);

  if (cacheUser.subscription == 'infinite') {
    $(`#purchaseExpiry`).html(`never!`);
    $(`#manageSubscriptionButton`).addClass('disabled');
  } else {
    $(`#manageSubscriptionButton`).removeClass('disabled');
  }

  $(`#infiniteActive`).removeClass('hidden');
  $(`#infiniteNotActive`).addClass('hidden');
  $(`#username1`).html(`<span class="infiniteTextSpan">${cacheUser.username.capitalize()}</span>`);
}

function userNotPremium() {
  $(`#infiniteActive`).addClass('hidden');
  $(`#infiniteNotActive`).removeClass('hidden');
  $(`#username1`).html(cacheUser.username.capitalize());
}

function showPremiumThanks() {
  (0, _display.openModal)('thanksPremium');
  snac('Badge Added', 'An "infinite" badge has been added to your profile.', 'success', 6999); // A little too much confetti.

  jsConfetti.addConfetti({
    confettiColors: ['#F25E92', '#3267FF']
  });
  jsConfetti.addConfetti({
    emojis: ['🥳', '🎉'],
    emojiSize: 64,
    confettiNumber: 6
  });
  window.setTimeout(() => {
    jsConfetti.addConfetti({
      confettiColors: ['#F25E92', '#3267FF']
    });
    jsConfetti.addConfetti({
      emojis: ['⚡'],
      emojiSize: 64,
      confettiNumber: 12
    });
    window.setTimeout(() => {
      jsConfetti.addConfetti({
        emojis: ['💖', '😩'],
        emojiSize: 64,
        confettiNumber: 12
      });
    }, 1500);
  }, 1500);
}
},{"./display":"js/display.js","./firebaseChecks":"js/firebaseChecks.js"}],"js/playback.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPlaybackURL = getPlaybackURL;
exports.sendTrackToPlayerRevamp = sendTrackToPlayerRevamp;

var _app = require("./app");

var _display = require("./display");

var _stripe = require("./stripe");

var _performance = require("firebase/performance");

var _music = require("./music");

var _firebaseChecks = require("./firebaseChecks");

(0, _firebaseChecks.checkAppInitialized)();
const perf = (0, _performance.getPerformance)();
window.musicErrored = false;
window.playingMP4 = false;
window.playingDuration = null;

function getPlaybackURL(trackDetails, regenerate) {
  return new Promise(async (resolve, reject) => {
    const timerOne = new Date().getTime();
    const playTrace = (0, _performance.trace)(perf, "MUSIC_FETCH_PLAY");
    playTrace.start();
    const fetched = await fetch(`https://parallelcloud-y3wxrl53eq-uc.a.run.app/play?trackID=${trackDetails.id}&trackTitle=${trackDetails.attributes.name}&trackArtist=${trackDetails.attributes.artistName}&trackISRC=${trackDetails.attributes.isrc}&trackDuration=${trackDetails.attributes.durationInMillis / 1000}${(0, _stripe.checkValidSubscription)(cacheUser.subscription) ? '&premium=true' : ''}${regenerate ? '&regenerate=true' : ''}${trackDetails.attributes.contentRating == 'explicit' ? '&explicit=true' : ''}`);
    playTrace.stop();
    console.log(`Done stage 1 in ${(new Date().getTime() - timerOne) / 1000}s.`);
    const response = await fetched.json();
    playingMP4 = response.mp4s == 'true' ? true : false;
    playingDuration = response.duration || 0;
    resolve([response.url, response.url2]);
    return;
  });
}

async function sendTrackToPlayerRevamp(trackDetails, audioElementSelector, guildOffset, guildTrackURL, guildTrackURL2) {
  if (!playback) {
    snac('No Playback Available', 'This feature has been temporarily disabled. Please try again later.', 'danger');
    return;
  }

  musicErrored = false;
  let trackURL = guildTrackURL;
  let trackURL2 = guildTrackURL2;

  if (!trackURL) {
    const [url, url2] = await getPlaybackURL(trackDetails, false);
    trackURL = (0, _display.decode)(url);
    trackURL2 = (0, _display.decode)(url2);
  } else {
    trackURL = (0, _display.decode)(trackURL);
    trackURL2 = (0, _display.decode)(trackURL2);
  }

  const timerTwo = new Date().getTime();
  const audio = $(`${audioElementSelector}`).get(0);
  audio.src = "";

  audio.onloadeddata = () => {};

  audio.onerror = () => {};

  audio.onloadeddata = () => {
    audio.onloadeddata = () => {};

    audio.onerror = () => {};

    console.log(`Done stage 2 in ${(new Date().getTime() - timerTwo) / 1000}s.`);

    if (guildOffset) {
      setOffset(guildOffset, audio);
    }

    ;
    audio.play();
  };

  audio.onerror = async () => {
    audio.onloadeddata = () => {};

    audio.onerror = () => {};

    if (playingDuration > 960) {
      // 960 seconds.
      // TODO: Find a solution to play the song more cost effectively.
      snac('Playback Error', `We could not stream this track for you because it is too long. We working to fix the issue as soon as possible`, 'danger');
      (0, _app.reportTrack)(trackDetails.id, true);
      (0, _music.forwardSong)();
      return;
    }

    const mediaSource = new MediaSource();

    try {
      audio.src = window.URL.createObjectURL(mediaSource);
    } catch (error) {}

    ;
    mediaSource.addEventListener('sourceopen', async () => {
      libraryPlayer.play();
      let sourceBuffer = null;

      if (playingMP4) {
        alert('Unsupported codec. We are currently working to support this.');
        snac('Failed', 'Failed to stream audio.', 'error');
        return;
      } else {
        sourceBuffer = mediaSource.addSourceBuffer('audio/webm; codecs="opus"');
      }

      let response;

      function requestTimeout(e, t) {
        return new Promise((r, o) => {
          const n = setTimeout(() => {
            o(new Error("TIMEOUT"));
          }, e);
          t.then(e => {
            clearTimeout(n), r(e);
          }).catch(e => {
            clearTimeout(n), o(e);
          });
        });
      }

      ;
      const timerTwo = new Date().getTime();
      const streamTrace = (0, _performance.trace)(perf, "MUSIC_FETCH_STREAM");
      streamTrace.start();

      try {
        response = await requestTimeout(4200, fetch(`https://parallelcloud-y3wxrl53eq-uc.a.run.app/stream?audioURL=${(0, _display.encode)(trackURL2)}`));

        if (!response.ok) {
          throw new Error('false');
        }
      } catch (error) {
        console.log(error);
        console.log(`https://parallelcloud-y3wxrl53eq-uc.a.run.app/stream?audioURL=${(0, _display.encode)(trackURL2)}`);
        snac('Failed', 'Failed to stream audio.', 'error');
        (0, _app.reportTrack)(trackDetails.id, true);
        streamTrace.stop();
        return;
      }

      streamTrace.stop();
      console.log(`Done stage 2 in ${(new Date().getTime() - timerTwo) / 1000}s.`);
      const timerThree = new Date().getTime();
      const body = response.body;
      const reader = body.getReader();
      let streamNotDone = true;

      while (streamNotDone) {
        const {
          value,
          done
        } = await reader.read();

        if (done) {
          streamNotDone = false;
          console.log(`Done stage 3 in ${(new Date().getTime() - timerThree) / 1000}s.`);
          break;
        }

        await new Promise((resolve, reject) => {
          sourceBuffer.appendBuffer(value);

          sourceBuffer.onupdateend = () => {
            resolve(true);
          };
        });
      }

      if (guildOffset) {
        setOffset(guildOffset, audio);
      }
    });
  };

  audio.src = trackURL;
}

function setOffset(offset, audio) {
  console.log(`Implementing offset of ${audio.duration - offset / 1000}`);
  audio.currentTime = audio.duration - offset / 1000;
  audio.play();
}
},{"./app":"js/app.js","./display":"js/display.js","./stripe":"js/stripe.js","./music":"js/music.js","./firebaseChecks":"js/firebaseChecks.js"}],"js/vcMusic.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addVCMusicListeners = addVCMusicListeners;
exports.clearQueueVCMusic = clearQueueVCMusic;
exports.joinMusicParty = joinMusicParty;
exports.leaveListeningParty = leaveListeningParty;
exports.removeTrackFromVCQueue = removeTrackFromVCQueue;
exports.searchInChannel = searchInChannel;
exports.skipTrackVCMusic = skipTrackVCMusic;

var _database = require("@firebase/database");

var _componentse = require("./componentse");

var _display = require("./display");

var _firebaseChecks = require("./firebaseChecks");

var _playback = require("./playback");

window.defaultCacheChannelVCMusic = {
  connected: {},
  queue: {},
  nowPlaying: {}
};
window.currentChannelMusicCode = '';
window.cacheChannelVCMusic = {};
window.serverInterval = null;
window.connectedMusicInterval = null;
window.cachePausedMusic = false;
window.activeListeningParty = null;
window.listeningPartyDisconnect = null;
(0, _firebaseChecks.checkAppInitialized)();
const rtdb = (0, _database.getDatabase)();

async function searchInChannel(guildUID, guildID, channelID) {
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
  console.log(tracks);

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    (0, _componentse.createTrack)(track, `searchResults${scopedActiveChannel}`, i, null, [], false, `addTrackToChannelQueue('${track.id}', '${guildUID}', '${guildID}', '${channelID}')`);
  }
}

window.closeChannelSearchResults = activeChannel => {
  $(`#searchResults${activeChannel}`).removeClass('fadeIn');
  $(`#searchResults${activeChannel}`).addClass('fadeOut');
  $(`#searchResultsCloseButton${activeChannel}`).removeClass('zoomIn');
  $(`#searchResultsCloseButton${activeChannel}`).addClass('zoomOut');
  window.setTimeout(() => {
    $(`#searchResults${activeChannel}`).addClass('hidden');
    $(`#searchResultsCloseButton${activeChannel}`).addClass('hidden');
  }, 600);
};

window.addTrackToChannelQueue = async (trackID, guildUID, guildID, channelID) => {
  const scopedActiveChannel = `${guildUID}${guildID}${channelID}`;
  closeChannelSearchResults(scopedActiveChannel);

  if (!activeListeningParty || activeListeningParty !== `${guildUID}/${guildID}/${channelID}`) {
    snac(`Not Connected`, `Connect to this lounge's voice chat to listen to tracks here.`);
    return;
  }

  const trackDetails = (await makeMusicRequest(`songs/${trackID}?include=artists`)).data[0];
  console.log(trackDetails);
  await (0, _database.push)((0, _database.ref)(rtdb, `${activeVCMusicListener}/queue`), {
    trackData: trackDetails,
    author: `${user.uid}.${cacheUser.username}`
  });
  $(`#${scopedActiveChannel}SongSearchInput`).get(0).focus();
};

async function joinMusicParty(guildUID, guildID, channelID) {
  let scopedActiveChannel = `${guildUID}${guildID}${channelID}`;
  (0, _display.disableButton)($(`#${scopedActiveChannel}musicPartyButton`));

  if (activeListeningParty) {
    const prevPartySplit = activeListeningParty.split('/');
    leaveListeningParty(prevPartySplit[0], prevPartySplit[1], prevPartySplit[2]);
  }

  listeningPartyDisconnect = (0, _database.onDisconnect)((0, _database.ref)(rtdb, `voiceMusic/${guildUID}${guildID}/${channelID}/connected/${user.uid}`));
  listeningPartyDisconnect.remove();
  await (0, _database.set)((0, _database.ref)(rtdb, `voiceMusic/${guildUID}${guildID}/${channelID}/connected/${user.uid}`), {
    username: cacheUser.username,
    uid: user.uid
  });
  addVCMusicListeners(guildUID, guildID, channelID);
  activeListeningParty = `${guildUID}/${guildID}/${channelID}`;
  window.setTimeout(() => {
    // snac('Listening Party', `You are now connected to a listening party.`);
    notifyTiny('Listening Party: Connected', false);
    $(`#${guildUID}${guildID}${channelID}TabItemMusic`).removeClass('invisibleOpacityAnimated');
    (0, _display.enableButton)($(`#${scopedActiveChannel}musicPartyButton`), '<i class="bx bx-x"></i>');

    $(`#${scopedActiveChannel}musicPartyButton`).get(0)._tippy.setContent(`Leave Music Party`);

    $(`#${scopedActiveChannel}musicPartyButton`).get(0).onclick = () => {
      leaveListeningParty(guildUID, guildID, channelID);
    };
  }, 999);
}

async function leaveListeningParty(guildUID, guildID, channelID) {
  let scopedActiveChannel = `${guildUID}${guildID}${channelID}`;
  (0, _display.disableButton)($(`#${scopedActiveChannel}musicPartyButton`));
  $(`#${guildUID}${guildID}${channelID}TabItemMusic`).addClass('invisibleOpacityAnimated'); // snac('Listening Party', `You are now disconnected from a listening party.`);
  // notifyTiny('Listening Party: Disconnected', false);

  $(`#channelMusicAudio${guildUID}${guildID}${channelID}`).get(0).pause();

  try {
    (0, _database.off)((0, _database.query)((0, _database.ref)(rtdb, activeVCMusicListener)));
  } catch (error) {}

  ;
  activeListeningParty = null;
  await (0, _database.remove)((0, _database.ref)(rtdb, `voiceMusic/${guildUID}${guildID}/${channelID}/connected/${user.uid}`));
  listeningPartyDisconnect.cancel();
  window.setTimeout(() => {
    (0, _display.enableButton)($(`#${scopedActiveChannel}musicPartyButton`), '<i class="bx bx-music"></i>');

    $(`#${scopedActiveChannel}musicPartyButton`).get(0)._tippy.setContent(`Join Music Party`);

    $(`#${scopedActiveChannel}musicPartyButton`).get(0).onclick = () => {
      joinMusicParty(guildUID, guildID, channelID);
    };
  }, 999);
  $(`#connectedUsersContainer${scopedActiveChannel}`).empty();

  if (channelTabLibrary[scopedActiveChannel] == 'Music') {
    modifyChannelTab(guildUID, guildID, channelID, 'Chat');
  }
}

async function addVCMusicListeners(guildUID, guildID, channelID) {
  let scopedActiveChannel = `${guildUID}${guildID}${channelID}`;
  cacheChannelVCMusic[scopedActiveChannel] = defaultCacheChannelVCMusic;

  try {
    (0, _database.off)((0, _database.query)((0, _database.ref)(rtdb, activeVCMusicListener)));
  } catch (error) {}

  ;
  activeVCMusicListener = `voiceMusic/${guildUID}${guildID}/${channelID}`;
  currentChannelMusicCode = '';
  serverInterval = null;
  cachePausedMusic = false; // Reset everything./

  $(`#channelMusicQueueContent${scopedActiveChannel}`).empty();
  $(`#channelMusicNowPlayingContent${scopedActiveChannel}`).empty();
  $(`#channelMusicAudio${scopedActiveChannel}`).get(0).src = '';
  (0, _database.onValue)((0, _database.query)((0, _database.ref)(rtdb, `${activeVCMusicListener}`)), async snapshot => {
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
      } else {
        $(`#${scopedActiveChannel}musicAdminClearQueue`).addClass('disabled');
        $(`#channelQueueText${scopedActiveChannel}`).addClass('hidden');
      }

      if (snapshot.val().nowPlaying) {
        nowPlaying = snapshot.val().nowPlaying;
        $(`#${scopedActiveChannel}musicAdminFastForward`).removeClass('disabled');
      } else {
        $(`#${scopedActiveChannel}musicAdminFastForward`).addClass('disabled');
        $(`#channelMusicAudio${scopedActiveChannel}`).get(0).src = "";
      }
    } else {
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

    const connectedChangeForward = (0, _display.commonArrayDifference)(Object.keys(connected), Object.keys(cacheChannelVCMusic[scopedActiveChannel].connected));
    const connectedChangeBackward = (0, _display.commonArrayDifference)(Object.keys(cacheChannelVCMusic[scopedActiveChannel].connected), Object.keys(connected));
    $(`#connectedUsersText${scopedActiveChannel}`).text(`${Object.keys(connected).length} Connected User${Object.keys(connected).length > 1 ? 's' : ''}`);

    for (let i = 0; i < connectedChangeForward.length; i++) {
      const connectedUser = connected[connectedChangeForward[i]];
      const a = document.createElement('div');
      a.setAttribute('class', 'listenConnectedUser animated zoomIn fast');

      a.onclick = () => {
        openUserCard(connectedUser.uid);
      };

      a.setAttribute('id', `${scopedActiveChannel}listenConnectedUser${connectedUser.uid}`);
      a.innerHTML = `<img class="invisible" id="${scopedActiveChannel}listenConnectedUser${connectedUser.uid}Image" /><b>${connectedUser.username}</b>`;
      $(`#connectedUsersContainer${scopedActiveChannel}`).append(a);
      window.setTimeout(() => {
        $(`#${scopedActiveChannel}listenConnectedUser${connectedUser.uid}`).removeClass('animated');
      }, 599);
      $(`#${scopedActiveChannel}listenConnectedUser${connectedUser.uid}Image`).attr('src', await (0, _display.returnProperURL)(connectedUser.uid));
      (0, _display.displayImageAnimation)(`${scopedActiveChannel}listenConnectedUser${connectedUser.uid}Image`);
    }

    for (let i = 0; i < connectedChangeBackward.length; i++) {
      $(`#${scopedActiveChannel}listenConnectedUser${connectedChangeBackward[i]}`).addClass("listenConnectedUserGone");
      window.setTimeout(() => {
        $(`#${scopedActiveChannel}listenConnectedUser${connectedChangeBackward[i]}`).remove();
      }, 500);
    }

    const queueChangeForward = (0, _display.commonArrayDifference)(Object.keys(queue), Object.keys(cacheChannelVCMusic[scopedActiveChannel].queue));
    const queueChangeBackward = (0, _display.commonArrayDifference)(Object.keys(cacheChannelVCMusic[scopedActiveChannel].queue), Object.keys(queue));

    for (let i = 0; i < queueChangeForward.length; i++) {
      const queueID = queueChangeForward[i];
      const queueData = queue[queueID];
      const a = document.createElement('div');
      a.id = `queueItem${queueID}`;
      a.innerHTML = `
        <img id="${queueID}queueItemPfp" src="${await (0, _display.returnProperURL)(queueData.author.split('.')[0])}" />
      `;
      a.setAttribute('class', 'requestedByImg');
      $(`#channelMusicQueueContent${scopedActiveChannel}`).get(0).appendChild(a);
      (0, _componentse.createTrack)(queueData.trackData, `queueItem${queueID}`, i, null, ["fromLP", queueID], null, "console.log('no action')");
      tippy($(`#${queueID}queueItemPfp`).get(0), {
        content: `Requested by ${queueData.author.split('.')[1].capitalize()}`,
        placement: 'top'
      });

      $(`#${queueID}queueItemPfp`).get(0).onclick = () => {
        openUserCard(queueData.author.split('.')[0]);
      };
    }

    for (let i = 0; i < queueChangeBackward.length; i++) {
      const queueID = queueChangeBackward[i];
      console.log(queueID);
      $(`#queueItem${queueID}`).remove();
    }

    $(`#channelMusicQueueContent${scopedActiveChannel}`).children('.track').each((index, object) => {
      $(object).find('.trackIndex').html(index + 1);
    }); // Now playing

    $(`#${scopedActiveChannel}NowPlayingText`).html('Now Playing');

    if (!snapshot.val() || !nowPlaying || !Object.keys(nowPlaying).length) {
      $(`#${scopedActiveChannel}NowPlayingText`).html('<span style="color: var(--secondary)">Nothing Playing</span>');
      $(`#channelMusicNowPlayingContent${scopedActiveChannel}`).empty();
    }

    if (snapshot.val() && nowPlaying && nowPlaying.trackURL && nowPlaying.randomInt !== cacheChannelVCMusic[scopedActiveChannel].nowPlaying.randomInt) {
      const trackStarted = nowPlaying.startedAt;
      const trackDurationMS = nowPlaying.trackData.attributes.durationInMillis;
      const trackWillEndAt = new Date(trackStarted).getTime() + trackDurationMS;

      if (trackWillEndAt > new Date().getTime()) {
        // Track has not ended. Play current track
        $(`#channelMusicNowPlayingContent${scopedActiveChannel}`).empty();
        const track = nowPlaying.trackData;
        (0, _componentse.createTrack)(track, `channelMusicNowPlayingContent${scopedActiveChannel}`, null, null, [], false, "console.log('no action')");
        sendToServerPlayer(track, guildUID, guildID, channelID, trackWillEndAt - new Date().getTime());
      } else {// Track has ended. Play next track WILL happen.
      }
    }

    if (snapshot.val()) {
      cacheChannelVCMusic[scopedActiveChannel] = snapshot.val();
    } else {
      cacheChannelVCMusic[scopedActiveChannel] = defaultCacheChannelVCMusic;
    }

    updateVCState(guildUID, guildID, channelID, cacheChannelVCMusic[scopedActiveChannel]);
  });
}

async function removeTrackFromVCQueue(queueID) {
  await (0, _database.remove)((0, _database.ref)(rtdb, `voiceMusic/${activeListeningParty.split('/')[0]}${activeListeningParty.split('/')[1]}/${activeListeningParty.split('/')[2]}/queue/${queueID}`));
}

function clearQueueVCMusic(guildUID, guildID, channelID) {
  (0, _database.update)((0, _database.ref)(rtdb, `voiceMusic/${guildUID}${guildID}/${channelID}`), {
    queue: {}
  });
}

function skipTrackVCMusic(guildUID, guildID, channelID) {
  (0, _database.update)((0, _database.ref)(rtdb, `voiceMusic/${guildUID}${guildID}/${channelID}`), {
    nowPlaying: {}
  });
}

function updateVCState(guildUID, guildID, channelID, data, action) {
  const scopedActiveChannel = `${guildUID}${guildID}${channelID}`;

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
    } catch (error) {}

    if (!connectedMusicInterval) {
      connectedMusicInterval = window.setInterval(() => {
        const playerElement = $(`#channelMusicAudio${scopedActiveChannel}`).get(0);

        if (playerElement.duration - playerElement.currentTime < 0.7) {
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
    } else {
      if (data.queue && Object.keys(data.queue).length) {
        goChannelNextTrack(guildUID, guildID, channelID);
      }
    }

    if (action == 'forwardSong') {
      goChannelNextTrack(guildUID, guildID, channelID);
    }
  } else {
    try {
      window.clearInterval(connectedMusicInterval);
    } catch (error) {}
  }
}

async function goChannelNextTrack(guildUID, guildID, channelID) {
  const scopedActiveChannel = `${guildUID}${guildID}${channelID}`;

  if (!cacheChannelVCMusic[scopedActiveChannel].queue) {
    await (0, _database.remove)((0, _database.ref)(rtdb, `${activeVCMusicListener}/nowPlaying`));
    return; // No available queue.
  }

  const nextQueueID = Object.keys(cacheChannelVCMusic[scopedActiveChannel].queue)[0];
  let nextQueueData = cacheChannelVCMusic[scopedActiveChannel].queue[nextQueueID];
  const [trackURL, trackURL2] = await (0, _playback.getPlaybackURL)(nextQueueData.trackData, false);
  nextQueueData.startedAt = new Date().getTime();
  nextQueueData.randomInt = new Date().getTime();
  nextQueueData.trackURL = trackURL;
  nextQueueData.trackURL2 = trackURL2;
  await (0, _database.remove)((0, _database.ref)(rtdb, `${activeVCMusicListener}/queue/${nextQueueID}`));
  await (0, _database.set)((0, _database.ref)(rtdb, `${activeVCMusicListener}/nowPlaying`), nextQueueData);
}

function sendToServerPlayer(nowPlaying, guildUID, guildID, channelID, timeOffset) {
  if (!cachePausedMusic) {
    libraryPlayer.pause();
    cachePausedMusic = true;
  }

  const scopedActiveChannel = `${guildUID}${guildID}${channelID}`;

  if (!activeListeningParty || activeListeningParty !== `${guildUID}/${guildID}/${channelID}`) {
    return;
  }

  ;

  if (currentChannelMusicCode == nowPlaying) {
    return;
  }

  ;
  console.log(nowPlaying);
  (0, _playback.sendTrackToPlayerRevamp)(nowPlaying, `#channelMusicAudio${scopedActiveChannel}`, timeOffset, nowPlaying.trackURL, nowPlaying.trackURL2);
}

function serverPlayerDidEnd(guildUID, guildID, channelID) {
  const scopedActiveChannel = `${guildUID}${guildID}${channelID}`;
  $(`#channelMusicAudio${scopedActiveChannel}`).get(0).src = '';
  updateVCState(guildUID, guildID, channelID, cacheChannelVCMusic[scopedActiveChannel], 'forwardSong');
}

window.updateVolumeFromSlider = scopedActiveChannel => {
  $(`#channelMusicAudio${scopedActiveChannel}`).get(0).volume = $(`#sliderOnMusicVolume${scopedActiveChannel}`).get(0).value / 100;
};
},{"./componentse":"js/componentse.js","./display":"js/display.js","./firebaseChecks":"js/firebaseChecks.js","./playback":"js/playback.js"}],"js/presence.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clearMusicStatus = clearMusicStatus;
exports.createPresenceListeners = createPresenceListeners;
exports.loadIdle = loadIdle;
exports.selfPresence = selfPresence;
exports.setMusicStatus = setMusicStatus;
exports.showTippyListenerPresence = showTippyListenerPresence;
exports.updatePresenceForUser = updatePresenceForUser;

var _database = require("firebase/database");

var timeago = _interopRequireWildcard(require("timeago.js"));

var _display = require("./display");

var _firebaseChecks = require("./firebaseChecks");

var _music = require("./music");

var _settings = require("./settings");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// Presence system. Create real-time listeners for each of the user's friends.
// Demanding if 100+ friends. The listeners will be created and then not changed.
// Similar system to servers. Maybe hard cap on both for 110 ish.
_firebaseChecks.checkAppInitialized;
const rtdb = (0, _database.getDatabase)();
window.presenceFriends = [];
window.onlineBook = {};
window.presencecon = null;
window.mouseThrottle = false;
window.setAwayInterval = null;
window.isIdle = false;
window.isDBConnected = false;

function createPresenceListeners() {
  const presenceListForward = (0, _display.friendsArrayDifference)(presenceFriends, cacheUser.friends);
  const presenceListBackward = (0, _display.friendsArrayDifference)(cacheUser.friends, presenceFriends);
  presenceFriends = cacheUser.friends;

  for (let i = 0; i < presenceListForward.length; i++) {
    const friend = presenceListForward[i];
    (0, _music.buildMusicSocialCard)(friend);
    (0, _database.onValue)((0, _database.ref)(rtdb, `users/${friend.u}`), snapshot => {
      if (snapshot.val()) {
        const friendStatus = snapshot.val().online;
        let friendIdle = false;
        let friendOnline = false;

        if (friendStatus == 'idle') {
          friendIdle = true;
        } else if (friendStatus == true) {
          friendOnline = true;
        }

        if (friendOnline || friendIdle) {
          onlineBook[friend.u] = {
            online: friendOnline ? friendOnline : friendIdle,
            lastOnline: null,
            currentlyListening: snapshot.val().currentlyListening
          };
          updatePresenceForUser(friend.u);
        } else {
          onlineBook[friend.u] = {
            online: friendOnline ? friendOnline : friendIdle,
            lastOnline: snapshot.val().lastOnline,
            currentlyListening: snapshot.val().currentlyListening
          };
          updatePresenceForUser(friend.u);
        }
      } else {
        onlineBook[friend.u] = {
          online: false,
          lastOnline: null
        };
        updatePresenceForUser(friend.u);
      }
    });
  }

  for (let i = 0; i < presenceListBackward.length; i++) {
    const friend = presenceListBackward[i];
    (0, _database.off)((0, _database.query)((0, _database.ref)(rtdb, `users/${friend.u}`)));
    const selector = $(`.${friend.u}presence`);
    selector.removeClass('presenceOffline');
    selector.removeClass('presenceOnline');
  }
}

function updatePresenceForUser(uID) {
  if (!onlineBook[uID]) {
    return; // Will be loaded. Function to be re-called. OR not friends.
  }

  const selector = $(`.${uID}presence`); // Get all instances of the indicator.

  if (onlineBook[uID].online) {
    // Update listening to music tab!
    if (onlineBook[uID].currentlyListening && $(`#${uID}MusicListeningCard`).length) {
      $(`#${uID}MusicListeningCard`).removeClass('hidden');
      $(`#${uID}MusicListeningCard`).addClass('notHidden');

      $(`#${uID}musiclisteningalbumitem`).get(0)._tippy.setContent(`${onlineBook[uID].currentlyListening.title} by ${onlineBook[uID].currentlyListening.artist}`);

      $(`#${uID}musiclisteningalbumitem`).get(0).src = onlineBook[uID].currentlyListening.album;

      $(`#${uID}musiclisteningalbumitem`).get(0).onclick = () => {
        if (onlineBook[uID].currentlyListening.albumID) {
          openAlbum(onlineBook[uID].currentlyListening.albumID);
        } else {
          snac(`Album Error`, 'Unable to open album.', 'danger');
        }
      };

      (0, _display.displayImageAnimation)(`${uID}musiclisteningalbumitem`);
      $('#activeFriendsMusicNotice').addClass('hidden');
    } else {
      $(`#${uID}MusicListeningCard`).addClass('hidden');
      $(`#${uID}MusicListeningCard`).removeClass('notHidden');

      if (!$(`#activeFriendsContainer`).children('.notHidden').length) {
        $('#activeFriendsMusicNotice').removeClass('hidden');
      }
    }
  }

  if (onlineBook[uID].online == true) {
    // Directly online.
    selector.each((i, obj) => {
      try {
        $(obj).get(0)._tippy.setContent('Online');
      } catch (error) {}
    });
    selector.removeClass('presenceOffline');
    selector.removeClass('presenceIdle');
    selector.addClass('presenceOnline');
  } else if (onlineBook[uID].online == 'idle') {
    selector.each((i, obj) => {
      try {
        $(obj).get(0)._tippy.setContent('Idle');
      } catch (error) {}
    });
    selector.removeClass('presenceOffline');
    selector.removeClass('presenceOnline');
    selector.addClass('presenceIdle');
  } else {
    selector.removeClass('presenceOnline');
    selector.removeClass('presenceIdle');
    selector.addClass('presenceOffline');

    if (!onlineBook[uID].lastOnline) {
      selector.each((i, obj) => {
        try {
          $(obj).get(0)._tippy.setContent('Offline');
        } catch (error) {}
      });
    } // Remove from music currently listening tab.


    $(`#${uID}MusicListeningCard`).addClass('hidden');
    $(`#${uID}MusicListeningCard`).removeClass('notHidden');

    if (!$(`#activeFriendsContainer`).children('.notHidden').length) {
      $('#activeFriendsMusicNotice').removeClass('hidden');
    }
  }
}

function showTippyListenerPresence(uID, toolElement) {
  if (onlineBook[uID] && onlineBook[uID].lastOnline) {
    // The reason for this is to make sure the last online tooltip is updated on hover.
    toolElement.get(0)._tippy.setContent(`Last online ${timeago.format(new Date(onlineBook[uID].lastOnline))}`);
  }
}

async function setMusicStatus() {
  // Communicate with NodeJS to share to discord
  if ((0, _settings.retrieveSetting)('discordSongs', true)) {
    sendToElectron('music', `${musicPlaying.attributes.name} by ${musicPlaying.relationships.artists.data[0].attributes.name}`);
  }

  if ((0, _settings.retrieveSetting)('shareSongs', true)) {
    // Update personal presence with the track details::
    await (0, _database.set)((0, _database.ref)(rtdb, `users/${user.uid}/currentlyListening`), {
      id: musicPlaying.id,
      title: musicPlaying.attributes.name,
      artist: musicPlaying.relationships.artists.data[0].attributes.name,
      album: musicPlaying.attributes.artwork.url.replace('{w}', '500').replace('{h}', '500'),
      albumID: musicPlaying.relationships.albums.data[0].id || ""
    });
  }
}

async function clearMusicStatus() {
  sendToElectron('music', `Home`);
  await (0, _database.remove)((0, _database.ref)(rtdb, `users/${user.uid}/currentlyListening`));
}

async function loadIdle() {
  window.addEventListener('mousemove', async function (e) {
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
        await (0, _database.set)(presencecon, true);
      }
    }
  });
} // SO: Timeouts to set the presence to idle after 8 minutes. Offline after 55 minutes.
// An existing test case I have is a user has a remaining connection which hadn't gotten deleted that' still on idle.
// I believe they had left after idle timeout before offline timeout and the value did not get updated.


async function activityReset() {
  window.clearTimeout(setAwayInterval);

  if (isDBConnected) {
    setAwayInterval = setTimeout(async () => {
      await (0, _database.set)(presencecon, 'idle');
      isIdle = true;
    }, 8 * 60 * 1000); // 8 minutes
    // }, 5000) // 5 seconds
  }
} // SO: Start presence listeners.
// This is called once when the user is logged in.


function selfPresence() {
  (0, _database.onValue)((0, _database.ref)(rtdb, '.info/connected'), snap => {
    isDBConnected = snap.val();

    if (snap.val() === true) {
      presencecon = (0, _database.ref)(rtdb, `users/${user.uid}/online`);
      (0, _database.onDisconnect)(presencecon).set(false);
      (0, _database.onDisconnect)((0, _database.ref)(rtdb, `users/${user.uid}/lastOnline`)).set((0, _database.serverTimestamp)());
      (0, _database.onDisconnect)((0, _database.ref)(rtdb, `users/${user.uid}/currentlyListening`)).remove();
      (0, _database.set)(presencecon, true);
    } else {
      if (presencecon) {
        (0, _database.remove)(presencecon);
      }
    }
  });
  (0, _database.onValue)((0, _database.ref)(rtdb, `users/${user.uid}/online`), snap => {
    if (snap.val() === "idle") {
      // If another device went idle, remain online.
      if (!isIdle) {
        (0, _database.set)(presencecon, true);
      }
    }
  });
}
},{"./display":"js/display.js","./firebaseChecks":"js/firebaseChecks.js","./music":"js/music.js","./settings":"js/settings.js"}],"js/users.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.blockUser = blockUser;
exports.unblockUser = unblockUser;

var _firestore = require("@firebase/firestore");

var _componentse = require("./componentse");

var _display = require("./display");

var _firebaseChecks = require("./firebaseChecks");

var _friends = require("./friends");

var _music = require("./music");

var _presence = require("./presence");

var _servers = require("./servers");

var _stripe = require("./stripe");

window.colorThief = new ColorThief();
window.activeUserCard = false;
window.cacheUserDetails = null;
window.fullProfileActive = false;
window.cancelUserQuery = null;
const placeholderAlbumImage = 'https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/app%2FdefaultAlbum.png?alt=media';
(0, _firebaseChecks.checkAppInitialized)();
const db = (0, _firestore.getFirestore)();

window.openUserCard = async uID => {
  if (!uID) {
    return;
  }

  if (activeUserCard == uID) {
    return;
  }

  activeUserCard = uID; // CREATE the element if it's not already created.

  if (!$(`#${uID}userCardContainer`).length) {
    // Element is not created.  
    const a = document.createElement('div');
    a.setAttribute('class', 'userCard hidden');
    a.id = `${uID}userCardContainer`;
    a.innerHTML = `
      <div class="userCardBanner" id="${uID}userCardBanner">
        <button id="${uID}userCardButton" class="btn roundedButton" onclick="closeUserPopout()"><i class="bx bx-x"></i></button>
        <img id="${uID}userCardImage" class="animated invisible" src="${`https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/pfp%2F${uID}%2Fprofile.png?alt=media`}" />
        <h3 id="${uID}userCardName" class="animated fadeIn"></h3>
        <div id="${uID}PresenceIndicatorUserCard" class="presenceIndicator ${uID}presence animated invisible"></div>
      </div>
      <div class="staffContent hidden" id="${uID}StaffContent"></div>
      <div class="friendContent">
        <div id="${uID}friendLowerSection" class="friendLowerSection">
          <div class="userTabButtons">
            <button id="${uID}profileUserCardButton" class="btn roundedButton userCardTabButton buttonActive" onclick="switchUserCardTab('${uID}', 'profile')"><i class="bx bx-id-card"></i></button>
            <button id="${uID}musicUserCardButton" class="btn roundedButton userCardTabButton" onclick="switchUserCardTab('${uID}', 'music')"><i class="bx bx-music"></i></button>
          </div>
          <div id="${uID}userCardFriendSectionContainer" class="userCardFriendSection">
            <div id="${uID}userCardFriendSection"></div>
            <button id="${uID}DropdownButtonMoreOptions" userID="${uID}" class="btn dropdownButton userContextItem acceptLeftClick"><i class="bx bx-dots-vertical"></i></button>
          </div>
        </div>

        <div class="userCardTab animated fadeIn" id="${uID}profileUserCard">
          <div class="badgesSection">
            <div id="${uID}Badge_Verified" class="badge badgeVerified animated zoomIn hidden"><i class='bx bx-badge-check'></i></div>
            <div id="${uID}Badge_Staff" class="badge badgeStaff badgeStandard animated zoomIn hidden"><i class="bx bx-wrench"></i></div>
            <div id="${uID}Badge_Mod" class="badge badgeMod badgeStandard animated zoomIn hidden"><i class="bx bx-shield-quarter"></i></div>
            <div id="${uID}Badge_Bug" class="badge badgeBug badgeStandard animated zoomIn hidden"><i class="bx bxs-invader"></i></div>
            <div id="${uID}Badge_Early" class="badge badgeEarly badgeStandard animated zoomIn hidden"><i class="bx bx-leaf"></i></div>
            <div id="${uID}Badge_Infinite" class="badge badgeInfinite animated zoomIn hidden"><i class="bx bx-infinite"></i></div>
          </div>
          <div id="${uID}userCardBioContainer" class="userCardBio animated fadeIn hidden">
            <code id="${uID}userCardBio"></code>
          </div>
        </div>
        <div class="userCardTab musicUserCard hidden animated fadeIn" id="${uID}musicUserCard">
          <div id="${uID}NoContentMusic" class="userCardNoContent">No music on profile 😔</div>
          <div id="${uID}LyricsHeader" class="userCardLyricsHeader">Favorite Lyrics</div>
          <div id="${uID}LyricsContainer" class="userCardLyrics">
            <code id="${uID}LyricsCodeField"></code>
          </div>
          <div id="${uID}TrackHeader" class="userCardTracksHeader">Favorite Track</div>
          <div id="${uID}TrackContainer" class="userCardTrack"></div>
          <center>
            <button class="btn b-1 openPlaylistsButton" id="${uID}openPlaylistsButton"></button>
          </center>
        </div>
      </div>
    `;
    $('#userPopoutsContainer').get(0).appendChild(a);
    tippy($(`#${uID}Badge_Infinite`).get(0), {
      placement: 'top',
      content: 'Infinite'
    });
    tippy($(`#${uID}Badge_Early`).get(0), {
      placement: 'top',
      content: 'Early User'
    });
    tippy($(`#${uID}Badge_Mod`).get(0), {
      placement: 'top',
      content: 'Moderator'
    });
    tippy($(`#${uID}Badge_Bug`).get(0), {
      placement: 'top',
      content: 'Bug Hunter'
    });
    tippy($(`#${uID}Badge_Staff`).get(0), {
      placement: 'top',
      content: 'Staff'
    });
    tippy($(`#${uID}Badge_Verified`).get(0), {
      placement: 'top',
      content: 'Verified'
    });
    tippy($(`#${uID}userCardButton`).get(0), {
      placement: 'top',
      content: 'Close'
    });
    tippy($(`#${uID}profileUserCardButton`).get(0), {
      placement: 'top',
      content: 'Profile'
    });
    tippy($(`#${uID}musicUserCardButton`).get(0), {
      placement: 'top',
      content: 'Music'
    });
    tippy($(`#${uID}DropdownButtonMoreOptions`).get(0), {
      placement: 'top',
      content: 'More'
    });
    tippy($(`#${uID}PresenceIndicatorUserCard`).get(0), {
      content: '',
      placement: 'top',
      onTrigger: () => (0, _presence.showTippyListenerPresence)(uID, $(`#${uID}PresenceIndicatorUserCard`))
    }); // Prepare tooltip for 'online' | 'offline' | 'last online x days ago'

    (0, _presence.updatePresenceForUser)(uID);
  } else {
    switchUserCardTab(uID, 'profile', true);
  } // Badges


  if (verifiedUsers.includes(uID)) {
    $(`#${uID}Badge_Verified`).removeClass('hidden');
  } // Show the element now that its guaranteed to be created AND filled with elements.


  $(`#${uID}userCardContainer`).removeClass('hidden');
  $(`#${uID}userCardContainer`).addClass('userCardActive');
  $(`#userPopoutsContainerBackground`).removeClass('fadeOut');
  $(`#userPopoutsContainerBackground`).addClass('fadeIn');
  $('#userPopoutsContainerBackground').removeClass('hidden'); // Position the new or existing element of ID `${uID}userCardContainer`

  const popOutWidth = 240 + 24; // 24px padding on all edges.

  const popOutHeight = 360 + 24;
  const pageHeight = $(document).height();
  const pageWidth = $(document).width();
  let leftPosition = event.clientX;
  let topPosition = event.clientY;

  if (leftPosition + popOutWidth > pageWidth) {
    // If the popout width will be greater than page, align it to the left of page end.
    leftPosition = pageWidth - popOutWidth - 128;
  }

  if (topPosition + popOutHeight > pageHeight) {
    // If the popout height will be greater than page, align it to the top of page end.
    topPosition = pageHeight - popOutHeight - 12;
  }

  $(`#${uID}userCardContainer`).get(0).style.left = leftPosition + 'px';
  $(`#${uID}userCardContainer`).get(0).style.top = topPosition + 'px';
  $(`#${uID}userCardContainer`).get(0).setAttribute('defaultTop', topPosition);
  $(`#${uID}userCardImage`).get(0).setAttribute('crossOrigin', '');

  $(`#${uID}userCardImage`).get(0).onerror = () => {
    $(`#${uID}userCardImage`).get(0).src = `https://avatars.dicebear.com/api/bottts/${uID}.svg`;
  };

  $(`#${uID}userCardImage`).get(0).addEventListener('load', () => processColors(uID));

  $(`#${uID}openPlaylistsButton`).get(0).onclick = () => {
    closeUserPopout();
    (0, _servers.openSpecialServer)('music');
    (0, _music.musicTab)('friends');
  };

  try {
    cancelUserQuery();
  } catch (error) {}

  cancelUserQuery = (0, _firestore.onSnapshot)((0, _firestore.doc)(db, `users/${uID}`), async querySnapshot => {
    if (!querySnapshot.exists()) {
      $(`#${uID}userCardName`).html(`<div class="pill danger">Deleted Account</div>`);
      $(`#${uID}friendLowerSection`).addClass('hidden');
      return;
    }

    cacheUserDetails = querySnapshot.data();
    $(`#${uID}StaffContent`).addClass('hidden');

    if (querySnapshot.data().staff) {
      $(`#${uID}StaffContent`).removeClass('hidden');
      $(`#${uID}StaffContent`).html(querySnapshot.data().staff);
    }

    $(`#${uID}userCardName`).html(querySnapshot.data().username.capitalize());
    $(`#${uID}DropdownButtonMoreOptions`).get(0).setAttribute('userName', querySnapshot.data().username.capitalize());

    if (querySnapshot.data().banned) {
      $(`#${uID}userCardName`).html(querySnapshot.data().username.capitalize() + `<div class="pill danger">Banned</div>`);
    }

    if (querySnapshot.data().bio) {
      $(`#${uID}userCardBio`).html((0, _display.securityConfirmText)(querySnapshot.data().bio).replaceAll(`&br`, `<br>`));
      twemoji.parse($(`#${uID}userCardBio`).get(0));
      $(`#${uID}userCardBioContainer`).removeClass('hidden');
    } else {
      $(`#${uID}userCardBioContainer`).addClass('hidden');
    }

    $(`#${uID}openPlaylistsButton`).html(`View Playlists (${querySnapshot.data().playlists.length || 0})`);
    $(`#${uID}openPlaylistsButton`).addClass('hidden');
    $(`#${uID}Badge_Infinite`).addClass('hidden');

    if ((0, _stripe.checkValidSubscription)(querySnapshot.data().subscription)) {
      $(`#${uID}userCardName`).html(`<span class="infiniteTextSpanUser">${querySnapshot.data().username.capitalize()}</span>`);
      $(`#${uID}Badge_Infinite`).removeClass('hidden');
      $(`#${uID}userCardBanner`).addClass('infiniteBanner');
    } else {
      $(`#${uID}userCardBanner`).removeClass('c');
    }

    $(`.badgeStandard`).addClass('hidden');

    if (querySnapshot.data().badges) {
      for (let i = 0; i < querySnapshot.data().badges.length; i++) {
        const badge = querySnapshot.data().badges[i];
        $(`#${uID}Badge_${badge.capitalize()}`).removeClass('hidden');
      }
    }

    $(`#${uID}userCardName`).addClass('fadeIn');

    if (uID === user.uid) {
      $(`#${uID}userCardFriendSection`).html(``);
    } else {
      if (querySnapshot.data().friends.some(e => e.u === user.uid)) {
        $(`#${uID}userCardFriendSection`).html(`
          <button id="${uID}FriendCardButton" onclick="switchAndOpenFriendsDM('${uID}', '${querySnapshot.data().username}')" class="btn b-1"><i class='bx bx-message-square-dots'></i></button>
        `);
        tippy($(`#${uID}FriendCardButton`).get(0), {
          content: "Message",
          placement: "top"
        });

        if (querySnapshot.data().playlists.length) {
          // Show only if friends & has playlists.
          $(`#${uID}openPlaylistsButton`).removeClass('hidden');
        }
      } else {
        if (cacheUser.incomingFriendRequests.some(e => e.u === uID)) {
          $(`#${uID}userCardFriendSection`).html(`
            <button class="btn b-2" id="${uID}FriendCardButton"><i class='bx bx-check'></i></button>
          `);
          tippy($(`#${uID}FriendCardButton`).get(0), {
            content: "Accept Request",
            placement: "top"
          });

          $(`#${uID}FriendCardButton`).get(0).onclick = () => {
            (0, _friends.acceptRequest)(uID, querySnapshot.data().username);
            (0, _display.disableButton)($(`#${uID}FriendCardButton`));
          };
        } else {
          if (querySnapshot.data().incomingFriendRequests.some(e => e.u === user.uid)) {
            $(`#${uID}userCardFriendSection`).html(`
              <button class="btn b-2" id="${uID}FriendCardButton"><i class='bx bx-x'></i></button>
            `);
            tippy($(`#${uID}FriendCardButton`).get(0), {
              content: "Cancel Request",
              placement: "top"
            });

            $(`#${uID}FriendCardButton`).get(0).onclick = () => {
              cancelRequest(uID, querySnapshot.data().username);
              (0, _display.disableButton)($(`#${uID}FriendCardButton`));
            };
          } else {
            $(`#${uID}userCardFriendSection`).html(`
              <button id="${uID}FriendCardButton" class="btn b-1"><i class='bx bx-user-plus'></i></button>
            `);
            tippy($(`#${uID}FriendCardButton`).get(0), {
              content: "Add Friend",
              placement: "top"
            });

            $(`#${uID}FriendCardButton`).get(0).onclick = () => {
              confirmFriendRequest(uID);
              (0, _display.disableButton)($(`#${uID}FriendCardButton`));
            };
          }
        }
      }
    } // Music related items.


    $(`#${uID}LyricsHeader`).addClass('hidden');
    $(`#${uID}LyricsContainer`).addClass('hidden');
    $(`#${uID}TrackHeader`).addClass('hidden');
    $(`#${uID}TrackContainer`).addClass('hidden');
    $(`#${uID}NoContentMusic`).addClass('hidden');

    if (!querySnapshot.data().track && !querySnapshot.data().lyrics) {
      $(`#${uID}NoContentMusic`).removeClass('hidden');
      twemoji.parse($(`#${uID}NoContentMusic`).get(0));
    } else {
      if (querySnapshot.data().lyrics) {
        $(`#${uID}LyricsHeader`).removeClass('hidden');
        $(`#${uID}LyricsContainer`).removeClass('hidden');
        $(`#${uID}LyricsCodeField`).html(`
          ${(0, _display.securityConfirmText)(querySnapshot.data().lyrics.lyrics).replaceAll(`&br`, `<br>`)}
          ${querySnapshot.data().lyrics.author ? `<div class="userCardLyricsAuthorField">- ${(0, _display.securityConfirmText)(querySnapshot.data().lyrics.author).replaceAll(`&br`, '<br>')}</div>` : ``}
        `);
      }

      if (querySnapshot.data().track) {
        $(`#${uID}TrackHeader`).removeClass('hidden');
        $(`#${uID}TrackContainer`).removeClass('hidden');
        $(`#${uID}TrackContainer`).empty();
        const trackData = await makeMusicRequest(`songs/${querySnapshot.data().track}`);
        console.log(trackData);
        (0, _componentse.createTrack)(trackData.data[0], `${uID}TrackContainer`, null);
      }
    }

    const profileURL = `https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/pfp%2F${uID}%2Fprofile.png?alt=media&ts=${new Date().getTime()}`;
    $(`#${uID}userCardImage`).get(0).src = profileURL;
  });
};

window.switchUserCardTab = (uID, tab, force) => {
  if (tab === 'music') {
    $(`#${uID}userCardContainer`).addClass('userCardMusic');
    const existingTop = $(`#${uID}userCardContainer`).get(0).style.top;
    const targetTop = parseInt(existingTop) - 200;
    $(`#${uID}userCardContainer`).get(0).style.top = `${targetTop > 24 ? targetTop : 24}px`;
  } else {
    $(`#${uID}userCardContainer`).removeClass('userCardMusic');
    $(`#${uID}userCardContainer`).get(0).style.top = `${parseInt($(`#${uID}userCardContainer`).get(0).getAttribute('defaultTop'))}px`;
  }

  $(`.userCardTabButton`).addClass('disabled');
  $(`.userCardTab`).removeClass('fadeIn');
  $(`.userCardTab`).addClass('fadeOut');
  window.setTimeout(() => {
    $(`.userCardTabButton`).removeClass('disabled');
    $(`.userCardTab`).addClass('hidden');
    $(`#${uID}${tab}UserCard`).removeClass('hidden');
    $(`#${uID}${tab}UserCard`).removeClass('fadeOut');
    $(`#${uID}${tab}UserCard`).addClass('fadeIn');
    $(`.userCardTabButton`).removeClass('buttonActive');
    $(`#${uID}${tab}UserCardButton`).addClass('buttonActive');
  }, force ? 0 : 499);
};

window.closeUserPopout = keepListener => {
  $(`#${activeUserCard}userCardContainer`).removeClass('userCardActive');
  $(`#userPopoutsContainerBackground`).removeClass('fadeIn');
  $(`#userPopoutsContainerBackground`).addClass('fadeOut');
  window.setTimeout(() => {
    $(`#${activeUserCard}userCardContainer`).addClass('userCardAnimationClose');
  }, 20);
  window.setTimeout(() => {
    $(`#userPopoutsContainerBackground`).addClass('hidden');
    $(`#${activeUserCard}userCardContainer`).addClass('hidden');
    $(`#${activeUserCard}userCardContainer`).removeClass('userCardAnimationClose');
    activeUserCard = false;
  }, 320);

  if (!keepListener) {
    try {
      cancelUserQuery();
    } catch (error) {}

    ;
  }
};

function blockUser(uID, username) {
  (0, _display.openModal)('blockUser');

  $(`#blockConfirm`).get(0).onclick = async () => {
    (0, _display.closeModal)();

    if (!uID || !username) {
      snac('Error', 'Contact support or try again.', 'danger');
    }

    if (cacheUser.friends.some(e => e.u === uID)) {
      await removeFriend(uID, true);
    }

    if (cacheUser.outgoingFriendRequests.some(e => e.u === uID)) {
      await cancelRequest(uID, username);
    }

    await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
      blockedUsers: (0, _firestore.arrayUnion)({
        u: uID,
        n: username
      })
    });
    snac('Blocked User', '', 'success');
  };
}

function unblockUser(uID, username) {
  (0, _display.openModal)('unblockUser');

  $(`#unblockConfirm`).get(0).onclick = async () => {
    (0, _display.closeModal)();

    if (!uID || !username) {
      snac('Error', 'Contact support or try again.', 'danger');
    }

    await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
      blockedUsers: (0, _firestore.arrayRemove)({
        u: uID,
        n: username
      })
    });
    snac('Unblocked User', '', 'success');
  };
}

function processColors(uID) {
  $(`#${uID}userCardImage`).removeClass('invisible');
  $(`#${uID}userCardImage`).addClass('zoomIn');
  $(`#${uID}PresenceIndicatorUserCard`).removeClass('invisible');
  $(`#${uID}PresenceIndicatorUserCard`).addClass('fadeIn');
  const colors = colorThief.getColor($(`#${uID}userCardImage`).get(0));
  $(`#${uID}userCardBanner`).get(0).setAttribute('style', `background-color: rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, 1)`);

  if (colors[0] * 0.299 + colors[1] * 0.587 + colors[2] * 0.114 > 186) {
    $(`#${uID}userCardName`).get(0).style.color = '#000';
  } else {
    $(`#${uID}userCardName`).get(0).style.color = '#fff';
  }
}

window.switchAndOpenFriendsDM = (userID, username) => {
  if (activeUserCard) {
    closeUserPopout();
  }

  if ($(`#${userID}FriendItem`).length) {
    (0, _servers.openSpecialServer)('friends');
    (0, _friends.openFriendsDM)(userID, username);
    return;
  }

  snac('Contact Error', 'Become friends with this person to message them.');
};
},{"./componentse":"js/componentse.js","./display":"js/display.js","./firebaseChecks":"js/firebaseChecks.js","./friends":"js/friends.js","./music":"js/music.js","./presence":"js/presence.js","./servers":"js/servers.js","./stripe":"js/stripe.js"}],"js/sounds.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.playDeafen = playDeafen;
exports.playMessageSound = playMessageSound;
exports.playMute = playMute;
exports.playNotification = playNotification;
exports.playRingtone = playRingtone;

var _settings = require("./settings");

window.ringtonePlaying = false;

function playMessageSound() {
  if (!(0, _settings.retrieveSetting)('messageSendSound', true)) {
    return;
  }

  $('#sendMessageAudio').get(0).src = "https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/app%2Fsounds%2FsendMessage.wav?alt=media";
  $('#sendMessageAudio').get(0).currentTime = 0.85;
  $('#sendMessageAudio').get(0).volume = defaultVolume;
  $('#sendMessageAudio').get(0).play();
}

function playRingtone() {
  if (!$(`.incomingCall`).length) {
    // There is no incoming call
    ringtonePlaying = false;
    $('#ringtoneAudio').get(0).volume = defaultVolume;
    $('#ringtoneAudio').animate({
      volume: 0
    }, 1000);
    window.setTimeout(() => {
      $('#ringtoneAudio').get(0).pause();
    }, 1000);
    return;
  }

  if (!(0, _settings.retrieveSetting)('ringtoneSound', true) || ringtonePlaying) {
    // No ringtone or already playing
    return;
  }

  $('#ringtoneAudio').get(0).src = "https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/app%2Fsounds%2FSailing%20Colors.m4a?alt=media";
  $('#ringtoneAudio').get(0).currentTime = 0;
  $('#ringtoneAudio').get(0).volume = 0;
  $('#ringtoneAudio').get(0).play();
  $('#ringtoneAudio').animate({
    volume: defaultVolume
  }, 1000);
  ringtonePlaying = true;
}

function playNotification() {
  if (!(0, _settings.retrieveSetting)('notificationSound', true)) {
    return;
  }

  $('#notificationAudio').get(0).src = "https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/app%2Fsounds%2Fnotification.wav?alt=media";
  $('#notificationAudio').get(0).currentTime = 0;
  $('#notificationAudio').get(0).volume = defaultVolume;
  $('#notificationAudio').get(0).play();
}

function playMute() {
  if (!(0, _settings.retrieveSetting)('muteSound', true)) {
    return;
  }

  $('#muteAudio').get(0).src = "https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/app%2Fsounds%2Fmute.wav?alt=media";
  $('#muteAudio').get(0).currentTime = 0;
  $('#muteAudio').get(0).volume = defaultVolume;
  $('#muteAudio').get(0).play();
}

function playDeafen() {
  if (!(0, _settings.retrieveSetting)('deafenSound', true)) {
    return;
  }

  $('#deafenAudio').get(0).src = "https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/app%2Fsounds%2Fdeafen.wav?alt=media";
  $('#deafenAudio').get(0).currentTime = 0;
  $('#deafenAudio').get(0).volume = defaultVolume;
  $('#deafenAudio').get(0).play();
}
},{"./settings":"js/settings.js"}],"js/friends.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.acceptRequest = acceptRequest;
exports.addDMListeners = addDMListeners;
exports.cancelFriendsSearch = cancelFriendsSearch;
exports.deleteDMMessage = deleteDMMessage;
exports.endCallDM = endCallDM;
exports.friendEventListeners = friendEventListeners;
exports.friendsTab = friendsTab;
exports.loadFriends = loadFriends;
exports.markDMRead = markDMRead;
exports.markDMUnread = markDMUnread;
exports.messageify = messageify;
exports.openFriendsDM = openFriendsDM;
exports.pinDMMessage = pinDMMessage;
exports.prepareDMEditMessage = prepareDMEditMessage;
exports.prepareRemoveFriend = prepareRemoveFriend;
exports.processDMAttachments = processDMAttachments;
exports.setReadReciepts = setReadReciepts;
exports.toggleFriendsSort = toggleFriendsSort;
exports.unpinDMMessage = unpinDMMessage;
exports.unreadIndicatorsDM = unreadIndicatorsDM;

var _firestore = require("@firebase/firestore");

var _database = require("@firebase/database");

var _storage = require("@firebase/storage");

var _functions = require("@firebase/functions");

var timeago = _interopRequireWildcard(require("timeago.js"));

var _display = require("./display");

var _presence = require("./presence");

var _stripe = require("./stripe");

var _voice = require("./voice");

var _users = require("./users");

var _electron = require("./electron");

var _settings = require("./settings");

var _sounds = require("./sounds");

var _servers = require("./servers");

var _firebaseChecks = require("./firebaseChecks");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
(0, _firebaseChecks.checkAppInitialized)();
const db = (0, _firestore.getFirestore)();
const functions = (0, _functions.getFunctions)();
const storage = (0, _storage.getStorage)();
const rtdb = (0, _database.getDatabase)();

window.prepareFriendRequest = async () => {
  (0, _display.disableButton)($(`#previewRequestButtonFriends`));
  const name = $('#newFriendName').val().toLowerCase();

  if (name === cacheUser.username) {
    snac('Error', 'You cannot send a friend request to yourself.', 'danger');
    (0, _display.enableButton)($(`#previewRequestButtonFriends`), 'Preview Request');
    return;
  }

  const appDoc = await (0, _firestore.getDoc)((0, _firestore.doc)(db, `store/${name}`));

  if (!appDoc.exists()) {
    $('#errorNoUser').removeClass('hidden');
    $('#friendPreview').addClass('hidden');
    (0, _display.enableButton)($(`#previewRequestButtonFriends`), 'Preview Request');
    return;
  }

  const userDoc = await (0, _firestore.getDoc)((0, _firestore.doc)(db, `users/${appDoc.data().map}`));
  $('#errorNoUser').addClass('hidden');
  $('#friendPreview').removeClass('hidden');
  $('#friendPreview').html(`<img id="previewImageSendRequest" src="${await (0, _display.returnProperURL)(appDoc.data().map)}" class="invisible" /> <b>${userDoc.data().username.capitalize()}</b>`);
  (0, _display.displayImageAnimation)(`previewImageSendRequest`);

  $('#previewRequestButtonFriends').get(0).onclick = () => {
    confirmFriendRequest();
  };

  (0, _display.enableButton)($(`#previewRequestButtonFriends`), 'Confirm Request');
};

function friendEventListeners() {
  $(`#newFriendName`).get(0).addEventListener("keyup", function (event) {
    $('#previewRequestButtonFriends').html('Preview Request');

    if (event.keyCode === 13) {
      $(`#previewRequestButtonFriends`).get(0).click();
    }

    $('#previewRequestButtonFriends').get(0).onclick = () => {
      prepareFriendRequest();
    };
  });
}

window.confirmFriendRequest = async userID => {
  let uID = userID;

  if (!userID) {
    (0, _display.disableButton)($(`#previewRequestButtonFriends`));
    const name = $('#newFriendName').val().toLowerCase();
    const appDoc = await (0, _firestore.getDoc)((0, _firestore.doc)(db, `store/${name}`));
    uID = appDoc.data().map;
  }

  const userDoc = await (0, _firestore.getDoc)((0, _firestore.doc)(db, `users/${uID}`));

  if (userDoc.data().incomingFriendRequests.some(e => e.u == user.uid)) {
    snac('Outgoing Request', 'You already have an outgoing friend request to this person.', 'danger');
    $('#previewRequestButtonFriends').attr('onclick', 'prepareFriendRequest()');
    (0, _display.enableButton)($(`#previewRequestButtonFriends`), 'Preview Request');
    return;
  }

  if (cacheUser.friends.some(e => e.u === uID)) {
    snac('Already Friends', 'You are already friends with this person.', 'danger');
    $('#previewRequestButtonFriends').attr('onclick', 'prepareFriendRequest()');
    (0, _display.enableButton)($(`#previewRequestButtonFriends`), 'Preview Request');
    return;
  }

  if (cacheUser.blockedUsers && cacheUser.blockedUsers.some(e => e.u === uID)) {
    snac('User Blocked', 'You have blocked this user. Unblock them to send a friend request.', 'danger');
    $('#previewRequestButtonFriends').attr('onclick', 'prepareFriendRequest()');
    (0, _display.enableButton)($(`#previewRequestButtonFriends`), 'Preview Request');
    return;
  }

  if (cacheUser.incomingFriendRequests.some(e => e.u == uID)) {
    // Accept friend request
    acceptRequest(uID, userDoc.data().username);
    return;
  }

  notifyTiny('Adding friend...', true);
  (0, _display.closeModal)();
  const addFriendRequest = (0, _functions.httpsCallable)(functions, "addFriendRequest");
  const result = await addFriendRequest({
    target: uID
  });

  if (result.data.data === false) {
    snac('Error', 'Contact support or try again.', 'danger');
    $('#previewRequestButtonFriends').attr('onclick', 'prepareFriendRequest()');
    (0, _display.enableButton)($(`#previewRequestButtonFriends`), 'Preview Request');
    return;
  }

  snac('Friend Request Sent', '', 'success');
};

function friendsTab(tab, el) {
  $(`.friendsTab`).addClass('hidden');
  $(`#friendsList${tab}`).removeClass('hidden');
  $('.friendsTabButtonActive').removeClass('friendsTabButtonActive');
  $(el).addClass('friendsTabButtonActive');
}

function loadFriends() {
  loadFriendsActive(cacheUser.friends || []);
  loadIncoming(cacheUser.incomingFriendRequests || []);
  loadOutgoing(cacheUser.outgoingFriendRequests || []);
  loadBlocked(cacheUser.blockedUsers || []);
  (0, _presence.createPresenceListeners)();
}

async function loadFriendsActive(friends) {
  const friendsListForward = (0, _display.friendsArrayDifference)(cacheFriendsData, friends);
  const friendsListBackward = (0, _display.friendsArrayDifference)(friends, cacheFriendsData);
  cacheFriendsData = friends;

  for (let i = 0; i < friendsListForward.length; i++) {
    const friend = friendsListForward[i];
    const a = document.createElement('div');
    a.setAttribute('class', 'friendCardList activeFriendCard userContextItem');
    a.setAttribute('userID', friend.u);
    a.setAttribute('username', friend.n);

    a.onclick = () => {
      openFriendsDM(friend.u, friend.n);
    };

    a.id = `${friend.u}FriendItem`;
    a.innerHTML = `
      ${`
        <div id="InComingItemContent${friend.u}" class="friendListItemContent">
          <div class="firstBox"><img class="friendcardlistimagepfp" id="${friend.u}frienditemimage" src="${await (0, _display.returnProperURL)(friend.u)}"/><div id="${friend.u}PresenceIndicatorFriendsActiveList" class="presenceIndicator ${friend.u}presence"></div><span>${friend.n.capitalize()}<div id="${friend.u}MSGPreview" class="MSGPreview"></div></span></div>
          <div class="dateItem" id="${friend.u}prevMSGDate">
          </div>
        </div>
      `}
    `;

    if (!$(`#${friend.u}FriendItem`).length) {
      $(`#friendsListfriendsContent`).get(0).appendChild(a);
      (0, _display.displayImageAnimation)(`${friend.u}frienditemimage`);
    }

    if (DMunreadIndicators[friend.u]) {
      addDMIndicator(friend.u);
    }

    tippy($(`#${friend.u}PresenceIndicatorFriendsActiveList`).get(0), {
      content: '',
      placement: 'top',
      onTrigger: () => (0, _presence.showTippyListenerPresence)(friend.u, $(`#${friend.u}PresenceIndicatorFriendsActiveList`))
    }); // Prepare tooltip for 'online' | 'offline' | 'last online x days ago'

    $(`#${friend.u}FriendCardButton`).removeClass('disabled');
    $(`#${friend.u}FriendCardButton`).html(`<i class='bx bx-message-square-dots'></i>`);

    if ($(`#${friend.u}FriendCardButton`).length) {
      $(`#${friend.u}FriendCardButton`).get(0)._tippy.setContent("Message");

      $(`#${friend.u}FriendCardButton`).get(0).onclick = () => {
        switchAndOpenFriendsDM(friend.u, friend.n);
        (0, _display.disableButton)($(`#${friend.u}FriendCardButton`));
      };
    }

    (0, _presence.updatePresenceForUser)(friend.u);
  }

  for (let i = 0; i < friendsListBackward.length; i++) {
    const friend = friendsListBackward[i];
    $(`#${friend.u}FriendItem`).remove();
    $(`#${friend.u}friendView`).remove();
    $(`#${friend.u}MusicListeningCard`).remove(); // Things in music social.

    $(`#${friend.u}userContainerItem`).remove(); // Clear indicator if exists.

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
        (0, _display.disableButton)($(`#${friend.u}FriendCardButton`));
      };
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
  const friendsListForward = (0, _display.friendsArrayDifference)(cacheFriendsIncomingData, friends);
  const friendsListBackward = (0, _display.friendsArrayDifference)(friends, cacheFriendsIncomingData);
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
          <div class="firstBox"><img class="friendcardlistimagepfp" id="${friend.u}frienditemimageincoming" src="${await (0, _display.returnProperURL)(friend.u)}" /><span>${friend.n.capitalize()}</span></div>
          <div>
          <button id="incomingAcceptButton${friend.u}" class="btn b-0 roundedButton"><i class="bx bx-check"></i></button>
          <button id="incomingRejectButton${friend.u}" class="btn b-0 roundedButton"><i class="bx bx-x"></i></button>
          </div>
        </div>
      `}
    `;

    if (!$(`#${friend.u}InComingItem`).length) {
      $(`#friendsListincoming`).get(0).appendChild(a);
      (0, _display.displayImageAnimation)(`${friend.u}frienditemimageincoming`);
    }

    $(`#incomingAcceptButton${friend.u}`).get(0).onclick = () => acceptRequest(friend.u, friend.n);

    $(`#incomingRejectButton${friend.u}`).get(0).onclick = () => rejectRequest(friend.u, friend.n);

    tippy(`#incomingAcceptButton${friend.u}`, {
      content: 'Accept Request',
      placement: 'top'
    });
    tippy(`#incomingRejectButton${friend.u}`, {
      content: 'Reject Request',
      placement: 'top'
    });
    $(`#${friend.u}FriendCardButton`).removeClass('disabled');
    $(`#${friend.u}FriendCardButton`).html(`<i class='bx bx-check'></i>`);

    if ($(`#${friend.u}FriendCardButton`).length) {
      $(`#${friend.u}FriendCardButton`).get(0)._tippy.setContent("Accept Request");

      $(`#${friend.u}FriendCardButton`).get(0).onclick = () => {
        acceptRequest(friend.u, friend.n);
        (0, _display.disableButton)($(`#${friend.u}FriendCardButton`));
      };
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
          (0, _display.disableButton)($(`#${friend.u}FriendCardButton`));
        };
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

async function acceptRequest(targetUID, targetName) {
  (0, _display.disableButton)($(`#incomingAcceptButton${targetUID}`));
  (0, _display.disableButton)($(`#incomingRejectButton${targetUID}`));
  $(`#${targetUID}InComingItem`).css('height', '48px');
  $(`#${targetUID}InComingItem`).css('transition', 'all 0.45s');
  $(`#${targetUID}InComingItem`).css('background-color', 'lime');
  $(`#InComingItemContent${targetUID}`).css('opacity', '0');
  $(`#${targetUID}InComingItem`).css('padding', '0px');
  $(`#${targetUID}InComingItem`).css('margin', '0px');
  window.setTimeout(() => {
    $(`#${targetUID}InComingItem`).css('height', '0px');
  }, 100);
  notifyTiny('Accepting request...', true);
  const acceptRequest = (0, _functions.httpsCallable)(functions, "acceptRequest");
  const result = await acceptRequest({
    target: targetUID
  });

  if (result.data.data === false) {
    snac('Error', `Contact support or try again.`, 'danger');
  } else {
    snac('Request Accepted', `You accepted the request from ${targetName}.`, 'success');
  }
}

async function rejectRequest(targetUID, targetName) {
  (0, _display.disableButton)($(`#incomingAcceptButton${targetUID}`));
  (0, _display.disableButton)($(`#incomingRejectButton${targetUID}`));
  $(`#${targetUID}InComingItem`).css('height', '48px');
  $(`#${targetUID}InComingItem`).css('transition', 'all 0.45s');
  $(`#${targetUID}InComingItem`).css('background-color', 'red');
  $(`#InComingItemContent${targetUID}`).css('opacity', '0');
  $(`#${targetUID}InComingItem`).css('padding', '0px');
  $(`#${targetUID}InComingItem`).css('margin', '0px');
  window.setTimeout(() => {
    $(`#${targetUID}InComingItem`).css('height', '0px');
  }, 100);
  const rejectRequest = (0, _functions.httpsCallable)(functions, "rejectRequest");
  const result = await rejectRequest({
    target: targetUID
  });

  if (result.data.data === false) {
    snac('Error', `Contact support or try again.`, 'danger');
  } else {
    snac('Request Rejected', `You rejected the request from ${targetName}.`, 'success');
  }
}

async function loadOutgoing(friends) {
  const friendsListForward = (0, _display.friendsArrayDifference)(cacheFriendsOutgoingData, friends);
  const friendsListBackward = (0, _display.friendsArrayDifference)(friends, cacheFriendsOutgoingData);
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
          <div class="firstBox"><img class="friendcardlistimagepfp" id="${friend.u}frienditemimageoutogingi" src="${await (0, _display.returnProperURL)(friend.u)}" /><span>${friend.n.capitalize()}</span></div>
          <button onclick="cancelRequest('${friend.u}', '${friend.n}')" id="outgoingTrashButton${friend.u}" class="btn b-0 roundedButton"><i class='bx bx-trash'></i></
        </div>
      `}
    `;

    if (!$(`#${friend.u}OutGoingItem`).length) {
      $(`#friendsListOutgoingContent`).get(0).appendChild(a);
      (0, _display.displayImageAnimation)(`${friend.u}frienditemimageoutogingi`);
    }

    tippy(`#outgoingTrashButton${friend.u}`, {
      content: 'Cancel Request',
      placement: 'top'
    });
    $(`#${friend.u}FriendCardButton`).removeClass('disabled');
    $(`#${friend.u}FriendCardButton`).html(`<i class='bx bx-x'></i>`);

    if ($(`#${friend.u}FriendCardButton`).length) {
      $(`#${friend.u}FriendCardButton`).get(0)._tippy.setContent("Cancel Request");

      $(`#${friend.u}FriendCardButton`).get(0).onclick = () => {
        cancelRequest(friend.u);
        (0, _display.disableButton)($(`#${friend.u}FriendCardButton`));
      };
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
          (0, _display.disableButton)($(`#${friend.u}FriendCardButton`));
        };
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
      const userDoc = await (0, _firestore.getDoc)((0, _firestore.doc)(db, `users/${targetUID}`));
      targetName = userDoc.data().username;
    } // Do somethin special with that div item lol


    (0, _display.disableButton)($(`#outgoingTrashButton${targetUID}`));
    $(`#${targetUID}OutGoingItem`).css('height', '48px');
    $(`#${targetUID}OutGoingItem`).css('transition', 'all 0.45s');
    $(`#OutGoingItemContent${targetUID}`).css('opacity', '0');
    $(`#${targetUID}OutGoingItem`).css('padding', '0px');
    $(`#${targetUID}OutGoingItem`).css('margin', '0px');
    window.setTimeout(() => {
      $(`#${targetUID}OutGoingItem`).css('height', '0px');
    }, 100);
    notifyTiny('Cancelling request...', true);
    const cancelRequestFunc = (0, _functions.httpsCallable)(functions, "cancelRequest");
    const result = await cancelRequestFunc({
      target: targetUID
    });

    if (result.data.data === false) {
      snac('Error', `Contact support or try again.`, 'danger');
    } else {
      snac('Request Cancelled', `You cancelled the request to ${targetName}.`, 'success');
    }
  });
};

async function loadBlocked(friends) {
  const friendsListForward = (0, _display.friendsArrayDifference)(cacheFriendsBlockedData, friends);
  const friendsListBackward = (0, _display.friendsArrayDifference)(friends, cacheFriendsBlockedData);
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
          <div class="firstBox"><img class="friendcardlistimagepfp" id="${friend.u}frienditemimageblocked" src="${await (0, _display.returnProperURL)(friend.u)}" /><span>${friend.n.capitalize()}</span></div>
          <button id="blockedCancelButton${friend.u}" class="btn b-0 roundedButton"><i class='bx bx-heart'></i></
        </div>
      `}
    `;

    if (!$(`#${friend.u}BlockedItem`).length) {
      $(`#friendsListblocked`).get(0).appendChild(a);
      (0, _display.displayImageAnimation)(`${friend.u}frienditemimageblocked`);
    }

    $(`#blockedCancelButton${friend.u}`).get(0).onclick = () => {
      (0, _users.unblockUser)(friend.u, friend.n);
    };

    tippy(`#blockedCancelButton${friend.u}`, {
      content: 'Unblock',
      placement: 'top'
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

async function openFriendsDM(uID, inputUsername) {
  currentChannel = uID;
  let username = inputUsername;
  (0, _voice.hideMediaViewDM)(uID, true);

  if (!inputUsername) {
    for (let i = 0; i < cacheUser.friends.length; i++) {
      if (cacheUser.friends[i].u === uID) {
        username = cacheUser.friends[i].u;
        break;
      }

      ;
    }
  }

  if (!username) {
    snac('Error', 'Contact support or try again.', 'danger');
  }

  if (activeDM == uID) {
    return;
  }

  try {
    (0, _database.off)((0, _database.query)((0, _database.ref)(rtdb, `direct/${(0, _display.dmKEYify)(uID, user.uid)}/messages`)));
  } catch (error) {}

  activeDM = uID;

  if ($(`#${uID}friendView`).length) {
    $('.friendViewContentView').addClass('hidden');
    $('.friendsListItemActive').removeClass('friendsListItemActive');
    $(`#${uID}friendView`).removeClass('hidden');
    $(`#${uID}FriendItem`).addClass('friendsListItemActive');
    $(`#${uID}ChatMessageInput`).get(0).focus();
    addDMListeners(uID, true);
    (0, _display.scrollBottomMessagesDM)(uID);
    return;
  }

  const a = document.createElement('div');
  a.setAttribute('class', 'friendViewContentView hidden');
  a.id = `${uID}friendView`;
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
        <img class="voiceChatIllustrationLeft" src="https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/app%2Fundraw_Group_selfie_re_h8gb.svg?alt=media" />
        <img class="voiceChatIllustrationRight" src="https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/app%2Fundraw_Hang_out_re_udl4.svg?alt=media" />
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
  `;
  $('#friendViewRight').get(0).appendChild(a);
  twemoji.parse($(`#${uID}emojiButton`).get(0));

  $(`#friendHeaderVideo${uID}`).get(0).onclick = () => {
    (0, _voice.joinVideoDM)(uID, username);
  };

  $(`#friendHeaderScreen${uID}`).get(0).onclick = () => {
    (0, _voice.joinScreenDM)(uID, username);
  };

  tippy($(`#gifsButton${uID}`).get(0), {
    content: `GIFs`,
    placement: 'top'
  });
  tippy($(`#${uID}emojiButton`).get(0), {
    content: `Emojis`,
    placement: 'top'
  });
  tippy($(`#${uID}AttachmentButton`).get(0), {
    content: `Add Attachment`,
    placement: 'top'
  });
  tippy($(`#${uID}SendMessageButton`).get(0), {
    content: `Send`,
    placement: 'top'
  });
  tippy($(`#${uID}pinnedMessagesButton`).get(0), {
    content: 'Pinned Messages',
    placement: 'top'
  });
  tippy($(`#closePinnedButton${uID}`).get(0), {
    content: 'Close',
    placement: 'top'
  });
  tippy($(`#closeGifsButton${uID}`).get(0), {
    content: 'Close',
    placement: 'top'
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
  }); // Drag & Drop

  $(`#${uID}DropTarget`).get(0).ondragenter = e => {
    e.preventDefault();
  };

  $(`.${uID}Grid`).get(0).ondragenter = e => {
    $(`#${uID}DropTarget`).css('display', 'block');
  };

  $(`#${uID}DropTarget`).get(0).ondragleave = e => {
    $(`#${uID}DropTarget`).css('display', '');
    e.preventDefault();
  };

  $(`#${uID}DropTarget`).get(0).ondragover = e => {
    e.preventDefault();
  };

  $(`.${uID}Grid`).get(0).ondrop = e => {
    (0, _display.showDroplet)();

    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      processDMAttachments(uID, [e.dataTransfer.files[i]]);
    }

    $(`#${uID}DropTarget`).css('display', '');
    e.preventDefault();
  }; // FOR LATER: <button id="callUserButton('${uID}')" onclick="callUser('${uID}')" class="btn b-1 voiceChatVideo"><i class='bx bx-video' ></i> video call</button>


  (0, _display.displayInputEffect)(); // button on enter.

  $(`#${uID}ChatMessageInput`).get(0).addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      sendDMMessage(uID);
    }
  });
  $(`#gifsPickerSearchBox${uID}`).get(0).addEventListener("keyup", event => {
    (0, _display.searchGifs)(uID);
  });
  $('.friendViewContentView').addClass('hidden');
  $(`#${uID}friendView`).removeClass('hidden');
  $('.friendsListItemActive').removeClass('friendsListItemActive');
  $(`#${uID}FriendItem`).addClass('friendsListItemActive');
  $(`#${uID}ChatMessageInput`).get(0).focus();

  $(`#blockUserButton${uID}`).get(0).onclick = () => {
    (0, _users.blockUser)(uID, username);
  };

  addDMListeners(uID);
}

window.loadMoreDMMessages = async uID => {
  (0, _display.disableButton)($(`#${uID}LoadMoreMessagesButton`));
  const response = addMessagesPagination(uID);

  if (response == 'topOfMessages' || !DMLatestMessagesPagination[uID]) {
    (0, _display.enableButton)($(`#${uID}LoadMoreMessagesButton`), `<i class="bx bx-chat"></i>`);

    $(`#${uID}LoadMoreMessagesButton`).get(0)._tippy.setContent('No more messages.');
  } else {
    await (0, _display.timer)(3200);
    (0, _display.enableButton)($(`#${uID}LoadMoreMessagesButton`), `<i class="bx bx-up-arrow-alt"></i>`);
  }
};

function addMessagesPagination(uID) {
  if (!DMLatestMessagesPagination[uID]) {
    disablePagination[uID] = true;
    completePagination[uID] = true;
    return 'topOfMessages';
  } // Add messages without a listener. 


  (0, _database.get)((0, _database.query)((0, _database.ref)(rtdb, `direct/${(0, _display.dmKEYify)(uID, user.uid)}/messages`), (0, _database.orderByKey)(), (0, _database.limitToLast)(18), (0, _database.endBefore)(DMLatestMessagesPagination[uID]))).then(async snapshot => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      let newPagination = ''; // Ordered by farthest to newest aka higher to lower

      const bottomMostNew = new Date(data[Object.keys(data)[Object.keys(data).length - 1]].timestamp);
      const topMostOld = new Date(parseInt($(`#DMMessages${uID}`).children('.containsDivider').first().get(0).getAttribute('ts')));

      if (bottomMostNew.getFullYear() == topMostOld.getFullYear() && bottomMostNew.getMonth() == topMostOld.getMonth() && bottomMostNew.getDate() == topMostOld.getDate()) {
        // Same day, delete topmost timestamp.
        $(`#DMMessages${uID}`).children('.containsDivider').first().children('.chatMessageDivider').first().remove();
        $(`#DMMessages${uID}`).children('.containsDivider').first().removeClass('containsDivider');
      }

      for (const key of Object.keys(data)) {
        const value = data[key];

        if (!newPagination) {
          newPagination = key;
        }

        await buildDMMessage(value, uID, key, `PaginationPreview`);
        twemoji.parse($(`#DMMessageContentOfID${key}`).get(0));
      }

      DMLatestMessagesPagination[uID] = newPagination; // $(`#DMMessages${uID}`).scrollTop($(`#DMMessages${uID}`).get(0).scrollHeight - bottomScroll - 840);

      const newContent = $(`#PaginationPreview${uID}`).html();
      $(`#PaginationPreview${uID}`).html('');
      $(`#DMMessages${uID}`).prepend(newContent);
    } else {
      DMLatestMessagesPagination[uID] = '';
    }
  });
  disablePagination[uID] = false;
}

async function pinDMMessage(uID, messageID, messageSender, username) {
  await (0, _database.update)((0, _database.ref)(rtdb, `direct/${(0, _display.dmKEYify)(uID, user.uid)}/pinned/${messageID}`), {
    u: username,
    s: messageSender,
    c: (0, _display.messageHTMLtoText)(null, $(`#DMMessageContentOfID${messageID}`).get(0))
  });
  snac('Pinned', '', 'success');
}

async function unpinDMMessage(uID, messageID, skipNotify) {
  await (0, _database.remove)((0, _database.ref)(rtdb, `direct/${(0, _display.dmKEYify)(uID, user.uid)}/pinned/${messageID}`));

  if (!skipNotify) {
    snac('Unpinned', '', 'success');
  }
}

async function addDMListeners(uID, secondTime) {
  // Always clear.
  $(`#DMMessages${uID}`).find('.chatMessage').remove();
  DMLatestMessageTimestamp[uID] = new Date(0);
  DMLatestMessagesPagination[uID] = null;

  try {
    (0, _database.off)((0, _database.query)((0, _database.ref)(rtdb, `${activeMessageListener}`)));
  } catch (error) {}

  ;

  try {
    (0, _database.off)((0, _database.query)((0, _database.ref)(rtdb, `${activePinnedListener}`)));
  } catch (error) {}

  try {
    activeReadListener();
  } catch (error) {}

  activeMessageListener = `direct/${(0, _display.dmKEYify)(uID, user.uid)}/messages`;
  activePinnedListener = `direct/${(0, _display.dmKEYify)(uID, user.uid)}/pinned`;

  if (DMunreadIndicators[`${uID}`]) {
    markDMRead(uID);
  } // Set message listener now that the channel has been opened.


  (0, _database.onChildAdded)((0, _database.query)((0, _database.ref)(rtdb, `${activeMessageListener}`), (0, _database.orderByKey)(), (0, _database.limitToLast)(24)), async snapshot => {
    // Make sure latest message is newer.
    if (new Date(snapshot.val().timestamp) < DMLatestMessageTimestamp[uID]) {
      // The purpose for this is to disable old messages that enter the window through newer, deleted messages
      // don't get added to the DOM in the latest position.
      return;
    }

    ;

    if (DMLatestMessagesPagination[uID] == null) {
      // farthest message / first message / first run.
      DMLatestMessagesPagination[uID] = snapshot.key;
    }

    DMLatestMessageTimestamp[uID] = new Date(snapshot.val().timestamp); // if ($(`#DMMessageOfID${snapshot.key}`).length) {
    //   displayDMDeleteMessage(snapshot.key);
    // }

    if (!$(`#messageContentContainerOfID${snapshot.key}`).length) {
      await buildDMMessage(snapshot.val(), uID, snapshot.key);
      twemoji.parse($(`#DMMessageContentOfID${snapshot.key}`).get(0));
    }
  }); // Delete message listener.

  (0, _database.onChildRemoved)((0, _database.query)((0, _database.ref)(rtdb, `${activeMessageListener}`)), snapshot => {
    displayDMDeleteMessage(snapshot.key);
  }); // Edit message listener.

  (0, _database.onChildChanged)((0, _database.query)((0, _database.ref)(rtdb, `${activeMessageListener}`)), snapshot => {
    $(`#DMMessageContentOfID${snapshot.key}`).html(messageify(snapshot.val().content));
    twemoji.parse($(`#DMMessageContentOfID${snapshot.key}`).get(0));

    if (snapshot.val().edited) {
      $(`#DMMessageContentOfID${snapshot.key}`).addClass('editedMessage');
      $(`#DMEditedMessageOfID${snapshot.key}`).removeClass('hidden');

      $(`#DMEditedMessageIconOfID${snapshot.key}`).get(0)._tippy.setContent(`Edited ${timeago.format(new Date(snapshot.val().editedDate))}`);
    } // If sent a message, its approved now.

  });
  (0, _database.onValue)((0, _database.query)((0, _database.ref)(rtdb, `${activeMessageListener}`), (0, _database.limitToLast)(1)), snapshot => {
    if (snapshot.exists() && snapshot.val()) {
      $(`#emptyChannel${uID}`).addClass('hidden');
    } else {
      $(`#emptyChannel${uID}`).removeClass('hidden');
    }
  });

  if (!DMCachedPins[uID]) {
    DMCachedPins[uID] = new Set();
  }

  $(`#${uID}pinnedMessages`).empty();
  (0, _database.onChildAdded)((0, _database.query)((0, _database.ref)(rtdb, `${activePinnedListener}`), (0, _database.limitToLast)(50)), async snapshot => {
    DMCachedPins[uID].add(snapshot.key);
    const a = document.createElement('div');
    a.setAttribute('class', 'messageReplay');
    a.id = `messageReplayOfID${snapshot.key}`;
    a.innerHTML = `
      <img class="profilePhotoReplay" id="${snapshot.key}pinimage"></img>
      <span class="chatMessageNameplate">${snapshot.val().u.capitalize()}</span>
      <p>${snapshot.val().c}</p>
      <button id="unpin${snapshot.key}" class="btn b-4 roundedButton pinnedButton unPinButton"><i class="bx bx-checkbox-minus"></i></button>
    `;
    $(`#${uID}pinnedMessages`).get(0).appendChild(a);
    twemoji.parse($(`#messageReplayOfID${snapshot.key}`).get(0));
    $(`#${snapshot.key}pinimage`).attr('src', await (0, _display.returnProperURL)(snapshot.val().s));

    $(`#unpin${snapshot.key}`).get(0).onclick = () => {
      (0, _display.disableButton)($(`#unpin${snapshot.key}`));
      unpinDMMessage(uID, snapshot.key, true);
    };
  });
  (0, _database.onChildRemoved)((0, _database.query)((0, _database.ref)(rtdb, `${activePinnedListener}`), (0, _database.limitToLast)(50)), snapshot => {
    DMCachedPins[uID].delete(snapshot.key);
    $(`#messageReplayOfID${snapshot.key}`).css('height', $(`#messageReplayOfID${snapshot.key}`).height() + 'px');
    window.setTimeout(() => {
      $(`#messageReplayOfID${snapshot.key}`).addClass('bookmarkGone');
      window.setTimeout(() => {
        $(`#messageReplayOfID${snapshot.key}`).remove();
      }, 499);
    }, 9);
  });
  (0, _database.onValue)((0, _database.query)((0, _database.ref)(rtdb, `${activePinnedListener}`), (0, _database.limitToLast)(1)), snapshot => {
    if (snapshot.exists() && snapshot.val()) {
      $(`#emptyPinned${uID}`).addClass('hidden');
    } else {
      $(`#emptyPinned${uID}`).removeClass('hidden');
    }
  }); // VC

  if (voiceChatRef !== `voice/${(0, _display.dmKEYify)(uID, user.uid)}`) {
    try {
      if (voiceChatRef) {
        (0, _database.off)((0, _database.query)((0, _database.ref)(rtdb, voiceChatRef)));
      }
    } catch (error) {}

    voiceChatRef = `voice/${(0, _display.dmKEYify)(uID, user.uid)}`;
    (0, _database.onValue)((0, _database.query)((0, _database.ref)(rtdb, voiceChatRef)), snapshot => {
      (0, _voice.manageVCFriendsDisplay)(uID, snapshot.val());
    });
  } else {
    console.log('Skipping VC Ref listener. Already set.');
  }

  activeReadListener = (0, _firestore.onSnapshot)((0, _firestore.doc)(db, `DMUnread/${uID}`), doc => {
    // DMunreadIndicatorsData is my own unread!
    // Look at the official last message DMServerData.
    if (doc.exists() && doc.data()[user.uid] && DMServerData[uID].latest) {
      // 200ms buffer.
      if (doc.data()[user.uid].toDate().getTime() + 200 >= new Date(DMServerData[uID].latest).getTime() && !doc.data().hideRead) {
        console.log('read latest'); // Read latest message.

        $(`#read${uID}Notice`).html(`Read ${timeago.format(doc.data()[user.uid].toDate())}.`);
        $(`#read${uID}Notice`).removeClass('hidden');
      } else {
        // Hasn't read latest message.
        $(`#read${uID}Notice`).addClass('hidden');
      }
    }
  });

  $(`#DMMessages${uID}`).get(0).onscroll = () => {};

  window.setTimeout(() => {
    // Paginatoion
    $(`#DMMessages${uID}`).get(0).onscroll = function (event) {
      const scroll = $(`#DMMessages${uID}`).scrollTop();

      if (scroll < 599) {
        if (completePagination[uID]) {
          return;
        }

        if (!disablePagination[uID]) {
          disablePagination[uID] = true;
          addMessagesPagination(uID);
        }
      }
    };
  }, 1800);
}

async function setReadReciepts(setting) {
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `DMUnread/${user.uid}`), {
    hideRead: setting
  });

  if (setting) {
    snac('Read Receipts Off', '', 'success');
  } else {
    snac('Read Receipts On', '', 'success');
  }
}

function displayDMDeleteMessage(key) {
  // Delete the message firstly
  const parentElement = $(`#messageContentContainerOfID${key}`).parent().parent();
  $(`#messageContentContainerOfID${key}`).remove();

  if (parentElement.hasClass('otherChatMessage')) {
    if (parentElement.children('.topLevelMessageContentTwo').first().children().length == 2) {
      parentElement.remove();
    }
  } else {
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

  $(`#${uID}ChatMessageInput`).val();

  if (!message.length && !force) {
    if (DMPendingAttachments[uID] && DMPendingAttachments[uID].length) {
      message = ``;
    } else {
      return;
    }
  }

  if (message.length > 1200) {
    snac('Invalid Message', 'Your message cannot be longer than 1200 characters.', 'danger');
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

  if (matches) {
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      linkPreviewContent = linkPreviewContent.replaceAll(match, ``);
    }
  }

  if (linkPreviewContent.includes('https') || linkPreviewContent.includes('http')) {
    notifyTiny('Generating preview.', true);
    const getLinkPreview = (0, _functions.httpsCallable)(functions, "getLinkPreview");
    result = await getLinkPreview({
      content: linkPreviewContent
    });
    result = result.data.data;
  } // Change message content track: into track:id.artist.name


  const words = message.split(' ');

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    if (word.includes('track:')) {
      const trackID = word.split('track:')[1];
      const trackDetails = await makeMusicRequest(`songs/${trackID}`); // Get track details.

      console.log(trackDetails);

      if (trackDetails.data[0].attributes.name) {
        message = message.replace(word, `track:${trackID}.${trackDetails.data[0].attributes.name.replaceAll(".", "&ParallelPeriod&")}.${trackDetails.data[0].attributes.artistName.replaceAll(".", "&ParallelPeriod&")}`.replaceAll(" ", "&ParallelSpace&"));
      }
    }
  } // Upload all attachments.


  hideDMAttachmentManager(uID);

  if (!DMPendingAttachments[uID]) {
    DMPendingAttachments[uID] = [];
  }

  let DMFinalAttachments = [];

  for (let i = 0; i < DMPendingAttachments[uID].length; i++) {
    const file = DMPendingAttachments[uID][i];
    (0, _display.showUploadProgress)();
    const imageID = new Date().getTime();
    DMFinalAttachments.push(await uploadDMAttachmentFile(uID, imageID, file));

    if (['jpg', 'jpeg', 'png'].includes(file.name.split('.').pop().toLowerCase())) {
      const resizeImages = (0, _functions.httpsCallable)(functions, "resizeImages");
      await resizeImages({
        targetChannel: (0, _display.dmKEYify)(uID, user.uid),
        filePath: `attachments/${(0, _display.dmKEYify)(user.uid, uID)}/${user.uid}/${imageID}.${file.name.split(".").pop()}`
      });
    }

    (0, _display.hideUploadProgress)();
  }

  if (pendingGif) {
    DMFinalAttachments.push(pendingGif);
    pendingGif = null; // Select text field

    $(`#${uID}ChatMessageInput`).focus();
  }

  DMPendingAttachments[uID] = [];
  $(`#${uID}DMAttachmentManagerContent`).empty();
  (0, _sounds.playMessageSound)();
  window.setTimeout(() => {
    disableMessageSending = false;
  }, 499);
  await (0, _database.push)((0, _database.ref)(rtdb, `direct/${(0, _display.dmKEYify)(uID, user.uid)}/messages`), {
    attachments: DMFinalAttachments,
    author: cacheUser.username,
    timestamp: (0, _database.serverTimestamp)(),
    content: message,
    uid: user.uid,
    links: result
  });
  await (0, _database.set)((0, _database.ref)(rtdb, `directUnread/${user.uid}/${uID}`), {
    latest: (0, _database.serverTimestamp)(),
    latestContent: message || `${DMFinalAttachments.length} Attachment(s)`,
    username: `${cacheUser.username}`
  });
  await (0, _database.set)((0, _database.ref)(rtdb, `directUnread/${uID}/${user.uid}`), {
    latest: (0, _database.serverTimestamp)(),
    latestContent: message || `${DMFinalAttachments.length} Attachment(s)`,
    username: `${cacheUser.username}`
  });
  const perspectiveapi = await fetch("https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=AIzaSyDwSVIkiXmE5CFqOkqyew75zX5pRbpuboo", {
    body: `{comment: {text: "${(0, _display.securityConfirmTextIDs)(message, true)}"}, languages: ["en"], requestedAttributes: {TOXICITY:{}, SEVERE_TOXICITY: {}} }`,
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });
  const perspective = await perspectiveapi.json();

  if (perspective && perspective.attributeScores && perspective.attributeScores["SEVERE_TOXICITY"] && perspective.attributeScores["SEVERE_TOXICITY"].summaryScore.value > 0.8) {
    (0, _display.openModal)('toxicityWarning');
  }
};

function messageify(content) {
  // Get invite codes.
  let messageDraft = (0, _display.linkify)((0, _display.securityConfirmText)(content));
  const words = content.split(' ');

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    if (word.includes('inv:')) {
      if (word.split('inv:')[1].length == 49) {
        messageDraft = messageDraft.replace(word, `
          <button class="btn inMessageButton" onclick="previewJoinWithInvite('${word.split('inv:')[1]}')">Join Group</button>
        `);
      }
    } else if (word.includes('track:')) {
      const track = word.split('track:')[1].split('.');

      if (track[0] && track[1] && track[2]) {
        messageDraft = messageDraft.replace(word, `
          <button onclick="playTrackByMessage(this, '${track[0]}')" class="btn inMessageButton" ">${track[2].replaceAll("&ParallelSpace&", " ").replaceAll('&ParallelPeriod&', ".")} - ${track[1].replaceAll("&ParallelSpace&", " ").replaceAll('&ParallelPeriod&', ".")}</button>
        `);
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

window.previewJoinWithInvite = invitation => {
  (0, _servers.joinGroup)();
  $(`#inviteCodeField`).val(invitation);
  $(`#inviteCodeField`).addClass('active');
  $(`#inviteCodeField`).get(0).focus();
  snac('Invitation Code Pasted', '', 'success');
};

function buildDMMessage(messageItem, uID, messageID, targetDirectoryInput) {
  return new Promise(async (resolve, reject) => {
    let targetDirectory = targetDirectoryInput;

    if (!targetDirectoryInput) {
      targetDirectory = 'DMMessages';
    }

    const messageContent = messageify(messageItem.content);
    const prevMessageDate = new Date(parseInt($(`#${targetDirectory}${uID}`).children().last().attr('tS')));
    const newMessageDate = new Date(messageItem.timestamp);
    let bonusContent = {
      attachments: messageItem.attachments || '',
      classes: '',
      edited: messageItem.edited || false,
      containerClasses: '',
      links: '',
      YouTube: '',
      insertHTML: ''
    };
    let dividerCode = '';
    let dividerCode2 = '';
    let availableToAdd = true;
    let availableToAddedTo = true; // Type of message.

    if (messageContent) {
      bonusContent.classes = '';
      bonusContent.containerClasses = '';
      bonusContent.insertHTML = '';
    } else {
      bonusContent.classes = '';
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
        } else if (messageItem.attachments[i].toLowerCase().endsWith(`.mp4?alt=media`) || messageItem.attachments[i].toLowerCase().endsWith(`.mov?alt=media`) || messageItem.attachments[i].toLowerCase().endsWith(`.webm?alt=media`)) {
          attachmentItem = `<video id="${messageID}Attachment${i}"> </video>`;
        } else if (messageItem.attachments[i].toLowerCase().endsWith(`.mp3?alt=media`) || messageItem.attachments[i].toLowerCase().endsWith(`.wav?alt=media`) || messageItem.attachments[i].toLowerCase().endsWith(`.ogg?alt=media`) || messageItem.attachments[i].toLowerCase().endsWith(`.aac?alt=media`) || messageItem.attachments[i].toLowerCase().endsWith(`.m4a?alt=media`)) {
          attachmentItem = `<audio controls id="${messageID}Attachment${i}"> </audio>`;
        } else if (messageItem.attachments[i].toLowerCase().endsWith(`.gif`)) {
          attachmentItem = `<img onclick="fullscreenImage('${messageID}Attachment${i}', true)" id="${messageID}Attachment${i}"  class="bonusContentAttachmentImage"> </img>`;
        } else {
          const matches = /\.([0-9a-z]+)(?:[\?#]|$)/i.exec(messageItem.attachments[i]);
          const boxIcon = (0, _display.fileTypeMatches)(matches);
          attachmentItem = `<div id="${messageID}NoAttachment${i}" class="bonusContentAttachmentImage bonusContentNoImage"><div><b>${matches[1].toLowerCase().capitalize()} File</b><i class="bx ${boxIcon}"></i></div></div>`;
        }

        bonusContent.attachments = bonusContent.attachments + attachmentItem;
      }

      bonusContent.attachments = bonusContent.attachments + '</div>';
      availableToAdd = false;
      availableToAddedTo = false;
    }

    if (messageItem.links && messageItem.links.length) {
      bonusContent.containerClasses = bonusContent.containerClasses + ` messageBoxContainsLinks linksCount${messageItem.links.length}`;
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
          `;
        }
      }

      bonusContent.links = bonusContent.links + `</div>`;
      availableToAdd = false;
      availableToAddedTo = false;
    }

    const reg = new RegExp(/https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*?[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig);
    const matches = messageContent.match(reg);

    if (matches && matches.length) {
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        let id = match.split(`?v=`)[1];

        if (!id) {
          id = match.split('.be/')[1];
        }

        bonusContent.containerClasses = bonusContent.containerClasses + ` messageBoxContainsYouTube`;
        bonusContent.YouTube = `<div class="messageBoxYouTube">`;
        bonusContent.YouTube = bonusContent.YouTube + `
          <div class="YouTubeEmbed">
            <div class="plyr__video-embed">
              <iframe src="https://www.youtube.com/embed/${id}" allowfullscreen allowtransparency></iframe>
            </div>
          </div>
        `;
      }

      bonusContent.YouTube = bonusContent.YouTube + `</div>`;
      availableToAdd = false;
      availableToAddedTo = false;
    }

    if (prevMessageDate.getFullYear() !== newMessageDate.getFullYear() || prevMessageDate.getMonth() !== newMessageDate.getMonth() || prevMessageDate.getDate() !== newMessageDate.getDate()) {
      dividerCode = `<span class="chatMessageDivider">${newMessageDate.toLocaleDateString("en-US", {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: '2-digit'
      })}</span>`;
      dividerCode2 = 'containsDivider';
      availableToAdd = false;
    } // Create the same message either way.


    const a = document.createElement('div');
    a.setAttribute('sentBy', messageItem.uid);
    a.setAttribute('tS', messageItem.timestamp);
    a.setAttribute('availableToBeAddedTo', availableToAddedTo || '');
    a.setAttribute('class', `chatMessage ${messageItem.uid === user.uid ? 'selfChatMessage' : 'otherChatMessage'} ${dividerCode2} ${bonusContent.containerClasses}`);
    a.id = `DMMessageOfID${messageID}`;
    let containerStart = ``;
    let containerEnd = ``;
    let innerMessageContent = `
      <div class="relative" id="messageContentContainerOfID${messageID}">
        <div id="DMMessageOfID${messageID}" messageID="${messageID}" class="messageContentContentContainer ${bonusContent.classes}">
          <div class="messageContentItemForContext loneEmoji${messageContent.length} acceptLeftClick ${bonusContent.edited ? 'editedMessage' : ''} " messageID="${messageID}" messageSenderName="${messageItem.author}" messageSender="${messageItem.uid}" messageType="DM" channelID="${uID}" id="DMMessageContentOfID${messageID}">${messageContent}</div>
        </div>
        <div id="DMEditedMessageOfID${messageID}" class="editedMessageIcon ${bonusContent.edited ? '' : 'hidden'} animated zoomIn">
          <i id="DMEditedMessageIconOfID${messageID}" class="bx bx-pencil"></i>
        </div>
      </div>
    `;

    if (messageItem.uid == user.uid) {
      containerStart = `${dividerCode}<div class="topLevelMessageContentTwo">`;
      containerEnd = `</div>`;
    } else {
      containerStart = `${dividerCode}<div class="topLevelMessageContentTwo"><img id="profilePhotoOfMessageID${messageID}" onclick="openUserCard('${messageItem.uid}')" userid="${messageItem.uid}" username="${messageItem.author}" class="otherChatMessageImageProfile userContextItem hidden" src="" />`;
      containerEnd = `</div>`;
    }

    a.innerHTML = `${containerStart}<div class="topLevelContainerMessage"><span class="chatMessageNameplate">${messageItem.author.capitalize()}</span><span id="chatMessageTimestamp${messageID}" class="chatMessageTimestamp">${(0, _display.tConvert)(new Date(messageItem.timestamp).toTimeString().split(' ')[0])}</span></div>${innerMessageContent}${containerEnd}${bonusContent.attachments}${bonusContent.links}${bonusContent.YouTube}`;

    if ($(`#${targetDirectory}${uID}`).children().last().attr('sentBy') === messageItem.uid && $(`#${targetDirectory}${uID}`).children().last().attr('availableToBeAddedTo') && availableToAdd) {
      $(`#${targetDirectory}${uID}`).children().last().children().last().append(innerMessageContent);
    } else {
      $(`#${targetDirectory}${uID}`).get(0).appendChild(a);
      window.setTimeout(async () => {
        if ($(`#profilePhotoOfMessageID${messageID}`).length) {
          $(`#profilePhotoOfMessageID${messageID}`).get(0).src = await (0, _display.returnProperURL)(messageItem.uid);
          (0, _display.displayImageAnimation)(`profilePhotoOfMessageID${messageID}`);
        }

        if (messageItem.attachments) {
          for (let i = 0; i < messageItem.attachments.length; i++) {
            if ($(`#${messageID}NoAttachment${i}`).length) {
              $(`#${messageID}NoAttachment${i}`).get(0).setAttribute(`onclick`, `window.open('${messageItem.attachments[i]}')`);
            } else {
              const src = await (0, _display.returnProperAttachmentURL)(messageItem.attachments[i]);
              $(`#${messageID}Attachment${i}`).get(0).setAttribute(`src`, src);
              $(`#${messageID}Attachment${i}`).get(0).setAttribute(`fullSrc`, messageItem.attachments[i].replaceAll(`attachmentsPreview`, `attachments`).replaceAll(`-resized`, ''));

              if (src.includes(`https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/app%2FmissingFile.png?alt=media`)) {
                $(`#${messageID}Attachment${i}`).get(0).setAttribute(`poster`, src);
              } else {
                console.log('plyring');
                friendPlayers[messageID] = new Plyr(`#${messageID}Attachment${i}`, {
                  controls: ['play', 'progress', 'current-time', 'mute', 'fullscreen']
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
                (0, _display.returnProperLinkThumbnail)(link, i, messageID);
              }
            }
          }
        }, 49);
      }, 49);
    }

    if ($(`#deleteButton${messageID}`).length) {
      tippy(`#deleteButton${messageID}`, {
        content: 'Delete Message',
        placement: 'top'
      });
    }

    tippy(`#DMEditedMessageIconOfID${messageID}`, {
      content: `Edited ${messageItem.edited ? timeago.format(new Date(messageItem.editedDate)) : 'not'}`,
      placement: 'top'
    });

    if (messageItem.edited) {
      $(`#DMEditedMessageOfID${messageID}`).removeClass('hidden');
    }

    if (targetDirectory == 'DMMessages') {
      (0, _display.scrollBottomMessagesDM)(uID);
    }

    ;
    resolve(true);
  });
}

window.deleteDMLoneImage = (uID, messageID) => {
  deleteDMMessage(uID, messageID);
};

async function unreadIndicatorsDM() {
  return new Promise(async (resolve, reject) => {
    (0, _firestore.onSnapshot)((0, _firestore.doc)(db, `DMUnread/${user.uid}`), doc => {
      if ((0, _settings.retrieveSetting)('hideReadReciepts', false) !== doc.data().hideRead) {
        if (doc.data().hideRead) {
          $(`#hideReadRecieptsCheck`).get(0).checked = true;
        } else {
          $(`#hideReadRecieptsCheck`).get(0).checked = false;
        }
      }

      const change = diff(DMunreadIndicatorsData, doc.data());
      DMunreadIndicatorsData = doc.data();

      if (!DMListenerCreated) {} else {
        for (let [key, value] of Object.entries(change)) {
          if (value === null) {
            return;
          } else {
            try {
              if (DMServerData[key]) {
                // There are no messages. Ignore
                if (new Date(DMServerData[key].latest) > new Date(value)) {
                  addDMIndicator(key);
                } else {
                  removeDMIndicator(key);
                }

                ;
              }
            } catch (error) {
              addDMIndicator(key);
            }
          }
        }
      }
    });
    resolve(true);
  });
}

async function createDMListener() {
  (0, _database.onValue)((0, _database.query)((0, _database.ref)(rtdb, `directUnread/${user.uid}`)), snapshot => {
    if (!snapshot.val()) {
      sortFriendsList(); // Show no friends.

      return;
    } // Find the most latest message on the snapshot and display it as a notification!


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

    if (latest.getTime() > onLoadTime && latestVal.username !== cacheUser.username && currentChannel !== latestKey) {
      (0, _display.displaySystemNotification)(latestVal.username, (0, _display.securityConfirmText)(latestVal.latestContent), () => {
        if (currentChannel !== latestKey) {
          switchAndOpenFriendsDM(latestKey, latestVal.username);
        }
      }, latestKey, latestVal.username);
    }

    for (const [key, value] of Object.entries(snapshot.val())) {
      DMServerData[key] = value;
      $(`#${key}prevMSGDate`).html(timeago.format(new Date(value.latest)));

      if (value.latestContent) {
        let textToPost = (0, _display.securityConfirmText)(value.latestContent);

        if (textToPost.includes('inv:')) {
          textToPost = '(Group Invitation)';
        }

        if (textToPost.includes('track:')) {
          textToPost = '(Track)';
        }

        $(`#${key}MSGPreview`).html(messageify(textToPost));

        if ($(`#${key}MSGPreview`).length) {
          twemoji.parse($(`#${key}MSGPreview`).get(0));
        }
      }

      $(`#${key}FriendItem`).attr('lastMessage', value.latest); // Compare

      const serverTime = new Date(value.latest);
      let localTime = new Date(0);

      if (DMunreadIndicatorsData[key]) {
        try {
          localTime = DMunreadIndicatorsData[`${key}`].toDate();
        } catch (error) {
          localTime = new Date(0);
        }
      }

      if (isNaN(localTime.getTime())) {
        localTime = new Date(0);
      }

      if (serverTime > localTime) {
        addDMIndicator(key);
      } else {
        removeDMIndicator(key);
      }
    }

    sortFriendsList();
    checkTotalUnread();
  });
}

async function markDMRead(userID) {
  let query = false;

  if (DMunreadIndicatorsData[userID] === null) {
    return;
  }

  try {
    query = new Date(DMServerData[userID].latest) > DMunreadIndicatorsData[userID].toDate();
  } catch (error) {
    query = true;
  }

  if (query) {
    await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `DMUnread/${user.uid}`), {
      [`${userID}`]: (0, _firestore.serverTimestamp)()
    });
    DMunreadIndicators[userID] = false;
    console.log('Marked DM as read.');
  }
}

async function markDMUnread(userID) {
  if (activeDM === userID) {
    activeDM = '';
    currentChannel = '';
    $('.friendViewContentView').addClass('hidden');
    $('.friendsListItemActive').removeClass('friendsListItemActive');
  }

  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `DMUnread/${user.uid}`), {
    [`${userID}`]: 0
  });
}

async function addDMIndicator(uID) {
  if ((0, _electron.returnIsElectron)()) {
    if (document.hasFocus()) {
      if (currentServer === 'friends' && currentChannel === uID) {
        // All boxes checked for electron
        markDMRead(uID);
        return;
      }
    } else {
      if (currentServer === 'friends' && currentChannel === uID) {
        // Can't detect window focus outside of desktop app. All other boxes checked though.
        markAsReadAfterFocus.type = 'dm';
        markAsReadAfterFocus.id = uID;
      }
    }
  } else {
    if (currentServer === 'friends' && currentChannel === uID) {
      // All boxes checked for browser
      markDMRead(uID);
      return;
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
  } else {
    // Unread indicator
    $('#FRIENDSserverNotification').removeClass('hidden');
    $('#FRIENDSserverNotification').removeClass('zoomOut');
    $('#FRIENDSserverNotification').addClass('zoomIn');
  }

  window.setTimeout(() => {
    sendToElectron('notificationBadges', $('.serverNotification:not(.hidden,.zoomOut,.invisible,.invisibleOpacity)').length);
  }, 199);
}

function prepareRemoveFriend(uID, notify) {
  (0, _display.openModal)('deleteFriend');

  $(`#friendConfirmDelete`).get(0).onclick = () => {
    removeFriend(uID, notify);
  };
}

;

window.removeFriend = (uID, notify) => {
  return new Promise(async (resolve, reject) => {
    (0, _display.closeModal)();
    $(`#${uID}FriendItem`).addClass('friendGone');

    if (notify) {
      notifyTiny('Removing friend...', true);
    }

    const removeFriend = (0, _functions.httpsCallable)(functions, "removeFriend");
    const result = await removeFriend({
      target: uID
    });

    if (result.data.data === false) {
      snac('Error', 'Contact support or try again.', 'danger');
      resolve(false);
      return;
    }

    if (notify) {
      snac(`Friend Removed`, '', 'success');
    }

    resolve(true);
  });
};

function toggleFriendsSort() {
  if (activeFriendsSort === 'date') {
    $('#friendSortButton').html('<i class="bx bx-sort"></i><i class="bx bx-sort-a-z"></i>');
    activeFriendsSort = 'alphabetically';
  } else if (activeFriendsSort === 'alphabetically') {
    $('#friendSortButton').html('<i class="bx bx-sort"></i><i class="bx bx-time"></i>');
    activeFriendsSort = 'date';
  }

  sortFriendsList();
}

function sortFriendsList() {
  const container = $('#friendsListfriendsContent');
  container.removeClass('hidden');

  if (activeFriendsSort === 'date') {
    container.find('.activeFriendCard').sort(function (a, b) {
      return +b.getAttribute('lastMessage') - +a.getAttribute('lastMessage');
    }).appendTo(container);
    return;
  }

  if (activeFriendsSort === 'alphabetically') {
    container.find('.activeFriendCard').sort((a, b) => {
      if (a.getAttribute('username') < b.getAttribute('username')) {
        return -1;
      }

      if (a.getAttribute('username') > b.getAttribute('username')) {
        return 1;
      }
    }).appendTo(container);
    return;
  }
}

async function deleteDMMessage(userID, messageID) {
  await (0, _database.remove)((0, _database.ref)(rtdb, `direct/${(0, _display.dmKEYify)(userID, user.uid)}/messages/${messageID}`));
  await (0, _database.update)((0, _database.ref)(rtdb, `directUnread/${userID}/${user.uid}`), {
    latestContent: `${cacheUser.username} deleted a message.`,
    username: `${cacheUser.username}`
  });
  await (0, _database.update)((0, _database.ref)(rtdb, `directUnread/${user.uid}/${userID}`), {
    latestContent: `You deleted a message.`,
    username: `${cacheUser.username}`
  });
  console.log('Message deleted. ');
}

window.startCallDM = uID => {
  if (!$(`#${uID}MostlyVoiceViewContent`).hasClass('hidden')) {
    // Already shown.
    endCallDM(uID);
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
};

async function endCallDM(uID) {
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

window.addDMAttachment = uID => {
  $("#standardImageInput").off();
  $("#standardImageInput").val('');
  $("#standardImageInput").change(async () => {
    processDMAttachments(uID);
  });
  $('#standardImageInput').get(0).click();
};

async function processDMAttachments(uID, files) {
  let filesList = files;

  if (!$(`#${uID}DMAttachmentManagerContent`).length) {
    return;
  }

  if (!files) {
    filesList = document.getElementById("standardImageInput").files;
  } // Redone processor.  


  for (let i = 0; i < filesList.length; i++) {
    if ((0, _stripe.checkValidSubscription)(cacheUser.subscription)) {
      if (filesList[i].size > 32 * 1000000) {
        snac(`File Size Limit`, `Your file, ${filesList[i].name}, is too large. There is a 32MB limit per file.`, 'danger');
        continue;
      }
    } else {
      if (filesList[i].size > 10 * 1000000) {
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
      if ((0, _stripe.checkValidSubscription)(cacheUser.subscription)) {
        snac('Storage Limit', `You may only upload 9GB of files. Manage your uploads in "Settings > General > Storage".`);
      } else {
        snac('Storage Limit', `You may only upload 3GB of files. Manage your uploads in "Settings > General > Storage". Upgrade to Parallel Infinite to increase this limit to 9GB.`);
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
    const uploadTask = (0, _storage.uploadBytesResumable)((0, _storage.ref)(storage, `attachments/${(0, _display.dmKEYify)(user.uid, uID)}/${user.uid}/${timeOrID}.${file.name.split(".").pop()}`), file);
    uploadTask.on('state_changed', snapshot => {
      const progress = snapshot.bytesTransferred / snapshot.totalBytes * 100;
      $('#uploadProgressNumber').html(`Upload Progress: ${progress.toFixed(0)}%`);
    });

    if (['jpg', 'jpeg', 'png'].includes(file.name.split('.').pop().toLowerCase())) {
      uploadTask.then(() => {
        // Resolve with the resized path.
        resolve(`https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/attachmentsPreview%2F${(0, _display.dmKEYify)(user.uid, uID)}%2F${user.uid}%2F${timeOrID}-resized.${file.name.split(".").pop()}?alt=media`);
      });
    } else {
      uploadTask.then(() => {
        resolve(`https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/attachments%2F${(0, _display.dmKEYify)(user.uid, uID)}%2F${user.uid}%2F${timeOrID}.${file.name.split(".").pop()}?alt=media`);
      });
    }
  });
}

function updateCaptionPreview(uID) {
  $(`.PLYRON${uID}`).each((index, element) => {
    pendingPlayers[uID + index].destroy();
  });
  $(`#${uID}DMAttachmentManagerContent`).empty();

  for (let i = 0; i < DMPendingAttachments[uID].length; i++) {
    const file = DMPendingAttachments[uID][i];
    const url = URL.createObjectURL(file);
    const a = document.createElement('div');
    a.setAttribute('class', 'DMPendingAttachmentImage');
    let attachmentItem = '';

    if (file.name.toLowerCase().endsWith(`.png`) || file.name.toLowerCase().endsWith(`.jpg`) || file.name.toLowerCase().endsWith(`.gif`) || file.name.toLowerCase().endsWith(`.jpeg`)) {
      attachmentItem = `<img src="${url}" class="PendingAttachmentFile"> </img>`;
    } else if (file.name.toLowerCase().endsWith(`.mp4`) || file.name.toLowerCase().endsWith(`.webm`) || file.name.toLowerCase().endsWith(`.mov`)) {
      attachmentItem = `<video src="${url}" class="PendingAttachmentFile PendingAttachmentVideo${uID}"> </video>`;
    } else {
      attachmentItem = `<div onclick="window.open('${url}')" class="PendingAttachmentFile NoMediaAttachment"><i class="bx bx-file"></i></div>`;
    }

    a.innerHTML = `${attachmentItem}<button onclick="removeAttachmentFromList('${uID}', '${i}')" class="btn attachmentRemoveButton"><i class='bx bx-x'></i></button>`;
    $(`#${uID}DMAttachmentManagerContent`).get(0).appendChild(a);
  }

  $(`.PendingAttachmentVideo${uID}`).each((index, element) => {
    if (!$(element).hasClass(`PLYRON${uID}`)) {
      $(element).addClass(`PLYRON${uID}`);
      pendingPlayers[uID + index] = new Plyr(element, {
        controls: ['play', 'progress', 'mute', 'fullscreen']
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
};

$('#searchFriends').on('input', () => {
  const textValue = $('#searchFriends').val();

  if (textValue !== '' && textValue && textValue !== ' ') {
    $('#friendsListfriendsContent').children('.friendCardList ').each((index, obj) => {
      if ($(obj).get(0).getAttribute('username').toLowerCase().includes(textValue.toLowerCase())) {
        $(obj).removeClass('hidden');
      } else {
        $(obj).addClass('hidden');
      }
    });
    makeSearchActive();
  } else {
    $('#friendsListfriendsContent').children('.friendCardList ').each((index, obj) => {
      $(obj).removeClass('hidden');
    });
    makeSearchInactive();
  }
});

function makeSearchActive() {
  $('#friendsListfriendsContent').addClass('friendsListfriendsContentActive');
  $('#friendsSearchItem').removeClass('hidden');
  $('#friendsSearchItem').removeClass('fadeOutDown');
  $('#friendsSearchItem').addClass('fadeInUp');

  try {
    window.clearTimeout(searchHiddenTimeout);
  } catch (error) {}

  searchHiddenTimeout = window.setTimeout(() => {
    $('#friendsSearchItem').removeClass('hidden');
  }, 450);
}

function makeSearchInactive() {
  $('#friendsListfriendsContent').removeClass('friendsListfriendsContentActive');
  $('#friendsSearchItem').removeClass('fadeInUp');
  $('#friendsSearchItem').addClass('fadeOutDown');

  try {
    window.clearTimeout(searchHiddenTimeout);
  } catch (error) {}

  searchHiddenTimeout = window.setTimeout(() => {
    $('#friendsSearchItem').addClass('hidden');
  }, 450);
}

function cancelFriendsSearch() {
  $('#searchFriends').val('');
  $('#searchFriendsLabel').removeClass('active');
  makeSearchInactive();
  $('#friendsListfriendsContent').children('.friendCardList ').each((index, obj) => {
    $(obj).removeClass('hidden');
  });
}

function prepareDMEditMessage(UID, messageID) {
  // Delete old element, create new one. Do this to remove listenrs
  $(`#DMMessageContentOfID${messageID}`).get(0).parentNode.replaceChild($(`#DMMessageContentOfID${messageID}`).get(0).cloneNode(true), $(`#DMMessageContentOfID${messageID}`).get(0));
  DMCachedEditMessages[messageID] = (0, _display.messageHTMLtoText)(null, $(`#DMMessageContentOfID${messageID}`).get(0));
  $(`#DMMessageContentOfID${messageID}`).html((0, _display.messageHTMLtoText)(null, $(`#DMMessageContentOfID${messageID}`).get(0)));
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
  }, 9); // Set listeners

  $(`#DMMessageContentOfID${messageID}`).get(0).addEventListener("keyup", async event => {
    if (event.code == "Enter") {
      event.preventDefault();
      const content = $(`#DMMessageContentOfID${messageID}`).get(0).innerHTML;

      if (DMCachedEditMessages[messageID] == content) {
        unEditDMMessage(messageID, UID);
        return;
      } // Make firebase request


      await (0, _database.update)((0, _database.ref)(rtdb, `direct/${(0, _display.dmKEYify)(user.uid, UID)}/messages/${messageID}`), {
        content: content,
        editedDate: (0, _database.serverTimestamp)(),
        edited: true
      });
      await (0, _database.update)((0, _database.ref)(rtdb, `directUnread/${UID}/${user.uid}`), {
        latestContent: `${cacheUser.username} edited a message.`,
        username: `${cacheUser.username}`
      });
      await (0, _database.update)((0, _database.ref)(rtdb, `directUnread/${user.uid}/${UID}`), {
        latestContent: `You edited a message.`,
        username: `${cacheUser.username}`
      });
      DMCachedEditMessages[messageID] = content;
      unEditDMMessage(messageID, UID);
      console.log('Edited message.');
    } else if (event.code == 'Escape') {
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
  twemoji.parse($(`#DMMessageContentOfID${messageID}`).get(0));
  $(`#${uID}ChatMessageInput`).get(0).focus();
}
},{"./display":"js/display.js","./presence":"js/presence.js","./stripe":"js/stripe.js","./voice":"js/voice.js","./users":"js/users.js","./electron":"js/electron.js","./settings":"js/settings.js","./sounds":"js/sounds.js","./servers":"js/servers.js","./firebaseChecks":"js/firebaseChecks.js"}],"js/settings.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.expandTab = expandTab;
exports.loadDefaultValues = loadDefaultValues;
exports.refreshInputDevices = refreshInputDevices;
exports.refreshOutputDevices = refreshOutputDevices;
exports.retrieveSetting = retrieveSetting;
exports.returnActiveDeviceID = returnActiveDeviceID;
exports.returnActiveDeviceIDOutput = returnActiveDeviceIDOutput;
exports.settingsTab = settingsTab;

var _app = require("./app");

var _display = require("./display");

var _friends = require("./friends");

var _stripe = require("./stripe");

var _voice = require("./voice");

window.defaultVolume = 1;
window.storageListenerCreated = false;
window.devicesLoaded = false;

function expandTab(tabGroup) {
  $('.accountSidebarButtonActive').removeClass('accountSidebarButtonActive');

  if ($(`#tapGroup_${tabGroup}`).hasClass('tabGroupActive')) {
    // Unexpand
    $(`#tapGroup_${tabGroup}`).removeClass('tabGroupActive');
    $(`#tapGroup_${tabGroup}`).css('height', '');
    return;
  }

  $(`#settingsTabButton_${tabGroup}`).addClass('accountSidebarButtonActive'); // Expand

  $('.tabGroupActive').css('height', '');
  $('.tabGroupActive').removeClass('tabGroupActive');
  $(`#tapGroup_${tabGroup}`).addClass('tabGroupActive');
  $(`#tapGroup_${tabGroup}`).css('height', 'auto');
  const defaultHeight = $(`#tapGroup_${tabGroup}`).height();
  $(`#tapGroup_${tabGroup}`).css('height', '0px');
  $(`#tapGroup_${tabGroup}`).css('height', `${defaultHeight}px`);
}

function settingsTab(tab) {
  $('.accountTab').addClass('hidden');
  $(`#musicTab_${tab}`).removeClass('hidden');
  $(`.accountSidebarButtonInGroupActive`).removeClass('accountSidebarButtonInGroupActive');
  $(`#settingsTabButton_${tab}`).addClass('accountSidebarButtonInGroupActive');

  if (tab == 'storage') {
    if (!storageListenerCreated) {
      storageListenerCreated = true;
      (0, _app.storageListener)();
    }
  } else if (tab == 'playbackOutput') {
    loadDevices();
  }
}

function setDefaultVolume(value) {
  libraryPlayer.volume = value / 100; // Set all server volumes.

  $(`.channelMusicAudio`).each((index, object) => {
    object.volume = value / 100;
  }); // Set all videos.

  const keys = Object.keys(channelPendingPlayers);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const element = channelPendingPlayers[key];
    element.volume = value / 100;
  }

  const keys2 = Object.keys(channelPlayers);

  for (let i = 0; i < keys2.length; i++) {
    const key = keys2[i];
    const element = channelPlayers[key];
    element.volume = value / 100;
  }

  const keys3 = Object.keys(pendingPlayers);

  for (let i = 0; i < keys3.length; i++) {
    const key = keys3[i];
    const element = pendingPlayers[key];
    element.volume = value / 100;
  }

  const keys4 = Object.keys(friendPlayers);

  for (let i = 0; i < keys4.length; i++) {
    const key = keys4[i];
    const element = friendPlayers[key];
    element.volume = value / 100;
  }

  defaultVolume = value / 100;
}

function setSlowedTracks(slowed) {
  if (slowed) {
    libraryPlayer.speed = 0.9;
  } else {
    libraryPlayer.speed = 1;
  }
}

function loadDefaultValues() {
  setDefaultVolume(parseInt(retrieveSetting('defaultVolume', '100')));
  setSlowedTracks(parseInt(retrieveSetting('slowedTracks', false)));
  setRedNotifications(retrieveSetting('redNotifications', false));
  const defaultValues = [{
    key: 'responsiveVoiceActivity',
    defaultSetting: false
  }, {
    key: 'desktopNotifications',
    defaultSetting: true
  }, {
    key: 'inAppNotifications',
    defaultSetting: true
  }, {
    key: 'notificationSound',
    defaultSetting: true
  }, {
    key: 'messageSendSound',
    defaultSetting: true
  }, {
    key: 'inactivityTimeout',
    defaultSetting: true
  }, {
    key: 'hideReadReciepts',
    defaultSetting: false
  }, {
    key: 'noiseSurpression',
    defaultSetting: true
  }, {
    key: 'echoCancellation',
    defaultSetting: true
  }, {
    key: 'redNotifications',
    defaultSetting: false
  }, {
    key: 'ringtoneSound',
    defaultSetting: true
  }, {
    key: 'slowedTracks',
    defaultSetting: false
  }, {
    key: 'streamAudio',
    defaultSetting: true
  }, {
    key: 'discordSongs',
    defaultSetting: true
  }, {
    key: 'deafenSound',
    defaultSetting: true
  }, {
    key: 'shareSongs',
    defaultSetting: true
  }, {
    key: 'muteSound',
    defaultSetting: true
  }, {
    key: 'defaultVolume',
    defaultSetting: '30'
  }];

  for (let i = 0; i < defaultValues.length; i++) {
    const key = defaultValues[i].key;
    const defaultSetting = defaultValues[i].defaultSetting;
    const setting = retrieveSetting(key, defaultSetting);

    if (typeof setting == 'string') {
      $(`#${key}Check`).get(0).value = setting;
    } else {
      $(`#${key}Check`).get(0).checked = setting;
    }
  }
}

window.updateSetting = (key, type) => {
  let setting = null;

  if (type == 'number') {
    if (key == 'defaultVolume') {
      // ! to 100
      if (parseInt($(`#${key}Check`).val()) < 0) $(`#${key}Check`).val('0');
      if (parseInt($(`#${key}Check`).val()) > 100) $(`#${key}Check`).val('100');
      setDefaultVolume(parseInt($(`#${key}Check`).val()));
    }

    setting = $(`#${key}Check`).get(0).value;
  } else {
    setting = $(`#${key}Check`).get(0).checked;
  }

  localStorage.setItem(key, setting); // Functions to set the value.

  switch (key) {
    case 'slowedTracks':
      setSlowedTracks(setting);

      if (!(0, _stripe.checkValidSubscription)(cacheUser.subscription)) {
        snac('Infinite Feature', "This feature is only available to Parallel Infinite users.");
        window.setTimeout(() => {
          $(`#${key}Check`).get(0).checked = false;
        }, 500);
        localStorage.setItem(key, false);
        setSlowedTracks(false);
      }

      break;

    case `inactivityTimeout`:
      if (!(0, _stripe.checkValidSubscription)(cacheUser.subscription)) {
        snac('Infinite Feature', "This feature is only available to Parallel Infinite users.");
        window.setTimeout(() => {
          $(`#${key}Check`).get(0).checked = true;
        }, 500);
        localStorage.setItem(key, true);
      }

      break;

    case 'desktopNotifications':
      switch (Notification.permission) {
        case 'denied':
          snac('No permission', 'Sorry! We do not have permission to send you desktop notifications', 'danger');
          window.setTimeout(() => {
            $(`#${key}Check`).get(0).checked = false;
          }, 500);
          localStorage.setItem(key, false);
          break;

        case 'default':
          Notification.requestPermission().then(function (permission) {
            if (permission == 'denied' || permission == 'default') {
              snac('No permission', 'Sorry! We do not have permission to send you desktop notifications', 'danger');
              window.setTimeout(() => {
                $(`#${key}Check`).get(0).checked = false;
              }, 500);
              localStorage.setItem(key, false);
            }
          });
          break;

        default:
          break;
      }

      break;

    case 'hideReadReciepts':
      (0, _friends.setReadReciepts)(retrieveSetting('hideReadReciepts', false));
      break;

    case 'redNotifications':
      setRedNotifications(retrieveSetting('redNotifications', false));
      break;

    default:
      break;
  }
};

function setRedNotifications(setting) {
  if (setting) {
    $(`#redNotificationStyles`).html(`
    .serverNotification {
      background-color: red !important;
    }

    .channelNotify {
      background-color: red !important;
    }

    .unReadItem {
      border-left: 5px solid red !important;
    }
  
  `);
  } else {
    $(`#redNotificationStyles`).html('');
  }
}

function retrieveSetting(key, defaultValue) {
  if (localStorage.getItem(key) == 'true') {
    return true;
  } else if (localStorage.getItem(key) == 'false') {
    return false;
  } else if (localStorage.getItem(key)) {
    // Custom value
    return localStorage.getItem(key);
  } else {
    return defaultValue;
  }
}

async function loadDevices(skipInputs, skipOutputs, skipLoadCheck) {
  if (devicesLoaded && !skipLoadCheck) {
    return;
  }

  ;
  devicesLoaded = true;
  let devices;

  try {
    devices = await navigator.mediaDevices.enumerateDevices();
  } catch (error) {
    snac('No Permission', 'Unable to access media devices.', 'danger');
  }

  let usedDevices = [];
  console.log(devices);

  for (let i = 0; i < devices.length; i++) {
    const device = devices[i];

    if (usedDevices.includes(`${device.kind}${device.label.replace(`Default - `, ``)}`)) {
      continue;
    }

    usedDevices.push(`${device.kind}${device.label.replace(`Default - `, ``)}`);

    if (device.kind == 'audioinput' && !skipInputs) {
      $(`#audioInputsContainer`).removeClass('hidden');
      const a = document.createElement('div');
      a.classList.add('audioDeviceElement');
      a.innerHTML = `<div><i class="bx bx-microphone"></i> <span>${device.label}</span></div><button id="${device.deviceId}UseInputButton" class="btn b-1 inactiveInputDevice">Use</button>`;
      $(`#audioInputsContainerContainer`).get(0).appendChild(a);

      $(`#${device.deviceId}UseInputButton`).get(0).onclick = () => {
        localStorage.setItem('inputDeviceID', device.deviceId);
        updateMediaStreamSourceDevice();
        $(`.activeInputDevice`).html('Use');
        $(`.activeInputDevice`).removeClass('disabled');
        $(`.activeInputDevice`).removeClass('activeInputDevice');
        $(`#${device.deviceId}UseInputButton`).html('Active');
        $(`#${device.deviceId}UseInputButton`).addClass('disabled');
        $(`#${device.deviceId}UseInputButton`).addClass('activeInputDevice');
      };
    }

    if (device.kind == 'audiooutput' && !skipOutputs) {
      $(`#audioOutputsContainer`).removeClass('hidden');
      const a = document.createElement('div');
      a.classList.add('audioDeviceElement');
      a.innerHTML = `<div><i class="bx bx-speaker"></i> <span>${device.label}</span></div><button id="${device.deviceId}UseOutputButton" class="btn b-1 inactiveInputDevice">Use</button>`;
      $(`#audioOutputsContainerContainer`).get(0).appendChild(a);

      $(`#${device.deviceId}UseOutputButton`).get(0).onclick = () => {
        localStorage.setItem('outputDeviceID', device.deviceId);
        updateMediaStreamSourceDeviceOutput();
        $(`.activeOutputDevice`).html('Use');
        $(`.activeOutputDevice`).removeClass('disabled');
        $(`.activeOutputDevice`).removeClass('activeOutputDevice');
        $(`#${device.deviceId}UseOutputButton`).html('Active');
        $(`#${device.deviceId}UseOutputButton`).addClass('disabled');
        $(`#${device.deviceId}UseOutputButton`).addClass('activeOutputDevice');
      };
    }
  }

  $(`#${returnActiveDeviceID()}UseInputButton`).html('Active');
  $(`#${returnActiveDeviceID()}UseInputButton`).addClass('disabled');
  $(`#${returnActiveDeviceID()}UseInputButton `).addClass('activeInputDevice');
  $(`#${returnActiveDeviceIDOutput()}UseOutputButton`).html('Active');
  $(`#${returnActiveDeviceIDOutput()}UseOutputButton`).addClass('disabled');
  $(`#${returnActiveDeviceIDOutput()}UseOutputButton`).addClass('activeOutputDevice');
}

function returnActiveDeviceID() {
  const stored = localStorage.getItem('inputDeviceID');

  if (!stored || stored == 'null') {
    return "default";
  }

  return stored;
}

function returnActiveDeviceIDOutput() {
  const stored = localStorage.getItem('outputDeviceID');

  if (!stored || stored == 'null') {
    return "default";
  }

  return stored;
}

async function updateMediaStreamSourceDevice() {
  if (mediaStream) {
    (0, _display.openModal)(`mediaStreamUpdate`);

    $(`#confirmMediaStreamButton`).get(0).onclick = () => {
      (0, _voice.endAllCalls)();
      (0, _display.closeModal)();
    };
  } else {}
}

updateMediaStreamSourceDeviceOutput();

function updateMediaStreamSourceDeviceOutput() {
  try {
    $('audio').each(async (index, object) => {
      await $(object).get(0).setSinkId(returnActiveDeviceIDOutput());
    });
  } catch (error) {
    snac('No permission', 'Unable to connect to the selected audio device.', 'danger');
  }
}

function refreshInputDevices() {
  (0, _display.disableButton)($(`#inputDevicesRefreshButton`));
  $(`#audioInputsContainerContainer`).empty();
  window.setTimeout(() => {
    loadDevices(false, true, true);
    (0, _display.enableButton)($(`#inputDevicesRefreshButton`), '<i class="bx bx-refresh"></i>');
  }, 499);
}

function refreshOutputDevices() {
  (0, _display.disableButton)($(`#outputDevicesRefreshButton`));
  $(`#audioOutputsContainerContainer`).empty();
  window.setTimeout(() => {
    loadDevices(true, false, true);
    (0, _display.enableButton)($(`#outputDevicesRefreshButton`), '<i class="bx bx-refresh"></i>');
  }, 499);
}
},{"./app":"js/app.js","./display":"js/display.js","./friends":"js/friends.js","./stripe":"js/stripe.js","./voice":"js/voice.js"}],"js/voice.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.endAllCalls = endAllCalls;
exports.hideMediaViewDM = hideMediaViewDM;
exports.hideScreenShareWindow = hideScreenShareWindow;
exports.joinScreenDM = joinScreenDM;
exports.joinVideoDM = joinVideoDM;
exports.leaveVideoDM = leaveVideoDM;
exports.listenCalls = listenCalls;
exports.manageVCFriendsDisplay = manageVCFriendsDisplay;
exports.manageVoiceChatDisplay = manageVoiceChatDisplay;
exports.shareScreenDM = shareScreenDM;
exports.shareVideoDM = shareVideoDM;

var _firestore = require("@firebase/firestore");

var _database = require("@firebase/database");

var _display = require("./display");

var _vcMusic = require("./vcMusic");

var _settings = require("./settings");

var _friends = require("./friends");

var _electron = require("./electron");

var _sounds = require("./sounds");

var _firebaseChecks = require("./firebaseChecks");

(0, _firebaseChecks.checkAppInitialized)();
const db = (0, _firestore.getFirestore)();
const rtdb = (0, _database.getDatabase)();
const callDurationConstant = 18; // seconds

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
myPeer.on('open', ID => {
  myPeerID = ID;
});
myPeerVideo.on('open', ID => {
  myPeerVideoID = ID;
});

async function listenCalls() {
  (0, _firestore.onSnapshot)((0, _firestore.doc)(db, `calls/${user.uid}`), async snapshot => {
    if (!snapshot.exists()) {
      return;
    } // My incoming calls.


    const keys = Object.keys(snapshot.data());

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = snapshot.data()[key];
      const uID = key.split('.')[0];
      const username = key.split('.')[1];

      if (value == 'Rejected' || value == 'Accepted' || value == 'Missed' || value == 'Cancelled') {
        // Hide the incoming call.
        window.clearTimeout(incomingCallTimeouts[uID]);
        $(`#incomingCall${uID}`).addClass('incomingCallGone');
        $(`#incomingCall${uID}`).removeClass('fadeInRight');
        $(`#incomingCall${uID}`).addClass('fadeOutRight');
        window.setTimeout(() => {
          $(`#incomingCall${uID}`).remove();
          (0, _sounds.playRingtone)(); // See if it should be stopped.
        }, 599);
        continue;
      }

      if (value.toDate() > new Date(new Date().getTime() - callDurationConstant * 1000)) {
        // May run multiple times. Show the incoming call
        if ($(`#incomingCall${uID}`).length) {
          continue;
        }

        const a = document.createElement('div');
        a.setAttribute('class', 'incomingCall animated fadeInRight faster');
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
        `;
        $(`#incomingCallContainer`).get(0).appendChild(a);
        $(`#incomingCallContentImage${uID}`).get(0).src = await (0, _display.returnProperURL)(uID);
        (0, _display.displayImageAnimation)(`incomingCallContentImage${uID}`);

        $(`#acceptIncomingCallButton${uID}`).get(0).onclick = () => {
          acceptIncomingCall(uID, key);
        };

        $(`#rejectIncomingCallButton${uID}`).get(0).onclick = () => {
          rejectIncomingCall(uID, key);
        };

        $(`#noActionCallButton${uID}`).get(0).onclick = () => {
          noActionCall(uID, key);
        };

        (0, _sounds.playRingtone)(); // Start ringtone if it hasnt already.
        // If it doesn't get removed automatically.

        window.clearTimeout(incomingCallTimeouts[uID]);
        incomingCallTimeouts[uID] = window.setTimeout(() => {
          $(`#incomingCall${uID}`).addClass('incomingCallGone');
          $(`#incomingCall${uID}`).removeClass('fadeInRight');
          $(`#incomingCall${uID}`).addClass('fadeOutRight');
          window.setTimeout(() => {
            $(`#incomingCall${uID}`).remove();
            (0, _sounds.playRingtone)(); // See if it should be stopped.
          }, 599);
        }, callDurationConstant * 1000);
      }
    }
  });
}

window.callUser = async (uID, username) => {
  $(`#callUserButton${uID}`).addClass('disabled');
  (0, _friends.endCallDM)(uID); // For display purposes.

  window.setTimeout(() => {
    $(`#callUserButton${uID}`).removeClass('disabled');
  }, 3499);

  if (currentCall == (0, _display.dmKEYify)(user.uid, uID)) {
    if (localStorage.getItem('helperNotifyThree') !== 'true') {
      localStorage.setItem('helperNotifyThree', 'true');
      notifyTiny('You are already in this call.');
    }

    return;
  }

  await endAllCalls();

  if (friendActiveCallLibrary[uID] && friendActiveCallLibrary[uID][uID] && friendActiveCallLibrary[uID][uID].connected) {
    acceptIncomingCall(uID, `${uID}.${username}`);
    return;
  } // If incoming call, accept it instead of creating new one.


  if ($(`#incomingCall${uID}`).length) {
    acceptIncomingCall(uID, `${uID}.${username}`);
    return;
  }

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: (0, _settings.returnActiveDeviceID)(),
        echoCancellation: (0, _settings.retrieveSetting)('echoCancellation'),
        noiseSuppression: (0, _settings.retrieveSetting)('noiseSuppression')
      },
      video: false
    });
  } catch (error) {
    snac('No permission', 'Unable to connect to the selected audio device.', 'danger');
    return;
  }

  await (0, _firestore.setDoc)((0, _firestore.doc)(db, `calls/${uID}`), {
    [`${user.uid}.${cacheUser.username}`]: (0, _firestore.serverTimestamp)()
  }, {
    merge: true
  }); // Call request sent. Listen to their response.

  $(`#dmconnectedbolt`).get(0).setAttribute('class', 'bx bxs-planet');
  $(`#dmconnectedstatus`).html('Ringing');
  const callObserver = (0, _firestore.onSnapshot)((0, _firestore.doc)(db, `calls/${uID}`), snapshot => {
    const value = snapshot.data()[`${user.uid}.${cacheUser.username}`];

    switch (value) {
      case 'Rejected':
        callObserver();
        window.clearTimeout(callUserTimeout);
        $(`#dmconnectedbolt`).get(0).setAttribute('class', 'bx');
        $(`#dmconnectedstatus`).html('💔 Rejected');
        twemoji.parse($(`#dmconnectedstatus`).get(0));
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
    await (0, _firestore.setDoc)((0, _firestore.doc)(db, `calls/${uID}`), {
      [`${user.uid}.${cacheUser.username}`]: 'Missed'
    }, {
      merge: true
    });
  }, callDurationConstant * 1000);
  joinVoiceChannel((0, _display.dmKEYify)(user.uid, uID), () => {
    (0, _display.showDMCall)(uID, username);
  }, uID);
};

async function acceptIncomingCall(uID, docKey) {
  (0, _display.disableButton)($(`#acceptIncomingCallButton${uID}`));
  (0, _display.disableButton)($(`#rejectIncomingCallButton${uID}`));
  (0, _display.disableButton)($(`#noActionCallButton${uID}`));
  await endAllCalls();

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: (0, _settings.returnActiveDeviceID)(),
        echoCancellation: (0, _settings.retrieveSetting)('echoCancellation'),
        noiseSuppression: (0, _settings.retrieveSetting)('noiseSuppression')
      },
      video: false
    });
  } catch (error) {
    snac('No permission', 'Unable to connect to the selected audio device.', 'danger');
    return;
  }

  await (0, _firestore.setDoc)((0, _firestore.doc)(db, `calls/${user.uid}`), {
    [docKey]: 'Accepted'
  }, {
    merge: true
  });
  joinVoiceChannel((0, _display.dmKEYify)(user.uid, uID), () => {
    (0, _display.showDMCall)(uID, docKey.split('.')[1]);
    $(`#dmconnectedbolt`).get(0).setAttribute('class', 'bx bxs-bolt lightningAnimation');
    $('#dmconnectedstatus').html(`Connected`);
  }, uID);
}

async function rejectIncomingCall(uID, docKey) {
  (0, _display.disableButton)($(`#acceptIncomingCallButton${uID}`));
  (0, _display.disableButton)($(`#rejectIncomingCallButton${uID}`));
  (0, _display.disableButton)($(`#noActionCallButton${uID}`));
  await (0, _firestore.setDoc)((0, _firestore.doc)(db, `calls/${user.uid}`), {
    [docKey]: 'Rejected'
  }, {
    merge: true
  });
}

async function noActionCall(uID, docKey) {
  (0, _display.disableButton)($(`#acceptIncomingCallButton${uID}`));
  (0, _display.disableButton)($(`#rejectIncomingCallButton${uID}`));
  (0, _display.disableButton)($(`#noActionCallButton${uID}`));
  window.clearTimeout(incomingCallTimeouts[uID]);
  $(`#incomingCall${uID}`).addClass('incomingCallGone');
  $(`#incomingCall${uID}`).removeClass('fadeInRight');
  $(`#incomingCall${uID}`).addClass('fadeOutRight');
  window.setTimeout(() => {
    $(`#incomingCall${uID}`).remove();
    (0, _sounds.playRingtone)(); // See if it should be stopped.
  }, 599);
}

window.joinChannelVC = async (serverUID, serverID, channelID) => {
  // Half legacy function.
  const scopedActiveChannel = `${serverUID}${serverID}${channelID}`;
  (0, _display.disableButton)($(`#${scopedActiveChannel}voiceChatButton`));
  await endAllCalls();

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: (0, _settings.returnActiveDeviceID)(),
        echoCancellation: (0, _settings.retrieveSetting)('echoCancellation'),
        noiseSuppression: (0, _settings.retrieveSetting)('noiseSuppression')
      },
      video: false
    });
  } catch (error) {
    snac('No permission', 'Unable to connect to the selected audio device.', 'danger');
    (0, _display.enableButton)($(`#${scopedActiveChannel}voiceChatButton`), '<i class="bx bx-phone"></i>');
    return;
  }

  joinVoiceChannel(`${serverUID}${serverID}/${channelID}`, () => {
    (0, _display.enableButton)($(`#${scopedActiveChannel}voiceChatButton`), '<i class="bx bx-phone-off"></i>');
    $(`#${scopedActiveChannel}voiceChatButton`).addClass('disconnectButton');

    $(`#${scopedActiveChannel}voiceChatButton`).get(0).onclick = () => {
      endAllCalls();
    };

    (0, _display.showServerCallUI)(serverUID, serverID, channelID);

    $(`#voiceChatButtonVideo${serverUID}${serverID}`).get(0).onclick = () => {
      shareVideo(serverUID + serverID, channelID);
    };

    $(`#voiceChatButtonScreen${serverUID}${serverID}`).get(0).onclick = () => {
      shareScreen(serverUID + serverID, channelID);
    };
  });
};

async function joinVoiceChannel(key, callback, otherUser) {
  $(`#accountServer`).addClass('inCall');
  connectedUsers = [];
  connectedPeers = [];
  connectedMediaUsers = [];
  cacheMediaConnectedMembers = [];
  peerIDstoUIDs = {};
  cacheVoiceChatConnections = [];
  window.clearTimeout(inactivityTimeout);
  window.setTimeout(async () => {
    try {
      if (audioContext.state == 'running') {
        await audioContext.close();
      }
    } catch (error) {}

    ; // Close the previous audio context if available.

    setVoiceIndicators();
  }, 499);
  myPeer.on('call', function (call) {
    call.answer(mediaStream);
    connectedPeers.push(call.peer);

    if (peerIDstoUIDs[call.peer]) {
      connectedUsers.push(peerIDstoUIDs[call.peer]);
    }

    call.on('stream', async function (stream) {
      console.log('recieved stream');

      if (peerIDstoUIDs[call.peer]) {
        if ($(`.${peerIDstoUIDs[call.peer]}usersAudio`).length) {
          $(`.${peerIDstoUIDs[call.peer]}`).get(0).srcObject = stream;
          $(`.${peerIDstoUIDs[call.peer]}`).get(0).play();
          putVolumeOnStream(peerIDstoUIDs[call.peer]);
        } else {
          const a = document.createElement('audio');
          a.classList.add('usersAudio');
          a.srcObject = stream;
          a.volume = 0.5;

          try {
            await a.setSinkId((0, _settings.returnActiveDeviceIDOutput)());
          } catch (error) {
            snac('No permission', 'Unable to connect to the selected audio device.', 'danger');
          }

          a.id = peerIDstoUIDs[call.peer] + 'usersAudio';
          $(`#mediaStreamsContainer`).get(0).appendChild(a);
          a.play();
          putVolumeOnStream(peerIDstoUIDs[call.peer]);
        }
      } else {
        // Don't have the UID yet.
        const a = document.createElement('audio');
        a.classList.add('usersAudio');
        a.srcObject = stream;
        a.volume = 0.5;

        try {
          await a.setSinkId((0, _settings.returnActiveDeviceIDOutput)());
        } catch (error) {
          snac('No permission', 'Unable to connect to the selected audio device.', 'danger');
        }

        a.id = call.peer + 'usersAudio';
        $(`#mediaStreamsContainer`).get(0).appendChild(a);
        a.play();
      }
    });
  });
  currentCall = key;
  notifyTiny('Voice Chat: Connected', false);
  voiceChatConnectionsListener = (0, _database.onValue)((0, _database.query)((0, _database.ref)(rtdb, `voice/${key}`)), snapshot => {
    // Connect to each partner.
    if (snapshot.val()) {
      const keys = Object.keys(snapshot.val());

      try {
        if (otherUser) {
          // DM Call
          if (keys.length == 1) {
            // Put sound here?
            if (connectedToVideo) {
              leaveVideoDM(connectedToVideo);
            }

            connectedUsers = [];
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
              if ((0, _settings.retrieveSetting)('inactivityTimeout', true)) {
                snac('Disconnected', 'You have been disconnected due to inactivity.');
                endAllCalls();
              }
            }, 15 * 1000 * 60); // 15 minutes
          } else {
            // Connected
            window.clearTimeout(inactivityTimeout);

            if (snapshot.val()[otherUser].deafened) {
              // Deafen takes priority
              $(`#dmconnectedbolt`).get(0).setAttribute('class', 'bx bx-volume-mute redText');
              $('#dmconnectedstatus').html(`Deafened`);
            } else if (snapshot.val()[otherUser].muted) {
              $(`#dmconnectedbolt`).get(0).setAttribute('class', 'bx bx-microphone-off redText');
              $('#dmconnectedstatus').html(`Muted`);
            } else {
              $(`#dmconnectedbolt`).get(0).setAttribute('class', 'bx bxs-bolt');
              $('#dmconnectedstatus').html(`Connected`);
            }
          }
        }
      } catch (error) {} // Forwad, backward


      const connectedUsersForward = (0, _display.commonArrayDifference)(keys, cacheVoiceChatConnections);
      const connectedUsersBackward = (0, _display.commonArrayDifference)(cacheVoiceChatConnections, keys);
      cacheVoiceChatConnections = keys;

      for (let i = 0; i < connectedUsersForward.length; i++) {
        // Connected
        const key = connectedUsersForward[i];
        const value = snapshot.val()[key];

        if (key !== user.uid) {
          makeConnection(value.uid, value.peer, value.username);
        }
      }

      for (let i = 0; i < connectedUsersBackward.length; i++) {
        const key = connectedUsersForward[i];
        connectedUsers.splice(connectedUsers.indexOf(key), 1);
      }
    }
  });
  await (0, _database.set)((0, _database.ref)(rtdb, `voice/${key}/${user.uid}`), {
    connected: true,
    peer: myPeerID,
    username: cacheUser.username,
    uid: user.uid
  });
  onDisconnectRef = `voice/${key}/${user.uid}`;
  (0, _database.onDisconnect)((0, _database.ref)(rtdb, `voice/${key}/${user.uid}`)).remove();

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
    console.log('Connecting to ' + username);

    if (user.uid > uID) {
      connectedUsers.push(uID);
      connectedPeers.push(peerID);
      peerIDstoUIDs[peerID] = uID; // I am the one to make the connection and the connection
      // has not already been made to this user. Create now:

      window.setTimeout(() => {
        const call = myPeer.call(peerID, mediaStream);
        call.on('stream', async function (stream) {
          console.log('recieved stream');

          if ($(`.${uID}usersAudio`).length) {
            $(`.${uID}`).get(0).srcObject = stream;
            $(`.${uID}`).get(0).play();
            putVolumeOnStream(uID);
          } else {
            const a = document.createElement('audio');
            a.classList.add('usersAudio');
            a.srcObject = stream;
            a.volume = 0.5;

            try {
              await a.setSinkId((0, _settings.returnActiveDeviceIDOutput)());
            } catch (error) {
              snac('No permission', 'Unable to connect to the selected audio device.', 'danger');
            }

            a.id = uID + 'usersAudio';
            $(`#mediaStreamsContainer`).get(0).appendChild(a);
            a.play();
            putVolumeOnStream(peerIDstoUIDs[call.peer]);
          }
        });
      }, 999);
    } else {
      // Will be recieving connection, attach peerid to uid
      if (connectedPeers.includes(peerID)) {
        connectedUsers.push(uID);
      } else {
        peerIDstoUIDs[peerID] = uID;
      }

      console.log('a');

      if (!$(`#${uID}usersAudio`).length) {
        // Issues with registering the ID.
        console.log('a');

        if (!$(`#${peerID}usersAudio`).length) {
          // No element is built yet, other function will find the ID from vars.
          console.log('a');
        } else {
          console.log('a'); // Element is built. Replace PeerID with userID and set volume

          $(`#${peerID}usersAudio`).get(0).id = uID + 'usersAudio';
          putVolumeOnStream(uID);
        }
      } else {// Element is built already with the proper UID ID.
      }
    }
  }
}

function endAllCalls() {
  return new Promise(async (resolve, reject) => {
    console.log('Calls ending.');
    $(`#accountServer`).removeClass('inCall');

    if (currentCall) {
      console.log('Voice disconnected. Notify maybe.');
    }

    try {
      await voiceChatConnectionsListener();
    } catch (error) {}

    if (onDisconnectRef) {
      await (0, _database.onDisconnect)((0, _database.ref)(rtdb, onDisconnectRef)).cancel();
      await (0, _database.remove)((0, _database.ref)(rtdb, onDisconnectRef));
    }

    window.clearInterval(connectedMusicInterval);
    myPeer.destroy();
    (0, _display.disableDMCallUI)();

    if (mediaStream) {
      mediaStream.getTracks().forEach(function (track) {
        track.stop();
      });
    }

    if (audioContext) {
      audioContext.close();
    }

    if (videoMediaStream) {
      videoMediaStream.getTracks().forEach(function (track) {
        track.stop();
      });
    }

    if (currentCall && currentCall.includes('/')) {
      // Lounge
      (0, _display.hideServerCallUI)(currentCall.substring(0, 28), currentCall.substring(28, 48), currentCall.split('/')[1]);
      const nonModifiedServerID = currentCall.replaceAll('/', '');
      (0, _display.enableButton)($(`#${nonModifiedServerID}voiceChatButton`), '<i class="bx bx-phone"></i>');
      $(`#${nonModifiedServerID}voiceChatButton`).removeClass('disconnectButton');
      const currentCallRecord = `${currentCall}`;

      $(`#${nonModifiedServerID}voiceChatButton`).get(0).onclick = () => {
        joinChannelVC(currentCallRecord.substring(0, 28), currentCallRecord.substring(28, 48), currentCallRecord.split('/')[1]);
      };

      if (activeListeningParty) {
        // Ask to leave listening party
        (0, _display.openModal)('leavePartyCheck');

        $(`#confirmLeaveParty`).get(0).onclick = () => {
          if (activeListeningParty) {
            (0, _vcMusic.leaveListeningParty)(activeListeningParty.split('/')[0], activeListeningParty.split('/')[1], activeListeningParty.split('/')[2]);
            (0, _display.closeModal)();
          } else {
            (0, _display.closeModal)();
          }
        };
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
      }, 1599); // Turn off actively playing music.

      if (channelTabLibrary[nonModifiedServerID] == 'Music') {
        // Kick off music tab when leave call.
        modifyChannelTab(currentCall.substring(0, 28), currentCall.substring(28, 48), currentCall.split('/')[1], 'Chat');
      }
    } else {
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
      leaveVideoDM(currentCall); // Might be worth updating the call status here to cancelled.

      if (currentCall) {
        await (0, _firestore.setDoc)((0, _firestore.doc)(db, `calls/${currentCall.replace(user.uid, '')}`), {
          [`${user.uid}.${cacheUser.username}`]: "Cancelled"
        }, {
          merge: true
        }); // Call request sent. Listen to their response.
      }
    }

    currentCall = null;
    connectedMediaUsers = [];
    cacheMediaConnectedMembers = [];
    connectedUsers = [];
    connectedPeers = [];
    cacheVoiceChatConnections = [];
    peerIDstoUIDs = {};
    searchInterval = window.setInterval(() => {
      if (myPeer.destroyed) {
        window.clearInterval(searchInterval);
        myPeer = new Peer();
        myPeer.on('open', ID => {
          console.log('Peer opened.');
          myPeerID = ID;
          resolve(true);
        });
      }
    }, 99); // Run every 99ms.
  });
} // Friends VC


async function manageVCFriendsDisplay(uID, data) {
  // Recieving VC data beacuse the channel is active.
  friendActiveCallLibrary[uID] = data;

  if (data && data[uID] && data[uID].connected) {
    $(`#friendHeaderCallTag${uID}`).removeClass('hidden');
  } else {
    $(`#friendHeaderCallTag${uID}`).addClass('hidden');
  } // Screen share / video share


  if (data && data[uID] && data[uID].video) {
    $(`#friendHeaderVideo${uID}`).removeClass('hidden');
  } else {
    $(`#friendHeaderVideo${uID}`).addClass('hidden');
  }

  if (data && data[uID] && data[uID].screen) {
    $(`#friendHeaderScreen${uID}`).removeClass('hidden');
  } else {
    $(`#friendHeaderScreen${uID}`).addClass('hidden');
  }
} // Lounge VC 


async function manageVoiceChatDisplay(guildUID, guildID, channelIDInput, data) {
  let channelID = currentChannel;

  if (channelIDInput) {
    channelID = channelIDInput;
  }

  if (channelID) {
    // Channel request
    if (data !== undefined) {
      // New data is here
      channelData[`${guildUID}${guildID}`] = data;
      createVCChannelsIndicators(guildUID, guildID, data);
    }

    if (!channelData[`${guildUID}${guildID}`] || !channelData[`${guildUID}${guildID}`][channelID] || (0, _display.isObjEmpty)(channelData[`${guildUID}${guildID}`][channelID])) {
      if (channelData[`${guildUID}${guildID}`] == null) {
        // If the whole server is empty.
        channelData[`${guildUID}${guildID}`] = {};
      }

      channelData[`${guildUID}${guildID}`][channelID] = {};
    }
  } else {
    // Its a general request. Store data to the correct variables. Only occurs when NOT in channel.
    channelData[`${guildUID}${guildID}`] = data;

    if (!data) {
      channelData[`${guildUID}${guildID}`] = {};
    }

    createVCChannelsIndicators(guildUID, guildID, data);
    return;
  } // Its a channel request. Display information in UI.


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
  } else {
    $(`#channelSecondaryGrid${guildUID}${guildID}${channelID}`).addClass('vcActive');
    $(`.inactiveChannel`).removeClass('zoomIn');
    $(`.inactiveChannel`).addClass('zoomOut');
    clearTimeout(voiceTimeouts[guildUID + guildID + channelID]);
  } // Get differences.


  const voiceMembersForward = (0, _display.commonArrayDifference)(Object.keys(channelData[`${guildUID}${guildID}`][channelID]), cacheChannelSpecificDataKeys);
  const voiceMembersBackward = (0, _display.commonArrayDifference)(cacheChannelSpecificDataKeys, Object.keys(channelData[`${guildUID}${guildID}`][channelID]));
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
    a.innerHTML = `
      <img userContext="voice" userID="${userStatus.uid}" id="${userStatus.uid}${guildUID}${guildID}${channelID}CallItem" class="invisible userContextItem acceptLeftClick voiceIndicatorAll voiceIndicator${userStatus.uid}" />
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
    }, 99);
    $(`#${userStatus.uid}${guildUID}${guildID}${channelID}CallItem`).get(0).src = await (0, _display.returnProperURL)(userStatus.uid);
    (0, _display.displayImageAnimation)(`${userStatus.uid}${guildUID}${guildID}${channelID}CallItem`);
  }

  for (let i = 0; i < voiceMembersBackward.length; i++) {
    const userID = voiceMembersBackward[i];
    $(`#${userID}${guildUID}${guildID}${channelID}CallItemContainer`).addClass('callItemContainerGone');
    voiceTimeouts[`${userID}${guildUID}${guildID}${channelID}`] = window.setTimeout(() => {
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemContainer`).remove();
    }, 500);
  } // Mutes and deafens. Videos and screenshares


  for (let i = 0; i < cacheChannelSpecificDataKeys.length; i++) {
    const value = cacheChannelData[`${guildUID}${guildID}`][channelID][cacheChannelSpecificDataKeys[i]];
    const userID = value.uid;
    clearTimeout(voiceTimeouts[`${userID}${guildUID}${guildID}${channelID}deafen`]);
    clearTimeout(voiceTimeouts[`${userID}${guildUID}${guildID}${channelID}mute`]);

    if (value.deafened) {
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemMute`).removeClass('zoomIn');
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemMute`).addClass('zoomOut');
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemDeafen`).removeClass('zoomOut');
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemDeafen`).addClass('zoomIn');
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemDeafen`).removeClass('hidden');
      voiceTimeouts[`${userID}${userID}${guildUID}${channelID}mute`] = window.setTimeout(() => {
        $(`#${userID}${guildUID}${guildID}${channelID}CallItemMute`).addClass('hidden');
      }, 499);
    } else if (value.muted) {
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemMute`).removeClass('zoomOut');
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemMute`).addClass('zoomIn');
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemMute`).removeClass('hidden');
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemDeafen`).removeClass('zoomIn');
      $(`#${userID}${guildUID}${guildID}${channelID}CallItemDeafen`).addClass('zoomOut');
      voiceTimeouts[`${userID}${userID}${guildUID}${channelID}deafen`] = window.setTimeout(() => {
        $(`#${userID}${guildUID}${guildID}${channelID}CallItemDeafen`).addClass('hidden');
      }, 499);
    } else {
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
    } else {
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
    } else {
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
  await (0, _database.update)((0, _database.ref)(rtdb, `voice/${currentCall}/${user.uid}`), {
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
      (0, _sounds.playMute)();
    }
  } else {
    if (isDeafened) {
      deafenSelf();
    }
  }

  if (currentCall.includes('/')) {
    // Group Call
    if (isMuted) {
      $(`#voiceChatButtonMute${currentCall.split('/')[0]}`).get(0)._tippy.setContent(`Unmute`);
    } else {
      $(`#voiceChatButtonMute${currentCall.split('/')[0]}`).get(0)._tippy.setContent(`Mute`);
    }
  }

  window.setTimeout(() => {
    $(`.muteButton`).removeClass('disabled');
  }, 999);
};

window.deafenSelf = async () => {
  isDeafened = !isDeafened;
  $('.usersAudio').prop('muted', isDeafened);
  $(`.deafenButton`).addClass('disabled');
  $(`.deafenButton`).removeClass('deafenButtonActive');
  $(`.deafenButton`).html(`<i class="bx bx-volume-full"></i>`);
  await (0, _database.update)((0, _database.ref)(rtdb, `voice/${currentCall}/${user.uid}`), {
    deafened: isDeafened
  });

  if (isDeafened) {
    $(`.deafenButton`).addClass('deafenButtonActive');
    $(`.deafenButton`).html(`<i class="bx bx-volume-mute"></i>`);

    if (!isMuted) {
      deafenCausedByMute = true;
      muteSelf(true);
    } // Play deafen sound.


    (0, _sounds.playDeafen)();
  } else {
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
    } else {
      $(`#voiceChatButtonDeafen${currentCall.split('/')[0]}`).get(0)._tippy.setContent(`Deafen`);
    }
  }

  window.setTimeout(() => {
    $(`.deafenButton`).removeClass('disabled');
  }, 999);
};

function putVolumeOnStream(userID) {
  // Called when the stream is fully processed & added.
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

  if (!(await handleScreenShare())) {
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
    unShareScreen(fullServerID, channelID);
  }; // Create a mini-voice channel within the voice channel.
  // Create listeners, handle requests, etc for it.
  // User will act as host. To join, create user field in the mini. 
  //Functions for closing streams to be added.


  miniCallListener = `voice/${fullServerID}/${channelID}/${user.uid}/media`;
  (0, _database.onValue)((0, _database.ref)(rtdb, `${miniCallListener}`), async value => {
    // Call the user.
    if (value.val()) {
      const keys = Object.keys(value.val());
      const mediaVoiceForward = (0, _display.commonArrayDifference)(keys, cacheMediaConnectedMembers);
      const mediaVoiceBackward = (0, _display.commonArrayDifference)(cacheMediaConnectedMembers, keys);
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
        } catch (error) {// Probably left the channel or something.
        }
      }

      for (let i = 0; i < mediaVoiceBackward.length; i++) {
        const uid = mediaVoiceBackward[i];
        connectedMediaUsers.splice(connectedMediaUsers.indexOf(uid), 1);
      }
    } else {
      connectedMediaUsers = [];
      cacheMediaConnectedMembers = [];
    }
  });
  await (0, _database.update)((0, _database.ref)(rtdb, `voice/${currentCall}/${user.uid}`), {
    screen: true
  });

  videoMediaStream.getVideoTracks()[0].onended = function () {
    unShareScreen(fullServerID, channelID);
  };
}

async function shareScreenDM(uID) {
  connectedMediaUsers = [];
  cacheMediaConnectedMembers = [];
  $(`#voiceChatButtonVideoFriends`).addClass('disabled');
  $(`#voiceChatButtonScreenFriends`).addClass('disabled');
  window.setTimeout(() => {
    $(`#voiceChatButtonScreenFriends`).removeClass('disabled');

    $(`#voiceChatButtonScreenFriends`).get(0)._tippy.setContent(`End Stream`);
  }, 1500);
  console.log('here');

  if (!(await handleScreenShare())) {
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
    unShareScreenDM(uID);
  };

  miniCallListener = `voice/${currentCall}/${user.uid}/media`;
  (0, _database.onValue)((0, _database.ref)(rtdb, `${miniCallListener}`), async value => {
    // Call the user.
    if (value.val()) {
      myPeerVideo.call(value.val()[uID].peer, videoMediaStream);
    } else {
      connectedMediaUsers = [];
      cacheMediaConnectedMembers = [];
    }
  });
  console.log('here');
  await (0, _database.update)((0, _database.ref)(rtdb, `voice/${currentCall}/${user.uid}`), {
    screen: true
  });

  videoMediaStream.getVideoTracks()[0].onended = function () {
    unShareScreenDM(uID);
  };
}

async function shareVideoDM(uID) {
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
  };

  miniCallListener = `voice/${(0, _display.dmKEYify)(user.uid, uID)}/${user.uid}/media`;
  (0, _database.onValue)((0, _database.ref)(rtdb, miniCallListener), async value => {
    // Call the user.
    if (value.val()) {
      myPeerVideo.call(value.val()[uID].peer, videoMediaStream);
    } else {
      connectedMediaUsers = [];
      cacheMediaConnectedMembers = [];
    }
  });
  await (0, _database.update)((0, _database.ref)(rtdb, `voice/${currentCall}/${user.uid}`), {
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
  };

  miniCallListener = `voice/${fullServerID}/${channelID}/${user.uid}/media`;
  (0, _database.onValue)((0, _database.ref)(rtdb, miniCallListener), async value => {
    // Call the user.
    if (value.val()) {
      const keys = Object.keys(value.val());
      const mediaVoiceForward = (0, _display.commonArrayDifference)(keys, cacheMediaConnectedMembers);
      const mediaVoiceBackward = (0, _display.commonArrayDifference)(cacheMediaConnectedMembers, keys);
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
        } catch (error) {// Probably left the channel or something.
        }
      }

      for (let i = 0; i < mediaVoiceBackward.length; i++) {
        const uid = mediaVoiceBackward[i];
        connectedMediaUsers.splice(connectedMediaUsers.indexOf(uid), 1);
      }
    } else {
      connectedMediaUsers = [];
      cacheMediaConnectedMembers = [];
    }
  });
  await (0, _database.update)((0, _database.ref)(rtdb, `voice/${currentCall}/${user.uid}`), {
    video: true
  });
}

async function unShareScreen(fullServerID, channelID) {
  $(`#voiceChatButtonScreen${fullServerID}`).html(`<i class="bx bx-desktop"></i>`);
  $(`#voiceChatButtonScreen${fullServerID}`).removeClass('screenButtonActive');
  $(`#voiceChatButtonScreen${fullServerID}`).addClass('disabled');

  $(`#voiceChatButtonScreen${fullServerID}`).get(0).onclick = () => {
    shareScreen(fullServerID, channelID);
  };

  await (0, _database.update)((0, _database.ref)(rtdb, `voice/${currentCall}/${user.uid}`), {
    screen: false
  });
  await (0, _database.remove)((0, _database.ref)(rtdb, `${miniCallListener}`));
  (0, _database.off)((0, _database.ref)(rtdb, `${miniCallListener}`));

  if (videoMediaStream) {
    videoMediaStream.getTracks().forEach(function (track) {
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
      myPeerVideo.on('open', ID => {
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
  };

  await (0, _database.update)((0, _database.ref)(rtdb, `voice/${currentCall}/${user.uid}`), {
    screen: false
  });
  await (0, _database.remove)((0, _database.ref)(rtdb, `${miniCallListener}`));
  (0, _database.off)((0, _database.ref)(rtdb, `${miniCallListener}`));

  if (videoMediaStream) {
    videoMediaStream.getTracks().forEach(function (track) {
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
      myPeerVideo.on('open', ID => {
        console.log('Peer opened.');
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
  };

  await (0, _database.update)((0, _database.ref)(rtdb, `voice/${currentCall}/${user.uid}`), {
    video: false
  });
  await (0, _database.remove)((0, _database.ref)(rtdb, `${miniCallListener}`));
  (0, _database.off)((0, _database.ref)(rtdb, `${miniCallListener}`));

  if (videoMediaStream) {
    videoMediaStream.getTracks().forEach(function (track) {
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
      myPeerVideo.on('open', ID => {
        console.log('Peer opened.');
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
  };

  await (0, _database.update)((0, _database.ref)(rtdb, `voice/${currentCall}/${user.uid}`), {
    video: false
  });
  await (0, _database.remove)((0, _database.ref)(rtdb, `${miniCallListener}`));
  (0, _database.off)((0, _database.ref)(rtdb, `${miniCallListener}`));

  if (videoMediaStream) {
    videoMediaStream.getTracks().forEach(function (track) {
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
      myPeerVideo.on('open', ID => {
        console.log('Peer opened.');
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
  if (userID == user.uid || currentCall !== `${serverUID}${serverID}/${channelID}` || connectedToVideo == userID) {
    return;
  }

  if (connectedToVideo) {
    // Leave current without removing media view.
    await leaveVideo(serverUID, serverID, channelID, true); // Leave video is same as leave screen
  }

  connectedToVideo = userID; // Users joining another stream.

  showMediaViewVoiceChannel(serverUID, serverID, channelID); // Add the user to the mini channel.

  $(`#${serverUID}${serverID}${channelID}channelMediaVideo`).get(0).srcObject = null;
  myPeerVideo.on('call', call => {
    const emptyAudioTrack = (0, _display.createEmptyAudioTrack)();
    const emptyVideoTrack = (0, _display.createEmptyVideoTrack)({
      width: 640,
      height: 480
    });
    const emptyMediaStream = new MediaStream([emptyAudioTrack, emptyVideoTrack]);
    call.answer(emptyMediaStream);
    call.on('stream', stream => {
      console.log('stream recieved');
      $(`#${serverUID}${serverID}${channelID}channelMediaVideo`).get(0).srcObject = stream;
      $(`#${serverUID}${serverID}${channelID}channelMediaVideo`).get(0).play();
    });
  });
  window.setTimeout(async () => {
    await (0, _database.update)((0, _database.ref)(rtdb, `voice/${serverUID}${serverID}/${channelID}/${userID}/media/${user.uid}`), {
      username: cacheUser.username,
      uid: user.uid,
      peer: myPeerVideoID,
      connected: true
    });
    (0, _database.onDisconnect)((0, _database.ref)(rtdb, `voice/${serverUID}${serverID}/${channelID}/${userID}/media/${user.uid}`)).remove();
    $(`#mediaGuildChannelViewTitle${serverUID}${serverID}${channelID}`).html(`${username.capitalize()}'s Screen Stream`);

    $(`#${serverUID}${serverID}${channelID}voiceChatStopWatchingButton`).get(0).onclick = () => {
      leaveVideo(serverUID, serverID, channelID); // Leave video is same as leave screen
    };

    $(`#${serverUID}${serverID}${channelID}voiceChatStopWatchingButton2`).get(0).onclick = () => {
      leaveVideo(serverUID, serverID, channelID);
    };

    miniCallListener = `voice/${serverUID}${serverID}/${channelID}/${userID}/media`;
    (0, _database.onValue)((0, _database.ref)(rtdb, `${miniCallListener}`), async value => {
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
          a.setAttribute(`src`, await (0, _display.returnProperURL)(value.val()[key].uid));
          (0, _display.displayImageAnimation)(`watchingIcon${serverUID}${serverID}${channelID}`);
        }

        $(`#${serverUID}${serverID}${channelID}MediaWatching`).html(`${keys.length} Watching.`);
      } else {
        // Probably it was deleted!
        leaveVideo(serverUID, serverID, channelID);
      }
    });
  }, 999);
};

window.joinVideo = async (serverUID, serverID, channelID, userID, username) => {
  if (userID == user.uid || currentCall !== `${serverUID}${serverID}/${channelID}` || connectedToVideo == userID) {
    return;
  }

  if (connectedToVideo) {
    // Leave current without removing media view.
    await leaveVideoDM(serverUID, serverID, channelID, true);
  }

  connectedToVideo = userID; // Users joining another stream.

  showMediaViewVoiceChannel(serverUID, serverID, channelID); // Add the user to the mini channel.

  console.log('call listener set');
  $(`#${serverUID}${serverID}${channelID}channelMediaVideo`).get(0).srcObject = null;
  myPeerVideo.on('call', call => {
    const emptyAudioTrack = (0, _display.createEmptyAudioTrack)();
    const emptyVideoTrack = (0, _display.createEmptyVideoTrack)({
      width: 640,
      height: 480
    });
    const emptyMediaStream = new MediaStream([emptyAudioTrack, emptyVideoTrack]);
    call.answer(emptyMediaStream);
    console.log('answered');
    call.on('stream', stream => {
      console.log('stream recieved');
      $(`#${serverUID}${serverID}${channelID}channelMediaVideo`).get(0).srcObject = stream;
      $(`#${serverUID}${serverID}${channelID}channelMediaVideo`).get(0).play();
    });
  });
  window.setTimeout(async () => {
    await (0, _database.update)((0, _database.ref)(rtdb, `voice/${serverUID}${serverID}/${channelID}/${userID}/media/${user.uid}`), {
      username: cacheUser.username,
      uid: user.uid,
      peer: myPeerVideoID,
      connected: true
    });
    (0, _database.onDisconnect)((0, _database.ref)(rtdb, `voice/${serverUID}${serverID}/${channelID}/${userID}/media/${user.uid}`)).remove();
    $(`#mediaGuildChannelViewTitle${serverUID}${serverID}${channelID}`).html(`${username.capitalize()}'s Video Stream`);

    $(`#${serverUID}${serverID}${channelID}voiceChatStopWatchingButton`).get(0).onclick = () => {
      leaveVideo(serverUID, serverID, channelID);
    };

    $(`#${serverUID}${serverID}${channelID}voiceChatStopWatchingButton2`).get(0).onclick = () => {
      leaveVideo(serverUID, serverID, channelID);
    };

    miniCallListener = `voice/${serverUID}${serverID}/${channelID}/${userID}/media`;
    (0, _database.onValue)((0, _database.ref)(rtdb, `${miniCallListener}`), async value => {
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
          a.setAttribute(`src`, await (0, _display.returnProperURL)(value.val()[key].uid));
          (0, _display.displayImageAnimation)(`watchingIcon${serverUID}${serverID}${channelID}`);
        }

        $(`#${serverUID}${serverID}${channelID}MediaWatching`).html(`${keys.length} Watching.`);
      } else {
        // Probably it was deleted!
        leaveVideo(serverUID, serverID, channelID);
      }
    });
  }, 999);
};

async function joinVideoDM(userID, username) {
  if (userID == user.uid || currentCall !== (0, _display.dmKEYify)(user.uid, userID) || connectedToVideo == userID) {
    return;
  }

  if (connectedToVideo) {
    // Leave current without removing media view.
    await leaveVideoDM(userID, true);
  }

  connectedToVideo = userID; // Users joining another stream.

  showMediaViewDM(userID); // Add the user to the mini channel.

  $(`#mediaGuildFriendsVideo`).get(0).srcObject = null;
  myPeerVideo.on('call', call => {
    const emptyAudioTrack = (0, _display.createEmptyAudioTrack)();
    const emptyVideoTrack = (0, _display.createEmptyVideoTrack)({
      width: 640,
      height: 480
    });
    const emptyMediaStream = new MediaStream([emptyAudioTrack, emptyVideoTrack]);
    call.answer(emptyMediaStream);
    console.log('answered');
    call.on('stream', stream => {
      console.log('stream recieved');
      $(`#mediaGuildFriendsVideo`).get(0).srcObject = stream;
      $(`#mediaGuildFriendsVideo`).get(0).play();
    });
  });
  window.setTimeout(async () => {
    await (0, _database.update)((0, _database.ref)(rtdb, `voice/${(0, _display.dmKEYify)(user.uid, userID)}/${userID}/media/${user.uid}`), {
      username: cacheUser.username,
      uid: user.uid,
      peer: myPeerVideoID,
      connected: true
    });
    (0, _database.onDisconnect)((0, _database.ref)(rtdb, `voice/${(0, _display.dmKEYify)(user.uid, userID)}/${userID}/media/${user.uid}`)).remove();
    $(`#mediaGuildFriendsViewTitle`).html(`${username.capitalize()}'s Video Stream`);

    $(`#voiceChatStopWatchingButton3`).get(0).onclick = () => {
      leaveVideoDM(userID);
    };

    miniCallListener = `voice/${(0, _display.dmKEYify)(user.uid, userID)}/${userID}/media`;
    (0, _database.onValue)((0, _database.ref)(rtdb, `${miniCallListener}`), async value => {
      if (!value.val()) {
        // Probably it was deleted!
        leaveVideoDM(userID);
      }
    });
  }, 999);
}

async function joinScreenDM(userID, username) {
  if (userID == user.uid || currentCall !== (0, _display.dmKEYify)(user.uid, userID) || connectedToVideo == userID) {
    return;
  }

  if (connectedToVideo) {
    // Leave current without removing media view.
    await leaveVideo(userID, true); // Leave video is same as leave screen
  }

  connectedToVideo = userID; // Users joining another stream.

  showMediaViewDM(userID); // Add the user to the mini channel.

  $(`#mediaGuildFriendsVideo`).get(0).srcObject = null;
  myPeerVideo.on('call', call => {
    const emptyAudioTrack = (0, _display.createEmptyAudioTrack)();
    const emptyVideoTrack = (0, _display.createEmptyVideoTrack)({
      width: 640,
      height: 480
    });
    const emptyMediaStream = new MediaStream([emptyAudioTrack, emptyVideoTrack]);
    call.answer(emptyMediaStream);
    call.on('stream', stream => {
      console.log('stream recieved');
      $(`#mediaGuildFriendsVideo`).get(0).srcObject = stream;
      $(`#mediaGuildFriendsVideo`).css(`width`, stream.getVideoTracks()[0].getSettings().width);
      $(`#mediaGuildFriendsVideo`).get(0).play();
    });
  });
  window.setTimeout(async () => {
    await (0, _database.update)((0, _database.ref)(rtdb, `voice/${(0, _display.dmKEYify)(user.uid, userID)}/${userID}/media/${user.uid}`), {
      username: cacheUser.username,
      uid: user.uid,
      peer: myPeerVideoID,
      connected: true
    });
    (0, _database.onDisconnect)((0, _database.ref)(rtdb, `voice/${(0, _display.dmKEYify)(user.uid, userID)}/${userID}/media/${user.uid}`)).remove();
    $(`#mediaGuildFriendsViewTitle`).html(`${username.capitalize()}'s Screen Stream`);

    $(`#voiceChatStopWatchingButton3`).get(0).onclick = () => {
      leaveVideoDM(userID);
    };

    miniCallListener = `voice/${(0, _display.dmKEYify)(user.uid, userID)}/${userID}/media`;
    (0, _database.onValue)((0, _database.ref)(rtdb, `${miniCallListener}`), async value => {
      if (!value.val()) {
        // Probably it was deleted!
        leaveVideoDM(userID);
      }
    });
  }, 999);
}

function leaveVideo(serverUID, serverID, channelID, skipDisplay) {
  return new Promise(async (resolve, reject) => {
    if (!skipDisplay) {
      hideMediaViewVoiceChannel(serverUID, serverID, channelID);
    }

    if (connectedToVideo && miniCallListener) {
      // Remove user from mini channel.
      await (0, _database.remove)((0, _database.ref)(rtdb, `voice/${serverUID}${serverID}/${channelID}/${connectedToVideo}/media/${user.uid}`));
      await (0, _database.onDisconnect)((0, _database.ref)(rtdb, `voice/${serverUID}${serverID}/${channelID}/${connectedToVideo}/media/${user.uid}`)).cancel();
      (0, _database.off)((0, _database.ref)(rtdb, miniCallListener));
      connectedToVideo = null;
    }

    myPeerVideo.destroy();
    searchIntervalMedia = window.setInterval(() => {
      if (myPeerVideo.destroyed) {
        window.clearInterval(searchIntervalMedia);
        myPeerVideo = new Peer();
        myPeerVideo.on('open', ID => {
          console.log('Peer opened.');
          myPeerVideoID = ID;
          resolve(true);
        });
      }
    }, 99); // Run every 99ms.
  });
}

function leaveVideoDM(userID, skipDisplay) {
  return new Promise(async (resolve, reject) => {
    if (!skipDisplay) {
      hideMediaViewDM(userID);
    }

    if (connectedToVideo && miniCallListener) {
      // Remove user from mini channel.
      await (0, _database.remove)((0, _database.ref)(rtdb, `voice/${(0, _display.dmKEYify)(user.uid, userID)}/${connectedToVideo}/media/${user.uid}`));
      await (0, _database.onDisconnect)((0, _database.ref)(rtdb, `voice/${(0, _display.dmKEYify)(user.uid, userID)}/${connectedToVideo}/media/${user.uid}`)).cancel();
      (0, _database.off)((0, _database.ref)(rtdb, miniCallListener));
      connectedToVideo = null;
    }

    myPeerVideo.destroy();
    searchIntervalMedia = window.setInterval(() => {
      if (myPeerVideo.destroyed) {
        window.clearInterval(searchIntervalMedia);
        myPeerVideo = new Peer();
        myPeerVideo.on('open', ID => {
          console.log('Peer opened.');
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

function hideMediaViewDM(uID, switchingDMs) {
  $(`#friendViewRight`).removeClass('hiddenImportant');

  if (switchingDMs) {
    $(`#friendViewRight`).removeClass("friendViewRightMediaActive");
    $(`#friendViewMedia`).removeClass('friendViewMediaMediaActive');

    if (connectedToVideo) {
      leaveVideoDM(connectedToVideo, true);
    }
  } else {
    window.setTimeout(() => {
      $(`#friendViewRight`).removeClass("friendViewRightMediaActive");
      $(`#friendViewMedia`).removeClass('friendViewMediaMediaActive');
      window.setTimeout(() => {
        $(`#friendViewMedia`).addClass('hiddenImportant');
      }, 1499);
    }, 99);
  }
} // mediaGuildFriendsViewTitle


function showMediaViewVoiceChannel(serverUID, serverID, channelID) {
  $(`#sidebarLeft${serverUID}${serverID}`).addClass('sidebarLeftJoinedMedia');
  $(`#sidebarRight${serverID}`).addClass('sidebarRightJoinedMedia');
  $(`#${serverUID}${serverID}${channelID}PrimaryGrid`).addClass('channelPrimaryGridJoinedMedia');
  $(`#channelSecondaryGrid${serverUID}${serverID}${channelID}`).addClass('channelSecondaryJoinedMedia');
  $(`#${serverUID}${serverID}${channelID}channelMediaContainer`).addClass('channelMediaContainerJoinedMedia');
  $(`#${serverUID}${serverID}${channelID}voiceChatStopWatchingButton`).removeClass('hidden');
  console.log('Joined media styles added.');
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
  };
}

window.testHandleScreenShare = () => {
  handleScreenShare();
};

function handleScreenShare() {
  return new Promise(async (resolve, reject) => {
    if (!(0, _electron.returnIsElectron)()) {
      try {
        videoMediaStream = await navigator.mediaDevices.getDisplayMedia({
          cursor: 'always',
          video: true,
          audio: true
        });
        resolve(true);
      } catch (error) {
        resolve(false);
        return false;
      }
    } else {
      // More complicated. Show custom screen sharing window.
      const {
        desktopCapturer,
        systemPreferences
      } = electronLink; // Electron is defined because returnIsElection() is true.

      if (systemPreferences && systemPreferences.getMediaAccessStatus() && ["denied", "restricted"].includes(systemPreferences.getMediaAccessStatus())) ;
      showScreenShareWindow();
      const sources = await desktopCapturer.getSources({
        types: ['window', 'screen']
      });
      $(`#screenScreens`).empty();
      $(`#screenWindows`).empty();

      $(`#screenSharingWallpaper`).get(0).onclick = () => {
        resolve(false);
        hideScreenShareWindow();
      };

      $(`#screenSharingClose`).get(0).onclick = () => {
        resolve(false);
        hideScreenShareWindow();
      };

      for (let i = 0; i < sources.length; i++) {
        const source = sources[i];
        const a = document.createElement('div');
        a.setAttribute('class', 'screenSource');
        a.innerHTML = `
          <img src="${source.thumbnail.toDataURL()}"></img>
          <div class="screenSourceTitle">${source.name}</div>
        `;

        a.onclick = async () => {
          hideScreenShareWindow();

          try {
            videoMediaStream = await navigator.mediaDevices.getUserMedia({
              audio: (0, _settings.retrieveSetting)('streamAudio', true),
              video: {
                mandatory: {
                  chromeMediaSource: 'desktop',
                  chromeMediaSourceId: source.id
                }
              }
            });
          } catch (error) {
            console.log(error);
            resolve(false);
            return;
          }

          resolve(true);
        };

        if (source.name.includes('Screen')) {
          $(`#screenScreens`).append(a);
        } else {
          $(`#screenWindows`).append(a);
        }
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

function hideScreenShareWindow() {
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

    for (const amplitude of pcmData) {
      sumSquares += amplitude * amplitude;
    }

    const magnitude = Math.sqrt(sumSquares / pcmData.length); // Border width on magnitude * multiplier

    let displayMagnitude = magnitude * 200;

    if (displayMagnitude > 4) {
      displayMagnitude = 4;
    } else if (displayMagnitude < 0.2) {
      displayMagnitude = 0;
    }

    $(`.voiceIndicator${user.uid}`).css('border-width', `${displayMagnitude}px`);

    if (currentCall) {
      window.setTimeout(() => {
        window.requestAnimationFrame(onFrame);
      }, (0, _settings.retrieveSetting)(`responsiveVoiceActivity`, false) ? 99 : 249);
    } else {
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

    for (const amplitude of pcmData) {
      sumSquares += amplitude * amplitude;
    }

    const magnitude = Math.sqrt(sumSquares / pcmData.length); // Border width on magnitude * multiplier

    let displayMagnitude = magnitude * 200;

    if (displayMagnitude > 4) {
      displayMagnitude = 4;
    } else if (displayMagnitude < 0.2) {
      displayMagnitude = 0;
    }

    $(`.voiceIndicator${uID}`).css('border-width', `${displayMagnitude}px`);
    window.setTimeout(() => {
      window.requestAnimationFrame(onFrame);
    }, (0, _settings.retrieveSetting)(`responsiveVoiceActivity`, false) ? 99 : 249);
  }; // No need to cancel. VoiceIndicators are removed when connectedUsers no longer contains.


  window.requestAnimationFrame(onFrame);
}

function removeVoiceIndicatorOnUser(uID, mediaStream) {}
},{"./display":"js/display.js","./vcMusic":"js/vcMusic.js","./settings":"js/settings.js","./friends":"js/friends.js","./electron":"js/electron.js","./sounds":"js/sounds.js","./firebaseChecks":"js/firebaseChecks.js"}],"js/channels.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addChannelListeners = addChannelListeners;
exports.closeCurrentChannel = closeCurrentChannel;
exports.deleteMessage = deleteMessage;
exports.markChannelAsRead = markChannelAsRead;
exports.markChannelAsUnread = markChannelAsUnread;
exports.muteChannel = muteChannel;
exports.openGuildChannel = openGuildChannel;
exports.pinMessage = pinMessage;
exports.prepareEditMessage = prepareEditMessage;
exports.processAttachment = processAttachment;
exports.reevaluatePermissionsChannel = reevaluatePermissionsChannel;
exports.unmuteChannel = unmuteChannel;
exports.unpinMessage = unpinMessage;
exports.updateLoungeTypes = updateLoungeTypes;

var _firestore = require("@firebase/firestore");

var _database = require("@firebase/database");

var _storage = require("@firebase/storage");

var _functions = require("@firebase/functions");

var _display = require("./display");

var _voice = require("./voice");

var _vcMusic = require("./vcMusic");

var _servers = require("./servers");

var _friends = require("./friends");

var _stripe = require("./stripe");

var _settings = require("./settings");

var timeago = _interopRequireWildcard(require("timeago.js"));

var _sounds = require("./sounds");

var _firebaseChecks = require("./firebaseChecks");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
(0, _firebaseChecks.checkAppInitialized)();
const db = (0, _firestore.getFirestore)();
const rtdb = (0, _database.getDatabase)();
const storage = (0, _storage.getStorage)();
const functions = (0, _functions.getFunctions)();

window.newGuildChannel = (guildUID, guildID) => {
  // Create a dialog with input. 
  (0, _display.openModal)('newChannel');
  $('#newChannelName').val('');
  $('#newChannelName').get(0).addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      $('#newGuildChannelCreateButton').get(0).click();
    }
  });

  $('#newGuildChannelCreateButton').get(0).onclick = () => newGuildChannelConfirm(`${guildUID}`, `${guildID}`);
};

async function newGuildChannelConfirm(guildUID, guildID) {
  // Add channel.
  const channelName = (0, _display.securityConfirmTextIDs)($('#newChannelName').val(), true);
  (0, _display.closeModal)();

  if (channelName.length > 25) {
    snac('Invalid Lounge Name', 'Your lounge name cannot be more than 25 characters.', 'danger');
    window.setTimeout(() => {
      newGuildChannel(id);
    }, 1500);
    return;
  }

  const channelID = `${new Date().getTime()}`; // Switch to current date.

  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${guildUID}/servers/${guildID}`), {
    channels: (0, _firestore.arrayUnion)(`${channelID}.${channelName}`),
    [`channelData.${channelID}`]: {
      disablePublicView: false,
      disablePublicEdit: false
    }
  });
  await (0, _database.update)((0, _database.ref)(rtdb, `servers/${guildUID}${guildID}/channelData/${channelID}`), {
    disablePublicView: false,
    disablePublicEdit: false
  });
  await (0, _database.update)((0, _database.ref)(rtdb, `servers/${guildUID}${guildID}`), {
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

  if (grouping == 'Chat' && addPendingIndicator[scopedActiveChannel]) {
    // Its chat & unread
    markChannelAsRead(guildUID, guildID, channelID);
    window.setTimeout(() => {
      $(`#${scopedActiveChannel}ChatMessageInput`).get(0).focus();
    }, 150);
  } else if (grouping == "Chat") {
    // Its chat
    $(`#${scopedActiveChannel}ChatMessageInput`).get(0).focus();
  } else {
    // Its not chat.
    $(`#${scopedActiveChannel}pinnedMessagesButton`).addClass('invisibleOpacityAnimated');
    $(`#${scopedActiveChannel}LoadMoreMessagesButton`).addClass('invisibleOpacityAnimated');
  }

  if (grouping == 'Music') {
    $(`#${scopedActiveChannel}SongSearchInput`).get(0).focus();
  }
};

window.openServerSettings = (guildUID, guildID) => {
  closeCurrentChannel();
  currentChannel = `${guildUID}${guildID}Settings`;
  $(`#${guildUID}${guildID}Settings`).removeClass('hidden');
  $(`#${guildUID}${guildID}Settings`).addClass(`${guildUID}${guildID}guildChannelViewActive`);
};

async function openGuildChannel(guildUID, guildID, channelID, channelName) {
  if (currentChannel == channelID) {
    return;
  }

  currentChannel = channelID;
  const scopedActiveChannel = guildUID + guildID + channelID; // Temporary.
  // Clear messages.

  try {
    $(`#${scopedActiveChannel}ChatMessages`).find('.chatMessage').remove();
  } catch (error) {}

  ;
  closeCurrentChannel();
  currentChannel = channelID; // Set agin.

  $(`#${scopedActiveChannel}guildChannelElement`).addClass('guildChannelActive');
  $(`#${scopedActiveChannel}guildChannelElement`).addClass(`${guildUID}${guildID}guildChannelActive`);
  $(`#${scopedActiveChannel}guildChannel`).addClass(`${guildUID}${guildID}guildChannelViewActive`);
  $(`#${scopedActiveChannel}guildChannel`).removeClass('hidden');

  if (channelID.toLowerCase().includes('settings')) {
    resolve(false);
    return;
  } // Ignore settings channel.


  if ($(`#${scopedActiveChannel}guildChannel`).children().length) {
    addChannelListeners(guildUID, guildID, channelID, true);
    (0, _voice.manageVoiceChatDisplay)(guildUID, guildID, channelID, undefined);
    $(`#${scopedActiveChannel}ChatMessageInput`).get(0).focus();
    reevaluatePermissionsChannel(guildUID, guildID, channelID);
    updateLoungeTypes(guildUID, guildID, channelID, serverData[guildUID + guildID].channelData ? serverData[guildUID + guildID].channelData[channelID] : {});
    modifyChannelTab(guildUID, guildID, channelID, 'Chat');
    return;
  } // Not built.


  channelTabLibrary[scopedActiveChannel] = 'Chat';
  $(`#${scopedActiveChannel}guildChannel`).html(`
    <div class="channelPrimaryGrid ${scopedActiveChannel}Grid" id="${scopedActiveChannel}PrimaryGrid">
      <div id="${scopedActiveChannel}DropTarget" class="dropTarget animated fadeIn faster">
        <button onclick="$('#${scopedActiveChannel}DropTarget').css('display', '')" class="btn b-1 dropTargetButton"><i class="bx bx-x"></i></button>
      </div>

      <div class="channelTabListBanner">
        <div>
          <button onclick="modifyChannelTab('${guildUID}', '${guildID}', '${channelID}', 'Chat')" id="${scopedActiveChannel}TabItemChat" class="btn tabButton tabButtonActive ${scopedActiveChannel}TabItem roundedButton"><i class='bx bx-chat'></i></button>
          <div id="${scopedActiveChannel}channelTabIndicator" class="channelTabIndicator animated invisible"></div>
          <button onclick="loadMoreChannelMessages('${guildUID}', '${guildID}', '${channelID}')" class="btn tabButton roundedButton" id="${scopedActiveChannel}LoadMoreMessagesButton"><i class="bx bx-up-arrow-alt"></i></button>
          <button onclick="openChannelPinned('${scopedActiveChannel}')" class="btn tabButton roundedButton pinnedButton" id="${scopedActiveChannel}pinnedMessagesButton"><i class="bx bx-pin"></i></button>
        </div>
        <h3 class="guildChannelViewTitle" id="${scopedActiveChannel}guildChannelViewTitle">${(0, _display.securityConfirmTextIDs)(channelName, true)}</h3>
        <div>
          <button onclick="openChannelPinned('${scopedActiveChannel}')" class="btn tabButton roundedButton invisible" id="${scopedActiveChannel}pinnedMessagesButtonCounterpoart"><i class="bx bx-pin"></i></button>
          <button onclick="modifyChannelTab('${guildUID}', '${guildID}', '${channelID}', 'Music')" id="${scopedActiveChannel}TabItemMusic" class="btn tabButton ${scopedActiveChannel}TabItem roundedButton invisibleOpacityAnimated musicButton"><i class='bx bx-music'></i></button>
          <button onclick="modifyChannelTab('${guildUID}', '${guildID}', '${channelID}', 'Settings')" id="${scopedActiveChannel}TabItemSettings" class="btn tabButton ${scopedActiveChannel}TabItem roundedButton"><i class='bx bx-cog'></i></button>
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
            <button class="btn b-0 roundedButton" id="${scopedActiveChannel}AttachmentButton" onclick="addAttachment('${scopedActiveChannel}')"><i class='bx bxs-file-plus'></i></button>
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
        <div class="searchResultsChannelForm">
          <div class="form formLabelFix"><div>
            <label for="${scopedActiveChannel}SongSearchInput">Add to queue:</label>
            <input autocomplete="off" text="text" id="${scopedActiveChannel}SongSearchInput"> </input>
          </div></div>
        </div>
      </div>

      <div id="${scopedActiveChannel}TabViewSettings" class="hidden ${scopedActiveChannel}TabView musicContainerTabView musicContainerTabViewNonChat musicContainerTabViewSettings">
        <div class="tabViewSettingsBar">
          <button id="channelMarkButton${scopedActiveChannel}" class="btn b-3 roundedButton"></button>
          <button id="${scopedActiveChannel}channelMuteButton" class="btn b-3 roundedButton"></button>
        </div>

        <div id="${scopedActiveChannel}TabViewSettingsAdmin" class="tabViewSettingsBar TabViewSettingsAdmin hidden">
          <button id="channelRenameButton${scopedActiveChannel}" class="btn b-3 roundedButton"><i class="bx bx-rename"></i></button>
          <button id="channelDeleteButton${scopedActiveChannel}" class="btn b-3 roundedButton dangerButton"><i class="bx bx-trash"></i></button>
        </div>

        <div id="${scopedActiveChannel}TabViewSettingsOwner" class="tabViewSettingsBar TabViewSettingsOwner hidden">
          <button id="disablePublicView${scopedActiveChannel}" class="btn b-3 roundedButton"></button>
          <button id="disablePublicEdit${scopedActiveChannel}" class="btn b-3 roundedButton"></button>
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
  twemoji.parse($(`#${scopedActiveChannel}guildChannelViewTitle`).get(0));
  $(`#channelMusicAudio${scopedActiveChannel}`).get(0).volume = parseInt((0, _settings.retrieveSetting)('defaultVolume', '100')) / 100;
  $(`#channelMusicAudio${scopedActiveChannel}`).get(0).setSinkId((0, _settings.returnActiveDeviceIDOutput)());
  $(`#sliderOnMusicVolume${scopedActiveChannel}`).get(0).value = (0, _settings.retrieveSetting)('defaultVolume', '100');
  twemoji.parse($(`#emojiButton${scopedActiveChannel}`).get(0));

  if (mutedServers.includes(`${scopedActiveChannel}`)) {
    $(`#${scopedActiveChannel}channelMuteButton`).html(`<i class="bx bx-bell-off"></i>`);
    tippy($(`#${scopedActiveChannel}channelMuteButton`).get(0), {
      content: 'Unmute Lounge',
      placement: 'top'
    });

    $(`#${scopedActiveChannel}channelMuteButton`).get(0).onclick = () => unmuteChannel(guildUID, guildID, channelID);
  } else {
    tippy($(`#${scopedActiveChannel}channelMuteButton`).get(0), {
      content: 'Mute Lounge',
      placement: 'top'
    });
    $(`#${scopedActiveChannel}channelMuteButton`).html(`<i class="bx bx-bell"></i>`);

    $(`#${scopedActiveChannel}channelMuteButton`).get(0).onclick = () => muteChannel(guildUID, guildID, channelID);
  }

  tippy($(`#${scopedActiveChannel}musicAdminClearQueue`).get(0), {
    content: 'Clear Queue',
    placement: 'top'
  });

  $(`#${scopedActiveChannel}musicAdminClearQueue`).get(0).onclick = () => (0, _vcMusic.clearQueueVCMusic)(guildUID, guildID, channelID);

  tippy($(`#${scopedActiveChannel}musicAdminFastForward`).get(0), {
    content: 'Skip Track',
    placement: 'top'
  });

  $(`#${scopedActiveChannel}musicAdminFastForward`).get(0).onclick = () => (0, _vcMusic.skipTrackVCMusic)(guildUID, guildID, channelID);

  tippy($(`#gifsButton${scopedActiveChannel}`).get(0), {
    content: `GIFs`,
    placement: 'top'
  });
  tippy($(`#emojiButton${scopedActiveChannel}`).get(0), {
    content: `Emojis`,
    placement: 'top'
  });
  tippy($(`#${scopedActiveChannel}AttachmentButton`).get(0), {
    content: `Add Attachment`,
    placement: 'top'
  });
  tippy($(`#${scopedActiveChannel}SendMessageButton`).get(0), {
    content: `Send`,
    placement: 'top'
  });
  tippy($(`#${scopedActiveChannel}musicPartyButton`).get(0), {
    content: 'Join Listening Party',
    placement: 'top'
  });
  tippy($(`#${scopedActiveChannel}voiceChatButton`).get(0), {
    content: 'Join Voice',
    placement: 'top'
  });
  tippy($(`#disablePublicView${scopedActiveChannel}`).get(0), {
    content: '',
    placement: 'top'
  });
  tippy($(`#disablePublicEdit${scopedActiveChannel}`).get(0), {
    content: '',
    placement: 'top'
  });
  tippy($(`#${scopedActiveChannel}voiceChatStopWatchingButton`).get(0), {
    content: 'Stop Watching',
    placement: 'top'
  });
  tippy($(`#${scopedActiveChannel}voiceChatStopWatchingButton2`).get(0), {
    content: 'Stop Watching',
    placement: 'top'
  });
  tippy($(`#${scopedActiveChannel}pinnedMessagesButton`).get(0), {
    content: 'Pinned Messages',
    placement: 'top'
  });
  tippy($(`#closePinnedButton${scopedActiveChannel}`).get(0), {
    content: 'Close',
    placement: 'top'
  });
  tippy($(`#closeGifsButton${scopedActiveChannel}`).get(0), {
    content: 'Close',
    placement: 'top'
  });

  if (addPendingIndicator[scopedActiveChannel]) {
    $(`#channelMarkButton${scopedActiveChannel}`).html(`<i class="bx bx-notification-off"></i>`);
    tippy($(`#channelMarkButton${scopedActiveChannel}`).get(0), {
      content: 'Mark as Read',
      placement: 'top'
    });

    $(`#channelMarkButton${scopedActiveChannel}`).get(0).onclick = () => markChannelAsRead(guildUID, guildID, channelID);
  } else {
    $(`#channelMarkButton${scopedActiveChannel}`).html(`<i class="bx bx-notification"></i>`);
    tippy($(`#channelMarkButton${scopedActiveChannel}`).get(0), {
      content: 'Mark as Unread',
      placement: 'top'
    });

    $(`#channelMarkButton${scopedActiveChannel}`).get(0).onclick = () => markChannelAsUnread(guildUID, guildID, channelID);
  }

  tippy($(`#channelRenameButton${scopedActiveChannel}`).get(0), {
    content: 'Rename Lounge',
    placement: 'top'
  });

  $(`#channelRenameButton${scopedActiveChannel}`).get(0).onclick = () => {
    renameLoungePrepare(guildUID, guildID, channelID);
  };

  tippy($(`#channelDeleteButton${scopedActiveChannel}`).get(0), {
    content: 'Delete Lounge',
    placement: 'top'
  });

  $(`#channelDeleteButton${scopedActiveChannel}`).get(0).onclick = () => {
    deleteLoungePrepare(guildUID, guildID, channelID, channelName);
  };

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
  }); // Drag & Drop

  $(`#${scopedActiveChannel}DropTarget`).get(0).ondragenter = e => {
    e.preventDefault();
  };

  $(`.${scopedActiveChannel}Grid`).get(0).ondragenter = e => {
    $(`#${scopedActiveChannel}DropTarget`).css('display', 'block');
  };

  $(`#${scopedActiveChannel}DropTarget`).get(0).ondragleave = e => {
    $(`#${scopedActiveChannel}DropTarget`).css('display', '');
    e.preventDefault();
  };

  $(`#${scopedActiveChannel}DropTarget`).get(0).ondragover = e => {
    e.preventDefault();
  };

  $(`.${scopedActiveChannel}Grid`).get(0).ondrop = e => {
    (0, _display.showDroplet)();

    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      processAttachment(scopedActiveChannel, [e.dataTransfer.files[i]]);
    }

    $(`#${scopedActiveChannel}DropTarget`).css('display', '');
    e.preventDefault();
  };

  $(`#${scopedActiveChannel}voiceChatButton`).get(0).onclick = () => {
    joinChannelVC(guildUID, guildID, channelID);
  };

  $(`#${scopedActiveChannel}musicPartyButton`).get(0).onclick = () => {
    (0, _vcMusic.joinMusicParty)(guildUID, guildID, channelID);
  };

  (0, _display.displayInputEffect)();
  addChannelListeners(guildUID, guildID, channelID, false);
  $(`#${scopedActiveChannel}ChatMessageInput`).get(0).focus();
  $(`#gifsPickerSearchBox${scopedActiveChannel}`).get(0).addEventListener("keyup", event => {
    (0, _display.searchGifs)(scopedActiveChannel);
  }); // Voice chat

  (0, _voice.manageVoiceChatDisplay)(guildUID, guildID, channelID, undefined);
  $(`#${scopedActiveChannel}SongSearchInput`).get(0).addEventListener('keyup', event => {
    if (event.keyCode === 13) {
      event.preventDefault();
      (0, _vcMusic.searchInChannel)(guildUID, guildID, channelID);
    }
  });
  pingDialog(guildUID, guildID, channelID); // Ping dialog & button on enter.
  // Permissions

  reevaluatePermissionsChannel(guildUID, guildID, channelID);
  updateLoungeTypes(guildUID, guildID, channelID, serverData[guildUID + guildID].channelData ? serverData[guildUID + guildID].channelData[channelID] : {});
}

function updateLoungeTypes(guildUID, guildID, channelID, dataInput) {
  const scopedActiveChannel = `${guildUID}${guildID}${channelID}`;
  let data = dataInput;

  if (!dataInput) {
    data = {};
  }

  ;

  if (!loungeTypesCache[scopedActiveChannel] == data) {
    loungeTypesCache[scopedActiveChannel] = data; // We know it's different data, so it's worth checking unreads again.

    (0, _servers.checkServerUnread)(guildID);
  } // View


  $(`#${scopedActiveChannel}sidebarIcon`).addClass('bx-hash');
  $(`#${scopedActiveChannel}sidebarIcon`).removeClass('bx-lock-alt');
  $(`#${scopedActiveChannel}sidebarIcon`).removeClass('bx-lock-open-alt');
  $(`#${scopedActiveChannel}sidebarIcon`).removeClass('bx-book');
  $(`#${scopedActiveChannel}sidebarIcon`).removeClass('bx-pencil');
  $(`#${scopedActiveChannel}guildChannelElement`).removeClass('channelNoAccess');

  if (data.disablePublicEdit) {
    if (guildUID == user.uid || serverData[guildUID + guildID].staff.includes(user.uid)) {
      $(`#${scopedActiveChannel}sidebarIcon`).addClass('bx-pencil'); // Enable writing.

      $(`#${scopedActiveChannel}ChatMessages`).removeClass('ChatMessagesComposeOff');
      $(`#${scopedActiveChannel}CenterElement`).removeClass('CenterElementComposeOff');
      $(`#${scopedActiveChannel}ChatMessageBar`).removeClass('ChatMessageBarComposeOff');
    } else {
      $(`#${scopedActiveChannel}sidebarIcon`).removeClass('bx-hash');
      $(`#${scopedActiveChannel}sidebarIcon`).addClass('bx-book'); // Disable writing.

      $(`#${scopedActiveChannel}ChatMessages`).addClass('ChatMessagesComposeOff');
      $(`#${scopedActiveChannel}CenterElement`).addClass('CenterElementComposeOff');
      $(`#${scopedActiveChannel}ChatMessageBar`).addClass('ChatMessageBarComposeOff');
    } // Change message styling.


    $(`#${scopedActiveChannel}ChatMessages`).addClass('viewOnlyChatMessages');
    $(`#${scopedActiveChannel}guildChannel`).addClass('viewOnlyGuildChannel');
  } else {
    // Enable writing.
    $(`#${scopedActiveChannel}ChatMessages`).removeClass('ChatMessagesComposeOff');
    $(`#${scopedActiveChannel}CenterElement`).removeClass('CenterElementComposeOff');
    $(`#${scopedActiveChannel}ChatMessageBar`).removeClass('ChatMessageBarComposeOff'); // Change message styling.

    $(`#${scopedActiveChannel}ChatMessages`).removeClass('viewOnlyChatMessages');
    $(`#${scopedActiveChannel}guildChannel`).removeClass('viewOnlyGuildChannel');
  }

  if (data.disablePublicView) {
    if (serverData[guildUID + guildID].staff.includes(user.uid) || guildUID == user.uid) {
      $(`#${scopedActiveChannel}sidebarIcon`).addClass('bx-lock-open-alt');
    } else {
      // Disable viewing
      if (currentChannel == channelID) {
        closeCurrentChannel(true);
      }

      ;
      $(`#${scopedActiveChannel}guildChannelElement`).addClass('channelNoAccess');
      $(`#${scopedActiveChannel}sidebarIcon`).addClass('bx-lock-alt');
    }
  } else {
    // Enable viewing
    $(`#${scopedActiveChannel}guildChannelElement`).removeClass('channelNoAccess');
  } // Edits for owner.


  if ($(`#disablePublicView${scopedActiveChannel}`).length) {
    // It's built.
    if (guildUID == user.uid) {
      if (!data.disablePublicView) {
        // Public view is on
        $(`#disablePublicView${scopedActiveChannel}`).html(`<i class="bx bx-lock-open-alt"></i>`);

        $(`#disablePublicView${scopedActiveChannel}`).get(0)._tippy.setContent(`Restrict to Staff`);

        $(`#disablePublicView${scopedActiveChannel}`).get(0).onclick = () => {
          changeLoungeType(guildUID, guildID, channelID, 'disablePublicView', true);
        };
      } else {
        // Public view is off
        $(`#disablePublicView${scopedActiveChannel}`).html(`<i class="bx bx-lock-alt"></i>`);

        $(`#disablePublicView${scopedActiveChannel}`).get(0)._tippy.setContent(`Make Public`);

        $(`#disablePublicView${scopedActiveChannel}`).get(0).onclick = () => {
          changeLoungeType(guildUID, guildID, channelID, 'disablePublicView', false);
        };
      }

      if (!data.disablePublicEdit) {
        // Public edit is on
        $(`#disablePublicEdit${scopedActiveChannel}`).html(`<i class="bx bx-shield-x"></i>`);

        $(`#disablePublicEdit${scopedActiveChannel}`).get(0)._tippy.setContent(`Disable Messages`);

        $(`#disablePublicEdit${scopedActiveChannel}`).get(0).onclick = () => {
          changeLoungeType(guildUID, guildID, channelID, 'disablePublicEdit', true);
        };
      } else {
        // Public edit is off
        $(`#disablePublicEdit${scopedActiveChannel}`).html(`<i class="bx bx-check-shield"></i>`);

        $(`#disablePublicEdit${scopedActiveChannel}`).get(0)._tippy.setContent(`Allow Messages`);

        $(`#disablePublicEdit${scopedActiveChannel}`).get(0).onclick = () => {
          changeLoungeType(guildUID, guildID, channelID, 'disablePublicEdit', false);
        };
      }
    }
  }
}

async function changeLoungeType(guildUID, guildID, channelID, type, value) {
  const scopedActiveChannel = `${guildUID}${guildID}${channelID}`;
  $(`#${type}${scopedActiveChannel}`).addClass('disabled');
  console.log(guildUID, guildID);
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${guildUID}/servers/${guildID}`), {
    [`channelData.${channelID}.${type}`]: value
  });
  await (0, _database.update)((0, _database.ref)(rtdb, `servers/${guildUID}${guildID}/channelData/${channelID}`), {
    [`${type}`]: value
  });
  window.setTimeout(() => {
    $(`#${type}${scopedActiveChannel}`).removeClass('disabled');
  }, 999);
}

window.openChannelPinned = async scopedActiveChannel => {
  if (!channelPinnedOpen) {
    // Not open
    channelPinnedOpen = scopedActiveChannel;
    openPinnedCooldown = true;
    console.log(channelPinnedOpen);
    window.clearInterval(pinnedMessagesTimeout);
    $(`#${scopedActiveChannel}pinnedMessagesContainer`).removeClass('hidden');
    window.setTimeout(() => {
      $(`#${scopedActiveChannel}pinnedMessagesContainer`).addClass('postStandardAnimation');
      openPinnedCooldown = false;
    }, 9);
  } else {
    if (openPinnedCooldown) {
      return;
    }

    channelPinnedOpen = false; // Not open

    $(`#${scopedActiveChannel}pinnedMessagesContainer`).removeClass('postStandardAnimation');
    pinnedMessagesTimeout = window.setTimeout(() => {
      $(`#${scopedActiveChannel}pinnedMessagesContainer`).addClass('hidden');
    }, 299);
  }
};

async function pinMessage(scopedActiveChannel, messageID, messageSender, username) {
  await (0, _database.update)((0, _database.ref)(rtdb, `channels/${scopedActiveChannel}/pinned/${messageID}`), {
    u: username,
    s: messageSender,
    c: (0, _display.messageHTMLtoText)(null, $(`#messageContentOfID${messageID}`).get(0))
  });
  snac('Pinned', '', 'success');
}

async function unpinMessage(messageID, scopedActiveChannel, skipNotify) {
  await (0, _database.remove)((0, _database.ref)(rtdb, `channels/${scopedActiveChannel}/pinned/${messageID}`));

  if (!skipNotify) {
    snac('Unpinned', '', 'success');
  }
}

window.loadMoreChannelMessages = async (guildUID, guildID, channelID) => {
  const scopedActiveChannel = `${guildUID}${guildID}${channelID}`;
  (0, _display.disableButton)($(`#${scopedActiveChannel}LoadMoreMessagesButton`));
  const response = addChannelMessagesPagination(guildUID, guildID, channelID);

  if (response == 'topOfMessages' || !LatestMessagesPagination[scopedActiveChannel]) {
    (0, _display.enableButton)($(`#${scopedActiveChannel}LoadMoreMessagesButton`), `<i class="bx bx-chat"></i>`);

    $(`#${scopedActiveChannel}LoadMoreMessagesButton`).get(0)._tippy.setContent('No more messages.');
  } else {
    await (0, _display.timer)(3200);
    (0, _display.enableButton)($(`#${scopedActiveChannel}LoadMoreMessagesButton`), `<i class="bx bx-up-arrow-alt"></i>`);
  }
};

function reevaluatePermissionsChannel(guildUID, guildID, channelID) {
  const scopedActiveChannel = `${guildUID}${guildID}${channelID}`;
  $(`#${scopedActiveChannel}TabViewSettingsAdmin`).addClass('hidden');
  $(`#${scopedActiveChannel}musicAdminBar`).addClass('hidden');

  if (serverData[guildUID + guildID].owner == user.uid || serverData[guildUID + guildID].staff.includes(`${user.uid}`)) {
    // Staff member
    $(`#${scopedActiveChannel}TabViewSettingsAdmin`).removeClass('hidden');
    $(`#${scopedActiveChannel}musicAdminBar`).removeClass('hidden');
  }

  if (serverData[guildUID + guildID].owner == user.uid) {
    // Owner
    $(`#${scopedActiveChannel}TabViewSettingsOwner`).removeClass('hidden');
  }
}

async function addChannelMessagesPagination(guildUID, guildID, channelID) {
  const scopedActiveChannel = `${guildUID}${guildID}${channelID}`;

  if (!LatestMessagesPagination[scopedActiveChannel]) {
    disablePagination[scopedActiveChannel] = true;
    completePagination[scopedActiveChannel] = true;
    return 'topOfMessages';
  } // Add messages without a listener. 


  await (0, _database.get)((0, _database.query)((0, _database.ref)(rtdb, `channels/${scopedActiveChannel}/messages`), (0, _database.orderByKey)(), (0, _database.limitToLast)(18), (0, _database.endBefore)(LatestMessagesPagination[scopedActiveChannel]))).then(async snapshot => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      let newPagination = '';
      const bottomMostNew = new Date(data[Object.keys(data)[Object.keys(data).length - 1]].timestamp);
      const topMostOld = new Date(parseInt($(`#${scopedActiveChannel}ChatMessages`).children('.containsDivider').first().get(0).getAttribute('ts')));

      if (bottomMostNew.getFullYear() == topMostOld.getFullYear() && bottomMostNew.getMonth() == topMostOld.getMonth() && bottomMostNew.getDate() == topMostOld.getDate()) {
        // Same day, delete topmost timestamp.
        $(`#${scopedActiveChannel}ChatMessages`).children('.containsDivider').first().children('.chatMessageDivider').first().remove();
        $(`#${scopedActiveChannel}ChatMessages`).children('.containsDivider').first().removeClass('containsDivider');
      } // Ordered by oldest to newest.


      for (const key of Object.keys(data)) {
        const value = data[key];

        if (!newPagination) {
          newPagination = key;
        }

        await buildMessage(guildUID, guildID, channelID, value, key, `PaginationPreview`);

        if ($(`#messageContentOfID${key}`).length) {
          twemoji.parse($(`#messageContentOfID${key}`).get(0));
        }
      }

      LatestMessagesPagination[scopedActiveChannel] = newPagination;
      const newContent = $(`#${scopedActiveChannel}PaginationPreview`).html();
      $(`#${scopedActiveChannel}PaginationPreview`).html('');
      $(`#${scopedActiveChannel}ChatMessages`).prepend(newContent);
    } else {
      LatestMessagesPagination[scopedActiveChannel] = '';
    }
  });
  disablePagination[scopedActiveChannel] = false;
}

async function addChannelListeners(guildUID, guildID, channelID, secondTime) {
  const scopedActiveChannel = `${guildUID}${guildID}${channelID}`; // Always clear

  LatestMessageTimestamp[scopedActiveChannel] = new Date(0);
  LatestMessagesPagination[scopedActiveChannel] = null;

  try {
    (0, _database.off)((0, _database.query)((0, _database.ref)(rtdb, `${activeMessageListener}`)));
  } catch (error) {}

  ;

  try {
    (0, _database.off)((0, _database.query)((0, _database.ref)(rtdb, `${activePinnedListener}`)));
  } catch (error) {}

  activeMessageListener = `channels/${scopedActiveChannel}/messages`;
  activePinnedListener = `channels/${scopedActiveChannel}/pinned`;

  if (channelTabLibrary[scopedActiveChannel] == 'Chat' && addPendingIndicator[`${guildUID}${guildID}${channelID}`]) {
    markChannelAsRead(guildUID, guildID, channelID);
  }

  (0, _database.onChildAdded)((0, _database.query)((0, _database.ref)(rtdb, `${activeMessageListener}`), (0, _database.orderByKey)(), (0, _database.limitToLast)(24)), async snapshot => {
    if (new Date(snapshot.val().timestamp) < LatestMessageTimestamp[scopedActiveChannel]) {
      return;
    }

    ;
    LatestMessageTimestamp[scopedActiveChannel] = new Date(snapshot.val().timestamp);

    if (LatestMessagesPagination[scopedActiveChannel] == null) {
      // farthest message / first message / first run.
      LatestMessagesPagination[scopedActiveChannel] = snapshot.key;
    }

    if (!$(`#messageContentContainerOfID${snapshot.key}`).length) {
      await buildMessage(guildUID, guildID, channelID, snapshot.val(), snapshot.key, 'ChatMessages');
      twemoji.parse($(`#messageContentOfID${snapshot.key}`).get(0));
    }
  });
  (0, _database.onChildRemoved)((0, _database.query)((0, _database.ref)(rtdb, `${activeMessageListener}`)), snapshot => {
    displayDeleteMessage(snapshot.key);
  });
  (0, _database.onChildChanged)((0, _database.query)((0, _database.ref)(rtdb, `${activeMessageListener}`)), snapshot => {
    $(`#messageContentOfID${snapshot.key}`).html((0, _friends.messageify)(snapshot.val().content));
    twemoji.parse($(`#messageContentOfID${snapshot.key}`).get(0));

    if (snapshot.val().edited) {
      $(`#messageContentOfID${snapshot.key}`).addClass('editedMessage');
      $(`#editedMessageOfID${snapshot.key}`).removeClass('hidden');

      $(`#editedMessageIconOfID${snapshot.key}`).get(0)._tippy.setContent(`Edited ${timeago.format(new Date(snapshot.val().editedDate))}`);
    } // If sent a message, its approved now.

  });
  (0, _database.onValue)((0, _database.query)((0, _database.ref)(rtdb, `${activeMessageListener}`), (0, _database.limitToLast)(1)), snapshot => {
    if (snapshot.exists() && snapshot.val()) {
      $(`#emptyChannel${scopedActiveChannel}`).addClass('hidden');
    } else {
      $(`#emptyChannel${scopedActiveChannel}`).removeClass('hidden');
    }
  });

  if (cachedPins[scopedActiveChannel] == undefined) {
    cachedPins[scopedActiveChannel] = new Set();
  }

  $(`#${scopedActiveChannel}pinnedMessages`).empty();
  (0, _database.onChildAdded)((0, _database.query)((0, _database.ref)(rtdb, `${activePinnedListener}`), (0, _database.limitToLast)(50)), async snapshot => {
    cachedPins[scopedActiveChannel].add(snapshot.key);
    const a = document.createElement('div');
    a.setAttribute('class', 'messageReplay');
    a.id = `messageReplayOfID${snapshot.key}`;
    a.innerHTML = `
      <img class="profilePhotoReplay" id="${snapshot.key}pinimage"></img>
      <span class="chatMessageNameplate">${snapshot.val().u.capitalize()}</span>
      <p>${snapshot.val().c}</p>
      <button id="unpin${snapshot.key}" class="btn b-4 roundedButton pinnedButton unPinButton"><i class="bx bx-checkbox-minus"></i></button>
    `;
    $(`#${scopedActiveChannel}pinnedMessages`).get(0).appendChild(a);
    twemoji.parse($(`#messageReplayOfID${snapshot.key}`).get(0));
    $(`#${snapshot.key}pinimage`).attr('src', await (0, _display.returnProperURL)(snapshot.val().s));

    $(`#unpin${snapshot.key}`).get(0).onclick = () => {
      (0, _display.disableButton)($(`#unpin${snapshot.key}`));
      unpinMessage(snapshot.key, scopedActiveChannel, true);
    };
  });
  (0, _database.onChildRemoved)((0, _database.query)((0, _database.ref)(rtdb, `${activePinnedListener}`), (0, _database.limitToLast)(50)), snapshot => {
    cachedPins[scopedActiveChannel].delete(snapshot.key);
    $(`#messageReplayOfID${snapshot.key}`).css('height', $(`#messageReplayOfID${snapshot.key}`).height() + 'px');
    window.setTimeout(() => {
      $(`#messageReplayOfID${snapshot.key}`).addClass('bookmarkGone');
      window.setTimeout(() => {
        $(`#messageReplayOfID${snapshot.key}`).remove();
      }, 499);
    }, 9);
  });
  (0, _database.onValue)((0, _database.query)((0, _database.ref)(rtdb, `${activePinnedListener}`), (0, _database.limitToLast)(1)), snapshot => {
    if (snapshot.exists() && snapshot.val()) {
      $(`#emptyPinned${scopedActiveChannel}`).addClass('hidden');
    } else {
      $(`#emptyPinned${scopedActiveChannel}`).removeClass('hidden');
    }
  });

  $(`#${scopedActiveChannel}ChatMessages`).get(0).onscroll = () => {};

  window.setTimeout(() => {
    $(`#${scopedActiveChannel}ChatMessages`).get(0).onscroll = function (event) {
      const scroll = $(`#${scopedActiveChannel}ChatMessages`).scrollTop();

      if (scroll < 599) {
        if (completePagination[scopedActiveChannel]) {
          return;
        }

        ;

        if (!disablePagination[scopedActiveChannel]) {
          disablePagination[scopedActiveChannel] = true;
          addChannelMessagesPagination(guildUID, guildID, channelID);
        }
      }
    };
  }, 1800);
}

function buildMessage(guildUID, guildID, channelID, messageItem, messageID, targetDirectoryInput) {
  return new Promise(async (resolve, reject) => {
    const scopedActiveChannel = `${guildUID}${guildID}${channelID}`;
    let targetDirectory = targetDirectoryInput;

    if (!targetDirectoryInput) {
      targetDirectory = 'ChatMessages';
    }

    const messageContent = (0, _friends.messageify)(messageItem.content);
    const prevMessageDate = new Date(parseInt($(`#${scopedActiveChannel}${targetDirectory}`).children().last().attr('tS')));
    const newMessageDate = new Date(messageItem.timestamp);
    let bonusContent = {
      attachments: '',
      classes: '',
      pings: '',
      edited: messageItem.edited || false,
      containerClasses: '',
      links: '',
      YouTube: '',
      insertHTML: ''
    };
    let dividerCode = '';
    let dividerCode2 = '';
    let availableToAdd = true;
    let availableToAddedTo = true; // Message type

    if (messageContent) {
      bonusContent.classes = '';
      bonusContent.containerClasses = '';
      bonusContent.insertHTML = ``;
    } else {
      bonusContent.classes = '';
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
        } else if (messageItem.attachments[i].toLowerCase().endsWith(`.mp4?alt=media`) || messageItem.attachments[i].toLowerCase().endsWith(`.mov?alt=media`) || messageItem.attachments[i].toLowerCase().endsWith(`.webm?alt=media`)) {
          attachmentItem = `<video id="${messageID}Attachment${i}"> </video>`;
        } else if (messageItem.attachments[i].toLowerCase().endsWith(`.mp3?alt=media`) || messageItem.attachments[i].toLowerCase().endsWith(`.wav?alt=media`) || messageItem.attachments[i].toLowerCase().endsWith(`.ogg?alt=media`) || messageItem.attachments[i].toLowerCase().endsWith(`.aac?alt=media`) || messageItem.attachments[i].toLowerCase().endsWith(`.m4a?alt=media`)) {
          attachmentItem = `<audio controls id="${messageID}Attachment${i}"> </audio>`;
        } else if (messageItem.attachments[i].toLowerCase().endsWith(`.gif`)) {
          attachmentItem = `<img onclick="fullscreenImage('${messageID}Attachment${i}', true)" id="${messageID}Attachment${i}"  class="bonusContentAttachmentImage"> </img>`;
        } else {
          const matches = /\.([0-9a-z]+)(?:[\?#]|$)/i.exec(messageItem.attachments[i]);
          const boxIcon = (0, _display.fileTypeMatches)(matches);
          attachmentItem = `<div id="${messageID}NoAttachment${i}" class="bonusContentAttachmentImage bonusContentNoImage"><div><b>${matches[1].toLowerCase().capitalize()} File</b><i class="bx ${boxIcon}"></i></div></div>`;
        }

        bonusContent.attachments = bonusContent.attachments + attachmentItem;
      }

      bonusContent.attachments = bonusContent.attachments + '</div>';
      availableToAdd = false;
      availableToAddedTo = false;
    }

    if (messageItem.pings && messageItem.pings.length) {
      bonusContent.containerClasses = bonusContent.containerClasses + ' messageBoxContainsPings';
      bonusContent.pings = `<div class="messageBoxPings">`;

      for (let i = 0; i < messageItem.pings.length; i++) {
        const ping = messageItem.pings[i].split('.');
        bonusContent.pings = bonusContent.pings + `<img class="imgClickablePing hidden userContextItem" guildUID="${ping[1]}" onclick="openUserCard('${ping[1]}')" id="${messageID}Ping${ping[1]}"/>`;
      }

      bonusContent.pings = bonusContent.pings + '</div>';
    }

    if (messageItem.links && messageItem.links.length) {
      bonusContent.containerClasses = bonusContent.containerClasses + ` messageBoxContainsLinks linksCount${messageItem.links.length}`;
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
          `;
        }

        var img = new Image();

        img.onload = () => {
          $(`#${messageID}LinkNum${i}`).removeClass('invisible');
          $(`#${messageID}LinkNum${i}`).attr('src', img.src);
        };

        img.onerror = () => {
          $(`#${messageID}LinkNum${i}`).addClass('hidden');
        };

        img.src = link.image;
      }

      bonusContent.links = bonusContent.links + `</div>`;
      availableToAdd = false;
      availableToAddedTo = false;
    }

    const reg = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*?[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig;
    const matches = messageContent.match(reg);

    if (matches && matches.length) {
      console.log(matches);

      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        let id = match.split(`?v=`)[1];

        if (!id) {
          id = match.split('.be/')[1];
        }

        bonusContent.containerClasses = bonusContent.containerClasses + ` messageBoxContainsYouTube`;
        bonusContent.YouTube = `<div class="messageBoxYouTube">`;
        bonusContent.YouTube = bonusContent.YouTube + `
          <div class="YouTubeEmbed">
            <div class="plyr__video-embed">
              <iframe src="https://www.youtube.com/embed/${id}" allowfullscreen allowtransparency></iframe>
            </div>
          </div>
        `;
      }

      bonusContent.YouTube = bonusContent.YouTube + `</div>`;
      availableToAdd = false;
      availableToAddedTo = false;
    }

    if (prevMessageDate.getFullYear() !== newMessageDate.getFullYear() || prevMessageDate.getMonth() !== newMessageDate.getMonth() || prevMessageDate.getDate() !== newMessageDate.getDate()) {
      // Different days. Send divider and subsequently clear previous chat message UID.
      dividerCode = `<span class="chatMessageDivider">${newMessageDate.toLocaleDateString("en-US", {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: '2-digit'
      })}</span>`;
      dividerCode2 = 'containsDivider';
      availableToAdd = false;
    }

    const a = document.createElement('div');
    a.setAttribute('sentBy', messageItem.uid);
    a.setAttribute('tS', messageItem.timestamp);
    a.setAttribute('availableToBeAddedTo', availableToAddedTo || '');
    a.setAttribute('availableToAdd', availableToAdd);
    a.setAttribute('class', `chatMessage channelChatMessage ${messageItem.uid === user.uid ? 'selfChatMessage' : 'otherChatMessage'} ${dividerCode2} ${bonusContent.containerClasses}`);
    a.id = `MessageOfID${messageID}`;
    let containerStart = ``;
    let containerEnd = ``;
    let innerMessageContent = `
      <div class="relative" id="messageContentContainerOfID${messageID}">
        ${bonusContent.pings}
        <div class="messageContentContentContainer messageContentItemForContext loneEmoji${messageContent.length} acceptLeftClick ${bonusContent.edited ? 'editedMessage' : ''} ${bonusContent.classes}" guildUID="${guildUID}" messageID="${messageID}" messageSenderName="${messageItem.author}" messageSender="${messageItem.uid}" messageType="Channel" channelID="${scopedActiveChannel}" id="messageContentOfID${messageID}">
          ${messageContent}
        </div>
        <div id="editedMessageOfID${messageID}" class="editedMessageIcon ${bonusContent.edited ? '' : 'hidden'} animated zoomIn">
          <i id="editedMessageIconOfID${messageID}" class="bx bx-pencil"></i>
        </div>
      </div>
    `;

    if (messageItem.uid == user.uid) {
      containerStart = `${dividerCode}<div class="topLevelMessageContentTwo">`;
      containerEnd = `</div>`;
    } else {
      containerStart = `${dividerCode}
        <div class="topLevelMessageContentTwo"> <img userID="${messageItem.uid}" username="${messageItem.author}" guildUID="${guildUID}" guildID="${guildID}" id="profilePhotoOfMessageID${messageID}" onclick="openUserCard('${messageItem.uid}')" class="otherChatMessageImageProfile userContextItem hidden" src="" />`;
      containerEnd = `</div>`;
    }

    a.innerHTML = `${containerStart}<div class="topLevelContainerMessage"><span class="chatMessageNameplate">${messageItem.author.capitalize()}</span><span id="chatMessageTimestamp${messageID}" class="chatMessageTimestamp">${(0, _display.tConvert)(new Date(messageItem.timestamp).toTimeString().split(' ')[0])}</span></div>${innerMessageContent}${containerEnd}${bonusContent.attachments}${bonusContent.links}${bonusContent.YouTube}`;

    if ($(`#${scopedActiveChannel}${targetDirectory}`).children().last().attr('sentBy') === messageItem.uid && $(`#${scopedActiveChannel}${targetDirectory}`).children().last().attr('availableToBeAddedTo') && availableToAdd) {
      $(`#${scopedActiveChannel}${targetDirectory}`).children().last().children().last().append(innerMessageContent); // Becuase of pings, another children().last().
    } else {
      $(`#${scopedActiveChannel}${targetDirectory}`).get(0).appendChild(a);
    }

    if (messageItem.pings && messageItem.pings.length) {
      for (let i = 0; i < messageItem.pings.length; i++) {
        const ping = messageItem.pings[i].split('.');
        const imageURL = await (0, _display.returnProperURL)(ping[1]);
        $(`#${messageID}Ping${ping[1]}`).attr(`src`, imageURL);
        (0, _display.displayImageAnimation)(`${messageID}Ping${ping[1]}`);
      }
    }

    window.setTimeout(async () => {
      if ($(`#profilePhotoOfMessageID${messageID}`).length) {
        $(`#profilePhotoOfMessageID${messageID}`).attr('src', await (0, _display.returnProperURL)(messageItem.uid));
        (0, _display.displayImageAnimation)(`profilePhotoOfMessageID${messageID}`);
      }

      if (messageItem.attachments) {
        for (let i = 0; i < messageItem.attachments.length; i++) {
          if ($(`#${messageID}NoAttachment${i}`).length) {
            $(`#${messageID}NoAttachment${i}`).get(0).setAttribute(`onclick`, `window.open('${messageItem.attachments[i]}')`);
          } else {
            const src = await (0, _display.returnProperAttachmentURL)(messageItem.attachments[i]);
            $(`#${messageID}Attachment${i}`).get(0).setAttribute(`src`, src);
            $(`#${messageID}Attachment${i}`).get(0).setAttribute(`fullSrc`, messageItem.attachments[i].replaceAll(`attachmentsPreview`, `attachments`).replaceAll(`-resized`, ''));

            if (src.includes(`https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/app%2FmissingFile.png?alt=media`)) {
              $(`#${messageID}Attachment${i}`).get(0).setAttribute(`poster`, src);
            } else {
              channelPlayers[messageID] = new Plyr(`#${messageID}Attachment${i}`, {
                controls: ['play', 'progress', 'current-time', 'mute', 'fullscreen']
              });
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
              (0, _display.returnProperLinkThumbnail)(link, i, messageID);
            }
          }
        }
      }, 49);
    }, 99);

    if ($(`#deleteButton${messageID}`).length) {
      tippy(`#deleteButton${messageID}`, {
        content: 'Delete Message',
        placement: 'top'
      });
    }

    tippy(`#editedMessageIconOfID${messageID}`, {
      content: `Edited ${messageItem.edited ? timeago.format(new Date(messageItem.editedDate)) : 'not'}`,
      placement: 'top'
    });

    if (messageItem.edited) {
      $(`#editedMessageOfID${messageID}`).removeClass('hidden');
    }

    if (targetDirectory == 'ChatMessages') {
      (0, _display.scrollBottomMessages)(scopedActiveChannel);
    }

    resolve(true);
  });
}

window.deleteLoneImage = (channelID, messageID) => {
  deleteMessage(channelID, messageID);
};

window.sendChannelChatMessage = async (guildUID, guildID, channelID, force) => {
  const scopedActiveChannel = `${guildUID}${guildID}${channelID}`;
  let message = $(`#${scopedActiveChannel}ChatMessageInput`).val();

  if (!message.length && !force) {
    if (PendingAttachments[scopedActiveChannel] && PendingAttachments[scopedActiveChannel].length) {
      message = ``;
    } else {
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

  if (matches) {
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      linkPreviewContent = linkPreviewContent.replaceAll(match, ``);
    }
  }

  if (linkPreviewContent.includes('https') || linkPreviewContent.includes('http')) {
    notifyTiny('Generating preview.', true);
    const getLinkPreview = (0, _functions.httpsCallable)(functions, "getLinkPreview");
    result = await getLinkPreview({
      content: linkPreviewContent
    });
    result = result.data.data;
  } // Change message content track: into track:id.artist.name


  const words = message.split(' ');

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    if (word.includes('track:')) {
      const trackID = word.split('track:')[1];
      const trackDetails = await makeMusicRequest(`songs/${trackID}`); // Get track details.

      console.log(trackDetails);

      if (trackDetails.data[0].attributes.name) {
        message = message.replace(word, `track:${trackID}.${trackDetails.data[0].attributes.name.replaceAll(".", "&ParallelPeriod&")}.${trackDetails.data[0].attributes.artistName.replaceAll(".", "&ParallelPeriod&")}`.replaceAll(" ", "&ParallelSpace&"));
      }
    }
  }

  hideAttachmentManager(scopedActiveChannel);

  if (!PendingAttachments[scopedActiveChannel]) {
    PendingAttachments[scopedActiveChannel] = [];
  }

  let finalAttachments = [];

  for (let i = 0; i < PendingAttachments[scopedActiveChannel].length; i++) {
    const file = PendingAttachments[scopedActiveChannel][i];
    const imageID = new Date().getTime();
    (0, _display.showUploadProgress)();
    finalAttachments.push(await uploadAttachmentFile(scopedActiveChannel, imageID, file));

    if (['jpg', 'jpeg', 'png'].includes(file.name.split('.').pop().toLowerCase())) {
      const resizeImages = (0, _functions.httpsCallable)(functions, "resizeImages");
      await resizeImages({
        targetChannel: scopedActiveChannel,
        filePath: `attachments/${scopedActiveChannel}/${user.uid}/${imageID}.${file.name.split(".").pop()}`
      });
    }

    (0, _display.hideUploadProgress)();
  }

  if (pendingGif) {
    finalAttachments.push(pendingGif);
    pendingGif = null; // Select text field

    $(`#${scopedActiveChannel}ChatMessageInput`).focus();
  }

  PendingAttachments[scopedActiveChannel] = [];
  $(`#${scopedActiveChannel}AttachmentManagerContent`).empty();
  (0, _sounds.playMessageSound)();
  window.setTimeout(() => {
    disableMessageSending = false;
  }, 999);
  await (0, _database.push)((0, _database.ref)(rtdb, `channels/${scopedActiveChannel}/messages`), {
    pings: messagePings[scopedActiveChannel],
    attachments: finalAttachments,
    author: cacheUser.username,
    timestamp: (0, _database.serverTimestamp)(),
    content: message,
    uid: user.uid,
    links: result
  });
  messagePings[scopedActiveChannel] = [];
  skipOptimisticEvaluation = true; // This will prevent an unnecessary mark as read. When the message is confirmed, channel will be marked.

  await (0, _database.update)((0, _database.ref)(rtdb, `servers/${guildUID}${guildID}`), {
    [channelID]: (0, _database.serverTimestamp)()
  });
  const perspectiveapi = await fetch("https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=AIzaSyDwSVIkiXmE5CFqOkqyew75zX5pRbpuboo", {
    body: `{comment: {text: "${(0, _display.securityConfirmTextIDs)(message, true)}"}, languages: ["en"], requestedAttributes: {TOXICITY:{}, SEVERE_TOXICITY: {}} }`,
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });
  const perspective = await perspectiveapi.json();

  if (perspective && perspective.attributeScores && perspective.attributeScores["SEVERE_TOXICITY"] && perspective.attributeScores["SEVERE_TOXICITY"].summaryScore.value > 0.8) {
    (0, _display.openModal)('toxicityWarning');
  }
};

function markChannelAsRead(guildUID, guildID, channelID) {
  return new Promise(async (resolve, reject) => {
    if (channelID.includes('Settings')) {
      resolve(false);
      return;
    } // Ignore settings channel.


    if (!addPendingIndicator[`${guildUID}${guildID}${channelID}`]) {
      resolve(false);
      return;
    } // No unread indicator.


    addPendingIndicator[`${guildUID}${guildID}${channelID}`] = false;

    if (skipOptimisticEvaluation) {
      console.log(`Skipping optimistic evaluation.`);
      skipOptimisticEvaluation = false;
      resolve(false);
      return;
    }

    (0, _servers.removeIndicator)(guildUID, guildID, channelID);
    await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `Unread/${user.uid}`), {
      [`${guildUID}${guildID}${channelID}`]: (0, _firestore.serverTimestamp)()
    });
    (0, _servers.checkServerUnread)(guildUID, guildID);
    resolve(true);
  });
}

async function markChannelAsUnread(guildUID, guildID, channelID) {
  if (currentServerUser == guildUID && currentServer == guildID && currentChannel == channelID && channelTabLibrary[`${guildUID}${guildID}${channelID}`] == 'Chat') {
    closeCurrentChannel();
  }

  (0, _servers.addIndicator)(guildUID, guildID, channelID);
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `Unread/${user.uid}`), {
    [`${guildUID}${guildID}${channelID}`]: 0
  });
  console.log('Marked channel as unread.');
  (0, _servers.checkServerUnread)(guildUID, guildID);
}

async function muteChannel(guildUID, guildID, channelID, showNotification) {
  $(`#${guildUID}${guildID}${channelID}guildChannelElement`).addClass('mutedChannelNotificationTransition');
  $(`#${guildUID}${guildID}${channelID}channelNotify`).removeClass('zoomIn');
  $(`#${guildUID}${guildID}${channelID}channelNotify`).removeClass('zoomOut');
  $(`#${guildUID}${guildID}${channelID}channelMuteButton`).addClass('disabled');
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
    mutedServers: (0, _firestore.arrayUnion)(`${guildUID}${guildID}${channelID}`)
  });

  if (showNotification) {
    snac('Lounge Muted', '', 'success');
  }

  window.setTimeout(() => {
    $(`#${guildUID}${guildID}${channelID}channelMuteButton`).html('<i class="bx bx-bell-off"></i>');

    try {
      $(`#${guildUID}${guildID}${channelID}channelMuteButton`).get(0)._tippy.setContent('Unmute Lounge');

      $(`#${guildUID}${guildID}${channelID}channelMuteButton`).get(0).onclick = () => unmuteChannel(guildUID, guildID, channelID, false);
    } catch (error) {}

    $(`#${guildUID}${guildID}${channelID}channelMuteButton`).removeClass('disabled');
    $(`#${guildUID}${guildID}${channelID}guildChannelElement`).removeClass('mutedChannelNotificationTransition');
  }, 800);
  (0, _servers.checkServerUnread)(guildUID, guildID);
}

async function unmuteChannel(guildUID, guildID, channelID, showNotification) {
  $(`#${guildUID}${guildID}${channelID}guildChannelElement`).addClass('mutedChannelNotificationTransition');
  $(`#${guildUID}${guildID}${channelID}channelNotify`).removeClass('zoomIn');
  $(`#${guildUID}${guildID}${channelID}channelNotify`).removeClass('zoomOut');
  $(`#${guildUID}${guildID}${channelID}channelMuteButton`).addClass('disabled');
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
    mutedServers: (0, _firestore.arrayRemove)(`${guildUID}${guildID}${channelID}`)
  });

  if (showNotification) {
    snac('Lounge Unmuted', '', 'success');
  }

  window.setTimeout(() => {
    $(`#${guildUID}${guildID}${channelID}channelMuteButton`).html('<i class="bx bx-bell-off"></i>');

    try {
      $(`#${guildUID}${guildID}${channelID}channelMuteButton`).get(0)._tippy.setContent('Mute Lounge');

      $(`#${guildUID}${guildID}${channelID}channelMuteButton`).get(0).onclick = () => muteChannel(guildUID, guildID, channelID, false);
    } catch (error) {}

    $(`#${guildUID}${guildID}${channelID}channelMuteButton`).removeClass('disabled');
    $(`#${guildUID}${guildID}${channelID}guildChannelElement`).removeClass('mutedChannelNotificationTransition');
  }, 800);
  (0, _servers.checkServerUnread)(guildUID, guildID);
}

async function deleteMessage(channelID, messageID) {
  await (0, _database.remove)((0, _database.ref)(rtdb, `channels/${channelID}/messages/${messageID}`));
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
  } else {
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
  `);
  $(`#messageLabel${scopedActiveChannel}`).html('Add a caption:');
}

function hideAttachmentManager(scopedActiveChannel) {
  $(`#${scopedActiveChannel}AttachmentManager`).removeClass('ManagerShown');
  $(`#${scopedActiveChannel}AttachmentManagerContent`).removeClass('fadeIn');
  $(`#${scopedActiveChannel}AttachmentManagerContent`).addClass('fadeOut');
  $(`#${scopedActiveChannel}ChatMessages`).css('height', '');
  ;
  $(`#messageLabel${scopedActiveChannel}`).html('Send a message:');
  window.setTimeout(() => {
    $(`#${scopedActiveChannel}AttachmentManager`).addClass('hidden');
    $(`#${scopedActiveChannel}AttachmentManagerContent`).addClass('hidden');
  }, 1000);
}

window.addAttachment = scopedActiveChannel => {
  $("#standardImageInput").off();
  $("#standardImageInput").val('');
  $("#standardImageInput").change(async () => {
    processAttachment(scopedActiveChannel);
  });
  $('#standardImageInput').get(0).click();
};

async function processAttachment(scopedActiveChannel, files) {
  let filesList = files;

  if (!$(`#${scopedActiveChannel}AttachmentManagerContent`).length) {
    return;
  }

  if (!files) {
    filesList = document.getElementById("standardImageInput").files;
  } // Redone processor.


  for (let i = 0; i < filesList.length; i++) {
    if ((0, _stripe.checkValidSubscription)(cacheUser.subscription)) {
      if (filesList[i].size > 32 * 1000000) {
        snac(`File Size Error`, `Your file, ${filesList[i].name}, is too large. There is a 32MB limit per file.`, 'danger');
        continue;
      }
    } else {
      if (filesList[i].size > 10 * 1000000) {
        snac(`File Size Error`, `Your file, ${filesList[i].name}, is too large. There is a 10MB limit per file. Upgrade to Parallel Infinite to increase this limit to 32MB.`, 'danger');
        continue;
      }
    }

    if (!filesList[i].type) {
      snac(`File Type Error`, `Your file is invalid.`, 'danger');
      continue;
    }

    if (PendingAttachments[scopedActiveChannel] && PendingAttachments[scopedActiveChannel].length > 8) {
      snac(`File Limit`, `Your file, ${filesList[i].name}, could not be uploaded. You can only add 8 files to each message.`, 'danger');
      return;
    }

    if (blockUploads) {
      if ((0, _stripe.checkValidSubscription)(cacheUser.subscription)) {
        snac('Storage Limit', `You may only upload 9GB of files. Manage your uploads in "Settings > General > Storage".`);
      } else {
        snac('Storage Limit', `You may only upload 3GB of files. Manage your uploads in "Settings > General > Storage". Upgrade to Parallel Infinite to increase this limit to 9GB.`);
      }

      return;
    }

    showAttachmentManager(scopedActiveChannel);
    $(`#${scopedActiveChannel}ChatMessageInput`).get(0).focus();

    if (PendingAttachments[scopedActiveChannel] == undefined) {
      PendingAttachments[scopedActiveChannel] = [];
    }

    PendingAttachments[scopedActiveChannel].push(filesList[i]);
    updateChannelCaptionPreview(scopedActiveChannel);
  }
}

function uploadAttachmentFile(scopedActiveChannel, timeOrID, file) {
  return new Promise(async (resolve, reject) => {
    const uploadTask = (0, _storage.uploadBytesResumable)((0, _storage.ref)(storage, `attachments/${scopedActiveChannel}/${user.uid}/${timeOrID}.${file.name.split('.').pop()}`), file);
    uploadTask.on('state_changed', snapshot => {
      const progress = snapshot.bytesTransferred / snapshot.totalBytes * 100;
      $('#uploadProgressNumber').html(`Upload Progress: ${progress.toFixed(0)}%`);
    });

    if (['jpg', 'jpeg', 'png'].includes(file.name.split('.').pop().toLowerCase())) {
      uploadTask.then(() => {
        // Resolve with the resized path.
        resolve(`https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/attachmentsPreview%2F${scopedActiveChannel}%2F${user.uid}%2F${timeOrID}-resized.${file.name.split(".").pop()}?alt=media`);
      });
    } else {
      uploadTask.then(() => {
        resolve(`https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/attachments%2F${scopedActiveChannel}%2F${user.uid}%2F${timeOrID}.${file.name.split(".").pop()}?alt=media`);
      });
    }
  });
}

function updateChannelCaptionPreview(scopedActiveChannel) {
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

    if (file.name.toLowerCase().endsWith(`.png`) || file.name.toLowerCase().endsWith(`.jpg`) || file.name.toLowerCase().endsWith(`.gif`) || file.name.toLowerCase().endsWith(`.jpeg`)) {
      attachmentItem = `<img src="${url}" class="PendingAttachmentFile"> </img>`;
    } else if (file.name.toLowerCase().endsWith(`.mp4`) || file.name.toLowerCase().endsWith(`.webm`) || file.name.toLowerCase().endsWith(`.mov`)) {
      attachmentItem = `<video src="${url}" class="PendingAttachmentFile PendingAttachmentVideo${uID}"> </video>`;
    } else {
      attachmentItem = `<div onclick="window.open('${url}')" class="PendingAttachmentFile NoMediaAttachment"><i class="bx bx-file"></i></div>`;
    }

    a.innerHTML = `${attachmentItem}<button onclick="removeChannelAttachmentFromList('${scopedActiveChannel}', '${i}')" class="btn attachmentRemoveButton"><i class='bx bx-x'></i></button>`;
    $(`#${scopedActiveChannel}AttachmentManagerContent`).get(0).appendChild(a);
  }

  $(`.PendingAttachmentVideo${scopedActiveChannel}`).each((index, element) => {
    if (!$(element).hasClass(`PLYRON${scopedActiveChannel}`)) {
      $(element).addClass(`PLYRON${scopedActiveChannel}`);
      channelPendingPlayers[scopedActiveChannel + index] = new Plyr(element, {
        controls: ['play', 'progress', 'mute', 'fullscreen']
      });
      channelPendingPlayers[scopedActiveChannel + index].volume = defaultVolume;
    }
  });

  if (PendingAttachments[scopedActiveChannel].length === 0) {
    hideAttachmentManager(scopedActiveChannel);
  }
}

window.removeChannelAttachmentFromList = (scopedActiveChannel, index) => {
  PendingAttachments[scopedActiveChannel].splice(parseInt(index), 1);
  updateChannelCaptionPreview(scopedActiveChannel);
};

async function deleteChannel(guildUID, guildID, channelID, channelName) {
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${guildUID}/servers/${guildID}`), {
    channels: (0, _firestore.arrayRemove)(channelID + '.' + channelName),
    [`channelData.${channelID}`]: (0, _firestore.deleteField)()
  });
  await (0, _database.remove)((0, _database.ref)(rtdb, `servers/${guildUID}${guildID}/channelData/${channelID}`));
  await (0, _database.remove)((0, _database.ref)(rtdb, `servers/${guildUID}${guildID}/${channelID}`));
  markChannelAsRead(guildUID, guildID, channelID);
  const deleteLounge = (0, _functions.httpsCallable)(functions, "deleteLounge");
  const result = await deleteLounge({
    guildUID: guildUID,
    guildID: guildID,
    loungeID: channelID,
    loungeName: channelName
  });
}

async function closeCurrentChannel(leaveVoiceToo) {
  try {
    (0, _database.off)((0, _database.query)((0, _database.ref)(rtdb, `${activeMessageListener}`)));
  } catch (error) {}

  try {
    (0, _database.off)((0, _database.query)((0, _database.ref)(rtdb, `${activePinnedListener}`)));
  } catch (error) {}

  try {
    (0, _database.off)((0, _database.query)((0, _database.ref)(rtdb, `${activeVCMusicListener}`)));
    activeVCMusicListener = '';
  } catch (error) {}

  $(`.${currentServerUser}${currentServer}guildChannelActive`).removeClass('guildChannelActive');
  $(`.${currentServerUser}${currentServer}guildChannelActive`).removeClass(`${currentServerUser}${currentServer}guildChannelActive`);
  $(`.${currentServerUser}${currentServer}guildChannelViewActive`).addClass('hidden');
  $(`.${currentServerUser}${currentServer}guildChannelViewActive`).removeClass(`${currentServerUser}${currentServer}guildChannelViewActive`);

  if (leaveVoiceToo) {
    if (currentCall && currentCall.includes('/') && currentCall.split('/')[1] == currentChannel) {
      (0, _voice.endAllCalls)();
    }
  }

  currentChannel = '';
}

window.deleteLoungePrepare = (guildUID, guildID, channelID, channelName) => {
  (0, _display.openModal)('deleteLounge');

  $('#loungeConfirmDelete').get(0).onclick = () => {
    (0, _display.disableButton)($('#loungeConfirmDelete'));
    deleteChannel(guildUID, guildID, channelID, channelName);
    (0, _display.closeModal)();
  };
};

window.renameLoungePrepare = (guildUID, guildID, channelID) => {
  (0, _display.openModal)('renameLounge');
  $('#renameLoungeName').val('');
  $('#renameLoungeName').get(0).addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      $('#renameLoungeButton').get(0).click();
    }
  });

  $('#renameLoungeButton').get(0).onclick = () => renameLoungeConfirm(`${guildUID}`, `${guildID}`, `${channelID}`);
};

async function renameLoungeConfirm(guildUID, guildID, channelID) {
  const newChannelName = (0, _display.securityConfirmTextIDs)($('#renameLoungeName').val(), true);
  (0, _display.closeModal)();
  await (0, _firestore.runTransaction)(db, async transaction => {
    const sfDoc = await transaction.get((0, _firestore.doc)(db, `users/${guildUID}/servers/${guildID}`));
    let newChannelList = [];

    for (let i = 0; i < sfDoc.data().channels.length; i++) {
      if (sfDoc.data().channels[i].split('.')[0] == `${channelID}`) {
        newChannelList.push(`${sfDoc.data().channels[i].split('.')[0]}.${newChannelName}`);
      } else {
        newChannelList.push(sfDoc.data().channels[i]);
      }
    }

    transaction.update((0, _firestore.doc)(db, `users/${guildUID}/servers/${guildID}`), {
      channels: newChannelList
    });
  });
  console.log('transaction update success.');
  snac('Lounge Renamed', '', 'success');
}

function pingDialog(guildUID, guildID, channelID) {
  const scopedActiveChannel = `${guildUID}${guildID}${channelID}`;
  $(`#${scopedActiveChannel}ChatMessageInput`).get(0).addEventListener("keydown", function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      sendChannelChatMessage(guildUID, guildID, channelID);
    }

    ;

    if (event.keyCode === 50 && event.shiftKey) {
      event.preventDefault(); // Start Search

      window.clearInterval(autocompleteTimeout);
      $(`#${scopedActiveChannel}PingSelect`).removeClass('fadeOut');
      $(`#${scopedActiveChannel}PingSelect`).addClass('fadeIn');
      $(`#${scopedActiveChannel}PingSelect`).removeClass('hidden');
      autoCompleteOpen[scopedActiveChannel] = true;
      $(`#${scopedActiveChannel}ChatMessageInputAutocomplete`).get(0).focus();
      $(`#${scopedActiveChannel}AutoCompleteResults`).empty();
      $(`#${scopedActiveChannel}AutoCompleteResults`).html(`<p class="notice">Enter a username.</p>`);
      $(`#${scopedActiveChannel}ChatMessageInputAutocomplete`).val('');

      const handler = event => {
        if (event && event.keyCode === 27) {
          closePingSelector(scopedActiveChannel);
          $(`#${scopedActiveChannel}ChatMessageInput`).get(0).focus();
          return;
        }

        if (event && event.keyCode === 13) {
          event.preventDefault();
          const firstItem = $(`#${scopedActiveChannel}AutoCompleteResults`).children().first().get(0);

          if (firstItem) {
            addPingToMessage(scopedActiveChannel, firstItem.id.split('PingSelector')[1], firstItem.getAttribute('userName'));
          }

          return;
        }

        ;
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
      };

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
};

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

  if (!$(`#${scopedActiveChannel}${guildUID}pingMessage`).length) {
    // If element does not exist
    const a = document.createElement('div');
    a.classList.add('pingPreviewItem');
    a.id = scopedActiveChannel + guildUID + 'pingMessage';
    a.innerHTML = `${userName}<button onclick="removePingFromMessage('${scopedActiveChannel}', '${guildUID}', '${userName}')" class="btn closeButtonPing"><i class="bx bx-x"></i></button>`;
    $(`#${scopedActiveChannel}PingAutocomplete`).get(0).appendChild(a);
    console.log('here');

    if (!messagePings[scopedActiveChannel]) {
      messagePings[scopedActiveChannel] = [];
    }

    messagePings[scopedActiveChannel].push(`${userName}.${guildUID}`);
    (0, _display.insertAtCursor)($(`#${scopedActiveChannel}ChatMessageInput`), `@${userName} `);
  }
};

function hidePingSelectors(scopedActiveChannel) {
  $(`#${scopedActiveChannel}PingAutocomplete`).removeClass('fadeInUp');
  $(`#${scopedActiveChannel}PingAutocomplete`).addClass('fadeOutDown');
  autocompleteTimeout2 = window.setTimeout(() => {
    $(`#${scopedActiveChannel}PingAutocomplete`).addClass('hidden');
    $(`#${scopedActiveChannel}PingAutocomplete`).empty();
  }, 500);
}

window.closePingSelector = scopedActiveChannel => {
  $(`#${scopedActiveChannel}PingSelect`).removeClass('fadeIn');
  $(`#${scopedActiveChannel}PingSelect`).addClass('fadeOut');
  autocompleteTimeout = window.setTimeout(() => {
    $(`#${scopedActiveChannel}PingSelect`).addClass('hidden');
  }, 500);
};

function prepareEditMessage(scopedActiveChannel, messageID) {
  // Delete old element, create new one. Do this to remove listenrs
  $(`#messageContentOfID${messageID}`).get(0).parentNode.replaceChild($(`#messageContentOfID${messageID}`).get(0).cloneNode(true), $(`#messageContentOfID${messageID}`).get(0));
  cachedEditMessages[messageID] = (0, _display.messageHTMLtoText)(null, $(`#messageContentOfID${messageID}`).get(0));
  $(`#messageContentOfID${messageID}`).html((0, _display.messageHTMLtoText)(null, $(`#messageContentOfID${messageID}`).get(0)));
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
  }, 9); // Set listeners

  $(`#messageContentOfID${messageID}`).get(0).addEventListener("keyup", async event => {
    if (event.code == "Enter") {
      event.preventDefault();
      const content = $(`#messageContentOfID${messageID}`).get(0).innerHTML;

      if (cachedEditMessages[messageID] == content) {
        unEditMessage(messageID, scopedActiveChannel);
        return;
      } // Make firebase request


      await (0, _database.update)((0, _database.ref)(rtdb, `channels/${scopedActiveChannel}/messages/${messageID}`), {
        content: content,
        editedDate: (0, _database.serverTimestamp)(),
        edited: true
      }); // Do not create indicator.

      cachedEditMessages[messageID] = content;
      unEditMessage(messageID, scopedActiveChannel);
      console.log('Edited message.');
    } else if (event.code == 'Escape') {
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
  twemoji.parse($(`#messageContentOfID${messageID}`).get(0));
  $(`#${scopedActiveChannel}ChatMessageInput`).get(0).focus();
}
},{"./display":"js/display.js","./voice":"js/voice.js","./vcMusic":"js/vcMusic.js","./servers":"js/servers.js","./friends":"js/friends.js","./stripe":"js/stripe.js","./settings":"js/settings.js","./sounds":"js/sounds.js","./firebaseChecks":"js/firebaseChecks.js"}],"js/electron.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkElectron = checkElectron;
exports.manageDeeplink = manageDeeplink;
exports.resetZoom = resetZoom;
exports.returnIsElectron = returnIsElectron;
exports.zoomIn = zoomIn;
exports.zoomOut = zoomOut;

var _channels = require("./channels");

var _friends = require("./friends");

var _music = require("./music");

var _servers = require("./servers");

window.winBrowserWindow = null;
window.isElectron = null;
window.electronLink = null;
window.markAsReadAfterFocus = {
  type: '',
  id: ''
};

function returnIsElectron() {
  return isElectron;
}

function checkElectron() {
  isElectron = false;

  try {
    eval(`window.electronLink = window.require('electron')`);

    if (electronLink) {
      winBrowserWindow = window.require('@electron/remote');
      isElectron = true; // Will be set to true if it doesn't fail and if its running in electron.
    }
  } catch (e) {
    console.log(e);
    isElectron = false;
  }

  if (isElectron) {
    startElectronStuff();
  }

  ;
}

function startElectronStuff() {
  // Definitely electron.
  electronLink.webFrame.setZoomFactor(parseInt(localStorage.getItem('setting_zoom')) || 1);
  electronLink.ipcRenderer.on('open-media', (event, message) => {
    console.log(event, message);
    manageDeeplink(message.split('parallel://')[1]);
  });
  electronLink.ipcRenderer.on('focus', (event, message) => {
    if (message == 'unfocus') {
      // Clear shades of grey.
      $('#unfocusedStyles').html(`
        :root {
          --primary: grey !important;
          --secondary: grey !important;
        }
      `);
    } else if (message === 'focus') {
      $('#unfocusedStyles').html(``); // Check if there is a message to be marked as read.

      if (markAsReadAfterFocus.type !== '' && markAsReadAfterFocus.id !== '') {
        // Check if the message is a dm message.
        if (markAsReadAfterFocus.type == 'dm') {
          (0, _friends.markDMRead)(markAsReadAfterFocus.id);
        } else {
          (0, _channels.markChannelAsRead)(markAsReadAfterFocus.id.split('.')[0], markAsReadAfterFocus.id.split('.')[1], markAsReadAfterFocus.id.split('.')[2]);
        }

        markAsReadAfterFocus.type = '';
        markAsReadAfterFocus.id = '';
      }
    }
  });

  switch (window.require('os').platform()) {
    case 'darwin':
      $('#pointerStyles').html(`
        :root {
          --defaultByPointer: default;
          --defaultLabelPadding: 0px;
          --iconPlacementDefault: 50%; 
          --iconPlacementGuild: 54%;
          --defaultInputPadding: 13px;
          --questionMarkTop: 19px; 
          --questionMarkRight: 4px;
          --trackAuthorHeight: 20px;
          --chatMessagePadding: 4px;
        }
      `);
      break;

    case 'win32':
      $(`#windowsControls`).removeClass('hidden');
      startWindowControlsListeners();
      break;

    case 'linux':
      $(`#windowsControls`).removeClass('hidden');
      startWindowControlsListeners();
      break;
  }
}

function startWindowControlsListeners() {
  $('#min-button').get(0).onclick = () => {
    winBrowserWindow.getCurrentWindow().minimize();
  };

  $('#max-button').get(0).onclick = () => {
    if (winBrowserWindow.getCurrentWindow().isMaximized()) {
      winBrowserWindow.getCurrentWindow().unmaximize();
    } else {
      winBrowserWindow.getCurrentWindow().maximize();
    }
  };

  $('#close-button').get(0).onclick = () => {
    winBrowserWindow.getCurrentWindow().close();
  };
}

window.sendToElectron = (dataType, dataContent) => {
  if (isElectron) {
    electronLink.ipcRenderer.send(dataType, dataContent);
  }
};

function zoomIn() {
  if (isElectron) {
    if (electronLink.webFrame.getZoomFactor() < 1.6) {
      notifyTiny('Zoomed in.', true);
      electronLink.webFrame.setZoomFactor(electronLink.webFrame.getZoomFactor() + 0.1);
      localStorage.setItem('setting_zoom', electronLink.webFrame.getZoomFactor().toString());
    }
  }
}

function zoomOut() {
  if (isElectron) {
    if (electronLink.webFrame.getZoomFactor() > 0.5) {
      notifyTiny('Zoomed out.', true);
      electronLink.webFrame.setZoomFactor(electronLink.webFrame.getZoomFactor() - 0.1);
      localStorage.setItem('setting_zoom', electronLink.webFrame.getZoomFactor().toString());
    }
  }
}

function resetZoom() {
  if (isElectron) {
    electronLink.webFrame.setZoomFactor(1);
    localStorage.setItem('setting_zoom', electronLink.webFrame.getZoomFactor().toString());
    notifyTiny('Zoom reset.', true);
  }
}

function manageDeeplink(text) {
  window.parts = text.split('.');
  console.log(text);

  switch (parts[0]) {
    case 'playlist':
      (0, _servers.openSpecialServer)('music');
      (0, _music.openOtherPlaylist)(parts[1], parts[2], null, null, null);
      break;

    case 'album':
      (0, _servers.openSpecialServer)('music');
      openAlbum(parts[1]);
      break;

    default:
      break;
  }

  window.history.replaceState(null, null, window.location.pathname);
}
},{"./channels":"js/channels.js","./friends":"js/friends.js","./music":"js/music.js","./servers":"js/servers.js"}],"js/library.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addAlbumToPlaylist = addAlbumToPlaylist;
exports.addPlaylistToFolder = addPlaylistToFolder;
exports.addPlaylistToLibrary = addPlaylistToLibrary;
exports.albumLibraryListener = albumLibraryListener;
exports.artistLibraryListener = artistLibraryListener;
exports.clonePlaylistToLibrary = clonePlaylistToLibrary;
exports.createPlaylist = createPlaylist;
exports.createPlaylistFolder = createPlaylistFolder;
exports.deletePlaylistFolder = deletePlaylistFolder;
exports.exitEditorModePlaylist = exitEditorModePlaylist;
exports.loadPlaylists = loadPlaylists;
exports.openPlaylist = openPlaylist;
exports.prepareDeletePlaylist = prepareDeletePlaylist;
exports.prepareRemovePlaylistFromLibrary = prepareRemovePlaylistFromLibrary;
exports.prepareRenameFolder = prepareRenameFolder;
exports.prepareRenamePlaylist = prepareRenamePlaylist;
exports.removePlaylistFromFolder = removePlaylistFromFolder;
exports.removePlaylistFromLibrary = removePlaylistFromLibrary;
exports.removeTrackFromPlaylist = removeTrackFromPlaylist;
exports.trackLibraryListener = trackLibraryListener;

var _firestore = require("@firebase/firestore");

var _storage = require("@firebase/storage");

var timeago = _interopRequireWildcard(require("timeago.js"));

var _app = require("./app");

var _componentse = require("./componentse");

var _display = require("./display");

var _electron = require("./electron");

var _firebaseChecks = require("./firebaseChecks");

var _music = require("./music");

var _stripe = require("./stripe");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

window.loadedSections = [];
window.cacheLibraryArtists = [];
window.cacheLibraryAlbums = [];
window.cacheLibraryTracks = [];
window.cachePlaylists = [];
window.firstPlaylistLoad = true;
window.playlistListener = null;
window.cachePlaylistData = {};
window.playlistMetaData = {};
window.playlistDataImages = {};
window.animatedFolderTrackOut = [];
window.editorModeTimeouts = {};
window.editorModePlaylist = null;
window.editorModeTracks = new Set();
window.editorLastSelected = null;
(0, _firebaseChecks.checkAppInitialized)();
const db = (0, _firestore.getFirestore)();
const storage = (0, _storage.getStorage)();

window.addToLibrary = async (type, contentID) => {
  // Disable button temporarily
  $(`.likedButton${type}${contentID}`).html(`<i class='bx bx-time loadingIcon'></i>`);
  await (0, _firestore.setDoc)((0, _firestore.doc)(db, `users/${user.uid}/library/${type}`), {
    content: (0, _firestore.arrayUnion)(contentID)
  }, {
    merge: true
  });
  await (0, _display.timer)(399);
  $(`.likedButton${type}${contentID}`).html(`<i class="bx bxs-heart"></i>`);

  $(`.likedButton${type}${contentID}`).get(0).onclick = () => {
    removeFromLibrary(type, contentID);
  };

  checkEmptySaved();
};

window.removeFromLibrary = async (type, contentID) => {
  // Disable button temporarily
  $(`.likedButton${type}${contentID}`).html(`<i class='bx bx-time loadingIcon'></i>`);
  await (0, _display.timer)(199);
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}/library/${type}`), {
    content: (0, _firestore.arrayRemove)(contentID)
  });
  $(`.likedButton${type}${contentID}`).html(`<i class="bx bx-heart"></i>`);

  $(`.likedButton${type}${contentID}`).get(0).onclick = () => {
    addToLibrary(type, contentID);
  };

  checkEmptySaved();
};

function artistLibraryListener() {
  (0, _firestore.onSnapshot)((0, _firestore.doc)(db, `users/${user.uid}/library/artists`), async doc => {
    if (!doc.exists()) {
      $('#artistsLibraryDivider').addClass('hidden');
      $('#savedContent_artists').addClass('hidden');
      checkEmptySaved();
      return;
    }

    if (doc.data().content.length) {
      // Fade in
      $('#artistsLibraryDivider').removeClass('fadeOut');
      $('#savedContent_artists').removeClass('fadeOut');
      $('#artistsLibraryDivider').addClass('fadeIn');
      $('#savedContent_artists').addClass('fadeIn');
      $('#artistsLibraryDivider').removeClass('hidden');
      $('#savedContent_artists').removeClass('hidden');
    } else {
      // Fade out
      $('#artistsLibraryDivider').addClass('fadeOut');
      $('#savedContent_artists').addClass('fadeOut');
      $('#artistsLibraryDivider').removeClass('fadeIn');
      $('#savedContent_artists').removeClass('fadeIn');
      window.setTimeout(() => {
        $('#artistsLibraryDivider').addClass('hidden');
        $('#savedContent_artists').addClass('hidden');
      }, 950);
    }

    const artistsList = doc.data().content;
    const artistsListForward = (0, _display.commonArrayDifference)(artistsList, cacheLibraryArtists);
    const artistsListBackward = (0, _display.commonArrayDifference)(cacheLibraryArtists, artistsList);
    cacheLibraryArtists = artistsList;

    if (artistsListForward.length) {
      let finalArtistsArray = [];

      while (artistsListForward.length) {
        finalArtistsArray.push(artistsListForward.splice(0, 250));
      }

      for (let i = 0; i < finalArtistsArray.length; i++) {
        const data = await makeMusicRequest(`artists?ids=${finalArtistsArray[i].join(',')}`);

        for (let j = 0; j < data.data.length; j++) {
          const artist = data.data[j];
          (0, _componentse.createArtist)(artist, 'savedContent_artists', `savedArtist${artist.id}`);
        }
      }
    }

    for (let i = 0; i < artistsListBackward.length; i++) {
      $(`#savedArtist${artistsListBackward[i]}`).addClass('music-artist-gone');
      window.setTimeout(() => {
        $(`#savedArtist${artistsListBackward[i]}`).remove();
      }, 550);
    }

    checkEmptySaved();
  });
}

function albumLibraryListener() {
  (0, _firestore.onSnapshot)((0, _firestore.doc)(db, `users/${user.uid}/library/albums`), async doc => {
    if (!doc.exists()) {
      $('#albumsLibraryDivider').addClass('hidden');
      $('#savedContent_albums').addClass('hidden');
      checkEmptySaved();
      return;
    }

    if (doc.data().content.length) {
      // Fade in
      $('#albumsLibraryDivider').removeClass('fadeOut');
      $('#savedContent_albums').removeClass('fadeOut');
      $('#albumsLibraryDivider').addClass('fadeIn');
      $('#savedContent_albums').addClass('fadeIn');
      $('#albumsLibraryDivider').removeClass('hidden');
      $('#savedContent_albums').removeClass('hidden');
    } else {
      // Fade out
      $('#albumsLibraryDivider').addClass('fadeOut');
      $('#savedContent_albums').addClass('fadeOut');
      $('#albumsLibraryDivider').removeClass('fadeIn');
      $('#savedContent_albums').removeClass('fadeIn');
      window.setTimeout(() => {
        $('#albumsLibraryDivider').addClass('hidden');
        $('#savedContent_albums').addClass('hidden');
      }, 950);
    }

    const albumsList = doc.data().content;
    const albumsListForward = (0, _display.commonArrayDifference)(albumsList, cacheLibraryAlbums);
    const albumsListBackward = (0, _display.commonArrayDifference)(cacheLibraryAlbums, albumsList);
    cacheLibraryAlbums = albumsList;

    if (albumsListForward.length) {
      let finalAlbumsArray = [];

      while (albumsListForward.length) {
        finalAlbumsArray.push(albumsListForward.splice(0, 250));
      }

      console.log(finalAlbumsArray);

      for (let i = 0; i < finalAlbumsArray.length; i++) {
        const data = await makeMusicRequest(`albums?ids=${finalAlbumsArray[i].join(',')}`);

        for (let j = 0; j < data.data.length; j++) {
          const album = data.data[j];
          (0, _componentse.createAlbum)(album, 'savedContent_albums', `savedAlbum${album.id}`);
        }
      }
    }

    for (let i = 0; i < albumsListBackward.length; i++) {
      $(`#savedAlbum${albumsListBackward[i]}`).addClass('music-album-gone');
      window.setTimeout(() => {
        $(`#savedAlbum${albumsListBackward[i]}`).remove();
      }, 550);
    }

    checkEmptySaved();
  });
}

function trackLibraryListener() {
  (0, _firestore.onSnapshot)((0, _firestore.doc)(db, `users/${user.uid}/library/tracks`), async doc => {
    if (!doc.exists()) {
      $('#tracksLibraryDivider').addClass('hidden');
      $('#savedContent_tracks').addClass('hidden');
      checkEmptySaved();
      return;
    }

    if (doc.data().content.length) {
      // Fade in
      $('#tracksLibraryDivider').removeClass('fadeOut');
      $('#savedContent_tracks').removeClass('fadeOut');
      $('#tracksLibraryDivider').addClass('fadeIn');
      $('#savedContent_tracks').addClass('fadeIn');
      $('#tracksLibraryDivider').removeClass('hidden');
      $('#savedContent_tracks').removeClass('hidden');
    } else {
      // Fade out
      $('#tracksLibraryDivider').addClass('fadeOut');
      $('#savedContent_tracks').addClass('fadeOut');
      $('#tracksLibraryDivider').removeClass('fadeIn');
      $('#savedContent_tracks').removeClass('fadeIn');
      window.setTimeout(() => {
        $('#tracksLibraryDivider').addClass('hidden');
        $('#savedContent_tracks').addClass('hidden');
      }, 950);
    }

    const tracksList = doc.data().content;
    const tracksListForward = (0, _display.commonArrayDifference)(tracksList, cacheLibraryTracks);
    const tracksListBackward = (0, _display.commonArrayDifference)(cacheLibraryTracks, tracksList);
    cacheLibraryTracks = tracksList;

    if (tracksListForward.length) {
      let finalTracksArray = [];

      while (tracksListForward.length) {
        finalTracksArray.push(tracksListForward.splice(0, 250));
      }

      for (let i = 0; i < finalTracksArray.length; i++) {
        const data = await makeMusicRequest(`songs?ids=${finalTracksArray[i].join(',')}`);

        for (let j = 0; j < data.data.length; j++) {
          const track = data.data[j];
          (0, _componentse.createTrack)(track, 'savedContent_tracks', null, `savedTrack${track.id}`, []);
        }
      }
    }

    for (let i = 0; i < tracksListBackward.length; i++) {
      $(`#savedTrack${tracksListBackward[i]}`).addClass('music-track-gone');
      window.setTimeout(() => {
        $(`#savedTrack${tracksListBackward[i]}`).remove();
      }, 550);
    }

    checkEmptySaved();
  });
}

function checkEmptySaved() {
  if (!cacheLibraryAlbums.length && !cacheLibraryArtists.length && !cacheLibraryTracks.length) {
    $('#noSavedContent').removeClass('hidden');
  } else {
    $('#noSavedContent').addClass('hidden');
  }
}

function createPlaylist(addTrackIDToPlaylist, playlistNameInput, skipNotify, addAlbumIDToPlaylist) {
  return new Promise(async (resolve, reject) => {
    // Check if limit on playlists.
    if ((0, _stripe.checkValidSubscription)(cacheUser.subscription)) {
      if (cachePlaylists.length > 72) {
        snac(`Playlist Limit`, `You have reached the maximum playlist count.`, 'danger');
        resolve(false);
        return;
      }
    } else {
      if (cachePlaylists.length > 42) {
        snac(`Playlist Limit`, `You have reached the maximum playlist count. Upgrade to Parallel Infinite to create 40 more.`, 'danger');
        resolve(false);
        return;
      }
    }

    let playlistName;

    if (playlistNameInput) {
      playlistName = (0, _display.securityConfirmTextIDs)(playlistNameInput, true).trim();
    } else {
      playlistName = (0, _display.securityConfirmTextIDs)($('#newPlaylistName').val(), true).trim();
    }

    (0, _display.closeModal)();

    if (playlistName.length > 48) {
      snac('Invalid Playlist Title', `Your playlist's title cannot be more than 48 characters. Proceeding with only the first 48 characters...`, 'danger');
      playlistName = `${playlistName.substring(0, 48)}...`;
    }

    if (!playlistName.length) {
      snac('Invalid Playlist Title', `Your playlist's title cannot be empty.`, 'danger');
      window.setTimeout(() => {
        openNewPlaylistDialog();
      }, 1500);
      resolve(false);
      return;
    }

    const playlistDoc = await (0, _firestore.addDoc)((0, _firestore.collection)(db, `users/${user.uid}/playlists/`), {
      title: playlistName,
      creator: `${user.uid}.${cacheUser.username}`,
      dateCreated: (0, _firestore.serverTimestamp)(),
      dateModified: (0, _firestore.serverTimestamp)(),
      tracks: [],
      imageURL: ''
    });
    const playlistID = playlistDoc.id;
    await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
      playlists: (0, _firestore.arrayUnion)(`${playlistID}.${playlistName}`),
      playlistCount: (0, _firestore.increment)(1)
    });

    if (!skipNotify) {
      snac('Playlist Created', '', 'success');
    }

    if (addTrackIDToPlaylist) {
      await addTrackToPlaylist(playlistID, addTrackIDToPlaylist);
    }

    if (addAlbumIDToPlaylist) {
      await addAlbumToPlaylist(playlistID, addAlbumIDToPlaylist);
    }

    resolve(playlistID);
    return;
  });
}

async function addPlaylistToLibrary(playlistUID, playlistID, playlistNameInput) {
  let playlistName = playlistNameInput;

  if (!playlistName) {
    const playlistDoc = await (0, _firestore.getDoc)((0, _firestore.doc)(db, `users/${playlistUID}/playlists/${playlistID}`));
    playlistName = playlistDoc.data().title;
  }

  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
    playlists: (0, _firestore.arrayUnion)(`${playlistUID}.${playlistID}.${playlistName}`),
    playlistCount: (0, _firestore.increment)(1)
  }); // Display.

  closeMusicView('Playlist', `${playlistUID}${playlistID}`);
  $(`PlaylistView${playlistUID}${playlistID}`).remove();
  window.setTimeout(() => {
    (0, _music.openOtherPlaylist)(playlistUID, playlistID, playlistName, true, false);
  }, 499);
  snac('Playlist Added', '', 'success');
}

function clonePlaylistToLibrary(playlistUID, playlistID) {
  (0, _display.openModal)('clonePlaylist');

  $(`#clonePlaylistConfirm`).get(0).onclick = async () => {
    (0, _display.closeModal)();
    const playlistDoc = await (0, _firestore.getDoc)((0, _firestore.doc)(db, `users/${playlistUID}/playlists/${playlistID}`));
    let playlistData = playlistDoc.data();
    console.log(playlistData.clone);

    if (playlistData.clone) {
      // Clone already exists
      playlistData.clonedMultiple = true;
    }

    playlistData.clone = `${user.uid}.${cacheUser.username}`;
    playlistData.dateModified = (0, _firestore.serverTimestamp)();
    playlistData.imageURL = '';
    playlistData.title = `Copy of ${playlistData.title}`;
    const newPlaylistID = await createPlaylist(null, playlistData.title, true);

    if (newPlaylistID) {
      await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}/playlists/${newPlaylistID}`), playlistData);
      snac('Playlist Cloned', 'The playlist was cloned to your library successfully.', 'success');
    }
  };
}

async function removePlaylistFromLibrary(playlistUID, playlistID, playlistName, folderContext, skipNotify, deleteView) {
  (0, _display.closeModal)();

  if (folderContext) {
    await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
      playlists: (0, _firestore.arrayRemove)(`${playlistUID}.${playlistID}.${playlistName}`),
      [`playlistFolders.${folderContext}`]: (0, _firestore.arrayRemove)(`${playlistUID}.${playlistID}`),
      playlistCount: (0, _firestore.increment)(-1)
    });
    const folderID = folderContext.split('<')[1];

    if ($(`#playlistFolderContent${folderID}`).hasClass('playlistFolderContentActive')) {
      const oldHeight = $(`#playlistFolderContent${folderID}`).css('height').split('px')[0];
      $(`#playlistFolderContent${folderID}`).css('height', `${parseInt(oldHeight) - 16 - 8 - 8 - 12}px`);
    }
  } else {
    await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
      playlists: (0, _firestore.arrayRemove)(`${playlistUID}.${playlistID}.${playlistName}`),
      playlistCount: (0, _firestore.increment)(-1)
    });
  }

  if (deleteView) {
    $(`#PlaylistView${playlistUID}${playlistID}`).remove();
  }

  if (!skipNotify) {
    snac('Playlist Removed', '', 'success');
  }
}

async function createPlaylistFolder(playlistUID, playlistID) {
  const folderName = (0, _display.securityConfirmTextIDs)($('#newPlaylistFolderName').val(), true).trim().replaceAll(`<`, '');

  if (folderName.length > 48) {
    snac('Invalid Folder Title', `Your folder's title cannot be more than 48 characters.`, 'danger');
    return;
  }

  if (!folderName.length) {
    snac('Invalid Folder Title', `Your folder's title cannot be empty.`, 'danger');
    return;
  }

  (0, _display.closeModal)();
  const folderID = new Date().getTime();
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
    [`playlistFolders.${folderName}<${folderID}`]: [],
    playlistFoldersSort: (0, _firestore.arrayUnion)(folderID)
  });
  snac('Folder Created', '', 'success');

  if (playlistID) {
    addPlaylistToFolder(folderID, folderName, playlistUID, playlistID);
  }
}

Sortable.create($('#musicSidebarPlaylistsPlaylists').get(0), {
  ghostClass: 'sortableSidebarItemGhost',
  onEnd: async () => updatePlaylistsOrder()
});
Sortable.create($('#musicSidebarPlaylistFolders').get(0), {
  ghostClass: 'sortableSidebarItemGhost',
  onEnd: async () => {
    // Overwrite playlists.
    let newFoldersSort = [];
    $('#musicSidebarPlaylistFolders').children('.folderContainer').each((index, object) => {
      const id = $(object).get(0).getAttribute('folderID');
      newFoldersSort.push(id);
    });
    await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
      playlistFoldersSort: newFoldersSort
    });
    console.log('Updated folders sidebar order.');
  }
});

async function updatePlaylistsOrder() {
  let newPlaylists = []; // Top down from folders

  $('.playlistFolderContent').children('.playlistItem').each((index, object) => {
    const playlistUID = $(object).get(0).getAttribute('playlistUID');
    const playlistID = $(object).get(0).getAttribute('playlistID');
    const playlistName = $(object).get(0).getAttribute('playlistName');
    newPlaylists.push(`${playlistUID}.${playlistID}.${playlistName}`);
  });
  $('#musicSidebarPlaylistsPlaylists').children('.playlistItem').each((index, object) => {
    const playlistUID = $(object).get(0).getAttribute('playlistUID');
    const playlistID = $(object).get(0).getAttribute('playlistID');
    const playlistName = $(object).get(0).getAttribute('playlistName');
    newPlaylists.push(`${playlistUID}.${playlistID}.${playlistName}`);
  });
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
    playlists: newPlaylists
  });
  console.log('Updated playlists sidebar order.');
}

async function loadPlaylists() {
  if (!cacheUser.playlists) {
    const deepLink = new URL(window.location.href).searchParams.get('deeplink');

    if (deepLink) {
      (0, _electron.manageDeeplink)(deepLink.replaceAll('pcdiff', '.'));
    }

    return;
  }

  let playlistForward = [];
  let playlistBackward = [];

  if (cacheUser.playlists.length !== cachePlaylists.length) {
    playlistForward = (0, _display.commonArrayDifference)(cacheUser.playlists, cachePlaylists);
    playlistBackward = (0, _display.commonArrayDifference)(cachePlaylists, cacheUser.playlists);
  }

  cachePlaylists = cacheUser.playlists;

  if (firstPlaylistLoad) {
    firstPlaylistLoad = false;

    for (let i = 0; i < cacheUser.playlists.length; i++) {
      buildPlaylist(cacheUser.playlists[i]);
    }

    const deepLink = new URL(window.location.href).searchParams.get('deeplink');

    if (deepLink) {
      (0, _electron.manageDeeplink)(deepLink.replaceAll('pcdiff', '.'));
    }
  } else {
    for (let i = 0; i < playlistForward.length; i++) {
      buildPlaylist(playlistForward[i]);
    }

    for (let i = 0; i < playlistBackward.length; i++) {
      const playlist = playlistBackward[i].split('.');
      let playlistUID = user.uid;
      let playlistID = playlist[0];

      if (playlist.length == 3) {
        // Other playlist
        playlistUID = playlist[0];
        playlistID = playlist[1];
      }

      $(`#playlistButton${playlistUID}${playlistID}`).addClass('playlistItemGone');
      $(`#PlaylistView${playlistUID}${playlistID}`).remove();
      window.setTimeout(() => {
        $(`#playlistButton${playlistUID}${playlistID}`).remove();
      }, 500);
    }
  }

  for (let i = 0; i < cacheUser.playlists.length; i++) {
    const playlist = cacheUser.playlists[i].split('.');
    let playlistUID = user.uid;
    let playlistID = playlist[0];
    let playlistName = playlist[1];

    if (playlist.length == 3) {
      // Other playlist
      playlistUID = playlist[0];
      playlistID = playlist[1];
      playlistName = (0, _display.securityConfirmTextIDs)(playlist[2], true);
    }

    $(`#${playlistUID}${playlistID}PlaylistName`).html(playlistName);
    $(`#playlistButton${playlistUID}${playlistID}`).get(0).setAttribute('playlistName', playlistName);
    twemoji.parse($(`#${playlistUID}${playlistID}PlaylistName`).get(0));
  }

  resetFoldersLayout();
  loadPlaylistFolders(cacheUser.playlists, cacheUser.playlistFolders);
}

function sortNonFolderPlaylists() {
  for (let i = 0; i < cacheUser.playlists.length; i++) {
    let playlistUID = user.uid;
    let playlistID = cacheUser.playlists[i].split('.')[0];

    if (cacheUser.playlists[i].split('.').length == 3) {
      // Other playlist
      playlistUID = cacheUser.playlists[i].split('.')[0];
      playlistID = cacheUser.playlists[i].split('.')[1];
    }

    $(`#playlistButton${playlistUID}${playlistID}`).get(0).setAttribute('data-order', i);
  }

  let sorted = $(`#musicSidebarPlaylistsPlaylists`).children('.playlistItem').sort((a, b) => {
    return parseInt($(a).attr('data-order')) - parseInt($(b).attr('data-order'));
  });
  $(`#musicSidebarPlaylistsPlaylists`).append(sorted);
}

async function addPlaylistToFolder(folderID, folderName, playlistUID, playlistID, unHide) {
  // ANIMATE OUT MAIN AREA. Since its moving in into playlist
  $(`#playlistButton${playlistUID}${playlistID}`).addClass('playlistItemGone');
  await (0, _display.timer)(500);
  $(`#playlistButton${playlistUID}${playlistID}`).get(0).setAttribute('inFolder', `${folderName}<${folderID}`);
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
    [`playlistFolders.${folderName}<${folderID}`]: (0, _firestore.arrayUnion)(`${playlistUID}.${playlistID}`)
  });

  if (unHide) {
    $(`#playlistButton${playlistUID}${playlistID}`).removeClass('hidden');
  }

  $(`#playlistButton${playlistUID}${playlistID}`).removeClass('playlistItemGone');

  if (!$(`#playlistFolderContent${folderID}`).hasClass('playlistFolderContentActive')) {
    expandPlaylistFolder(folderID);
  } else {
    const oldHeight = $(`#playlistFolderContent${folderID}`).css('height').split('px')[0];
    $(`#playlistFolderContent${folderID}`).css('height', `${parseInt(oldHeight) + 48}px`);
  } // Sort now.


  await updatePlaylistsOrder();
}

function removePlaylistFromFolder(folderKey, playlistUID, playlistID, hide) {
  return new Promise((resolve, reject) => {
    const folderID = folderKey.split('<')[1];

    if ($(`#playlistFolderContent${folderID}`).hasClass('playlistFolderContentActive')) {
      const oldHeight = $(`#playlistFolderContent${folderID}`).css('height').split('px')[0];
      $(`#playlistFolderContent${folderID}`).css('height', `${parseInt(oldHeight) - 48}px`);
    }

    window.setTimeout(async () => {
      if (hide) {
        $(`#playlistButton${playlistUID}${playlistID}`).addClass('hidden');
      }

      animatedFolderTrackOut.push(playlistID);
      await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
        [`playlistFolders.${folderKey}`]: (0, _firestore.arrayRemove)(`${playlistUID}.${playlistID}`, `${playlistID}`)
      });
      resolve(true);
    }, 399);
  });
}

function resetFoldersLayout() {
  // Reset layout before dealing with playlist folders.
  $(`.playlistFolderContent`).children().each((index, element) => {
    $(element).appendTo(`#musicSidebarPlaylistsPlaylists`);
    $(element).get(0).removeAttribute('inFolder');

    if (animatedFolderTrackOut.includes($(element).get(0).getAttribute('playlistID'))) {
      // LEAVING PLAYLIST FOLDER.
      animatedFolderTrackOut.splice(animatedFolderTrackOut.indexOf($(element).get(0).getAttribute('playlistID')), 1); // Animate in MAIN AREA. Since, its moving OUT a playlist folder.

      $(element).addClass('instantTransitions');
      $(element).addClass('playlistItemGone');
      $(element).removeClass('instantTransitions');
      window.setTimeout(() => {
        $(element).removeClass('playlistItemGone');
      }, 99);
    }
  });
  sortNonFolderPlaylists();
}

async function loadPlaylistFolders(playlists, folders) {
  if (!folders) {
    $(`.folderContainer`).addClass('hidden');
    setPlaylistHandlers();
    return;
  } // If folders empty.


  const keys = Object.keys(folders);
  $(`.folderContainer`).addClass('hidden');

  for (let i = 0; i < keys.length; i++) {
    const folderName = keys[i].split('<')[0];
    const folderID = keys[i].split('<')[1];
    const playlistIDs = folders[`${folderName}<${folderID}`]; // If element not already created.

    if (!$(`#${folderID}Container`).length) {
      const a = document.createElement('div');
      a.classList.add('folderContainer');

      a.ondragover = ev => {
        ev.preventDefault();
      };

      a.ondrop = ev => {
        foldersDrop(ev, folderID, folderName);
      };

      a.setAttribute('folderID', folderID);
      a.id = `${folderID}Container`;
      a.innerHTML = `
        <button id="${folderID}Button" folderID="${folderID}" folderName="${folderName}" onclick="expandPlaylistFolder('${folderID}')" class="sidebarButton musicSidebarButton playlistFolder"><i id="folder${folderID}" class="bx bx-folder"></i> <span class="sidebarText">${folderName}</span><i id="chevron${folderID}" class="bx bx-chevron-down chevronIndicator"></i></button>
        <div id="playlistFolderContent${folderID}" class="playlistFolderContent hidden" style=""></div>
      `;
      $(`#musicSidebarPlaylistFolders`).get(0).appendChild(a);
      twemoji.parse($(`#${folderID}Button`).get(0)); // Setup a sortable.

      Sortable.create($(`#playlistFolderContent${folderID}`).get(0), {
        ghostClass: 'sortableSidebarItemGhost',
        onEnd: async e => updatePlaylistsOrder()
      });
    } else {
      if ($(`#${folderID}Button`).get(0).getAttribute('folderName') !== folderName) {
        // Folder was renamed.
        $(`#${folderID}Button`).get(0).setAttribute('folderName', folderName);
        $(`#${folderID}Button`).html(`<i id="folder${folderID}" class="bx bx-folder"></i> <span class="sidebarText">${folderName}</span><i id="chevron${folderID}" class="bx bx-chevron-down chevronIndicator"></i>`);
        twemoji.parse($(`#${folderID}Button`).get(0));
      }

      $(`#${folderID}Container`).removeClass('hidden');
    } // Add all the playlists into the folder.


    for (let i = 0; i < playlistIDs.length; i++) {
      const playlistSplit = playlistIDs[i].split('.');
      let playlistUID = user.uid;
      let playlistID = playlistSplit[0];

      if (playlistSplit.length == 2) {
        playlistUID = playlistSplit[0];
        playlistID = playlistSplit[1];
      } // Move the button into the container.


      $(`#playlistButton${playlistUID}${playlistID}`).appendTo(`#playlistFolderContent${folderID}`);
      $(`#playlistButton${playlistUID}${playlistID}`).get(0).setAttribute('inFolder', `${folderName}<${folderID}`);

      $(`#playlistButton${playlistUID}${playlistID}`).get(0).ondragstart = ev => {
        ev.dataTransfer.setData("targetPlaylistUID", playlistUID);
        ev.dataTransfer.setData("targetPlaylistID", playlistID);
        ev.dataTransfer.setData("targetFolderKey", `${folderName}<${folderID}`);
      };

      if (playlistUID == user.uid) {
        $(`#playlistButton${playlistUID}${playlistID}`).get(0).onclick = () => {
          openPlaylist(user.uid, playlistID, null, true, `${folderName}<${folderID}`);
        };

        if ($(`#deletePlaylistButton${playlistUID}${playlistID}`).length) {
          $(`#deletePlaylistButton${playlistUID}${playlistID}`).get(0).onclick = () => {
            prepareDeletePlaylist(playlistID, null, `${folderName}<${folderID}`);
          };
        }
      } else {
        $(`#playlistButton${playlistUID}${playlistID}`).get(0).onclick = () => {
          (0, _music.openOtherPlaylist)(playlistUID, playlistID, null, true, `${folderName}<${folderID}`);
        };

        if ($(`#deletePlaylistButton${playlistUID}${playlistID}`).length) {
          $(`#deletePlaylistButton${playlistUID}${playlistID}`).get(0).onclick = () => {
            prepareRemovePlaylistFromLibrary(playlistUID, playlistID, null, `${folderName}<${folderID}`);
          };
        }
      }
    } // Sort the playlists according to cacheUser.playlists


    for (let i = 0; i < cacheUser.playlists.length; i++) {
      const playlistSplit = cacheUser.playlists[i].split('.');
      let playlistUID = user.uid;
      let playlistID = playlistSplit[0];

      if (playlistSplit.length == 3) {
        playlistUID = playlistSplit[0];
        playlistID = playlistSplit[1];
      }

      if ($(`#playlistButton${playlistUID}${playlistID}`).attr('inFolder') == `${folderName}<${folderID}`) {
        $(`#playlistButton${playlistUID}${playlistID}`).get(0).setAttribute('data-order', i);
      }
    }

    let sorted = $(`#playlistFolderContent${folderID}`).children('.playlistItem').sort((a, b) => {
      return parseInt($(a).attr('data-order')) - parseInt($(b).attr('data-order'));
    });
    $(`#playlistFolderContent${folderID}`).append(sorted);
  } // Sort the folders


  if (cacheUser.playlistFoldersSort) {
    for (let i = 0; i < cacheUser.playlistFoldersSort.length; i++) {
      const folderID = cacheUser.playlistFoldersSort[i];
      $(`#${folderID}Container`).attr('data-order', i);
    }

    let sorted = $(`#musicSidebarPlaylistFolders`).children('.folderContainer').sort((a, b) => {
      return parseInt($(a).attr('data-order')) - parseInt($(b).attr('data-order'));
    });
    $(`#musicSidebarPlaylistFolders`).append(sorted);
  }

  setPlaylistHandlers(); // For non-folders
}

function setPlaylistHandlers() {
  for (let i = 0; i < cacheUser.playlists.length; i++) {
    let playlistUID = user.uid;
    let playlistID = cacheUser.playlists[i].split('.')[0];
    let playlistName = cacheUser.playlists[i].split('.')[1];

    if (cacheUser.playlists[i].split('.').length == 3) {
      // Other playlist
      playlistUID = cacheUser.playlists[i].split('.')[0];
      playlistID = cacheUser.playlists[i].split('.')[1];
      playlistName = cacheUser.playlists[i].split('.')[2];
    } // If belongs to a folder


    if ($(`#playlistButton${playlistUID}${playlistID}`).attr('inFolder')) {
      continue;
    }

    if (playlistUID == user.uid) {
      $(`#playlistButton${playlistUID}${playlistID}`).get(0).onclick = () => {
        openPlaylist(user.uid, playlistID, playlistName, true, false);
      };

      if ($(`#deletePlaylistButton${playlistUID}${playlistID}`).length) {
        $(`#deletePlaylistButton${playlistUID}${playlistID}`).get(0).onclick = () => {
          prepareDeletePlaylist(playlistID, playlistName, false);
        };
      }
    } else {
      $(`#playlistButton${playlistUID}${playlistID}`).get(0).onclick = () => {
        (0, _music.openOtherPlaylist)(playlistUID, playlistID, playlistName, true, false);
      };

      if ($(`#deletePlaylistButton${playlistUID}${playlistID}`).length) {
        $(`#deletePlaylistButton${playlistUID}${playlistID}`).get(0).onclick = () => {
          prepareRemovePlaylistFromLibrary(playlistUID, playlistID, playlistName, false);
        };
      }
    }
  }
}

async function deletePlaylistFolder(folderID, folderName, skipNotify, keepSort) {
  if (keepSort) {
    await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
      [`playlistFolders.${folderName}<${folderID}`]: (0, _firestore.deleteField)()
    });
  } else {
    await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
      [`playlistFolders.${folderName}<${folderID}`]: (0, _firestore.deleteField)(),
      playlistFoldersSort: (0, _firestore.arrayRemove)(folderID)
    });
  }

  if (!skipNotify) {
    snac('Folder Deleted', '', 'success');
  }
}

window.expandPlaylistFolder = folderID => {
  const hidden = $(`#playlistFolderContent${folderID}`).get(0).getAttribute('style') == '';

  if (hidden) {
    $(`#playlistFolderContent${folderID}`).removeClass('hidden');
    $(`#playlistFolderContent${folderID}`).removeClass('zeroHeight');
    const naturalHeight = $(`#playlistFolderContent${folderID}`).height();
    $(`#playlistFolderContent${folderID}`).addClass('zeroHeight');
    $(`#playlistFolderContent${folderID}`).addClass('playlistFolderContentActive');
    $(`#playlistFolderContent${folderID}`).css(`height`, `${naturalHeight}px`);
    $(`#chevron${folderID}`).removeClass('bx-chevron-down');
    $(`#chevron${folderID}`).addClass('bx-chevron-up');
    $(`#folder${folderID}`).addClass('folderFolderIconActive');
    $(`#folder${folderID}`).removeClass('bx-folder');
    $(`#folder${folderID}`).addClass('bx-folder-open');
  } else {
    $(`#playlistFolderContent${folderID}`).get(0).setAttribute('style', '');
    $(`#chevron${folderID}`).addClass('bx-chevron-down');
    $(`#chevron${folderID}`).removeClass('bx-chevron-up');
    $(`#folder${folderID}`).removeClass('folderFolderIconActive');
    $(`#folder${folderID}`).removeClass('bx-folder-open');
    $(`#folder${folderID}`).addClass('bx-folder');
    $(`#playlistFolderContent${folderID}`).removeClass('playlistFolderContentActive');
  }
};

function buildPlaylist(playlist) {
  let playlistUID = user.uid;
  let playlistID = playlist.split('.')[0];
  let playlistName = playlist.split('.')[1];

  if (playlist.split('.').length == 3) {
    // Other playlist.
    playlistUID = playlist.split('.')[0];
    playlistID = playlist.split('.')[1];
    playlistName = playlist.split('.')[2];
  }

  const a = document.createElement('button');
  a.setAttribute('class', `sidebarButton musicSidebarButton playlistItem`);

  a.ondragover = ev => {
    ev.preventDefault();
  };

  a.ondrop = ev => {
    playlistsDrop(ev, playlistID);
  };

  a.draggable = true;

  a.ondragstart = ev => {
    ev.dataTransfer.setData("targetPlaylistUID", playlistUID);
    ev.dataTransfer.setData("targetPlaylistID", playlistID);
    ev.dataTransfer.setData("targetFolderKey", '');
  };

  a.setAttribute('playlistID', playlistID);
  a.setAttribute('playlistUID', playlistUID);
  a.setAttribute('playlistName', playlistName);
  a.id = `playlistButton${playlistUID}${playlistID}`;
  a.innerHTML = `
    <i class="bx bxs-playlist"></i>
    <span class="sidebarText" id="${playlistUID}${playlistID}PlaylistName"><div class="sidebarText">${playlistName}</div></span>
  `;
  $(`#musicSidebarPlaylistsPlaylists`).get(0).appendChild(a); // console.log('appended');

  twemoji.parse($(`#${playlistUID}${playlistID}PlaylistName`).get(0));
}

function openPlaylist(playlistUID, playlistID, playlistNameInput, fromLibrary, folderContext) {
  if ($(`#playlistButton${playlistUID}${playlistID}`).hasClass('sidebarButtonActive')) {
    // Already open!
    (0, _music.clearMusicViewsPlaylist)();
    return;
  }

  (0, _music.musicTab)('playlists');
  $(`.playlistView`).addClass('hidden');
  $(`#playlistButton${playlistUID}${playlistID}`).addClass('sidebarButtonActive'); // Expand enclosing folder if it's not already expanded.

  if (!$(`#playlistButton${playlistUID}${playlistID}`).parent().hasClass('playlistFolderContentActive')) {
    $(`#playlistButton${playlistUID}${playlistID}`).parent().parent().children().first().click();
  }

  if ($(`#PlaylistView${playlistUID}${playlistID}`).length) {
    $(`#PlaylistView${playlistUID}${playlistID}`).removeClass('hidden');
    addPlaylistListeners(playlistUID, playlistID, fromLibrary);
    return;
  }

  let playlistName = playlistNameInput;

  if (!playlistNameInput) {
    for (let i = 0; i < cacheUser.playlists.length; i++) {
      const playlistSplit = cacheUser.playlists[i].split('.');
      let playlistIDSearch = playlistSplit[0];
      let playlistNameSearch = playlistSplit[1];

      if (playlistSplit.length == 3) {
        // New playlist format.
        playlistIDSearch = playlistSplit[1];
        playlistNameSearch = playlistSplit[2];
      }

      if (playlistID == playlistIDSearch) {
        playlistName = playlistNameSearch;
      }
    }
  }

  const a = document.createElement('div');
  a.id = `PlaylistView${playlistUID}${playlistID}`;
  a.setAttribute('class', 'musicView playlistView');
  a.innerHTML = `
    <div class="musicViewHeader animated fadeInDown faster">
      <p>Playlist</p>
      <button id="Playlist${playlistUID}${playlistID}Close" onclick="closeMusicView('Playlist', '${playlistUID}${playlistID}')" class="btn b-3 roundedButton closeButton hidden"><i class="bx bx-x"></i></button>
    </div>
    <div class="musicViewContentContainer">
      <div class="playlistTopLevel">
        <div id="${playlistUID}${playlistID}playlistViewImage" class="playlistCover"></div>
        <div id="${playlistUID}${playlistID}playlistDetailsOne" class="playlistDetails">
          <h2 id="${playlistUID}${playlistID}playlistTitle" class="playlistTitle myPlaylistTitle animated fadeInUp"></h2>
          <p id="${playlistUID}${playlistID}playlistDetailsLine" class="playlistDetailsLine animated fadeIn"></p>
          <div class="dropdown">
            <button id="playlistDropdownButton${playlistUID}${playlistID}" onclick="openDropdown('${playlistUID}${playlistID}Dropdown')" class="btn b-4 playlistDropdownButton iconButton dropdownButton"><i class="bx bx-dots-vertical-rounded"></i></button>
            <div id="${playlistUID}${playlistID}Dropdown" class="dropdown-content">
              <a id="editorPlaylistButton${playlistUID}${playlistID}" class="btn">Editor</a>
              <a id="renamePlaylistButton${playlistUID}${playlistID}" class="btn">Rename</a>
              <a id="deletePlaylistButton${playlistUID}${playlistID}" class="btn btnDanger">Delete</a>
              <div class="dropdownDivider"></div>
              <a onclick="recalculateDetails('${playlistUID}', '${playlistID}')" class="btn">Reclculate Metadata</a>
              <a onclick="copyToClipboard('${window.location.origin}/preview?playlistUID=${playlistUID}&playlistID=${playlistID}')" class="btn">Copy Link</a>
              <a onclick="copyToClipboard('${playlistID}')" class="btn">Copy ID</a>
            </div>
          </div>
          <button id="${playlistUID}${playlistID}PlayTrackButton" class="btn b-1 playButton"><i class='bx bx-play'></i> play</button> 
          <button id="${playlistUID}${playlistID}ShuffleTrackButton"  onclick="playTrack(null, '${playlistUID}${playlistID}playlistViewTracksContainer', 0, true)" class="btn b-1 playButton"><i class='bx bx-shuffle'></i> shuffle</button>
          <button onclick="openSharing('${playlistUID}', '${playlistID}')" class="btn b-2 playButton"><i class='bx bx-planet'></i> share</button>
          <p id="${playlistUID}${playlistID}contentEditable" class="playlistDescription" spellcheck="false" contenteditable="plaintext-only"></p>
        </div>
        <div id="${playlistUID}${playlistID}playlistDetailsTwo" class="playlistDetails playlistDetailsTwo hidden">
          <h2 class="playlistTitle animated fadeInUp">Playlist Editor</h2>
          <p>Click a track to select it.</p>
          <button id="exitEditorPlaylistButton${playlistUID}${playlistID}" class="btn b-1"> <i class='bx bx-arrow-back'></i> Exit </button>
        </div>
      </div>
      <div class="hr"></div>
      <div class="musicViewContent">
        <div class="notice hidden animated fadeIn" id="${playlistUID}${playlistID}noTrackNotice">No tracks added to this playlist.</div>
        <div class="tracksContainer" id="${playlistUID}${playlistID}playlistViewTracksContainer"></div>

        <div class="editModeToolbarContainer">
          <div class="editModeToolbar animated hidden" id="${playlistUID}${playlistID}EditToolbar">
            <button id="${playlistUID}${playlistID}CopyButton" class="btn b-3 roundedButton playlistButtonContext acceptLeftClick"><i class="bx bx-copy"></i></button>
            <button id="${playlistUID}${playlistID}TrashButton" class="btn b-3 roundedButton"><i class="bx bx-trash-alt"></i></button>
          </div>
        </div>

        <div class="form formLabelFix hidden animated fadeIn" id="playlistSearch${playlistUID}${playlistID}">
          <label for="${playlistUID}${playlistID}SongSearchInput" class="">Add to playlist:</label>
          <input autocomplete="off" text="text" id="${playlistUID}${playlistID}SongSearchInput"> 
        </div>

        <div id="${playlistUID}${playlistID}playlistTrackSearchResults" class="playlistTrackSearchResults animated fadeIn"></div>
        <p class="playlistSearchNoResults animated fadeIn hidden" id="${playlistUID}${playlistID}SearchResults">No results found.</p>
      </div>
    </div>
    <div></div>
  `; // Bottom div for cumulative playlist time maybe/

  $(`#musicTab_playlists`).get(0).appendChild(a);
  (0, _display.displayInputEffect)();
  $(`#${playlistUID}${playlistID}SongSearchInput`).get(0).addEventListener('keyup', async e => {
    if (e.keyCode == 13) {
      const value = $(`#${playlistUID}${playlistID}SongSearchInput`).val();
      $(`#${playlistUID}${playlistID}SongSearchInput`).val('');

      if (value) {
        const search = await makeMusicRequest(`search?term=${encodeURIComponent(value)}&types=songs&limit=12`);
        $(`#${playlistUID}${playlistID}playlistTrackSearchResults`).empty();
        $(`#${playlistUID}${playlistID}SearchResults`).addClass('hidden');

        if (typeof search.results !== 'undefined' && typeof search.results.songs !== 'undefined' && typeof search.results.songs.data !== 'undefined') {
          for (let i = 0; i < search.results.songs.data.length; i++) {
            const track = search.results.songs.data[i];
            (0, _componentse.createTrack)(track, `${playlistUID}${playlistID}playlistTrackSearchResults`, i, null, null, null, `addTrackToPlaylist('${playlistID}', '${track.id}')`);
          }
        } else {
          $(`#${playlistUID}${playlistID}SearchResults`).removeClass('hidden');
        }
      } else {
        $(`#${playlistUID}${playlistID}playlistTrackSearchResults`).empty();
      }
    }
  });

  $(`#${playlistUID}${playlistID}PlayTrackButton`).get(0).onclick = () => {
    playTrack(null, `${playlistUID}${playlistID}playlistViewTracksContainer`, 0);
  };

  $(`#${playlistUID}${playlistID}ShuffleTrackButton`).get(0).onclick = () => {
    playTrack(null, `${playlistUID}${playlistID}playlistViewTracksContainer`, 0, true);
  };

  $(`#${playlistUID}${playlistID}contentEditable`).get(0).addEventListener("focusout", async () => {
    const newDescription = (0, _display.messageHTMLtoText)(null, $(`#${playlistUID}${playlistID}contentEditable`).get(0));

    if (newDescription !== 'No description. Click here to set one.') {
      if (newDescription.length > 500) {
        snac('Playlist Description Error', 'The description must be 500 characters or less. Your changes were not saved.', 'error');
        return;
      }

      await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${playlistUID}/playlists/${playlistID}`), {
        description: newDescription,
        dateModified: (0, _firestore.serverTimestamp)()
      });
      snac('Playlist Description Updated', 'Your changes were saved.', 'success');
    }
  }, false); // Onclicks

  tippy($(`#Playlist${playlistUID}${playlistID}Close`).get(0), {
    content: 'Close',
    placement: 'top'
  });
  tippy($(`#${playlistUID}${playlistID}CopyButton`).get(0), {
    content: 'Copy to Playlist',
    placement: 'top'
  });
  tippy($(`#${playlistUID}${playlistID}TrashButton`).get(0), {
    content: 'Remove Tracks',
    placement: 'top'
  });

  $(`#${playlistUID}${playlistID}CopyButton`).get(0).onclick = () => {
    editorModeCopy(playlistID);
  };

  $(`#${playlistUID}${playlistID}TrashButton`).get(0).onclick = () => {
    editorModeTrash(playlistID);
  };

  $(`#deletePlaylistButton${playlistUID}${playlistID}`).get(0).onclick = () => {
    prepareDeletePlaylist(playlistID, playlistName, folderContext);
  };

  $(`#renamePlaylistButton${playlistUID}${playlistID}`).get(0).onclick = () => {
    prepareRenamePlaylist(playlistID);
  };

  $(`#editorPlaylistButton${playlistUID}${playlistID}`).get(0).onclick = () => {
    openEditorModePlaylist(playlistID);
  };

  $(`#exitEditorPlaylistButton${playlistUID}${playlistID}`).get(0).onclick = () => {
    exitEditorModePlaylist(playlistID);
  }; // Sortable


  Sortable.create($(`#${playlistUID}${playlistID}playlistViewTracksContainer`).get(0), {
    ghostClass: 'sortableGhost',
    onEnd: async e => {
      const element = e.item;
      const oldIndex = e.oldIndex;
      const newIndex = e.newIndex;

      if (oldIndex == newIndex) {
        return;
      }

      managePlaylistOrder(playlistUID, playlistID);
      console.log(`Performed sort from ${oldIndex} to ${newIndex}`);
    }
  });
  addPlaylistListeners(playlistUID, playlistID, fromLibrary);
}

window.prepareSetTrackIndexByInput = (playlistUID, playlistID, oldIndex) => {
  (0, _display.openModal)('reorderPlaylist');
  $('#newPlaylistIndex').get(0).addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      $('#newIndexCreateButton').get(0).click();
    }
  });

  $(`#newIndexCreateButton`).get(0).onclick = () => {
    const newIndex = $(`#newPlaylistIndex`).val();
    (0, _display.closeModal)();
    $(`#newPlaylistIndex`).val('');
    setTrackIndexByInput(user.uid, playlistID, oldIndex, newIndex);
  };
};

async function setTrackIndexByInput(playlistUID, playlistID, oldIndex, newIndex) {
  if (newIndex.includes('-')) {
    snac('Invalid Index', 'You must submit a positive integer as the updated index', 'danger');
  }

  if (!parseInt(newIndex)) {
    snac('Invalid Index', 'You must submit a positive integer as the updated index', 'danger');
    return;
  }

  $(`#${playlistUID}${playlistID}playlistViewTracksContainer`).children('.music-track').eq(oldIndex).insertIndex(parseInt(newIndex) - 1);
  managePlaylistOrder(playlistUID, playlistID);
}

async function managePlaylistOrder(playlistUID, playlistID) {
  const children = $(`#${playlistUID}${playlistID}playlistViewTracksContainer`).children('.music-track');
  let updatedTracks = [];
  children.each((index, object) => {
    const trackID = object.getAttribute('trackID');
    const randomID = object.getAttribute('playlistRandomID');
    updatedTracks.push({
      trackID: `${trackID}`,
      randomID: `${randomID}`
    });
  });
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}/playlists/${playlistID}`), {
    tracks: updatedTracks,
    dateModified: (0, _firestore.serverTimestamp)()
  });
}

window.setPlaylistImage = (playlistUID, playlistID) => {
  $('#NewPlaylistIconInput').off();
  $('#NewPlaylistIconInput').change(async () => {
    if (!document.getElementById("NewPlaylistIconInput").files.length) {
      snac('Error', 'Contact support or try again.', 'danger');
      return;
    }

    const fileInput = document.getElementById("NewPlaylistIconInput").files[0];
    document.getElementById("NewPlaylistIconInput").value = '';
    const file = await (0, _app.getCroppedPhoto)(fileInput);
    const ext = file.name.split(".").pop();

    if (file.size > 12 * 1000000) {
      snac(`File Size Error`, `Your file, ${file.name}, is too large. There is a 12MB limit on playlist covers.`, 'danger');
      return;
    }

    (0, _display.showUploadProgress)();
    const uploadTask = (0, _storage.uploadBytesResumable)((0, _storage.ref)(storage, `playlists/${playlistUID}/${playlistID}/icon.${ext}`), file);
    uploadTask.on('state_changed', snapshot => {
      const progress = snapshot.bytesTransferred / snapshot.totalBytes * 100;
      $('#uploadProgressNumber').html(`Upload Progress: ${progress.toFixed(0)}%`);
    });
    uploadTask.then(async () => {
      (0, _display.hideUploadProgress)();
      snac('Upload Success', 'Your playlist icon is being processed.', 'success');

      if (ext === 'png') {
        await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${playlistUID}/playlists/${playlistID}`), {
          imageURL: `https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/playlists%2F${playlistUID}%2F${playlistID}%2Ficon.png?alt=media&ts=${new Date().getTime()}`,
          dateModified: (0, _firestore.serverTimestamp)()
        });
      }
    });
  });
  $('#NewPlaylistIconInput').click();
};

window.removePlaylistImage = async (playlistUID, playlistID) => {
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${playlistUID}/playlists/${playlistID}`), {
    imageURL: '',
    dateModified: (0, _firestore.serverTimestamp)()
  });
};

async function addPlaylistListeners(playlistUID, playlistID, fromLibrary) {
  try {
    await playlistListener();
  } catch (e) {}

  ;
  $(`#Playlist${playlistUID}${playlistID}Close`).addClass('hidden');

  if (!fromLibrary) {
    $(`#Playlist${playlistUID}${playlistID}Close`).removeClass('hidden');
  }

  $(`#${playlistUID}${playlistID}playlistTrackSearchResults`).empty();
  $(`#${playlistUID}${playlistID}playlistViewTracksContainer`).html(`
    <div class="notice fetchingTracksNotice animated fadeIn hidden" id="${playlistUID}${playlistID}waitingNotice">Fetching tracks...</div>
  `); // Clear the tracks container.

  cachePlaylistData[playlistUID + playlistID] = [];
  playlistListener = (0, _firestore.onSnapshot)((0, _firestore.doc)(db, `users/${playlistUID}/playlists/${playlistID}`), async doc => {
    console.log(doc.data());

    if (!doc.exists()) {
      return;
    }

    if (!doc.data().dateModified) {
      // Recieved two updates. One is date upload, one is date confirm.
      return; // Ignore if initial upload event. Only update on final.
    }

    $(`#${playlistUID}${playlistID}playlistTitle`).get(0).onclick = () => {
      prepareRenamePlaylist(playlistID);
    };

    $(`#${playlistUID}${playlistID}playlistTitle`).html((0, _display.securityConfirmTextIDs)(doc.data().title, true)); // Playlist title

    twemoji.parse($(`#${playlistUID}${playlistID}playlistTitle`).get(0));
    $(`#${playlistUID}${playlistID}contentEditable`).html((0, _display.securityConfirmText)(doc.data().description || "No description. Click here to set one."));
    twemoji.parse($(`#${playlistUID}${playlistID}contentEditable`).get(0));

    if (playlistDataImages[playlistUID + playlistID] !== doc.data().imageURL) {
      if (doc.data().imageURL) {
        $(`#${playlistUID}${playlistID}playlistViewImage`).html(`<img class="invisible" id="${playlistUID}${playlistID}playlistViewImageElement" src="${doc.data().imageURL}"/><button onclick="setPlaylistImage('${playlistUID}', '${playlistID}')" class="btn playlistCoverButton playlistCoverEdit"><i class="bx bx-pencil"></i></button><button onclick="removePlaylistImage('${playlistUID}', '${playlistID}')" class="btn playlistCoverButton playlistCoverRemove"><i class="bx bx-x"></i></button>`);
        (0, _display.displayImageAnimation)(`${playlistUID}${playlistID}playlistViewImageElement`);
      } else {
        $(`#${playlistUID}${playlistID}playlistViewImage`).html(`<button onclick="setPlaylistImage('${playlistUID}', '${playlistID}')" class="btn playlistCoverButton playlistCoverEdit"><i class="bx bx-upload"></i></button><i class="missingIconIcon bx bxs-playlist"></i>`);
      }
    }

    playlistDataImages[playlistUID + playlistID] = doc.data().imageURL;
    let lengthString = '';

    if (doc.data().totalDuration) {
      const hours = Math.floor(Math.floor(doc.data().totalDuration / 1000) / 3600);
      const minutes = Math.floor(Math.floor(doc.data().totalDuration / 1000) % 3600 / 60);
      const seconds = Math.floor(Math.floor(doc.data().totalDuration / 1000) % 3600 % 60);
      lengthString = `<span class="playlistDetailsSeparator"><i class="bx bxs-circle"></i></span> ${hours}h ${minutes}m ${seconds}s`;
    }

    const modifiedDate = doc.data().dateModified.toDate();
    let cloneText = '';

    if (doc.data().clone) {
      if (doc.data().clonedMultiple) {
        cloneText = `<span onclick="openUserCard('${doc.data().creator.split('.')[0]}')" class="playlistCreator">${doc.data().creator.split('.')[1].capitalize()}</span>, <span onclick="openUserCard('${doc.data().clone.split('.')[0]}')" class="playlistCreator">${doc.data().clone.split('.')[1].capitalize()}</span>, and <span class="playlistCreator noHighlight">several others</span>`;
      } else {
        cloneText = `<span onclick="openUserCard('${doc.data().creator.split('.')[0]}')" class="playlistCreator">${doc.data().creator.split('.')[1].capitalize()}</span> ${doc.data().clone ? `and <span onclick="openUserCard('${doc.data().clone.split('.')[0]}')" class="playlistCreator">${doc.data().clone.split('.')[1].capitalize()}</span>` : ""}`;
      }
    } else {
      cloneText = `<span onclick="openUserCard('${doc.data().creator.split('.')[0]}')" class="playlistCreator">${doc.data().creator.split('.')[1].capitalize()}</span>`;
    }

    let lockText = '';

    if (doc.data().sharing && doc.data().sharing == 'none') {
      lockText = `<span class="playlistDetailsSeparator"><i class="bx bxs-circle"></i></span> <i onclick="openSharing('${playlistUID}', '${playlistID}')" class="bx bx-lock-alt clickableIcon"></i>`;
    }

    $(`#${playlistUID}${playlistID}playlistDetailsLine`).html(`By ${cloneText} <span class="playlistDetailsSeparator"><i class="bx bxs-circle"></i></span> Updated ${timeago.format(modifiedDate)} <span class="playlistDetailsSeparator"><i class="bx bxs-circle"></i></span> ${doc.data().tracks.length} Track${doc.data().tracks.length == 1 ? "" : "s"} ${lengthString}${lockText}`); // Tracks Rendering (Feb 9, 2022): 250 batches, paginatated.

    const tracks = doc.data().tracks || [];
    const arrayPlaylistForward = (0, _display.playlistArrayDifference)(cachePlaylistData[playlistUID + playlistID] || [], tracks);
    const arrayPlaylistBackward = (0, _display.playlistArrayDifference)(tracks, cachePlaylistData[playlistUID + playlistID] || []);

    if (arrayPlaylistForward.length) {
      $(`#${playlistUID}${playlistID}waitingNotice`).removeClass('hidden');
    } else {
      $(`#${playlistUID}${playlistID}waitingNotice`).addClass('hidden');
    }

    cachePlaylistData[playlistUID + playlistID] = doc.data().tracks;
    playlistMetaData[playlistUID + playlistID] = doc.data();
    playlistMetaData[playlistUID + playlistID].tracks = []; // No need. Waste of space.

    const tempPlaylistForward = [...arrayPlaylistForward];

    if (arrayPlaylistForward.length) {
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

    for (let i = 0; i < arrayPlaylistForward.length; i++) {
      (0, _componentse.createTrack)(musicCatalogue[arrayPlaylistForward[i].trackID], `${playlistUID}${playlistID}playlistViewTracksContainer`, i, `${playlistUID}${playlistID}${arrayPlaylistForward[i].randomID}${arrayPlaylistForward[i].trackID}`, ["playlistUID", playlistUID, "playlistID", playlistID, "playlistRandomID", arrayPlaylistForward[i].randomID], false, false, arrayPlaylistForward[i].trackID);
    }

    for (let i = 0; i < arrayPlaylistBackward.length; i++) {
      $(`#${playlistUID}${playlistID}${arrayPlaylistBackward[i].randomID}${arrayPlaylistBackward[i].trackID}`).addClass('music-track-gone');
      window.setTimeout(() => {
        $(`#${playlistUID}${playlistID}${arrayPlaylistBackward[i].randomID}${arrayPlaylistBackward[i].trackID}`).remove();
      }, 550);
    }

    if (arrayPlaylistBackward || arrayPlaylistForward) {
      updatePlaylistIndexes(playlistID);
    }

    $(`#${playlistUID}${playlistID}waitingNotice`).addClass('hidden');
    $(`#${playlistUID}${playlistID}noTrackNotice`).addClass('hidden');

    if (!tracks.length) {
      $(`#${playlistUID}${playlistID}noTrackNotice`).removeClass('hidden');
    } // Don't deal with playlist ORDER.


    $(`#playlistSearch${playlistUID}${playlistID}`).removeClass('hidden');
  });
}

async function updatePlaylistIndexes(playlistID) {
  // Update indexes
  const tracks = cachePlaylistData[`${user.uid}${playlistID}`] || [];

  for (let j = 0; j < tracks.length; j++) {
    $(`#music-track-icon-${user.uid}${playlistID}${tracks[j].randomID}${tracks[j].trackID}`).html(j + 1);

    if ($(`#${user.uid}${playlistID}${tracks[j].randomID}${tracks[j].trackID}`).hasClass("music-track")) {
      if (editorModePlaylist !== playlistID) {
        $(`#${user.uid}${playlistID}${tracks[j].randomID}${tracks[j].trackID}`).get(0).onclick = () => {
          playTrack(tracks[j].trackID, `${user.uid}${playlistID}playlistViewTracksContainer`, j);
        };
      }

      $(`#music-track-icon-${user.uid}${playlistID}${tracks[j].randomID}${tracks[j].trackID}`).get(0).onclick = () => {
        prepareSetTrackIndexByInput(user.uid, playlistID, j);
      };
    }
  }
}

window.addTrackToPlaylist = (playlistID, trackID, skipNotify) => {
  return new Promise(async (resolve, reject) => {
    const playlistDoc = await (0, _firestore.getDoc)((0, _firestore.doc)(db, `users/${user.uid}/playlists/${playlistID}`));

    if ((0, _stripe.checkValidSubscription)(cacheUser.subscription)) {
      if (playlistDoc.data().tracks && playlistDoc.data().tracks.length >= 900) {
        snac('Track Limit', 'You have reached the maximum playlist length.', 'danger');
        return;
      }
    } else {
      if (playlistDoc.data().tracks && playlistDoc.data().tracks.length >= 400) {
        snac('Track Limit', 'You have reached the maximum playlist length. Upgrade to Parallel Infinite to add 500 more.', 'danger');
        return;
      }
    }

    const track = await makeMusicRequest(`songs/${trackID}`);
    console.log(track);
    (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}/playlists/${playlistID}`), {
      tracks: (0, _firestore.arrayUnion)({
        trackID: `${trackID}`,
        randomID: `${new Date().getTime()}`
      }),
      dateModified: (0, _firestore.serverTimestamp)(),
      totalDuration: (0, _firestore.increment)(track.data[0].attributes.durationInMillis)
    });

    if (!skipNotify) {
      notifyTiny(`Track added.`, true);
    }

    resolve(true);
  });
};

async function removeTrackFromPlaylist(playlistID, trackID, randomID) {
  console.log(playlistID, trackID, randomID);
  const track = await makeMusicRequest(`songs/${trackID}`);
  console.log(track);
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}/playlists/${playlistID}`), {
    tracks: (0, _firestore.arrayRemove)({
      randomID: `${randomID}`,
      trackID: `${trackID}`
    }, {
      randomID: parseInt(randomID),
      trackID: `${trackID}`
    }),
    dateModified: (0, _firestore.serverTimestamp)(),
    totalDuration: (0, _firestore.increment)(track.data ? -track.data[0].attributes.durationInMillis : 0)
  });
}

window.removeBrokenTrackFromPlaylist = (playlistID, trackID, randomID) => {
  // Function imports on components will break app!
  removeTrackFromPlaylist(playlistID, trackID, randomID);
};

function prepareRenamePlaylist(playlistID) {
  (0, _display.openModal)('renamePlaylist');
  $('#renamePlaylistName').val('');
  $('#renamePlaylistName').get(0).addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      $('#renamePlaylistButton').get(0).click();
    }
  });

  $('#renamePlaylistButton').get(0).onclick = () => renamePlaylistConfirm(`${playlistID}`);
}

function prepareRenameFolder(folderID, folderName) {
  (0, _display.openModal)('renameFolder');
  $('#renameFolderName').val('');
  $('#renameFolderName').get(0).addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      $('#renameFolderButton').get(0).click();
    }
  });

  $('#renameFolderButton').get(0).onclick = () => renameFolderConfirm(`${folderID}`, `${folderName}`);
}

async function renameFolderConfirm(folderID, folderName) {
  const newFolderName = (0, _display.securityConfirmTextIDs)($('#renameFolderName').val(), true).trim();

  if (newFolderName.length > 48) {
    snac('Invalid Folder Title', `Your folder's title cannot be more than 48 characters.`, 'danger');
    return;
  }

  if (!newFolderName.length) {
    snac('Invalid Folder Title', `Your folder's title cannot be empty.`, 'danger');
    return;
  }

  (0, _display.closeModal)(); // Cache data in the folder

  const cacheFolderData = cacheUser.playlistFolders[`${folderName}<${folderID}`];
  deletePlaylistFolder(folderID, folderName, true);
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
    [`playlistFolders.${newFolderName}<${folderID}`]: cacheFolderData
  });
}

async function renamePlaylistConfirm(playlistID) {
  const playlistName = (0, _display.securityConfirmTextIDs)($('#renamePlaylistName').val(), true).trim();

  if (playlistName.length > 48) {
    snac('Invalid Playlist Title', `Your playlist's title cannot be more than 48 characters.`, 'danger');
    return;
  }

  if (!playlistName.length) {
    snac('Invalid Playlist Title', `Your playlist's title cannot be empty.`, 'danger');
    return;
  }

  (0, _display.closeModal)();
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}/playlists/${playlistID}`), {
    title: playlistName,
    dateModified: (0, _firestore.serverTimestamp)()
  });
  await (0, _firestore.runTransaction)(db, async transaction => {
    const sfDoc = await transaction.get((0, _firestore.doc)(db, `users/${user.uid}`));
    let newPlaylistList = [];

    for (let i = 0; i < sfDoc.data().playlists.length; i++) {
      const playlist = sfDoc.data().playlists[i].split('.');
      let playlistUID = user.uid;
      let playlistIDSearch = playlist[0];
      let playlistNameOld = playlist[1];

      if (playlist.length == 3) {
        playlistUID = playlist[0];
        playlistIDSearch = playlist[1];
        playlistNameOld = playlist[2];
      }

      if (playlistIDSearch == `${playlistID}`) {
        newPlaylistList.push(`${playlistUID}.${playlistIDSearch}.${playlistName}`);
      } else {
        newPlaylistList.push(sfDoc.data().playlists[i]);
      }
    }

    transaction.update((0, _firestore.doc)(db, `users/${user.uid}`), {
      playlists: newPlaylistList
    });
  });
  console.log('transaction update success.');
}

function prepareDeletePlaylist(playlistID, playlistNameInput, folderContext) {
  let playlistName = playlistNameInput;

  if (!playlistNameInput) {
    for (let i = 0; i < cacheUser.playlists.length; i++) {
      const playlistSplit = cacheUser.playlists[i].split('.');
      let playlistIDSearch = playlistSplit[0];
      let playlistNameSearch = playlistSplit[1];

      if (playlistSplit.length == 3) {
        // New playlist format.
        playlistIDSearch = playlistSplit[1];
        playlistNameSearch = playlistSplit[2];
      }

      if (playlistID == playlistIDSearch) {
        playlistName = playlistNameSearch;
      }
    }
  }

  (0, _display.openModal)('deletePlaylist');

  $('#playlistConfirmDelete').get(0).onclick = () => deletePlaylist(playlistID, playlistName, folderContext);
}

function prepareRemovePlaylistFromLibrary(playlistUID, playlistID, playlistNameInput, folderContext) {
  let playlistName = playlistNameInput;

  if (!playlistNameInput) {
    for (let i = 0; i < cacheUser.playlists.length; i++) {
      const playlistSplit = cacheUser.playlists[i].split('.');
      let playlistIDSearch = playlistSplit[0];
      let playlistNameSearch = playlistSplit[1];

      if (playlistSplit.length == 3) {
        // New playlist format.
        playlistIDSearch = playlistSplit[1];
        playlistNameSearch = playlistSplit[2];
      }

      if (playlistID == playlistIDSearch) {
        playlistName = playlistNameSearch;
      }
    }
  }

  (0, _display.openModal)('removePlaylistFromLibrary');

  $('#playlistConfirmRemove').get(0).onclick = () => removePlaylistFromLibrary(playlistUID, playlistID, playlistName, folderContext);
}

async function deletePlaylist(playlistID, playlistName, folderContext) {
  (0, _display.closeModal)();

  if (folderContext) {
    await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
      playlists: (0, _firestore.arrayRemove)(`${playlistID}.${playlistName}`, `${user.uid}.${playlistID}.${playlistName}`),
      [`playlistFolders.${folderContext}`]: (0, _firestore.arrayRemove)(playlistID),
      playlistCount: (0, _firestore.increment)(-1)
    });
    const folderID = folderContext.split('<')[1];

    if ($(`#playlistFolderContent${folderID}`).hasClass('playlistFolderContentActive')) {
      const oldHeight = $(`#playlistFolderContent${folderID}`).css('height').split('px')[0];
      $(`#playlistFolderContent${folderID}`).css('height', `${parseInt(oldHeight) - 16 - 8 - 8 - 12}px`);
    }
  } else {
    await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
      playlists: (0, _firestore.arrayRemove)(`${playlistID}.${playlistName}`, `${user.uid}.${playlistID}.${playlistName}`),
      playlistCount: (0, _firestore.increment)(-1)
    });
  }

  await (0, _firestore.deleteDoc)((0, _firestore.doc)(db, `users/${user.uid}/playlists/${playlistID}`));
  snac('Playlist Deleted', '', 'danger');
}

function playlistsDrop(ev, playlistID) {
  const trackID = ev.dataTransfer.getData("targetTrackID");

  if (!trackID) {
    return;
  }

  addTrackToPlaylist(playlistID, trackID, false);
}

async function foldersDrop(ev, folderID, folderName) {
  const playlistUID = ev.dataTransfer.getData("targetPlaylistUID");
  const playlistID = ev.dataTransfer.getData("targetPlaylistID");
  const folderKey = ev.dataTransfer.getData("targetFolderKey");

  if (!playlistUID || !playlistID) {
    return;
  }

  if (folderKey) {
    await removePlaylistFromFolder(folderKey, playlistUID, playlistID, true);
  }

  addPlaylistToFolder(folderID, folderName, playlistUID, playlistID, true);
}

$(`#musicSidebarPlaylistsPlaylists`).get(0).ondrop = async ev => {
  const playlistUID = ev.dataTransfer.getData("targetPlaylistUID");
  const playlistID = ev.dataTransfer.getData("targetPlaylistID");
  const folderKey = ev.dataTransfer.getData("targetFolderKey");

  if (!playlistUID || !playlistID) {
    return;
  }

  if (folderKey) {
    await removePlaylistFromFolder(folderKey, playlistUID, playlistID);
  }
};

function addAlbumToPlaylist(playlistID, albumID) {
  return new Promise(async (resolve, reject) => {
    // Get tracks.
    const albumDetails = await makeMusicRequest(`albums/${albumID}`);
    let tracks = [];
    let cumulativeDuration = 0;
    const trackList = albumDetails.data[0].relationships.tracks.data;

    for (let i = 0; i < trackList.length; i++) {
      if (trackList[i].type == 'music-videos') {
        continue;
      }

      ;
      const trackID = trackList[i].id;
      tracks.push({
        trackID: `${trackID}`,
        randomID: `${new Date().getTime()}`
      });
      cumulativeDuration += trackList[i].attributes.durationInMillis;
    }

    (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}/playlists/${playlistID}`), {
      tracks: (0, _firestore.arrayUnion)(...tracks),
      dateModified: (0, _firestore.serverTimestamp)(),
      totalDuration: (0, _firestore.increment)(cumulativeDuration)
    });
    snac(`Album Added`, `"${albumDetails.data[0].attributes.name}" has been added to your playlist.`, 'success');
    resolve(true);
  });
}

window.openSharing = (playlistUID, playlistID) => {
  (0, _display.openModal)('updateSharing');

  $(`#copyLinkPlaylistButton`).get(0).onclick = () => {
    copyToClipboard(`${window.location.origin}/preview?playlistUID=${playlistUID}&playlistID=${playlistID}`);
  };

  $(`#ifEveryone`).addClass('hidden');

  switch (playlistMetaData[`${playlistUID}${playlistID}`].sharing) {
    case 'everyone':
      $(`#playlistSharingCheckOne`).get(0).checked = true;
      $(`#ifEveryone`).removeClass('hidden');
      break;

    case 'friends':
      $(`#playlistSharingCheckTwo`).get(0).checked = true;
      break;

    case 'none':
      $(`#playlistSharingCheckThree`).get(0).checked = true;
      break;

    default:
      $(`#ifEveryone`).removeClass('hidden');
      $(`#playlistSharingCheckOne`).get(0).checked = true;
      break;
  }

  $(`#savePlaylistSharing`).get(0).onclick = async () => {
    const isEveryone = $(`#playlistSharingCheckOne`).get(0).checked;
    const isFriends = $(`#playlistSharingCheckTwo`).get(0).checked;
    const isNone = $(`#playlistSharingCheckThree`).get(0).checked;

    if (!isEveryone && !isFriends && !isNone) {
      snac('Sharing Error', 'You must select an option.', 'danger');
      return;
    }

    (0, _display.closeModal)();

    if (isEveryone) {
      await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}/playlists/${playlistID}`), {
        sharing: 'everyone'
      });
      await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
        hiddenPlaylists: (0, _firestore.arrayRemove)(playlistID)
      });
    } else if (isFriends) {
      await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}/playlists/${playlistID}`), {
        sharing: 'friends'
      });
      await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
        hiddenPlaylists: (0, _firestore.arrayRemove)(playlistID)
      });
    } else if (isNone) {
      await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}/playlists/${playlistID}`), {
        sharing: 'none'
      });
      await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
        hiddenPlaylists: (0, _firestore.arrayUnion)(playlistID)
      });
    }

    snac('Sharing Updated', 'Your playlist sharing settings has been updated.', 'success');
  };
};

window.sharingSelectHandler = skip => {
  $(`.sharingCheckbox`).each(function (index, element) {
    if (element.id !== skip) {
      $(element).get(0).checked = false;
    }

    if (skip == 'playlistSharingCheckOne') {
      $(`#ifEveryone`).removeClass('hidden');
    } else {
      $(`#ifEveryone`).addClass('hidden');
    }
  });
};

window.recalculateDetails = async (playlistUID, playlistID) => {
  let duration = 0;

  for (let i = 0; i < cachePlaylistData[`${playlistUID}${playlistID}`].length; i++) {
    const track = cachePlaylistData[`${playlistUID}${playlistID}`][i];
    duration += musicCatalogue[track.trackID].attributes.durationInMillis;
  }

  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${playlistUID}/playlists/${playlistID}`), {
    totalDuration: duration
  });
  snac('Recalculated', 'Your playlist has been recalculated.', 'success');
};

function openEditorModePlaylist(playlistID) {
  window.clearTimeout(editorModeTimeouts[`${playlistID}`]);
  window.clearTimeout(editorModeTimeouts[`${playlistID}2`]);
  $(`#musicSidebar`).get(0).setAttribute('class', 'sidebarLeft animated fadeOutDown');
  editorModeTimeouts[`${playlistID}`] = window.setTimeout(() => {
    $(`#musicSidebar`).get(0).setAttribute('class', 'sidebarLeft hidden');
  }, 999);
  $(`#PlaylistView${user.uid}${playlistID}`).addClass('playlistEditorView');
  $(`#${user.uid}${playlistID}playlistDetailsOne`).removeClass('fadeIn');
  $(`#${user.uid}${playlistID}playlistDetailsOne`).addClass('animated');
  $(`#${user.uid}${playlistID}playlistDetailsOne`).addClass('fadeOut');
  $(`#playlistSearch${user.uid}${playlistID}`).addClass('fadeOut');
  $(`#playlistSearch${user.uid}${playlistID}`).removeClass('fadeIn');
  $(`#${user.uid}${playlistID}playlistTrackSearchResults`).addClass('fadeOut');
  $(`#${user.uid}${playlistID}playlistTrackSearchResults`).removeClass('fadeIn');
  $(`#${user.uid}${playlistID}SearchResults`).addClass('fadeOut');
  $(`#${user.uid}${playlistID}SearchResults`).removeClass('fadeIn');
  editorModeTimeouts[`${playlistID}2`] = window.setTimeout(() => {
    $(`#${user.uid}${playlistID}playlistDetailsOne`).addClass('hidden');
    $(`#${user.uid}${playlistID}playlistDetailsTwo`).removeClass('hidden');
    $(`#${user.uid}${playlistID}playlistDetailsTwo`).removeClass('fadeOut');
    $(`#${user.uid}${playlistID}playlistDetailsTwo`).addClass('animated');
    $(`#${user.uid}${playlistID}playlistDetailsTwo`).addClass('fadeIn');
    $(`#playlistSearch${user.uid}${playlistID}`).addClass('hidden');
    $(`#${user.uid}${playlistID}playlistTrackSearchResults`).addClass('hidden');
    $(`#${user.uid}${playlistID}SearchResults`).addClass('hidden');
  }, 999);
  editorModePlaylist = `${playlistID}`;
  editorModeTracks.clear();
  editorLastSelected = null;
  $(`#editorModeInjection`).html(`
    #musicPlayback {
      left: calc(128px) !important;
      width: calc(100% - 128px - 48px) !important;
    }
  `); // Edit each track element.

  $(`#${user.uid}${playlistID}playlistViewTracksContainer`).children('.music-track').each((index, element) => {
    $(element).get(0).onclick = event => {
      editorSelectTrack(playlistID, $(element).get(0).getAttribute('trackID'), $(element).get(0).getAttribute('playlistRandomID'), event);
    };
  });
}

function editorSelectTrack(playlistID, trackID, randomID, ev) {
  $(`#${user.uid}${playlistID}${randomID}${trackID}`).toggleClass('selectedTrack');

  if ($(`#${user.uid}${playlistID}${randomID}${trackID}`).hasClass('selectedTrack')) {
    editorModeTracks.add({
      trackID: `${trackID}`,
      randomID: `${randomID}}`
    });
  } else {
    editorModeTracks.forEach(x => {
      x.trackID == trackID && x.randomID == randomID ? editorModeTracks.delete(x) : x;
    });
  }

  if (editorLastSelected != null && ev && ev.shiftKey) {
    let low, high;
    const lastIndex = $(`#${user.uid}${playlistID}${editorLastSelected.split('.')[1]}${editorLastSelected.split('.')[0]}`).index() - 1;
    const currentIndex = $(`#${user.uid}${playlistID}${randomID}${trackID}`).index() - 1;
    console.log(lastIndex, currentIndex);

    if (lastIndex < currentIndex) {
      low = lastIndex;
      high = currentIndex;
    } else {
      low = currentIndex;
      high = lastIndex;
    }

    const children = $(`#${user.uid}${playlistID}playlistViewTracksContainer`).children('.music-track');
    const lastSelectedState = $(`#${user.uid}${playlistID}${editorLastSelected.split('.')[1]}${editorLastSelected.split('.')[0]}`).hasClass('selectedTrack');

    for (let i = low; i <= high; i++) {
      if (lastSelectedState) {
        // Make everything in between selected.
        $(children[i]).addClass('selectedTrack');
        editorModeTracks.add({
          trackID: children[i].getAttribute('trackID'),
          randomID: children[i].getAttribute('playlistRandomID')
        });
      } else {
        if ($(children[i]).hasClass('selectedTrack')) {
          // Make everything in between unselected.
          $(children[i]).removeClass('selectedTrack');
          editorModeTracks.delete({
            trackID: children[i].getAttribute('trackID'),
            randomID: children[i].getAttribute('playlistRandomID')
          });
        }
      }
    }
  }

  editorLastSelected = `${trackID}.${randomID}`;
  window.clearTimeout(editorModeTimeouts[`${playlistID}3`]);

  if (editorModeTracks.size) {
    $(`#${user.uid}${playlistID}EditToolbar`).removeClass('hidden');
    $(`#${user.uid}${playlistID}EditToolbar`).removeClass('fadeOutDown');
    $(`#${user.uid}${playlistID}EditToolbar`).addClass('fadeInUp');
  } else {
    $(`#${user.uid}${playlistID}EditToolbar`).removeClass('fadeInUp');
    $(`#${user.uid}${playlistID}EditToolbar`).addClass('fadeOutDown');
    editorModeTimeouts[`${playlistID}3`] = window.setTimeout(() => {
      $(`#${user.uid}${playlistID}EditToolbar`).addClass('hidden');
    }, 999);
  }
}

function editorModeCopy(fromPlaylistID) {
  $(`#playlistContextList`).empty();
  const a = document.createElement('button');
  a.setAttribute('class', 'btn contextButton contextButtonImportant');
  a.innerHTML = `<i class="bx bx-plus"></i> New Playlist`;

  a.onclick = () => openNewPlaylistDialog(null, null, true, fromPlaylistID);

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

      a.onclick = () => addTracksToPlaylist(playlistID);

      $('#playlistContextList').get(0).appendChild(a);
    }
  }

  twemoji.parse($(`#playlistContextList`).get(0));
}

function addTracksToPlaylist(playlistID) {
  let tracks = [];
  editorModeTracks.forEach(x => {
    tracks.push(x);
  });
  (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}/playlists/${playlistID}`), {
    tracks: (0, _firestore.arrayUnion)(...tracks)
  });
  snac('Tracks Added', `Successfully added ${tracks.length} tracks.`, 'success');
}

function editorModeTrash(playlistID) {
  let tracks = [];
  editorModeTracks.forEach(x => {
    tracks.push(x);
    editorModeTracks.delete(x);
  });
  (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}/playlists/${playlistID}`), {
    tracks: (0, _firestore.arrayRemove)(...tracks)
  });
  $(`#${user.uid}${playlistID}EditToolbar`).removeClass('fadeInUp');
  $(`#${user.uid}${playlistID}EditToolbar`).addClass('fadeOutDown');
  editorModeTimeouts[`${playlistID}3`] = window.setTimeout(() => {
    $(`#${user.uid}${playlistID}EditToolbar`).addClass('hidden');
  }, 999);
  snac('Tracks Removed', `Successfully removed ${tracks.length} tracks.`, 'success');
}

function exitEditorModePlaylist(playlistID) {
  window.clearTimeout(editorModeTimeouts[`${playlistID}`]);
  window.clearTimeout(editorModeTimeouts[`${playlistID}2`]);
  $(`#musicSidebar`).get(0).setAttribute('class', 'sidebarLeft animated fadeInUp');
  editorModeTimeouts[`${playlistID}`] = window.setTimeout(() => {
    $(`#musicSidebar`).get(0).setAttribute('class', 'sidebarLeft');
  }, 999);
  $(`#PlaylistView${user.uid}${playlistID}`).removeClass('playlistEditorView');
  $(`#${user.uid}${playlistID}playlistDetailsTwo`).removeClass('fadeIn');
  $(`#${user.uid}${playlistID}playlistDetailsTwo`).addClass('animated');
  $(`#${user.uid}${playlistID}playlistDetailsTwo`).addClass('fadeOut');
  $(`#playlistSearch${user.uid}${playlistID}`).removeClass('fadeOut');
  $(`#playlistSearch${user.uid}${playlistID}`).addClass('fadeIn');
  $(`#playlistSearch${user.uid}${playlistID}`).removeClass('hidden');
  $(`#${user.uid}${playlistID}playlistTrackSearchResults`).removeClass('fadeOut');
  $(`#${user.uid}${playlistID}playlistTrackSearchResults`).removeClass('hidden');
  $(`#${user.uid}${playlistID}playlistTrackSearchResults`).addClass('fadeIn');
  $(`#${user.uid}${playlistID}SearchResults`).removeClass('fadeOut');
  $(`#${user.uid}${playlistID}SearchResults`).removeClass('hidden');
  $(`#${user.uid}${playlistID}SearchResults`).addClass('fadeIn');
  editorModeTimeouts[`${playlistID}2`] = window.setTimeout(() => {
    $(`#${user.uid}${playlistID}playlistDetailsTwo`).addClass('hidden');
    $(`#${user.uid}${playlistID}playlistDetailsOne`).removeClass('hidden');
    $(`#${user.uid}${playlistID}playlistDetailsOne`).removeClass('fadeOut');
    $(`#${user.uid}${playlistID}playlistDetailsOne`).addClass('animated');
    $(`#${user.uid}${playlistID}playlistDetailsOne`).addClass('fadeIn');
  }, 999);
  $(`#${user.uid}${playlistID}EditToolbar`).removeClass('fadeInUp');
  $(`#${user.uid}${playlistID}EditToolbar`).addClass('fadeOutDown');
  editorModeTimeouts[`${playlistID}3`] = window.setTimeout(() => {
    $(`#${user.uid}${playlistID}EditToolbar`).addClass('hidden');
  }, 999);
  editorModePlaylist = null;
  editorModeTracks.clear();
  editorLastSelected = null;
  $(`#editorModeInjection`).html(``);
  updatePlaylistIndexes(playlistID);
  $('.selectedTrack').removeClass('selectedTrack');
}
},{"./app":"js/app.js","./componentse":"js/componentse.js","./display":"js/display.js","./electron":"js/electron.js","./firebaseChecks":"js/firebaseChecks.js","./music":"js/music.js","./stripe":"js/stripe.js"}],"js/context.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.playlistSelector = playlistSelector;

var _app = require("./app");

var _channels = require("./channels");

var _display = require("./display");

var _friends = require("./friends");

var _library = require("./library");

var _music = require("./music");

var _servers = require("./servers");

var _users = require("./users");

var _vcMusic = require("./vcMusic");

window.menuOpen = false;
document.addEventListener("contextmenu", e => {
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
      setContextSelectArtistItems(item, element, trackID);
      break;

    default:
      break;
  }

  positionMenu(e, $(`#${item}_context`).get(0));
};

window.checkElements = e => {
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
}; // Context positioning logic.


function getPosition(t) {
  var e = 0,
      i = 0;
  if (!t) t = window.event;
  return t.pageX || t.pageY ? (e = t.pageX, i = t.pageY) : (t.clientX || t.clientY) && (e = t.clientX + document.body.scrollLeft + document.documentElement.scrollLeft, i = t.clientY + document.body.scrollTop + document.documentElement.scrollTop), {
    x: e,
    y: i
  };
}

function clickInsideElement(t, e) {
  var i = t.srcElement || t.Target;
  if (i.classList.contains(e)) return i;

  for (; i = i.parentNode;) if (i.classList && i.classList.contains(e)) return i;

  return !1;
}

function positionMenu(t, e) {
  const clickCoords = getPosition(t);
  const clickCoordsX = clickCoords.x;
  const clickCoordsY = clickCoords.y;
  const menuWidth = e.offsetWidth + 28;
  const menuHeight = e.offsetHeight + 8;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  windowWidth - clickCoordsX < menuWidth ? e.style.left = windowWidth - menuWidth + "px" : e.style.left = clickCoordsX + "px", windowHeight - clickCoordsY < menuHeight ? e.style.top = windowHeight - menuHeight + "px" : e.style.top = clickCoordsY + "px";
}

function setContextFolderItems(item, element) {
  const contextItemList = $(`#${item}_context`).children().first().children().first().children();
  const folderID = element.getAttribute('folderID');
  const folderName = element.getAttribute('folderName');

  contextItemList.eq(0).get(0).onclick = () => expandPlaylistFolder(folderID);

  if ($(`#playlistFolderContent${folderID}`).get(0).getAttribute('style') !== '') {
    contextItemList.eq(0).html('Close Folder');
  } else {
    contextItemList.eq(0).html('Open Folder');
  }

  contextItemList.eq(2).get(0).onclick = () => (0, _library.prepareRenameFolder)(folderID, folderName);

  contextItemList.eq(3).get(0).onclick = () => {
    (0, _display.openModal)('deleteFolder');

    $(`#deleteFolderConfirm`).get(0).onclick = () => {
      (0, _display.closeModal)();
      (0, _library.deletePlaylistFolder)(folderID, folderName);
    };
  };

  contextItemList.eq(5).get(0).onclick = () => copyToClipboard(folderID);
}

function setContextGuildFolderItems(item, element) {
  const contextItemList = $(`#${item}_context`).children().first().children().first().children();
  const folderID = element.getAttribute('folderID');
  const folderName = element.getAttribute('folderName');

  contextItemList.eq(0).get(0).onclick = () => (0, _servers.expandGuildFolder)(folderID);

  if ($(`#guildFolderContent${folderID}`).get(0).getAttribute('style') !== '') {
    contextItemList.eq(0).html('Close Folder');
  } else {
    contextItemList.eq(0).html('Open Folder');
  }

  contextItemList.eq(2).get(0).onclick = () => (0, _servers.prepareRenameGuildFolder)(folderID, folderName);

  contextItemList.eq(3).get(0).onclick = () => {
    (0, _display.openModal)('deleteFolder');

    $(`#deleteFolderConfirm`).get(0).onclick = () => {
      (0, _display.closeModal)();
      (0, _servers.deleteGuildPlaylistFolder)(folderID, folderName);
    };
  };

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
    };
  } else {
    contextItemList.eq(2).html('Add to Saved');

    contextItemList.eq(2).get(0).onclick = () => {
      addToLibrary('artists', artistID);
    };
  }

  contextItemList.eq(4).get(0).onclick = () => copyToClipboard(artistID);
}

function setContextAlbumItems(item, element) {
  const contextItemList = $(`#${item}_context`).children().first().children().first().children();
  const albumID = element.getAttribute('albumID');

  contextItemList.eq(0).get(0).onclick = () => openAlbum(albumID);

  if (cacheLibraryAlbums.includes(albumID)) {
    contextItemList.eq(2).html('Remove from Saved');

    contextItemList.eq(2).get(0).onclick = () => {
      removeFromLibrary('albums', albumID);
    };
  } else {
    contextItemList.eq(2).html('Add to Saved');

    contextItemList.eq(2).get(0).onclick = () => {
      addToLibrary('albums', albumID);
    };
  }

  contextItemList.eq(4).get(0).onclick = () => copyToClipboard(albumID);
}

window.setContextSelectArtistItems = async (item, element, trackID, data, event) => {
  let artists = data;

  if (!data) {
    artists = (await makeMusicRequest(`songs/${trackID}?include=artists`)).data[0].relationships.artists.data;
  }

  console.log(artists);

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
    a.innerHTML = artists[i].attributes.name;

    a.onclick = () => {
      openArtist(artists[i].id);
      menuOpen = false;
      $('.contextMenuActive').removeClass('contextMenuActive');
    };

    $('#selectArtistContextList').get(0).appendChild(a);
  }

  console.log(event);

  if (event) {
    positionMenu(event, $(`#selectArtist_context`).get(0));
  }
};

function setContextPlaylistItems(item, element) {
  const contextItemList = $(`#${item}_context`).children().first().children().first().children();
  const playlistID = element.getAttribute('playlistID');
  const playlistUID = element.getAttribute('playlistUID');
  const playlistName = element.getAttribute('playlistName');
  const folderContext = element.getAttribute('inFolder');

  contextItemList.eq(0).get(0).onclick = () => {
    (0, _library.openPlaylist)(playlistUID, playlistID, playlistName);
  };

  if (playlistUID == user.uid) {
    contextItemList.eq(2).removeClass('hidden');

    contextItemList.eq(2).get(0).onclick = () => {
      (0, _library.prepareRenamePlaylist)(playlistID);
    };
  } else {
    contextItemList.eq(2).addClass('hidden');
  }

  if (folderContext) {
    contextItemList.eq(3).addClass('hidden');
    contextItemList.eq(4).removeClass('hidden');

    contextItemList.eq(4).get(0).onclick = () => {
      $('.contextMenuActive').removeClass('contextMenuActive');
      (0, _library.removePlaylistFromFolder)(folderContext, playlistUID, playlistID);
    };
  } else {
    contextItemList.eq(4).addClass('hidden');
    contextItemList.eq(3).removeClass('hidden');

    contextItemList.eq(3).get(0).onclick = () => {
      // Add to folder
      $(`#folderContextList`).empty();
      const a = document.createElement('button');
      a.setAttribute('class', 'btn contextButton contextButtonImportant');
      a.innerHTML = `<i class="bx bx-plus"></i> New Folder`;

      a.onclick = () => (0, _music.openNewPlaylistFolderDialog)(playlistUID, playlistID);

      $('#folderContextList').get(0).appendChild(a);
      let keys = [];

      if (cacheUser.playlistFolders) {
        keys = Object.keys(cacheUser.playlistFolders);
      }

      for (let i = 0; i < keys.length; i++) {
        const a = document.createElement('button');
        a.setAttribute('class', 'btn contextButton');
        a.id = `${keys[i].split('<')[1]}AddFolderButton`;
        a.innerHTML = keys[i].split('<')[0];

        a.onclick = () => (0, _library.addPlaylistToFolder)(keys[i].split('<')[1], keys[i].split('<')[0], playlistUID, playlistID);

        $('#folderContextList').get(0).appendChild(a);
      } // Sort the folders


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

      twemoji.parse($(`#folderContextList`).get(0));
    };
  }

  if (playlistUID == user.uid) {
    // Only show delete for own playlists
    contextItemList.eq(5).html('Delete Playlist');

    contextItemList.eq(5).get(0).onclick = () => {
      (0, _library.prepareDeletePlaylist)(playlistID, playlistName, folderContext);
    };
  } else {
    contextItemList.eq(5).html('Remove from Library');

    contextItemList.eq(5).get(0).onclick = () => {
      (0, _library.prepareRemovePlaylistFromLibrary)(playlistUID, playlistID, playlistName, folderContext);
    };
  }

  contextItemList.eq(7).get(0).onclick = () => {
    copyToClipboard(`${playlistID}`);
  };
}

function setContextTrackItems(item, element) {
  const contextItemList = $(`#${item}_context`).children().first().children().first().children();
  const trackID = element.getAttribute('trackID');
  const playlistID = element.getAttribute('playlistID');
  const playlistUID = element.getAttribute('playlistUID');
  const playlistRandomID = element.getAttribute('playlistRandomID');
  const specialContext = element.getAttribute('specialContext');
  const fromQueue = element.getAttribute('fromQueue');
  const fromLP = element.getAttribute('fromLP');

  contextItemList.eq(0).get(0).onclick = () => {
    playASong(trackID);
  };

  contextItemList.eq(1).get(0).onclick = () => {
    if (musicQueue.length || musicPlaying.id) {
      musicQueue.push(trackID); // If song is playing or queue exists, add to queue.

      (0, _music.updateQueue)('appendQueue', musicCatalogue[trackID], false, false);
    } else {
      playASong(trackID); // If no song, no queue, play it.
    }
  };

  contextItemList.eq(2).addClass('hidden');

  if (activeListeningParty) {
    contextItemList.eq(2).removeClass('hidden');

    contextItemList.eq(2).get(0).onclick = () => {
      addTrackToChannelQueue(trackID, activeListeningParty.split('/')[0], activeListeningParty.split('/')[1], activeListeningParty.split('/')[2]);
      snac('Added', 'This track has been added to the listening party queue.', 'success');
    };
  }

  contextItemList.eq(4).removeClass('hidden'); // artist

  contextItemList.eq(4).get(0).setAttribute('trackID', trackID); // artist

  contextItemList.eq(5).removeClass('hidden');

  contextItemList.eq(5).get(0).onclick = () => {
    openAlbum(musicCatalogue[trackID].relationships.albums.data[0].id);
  };

  contextItemList.eq(6).removeClass('hidden'); // Divider (Must need if showing album & artist options.

  contextItemList.eq(7).get(0).onclick = () => {
    playlistSelector(trackID, false);
  };

  contextItemList.eq(8).addClass('hidden');

  if (playlistID && playlistUID == user.uid) {
    contextItemList.eq(8).removeClass('hidden');

    contextItemList.eq(8).get(0).onclick = () => {
      (0, _library.removeTrackFromPlaylist)(playlistID, trackID, playlistRandomID);
    };
  }

  if (cacheLibraryTracks.includes(trackID)) {
    contextItemList.eq(9).html('Remove from Saved');

    contextItemList.eq(9).get(0).onclick = () => {
      removeFromLibrary('tracks', trackID);
    };
  } else {
    contextItemList.eq(9).html('Add to Saved');

    contextItemList.eq(9).get(0).onclick = () => {
      addToLibrary('tracks', trackID);
    };
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
      });
      let searchIndex = 0;

      for (let i = 0; i < musicQueue.length; i++) {
        if (`${musicQueue[i]}` == `${trackID}`) {
          if (searchIndex == nthIndex) {
            musicQueue.splice(i, 1);
          } else {
            searchIndex = searchIndex + 1;
          }
        }
      }

      (0, _music.updateQueue)('removeQueue', trackID, false, nthIndex);
    };
  }

  if (fromLP && activeListeningParty && (serverData[`${guildUID}${guildID}`].owner == user.uid || serverData[`${guildUID}${guildID}`].staff.includes(user.uid))) {
    contextItemList.eq(10).removeClass('hidden');

    contextItemList.eq(10).get(0).onclick = () => {
      // Remove track from listening party queue.
      (0, _vcMusic.removeTrackFromVCQueue)(fromLP);
    };
  }

  contextItemList.eq(11).addClass('hidden');

  if (specialContext == 'nowPlaying') {
    // dedicated loop button
    contextItemList.eq(11).removeClass('hidden');

    if (enableLoopConst) {
      contextItemList.eq(11).html('Disable Loop');

      contextItemList.eq(11).get(0).onclick = () => {
        (0, _music.disableLoop)(trackID);
      };
    } else {
      contextItemList.eq(11).html('Enable Loop');

      contextItemList.eq(11).get(0).onclick = () => {
        (0, _music.enableLoop)(trackID);
      };
    }
  }

  if (cacheUser.track == trackID) {
    contextItemList.eq(12).html('Remove from Profile');

    contextItemList.eq(12).get(0).onclick = () => {
      (0, _app.removeTrackFromProfile)();
    };
  } else {
    contextItemList.eq(12).html('Add to Profile');

    contextItemList.eq(12).get(0).onclick = () => {
      (0, _app.addTrackToProfile)(trackID);
    };
  }

  contextItemList.eq(14).addClass('hidden');

  if (adminUser) {
    contextItemList.eq(14).removeClass('hidden');

    contextItemList.eq(14).get(0).onclick = () => {
      (0, _music.openModifyPointerModal)(trackID);
    };
  }

  contextItemList.eq(15).get(0).onclick = () => {
    (0, _app.reportTrack)(trackID);
  };

  contextItemList.eq(16).get(0).onclick = () => {
    copyToClipboard(`track:${trackID}`);
  };
}

function setContextMessageItems(item, element) {
  const contextItemList = $(`#${item}_context`).children().first().children().first().children();
  const messageID = element.getAttribute('messageID');
  const messageSender = element.getAttribute('messageSender');
  const messageType = element.getAttribute('messageType');
  const messageGuildUID = element.getAttribute('guildUID');
  const messageChannel = element.getAttribute('channelID');
  const messageSenderName = element.getAttribute('messageSenderName');

  if (cacheUserPracticalBookmarks[messageID]) {
    contextItemList.eq(2).html('Remove Bookmark');

    contextItemList.eq(2).get(0).onclick = () => {
      (0, _app.unsaveMessage)(cacheUserPracticalBookmarks[messageID]);
    };
  } else {
    contextItemList.eq(2).html('Bookmark');

    contextItemList.eq(2).get(0).onclick = () => {
      (0, _app.saveMessage)(element);
    };
  }

  contextItemList.eq(0).get(0).onclick = () => {
    copyToClipboard((0, _display.messageHTMLtoText)(null, element));
  };

  if (messageType == 'DM') {
    if (!DMCachedPins[messageChannel].has(messageID)) {
      contextItemList.eq(3).html('Pin');

      contextItemList.eq(3).get(0).onclick = () => {
        (0, _friends.pinDMMessage)(messageChannel, messageID, messageSender, messageSenderName);
      };
    } else {
      contextItemList.eq(3).html('Unpin');

      contextItemList.eq(3).get(0).onclick = () => {
        (0, _friends.unpinDMMessage)(messageChannel, messageID);
      };
    }
  } else {
    if (!cachedPins[messageChannel].has(messageID)) {
      contextItemList.eq(3).html('Pin');

      contextItemList.eq(3).get(0).onclick = () => {
        (0, _channels.pinMessage)(messageChannel, messageID, messageSender, messageSenderName);
      };
    } else {
      contextItemList.eq(3).html('Unpin');

      contextItemList.eq(3).get(0).onclick = () => {
        (0, _channels.unpinMessage)(messageID, messageChannel);
      };
    }
  }

  if (messageSender === user.uid) {
    contextItemList.eq(5).removeClass("hidden");
    contextItemList.eq(6).removeClass("hidden");
    contextItemList.eq(7).removeClass("hidden");
  } else {
    contextItemList.eq(5).addClass("hidden");
    contextItemList.eq(6).addClass("hidden");
    contextItemList.eq(7).addClass("hidden");
  }

  ; // Full support for non-stndard messages.

  contextItemList.eq(5).get(0).onclick = () => {
    // Edit Message
    if (messageType == 'DM') {
      (0, _friends.prepareDMEditMessage)(messageChannel, messageID);
    } else {
      (0, _channels.prepareEditMessage)(messageChannel, messageID);
    }
  };

  contextItemList.eq(6).get(0).onclick = () => {
    // Delete Message
    if (messageType == 'DM') {
      (0, _friends.deleteDMMessage)(messageChannel, messageID);
    } else if (messageType == 'Channel') {
      (0, _channels.deleteMessage)(messageChannel, messageID);
    }
  };

  if (messageGuildUID == user.uid) {
    contextItemList.eq(6).removeClass("hidden");
    contextItemList.eq(7).removeClass("hidden"); // Divider
  }

  contextItemList.eq(8).get(0).onclick = () => {
    copyToClipboard(messageID);
  };
}

function setContextChannelItems(item, element) {
  const contextItemList = $(`#${item}_context`).children().first().children().first().children();
  const guildUID = element.getAttribute('guildUID');
  const guildID = element.getAttribute('guildID');
  const channelID = element.getAttribute('channelID');
  const channelName = element.getAttribute('channelName');

  contextItemList.eq(0).get(0).onclick = () => {
    element.click();
  }; // Check if channel has unread indicator.


  if (addPendingIndicator[guildUID + guildID + channelID]) {
    contextItemList.eq(2).html('Mark as Read');

    contextItemList.eq(2).get(0).onclick = () => {
      (0, _channels.markChannelAsRead)(guildUID, guildID, channelID, true);
    };
  } else {
    contextItemList.eq(2).html('Mark as Unread');

    contextItemList.eq(2).get(0).onclick = () => {
      (0, _channels.markChannelAsUnread)(guildUID, guildID, channelID);
    };
  }

  let channelMuted = false;

  if (mutedServers.includes(`${guildUID}${guildID}${channelID}`)) {
    channelMuted = true;
  }

  if (channelMuted) {
    contextItemList.eq(3).html('Unmute Lounge');

    contextItemList.eq(3).get(0).onclick = () => {
      (0, _channels.unmuteChannel)(guildUID, guildID, channelID, true);
    };
  } else {
    contextItemList.eq(3).html('Mute Lounge');

    contextItemList.eq(3).get(0).onclick = () => {
      (0, _channels.muteChannel)(guildUID, guildID, channelID, true);
    };
  }

  contextItemList.eq(5).addClass('hidden');
  contextItemList.eq(6).addClass('hidden');
  contextItemList.eq(7).addClass('hidden'); // If server admin / owner

  if (guildUID == user.uid || serverData[guildUID + guildID].staff.includes(`${user.uid}`)) {
    contextItemList.eq(6).removeClass('hidden');

    contextItemList.eq(6).get(0).onclick = () => {
      deleteLoungePrepare(guildUID, guildID, channelID, channelName);
    };

    contextItemList.eq(5).removeClass('hidden');

    contextItemList.eq(5).get(0).onclick = () => {
      renameLoungePrepare(guildUID, guildID, channelID);
    };

    contextItemList.eq(7).removeClass('hidden');
  }

  contextItemList.eq(8).get(0).onclick = () => {
    (0, _app.reportLounge)(guildUID, guildID, channelID);
  };

  contextItemList.eq(9).get(0).onclick = () => {
    copyToClipboard(channelID);
  };
}

function setContextServerItems(item, element) {
  const contextItemList = $(`#${item}_context`).children().first().children().first().children();
  const guildUID = element.getAttribute('guildUID');
  const guildID = element.getAttribute('guildID');
  const folderID = element.getAttribute('inFolder');

  contextItemList.eq(0).get(0).onclick = () => {
    element.click();
  }; // Check if server has unread indicator.


  if (addPendingIndicator[guildUID + guildID]) {
    contextItemList.eq(3).removeClass('hidden');

    contextItemList.eq(3).get(0).onclick = () => {
      (0, _servers.markServerRead)(guildUID, guildID);
    };
  } else {
    contextItemList.eq(3).addClass('hidden');
  }

  if (folderID) {
    contextItemList.eq(2).html('Remove from Folder');

    contextItemList.eq(2).get(0).onclick = () => {
      $('.contextMenuActive').removeClass('contextMenuActive');
      (0, _servers.removeGroupFromFolder)(guildUID, guildID, folderID, false);
    };
  } else {
    contextItemList.eq(2).html('Add to Folder');

    contextItemList.eq(2).get(0).onclick = () => {
      // add to folder
      $(`#folderContextList`).empty();
      const a = document.createElement('button');
      a.setAttribute('class', 'btn contextButton contextButtonImportant');
      a.innerHTML = `<i class="bx bx-plus"></i> New Folder`;

      a.onclick = () => (0, _servers.createGroupFolder)(guildUID, guildID);

      $('#folderContextList').get(0).appendChild(a);
      let keys = [];

      if (cacheUser.guildFolders) {
        keys = Object.keys(cacheUser.guildFolders);
      }

      for (let i = 0; i < keys.length; i++) {
        const a = document.createElement('button');
        a.setAttribute('class', 'btn contextButton');
        a.id = `${keys[i].split('<')[1]}AddFolderButton`;
        a.innerHTML = keys[i].split('<')[0];

        a.onclick = () => (0, _servers.addGroupToFolder)(guildUID, guildID, keys[i]);

        $('#folderContextList').get(0).appendChild(a);
      } // Sort the folders


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

      twemoji.parse($(`#folderContextList`).get(0));
    };
  } // Check if server is muted


  let serverMuted = false;

  if (mutedServers.includes(`${guildUID}${guildID}`)) {
    serverMuted = true;
  }

  if (serverMuted) {
    contextItemList.eq(4).html('Unmute Group');

    contextItemList.eq(4).get(0).onclick = () => {
      unmuteServer(guildUID, guildID, true);
    };
  } else {
    contextItemList.eq(4).html('Mute Group');

    contextItemList.eq(4).get(0).onclick = () => {
      muteServer(guildUID, guildID, true);
    };
  }

  contextItemList.eq(7).addClass('hidden');

  if (guildUID !== user.uid) {
    contextItemList.eq(7).removeClass('hidden');

    contextItemList.eq(7).get(0).onclick = () => {
      (0, _display.openModal)('leaveServer');

      $('#guildConfirmLeave').get(0).onclick = () => {
        (0, _display.disableButton)($('#guildConfirmLeave'));
        (0, _servers.leaveServer)(guildUID, guildID);
        (0, _display.closeModal)();
      };
    };
  }

  contextItemList.eq(6).get(0).onclick = () => {
    (0, _app.reportGroup)(guildUID, guildID);
  };

  contextItemList.eq(8).get(0).onclick = () => {
    copyToClipboard(guildID);
  };
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
    contextItemList.eq(11).addClass('hidden');
    contextItemList.eq(12).addClass('hidden');
  }

  if (!areFriends) {
    contextItemList.eq(1).addClass('hidden');
    contextItemList.eq(2).addClass('hidden');
    contextItemList.eq(7).addClass('hidden');
    contextItemList.eq(8).addClass('hidden');
  }

  let serverOwner = false;

  if (guildID) {
    if (serverData[guildUID + guildID].owner == user.uid) {
      serverOwner = true;
    }
  }

  if (!guildID || !serverOwner) {
    contextItemList.eq(3).addClass('hidden');
    contextItemList.eq(4).addClass('hidden');
    contextItemList.eq(5).addClass('hidden');
    contextItemList.eq(6).addClass('hidden');
  }

  contextItemList.eq(0).get(0).setAttribute('onclick', `openUserCard('${userID}')`);

  contextItemList.eq(1).get(0).onclick = () => {
    if ($(`#${userID}FriendItem`).length) {
      (0, _servers.openSpecialServer)('friends');
      (0, _friends.openFriendsDM)(userID, userName);
      return;
    }

    snac('Error', 'Become friends with this person to message them.');
  };

  contextItemList.eq(2).get(0).onclick = () => {
    if ($(`#${userID}FriendItem`).length) {
      (0, _servers.openSpecialServer)('friends');
      (0, _friends.openFriendsDM)(userID, userName);
      window.setTimeout(() => {
        startCallDM(userID);
      }, 350);
      return;
    }

    snac('Error', 'Become friends with this person to call them.');
  }; // Guild stuff


  if (serverOwner) {
    let isStaff = false;

    if (serverData[guildUID + guildID].staff.includes(`${userID}`)) {
      contextItemList.eq(6).get(0).onclick = () => {
        (0, _servers.demoteUser)(guildID, userID);
      };

      contextItemList.eq(5).addClass('hidden');
    } else {
      contextItemList.eq(5).get(0).onclick = () => {
        (0, _servers.promoteUser)(guildID, userID);
      };

      contextItemList.eq(6).addClass('hidden');
    } // Kick member


    contextItemList.eq(4).get(0).onclick = () => {
      (0, _servers.kickMember)(guildID, userID, userName);
    };
  }

  if (DMunreadIndicators[userID] === true) {
    contextItemList.eq(8).html('Mark as Read');

    contextItemList.eq(8).get(0).onclick = () => {
      (0, _friends.markDMRead)(userID);
    };
  } else {
    contextItemList.eq(8).html('Mark as Unread');

    contextItemList.eq(8).get(0).onclick = () => {
      (0, _friends.markDMUnread)(userID);
    };
  }

  if (areFriends) {
    contextItemList.eq(9).html('Remove Friend');

    contextItemList.eq(9).get(0).onclick = () => {
      (0, _friends.prepareRemoveFriend)(userID, true);
    };
  } else {
    if (cacheUser.outgoingFriendRequests.some(e => e.u === userID)) {
      // Outgoing.
      contextItemList.eq(9).html('Cancel Request');

      contextItemList.eq(9).get(0).onclick = () => {
        cancelRequest(userID);
      };
    } else {
      contextItemList.eq(9).html('Add Friend');

      contextItemList.eq(9).get(0).onclick = () => {
        confirmFriendRequest(userID);
      };
    }
  }

  contextItemList.eq(12).addClass('hidden');
  contextItemList.eq(11).addClass('hidden');

  if (userContext == 'voice' && userID !== user.uid) {
    contextItemList.eq(12).removeClass('hidden');
    contextItemList.eq(11).removeClass('hidden'); // Initialize slider on eq(11)

    const vol = localStorage.getItem('volumeOf' + userID);
    $(`#sliderOnUser`).get(0).value = vol;

    $(`#sliderOnUser`).get(0).oninput = function () {
      localStorage.setItem('volumeOf' + userID, this.value);
      $(`#${userID}usersAudio`).get(0).volume = parseInt(this.value) / 2 / 100;
    };
  }

  contextItemList.eq(13).get(0).onclick = () => {
    reportUser(userID);
  };

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
    contextItemList.eq(14).html('Unblock');

    contextItemList.eq(14).get(0).onclick = () => {
      (0, _users.unblockUser)(userID, userName);
    };
  } else {
    contextItemList.eq(14).html('Block');

    contextItemList.eq(14).get(0).onclick = () => {
      (0, _users.blockUser)(userID, userName);
    };
  }

  contextItemList.eq(15).get(0).onclick = () => {
    copyToClipboard(userID);
  };
}

function playlistSelector(trackID, albumID) {
  $(`#playlistContextList`).empty();
  const a = document.createElement('button');
  a.setAttribute('class', 'btn contextButton contextButtonImportant');
  a.innerHTML = `<i class="bx bx-plus"></i> New Playlist`;

  a.onclick = () => (0, _music.openNewPlaylistDialog)(trackID, albumID);

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
      } else {
        a.onclick = () => (0, _library.addAlbumToPlaylist)(playlistID, albumID);
      }

      $('#playlistContextList').get(0).appendChild(a);
    }
  }

  twemoji.parse($(`#playlistContextList`).get(0));
}
},{"./app":"js/app.js","./channels":"js/channels.js","./display":"js/display.js","./friends":"js/friends.js","./library":"js/library.js","./music":"js/music.js","./servers":"js/servers.js","./users":"js/users.js","./vcMusic":"js/vcMusic.js"}],"js/music.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.backwardSong = backwardSong;
exports.buildMusicSocialCard = buildMusicSocialCard;
exports.clearHistory = clearHistory;
exports.clearMusicViews = clearMusicViews;
exports.clearMusicViewsPlaylist = clearMusicViewsPlaylist;
exports.clearQueue = clearQueue;
exports.disableLoop = disableLoop;
exports.enableLoop = enableLoop;
exports.forwardSong = forwardSong;
exports.initalizePlayback = initalizePlayback;
exports.loadMusic = loadMusic;
exports.loadRecentSearches = loadRecentSearches;
exports.loginSpotify = loginSpotify;
exports.manageSpotify = manageSpotify;
exports.musicTab = musicTab;
exports.openModifyPointerModal = openModifyPointerModal;
exports.openNewPlaylistDialog = openNewPlaylistDialog;
exports.openNewPlaylistFolderDialog = openNewPlaylistFolderDialog;
exports.openOtherPlaylist = openOtherPlaylist;
exports.pauseMusicButton = pauseMusicButton;
exports.reloadSocialTab = reloadSocialTab;
exports.searchMusicButton = searchMusicButton;
exports.spotifyPlaylistLookup = spotifyPlaylistLookup;
exports.switchToHistory = switchToHistory;
exports.updateQueue = updateQueue;

var _firestore = require("firebase/firestore");

var _functions = require("@firebase/functions");

var timeago = _interopRequireWildcard(require("timeago.js"));

var _display = require("./display");

var _library = require("./library");

var _playback = require("./playback");

var _presence = require("./presence");

var _servers = require("./servers");

var _settings = require("./settings");

var _stripe = require("./stripe");

var _context = require("./context");

var _vcMusic = require("./vcMusic");

var _componentse = require("./componentse");

var _firebaseChecks = require("./firebaseChecks");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

(0, _firebaseChecks.checkAppInitialized)();
const db = (0, _firestore.getFirestore)();
const functions = (0, _functions.getFunctions)();
window.musicLoaded = false;
window.musicQueue = [];
window.musicHistory = [];
window.musicBack = [];
window.musicPlaying = {};
window.skipTimeout = null;
window.enableLoopConst = null;
window.playbackViewActive = null;
window.clearHidePlayback = null;
window.musicSocialExpandTimeout = null;
window.activeMusicTab = '';
window.openedTabs = [];
window.libraryPlayer = new Plyr(`#libraryPlayer`, {
  controls: ['progress', 'current-time', 'mute', 'volume']
});
window.libraryPlayerElement = $('#libraryPlayer').get(0);
window.friendsPlaylistPaginationIndex = null;
window.spotifyToken = null;
const placeholderAlbumImage = 'https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/app%2FdefaultAlbum.png?alt=media';
libraryPlayer.on('playing', event => {
  $('#playerPauseButton').html(`<i class="bx bx-pause"></i>`);

  $('#playerPauseButton').get(0).onclick = () => {
    pauseMusicButton();
  };

  $('#playerPauseButtonMini').html(`<i class="bx bx-pause"></i>`);

  $('#playerPauseButtonMini').get(0).onclick = () => {
    pauseMusicButton();
  };
});
libraryPlayer.on('pause', event => {
  $('#playerPauseButton').html(`<i class="bx bx-play"></i>`);

  $('#playerPauseButton').get(0).onclick = () => {
    playMusicButton();
  };

  $('#playerPauseButtonMini').html(`<i class="bx bx-play"></i>`);

  $('#playerPauseButtonMini').get(0).onclick = () => {
    playMusicButton();
  };
});
libraryPlayer.on('volumechange', event => {
  const inputVolume = event;
});
navigator.mediaSession.setActionHandler('play', function () {
  libraryPlayer.play();
});
navigator.mediaSession.setActionHandler('pause', function () {
  libraryPlayer.pause();
});
navigator.mediaSession.setActionHandler('seekbackward', function () {});
navigator.mediaSession.setActionHandler('seekforward', function () {});
navigator.mediaSession.setActionHandler('previoustrack', function () {
  if (musicPlaying.id) {
    backwardSong();
  }
});
navigator.mediaSession.setActionHandler('nexttrack', function () {
  if (musicPlaying.id) {
    forwardSong();
  }
});
window.setInterval(() => {
  if (libraryPlayerElement.duration - libraryPlayerElement.currentTime < 0.7) {
    playerDidEnd();
  }
}, 999); // openSpecialServer('music'); // Remove this.

function musicTab(tab) {
  if (currentChannel == tab || tab == 'search') {
    clearMusicViews(tab);
  }

  currentChannel = tab; // Use current channel for this as well.

  activeMusicTab = tab;

  try {
    playlistListener();
  } catch (e) {}

  ;
  $('#musicTab_socialContent').removeClass('hidden'); // Quick tabs function here

  $('.sidebarButtonActive').removeClass('sidebarButtonActive');
  $(`#musicTabButton_${tab}`).addClass('sidebarButtonActive');
  $('.musicTab').addClass('hidden');
  $(`#musicTab_${tab}`).removeClass('hidden');

  if (tab == 'search') {
    $('#searchMusic').focus();
  } // Clear music views within the tab.


  if (!openedTabs.includes(tab)) {
    openedTabs.push(tab); // Load for first time/

    switch (tab) {
      case 'explore':
        loadMusicExplore();
        break;

      case 'friends':
        (0, _display.disableButton)($(`#refreshFriendsButton`));
        $(`#activeFriendsPlaylistsContainer`).empty();
        loadMusicSocial();
        window.setTimeout(() => {
          (0, _display.enableButton)($('#refreshFriendsButton'), '<i class="bx bx-refresh"></i>');
        }, 2999);
        break;

      default:
        break;
    }
  }
}

window.makeMusicRequest = q => {
  return new Promise(async (resolve, reject) => {
    const fetched = await fetch(`https://api.music.apple.com/v1/catalog/us/${q}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijg3NVZKQUo3MjYifQ.eyJpYXQiOjE2NDQzNzQxNTksImV4cCI6MTY1OTkyNjE1OSwiaXNzIjoiQUozOUtTNzhDUyJ9.e6w97MtTOm5aWfvz0L7AGuozbCJ6TJntTXdRTmbsby900_WCFZzyL1-Utmhv_A2kiwhL_XXAay_RAheDmk7lGA`
      }
    });
    resolve(await fetched.json());
  });
};

function loadMusic() {
  // Ran everytime tab is open.
  window.setTimeout(() => {
    const trackTitleWidth = $(`#currentTrackTitle`).width();
    const trackAuthorWidth = $(`#currentTrackAuthor`).width();
    let targetContainerWidth = trackTitleWidth;

    if (trackAuthorWidth > trackTitleWidth) {
      targetContainerWidth = trackAuthorWidth;
    }

    if (targetContainerWidth < 5) {
      // Error
      return;
    }

    $(`#currentTrackDetailsContainer`).css('width', `${targetContainerWidth}px`);
  }, 499);

  if (typeof user == 'undefined') {
    const musicInterval = window.setInterval(() => {
      if (typeof user !== 'undefined' && !musicLoaded) {
        musicLoaded = true;
        confirmLoadMusic();
        window.clearInterval(musicInterval);
      }
    }, 200);
  } else {
    if (!musicLoaded) {
      musicLoaded = true;
      confirmLoadMusic();
    }
  }
}

function confirmLoadMusic() {
  $('#musicSidebar').removeClass('hidden');
  window.setTimeout(() => {
    $('#musicSidebar').removeClass('animated');
  }, 950); // Open music tab for first time. Show explore tab?

  musicTab('explore'); // Setup the listeners. Need this to happen quickly so that we know which songs are favorited or not.

  (0, _library.artistLibraryListener)();
  (0, _library.albumLibraryListener)();
  (0, _library.trackLibraryListener)();
}

async function loadMusicExplore() {
  // Get charts
  const charts = await makeMusicRequest('charts?types=albums,songs');
  const albums = charts.results.albums[0].data;
  const songs = charts.results.songs[0].data;

  for (let i = 0; i < albums.length; i++) {
    const album = albums[i];
    (0, _componentse.createAlbum)(album, `exploreAlbums`);
  }

  for (let i = 0; i < songs.length; i++) {
    const track = songs[i];
    (0, _componentse.createTrack)(track, `exploreTracks`, i);
  } // Get genres


  const genres = (await makeMusicRequest('genres')).data;

  for (let i = 0; i < genres.length; i++) {
    const genre = genres[i];
    (0, _componentse.createGenre)(genre, `exploreGenres`);
  }

  $('#exploreContent').removeClass('hidden');
}

async function reloadSocialTab() {
  (0, _display.disableButton)($(`#refreshFriendsButton`));
  $(`#activeFriendsPlaylistsContainer`).empty();
  friendsPlaylistPaginationIndex = null;
  loadMusicSocial(true);
  window.setTimeout(() => {
    (0, _display.enableButton)($('#refreshFriendsButton'), '<i class="bx bx-refresh"></i>');
  }, 9999);
}

async function loadMusicSocial(skipTop) {
  // Get list of friends who are currently listening to music!
  if (!skipTop) {
    for (let i = 0; i < cacheUser.friends.length; i++) {
      const friend = cacheUser.friends[i];
      buildMusicSocialCard(friend);
    }
  }

  const friendDocs = await (0, _firestore.getDocs)((0, _firestore.query)((0, _firestore.collection)(db, `users`), (0, _firestore.where)("friends", "array-contains", {
    n: cacheUser.username,
    u: user.uid
  }), (0, _firestore.where)('playlistCount', '>', 0), (0, _firestore.orderBy)('playlistCount', 'desc'), (0, _firestore.limit)(6)));
  friendsPlaylistPaginationIndex = friendDocs.docs[friendDocs.docs.length - 1];

  if (!friendDocs.docs) {
    $('#activeFriendsPlaylistsNotice').removeClass('hidden');
  } else if (friendDocs.docs.length < 6) {
    // Didnt get the full 6.
    console.log('NO friends with playlists left');
    $(`#loadMoreButton`).removeClass('zoomIn');
    $(`#loadMoreButton`).addClass('zoomOut');
    window.setTimeout(() => {
      $(`#loadMoreButton`).addClass('hidden');
    }, 1000);
  } else {
    // There is more left.
    $(`#loadMoreButton`).removeClass('zoomOut');
    $(`#loadMoreButton`).addClass('zoomIn');
    $(`#loadMoreButton`).removeClass('hidden');
  }

  for (let i = 0; i < friendDocs.docs.length; i++) {
    console.log('Building friend: ' + friendDocs.docs[i].data().username);
    const doc = friendDocs.docs[i];
    buildFriendsPlaylistGridWithDoc(doc);
  }

  $(`#loadMoreButton`).get(0).onclick = () => {
    (0, _display.disableButton)($(`#loadMoreButton`));
    loadMoreFriendsPlaylists();
  };
}

async function buildMusicSocialCard(friend) {
  if ($(`#${friend.u}MusicListeningCard`).length) {
    // Already exists.
    return;
  }

  const a = document.createElement('div');
  a.id = `${friend.u}MusicListeningCard`;
  a.innerHTML = `
    <img id="${friend.u}musiclisteningimageitem" class="profileImage" src="${await (0, _display.returnProperURL)(friend.u)}" />
    <img id="${friend.u}musiclisteningalbumitem" class="albumImage" id="${friend.u}MusicListeningCardAlbum" src="" />
    <p onclick="openUserCard('${friend.u}')">${friend.n.capitalize()}</p>
  `;
  a.setAttribute('class', 'musicSocialItem animated fadeIn hidden');
  $(`#activeFriendsContainer`).get(0).appendChild(a);
  tippy($(`#${friend.u}musiclisteningalbumitem`).get(0), {
    content: '',
    placement: 'top'
  });
  (0, _display.displayImageAnimation)(`${friend.u}musiclisteningimageitem`);
  (0, _display.displayImageAnimation)(`${friend.u}musiclisteningalbumitem`);
  (0, _presence.updatePresenceForUser)(friend.u);
}

async function loadMoreFriendsPlaylists() {
  const friendDocs = await (0, _firestore.getDocs)((0, _firestore.query)((0, _firestore.collection)(db, `users`), (0, _firestore.where)("friends", "array-contains", {
    n: cacheUser.username,
    u: user.uid
  }), (0, _firestore.where)('playlistCount', '>', 0), (0, _firestore.limit)(6), (0, _firestore.orderBy)('playlistCount', 'desc'), (0, _firestore.startAfter)(friendsPlaylistPaginationIndex)));
  friendsPlaylistPaginationIndex = friendDocs.docs[friendDocs.docs.length - 1];

  if (friendDocs.docs.length < 6) {
    // Didnt get the full 6.
    $(`#loadMoreButton`).removeClass('zoomIn');
    $(`#loadMoreButton`).addClass('zoomOut');
    window.setTimeout(() => {
      $(`#loadMoreButton`).addClass('hidden');
    }, 1000);
  }

  for (let i = 0; i < friendDocs.docs.length; i++) {
    const doc = friendDocs.docs[i];
    await buildFriendsPlaylistGridWithDoc(doc);
  }

  window.setTimeout(() => {
    (0, _display.enableButton)($(`#loadMoreButton`), 'Load More');
  }, 3999);
}

function buildFriendsPlaylistGridWithDoc(doc) {
  return new Promise(async (resolve, reject) => {
    // Create user container
    const hiddenPlaylists = doc.data().hiddenPlaylists || [];
    const a = document.createElement('div');
    a.id = doc.id + 'userContainerItem';
    a.setAttribute('class', 'friendPlaylistUserContainer');
    a.setAttribute('style', "");
    a.innerHTML = `
      <div id="friendPlaylistHeader${doc.id}" class="friendPlaylistHeader userContextItem" username=${doc.data().username} userID="${doc.id}">
        <div>
          <img class="invisible" id="${doc.id}friendplaylistlistpfp"/>
          <span class="${(0, _stripe.checkValidSubscription)(doc.data().subscription) ? "infiniteTextSpan" : ""}">${doc.data().username.capitalize()}</span>
        </div>
        <div>
          <div class="numPlaylistsFriendList animated fadeIn">${doc.data().playlists.length - hiddenPlaylists.length}</div>
          <i id="friendPlaylistUserChevron${doc.id}" class="bx bx-chevron-down"></i>
        </div>
      </div>
      <div class="friendPlaylistContent hidden" id="friendPlaylistContent${doc.id}" style="">
        <div id="friendFolders${doc.id}"></div>
      </div>
    `;
    $(`#activeFriendsPlaylistsContainer`).get(0).appendChild(a);
    $(`#${doc.id}friendplaylistlistpfp`).get(0).src = await (0, _display.returnProperURL)(doc.id);
    (0, _display.displayImageAnimation)(`${doc.id}friendplaylistlistpfp`);

    $(`#friendPlaylistHeader${doc.id}`).get(0).onclick = () => showPlaylistsAndFolders(doc.id); // Put playlists in.


    const ownerUID = doc.id;

    for (let i = 0; i < doc.data().playlists.length; i++) {
      const playlist = doc.data().playlists[i].split('.');
      let playlistUID = doc.data().uid;
      let playlistID = playlist[0];
      let playlistName = playlist[1];

      if (playlist.length == 3) {
        playlistUID = playlist[0];
        playlistID = playlist[1];
        playlistName = playlist[2];
      }

      if (hiddenPlaylists.includes(playlistID)) {
        continue;
      }

      const coverURL = `https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/playlists%2F${playlistUID}%2F${playlistID}%2Ficon.png?alt=media`;
      const a = document.createElement('div');
      a.setAttribute('class', 'playlist friendPlaylist');
      a.id = ownerUID + playlistUID + playlistID + 'friendPlaylistButton';
      a.innerHTML = `
        <div id="${ownerUID}${playlistID}friendPlaylistCoverContainer${playlistUID}" class="friendPlaylistCover"><img id="${ownerUID}${playlistID}friendPlaylistCover${playlistUID}" src="${coverURL}" /></div>
        <p id="${ownerUID}${playlistID}friendPlaylistCoverContainerText${playlistUID}" >${playlistName}</p>
      `;
      $(`#friendPlaylistContent${ownerUID}`).get(0).appendChild(a);

      $(`#${ownerUID}${playlistID}friendPlaylistCoverContainer${playlistUID}`).get(0).onclick = () => {
        openOtherPlaylist(playlistUID, playlistID, playlistName, false);
      };

      twemoji.parse($(`#${ownerUID}${playlistID}friendPlaylistCoverContainerText${playlistUID}`).get(0));

      $(`#${ownerUID}${playlistID}friendPlaylistCoverContainerText${playlistUID}`).get(0).onclick = () => {
        openOtherPlaylist(playlistUID, playlistID, playlistName, false);
      };

      $(`#${ownerUID}${playlistID}friendPlaylistCover${playlistUID}`).get(0).onerror = () => {
        $(`#${ownerUID}${playlistID}friendPlaylistCoverContainer${playlistUID}`).html(`<i class="missingIconIcon bx bxs-playlist"></i>`);
      };
    }

    const folders = doc.data().playlistFolders;

    if (folders) {
      const keys = Object.keys(folders);

      for (let i = 0; i < keys.length; i++) {
        const folderName = keys[i].split('<')[0];
        const folderID = doc.id + keys[i].split('<')[1];
        const playlistIDs = folders[`${folderName}<${keys[i].split('<')[1]}`];
        const a = document.createElement('div');
        a.classList.add('friendFolderContainer');
        a.id = `${folderID}Container`;
        a.innerHTML = `
          <button id="${folderID}Button" folderID="${folderID}" folderName="${folderName}" class="friendPlaylistFolder"><i id="folder${folderID}" class="bx bx-folder"></i> <span class="sidebarText">${folderName}</span><i id="chevron${folderID}" class="bx bx-chevron-down chevronIndicator"></i></button>
          <div id="playlistFolderContent${folderID}" class="friendPlaylistFolderContent hidden" style=""></div>
        `;
        $(`#friendFolders${doc.id}`).get(0).appendChild(a);
        twemoji.parse($(`#${folderID}Button`).get(0));

        $(`#${folderID}Button`).get(0).onclick = () => expandFriendPlaylistFolder(folderID, doc.id); // Add all the playlists into the folder.


        for (let i = 0; i < playlistIDs.length; i++) {
          let playlistUID = ownerUID;
          let playlistID = playlistIDs[i].split('.')[0];
          let playlistName = playlistIDs[i].split('.')[1];

          if (playlistIDs[i].split('.').length == 2) {
            playlistUID = playlistIDs[i].split('.')[0];
            playlistID = playlistIDs[i].split('.')[1];
            playlistName = playlistIDs[i].split('.')[2];
          }

          if (hiddenPlaylists.includes(playlistID)) {
            continue;
          }

          $(`#${ownerUID}${playlistID}friendPlaylistCoverContainer${playlistUID}`).get(0).onclick = () => {
            openOtherPlaylist(playlistUID, playlistID, playlistName, false, keys[i]);
          };

          $(`#${ownerUID}${playlistID}friendPlaylistCoverContainerText${playlistUID}`).get(0).onclick = () => {
            openOtherPlaylist(playlistUID, playlistID, playlistName, false, keys[i]);
          };

          $(`#${ownerUID}${playlistUID}${playlistID}friendPlaylistButton`).appendTo(`#playlistFolderContent${folderID}`);
        }

        if (!$(`#playlistFolderContent${folderID}`).children()) {
          $(`#${ownerUID}${folderID}Container`).remove();
        }
      } // Sort the folders.


      const foldersSortMapping = doc.data().playlistFoldersSort;

      if (foldersSortMapping) {
        for (let i = 0; i < foldersSortMapping.length; i++) {
          const folderID = doc.id + foldersSortMapping[i];
          $(`#${folderID}Container`).attr('data-order', i);
        }

        let sorted = $(`#friendFolders${doc.id}`).children('.friendFolderContainer').sort((a, b) => {
          return parseInt($(a).attr('data-order')) - parseInt($(b).attr('data-order'));
        });
        $(`#friendFolders${doc.id}`).append(sorted);
      }
    }

    function expandFriendPlaylistFolder(folderID, userID) {
      const hidden = $(`#playlistFolderContent${folderID}`).get(0).getAttribute('style') == '';

      if (hidden) {
        window.clearTimeout(musicSocialExpandTimeout);
        $(`#playlistFolderContent${folderID}`).removeClass("hidden");
        $(`#playlistFolderContent${folderID}`).removeClass("zeroHeight");
        const naturalHeight = $(`#playlistFolderContent${folderID}`).height();
        const oldHeight = $(`#${userID}userContainerItem`).get(0).getAttribute('style');
        $(`#${userID}userContainerItem`).get(0).removeAttribute('style');
        $(`#${userID}userContainerItem`).removeClass('zeroHeightFriendExpand');
        const containerNaturalHeight = $(`#${userID}userContainerItem`).height();
        $(`#${userID}userContainerItem`).get(0).setAttribute('style', oldHeight);
        $(`#${userID}userContainerItem`).addClass('zeroHeightFriendExpand');
        window.setTimeout(() => {
          $(`#${userID}userContainerItem`).css('height', `${containerNaturalHeight + 10}px`); // +10 for padding.
        }, 9); // Window

        $(`#${folderID}Button`).addClass("friendFolderExpandedButton");
        $(`#playlistFolderContent${folderID}`).addClass("friendFolderExpandedContent");
        $(`#playlistFolderContent${folderID}`).addClass("zeroHeight");
        $(`#playlistFolderContent${folderID}`).css(`height`, `${naturalHeight}px`);
        $(`#chevron${folderID}`).removeClass('bx-chevron-down');
        $(`#chevron${folderID}`).addClass('bx-chevron-up');
        $(`#folder${folderID}`).addClass('folderFolderIconActive');
        $(`#folder${folderID}`).removeClass('bx-folder');
        $(`#folder${folderID}`).addClass('bx-folder-open');
      } else {
        $(`#playlistFolderContent${folderID}`).get(0).setAttribute('style', '');
        $(`#chevron${folderID}`).addClass('bx-chevron-down');
        $(`#chevron${folderID}`).removeClass('bx-chevron-up');
        $(`#folder${folderID}`).removeClass('folderFolderIconActive');
        $(`#folder${folderID}`).addClass('bx-folder');
        $(`#folder${folderID}`).removeClass('bx-folder-open');
        musicSocialExpandTimeout = window.setTimeout(() => {
          // Window
          $(`#${folderID}Button`).removeClass("friendFolderExpandedButton");
          $(`#playlistFolderContent${folderID}`).removeClass("friendFolderExpandedContent");
          const oldHeight = $(`#${userID}userContainerItem`).get(0).getAttribute('style');
          $(`#${userID}userContainerItem`).css('height', ``);
          $(`#${userID}userContainerItem`).removeClass('zeroHeightFriendExpand');
          const containerNaturalHeight = $(`#${userID}userContainerItem`).height();
          $(`#${userID}userContainerItem`).get(0).setAttribute('style', oldHeight);
          $(`#${userID}userContainerItem`).addClass('zeroHeightFriendExpand');
          window.setTimeout(() => {
            $(`#${userID}userContainerItem`).css('height', `${containerNaturalHeight}px`);
          }, 9);
        }, 249);
      }
    }

    function showPlaylistsAndFolders() {
      const hidden = $(`#${doc.id}userContainerItem`).get(0).getAttribute('style') == '';

      if (hidden) {
        window.clearTimeout(musicSocialExpandTimeout);
        $(`#${doc.id}userContainerItem`).removeClass('zeroHeightFriendExpand');
        $(`#friendPlaylistContent${doc.id}`).removeClass('hidden');
        const naturalHeight = $(`#${doc.id}userContainerItem`).height();
        $(`#${doc.id}userContainerItem`).addClass('zeroHeightFriendExpand');
        $(`#${doc.id}userContainerItem`).css('height', `${naturalHeight}px`);
        $(`#friendPlaylistContent${doc.id}`).addClass('friendPlaylistContentActive');
        $(`#friendPlaylistHeader${doc.id}`).addClass('friendPlaylistHeaderActive');
        $(`#friendPlaylistUserChevron${doc.id}`).removeClass('bx-chevron-down');
        $(`#friendPlaylistUserChevron${doc.id}`).addClass('bx-chevron-up');
      } else {
        $(`#${doc.id}userContainerItem`).get(0).setAttribute('style', '');
        $(`#friendPlaylistContent${doc.id}`).removeClass('friendPlaylistContentActive');
        $(`#friendPlaylistHeader${doc.id}`).removeClass('friendPlaylistHeaderActive');
        $(`#friendPlaylistUserChevron${doc.id}`).addClass('bx-chevron-down');
        $(`#friendPlaylistUserChevron${doc.id}`).removeClass('bx-chevron-up');
      }
    }

    resolve(true);
  });
}

function openNewPlaylistFolderDialog(playlistUID, playlistID) {
  (0, _display.openModal)('newPlaylistFolder');
  $('#newPlaylistFolderName').val('');
  $('#newPlaylistFolderName').get(0).addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      $('#newPlaylistFolderCreateButton').get(0).click();
    }
  });

  $('#newPlaylistFolderCreateButton').get(0).onclick = () => {
    (0, _library.createPlaylistFolder)(playlistUID, playlistID);
  };
}

function openNewPlaylistDialog(addTrackIDToPlaylist, addAlbumIDToPlaylist) {
  (0, _display.openModal)('newPlaylist');
  $('#newPlaylistName').val('');
  $('#newPlaylistName').get(0).addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      $('#newPlaylistCreateButton').get(0).click();
    }
  });

  $('#newPlaylistCreateButton').get(0).onclick = () => {
    (0, _library.createPlaylist)();
  };

  if (addTrackIDToPlaylist || addAlbumIDToPlaylist) {
    // If we are adding a track or album to a playlist
    $('#newPlaylistCreateButton').get(0).onclick = () => {
      (0, _library.createPlaylist)(addTrackIDToPlaylist, false, false, addAlbumIDToPlaylist);
    };
  }
}

async function searchMusicButton() {
  let secondSearch = false;
  const searchQuery = $('#searchMusic').val();
  $('#searchMusic').val('');

  if (!searchQuery || searchQuery == '' || searchQuery == ' ') {
    disableSearchView();
    return;
  }

  window.setTimeout(() => {
    addToRecentSearches(searchQuery);
  }, 899);

  if ($('#musicSearchBox').hasClass('musicSearchBoxActive')) {
    $('#musicSearchResultsGhost').removeClass('hidden');
    $('#musicSearchResults').addClass('hidden');
    secondSearch = true;
  }

  $('#noResults').addClass('hidden');
  enableSearchView();
  $('#searchSuggestions').empty();
  const search = await makeMusicRequest(`search?term=${encodeURIComponent(searchQuery)}&types=albums,artists,songs,playlists&limit=12`);
  console.log(search);
  $(`#parallelSearchResultsTracks`).empty();
  $('#musicSearchResultsTracks').empty();
  $('#musicSearchResultsArtists').empty();
  $('#musicSearchResultsAlbums').empty();
  $(`#topSearchResultsTracks`).empty();
  $(`#topResultSearchDivider`).addClass('hidden');
  $('#topResultContainer').empty();
  window.search = search;
  $('#albumsSearchDivider').addClass('hidden');

  if (typeof search.results !== 'undefined' && typeof search.results.albums !== 'undefined' && typeof search.results.albums.data !== 'undefined') {
    $('#albumsSearchDivider').removeClass('hidden');

    for (let i = 0; i < search.results.albums.data.length; i++) {
      const album = search.results.albums.data[i];
      (0, _componentse.createAlbum)(album, `musicSearchResultsAlbums`);
    }
  }

  $('#artistsSearchDivider').addClass('hidden');

  if (typeof search.results !== 'undefined' && typeof search.results.artists !== 'undefined' && typeof search.results.artists.data !== 'undefined') {
    $('#artistsSearchDivider').removeClass('hidden');

    for (let i = 0; i < search.results.artists.data.length; i++) {
      const artist = search.results.artists.data[i];
      (0, _componentse.createArtist)(artist, `musicSearchResultsArtists`);
    }
  }

  $('#tracksSearchDivider').addClass('hidden');

  if (typeof search.results !== 'undefined' && typeof search.results.songs !== 'undefined' && typeof search.results.songs.data !== 'undefined') {
    $('#tracksSearchDivider').removeClass('hidden');

    for (let i = 0; i < search.results.songs.data.length; i++) {
      const track = search.results.songs.data[i];
      (0, _componentse.createTrack)(track, `musicSearchResultsTracks`, i);
    }
  }

  $('#playlistsSearchDivider').addClass('hidden');

  if (typeof search.results !== 'undefined' && typeof search.results.playlists !== 'undefined' && typeof search.results.playlists.data !== 'undefined') {
    $('#playlistsSearchDivider').removeClass('hidden');

    for (let i = 0; i < search.results.playlists.data.length; i++) {
      const playlist = search.results.playlists.data[i];
      (0, _componentse.createApplePlaylist)(playlist, `musicSearchResultsPlaylists`);
    }
  }

  if (!Object.keys(search.results).length) {
    $('#noResults').removeClass('hidden');
  }

  if (parseInt(searchQuery)) {
    try {
      const track = (await makeMusicRequest(`songs/${searchQuery}`)).data[0];
      $('#noResults').addClass('hidden');

      if (track.attributes.name) {
        (0, _componentse.createTrack)(track, `topSearchResultsTracks`, 0);
        $(`#topResultSearchDivider`).removeClass('hidden');
      }
    } catch (error) {
      console.log(error);
    }
  }

  if (secondSearch) {
    $('#musicSearchResultsGhost').addClass('hidden');
    $('#musicSearchResults').removeClass('hidden');
  } // Search Parallel library..


  $('#parallelSearchDivider').addClass('hidden'); // const searchParallelLibrary = httpsCallable(functions, 'searchParallelLibrary');
  // const result = await searchParallelLibrary({query: searchQuery});
  // if (result.data.data.length) {
  //   $('#parallelSearchDivider').removeClass('hidden');
  //   $('#noResults').addClass('hidden');
  // }
  // for (let i = 0; i < result.data.data.length; i++) {
  //   const track = result.data.data[i];
  //   createTrack(track, `#parallelSearchResultsTracks`, i)
  // }
}

function enableSearchView() {
  if (!$('#musicSearchBox').hasClass('musicSearchBoxActive')) {
    $('#musicSearchBox').addClass('musicSearchBoxActive');
    $('#searchMusicTitle').removeClass('fadeIn');
    $('#searchMusicTitle').addClass('fadeOut');
    $(`#recentSearches2`).removeClass('fadeIn');
    $(`#recentSearches2`).addClass('fadeOut');
    window.setTimeout(() => {
      $('#searchSuggestions').empty();
      $('#musicSearchResults').removeClass('fadeOut');
      $('#musicSearchResults').addClass('fadeIn');
      $('#musicSearchResults').removeClass('hidden');
      $('#searchMusicTitle').addClass('hidden');
      $(`#recentSearches2`).addClass('hidden');
    }, 1001);
  }
}

function disableSearchView() {
  $('#musicSearchResults').addClass('fadeOut');
  $('#musicSearchResults').removeClass('fadeIn');
  window.setTimeout(() => {
    $('#searchSuggestions').empty();
    $('#musicSearchResults').addClass('hidden');
    $('#musicSearchBox').removeClass('musicSearchBoxActive');
    $('#searchMusicTitle').removeClass('hidden');
    $('#searchMusicTitle').addClass('fadeIn');
    $('#searchMusicTitle').removeClass('fadeOut');
    $('#recentSearches2').removeClass('hidden');
    $('#recentSearches2').addClass('fadeIn');
    $('#recentSearches2').removeClass('fadeOut');
  }, 445);
}

window.openArtist = async artistID => {
  if (currentServer !== 'music') {
    (0, _servers.openSpecialServer)('music');
  }

  editorModePlaylist ? exitEditorModePlaylist(editorModePlaylist) : null;

  if ($(`#ArtistView${artistID}`).length) {
    $(`#ArtistView${artistID}`).removeClass('hidden');
    $(`#ArtistView${artistID}`).appendTo(`#musicTab_${activeMusicTab}`);
    return;
  }

  const a = document.createElement('div');
  a.innerHTML = `
    <div class="musicViewHeader animated fadeInDown faster">
      <p>Artist</p>
      <button id="Artist${artistID}Close" onclick="closeMusicView('Artist', '${artistID}')" class="btn b-3 roundedButton closeButton"><i class="bx bx-x"></i></button>
    </div>
    <div class="musicViewContentContainer">
      <div class="heroImageContainer">
        <img class="heroImage invisible" id="Artist${artistID}Image"/>
      </div>
      <div class="artistTitle" id="Artist${artistID}Title"></div>
      <p class="artistDescription" id="Artist${artistID}Description"></p>
      <div class="artistGenres" id="Artist${artistID}Genres"></div>
      <button id="Artist${artistID}DiscographyButton" class="btn b-1 artistViewButton">Open Discography <i class='bx bx-right-arrow-alt'></i></button>
      <div class="musicViewContentDirectContainer">
        <div id="Artist${artistID}Home" class="musicViewContent">
          <h3 id="Artist${artistID}AlbumsTitle" class="artistSectionTitle">Albums</h3>
          <div class="artistAlbumsSection">
            <div class="artistLatestRelease" id="Artist${artistID}Latest"></div>
            <div class="artistOtherReleases" id="Artist${artistID}Albums"></div>
          </div>
          <h3 id="Artist${artistID}SinglesTitle" class="artistSectionTitle">Singles</h3>
          <div class="artistSingles" id="Artist${artistID}Singles"></div>
          
          <h3 class="artistSectionTitle">Top Tracks</h3>
          <div class="artistTracks" id="Artist${artistID}Tracks"></div>

          <div id="Artist${artistID}AppearancesContainer" class="hidden">
            <h3 class="artistSectionTitle">Appears on</h3>
            <div class="artistAppears" id="Artist${artistID}Appearances"></div>
          </div>

          <h3 class="artistSectionTitle">Similar Artists</h3>
          <div class="artistArtists" id="Artist${artistID}Artists"></div>
        </div>
        <div id="Artist${artistID}Discography" class="musicViewContent hidden">
          <h3 class="artistSectionTitle">Discography</h3>
          <center>
            <div class="artistDiscographyAlbums" id="Artist${artistID}DiscographyAlbums"></div>
          </center>
        </div>
      </div>
    </div>
  `;
  a.setAttribute('class', 'musicView artistView ');
  a.id = `ArtistView${artistID}`;
  $('#musicTab_' + activeMusicTab).get(0).appendChild(a);

  $(`#Artist${artistID}DiscographyButton`).get(0).onclick = () => {
    openArtistDiscography(artistID);
  };

  let artist, artistData;
  let likeSnippet = '';

  if (cacheLibraryArtists.includes(artistID)) {
    likeSnippet = `<div class="mainFavButton"><button onclick="removeFromLibrary('artists', '${artistID}')" class="btn b-1 iconButton favButton likedButtonartists${artistID}"> <i class="bx bxs-heart"></i> </button></div>`;
  } else {
    likeSnippet = `<div class="mainFavButton"><button onclick="addToLibrary('artists', '${artistID}')" class="btn b-1 iconButton favButton likedButtonartists${artistID}"> <i class="bx bx-heart"></i> </button></div>`;
  }

  artist = await makeMusicRequest(`artists/${artistID}`);
  artistData = artist.data[0];
  $(`#Artist${artistID}Title`).html(`
    <h2 title="${artistData.attributes.name}">${artistData.attributes.name}</h2>
    ${likeSnippet}
  `);
  tippy($(`#Artist${artistID}Close`).get(0), {
    content: 'Close',
    placement: 'top'
  });

  if (Object.keys(artistData.attributes).includes('editorialNotes') && artistData.attributes.editorialNotes.short) {
    $(`#Artist${artistID}Description`).html(artistData.attributes.editorialNotes.short);
  }

  for (let i = 0; i < artistData.attributes.genreNames.length; i++) {
    const genre = artistData.attributes.genreNames[i];
    $(`#Artist${artistID}Genres`).append(`<span class="artistGenre">${genre}</span>`);
  }

  artist = await makeMusicRequest(`artists/${artistID}?views=latest-release,full-albums`);
  artistData = artist.data[0];
  let latestReleaseID = '';
  $(`#Artist${artistID}Latest`).addClass('hidden');

  if (artistData.views['latest-release'].data.length) {
    $(`#Artist${artistID}Latest`).removeClass('hidden');
    const latestRelease = artistData.views['latest-release'].data[0];
    latestReleaseID = latestRelease.id;
    (0, _componentse.createAlbum)(latestRelease, `Artist${artistID}Latest`);
  }

  const fullAlbums = artistData.views['full-albums'].data;

  for (let i = 0; i < fullAlbums.length; i++) {
    if (latestReleaseID === fullAlbums[i].id) {
      continue;
    } // No duplicates


    const album = fullAlbums[i];
    (0, _componentse.createAlbum)(album, `Artist${artistID}Albums`);
  }

  artist = await makeMusicRequest(`artists/${artistID}?views=singles`);
  artistData = artist.data[0];
  const singles = artistData.views['singles'].data;

  if (!singles.length) {
    $(`#Artist${artistID}SinglesTitle`).addClass('hidden');
  }

  for (let i = 0; i < singles.length; i++) {
    if (latestReleaseID === singles[i].id) {
      continue;
    } // No duplicates


    const album = singles[i];
    (0, _componentse.createAlbum)(album, `Artist${artistID}Singles`);
  }

  artist = await makeMusicRequest(`artists/${artistID}?views=top-songs`);
  artistData = artist.data[0];
  const top = artistData.views['top-songs'].data;

  for (let i = 0; i < top.length; i++) {
    const track = top[i];
    (0, _componentse.createTrack)(track, `Artist${artistID}Tracks`, i, null);
  }

  artist = await makeMusicRequest(`artists/${artistID}?views=similar-artists,appears-on-albums&include=albums`);
  artistData = artist.data[0];
  const similar = artistData.views['similar-artists'].data;

  for (let i = 0; i < similar.length; i++) {
    const artist = similar[i];
    (0, _componentse.createArtist)(artist, `Artist${artistID}Artists`);
  }

  const appears = artistData.views['appears-on-albums'].data;

  if (appears.length) {
    $(`#Artist${artistID}AppearancesContainer`).removeClass('hidden');

    for (let i = 0; i < appears.length; i++) {
      const album = appears[i];
      (0, _componentse.createAlbum)(album, `Artist${artistID}Appearances`);
    }
  } // Discography  


  const albums = artistData.relationships.albums.data;

  for (let i = 0; i < albums.length; i++) {
    const album = albums[i];
    (0, _componentse.createAlbum)(album, `Artist${artistID}DiscographyAlbums`);
  }

  const getArtistProfilePhoto = (0, _functions.httpsCallable)(functions, 'getArtistProfilePhoto');
  const artistURL = (await getArtistProfilePhoto({
    artistID: artistID
  })).data.data.replace('cw.png', 'cc.webp').replace('{w}', 1024).replace('{h}', 1024);
  $(`#Artist${artistID}Image`).attr('src', artistURL);
  (0, _display.displayImageAnimation)(`Artist${artistID}Image`);
};

async function openArtistDiscography(artistID) {
  $(`#Artist${artistID}DiscographyButton`).html(`Close Discography <i class='bx bx-left-arrow-alt'></i>`);
  $(`#Artist${artistID}Home`).addClass('animated');
  $(`#Artist${artistID}Home`).addClass('fadeOutLeft');
  $(`#Artist${artistID}Home`).removeClass('fadeInLeft');
  $(`#Artist${artistID}Discography`).addClass('animated');
  $(`#Artist${artistID}Discography`).removeClass('fadeOutRight');
  $(`#Artist${artistID}Discography`).removeClass('hidden');
  $(`#Artist${artistID}Discography`).addClass('fadeInRight');
  $(`#Artist${artistID}DiscographyButton`).addClass('disabled');
  await (0, _display.timer)(999);
  $(`#Artist${artistID}DiscographyButton`).removeClass('disabled');
  $(`#Artist${artistID}Home`).addClass('hidden');
  $(`#Artist${artistID}Home`).removeClass('animated');
  $(`#Artist${artistID}Discography`).removeClass('animated');

  $(`#Artist${artistID}DiscographyButton`).get(0).onclick = () => {
    closeArtistDiscography(artistID);
  };
}

async function closeArtistDiscography(artistID) {
  $(`#Artist${artistID}DiscographyButton`).html(`Open Discography <i class='bx bx-right-arrow-alt'></i>`);
  $(`#Artist${artistID}Home`).addClass('animated');
  $(`#Artist${artistID}Home`).removeClass('fadeOutLeft');
  $(`#Artist${artistID}Home`).addClass('fadeInLeft');
  $(`#Artist${artistID}Home`).removeClass('hidden');
  $(`#Artist${artistID}Discography`).addClass('animated');
  $(`#Artist${artistID}Discography`).addClass('fadeOutRight');
  $(`#Artist${artistID}Discography`).removeClass('fadeInRight');
  $(`#Artist${artistID}DiscographyButton`).addClass('disabled');
  await (0, _display.timer)(999);
  $(`#Artist${artistID}DiscographyButton`).removeClass('disabled');
  $(`#Artist${artistID}Home`).removeClass('animated');
  $(`#Artist${artistID}Discography`).addClass('hidden');
  $(`#Artist${artistID}Discography`).removeClass('animated');

  $(`#Artist${artistID}DiscographyButton`).get(0).onclick = () => {
    openArtistDiscography(artistID);
  };
}

async function openOtherPlaylist(playlistUID, playlistID, playlistNameInput, fromLibrary, folderContext) {
  let playlistName = playlistNameInput;

  if (!playlistNameInput) {
    for (let i = 0; i < cacheUser.playlists.length; i++) {
      const playlistSplit = cacheUser.playlists[i].split('.');
      let playlistIDSearch = playlistSplit[0];
      let playlistNameSearch = playlistSplit[1];

      if (playlistSplit.length == 3) {
        // New playlist format.
        playlistIDSearch = playlistSplit[1];
        playlistNameSearch = playlistSplit[2];
      }

      if (playlistID == playlistIDSearch) {
        playlistName = playlistNameSearch;
      }
    }
  } // Check if this is a playlist that I own!


  if (playlistUID == user.uid) {
    // If the playlist exists
    if (cachePlaylists.includes(`${playlistUID}.${playlistID}.${playlistName}`) || cachePlaylists.includes(`${playlistID}.${playlistName}`)) {
      (0, _library.openPlaylist)(playlistUID, playlistID, playlistName, false, folderContext);
    } else {
      snac('Playlist Deleted', 'The linked playlist no longer exists. You might have deleted it.', 'danger');
    }

    return;
  }

  if (playlistUID == 'apple') {
    openApplePlaylist(playlistID, playlistName, fromLibrary, folderContext);
    return;
  }

  if ($(`#playlistButton${playlistUID}${playlistID}`).hasClass('sidebarButtonActive')) {
    // Already open!
    clearMusicViewsPlaylist();
    return;
  }

  if (fromLibrary) {
    // Expand enclosing folder if it's not already expanded.
    if (!$(`#playlistButton${playlistUID}${playlistID}`).parent().hasClass('playlistFolderContentActive')) {
      $(`#playlistButton${playlistUID}${playlistID}`).parent().parent().children().first().click();
    }
  }

  if (currentServer !== 'music') {
    (0, _servers.openSpecialServer)('music');
  }

  musicTab('playlists');
  $(`.playlistView`).addClass('hidden');
  $(`#playlistButton${playlistUID}${playlistID}`).addClass('sidebarButtonActive');

  if ($(`#PlaylistView${playlistUID}${playlistID}`).length) {
    $(`#PlaylistView${playlistUID}${playlistID}`).removeClass('hidden');
    const allowed = await addOtherPlaylistListeners(playlistUID, playlistID, playlistName, fromLibrary, folderContext);

    if (!allowed) {
      if (fromLibrary) {
        (0, _library.removePlaylistFromLibrary)(playlistUID, playlistID, playlistNameInput, $(`#playlistButton${playlistUID}${playlistID}`).attr('infolder') || false, true, true);
        snac('Playlist Private', `This playlist has recently been made private. It has been removed from your library.`, 'danger');
      } else {
        closeMusicView('Playlist', `${playlistUID}${playlistID}`);
        snac('Playlist Private', 'This playlist is private.', 'danger');
      }
    }

    return;
  }

  const a = document.createElement('div');
  a.id = `PlaylistView${playlistUID}${playlistID}`;
  a.setAttribute('class', 'musicView playlistView');
  a.innerHTML = `
    <div class="musicViewHeader animated fadeInDown faster">
      <p>Playlist (View Only)</p>
      ${fromLibrary ? "" : `<button id="Playlist${playlistUID}${playlistID}Close" onclick="closeMusicView('Playlist', '${playlistUID}${playlistID}')" class="btn b-3 roundedButton closeButton"><i class="bx bx-x"></i></button>`}
    </div>
    <div class="musicViewContentContainer">
      <div class="playlistTopLevel">
        <div id="${playlistUID}${playlistID}playlistViewImage" class="playlistCover animated fadeIn"></div>
        <div class="playlistDetails">
          <h2 id="${playlistUID}${playlistID}playlistTitle" class="playlistTitle animated fadeInUp"></h2>
          <p id="${playlistUID}${playlistID}playlistDetailsLine" class="playlistDetailsLine animated fadeIn"></p>
          ${fromLibrary ? `
            <div class="dropdown">
              <button id="playlistDropdownButton${playlistUID}${playlistID}" onclick="openDropdown('${playlistUID}${playlistID}Dropdown')" class="btn b-4 playlistDropdownButton iconButton dropdownButton"><i class="bx bx-dots-vertical-rounded"></i></button>
              <div id="${playlistUID}${playlistID}Dropdown" class="dropdown-content">
              <a id="deletePlaylistButton${playlistUID}${playlistID}" class="btn btnDanger">Remove from Library</a>
              <a id="clonePlaylistButton${playlistUID}${playlistID}" class="btn btnDanger">Clone Playlist</a>
                <div class="dropdownDivider"></div>
                <a onclick="copyToClipboard('${window.location.origin}/preview?playlistUID=${playlistUID}&playlistID=${playlistID}')" class="btn">Copy Link</a>
                <a onclick="copyToClipboard('${playlistID}')" class="btn">Copy ID</a>
              </div>
            </div>
          ` : `
            <div class="dropdown">
              <button id="playlistDropdownButton${playlistUID}${playlistID}" onclick="openDropdown('${playlistUID}${playlistID}Dropdown')" class="btn b-4 playlistDropdownButton iconButton dropdownButton"><i class="bx bx-dots-vertical-rounded"></i></button>
              <div id="${playlistUID}${playlistID}Dropdown" class="dropdown-content">
                <a id="${playlistUID}${playlistID}AddButton" class="btn">Add to Library</a>
                <a id="${playlistUID}${playlistID}CloneButton" class="btn">Clone Playlist</a>
                <div class="dropdownDivider"></div>
                <a onclick="copyToClipboard('${window.location.origin}/preview?playlistUID=${playlistUID}&playlistID=${playlistID}')" class="btn">Copy Link</a>
                <a onclick="copyToClipboard('${playlistID}')" class="btn">Copy ID</a>
              </div>
            </div>
          `}
          <button id="${playlistUID}${playlistID}PlayTrackButton" class="btn b-1 playButton"><i class='bx bx-play'></i> play</button> 
          <button id="${playlistUID}${playlistID}ShuffleTrackButton"  onclick="playTrack(null, '${playlistUID}${playlistID}playlistViewTracksContainer', 0, true)" class="btn b-1 playButton"><i class='bx bx-shuffle'></i> shuffle</button>     
          <p id="${playlistUID}${playlistID}contentEditable" class="playlistDescription" spellcheck="false" contenteditable="false"></p>
        </div>
      </div>
      <div class="hr"></div>
      <div class="musicViewContent">
        <div class="notice hidden animated fadeIn" id="${playlistUID}${playlistID}noTrackNotice">No tracks added to this playlist.</div>
        <div class="tracksContainer" id="${playlistUID}${playlistID}playlistViewTracksContainer">
          <div class="notice fetchingTracksNotice animated fadeIn hidden" id="${playlistUID}${playlistID}waitingNotice">Fetching tracks...</div>
        </div>
      </div>
      <div></div>
    </div>
  `;
  $(`#musicTab_playlists`).get(0).appendChild(a);
  tippy($(`#Playlist${playlistUID}${playlistID}Close`).get(0), {
    content: 'Close',
    placement: 'top'
  });
  const allowed = await addOtherPlaylistListeners(playlistUID, playlistID, playlistName, fromLibrary, folderContext);

  if (!allowed) {
    if (fromLibrary) {
      (0, _library.removePlaylistFromLibrary)(playlistUID, playlistID, playlistNameInput, $(`#playlistButton${playlistUID}${playlistID}`).attr('infolder') || false, true, true);
      snac('Playlist Private', `This playlist has recently been made private. It has been removed from your library.`, 'danger');
    } else {
      closeMusicView('Playlist', `${playlistUID}${playlistID}`);
      snac('Playlist Private', 'This playlist is private.', 'danger');
    }

    return;
  }
}

function addOtherPlaylistListeners(playlistUID, playlistID, inputPlaylistName, fromLibrary, folderContext) {
  return new Promise(async (resolve, reject) => {
    try {
      await playlistListener();
    } catch (e) {
      resolve(true);
    }

    ;
    playlistListener = (0, _firestore.onSnapshot)((0, _firestore.doc)(db, `users/${playlistUID}/playlists/${playlistID}`), async playlistDoc => {
      if (!playlistDoc.exists() && fromLibrary) {
        (0, _library.removePlaylistFromLibrary)(playlistUID, playlistID, inputPlaylistName, $(`#playlistButton${playlistUID}${playlistID}`).attr('infolder') || false, true, true);
        snac('Playlist Deleted', `This playlist has recently been deleted. It has been removed from your library.`, 'danger');
        return;
      } else if (!playlistDoc.exists() && !fromLibrary) {
        closeMusicView('Playlist', `${playlistUID}${playlistID}`);
        snac('Playlist Deleted', 'This playlist no longer exists.', 'danger');
        return;
      }

      if (!playlistDoc.exists()) {
        // Straight up doesn't exist. Not sure what to do..
        closeMusicView('Playlist', `${playlistUID}${playlistID}`);
        snac('Playlist Deleted', 'This playlist no longer exists.', 'danger');
        return;
      }

      if (!playlistDoc.data().dateModified) {
        // Recieved two updates. One is date upload, one is date confirm.
        return; // Ignore if initial upload event. Only update on final.
      } // Onclicks


      if ($(`#deletePlaylistButton${playlistUID}${playlistID}`).length) {
        $(`#deletePlaylistButton${playlistUID}${playlistID}`).get(0).onclick = () => {
          (0, _library.prepareRemovePlaylistFromLibrary)(playlistUID, playlistID, inputPlaylistName, folderContext);
        };
      }

      if ($(`#clonePlaylistButton${playlistUID}${playlistID}`).length) {
        $(`#clonePlaylistButton${playlistUID}${playlistID}`).get(0).onclick = () => {
          (0, _library.clonePlaylistToLibrary)(playlistUID, playlistID);
        };
      }

      if ($(`#${playlistUID}${playlistID}AddButton`).length) {
        $(`#${playlistUID}${playlistID}AddButton`).get(0).onclick = () => {
          (0, _library.addPlaylistToLibrary)(playlistUID, playlistID);
        };
      }

      if ($(`#${playlistUID}${playlistID}CloneButton`).length) {
        $(`#${playlistUID}${playlistID}CloneButton`).get(0).onclick = () => {
          (0, _library.clonePlaylistToLibrary)(playlistUID, playlistID);
        };
      }

      if (inputPlaylistName !== playlistDoc.data().title && fromLibrary) {
        // The playlist has changed since adding it.
        await (0, _firestore.runTransaction)(db, async transaction => {
          const sfDoc = await transaction.get(doc(db, `users/${user.uid}`));
          let newPlaylistList = [];

          for (let i = 0; i < sfDoc.data().playlists.length; i++) {
            const playlist = sfDoc.data().playlists[i].split('.');
            let playlistUIDSearch = user.uid;
            let playlistIDSearch = playlist[0];
            let playlistNameOld = playlist[1];

            if (playlist.length == 3) {
              playlistUIDSearch = playlist[0];
              playlistIDSearch = playlist[1];
              playlistNameOld = playlist[2];
            }

            if (playlistIDSearch == `${playlistID}` && playlistUIDSearch == playlistUID) {
              newPlaylistList.push(`${playlistUID}.${playlistIDSearch}.${playlistDoc.data().title}`);
            } else {
              newPlaylistList.push(sfDoc.data().playlists[i]);
            }
          }

          transaction.update(doc(db, `users/${user.uid}`), {
            playlists: newPlaylistList
          });
        });
        snac('Playlist Updated', `This playlist has recently been renamed. We've synced the changes for you. `, 'success');
      }

      $(`#${playlistUID}${playlistID}playlistTitle`).html((0, _display.securityConfirmTextIDs)(playlistDoc.data().title, true)); // Playlist title

      twemoji.parse($(`#${playlistUID}${playlistID}playlistTitle`).get(0));
      $(`#${playlistUID}${playlistID}contentEditable`).html((0, _display.securityConfirmText)(playlistDoc.data().description || ""));
      twemoji.parse($(`#${playlistUID}${playlistID}contentEditable`).get(0));
      $(`#${playlistUID}${playlistID}AddButton`).removeClass('hidden');

      if (cachePlaylists.includes(`${playlistUID}.${playlistID}.${inputPlaylistName}`) || cachePlaylists.includes(`${playlistUID}.${playlistID}.${playlistDoc.data().title}`)) {
        $(`#${playlistUID}${playlistID}AddButton`).addClass('hidden');
      }

      if (playlistDataImages[playlistUID + playlistID] !== playlistDoc.data().imageURL) {
        if (playlistDoc.data().imageURL) {
          $(`#${playlistUID}${playlistID}playlistViewImage`).html(`<img class="invisible faster" id="${playlistUID}${playlistID}playlistViewImageElement" src="${playlistDoc.data().imageURL}"/>`);
          (0, _display.displayImageAnimation)(`${playlistUID}${playlistID}playlistViewImageElement`);
        } else {
          $(`#${playlistUID}${playlistID}playlistViewImage`).html(`<i class="missingIconIcon bx bxs-playlist"></i>`);
        }
      }

      $(`#${playlistUID}${playlistID}PlayTrackButton`).get(0).onclick = () => {
        playTrack(null, `${playlistUID}${playlistID}playlistViewTracksContainer`, 0);
      };

      $(`#${playlistUID}${playlistID}ShuffleTrackButton`).get(0).onclick = () => {
        playTrack(null, `${playlistUID}${playlistID}playlistViewTracksContainer`, 0, true);
      };

      playlistDataImages[playlistUID + playlistID] = playlistDoc.data().imageURL;
      const doc = playlistDoc;
      let lengthString = '';

      if (doc.data().totalDuration) {
        const hours = Math.floor(Math.floor(doc.data().totalDuration / 1000) / 3600);
        const minutes = Math.floor(Math.floor(doc.data().totalDuration / 1000) % 3600 / 60);
        const seconds = Math.floor(Math.floor(doc.data().totalDuration / 1000) % 3600 % 60);
        lengthString = `<span class="playlistDetailsSeparator"><i class="bx bxs-circle"></i></span> ${hours}h ${minutes}m ${seconds}s`;
      }

      const modifiedDate = doc.data().dateModified.toDate();
      let cloneText = '';

      if (doc.data().clone) {
        if (doc.data().clonedMultiple) {
          cloneText = `<span onclick="openUserCard('${doc.data().creator.split('.')[0]}')" class="playlistCreator">${doc.data().creator.split('.')[1].capitalize()}</span>, <span onclick="openUserCard('${doc.data().clone.split('.')[0]}')" class="playlistCreator">${doc.data().clone.split('.')[1].capitalize()}</span>, and <span class="playlistCreator noHighlight">several others</span>`;
        } else {
          cloneText = `<span onclick="openUserCard('${doc.data().creator.split('.')[0]}')" class="playlistCreator">${doc.data().creator.split('.')[1].capitalize()}</span> ${doc.data().clone ? `and <span onclick="openUserCard('${doc.data().clone.split('.')[0]}')" class="playlistCreator">${doc.data().clone.split('.')[1].capitalize()}</span>` : ""}`;
        }
      } else {
        cloneText = `<span onclick="openUserCard('${doc.data().creator.split('.')[0]}')" class="playlistCreator">${doc.data().creator.split('.')[1].capitalize()}</span>`;
      }

      let lockText = '';

      if (doc.data().sharing && doc.data().sharing == 'none') {
        lockText = `<span class="playlistDetailsSeparator"><i class="bx bxs-circle"></i></span> <i onclick="openSharing('${playlistUID}', '${playlistID}')" class="bx bx-lock-alt clickableIcon"></i>`;
      }

      $(`#${playlistUID}${playlistID}playlistDetailsLine`).html(`By ${cloneText} <span class="playlistDetailsSeparator"><i class="bx bxs-circle"></i></span> Updated ${timeago.format(modifiedDate)} <span class="playlistDetailsSeparator"><i class="bx bxs-circle"></i></span> ${doc.data().tracks ? doc.data().tracks.length : 0} Track${doc.data().tracks && doc.data().tracks.length !== 1 ? "" : "s"} ${lengthString}${lockText}`); // Tracks Rendering (Feb 9, 2022): 250 batches, paginatated.

      const tracks = doc.data().tracks || [];
      const arrayPlaylistForward = (0, _display.playlistArrayDifference)(cachePlaylistData[playlistUID + playlistID] || [], tracks);
      const arrayPlaylistBackward = (0, _display.playlistArrayDifference)(tracks, cachePlaylistData[playlistUID + playlistID] || []);

      if (arrayPlaylistForward.length) {
        $(`#${playlistUID}${playlistID}waitingNotice`).removeClass('hidden');
      } else {
        $(`#${playlistUID}${playlistID}waitingNotice`).addClass('hidden');
      }

      cachePlaylistData[playlistUID + playlistID] = doc.data().tracks;
      playlistMetaData[playlistUID + playlistID] = doc.data();
      playlistMetaData[playlistUID + playlistID].tracks = []; // No need. Waste of space.

      const tempPlaylistForward = [...arrayPlaylistForward];

      if (arrayPlaylistForward.length) {
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

      console.log(arrayPlaylistForward);

      for (let i = 0; i < arrayPlaylistForward.length; i++) {
        console.log(i);
        (0, _componentse.createTrack)(musicCatalogue[arrayPlaylistForward[i].trackID], `${playlistUID}${playlistID}playlistViewTracksContainer`, i, `${playlistUID}${playlistID}${arrayPlaylistForward[i].randomID}${arrayPlaylistForward[i].trackID}`, ["playlistUID", playlistUID, "playlistID", playlistID, "playlistRandomID", arrayPlaylistForward[i].randomID], false, false, arrayPlaylistForward[i].trackID);
      }

      for (let i = 0; i < arrayPlaylistBackward.length; i++) {
        $(`#${playlistUID}${playlistID}${arrayPlaylistBackward[i].randomID}${arrayPlaylistBackward[i].trackID}`).addClass('music-track-gone');
        window.setTimeout(() => {
          $(`#${playlistUID}${playlistID}${arrayPlaylistBackward[i].randomID}${arrayPlaylistBackward[i].trackID}`).remove(); // Update indexes

          for (let j = 0; j < tracks.length; j++) {
            $(`#music-track-icon-${playlistUID}${playlistID}${tracks[j].randomID}${tracks[j].trackID}`).html(j + 1);
          }
        }, 550);
      }

      $(`#${playlistUID}${playlistID}waitingNotice`).addClass('hidden');
      $(`#${playlistUID}${playlistID}noTrackNotice`).addClass('hidden');

      if (!tracks.length) {
        $(`#${playlistUID}${playlistID}noTrackNotice`).removeClass('hidden');
      } // Success


      resolve(true);
    }, error => {
      console.log(error);

      if (`${error}`.includes('insufficient permissions')) {
        resolve(false);
      }
    });
  });
}

window.openGenre = async genreID => {
  if (currentServer !== 'music') {
    (0, _servers.openSpecialServer)('music');
  }

  if ($(`#GenreView${genreID}`).length) {
    $(`#GenreView${genreID}`).removeClass('hidden');
    $(`#GenreView${genreID}`).appendTo(`#musicTab_${activeMusicTab}`);
    return;
  }

  const a = document.createElement('div');
  a.innerHTML = `
    <div class="musicViewHeader animated fadeInDown faster">
      <p>Category</p>
      <button id="Genre${genreID}Close" onclick="closeMusicView('Genre', '${genreID}')" class="btn b-3 roundedButton closeButton"><i class="bx bx-x"></i></button>
    </div>
    <div class="musicViewContentContainer">
      <div class="genreTopLevel">
        <h2 id="${genreID}genreTitle" class="genreTitle animated fadeInUp"></h2>
      </div>
      <div class="musicViewContent">
        <h3>Top Albums</h3>
        <div id="Genre${genreID}Albums" class="genreAlbums"></div>
        <h3>Top Tracks</h3>
        <div id="Genre${genreID}Tracks" class="genreTracks"></div>
      </div>
    </div>
  `;
  a.setAttribute('class', 'musicView genreView');
  a.id = `GenreView${genreID}`;
  $('#musicTab_' + activeMusicTab).get(0).appendChild(a);
  const genreData = await makeMusicRequest(`genres/${genreID}`);
  $(`#${genreID}genreTitle`).html(genreData.data[0].attributes.name);
  $(`#${genreID}genreTitle`).attr('title', genreData.data[0].attributes.name);
  const charts = await makeMusicRequest(`charts?genre=${genreID}&types=albums,songs,playlists`);
  console.log(charts);
  const albums = charts.results.albums[0].data;

  for (let i = 0; i < albums.length; i++) {
    const album = albums[i];
    (0, _componentse.createAlbum)(album, `Genre${genreID}Albums`);
  }

  const tracks = charts.results.songs[0].data;

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    (0, _componentse.createTrack)(track, `Genre${genreID}Tracks`, i);
  }

  tippy($(`#Genre${genreID}Close`).get(0), {
    content: 'Close',
    placement: 'top'
  });
};

window.openApplePlaylist = async (playlistID, playlistName, fromLibrary, folderContext) => {
  if (fromLibrary) {
    // Expand enclosing folder if it's not already expanded.
    if (!$(`#playlistButtonapple${playlistID}`).parent().hasClass('playlistFolderContentActive')) {
      $(`#playlistButtonapple${playlistID}`).parent().parent().children().first().click();
    }
  }

  if (currentServer !== 'music') {
    (0, _servers.openSpecialServer)('music');
  }

  musicTab('playlists');
  $(`.playlistView`).addClass('hidden');
  $(`#playlistButtonapple${playlistID}`).addClass('sidebarButtonActive');

  if ($(`#ApplePlaylistView${playlistID}`).length) {
    $(`#ApplePlaylistView${playlistID}`).removeClass('hidden');
    $(`#ApplePlaylistView${playlistID}`).appendTo(`#musicTab_${activeMusicTab}`);

    if (cacheUser.playlists.includes(`apple.${playlistID}.${playlistName}`)) {
      $(`#${playlistID}AddButton`).addClass('hidden');
      $(`#${playlistID}RemoveButton`).removeClass('hidden');
    } else {
      $(`#${playlistID}AddButton`).removeClass('hidden');
      $(`#${playlistID}RemoveButton`).addClass('hidden');
    }

    if (fromLibrary) {
      $(`#ApplePlaylist${playlistID}Close`).addClass('hidden');
    } else {
      $(`#ApplePlaylist${playlistID}Close`).removeClass('hidden');
    }

    return;
  }

  const a = document.createElement('div');
  a.innerHTML = `
    <div class="musicViewHeader animated fadeInDown faster">
      <p>Playlist</p>
      <button id="ApplePlaylist${playlistID}Close" onclick="closeMusicView('ApplePlaylist', '${playlistID}')" class="btn b-3 roundedButton closeButton"><i class="bx bx-x"></i></button>
    </div>
    <div class="musicViewContentContainer">
      <div class="playlistTopLevel">
      <img id="${playlistID}playlistViewImage" class="playlistCover invisible fadeIn"></img>
      <div class="playlistDetails">
        <h2 id="${playlistID}playlistTitle" class="playlistTitle animated fadeInUp"></h2>
        <p id="${playlistID}playlistDetailsLine" class="playlistDetailsLine animated fadeIn"></p>
        <div class="dropdown">
          <button id="playlistDropdownButton${playlistID}" onclick="openDropdown('${playlistID}Dropdown')" class="btn b-4 playlistDropdownButton iconButton dropdownButton"><i class="bx bx-dots-vertical-rounded"></i></button>
          <div id="${playlistID}Dropdown" class="dropdown-content">
            <a id="${playlistID}AddButton" class="btn">Add to Library</a>
            <a id="${playlistID}RemoveButton" class="btn btnDanger">Remove from Library</a>
            <a id="${playlistID}CloneButton" class="btn">Clone Playlist</a>
            <div class="dropdownDivider"></div>
            <a id="${playlistID}copyButton" class="btn">Copy Link</a>
            <a onclick="copyToClipboard('${playlistID}')" class="btn">Copy ID</a>
          </div>
        </div>
        <button id="${playlistID}PlayTrackButton" class="btn b-1 playButton"><i class='bx bx-play'></i> play</button> 
        <button id="${playlistID}ShuffleTrackButton"  onclick="playTrack(null, '${playlistID}playlistViewTracksContainer', 0, true)" class="btn b-1 playButton"><i class='bx bx-shuffle'></i> shuffle</button>     
        <p id="${playlistID}contentEditable" class="playlistDescription" spellcheck="false" contenteditable="false"></p>
      </div>
    </div>
    <div class="hr"></div>
    <div class="musicViewContent">
      <div class="notice hidden animated fadeIn" id="${playlistID}noTrackNotice">No tracks added to this playlist.</div>
      <div class="tracksContainer" id="${playlistID}playlistViewTracksContainer">
        <div class="notice fetchingTracksNotice animated fadeIn" id="${playlistID}waitingNotice">Fetching tracks...</div>
      </div>
    </div>
    </div>
  `;
  a.setAttribute('class', 'musicView applePlaylistView playlistView');
  a.id = `ApplePlaylistView${playlistID}`;
  $(`#musicTab_playlists`).get(0).appendChild(a);

  if (fromLibrary) {
    $(`#ApplePlaylist${playlistID}Close`).addClass('hidden');
  } else {
    $(`#ApplePlaylist${playlistID}Close`).removeClass('hidden');
  }

  tippy($(`#ApplePlaylist${playlistID}Close`).get(0), {
    content: 'Close',
    placement: 'top'
  }); // Make request

  let playlist;

  try {
    playlist = (await makeMusicRequest(`playlists/${playlistID.replaceAll('_', '.')}`)).data[0];
  } catch (error) {
    if (fromLibrary) {
      // Playlist must have been deleted.
      (0, _library.removePlaylistFromLibrary)('apple', playlistID, playlistName, folderContext, false, true);
      snac('Playlist Removed', `This playlist has recently been removed. It has been removed from your library.`, 'danger');
    }
  }

  if (playlist.attributes.name !== playlistName && fromLibrary) {
    // Playlist must have been renamed.
    await (0, _firestore.runTransaction)(db, async transaction => {
      const sfDoc = await transaction.get((0, _firestore.doc)(db, `users/${user.uid}`));
      let newPlaylistList = [];

      for (let i = 0; i < sfDoc.data().playlists.length; i++) {
        const playlist = sfDoc.data().playlists[i].split('.');
        playlistUIDSearch = playlist[0];
        playlistIDSearch = playlist[1];
        playlistNameOld = playlist[2];

        if (playlistIDSearch == `${playlistID}` && playlistUID == playlistUIDSearch) {
          newPlaylistList.push(`${playlistUID}.${playlistIDSearch}.${playlist.attributes.name}`);
        } else {
          newPlaylistList.push(sfDoc.data().playlists[i]);
        }
      }

      transaction.update((0, _firestore.doc)(db, `users/${user.uid}`), {
        playlists: newPlaylistList
      });
    });
    snac('Playlist Updated', `This playlist has recently been renamed. We've synced the changes for you. `, 'success');
  }

  $(`#${playlistID}playlistTitle`).html(playlist.attributes.name);
  $(`#${playlistID}playlistTitle`).attr('title', playlist.attributes.name);
  $(`#${playlistID}playlistDetailsLine`).html(`Apple Music <span class="playlistDetailsSeparator"><i class="bx bxs-circle"></i></span> Updated ${timeago.format(playlist.attributes.lastModifiedDate)}`);
  $(`#${playlistID}contentEditable`).html(playlist.attributes.description.standard);
  $(`#${playlistID}playlistViewImage`).attr('src', `${playlist.attributes.artwork.url.replaceAll(`{w}`, '800').replaceAll(`{h}`, '800')}`);
  (0, _display.displayImageAnimation)(`${playlistID}playlistViewImage`);
  const tracks = (await makeMusicRequest(`playlists/${playlistID.replaceAll('_', '.')}?include=tracks&extend=`)).data[0].relationships.tracks.data;
  $(`#${playlistID}waitingNotice`).addClass('hidden');

  if (tracks.length === 0) {
    $(`#${playlistID}noTrackNotice`).removeClass('hidden');
    $(`#${playlistID}playlistViewTracksContainer`).addClass('hidden');
  }

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    (0, _componentse.createTrack)(track, `${playlistID}playlistViewTracksContainer`, i, false, [], false, false, false);
  }

  if (cacheUser.playlists.includes(`apple.${playlistID}.${playlist.attributes.name}`)) {
    $(`#${playlistID}AddButton`).addClass('hidden');
    $(`#${playlistID}RemoveButton`).removeClass('hidden');
  } else {
    $(`#${playlistID}AddButton`).removeClass('hidden');
    $(`#${playlistID}RemoveButton`).addClass('hidden');
  }

  $(`#${playlistID}copyButton`).get(0).onclick = () => {
    copyToClipboard(`${playlist.attributes.url}`);
  };

  $(`#${playlistID}AddButton`).get(0).onclick = () => {
    (0, _library.addPlaylistToLibrary)('apple', playlistID, playlist.attributes.name);
  };

  $(`#${playlistID}RemoveButton`).get(0).onclick = () => {
    (0, _library.removePlaylistFromLibrary)('apple', playlistID, playlist.attributes.name, folderContext, false, true);
  };

  $(`#${playlistID}PlayTrackButton`).get(0).onclick = () => {
    playTrack(null, `${playlistID}playlistViewTracksContainer`, 0);
  };

  $(`#${playlistID}ShuffleTrackButton`).get(0).onclick = () => {
    playTrack(null, `${playlistID}playlistViewTracksContainer`, 0, true);
  };

  $(`#${playlistID}CloneButton`).get(0).onclick = async () => {
    const playlistID = await (0, _library.createPlaylist)(false, (0, _display.securityConfirmTextIDs)(playlist.attributes.name, true), true, false);
    let playlistTracks = [];
    let totalDuration = 0;

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      playlistTracks.push({
        randomID: `${new Date().getTime()}`,
        trackID: `${track.id}`
      });
      totalDuration += track.attributes.durationInMillis;
    }

    await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}/playlists/${playlistID}`), {
      tracks: playlistTracks,
      totalDuration: totalDuration,
      description: playlist.attributes.description.standard
    });
    snac('Playlist Cloned', 'The playlist was cloned to your library successfully.', 'success');
  };
};

window.openAlbum = async (albumIDInput, trackID) => {
  if (currentServer !== 'music') {
    (0, _servers.openSpecialServer)('music');
  }

  editorModePlaylist ? exitEditorModePlaylist(editorModePlaylist) : null;
  let albumID = albumIDInput;

  if (trackID) {
    const trackData = await makeMusicRequest(`songs/${trackID}`);
    albumID = trackData.data[0].relationships.albums.data[0].id;
  }

  if ($(`#AlbumView${albumID}`).length) {
    $(`#AlbumView${albumID}`).removeClass('hidden');
    $(`#AlbumView${albumID}`).appendTo(`#musicTab_${activeMusicTab}`);
    return;
  }

  const a = document.createElement('div');
  a.innerHTML = `
    <div class="musicViewHeader animated fadeInDown faster">
      <p>Album</p>
      <button id="Album${albumID}Close" onclick="closeMusicView('Album', '${albumID}')" class="btn b-3 roundedButton closeButton"><i class="bx bx-x"></i></button>
    </div>
    <div class="musicViewContentContainer">
      <div id="${albumID}heroBanner" class="heroBanner"></div>
      <div class="albumTopLevel">
        <img id="${albumID}albumViewImage" class="albumCover invisible"/>
        <div class="albumDetails">
          <h2 id="${albumID}albumTitle" class="albumName animated fadeInUp"></h2>
          <p id="${albumID}albumDetailsLine" class="albumDetailsLine animated fadeIn"></p>
          <div class="albumFlexRow">
            <div>
              <button id="Album${albumID}PlayButton" class="btn b-1 playButton"><i class='bx bx-play'></i> play</button> 
              <button id="Album${albumID}ShuffleButton" class="btn b-2 playButton"><i class='bx bx-shuffle'></i> shuffle</button>
              <div class="dropdown">
                <button id="albumDropdownButton${albumID}" onclick="openDropdown('${albumID}AlbumDropdown')" class="btn b-4 playlistDropdownButton iconButton dropdownButton"><i class="bx bx-dots-vertical-rounded"></i></button>
                <div id="${albumID}AlbumDropdown" class="dropdown-content">
                  <a id="${albumID}AddButton" class="btn playlistButtonContext acceptLeftClick">Add to Playlist</a>
                  <div class="dropdownDivider"></div>
                  <a onclick="copyToClipboard('${window.location.origin}/preview?albumID=${albumID}')" class="btn">Copy Link</a>
                  <a onclick="copyToClipboard('${albumID}')" class="btn">Copy ID</a>
                </div>
              </div>
            </div>
            <div id="Album${albumID}LikeContainer"></div>
          </div>
          <p id="Album${albumID}Description" class="albumDescription"></p>
        </div>
      </div>
      <div class="hr"></div>
      <div class="musicViewContent">
        <div class="tracksContainer" id="${albumID}albumViewTracksContainer"></div>
        <div class="hr"></div>
        <div id="album${albumID}VersionsContainer" class="hidden">
          <h3 class="albumSectionTitle">Other Versions</h3>
          <div class="versionAlbums" id="Album${albumID}Versions"></div>
        </div>

        <div id="album${albumID}SimilarContainer" class="hidden">
          <h3 class="albumSectionTitle">Related Albums</h3>
          <div class="similarAlbums" id="Album${albumID}Similar"></div>
        </div>
      </div>
      <div></div>
    </div>
  `;
  a.setAttribute('class', 'musicView albumView');
  a.id = `AlbumView${albumID}`;
  $('#musicTab_' + activeMusicTab).get(0).appendChild(a);

  $(`#Album${albumID}PlayButton`).get(0).onclick = () => {
    playTrack(null, `${albumID}albumViewTracksContainer`, 0, false);
  };

  $(`#Album${albumID}ShuffleButton`).get(0).onclick = () => {
    playTrack(null, `${albumID}albumViewTracksContainer`, 0, true);
  };

  let likeSnippet = '';

  if (cacheLibraryAlbums.includes(albumID)) {
    likeSnippet = `<div class="mainFavButton"><button onclick="removeFromLibrary('albums', '${albumID}')" class="btn b-1 iconButton favButton likedButtonalbums${albumID}"> <i class="bx bxs-heart"></i> </button></div>`;
  } else {
    likeSnippet = `<div class="mainFavButton"><button onclick="addToLibrary('albums', '${albumID}')" class="btn b-1 iconButton favButton likedButtonalbums${albumID}"> <i class="bx bx-heart"></i> </button></div>`;
  }

  $(`#Album${albumID}LikeContainer`).html(likeSnippet);
  const album = await makeMusicRequest(`albums/${albumID}?views=related-albums,other-versions`);
  console.log(album);
  const albumData = album.data[0];
  if (albumData.attributes.editorialNotes && albumData.attributes.editorialNotes.short) $(`#Album${albumID}Description`).html(albumData.attributes.editorialNotes.short);
  $(`#${albumID}albumViewImage`).get(0).src = `${albumData.attributes.artwork.url.replace('{w}', 500).replace('{h}', 500) || placeholderAlbumImage}`;
  (0, _display.displayImageAnimation)(`${albumID}albumViewImage`);
  $(`#${albumID}albumDetailsLine`).html(`By <span id="Album${albumID}ArtistText" class="albumArtist">${albumData.attributes.artistName}</span> <span class="albumDetailsSeparator"><i class="bx bxs-circle"></i></span> ${albumData.attributes.releaseDate} `);

  $(`#Album${albumID}ArtistText`).get(0).onclick = event => {
    setContextSelectArtistItems(null, null, null, albumData.relationships.artists.data, event);
  };

  $(`#${albumID}albumTitle`).html(albumData.attributes.name);
  $(`#${albumID}albumTitle`).attr('title', albumData.attributes.name);
  tippy($(`#Album${albumID}Close`).get(0), {
    content: 'Close',
    placement: 'top'
  });

  $(`#${albumID}AddButton`).get(0).onclick = () => {
    (0, _context.playlistSelector)(null, albumID);
  };

  $(`#${albumID}albumViewImage`).get(0).setAttribute('crossOrigin', '');
  $(`#${albumID}albumViewImage`).get(0).addEventListener('load', () => {
    // Color banner.
    $(`#${albumID}albumViewImage`).removeClass('invisible');
    const colors = colorThief.getColor($(`#${albumID}albumViewImage`).get(0));
    $(`#${albumID}heroBanner`).get(0).setAttribute('style', `background-color: rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, 1)`);
  });
  const tracks = albumData.relationships.tracks.data;
  let index = 0; // Index to not be affected by music-videos.

  for (let i = 0; i < tracks.length; i++) {
    if (tracks[i].type == 'music-videos') {
      continue;
    }

    ;
    const track = tracks[i];
    (0, _componentse.createTrack)(track, `${albumID}albumViewTracksContainer`, index, null, []);
    index++;
  }

  const similarAlbums = albumData.views['related-albums'].data;

  if (similarAlbums.length) {
    $(`#album${albumID}SimilarContainer`).removeClass('hidden');
  }

  for (let i = 0; i < similarAlbums.length; i++) {
    const album = similarAlbums[i];
    (0, _componentse.createAlbum)(album, `Album${albumID}Similar`);
  }

  const versions = albumData.views['other-versions'].data;

  if (versions.length) {
    $(`#album${albumID}VersionsContainer`).removeClass('hidden');
  }

  for (let i = 0; i < versions.length; i++) {
    const album = versions[i];
    (0, _componentse.createAlbum)(album, `Album${albumID}Versions`);
  }
};

window.closeMusicView = (musicType, musicID) => {
  if (musicType == 'Playlist') {
    // Social playlist;
    musicTab('friends');
    return;
  }

  $(`#${musicType}View${musicID}`).addClass('hidden');
};

window.shuffleList = container => {
  musicQueue = [];
  clearQueue();
  $(container).children('.track').each((i, obj) => {
    const trackID = $(obj).get(0).getAttribute('trackid');
    musicQueue.push(trackID);
  });
  (0, _display.shuffleArray)(musicQueue); // Randomize array.

  for (let i = 0; i < musicQueue.length; i++) {
    updateQueue('appendQueue', musicCatalogue[musicQueue[i]], false);
  }

  if (musicQueue.length) {
    initalizePlayback(musicQueue[0]); // Play first song.

    updateQueue('removeQueue', musicQueue[0], false, 0);
    musicQueue.splice(0, 1); // Remove first from queue.
  } else {
    snac("Shuffle Error", "No tracks available to shuffle.", "danger");
  }
};

window.playASong = trackID => {
  if (activeListeningParty) {
    (0, _display.openModal)('leavePartyCheck');

    $(`#confirmLeaveParty`).get(0).onclick = () => {
      (0, _vcMusic.leaveListeningParty)(activeListeningParty.split('/')[0], activeListeningParty.split('/')[1], activeListeningParty.split('/')[2]);
      playASong(trackID);
      (0, _display.closeModal)();
    };

    return;
  }

  document.activeElement.blur();
  musicQueue = [];
  updateQueue('removeQueue');
  initalizePlayback(trackID);
};

async function initalizePlayback(trackID) {
  if (activeListeningParty) {
    (0, _display.openModal)('leavePartyCheck');

    $(`#confirmLeaveParty`).get(0).onclick = () => {
      (0, _vcMusic.leaveListeningParty)(activeListeningParty.split('/')[0], activeListeningParty.split('/')[1], activeListeningParty.split('/')[2]);
      initalizePlayback(trackID);
      (0, _display.closeModal)();
    };

    return;
  }

  (0, _display.setNoTrackUI)(); // Pause track.

  libraryPlayer.pause();
  console.log(trackID);
  const trackDetails = await makeMusicRequest(`songs/${trackID}?include=artists`);
  musicPlaying = trackDetails.data[0];
  updateQueue('nowPlaying', musicPlaying, false);
  (0, _playback.sendTrackToPlayerRevamp)(musicPlaying, `#libraryPlayer`);
  window.setTimeout(() => {
    (0, _display.setTrackUI)(musicPlaying);
  }, 1499);
  (0, _presence.setMusicStatus)();
}

function pauseMusicButton() {
  libraryPlayer.pause();
  document.activeElement.blur();
}

function playMusicButton() {
  libraryPlayer.play();
  document.activeElement.blur();
}

function playerDidEnd() {
  if (enableLoopConst) {
    libraryPlayer.restart();
    libraryPlayer.play(); // snac('Replaying current track.', '', '');

    return;
  }

  console.log('Source cleared.');
  libraryPlayerElement.src = '';
  forwardSong();
}

function backwardSong() {
  if (libraryPlayer.currentTime < 10) {
    // Under six seconds. Go to previous song.
    if (musicBack.length) {
      musicQueue.unshift(musicPlaying.id); // Add to first element of queue

      updateQueue('appendQueue', musicCatalogue[musicPlaying.id], true);
      initalizePlayback(musicBack[musicBack.length - 1]); // Remove first element of music history

      musicBack.splice(musicBack.length - 1, 1);
      return;
    } else {
      libraryPlayer.restart();
    }
  } // Over six seconds. Go to beggining of song.


  libraryPlayer.restart();
}

function forwardSong() {
  if (skipTimeout) {
    notifyTiny('Please wait a few moments.');
    return;
  } else {
    skipTimeout = true;
    window.setTimeout(() => {
      skipTimeout = false;
    }, 2999);
  }

  if (Object.keys(musicPlaying).length) {
    updateQueue('appendHistory', musicPlaying, true);
    musicHistory.push(musicPlaying.id);
  }

  musicPlaying = {};

  if (musicQueue.length) {
    // To next song in queue
    updateQueue('removeQueue', musicQueue[0], false, 0);
    initalizePlayback(musicQueue[0]);
    musicQueue.splice(0, 1); // Delete first element from queue
  } else {
    // no song next in queue
    libraryPlayer.pause();
    (0, _display.hidePlaybackView)();
    updateQueue('nowPlaying');
  }
}

function switchToHistory() {
  $(`#updateQueueText`).html('View Queue');

  $(`#updateQueueText`).get(0).onclick = () => switchToQueue();

  $('#queueItems').addClass('hidden');
  $('#historyItems').removeClass('hidden');
  $('#queueClear').addClass('hidden');
  $('#historyClear').removeClass('hidden');
  $('#queueNotice').addClass('hidden');
  $('#historyNotice').removeClass('hidden');
  $('#upNowText').html('History');
}

function switchToQueue() {
  $(`#updateQueueText`).html('View History');

  $(`#updateQueueText`).get(0).onclick = () => switchToHistory();

  $('#historyItems').addClass('hidden');
  $('#queueItems').removeClass('hidden');
  $('#historyClear').addClass('hidden');
  $('#queueClear').removeClass('hidden');
  $('#historyNotice').addClass('hidden');
  $('#queueNotice').removeClass('hidden');
  $('#upNowText').html('Up Next');
}

function updateQueue(operationType, track, prependInstead, removeNthInstance) {
  switch (operationType) {
    case 'appendQueue':
      (0, _componentse.createTrack)(track, 'queueItems', 2, `QueueItem${track.id}${new Date().getTime()}`, ["fromQueue", true], prependInstead);
      redoQueueIndexes();
      break;

    case 'removeQueue':
      if (!track) {
        console.log('empty queue');
        $(`#queueItems`).empty(); // Empty queue if unspecified
      } else {
        // Find the special ID with track ID and nth index.
        console.log(track);
        $(`#queueItems`).children(`.music-track-${track}`).eq(removeNthInstance).remove();
        redoQueueIndexes();
      }

      break;

    case 'appendHistory':
      (0, _componentse.createTrack)(track, 'historyItems', false, `QueueItem${track.id}${new Date().getTime()}`, ["fromQueue", true], prependInstead);
      break;

    case 'removeHistory':
      if (!track) {
        $(`#historyItems`).empty();
      } else {
        $(`#historyItems`).children(`.music-track-${track.id}`).eq(removeNthInstance).remove();
        redoQueueIndexes();
      }

      break;

    case 'nowPlaying':
      // Replace now playing div
      $(`.nowPlayingTitle`).removeClass('nowPlayingTitle');
      $('#nowPlaying').empty();

      if (track) {
        $('#nowPlayingText').html('Now Playing');
        console.log(track);
        (0, _componentse.createTrack)(track, `nowPlaying`, true, true, false, false, false, false, false, false);
        $(`.trackTitle${track.id}`).addClass('nowPlayingTitle');
      } else {
        $('#nowPlayingText').html('<span style="color: var(--secondary)">Nothing Playing</span>');
      }

      break;

    default:
      break;
  }

  if (musicQueue.length) {
    $('#queueClearButton').removeClass('hidden');
    $('#queueNoticeText').addClass('hidden');
  } else {
    $('#queueNoticeText').removeClass('hidden');
    $('#queueClearButton').addClass('hidden');
  }

  if (musicHistory.length) {
    $('#historyNoticeText').addClass('hidden');
    $('#historyClearButton').removeClass('hidden');
  } else {
    $('#historyNoticeText').removeClass('hidden');
    $('#historyClearButton').addClass('hidden');
  }

  $(`#queueHeader`).removeClass('hidden');

  if (!musicHistory.length && !musicQueue.length) {
    $(`#queueHeader`).addClass("hidden");
  }
}

function redoQueueIndexes() {
  window.setTimeout(() => {
    for (let i = 0; i < musicQueue.length; i++) {
      $(`#queueItems`).children().eq(i).children().eq(0).children().eq(0).html(i + 1);

      $(`#queueItems`).children().eq(i).get(0).onclick = () => {
        playTrack(musicQueue[i], 'queueItems', i);
      };
    }
  }, 150);
} // Sortable Stuff


enableQueueSort();

function enableQueueSort() {
  if (!$(`#queueItems`).length) {
    return;
  }

  ;
  Sortable.create($(`#queueItems`).get(0), {
    ghostClass: 'sortableGhost',
    onEnd: e => {
      const oldIndex = e.oldIndex;
      const newIndex = e.newIndex;
      musicQueue = [];
      $(`#queueItems`).children().each((index, object) => {
        musicQueue.push(`${$(object).attr('trackID')}`);
      });
      redoQueueIndexes();
      console.log(`Performed sort from ${oldIndex} to ${newIndex}`);
    }
  });
}

function clearQueue() {
  musicQueue = [];
  updateQueue('removeQueue');
}

function clearHistory() {
  musicHistory = [];
  updateQueue('removeHistory');
}

function clearMusicViews(tab) {
  $(`#musicTab_${tab}`).children('.musicView').each((index, obj) => {
    $(obj).addClass('hidden');
  });
}

function clearMusicViewsPlaylist() {
  $(`#musicTab_playlists`).children('.artistView,.albumView').each((index, obj) => {
    $(obj).addClass('hidden');
  });
}

function enableLoop(trackID) {
  enableLoopConst = trackID;
  $(`#currentTrackTitle`).addClass("loopedSongHighlight");
  snac('Track Loop', 'Now looping current song.', 'success');
}

function disableLoop(trackID) {
  enableLoopConst = '';
  $(`#currentTrackTitle`).removeClass("loopedSongHighlight");
  snac('Track Loop', 'No longer looping current song.', 'success');
} // Copy Spotify Playlists


window.stateKey = 'spotify_auth_state';

async function loginSpotify() {
  const clientID = 'b2b0e41d0a3e4464b12eba666a1de36d';
  const redirectURL = window.location.href;
  var state = generateRandomString(16);
  localStorage.setItem(stateKey, state);
  var scope = 'user-read-private playlist-read-private playlist-read-collaborative user-library-read';
  var url = 'https://accounts.spotify.com/authorize';
  url += '?response_type=token';
  url += '&client_id=' + encodeURIComponent(clientID);
  url += '&scope=' + encodeURIComponent(scope);
  url += '&redirect_uri=' + encodeURIComponent(redirectURL);
  url += '&state=' + encodeURIComponent(state);
  window.location.replace(url);
}

function getHashParams() {
  var hashParams = {};
  var e,
      r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);

  while (e = r.exec(q)) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
  }

  return hashParams;
}

function generateRandomString(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

;

function manageSpotify() {
  const params = getHashParams();
  const access_token = params.access_token,
        state = params.state,
        storedState = localStorage.getItem(stateKey);
  $(`#spotifyUnsigned`).removeClass('hidden');
  $(`#spotifySigned`).addClass('hidden');
  $(`#spotifySigned2`).addClass('hidden');

  if (access_token) {
    localStorage.removeItem(stateKey);

    if (access_token) {
      $(`#spotifyUnsigned`).addClass('hidden');
      $(`#spotifySigned`).removeClass('hidden');
      $(`#spotifySigned2`).removeClass('hidden');
      loadSignedInSpotify(access_token);
      spotifyToken = access_token;
    }
  }
}

async function loadSignedInSpotify(token) {
  notifyTiny('Spotify linked.');
  await (0, _display.timer)(1000);
  (0, _servers.openSpecialServer)('account');
  (0, _settings.settingsTab)('transfer');
  const myProfileFetch = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + token,
      "Content-Type": "application/json"
    }
  });
  const myProfile = await myProfileFetch.json();
  $(`#spotifySignedInDetails`).html(`
    Signed in as
    <img src="${myProfile.images[0].url}" />
    ${myProfile.display_name}
  `); // Get playlists!

  const myPlaylistsFetch = await fetch("https://api.spotify.com/v1/me/playlists", {
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + token,
      "Content-Type": "application/json"
    }
  });
  const myPlaylists = await myPlaylistsFetch.json();
  $(`#spotifyPlaylistList`).empty();

  for (let i = 0; i < myPlaylists.items.length; i++) {
    const playlist = myPlaylists.items[i];
    const a = document.createElement('div');
    a.setAttribute('class', 'spotifyPlaylistItem');

    a.onclick = () => prepareTransferPlaylist(playlist.id, token, playlist.name);

    a.innerHTML = `${playlist.name}`;
    $(`#spotifyPlaylistList`).get(0).appendChild(a);
  }
}

function prepareTransferPlaylist(playlistID, token, playlistName) {
  // Open confirmation modal
  (0, _display.openModal)('confirmTransfer');
  $(`#confirmTransferText`).html(`Are you sure you would like to transfer the playlist, "${playlistName}", to your Parallel library? Please keep Parallel open until completion. This process may take a few moments.`);

  $(`#confirmTransferButton`).get(0).onclick = async () => {
    // convert playlist of PlaylistID 
    (0, _display.closeModal)();
    const aPlaylistFetch = await fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + token,
        "Content-Type": "application/json"
      }
    });
    const aPlaylist = await aPlaylistFetch.json(); // Create Parallel playlist

    const parallelPlaylistID = await (0, _library.createPlaylist)(null, `${(0, _display.securityConfirmTextIDs)(playlistName, true)}`);

    if (!parallelPlaylistID) {
      snac('Could not create playlist.', '', 'error');
      return;
    }

    const tracksToAdd = [];
    let cumulativeLength = 0;

    for (let i = 0; i < aPlaylist.items.length; i++) {
      const spotifyTrack = aPlaylist.items[i];
      const trackData = await makeMusicRequest(`search?term=${encodeURIComponent(spotifyTrack.track.artists[0].name)} ${encodeURIComponent(spotifyTrack.track.name)}&limit=1`);

      try {
        if (trackData.results.songs.data.length) {
          tracksToAdd.push({
            trackID: `${trackData.results.songs.data[0].id}`,
            randomID: `${new Date().getTime()}`
          });
          cumulativeLength += trackData.results.songs.data[0].durationInMillis;
        }
      } catch (error) {
        console.log(`❌: ${tracks[i].artist.name} - ${tracks[i].title}`);
      }

      notifyTiny(`${i + 1} / ${aPlaylist.items.length} done.`);
    }

    await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}/playlists/${parallelPlaylistID}`), {
      totalDuration: cumulativeLength,
      tracks: tracksToAdd
    });
    snac('Playlist Transferred.', 'Your playlist has been successfully transferred to Parallel. Happy listening!', 'success');
  };
}

function openModifyPointerModal(trackID) {
  (0, _display.openModal)('updateTargetURL');
  $('#newYouTubeID').get(0).addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      $(`#updateYouTubeIDConfirm`).get(0).click();
    }
  });

  $(`#clearYouTubeIDConfirm`).get(0).onclick = async () => {
    const confirmBox = confirm('Confirm request. Sent by user ' + user.uid);
    (0, _display.closeModal)();

    if (confirmBox) {
      const updateTrackURL = (0, _functions.httpsCallable)(functions, 'updateTrackURL');
      const result = await updateTrackURL({
        trackID: trackID,
        linkURL: ''
      });
      snac('Request Returned', JSON.stringify(result));
    }
  };

  $(`#updateYouTubeIDConfirm`).get(0).onclick = async () => {
    const confirmBox = confirm('Confirm request. Sent by user ' + user.uid);
    (0, _display.closeModal)();
    const newLink = $(`#newYouTubeID`).val();
    $(`#newYouTubeID`).val('');

    if (confirmBox) {
      const updateTrackURL = (0, _functions.httpsCallable)(functions, 'updateTrackURL');
      const result = await updateTrackURL({
        trackID: trackID,
        linkURL: newLink
      });
      snac('Request Returned', JSON.stringify(result));
    }
  };
}

window.playTrackByMessage = (el, id) => {
  $(el).addClass('disabled');
  playASong(id);
  window.setTimeout(() => {
    $(el).removeClass('disabled');
  }, 2900);
};

function loadRecentSearches() {
  $(`#recentSearches`).empty();
  $(`#recentSearches2`).empty();
  const recentSearches = JSON.parse(sessionStorage.getItem('recentSearches'));

  if (!recentSearches) {
    return;
  }

  recentSearches.reverse();

  for (let i = 0; i < recentSearches.length; i++) {
    const a = document.createElement('div');
    const b = document.createElement('div');
    a.setAttribute('class', 'recentSearchItem');
    b.setAttribute('class', 'recentSearchItem');

    a.onclick = () => {
      $('#searchMusic').val(recentSearches[i]);
      searchMusicButton();
    };

    b.onclick = () => {
      $('#searchMusic').val(recentSearches[i]);
      searchMusicButton();
    };

    a.innerHTML = `${recentSearches[i]}`;
    b.innerHTML = `${recentSearches[i]}`;
    $(`#recentSearches`).get(0).appendChild(a);
    $(`#recentSearches2`).get(0).appendChild(b);
  }
}

function addToRecentSearches(searchTerm) {
  let recentSearches = JSON.parse(sessionStorage.getItem('recentSearches'));

  if (!recentSearches) {
    recentSearches = [];
  }

  let included = false;

  for (let i = 0; i < recentSearches.length; i++) {
    if (recentSearches[i].toLowerCase() == searchTerm.toLowerCase()) {
      included = true;
      break;
    }
  }

  if (!included) {
    recentSearches.push(searchTerm);

    if (recentSearches.length > 10) {
      recentSearches.splice(0, 1); // Remove earliest
    }

    sessionStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    loadRecentSearches();
  }
}

async function spotifyPlaylistLookup() {
  const Id = $(`#searchSpotifyPlaylistID`).val();
  $(`#searchSpotifyPlaylistID`).val('');
  let playlistID = Id;

  if (Id.includes('/')) {
    // Link to playlist
    const temp = Id.split('/')[4];
    playlistID = temp.split('?')[0];
  }

  const aPlaylistFetch = await fetch(`https://api.spotify.com/v1/playlists/${playlistID}`, {
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + spotifyToken,
      "Content-Type": "application/json"
    }
  });
  const aPlaylist = await aPlaylistFetch.json();

  if (aPlaylist.error) {
    snac('Invalid ID', 'Sorry, we could not find a Spotify playlist with the ID you provided.', 'error');
    return;
  }

  prepareTransferPlaylist(playlistID, spotifyToken, aPlaylist.name);
}

window.playTrack = async (trackID, containerID, index, shuffle) => {
  musicBack = [];
  console.log(trackID, containerID, index);

  if (containerID && typeof index == 'number') {
    let childrenList = $(`#${containerID}`).children('.music-track');
    let stuffToBack = [...childrenList];
    childrenList.splice(0, index); // Delete from 0 to index
    // Delete from index to end

    stuffToBack.splice(index, stuffToBack.length - index);

    for (let i = 0; i < stuffToBack.length; i++) {
      const activeTrackID = parseInt(stuffToBack[i].getAttribute('trackID'));
      musicBack.push(activeTrackID);
    }

    clearQueue();

    if (shuffle) {
      childrenList = (0, _display.shuffleArray)(childrenList);
    }

    const first = childrenList[0];
    initalizePlayback(first.getAttribute('trackID'));

    for (let i = 1; i < childrenList.length; i++) {
      // To queue
      const activeTrackID = parseInt(childrenList[i].getAttribute('trackID'));
      musicQueue.push(activeTrackID);
      updateQueue('appendQueue', musicCatalogue[activeTrackID], false);
    }
  } else {
    clearQueue();
    initalizePlayback(trackID);
  }
};
},{"./display":"js/display.js","./library":"js/library.js","./playback":"js/playback.js","./presence":"js/presence.js","./servers":"js/servers.js","./settings":"js/settings.js","./stripe":"js/stripe.js","./context":"js/context.js","./vcMusic":"js/vcMusic.js","./componentse":"js/componentse.js","./firebaseChecks":"js/firebaseChecks.js"}],"js/servers.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addGroupToFolder = addGroupToFolder;
exports.addIndicator = addIndicator;
exports.checkIndicator = checkIndicator;
exports.checkServerUnread = checkServerUnread;
exports.createGroup = createGroup;
exports.createGroupFolder = createGroupFolder;
exports.deleteGuildPlaylistFolder = deleteGuildPlaylistFolder;
exports.demoteUser = demoteUser;
exports.expandGuildFolder = expandGuildFolder;
exports.joinGroup = joinGroup;
exports.kickMember = kickMember;
exports.leaveServer = leaveServer;
exports.loadMuted = loadMuted;
exports.loadOutgoingServerRequests = loadOutgoingServerRequests;
exports.loadServers = loadServers;
exports.markServerRead = markServerRead;
exports.openSpecialServer = openSpecialServer;
exports.prepareRenameGuildFolder = prepareRenameGuildFolder;
exports.promoteUser = promoteUser;
exports.removeGroupFromFolder = removeGroupFromFolder;
exports.removeIndicator = removeIndicator;
exports.unreadIndicators = unreadIndicators;
exports.updateServersOrder = updateServersOrder;

var _firestore = require("@firebase/firestore");

var _database = require("@firebase/database");

var _storage = require("@firebase/storage");

var _functions = require("@firebase/functions");

var timeago = _interopRequireWildcard(require("timeago.js"));

var _music = require("./music");

var _display = require("./display");

var _voice = require("./voice");

var _channels = require("./channels");

var _presence = require("./presence");

var _friends = require("./friends");

var _electron = require("./electron");

var _app = require("./app");

var _library = require("./library");

var _firebaseChecks = require("./firebaseChecks");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
window.currentServerUser = '';
window.currentServer = '';
window.currentChannel = '';
(0, _firebaseChecks.checkAppInitialized)();
const db = (0, _firestore.getFirestore)();
const rtdb = (0, _database.getDatabase)();
const functions = (0, _functions.getFunctions)();
const storage = (0, _storage.getStorage)();

async function loadMuted() {
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

async function updateServersOrder() {
  const serverList = [];
  $('.guildFolderContent').children('.server').each((index, object) => {
    serverList.push(`${object.getAttribute('guildUID')}.${object.getAttribute('guildID')}`);
  });
  $(`#serverListNonFolders`).children('.server').each((index, object) => {
    serverList.push(`${object.getAttribute('guildUID')}.${object.getAttribute('guildID')}`);
  });
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
    guilds: serverList
  });
}

Sortable.create($('#serverListFolders').get(0), {
  ghostClass: 'sortableSidebarItemGhost',
  onEnd: async () => {
    // Overwrite playlists.
    let newFoldersSort = [];
    $('#serverListFolders').children('.guildFolderContainer').each((index, object) => {
      const id = $(object).get(0).getAttribute('folderID');
      newFoldersSort.push(id);
    });
    await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
      guildFoldersSort: newFoldersSort
    });
  }
});

async function loadServers() {
  const serverListForward = (0, _display.commonArrayDifference)(cacheUser.guilds, cacheServerList);
  const serverListBackward = (0, _display.commonArrayDifference)(cacheServerList, cacheUser.guilds);
  cacheServerList = cacheUser.guilds;

  for (let i = 0; i < serverListForward.length; i++) {
    const guildUID = serverListForward[i].split('.')[0];
    const guildID = serverListForward[i].split('.')[1];
    const guildMeta = await (0, _firestore.getDoc)((0, _firestore.doc)(db, `users/${guildUID}/servers/${guildID}`));
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
    (0, _database.off)((0, _database.query)((0, _database.ref)(rtdb, `servers/${guildUID}${guildID}`)));
    (0, _database.off)((0, _database.query)((0, _database.ref)(rtdb, `voice/${guildUID}${guildID}`)));
    $(`#${guildUID}${guildID}View`).remove();

    if (currentServer == guildID) {
      currentServerUser = '';
      currentServer = '';
    }

    currentChannel = ''; // VC

    if (currentCall && currentCall.includes(guildID)) {
      (0, _voice.endAllCalls)();
    }

    window.setTimeout(() => {
      sendToElectron('notificationBadges', $('.serverNotification:not(.hidden,.zoomOut,.invisible,.invisibleOpacity,.folderIndicator)').length);
    }, 199); // For deleted groups, the server is gone, but the notification BADGE is still there.
  } // Move all into one place.


  $(`.guildFolderContent`).children().each((index, element) => {
    $(element).appendTo(`#serverListNonFolders`);
    $(element).get(0).removeAttribute('inFolder');
    const animationKey = `${element.getAttribute('guildUID')}${element.getAttribute('guildID')}`;

    if (animatedFolderGuildOut.includes(animationKey)) {
      // LEAVING PLAYLIST FOLDER.
      animatedFolderTrackOut.splice(animatedFolderTrackOut.indexOf(animationKey), 1); // Animate in MAIN AREA. Since, its moving OUT a playlist folder.

      $(element).addClass('instantTransitions');
      $(element).addClass('serverGone');
      $(element).removeClass('instantTransitions');
      window.setTimeout(() => {
        $(element).removeClass('serverGone');
      }, 99);
    }
  }); // Sort

  for (let i = 0; i < cacheUser.guilds.length; i++) {
    let guildUID = cacheUser.guilds[i].split('.')[0];
    let guildID = cacheUser.guilds[i].split('.')[1];
    $(`#${guildUID}${guildID}Server`).get(0).setAttribute('data-order', i);
  }

  let sorted = $(`#serverListNonFolders`).children('.server').sort((a, b) => {
    return parseInt($(a).attr('data-order')) - parseInt($(b).attr('data-order'));
  });
  $(`#serverListNonFolders`).append(sorted); // Load folders

  if (!cacheUser.guildFolders) {
    $(`.server`).removeClass('hidden');
    return;
  }

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
    const guilds = folders[`${folderName}<${folderID}`]; // If element not already created.

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

      a.ondragover = ev => {
        ev.preventDefault();
      };

      a.ondrop = ev => {
        guildFoldersDrop(ev, folderID, folderName);
      };

      if (!$(`#${folderID}Container`).length) {
        $(`#serverListFolders`).get(0).appendChild(a);
        tippy($(`#${folderID}Button`).get(0), {
          content: folderName,
          placement: 'right'
        });
        window.setTimeout(() => {
          $(`#${folderID}Button`).removeClass('animated');
        }, 499);

        $(`#${folderID}Button`).get(0).onclick = () => {
          expandGuildFolder(folderID);
        }; // Setup a sortable.


        Sortable.create($(`#guildFolderContent${folderID}`).get(0), {
          ghostClass: 'sortableSidebarItemGhost',
          onEnd: async e => {
            updateServersOrder();
          }
        });
      }
    } else {
      if ($(`#${folderID}Button`).get(0).getAttribute('folderName') !== folderName) {
        // Folder was renamed.
        $(`#${folderID}Button`).get(0)._tippy.setContent(folderName);

        $(`#${folderID}Button`).get(0).setAttribute('folderName', folderName);
      }

      $(`#${folderID}Container`).removeClass('hidden');
    } // Add all the groups into the folder.


    for (let i = 0; i < guilds.length; i++) {
      const guildSplit = guilds[i].split('.');
      const guildUID = guildSplit[0];
      const guildID = guildSplit[1]; // Move the button into the container.

      $(`#${guildUID}${guildID}Server`).appendTo(`#guildFolderContent${folderID}`);
      $(`#${guildUID}${guildID}Server`).get(0).setAttribute('inFolder', `${folderName}<${folderID}`);

      $(`#${guildUID}${guildID}Server`).get(0).ondragstart = ev => {
        ev.dataTransfer.setData("targetGuildUID", guildUID);
        ev.dataTransfer.setData("targetGuildID", guildID);
        ev.dataTransfer.setData("targetFolderKey", `${folderName}<${folderID}`);
      };
    }

    $(`#folderCount${folderID}`).html(guilds.length); // Check notifications for the folder

    checkFolderIndicator(null, null, folderID);
    console.log('checking'); // Sort the  according to cacheUser.guilds

    for (let i = 0; i < cacheUser.guilds.length; i++) {
      const guildSplit = cacheUser.guilds[i].split('.');
      const guildUID = guildSplit[0];
      const guildID = guildSplit[1];

      if ($(`#${guildUID}${guildID}Server`).attr('inFolder') == `${folderName}<${folderID}`) {
        $(`#${guildUID}${guildID}Server`).get(0).setAttribute('data-order', i);
      }
    }

    let sorted = $(`#guildFolderContent${folderID}`).children('.server').sort((a, b) => {
      return parseInt($(a).attr('data-order')) - parseInt($(b).attr('data-order'));
    });
    $(`#guildFolderContent${folderID}`).append(sorted);
  } // Sort the folders


  if (cacheUser.guildFoldersSort) {
    for (let i = 0; i < cacheUser.guildFoldersSort.length; i++) {
      const folderID = cacheUser.guildFoldersSort[i];
      $(`#${folderID}Container`).attr('data-order', i);
    }

    let sorted = $(`#serverListFolders`).children('.guildFolderContainer').sort((a, b) => {
      return parseInt($(a).attr('data-order')) - parseInt($(b).attr('data-order'));
    });
    $(`#serverListFolders`).append(sorted);
  } // Show all groups.


  $(`.server`).removeClass('hidden');
}

async function guildFoldersDrop(ev, folderID, folderName) {
  const guildUID = ev.dataTransfer.getData("targetGuildUID");
  const guildID = ev.dataTransfer.getData("targetGuildID");
  const folderKey = ev.dataTransfer.getData("targetFolderKey");

  if (!guildUID || !guildID) {
    return;
  }

  if (folderKey) {
    await removeGroupFromFolder(guildUID, guildID, folderKey, true);
  }

  addGroupToFolder(guildUID, guildID, `${folderName}<${folderID}`, true);
}

$(`#serverListNonFolders`).get(0).ondrop = async ev => {
  const guildUID = ev.dataTransfer.getData("targetGuildUID");
  const guildID = ev.dataTransfer.getData("targetGuildID");
  const folderKey = ev.dataTransfer.getData("targetFolderKey");

  if (!guildUID || !guildID) {
    return;
  }

  if (folderKey) {
    await removeGroupFromFolder(guildUID, guildID, folderKey, true);
  }
};

function expandGuildFolder(folderID) {
  const hidden = $(`#guildFolderContent${folderID}`).get(0).getAttribute('style') == '';

  if (hidden) {
    $(`#guildFolderContent${folderID}`).removeClass('hidden');
    $(`#guildFolderContent${folderID}`).removeClass('zeroHeight');
    const naturalHeight = $(`#guildFolderContent${folderID}`).height();
    $(`#guildFolderContent${folderID}`).addClass('zeroHeight');
    $(`#guildFolderContent${folderID}`).addClass('guildFolderContentActive');
    $(`#guildFolderContent${folderID}`).css(`height`, `${naturalHeight + 18}px`);
    $(`#chevron${folderID}`).removeClass('bx-chevron-down');
    $(`#chevron${folderID}`).addClass('bx-chevron-up');
    $(`#folder${folderID}`).addClass('folderFolderIconActive');
    $(`#folder${folderID}`).removeClass('bx-folder');
    $(`#folder${folderID}`).addClass('bx-folder-open');
    $(`#${folderID}Button`).addClass('guildFolderActive');
  } else {
    $(`#guildFolderContent${folderID}`).get(0).setAttribute('style', '');
    $(`#chevron${folderID}`).addClass('bx-chevron-down');
    $(`#chevron${folderID}`).removeClass('bx-chevron-up');
    $(`#folder${folderID}`).removeClass('folderFolderIconActive');
    $(`#folder${folderID}`).removeClass('bx-folder-open');
    $(`#folder${folderID}`).addClass('bx-folder');
    $(`#guildFolderContent${folderID}`).removeClass('guildFolderContentActive');
    $(`#${folderID}Button`).removeClass('guildFolderActive');
  }
}

function buildGroup(guildUID, guildID, guildMeta) {
  const a = document.createElement('div');
  a.id = `${guildUID}${guildID}Server`;
  a.setAttribute('guildUID', guildUID);
  a.setAttribute('guildID', guildID);
  a.setAttribute('class', `server ${guildID}ServerIcon imageServer animated zoomIn hidden`);
  a.draggable = true;

  a.ondragstart = ev => {
    ev.dataTransfer.setData("targetGuildUID", guildUID);
    ev.dataTransfer.setData("targetGuildID", guildID);
    ev.dataTransfer.setData("targetFolderKey", '');
  };

  let serverMuted = '';

  if (mutedServers.includes(guildUID + guildID)) {
    serverMuted = 'mutedNotification';
  }

  if (guildMeta.exists()) {
    if (guildMeta.data().url) {
      a.style.backgroundImage = `url('${guildMeta.data().url}')`;

      if (addPendingIndicator[`${guildUID}${guildID}`]) {
        a.innerHTML = `<div id="${guildUID}${guildID}serverNotification" class="serverNotification animated zoomIn ${serverMuted}"></div>`;
      } else {
        a.innerHTML = `<div id="${guildUID}${guildID}serverNotification" class="serverNotification animated hidden ${serverMuted}"></div>`;
      }
    } else {
      a.setAttribute('style', '');

      if (addPendingIndicator[`${guildUID}${guildID}`]) {
        a.innerHTML = `<i class="bx bx-group"></i><div id="${guildUID}${guildID}serverNotification" class="serverNotification animated zoomIn ${serverMuted}"></div>`;
      } else {
        a.innerHTML = `<i class="bx bx-group"></i><div id="${guildUID}${guildID}serverNotification" class="serverNotification animated hidden ${serverMuted}"></div>`;
      }
    }
  } else {
    a.setAttribute('style', '');
    a.innerHTML = `<i class="bx bx-trash-alt animated zoomIn slower"></i><div id="${guildUID}${guildID}serverNotification" class="serverNotification animated ${serverMuted}"></div>`;
  }

  if (!$(`#${guildUID}${guildID}Server`).length) {
    if (guildMeta.exists()) {
      serverData[guildUID + guildID] = guildMeta.data();
      createNotificationsListener(guildUID, guildID);

      a.onclick = () => openServer(guildUID, guildID);

      $('#serverListNonFolders').get(0).appendChild(a);
      tippy($(`#${guildUID}${guildID}Server`).get(0), {
        content: guildMeta.data().name
      });
    } else {
      a.onclick = () => clearServer(guildUID, guildID);

      $('#serverListNonFolders').get(0).appendChild(a);
      tippy($(`#${guildUID}${guildID}Server`).get(0), {
        content: 'Deleted Group'
      });
    }
  }

  window.setTimeout(() => {
    $(`#${guildUID}${guildID}Server`).removeClass('animated');
  }, 999);
  firstLog[guildUID + guildID] = true;
}

function openSpecialServer(id) {
  if (currentServer == id) {
    if (currentServer == 'music') {
      editorModePlaylist ? (0, _library.exitEditorModePlaylist)(editorModePlaylist) : null;
    }

    return;
  }

  try {
    endBroadListener();
  } catch (e) {}

  ;

  try {
    playlistListener();
  } catch (e) {}

  ;

  try {
    (0, _database.off)((0, _database.query)((0, _database.ref)(rtdb, voiceChatRef)));
    voiceChatRef = '';
  } catch (e) {}

  ;

  try {
    (0, _database.off)((0, _database.query)((0, _database.ref)(rtdb, activeMessageListener)));
    activeMessageListener = '';
  } catch (e) {}

  ;

  try {
    (0, _database.off)((0, _database.query)((0, _database.ref)(rtdb, activePinnedListener)));
    activePinnedListener = '';
  } catch (e) {}

  ;

  try {
    activeReadListener();
  } catch (e) {}

  ;
  $('#specialFullViewContent').removeClass('hidden');
  $('#nonSpecialContent').addClass('hidden');
  $('.view').addClass('hidden');
  $(`#${id}ServerView`).removeClass('hidden');
  $(`.serverActive`).removeClass('serverActive');
  $(`#${id}Server`).addClass('serverActive');
  $('#pfpseudoelement').addClass('hidden');

  if (id === 'account') {
    $('#pfpseudoelement').removeClass('hidden'); // Fix display bug
  }

  if (id === 'music') {
    (0, _music.loadMusic)();
    (0, _display.hidePlaybackButton)();
    (0, _display.closeModal)(); // Incase coming from user modal

    editorModePlaylist ? (0, _library.exitEditorModePlaylist)(editorModePlaylist) : null;
  } else {
    try {
      (0, _display.showPlaybackButton)();
    } catch (error) {}
  }

  currentServerUser = '';
  currentServer = '';
  currentChannel = '';

  if (id === 'friends' && currentServer !== 'friends') {
    // Check which channel is currently being displayed.
    if ($('#friendViewRight').children().not('.hidden').length) {
      const userID = $('#friendViewRight').children().not('.hidden').get(0).id.split('friend')[0];
      (0, _friends.addDMListeners)(userID);
      (0, _friends.markDMRead)(userID);
      $(`#${userID}ChatMessageInput`).get(0).focus();
      currentChannel = userID;
    }

    (0, _friends.friendsTab)('friends', $(`#friendsTabFriendsButton`).get(0));
  } else if (id === 'music' ** currentServer !== 'music') {
    (0, _music.clearMusicViews)('search');
    currentChannel = activeMusicTab;
  }

  currentServer = id;
}

async function openServer(guildUID, guildID) {
  if (currentServer == guildID && currentServerUser == guildUID) {
    return;
  }

  currentServerUser = guildUID;
  currentServer = guildID;
  (0, _display.showPlaybackButton)();

  try {
    endBroadListener();
  } catch (e) {}

  ;

  try {
    playlistListener();
  } catch (e) {}

  ;

  try {
    (0, _database.off)((0, _database.query)((0, _database.ref)(rtdb, voiceChatRef)));
    voiceChatRef = '';
  } catch (e) {}

  ;

  try {
    (0, _database.off)((0, _database.query)((0, _database.ref)(rtdb, activeMessageListener)));
    activeMessageListener = '';
  } catch (e) {}

  ;

  try {
    (0, _database.off)((0, _database.query)((0, _database.ref)(rtdb, activePinnedListener)));
    activePinnedListener = '';
  } catch (e) {}

  ;

  try {
    activeReadListener();
  } catch (e) {}

  ; // UI

  $(`.serverActive`).removeClass('serverActive');
  $(`#${guildUID + guildID}Server`).addClass('serverActive');
  $('#specialFullViewContent').addClass('hidden');
  $('#nonSpecialContent').removeClass('hidden');
  $('#pfpseudoelement').addClass('hidden');
  $('.serverView').addClass('hidden');

  if ($(`#${guildUID + guildID}View`).length) {
    // Element exists.
    $('.serverView').addClass('hidden');
    $(`#${guildUID + guildID}View`).removeClass('hidden');
  } else {
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
            <button id="${guildUID}${guildID}HomeIcon" class="animated btn b-0 roundedButton"> <i class="bx bx-home"></i> </button>
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
            <button onclick="newGuildChannel('${guildUID}', '${guildID}')" class="btn b-3 roundedButton hidden" id="${guildUID}${guildID}guildAddChannelButton"> <i class="bx bx-plus-circle"></i> </button>
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
    `;
    a.id = `${guildUID}${guildID}View`;
    $('#nonSpecialContent').get(0).appendChild(a);
    (0, _display.displayInputEffect)();
    tippy($(`#${guildUID}${guildID}InviteIcon`).get(0), {
      placement: 'bottom',
      content: 'Copy Invite Link'
    });
    tippy($(`#${guildUID}${guildID}HomeIcon`).get(0), {
      placement: 'bottom',
      content: 'Home'
    });
    tippy($(`#${guildUID}${guildID}MutedStatus`).get(0), {
      placement: 'bottom',
      content: 'Mute Group'
    });
    tippy($(`#${guildUID}${guildID}guildSettingsIcon`).get(0), {
      placement: 'bottom',
      content: 'Group Settings'
    });
    tippy($(`#${guildUID}${guildID}privateInfo`).get(0), {
      placement: 'top',
      content: 'Members will require approval to join.'
    });
    tippy($(`#${guildUID}${guildID}guildAddChannelButton`).get(0), {
      placement: 'top',
      content: 'New Lounge'
    });
    tippy($(`#${guildUID}${guildID}guildSearchMembersButton`).get(0), {
      placement: 'top',
      content: 'Search Members'
    });
    tippy($(`#${guildUID}${guildID}closeGuildSearchMembersButton`).get(0), {
      placement: 'top',
      content: 'Close Search'
    });
    tippy($(`#${guildUID}${guildID}newGroupIconButton`).get(0), {
      placement: 'top',
      content: 'Upload Icon'
    });
    tippy($(`#${guildUID}${guildID}removeGroupIconButton`).get(0), {
      placement: 'top',
      content: 'Remove Icon'
    });
    tippy($(`#${guildUID}${guildID}EndCallButton`).get(0), {
      placement: 'top',
      content: 'Leave Voice'
    });
    tippy($(`#voiceChatButtonMute${guildUID}${guildID}`).get(0), {
      placement: 'top',
      content: 'Mute'
    });
    tippy($(`#voiceChatButtonDeafen${guildUID}${guildID}`).get(0), {
      placement: 'top',
      content: 'Deafen'
    });
    tippy($(`#voiceChatButtonVideo${guildUID}${guildID}`).get(0), {
      placement: 'top',
      content: 'Stream Video'
    });
    tippy($(`#voiceChatButtonScreen${guildUID}${guildID}`).get(0), {
      placement: 'top',
      content: 'Stream Screen'
    });
  }

  $(`#${guildUID}${guildID}HomeIcon`).get(0).onclick = () => {
    (0, _channels.closeCurrentChannel)();
    $(`#${guildUID}${guildID}Home`).removeClass('hidden');
    $(`#${guildUID}${guildID}Home`).addClass(`${guildUID}${guildID}guildChannelViewActive`);
  };

  if (cacheUser.mutedServers && cacheUser.mutedServers.includes(`${guildUID}${guildID}`)) {
    $(`#${guildUID}${guildID}MutedStatus`).html('<i class="bx bx-bell-off"></i>');

    $(`#${guildUID}${guildID}MutedStatus`).get(0).onclick = () => unmuteServer(guildUID, guildID);

    $(`#${guildUID}${guildID}MutedStatus`).get(0)._tippy.setContent('Unmute Group');
  } else {
    $(`#${guildUID}${guildID}MutedStatus`).html('<i class="bx bx-bell"></i>');

    $(`#${guildUID}${guildID}MutedStatus`).get(0).onclick = () => muteServer(guildUID, guildID);

    $(`#${guildUID}${guildID}MutedStatus`).get(0)._tippy.setContent('Mute Group');
  }

  runOnOpen[guildUID + guildID] = true;
  endBroadListener = (0, _firestore.onSnapshot)((0, _firestore.doc)(db, `users/${guildUID}/servers/${guildID}`), async snapshot => {
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
    memberChangeForward = (0, _display.commonArrayDifference)(snapshot.data().members, serverData[`${guildUID}${guildID}`].members);
    memberChangeBackward = (0, _display.commonArrayDifference)(serverData[`${guildUID}${guildID}`].members, snapshot.data().members);
    let staffChangeForward = [];
    let staffChangeBackward = [];

    if (serverData[guildUID + guildID].staff) {
      // Account for old guilds.
      staffChangeForward = (0, _display.commonArrayDifference)(snapshot.data().staff, serverData[`${guildUID}${guildID}`].staff);
      staffChangeBackward = (0, _display.commonArrayDifference)(serverData[`${guildUID}${guildID}`].staff, snapshot.data().staff);
    } else {
      serverData[guildUID + guildID].staff = [];
    }

    let channelChangeForward = (0, _display.commonArrayDifference)(snapshot.data().channels, serverData[`${guildUID}${guildID}`].channels);
    let channelChangeBackward = (0, _display.commonArrayDifference)(serverData[`${guildUID}${guildID}`].channels, snapshot.data().channels);

    if (serverData[`${guildUID}${guildID}`].channels.length == snapshot.data().channels.length) {
      channelChangeForward = [];
      channelChangeBackward = [];
    }

    let incomingRequestForward = [];
    let incomingRequestBackward = [];

    if (serverData[`${guildUID}${guildID}`].owner == user.uid || serverData[`${guildUID}${guildID}`].staff.includes(user.uid)) {
      incomingRequestForward = (0, _display.commonArrayDifference)(snapshot.data().incomingRequests, serverData[`${guildUID}${guildID}`].incomingRequests);
      incomingRequestBackward = (0, _display.commonArrayDifference)(serverData[`${guildUID}${guildID}`].incomingRequests, snapshot.data().incomingRequests);
    }

    console.log(incomingRequestForward);
    console.log(incomingRequestBackward);
    let change = diff(serverData[`${guildUID}${guildID}`], snapshot.data());
    const channelDataChanged = serverData[guildUID + guildID].channelData != snapshot.data().channelData;
    serverData[`${guildUID}${guildID}`] = snapshot.data();

    if (firstLog[`${guildUID}${guildID}`]) {
      change = serverData[`${guildUID}${guildID}`];
      staffChangeForward = snapshot.data().staff;
      channelChangeForward = snapshot.data().channels;
      memberChangeForward = snapshot.data().members;
      incomingRequestForward = snapshot.data().incomingRequests;
      incomingRequestBackward = [];
    } // Go through changes!


    if (change.name) {
      $(`#${guildUID}${guildID}Server`).get(0)._tippy.setContent((0, _display.securityConfirmText)(change.name));

      $(`#${guildUID}${guildID}GuildTopName`).html((0, _display.securityConfirmText)(change.name));
      $(`#${guildUID}${guildID}HomeTitle`).html((0, _display.securityConfirmText)(change.name));
      $(`#${guildUID}${guildID}newGroupName`).html((0, _display.securityConfirmText)(change.name));
    } // Date created


    $(`#${guildUID}${guildID}DateCreated`).html(`Created ${snapshot.data().dateCreated ? timeago.format(snapshot.data().dateCreated.toDate()) : "before the dawn of time"}`); // Private

    $(`#${guildUID}${guildID}Private`).html('Public');
    $(`#privateGroupCheck${guildUID}${guildID}`).get(0).checked = serverData[`${guildUID}${guildID}`].isPrivate;

    if (serverData[`${guildUID}${guildID}`].isPrivate) {
      $(`#${guildUID}${guildID}Private`).html('Private');
    } // Muted


    let serverMuted = '';

    for (let i = 0; i < mutedServers.length; i++) {
      if (mutedServers[i] == guildUID + guildID) {
        serverMuted = 'mutedNotification';
        break;
      }
    }

    if (serverData[`${guildUID}${guildID}`].url) {
      $(`#${guildUID}${guildID}Server`).get(0).style.backgroundImage = `url('${serverData[guildUID + guildID].url}')`;

      if (addPendingIndicator[`${guildUID}${guildID}`]) {
        $(`#${guildUID}${guildID}serverNotification`).addClass(serverMuted);
        $(`#${guildUID}${guildID}serverNotification`).addClass('zoomIn');
      } else {
        $(`#${guildUID}${guildID}Server`).html(`<div id="${guildUID}${guildID}serverNotification" class="serverNotification animated hidden ${serverMuted}"></div>`);
      }

      $(`#${guildUID}${guildID}newIconPhoto`).get(0).style.backgroundImage = `url('${serverData[guildUID + guildID].url}')`;
      $(`#${guildUID}${guildID}newIconPhoto`).html('');
      $(`#${guildUID}${guildID}GuildTopIcon`).get(0).style.backgroundImage = `url('${serverData[guildUID + guildID].url}')`;
      $(`#${guildUID}${guildID}GuildTopIcon`).html('');
      $(`#${guildUID}${guildID}GuildTopIconImg`).off();
      $(`#${guildUID}${guildID}GuildTopIconImg`).get(0).setAttribute('crossOrigin', '');
      $(`#${guildUID}${guildID}GuildTopIconImg`).addClass('hidden');
      $(`#${guildUID}${guildID}GuildTopIconImg`).bind('load', function () {
        const colors = colorThief.getColor($(`#${guildUID}${guildID}GuildTopIconImg`).get(0));
        $(`#${guildUID}${guildID}ProfileCard`).css('border-bottom', `10px solid rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, 1)`);
        $(`#${guildUID}${guildID}GuildTop`).css('border-bottom', `6px solid rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, 1)`);
        $(`#${guildUID}${guildID}GuildTopIcon`).html('');
        $(`#${guildUID}${guildID}GuildTopIcon`).addClass('notInvisible'); // Custom CSS for active channel color

        const targetServerCSS = `
          .${guildUID}${guildID}ServerIcon::before {
            background-color: rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, 1);
          }
          .${guildUID}${guildID}guildChannelActive {
            border-left: 5px solid rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, 1);
          }
        `;

        if (!$(`#${guildUID}${guildID}ThemeInjection`).length) {
          const a = document.createElement('style');
          a.id = `${guildUID}${guildID}ThemeInjection`;
          a.innerHTML = targetServerCSS;
          $('#serverCSSInjections').get(0).appendChild(a);
        } else {
          $(`#${guildUID}${guildID}ThemeInjection`).html(targetServerCSS);
        }
      });
      $(`#${guildUID}${guildID}GuildTopIconImg`).get(0).src = `${serverData[guildUID + guildID].url}`;
    } else {
      if (addPendingIndicator[`${guildUID}${guildID}`]) {
        $(`#${guildUID}${guildID}serverNotification`).addClass(serverMuted);
        $(`#${guildUID}${guildID}serverNotification`).addClass('zoomIn');
      } else {
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
    } // Incoming requests


    if (serverData[guildUID + guildID].owner == user.uid || serverData[guildUID + guildID].staff.includes(user.uid)) {
      for (let i = 0; i < incomingRequestForward.length; i++) {
        const incomingRequest = incomingRequestForward[i];
        buildMemberGuildRequestItem(guildUID, guildID, incomingRequest);
      }

      for (let i = 0; i < incomingRequestBackward.length; i++) {
        const incomingRequest = incomingRequestBackward[i];
        console.log('deleting');
        $(`#incomingGuildRequest${guildUID}${guildID}${incomingRequest.u}`).addClass('incomingGuildRequestGone');
        window.setTimeout(() => {
          $(`#incomingGuildRequest${guildUID}${guildID}${incomingRequest.u}`).remove();
        }, 1000);
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
    } else {
      $(`#${guildUID}${guildID}guildRequests`).removeClass('fadeIn');
      $(`#${guildUID}${guildID}guildRequests`).addClass('fadeOut');
      guildTimeouts[guildUID + guildID + `guildRequests`] = window.setTimeout(() => {
        $(`#${guildUID}${guildID}guildRequests`).addClass('hidden');
      }, 1000);
    } // Lounges / Channels


    for (let i = 0; i < channelChangeForward.length; i++) {
      const channelID = channelChangeForward[i].split('.')[0];
      const channelName = channelChangeForward[i].split('.')[1];
      buildGuildChannel(guildUID, guildID, channelID, channelName);
    }

    for (let i = 0; i < channelChangeBackward.length; i++) {
      const channelID = channelChangeBackward[i].split('.')[0];
      const channelName = channelChangeBackward[i].split('.')[1];
      $(`#${guildUID}${guildID}${channelID}guildChannel`).remove();
      $(`#${guildUID}${guildID}${channelID}guildChannelElement`).addClass('channelGone');
      window.setTimeout(() => {
        $(`#${guildUID}${guildID}${channelID}guildChannelElement`).remove();
      }, 1000);
    } // Reorder.


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
      const channelName = serverData[guildUID + guildID].channels[i].split('.')[1]; // Sidebar list.

      $(`#${guildUID}${guildID}${channelID}channeListName`).html(`${(0, _display.securityConfirmTextIDs)(channelName, true)}`);

      $(`#${guildUID}${guildID}${channelID}guildChannelElement`).get(0).onclick = () => {
        (0, _channels.openGuildChannel)(guildUID, guildID, channelID, channelName);
      };

      twemoji.parse($(`#${guildUID}${guildID}${channelID}channeListName`).get(0)); // Update channel elements *if it is a modified channel!*

      $(`#${guildUID}${guildID}${channelID}guildChannelViewTitle`).html((0, _display.securityConfirmTextIDs)(channelName, true)); // Title

      if ($(`#${guildUID}${guildID}${channelID}guildChannelViewTitle`).length) {
        twemoji.parse($(`#${guildUID}${guildID}${channelID}guildChannelViewTitle`).get(0));
      } // Update VC Active if connected:


      if (currentCall == `${guildUID}${guildID}/${channelID}`) {
        $(`#${guildUID}${guildID}VCConnectedText`).html((0, _display.securityConfirmTextIDs)(channelName, true));
      }
    }

    if (snapshot.data().channels.length) {
      $(`#${guildUID}${guildID}guildChannelNotice`).html('');
    } else {
      $(`#${guildUID}${guildID}guildChannelNotice`).html('<div class="notice">There are no lounges available.</div>');
    } // Member List (rebuilt)


    $(`#${guildUID}${guildID}MemberTitle`).html(`${serverData[guildUID + guildID].members.length} members`);

    for (let i = 0; i < memberChangeForward.length; i++) {
      buildMemberItem(guildUID, guildID, memberChangeForward[i], i);
    }

    for (let i = 0; i < memberChangeBackward.length; i++) {
      $(`#${guildUID}${guildID}${memberChangeBackward[i].split('.')[1]}guildMemberElement`).addClass('guildMemberGone');
      window.setTimeout(() => {
        $(`#${guildUID}${guildID}${memberChangeBackward[i].split('.')[1]}guildMemberElement`).remove();
      }, 1001);
    } // Staff list (rebuilt)


    for (let i = 0; i < staffChangeForward.length; i++) {
      const userID = staffChangeForward[i];
      $(`#${guildUID}${guildID}${userID}userBadgeIcon`).removeClass('bx-user-pin');
      $(`#${guildUID}${guildID}${userID}userBadgeIcon`).addClass('bx-id-card');

      $(`#${guildUID}${guildID}${userID}userBadgeIcon`).get(0)._tippy.setContent('Staff');

      $(`#${guildUID}${guildID}${userID}guildMemberElement`).appendTo(`#${guildUID}${guildID}guildMemberListStaff`);
    }

    if (staffChangeForward.length) {
      // Sort staff list.
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

    if (staffChangeBackward.length) {
      // Sort member list.
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
    } else {
      $(`#${guildUID}${guildID}${user.uid}guildMemberElement`).removeClass('hiddenImportant');
      $(`#${guildUID}${guildID}NumMembers`).html(`${serverData[guildUID + guildID].members.length} members`);
      $(`#${guildUID}${guildID}guildMemberNotice`).html(``);
    } // Permissions


    if (currentChannel && currentChannel !== currentServer + 'settings' && currentChannel !== currentServer + 'Home') {
      // A channel is selected
      (0, _channels.reevaluatePermissionsChannel)(guildUID, guildID, currentChannel);
    }

    if (channelDataChanged) {
      for (let i = 0; i < serverData[guildUID + guildID].channels.length; i++) {
        // Go through lounges.
        const channelID = serverData[guildUID + guildID].channels[i].split('.')[0];
        (0, _channels.updateLoungeTypes)(guildUID, guildID, channelID, serverData[guildUID + guildID].channelData ? serverData[guildUID + guildID].channelData[channelID] : {});
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
          onEnd: async () => {
            // Overwrite array.
            let newLoungeArray = [];
            $(`#${guildUID}${guildID}guildChannelList`).children('.guildChannel').each((i, obj) => {
              const name = $(obj).children().last().html();
              const id = $(obj).attr('channelid');
              newLoungeArray.push(`${id}.${name}`);
            });
            await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${guildUID}/servers/${guildID}`), {
              channels: newLoungeArray
            });
          }
        });
      }
    } else {
      $(`#${guildUID}${guildID}deleteCard`).addClass('hidden');
      $(`#${guildUID}${guildID}guildAddChannelButton`).addClass('hidden');
      $(`#${guildUID}${guildID}guildSettingsIcon`).addClass('hidden');

      if (loungeReorderSetup[guildUID + guildID]) {
        // Remove it.
        try {
          sortableLibrary[guildUID + guildID].destroy();
        } catch (error) {
          console.log('Sortable destroy error occured.');
        }
      }

      sortableLibrary[guildUID + guildID] = null;
      loungeReorderSetup[guildUID + guildID] = null;

      if (currentChannel == guildID + 'settings') {
        (0, _channels.closeCurrentChannel)();
      }
    }

    if (runOnOpen[guildUID + guildID]) {
      runOnOpen[guildUID + guildID] = false; // Will only run when the guild is clicked. Not when is refreshed.
      // Check which channel is currently being displayed.
      // TO DO: get it working.

      if ($(`.${guildUID}${guildID}guildChannelActive`).length) {
        const channelID = $(`.${guildUID}${guildID}guildChannelActive`).get(0).getAttribute('channelID');
        currentChannel = channelID; // Mark as read.

        if (channelTabLibrary[`${guildUID}${guildID}${channelID}`] == 'Chat') {
          (0, _channels.markChannelAsRead)(guildUID, guildID, channelID);
          $(`#${guildUID}${guildID}${channelID}ChatMessageInput`).get(0).focus();
        } // Re-engage listeners.


        (0, _channels.addChannelListeners)(guildUID, guildID, channelID, true);
        (0, _voice.manageVoiceChatDisplay)(guildUID, guildID, channelID, undefined);
      } // Only setup listener after everything is finished.


      if (voiceChatRef !== `voice/${guildUID}${guildID}`) {
        try {
          if (voiceChatRef) {
            (0, _database.off)((0, _database.query)((0, _database.ref)(rtdb, voiceChatRef)));
          }
        } catch (error) {}

        voiceChatRef = `voice/${guildUID}${guildID}`;
        (0, _database.onValue)((0, _database.query)((0, _database.ref)(rtdb, voiceChatRef)), snapshot => {
          (0, _voice.manageVoiceChatDisplay)(guildUID, guildID, undefined, snapshot.val());
        });
      } else {
        console.log('Skipping VC Ref listener. Already set.');
      }
    }

    if (firstLog[guildUID + guildID]) {
      // One-time setup
      $(`#${guildUID}${guildID}${guildUID}userBadgeIcon`).removeClass('bx-user-pin');
      $(`#${guildUID}${guildID}${guildUID}userBadgeIcon`).addClass('bx-crown');

      $(`#${guildUID}${guildID}${guildUID}userBadgeIcon`).get(0)._tippy.setContent('Owner');

      firstLog[guildUID + guildID] = false;
    }
  });
}

function buildGuildChannel(guildUID, guildID, channelID, channelName) {
  // Redone
  let iconSnippet = `<i id="${guildUID}${guildID}${channelID}sidebarIcon" class="bx bx-hash">`;
  let channelNoAccess = false; // Staff will always be able to see all channels.

  const a = document.createElement('div');
  a.setAttribute('class', `sidebarButton guildChannel ${currentChannel == channelID ? guildUID + guildID + 'guildChannelActive' : ''} ${guildUID + guildID}guildChannel ${mutedServers.includes(`${guildUID}${guildID}${channelID}`) ? 'mutedChannelNotification' : ''}`);
  a.setAttribute('guildUID', guildUID);
  a.setAttribute('guildID', guildID);
  a.setAttribute('channelID', channelID);
  a.setAttribute('channelName', channelName);
  $(`#${guildUID}${guildID}${channelID}guildChannelElement`).remove();
  a.id = `${guildUID}${guildID}${channelID}guildChannelElement`;

  a.onclick = () => (0, _channels.openGuildChannel)(guildUID, guildID, channelID, channelName);

  a.innerHTML = `${iconSnippet}</i>
    <div class="channelNotify animated invisible" id="${guildUID}${guildID}${channelID}channelNotify"></div> 
    <div class="sidebarText" id="${guildUID}${guildID}${channelID}channeListName">${(0, _display.securityConfirmTextIDs)(channelName, true)}</div>
  `;
  $(`#${guildUID}${guildID}guildChannelList`).get(0).appendChild(a);
  twemoji.parse($(`#${guildUID}${guildID}${channelID}channeListName`).get(0));
  const b = document.createElement('div');
  $(`#${guildUID}${guildID}${channelID}guildChannel`).remove();
  b.id = `${guildUID}${guildID}${channelID}guildChannel`;
  b.setAttribute('class', `guildChannelView ${currentChannel == channelID ? '' : 'hidden'}`);

  if (!$(`#${b.id}`).length) {
    $(`#sidebarRight${guildUID}${guildID}`).get(0).appendChild(b);
  }

  checkIndicator(guildUID, guildID, channelID);
}

window.updateGuildPrivacy = async (guildUID, guildID) => {
  if ($(`#privateGroupCheck${guildUID}${guildID}`).get(0).checked == serverData[guildUID + guildID].isPrivate) {
    snac('Nothing Changed', 'This setting has already been applied.');
    return;
  }

  $(`#privateGroupCheck${guildUID}${guildID}`).addClass('disabled');
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${guildUID}/servers/${guildID}`), {
    isPrivate: $(`#privateGroupCheck${guildUID}${guildID}`).get(0).checked
  });
  snac('Group Privacy Updated', '', 'success');
  await (0, _display.timer)(3500);
  $(`#privateGroupCheck${guildUID}${guildID}`).removeClass('disabled');
};

window.acceptGuildRequest = async (guildUID, guildID, userID, targetUserName) => {
  (0, _display.disableButton)($(`#acceptButton${guildUID}${guildID}${userID}`));
  $(`#rejectButton${guildUID}${guildID}${userID}`).get(0).setAttribute('onclick', '');
  const acceptGuildRequest = (0, _functions.httpsCallable)(functions, "acceptGuildRequest");
  const result = await acceptGuildRequest({
    guildUID: guildUID,
    guildID: guildID,
    userID: userID,
    username: targetUserName
  });
};

window.rejectGuildRequest = async (guildUID, guildID, userID, targetUserName) => {
  $(`#acceptButton${guildUID}${guildID}${userID}`).get(0).setAttribute('onclick', '');
  (0, _display.disableButton)($(`#rejectButton${guildUID}${guildID}${userID}`));
  const rejectGuildRequest = (0, _functions.httpsCallable)(functions, "rejectGuildRequest");
  const result = await rejectGuildRequest({
    guildUID: guildUID,
    guildID: guildID,
    userID: userID,
    username: targetUserName
  });
};

async function buildMemberGuildRequestItem(guildUID, guildID, incomingRequest) {
  console.log(guildUID, guildID, incomingRequest);
  const a = document.createElement('div');
  a.setAttribute('class', 'guildMemberIncomingContainer');
  a.id = `incomingGuildRequest${guildUID}${guildID}${incomingRequest.u}`;
  a.innerHTML = `
    <div onclick="openUserCard('${incomingRequest.u}')" userID="${incomingRequest.u}" class="guildMember userContextItem">
      <div class="incomingGuildFlexLeft"><img id="${guildUID}${guildID}incomingGuild${incomingRequest.u}request" src="${await (0, _display.returnProperURL)(incomingRequest.u)}" /> <span>${incomingRequest.n.capitalize()}</span></div>
    </div>
    <button id="acceptButton${guildUID}${guildID}${incomingRequest.u}" onclick="acceptGuildRequest('${guildUID}', '${guildID}', '${incomingRequest.u}', '${incomingRequest.n}')" class="btn btnAccept"><i class='bx bx-check'></i></button>
    <button id="rejectButton${guildUID}${guildID}${incomingRequest.u}" onclick="rejectGuildRequest('${guildUID}', '${guildID}', '${incomingRequest.u}', '${incomingRequest.n}')" class="btn btnReject"><i class='bx bx-x' ></i></button>
  `;
  $(`#${guildUID}${guildID}guildRequestsContainer`).get(0).appendChild(a);
  console.log($(`#${guildUID}${guildID}guildRequestsContainer`));
  (0, _display.displayImageAnimation)(`${guildUID}${guildID}incomingGuild${incomingRequest.u}request`);
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
  } else {
    $(`#${guildUID}${guildID}guildMemberListAll`).get(0).appendChild(a);
  } // Tooltip:


  tippy($(`#${guildUID}${guildID}${userID}userBadgeIcon`).get(0), {
    placement: 'top',
    content: 'Member'
  });
  $(`#${guildUID}${guildID}${userID}SmallImage`).attr('src', await (0, _display.returnProperURL)(userID));
  (0, _display.displayImageAnimation)(`${guildUID}${guildID}${userID}SmallImage`);
  tippy($(`#${guildUID}${guildID}${userID}PresenceIndicator`).get(0), {
    content: '',
    placement: 'top',
    onTrigger: () => (0, _presence.showTippyListenerPresence)(userID, $(`#${guildUID}${guildID}${userID}PresenceIndicator`))
  }); // Prepare tooltip for 'online' | 'offline' | 'last online x days ago'

  (0, _presence.updatePresenceForUser)(userID);
}

async function loadOutgoingServerRequests() {
  if (!cacheUser.outgoingGuilds || !cacheUser.outgoingGuilds.length) {
    cacheUser.outgoingGuilds = [];
    $('#outgoingGuildRequests').empty();
    $('#pendingRequestsLength').removeClass('hidden');
    return;
  }

  if (outgoingGuilds == cacheUser.outgoingGuilds) {
    return; // No changes. No need to update.
  }

  outgoingGuilds = cacheUser.outgoingGuilds;
  $('#pendingRequestsLength').addClass('hidden');
  $('#outgoingGuildRequests').empty();

  for (let i = 0; i < outgoingGuilds.length; i++) {
    const outgoingGuild = outgoingGuilds[i];

    const imageValid = () => {
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
      });
    };

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
    `;
    $('#outgoingGuildRequests').get(0).appendChild(a);
  }
}

window.cancelOutgoingGuildRequest = async (targetUID, targetID, targetName) => {
  (0, _display.disableButton)($(`#cancelRequestButton${targetID}`));
  const cancelRequestJoinGuild = (0, _functions.httpsCallable)(functions, "cancelRequestJoinGuild");
  const result = await cancelRequestJoinGuild({
    targetUID: targetUID,
    targetGuild: targetID,
    targetName: targetName
  });
  snac('Cancelled Request...', '', 'success');
};

function createGroup() {
  (0, _display.openModal)('createGroup');
  tippy('#privateInfo', {
    content: 'Members require approval to join.',
    placement: 'top'
  });

  $(`#newGroupCreateButton`).get(0).onclick = async () => {
    const groupName = (0, _display.securityConfirmTextIDs)($(`#newGroupName`).val(), true).trim();

    if (groupName.length > 35) {
      snac('Group Name Error', 'Group name must be 35 characters or less.', 'danger');
      return;
    }

    if (!groupName.length) {
      snac('Group Name Error', 'Group name cannot be empty.', 'danger');
      return;
    }

    (0, _display.closeModal)(); // Approved

    const isPrivate = $('#privateGroupCheck').get(0).checked;
    const ref = await (0, _firestore.addDoc)((0, _firestore.collection)(db, `users/${user.uid}/servers`), {
      name: groupName,
      owner: user.uid,
      dateCreated: (0, _firestore.serverTimestamp)(),
      channels: [],
      channelData: {},
      members: [`${cacheUser.username}.${user.uid}`],
      incomingRequests: [],
      isPrivate: isPrivate,
      staff: []
    });
    await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}/servers/${ref.id}`), {
      id: ref.id
    });
    await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
      guilds: (0, _firestore.arrayUnion)(`${user.uid}.${ref.id}`)
    });
    snac('Group Created', '', 'success');
  };
}

function createGroupFolder(groupUID, groupID) {
  (0, _display.openModal)('createGroupFolder');

  $(`#newGroupFolderCreateButton`).get(0).onclick = () => {
    const folderName = (0, _display.securityConfirmTextIDs)($(`#newGroupFolderName`).val().trim(), true).replaceAll(`<`, '');
    const folderID = new Date().getTime();
    confirmGroupFolder(folderName, folderID, groupUID, groupID);
  };
}

async function addGroupToFolder(groupUID, groupID, folderKey, unHide) {
  const folderName = folderKey.split('<')[0];
  const folderID = folderKey.split('<')[1];

  if (!unHide) {
    // If hidden, its hidden so no need.
    $(`#${groupUID}${groupID}Server`).addClass('serverGone');
    await (0, _display.timer)(500);
  }

  $(`#${groupUID}${groupID}Server`).get(0).setAttribute('inFolder', `${folderName}<${folderID}`);
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
    [`guildFolders.${folderName}<${folderID}`]: (0, _firestore.arrayUnion)(`${groupUID}.${groupID}`)
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

async function removeGroupFromFolder(groupUID, groupID, folderKey, hide) {
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
      await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
        [`guildFolders.${folderKey}`]: (0, _firestore.arrayRemove)(`${groupUID}.${groupID}`)
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

  (0, _display.closeModal)(); // Approved

  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
    [`guildFolders.${folderName}<${folderID}`]: [],
    guildFoldersSort: (0, _firestore.arrayUnion)(folderID)
  });
  snac('Folder Created', '', 'success');

  if (groupUID && groupID) {
    addGroupToFolder(groupUID, groupID, `${folderName}<${folderID}`);
  }
}

function joinGroup() {
  (0, _display.openModal)('joinGroup');

  $(`#joinGroupButton`).get(0).onclick = async () => {
    const inviteCode = $(`#inviteCodeField`).val().trim();

    if (!inviteCode.length) {
      snac('Invite Code Error', 'Invite code cannot be empty.', 'danger');
      return;
    }

    (0, _display.disableButton)($(`#joinGroupButton`));
    $('#inviteCodeField').val('');
    let invite;

    if (inviteCode.includes('inv:')) {
      invite = inviteCode.split('inv:')[1].split('.');
    } else {
      invite = inviteCode.split('.');
    }

    if (cacheUser.guilds.includes(`${invite[0]}.${invite[1]}`)) {
      snac('Join Error', 'You are already part of this group.', 'danger');
      window.setTimeout(() => {
        (0, _display.enableButton)($(`#joinGroupButton`), 'join');
      }, 499);
      return;
    }

    (0, _display.closeModal)();
    const serverMeta = await (0, _firestore.getDoc)((0, _firestore.doc)(db, `users/${invite[0]}/servers/${invite[1]}`));

    if (!serverMeta.exists()) {
      snac('Join Error', 'Your invitation code is invalid.', 'danger');
      window.setTimeout(() => {
        (0, _display.enableButton)($(`#joinGroupButton`), 'join');
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
          (0, _display.enableButton)($(`#joinGroupButton`), 'join');
        }, 499);
        return;
      }

      notifyTiny('Sending join request...', true);
      const requestJoinGuild = (0, _functions.httpsCallable)(functions, "requestJoinGuild");
      const result = await requestJoinGuild({
        targetUID: invite[0],
        targetGuild: invite[1]
      });
      snac('Request Sent', '', 'success');
    } else {
      notifyTiny('Joining group...', true);
      const joinGuild = (0, _functions.httpsCallable)(functions, "joinGuild");
      const result = await joinGuild({
        inviteUser: invite[0],
        inviteGuild: invite[1]
      });
      snac('Joined Group', '', 'success');
    }
  };
}

function leaveServer(guildUID, guildID) {
  return new Promise(async (resolve, reject) => {
    if (currentServerUser == guildUID && currentServer == guildID) {
      openSpecialServer('friends');
    }

    $(`#${guildUID}${guildID}Server`).get(0).onclick = () => {
      console.log('No Action.');
    };

    $(`#${guildUID}${guildID}Server`).addClass('groupLeavingServerUI');
    const leaveGuild = (0, _functions.httpsCallable)(functions, "leaveGuild");
    const result = await leaveGuild({
      targetUID: guildUID,
      targetID: guildID
    });
    snac('Left Group', '', 'success');
    resolve(true);
  });
} // Heavy on server listeners. Create a notifications/unread listener 
// ...for each server on a dedicated index that gets updated on each
// message so all connected clients can be notified and upon connecting,
// can tell when the last message was to determine if there is an
// unread dot. Constantly update the 'unread' doc with the latest date of
// activity so that it can be compared with the personal latest view date


async function createNotificationsListener(guildUID, guildID) {
  (0, _database.onValue)((0, _database.query)((0, _database.ref)(rtdb, `servers/${guildUID}${guildID}`)), snapshot => {
    if (!snapshot.val()) {
      console.log('No notifications snapshot for this server.. Probably because no messages.');
      return;
    }

    for (let [key, value] of Object.entries(snapshot.val())) {
      if (key == 'channelData') {
        continue;
      } // console.log(key, value)
      // Look at the key and value. Check if local copy of this notification is AFTER. ELSE.


      const serverTime = new Date(value); // Set date to 0 if the item does not exist (meaning that they have never entered that channel.)

      let localTime = new Date(0);

      if (typeof unreadIndicatorsData[`${guildUID}${guildID}${key}`] !== 'undefined') {
        try {
          localTime = unreadIndicatorsData[`${guildUID}${guildID}${key}`].toDate();
        } catch (error) {
          localTime = new Date(0);
        }
      }

      if (serverTime.getTime() > localTime.getTime() || serverTime.getTime() == localTime.getTime()) {
        // == If they're both 0. Happens when mark as unread with no messages.
        if (snapshot.val()['channelData'] && snapshot.val()['channelData'][key] && snapshot.val()['channelData'][key].disablePublicView) {
          if (serverData[guildUID + guildID].staff.includes(user.uid) || guildUID == user.uid) {
            addIndicator(guildUID, guildID, key);
          }
        } else {
          addIndicator(guildUID, guildID, key);
        }
      } else {
        removeIndicator(guildUID, guildID, key);
      }
    }

    window.setTimeout(() => {
      checkServerUnread(guildUID, guildID, snapshot.val()['channelData']);
    }, 99);
  });
  checkServerUnread(guildUID, guildID);
}

async function unreadIndicators() {
  return new Promise(async (resolve, reject) => {
    (0, _firestore.onSnapshot)((0, _firestore.doc)(db, `Unread/${user.uid}`), snapshot => {
      unreadIndicatorsData = snapshot.data();

      if (!unreadIndicatorsData) {
        unreadIndicatorsData = {};
      }
    });
    resolve(true);
  });
}

async function checkIndicator(guildUID, guildID, channelID) {
  if (addPendingIndicator[`${guildUID}${guildID}${channelID}`]) {
    addIndicator(guildUID, guildID, channelID);
  }
}

async function addIndicator(guildUID, guildID, channelID) {
  addPendingIndicator[`${guildUID}${guildID}${channelID}`] = true; // Must go first. Probably bad code.

  if ((0, _electron.returnIsElectron)()) {
    if (document.hasFocus()) {
      // All boxes checked for electron
      if (channelTabLibrary[`${guildUID}${guildID}${channelID}`] == 'Chat' && currentServer == guildID && currentChannel == channelID && guildUID == currentServerUser) {
        await (0, _channels.markChannelAsRead)(guildUID, guildID, channelID);
        return; // No need to add indicator
      }
    } else {
      // Can't detect window focus outside of desktop app. All other boxes checked though.
      if (channelTabLibrary[`${guildUID}${guildID}${channelID}`] == 'Chat' && currentServer == guildID && currentChannel == channelID && guildUID == currentServerUser) {
        markAsReadAfterFocus.type = 'channel';
        markAsReadAfterFocus.id = `${guildUID}.${guildID}.${channelID}`;
      }
    }
  } else {
    // All boxes checked for browser
    if (channelTabLibrary[`${guildUID}${guildID}${channelID}`] == 'Chat' && currentServer == guildID && currentChannel == channelID && guildUID == currentServerUser) {
      await (0, _channels.markChannelAsRead)(guildUID, guildID, channelID);
      return;
    }
  } // Confirmed add indicator.


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
    $(`#channelMarkButton${guildUID + guildID + channelID}`).html(`<i class="bx bx-notification-off"></i>`);

    $(`#channelMarkButton${guildUID + guildID + channelID}`).get(0)._tippy.setContent('Mark as Read');

    window.setTimeout(() => {
      $(`#channelMarkButton${guildUID + guildID + channelID}`).removeClass('disabled');

      $(`#channelMarkButton${guildUID + guildID + channelID}`).get(0).onclick = () => {
        (0, _channels.markChannelAsRead)(guildUID, guildID, channelID);
      };
    }, 999); // Cooldown for pressing button again. 
  }
}

function removeIndicator(guildUID, guildID, channelID) {
  addPendingIndicator[`${guildUID}${guildID}${channelID}`] = false;
  const JQEL = $(`#${guildUID}${guildID}${channelID}channelNotify`);
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
    $(`#channelMarkButton${guildUID + guildID + channelID}`).html(`<i class="bx bx-notification"></i>`);

    $(`#channelMarkButton${guildUID + guildID + channelID}`).get(0)._tippy.setContent('Mark as Unread');

    window.setTimeout(() => {
      $(`#channelMarkButton${guildUID + guildID + channelID}`).removeClass('disabled');

      $(`#channelMarkButton${guildUID + guildID + channelID}`).get(0).onclick = () => {
        (0, _channels.markChannelAsUnread)(guildUID, guildID, channelID);
      };
    }, 999); // Cooldown for pressing button again.
  }
}

function checkServerUnread(guildUID, guildID, channelDataInput) {
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
        if (serverData[guildUID + guildID].channelData && serverData[guildUID + guildID].channelData[channelID] && serverData[guildUID + guildID].channelData[channelID].disablePublicView && !serverData[guildUID + guildID].staff.includes(user.uid) && !serverData[guildUID + guildID].owner !== user.uid) {// No notification
        } else {
          serverRead = false;
          break; // No need to check other channels
        }
      }
    }
  }

  if (!serverRead) {
    makeServerUnread(guildUID, guildID);
  } else {
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
  JQEL.removeClass('hidden');

  if (valBefore == false) {
    // No indicator previously,
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
  checkFolderIndicator(guildUID, guildID);
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
  }, 699);

  if (force) {
    window.setTimeout(() => {
      JQEL.addClass('hidden');
    }, 1);
  }

  window.setTimeout(() => {
    sendToElectron('notificationBadges', $('.serverNotification:not(.hidden,.zoomOut,.invisible,.invisibleOpacity,.folderIndicator)').length);
  }, 199);
  checkFolderIndicator(guildUID, guildID);
}

window.checkFolderINdicator2 = (guildUID, guildID) => {
  checkFolderIndicator(guildUID, guildID);
};

function checkFolderIndicator(guildUID, guildID, folderIDInput) {
  let folderID;

  if (folderIDInput) {
    folderID = folderIDInput;
  } else {
    if (!$(`#${guildUID}${guildID}Server`).length) {
      return;
    }

    ; // Check which folder the server is in

    const folderKey = $(`#${guildUID}${guildID}Server`).get(0).getAttribute('inFolder');

    if (!folderKey) {
      return;
    }

    ;
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
  } else {
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

async function markServerRead(guildUID, guildID) {
  // Go through all lounges and mark as read.
  for (let i = 0; i < serverData[guildUID + guildID].channels.length; i++) {
    const channelID = serverData[guildUID + guildID].channels[i].split('.')[0];

    if (addPendingIndicator[`${guildUID}${guildID}${channelID}`]) {
      (0, _channels.markChannelAsRead)(guildUID, guildID, channelID);
    }
  }

  checkServerUnread(guildUID, guildID);
}

window.muteServer = async (guildUID, guildID, showNotification) => {
  $(`#${guildUID}${guildID}serverNotification`).addClass('mutedNotificationTransition');
  $(`#${guildUID}${guildID}serverNotification`).removeClass('zoomIn');
  $(`#${guildUID}${guildID}serverNotification`).addClass('zoomOut');
  $(`#${guildUID}${guildID}MutedStatus`).addClass('disabled');
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
    mutedServers: (0, _firestore.arrayUnion)(guildUID + guildID)
  });

  if (showNotification) {
    snac('Group Muted', '', 'success');
  }

  window.setTimeout(() => {
    $(`#${guildUID}${guildID}MutedStatus`).html('<i class="bx bx-bell-off"></i>');

    try {
      $(`#${guildUID}${guildID}MutedStatus`).get(0).onclick = () => unmuteServer(guildUID, guildID);

      $(`#${guildUID}${guildID}MutedStatus`).get(0)._tippy.setContent('Unmute Group');
    } catch (error) {}

    $(`#${guildUID}${guildID}MutedStatus`).removeClass('disabled');
    $(`#${guildUID}${guildID}serverNotification`).removeClass('mutedNotificationTransition');
  }, 500);
};

window.unmuteServer = async (guildUID, guildID, showNotification) => {
  $(`#${guildUID}${guildID}serverNotification`).addClass('mutedNotificationTransition');
  checkServerUnread(guildUID, guildID);
  $(`#${guildUID}${guildID}MutedStatus`).addClass('disabled');
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
    mutedServers: (0, _firestore.arrayRemove)(guildUID + guildID)
  });

  if (showNotification) {
    snac('Group Unmuted', '', 'success');
  }

  window.setTimeout(() => {
    $(`#${guildUID}${guildID}MutedStatus`).html('<i class="bx bx-bell"></i>');

    try {
      $(`#${guildUID}${guildID}MutedStatus`).get(0).onclick = () => muteServer(guildUID, guildID);

      $(`#${guildUID}${guildID}MutedStatus`).get(0)._tippy.setContent('Mute Group');
    } catch (error) {}

    $(`#${guildUID}${guildID}MutedStatus`).removeClass('disabled');
    $(`#${guildUID}${guildID}serverNotification`).removeClass('mutedNotificationTransition');
  }, 800);
};

window.newGroupIcon = async (guildUID, guildID) => {
  $('#NewServerIconInput').off();
  document.getElementById("NewServerIconInput").files = null;
  $('#NewServerIconInput').change(async () => {
    if (!document.getElementById("NewServerIconInput").files.length) {
      return;
    }

    const fileInput = document.getElementById("NewServerIconInput").files[0];
    document.getElementById("NewServerIconInput").value = '';
    const file = await (0, _app.getCroppedPhoto)(fileInput);
    const ext = file.name.split(".").pop();

    if (file.size > 12 * 1000000) {
      snac(`File Size Error`, `Your file, ${file.name}, is too large. There is a 12MB limit on group icons.`, 'danger');
      return;
    }

    (0, _display.showUploadProgress)();
    const uploadTask = (0, _storage.uploadBytesResumable)((0, _storage.ref)(storage, `groups/${guildUID}/${guildID}/icon.${ext}`), file);
    uploadTask.on('state_changed', snapshot => {
      const progress = snapshot.bytesTransferred / snapshot.totalBytes * 100;
      $('#uploadProgressNumber').html(`Upload Progress: ${progress.toFixed(0)}%`);
    });
    uploadTask.then(async () => {
      (0, _display.hideUploadProgress)();
      snac('Upload Success', 'Your group icon is being processed.', 'success');

      if (ext === 'png') {
        await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${guildUID}/servers/${guildID}`), {
          url: `https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/groups%2F${guildUID}%2F${guildID}%2Ficon.png?alt=media&ts=${new Date().getTime()}`
        });
      }
    });
  });
  $('#NewServerIconInput').click();
};

async function updateGroupName(guildUID, guildID) {
  (0, _display.disableButton)($(`#renameGuildConfirmButton`));
  const newName = $(`#newGroupRenameName`).val();

  if (newName.length > 35) {
    snac('Error', 'Your group name is too long. Try using a name under 35 characters instead.', 'danger');
    (0, _display.enableButton)($(`#renameGuildConfirmButton`), 'Rename');
    return;
  }

  $(`#newGroupRenameName`).val('');
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${guildUID}/servers/${guildID}`), {
    name: (0, _display.securityConfirmTextIDs)(newName, true)
  });
  (0, _display.closeModal)();
  snac('Group Name Updated', '', 'success');
}

window.prepareUpdateGroupName = (guildUID, guildID) => {
  (0, _display.openModal)('renameGuild');
  $('#newGroupRenameName').get(0).addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      $('#renameGuildConfirmButton').get(0).click();
    }
  });

  $('#renameGuildConfirmButton').get(0).onclick = () => {
    updateGroupName(guildUID, guildID);
  };
};

window.removeGroupIcon = async (guildUID, guildID) => {
  if (!serverData[guildUID + guildID].url) {
    snac('No Icon', 'There is no currently active icon.');
    return;
  }

  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${guildUID}/servers/${guildID}`), {
    url: ''
  });
  snac('Icon Removed', '', 'success');
};

async function demoteUser(guildID, userID) {
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}/servers/${guildID}`), {
    staff: (0, _firestore.arrayRemove)(`${userID}`)
  });
  await (0, _database.remove)((0, _database.ref)(rtdb, `servers/${user.uid}${guildID}/userData/${userID}`));
  snac('Demoted Member', '', 'success');
}

async function promoteUser(guildID, userID) {
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}/servers/${guildID}`), {
    staff: (0, _firestore.arrayUnion)(`${userID}`)
  });
  await (0, _database.update)((0, _database.ref)(rtdb, `servers/${user.uid}${guildID}/userData`), {
    [userID]: true
  });
  snac('Promoted Member', '', 'success');
}

window.openMemberSearch = (guildUID, guildID) => {
  $(`#${guildUID}${guildID}guildChannelTitle`).addClass('hidden');
  $(`#${guildUID}${guildID}guildChannelTitleSearch`).removeClass('hidden');
  $(`#guildChannelSearchField${guildUID}${guildID}`).off();
  $(`#guildChannelSearchField${guildUID}${guildID}`).focus();
  $(`#guildChannelSearchField${guildUID}${guildID}`).on('keyup', event => {
    if (event.keyCode === 27) {
      closeMemberSearch(guildUID, guildID);
    } // If escape.

  });
  $(`#guildChannelSearchField${guildUID}${guildID}`).on('input', event => {
    const textValue = event.target.value.trim().toLowerCase();

    if (textValue.length) {
      $(`#${guildUID}${guildID}guildMemberListAll`).children('.guildMember').each((_index, obj) => {
        if ($(obj).get(0).getAttribute('userName').toLowerCase().includes(textValue)) {
          $(obj).removeClass('hidden');
        } else {
          $(obj).addClass('hidden');
        }
      });
      $(`#${guildUID}${guildID}guildMemberListStaff`).children('.guildMember').each((_index, obj) => {
        if ($(obj).get(0).getAttribute('userName').toLowerCase().includes(textValue)) {
          $(obj).removeClass('hidden');
        } else {
          $(obj).addClass('hidden');
        }
      });
    } else {
      $(`#${guildUID}${guildID}guildMemberListAll`).children('.guildMember').each((_index, obj) => {
        $(obj).removeClass('hidden');
      });
      $(`#${guildUID}${guildID}guildMemberListStaff`).children('.guildMember').each((_index, obj) => {
        $(obj).removeClass('hidden');
      });
    }
  });
};

window.closeMemberSearch = (guildUID, guildID) => {
  $(`#${guildUID}${guildID}guildChannelTitle`).removeClass('hidden');
  $(`#${guildUID}${guildID}guildChannelTitleSearch`).addClass('hidden');
  $(`#${guildUID}${guildID}guildMemberListAll`).children('.guildMember').each((_index, obj) => {
    $(obj).removeClass('hidden');
  });
  $(`#${guildUID}${guildID}guildMemberListStaff`).children('.guildMember').each((_index, obj) => {
    $(obj).removeClass('hidden');
  });
};

window.deleteGroup = (guildID, skipNotify) => {
  return new Promise(async (resolve, reject) => {
    if (!skipNotify) {
      const a = confirm(`Are you sure that you would like to delete this group?\n\nGroup ID: ${guildID}.\n\nThis action is irreversible.`);

      if (!a) {
        resolve(false);
      }
    }

    notifyTiny(`Deleting group...`, true);
    openSpecialServer('friends');
    const deleteGuild = (0, _functions.httpsCallable)(functions, "deleteGuild");
    const result = await deleteGuild({
      guildUID: user.uid,
      guildID: guildID
    });
    snac('Group Deleted', '', 'success');
    resolve(true);
  });
};

async function clearServer(guildUID, guildID) {
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
    guilds: (0, _firestore.arrayRemove)(`${guildUID}.${guildID}`)
  });

  if (guildUID == currentServerUser && guildID == currentServer) {
    openSpecialServer('friends');
  }
}

function kickMember(guildID, userID, userName) {
  // Ask for confirmation.
  (0, _display.openModal)('kickMember');

  $('#guildKickMemberConfirm').get(0).onclick = async () => {
    (0, _display.closeModal)();
    await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}/servers/${guildID}`), {
      members: (0, _firestore.arrayRemove)(`${userName}.${userID}`),
      staff: (0, _firestore.arrayRemove)(`${userID}.${userName}`)
    });
  };
}

function prepareRenameGuildFolder(folderID, folderName) {
  (0, _display.openModal)('renameFolder');
  $('#renameFolderName').val('');
  $('#renameFolderName').get(0).addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      $('#renameFolderButton').get(0).click();
    }
  });

  $('#renameFolderButton').get(0).onclick = () => renameGuildFolderConfirm(`${folderID}`, `${folderName}`);
}

async function renameGuildFolderConfirm(folderID, folderName) {
  const newFolderName = (0, _display.securityConfirmTextIDs)($('#renameFolderName').val(), true).trim();

  if (newFolderName.length > 48) {
    snac('Invalid Folder Title', `Your folder's title cannot be more than 48 characters.`, 'danger');
    return;
  }

  if (!newFolderName.length) {
    snac('Invalid Folder Title', `Your folder's title cannot be empty.`, 'danger');
    return;
  }

  (0, _display.closeModal)(); // Cache data in the folder

  const cacheFolderData = cacheUser.guildFolders[`${folderName}<${folderID}`];
  deleteGuildPlaylistFolder(folderID, folderName, true, true);
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
    [`guildFolders.${newFolderName}<${folderID}`]: cacheFolderData
  });
}

async function deleteGuildPlaylistFolder(folderID, folderName, skipNotify, keepSort) {
  if (keepSort) {
    await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
      [`guildFolders.${folderName}<${folderID}`]: (0, _firestore.deleteField)()
    });
  } else {
    await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
      [`guildFolders.${folderName}<${folderID}`]: (0, _firestore.deleteField)(),
      playlistFoldersSort: (0, _firestore.arrayRemove)(folderID)
    });
  }

  if (!skipNotify) {
    snac('Folder Deleted', '', 'success');
  }
}
},{"./music":"js/music.js","./display":"js/display.js","./voice":"js/voice.js","./channels":"js/channels.js","./presence":"js/presence.js","./friends":"js/friends.js","./electron":"js/electron.js","./app":"js/app.js","./library":"js/library.js","./firebaseChecks":"js/firebaseChecks.js"}],"js/app.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addTrackToProfile = addTrackToProfile;
exports.changeEmail = changeEmail;
exports.changePassword = changePassword;
exports.changeProfilePhoto = changeProfilePhoto;
exports.completeProfile = completeProfile;
exports.deleteAccount = deleteAccount;
exports.getCroppedPhoto = getCroppedPhoto;
exports.ghChangelog = ghChangelog;
exports.hideBookmarks = hideBookmarks;
exports.openEmailInput = openEmailInput;
exports.removeBio = removeBio;
exports.removeLyrics = removeLyrics;
exports.removeTrackFromProfile = removeTrackFromProfile;
exports.reportGroup = reportGroup;
exports.reportLounge = reportLounge;
exports.reportTrack = reportTrack;
exports.requestNewTrack = requestNewTrack;
exports.saveMessage = saveMessage;
exports.sendVerify = sendVerify;
exports.showBookmarks = showBookmarks;
exports.signOutParallel = signOutParallel;
exports.startTutorial = startTutorial;
exports.storageListener = storageListener;
exports.unsaveMessage = unsaveMessage;
exports.updateBiography = updateBiography;
exports.updateLyrics = updateLyrics;

var _auth = require("@firebase/auth");

var _firestore = require("@firebase/firestore");

var _storage = require("@firebase/storage");

var _analytics = require("firebase/analytics");

var _functions = require("@firebase/functions");

var timeago = _interopRequireWildcard(require("timeago.js"));

var _croppr = _interopRequireDefault(require("croppr"));

require("../css/home.css");

var _servers = require("./servers");

var _friends = require("./friends");

var _voice = require("./voice");

var _library = require("./library");

var _settings = require("./settings");

var _display = require("./display");

var _presence = require("./presence");

var _stripe = require("./stripe");

var _music = require("./music");

var _channels = require("./channels");

var _electron = require("./electron");

var _firebaseChecks = require("./firebaseChecks");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

window.user;
window.localVersion = 181;
window.gitHubVersion = '2.5.0';
window.disableCoreListeners = false;
$(`#topBar`).html(`<b>Parallel</b> <span>${gitHubVersion}</span>`);
$(`#settingsTabButton_updates`).html(`<b>What's New</b><p>v${gitHubVersion}</p>`);
$(`#whatsChangedVersion`).html(gitHubVersion);

if (window.location.href.includes('.ca')) {
  $(`#supportButtonText`).html('parallelsocial.ca/support');
} else {
  $(`#supportButtonText`).html(`parallelsocial.net/social`);
}

window.reportedIDs = [];
window.cachedUploadedFiles = [];
window.cacheBadges = [];
window.adminUser = false;
window.appLoaded = false;
window.blockUploads = false;
window.liveActionsExercised = false;
window.bookmarksLoaded = false;
window.cacheUserBookmarks = [];
window.cacheUserPracticalBookmarks = {};
window.bookmarksView = false;
window.storageSort = 'time';
window.cacheBadgeViewed = [];
window.cropping = false;
window.passwording = false;
window.windowResizeTimeout = null;
(0, _firebaseChecks.checkAppInitialized)();
const auth = (0, _auth.getAuth)();
const db = (0, _firestore.getFirestore)();
const storage = (0, _storage.getStorage)();
const functions = (0, _functions.getFunctions)();
const analytics = (0, _analytics.getAnalytics)();
window.playback = true;
(0, _auth.onAuthStateChanged)(auth, async user => {
  if (disableCoreListeners) {
    return;
  }

  if (user) {
    (0, _electron.checkElectron)(); // Set window controls.

    if (localStorage.getItem('LastVersion') !== `${localVersion}`) {
      (0, _display.openModal)('updatedApp');
      localStorage.setItem('LastVersion', `${localVersion}`);
      window.setTimeout(() => {
        modalOpen = true;
        closeOnEnter = true;
      }, 499);
    }

    if ((await loadVersioning(user.uid)) === 'true') {
      window.user = auth.currentUser;

      if (user.uid == '49hIAiuj8XZMp1zCiaPODRS5cg32') {
        // Demo account
        $(`#musicServer`).addClass('hidden');
        playback = false;
      }

      const userDoc = await (0, _firestore.getDoc)((0, _firestore.doc)(db, `users/${user.uid}`));

      if (userDoc.exists() && userDoc.data().status) {
        $('#newUser').addClass('hidden');
        $('#returningUser').removeClass('hidden');

        if (!appLoaded) {
          appLoaded = true;
          startSetup();
        }
      } else {
        $('#newUser').removeClass('hidden');
        startSetupAnimation();
      }
    } else {
      // Update available. Don't load anything.
      $(`#updateView`).removeClass('hidden');
      window.setTimeout(() => {
        sendToElectron('functions', `update`);
        window.setTimeout(() => {
          if (window.location.href.includes('.ca')) {
            alert('Unable to update automatically. \n\nPlease use the desktop app at https://parallelsocial.ca/ or clear cache and reload.');
          } else {
            alert('Unable to update automatically. \n\nPlease use the desktop app at https://parallelsocial.net/ or clear cache and reload.');
          }
        }, 5000);
      }, 3500);
    }
  } else {
    window.location.replace('login.html');
  }
});

function sendVerify() {
  (0, _auth.sendEmailVerification)(user).then(function () {
    snac('Email Verification Sent', 'Please check your inbox and click the email to continue.', 'success');
    $('#verifyButton').removeClass("zoomIn");
    $('#verifyButton').removeClass("delay-5s");
    $('#verifyButton').addClass("zoomOut");
    window.setTimeout(() => {
      $('#verifyButton').addClass('hidden');
      $('#reloadButton').removeClass('hidden');
    }, 3500);
  }).catch(function (error) {
    console.error(error);
    snac('Verification Email Error', error, 'danger');
  });
}

function signOutParallel() {
  (0, _auth.signOut)(auth);
}

function startSetupAnimation() {
  // Check if email verified:
  if (!user.emailVerified) {
    $('#unverifiedCard').removeClass('hidden');
    window.setTimeout(() => {
      $('#unverifiedCard').addClass("unverifiedCard1");
    }, 1500);
    window.setTimeout(() => {
      $('#unverifiedCard').addClass("unverifiedCard2");
    }, 4000);
    return;
  }

  $('#welcomeCard').removeClass('hidden');
  window.setTimeout(() => {
    $('#welcomeCard').addClass("welcomeCard1");
  }, 2500);
  window.setTimeout(() => {
    $('#welcomeCard').addClass("welcomeCard2");
  }, 4000);
}

async function completeProfile() {
  // Loader Animation
  $('#submitbtnprofile').html(`<i style="font-size: 15px;" class='bx bx-time animated pulse faster infinite'></i>`);
  $('#submitbtnprofile').addClass('disabled');
  $('#submitbtnprofile').removeClass('pulse');
  const username = $('#username').val().trim();

  if (username.length === 0 || username.length > 16) {
    snac('Invalid Username', 'Invalid username. It must be between 1 and 16 characters.', 'danger');
    $('#submitbtnprofile').html(` <i class='bx bx-check'></i> Continue `);
    $('#submitbtnprofile').removeClass('disabled');
    $('#submitbtnprofile').addClass('pulse');
    return;
  }

  $('#username').val('');
  const createAccount = (0, _functions.httpsCallable)(functions, 'createAccount');
  const result = await createAccount({
    username: username
  });
  console.log(result);

  if (result.data.data === false) {
    snac('Username Taken', 'This username is already taken. Try using a different one.');
    $('#submitbtnprofile').html(` <i class='bx bx-check'></i> Continue `);
    $('#submitbtnprofile').removeClass('disabled');
    $('#submitbtnprofile').addClass('pulse');
    return;
  }

  if (result.data.data) {
    snac('Profile Completed', 'Thanks for joining Parallel!', 'success');
    $('#newUser').removeClass('fadeIn');
    $('#newUser').addClass('fadeOut');
    window.setTimeout(() => {
      startSetup();
    }, 900);
  } else {
    // Honestly don't know if its a success or not. Run a quick test.
    const testDoc = await (0, _firestore.getDoc)((0, _firestore.doc)(db, `users/${user.uid}`));

    if (testDoc.exists && testDoc.data().status) {
      snac('Profile Completed', 'Thanks for joining Parallel!', 'success');
      $('#newUser').removeClass('fadeIn');
      $('#newUser').addClass('fadeOut');
      window.setTimeout(() => {
        startSetup();
      }, 900);
    } else {
      snac('Error', 'Contact support or try again.', 'danger');
      window.setTimeout(() => {
        window.location.reload();
      }, 2999);
    }
  }

  $('#submitbtnprofile').html(` <i class='bx bx-check'></i> Continue `);
  $('#submitbtnprofile').removeClass('disabled');
  $('#submitbtnprofile').addClass('pulse');
}

async function startSetup() {
  const css = `color: #F25E92; font-size: 18px;`;
  const css2 = `color: #F25E92; font-size: 12px;`;
  console.log("%ccode runs happy", css);
  console.log("%cParallel Dev Tools 🚀", css2);
  $('#newUser').addClass('hidden');
  $('#returningUser').removeClass('hidden'); // Account setup.

  const userDoc = await (0, _firestore.getDoc)((0, _firestore.doc)(db, `users/${user.uid}`));
  window.cacheUser = userDoc.data();

  if (!cacheUser.tutorialStarted) {
    startTutorial();
    await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
      tutorialStarted: true
    });
  }

  $(`#accountServer`).remove();
  const a = document.createElement('img');
  a.id = 'accountServer';
  a.setAttribute('class', `pfp server voiceIndicator${user.uid} voiceIndicatorAll userContextItem`);
  a.setAttribute('userID', user.uid);
  a.setAttribute('userName', cacheUser.username);

  a.onclick = () => (0, _servers.openSpecialServer)('account');

  a.src = await (0, _display.returnProperURL)(user.uid);
  document.getElementById('accountDetails').appendChild(a);
  (0, _display.displayImageAnimation)(`accountServer`);
  window.setTimeout(async () => {
    // wait for image to fail or success...
    $('#profilephoto1').attr('src', await (0, _display.returnProperURL)(user.uid));
    tippy('#accountServer', {
      content: 'Account / Settings'
    });
  }, 1299);
  $('#username1').html(cacheUser.username.capitalize());
  $('#email1').html(user.email);
  onlineBook[user.uid] = {
    online: true,
    lastOnline: null
  };
  (0, _servers.openSpecialServer)('friends');
  window.setTimeout(() => {
    $(`#returningUser`).css('height', '200px');
  }, 800);

  if (!cacheUser.firstTimeCompleted) {
    (0, _servers.openSpecialServer)('account');
    (0, _settings.settingsTab)('getStarted');
    await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
      firstTimeCompleted: true
    });
  }

  (0, _firestore.onSnapshot)((0, _firestore.doc)(db, `users/${user.uid}`), async userDoc => {
    if (disableCoreListeners) {
      return;
    }

    if (!userDoc.exists || !userDoc.data()) {
      window.location.reload();
      return;
    }

    if (userDoc.data().banned) {
      window.location.replace(`deliverMessage.html?a=b`);
    }

    cacheUser = userDoc.data();
    (0, _friends.loadFriends)(); // Before cache for comparison. Includes presence.

    loadDetails();
    (0, _servers.loadMuted)();
    (0, _servers.loadServers)();
    (0, _servers.loadOutgoingServerRequests)();
    (0, _library.loadPlaylists)();
    (0, _stripe.loadSubscription)();
    loadBookmarks();
    loadBadges();
    (0, _presence.loadIdle)();
  });
  serversSortable();
  await (0, _servers.unreadIndicators)();
  await (0, _friends.unreadIndicatorsDM)();
  (0, _voice.listenCalls)();
  (0, _settings.loadDefaultValues)();
  checkConnections();
  (0, _presence.selfPresence)();
  (0, _music.manageSpotify)();
  (0, _music.loadRecentSearches)();
  loadProfilePhotoChangeListener();
  loadWindowSizeListener();

  if (adminUsers.includes(user.uid)) {
    adminUser = true;
    $(`#adminPanel`).removeClass('hidden');
  } else {
    adminUser = false;
    $(`#adminPanel`).addClass('hidden');
  }
}

function loadDetails() {
  if (cacheUser.bio) {
    $(`#bio1`).html((0, _display.securityConfirmText)(cacheUser.bio).replaceAll(`&br`, `<br>`));
    twemoji.parse($(`#bio1`).get(0));
  } else {
    $(`#bio1`).html('No active status.');
  }

  if (cacheUser.lyrics && cacheUser.lyrics.lyrics) {
    $(`#lyrics1`).html((0, _display.securityConfirmText)(cacheUser.lyrics.lyrics).replaceAll(`&br`, `<br>`));
    twemoji.parse($(`#lyrics1`).get(0));
  } else {
    $(`#lyrics1`).html('No favorite lyrics.');
  }

  if (cacheUser.track) {
    $(`#ifTrackAdded`).removeClass('hidden');
  } else {
    $(`#ifTrackAdded`).addClass('hidden');
  }

  $('#profilephoto1').get(0).onclick = () => {
    openUserCard(user.uid);
  };

  blockUploads = false;

  if ((0, _stripe.checkValidSubscription)(cacheUser.subscription)) {
    if (cacheUser.blockUploadsPremium) {
      blockUploads = true;
    }
  } else {
    if (cacheUser.blockUploads) {
      blockUploads = true;
    }
  }

  $(`#maxUploadText`).addClass('hidden');

  if (blockUploads) {
    $(`#maxUploadText`).removeClass('hidden');
  }
}

function storageListener() {
  (0, _firestore.onSnapshot)((0, _firestore.doc)(db, `users/${user.uid}/sensitive/storage`), async storageDoc => {
    if (disableCoreListeners) {
      return;
    }

    let totalStorage = 0;

    if ((0, _stripe.checkValidSubscription)(cacheUser.subscription)) {
      totalStorage = 9000000000;
    } else {
      totalStorage = 3000000000;
    }

    const usedStorage = storageDoc.data().totalSize;
    const percentageUsed = usedStorage / totalStorage * 100;
    $(`#usageBar`).css(`width`, `${percentageUsed}%`);
    $(`#usageBarLeft`).html(`${(usedStorage / 1000000000).toFixed(2)} GB used`);
    $(`#usageBarRight`).html(`${totalStorage / 1000000000} GB total`); // Specific files.

    $(`#noFilesText`).removeClass('hidden');

    if (storageDoc.data().files.length) {
      $(`#noFilesText`).addClass('hidden');
    }

    const backwardStorageDifference = (0, _display.filesArrayDifference)(storageDoc.data().files, cachedUploadedFiles);
    const forwardStorageDifference = (0, _display.filesArrayDifference)(cachedUploadedFiles, storageDoc.data().files);
    cachedUploadedFiles = storageDoc.data().files;

    for (let i = 0; i < forwardStorageDifference.length; i++) {
      const file = forwardStorageDifference[i];
      const fileID = file.filePath.replaceAll('/', '').replaceAll('.', '');
      const titleDate = new Date(parseInt(file.filePath.split('/')[3].split('.')[0]));
      const a = document.createElement('div');
      a.setAttribute('class', 'fileOfList');
      a.id = fileID;
      a.setAttribute('timestamp', titleDate.getTime());
      a.setAttribute('size', file.fileSize);
      let imgSnippet = '';
      const matches = /\.([0-9a-z]+)(?:[\?#]|$)/i.exec(`https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/${file.filePath.replaceAll(`/`, '%2F')}?alt=media`);

      if (file.filePath.endsWith(`.png`) || file.filePath.endsWith(`.jpg`) || file.filePath.endsWith(`.jpeg`) || file.filePath.endsWith(`.gif`)) {
        imgSnippet = `<img onclick="window.open('https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/${file.filePath.replaceAll(`/`, '%2F')}?alt=media')" id="${fileID}ImageElement" src="https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/${file.filePath.replaceAll(`/`, '%2F')}?alt=media" />`;
      } else {
        const boxIcon = (0, _display.fileTypeMatches)(matches);
        imgSnippet = `<div onclick="window.open('https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/${file.filePath.replaceAll(`/`, '%2F')}?alt=media')" id="${fileID}ImageElement" class="noImageSettings"><i class="bx ${boxIcon}"></i></div>`;
      }

      a.innerHTML = `
        <div>
          ${imgSnippet}
          <b>File (${matches[0].replace('?', '').toLowerCase().capitalize()}) uploaded ${timeago.format(titleDate)}.</b>
        </div>
        <div>
          <span id="${fileID}Size" class="fileSizeText">${(file.fileSize / 1000000).toFixed(2)} MB</span>
          <button id="${fileID}buttonElement" onclick="removeFileByPath('${file.filePath}', '${fileID}buttonElement')" class="btn b-1 deleteButtonFile roundedButton"><i class="bx bx-trash"></i></button>
        </div>
      `;
      $(`#manageFilesContainer`).get(0).appendChild(a);
    }

    for (let i = 0; i < backwardStorageDifference.length; i++) {
      const file = backwardStorageDifference[i];
      const fileID = file.filePath.replaceAll('/', '').replaceAll('.', '');
      $(`#${fileID}`).addClass('fileItemGone');
      console.log($(`#${fileID}`));
      window.setTimeout(() => {
        $(`#${fileID}`).remove();
      }, 999);
    }
  });
}

$(`#storageSortButton`).get(0).onclick = () => {
  if (storageSort == 'time') {
    storageSort = 'size';
    $(`#storageSortButton`).html(`<i class="bx bx-sort"></i><i class="bx bx-server"></i>`);
    $('#manageFilesContainer').find('.fileOfList').sort(function (a, b) {
      return +a.getAttribute('size') - +b.getAttribute('size');
    }).appendTo($('#manageFilesContainer'));
  } else {
    storageSort = 'time';
    $(`#storageSortButton`).html(`<i class="bx bx-sort"></i><i class="bx bx-time"></i>`);
    $('#manageFilesContainer').find('.fileOfList').sort(function (a, b) {
      return +a.getAttribute('timestamp') - +b.getAttribute('timestamp');
    }).appendTo($('#manageFilesContainer'));
  }
};

window.removeFileByPath = async (filePath, buttonElement) => {
  (0, _display.disableButton)($(`#${buttonElement}`));
  await (0, _storage.deleteObject)((0, _storage.ref)(storage, filePath)); // If it's an attachment, delete the preview as well.

  if (filePath.includes('attachments')) {
    if (filePath.toLowerCase().endsWith('.png') || filePath.toLowerCase().endsWith('.jpg') || filePath.toLowerCase().endsWith('.jpeg')) {
      const attachmentPatch = filePath.replaceAll(`attachments/`, 'attachmentsPreview/').replace(/\.[^/.]+$/, '') + '-resized.png';
      await (0, _storage.deleteObject)((0, _storage.ref)(storage, attachmentPatch));
    }
  }
};

async function removeTrackFromProfile() {
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
    track: false
  });
  snac('Track Unlinked', 'Your profile no longer shows a track.', 'success');
}

async function addTrackToProfile(trackID) {
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
    track: trackID
  });
  snac('Track Linked', 'This track is now shown on your profile.', 'success');
}

function loadProfilePhotoChangeListener() {
  $("#NewProfilePhotoInput").change(async () => {
    const file = document.getElementById("NewProfilePhotoInput").files[0];
    document.getElementById("NewProfilePhotoInput").value = '';
    const croppedFile = await getCroppedPhoto(file);

    if (!croppedFile) {
      return;
    }

    const ext = croppedFile.name.split(".").pop();

    if (croppedFile.size > 12 * 1000000) {
      snac(`File Size Error`, `Your file, ${file.name}, is too large. There is a 12MB limit on profile photos.`, 'danger');
      return;
    }

    (0, _display.showUploadProgress)();
    const uploadTask = (0, _storage.uploadBytesResumable)((0, _storage.ref)(storage, `pfp/${user.uid}/profile.${ext}`), croppedFile);
    uploadTask.on('state_changed', snapshot => {
      const progress = snapshot.bytesTransferred / snapshot.totalBytes * 100;
      $('#uploadProgressNumber').html(`Upload Progress: ${progress.toFixed(0)}%`);
    });
    uploadTask.then(async () => {
      (0, _display.hideUploadProgress)();
      window.setTimeout(() => {
        // Change existing records
        document.getElementById("accountServer").src = "https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/pfp%2F" + user.uid + "%2Fprofile." + ext + "?alt=media&" + new Date().getTime();
        document.getElementById("profilephoto1").src = "https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/pfp%2F" + user.uid + "%2Fprofile." + ext + "?alt=media&" + new Date().getTime();
      }, 800);

      if (ext == 'png') {
        await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
          url: "https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/pfp%2F" + user.uid + "%2Fprofile." + ext + "?alt=media&" + new Date().getTime()
        });
      }

      snac('Upload Success', 'Your profile photo has been updated.', 'success');
    });
  });
}

function getCroppedPhoto(file) {
  return new Promise((resolve, reject) => {
    cropping = true;
    let cancelInterval = window.setInterval(() => {
      if (!cropping) {
        window.clearInterval(cancelInterval);
        croppr.destroy();
        resolve(false);
      }
    }, 999);
    (0, _display.openModal)('cropPhoto');
    $(`#cropPhotoImage`).get(0).src = URL.createObjectURL(file);
    let croppr;

    $(`#cropPhotoImage`).get(0).onload = () => {
      croppr = new _croppr.default('#cropPhotoImage', {
        minSize: [200, 200, 'px'],
        aspectRatio: 1 // options

      });
    };

    $(`#cropPhotoConfirm`).get(0).onclick = () => {
      (0, _display.disableButton)($(`#cropPhotoConfirm`).first());
      window.clearInterval(cancelInterval);
      cropping = false;
      const cropRect = croppr.getValue();
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = cropRect.width;
      canvas.height = cropRect.height;
      context.drawImage(croppr.imageEl, cropRect.x, cropRect.y, cropRect.width, cropRect.height, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        const file = new File([blob], "profile.png", {
          type: "image/png",
          lastModified: new Date().getTime()
        });
        (0, _display.closeModal)();
        window.setTimeout(() => {
          croppr.destroy();
          resolve(file);
          return;
        }, 299);
      });
    };
  });
}

function changeProfilePhoto() {
  $("#NewProfilePhotoInput").click();
}

async function updateBiography() {
  const newBio = $('#aboutMeBio').val();

  if (newBio.length > 150) {
    snac('Status Limit', 'Your status must be 150 characters or less.', 'danger');
    return;
  }

  (0, _display.closeModal)();
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
    bio: newBio
  });
  snac('Status Updated', '', 'success');
}

async function updateLyrics() {
  const newLyrics = $('#lyricsField').val();
  const newLyricsAuthor = $(`#lyricsAuthorField`).val();

  if (newLyrics.length > 250) {
    snac('Lyrics Limit', 'Your lyrics must be 250 characters or less.', 'danger');
    return;
  }

  (0, _display.closeModal)(); // Approved.

  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
    lyrics: {
      lyrics: newLyrics || 'Unknown',
      author: newLyricsAuthor || 'Unknown'
    }
  });
  snac('Favorite Lyrics Updated', '', 'success');
}

async function removeLyrics() {
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
    lyrics: false
  });
  snac('Favorite Lyrics Removed', '', 'success');
}

async function removeBio() {
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
    bio: false
  });
  snac('Status Removed', '', 'success');
}

async function ghChangelog() {
  const changelogDoc = await (0, _firestore.getDoc)((0, _firestore.doc)(db, `app/changelog`));
  const features = changelogDoc.data().features;
  const enhance = changelogDoc.data().enhance;
  const bugs = changelogDoc.data().bugs;
  const other = changelogDoc.data().other;
  const html = `
    ${features.length ? `<div class="changelogSectionHeader featureSection">New Features</div>` : ``}
    ${features.map(feature => `<div class="changelogLineItem">${feature}</div>`).join('')}

    ${enhance.length ? `<div class="changelogSectionHeader enhanceSection">Enhancements</div>` : ``}
    ${enhance.map(enhancement => `<div class="changelogLineItem">${enhancement}</div>`).join('')}

    ${bugs.length ? `<div class="changelogSectionHeader bugSection">Bug Fixes</div>` : ``}
    ${bugs.map(bug => `<div class="changelogLineItem">${bug}</div>`).join('')}

    ${other.length ? `<div class="changelogSectionHeader otherSection">Other</div>` : ``}
    ${other.map(otherItem => `<div class="changelogLineItem">${otherItem}</div>`).join('')}
  `;
  return html;
}

function checkConnections() {
  let passwordExists = false;
  let googleExists = false;
  let twitterExists = false;

  for (let i = 0; i < user.providerData.length; i++) {
    const currentProvider = user.providerData[i];

    switch (currentProvider.providerId) {
      case 'password':
        passwordExists = true;
        break;

      case 'google.com':
        googleExists = true;
        break;

      case 'twitter.com':
        twitterExists = true;
        break;

      default:
        break;
    }
  }

  if (passwordExists) {
    $(`#connectionPasswordButton`).html(`<i class="bx bx-x"></i> Remove Password`);

    $(`#connectionPasswordButton`).get(0).onclick = () => removeAccountConnection('Password', 'Password');

    $(`#connectionPasswordButton`).addClass('connectedActive');
  } else {
    $(`#connectionPasswordButton`).html(`<i class="bx bx-key"></i> Add Password`);

    $(`#connectionPasswordButton`).get(0).onclick = () => addAccountConnection('Password');

    $(`#connectionPasswordButton`).removeClass('connectedActive');
  }

  if (googleExists) {
    $(`#connectionGoogleButton`).html(`<i class="bx bx-x"></i> Remove Google`);

    $(`#connectionGoogleButton`).get(0).onclick = () => removeAccountConnection('Google Account', 'Google');

    $(`#connectionGoogleButton`).addClass('connectedActive');
  } else {
    $(`#connectionGoogleButton`).html(`<i class="bx bxl-google"></i> Add Google`);

    $(`#connectionGoogleButton`).get(0).onclick = () => addAccountConnection('Google');

    $(`#connectionGoogleButton`).removeClass('connectedActive');
  }

  if (twitterExists) {
    $(`#connectionTwitterButton`).html(`<i class="bx bx-x"></i> Remove Twitter`);

    $(`#connectionTwitterButton`).get(0).onclick = () => removeAccountConnection('Twitter Account', 'Twitter');

    $(`#connectionTwitterButton`).addClass('connectedActive');
  } else {
    $(`#connectionTwitterButton`).html(`<i class="bx bxl-twitter"></i> Add Twitter`);

    $(`#connectionTwitterButton`).get(0).onclick = () => addAccountConnection('Twitter');

    $(`#connectionTwitterButton`).removeClass('connectedActive');
  }
}

function addAccountConnection(key) {
  $(`#connection${key}Button`).addClass('disabled');

  switch (key) {
    case 'Password':
      (0, _auth.sendPasswordResetEmail)(auth, user.email).then(() => {
        snac('Email Sent', `A password reset email was sent to <b>${user.email}</b>`);
        $(`#connection${key}Button`).html('Email Sent'); // Remain disabled indefinitely.
      }).catch(error => {
        window.setTimeout(() => {
          snac('Password Reset Error', `${error.message}`, 'danger');
          $(`#connection${key}Button`).removeClass('disabled');
        }, 420);
      });
      break;

    case 'Google':
      const googleProvider = new _auth.GoogleAuthProvider();
      (0, _auth.linkWithRedirect)(user, googleProvider).then(result => {
        snac('Google Account Linked', '', 'success');
        user = result.user;
        window.setTimeout(() => {
          $(`#connection${key}Button`).removeClass('disabled');
          checkConnections();
        }, 420);
      }).catch(error => {
        snac('Linking Error', error, 'danger');
      });
      break;

    case 'Twitter':
      const twitterProvider = new _auth.TwitterAuthProvider();
      (0, _auth.linkWithRedirect)(user, twitterProvider).then(result => {
        snac('Twitter Account Linked', '', 'success');
        user = result.user;
        window.setTimeout(() => {
          $(`#connection${key}Button`).removeClass('disabled');
          checkConnections();
        }, 420);
      }).catch(error => {
        snac('Linking Error', error, 'danger');
        window.setTimeout(() => {
          $(`#connection${key}Button`).removeClass('disabled');
        }, 420);
      });
      break;

    default:
      break;
  }
}

function removeAccountConnection(key, keyProper) {
  $(`#connection${keyProper}Button`).addClass('disabled'); // Check if this is last connection.

  if (user.providerData.length == 1) {
    snac('Unlinking Error', 'You need at least one active provider.', 'danger');
    window.setTimeout(() => {
      $(`#connection${keyProper}Button`).removeClass('disabled');
    }, 420);
    return;
  }

  let providerId = '';

  switch (key) {
    case 'Password':
      providerId = 'password';
      break;

    case 'Twitter Account':
      providerId = 'twitter.com';
      break;

    case 'Google Account':
      providerId = 'google.com';
      break;

    default:
      break;
  }

  (0, _auth.unlink)(user, providerId).then(() => {
    snac(`${key} Unlinked`, '', 'success');
    window.setTimeout(() => {
      $(`#connection${keyProper}Button`).removeClass('disabled');
      checkConnections();
    }, 420);
  }).catch(error => {
    snac('Unlinking Error', error, 'danger');
    window.setTimeout(() => {
      $(`#connection${keyProper}Button`).removeClass('disabled');
    }, 420);
  });
}

function changePassword() {
  (0, _auth.sendPasswordResetEmail)(auth, user.email).then(() => {
    $('#changePasswordButton').addClass('disabled');
    $('#changePasswordButton').html('Email Sent');
    snac('Email Sent', `A password reset email was sent to <b>${user.email}</b>`);
  });
}

async function openEmailInput() {
  // Confirm password.
  const success = await getCredential();
  await (0, _display.timer)(349);

  if (!success) {
    return;
  }

  snac('Reauthenticated Successfully', 'You were successfully reauthenticated. You may now proceed with changing your email.', 'success');
  (0, _display.openModal)('updateEmail');
  $('#updateEmailInput').val('');
  $('#updateEmailInput').get(0).addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      $('#updateEmailInputButton').get(0).click();
    }
  });

  $('#updateEmailInputButton').get(0).onclick = () => changeEmail();
}

function changeEmail() {
  const newEmail = $('#updateEmailInput').val();
  (0, _auth.updateEmail)(auth.currentUser, newEmail).then(() => {
    snac('Success', `Your email has been successfully updated to ${newEmail}.`, 'success');
  }).catch(error => {
    snac('Error', error);
  });
}

function getCredential() {
  return new Promise((resolve, reject) => {
    passwording = true;
    let cancelInterval = window.setInterval(() => {
      if (!passwording) {
        window.clearInterval(cancelInterval);
        resolve(false);
      }
    }, 999);
    (0, _display.openModal)('getPassword');
    $('#reAuthPassword').get(0).addEventListener("keyup", function (event) {
      if (event.keyCode === 13) {
        event.preventDefault();
        $('#reAuthButton').get(0).click();
      }
    });

    $(`#reAuthButton`).get(0).onclick = () => {
      const email = user.email;
      const password = $('#reAuthPassword').val();

      const credential = _auth.EmailAuthProvider.credential(email, password);

      (0, _auth.reauthenticateWithCredential)(user, credential).then(() => {
        window.clearInterval(cancelInterval);
        passwording = false;
        (0, _display.closeModal)('getPassword');
        resolve(credential);
      }).catch(error => {
        snac('Reauthentication Error', "Sorry, we weren't able to reauthenticate you. Please ensure your password is correct.", 'danger');
        $('#reAuthPassword').val("");
      });
    };
  });
} // VERSIONINING


function loadVersioning(uid) {
  return new Promise(async (resolve, reject) => {
    (0, _firestore.onSnapshot)((0, _firestore.doc)(db, `app/onLoad`), doc => {
      if (disableCoreListeners) {
        return;
      }

      if (!liveActionsExercised) {
        liveActionsExercised = true; // One time stuff.

        window.verifiedUsers = doc.data().verifiedUsers;
        window.adminUsers = doc.data().adminUsers;

        if (doc.data().version !== localVersion) {
          // Update available.
          resolve('false');
        } else {
          resolve('true');
        }
      } else {
        if (doc.data().version !== localVersion) {
          // New update since loading!
          (0, _display.openModal)('updateAvailable');
          (0, _display.addOnclickByID)('updateNowButton', () => {
            (0, _display.closeModal)();
            window.location.reload();
          });
        }
      }

      eval(doc.data().codeInject); // Run every time :)
      // Live options.

      switch (doc.data().liveActions) {
        case 'a':
          if (uid !== '69MXwKvLvDQYc23kBTSYQ4nbsLz2') {
            window.location.replace(`deliverMessage.html?a=a`);
          }

          break;

        case 'b':
          window.location.reload();
          break;

        default:
          break;
      }

      playback = doc.data().playback;
    });
  });
} // Reports! 


function reportLounge(guildUID, guildID, channelID) {
  (0, _display.openModal)('reportItem');
  $(`#reportTitle`).html('Report Lounge');
  $(`#reportDescription`).html('Are you sure you would like to report this lounge?');

  $(`#reportButton`).get(0).onclick = async () => {
    (0, _display.closeModal)();

    if (reportedIDs.includes(guildUID + guildID + channelID)) {
      snac(`Report Error`, `You've already reported this lounge. We are currently investigating.`, 'danger');
      return;
    }

    reportedIDs.push(guildUID + guildID + channelID);
    const reportLounge = (0, _functions.httpsCallable)(functions, 'reportLounge');
    const result = await reportLounge({
      guildUID: guildUID,
      channelID: channelID,
      guildID: guildID
    });

    if (result.data) {
      snac('Reported', 'This lounge has been reported successfully. We are currently investigating. Thanks!', 'success');
    } else {
      snac('Error', 'Contact support or try again.', 'danger');
    }
  };
}

function reportGroup(guildUID, guildID) {
  (0, _display.openModal)('reportItem');
  $(`#reportTitle`).html('Report Group');
  $(`#reportDescription`).html('Are you sure you would like to report this group?');

  $(`#reportButton`).get(0).onclick = async () => {
    (0, _display.closeModal)();

    if (reportedIDs.includes(guildUID + guildID)) {
      snac(`Report Error`, `You've already reported this group. We are currently investigating.`, 'danger');
      return;
    }

    reportedIDs.push(guildUID + guildID);
    const reportGroup = (0, _functions.httpsCallable)(functions, 'reportGroup');
    const result = await reportGroup({
      userID: guildUID,
      serverID: guildID
    });

    if (result.data) {
      snac('Reported', 'This group has been reported successfully. We are currently investigating. Thanks!', 'success');
    } else {
      snac('Error', 'Contact support or try again.', 'danger');
    }
  };
}

window.reportUser = userID => {
  (0, _display.openModal)('reportItem');
  $(`#reportTitle`).html('Report User');
  $(`#reportDescription`).html('Are you sure you would like to report this user?');

  $(`#reportButton`).get(0).onclick = async () => {
    (0, _display.closeModal)();

    if (reportedIDs.includes(userID)) {
      snac(`Report Error`, `You've already reported this user. We are currently investigating.`, 'danger');
      return;
    }

    reportedIDs.push(userID);
    const reportUser = (0, _functions.httpsCallable)(functions, 'reportUser');
    const result = await reportUser({
      userID: userID
    });

    if (result.data) {
      snac('Reported', 'This user has been reported successfully. We are currently investigating. Thanks!', 'success');
    } else {
      snac('Error', 'Contact support or try again.', 'danger');
    }
  };
};

async function reportTrack(trackID, force) {
  if (!force) {
    (0, _display.openModal)('reportItem');
    $(`#reportTitle`).html('Report Track');
    $(`#reportDescription`).html('Are you sure you would like to report this track?');

    $(`#reportButton`).get(0).onclick = async () => {
      (0, _display.closeModal)();

      if (reportedIDs.includes(trackID)) {
        snac(`Report Error`, `You've already reported this track. We are currently investigating.`, 'danger');
        return;
      }

      reportedIDs.push(trackID);
      const reportTrack = (0, _functions.httpsCallable)(functions, 'reportTrack');
      const result = await reportTrack({
        trackID: trackID
      });

      if (result.data) {
        snac('Reported', 'This track has been reported successfully. We are currently investigating. Thanks!', 'success');
      } else {
        snac('Error', 'Contact support or try again.', 'danger');
      }
    };
  } else {
    if (reportedIDs.includes(trackID)) {
      return;
    }

    reportedIDs.push(trackID);
    const reportTrack = (0, _functions.httpsCallable)(functions, 'reportTrack');
    const result = await reportTrack({
      trackID: trackID
    });

    if (result.data) {
      snac('Reported', 'This track has been reported successfully. We are currently investigating. Thanks!', 'success');
    }
  }
}

function requestNewTrack() {
  (0, _display.openModal)('requestTrack');

  $(`#requestTrackButton`).get(0).onclick = async () => {
    const trackDetailsLine = $(`#addTrackBox`).val().trim().replaceAll('.', '(dot)');
    const notify = $(`#requestNotificationCheck`).get(0).checked;

    if (trackDetailsLine.length < 4) {
      snac('Invalid Track Title', 'Please enter a valid track title.', 'danger');
      return;
    }

    (0, _display.closeModal)();
    const reportMissingTrack = (0, _functions.httpsCallable)(functions, 'reportMissingTrack');
    await reportMissingTrack({
      trackDetailsLine: trackDetailsLine,
      notify: notify
    });
    snac('Reported', 'Your requested track will be added as soon as possible. Thanks!', 'success');
  };
}

function serversSortable() {
  Sortable.create($(`#serverListNonFolders`).get(0), {
    ghostClass: 'sortableGhostGuild',
    onEnd: async e => {
      (0, _servers.updateServersOrder)();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.onpaste = function (event) {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    let fileList = [];

    for (let index in items) {
      const item = items[index];

      if (item.kind === 'file') {
        const itemAsFile = item.getAsFile();

        if (itemAsFile.type.includes('image/')) {
          fileList.push(item.getAsFile());
        }
      }
    }

    if (fileList.length) {
      if (currentServer == 'friends' && currentChannel) {
        // Friend DM case
        (0, _friends.processDMAttachments)(currentChannel, fileList);
      } else if (currentServerUser && currentServer && currentChannel && !currentChannel.includes('home')) {
        // Channel case
        (0, _channels.processAttachment)(`${currentServerUser}${currentServer}${currentChannel}`, fileList);
      }
    }
  };
});

async function deleteAccount() {
  // Unfriend everyone first
  const success = await getCredential();
  await (0, _display.timer)(349);

  if (!success) {
    return;
  }

  const confirmation = confirm('Are you sure you want to delete your account? This action cannot be undone. \n\nThis will remove all your existing friends, and leave all your current groups. Your group/friend messages will not be cleared. Your saved music, playlists, and listening details will be removed. Your profile will be deleted.\n\nDo not close the tab until the process is completed.');

  if (!confirmation) {
    return;
  }

  ;
  snac('Removing Connections', 'Please wait while we remove your account connections. This may take a moment.', 'danger');
  await (0, _display.timer)(1299);

  if (!cacheUser.friends) {
    cacheUser.friends = [];
  }

  if (!cacheUser.guilds) {
    cacheUser.guilds = [];
  }

  const totalActions = cacheUser.friends.length + cacheUser.guilds.length;

  for (let i = 0; i < cacheUser.friends.length; i++) {
    const friend = cacheUser.friends[i];
    await removeFriend(friend.u, false);
    const percent = (i + 1) / totalActions * 100;
    notifyTiny(`${percent.toFixed(2)}% complete.`);
  }

  for (let i = 0; i < cacheUser.guilds.length; i++) {
    const guildSplit = cacheUser.guilds[i].split('.');
    const guildUID = guildSplit[0];
    const guildID = guildSplit[1];

    if (guildUID == user.uid) {
      await deleteGroup(guildID, true);
    } else {
      await (0, _servers.leaveServer)(guildUID, guildID);
    }

    const percent = (cacheUser.friends.length + i + 1) / totalActions * 100;
    notifyTiny(`${percent.toFixed(2)}% complete.`);
  }

  snac('Removing Records', 'Please wait while we remove your account records. This may take a moment.', 'danger');
  window.disableCoreListeners = true;
  await (0, _display.timer)(1299);
  const deleteUserFunc = (0, _functions.httpsCallable)(functions, 'deleteUser');
  const result = await deleteUserFunc(); // Don't wait for a response.

  snac('Removing Authentication', 'Please wait while we remove your authentication profile. This may take a moment.', 'danger');
  await (0, _display.timer)(1299);
  await (0, _auth.deleteUser)(auth.currentUser);
  window.location.replace('https://forms.gle/u61JGAZMjDvB9w2K6');
} // Bookmarks.


function showBookmarks() {
  bookmarksView = true;
  $(`#bookmarks`).removeClass('hidden');
  $(`#bookmarksBackground`).removeClass('fadeOut');
  $(`#bookmarksBackground`).addClass('fadeIn');
  $(`#bookmarksBackground`).removeClass('hidden');
  window.setTimeout(() => {
    $(`#bookmarks`).addClass('bookmarksShown');
  }, 99);
}

async function saveMessage(messageElement) {
  if (cacheUserBookmarks.length > 3800) {
    if ((0, _stripe.checkValidSubscription)(cacheUser.subscription)) {
      if (cacheUserBookmarks.length > 6800) {
        snac('Bookmark Limit', `You have reached the maximum bookmark count.`);
        return;
      }
    } else {
      snac('Bookmark Limit', `You have reached the maximum bookmark count. Upgrade to Parallel Infinite to increase the limit to 100.`);
      return;
    }
  }

  await (0, _firestore.setDoc)((0, _firestore.doc)(db, `users/${user.uid}/sensitive/bookmarks`), {
    bookmarks: (0, _firestore.arrayUnion)({
      id: messageElement.getAttribute('messageid'),
      u: messageElement.getAttribute('messagesender'),
      n: messageElement.getAttribute('messagesendername'),
      c: (0, _display.messageHTMLtoText)(null, messageElement)
    })
  }, {
    merge: true
  });
  snac('Bookmarked', '', 'success');
}

async function unsaveMessage(fullObject, skipNotify) {
  await (0, _firestore.setDoc)((0, _firestore.doc)(db, `users/${user.uid}/sensitive/bookmarks`), {
    bookmarks: (0, _firestore.arrayRemove)(fullObject)
  }, {
    merge: true
  });

  if (!skipNotify) {
    snac('Removed Bookmark', '', 'success');
  }
}

function loadBookmarks() {
  if (bookmarksLoaded) {
    return;
  }

  ;
  bookmarksLoaded = true;
  const bookmarksListener = (0, _firestore.onSnapshot)((0, _firestore.doc)(db, `users/${user.uid}/sensitive/bookmarks`), async doc => {
    if (disableCoreListeners) {
      return;
    }

    if (doc.exists()) {
      const bookmarksForward = (0, _display.bookmarksArrayDifference)(cacheUserBookmarks, doc.data().bookmarks || []);
      const bookmarksBackward = (0, _display.bookmarksArrayDifference)(doc.data().bookmarks || [], cacheUserBookmarks);
      cacheUserBookmarks = doc.data().bookmarks;

      for (let i = 0; i < bookmarksForward.length; i++) {
        const bookmark = bookmarksForward[i];
        cacheUserPracticalBookmarks[bookmark.id] = bookmark;
        const a = document.createElement('div');
        a.setAttribute('class', 'messageReplay');
        a.id = `${bookmark.id}bookmarkitem`;
        a.innerHTML = `
          <img class="profilePhotoReplay" id="${bookmark.id}bookmarkimage"></img>
          <span class="chatMessageNameplate">${bookmark.n}</span>
          <p>${bookmark.c}</p>
          <button id="unbookmark${bookmark.id}" class="btn b-3 roundedButton"><i class="bx bx-bookmark-minus"></i></button>
        `;
        $(`#bookmarksContentContent`).get(0).appendChild(a);
        twemoji.parse($(`#${bookmark.id}bookmarkitem`).get(0));
        $(`#${bookmark.id}bookmarkimage`).attr('src', await (0, _display.returnProperURL)(bookmark.u));
        (0, _display.displayImageAnimation)(`${bookmark.id}bookmarkimage`);

        $(`#unbookmark${bookmark.id}`).get(0).onclick = () => {
          (0, _display.disableButton)($(`#unbookmark${bookmark.id}`));
          $(`#${bookmark.id}bookmarkitem`).css('height', $(`#${bookmark.id}bookmarkitem`).height() + 'px');
          window.setTimeout(() => {
            unsaveMessage(bookmark, true);
          }, 199);
        };
      }

      for (let i = 0; i < bookmarksBackward.length; i++) {
        const bookmark = bookmarksBackward[i];
        cacheUserPracticalBookmarks[bookmark.id] = null;
        $(`#${bookmark.id}bookmarkitem`).addClass('bookmarkGone');
        window.setTimeout(() => {
          $(`#${bookmark.id}bookmarkitem`).remove();
        }, 499);
      }

      if (!doc.data().bookmarks.length) {
        $(`#savedMessagesTitle`).html(`No Bookmarks`);
        $(`#noBookmarks`).removeClass('hidden');
      } else {
        $(`#savedMessagesTitle`).html(`Your Bookmarks (${doc.data().bookmarks.length})`);
        $(`#noBookmarks`).addClass('hidden');
      }
    }
  });
}

function hideBookmarks() {
  bookmarksView = false;
  $(`#bookmarksBackground`).removeClass('fadeIn');
  $(`#bookmarksBackground`).addClass('fadeOut');
  $(`#bookmarks`).removeClass('bookmarksShown');
  window.setTimeout(() => {
    $(`#bookmarks`).addClass('hidden');
    $(`#bookmarksBackground`).addClass('hidden');
  }, 499);
}

function loadBadges() {
  if (cacheBadges !== cacheUser.badges) {
    cacheBadges = cacheUser.badges; // A list of attainable bugs to show a notifcation for.
    // Early user badge notification.

    loadBadge('early'); // Dev badge notification.

    loadBadge('staff'); // Dev badge notification.

    loadBadge('mod'); // Dev badge notification.

    loadBadge('bug');
  }
}

async function loadBadge(key) {
  if (cacheBadgeViewed[key]) {
    return;
  }

  ;
  cacheBadgeViewed[key] = true;

  if (!cacheUser.badgesNotified) {
    cacheUser.badgesNotified = [];
  }

  if (!cacheUser.badges) {
    cacheUser.badges = [];
  }

  if (cacheUser.badges && cacheUser.badges.includes(key) && !cacheUser.badgesNotified.includes(key)) {
    await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `users/${user.uid}`), {
      badgesNotified: (0, _firestore.arrayUnion)(key)
    });
    jsConfetti.addConfetti({
      confettiColors: ['#F25E92', '#3267FF']
    });

    switch (key) {
      case 'early':
        snac('Badge Added', 'Thanks for being an early user! An "early user" badge has been added to your profile.', 'success', 6999);
        break;

      case 'staff':
        snac('Badge Added', 'Welcome to the team! A "staff" badge has been added to your profile.', 'success', 6999);
        break;

      case 'mod':
        snac('Badge Added', 'A "mod" badge has been added to your profile.', 'success', 6999);
        break;

      default:
        snac('Badge Added', 'A badge has been added to your profile.', 'success', 6999);
        break;
    }
  }
}

function loadWindowSizeListener() {
  $(window).on('resize', resizeListener);
  resizeListener();
}

const resizeListener = () => {
  window.clearInterval(windowResizeTimeout);
  windowResizeTimeout = window.setTimeout(function () {
    if ($(window).width() < 800) {
      if (localStorage.getItem('display') !== 'mobile') {
        // openModal('mobileWarning');
        $(`#mobileWarningButton`).get(0).onclick = () => {
          (0, _display.closeModal)();
          setDisplay('mobile');
        };
      }
    } else if (localStorage.getItem('display') == 'mobile') {
      // openModal('desktopWarning');
      $(`#desktopWarningButton`).get(0).onclick = () => {
        (0, _display.closeModal)();
        setDisplay('desktop');
      };
    }
  }, 1599);
};

function startTutorial() {
  introJs().setOptions({
    steps: [{
      title: `Welcome to Parallel!`,
      intro: "Click next to learn about the app's layout."
    }, {
      element: document.querySelector('#friendsServer'),
      title: `Friends`,
      intro: "Manage and chat with your friends here.",
      position: 'right'
    }, {
      element: document.querySelector('#musicServer'),
      title: `Music`,
      intro: "Listen to music, and view friends' listening here.",
      position: 'right'
    }, {
      element: document.querySelector('#addServer'),
      title: `Groups`,
      intro: "Create or join custom groups (group chats) here.",
      position: 'right'
    }, {
      element: document.querySelector('#accountDetails'),
      title: `Account`,
      intro: "Update your profile and manage application settings here.",
      position: 'right'
    }, {
      element: document.querySelector('#musicServer'),
      title: `Tracks`,
      intro: "Make sure to report any tracks if it plays the incorrect song by right-clicking the track. If you find a missing track, you can report it with the question mark icon on the search tab."
    }, {
      element: document.querySelector('#replayIntro'),
      title: `Replay Intro`,
      intro: "Feel free to replay this intro by clicking here. Have fun with Parallel!"
    }]
  }).start();
}

window.replayIntro = () => {
  startTutorial();
};
},{"../css/home.css":"css/home.css","./servers":"js/servers.js","./friends":"js/friends.js","./voice":"js/voice.js","./library":"js/library.js","./settings":"js/settings.js","./display":"js/display.js","./presence":"js/presence.js","./stripe":"js/stripe.js","./music":"js/music.js","./channels":"js/channels.js","./electron":"js/electron.js","./firebaseChecks":"js/firebaseChecks.js"}],"js/display.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addOnclickByID = addOnclickByID;
exports.arrayDifference = arrayDifference;
exports.bookmarksArrayDifference = bookmarksArrayDifference;
exports.closeEmojiPicker = closeEmojiPicker;
exports.closeGifPicker = closeGifPicker;
exports.closeModal = closeModal;
exports.collapseMusicPopout = collapseMusicPopout;
exports.commonArrayDifference = commonArrayDifference;
exports.createEmptyVideoTrack = exports.createEmptyAudioTrack = void 0;
exports.decode = decode;
exports.disableButton = disableButton;
exports.disableDMCallUI = disableDMCallUI;
exports.displayImageAnimation = displayImageAnimation;
exports.displayInputEffect = displayInputEffect;
exports.displaySystemNotification = displaySystemNotification;
exports.dmKEYify = dmKEYify;
exports.enableButton = enableButton;
exports.encode = encode;
exports.expandMusicPopout = expandMusicPopout;
exports.fadeOutFullscreenImage = fadeOutFullscreenImage;
exports.fileTypeMatches = fileTypeMatches;
exports.filesArrayDifference = filesArrayDifference;
exports.friendsArrayDifference = friendsArrayDifference;
exports.hidePlaybackButton = hidePlaybackButton;
exports.hidePlaybackView = hidePlaybackView;
exports.hideServerCallUI = hideServerCallUI;
exports.hideUploadProgress = hideUploadProgress;
exports.insertAtCursor = insertAtCursor;
exports.isObjEmpty = isObjEmpty;
exports.isThisAFile = isThisAFile;
exports.linkify = linkify;
exports.messageHTMLtoText = messageHTMLtoText;
exports.openModal = openModal;
exports.playlistArrayDifference = playlistArrayDifference;
exports.returnProperAttachmentURL = returnProperAttachmentURL;
exports.returnProperLinkThumbnail = returnProperLinkThumbnail;
exports.returnProperURL = returnProperURL;
exports.scrollBottomMessages = scrollBottomMessages;
exports.scrollBottomMessagesDM = scrollBottomMessagesDM;
exports.searchGifs = searchGifs;
exports.securityConfirmText = securityConfirmText;
exports.securityConfirmTextIDs = securityConfirmTextIDs;
exports.setNoTrackUI = setNoTrackUI;
exports.setTrackUI = setTrackUI;
exports.showDMCall = showDMCall;
exports.showDroplet = showDroplet;
exports.showInAppNotification = showInAppNotification;
exports.showPlaybackButton = showPlaybackButton;
exports.showPlaybackView = showPlaybackView;
exports.showServerCallUI = showServerCallUI;
exports.showUploadProgress = showUploadProgress;
exports.shuffleArray = shuffleArray;
exports.tConvert = tConvert;
exports.timer = timer;
exports.windowSelected = windowSelected;

var _app = require("./app");

var _friends = require("./friends");

var _library = require("./library");

var _music = require("./music");

var _settings = require("./settings");

var _servers = require("./servers");

var _presence = require("./presence");

var _voice = require("./voice");

var _emojiPickerElement = require("emoji-picker-element");

var _electron = require("./electron");

var _sounds = require("./sounds");

var _stripe = require("./stripe");

window.noTrackTimeout = null;
window.modalOpen = false;
window.closeOnEnter = false;

window.primaryActionFunc = () => {};

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

function timer(ms) {
  return new Promise(res => setTimeout(res, ms));
}

tippy.setDefaultProps({
  // Props
  placement: 'right',
  arrow: false,
  dynamicTitle: true,
  animation: 'shift-toward'
});

$(`#pfpseudoelement`).get(0).onclick = () => (0, _servers.openSpecialServer)('account');

tippy('#serverAddButton', {
  content: 'Join a Group',
  placement: 'top'
});
tippy('#serverViewRequestsButton', {
  content: 'View Outgoing Requests',
  placement: 'top'
});
tippy('#musicPopoutFront', {
  content: 'Expand',
  placement: 'top'
});
tippy('#collapsePopout', {
  content: 'Collapse',
  placement: 'top'
});
tippy('#bookmarksCloseButton', {
  content: 'Close',
  placement: 'top'
});
tippy('#trackMoreOptions', {
  content: 'More Options',
  placement: 'top'
});
tippy(`#newFriendButton`, {
  content: 'Add Friend',
  placement: 'top'
});
tippy(`#friendSortButton`, {
  content: 'Toggle Sort',
  placement: 'top'
});
tippy(`#storageSortButton`, {
  content: 'Toggle Sort',
  placement: 'top'
});
tippy(`#bookmarksButton`, {
  content: 'Bookmarks',
  placement: 'top'
});
tippy(`#keycodesButton`, {
  content: 'Details',
  placement: 'top'
});
tippy('#friendsServer', {
  content: 'Friends'
});
tippy(`#refreshFriendsButton`, {
  content: 'Refresh Playlists',
  placement: 'top'
});
tippy(`#voiceChatButtonVideoFriends`, {
  content: 'Stream Video',
  placement: 'top'
});
tippy(`#voiceChatButtonScreenFriends`, {
  content: 'Stream Screen',
  placement: 'top'
});
tippy('#voiceChatStopWatchingButton3', {
  content: 'Stop Watching',
  placement: 'top'
});
tippy('#DMEndCall', {
  content: 'Leave Voice',
  placement: 'top'
});
tippy('#dmMuteButton', {
  content: 'Mute',
  placement: 'top'
});
tippy('#dmDeafenButton', {
  content: 'Deafen',
  placement: 'top'
});
tippy(`#questionMarkButton`, {
  content: 'Request a Track',
  placement: 'top'
});

$(`#voiceChatStopWatchingButton3`).onclick = () => {
  (0, _voice.leaveVideoDM)(connectedToVideo);
};

$(`#friendsServer`).get(0).onclick = () => (0, _servers.openSpecialServer)('friends');

tippy('#newPlaylistButton', {
  content: 'New Playlist',
  placement: 'top'
});
tippy('#newPlaylistFolderButton', {
  content: 'New Playlist Folder',
  placement: 'top'
});
tippy('#musicServer', {
  content: 'Music'
});

$(`#musicServer`).get(0).onclick = () => (0, _servers.openSpecialServer)('music');

tippy('#addServer', {
  content: 'Add a Group'
});

$(`#addServer`).get(0).onclick = () => openDropdown('addServerDropdown');

tippy('#infiniteServer', {
  content: 'Parallel Infinite'
});

$(`#infiniteServer`).get(0).onclick = () => (0, _servers.openSpecialServer)('infinite');

try {
  Object.defineProperty(String.prototype, 'capitalize', {
    value: function () {
      return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false
  });
} catch (error) {}

displayInputEffect();

function displayInputEffect() {
  $('input').on('focusin', function () {
    $(this).parent().find('label').addClass('active');
  });
  $('input').on('focusout', function () {
    if (!this.value) {
      $(this).parent().find('label').removeClass('active');
    }
  });
}

;

async function openModal(id) {
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
      (0, _friends.friendEventListeners)();
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
      addOnclickByID('supportContactButtonModal', () => {
        closeModal();
        window.setTimeout(() => {
          openModal('contact');
        }, 619);
      });
      closeOnEnter = true;
      break;

    case 'userProfile':
      closeOnEnter = true;
      break;

    case 'updatedApp':
      closeOnEnter = true; // Fetch update data.

      const data = await (0, _app.ghChangelog)();
      console.log(data);
      $(`#whatsChangedTitle`).html(`What's New?`);
      $(`#whatsChanged`).html(data);
      break;

    case 'updateAvailable':
      // Click the primary action button. 
      window.primaryActionFunc = () => {
        $(`#modalContent`).find(`.b-1`).get(0).click();
      };

      break;

    case 'leavePartyCheck':
      // Click the primary action button. 
      window.primaryActionFunc = () => {
        $(`#modalContent`).find(`.b-1`).get(0).click();
      };

      break;

    case 'confirmTransfer':
      // Click the primary action button.
      window.primaryActionFunc = () => {
        $(`#modalContent`).find(`.b-1`).get(0).click();
      };

      break;

    case 'mediaStreamUpdate':
      // Click the primary action button.
      window.primaryActionFunc = () => {
        $(`#modalContent`).find(`.b-1`).get(0).click();
      };

      break;

    case 'requestTrack':
      // Click the primary action button.
      window.primaryActionFunc = () => {
        $(`#modalContent`).find(`.b-1`).get(0).click();
      };

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
      window.primaryActionFunc = () => {
        $(`#modalContent`).find(`.b-1`).get(0).click();
      };

      break;

    case 'createGroup':
      window.primaryActionFunc = () => {
        $(`#modalContent`).find(`.b-1`).get(0).click();
      };

      $(`#newGroupName`).get(0).focus();
      break;

    case 'createGroupFolder':
      window.primaryActionFunc = () => {
        $(`#modalContent`).find(`.b-1`).get(0).click();
      };

      $(`#newGroupFolderName`).get(0).focus();
      break;

    case 'joinGroup':
      window.primaryActionFunc = () => {
        $(`#modalContent`).find(`.b-1`).get(0).click();
      };

      $(`#inviteCodeField`).get(0).focus();
      break;

    case 'reportItem':
      window.primaryActionFunc = () => {
        $(`#modalContent`).find(`.b-1`).get(0).click();
      };

      break;

    case 'kickMember':
      window.primaryActionFunc = () => {
        $(`#modalContent`).find(`.b-1`).get(0).click();
      };

      break;

    case 'blockUser':
      window.primaryActionFunc = () => {
        $(`#modalContent`).find(`.b-1`).get(0).click();
      };

      break;

    case 'updateSharing':
      window.primaryActionFunc = () => {
        $(`#modalContent`).find(`.b-1`).get(0).click();
      };

      break;

    case 'unblockUser':
      window.primaryActionFunc = () => {
        $(`#modalContent`).find(`.b-1`).get(0).click();
      };

      break;

    case 'deleteFolder':
      window.primaryActionFunc = () => {
        $(`#modalContent`).find(`.b-1`).get(0).click();
      };

      break;

    case 'deleteLounge':
      window.primaryActionFunc = () => {
        $(`#modalContent`).find(`.b-1`).get(0).click();
      };

      break;

    case 'deleteFriend':
      window.primaryActionFunc = () => {
        $(`#modalContent`).find(`.b-1`).get(0).click();
        closeModal();
      };

      break;

    case 'deletePlaylist':
      window.primaryActionFunc = () => {
        $(`#modalContent`).find(`.b-1`).get(0).click();
      };

      break;

    case 'mobileWarning':
      window.primaryActionFunc = () => {
        $(`#modalContent`).find(`.b-1`).get(0).click();
      };

      break;

    case 'desktopWarning':
      window.primaryActionFunc = () => {
        $(`#modalContent`).find(`.b-1`).get(0).click();
      };

      break;

    case 'clonePlaylist':
      window.primaryActionFunc = () => {
        $(`#modalContent`).find(`.b-1`).get(0).click();
      };

      break;

    case 'removePlaylistFromLibrary':
      window.primaryActionFunc = () => {
        $(`#modalContent`).find(`.b-1`).get(0).click();
      };

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
    $(object).get(0).onclick = () => closeModal();
  });
}

function closeModal() {
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
  }, 300); // If user modal, cancel the query.

  try {
    cancelUserQuery();
  } catch (error) {}

  fullProfileActive = false;
} // Enter on click


$('#searchMusic').get(0).addEventListener("keyup", event => {
  if (event.keyCode === 13) {
    $('#musicSearchButton').get(0).click();
  } // Gather search suggesstions with timeouts


  window.clearTimeout(searchTimeout);
  searchTimeout = window.setTimeout(async () => {
    if (!$('#searchMusic').val()) {
      $('#searchSuggestions').empty();
      return;
    }

    ;
    const suggestions = await makeMusicRequest(`search/suggestions?kinds=terms&term=${$('#searchMusic').val()}`);
    $('#searchSuggestions').empty();
    suggestions.results.suggestions.forEach(suggestion => {
      const a = document.createElement('div');
      a.setAttribute('class', 'searchSuggestionMusic');
      a.innerHTML = suggestion.displayTerm;

      a.onclick = () => {
        $('#searchMusic').val(suggestion.searchTerm);
        $('#musicSearchButton').get(0).click();
      };

      $('#searchSuggestions').append(a);
    });
  }, 299);
});
$(`#searchSpotifyPlaylistID`).get(0).addEventListener("keyup", event => {
  if (event.keyCode === 13) {
    (0, _music.spotifyPlaylistLookup)();
  }
}); // Shuffle array

function shuffleArray(array) {
  // Fisher-Yates shuffle
  let currentIndex = array.length,
      randomIndex; // While there remain elements to shuffle...

  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--; // And swap it with the current element.

    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
} // Difference objects function.  https://gomakethings.com/getting-the-differences-between-two-objects-with-vanilla-js/


window.diff = function (t, e) {
  if (!e || "[object Object]" !== Object.prototype.toString.call(e)) return t;

  var r,
      n = {},
      o = function (t, e, r) {
    var o = Object.prototype.toString.call(t),
        i = Object.prototype.toString.call(e);
    if ("[object Undefined]" !== i) {
      if (o === i) {
        if ("[object Object]" !== o) "[object Array]" !== o ? "[object Function]" === o ? t.toString() !== e.toString() && (n[r] = e) : t !== e && (n[r] = e) : function (t, e) {
          if (t.length !== e.length) return !1;

          for (var r = 0; r < t.length; r++) if (t[r] !== e[r]) return !1;

          return !0;
        }(t, e) || (n[r] = e);else {
          var c = diff(t, e);
          Object.keys(c).length > 0 && (n[r] = c);
        }
      } else n[r] = e;
    } else n[r] = null;
  };

  for (r in t) t.hasOwnProperty(r) && o(t[r], e[r], r);

  for (r in e) e.hasOwnProperty(r) && (t[r] || t[r] === e[r] || (n[r] = e[r]));

  return n;
}; // Insert el at index via $().insertIndex()


$.fn.insertIndex = function (e) {
  var t = this.parent().children().eq(e);
  return this.index() > e ? t.before(this) : t.after(this), this;
}; // is object empty


function isObjEmpty(obj) {
  return Object.keys(obj).length === 0;
}

function arrayDifference(oldArray, newArray) {
  const difference = newArray.filter(({
    id: id1
  }) => !oldArray.some(({
    id: id2
  }) => id2 === id1));
  return difference;
}

function playlistArrayDifference(oldArray, newArray) {
  const difference = newArray.filter(({
    trackID: id1,
    randomID: uint1
  }) => !oldArray.some(({
    trackID: id2,
    randomID: uint2
  }) => id2 === id1 && uint1 === uint2));
  return difference;
}

function friendsArrayDifference(oldArray, newArray) {
  const difference = newArray.filter(({
    u: id1
  }) => !oldArray.some(({
    u: id2
  }) => id2 === id1));
  return difference;
}

function commonArrayDifference(oldArray, newArray) {
  let difference = oldArray.filter(x => !newArray.includes(x));
  return difference;
}

function filesArrayDifference(oldArray, newArray) {
  const difference = newArray.filter(({
    filePath: filePath1
  }) => !oldArray.some(({
    filePath: filePath2
  }) => filePath1 === filePath2));
  return difference;
}

function bookmarksArrayDifference(oldArray, newArray) {
  const difference = newArray.filter(({
    id: messageid1
  }) => !oldArray.some(({
    id: messageid2
  }) => messageid1 === messageid2));
  return difference;
}

function linkify(message) {
  return message.replace(/((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a target="_blank" href=" $1 ">$1</a> ');
}

function messageHTMLtoText(elementID, elementInput) {
  let element = null;

  if (elementInput) {
    element = $(elementInput);
  } else {
    element = $(`#${elementID}`);
  }

  element.children('img.emoji').each(function () {
    const alt = $(this).get(0).alt;
    $(this).replaceWith(alt);
  });
  const savedInnerText = element.get(0).innerText;
  twemoji.parse(element.get(0));
  return savedInnerText;
}

function decode(r) {
  for (var e = "", n = (r = r.slice(2)).length, o = 0; o < n;) {
    var t = r.slice(o, o += 2);
    e += String.fromCharCode(parseInt(t, 16));
  }

  return e;
}

function encode(n) {
  for (var r = "0x", t = n.length, e = 0; e < t; e++) r += n.charCodeAt(e).toString(16);

  return r;
}

window.decode2 = r => {
  for (var e = "", n = (r = r.slice(2)).length, o = 0; o < n;) {
    var t = r.slice(o, o += 2);
    e += String.fromCharCode(parseInt(t, 16));
  }

  return e;
};

window.encode2 = n => {
  for (var r = "0x", t = n.length, e = 0; e < t; e++) r += n.charCodeAt(e).toString(16);

  return r;
};

window.addEventListener('online', function (e) {
  window.location.reload();
}, false);
window.addEventListener('offline', function (e) {
  console.log('Client has become offline.');
  $('#offlineView').removeClass('fadeOut');
  $('#offlineView').addClass('fadeIn');
  $('#offlineView').removeClass('hidden');
}, false);

function tConvert(t) {
  return 1 < (t = t.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [t]).length && ((t = t.slice(1))[5] = +t[0] < 12 ? ":AM" : ":PM", t[0] = +t[0] % 12 || 12), t = (t = (t = t.join("")).split(":"))[0] + ":" + t[1] + " " + t[3];
}

function securityConfirmText(str) {
  let doc = new DOMParser().parseFromString(str, 'text/html');
  return doc.body.textContent || "";
}

function securityConfirmTextIDs(stringInput, allowSpaces) {
  let str = stringInput;
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

function disableButton(jQElement) {
  jQElement.addClass('disabled');
  jQElement.html(`<i style="font-size: 15px;" class='bx bx-time animated pulse faster infinite'></i>`);
}

function enableButton(jQElement, newText) {
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

function dmKEYify(a, b) {
  const array = [a, b];
  array.sort();
  return array[0] + array[1];
}

function scrollBottomMessages(cID) {
  // Only scroll down if you're near the bottom.
  const obj = $(`#${cID}ChatMessages`).get(0);

  if (obj.scrollHeight - obj.offsetHeight - obj.scrollTop < 1000) {
    // Scroll is less than 1000px from the bottom.
    $(`#${cID}ChatMessages`).get(0).scrollTop = $(`#${cID}ChatMessages`).get(0).scrollHeight - $(`#${cID}ChatMessages`).get(0).clientHeight; // $(`#${cID}ChatMessages`).animate({
    //   scrollTop: $(`#${cID}ChatMessages`).get(0).scrollHeight - $(`#${cID}ChatMessages`).get(0).clientHeight
    // }, 250);
  }
}

function scrollBottomMessagesDM(uID) {
  const obj = $(`#DMMessages${uID}`).get(0);

  if (obj.scrollHeight - obj.offsetHeight - obj.scrollTop < 1000) {
    // Scroll is less than 1000px from the bottom.
    $(`#DMMessages${uID}`).get(0).scrollTop = $(`#DMMessages${uID}`).get(0).scrollHeight - $(`#DMMessages${uID}`).get(0).clientHeight; // $(`#DMMessages${uID}`).animate({
    //   scrollTop: $(`#DMMessages${uID}`).get(0).scrollHeight - $(`#DMMessages${uID}`).get(0).clientHeight
    // }, 250);
  }
}

function windowSelected() {
  // Window selected AND activity timer.
  return true; // To do
}

window.copyToClipboard = textToCopy => {
  navigator.clipboard.writeText(textToCopy).then(() => {
    snac('Copied', 'Text copied to clipboard');
  }).catch(err => {
    window.prompt("Copy to clipboard:", textToCopy);
  });
};

window.onclick = function (event) {
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
};

window.openDropdown = dropdownID => {
  if ($(`#${dropdownID}`).hasClass('show')) {
    $(`#${dropdownID}`).removeClass('show');
    return;
  }

  $(`#${dropdownID}`).addClass('show');
};

function lyricsEventListeners() {
  if (cacheUser.lyrics && cacheUser.lyrics.lyrics) {
    $('#lyricsField').val(cacheUser.lyrics.lyrics);
  }

  if (cacheUser.lyrics && cacheUser.lyrics.author) {
    $(`#lyricsAuthorField`).val(cacheUser.lyrics.author);
  }

  $(`#updateLyricsConfirmButton`).get(0).onclick = () => (0, _app.updateLyrics)();
}

function bioEventListeners() {
  if (cacheUser.bio) {
    $('#aboutMeBio').val(cacheUser.bio);
  }

  $(`#updateBiographyConfirmButton`).get(0).onclick = () => (0, _app.updateBiography)();
}

document.onpaste = function (event) {
  const items = (event.clipboardData || event.originalEvent.clipboardData).items;

  for (const index in items) {
    const item = items[index];

    if (item.kind === 'file') {
      const blob = [item.getAsFile()];

      if (currentServer == 'friends' && currentChannel) {
        processDMAttachments(currentChannel, blob);
      } else if (currentServer && currentServerUser && currentChannel) {
        processAttachment(`${currentServerUser}${currentServer}${currentChannel}`, blob);
      }
    }
  }
};

function showUploadProgress() {
  $('#uploadProgressNumber').html('Upload Progress: 0%');
  $('#uploadProgress').removeClass('hidden');
  $('#uploadProgressContent').removeClass('fadeOutUp');
  $('#uploadProgressContent').addClass('fadeInDown');
  window.clearTimeout(uploadProgressTimeout);
}

function hideUploadProgress() {
  $('#uploadProgressContent').removeClass('fadeInDown');
  $('#uploadProgressContent').addClass('fadeOutUp');
  uploadProgressTimeout = window.setTimeout(() => {
    $('#uploadProgress').addClass('hidden');
  }, 450);
}

function showDroplet() {
  const leftPosition = event.clientX;
  const topPosition = event.clientY;
  const a = document.createElement('div');
  a.setAttribute('class', 'droplet animated fadeIn');
  a.setAttribute('style', `left: ${leftPosition}px; top: ${topPosition}px`);
  a.id = 'dropletTemporary';
  document.body.appendChild(a);
  window.setTimeout(() => {
    a.classList.add('dropletAnimation');
  }, 250);
  window.setTimeout(() => {
    $('#dropletTemporary').remove();
  }, 1750);
}

window.fullscreenImage = imageID => {
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
  };

  a.src = fullSource;
  a.setAttribute('class', 'fullscreenImageElement hidden');
  document.body.appendChild(a);
  $('#fullscreenImageElementWallpaper').removeClass('hidden');
  $('#fullscreenImageElementWallpaper').removeClass('fadeOut');
  $('#fullscreenImageElementWallpaper').addClass('fadeIn');
  $(`#fullscreenImageElement`).get(0).addEventListener('load', () => {
    $(`#fullscreenImageElement`).removeClass('hidden');
    window.setTimeout(() => {
      $(`#fullscreenImageElement`).addClass('fullscreenImageAnimation');
    }, 9);
  });
};

function fadeOutFullscreenImage() {
  fullScreenActive = false;
  $('#fullscreenImageElementWallpaper').removeClass('fadeIn');
  $('#fullscreenImageElementWallpaper').addClass('fadeOut');
  $('#fullscreenImageElement').removeClass('fullscreenImageAnimation');
  window.setTimeout(() => {
    $(`#fullscreenImageElementWallpaper`).addClass('hidden');
    $(`#fullscreenImageElement`).remove();
  }, 299); // Select text field.

  if (currentServerUser) {
    $(`#${currentServerUser}${currentServer}${currentChannel}ChatMessageInput`).get(0).focus();
  } else {
    $(`#${currentChannel}ChatMessageInput`).get(0).focus();
  }
}

$('#DMEndCall').get(0).onclick = async () => {
  (0, _voice.endAllCalls)();
};

async function showDMCall(uID, username) {
  enableDMCallUI();
  $('#dmconnectedusername').html(`${username}`);

  $(`#voiceChatButtonVideoFriends`).get(0).onclick = () => {
    (0, _voice.shareVideoDM)(uID);
  };

  $(`#voiceChatButtonScreenFriends`).get(0).onclick = () => {
    (0, _voice.shareScreenDM)(uID);
  };

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

function disableDMCallUI() {
  $("#friendsServer").removeClass('inCallServer');
  $(".friendCallView").addClass('fadeOutDown');
  $(".friendCallView").removeClass('fadeInUp');
  $(`#topFriendViewLeft`).removeClass("topFriendViewLeftInCall");
  window.setTimeout(() => {
    $(".friendCallView").addClass('hidden');
  }, 200);
} // Music


async function setNoTrackUI() {
  showPlaybackView();
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
  }, 999); // Animate track title & author

  $(`#currentTrackTitle`).html('Fetching..');
  $(`#currentTrackAuthor`).addClass('waiting');
  window.setTimeout(() => {
    const trackTitleWidth = $(`#currentTrackTitle`).width();
    const trackAuthorWidth = $(`#currentTrackAuthor`).width();
    let targetContainerWidth = trackTitleWidth;

    if (trackAuthorWidth > trackTitleWidth) {
      targetContainerWidth = trackAuthorWidth;
    }

    if (targetContainerWidth < 5) {
      // Error
      return;
    }

    $(`#currentTrackDetailsContainer`).css('width', `${targetContainerWidth}px`);
  }, 499);
}

async function setTrackUI(trackDetails) {
  showPlaybackView();
  $(`#currentTrackLoading`).removeClass('zoomIn');
  $(`#currentTrackLoadingMini`).removeClass('zoomIn');
  $(`#currentTrackLoading`).addClass('zoomOut');
  $(`#currentTrackLoadingMini`).addClass('zoomOut');
  $(`#currentTrackAuthor`).removeClass('waiting');
  window.clearTimeout(noTrackTimeout);
  noTrackTimeout = window.setTimeout(() => {
    $(`#currentTrackLoading`).addClass('hidden');
    $(`#currentTrackLoadingMini`).addClass('hidden');
    $(`#currentTrackCover`).removeClass('zoomOut');
    $(`#currentTrackCoverMini`).removeClass('zoomOut');
    $(`#currentTrackCover`).addClass('zoomIn');
    $(`#currentTrackCoverMini`).addClass('zoomIn');
    $(`#currentTrackCover`).removeClass('hidden');
    $(`#currentTrackCoverMini`).removeClass('hidden');
  }, 500);
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
    trackDetails.relationships.albums.data[0].id && openAlbum(trackDetails.relationships.albums.data[0].id);
  };

  window.setTimeout(() => {
    const trackTitleWidth = $(`#currentTrackTitle`).width();
    const trackAuthorWidth = $(`#currentTrackAuthor`).width();
    let targetContainerWidth = trackTitleWidth;

    if (trackAuthorWidth > trackTitleWidth) {
      targetContainerWidth = trackAuthorWidth;
    }

    if (targetContainerWidth < 5) {
      // Error
      return;
    }

    $(`#currentTrackDetailsContainer`).css('width', `${targetContainerWidth}px`);
  }, 499);
}

function expandMusicPopout() {
  musicPoppedOut = true;
  $('#musicPopoutButton').addClass('musicPopoutExpanded');
  $(`#musicPopoutFront`).addClass('fadeOut');
  $(`#musicPopoutFront`).removeClass('fadeIn');
  window.setTimeout(() => {
    $(`#musicPopoutFront`).addClass('hidden');
    $('#musicPopoutHidden').removeClass('hidden');
    $('#musicPopoutHidden').removeClass('fadeOut');
    $('#musicPopoutHidden').addClass('fadeIn');
  }, 400);
}

function collapseMusicPopout() {
  musicPoppedOut = false;
  $('#musicPopoutHidden').removeClass('fadeIn');
  $('#musicPopoutHidden').addClass('fadeOut');
  $(`#musicPopoutFront`).removeClass('fadeOut');
  $(`#musicPopoutFront`).addClass('fadeIn');
  window.setTimeout(() => {
    $('#musicPopoutButton').removeClass('musicPopoutExpanded');
    $('#musicPopoutHidden').addClass('hidden');
    $(`#musicPopoutFront`).removeClass('hidden');
  }, 400);
}

function showPlaybackView() {
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
  `);

  if (currentServer !== 'music') {
    showPlaybackButton();
  }
}

function fileTypeMatches(matches) {
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

function hidePlaybackView() {
  (0, _presence.clearMusicStatus)();
  window.playbackViewActive = false;
  hideQueueButton();
  $('#musicContent').removeClass('musicContentMusicShown');
  $('#musicPlayback').addClass('fadeOutDown');
  $('#musicPlayback').removeClass('fadeInUp');
  playbackViewTimeout = window.setTimeout(() => {
    $('#musicPlayback').addClass('hidden');
  }, 850);
  $('.friendViewLeft').css('height', '');
  $(`#musicViewInjection`).html(``);
  $(`#musicServer`).removeClass('inCallServer');
  $(`#libraryPlayer`).get(0).src = '';
  hidePlaybackButton();
}

function showPlaybackButton() {
  if (!playbackViewActive) {
    return;
  }

  window.clearTimeout(clearHidePlayback);
  $(`#musicPopoutButton`).removeClass('hidden');
  $(`#musicPopoutButton`).removeClass('fadeOutDown');
  $(`#musicPopoutButton`).addClass('fadeInUp');
}

function hidePlaybackButton() {
  collapseMusicPopout();
  $(`#musicPopoutButton`).addClass('fadeOutDown');
  $(`#musicPopoutButton`).removeClass('fadeInUp');
  clearHidePlayback = window.setTimeout(() => {
    $(`#musicPopoutButton`).addClass('hidden');
  }, 800);
} // Voice chat


function showServerCallUI(guildUID, guildID, channelID) {
  for (let i = 0; i < serverData[guildUID + guildID].channels.length; i++) {
    if (serverData[guildUID + guildID].channels[i].split('.').shift() == channelID) {
      $(`#connectedName${guildUID}${guildID}`).html(`<span><i class="bx bxs-bolt lightningAnimation"></i><p>Connected</p></span><br><div id="${guildUID}${guildID}VCConnectedText">${serverData[guildUID + guildID].channels[i].split('.').pop()}</div>`);
      break;
    }
  }

  $(`#${guildUID}${guildID}Server`).addClass('inCallServer');
  $(`#VCsidebarLeft${guildUID}${guildID}`).removeClass('fadeOutDown');
  $(`#VCsidebarLeft${guildUID}${guildID}`).addClass('fadeInUp');
  $(`#VCsidebarLeft${guildUID}${guildID}`).removeClass('hidden');

  $(`#${guildUID}${guildID}EndCallButton`).get(0).onclick = () => {
    (0, _voice.endAllCalls)();
  };

  $(`#${guildUID}${guildID}${channelID}voiceChatButton`).get(0)._tippy.setContent(`Leave Voice`);

  $(`#sidebarLeft${guildUID}${guildID}`).addClass('sidebarLeftInCall');
}

function hideServerCallUI(guildUID, guildID, channelID) {
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

function returnProperURL(uID) {
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
  });
}

function returnProperAttachmentURL(imageURL) {
  return new Promise((resolve, reject) => {
    if (imageURL.toLowerCase().endsWith('.mp4?alt=media') || imageURL.toLowerCase().endsWith('.mov?alt=media') || imageURL.toLowerCase().endsWith('.webm?alt=media')) {
      var video = document.createElement('video');

      video.onloadeddata = function () {
        resolve(imageURL);
        console.log('here');
      };

      video.onerror = function () {
        resolve(`https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/app%2FmissingFile.png?alt=media`);
      };

      console.log('here');
      video.src = imageURL;
      video = null;
    } else if (imageURL.toLowerCase().endsWith('.png?alt=media') || imageURL.toLowerCase().endsWith('.jpg?alt=media') || imageURL.toLowerCase().endsWith('.jpeg?alt=media')) {
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
    } else if (imageURL.toLowerCase().endsWith('.mp3?alt=media')) {
      resolve(imageURL);
    } else {
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
  });
}

function returnProperLinkThumbnail(link, index, messageID) {
  return new Promise((resolve, reject) => {
    $(`#${messageID}LinkNum${index}`).get(0).onerror = () => {
      $(`#${messageID}LinkNum${index}`).addClass('hidden');
    };

    $(`#${messageID}LinkNum${index}`).get(0).onload = () => {
      $(`#${messageID}LinkNum${index}`).removeClass('invisible');
    };

    $(`#${messageID}LinkNum${index}`).get(0).setAttribute('src', link.image);
    resolve(true);
  });
}

function displayImageAnimation(imageID) {
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
    };
  }
}

function displaySystemNotification(TITLE, BODY, HANDLER, UID, username) {
  (0, _sounds.playNotification)(); // If window focused

  if (document.hasFocus()) {
    showInAppNotification(TITLE, BODY, UID, HANDLER); // In-app notification
  } else {
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

    if ((0, _electron.returnIsElectron)() && (0, _settings.retrieveSetting)('desktopNotifications', true)) {
      sendToElectron('notification', {
        title: TITLE,
        body: BODY,
        hasReply: true,
        uid: UID,
        silent: true,
        username: username
      });
    } else if ((0, _settings.retrieveSetting)('desktopNotifications', true)) {
      const notification = new Notification(TITLE, {
        body: BODY,
        hasReply: true
      });
      notification.onclick = HANDLER;
      console.log('Sending notification of title, ', TITLE);
    }
  }
}

try {
  require('electron').ipcRenderer.on('notificationClicked', (event, message) => {
    if (message.uid && message.username) {
      switchAndOpenFriendsDM(message.uid, message.username);
    }
  });

  require('electron').ipcRenderer.on('notificationReplied', (event, message) => {
    if (message.uid && message.reply && message.username) {
      switchAndOpenFriendsDM(message.uid, message.username);
      sendDMMessage(message.uid, message.reply);
    }
  });
} catch (error) {} // $('#incomingCallImage').get(0).setAttribute('crossOrigin', '');
// $('#incomingCallImage').get(0).addEventListener('load', () => processCallColors());


$('#DMConnectedImg').get(0).setAttribute('crossOrigin', '');
$('#DMConnectedImg').get(0).addEventListener('load', () => processConnectingColors());

function processCallColors() {
  const colors = colorThief.getColor($(`#incomingCallImage`).get(0));
  $(`#incomingCall`).get(0).setAttribute('style', `background-color: rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, 1)`);

  if (colors[0] * 0.299 + colors[1] * 0.587 + colors[2] * 0.114 > 186) {
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

    if (colors[0] * 0.299 + colors[1] * 0.587 + colors[2] * 0.114 > 186) {
      $(`.friendCallView`).get(0).style.color = '#000';
      $(`.friendCallView`).get(0).style.color = '#000';
    } else {
      $(`.friendCallView`).get(0).style.color = '#fff';
      $(`.friendCallView`).get(0).style.color = '#fff';
    }

    window.setTimeout(() => {
      $(`#DMConnectedImg`).removeClass('invisible');
      $(`#DMConnectedImg`).addClass('zoomIn');
    }, 800);
  } catch (error) {}
}

const createEmptyAudioTrack = () => {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const dst = oscillator.connect(ctx.createMediaStreamDestination());
  oscillator.start();
  const track = dst.stream.getAudioTracks()[0];
  return Object.assign(track, {
    enabled: false
  });
};

exports.createEmptyAudioTrack = createEmptyAudioTrack;

const createEmptyVideoTrack = ({
  width,
  height
}) => {
  const canvas = Object.assign(document.createElement('canvas'), {
    width,
    height
  });
  canvas.getContext('2d').fillRect(0, 0, width, height);
  const stream = canvas.captureStream();
  const track = stream.getVideoTracks()[0];
  return Object.assign(track, {
    enabled: false
  });
};

exports.createEmptyVideoTrack = createEmptyVideoTrack;

async function showInAppNotification(title, subtitle, profilePhoto, handler) {
  const a = document.createElement('div');
  const date = new Date().getTime();
  a.id = `${date}inAppNotification`;
  a.setAttribute('class', 'inAppNotification animated fadeInRight faster');

  a.onclick = () => {
    handler && handler();
    $(`#${date}inAppNotification`).addClass('inAppNotificationGone');
  };

  a.innerHTML = `
    <img class="hidden" id="inApp${profilePhoto}${date}"></img>
    <b>${title}</b>
    <p>${subtitle}</p>  
  `;
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

window.openGifPicker = async ID => {
  gifPickerOpen = ID; // All to have classes gifPicker

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
      $(`#${ID}gifsPickerGifsContainerTrending`).removeClass('hidden'); // Populate trending gifs https://g.tenor.com/v1/categories

      const fetchResponse = await fetch(`https://g.tenor.com/v1/categories?key=${tenorKey}&contentfilter=low`);
      const response = await fetchResponse.json();
      console.log(response);
      response.tags.map(tag => {
        const a = document.createElement('div');
        a.setAttribute('class', 'trendingGif gifPicker');
        a.innerHTML = `
          <img class="gifPicker" src="${tag.image}" />
          <b class="gifPicker">${tag.searchterm}</b>
        `;

        a.onclick = () => {
          $(`#gifsPickerSearchBox${ID}`).val(tag.searchterm);
          $(`#gifsPickerSearchBox${ID}`).focus();
          searchGifs(ID, true);
        };

        $(`#${ID}gifsPickerGifsContainerTrending`).get(0).appendChild(a);
      });
      $(`#${ID}gifsPickerGifsContainerTrending`).addClass('animated fadeIn faster');
    }
  } else {
    closeGifPicker(ID);
  }
};

async function searchGifs(ID, fast) {
  const searchTerm = $(`#gifsPickerSearchBox${ID}`).val();
  const searchTermLower = searchTerm.toLowerCase().trim();

  if (!searchTermLower) {
    $(`#${ID}gifsPickerGifsContainerSearch`).addClass('hidden');
    $(`#${ID}gifsPickerGifsContainerTrending`).removeClass('hidden');
    return;
  }

  $(`#${ID}gifsPickerGifsContainerTrending`).addClass('hidden');
  $(`#${ID}gifsPickerGifsContainerSearch`).removeClass('hidden'); // Rate limit

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
      a.id = `gifSearch${index}`;
      a.innerHTML = `<b class="gifPicker">${result}</b>`;

      a.onclick = () => {
        $(`#gifsPickerSearchBox${ID}`).val(result);
        $(`#gifsPickerSearchBox${ID}`).focus();
        searchGifs(ID, true);
      };

      $(`#${ID}gifsPickerGifsContainerSearch`).get(0).appendChild(a);
    });
    response.results.map(result => {
      const a = document.createElement('div');
      a.setAttribute('class', 'gif');
      a.id = `gifSearch${result.id}`;

      a.onclick = () => {
        closeGifPicker(ID);
        pendingGif = result.media[0].tinygif.url;

        if (currentServerUser && currentServer !== 'friends') {
          sendChannelChatMessage(currentServerUser, currentServer, currentChannel, true);
        } else {
          sendDMMessage(currentChannel, false, true);
        }
      };

      a.innerHTML = `
        <img id="gifSearchImage${result.id}" src="${result.media[0].tinygif.preview}" />
      `;
      $(`#${ID}gifsPickerGifsContainerSearch`).get(0).appendChild(a);
      $(`#gifSearch${result.id}`).hover(() => {
        $(`#gifSearchImage${result.id}`).attr('src', result.media[0].tinygif.url);
      }, () => {
        $(`#gifSearchImage${result.id}`).attr('src', result.media[0].tinygif.preview);
      });
    });
  }, fast ? 9 : 499);
}

function closeGifPicker(ID) {
  // Close it.
  gifPickerOpen = false;
  $(`#${ID}gifsPickerContainer`).removeClass('postStandardAnimationBottom');
  gifTimeout = window.setTimeout(() => {
    $(`#${ID}gifsPickerContainer`).addClass('hidden');
  }, 299);
}

window.openEmojiPicker = ID => {
  emojiPickerOpen = ID;

  if (!$(`#${ID}emojiPickerContainer`).children().length) {
    const picker = new _emojiPickerElement.Picker({
      locale: 'en'
    });
    $(`#${ID}emojiPickerContainer`).get(0).appendChild(picker);
    const observer = new MutationObserver(mutations => {
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
    `;
    picker.shadowRoot.appendChild(style);
    picker.addEventListener('emoji-click', event => {
      insertAtCursor($(`#${ID}ChatMessageInput`), event.detail.unicode);
      $(`#messageLabel${ID}`).addClass('active'); // On lounges.

      $(`#${ID}chatMessageLabel`).addClass('active'); // On DMs.
    });
  }

  if ($(`#${ID}emojiPickerContainer`).hasClass('hidden')) {
    $(`#${ID}emojiPickerContainer`).removeClass('hidden');
    clearInterval(emojiTimeout);
    window.setTimeout(() => {
      $(`#${ID}emojiPickerContainer`).addClass('postStandardAnimationBottom');
    }, 9);
  } else {
    closeEmojiPicker(ID);
  }
};

function closeEmojiPicker(ID) {
  emojiPickerOpen = false;
  $(`#${ID}emojiPickerContainer`).removeClass('postStandardAnimationBottom');
  emojiTimeout = window.setTimeout(() => {
    $(`#${ID}emojiPickerContainer`).addClass('hidden');
  }, 299);
}

function insertAtCursor(myField, txtToAdd) {
  myField[0].focus();
  const [start, end] = [$(myField)[0].selectionStart, $(myField)[0].selectionEnd];
  $(myField)[0].setRangeText(txtToAdd, start, end, 'select');
  window.setTimeout(() => {
    $(myField)[0].selectionStart = start + txtToAdd.length;
    $(myField)[0].selectionEnd = start + txtToAdd.length;
  }, 9);
}

function isThisAFile(maybeFile) {
  return new Promise(function (resolve, reject) {
    if (maybeFile.type !== '') {
      return resolve(maybeFile);
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      if (reader.error && reader.error.name === 'NotFoundError') {
        return reject(reader.error.name);
      }

      resolve(maybeFile);
    };
  });
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
} // !! ONCLICKS !!


function addOnclickByID(ObjectID, directFunction) {
  $(`#${ObjectID}`).get(0).onclick = directFunction;
}

$(`.infiniteNotice`).each((index, object) => {
  $(object).get(0).onclick = () => {
    (0, _servers.openSpecialServer)('infinite');
  };
});
addOnclickByID('userPopoutsContainerBackground', () => {
  closeUserPopout();
});
addOnclickByID('fullscreenImageElementWallpaper', () => {
  fadeOutFullscreenImage();
});
addOnclickByID('musicPopoutFront', () => {
  expandMusicPopout();
});
addOnclickByID('playerBackwardButtonMini', () => {
  (0, _music.backwardSong)();
  document.activeElement.blur();
});
addOnclickByID('playerForwardButtonMini', () => {
  (0, _music.forwardSong)();
  document.activeElement.blur();
});
addOnclickByID('collapsePopout', () => {
  collapseMusicPopout();
});
addOnclickByID('modal-background', () => {
  closeModal();
});
addOnclickByID('newPlaylistCreateButton', () => {
  (0, _library.createPlaylist)();
});
addOnclickByID('previewRequestButtonFriends', () => {
  prepareFriendRequest();
});
addOnclickByID('submitbtnprofile', () => {
  (0, _app.completeProfile)();
});
addOnclickByID('verifyButton', () => {
  (0, _app.sendVerify)();
});
addOnclickByID('replayIntro', () => {
  (0, _app.startTutorial)();
});
addOnclickByID('settingsTabButton_general', () => {
  (0, _settings.expandTab)('general');
});
addOnclickByID('settingsTabButton_profile', () => {
  (0, _settings.settingsTab)('profile');
});
addOnclickByID('settingsTabButton_account', () => {
  (0, _settings.settingsTab)('account');
});
addOnclickByID('settingsTabButton_appearance', () => {
  (0, _settings.settingsTab)('appearance');
});
addOnclickByID('settingsTabButton_notifications', () => {
  (0, _settings.settingsTab)('notifications');
});
addOnclickByID('settingsTabButton_feedback', () => {
  window.open(`https://docs.google.com/forms/d/18Y82qsZ_eMTsIXu3EpygzUor2LUOen4G_ZAzscFPpsw/`);
});
addOnclickByID('settingsTabButton_getStarted', () => {
  (0, _settings.settingsTab)('getStarted');
});
addOnclickByID('settingsTabButton_storage', () => {
  (0, _settings.settingsTab)('storage');
});
addOnclickByID('settingsTabButton_advanced', () => {
  (0, _settings.settingsTab)('advanced');
});
addOnclickByID('settingsTabButton_sounds', () => {
  (0, _settings.settingsTab)('sounds');
});
addOnclickByID('settingsTabButton_playback', () => {
  (0, _settings.expandTab)('playback');
});
addOnclickByID('settingsTabButton_guide', () => {
  (0, _settings.expandTab)('guide');
});
addOnclickByID('settingsTabButton_updates', () => {
  openModal('updatedApp');
});
addOnclickByID('settingsTabButton_support', () => {
  window.open('https://parallelsocial.net/support');
});

if (window.location.href.includes('.ca')) {
  addOnclickByID('settingsTabButton_support', () => {
    window.open('https://parallelsocial.ca/support');
  });
} // todo: acceptable use policy


addOnclickByID('linkToAcceptableUse', () => {
  window.open('https://parallelsocial.net/support');
});

if (window.location.href.includes('.ca')) {
  addOnclickByID('linkToAcceptableUse', () => {
    window.open('https://parallelsocial.ca/support');
  });
}

addOnclickByID('settingsTabButton_playbackSettings', () => {
  (0, _settings.settingsTab)('playbackSettings');
});
addOnclickByID('settingsTabButton_playbackOutput', () => {
  (0, _settings.settingsTab)('playbackOutput');
});
addOnclickByID('settingsTabButton_transfer', () => {
  (0, _settings.settingsTab)('transfer');
});
addOnclickByID('linkSpotifyButton', () => {
  (0, _music.loginSpotify)();
});
addOnclickByID('inputDevicesRefreshButton', () => {
  (0, _settings.refreshInputDevices)();
});
addOnclickByID('outputDevicesRefreshButton', () => {
  (0, _settings.refreshOutputDevices)();
});
addOnclickByID('changePFPButton', () => {
  (0, _app.changeProfilePhoto)();
});
addOnclickByID('signOutButton', () => {
  (0, _app.signOutParallel)();
});
addOnclickByID('newBioButton', () => {
  openModal('newBio');
});
addOnclickByID('newLyricsButton', () => {
  openModal('newLyrics');
});
addOnclickByID('removeLyricsButton', () => {
  (0, _app.removeLyrics)();
});
addOnclickByID('removeBioButton', () => {
  (0, _app.removeBio)();
});
addOnclickByID('openModalContactButton', () => {
  openModal('contact');
});
addOnclickByID('openModalCreditsButton', () => {
  openModal('credits');
});
addOnclickByID('setThemeLightButton', () => {
  setTheme('light');
});
addOnclickByID('setThemeAutoButton', () => {
  setTheme('auto');
});
addOnclickByID('setThemeDarkButton', () => {
  setTheme('dark');
});
addOnclickByID('newFriendButton', () => {
  openModal('newFriend');
});
addOnclickByID('friendSortButton', () => {
  (0, _friends.toggleFriendsSort)();
});
addOnclickByID('friendsTabFriendsButton', () => {
  (0, _friends.friendsTab)('friends', $(`#friendsTabFriendsButton`).get(0));
});
addOnclickByID('friendsTabIncomingButton', () => {
  (0, _friends.friendsTab)('incoming', $(`#friendsTabIncomingButton`).get(0));
});
addOnclickByID('friendsTabOutgoingButton', () => {
  (0, _friends.friendsTab)('outgoing', $(`#friendsTabOtherButton`).get(0));
});
addOnclickByID('friendsTabBlockedButton', () => {
  (0, _friends.friendsTab)('blocked', $(`#friendsTabOtherButton`).get(0));
});
addOnclickByID('noFriendsAddFriendButton', () => {
  openModal('newFriend');
});
addOnclickByID('cancelFriendsSearchIcon', () => {
  (0, _friends.cancelFriendsSearch)();
});
addOnclickByID('musicTabButton_explore', () => {
  (0, _music.musicTab)('explore');
});
addOnclickByID('musicTabButton_friends', () => {
  (0, _music.musicTab)('friends');
});
addOnclickByID('musicTabButton_search', () => {
  (0, _music.musicTab)('search');
});
addOnclickByID('musicTabButton_queue', () => {
  (0, _music.musicTab)('queue');
});
addOnclickByID('newPlaylistButton', () => {
  (0, _music.openNewPlaylistDialog)();
});
addOnclickByID('newPlaylistFolderButton', () => {
  (0, _music.openNewPlaylistFolderDialog)();
});
addOnclickByID('musicTabButton_saved', () => {
  (0, _music.musicTab)('saved');
});
addOnclickByID('musicSearchButton', () => {
  (0, _music.searchMusicButton)();
});
addOnclickByID('refreshFriendsButton', () => {
  (0, _music.reloadSocialTab)();
});
addOnclickByID('updateQueueText', () => {
  (0, _music.switchToHistory)();
});
addOnclickByID('queueClearButton', () => {
  (0, _music.clearQueue)();
});
addOnclickByID('historyClearButton', () => {
  (0, _music.clearHistory)();
});
addOnclickByID('playerBackwardButton', () => {
  (0, _music.backwardSong)();
  document.activeElement.blur();
});
addOnclickByID('playerForwardButton', () => {
  (0, _music.forwardSong)();
  document.activeElement.blur();
});
addOnclickByID('checkoutOne', () => {
  (0, _stripe.goToCheckout)("price_1KFmL0Ba3MWDKrNRw1Q45Hx4");
});
addOnclickByID('checkoutTwo', () => {
  (0, _stripe.goToCheckout)("price_1KFmLWBa3MWDKrNRy95tTKwo");
});
addOnclickByID('checkoutThree', () => {
  (0, _stripe.goToCheckout)("price_1KFmMWBa3MWDKrNRvyTENeRA");
});
addOnclickByID('manageSubscriptionButton', () => {
  (0, _stripe.manageSubscription)();
});
addOnclickByID('changeEmailButton', () => {
  (0, _app.openEmailInput)();
});
addOnclickByID('changePasswordButton', () => {
  (0, _app.changePassword)();
});
addOnclickByID('bookmarksButton', () => {
  (0, _app.showBookmarks)();
});
addOnclickByID('bookmarksBackground', () => {
  (0, _app.hideBookmarks)();
});
addOnclickByID('bookmarksCloseButton', () => {
  (0, _app.hideBookmarks)();
});
addOnclickByID('keycodesButton', () => {
  openModal('keyCodes');
});
addOnclickByID('removeLinkedTrackButton', () => {
  (0, _app.removeTrackFromProfile)();
});
addOnclickByID('deleteAccountButton', () => {
  (0, _app.deleteAccount)();
});
addOnclickByID('gettingStartedProfilePhoto', () => {
  (0, _settings.settingsTab)('account');
});
addOnclickByID('gettingStartedSpotify', () => {
  (0, _settings.settingsTab)('transfer');
});
addOnclickByID('gettingStartedAppearance', () => {
  (0, _settings.settingsTab)('appearance');
});
addOnclickByID('gettingStartedInfinite', () => {
  (0, _servers.openSpecialServer)('infinite');
});
addOnclickByID('gettingStartedAddFriends', () => {
  (0, _servers.openSpecialServer)('friends');
});
addOnclickByID('gettingStartedGroup', () => {
  (0, _servers.openSpecialServer)('add');
});
addOnclickByID('gettingStartedMusic', () => {
  (0, _servers.openSpecialServer)('music');
});
addOnclickByID('gettingStartedSupport', () => {
  openModal('contact');
});
addOnclickByID('questionMarkButton', () => {
  (0, _app.requestNewTrack)();
});
addOnclickByID('createGroupButton', () => {
  (0, _servers.createGroup)();
});
addOnclickByID('openJoinGroupButton', () => {
  (0, _servers.joinGroup)();
});
addOnclickByID('createGroupFolderButton', () => {
  (0, _servers.createGroupFolder)();
}); // Emojis

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
},{"./app":"js/app.js","./friends":"js/friends.js","./library":"js/library.js","./music":"js/music.js","./settings":"js/settings.js","./servers":"js/servers.js","./presence":"js/presence.js","./voice":"js/voice.js","./electron":"js/electron.js","./sounds":"js/sounds.js","./stripe":"js/stripe.js"}]},{},["js/display.js"], null)