import { initializeApp } from "firebase/app";
// import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getPerformance } from "firebase/performance";

export function checkAppInitializedAdmin() {
  if (!window.isAppInitialized) {
    window.isAppInitialized = true;
    const fbApp = initializeApp({
      apiKey: "AIzaSyDwSVIkiXmE5CFqOkqyew75zX5pRbpuboo",
      authDomain: "parallel-archive.firebaseapp.com",
      databaseURL: "https://parallel-archive-default-rtdb.firebaseio.com",
      projectId: "parallel-archive",
      storageBucket: "parallel-archive.appspot.com",
      messagingSenderId: "77839003871",
      appId: "1:77839003871:web:b546052cf3f5a3d9b2396a",
      measurementId: "G-WTBYX3FY97"
    });

    // const appCheck = initializeAppCheck(fbApp, {
    //   provider: new ReCaptchaV3Provider("6Lca3TcdAAAAAMb0ZgqqIgC5ojFL85FFvokzmFh7"),
    //   isTokenAutoRefreshEnabled: true
    // });
  }
};

checkAppInitializedAdmin();
const perf = getPerformance();

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