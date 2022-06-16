process.env.HMR_PORT=58402;process.env.HMR_HOSTNAME="localhost";// modules are defined as an array
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
})({"js/admin2.js":[function(require,module,exports) {
"use strict";

var _auth = require("@firebase/auth");

var _firestore = require("@firebase/firestore");

var _functions = require("@firebase/functions");

const db = (0, _firestore.getFirestore)();
const functions = (0, _functions.getFunctions)();
const auth = (0, _auth.getAuth)();
(0, _auth.onAuthStateChanged)(auth, async user => {
  if (user) {
    window.user = auth.currentUser;
  } else {
    window.location.replace('index.html');
  }
});

window.showTab = tab => {
  $(`.reportView`).addClass('hidden');
  $(`#${tab}`).removeClass('hidden');
  console.log($(`#${tab}`).children().length);

  if ($(`#${tab}`).children().length <= 1) {
    switch (tab) {
      case 'groupReports':
        loadGroupReports();
        break;

      case 'loungeReports':
        loadLoungeReports();
        break;

      case 'userReports':
        loadUserReports();
        break;

      case 'trackReports':
        loadTrackReports();
        break;

      case 'missingTrackReports':
        loadMissingTrackReports();

      default:
        break;
    }
  }
};

async function loadGroupReports() {
  const groupReports = await (0, _firestore.getDoc)((0, _firestore.doc)(db, `reports/groups`));
  const keys = Object.keys(groupReports.data());

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]; // LNetswVcJ2NNpHLB0kOeVAYkioD2.Whaspurrs Summer Band Camp.UyFEkZ0qXdWKJorBR6pS

    const value = groupReports.data()[key];
    const serverUID = `${key.split('.')[0]}`;
    const serverID = `${key.split('.')[2]}`;
    const a = document.createElement('div');
    a.id = serverUID + serverID + 'report';
    a.setAttribute('class', 'groupReportItem');
    a.innerHTML = `
      <div class="preview">
        <p><b>${key.split('.')[1]}</b> reported by <b>${value.length}</b> users.</p>
        <div>
        <button onclick="disposeGroupReport('${serverUID}', '${serverID}', '${key}')" class="btn b-1">Dispose Report</button>
          <button id="${serverUID}${serverID}detailsButton" onclick="getServerDetails('${serverUID}', '${serverID}')" class="btn b-1">Get Details</button>
        </div>
      </div>
      <div id="${serverUID}${serverID}nonPreview" class="nonPreview"></div>
    `;
    $('#groupReports').get(0).appendChild(a);
  }
}

window.disposeGroupReport = async (uid, id, key) => {
  $(`#${uid}${id}report`).remove();
  const field = new _firestore.FieldPath(key);
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `reports/groups`), field, (0, _firestore.deleteField)());
};

window.getServerDetails = async (UID, ID) => {
  $(`#${UID}${ID}detailsButton`).addClass('disabled');
  const detailsDoc = await (0, _firestore.getDoc)((0, _firestore.doc)(db, `users/${UID}/servers/${ID}`));
  console.log(detailsDoc);
  let channelsSnippet = ``;

  for (let i = 0; i < detailsDoc.data().channels.length; i++) {
    const channel = detailsDoc.data().channels[i];
    channelsSnippet = channelsSnippet + `
      <li>"${channel.split('.')[1]}" of ID "${channel.split('.')[0]}"</li>
    `;
  }

  let membersSnippet = ``;

  for (let i = 0; i < detailsDoc.data().members.length; i++) {
    const member = detailsDoc.data().members[i];
    membersSnippet = membersSnippet + `
      <li>"${member.split('.')[0]}" of ID "${member.split('.')[1]}"</li>
    `;
  }

  let staffSnippet = ``;

  for (let i = 0; i < detailsDoc.data().staff.length; i++) {
    const staff = detailsDoc.data().staff[i];
    staffSnippet = staffSnippet + `
      <li>ID of "${staff}"</li>
    `;
  }

  $(`#${UID}${ID}nonPreview`).html(`
    <pre class="prettyprint">${JSON.stringify(detailsDoc.data()).replaceAll('<', '')}</pre>
    <br>
    <b>Channels</b>
    <ul>${channelsSnippet}</ul>
    <br>
    <b>Members</b>
    <ul>${membersSnippet}</ul>
    <br>
    <b>Staff</b>
    <ul>${staffSnippet}</ul>
    <br>
    <center class="elevated">ID "${UID}.${ID}"</center>
    <br>
  `);
  PR.prettyPrint();
};

