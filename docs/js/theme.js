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