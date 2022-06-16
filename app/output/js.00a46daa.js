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
},{}],"js/index.js":[function(require,module,exports) {
"use strict";

var _auth = require("@firebase/auth");

var _firebaseChecks = require("./firebaseChecks");

(0, _firebaseChecks.checkAppInitialized)();
const auth = (0, _auth.getAuth)();

if (window.location.href.includes('.ca')) {
  $(`#weblink1`).attr('href', 'https://parallelsocial.ca/policies.pdf');
}

window.emailSent = false;

window.showIn = () => {
  $('#card').addClass('card_expanded');
  $('#buttons').addClass('fadeOut');
  $('#buttons').removeClass('fadeIn');
  window.setTimeout(() => {
    $('#buttons').addClass('hidden');
    $('#in').removeClass('hidden');
    $('#in').removeClass('fadeOut');
    $('#in').addClass('fadeIn');
  }, 500);
};

window.showUp = () => {
  $('#card').addClass('card_expanded');
  $('#buttons').removeClass('fadeIn');
  $('#buttons').addClass('fadeOut');
  window.setTimeout(() => {
    $('#buttons').addClass('hidden');
    $('#up').removeClass('hidden');
    $('#up').removeClass('fadeOut');
    $('#up').addClass('fadeIn');
  }, 500);
};

window.goBack = () => {
  $('#up').removeClass('fadeIn');
  $('#up').addClass('fadeOut');
  $('#in').removeClass('fadeIn');
  $('#in').addClass('fadeOut');
  $('#reset').removeClass('fadeIn');
  $('#reset').addClass('fadeOut');
  window.setTimeout(() => {
    $('#card').removeClass('card_expanded');
    $('#card').removeClass('card_Semiexpanded');
  }, 250);
  window.setTimeout(() => {
    $('#up').addClass('hidden');
    $('#in').addClass('hidden');
    $('#reset').addClass('hidden');
    $('#buttons').removeClass('fadeOut');
    $('#buttons').removeClass('hidden');
    $('#buttons').addClass('fadeIn');
  }, 500);
};

window.forgotPassword = () => {
  $('#card').removeClass('card_expanded');
  $('#card').addClass('card_Semiexpanded');
  $('#in').removeClass('fadeIn');
  $('#in').addClass('fadeOut');
  window.setTimeout(() => {
    $('#in').addClass('hidden');
    $('#reset').removeClass('hidden');
    $('#reset').removeClass('fadeOut');
    $('#reset').addClass('fadeIn');
  }, 500);
};

window.sendPassResetEmail = async () => {
  $('#emailresetbutton').addClass('disabled');
  const email = $(`#email3`).val();
  (0, _auth.sendPasswordResetEmail)(auth, email).then(() => {
    $('#emailresetbutton').html(`email sent`);
    snac('Email Sent', `A password reset email was sent to your email, "${email}".`, 'success');
    $(`#email3`).val('');
    emailSent = true;
  }).catch(err => {
    $('#emailresetbutton').removeClass('disabled');
    snac('Error', `${err}`, 'danger');
  });
};

$('input').on('focusin', function () {
  $(this).parent().find('label').addClass('active');
});
$('input').on('focusout', function () {
  if (!this.value) {
    $(this).parent().find('label').removeClass('active');
  }
});
$(`#password2`).get(0).addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    $('#signUpButton').get(0).click();
  }
});
$(`#password`).get(0).addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    $(`#loginbutton`).get(0).click();
  }
});
$(`#email3`).get(0).addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();

    if (!emailSent) {
      $(`#emailresetbutton`).get(0).click();
    }
  }
}); // Auth

(0, _auth.onAuthStateChanged)(auth, user => {
  if (user) {
    window.location.replace('app.html');
  } else {
    $('#loading').addClass('hidden');
    $('#card').removeClass('hidden');
  }
});

