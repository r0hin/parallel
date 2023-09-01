const functions = require('firebase-functions');
const admin = require("firebase-admin");
const enforceAppCheck = false;

exports.createAccount = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }
  
  const uid = context.auth.uid;
  const username = data.username.toLowerCase();
  const db = admin.firestore();

  function hasWhiteSpace(s) {
    return /\s/g.test(s);
  }

  // Username verification
  if (hasWhiteSpace(username) || username == "") {
    return { data: false };
  }

  // Strip out the quotes/ html stuff.
  username.split(`'`).join('');
  username.split(`"`).join('');
  username.split('`').join('');
  username.split(' ').join('');
  username.split('<').join('');
  username.split(`>`).join('');
  username.split('(').join('');
  username.split(')').join('');
  username.split('{').join('');
  username.split('}').join('');
  username.split('[').join('');
  username.split(']').join('');
  username.split(`/`).join('');
  username.split(`///\\`).join('');


  if (username.length === 0 || username.length > 16) {
    return { data: false };
  }

  doc = await db.collection("store").doc(username.toLowerCase()).get();

  if (doc.exists) {
    return { data: false };
  }

  // Approved, create account.

  await db.collection("store").doc(username.toLowerCase()).set({
    map: uid,
  });

  await db.collection("Unread").doc(uid).set({
    data: {},
  });

  await db.collection("DMUnread").doc(uid).set({
    data: {},
  });

  await db.collection("users").doc(uid).set({
    username: username.toLowerCase(),
    badges: ["early"],
    badgesNotified: [],
    status: true,
    guilds: [],
    friends: [],
    incomingFriendRequests: [],
    outgoingFriendRequests: [],
    emailchange: admin.firestore.FieldValue.serverTimestamp(),
    passchange: admin.firestore.FieldValue.serverTimestamp(),
    created: admin.firestore.FieldValue.serverTimestamp(),
    playlists: [],
    blockedUsers: [],
    playlistFolders: {},
    playlistFoldersSort: [],
    uid: uid,
    url: "https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/pfp%2F" + uid + "%2Fprofile.png?alt=media"
  }, { merge: true });

  return { data: true };
});

exports.payments = functions.https.onRequest(async (req, res) => {
  const secret = require("../secret.json");
  const whsecret = require("../webhook.json");
  const stripeInstance = require('stripe')(secret.keyLive);
  const db = admin.firestore();

  const event = stripeInstance.webhooks.constructEvent(req.rawBody, req.headers['stripe-signature'], whsecret.keyLive);
  if (event.type == 'checkout.session.completed') {
    const session = event.data.object;

    const { line_items } = await stripeInstance.checkout.sessions.retrieve(session.id, {
      expand: ['line_items']
    })

    const price =  line_items.data[0].price.id
    let timeToAdd = 0;

    switch (price) {
      case "price_1KFmL0Ba3MWDKrNRw1Q45Hx4":
        timeToAdd = 1000 * 60 * 60 * 24 * 91.25;
        // 1000 ms * 60 seconds * 60 minutes * 24 hours * x days
        break;
      case "price_1KFmLWBa3MWDKrNRy95tTKwo":
        timeToAdd = 1000 * 60 * 60 * 24 * 182.5;
        // 1000 ms * 60 seconds * 60 minutes * 24 hours * x days
        break;
      case "price_1KFmMWBa3MWDKrNRvyTENeRA":
        timeToAdd = 1000 * 60 * 60 * 24 * 365;
        // 1000 ms * 60 seconds * 60 minutes * 24 hours * x days
        break;
      default:
        break;
    }

    // If have not a subscription, ADD 30 days
    const userDoc = await db.collection("users").doc(event.data.object.client_reference_id).get();
    if (!userDoc.hadSubscription) {
      onmonth = 1000 * 60 * 60 * 24 * 30;
      timeToAdd += onmonth;
      // 1000 ms * 60 seconds * 60 minutes * 24 hours * x days
    }

    await db.collection('users').doc(event.data.object.client_reference_id).update({
      customer: event.data.object.customer,
      subscription: new Date().getTime() + timeToAdd,
      hadSubscription: true
    });

    return res.status(200).send('Success');
  }
  else {
    return res.status(400).send('Error');
  }
});