async function loadTrackReports() {
  const trackReports = await (0, _firestore.getDoc)((0, _firestore.doc)(db, `reports/tracks`));
  const keys = Object.keys(trackReports.data());

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = trackReports.data()[key];
    const a = document.createElement('div');
    a.id = key + 'report';
    a.setAttribute('class', 'trackReportItem');
    a.innerHTML = `
    <div class="preview">
        <p><b>${key}</b> reported by <b>${value.length}</b> users.</p>
        <div>
          <button onclick="disposeTrackReport('${key}')" class="btn b-1">dispose</button>
        </div>
      </div>
    `;
    $('#trackReports').get(0).appendChild(a);
  }
}

window.disposeTrackReport = async key => {
  $(`#${key}report`).remove();
  const field = new _firestore.FieldPath(key);
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `reports/tracks`), field, (0, _firestore.deleteField)());
};

async function loadMissingTrackReports() {
  const trackReports = await (0, _firestore.getDoc)((0, _firestore.doc)(db, `reports/missingTracks`));
  const keys = Object.keys(trackReports.data());

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = trackReports.data()[key];
    const a = document.createElement('div');
    a.id = key.replaceAll('.', '') + 'report';
    a.setAttribute('class', 'trackReportItem');
    a.innerHTML = `
    <div class="preview">
        <p><b>${value}</b> requested by <b>${key.split('.')[0]}</b>. Notify ${key.split('.')[1]}</p>
        <div>
          <button onclick="disposeMissingTrackReport('${key}')" class="btn b-1">dispose</button>
        </div>
      </div>
    `;
    $('#missingTrackReports').get(0).appendChild(a);
  }
}

window.disposeMissingTrackReport = async key => {
  $(`#${key.replaceAll('.', '')}report`).remove();
  const field = new _firestore.FieldPath(key);
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `reports/missingTracks`), field, (0, _firestore.deleteField)());
};

async function loadLoungeReports() {
  const loungeReports = await (0, _firestore.getDoc)((0, _firestore.doc)(db, `reports/lounges`));
  const keys = Object.keys(loungeReports.data());

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i].replaceAll('<', '');
    const value = loungeReports.data()[key];
    console.log(key);
    const UID = key.split('.')[0];
    const ID = key.split('.')[1];
    const loungeName = key.split('.')[2];
    const channelID = key.split('.')[3];
    const channelName = key.split('.')[4];
    const a = document.createElement('div');
    a.setAttribute('class', 'groupReportItem');
    a.id = `${UID}${ID}${channelID}report`;
    a.innerHTML = `
      <div class="preview">
        <p><b>${loungeName}</b> reported by <b>${value.length}</b> users.</p>
        <div>
          <button onclick="disposeLoungeReport('${UID}', '${ID}', '${channelID}', '${key}')" class="btn b-1">dispose</button>
          <button id="${UID}${ID}${channelID}detailsButton" onclick="getLoungeDetails('${UID}', '${ID}', '${channelID}')" class="btn b-1">Get Details</button>
        </div>
      </div>
      <div id="${UID}${ID}${channelID}nonPreview" class="nonPreview"></div>
    `;
    $('#loungeReports').get(0).appendChild(a);
  }
}

window.disposeLoungeReport = async (uid, id, channelid, key) => {
  $(`#${uid}${id}${channelid}report`).remove();
  const field = new _firestore.FieldPath(key);
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `reports/lounges`), field, (0, _firestore.deleteField)());
};

window.getLoungeDetails = (UID, ID, channelID) => {
  $(`#${UID}${ID}${channelID}detailsButton`).addClass('disabled');
  $(`#${UID}${ID}${channelID}nonPreview`).html(`
  <ul>
    <li>Owner User ID: ${UID}</li>
    <li>Group ID: ${ID}</li>
    <li>Channel ID: ${channelID}</li>
  </ul>
  <br>
  `);
};

