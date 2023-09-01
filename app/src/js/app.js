import { getAuth, deleteUser, updateEmail, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail, signOut, GoogleAuthProvider, linkWithRedirect, TwitterAuthProvider, unlink, reauthenticateWithCredential, EmailAuthProvider} from '@firebase/auth';
import { getFirestore, doc, getDoc, onSnapshot, updateDoc, setDoc, arrayUnion, arrayRemove } from '@firebase/firestore';
import { getStorage, ref, uploadBytesResumable, deleteObject} from '@firebase/storage';
import { getAnalytics } from "firebase/analytics";
import { getFunctions, httpsCallable } from '@firebase/functions';

import * as timeago from 'timeago.js';
import { Picker } from 'emoji-picker-element';
import Croppr from 'croppr';

import { openSpecialServer, loadMuted, loadServers, unreadIndicators, loadOutgoingServerRequests, updateServersOrder, leaveServer, openServer } from './servers';
import { loadFriends, openFriendsDM, processDMAttachments, unreadIndicatorsDM } from './friends';
import { listenCalls } from './voice';
import { loadPlaylists } from './library';
import { loadDefaultValues, settingsTab, expandTab, refreshInputDevices, refreshOutputDevices, retrieveSetting } from './settings';
import { loadIdle, selfPresence, clearMusicStatus } from './presence';
import { checkValidSubscription, loadSubscription, manageSubscription } from './stripe';
import { loadRecentSearches, manageSpotify } from './music';
import { processAttachment } from './channels';
import { checkAppInitialized } from './firebaseChecks';
import { startElectronProcesses } from './electronApp';
import { startMainElectronProcesses } from './electron';
import { listenKeystrokes } from './keyboarde';
import { cancelFriendsSearch, friendEventListeners, toggleFriendsSort } from './friends';
import { createPlaylist } from './library';
import { backwardSong, clearHistory, clearQueue, forwardSong, loginSpotify, musicTab, openNewPlaylistDialog, openNewPlaylistFolderDialog, reloadSocialTab, searchMusicButton, spotifyPlaylistLookup, switchToHistory } from './music';
import { createGroup, createGroupFolder, joinGroup } from './servers';
import { endAllCalls, leaveVideoDM, shareScreenDM, shareVideoDM } from './voice';
import { playNotification } from './sounds';
import { updateApp } from './electronApp';
import { sendToElectron } from './electron';

window.user;
window.gitHubVersion = '2.10.12';
window.disableCoreListeners = false;

$(`#topBar`).html(`<b>Parallel</b> <span>${gitHubVersion}</span>`);
$(`#settingsTabButton_updates`).html(`<b>What's New</b><p>v${gitHubVersion}</p>`);
$(`#whatsChangedVersion`).html(gitHubVersion);
$(`#supportButtonText`).html(`parallelsocial.net/wiki`)

window.reportedIDs = [];
window.cachedUploadedFiles = [];
window.cacheBadges = [];
window.adminUser = false;
window.appleMusicKey = "";
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
window.storageClearAllTimeout = null;
window.toOpenChannelWhenReady = null;
window.directories = [];
window.noTrackTimeout = null;
window.modalOpen = false;
window.closeOnEnter = false;
window.primaryActionFunc = () => {}
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
window.quickSearchIndex = 0;
window.adminUsers = [];
window.verifiedGroups = [];

const placeholderAlbumImage = 'https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/app%2FdefaultAlbum.png?alt=media';

checkAppInitialized();
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();
const functions = getFunctions();
const analytics = getAnalytics();

window.playback = true;

onAuthStateChanged(auth, async (user) => {
  if (disableCoreListeners) {
    return;
  }
  if (user) {
    loadVersioning(user.uid);
    window.user = auth.currentUser;

    const userDoc = await getDoc(doc(db, `users/${user.uid}`));
  
    if (userDoc.exists() && userDoc.data().status) {
      $('#newUser').addClass('hidden');
      $('#returningUser').removeClass('hidden');
      if (!appLoaded) {
        appLoaded = true;
        startSetup();
      }
    }
    else {
      displayInputEffect();
      loadOnclicks(); // Need onclicks for functionality.
      // ^ Will be called again on startup but is fine.
      $('#newUser').removeClass('hidden');
      startSetupAnimation();
    }
  } else {
    window.location.replace('login.html');
  }
})

export function sendVerify() {
  sendEmailVerification(user).then(function() {
    snac('Verification Email Sent', 'Please check your inbox and follow the instructions in the email we sent you to continue.', 'success');

    $('#verifyButton').removeClass("zoomIn");
    $('#verifyButton').removeClass("delay-5s");
    $('#verifyButton').addClass("zoomOut");

    window.setTimeout(() => {
      $('#verifyButton').addClass('hidden');
      $('#reloadButton').removeClass('hidden');
    }, 3500);
  }).catch(function(error) {
    console.error(error)
    snac('Verification Email Error', error, 'danger');
  });

}

export function signOutParallel() {
  signOut(auth);
}

function startSetupAnimation() {
  // Check if email verified:
  if (!user.emailVerified) {
    $('#unverifiedCard').removeClass('hidden');
    window.setTimeout(() => {
      $('#unverifiedCard').addClass("unverifiedCard1");
    }, 1500)

    window.setTimeout(() => {
      $('#unverifiedCard').addClass("unverifiedCard2");
    }, 4000)

    return;
  }

  $('#welcomeCard').removeClass('hidden');

  window.setTimeout(() => {
    $('#welcomeCard').addClass("welcomeCard1");
  }, 2500)

  window.setTimeout(() => {
    $('#welcomeCard').addClass("welcomeCard2");
  }, 4000)
}

