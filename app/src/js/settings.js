import { storageListener, switchViewsToContent } from "./app";
import { closeModal, disableButton, enableButton, openModal } from "./app";
import { setReadReciepts } from "./friends";
import { checkValidSubscription } from "./stripe";
import { endAllCalls } from "./voice";

window.defaultVolume = 1;
window.storageListenerCreated = false;
window.devicesLoaded = false;

export function expandTab(tabGroup) {
  $('.accountSidebarButtonActive').removeClass('accountSidebarButtonActive');

  if ($(`#tapGroup_${tabGroup}`).hasClass('tabGroupActive')) {
    // Unexpand
    $(`#tapGroup_${tabGroup}`).removeClass('tabGroupActive');
    $(`#tapGroup_${tabGroup}`).css('height', '')
    return;
  }


  $(`#settingsTabButton_${tabGroup}`).addClass('accountSidebarButtonActive');

  // Expand
  $('.tabGroupActive').css('height', '');
  $('.tabGroupActive').removeClass('tabGroupActive');

  $(`#tapGroup_${tabGroup}`).addClass('tabGroupActive');
  $(`#tapGroup_${tabGroup}`).css('height', 'auto')
  const defaultHeight = $(`#tapGroup_${tabGroup}`).height();
  $(`#tapGroup_${tabGroup}`).css('height', '0px')

  $(`#tapGroup_${tabGroup}`).css('height', `${defaultHeight}px`)

}

export function settingsTab(tab) {
  $('.accountTab').addClass('hidden');
  $(`#musicTab_${tab}`).removeClass('hidden');
  if (window.innerWidth < 600) {
    switchViewsToContent()
  }

  $(`.accountSidebarButtonInGroupActive`).removeClass('accountSidebarButtonInGroupActive');
  $(`#settingsTabButton_${tab}`).addClass('accountSidebarButtonInGroupActive');

  if (tab == 'storage') {
    if (!storageListenerCreated) {
      storageListenerCreated = true;
      storageListener();
    }
  }

  else if (tab == 'playbackOutput') {
    loadDevices();
  }
}

function setDefaultVolume(value) {
  libraryPlayer.volume = (value / 100);
  // Set all server volumes.
  $(`.channelMusicAudio`).each((index, object) => {
    object.volume = (value / 100);
  });

  // Set all videos.
  const keys = Object.keys(channelPendingPlayers);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]; const element = channelPendingPlayers[key];
    element.volume = (value / 100);
  }

  const keys2 = Object.keys(channelPlayers);
  for (let i = 0; i < keys2.length; i++) {
    const key = keys2[i]; const element = channelPlayers[key];
    element.volume = (value / 100);
  }

  const keys3 = Object.keys(pendingPlayers);
  for (let i = 0; i < keys3.length; i++) {
    const key = keys3[i]; const element = pendingPlayers[key];
    element.volume = (value / 100);
  }

  const keys4 = Object.keys(friendPlayers);
  for (let i = 0; i < keys4.length; i++) {
    const key = keys4[i]; const element = friendPlayers[key];
    element.volume = (value / 100);
  }

  defaultVolume = (value / 100);
}

export function setSlowedTracks() {

  const slowed = retrieveSetting('slowedTracks', false);
  const slower = retrieveSetting('slowerTracks', false);
  const slowest = retrieveSetting('slowestTracks', false);

  libraryPlayer.speed = 1;
  if (slowed) {
    libraryPlayer.speed = 0.9;
  }
  if (slower) {
    libraryPlayer.speed = 0.8;
  }
  if (slowest) {
    libraryPlayer.speed = 0.7;
  }
}

