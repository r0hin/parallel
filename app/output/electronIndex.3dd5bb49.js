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
})({"js/electronIndex.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkElectron = checkElectron;
exports.resetZoom = resetZoom;
exports.zoomIn = zoomIn;
exports.zoomOut = zoomOut;
window.winBrowserWindow = null;
window.isElectron = null;
window.electronLink = null;
checkElectron();
window.markAsReadAfterFocus = {
  type: '',
  id: ''
};

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
          markDMRead(markAsReadAfterFocus.id);
        } else {
          markChannelAsRead(markAsReadAfterFocus.id.split('.')[0], markAsReadAfterFocus.id.split('.')[1], markAsReadAfterFocus.id.split('.')[2]);
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
},{}]},{},["js/electronIndex.js"], null)