export async function completeProfile() {
  // Loader Animation
  $('#submitbtnprofile').html(`<i style="font-size: 15px;" class='bx bx-time animated pulse faster infinite'></i>`)
  $('#submitbtnprofile').addClass('disabled')
  $('#submitbtnprofile').removeClass('pulse')

  const username = $('#username').val().trim();

  if (username.length === 0 || username.length > 16) {
    snac('Invalid Username', 'This username is invalid. It must be between 1 and 16 characters.', 'danger');
    $('#submitbtnprofile').html(` <i class='bx bx-check'></i> Continue `);
    $('#submitbtnprofile').removeClass('disabled');
    $('#submitbtnprofile').addClass('pulse');
    return;
  }

  $('#username').val('');

  const createAccount = httpsCallable(functions, 'createAccount');
  const result = await createAccount({username: username});

  if (result.data.data === false) {
    snac('Invalid Username', 'This username is taken already. Please try using a different one.')
    $('#submitbtnprofile').html(` <i class='bx bx-check'></i> Continue `)
    $('#submitbtnprofile').removeClass('disabled')
    $('#submitbtnprofile').addClass('pulse')
    return;
  }

  if (result.data.data) {
    snac('Profile Completed', 'Thanks for joining Parallel!', 'success');
    $('#newUser').removeClass('fadeIn');
    $('#newUser').addClass('fadeOut');
    window.setTimeout(() => {
      startSetup(true);
    }, 900)
  } 
  else {
    // Honestly don't know if its a success or not. Run a quick test.
    const testDoc = await getDoc(doc(db, `users/${user.uid}`));
    if (testDoc.exists && testDoc.data().status) {
      snac('Profile Completed', 'Thanks for joining Parallel!', 'success');
      $('#newUser').removeClass('fadeIn');
      $('#newUser').addClass('fadeOut');
      window.setTimeout(() => {
        startSetup();
      }, 900)
    }
    else {
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


async function startSetup(newUser) {
  const css = `color: #F25E92; font-size: 18px;`
  const css2 = `color: #F25E92; font-size: 12px;`
  console.log("%ccode runs happy", css);
  console.log("%cParallel Dev Tools 🚀", css2);

  if (window.innerWidth < 600) {
    alert("Welcome to Parallel's mobile test build! We're still working on improving this experience.\n\nTo navigate or go back one screen, please use the navigation buttons at the bottom of the screen.")
  }

  if (window.require) {
    console.log("Electron detected.");
    startMainElectronProcesses();
    startElectronProcesses();
  }

  loadDisplay();
  listenKeystrokes();

  $('#newUser').addClass('hidden');
  $('#returningUser').removeClass('hidden');
  // Account setup.

  const userDoc = await getDoc(doc(db, `users/${user.uid}`))
  window.cacheUser = userDoc.data();

  if (!cacheUser.tutorialStarted) {
    startTutorial();
    await updateDoc(doc(db, `users/${user.uid}`), {tutorialStarted: true});
  }

  $(`#accountServer`).addClass(`voiceIndicator${user.uid}`);
  $(`#accountServer`).addClass(`voiceIndicatorAll`);
  $(`#accountServer`).addClass(`userContextItem`);
  $(`#accountServer`).get(0).setAttribute('userID', user.uid);
  $(`#accountServer`).get(0).setAttribute('userName', cacheUser.username);
  $(`#accountServer`).get(0).onclick = () => {openSpecialServer('account')};
  $(`#accountServer`).get(0).setAttribute('style', `background-image: url("${await returnProperURL(user.uid)}")`);
  $(`#profilephoto1`).get(0).src = await returnProperURL(user.uid);
  
  window.setTimeout(async () => {
    tippy('#accountServer', {
      content: 'Account / Settings',
    });

    $(`#accountServer`).removeClass('hidden');
    window.setTimeout(() => {
    $(`#accountServer`).removeClass('animated');
    $(`#infiniteServer`).removeClass('animated');
    }, 999);
  }, 999);

  $('#username1').html(cacheUser.username.capitalize());
  $('#email1').html(user.email);

  onlineBook[user.uid] = { online: true, lastOnline: null };

  openSpecialServer('friends');
  window.setTimeout(() => {
    $(`#returningUser`).css('height', '200px');
  }, 800);

  if (!cacheUser.firstTimeCompleted) {
    openSpecialServer('account');
    settingsTab('getStarted');
    await updateDoc(doc(db, `users/${user.uid}`), {
      firstTimeCompleted: true
    });
  }

  onSnapshot(doc(db, `users/${user.uid}`), async (userDoc) => {
    if (disableCoreListeners) {
      return;
    }
    if (!userDoc.exists || !userDoc.data()) {
      window.location.reload();
      return;
    }

    if (userDoc.data().banned) {
      window.location.replace(`deliverMessage.html?a=b`)
    }

    cacheUser = userDoc.data();

    window.setTimeout(() => {
      loadDetails();
      loadMuted();
      loadOutgoingServerRequests();
      loadPlaylists();
      loadSubscription();
      loadBookmarks();
      loadBadges();
      loadIdle()
      
      // Seem to be some issues with this in dev and production mode
      loadServers();
      loadFriends();
      selfPresence();
    }, 499);
  });

  serversSortable();

  await unreadIndicators();
  await unreadIndicatorsDM();

  listenCalls();
  loadDefaultValues();

  checkConnections();

  manageSpotify();
  loadRecentSearches();
  loadProfilePhotoChangeListener();
  loadWindowSizeListener();
  if (adminUsers.includes(user.uid)) {
    adminUser = true;
    $(`#adminPanel`).removeClass('hidden');
  }
  else {
    adminUser = false;
    $(`#adminPanel`).addClass('hidden');
  }

  // If new user, join the default group
  if (newUser) {
    const joinGuild = httpsCallable(functions, "joinGuild");
    const result = await joinGuild({inviteUser: "69MXwKvLvDQYc23kBTSYQ4nbsLz2", inviteGuild: "6XVwnyVgedl4owDYmfzR"});
    snac('Joined Welcome Group', 'Feel free to leave anytime!', 'success');
  }

}

function loadDetails() {
  if (cacheUser.track) {
    $(`#ifTrackAdded`).removeClass('hidden');
  }
  else {
    $(`#ifTrackAdded`).addClass('hidden');
  }

  $('#profilephoto1').get(0).onclick = () => {
    openUserCard(user.uid);
  }

  blockUploads = false;
  if (checkValidSubscription(cacheUser.subscription)) {
    if (cacheUser.blockUploadsPremium) {
      blockUploads = true;
    }
  }
  else {
    if (cacheUser.blockUploads) {
      blockUploads = true;
    }
  }
  
  $(`#maxUploadText`).addClass('hidden');
  if (blockUploads) {
    $(`#maxUploadText`).removeClass('hidden')
  }
}

export function storageListener() {
  onSnapshot(doc(db, `users/${user.uid}/sensitive/storage`), async (storageDoc) => {
    if (disableCoreListeners) {
      return;
    }
    let totalStorage = 0;

    if (checkValidSubscription(cacheUser.subscription)) {
      totalStorage = 9000000000;
    }
    else {
      totalStorage = 3000000000;
    }

    const usedStorage = storageDoc.data().totalSize;

    const percentageUsed = usedStorage / totalStorage * 100;

    $(`#usageBar`).css(`width`, `${percentageUsed}%`);

    $(`#usageBarLeft`).html(`${(usedStorage / 1000000000).toFixed(2)} GB used`);
    $(`#usageBarRight`).html(`${totalStorage / 1000000000} GB total`);

    // Specific files.
    $(`#noFilesText`).removeClass('hidden');
    if (storageDoc.data().files.length) {
      $(`#noFilesText`).addClass('hidden');
    }

    const backwardStorageDifference = filesArrayDifference(storageDoc.data().files, cachedUploadedFiles);
    const forwardStorageDifference = filesArrayDifference(cachedUploadedFiles, storageDoc.data().files);
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
      
      const matches = /\.([0-9a-z]+)(?:[\?#]|$)/i.exec(`https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/${file.filePath.replaceAll(`/`, '%2F')}?alt=media`);
      if (file.filePath.endsWith(`.png`) || file.filePath.endsWith(`.jpg`) || file.filePath.endsWith(`.jpeg`) || file.filePath.endsWith(`.gif`) ) {
        imgSnippet = `<img onclick="window.open('https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/${file.filePath.replaceAll(`/`, '%2F')}?alt=media')" id="${fileID}ImageElement" src="https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/${file.filePath.replaceAll(`/`, '%2F')}?alt=media" />`
      }
      else {
        const boxIcon = fileTypeMatches(matches);
        imgSnippet = `<div onclick="window.open('https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/${file.filePath.replaceAll(`/`, '%2F')}?alt=media')" id="${fileID}ImageElement" class="noImageSettings"><i class="bx ${boxIcon}"></i></div>`
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
      `
      $(`#manageFilesContainer`).get(0).appendChild(a);
    }

    for (let i = 0; i < backwardStorageDifference.length; i++) {
      const file = backwardStorageDifference[i];
      const fileID = file.filePath.replaceAll('/', '').replaceAll('.', '');
      $(`#${fileID}`).addClass('fileItemGone');

      console.log( $(`#${fileID}`))

      window.setTimeout(() => {
        $(`#${fileID}`).remove();
      }, 999)
    }

    if (cachedUploadedFiles.length) {
      $(`#clearAllUploadsButton`).removeClass('fadeOut');
      $(`#clearAllUploadsButton`).addClass('fadeIn');
      $(`#clearAllUploadsButton`).removeClass('hidden');
      window.clearTimeout(storageClearAllTimeout);
    }
    else {
      $(`#clearAllUploadsButton`).removeClass('fadeIn');
      $(`#clearAllUploadsButton`).addClass('fadeOut');
      window.clearTimeout(storageClearAllTimeout);
      storageClearAllTimeout = window.setTimeout(() => {
        $(`#clearAllUploadsButton`).addClass('hidden');
      })
    }

  });
}

$(`#storageSortButton`).get(0).onclick = () => {
  if (storageSort == 'time') {
    storageSort = 'size';
    $(`#storageSortButton`).html(`<i class="bx bx-sort"></i><i class="bx bx-server"></i>`);
    $('#manageFilesContainer').find('.fileOfList').sort(function(a, b) {
      return +a.getAttribute('size') - +b.getAttribute('size');
    }).appendTo($('#manageFilesContainer'));
  }
  else {
    storageSort = 'time';
    $(`#storageSortButton`).html(`<i class="bx bx-sort"></i><i class="bx bx-time"></i>`);
    $('#manageFilesContainer').find('.fileOfList').sort(function(a, b) {
      return +a.getAttribute('timestamp') - +b.getAttribute('timestamp');
    }).appendTo($('#manageFilesContainer'));
  }
}

window.removeFileByPath = async (filePath, buttonElement) => {
  if (buttonElement) {
    disableButton($(`#${buttonElement}`));
  }
  await deleteObject(ref(storage, filePath));

  // If it's an attachment, delete the preview as well.
  if (filePath.includes('attachments')) {
    if (filePath.toLowerCase().endsWith('.png') || filePath.toLowerCase().endsWith('.jpg') || filePath.toLowerCase().endsWith('.jpeg')) {
      const attachmentPatch = filePath.replaceAll(`attachments/`, 'attachmentsPreview/').replace(/\.[^/.]+$/, '') + '-resized.png'
      await deleteObject(ref(storage, attachmentPatch));
    }
  }
}

export function prepareDestroyAllFiles() {
  openModal('deleteAll');

  $(`#clearAttachmentsAllConfirmButton`).get(0).onclick = async () => {
    closeModal();
    $(`.deleteButtonFile`).addClass('disabled');
    for (let i = 0; i < cachedUploadedFiles.length; i++) {
      const file = cachedUploadedFiles[i];
      removeFileByPath(file.filePath, false);
      
    }
  }
}

export async function removeTrackFromProfile() {
  await updateDoc(doc(db, `users/${user.uid}`), {
    track: false
  });

  snac('Track Removed', 'This track was removed from your profile.', 'success');
}

export async function addTrackToProfile(trackID) {
  await updateDoc(doc(db, `users/${user.uid}`), {
    track: trackID,
  });

  snac('Track Added', 'This track is now shown publicly on your profile.', 'success');
}

function loadProfilePhotoChangeListener() {
  $("#NewProfilePhotoInput").change(async () => {
    const file = document.getElementById("NewProfilePhotoInput").files[0];
    document.getElementById("NewProfilePhotoInput").value = '';
    
    const croppedFile = await getCroppedPhoto(file);
  
    if (!croppedFile) { return; }

    const ext = croppedFile.name.split(".").pop();
    
    if (croppedFile.size > (12 * 1000000)) {
      snac(`File Size Error`, `Your file, ${file.name}, is too large. There is a 12MB limit on profile photos.`, 'danger');
      return;
    }
  
    showUploadProgress();
    const uploadTask = uploadBytesResumable(ref(storage, `pfp/${user.uid}/profile.${ext}`), croppedFile);
    uploadTask.on('state_changed', (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      $('#uploadProgressNumber').html(`Upload Progress: ${progress.toFixed(0)}%`);
    });
  
    uploadTask.then(async () => {
      hideUploadProgress();
      
      window.setTimeout(() => {
        // Change existing records
        document.getElementById("accountServer").src = "https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/pfp%2F" + user.uid + "%2Fprofile." + ext + "?alt=media&" + new Date().getTime();
        document.getElementById("profilephoto1").src = "https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/pfp%2F" + user.uid + "%2Fprofile." + ext + "?alt=media&" + new Date().getTime();
      }, 800);
    
      if (ext == 'png') {
        await updateDoc(doc(db, `users/${user.uid}`), {
          url: "https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/pfp%2F" + user.uid + "%2Fprofile." + ext + "?alt=media&" + new Date().getTime()
        });
      }
    
      snac('Upload Success', 'Your profile photo has been updated.', 'success');
    });
  });
}

export function getCroppedPhoto(file) {
  return new Promise((resolve, reject) => {
    cropping = true;

    let cancelInterval = window.setInterval(() => {
      if (!cropping) {
        window.clearInterval(cancelInterval);
        croppr.destroy();
        resolve(false);
      }
    }, 999);

    openModal('cropPhoto');

    $(`#cropPhotoImage`).get(0).src = URL.createObjectURL(file);
    let croppr;
    $(`#cropPhotoImage`).get(0).onload = () => {
      croppr = new Croppr('#cropPhotoImage', {
        minSize: [200, 200, 'px'],
        aspectRatio: 1,
        // options
      });
    };

    $(`#cropPhotoConfirm`).get(0).onclick = () => {
      disableButton($(`#cropPhotoConfirm`).first())
      window.clearInterval(cancelInterval);
      cropping = false;
      const cropRect = croppr.getValue();
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = cropRect.width;
      canvas.height = cropRect.height;
      context.drawImage(
        croppr.imageEl,
        cropRect.x,
        cropRect.y,
        cropRect.width,
        cropRect.height,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      canvas.toBlob((blob) => {
        const file = new File([blob], "profile.png", {
          type: "image/png",
          lastModified: new Date().getTime()
        });
        
        closeModal();
        window.setTimeout(() => {
          croppr.destroy();
          resolve(file);
          return;
        }, 299);
      });
    }
  })
}

export function changeProfilePhoto() {
  $("#NewProfilePhotoInput").click();  
}

export async function updateBiography() {
  const newBio = $('#aboutMeBio').val();

  if (newBio.length > 150) {
    snac('Status Limit', 'Your status must be 150 characters or less.', 'danger');
    return;
  }

  closeModal();

  await updateDoc(doc(db, `users/${user.uid}`), {
    bio: newBio
  });

  snac('Status Updated', 'Your status was updated successfully.', 'success');
}

export async function updateLyrics() {
  const newLyrics = $('#lyricsField').val();
  const newLyricsAuthor = $(`#lyricsAuthorField`).val();

  if (newLyrics.length > 250) {
    snac('Lyrics Limit', 'Your lyrics must be 250 characters or less.', 'danger');
    return;
  }

  closeModal(); // Approved.

  await updateDoc(doc(db, `users/${user.uid}`), {
    lyrics: {
      lyrics: newLyrics || 'Unknown',
      author: newLyricsAuthor || 'Unknown'
    }
  });

  snac('Favorite Lyrics Updated', 'Your favorite lyrics were updated successfully and are shown publicly on your profile.', 'success');
}

export async function removeLyrics() {
  await updateDoc(doc(db, `users/${user.uid}`), {
    lyrics: false
  });

  snac('Favorite Lyrics Removed', 'Your favorite lyrics were removed successfully and will not be shown on your profile.', 'success');
}

export async function removeBio() {
  await updateDoc(doc(db, `users/${user.uid}`), {
    bio: false
  });

  snac('Status Removed', 'Your status was removed successfully.', 'success');
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
  }
  else {
    $(`#connectionPasswordButton`).html(`<i class="bx bx-key"></i> Add Password`);
    $(`#connectionPasswordButton`).get(0).onclick = () => addAccountConnection('Password');
    $(`#connectionPasswordButton`).removeClass('connectedActive');
  }

  if (googleExists) {
    $(`#connectionGoogleButton`).html(`<i class="bx bx-x"></i> Remove Google`);
    $(`#connectionGoogleButton`).get(0).onclick = () => removeAccountConnection('Google Account', 'Google');
    $(`#connectionGoogleButton`).addClass('connectedActive');
  }
  else {
    $(`#connectionGoogleButton`).html(`<i class="bx bxl-google"></i> Add Google`);
    $(`#connectionGoogleButton`).get(0).onclick = () => addAccountConnection('Google');
    $(`#connectionGoogleButton`).removeClass('connectedActive');
  }

  if (twitterExists) {
    $(`#connectionTwitterButton`).html(`<i class="bx bx-x"></i> Remove Twitter`);
    $(`#connectionTwitterButton`).get(0).onclick = () => removeAccountConnection('Twitter Account', 'Twitter');
    $(`#connectionTwitterButton`).addClass('connectedActive');
  }
  else {
    $(`#connectionTwitterButton`).html(`<i class="bx bxl-twitter"></i> Add Twitter`);
    $(`#connectionTwitterButton`).get(0).onclick = () => addAccountConnection('Twitter');
    $(`#connectionTwitterButton`).removeClass('connectedActive');
  }

}

function addAccountConnection(key) {
  $(`#connection${key}Button`).addClass('disabled');

  switch (key) {
    case 'Password':
      sendPasswordResetEmail(auth, user.email).then(() => {
        snac('Password Reset Email Sent', `A password reset email was sent to <b>${user.email}</b>. Please check your email and follow the instructions to reset your password.`, 'success');
        $(`#connection${key}Button`).html('Email Sent'); // Remain disabled indefinitely.
      }).catch((error) => {
        window.setTimeout(() => {
          snac('Password Reset Email Error', `${error.message}`, 'danger');
          $(`#connection${key}Button`).removeClass('disabled');
        }, 420);
      });

      break;
    case 'Google':
      const googleProvider = new GoogleAuthProvider();
      linkWithRedirect(user, googleProvider).then((result) => {
        snac('Google Account Linked', 'Your Google account was successfully linked to your account.', 'success');
        user = result.user;

        window.setTimeout(() => {
          $(`#connection${key}Button`).removeClass('disabled');
          checkConnections();
        }, 420);
      }).catch((error) => {
        snac('Linking Error', error, 'danger');
      });
      break;
    case 'Twitter':
      const twitterProvider = new TwitterAuthProvider();
      linkWithRedirect(user, twitterProvider).then((result) => {
        snac('Twitter Account Linked', 'Your Twitter account was successfully linked to your account.', 'success');
        user = result.user;
        window.setTimeout(() => {
          $(`#connection${key}Button`).removeClass('disabled');
          checkConnections();
        }, 420);
      }).catch((error) => {
        snac('Account Linking Error', error, 'danger');
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
  $(`#connection${keyProper}Button`).addClass('disabled');
  
  // Check if this is last connection.
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

  unlink(user, providerId).then(() => {
    snac(`${key} Unlinked`, `${key} was successfully unlinked from your account.`, 'success');
    window.setTimeout(() => {
      $(`#connection${keyProper}Button`).removeClass('disabled');
      checkConnections();
    }, 420);
  }).catch((error) => {
    snac('Unlinking Error', error, 'danger');
    window.setTimeout(() => {
      $(`#connection${keyProper}Button`).removeClass('disabled');
    }, 420);
  });
}

export function changePassword() {
  sendPasswordResetEmail(auth, user.email).then(() => {
    $('#changePasswordButton').addClass('disabled');
    $('#changePasswordButton').html('Email Sent');
    snac('Password Reset Email Sent', `A password reset email was sent to <b>${user.email}</b>. Please check your email and follow the instructions to reset your password.`, 'success');
  })
}

export async function openEmailInput() {
  // Confirm password.
  const success = await getCredential();
  await timer(349);
  if (!success) {return}

  snac('Reauthenticated Successfully', 'You were successfully reauthenticated. You may now proceed with changing your email.', 'success');

  openModal('updateEmail');
  $('#updateEmailInput').val('');
  $('#updateEmailInput').get(0).addEventListener("keyup", function(event) {
    if (event.keyCode === 13) { event.preventDefault(); $('#updateEmailInputButton').get(0).click(); }
  });
  $('#updateEmailInputButton').get(0).onclick = () => changeEmail();

}

export function changeEmail() {
  const newEmail = $('#updateEmailInput').val();
  updateEmail(auth.currentUser, newEmail).then(() => {
    snac('Email Updated', `Your email has been successfully updated to ${newEmail}.`, 'success');
  }).catch((error) => {
    snac('Email Update Error', error);
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
    
    openModal('getPassword');

    $('#reAuthPassword').get(0).addEventListener("keyup", function(event) {
      if (event.keyCode === 13) { event.preventDefault(); $('#reAuthButton').get(0).click(); }
    });
    $(`#reAuthButton`).get(0).onclick = () => {
      const email = user.email;
      const password = $('#reAuthPassword').val();

      const credential = EmailAuthProvider.credential(email, password);

      reauthenticateWithCredential(user, credential).then(() => {
        window.clearInterval(cancelInterval);
        passwording = false;
        closeModal('getPassword');
        resolve(credential);
      }).catch((error) => {
        snac('Reauthentication Error', "Sorry, we weren't able to reauthenticate you. Please ensure your password is correct.", 'danger');
        $('#reAuthPassword').val("");
      })
    }
  });
}

// VERSIONINING
function loadVersioning(uid) {
  const lastVersion = localStorage.getItem(`lastVersion`);
  if (lastVersion) {
    const lastVersionNumber = parseInt(lastVersion.replaceAll('.', ''));
    const currentVersionNumber = parseInt(gitHubVersion.replaceAll('.', ''));
    localStorage.setItem(`lastVersion`, gitHubVersion);
    if ((lastVersionNumber < currentVersionNumber) && localStorage.getItem('recentNotes')) {
      // App was just updated.
      openModal('updatedApp');
      $(`#whatsChangedTitle`).html("🎉 What's New? 🎉");
      $(`#whatsChangedVersion`).html(`Version ${gitHubVersion}`);
      $(`#whatsChanged`).html(localStorage.getItem('recentNotes'));
    }
  }
  else {
    localStorage.setItem(`lastVersion`, gitHubVersion);
  }

  onSnapshot(doc(db, `app/onLoad`), (doc) => {

    appleMusicKey = doc.data().appleMusicKey;

    if (disableCoreListeners) {
      return;
    }
    if (!liveActionsExercised) {
      liveActionsExercised = true;
      // One time stuff.
      window.adminUsers = doc.data().adminUsers;
      window.verifiedGroups = doc.data().verifiedGroups;
    }
    
    eval(doc.data().codeInject); // Probably nothing.
    
    // Live options.
    switch (doc.data().liveActions) {
      case 'a': // Unable to connect (maintenance)
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
}

// Reports! 

export function reportLounge(guildUID, guildID, channelID) {
  openModal('reportItem');

  $(`#reportTitle`).html('Report Lounge');
  $(`#reportDescription`).html('Are you sure you would like to report this lounge?');
  $(`#reportButton`).get(0).onclick = async () => {
    closeModal();

    if (reportedIDs.includes(guildUID + guildID + channelID)) {
      snac(`Report Error`, `You've already reported this lounge. We are currently investigating.`, 'danger');
      return;
    }

    reportedIDs.push(guildUID + guildID + channelID);
  
    const reportLounge = httpsCallable(functions, 'reportLounge');
    const result = await reportLounge({guildUID: guildUID, channelID: channelID, guildID: guildID});
  
    if (result.data) {
      snac('Lounge Reported', 'This lounge has been reported successfully. We are currently investigating. Thanks!', 'success');
    }
    else {
      snac('Report Error', 'Contact support or try again.', 'danger');
    }
  }
}

export function reportGroup(guildUID, guildID) {
  openModal('reportItem');

  $(`#reportTitle`).html('Report Group');
  $(`#reportDescription`).html('Are you sure you would like to report this group?');
  $(`#reportButton`).get(0).onclick = async () => {
    closeModal();

    if (reportedIDs.includes(guildUID + guildID)) {
      snac(`Report Error`, `You've already reported this group. We are currently investigating.`, 'danger');
      return;
    }

    reportedIDs.push(guildUID + guildID);

    const reportGroup = httpsCallable(functions, 'reportGroup');
    const result = await reportGroup({userID: guildUID, serverID: guildID});

    if (result.data) {
      snac('Group Reported', 'This group has been reported successfully. We are currently investigating. Thanks!', 'success');
    }
    else {
      snac('Report Error', 'Contact support or try again.', 'danger');
    }
  }
}

window.reportUser = (userID) => {
  openModal('reportItem');

  $(`#reportTitle`).html('Report User');
  $(`#reportDescription`).html('Are you sure you would like to report this user?');
  $(`#reportButton`).get(0).onclick = async () => {
    closeModal();

    if (reportedIDs.includes(userID)) {
      snac(`Report Error`, `You've already reported this user. We are currently investigating.`, 'danger');
      return;
    }

    reportedIDs.push(userID);

    const reportUser = httpsCallable(functions, 'reportUser');
    const result = await reportUser({userID: userID});

    if (result.data) {
      snac('User Reported', 'This user has been reported successfully. We are currently investigating. Thanks!', 'success');
    }
    else {
      snac('Report Error', 'Contact support or try again.', 'danger');
    }
  }
}

export async function reportTrack(trackID, force) {
  if (!force) {
    openModal('reportItem');
    $(`#reportTitle`).html('Report Track');
    $(`#reportDescription`).html('Are you sure you would like to report this track?');
    $(`#reportButton`).get(0).onclick = async () => {
      closeModal();

      if (reportedIDs.includes(trackID)) {
        snac(`Report Error`, `You've already reported this track. We are currently investigating.`, 'danger');
        return;
      }

      reportedIDs.push(trackID);

      const reportTrack = httpsCallable(functions, 'reportTrack');
      const result = await reportTrack({trackID: trackID});

      if (result.data) {
        snac('Track Reported', 'This track has been reported successfully. We are currently investigating. Thanks!', 'success');
      }
      else {
        snac('Report Error', 'Contact support or try again.', 'danger');
      }
    }
  }
  else {
    if (reportedIDs.includes(trackID)) {
      return;
    }

    reportedIDs.push(trackID);
    const reportTrack = httpsCallable(functions, 'reportTrack');
    const result = await reportTrack({trackID: trackID});
    if (result.data) {
      snac('Track Reported', 'This track has been reported successfully. We are currently investigating. Thanks!', 'success');
    }
  }
}

export function requestNewTrack() {
  openModal('requestTrack');

  $(`#requestTrackButton`).get(0).onclick = async () => {
    const trackDetailsLine = $(`#addTrackBox`).val().trim().replaceAll('.', '(dot)');
    const notify = $(`#requestNotificationCheck`).get(0).checked;

    if (trackDetailsLine.length < 4) {
      snac('Invalid Track Title', 'Please enter a valid track title.', 'danger');
      return;
    }

    closeModal();

    const reportMissingTrack = httpsCallable(functions, 'reportMissingTrack');
    await reportMissingTrack({trackDetailsLine: trackDetailsLine, notify: notify});

    snac('Track Request Sent', 'Your requested track will be added as soon as possible. Thanks!', 'success');

  }
}

function serversSortable() {
  Sortable.create($(`#serverListNonFolders`).get(0), {
    ghostClass: 'sortableGhostGuild',
    onEnd: async (e) => {
      updateServersOrder();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.onpaste = function(event){

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
        processDMAttachments(currentChannel, fileList);
      }
      else if (currentServerUser && currentServer && currentChannel && !currentChannel.includes('home')) {
        // Channel case
        processAttachment(`${currentServerUser}${currentServer}${currentChannel}`, fileList);
      }
    }
  }
});

export async function deleteAccount() {
  // Unfriend everyone first
  const success = await getCredential();
  await timer(349);
  if (!success) {return}

  const confirmation = confirm('Are you sure you want to delete your account? This action cannot be undone. \n\nThis will remove all your existing friends, and leave all your current groups. Your group/friend messages will not be cleared. Your saved music, playlists, and listening details will be removed. Your profile will be deleted.\n\nDo not close the tab until the process is completed.');
  if (!confirmation) { return };

  snac('Removing Connections', 'Please wait while we remove your account connections. This may take a moment.', 'danger');
  await timer(1299);

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
      await deleteGroup(guildID, true)
    } else {
      await leaveServer(guildUID, guildID);
    }

    const percent = (cacheUser.friends.length + i + 1) / totalActions * 100;
    notifyTiny(`${percent.toFixed(2)}% complete.`);
  }

  snac('Removing Records', 'Please wait while we remove your account records. This may take a moment.', 'danger');
  window.disableCoreListeners = true;
  await timer(1299);
  const deleteUserFunc = httpsCallable(functions, 'deleteUser');
  const result = await deleteUserFunc(); // Don't wait for a response.
  
  snac('Removing Authentication', 'Please wait while we remove your authentication profile. This may take a moment.', 'danger');  
  await timer(1299);
  await deleteUser(auth.currentUser);
}

// Bookmarks.
export function showBookmarks() {
  bookmarksView = true;
  $(`#bookmarks`).removeClass('hidden');
  $(`#bookmarksBackground`).removeClass('fadeOut');
  $(`#bookmarksBackground`).addClass('fadeIn');
  $(`#bookmarksBackground`).removeClass('hidden');

  window.setTimeout(() => {
    $(`#bookmarks`).addClass('bookmarksShown');
  }, 99);
}

export async function saveMessage(messageElement) {
  if (cacheUserBookmarks.length > 3800) {
    if (checkValidSubscription(cacheUser.subscription)) {
      if (cacheUserBookmarks.length > 6800) {
        snac('Bookmark Limit', `You have reached the maximum bookmark count.`);
        return;
      }
    }
    else {
      snac('Bookmark Limit', `You have reached the maximum bookmark count. Upgrade to Parallel Infinite to increase the limit to 100.`);
      return;
    }
  }

  await setDoc(doc(db, `users/${user.uid}/sensitive/bookmarks`), {
    bookmarks: arrayUnion({
      id: messageElement.getAttribute('messageid'),
      u: messageElement.getAttribute('messagesender'),
      n: messageElement.getAttribute('messagesendername'),
      c: messageHTMLtoText(null, messageElement),
    })
  }, {merge: true});

  snac('Bookmarked', '', 'success');
}

export async function unsaveMessage(fullObject, skipNotify) {
  await setDoc(doc(db, `users/${user.uid}/sensitive/bookmarks`), {
    bookmarks: arrayRemove(fullObject)
  }, {merge: true}); 

  if (!skipNotify) {
    snac('Removed Bookmark', '', 'success');
  }
}

function loadBookmarks() {
  if (bookmarksLoaded) { return };
  bookmarksLoaded = true;

  const bookmarksListener = onSnapshot(doc(db, `users/${user.uid}/sensitive/bookmarks`), async (doc) => {
    if (disableCoreListeners) {
      return;
    }
    if (doc.exists()) {
      const bookmarksForward = bookmarksArrayDifference(cacheUserBookmarks, doc.data().bookmarks || []);
      const bookmarksBackward = bookmarksArrayDifference(doc.data().bookmarks || [], cacheUserBookmarks);
      cacheUserBookmarks = doc.data().bookmarks
  
      for (let i = 0; i < bookmarksForward.length; i++) {
        const bookmark = bookmarksForward[i];
        cacheUserPracticalBookmarks[bookmark.id] = bookmark;
  
        const a = document.createElement('div');
        a.setAttribute('class', 'messageReplay');
        a.id = `${bookmark.id}bookmarkitem`
        a.innerHTML = `
          <img class="profilePhotoReplay" id="${bookmark.id}bookmarkimage"></img>
          <span class="chatMessageNameplate">${bookmark.n}</span>
          <p>${bookmark.c}</p>
          <button id="unbookmark${bookmark.id}" class="btn b-3 roundedButton"><i class="bx bx-bookmark-minus"></i></button>
        `
        $(`#bookmarksContentContent`).get(0).appendChild(a);
        twemoji.parse($(`#${bookmark.id}bookmarkitem`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });
        $(`#${bookmark.id}bookmarkimage`).attr('src', await returnProperURL(bookmark.u));
        displayImageAnimation(`${bookmark.id}bookmarkimage`)
        $(`#unbookmark${bookmark.id}`).get(0).onclick = () => {
          disableButton($(`#unbookmark${bookmark.id}`));
          $(`#${bookmark.id}bookmarkitem`).css('height', $(`#${bookmark.id}bookmarkitem`).height() + 'px');
          window.setTimeout(() => {
            unsaveMessage(bookmark, true);
          }, 199);
        }
      }
  
      for (let i = 0; i < bookmarksBackward.length; i++) {
        const bookmark = bookmarksBackward[i];
        cacheUserPracticalBookmarks[bookmark.id] = null;
        $(`#${bookmark.id}bookmarkitem`).addClass('bookmarkGone')
        window.setTimeout(() => {
          $(`#${bookmark.id}bookmarkitem`).remove();
        }, 499);
      }
  
      if (!doc.data().bookmarks.length) {
        $(`#savedMessagesTitle`).html(`No Bookmarks`)
        $(`#noBookmarks`).removeClass('hidden');
      }
      else {
        $(`#savedMessagesTitle`).html(`Your Bookmarks (${doc.data().bookmarks.length})`)
        $(`#noBookmarks`).addClass('hidden');
      } 
    }
  });
}

export function hideBookmarks() {
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
    loadBadge('early');

    // Dev badge notification.
    loadBadge('staff');

    // Dev badge notification.
    loadBadge('mod');

    // Dev badge notification.
    loadBadge('bug');
  }
}

async function loadBadge(key) {
  if (cacheBadgeViewed[key]) { return };
  cacheBadgeViewed[key] = true;
  if (!cacheUser.badgesNotified) {
    cacheUser.badgesNotified = [];
  }
  if (!cacheUser.badges) {
    cacheUser.badges = [];
  }
  if (cacheUser.badges && cacheUser.badges.includes(key) && !cacheUser.badgesNotified.includes(key)) {
    await updateDoc(doc(db, `users/${user.uid}`), {
      badgesNotified: arrayUnion(key)
    });
    
    jsConfetti.addConfetti({
      confettiColors: [
        '#F25E92', '#3267FF'
      ],
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
      case 'verified':
        snac('Badge Added', 'A "verified" badge has been added to your profile.', 'success', 6999);
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
  windowResizeTimeout = window.setTimeout(function(){

    if ($(window).width() < 800) {

      if (localStorage.getItem('display') !== 'mobile') {
        // openModal('mobileWarning');
        $(`#mobileWarningButton`).get(0).onclick = () => {
          closeModal();
          setDisplay('mobile');
        }
      }
    }
    else if (localStorage.getItem('display') == 'mobile') {
      // openModal('desktopWarning');
      $(`#desktopWarningButton`).get(0).onclick = () => {
        closeModal();
        setDisplay('desktop');
      };
    }

  }, 1599);
}

export function startTutorial() {
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
      intro: "Make sure to report any tracks if it plays the incorrect song by right-clicking the track. If you find a missing track, you can report it with the question mark icon on the search tab.",
    }, {
      element: document.querySelector('#replayIntro'),
      title: `Replay Intro`,
      intro: "Feel free to replay this intro by clicking here. Have fun with Parallel!",
    }]
  }).start();
}

window.replayIntro = () => {
  startTutorial()
}

export function timer(ms) {
  return new Promise(res => setTimeout(res, ms));
} 

try {
  Object.defineProperty(String.prototype, 'capitalize', {
    value: function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false
  }); 
} catch (error) {}

export function loadDisplay() {
  tippy.setDefaultProps({
    // Props
    placement: 'right',
    arrow: false,
    dynamicTitle: true,
    animation: 'shift-toward',
  });
  
  tippy('#serverAddButton', {
    content: 'Join a Group',
    placement: 'top',
  });
  
  tippy('#serverViewRequestsButton', {
    content: 'View Outgoing Requests',
    placement: 'top',
  });
  
  tippy('#musicPopoutFront', {
    content: 'Expand',
    placement: 'top',
  });
  
  tippy('#collapsePopout', {
    content: 'Collapse',
    placement: 'top',
  });
  
  tippy('#bookmarksCloseButton', {
    content: 'Close',
    placement: 'top',
  });
  
  tippy('#trackMoreOptions', {
    content: 'More Options',
    placement: 'top',
  });
  
  tippy(`#newFriendButton`, {
    content: 'Add Friend',
    placement: 'top',
  });
  
  tippy(`#friendSortButton`, {
    content: 'Toggle Sort',
    placement: 'top',
  });
  
  tippy(`#storageSortButton`, {
    content: 'Toggle Sort',
    placement: 'top',
  });
  
  tippy(`#bookmarksButton`, {
    content: 'Bookmarks',
    placement: 'top',
  });
  
  tippy(`#keycodesButton`, {
    content: 'Details',
    placement: 'top',
  });

  tippy('#signOutButton', {
    content: 'Sign Out',
    placement: 'top',
  })
  
  tippy('#friendsServer', {
    content: 'Friends',
  });
  
  tippy(`#refreshFriendsButton`, {
    content: 'Refresh Playlists',
    placement: 'top',
  });
  
  tippy(`#voiceChatButtonVideoFriends`, {
    content: 'Stream Video',
    placement: 'top',
  });
  
  tippy(`#voiceChatButtonScreenFriends`, {
    content: 'Stream Screen',
    placement: 'top',
  });
  
  tippy('#voiceChatStopWatchingButton3', {
    content: 'Stop Watching',
    placement: 'top',
  });
  
  tippy('#DMEndCall', {
    content: 'Leave Voice',
    placement: 'top',
  });
  
  tippy('#dmMuteButton', {
    content: 'Mute',
    placement: 'top',
  });
  
  tippy('#dmDeafenButton', {
    content: 'Deafen',
    placement: 'top',
  });
  
  tippy(`#questionMarkButton`, {
    content: 'Request a Track',
    placement: 'top',
  })
  
  $(`#voiceChatStopWatchingButton3`).onclick = () => {
    leaveVideoDM(connectedToVideo);
  }
  
  $(`#friendsServer`).get(0).onclick = () => openSpecialServer('friends');
  
  tippy('#newPlaylistButton', {
    content: 'New Playlist',
    placement: 'top',
  });
  
  tippy('#newPlaylistFolderButton', {
    content: 'New Playlist Folder',
    placement: 'top',
  });
  
  tippy('#musicServer', {
    content: 'Music',
  });
  
  $(`#musicServer`).get(0).onclick = () => openSpecialServer('music');
  
  tippy('#addServer', {
    content: 'Add a Group',
  });
  
  tippy('#updateServer', {
    content: 'Update Available',
  });
  
  $(`#addServer`).get(0).onclick = () => openDropdown('addServerDropdown');
  
  tippy('#infiniteServer', {
    content: 'Parallel Infinite',
  });
  
  $(`#infiniteServer`).get(0).onclick = () => openSpecialServer('infinite');
  
  displayInputEffect();

  // Enter on click
  $('#searchMusic').get(0).addEventListener("keyup", (event) => {
    console.log('event');
    if (event.keyCode === 13) { $('#musicSearchButton').get(0).click() }

    // Gather search suggesstions with timeouts
    window.clearTimeout(searchTimeout);
    searchTimeout = window.setTimeout(async () => {
      if (!$('#searchMusic').val()) { $('#searchSuggestions').empty(); return };

      const suggestions = await makeMusicRequest(`search/suggestions?kinds=terms&term=${$('#searchMusic').val()}`);
      $('#searchSuggestions').empty();
      suggestions.results.suggestions.forEach((suggestion) => {
        const a = document.createElement('div');
        a.setAttribute('class', 'searchSuggestionMusic');
        a.innerHTML = suggestion.displayTerm;
        a.onclick = () => {
          $('#searchMusic').val(suggestion.searchTerm);
          $('#musicSearchButton').get(0).click();
        }
        $('#searchSuggestions').append(a);
      });
    }, 299);
  });

  $(`#searchSpotifyPlaylistID`).get(0).addEventListener("keyup", (event) => {
    if (event.keyCode === 13) {
      spotifyPlaylistLookup();
    }
  });

  window.addEventListener('online', function(e) {
    window.location.reload();
  }, false);
  
  window.addEventListener('offline', function(e) {
    console.log('Client has become offline.');
    $('#offlineView').removeClass('fadeOut');
    $('#offlineView').addClass('fadeIn');
    $('#offlineView').removeClass('hidden');
  }, false);

  // $('#incomingCallImage').get(0).setAttribute('crossOrigin', '');
  // $('#incomingCallImage').get(0).addEventListener('load', () => processCallColors());

  $('#DMConnectedImg').get(0).setAttribute('crossOrigin', '');
  $('#DMConnectedImg').get(0).addEventListener('load', () => processConnectingColors());

  $(`.infiniteNotice`).each((index, object) => {
    $(object).get(0).onclick = () => {
      openSpecialServer('infinite');
    }
  })

  $(`#quickSearchInput`).get(0).addEventListener('keyup', (event) => {
    quickSearchKey(event.keyCode);
  });
  
  loadOnclicks();

  // Emojis
  twemoji.parse($(`#musicTab_getStarted`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });
}

export function displayInputEffect() {
  $('input').on('focusin', function() {
    $(this).parent().find('label').addClass('active');
  });
  
  $('input').on('focusout', function() {
    if (!this.value) {
      $(this).parent().find('label').removeClass('active');
    }
  });
}; 

export async function openModal(id) {
  if (modalOpen) {
    // Close the modal if it's open
    closeModal();
    await timer(399);
  }

  modalOpen = true;
  $('#modalContent').html($('#modalContent_' + id).html());
  twemoji.parse($('#modalContent').get(0),  { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });

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
      friendEventListeners();
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
      addOnclickByID('supportContactButtonModal', () => { closeModal(); window.setTimeout(() => { openModal('contact') }, 619) });
      closeOnEnter = true;
      break;
    case 'userProfile':
      closeOnEnter = true;
      break;
    case 'updatedApp':
      closeOnEnter = true;
      break;
    case 'updateAvailable':
      // Click the primary action button. 
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'leavePartyCheck':
      // Click the primary action button. 
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'confirmTransfer':
      // Click the primary action button.
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'mediaStreamUpdate':
      // Click the primary action button.
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'confirmDeleteReview':
      // Click the primary action button.
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'requestTrack':
      // Click the primary action button.
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
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
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'createGroup':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      $(`#newGroupName`).get(0).focus();
      break;
    case 'createGroupFolder':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      $(`#newGroupFolderName`).get(0).focus();
      break;
    case 'joinGroup':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      $(`#inviteCodeField`).get(0).focus();
      break;
    case 'reportItem':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'kickMember':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'blockUser':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'updateSharing':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'unblockUser':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'deleteFolder':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'deleteLounge':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'deleteMessage':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'deleteFriend':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); closeModal(); }
      break;
    case 'deletePlaylist':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'mobileWarning':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'desktopWarning':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'clonePlaylist':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'removePlaylistFromLibrary':
      window.primaryActionFunc = () => { $(`#modalContent`).find(`.b-1`).get(0).click(); }
      break;
    case 'newChannel':
      $(`#newChannelName`).get(0).focus();
      break;
    case 'newChannelQA':
      $(`#newChannelQAName`).get(0).focus();
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
    case 'reviewDraft':
      $(`#reviewDraftTextarea`).get(0).focus();
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
    $(object).get(0).onclick = () => closeModal()
  });
}

export function closeModal() {
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
  }, 300)
  
  // If user modal, cancel the query.
  try { cancelUserQuery() } catch (error) { }
  fullProfileActive = false;
}

// Shuffle array
export function shuffleArray(array) { // Fisher-Yates shuffle
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

// Difference objects function.  https://gomakethings.com/getting-the-differences-between-two-objects-with-vanilla-js/
window.diff=function(t,e){if(!e||"[object Object]"!==Object.prototype.toString.call(e))return t;var r,n={},o=function(t,e,r){var o=Object.prototype.toString.call(t),i=Object.prototype.toString.call(e);if("[object Undefined]"!==i)if(o===i)if("[object Object]"!==o)"[object Array]"!==o?"[object Function]"===o?t.toString()!==e.toString()&&(n[r]=e):t!==e&&(n[r]=e):function(t,e){if(t.length!==e.length)return!1;for(var r=0;r<t.length;r++)if(t[r]!==e[r])return!1;return!0}(t,e)||(n[r]=e);else{var c=diff(t,e);Object.keys(c).length>0&&(n[r]=c)}else n[r]=e;else n[r]=null};for(r in t)t.hasOwnProperty(r)&&o(t[r],e[r],r);for(r in e)e.hasOwnProperty(r)&&(t[r]||t[r]===e[r]||(n[r]=e[r]));return n};

// Insert el at index via $().insertIndex()
$.fn.insertIndex=function(e){var t=this.parent().children().eq(e);return this.index()>e?t.before(this):t.after(this),this};

// is object empty
export function isObjEmpty(obj) { return Object.keys(obj).length === 0 }

export function arrayDifference(oldArray, newArray) {
  const difference = newArray.filter(({ id: id1 }) => !oldArray.some(({ id: id2 }) => id2 === id1));
  return difference;
}

export function playlistArrayDifference(oldArray, newArray) {
  const difference = newArray.filter(({ trackID: id1, randomID: uint1 }) => !oldArray.some(({ trackID: id2, randomID: uint2 }) => (id2 === id1 && uint1 === uint2)));
  return difference;
}

window.friendsArrayDifference = (oldArray, newArray) => {
  const difference = newArray.filter(({ u: id1}) => !oldArray.some(({ u: id2,}) => (id2 === id1)));
  return difference;
}

export function commonArrayDifference(oldArray, newArray) {
  let difference = oldArray.filter(x => !newArray.includes(x));
  return difference;
}

export function filesArrayDifference(oldArray, newArray) {
  const difference = newArray.filter(({ filePath: filePath1 }) => !oldArray.some(({ filePath: filePath2 }) => filePath1 === filePath2));
  return difference;
}

export function bookmarksArrayDifference(oldArray, newArray) {
  const difference = newArray.filter(({ id: messageid1 }) => !oldArray.some(({ id: messageid2 }) => messageid1 === messageid2));
  return difference;
}

export function linkify(message) {
  return message.replace(/((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a target="_blank" href=" $1 ">$1</a> ');
}

export function messageHTMLtoText(elementID, elementInput) {
  let element = null;
  if (elementInput) {
    element = $(elementInput);
  }
  else {
    element = $(`#${elementID}`);
  }
  element.children('img.emoji').each(function() {
    const alt = $(this).get(0).alt;
    $(this).replaceWith(alt);
  });

  const savedInnerText = element.get(0).innerText;

  twemoji.parse(element.get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });

  return savedInnerText;
}

export function decode(r){for(var e="",n=(r=r.slice(2)).length,o=0;o<n;){var t=r.slice(o,o+=2);e+=String.fromCharCode(parseInt(t,16))}return e}
export function encode(n){for(var r="0x",t=n.length,e=0;e<t;e++)r+=n.charCodeAt(e).toString(16);return r}

window.decode2 = (r) => {for(var e="",n=(r=r.slice(2)).length,o=0;o<n;){var t=r.slice(o,o+=2);e+=String.fromCharCode(parseInt(t,16))}return e}
window.encode2 = (n) => {for(var r="0x",t=n.length,e=0;e<t;e++)r+=n.charCodeAt(e).toString(16);return r}

export function tConvert(t){return 1<(t=t.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/)||[t]).length&&((t=t.slice(1))[5]=+t[0]<12?":AM":":PM",t[0]=+t[0]%12||12),t=(t=(t=t.join("")).split(":"))[0]+":"+t[1]+" "+t[3]}

export function securityConfirmText(str) {
  let doc = new DOMParser().parseFromString(str, 'text/html');
  return doc.body.textContent || "";
}

window.securityConfirmTextIDs = (stringInput, allowSpaces) => {
  let str = stringInput
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

export function disableButton(jQElement) {
  jQElement.addClass('disabled');
  jQElement.html(`<i style="font-size: 15px;" class='bx bx-time animated pulse faster infinite'></i>`);
}

export function enableButton(jQElement, newText) {
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

export function dmKEYify(a, b) {
  const array = [a, b];
  array.sort();
  return array[0] + array[1];
}

export function scrollBottomMessages(cID) {
  // Only scroll down if you're near the bottom.
  const obj = $(`#${cID}ChatMessages`).get(0)

  if (obj.scrollHeight - obj.offsetHeight - obj.scrollTop < 1000) {
    // Scroll is less than 1000px from the bottom.
    $(`#${cID}ChatMessages`).get(0).scrollTop = $(`#${cID}ChatMessages`).get(0).scrollHeight - $(`#${cID}ChatMessages`).get(0).clientHeight;
    // $(`#${cID}ChatMessages`).animate({
    //   scrollTop: $(`#${cID}ChatMessages`).get(0).scrollHeight - $(`#${cID}ChatMessages`).get(0).clientHeight
    // }, 250);
  }
}

export function scrollBottomMessagesDM(uID) {
  const obj = $(`#DMMessages${uID}`).get(0);

  if (obj.scrollHeight - obj.offsetHeight - obj.scrollTop < 1000) {
    // Scroll is less than 1000px from the bottom.
    $(`#DMMessages${uID}`).get(0).scrollTop = $(`#DMMessages${uID}`).get(0).scrollHeight - $(`#DMMessages${uID}`).get(0).clientHeight;
    // $(`#DMMessages${uID}`).animate({
    //   scrollTop: $(`#DMMessages${uID}`).get(0).scrollHeight - $(`#DMMessages${uID}`).get(0).clientHeight
    // }, 250);
  }
}

export function windowSelected() {
  // Window selected AND activity timer.
  return true;
  // To do
}

window.copyToClipboard = (textToCopy, skipNotify) => {
  navigator.clipboard.writeText(textToCopy).then(() => {
    if (!skipNotify) {
      snac('Copied', 'Text copied to clipboard successfully.', 'success');
    }
  })
  .catch(err => {
    window.prompt("Copy to clipboard:", textToCopy);
  })
}

window.onclick = function(event) {
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
}

window.openDropdown = (dropdownID) => {
  if ($(`#${dropdownID}`).hasClass('show')) {
    $(`#${dropdownID}`).removeClass('show');
    return;
  }

  $(`#${dropdownID}`).addClass('show');
}

function lyricsEventListeners() {
  if (cacheUser.lyrics && cacheUser.lyrics.lyrics) {
    $('#lyricsField').val(cacheUser.lyrics.lyrics);
  }

  if (cacheUser.lyrics && cacheUser.lyrics.author) {
    $(`#lyricsAuthorField`).val(cacheUser.lyrics.author)
  }

  $(`#updateLyricsConfirmButton`).get(0).onclick = () => updateLyrics();
}

function bioEventListeners() {
  if (cacheUser.bio) {
    $('#aboutMeBio').val(cacheUser.bio);
  }
  
  $(`#updateBiographyConfirmButton`).get(0).onclick = () => updateBiography();
}

document.onpaste = function (event) {
  const items = (event.clipboardData || event.originalEvent.clipboardData).items;

  for (const index in items) {
    const item = items[index];
    if (item.kind === 'file') {
      const blob = [item.getAsFile()];
      if (currentServer == 'friends' && currentChannel) {
        processDMAttachments(currentChannel, blob);
      }
      else if (currentServer && currentServerUser && currentChannel){
        processAttachment(`${currentServerUser}${currentServer}${currentChannel}`, blob);
      }
    }
  }
};

export function showUploadProgress() {
  $('#uploadProgressNumber').html('Upload Progress: 0%');
  $('#uploadProgress').removeClass('hidden');

  $('#uploadProgressContent').removeClass('fadeOutUp');
  $('#uploadProgressContent').addClass('fadeInDown');

  window.clearTimeout(uploadProgressTimeout);
}

export function hideUploadProgress() {
  $('#uploadProgressContent').removeClass('fadeInDown');
  $('#uploadProgressContent').addClass('fadeOutUp');

  uploadProgressTimeout = window.setTimeout(() => {
    $('#uploadProgress').addClass('hidden');
  }, 450);
}

export function showDroplet() {
  const leftPosition = event.clientX;
  const topPosition = event.clientY;

  const a = document.createElement('div');
  a.setAttribute('class', 'droplet animated fadeIn');
  a.setAttribute('style', `left: ${leftPosition}px; top: ${topPosition}px`);
  a.id = 'dropletTemporary';
  document.body.appendChild(a)

  window.setTimeout(() => {
    a.classList.add('dropletAnimation')
  }, 250);

  window.setTimeout(() => {
    $('#dropletTemporary').remove();
  }, 1750);
}

window.fullscreenImage = (imageID) => {
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
  }
  a.src = fullSource;
  a.setAttribute('class', 'fullscreenImageElement hidden');
  document.body.appendChild(a);

  $('#fullscreenImageElementWallpaper').removeClass('hidden');
  $('#fullscreenImageElementWallpaper').removeClass('fadeOut');
  $('#fullscreenImageElementWallpaper').addClass('fadeIn');

  $(`#fullscreenImageElement`).get(0).addEventListener('load', () => {
    $(`#fullscreenImageElement`).removeClass('hidden')
    window.setTimeout(() => {
      $(`#fullscreenImageElement`).addClass('fullscreenImageAnimation')
    }, 9);
  });

}

export function fadeOutFullscreenImage() {
  fullScreenActive = false;
  $('#fullscreenImageElementWallpaper').removeClass('fadeIn');
  $('#fullscreenImageElementWallpaper').addClass('fadeOut');

  $('#fullscreenImageElement').removeClass('fullscreenImageAnimation');

  window.setTimeout(() => {
    $(`#fullscreenImageElementWallpaper`).addClass('hidden');
    $(`#fullscreenImageElement`).remove();
  }, 299);

  // Select text field.
  if (currentServerUser) {
    $(`#${currentServerUser}${currentServer}${currentChannel}ChatMessageInput`).get(0).focus();
  }
  else {
    $(`#${currentChannel}ChatMessageInput`).get(0).focus();
  }
}

$('#DMEndCall').get(0).onclick = async () => { endAllCalls() }

export async function showDMCall(uID, username) {
  enableDMCallUI();
  $('#dmconnectedusername').html(`${username}`);

  $(`#voiceChatButtonVideoFriends`).get(0).onclick = () => {
    shareVideoDM(uID);
  }

  $(`#voiceChatButtonScreenFriends`).get(0).onclick = () => {
    shareScreenDM(uID);
  }

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

export function disableDMCallUI() {
  $("#friendsServer").removeClass('inCallServer');
  $(".friendCallView").addClass('fadeOutDown');
  $(".friendCallView").removeClass('fadeInUp');
  $(`#topFriendViewLeft`).removeClass("topFriendViewLeftInCall");

  window.setTimeout(() => {
    $(".friendCallView").addClass('hidden');
  }, 200)
}

// Music
export async function setNoTrackUI() {
  showPlaybackView()

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
  }, 999)

  // Animate track title & author
  $(`#currentTrackTitle`).html('Fetching..');
  $(`#currentTrackAuthor`).addClass('waiting');

  window.setTimeout(() => {
    const trackTitleWidth = $(`#currentTrackTitle`).width();
    const trackAuthorWidth = $(`#currentTrackAuthor`).width();
    let targetContainerWidth = trackTitleWidth;
    if (trackAuthorWidth > trackTitleWidth) {
      targetContainerWidth = trackAuthorWidth;
    }

    if (targetContainerWidth < 5) { // Error
      return;
    }
  
    $(`#currentTrackDetailsContainer`).css('width', `${targetContainerWidth}px`);
  }, 499);
}

export async function setTrackUI(trackDetails) {
  showPlaybackView();

  $(`#currentTrackLoading`).removeClass('zoomIn');
  $(`#currentTrackLoadingMini`).removeClass('zoomIn');
  $(`#currentTrackLoading`).addClass('zoomOut');
  $(`#currentTrackLoadingMini`).addClass('zoomOut');
  $(`#currentTrackAuthor`).removeClass('waiting');

  window.clearTimeout(noTrackTimeout)
  noTrackTimeout = window.setTimeout(() => {
    $(`#currentTrackLoading`).addClass('hidden');
    $(`#currentTrackLoadingMini`).addClass('hidden');

    $(`#currentTrackCover`).removeClass('zoomOut');
    $(`#currentTrackCoverMini`).removeClass('zoomOut');
    $(`#currentTrackCover`).addClass('zoomIn');
    $(`#currentTrackCoverMini`).addClass('zoomIn');

    $(`#currentTrackCover`).removeClass('hidden');
    $(`#currentTrackCoverMini`).removeClass('hidden');
  }, 500)

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
    (trackDetails.relationships.albums.data[0].id && openAlbum(trackDetails.relationships.albums.data[0].id));
  }


  window.setTimeout(() => {
    const trackTitleWidth = $(`#currentTrackTitle`).width();
    const trackAuthorWidth = $(`#currentTrackAuthor`).width();
    let targetContainerWidth = trackTitleWidth;
    if (trackAuthorWidth > trackTitleWidth) {
      targetContainerWidth = trackAuthorWidth;
    }

    if (targetContainerWidth < 5) { // Error
      return;
    }
  
    $(`#currentTrackDetailsContainer`).css('width', `${targetContainerWidth}px`);
  }, 499);
}

export function expandMusicPopout() {
  musicPoppedOut = true;
  $('#musicPopoutButton').addClass('musicPopoutExpanded')
  $(`#musicPopoutFront`).addClass('fadeOut');
  $(`#musicPopoutFront`).removeClass('fadeIn');
  window.setTimeout(() => {
    $(`#musicPopoutFront`).addClass('hidden');

    $('#musicPopoutHidden').removeClass('hidden');
    $('#musicPopoutHidden').removeClass('fadeOut');
    $('#musicPopoutHidden').addClass('fadeIn');
  }, 400);

}

export function collapseMusicPopout() {
  musicPoppedOut = false;
  $('#musicPopoutHidden').removeClass('fadeIn');
  $('#musicPopoutHidden').addClass('fadeOut');
  $(`#musicPopoutFront`).removeClass('fadeOut');
  $(`#musicPopoutFront`).addClass('fadeIn');

  window.setTimeout(() => {
    $('#musicPopoutButton').removeClass('musicPopoutExpanded')
    $('#musicPopoutHidden').addClass('hidden');
    $(`#musicPopoutFront`).removeClass('hidden');
  }, 400);
}

export function showPlaybackView() {
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
      height: calc(100% - 118px) !important; 
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
  `)

  if (currentServer !== 'music') {
    showPlaybackButton();  
  }
}

export function fileTypeMatches(matches) {
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

export function hidePlaybackView() {
  clearMusicStatus();
  window.playbackViewActive = false;

  hideQueueButton();

  $('#musicContent').removeClass('musicContentMusicShown');
  $('#musicPlayback').addClass('fadeOutDown');
  $('#musicPlayback').removeClass('fadeInUp');
  playbackViewTimeout = window.setTimeout(() => {
    $('#musicPlayback').addClass('hidden');
  }, 850)

  $('.friendViewLeft').css('height', '');

  $(`#musicViewInjection`).html(``);
  $(`#musicServer`).removeClass('inCallServer');

  $(`#libraryPlayer`).get(0).src = '';
  hidePlaybackButton();
}

export function showPlaybackButton() {
  if (!playbackViewActive) {
    return;
  }

  window.clearTimeout(clearHidePlayback);

  $(`#musicPopoutButton`).removeClass('hidden');
  $(`#musicPopoutButton`).removeClass('fadeOutDown');
  $(`#musicPopoutButton`).addClass('fadeInUp');
}

export function hidePlaybackButton() {
  collapseMusicPopout();

  $(`#musicPopoutButton`).addClass('fadeOutDown');
  $(`#musicPopoutButton`).removeClass('fadeInUp');
  clearHidePlayback = window.setTimeout(() => {
    $(`#musicPopoutButton`).addClass('hidden');
  }, 800);
}

// Voice chat

export function showServerCallUI(guildUID, guildID, channelID) {
  for (let i = 0; i < serverData[guildUID + guildID].channels.length; i++) {
    if (serverData[guildUID + guildID].channels[i].split('.').shift() == channelID)  {
      $(`#connectedName${guildUID}${guildID}`).html(`<span><i class="bx bxs-bolt lightningAnimation"></i><p>Connected</p></span><br><div id="${guildUID}${guildID}VCConnectedText">${serverData[guildUID + guildID].channels[i].split('.').pop()}</div>`);
      break;
    }
  }

  $(`#${guildUID}${guildID}Server`).addClass('inCallServer');
  $(`#VCsidebarLeft${guildUID}${guildID}`).removeClass('fadeOutDown');
  $(`#VCsidebarLeft${guildUID}${guildID}`).addClass('fadeInUp');
  $(`#VCsidebarLeft${guildUID}${guildID}`).removeClass('hidden');

  $(`#${guildUID}${guildID}EndCallButton`).get(0).onclick = () => {
    endAllCalls()
  }

  $(`#${guildUID}${guildID}${channelID}voiceChatButton`).get(0)._tippy.setContent(`Leave Voice`);

  $(`#sidebarLeft${guildUID}${guildID}`).addClass('sidebarLeftInCall');
}

export function hideServerCallUI(guildUID, guildID, channelID) {
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

window.returnProperURL = (uID) => {
  return new Promise((resolve, reject) => {
    var img = new Image();
    img.onload = () => {
      resolve(`https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/pfp%2F${uID}%2Fprofile.png?alt=media`);
    }; 
    img.onerror = () => {
      resolve(`https://avatars.dicebear.com/api/bottts/${uID}.svg`);
    };
    img.src = `https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/pfp%2F${uID}%2Fprofile.png?alt=media`;
    img = null;
  })
}

export function returnProperAttachmentURL(imageURL) {
  return new Promise((resolve, reject) => {

    if (imageURL.toLowerCase().endsWith('.mp4?alt=media') || imageURL.toLowerCase().endsWith('.mov?alt=media') || imageURL.toLowerCase().endsWith('.webm?alt=media')) {
      var video = document.createElement('video');

      video.onloadeddata = function() {
        resolve(imageURL);
        console.log('here')
      }

      video.onerror = function() {
        resolve(`https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/app%2FmissingFile.png?alt=media`);
      }

      console.log('here')

      video.src = imageURL;
      video = null;
    }
    else if (imageURL.toLowerCase().endsWith('.png?alt=media') || imageURL.toLowerCase().endsWith('.jpg?alt=media') || imageURL.toLowerCase().endsWith('.jpeg?alt=media')) {
      var img = new Image();
      const previewURL = imageURL.replace(/\.[^/.]+$/, '') + '.png?alt=media';
      img.onload = () => {
        resolve(previewURL);
      }; 
      img.onerror = () => {
        resolve(`https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/app%2FmissingFile.png?alt=media`);
      };
      img.src = previewURL;
      img = null;
    }
    else if (imageURL.toLowerCase().endsWith('.mp3?alt=media')) {
      resolve(imageURL);
    }
    else {
      var img = new Image();
      img.onload = () => {
        resolve(imageURL);
      }; 
      img.onerror = () => {
        resolve(`https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/app%2FmissingFile.png?alt=media`);
      };
      img.src = imageURL;
      img = null;
    }
  })
}

export function returnProperLinkThumbnail(link, index, messageID) {
  return new Promise((resolve, reject) => {
    $(`#${messageID}LinkNum${index}`).get(0).onerror = () => {
      $(`#${messageID}LinkNum${index}`).addClass('hidden');
    }
    $(`#${messageID}LinkNum${index}`).get(0).onload = () => {
      $(`#${messageID}LinkNum${index}`).removeClass('invisible');
    }
    $(`#${messageID}LinkNum${index}`).get(0).setAttribute('src', link.image);
    resolve(true);
  });
}

export function displayImageAnimation(imageID) {
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
    }
  }
}

export function displaySystemNotification(TITLE, BODY, HANDLER, UID, username) {
  playNotification();

  if (document.hasFocus()) {
    showInAppNotification(TITLE, BODY, UID, HANDLER); // In-app notification
  }
  else {
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

    if (retrieveSetting('desktopNotifications', true)) {
      sendToElectron('notification', {
        title: TITLE,
        body: BODY,
        hasReply: true,
        uid: UID,
        silent: true,
        username: username,
      });
    }
  }
}

function processCallColors() {
  const colors = colorThief.getColor($(`#incomingCallImage`).get(0));
  $(`#incomingCall`).get(0).setAttribute('style', `background-color: rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, 1)`);

  if ((colors[0]*0.299 + colors[1]*0.587 + colors[2]*0.114) > 186) {
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
  
    if ((colors[0]*0.299 + colors[1]*0.587 + colors[2]*0.114) > 186) {
      $(`.friendCallView`).get(0).style.color = '#000';
      $(`.friendCallView`).get(0).style.color = '#000';
    } else {
      $(`.friendCallView`).get(0).style.color = '#fff';
      $(`.friendCallView`).get(0).style.color = '#fff';
    }
  
    window.setTimeout(() => {
      $(`#DMConnectedImg`).removeClass('invisible');
      $(`#DMConnectedImg`).addClass('zoomIn');
    }, 800) 
  } catch (error) { }
}

export const createEmptyAudioTrack = () => {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const dst = oscillator.connect(ctx.createMediaStreamDestination());
  oscillator.start();
  const track = dst.stream.getAudioTracks()[0];
  return Object.assign(track, { enabled: false });
};

export const createEmptyVideoTrack = ({ width, height }) => {
  const canvas = Object.assign(document.createElement('canvas'), { width, height });
  canvas.getContext('2d').fillRect(0, 0, width, height);

  const stream = canvas.captureStream();
  const track = stream.getVideoTracks()[0];

  return Object.assign(track, { enabled: false });
};

export async function showInAppNotification(title, subtitle, profilePhoto, handler) {
  const a = document.createElement('div');
  const date = new Date().getTime();
  a.id = `${date}inAppNotification`;
  a.setAttribute('class', 'inAppNotification animated fadeInRight faster');
  a.onclick = (() => {
    handler && handler();
    $(`#${date}inAppNotification`).addClass('inAppNotificationGone');
  });
  a.innerHTML = `
    <img class="hidden" id="inApp${profilePhoto}${date}"></img>
    <b>${title}</b>
    <p>${subtitle}</p>  
  `
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

window.openGifPicker = async (ID) => {
  gifPickerOpen = ID;

  // All to have classes gifPicker
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
      $(`#${ID}gifsPickerGifsContainerTrending`).removeClass('hidden');

      // Populate trending gifs https://g.tenor.com/v1/categories
      const tenorKey = `LFKPD848ETKW`;
      const fetchResponse = await fetch(`https://g.tenor.com/v1/categories?key=${tenorKey}&contentfilter=low`);
      const response = await fetchResponse.json();

      console.log(response);

      response.tags.map((tag) => {
        const a = document.createElement('div');
        a.setAttribute('class', 'trendingGif gifPicker');
        a.innerHTML = `
          <img class="gifPicker" src="${tag.image}" />
          <b class="gifPicker">${tag.searchterm}</b>
        `
        a.onclick = () => {
          $(`#gifsPickerSearchBox${ID}`).val(tag.searchterm);
          $(`#gifsPickerSearchBox${ID}`).focus();
          searchGifs(ID, true);
        }
        $(`#${ID}gifsPickerGifsContainerTrending`).get(0).appendChild(a);
      });


      $(`#${ID}gifsPickerGifsContainerTrending`).addClass('animated fadeIn faster');
    }
  }
  else {
    closeGifPicker(ID);
  }
}