exports.startPayment = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }

  const secret = require("../secret.json");
  const stripeInstance = require('stripe')(secret.keyLive);
  const db = admin.firestore();

  const priceID = data.priceID;
  const userID = data.userID;
  const userEmail = data.userEmail;

  const successURL = data.successURL;
  const cancelURL = data.cancelURL;

  // If should free trial
  const userDoc = await db.collection('users').doc(userID).get();
  const isTrial = !userDoc.data().hadSubscription ? true : false;
  const customerID = userDoc.data().customerID;

  let subData = {
    mode: 'payment',
    line_items: [{
      price: priceID,
      quantity: 1,
    }],
    success_url: successURL,
    cancel_url: cancelURL,
    client_reference_id: userID,
    customer_email: userEmail,
    allow_promotion_codes: true,
  }

  if (isTrial) {
    subData.subscription_data = {
      trial_period_days: 30
    }
  }

  if (customerID) {
    subData.customer = customerID;
  }

  const session = await stripeInstance.checkout.sessions.create(subData);

  return {
    data: session.url
  }
});

exports.customerPortal = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }

  const secret = require("../secret.json");
  const stripeInstance = require('stripe')(secret.keyLive);
  const db = admin.firestore();
  const userID = context.auth.uid;
  const successURL = data.successURL;

  // Get customer ID
  const userDoc = await db.collection('users').doc(userID).get();
  const customerID = userDoc.data().customer;

  const session = await stripeInstance.billingPortal.sessions.create({
    customer: customerID,
    return_url: successURL,
  });

  return {
    data: session.url
  }
});

exports.updateTrackURL = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }
  
  const db = admin.firestore();
  const userID = context.auth.uid;

  const targetTrackID = data.trackID;
  const newYouTubeID = data.linkURL;

  const appDoc = await db.collection('app').doc('onLoad').get();

  if (!appDoc.data().adminUsers.includes(userID)) {
    return {data: false};
  }

  if (newYouTubeID) {
    await db.collection('searchResults').doc(targetTrackID).set({
      videoID: `${newYouTubeID}`
    });
  }
  else {
    await db.collection('searchResults').doc(targetTrackID).delete();
  }

  await db.collection('music').doc(targetTrackID).delete();
  await db.collection('musicPremium').doc(targetTrackID).delete();

  return {data: true};
});

exports.getLinkPreview = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }

  const cheerio = require('cheerio');
  const getUrls = require('get-urls');
  const fetch = require('node-fetch');
  
  const urls = Array.from(getUrls(data.content));

  let arrayBack = [];

  arrayBack = arrayBack.slice(0, 3)

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const res = await fetch(url);

    if (!res.headers.get('content-type').includes('text/html')) {
      continue;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    arrayBack.push({
      url: url,
      title: $('title').first().text(),
      favicon: $('link[rel="shortcut icon"]').attr('href') || $('link[rel="alternate icon"]').attr('href'),
      description: $(`meta[name=description]`).attr( 'content' ),
      image: $(`meta[name=image]`).attr('content') || $(`meta[name=og:image]`).attr('content') || $(`meta[property=og:image]`).attr('content'),
      author: $(`meta[name=author]`).attr( 'content' ),
    });
  }

  return {data: arrayBack};
});

exports.searchParallelLibrary = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }

  const query = data.query;
  const db = admin.firestore();

  const snapshot = await db.collection('parallelTracks')
  .where('zkeywords', 'array-contains', query.toLowerCase())
  .orderBy('title', 'asc')
  .limit(3)
  .get();

  const snapshotArtists = await db.collection('parallelTracks')
  .where('zkeywordsArtist', 'array-contains', query.toLowerCase())
  .orderBy('title', 'asc')
  .limit(3)
  .get();

  const dataBack = snapshot.docs.map(doc => doc.data());
  const dataBackArtists = snapshotArtists.docs.map(doc => doc.data());

  return {data: [...dataBack, ...dataBackArtists]};
});

exports.getArtistProfilePhoto = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }

  const db = admin.firestore();
  const fetch = require('node-fetch')
  const artistID = data.artistID;

  const doc = await db.collection('artistImages').doc(artistID).get();
  if (doc.exists) {
    return {data: doc.data().imageURL};
  }
  else {
    const url = `https://music.apple.com/us/artist/${artistID}`;

    const res = await fetch(url);
    const html = await res.text();

    const ogImage = html.match(/<meta property=\"og:image\" content=\"(.*png)\"/)[1];
    const finalImage = ogImage.replace(/[\d]+x[\d]+/, '{w}x{h}');

    await db.collection('artistImages').doc(artistID).set({
      imageURL: finalImage
    });

    return {data: finalImage};
  }
});

