import { getFirestore, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from '@firebase/firestore';
import { createTrack } from './componentse';
import { closeModal, disableButton, openModal, securityConfirmText } from './app';
import { checkAppInitialized } from './firebaseChecks';
import { acceptRequest, openFriendsDM } from './friends';
import { musicTab } from './music';
import { showTippyListenerPresence, updatePresenceForUser } from './presence';
import { openSpecialServer } from './servers';
import { checkValidSubscription } from './stripe';

window.colorThief = new ColorThief();
window.activeUserCard = false;
window.cacheUserDetails = null;
window.fullProfileActive = false;
window.cancelUserQuery = null;

checkAppInitialized();
const db = getFirestore();

window.openUserCard = async (uID) => {
  if (!uID) {
    return;
  }
  if (activeUserCard == uID) {
    return;
  }
  activeUserCard = uID;

  // CREATE the element if it's not already created.
  if (!$(`#${uID}userCardContainer`).length) {
    // Element is not created.  
    const a = document.createElement('div')
    a.setAttribute('class', 'userCard hidden')
    a.id = `${uID}userCardContainer`
    a.innerHTML = `
      <div class="userCardBanner" id="${uID}userCardBanner">
        <button id="${uID}userCardButton" class="btn roundedButton" onclick="closeUserPopout()"><i class="bx bx-x"></i></button>
        <button id="${uID}DropdownButtonMoreOptions" userID="${uID}" class="btn userMoreOptionsProfileButton dropdownButton userContextItem acceptLeftClick"><i class="bx bx-dots-vertical"></i></button>
        <div id="${uID}userCardFriendSectionContainer" class="userCardFriendSection"><div id="${uID}userCardFriendSection"></div></div>
        <img id="${uID}userCardImage" class="animated invisible" src="${`https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/pfp%2F${uID}%2Fprofile.png?alt=media`}" />
        <h3 id="${uID}userCardName" class="animated fadeIn">Fetching...</h3>
        <div id="${uID}PresenceIndicatorUserCard" class="presenceIndicator ${uID}presence animated invisible"></div>
      </div>
      <div class="friendContent">
        <div class="staffContent hidden" id="${uID}StaffContent"></div>
        <div class="userCardTab animated fadeIn" id="${uID}profileUserCard">
          <div id="${uID}badgesSection" class="badgesSection">
            <div id="${uID}Badge_Verified" class="badge badgeVerified animated zoomIn hidden"><i class='bx bx-badge-check'></i></div>
            <div id="${uID}Badge_Staff" class="badge badgeStaff badgeStandard animated zoomIn hidden"><i class="bx bx-wrench"></i></div>
            <div id="${uID}Badge_Mod" class="badge badgeMod badgeStandard animated zoomIn hidden"><i class="bx bx-shield-quarter"></i></div>
            <div id="${uID}Badge_Bug" class="badge badgeBug badgeStandard animated zoomIn hidden"><i class="bx bxs-invader"></i></div>
            <div id="${uID}Badge_Early" class="badge badgeEarly badgeStandard animated zoomIn hidden"><i class="bx bx-leaf"></i></div>
            <div id="${uID}Badge_Infinite" class="badge badgeInfinite animated zoomIn hidden"><i class="bx bx-infinite"></i></div>
          </div>
          <div id="${uID}userProfileScrollable" class="userProfileScrollable">
            <hr id="${uID}userProfileDividerHR">
            <div id="${uID}BioHeader" class="userCardSectionTitle hidden">Bio</div>
            <div id="${uID}userCardBioContainer" class="userCardBio animated fadeIn hidden">
              <code id="${uID}userCardBio"></code>
            </div>
            <div id="${uID}LyricsHeader" class="userCardSectionTitle hidden">Favorite Lyrics</div>
            <div id="${uID}LyricsContainer" class="userCardLyrics">
              <code id="${uID}LyricsCodeField"></code>
            </div>
            <div id="${uID}TrackHeader" class="userCardSectionTitle hidden">Favorite Track</div>
            <div id="${uID}TrackContainer" class="userCardTrack"></div>
          </div>
        </div>

        <div class="userCardTab musicUserCard hidden animated fadeIn" id="${uID}musicUserCard">
          <center>
            <button class="btn b-1 openPlaylistsButton" id="${uID}openPlaylistsButton"></button>
          </center>
        </div>
      </div>
    `
    $('#userPopoutsContainer').get(0).appendChild(a);



    tippy($(`#${uID}Badge_Infinite`).get(0), {placement: 'top', content: 'Infinite'});
    tippy($(`#${uID}Badge_Early`).get(0), {placement: 'top', content: 'Early User'});
    tippy($(`#${uID}Badge_Mod`).get(0), {placement: 'top', content: 'Moderator'});
    tippy($(`#${uID}Badge_Bug`).get(0), {placement: 'top', content: 'Bug Hunter'});
    tippy($(`#${uID}Badge_Staff`).get(0), {placement: 'top', content: 'Staff'});
    tippy($(`#${uID}Badge_Verified`).get(0), {placement: 'top', content: 'Verified'});
    tippy($(`#${uID}userCardButton`).get(0), {placement: 'top', content: 'Close'});
    tippy($(`#${uID}profileUserCardButton`).get(0), {placement: 'top', content: 'Profile'});
    tippy($(`#${uID}musicUserCardButton`).get(0), {placement: 'top', content: 'Music'});
    tippy($(`#${uID}DropdownButtonMoreOptions`).get(0), {placement: 'top', content: 'More'});

    tippy($(`#${uID}PresenceIndicatorUserCard`).get(0), {
      content: '',
      placement: 'top',
      onTrigger: () => showTippyListenerPresence(uID, $(`#${uID}PresenceIndicatorUserCard`))
    }); // Prepare tooltip for 'online' | 'offline' | 'last online x days ago'

    updatePresenceForUser(uID);
  }
  else {
    switchUserCardTab(uID, 'profile', true);
  }

  // Show the element now that its guaranteed to be created AND filled with elements.
  $(`#${uID}userCardContainer`).removeClass('hidden');
  $(`#${uID}userCardContainer`).addClass('userCardActive');
  $(`#userPopoutsContainerBackground`).removeClass('fadeOut');
  $(`#userPopoutsContainerBackground`).addClass('fadeIn');
  $('#userPopoutsContainerBackground').removeClass('hidden');

  // Position the new or existing element of ID `${uID}userCardContainer`
  const popOutWidth = 240 + 24; // 24px padding on all edges.
  const popOutHeight = 360 + 24;
  const pageHeight = $(document).height();
  const pageWidth = $(document).width();
  let leftPosition = event.clientX;
  let topPosition = event.clientY;

  if (leftPosition + popOutWidth > pageWidth) {
    // If the popout width will be greater than page, align it to the left of page end.
    leftPosition = pageWidth - popOutWidth - 128;
  }
  if (topPosition + popOutHeight > pageHeight) {
    // If the popout height will be greater than page, align it to the top of page end.
    topPosition = pageHeight - popOutHeight - 12;
  }

  $(`#${uID}userCardContainer`).get(0).style.left = leftPosition + 'px';
  $(`#${uID}userCardContainer`).get(0).style.top = topPosition + 'px';
  $(`#${uID}userCardContainer`).get(0).setAttribute('defaultTop', topPosition);

  $(`#${uID}userCardImage`).get(0).setAttribute('crossOrigin', '');
  $(`#${uID}userCardImage`).get(0).onerror = () => {
    $(`#${uID}userCardImage`).get(0).src = `https://avatars.dicebear.com/api/bottts/${uID}.svg`;
  }
  $(`#${uID}userCardImage`).get(0).addEventListener('load', () => processColors(uID));

  $(`#${uID}openPlaylistsButton`).get(0).onclick = () => {
    closeUserPopout();
    closeModal();
    openSpecialServer('music');
    musicTab('friends');
  }

  try {
    cancelUserQuery();
  } catch (error) { }

  $(`#${uID}userProfileScrollable`).css('maxHeight', '145px');

  cancelUserQuery = onSnapshot(doc(db, `users/${uID}`), async (querySnapshot) => {
    if (!querySnapshot.exists()) {
      $(`#${uID}userCardName`).html(`<div class="pill danger">Deleted Account</div>`);
      $(`#${uID}friendLowerSection`).addClass('hidden');
      return;
    }

    cacheUserDetails = querySnapshot.data();

    $(`#${uID}StaffContent`).addClass('hidden');
    if (querySnapshot.data().staff) {
      $(`#${uID}StaffContent`).removeClass('hidden');
      $(`#${uID}StaffContent`).html(querySnapshot.data().staff);
    }

    $(`#${uID}userCardName`).html(querySnapshot.data().username.capitalize());
    $(`#${uID}DropdownButtonMoreOptions`).get(0).setAttribute('userName', querySnapshot.data().username.capitalize());
    if (querySnapshot.data().banned) {
      $(`#${uID}userCardName`).html(querySnapshot.data().username.capitalize() + `<div class="pill danger">Banned</div>`);
    }
    if (querySnapshot.data().bio) {
      $(`#${uID}userCardBio`).html(securityConfirmText(querySnapshot.data().bio).replaceAll(`&br`, `<br>`));
      twemoji.parse($(`#${uID}userCardBio`).get(0), { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });
      $(`#${uID}userCardBioContainer`).removeClass('hidden');
      $(`#${uID}BioHeader`).removeClass('hidden');
    }
    else {
      $(`#${uID}userCardBioContainer`).addClass('hidden');
      $(`#${uID}BioHeader`).addClass('hidden');
    }

    $(`#${uID}openPlaylistsButton`).html(`View Playlists (${querySnapshot.data().playlists.length || 0})`);

    $(`#${uID}openPlaylistsButton`).addClass('hidden');

    $(`#${uID}Badge_Infinite`).addClass('hidden');
    if (checkValidSubscription(querySnapshot.data().subscription)) {
      $(`#${uID}userCardName`).html(`<span class="infiniteTextSpanUser">${querySnapshot.data().username.capitalize()}</span>`);
      $(`#${uID}Badge_Infinite`).removeClass('hidden');
      $(`#${uID}userCardBanner`).addClass('infiniteBanner');
    }
    else {
      $(`#${uID}userCardBanner`).removeClass('c');
    }

    $(`.badgeStandard`).addClass('hidden');
    if (querySnapshot.data().badges && querySnapshot.data().badges.length) {
      $(`#${uID}badgesSection`).removeClass('hidden');
      for (let i = 0; i < querySnapshot.data().badges.length; i++) {
        const badge = querySnapshot.data().badges[i];
        $(`#${uID}Badge_${badge.capitalize()}`).removeClass('hidden');
      }
    }
    else {
      $(`#${uID}badgesSection`).addClass('hidden');
    }

    $(`#${uID}userCardName`).addClass('fadeIn');

    if (uID === user.uid) {
      $(`#${uID}userCardFriendSection`).html(``);
    }
    else {
      if (querySnapshot.data().friends.some(e => e.u === user.uid)) {
        $(`#${uID}userCardFriendSection`).html(`
          <button id="${uID}FriendCardButton" onclick="switchAndOpenFriendsDM('${uID}', '${querySnapshot.data().username}')" class="btn b-1"><i class='bx bx-message-square-dots'></i></button>
        `);

        tippy($(`#${uID}FriendCardButton`).get(0), {
          content: "Message",
          placement: "top",
        });

        if (querySnapshot.data().playlists.length) { // Show only if friends & has playlists.
          $(`#${uID}openPlaylistsButton`).removeClass('hidden');
        }
      }
      else {
        if (cacheUser.incomingFriendRequests.some(e => e.u === uID)) {
          $(`#${uID}userCardFriendSection`).html(`
            <button class="btn b-2" id="${uID}FriendCardButton"><i class='bx bx-check'></i></button>
          `)
          tippy($(`#${uID}FriendCardButton`).get(0), {
            content: "Accept Request",
            placement: "top",
          })
          $(`#${uID}FriendCardButton`).get(0).onclick = () => {
            acceptRequest(uID, querySnapshot.data().username); 
            disableButton($(`#${uID}FriendCardButton`));
          }
        }
        else {
          if (querySnapshot.data().incomingFriendRequests.some(e => e.u === user.uid)) {
            $(`#${uID}userCardFriendSection`).html(`
              <button class="btn b-2" id="${uID}FriendCardButton"><i class='bx bx-x'></i></button>
            `)
            tippy($(`#${uID}FriendCardButton`).get(0), {
              content: "Cancel Request",
              placement: "top",
            })
            $(`#${uID}FriendCardButton`).get(0).onclick = () => {
              cancelRequest(uID, querySnapshot.data().username); 
              disableButton($(`#${uID}FriendCardButton`));
            }
          }
          else {
            $(`#${uID}userCardFriendSection`).html(`
              <button id="${uID}FriendCardButton" class="btn b-1"><i class='bx bx-user-plus'></i></button>
            `)
            tippy($(`#${uID}FriendCardButton`).get(0), {
              content: "Add Friend",
              placement: "top",
            })
            $(`#${uID}FriendCardButton`).get(0).onclick = () => {
              confirmFriendRequest(uID);
              disableButton($(`#${uID}FriendCardButton`));
            }
          }
        }
      }
    }

    // Music related items.
    $(`#${uID}LyricsHeader`).addClass('hidden');
    $(`#${uID}LyricsContainer`).addClass('hidden');
    $(`#${uID}TrackHeader`).addClass('hidden');
    $(`#${uID}TrackContainer`).addClass('hidden');

    if (!querySnapshot.data().track && !querySnapshot.data().lyrics) { }
    else {
      if (querySnapshot.data().lyrics) {
        $(`#${uID}LyricsHeader`).removeClass('hidden');
        $(`#${uID}LyricsContainer`).removeClass('hidden');

        $(`#${uID}LyricsCodeField`).html(`
          ${securityConfirmText(querySnapshot.data().lyrics.lyrics).replaceAll(`&br`, `<br>`)}
          ${querySnapshot.data().lyrics.author ? `<div class="userCardLyricsAuthorField">- ${securityConfirmText(querySnapshot.data().lyrics.author).replaceAll(`&br`, '<br>')}</div>` : ``}
        `);
      }

      if (querySnapshot.data().track) {
        $(`#${uID}TrackHeader`).removeClass('hidden');
        $(`#${uID}TrackContainer`).removeClass('hidden');
        $(`#${uID}TrackContainer`).empty();
        
        const trackData = await makeMusicRequest(`songs/${querySnapshot.data().track}`);
        createTrack(trackData.data[0], `${uID}TrackContainer`, null);
      }
    }
    const profileURL = `https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/pfp%2F${uID}%2Fprofile.png?alt=media&ts=${new Date().getTime()}`;
    $(`#${uID}userCardImage`).get(0).src = profileURL;

    $(`#${uID}userProfileDividerHR`).removeClass('hidden');
    if (querySnapshot.data().staff) {
      $(`#${uID}userProfileScrollable`).css('maxHeight', '145px');
    }
    else if (querySnapshot.data().badges && querySnapshot.data().badges.length) {
      $(`#${uID}userProfileScrollable`).css('maxHeight', '176px');
    }
    else {
      $(`#${uID}userProfileScrollable`).css('maxHeight', '228px');
      $(`#${uID}userProfileDividerHR`).addClass('hidden');
    }

    // If nothing below the line either
    if (!querySnapshot.data().bio && !querySnapshot.data().track && !querySnapshot.data().lyrics) {
      $(`#${uID}userProfileDividerHR`).addClass('hidden');
    }

    // If nothing
    $(`#${uID}userCardContainer`).css('backgroundColor', 'var(--bg1)');
    if (!querySnapshot.data().bio && !querySnapshot.data().track && !querySnapshot.data().lyrics && (!querySnapshot.data().badges || !querySnapshot.data().badges.length) && !querySnapshot.data().staff) {
      $(`#${uID}userCardContainer`).css('backgroundColor', 'var(--primary)');
    }


  });
}

window.switchUserCardTab = (uID, tab, force) => {
  if (tab === 'music') {
    $(`#${uID}userCardContainer`).addClass('userCardMusic');
    const existingTop = $(`#${uID}userCardContainer`).get(0).style.top;
    const targetTop = parseInt(existingTop) - 200;
    $(`#${uID}userCardContainer`).get(0).style.top = `${targetTop > 24 ? targetTop : 24}px`;
  }
  else {
    $(`#${uID}userCardContainer`).removeClass('userCardMusic');
    $(`#${uID}userCardContainer`).get(0).style.top = `${parseInt($(`#${uID}userCardContainer`).get(0).getAttribute('defaultTop'))}px`;
  }

  $(`.userCardTabButton`).addClass('disabled');

  $(`.userCardTab`).removeClass('fadeIn');
  $(`.userCardTab`).addClass('fadeOut');
  window.setTimeout(() => {
    $(`.userCardTabButton`).removeClass('disabled');
    $(`.userCardTab`).addClass('hidden');
    $(`#${uID}${tab}UserCard`).removeClass('hidden');
    $(`#${uID}${tab}UserCard`).removeClass('fadeOut');
    $(`#${uID}${tab}UserCard`).addClass('fadeIn');
    $(`.userCardTabButton`).removeClass('buttonActive');
    $(`#${uID}${tab}UserCardButton`).addClass('buttonActive');
  }, force ? 0 : 499);
};

window.closeUserPopout = (keepListener) => {
  if (!activeUserCard) {
    return;
  }

  $(`#${activeUserCard}userCardContainer`).removeClass('userCardActive');
  $(`#userPopoutsContainerBackground`).removeClass('fadeIn');
  $(`#userPopoutsContainerBackground`).addClass('fadeOut');
  
  window.setTimeout(() => {
    $(`#${activeUserCard}userCardContainer`).addClass('userCardAnimationClose');
  }, 20);
  
  window.setTimeout(() => {
    $(`#userPopoutsContainerBackground`).addClass('hidden');
    $(`#${activeUserCard}userCardContainer`).addClass('hidden');
    $(`#${activeUserCard}userCardContainer`).removeClass('userCardAnimationClose');
    activeUserCard = false;
  }, 320);

  if (!keepListener) {
    try { cancelUserQuery() } catch (error) {};
  }
}

export function blockUser(uID, username) {
  openModal('blockUser');
  $(`#blockConfirm`).get(0).onclick = async () => {
    closeModal();

    if (!uID || !username) {snac('Error', 'Contact support or try again.', 'danger');}
    
    if (cacheUser.friends.some(e => e.u === uID)) {
      await removeFriend(uID, true);
    }

    if (cacheUser.outgoingFriendRequests.some(e => e.u === uID)) {
      await cancelRequest(uID, username)
    }
    
    await updateDoc(doc(db, `users/${user.uid}`), {
      blockedUsers: arrayUnion({
        u: uID,
        n: username
      })
    });

    snac('Blocked User', '', 'success');
  }
}

export function unblockUser(uID, username) {
  openModal('unblockUser');
  $(`#unblockConfirm`).get(0).onclick = async () => {
    closeModal();

    if (!uID || !username) {snac('Error', 'Contact support or try again.', 'danger');}
    
    await updateDoc(doc(db, `users/${user.uid}`), {
      blockedUsers: arrayRemove({
        u: uID,
        n: username
      })
    });

    snac('Unblocked User', '', 'success');
  }
}

function processColors(uID) {
  $(`#${uID}userCardImage`).removeClass('invisible');
  $(`#${uID}userCardImage`).addClass('zoomIn');
  $(`#${uID}PresenceIndicatorUserCard`).removeClass('invisible')
  $(`#${uID}PresenceIndicatorUserCard`).addClass('fadeIn')

  const colors = colorThief.getColor($(`#${uID}userCardImage`).get(0));
  $(`#${uID}userCardBanner`).get(0).setAttribute('style', `background-color: rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, 1)`);

  if ((colors[0]*0.299 + colors[1]*0.587 + colors[2]*0.114) > 186) {
    $(`#${uID}userCardName`).get(0).style.color = '#000';
  } else {
    $(`#${uID}userCardName`).get(0).style.color = '#fff';
  }
}

window.switchAndOpenFriendsDM = (userID, username) => {
  if (activeUserCard) {
    closeUserPopout();
  }

  if ($(`#${userID}FriendItem`).length) {
    openSpecialServer('friends');
    openFriendsDM(userID, username);
    return;
  }

  snac('Contact Error', 'Become friends with this person to message them.');
}