export async function searchGifs(ID, fast) {
  const searchTerm = $(`#gifsPickerSearchBox${ID}`).val();
  const searchTermLower = searchTerm.toLowerCase().trim();

  if (!searchTermLower) {
    $(`#${ID}gifsPickerGifsContainerSearch`).addClass('hidden');
    $(`#${ID}gifsPickerGifsContainerTrending`).removeClass('hidden');  
    return;
  }

  $(`#${ID}gifsPickerGifsContainerTrending`).addClass('hidden');
  $(`#${ID}gifsPickerGifsContainerSearch`).removeClass('hidden');

  // Rate limit
  window.clearTimeout(gifsPickerSearchTimeout);
  gifsPickerSearchTimeout = setTimeout(async () => {
    const tenorKey = `LFKPD848ETKW`;
    const fetchResponse = await fetch(`https://g.tenor.com/v1/search?key=${tenorKey}&q=${searchTermLower}&contentfilter=low&limit=30`);
    const response = await fetchResponse.json();
    
    const fetchResponse2 = await fetch(`https://g.tenor.com/v1/search_suggestions?key=${tenorKey}&q=${searchTermLower}&limit=6`);
    const autocompleteResult = await fetchResponse2.json();

    $(`#${ID}gifsPickerGifsContainerSearch`).empty();

    autocompleteResult.results.map((result, index) => {
      const a = document.createElement('div');
      a.setAttribute('class', 'gifSearch gifPicker');
      a.id = `gifSearch${index}`
      a.innerHTML = `<b class="gifPicker">${result}</b>`
      a.onclick = () => {
        $(`#gifsPickerSearchBox${ID}`).val(result);
        $(`#gifsPickerSearchBox${ID}`).focus();
        searchGifs(ID, true);
      }
      $(`#${ID}gifsPickerGifsContainerSearch`).get(0).appendChild(a);
    });

    response.results.map((result) => {
      const a = document.createElement('div');
      a.setAttribute('class', 'gif');
      a.id = `gifSearch${result.id}`;
      a.onclick = () => {
        closeGifPicker(ID);
        pendingGif = result.media[0].tinygif.url;

        if (currentServerUser && currentServer !== 'friends') {
          sendChannelChatMessage(currentServerUser, currentServer, currentChannel, true);
        }
        else {
          sendDMMessage(currentChannel, false, true)
        }

      }
      a.innerHTML = `
        <img id="gifSearchImage${result.id}" src="${result.media[0].tinygif.preview}" />
      `
      $(`#${ID}gifsPickerGifsContainerSearch`).get(0).appendChild(a);
      $(`#gifSearch${result.id}`).hover(() => {
        $(`#gifSearchImage${result.id}`).attr('src', result.media[0].tinygif.url)
      }, () => {
        $(`#gifSearchImage${result.id}`).attr('src', result.media[0].tinygif.preview)
      })
    });
  }, fast ? 9 : 499);
}

