import { hideBookmarks, showQuickSearch } from "./app";
import { prepareEditMessage } from "./channels";
import { closeEmojiPicker, closeGifPicker, closeModal, fadeOutFullscreenImage } from "./app";
import { resetZoom, zoomIn, zoomOut } from "./electron";
import { prepareDMEditMessage } from "./friends";

export function listenKeystrokes() {
  document.addEventListener('keydown', (e) => {
    let metaKeyPress = false;
    if (window.navigator.platform.toLowerCase().includes('win')) {
      e.ctrlKey && (metaKeyPress = true);
    }
    else {
      metaKeyPress = e.metaKey
    }
  
    if (metaKeyPress) {
      console.log(e.code)
      switch (e.code) {
        case "Equal":
          zoomIn();
          break;
        case "Minus":
          zoomOut();
          break;
        case "Digit0":
          resetZoom();
          break;
        case "KeyK":
          showQuickSearch();
          break;
        default:
          break;
      }
    }
    else {
      switch (e.code) {
        case 'Space':
          if (!document.activeElement.tagName.toLowerCase().includes('input') && !document.activeElement.classList.contains('playlistDescription') && !document.activeElement.classList.contains('contentEditableMessage') && !document.activeElement.tagName.toLowerCase().includes('textarea')) {
            if (musicPlaying.id && !activeListeningParty) {
              $(`#playerPauseButton`).get(0).click();
            }
            e.preventDefault();
          }
          break;
        case 'ArrowRight':
          if (!document.activeElement.tagName.toLowerCase().includes('input') && !document.activeElement.classList.contains('playlistDescription') && !document.activeElement.classList.contains('contentEditableMessage') && !document.activeElement.tagName.toLowerCase().includes('textarea')) {
            if (musicPlaying.id && !activeListeningParty) {
              libraryPlayer.forward(10);
            }
            e.preventDefault();
          }
          break;
        case 'ArrowLeft':
          if (!document.activeElement.tagName.toLowerCase().includes('input') && !document.activeElement.classList.contains('playlistDescription') && !document.activeElement.classList.contains('contentEditableMessage') && !document.activeElement.tagName.toLowerCase().includes('textarea')) {
            if (musicPlaying.id && !activeListeningParty) {
              libraryPlayer.rewind(10);
            }
            e.preventDefault();
          }
          break;
        case 'Enter': 
          if (!document.activeElement.tagName.toLowerCase().includes('textarea')) {
            e.preventDefault();
          }
          if (modalOpen) {
            primaryActionFunc();
            if (closeOnEnter) {
              closeModal();
            }
          }
          else if (activeUserCard) {
            closeUserPopout();
          }
          else if (bookmarksView) {
            hideBookmarks();
          }
          else if (channelPinnedOpen) {
            openChannelPinned(channelPinnedOpen);
          }
          else if (emojiPickerOpen) {
            closeEmojiPicker(emojiPickerOpen);
          }
          else if (gifPickerOpen) {
            closeGifPicker(gifPickerOpen);
          }
          else if (document.activeElement.classList.contains('playlistDescription')) {
            document.activeElement.blur();
          }
          break;
        case 'Escape':
          e.preventDefault();
          if (modalOpen) {
            closeModal();
          }
          else if (bookmarksView) {
            hideBookmarks();
          }
          else if (activeUserCard) {
            closeUserPopout();
          }
          else if (channelPinnedOpen) {
            openChannelPinned(channelPinnedOpen);
          }
          else if (emojiPickerOpen) {
            closeEmojiPicker(emojiPickerOpen);
          }
          else if (gifPickerOpen) {
            closeGifPicker(gifPickerOpen);
          }
          else if (fullScreenActive) {
            fadeOutFullscreenImage();
          }
          else if (document.activeElement.classList.contains('playlistDescription')) {
            document.activeElement.blur();
          }
          else if (!$('#quickSearch').hasClass('hidden')) {
            showQuickSearch();
          }
          break;
        case 'ArrowUp':
          if (currentServer == 'friends') {
            if (currentChannel) {
              prepareDMEditMessage(currentChannel, $(`#DMMessages${currentChannel}`).children('.selfChatMessage').last().children('.topLevelMessageContentTwo').last().children('.relative').last().children('.messageContentContentContainer').last().attr('messageID'));
            }
          }
          else if (currentChannel && currentServer !== 'music') {
            const scopedActiveChannel = `${currentServerUser}${currentServer}${currentChannel}`;
            prepareEditMessage(scopedActiveChannel, $(`#${scopedActiveChannel}ChatMessages`).children('.selfChatMessage').last().children('.topLevelMessageContentTwo').last().children('.relative').last().children('.messageContentContentContainer').last().attr('messageID'));
          }
          break;
        default:
          break;
      }
    }
  })
}