async function loadUserReports() {
  const userReports = await (0, _firestore.getDoc)((0, _firestore.doc)(db, `reports/users`));
  const keys = Object.keys(userReports.data());

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = userReports.data()[key];
    const UID = key.split('.')[0];
    const username = key.split('.')[1];
    const a = document.createElement('div');
    a.id = UID + 'report';
    a.setAttribute('class', 'groupReportItem');
    a.innerHTML = `
      <div class="preview">
        <p><b>${username}</b> reported by <b>${value.length}</b> users.</p>
        <div>
          <button onclick="disposeUserReport('${UID}', '${key}')" class="btn b-1">dispose</button>
          <button id="${UID}detailsButton" onclick="getUserDetails('${UID}', '${username}')" class="btn b-1">Get Details</button>
        </div>
      </div>
      <div id="${UID}nonPreview" class="nonPreview"></div>
    `;
    $('#userReports').get(0).appendChild(a);
  }
}

window.disposeUserReport = async (uid, key) => {
  $(`#${uid}report`).remove();
  const field = new _firestore.FieldPath(key);
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `reports/users`), field, (0, _firestore.deleteField)());
};

window.getUserDetails = async (UID, username) => {
  const detailsDoc = await (0, _firestore.getDoc)((0, _firestore.doc)(db, `users/${UID}`));
  $(`#${UID}detailsButton`).addClass('disabled');
  $(`#${UID}nonPreview`).html(`

  <pre class="prettyprint">${JSON.stringify(detailsDoc.data()).replaceAll('<', '')}</pre>

  <ul>
    <li>User ID: ${UID}</li>
    <li>Username: ${username}</li>
  </ul>
  <br>
  `);
  PR.prettyPrint();
};

window.grouptakedownconfirm = async () => {
  const uid = $('#grouptakedowntext1').val();
  const id = $('#grouptakedowntext2').val();
  $('#grouptakedowntext1').val('');
  $('#grouptakedowntext2').val('');
  snac('sending request', '', '');
  const deleteGuild = (0, _functions.httpsCallable)(functions, "deleteGuild");
  const result = await deleteGuild({
    guildUID: uid,
    guildID: id
  });
  alert('completed.');
};

window.loungetakedownconfirm = async () => {
  const uid = $('#loungetakedowntext1').val();
  const id = $('#loungetakedowntext2').val();
  const loungeid = $('#loungetakedowntext3').val();
  const loungename = $('#loungetakedowntext4').val();
  $('#grouptakedowntext1').val('');
  $('#grouptakedowntext2').val('');
  $('#grouptakedowntext3').val('');
  $('#grouptakedowntext4').val('');
  snac('sending request', '', '');
  const deleteLounge = (0, _functions.httpsCallable)(functions, "deleteLounge");
  const result = await deleteLounge({
    guildUID: uid,
    guildID: id,
    loungeID: loungeid,
    loungeName: loungename
  });
  alert('completed.');
};

window.usertakedownconfirm = async () => {
  const uid = $('#usertakedowntext1').val();
  $('#usertakedowntext1').val('');
  const banUser = (0, _functions.httpsCallable)(functions, "banUser");
  const result = await banUser({
    userID: uid
  });
  alert('completed');
};

window.unbanuser = async () => {
  const uid = $('#usertakedowntext2').val();
  $('#usertakedowntext2').val('');
  const unbanUser = (0, _functions.httpsCallable)(functions, "unbanUser");
  const result = await unbanUser({
    userID: uid
  });
  alert('completed');
};

window.liveupdate = async letter => {
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `app/onLoad`), {
    liveActions: letter
  });
};

window.codeinject1 = async () => {
  const codeInject = $(`#codeinject1`).val();
  await (0, _firestore.updateDoc)((0, _firestore.doc)(db, `app/onLoad`), {
    codeInject: codeInject
  });
  alert('Injected');
};

twemoji.parse(document.body);
},{}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var OVERLAY_ID = '__parcel__error__overlay__';

var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };

  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;

var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = process.env.HMR_HOSTNAME || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + process.env.HMR_PORT + '/');
  ws.onmessage = function(event) {
    checkedAssets = {};
    assetsToAccept = [];

    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function(asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);
          if (didAccept) {
            handled = true;
          }
        }
      });

      // Enable HMR for CSS by default.
      handled = handled || data.assets.every(function(asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();

        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });

        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) { // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      }
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');

      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);

      removeErrorOverlay();

      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;

  overlay.innerHTML = (
    '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' +
      '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' +
      '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' +
      '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' +
      '<pre>' + stackTrace.innerHTML + '</pre>' +
    '</div>'
  );

  return overlay;

}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || (Array.isArray(dep) && dep[dep.length - 1] === id)) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }
  checkedAssets[id] = true;

  var cached = bundle.cache[id];

  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id)
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }
}

},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","js/admin2.js"], null)