export function loadDefaultValues() {
  setDefaultVolume(parseInt(retrieveSetting('defaultVolume', '100')));
  
  setSlowedTracks();

  setRedNotifications(retrieveSetting('redNotifications', false));

  const defaultValues = [
    { key: 'responsiveVoiceActivity', defaultSetting: false },
    { key: 'desktopNotifications', defaultSetting: true },
    { key: 'inAppNotifications', defaultSetting: true },
    { key: 'notificationSound', defaultSetting: true },
    { key: 'messageSendSound' , defaultSetting: true },
    { key: 'inactivityTimeout', defaultSetting: true },
    { key: 'hideReadReciepts', defaultSetting: false },
    { key: 'noiseSurpression', defaultSetting: true },
    { key: 'echoCancellation', defaultSetting: true },
    { key: 'redNotifications', defaultSetting: false },
    { key: 'ringtoneSound' , defaultSetting: true },
    { key: 'slowestTracks', defaultSetting: false },
    { key: 'slowedTracks', defaultSetting: false },
    { key: 'slowerTracks', defaultSetting: false },
    { key: 'streamAudio' , defaultSetting: true },
    { key: 'discordSongs', defaultSetting: true },
    { key: 'deafenSound', defaultSetting: true },
    { key: 'shareSongs', defaultSetting: true },
    { key: 'muteSound', defaultSetting: true },
    { key: 'defaultVolume' , defaultSetting: '30' },
  ]

  for (let i = 0; i < defaultValues.length; i++) {
    const key = defaultValues[i].key;
    const defaultSetting = defaultValues[i].defaultSetting;

    const setting = retrieveSetting(key, defaultSetting);

    if (typeof(setting) == 'string') {
      $(`#${key}Check`).get(0).value = setting
    }
    else {
      $(`#${key}Check`).get(0).checked = setting
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
    
    setting = $(`#${key}Check`).get(0).value
  }
  else {
    setting = $(`#${key}Check`).get(0).checked
  }

  localStorage.setItem(key, setting);
  
  // Functions to set the value.
  switch (key) {
    case 'slowedTracks':
      if (!checkValidSubscription(cacheUser.subscription)) {
        snac('Infinite Feature', "This feature is only available to Parallel Infinite users.")
        window.setTimeout(() => {
          $(`#${key}Check`).get(0).checked = false;
        }, 500);
        localStorage.setItem(key, false);
        setSlowedTracks();
      }
      else {
        // Disable other slowed tracks options
        $(`#slowerTracksCheck`).get(0).checked = false;
        localStorage.setItem('slowerTracks', false);
        $(`#slowestTracksCheck`).get(0).checked = false;
        localStorage.setItem('slowestTracks', false);
        setSlowedTracks();
      }
      break;
    case 'slowerTracks':
      if (!checkValidSubscription(cacheUser.subscription)) {
        snac('Infinite Feature', "This feature is only available to Parallel Infinite users.")
        window.setTimeout(() => {
          $(`#${key}Check`).get(0).checked = false;
        }, 500);
        localStorage.setItem(key, false);
        setSlowedTracks();
      }
      else {
        // Disable other slowed tracks options
        $(`#slowedTracksCheck`).get(0).checked = false;
        localStorage.setItem('slowedTracks', false);
        $(`#slowestTracksCheck`).get(0).checked = false;
        localStorage.setItem('slowestTracks', false);
        setSlowedTracks();
      }
      break;
    case 'slowestTracks':
      if (!checkValidSubscription(cacheUser.subscription)) {
        snac('Infinite Feature', "This feature is only available to Parallel Infinite users.")
        window.setTimeout(() => {
          $(`#${key}Check`).get(0).checked = false;
        }, 500);
        localStorage.setItem(key, false);
        setSlowedTracks();
      }
      else {
        // Disable other slowed tracks options
        $(`#slowedTracksCheck`).get(0).checked = false;
        localStorage.setItem('slowedTracks', false);
        $(`#slowerTracksCheck`).get(0).checked = false;
        localStorage.setItem('slowerTracks', false);
        setSlowedTracks();
      }
      break;
    case `inactivityTimeout`: 
      if (!checkValidSubscription(cacheUser.subscription)) {
        snac('Infinite Feature', "This feature is only available to Parallel Infinite users.")
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
          Notification.requestPermission().then(function(permission) {
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
      setReadReciepts(retrieveSetting('hideReadReciepts', false));
      break;
    case 'redNotifications':
      setRedNotifications(retrieveSetting('redNotifications', false));
      break;
    default:
      break;
  }
}

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
  }
  else {
    $(`#redNotificationStyles`).html('');
  }
}

export function retrieveSetting(key, defaultValue) {
  if (localStorage.getItem(key) == 'true') {
    return true
  }
  else if (localStorage.getItem(key) == 'false') {
    return false
  }
  else if (localStorage.getItem(key)) {
    // Custom value
    return localStorage.getItem(key);
  }
  else {
    return defaultValue
  }
}

async function loadDevices(skipInputs, skipOutputs, skipLoadCheck) {
  if (devicesLoaded && !skipLoadCheck) {return};
  devicesLoaded = true;

  let devices;
  try {
    devices = await navigator.mediaDevices.enumerateDevices()
  } catch (error) {
    snac('No Permission', 'Unable to access media devices.', 'danger')
  }

  let usedDevices = [];
  console.log(devices)

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
      a.innerHTML = `<div><i class="bx bx-microphone"></i> <span>${device.label}</span></div><button id="${device.deviceId}UseInputButton" class="btn b-1 inactiveInputDevice">Use</button>`
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
      }
    }
    

    if (device.kind == 'audiooutput' && !skipOutputs) {
      $(`#audioOutputsContainer`).removeClass('hidden');
      
      const a = document.createElement('div');
      a.classList.add('audioDeviceElement');
      a.innerHTML = `<div><i class="bx bx-speaker"></i> <span>${device.label}</span></div><button id="${device.deviceId}UseOutputButton" class="btn b-1 inactiveInputDevice">Use</button>`
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
      }
    }
  }

  $(`#${returnActiveDeviceID()}UseInputButton`).html('Active')
  $(`#${returnActiveDeviceID()}UseInputButton`).addClass('disabled')
  $(`#${returnActiveDeviceID()}UseInputButton `).addClass('activeInputDevice')

  $(`#${returnActiveDeviceIDOutput()}UseOutputButton`).html('Active')
  $(`#${returnActiveDeviceIDOutput()}UseOutputButton`).addClass('disabled')
  $(`#${returnActiveDeviceIDOutput()}UseOutputButton`).addClass('activeOutputDevice')
}

