import { retrieveSetting } from "./settings";

window.ringtonePlaying = false;

export function playMessageSound() {
  if (!retrieveSetting('messageSendSound', true)) {
    return;
  }
  $('#sendMessageAudio').get(0).src = "https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/app%2Fsounds%2FsendMessage.wav?alt=media"
  $('#sendMessageAudio').get(0).currentTime = 0.85;
  $('#sendMessageAudio').get(0).volume = defaultVolume;
  $('#sendMessageAudio').get(0).play();
}

export function playRingtone() {
  if (!$(`.incomingCall`).length) { // There is no incoming call
    ringtonePlaying = false;
    $('#ringtoneAudio').get(0).volume = defaultVolume;
    $('#ringtoneAudio').animate({volume: 0}, 1000);
    window.setTimeout(() => {
      $('#ringtoneAudio').get(0).pause();
    }, 1000);
    return;
  }

  if (!retrieveSetting('ringtoneSound', true) || ringtonePlaying) { // No ringtone or already playing
    return;
  }

  $('#ringtoneAudio').get(0).src = "https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/app%2Fsounds%2FSailing%20Colors.m4a?alt=media"
  $('#ringtoneAudio').get(0).currentTime = 0;
  $('#ringtoneAudio').get(0).volume = 0;
  $('#ringtoneAudio').get(0).play();
  $('#ringtoneAudio').animate({volume: defaultVolume}, 1000);
  ringtonePlaying = true;
}

export function playNotification() {
  if (!retrieveSetting('notificationSound', true)) {
    return;
  }
  $('#notificationAudio').get(0).src = "https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/app%2Fsounds%2Fnotification.wav?alt=media"
  $('#notificationAudio').get(0).currentTime = 0;
  $('#notificationAudio').get(0).volume = defaultVolume;
  $('#notificationAudio').get(0).play(); 
}

export function playMute() {
  if (!retrieveSetting('muteSound', true)) {
    return;
  }
  $('#muteAudio').get(0).src = "https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/app%2Fsounds%2Fmute.wav?alt=media"
  $('#muteAudio').get(0).currentTime = 0;
  $('#muteAudio').get(0).volume = defaultVolume;
  $('#muteAudio').get(0).play();
}

export function playDeafen() {
  if (!retrieveSetting('deafenSound', true)) {
    return;
  }
  $('#deafenAudio').get(0).src = "https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/app%2Fsounds%2Fdeafen.wav?alt=media"
  $('#deafenAudio').get(0).currentTime = 0;
  $('#deafenAudio').get(0).volume = defaultVolume;
  $('#deafenAudio').get(0).play();
}