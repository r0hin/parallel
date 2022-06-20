const functions = require('firebase-functions');
const admin = require("firebase-admin");

const enforceAppCheck = false;

exports.reportGroup = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }
  
  const db = admin.firestore();
  const userID = data.userID;
  const serverID = data.serverID;

  const serverDoc = await db.collection('users').doc(userID).collection('servers').doc(serverID).get();

  if (serverDoc.exists && context.auth.uid) {
    await db.collection('reports').doc('groups').set({
      [`${userID}.${serverDoc.data().name}.${serverDoc.data().id}`]: admin.firestore.FieldValue.arrayUnion(context.auth.uid)
    }, {merge: true});
    return {data: true}
  }
  else {
    return {data: false}
  }
});

exports.reportLounge = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }
  
  const db = admin.firestore();
  const userID = data.guildUID;
  const serverID = data.guildID;
  const channelID = data.channelID;
  const serverDoc = await db.collection('users').doc(userID).collection('servers').doc(serverID).get();

  channelName = false;
  for (let i = 0; i < serverDoc.data().channels.length; i++) {
    if (serverDoc.data().channels[i].split('.')[0] == channelID) {
      channelName = serverDoc.data().channels[i].split('.')[1];
    }
  }

  if (serverDoc.exists && context.auth.uid && channelName) {
    await db.collection('reports').doc('lounges').set({
      [`${userID}.${serverID}.${serverDoc.data().name}.${channelID}.${channelName}`]: admin.firestore.FieldValue.arrayUnion(context.auth.uid)
    }, {merge: true});
    return {data: true};
  }
  else {
    return {data: false};
  }
});

exports.reportUser = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }
  
  const db = admin.firestore();
  const userID = data.userID;
  const userDoc = await db.collection('users').doc(userID).get();

  if (userDoc.exists && context.auth.uid) {
    await db.collection('reports').doc('users').set({
      [`${userID}.${userDoc.data().username}`]: admin.firestore.FieldValue.arrayUnion(context.auth.uid)
    }, {merge: true});
    return {data: true}
  }
  else {
    return {data: false}
  }
});

exports.reportTrack = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }
  
  const db = admin.firestore();
  const trackID = data.trackID;

  if (context.auth.uid) {
    await db.collection('reports').doc('tracks').set({
      [`${trackID}`]: admin.firestore.FieldValue.arrayUnion(context.auth.uid)
    }, {merge: true});
    return {data: true}
  }
  else {
    return {data: false}
  }
});

exports.reportMissingTrack = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }
  
  const db = admin.firestore();
  const trackDetailsLine = data.trackDetailsLine;
  const trackNotify = data.notify;

  if (context.auth.uid) {
    await db.collection('reports').doc('missingTracks').set({
      [`${context.auth.uid}.${trackNotify}.${new Date().getTime()}`]: trackDetailsLine
    }, {merge: true});
    return {data: true}
  }
  else {
    return {data: false}
  }
});

exports.banUser = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }
  
  const uid = context.auth.uid;
  const userID = data.userID;
  const db = admin.firestore();

  const adminDoc = await db.collection('app').doc('onLoad').get();
  if (!adminDoc.data().adminUsers.includes(uid)) {
    return;
  } 

  // APproved
  await db.collection('users').doc(userID).update({
    banned: true
  });

  return true;

});

exports.unbanUser = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }
  
  const uid = context.auth.uid;
  const userID = data.userID;
  const db = admin.firestore();

  const adminDoc = await db.collection('app').doc('onLoad').get();
  if (!adminDoc.data().adminUsers.includes(uid)) {
    return;
  } 

  // APproved
  await db.collection('users').doc(userID).update({
    banned: false
  });

  return true;
});