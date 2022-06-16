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
})({"js/theme.js":[function(require,module,exports) {
setDefaultStyles();
function setDefaultStyles() {
  // Add inline styles
  $(`#cssInjections`).html(`
    <style id="darkLightMode"></style>
    <style id="mobileOpt"></style>
    <style id="unfocusedStyles"></style>
    <style id="attachmentManagerInjection"></style>
    <style id="musicViewInjection"></style>
    <style id="attachmentManager"></style>
    <style id="pointerStyles"> :root { --defaultInputPadding: 16px; --defaultLabelPadding: 4px; --defaultByPointer: pointer; --iconPlacementDefault: 50%; --iconPlacementGuild: 54%; --questionMarkTop: 22px; --questionMarkRight: 3px; --trackAuthorHeight: 24px, --chatMessagePadding: 0px } </style>
    <style id="redNotificationStyles"></style>
    <style id="editorModeInjection"></style>
  `);

  $(`#checkBoxURLContainer`).html(`
    <svg xmlns="http://www.w3.org/2000/svg" style="display: none; z-index: 20;">
      <symbol id="checkbox" viewBox="0 0 22 22">
        <path fill="none" stroke="currentColor" d="M5.5,11.3L9,14.8L20.2,3.3l0,0c-0.5-1-1.5-1.8-2.7-1.8h-13c-1.7,0-3,1.3-3,3v13c0,1.7,1.3,3,3,3h13 c1.7,0,3-1.3,3-3v-13c0-0.4-0.1-0.8-0.3-1.2"/>
      </symbol>
    </svg>
  `);

}

const lightModeSelectors = `
  :root {
    --bg0: #ffffff;
    --bg1: #f5f7fa;
    --bg2: #ebeef2;
    --bg3: #e1e6ee;
    --bg4: #d5dbe3;

    --fg1: #16191d;
    --fg2: #20242A;
    --fg3: #323A40;
    --fg4: #495059; 
    
    --afg1: #F8F8FB;
    --afg2: #CFD7DF;
  }
`

const darkModeSelectors = `
  :root {
    --bg0: #0c0c0d;
    --bg1: #0f1012;
    --bg2: #171a1f;
    --bg3: #1d2024;
    --bg4: #272b2e;

    --fg1: #F8F8FB;
    --fg2: #CFD7DF;
    --fg3: #B7C5CF;
    --fg4: #8794A8;

    --afg1: #212935;
    --afg2: #5D6A7C;
  }

  .pinnedMessagesContainer .messageReplay {
    background-color: var(--bg2);
  }
`

const mobileOptSelectors = `
  .hi {
    
  }
`

refreshTheme();
function refreshTheme() {
  const theme = localStorage.getItem('theme');
  $(`.themeButtonActive`).removeClass('themeButtonActive');

  if (theme === 'light') {
    document.getElementById('darkLightMode').innerHTML = lightModeSelectors.replaceAll('\n', '');
    $(`#setThemeLightButton`).addClass('themeButtonActive');
  }

  else if (theme === 'dark') {
    document.getElementById('darkLightMode').innerHTML = darkModeSelectors.replaceAll('\n', '');
    $(`#setThemeDarkButton`).addClass('themeButtonActive');
  }

  else {
    let matched = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (matched) {
      document.getElementById('darkLightMode').innerHTML = darkModeSelectors;
    }
    else {
      document.getElementById('darkLightMode').innerHTML = lightModeSelectors;
    }
    $(`#setThemeAutoButton`).addClass('themeButtonActive');
  }
}

refreshDisplay();
function refreshDisplay() {
  const display = localStorage.getItem('display');
  if (display == 'mobile') {
    document.getElementById('mobileOpt').innerHTML = mobileOptSelectors.replaceAll('\n', '');
  }
  else {
    document.getElementById('mobileOpt').innerHTML = ''
  }
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  refreshTheme();
});

window.setTheme = (theme) => {
  localStorage.setItem('theme', theme);
  refreshTheme();
  snac('Theme Updated', '', 'success');
}

window.setDisplay = (display) => {
  localStorage.setItem('display', display);
  refreshDisplay();
  snac('Display Updated', '', 'success');
}
},{}]},{},["js/theme.js"], null)