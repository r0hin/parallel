const functions = require('firebase-functions');
const admin = require("firebase-admin");

const enforceAppCheck = false;

exports.addFriendRequest = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }

  const uid = context.auth.uid;
  const target = data.target;
  const db = admin.firestore();

  userDoc = await db.collection('users').doc(uid).get();

  targetDoc = await db.collection('users').doc(target).get();

  if (targetDoc.data().incomingFriendRequests.length > 150) {
    return {data: false}
  }
  
  if (targetDoc.data().blockedUsers && targetDoc.data().blockedUsers.some(e => e.u === uid)) {
    return {data: false}
  }

  // Approved

  await db.collection('users').doc(target).update({
    incomingFriendRequests: admin.firestore.FieldValue.arrayUnion({
      n: userDoc.data().username,
      u: uid
    })
  })

  await db.collection('users').doc(uid).update({
    outgoingFriendRequests: admin.firestore.FieldValue.arrayUnion({
      n: targetDoc.data().username,
      u: target
    })
  })

  return {data: true}
});

exports.removeFriend = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }

  const uid = context.auth.uid;
  const target = data.target;
  const db = admin.firestore();

  userDoc = await db.collection('users').doc(uid).get();
  targetDoc = await db.collection('users').doc(target).get();
  
  await db.collection('users').doc(target).update({
    friends: admin.firestore.FieldValue.arrayRemove({
      n: userDoc.data().username,
      u: uid,
    })
  })

  await db.collection('users').doc(uid).update({
    friends: admin.firestore.FieldValue.arrayRemove({
      n: targetDoc.data().username,
      u: target,
    })
  })

  return {data: true}

});

exports.cancelRequest = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }

  const uid = context.auth.uid;
  const target = data.target;
  const db = admin.firestore();

  userDoc = await db.collection('users').doc(uid).get();
  targetDoc = await db.collection('users').doc(target).get();

  await db.collection('users').doc(target).update({
    incomingFriendRequests: admin.firestore.FieldValue.arrayRemove({
      n: userDoc.data().username,
      u: uid,
    })
  })

  await db.collection('users').doc(uid).update({
    outgoingFriendRequests: admin.firestore.FieldValue.arrayRemove({
      n: targetDoc.data().username,
      u: target,
    })
  })

  return {data: true}
});

exports.acceptRequest = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }

  const uid = context.auth.uid;
  const target = data.target;
  const db = admin.firestore();

  userDoc = await db.collection('users').doc(uid).get();
  targetDoc = await db.collection('users').doc(target).get();


  // Check that the target actually sent the request in the first place.
  var verifiedSent = false;
  for (let i = 0; i < targetDoc.data().outgoingFriendRequests.length; i++) {
    if (targetDoc.data().outgoingFriendRequests[i].n === userDoc.data().username && targetDoc.data().outgoingFriendRequests[i].u === uid) {
      verifiedSent = true;
    }
  }; if (!verifiedSent) {
    return ({data: false})
  }

  // Remove pending related stuff from target doc.
  await db.collection('users').doc(target).update({
    outgoingFriendRequests: admin.firestore.FieldValue.arrayRemove({
      u: uid,
      n: userDoc.data().username
    }),
    incomingFriendRequests: admin.firestore.FieldValue.arrayRemove({
      u: uid,
      n: userDoc.data().username
    }),
    friends: admin.firestore.FieldValue.arrayUnion({
      u: uid,
      n: userDoc.data().username
    })
  })

  // Remove pending related stuff from own doc.
  await db.collection('users').doc(uid).update({
    outgoingFriendRequests: admin.firestore.FieldValue.arrayRemove({
      n: targetDoc.data().username,
      u: target,
    }),
    incomingFriendRequests: admin.firestore.FieldValue.arrayRemove({
      n: targetDoc.data().username,
      u: target,
    }),
    friends: admin.firestore.FieldValue.arrayUnion({
      n: targetDoc.data().username,
      u: target,
    })
  })

  return {data: true}
});

exports.rejectRequest = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }

  const uid = context.auth.uid;
  const target = data.target;
  const db = admin.firestore();

  userDoc = await db.collection('users').doc(uid).get();
  targetDoc = await db.collection('users').doc(target).get();
  // No need to check if it's sent.

  // Remove pending related stuff from target doc.
  await db.collection('users').doc(target).update({
    outgoingFriendRequests: admin.firestore.FieldValue.arrayRemove({
      n: userDoc.data().username,
      u: uid,
    }),
    incomingFriendRequests: admin.firestore.FieldValue.arrayRemove({
      n: userDoc.data().username,
      u: uid,
    }),
  })

  // Remove pending related stuff from own doc.
  await db.collection('users').doc(uid).update({
    outgoingFriendRequests: admin.firestore.FieldValue.arrayRemove({
      n: targetDoc.data().username,
      u: target,
    }),
    incomingFriendRequests: admin.firestore.FieldValue.arrayRemove({
      n: targetDoc.data().username,
      u: target,
    }),
  })

  return {data: true}
});