export function closeGifPicker(ID) {
  // Close it.
  gifPickerOpen = false;
  $(`#${ID}gifsPickerContainer`).removeClass('postStandardAnimationBottom');
  gifTimeout = window.setTimeout(() => {
    $(`#${ID}gifsPickerContainer`).addClass('hidden');
  }, 299);
}

window.openEmojiPicker = (ID) => {
  emojiPickerOpen = ID;
  
  if (!$(`#${ID}emojiPickerContainer`).children().length) {
    const picker = new Picker({
      locale: 'en'
    });
    $(`#${ID}emojiPickerContainer`).get(0).appendChild(picker);

    const observer = new MutationObserver((mutations) => {
      twemoji.parse(picker.shadowRoot, {
        className: 'twemoji',
        base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/'
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
    `
    picker.shadowRoot.appendChild(style);
    picker.addEventListener('emoji-click', event => {
      insertAtCursor($(`#${ID}ChatMessageInput`), event.detail.unicode);
      $(`#messageLabel${ID}`).addClass('active'); // On lounges.
      $(`#${ID}chatMessageLabel`).addClass('active'); // On DMs.
    });
  }

  if ($(`#${ID}emojiPickerContainer`).hasClass('hidden')) {
    $(`#${ID}emojiPickerContainer`).removeClass('hidden')
    clearInterval(emojiTimeout);
    window.setTimeout(() => {
      $(`#${ID}emojiPickerContainer`).addClass('postStandardAnimationBottom');
    }, 9);
  }
  else {
    closeEmojiPicker(ID);
  }
}

export function closeEmojiPicker(ID) {
  emojiPickerOpen = false;
  $(`#${ID}emojiPickerContainer`).removeClass('postStandardAnimationBottom');
  emojiTimeout = window.setTimeout(() => {
    $(`#${ID}emojiPickerContainer`).addClass('hidden');
  }, 299);
}

export function insertAtCursor(myField, txtToAdd) {
  myField[0].focus();
  const [start, end] = [$(myField)[0].selectionStart, $(myField)[0].selectionEnd];
  $(myField)[0].setRangeText(txtToAdd, start, end, 'select');
  window.setTimeout(() => {
    $(myField)[0].selectionStart = start + txtToAdd.length;
    $(myField)[0].selectionEnd = start + txtToAdd.length;
  }, 9);
}

export function isThisAFile(maybeFile) {
  return new Promise(function (resolve, reject) {
    if (maybeFile.type !== '') {
      return resolve(maybeFile)
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      if (reader.error && reader.error.name === 'NotFoundError') {
        return reject(reader.error.name)
      }
      resolve(maybeFile)
    }
  })
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
}

// !! ONCLICKS !!
export function addOnclickByID(ObjectID, directFunction) {
  $(`#${ObjectID}`).get(0).onclick = directFunction;
}

function loadOnclicks() {
  addOnclickByID('userPopoutsContainerBackground', () => {closeUserPopout()});
  addOnclickByID('fullscreenImageElementWallpaper', () => {fadeOutFullscreenImage()});
  addOnclickByID('musicPopoutFront', () => {expandMusicPopout()});
  addOnclickByID('playerBackwardButtonMini', () => {backwardSong(); document.activeElement.blur();});
  addOnclickByID('playerForwardButtonMini', () => {forwardSong(); document.activeElement.blur();});
  addOnclickByID('collapsePopout', () => {collapseMusicPopout()});
  addOnclickByID('modal-background', () => {closeModal()});
  
  addOnclickByID('newPlaylistCreateButton', () => {createPlaylist()});
  addOnclickByID('previewRequestButtonFriends', () => {prepareFriendRequest()});
  addOnclickByID('submitbtnprofile', () => {completeProfile()});
  addOnclickByID('verifyButton', () => {sendVerify()});
  addOnclickByID('replayIntro', () => {startTutorial()});
  addOnclickByID('welcomeGroup', () => {
    joinGroup();
    $(`#inviteCodeField`).val('inv:69MXwKvLvDQYc23kBTSYQ4nbsLz2.6XVwnyVgedl4owDYmfzR');
    $(`#inviteCodeField`).addClass('active');
    $(`#inviteCodeField`).get(0).focus();
    notifyTiny("Invitation code pasted.")
  });
  
  addOnclickByID('settingsTabButton_general', () => {expandTab('general')});
  addOnclickByID('settingsTabButton_account', () => {settingsTab('account')});
  addOnclickByID('settingsTabButton_appearance', () => {settingsTab('appearance')});
  addOnclickByID('settingsTabButton_notifications', () => {settingsTab('notifications')});
  addOnclickByID('settingsTabButton_feedback', () => {window.open(`https://github.com/parallelsocial/parallel/issues`)});
  addOnclickByID('settingsTabButton_getStarted', () => {settingsTab('getStarted')})
  addOnclickByID('settingsTabButton_storage', () => {settingsTab('storage')});
  addOnclickByID('settingsTabButton_advanced', () => {settingsTab('advanced')});
  addOnclickByID('settingsTabButton_sounds', () => {settingsTab('sounds')});
  addOnclickByID('settingsTabButton_playback', () => {expandTab('playback')});
  addOnclickByID('settingsTabButton_guide', () => {expandTab('guide')});
  addOnclickByID('settingsTabButton_updates', () => {window.open('https://github.com/parallelsocial/parallel/releases/latest')});
  addOnclickByID('settingsTabButton_support', () => {window.open('https://parallelsocial.notion.site/Contact-Support-c8fb2f9839474fd88874dbfb6c8eae97')});
  addOnclickByID('settingsTabButton_questions', () => {window.open('https://github.com/parallelsocial/parallel/discussions')});
  addOnclickByID('settingsTabButton_features', () => {window.open('https://github.com/parallelsocial/parallel/issues')});
  addOnclickByID('settingsTabButton_checkUpdates', () => {electron.ipcRenderer.send('functions', 'oneTimeCheckUpdate');});
  
  // todo: acceptable use policy
  addOnclickByID('linkToAcceptableUse', () => {window.open('https://parallelsocial.notion.site/Platform-Guidelines-5f1fc0d906ae4d58876b5ae5cfc73e3d')});
  
  addOnclickByID('settingsTabButton_playbackSettings', () => {settingsTab('playbackSettings')});
  addOnclickByID('settingsTabButton_playbackOutput', () => {settingsTab('playbackOutput')})
  addOnclickByID('settingsTabButton_transfer', () => {settingsTab('transfer')});
  
  addOnclickByID('linkSpotifyButton', () => {loginSpotify()});
  addOnclickByID('inputDevicesRefreshButton', () => {refreshInputDevices()});
  addOnclickByID('outputDevicesRefreshButton', () => {refreshOutputDevices()});
  
  addOnclickByID('changePFPButton', () => {changeProfilePhoto()});
  addOnclickByID('signOutButton', () => {signOutParallel()});
  addOnclickByID('newBioButton', () => {openModal('newBio')});
  addOnclickByID('newLyricsButton', () => {openModal('newLyrics')});
  addOnclickByID('removeLyricsButton', () => {removeLyrics()});
  addOnclickByID('removeBioButton', () => {removeBio()});
  addOnclickByID('openModalContactButton', () => {openModal('contact')});
  addOnclickByID('openModalCreditsButton', () => {openModal('credits')});
  
  addOnclickByID('setThemeLightButton', () => {setTheme('light')});
  addOnclickByID('setThemeAutoButton', () => {setTheme('auto')});
  addOnclickByID('setThemeDarkButton', () => {setTheme('dark')});
  addOnclickByID('newFriendButton', () => {openModal('newFriend')});
  addOnclickByID('friendSortButton', () => {toggleFriendsSort()});
  addOnclickByID('friendsTabFriendsButton', () => {friendsTab('friends', $(`#friendsTabFriendsButton`).get(0)) });
  addOnclickByID('friendsTabIncomingButton', () => {friendsTab('incoming', $(`#friendsTabIncomingButton`).get(0)) });
  addOnclickByID('friendsTabOutgoingButton', () => {friendsTab('outgoing', $(`#friendsTabOtherButton`).get(0)) });
  addOnclickByID('friendsTabBlockedButton', () => {friendsTab('blocked', $(`#friendsTabOtherButton`).get(0)) });
  addOnclickByID('noFriendsAddFriendButton', () => {openModal('newFriend')});
  addOnclickByID('noPlaylistsAddPlaylistButton', () => { openNewPlaylistDialog() });
  addOnclickByID('cancelFriendsSearchIcon', () => {cancelFriendsSearch()});
  addOnclickByID('musicTabButton_explore', () => {musicTab('explore')});
  addOnclickByID('musicTabButton_friends', () => {musicTab('friends')});
  addOnclickByID('musicTabButton_search', () => {musicTab('search')});
  addOnclickByID('musicTabButton_queue', () => {musicTab('queue')});
  addOnclickByID('newPlaylistButton', () => {openNewPlaylistDialog()});
  addOnclickByID('newPlaylistFolderButton', () => {openNewPlaylistFolderDialog()});
  addOnclickByID('musicTabButton_saved', () => {musicTab('saved')});
  addOnclickByID('musicSearchButton', () => {searchMusicButton()});
  addOnclickByID('refreshFriendsButton', () => {reloadSocialTab()});
  addOnclickByID('updateQueueText', () => {switchToHistory()});
  addOnclickByID('queueClearButton', () => {clearQueue()});
  addOnclickByID('historyClearButton', () => {clearHistory()});
  addOnclickByID('playerBackwardButton', () => {backwardSong(); document.activeElement.blur();});
  addOnclickByID('playerForwardButton', () => {forwardSong(); document.activeElement.blur();});
  
  addOnclickByID('checkoutOne', () => {goToCheckout("price_1KFmL0Ba3MWDKrNRw1Q45Hx4")});
  addOnclickByID('checkoutTwo', () => {goToCheckout("price_1KFmLWBa3MWDKrNRy95tTKwo")});
  addOnclickByID('checkoutThree', () => {goToCheckout("price_1KFmMWBa3MWDKrNRvyTENeRA")});
  addOnclickByID('manageSubscriptionButton', () => {manageSubscription()});
  
  addOnclickByID('changeEmailButton', () => {openEmailInput()});
  addOnclickByID('changePasswordButton', () => {changePassword()});
  addOnclickByID('bookmarksButton', () => { showBookmarks() });
  addOnclickByID('bookmarksBackground', () => {hideBookmarks()});
  addOnclickByID('bookmarksCloseButton', () => {hideBookmarks()});
  addOnclickByID('keycodesButton', () => {openModal('keyCodes')});
  addOnclickByID('removeLinkedTrackButton', () => {removeTrackFromProfile()});
  addOnclickByID('deleteAccountButton', () => {deleteAccount()});
  addOnclickByID('gettingStartedProfilePhoto', () => { settingsTab('account'); });
  addOnclickByID('gettingStartedSpotify', () => { settingsTab('transfer'); });
  addOnclickByID('gettingStartedAppearance', () => { settingsTab('appearance'); });
  addOnclickByID('gettingStartedInfinite', () => { openSpecialServer('infinite'); });
  addOnclickByID('gettingStartedAddFriends', () => { openSpecialServer('friends'); });
  addOnclickByID('gettingStartedGroup', () => { openSpecialServer('add'); });
  addOnclickByID('gettingStartedMusic', () => { openSpecialServer('music'); });
  addOnclickByID('gettingStartedSupport', () => { openModal('contact'); });
  addOnclickByID('questionMarkButton', () => { requestNewTrack() })
  addOnclickByID('createGroupButton', () => { createGroup() });
  addOnclickByID('openJoinGroupButton', () => { joinGroup() });
  addOnclickByID('createGroupFolderButton', () => { createGroupFolder() });
  addOnclickByID('updateServer', () => updateApp()) ;
  addOnclickByID('clearAllUploadsButton', () => prepareDestroyAllFiles() );
  addOnclickByID('musicInfoButton', () => { openModal('musicInfo') });
  addOnclickByID('accountManagementDropdownButton', () => {openDropdown('accountManagementDropdown') });
  addOnclickByID('quickSearchBackground', () => {showQuickSearch() });
}

export function showQuickSearch() {
  if ($('#quickSearch').hasClass('hidden')) {
    $('#quickSearchBackground').removeClass('hidden');
    $('#quickSearch').removeClass('hidden');
    $('#quickSearchInput').focus();
    $(`#quickSearchResults`).empty();

    // Gather list of directories.
    directories = [{ name: 'Friends', type: "server", id: "friends" }, { name: 'Music', type: "server", id: "music" }, { name: 'Infinite', type: "server", id: "infinite" }, { name: "Settings", type: "server", id: "account" }];

    for (let i = 0; i < cacheUser.guilds.length; i++) {
      const guildKeyOriginal = cacheUser.guilds[i];
      const guildKey = cacheUser.guilds[i].replace('.', '')
      directories.push({
        name: serverData[guildKey].name,
        type: "group",
        id: guildKeyOriginal
      });

      for (let i = 0; i < serverData[guildKey].channels.length; i++) {
        const channel = serverData[guildKey].channels[i];
        directories.push({
          name: channel.split('.')[1],
          type: "lounge",
          serverName: serverData[guildKey].name,
          server: guildKeyOriginal,
          id: channel
        });
      }
    }

    for (let i = 0; i < cacheUser.friends.length; i++) {
      directories.push({
        name: cacheUser.friends[i].n,
        id: cacheUser.friends[i].u,
        type: "friend"
      });
    }
    return;
  }
  $('#quickSearch').addClass('hidden');
  $('#quickSearchBackground').addClass('hidden');
  $('#quickSearchInput').val('');
  $(`#quickSearchResults`).empty();
}

function quickSearchKey(keyCode) {
  // Keep track of arrow up, down, and enter to navigate through the list.
  if (keyCode == 38) { // Up
    if (quickSearchIndex > 0) {
      quickSearchIndex--;

      // Highlight the current item.
      $('.quickSearchHighlighted').removeClass('quickSearchHighlighted');
      $(`#quickSearchResults`).children().eq(quickSearchIndex).addClass('quickSearchHighlighted');
      return;
    }
  } else if (keyCode == 40) { // Down
    if (quickSearchIndex < $(`#quickSearchResults`).children().length - 1) {
      quickSearchIndex++;

      // Highlight the current item.
      $('.quickSearchHighlighted').removeClass('quickSearchHighlighted');
      $(`#quickSearchResults`).children().eq(quickSearchIndex).addClass('quickSearchHighlighted');
      return;
    }
  } else if (keyCode == 13) { // Enter
    $('.quickSearchHighlighted').click();
    return;
  }

  // Get value and match against directories list. 
  const value = $('#quickSearchInput').val();
  $(`#quickSearchResults`).empty();

  if (!value.length) {
    return;
  }

  for (let i = 0; i < directories.length; i++) {
    const directory = directories[i];
    if (directory.name.toLowerCase().includes(value.toLowerCase())) {
      const a = document.createElement('div');
      a.className = 'quickSearchResult';
      
      switch (directory.type) {
        case "server":
          a.innerHTML = `
            <div class="quickSearchIcon">
              <i class="bx bx-planet"></i>
            </div>
            <div class="quickSearchText">
              ${directory.name}
            </div>
          `;
          a.onclick = () => {
            showQuickSearch();
            openSpecialServer(directory.id);
          }
          break;
        case "group":
          a.innerHTML = `
            <div class="quickSearchIcon">
              <i class="bx bx-group"></i>
            </div>
            <div class="quickSearchText">
              ${directory.name}
            </div>
          `;
          a.onclick = () => {
            showQuickSearch();
            openServer(directory.id.split('.')[0], directory.id.split('.')[1]);
          }
          break;
        case "lounge":
          a.innerHTML = `
            <div class="quickSearchIcon">
              <i class="bx bx-hash"></i>
            </div>
            <div class="quickSearchText">
              ${directory.name}
              <div class="quickSearchSubtext"> ${directory.serverName} </div>
            </div>
          `;
          a.onclick = () => {
            showQuickSearch();
            openServer(directory.server.split('.')[0], directory.server.split('.')[1]);
            if ($(`#${directory.server.split('.')[0]}${directory.server.split('.')[1]}${directory.id.split('.')[0]}guildChannelElement`).length) {
              $(`#${directory.server.split('.')[0]}${directory.server.split('.')[1]}${directory.id.split('.')[0]}guildChannelElement`).click();
            }
            else {
              window.toOpenChannelWhenReady = directory.id.split('.')[0];
            }
          }
          break;
        case "friend":
          a.innerHTML = `
            <div class="quickSearchIcon">
              <i class="bx bx-user"></i>
            </div>
            <div class="quickSearchText">
              ${directory.name.capitalize()}
            </div>
          `;
          a.onclick = () => {
            openSpecialServer('friends');
            showQuickSearch();
            openFriendsDM(directory.id, directory.name);
          }
          break;
        default:
          break;
      }

      $(`#quickSearchResults`).append(a);
    }
  }

  if ( $(`#quickSearchResults`).children().length > 0 ) {
    quickSearchIndex = 0;
    $('.quickSearchHighlighted').removeClass('quickSearchHighlighted');
    $(`#quickSearchResults`).children().eq(quickSearchIndex).addClass('quickSearchHighlighted');
  }
}

export function switchViewsToContent() {
  // Switches from list view to content view on groups, friends list, account settings.
  $(`#mobileViewInjection`).empty();

  $(`#mobileViewInjection`).html(`
    @media only screen and (max-width: 600px) {
      .friendViewLeft {
        display: none !important;
      } 

      .friendViewRight {
        width: 100%;
        display: block !important;
        margin-left: 0px;
        transition: all 0s !important;
      }

      #musicSidebar {
        display: none !important;
      }

      .musicContent, #accountContent {
        width: 100%;
        left: 0px;
        top: 0px;
        height: calc(100vh - 130px);
        padding: 16px;
        width: calc(100vw - 32px);
      }

      .musicView {
        left: 0px !important;
        top: 0px !important;
        padding: 0px;
        width: 100% !important;
        height: calc(100vh - 106px) !important;
      }

      .sidebarLeft {
        display: none !important;
      }

      .sidebarRight {
        right: 0px;
        padding: 0px;
        top: 0px;
        width: 100vw;
        height: calc(100vh - 100px);
      }

      .channelSecondaryGrid {
        top: 0px; right: 0px;
        width: 100px;
        height: calc(100vh - 160px);
      }
    }
  `);

}

export function switchViewsToList() {
  $(`#mobileViewInjection`).empty();
}
