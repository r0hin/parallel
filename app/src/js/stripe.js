import { getFunctions, httpsCallable } from '@firebase/functions';

import * as timeago from 'timeago.js';
import JSConfetti from 'js-confetti'

import { openModal } from "./app";
import { checkAppInitialized } from './firebaseChecks';

window.currentSubscription = null;

window.jsConfetti = new JSConfetti()

checkAppInitialized();
const functions = getFunctions();

switch (new URL(window.location.href).searchParams.get('a')) {
  case 'stripeSuccess':
    window.history.replaceState("Parallel", "Parallel", "/app.html");
    showPremiumThanks();
    break;
  case 'stripeCancel':
    window.history.replaceState("Parallel", "Parallel", "/app.html");
    snac('Purchase Cancelled', '');
    break;
  default:
    break;
}

export function loadSubscription() {
  // Update options.
  $(`#infinitePerkName`).html(cacheUser.username);

  if (cacheUser.subscription) {

    if (cacheUser.subscription == 'infinite') {
      setUserPremium();
      return;
    }
    else if (checkValidSubscription(cacheUser.subscription)) {
      setUserPremium();
      return;
    }
    else {
      userNotPremium();
      return;
    }
  }
  else {
    userNotPremium();
    return;
  }
}

export function checkValidSubscription(date) {
  if (!date) {
    return false;
  }

  if (date == 'infinite') {
    return true;
  }

  if (date > new Date().getTime()) {
    return true;
  }

  return false;
}

window.goToCheckout = async(priceID) => {
  $(`.purchaseButton`).addClass('disabled');
  notifyTiny('Requesting checkout...');
  
  const startPayment = httpsCallable(functions, 'startPayment');
  const result = await startPayment({
    userID: user.uid || window.location.replace('https://parallel.glitch.me/'),
    userEmail : user.email || window.location.replace('https://parallel.glitch.me/'),
    priceID: priceID,
    successURL: `${window.location.href}?a=stripeSuccess`,
    cancelURL: `${window.location.href}?a=stripeCancel`,  
  });

  window.location.replace(result.data.data)
}

export async function manageSubscription() {
  notifyTiny('Requesting portal...');
  $(`#manageSubscriptionButton`).addClass('disabled');
  
  const customerPortal = httpsCallable(functions, 'customerPortal');
  const result = await customerPortal({
    successURL: `${window.location.href}`,
  });

  window.location.replace(result.data.data)
}

function setUserPremium() {
  $(`.freeTrialBadges`).removeClass("hidden");
  if (cacheUser.hadSubscription) {
    $(`.freeTrialBadges`).addClass("hidden");
  }

  const absoluteDate = cacheUser.subscription
  $(`#purchaseExpiry`).html(`${timeago.format(absoluteDate)} (${new Date(absoluteDate).toLocaleDateString()})`);

  if (cacheUser.subscription == 'infinite') {
    $(`#purchaseExpiry`).html(`never!`);
    $(`#manageSubscriptionButton`).addClass('disabled');
  }
  else {
    $(`#manageSubscriptionButton`).removeClass('disabled');
  }


  $(`#infiniteActive`).removeClass('hidden');
  $(`#infiniteNotActive`).addClass('hidden');

  $(`#username1`).html(`<span class="infiniteTextSpan">${cacheUser.username.capitalize()}</span>`)
}

function userNotPremium() {
  $(`#infiniteActive`).addClass('hidden');
  $(`#infiniteNotActive`).removeClass('hidden');

  $(`#username1`).html(cacheUser.username.capitalize());
}

export function showPremiumThanks() {
  openModal('thanksPremium');
  snac('Badge Added', 'An "infinite" badge has been added to your profile.', 'success', 6999);


  // A little too much confetti.

  jsConfetti.addConfetti({
    confettiColors: [
      '#F25E92', '#3267FF'
    ],
  });

  jsConfetti.addConfetti({
    emojis: ['🥳', '🎉'],
    emojiSize: 64,
    confettiNumber: 6,
  });

  window.setTimeout(() => {
    jsConfetti.addConfetti({
      confettiColors: [
        '#F25E92', '#3267FF'
      ],
    });
  
    jsConfetti.addConfetti({
      emojis: ['⚡'],
      emojiSize: 64,
      confettiNumber: 12,
    });

    window.setTimeout(() => {
      jsConfetti.addConfetti({
        emojis: ['💖', '😩'],
        emojiSize: 64,
        confettiNumber: 12,
      });
    }, 1500)
  }, 1500);
}