exports.deleteUser = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }

  const uid = context.auth.uid;
  const db = admin.firestore();

  const doc = await db.collection('users').doc(uid).get();
  if (doc.data() && doc.data().playlists && doc.data().playlists.length) {
    for (let i = 0; i < doc.data().playlists.length; i++) {
      const playlistSplit = doc.data().playlists[i].split('.');
      let playlistUID = playlistSplit[0];
      let playlistID = playlistSplit[1];
      if (playlistSplit.length == 2) {
        playlistUID = uid;
        playlistID = playlistSplit[0];
      }
      if (playlistUID == uid) {
        await db.collection('users').doc(uid).collection('playlists').doc(playlistID).delete();
      }
    }
  }

  await db.collection('store').doc(doc.data().username).delete();

  await db.collection('users').doc(uid).collection("library").doc('albums').delete();
  await db.collection('users').doc(uid).collection("library").doc('artists').delete();
  await db.collection('users').doc(uid).collection("library").doc('tracks').delete();
  await db.collection('users').doc(uid).collection("sensitive").doc('bookmarks').delete();
  await db.collection('users').doc(uid).collection("sensitive").doc('storage').delete();
  await db.collection('users').doc(uid).delete();

  return {data: true};
});

exports.addReviewToPlaylist = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }

  const db = admin.firestore();
  const uid = context.auth.uid;
  const playlistUID = data.playlistUID;
  const playlistID = data.playlistID;
  const reviewText = data.reviewText;

  const doc = await db.collection('users').doc(playlistUID).collection('playlists').doc(playlistID).get();

  if (!doc.exists) {
    return {data: "This playlist does not exist."};
  }

  if (doc.data().reviews && doc.data().reviews == "none") {
    return {data: "This playlist does not allow reviews."};
  }

  if (doc.data().reviews && doc.data().reviews == "friends") {
    // Check if friends
    const userDoc = await db.collection('users').doc(playlistUID).get();
    let friends = false;
    for (let i = 0; i < userDoc.data().friends.length; i++) {
      const friend = userDoc.data().friends[i];
      if (friend["u"] == uid) {
        friends = true;
        break;
      }
    }
    if (!friends) {
      return {data: "You must be friends with the playlist owner to review it."};
    }
  }

  // Should be good to go
  // Sanitize review text
  const sanitizedReviewText = reviewText.replace(/<[^>]*>/g, '');
  const sanitizedReviewTextTrimmed = sanitizedReviewText.trim();
  if (sanitizedReviewTextTrimmed.length < 10) {
    return {data: "Review must be at least 10 characters."};
  }
  if (sanitizedReviewTextTrimmed.length > 3000) { 
    return {data: "Review must be less than 3000 characters."};
  }

  // Get user's username
  const userDoc = await db.collection('users').doc(uid).get();
  const username = userDoc.data().username;

  // Add review
  await db.collection('users').doc(playlistUID).collection('playlists').doc(playlistID).collection('views').doc('reviews').set({
    [uid]: {
      username: username,
      uid: uid,
      text: sanitizedReviewTextTrimmed,
      timestamp: new Date().getTime()
    }
  }, {merge: true});

  return {data: true};
});

exports.editReview = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }

  const db = admin.firestore();
  const uid = context.auth.uid;
  const playlistUID = data.playlistUID;
  const playlistID = data.playlistID;
  const reviewText = data.reviewText;

  const doc = await db.collection('users').doc(playlistUID).collection('playlists').doc(playlistID).get();

  if (!doc.exists) {
    return {data: "This playlist does not exist."};
  }

  // Check if user review already exists
  let exists = false;
  const reviewDoc = await db.collection('users').doc(playlistUID).collection('playlists').doc(playlistID).collection('views').doc('reviews').get();
  if (reviewDoc.exists) {
    if (reviewDoc.data()[uid] && Object.keys(reviewDoc.data()[uid]).length) {
      exists = true;
    }
  }

  if (!exists) {
    return {data: "You do not have a review for this playlist."};
  }

  // Sanitize review text
  const sanitizedReviewText = reviewText.replace(/<[^>]*>/g, '');
  const sanitizedReviewTextTrimmed = sanitizedReviewText.trim();
  if (sanitizedReviewTextTrimmed.length < 10) {
    return {data: "Review must be at least 10 characters."};
  }
  if (sanitizedReviewTextTrimmed.length > 3000) { 
    return {data: "Review must be less than 3000 characters."};
  }

  // Get user's username
  const userDoc = await db.collection('users').doc(uid).get();
  const username = userDoc.data().username;

  // Add review
  await db.collection('users').doc(playlistUID).collection('playlists').doc(playlistID).collection('views').doc('reviews').set({
    [uid]: {
      username: username,
      uid: uid,
      text: sanitizedReviewTextTrimmed,
      timestamp: new Date().getTime()
    }
  }, {merge: true});

  return {data: true};
});