export function returnActiveDeviceID() {
  const stored = localStorage.getItem('inputDeviceID');
  if (!stored || stored == 'null') {
    return "default"
  }
  return stored;
}

export function returnActiveDeviceIDOutput() {
  const stored = localStorage.getItem('outputDeviceID');
  if (!stored || stored == 'null') {
    return "default"
  }
  return stored;
}

async function updateMediaStreamSourceDevice() {
  if (mediaStream) {
    openModal(`mediaStreamUpdate`);
    $(`#confirmMediaStreamButton`).get(0).onclick = () => {
      endAllCalls();
      closeModal();
    }
  }
  else {

  }
}

updateMediaStreamSourceDeviceOutput();
function updateMediaStreamSourceDeviceOutput() {
  try {
  $('audio').each(async (index, object) => {
      await $(object).get(0).setSinkId(returnActiveDeviceIDOutput());
    }) 
  } catch (error) {
    snac('No permission', 'Unable to connect to the selected audio device.', 'danger');
  }
}

export function refreshInputDevices() {
  disableButton($(`#inputDevicesRefreshButton`));

  $(`#audioInputsContainerContainer`).empty();
  
  window.setTimeout(() => {
    loadDevices(false, true, true);
    enableButton($(`#inputDevicesRefreshButton`), '<i class="bx bx-refresh"></i>');
  }, 499);
}

export function refreshOutputDevices() {
  disableButton($(`#outputDevicesRefreshButton`));

  $(`#audioOutputsContainerContainer`).empty();
  window.setTimeout(() => {
    loadDevices(true, false, true);
    enableButton($(`#outputDevicesRefreshButton`), '<i class="bx bx-refresh"></i>');
  }, 499);
}