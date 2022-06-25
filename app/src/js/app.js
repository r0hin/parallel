import { getAuth, deleteUser, updateEmail, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail, signOut, GoogleAuthProvider, linkWithRedirect, TwitterAuthProvider, unlink, reauthenticateWithCredential, EmailAuthProvider} from '@firebase/auth';
import { getFirestore, doc, getDoc, onSnapshot, updateDoc, setDoc, arrayUnion, arrayRemove } from '@firebase/firestore';
import { getStorage, ref, uploadBytesResumable, deleteObject} from '@firebase/storage';
import { getAnalytics } from "firebase/analytics";
import { getFunctions, httpsCallable } from '@firebase/functions';

import * as timeago from 'timeago.js';

import { openSpecialServer, loadMuted, loadServers, unreadIndicators, loadOutgoingServerRequests, updateServersOrder, leaveServer } from './servers';
import { loadFriends, processDMAttachments, unreadIndicatorsDM } from './friends';
import { listenCalls } from './voice';
import { loadPlaylists } from './library';
import { loadDefaultValues, settingsTab } from './settings';
import { bookmarksArrayDifference, closeModal, disableButton, displayImageAnimation, filesArrayDifference, fileTypeMatches, hideUploadProgress, messageHTMLtoText, openModal, returnProperURL, securityConfirmText, showUploadProgress, timer } from './display';
import { loadIdle, selfPresence } from './presence';
import { checkValidSubscription, loadSubscription } from './stripe';
import { loadRecentSearches, manageSpotify } from './music';
import { processAttachment } from './channels';
import { checkAppInitialized } from './firebaseChecks';
import { startElectronProcesses } from './electronApp';
import { startMainElectronProcesses } from './electron';

window.user;
window.gitHubVersion = '2.3.3';
window.disableCoreListeners = false;

$(`#topBar`).html(`<b>Parallel</b> <span>${gitHubVersion}</span>`);
$(`#settingsTabButton_updates`).html(`<b>What's New</b><p>v${gitHubVersion}</p>`);
$(`#whatsChangedVersion`).html(gitHubVersion);
$(`#supportButtonText`).html(`parallelsocial.net/support`)

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
window.storageClearAllTimeout = null;

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

  console.log(result);

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
      startSetup();
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


async function startSetup() {
  const css = `color: #F25E92; font-size: 18px;`
  const css2 = `color: #F25E92; font-size: 12px;`
  console.log("%ccode runs happy", css);
  console.log("%cParallel Dev Tools 🚀", css2);

  $('#newUser').addClass('hidden');
  $('#returningUser').removeClass('hidden');
  // Account setup.

  const userDoc = await getDoc(doc(db, `users/${user.uid}`))
  window.cacheUser = userDoc.data();

  if (!cacheUser.tutorialStarted) {
    startTutorial();
    await updateDoc(doc(db, `users/${user.uid}`), {tutorialStarted: true});
  }

  $(`#accountServer`).remove();
  const a = document.createElement('img');
  a.id = 'accountServer'; a.setAttribute('class', `pfp server voiceIndicator${user.uid} voiceIndicatorAll userContextItem`);
  a.setAttribute('userID', user.uid);
  a.setAttribute('userName', cacheUser.username);
  a.onclick = () => openSpecialServer('account');
  a.src = await returnProperURL(user.uid);
  document.getElementById('accountDetails').appendChild(a);
  displayImageAnimation(`accountServer`);

  window.setTimeout(async () => {
    // wait for image to fail or success...
    $('#profilephoto1').attr('src', await returnProperURL(user.uid));

    tippy('#accountServer', {
      content: 'Account / Settings',
    });

  }, 1299);

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
    loadFriends(); // Before cache for comparison. Includes presence.
    loadDetails();
    loadMuted();
    loadServers();
    loadOutgoingServerRequests();
    loadPlaylists();
    loadSubscription();
    loadBookmarks();
    loadBadges();
    loadIdle()
  });

  serversSortable();

  await unreadIndicators();
  await unreadIndicatorsDM();

  listenCalls();
  loadDefaultValues();

  checkConnections();
  selfPresence();

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

  startMainElectronProcesses();
  startElectronProcesses()
}

function loadDetails() {
  if (cacheUser.bio) {
    $(`#bio1`).html(securityConfirmText(cacheUser.bio).replaceAll(`&br`, `<br>`));
    twemoji.parse($(`#bio1`).get(0));
  }
  else {
    $(`#bio1`).html('No active status.');
  }

  if (cacheUser.lyrics && cacheUser.lyrics.lyrics) {
    $(`#lyrics1`).html(securityConfirmText(cacheUser.lyrics.lyrics).replaceAll(`&br`, `<br>`));
    twemoji.parse($(`#lyrics1`).get(0));
  }
  else {
    $(`#lyrics1`).html('No favorite lyrics.');
  }

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
      
      const matches = /\.([0-9a-z]+)(?:[\?#]|$)/i.exec(`https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/${file.filePath.replaceAll(`/`, '%2F')}?alt=media`);
      if (file.filePath.endsWith(`.png`) || file.filePath.endsWith(`.jpg`) || file.filePath.endsWith(`.jpeg`) || file.filePath.endsWith(`.gif`) ) {
        imgSnippet = `<img onclick="window.open('https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/${file.filePath.replaceAll(`/`, '%2F')}?alt=media')" id="${fileID}ImageElement" src="https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/${file.filePath.replaceAll(`/`, '%2F')}?alt=media" />`
      }
      else {
        const boxIcon = fileTypeMatches(matches);
        imgSnippet = `<div onclick="window.open('https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/${file.filePath.replaceAll(`/`, '%2F')}?alt=media')" id="${fileID}ImageElement" class="noImageSettings"><i class="bx ${boxIcon}"></i></div>`
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
        document.getElementById("accountServer").src = "https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/pfp%2F" + user.uid + "%2Fprofile." + ext + "?alt=media&" + new Date().getTime();
        document.getElementById("profilephoto1").src = "https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/pfp%2F" + user.uid + "%2Fprofile." + ext + "?alt=media&" + new Date().getTime();
      }, 800);
    
      if (ext == 'png') {
        await updateDoc(doc(db, `users/${user.uid}`), {
          url: "https://firebasestorage.googleapis.com/v0/b/parallel-by-wop.appspot.com/o/pfp%2F" + user.uid + "%2Fprofile." + ext + "?alt=media&" + new Date().getTime()
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

export async function ghChangelog() {
  const changelogDoc = await getDoc(doc(db, `app/changelog`));
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
  `

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
    if (lastVersionNumber < currentVersionNumber) {
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
    if (disableCoreListeners) {
      return;
    }
    if (!liveActionsExercised) {
      liveActionsExercised = true;
      // One time stuff.
      window.verifiedUsers = doc.data().verifiedUsers;
      window.adminUsers = doc.data().adminUsers;
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
  window.location.replace('https://forms.gle/u61JGAZMjDvB9w2K6')
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
        twemoji.parse($(`#${bookmark.id}bookmarkitem`).get(0));
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