exports.deleteReview = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }

  const db = admin.firestore();
  const uid = context.auth.uid;
  const playlistUID = data.playlistUID;
  const playlistID = data.playlistID;

  const doc = await db.collection('users').doc(playlistUID).collection('playlists').doc(playlistID).get();

  if (!doc.exists) {
    return {data: "This playlist does not exist."};
  }

  // Check if user review exists
  let exists = false;
  const reviewDoc = await db.collection('users').doc(playlistUID).collection('playlists').doc(playlistID).collection('views').doc('reviews').get();
  if (reviewDoc.exists) {
    if (Object.keys(reviewDoc.data()[uid]).length) {
      exists = true;
    }
  }

  if (!exists) {
    return {data: "You do not have a review for this playlist."};
  }

  // Delete review
  await db.collection('users').doc(playlistUID).collection('playlists').doc(playlistID).collection('views').doc('reviews').update({
    [uid]: admin.firestore.FieldValue.delete()
  });

  return {data: true};
});

exports.addReviewToAlbum = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }

  const db = admin.firestore();
  const uid = context.auth.uid;
  const albumID = data.albumID;
  const reviewText = data.reviewText;

  // Sanitize review text
  const sanitizedReviewText = reviewText.replace(/<[^>]*>/g, '');
  const sanitizedReviewTextTrimmed = sanitizedReviewText.trim();
  if (sanitizedReviewTextTrimmed.length < 10) {
    return {data: "Review must be at least 10 characters."};
  }
  if (sanitizedReviewTextTrimmed.length > 3000) { 
    return {data: "Review must be less than 3000 characters."};
  }

  // Get user's username
  const userDoc = await db.collection('users').doc(uid).get();
  const username = userDoc.data().username;

  // Add review
  await db.collection('reviews').doc(albumID).set({
    [uid]: {
      username: username,
      uid: uid,
      text: sanitizedReviewTextTrimmed,
      timestamp: new Date().getTime()
    }
  }, {merge: true});

  return {data: true};
});

exports.editAlbumReview = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }

  const db = admin.firestore();
  const uid = context.auth.uid;
  const albumID = data.albumID;
  const reviewText = data.reviewText;

  // Check if user review already exists
  let exists = false;
  const reviewDoc = await db.collection('reviews').doc(albumID).get();
  if (reviewDoc.exists) {
    if (reviewDoc.data()[uid] && Object.keys(reviewDoc.data()[uid]).length) {
      exists = true;
    }
  }

  if (!exists) {
    return {data: "You do not have a review for this album."};
  }

  // Sanitize review text
  const sanitizedReviewText = reviewText.replace(/<[^>]*>/g, '');
  const sanitizedReviewTextTrimmed = sanitizedReviewText.trim();
  if (sanitizedReviewTextTrimmed.length < 10) {
    return {data: "Review must be at least 10 characters."};
  }
  if (sanitizedReviewTextTrimmed.length > 3000) { 
    return {data: "Review must be less than 3000 characters."};
  }

  // Get user's username
  const userDoc = await db.collection('users').doc(uid).get();
  const username = userDoc.data().username;

  // Add review
  await db.collection('reviews').doc(albumID).set({
    [uid]: {
      username: username,
      uid: uid,
      text: sanitizedReviewTextTrimmed,
      timestamp: new Date().getTime()
    }
  }, {merge: true});

  return {data: true};
});

exports.deleteAlbumReview = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }

  const db = admin.firestore();
  const uid = context.auth.uid;
  const albumID = data.albumID;

  // Check if user review exists
  let exists = false;
  const reviewDoc = await db.collection('reviews').doc(albumID).get();
  if (reviewDoc.exists) {
    if (reviewDoc.data()[uid] && Object.keys(reviewDoc.data()[uid]).length) {
      exists = true;
    }
  }

  if (!exists) {
    return {data: "You do not have a review for this album."};
  }

  // Delete review
  await db.collection('reviews').doc(albumID).update({
    [uid]: admin.firestore.FieldValue.delete()
  });

  return {data: true};
});