window.signInWith = service => {
  let provider = null;

  switch (service) {
    case "google":
      toggleloadersubmitgoogle();
      provider = new _auth.GoogleAuthProvider();
      break;

    case "twitter":
      toggleloadersubmittwitter();
      provider = new _auth.TwitterAuthProvider();
      break;

    default:
      return;
  }

  (0, _auth.signInWithRedirect)(auth, provider).catch(error => {
    snac('Error', error.message, 'danger');
    window.setTimeout(() => {
      $('.googlebtn').html(`<h3><i class='bx bxl-google'></i></h3>`);
      $('.twitterbtn').html(`<h3><i class='bx bxl-twitter'></i></h3>`);
      $('.providerbtn').removeClass('disabled');
    }, 1800);
  });
};

window.submitLogin = () => {
  toggleloadersubmit();
  console.log('Attemping to login...');
  (0, _auth.signInWithEmailAndPassword)(auth, $('#email').val(), $('#password').val()).catch(error => {
    $('#password').val('');
    snac('Error', error.message, 'danger');
    window.setTimeout(() => {
      $('.submitbtn').html(`Submit`);
      $('.submitbtn').removeClass('disabled');
      $('.submitbtn').addClass('pulse');
      window.setTimeout(() => {
        $('.submitbtn').removeClass('pulse');
      }, 800);
    }, 1800);
  });
};

window.submitSignup = () => {
  toggleloadersubmit();
  console.log('Attemping to login...');
  (0, _auth.createUserWithEmailAndPassword)(auth, $('#email2').val(), $('#password2').val()).catch(error => {
    $('#password2').val('');
    snac('Error', error.message, 'danger');
    window.setTimeout(() => {
      $('.submitbtn').html(`Submit`);
      $('.submitbtn').removeClass('disabled');
      $('.submitbtn').addClass('pulse');
      window.setTimeout(() => {
        $('.submitbtn').removeClass('pulse');
      }, 800);
    }, 800);
  });
};

function toggleloadersubmit() {
  $('.submitbtn').html(`<i style="font-size: 15px;" class='bx bx-time animated pulse faster infinite'></i>`);
  $('.submitbtn').addClass('disabled');
  $('.submitbtn').removeClass('pulse');
}

function toggleloadersubmitgoogle() {
  $('.googlebtn').html(`<i style="font-size: 15px;" class='bx bx-time animated pulse faster infinite'></i>`);
  $('.googlebtn').addClass('disabled');
}

function toggleloadersubmittwitter() {
  $('.twitterbtn').html(`<i style="font-size: 15px;" class='bx bx-time animated pulse faster infinite'></i>`);
  $('.twitterbtn').addClass('disabled');
}

window.snacks = {};
const notyf = new Notyf({
  types: [{
    type: 'info',
    background: 'white',
    className: 'toast',
    duration: 6000,
    icon: false,
    position: {
      x: 'right',
      y: 'top'
    }
  }]
});
const notyfSuccess = new Notyf({
  types: [{
    type: 'info',
    background: 'lime',
    className: 'toastlime',
    duration: 6000,
    icon: false,
    position: {
      x: 'right',
      y: 'top'
    }
  }]
});
const notyfDanger = new Notyf({
  types: [{
    type: 'info',
    background: '#b81212',
    className: 'toastred',
    duration: 6000,
    icon: false,
    position: {
      x: 'right',
      y: 'top'
    }
  }]
});

window.snac = (titre, texte, theme) => {
  let activeThemeType = notyf;
  let activeThemeTypeName = 'notyf';

  if (theme === 'danger') {
    activeThemeType = notyfDanger;
    activeThemeTypeName = 'notyfDanger';
  }

  if (theme === 'success') {
    activeThemeType = notyfSuccess;
    activeThemeTypeName = 'notyfSuccess';
  } // Eon's notyf layer.


  const index = new Date().getTime();
  snacks[index] = activeThemeType.open({
    type: 'info',
    message: `<h3>${titre}</h3><p>${texte}</p><i onclick="${activeThemeTypeName}.dismiss(snacks[${index}])" class='bx bx-message-square-minus'></i>`
  });
};
},{"./firebaseChecks":"js/firebaseChecks.js"}]},{},["js/index.js"], null)