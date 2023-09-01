const functions = require('firebase-functions');
const admin = require("firebase-admin");

const enforceAppCheck = false;

exports.joinGuild = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }

  const uid = context.auth.uid;
  const inviteUser = data.inviteUser;
  const inviteGuild = data.inviteGuild;
  const db = admin.firestore();

  userDoc = await db.collection('users').doc(uid).get();

  doc = await db.collection('users').doc(inviteUser).collection('servers').doc(inviteGuild).get()

  if (doc.exists && doc.data().members.length >! 3500 && !doc.data().private) {
    // Approved

    await db.collection('users').doc(inviteUser).collection('servers').doc(inviteGuild).update({
      members: admin.firestore.FieldValue.arrayUnion(`${userDoc.data().username}.${uid}`)
    })
    
    await db.collection('users').doc(uid).update({
      guilds: admin.firestore.FieldValue.arrayUnion(`${inviteUser}.${inviteGuild}`)
    })

    return {data: true};
  }

  else {
    return {data: false};
  }

});

exports.leaveGuild = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }
  
  const uid = context.auth.uid;
  const targetUID = data.targetUID;
  const targetID = data.targetID;
  const db = admin.firestore();

  userDoc = await db.collection('users').doc(uid).get();

  await db.collection('users').doc(uid).update({
    guilds: admin.firestore.FieldValue.arrayRemove(`${targetUID}.${targetID}`)
  });
  
  await db.collection('users').doc(targetUID).collection('servers').doc(targetID).update({
    members: admin.firestore.FieldValue.arrayRemove(`${userDoc.data().username}.${uid}`),
    staff: admin.firestore.FieldValue.arrayRemove(`${uid}`)
  });
  
  
  return {data: true}
});

exports.requestJoinGuild = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }
  
  const uid = context.auth.uid;
  const targetUID = data.targetUID;
  const targetGuild = data.targetGuild;
  const db = admin.firestore();

  userDoc = await db.collection('users').doc(uid).get();
  guildDoc = await db.collection('users').doc(targetUID).collection('servers').doc(targetGuild).get()

  await db.collection('users').doc(targetUID).collection('servers').doc(targetGuild).update({
    incomingRequests: admin.firestore.FieldValue.arrayUnion({
      n: userDoc.data().username,
      u: uid,
    })
  })

  await db.collection('users').doc(uid).update({
    outgoingGuilds: admin.firestore.FieldValue.arrayUnion({
      n: guildDoc.data().name,
      targetUID: targetUID,
      targetID: targetGuild,
      u: `https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/groups%2F${targetUID}%2F${targetGuild}%2Ficon.png?alt=media`
    })
  })

  return {data: true}
});

exports.cancelRequestJoinGuild = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }
  
  const uid = context.auth.uid;
  const targetUID = data.targetUID;
  const targetGuild = data.targetGuild;
  const targetName = data.targetName; // Use client's copy incase it changed.
  const db = admin.firestore();

  userDoc = await db.collection('users').doc(uid).get();

  await db.collection('users').doc(targetUID).collection('servers').doc(targetGuild).update({
    incomingRequests: admin.firestore.FieldValue.arrayRemove({
      n: userDoc.data().username,
      u: uid,
    })
  })

  await db.collection('users').doc(uid).update({
    outgoingGuilds: admin.firestore.FieldValue.arrayRemove({
      n: targetName,
      targetUID: targetUID,
      targetID: targetGuild,
      u: `https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/groups%2F${targetUID}%2F${targetGuild}%2Ficon.png?alt=media`
    })
  })

  return {data: true}
});

exports.acceptGuildRequest = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }
  
  const uid = context.auth.uid;
  const guildUID = data.guildUID;
  const guildID = data.guildID;
  const userID = data.userID;
  const username = data.username
  const db = admin.firestore();

  const guildDoc = await db.collection('users').doc(guildUID).collection('servers').doc(guildID).get();
  if (guildDoc.data().owner !== uid && !guildDoc.data().staff.includes(uid)) {
    return {data: false}
  }

  // Clear from requests and add to members
  await db.collection('users').doc(guildUID).collection('servers').doc(guildID).update({
    incomingRequests: admin.firestore.FieldValue.arrayRemove({
      n: username,
      u: userID
    }),
    members: admin.firestore.FieldValue.arrayUnion(`${username}.${userID}`)
  })

  // Clear from user doc
  userDoc = await db.collection('users').doc(userID).get()
  for (let i = 0; i < userDoc.data().outgoingGuilds.length; i++) {
    if (userDoc.data().outgoingGuilds[i].targetID == guildID) {
      await db.collection('users').doc(userID).update({
        outgoingGuilds: admin.firestore.FieldValue.arrayRemove(userDoc.data().outgoingGuilds[i]),
        guilds: admin.firestore.FieldValue.arrayUnion(`${guildUID}.${guildID}`)
      })
      break;
    }
  }

  return {data: true}
});

exports.rejectGuildRequest = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }
  
  const uid = context.auth.uid;
  const guildUID = data.guildUID;
  const guildID = data.guildID;
  const userID = data.userID;
  const username = data.username
  const db = admin.firestore();

  const guildDoc = await db.collection('users').doc(guildUID).collection('servers').doc(guildID).get();
  if (guildDoc.data().owner !== uid && !guildDoc.data().staff.includes(uid)) {
    return {data: false}
  }

  // Clear from guild doc
  await db.collection('users').doc(guildUID).collection('servers').doc(guildID).update({
    incomingRequests: admin.firestore.FieldValue.arrayRemove({
      n: username,
      u: userID
    })
  })

  // Clear from user doc
  userDoc = await db.collection('users').doc(userID).get()
  for (let i = 0; i < userDoc.data().outgoingGuilds.length; i++) {
    if (userDoc.data().outgoingGuilds[i].targetID == guildID) {
      await db.collection('users').doc(userID).update({
        outgoingGuilds: admin.firestore.FieldValue.arrayRemove(userDoc.data().outgoingGuilds[i])
      })
      break;
    }
  }

  return {data: true}
});

exports.deleteGuild = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }
  
  const uid = context.auth.uid;
  const guildUID = data.guildUID;
  const guildID = data.guildID;
  const db = admin.firestore();
  const rtdb = admin.database();

  if (uid !== guildUID) {
    const adminDoc = await db.collection('app').doc('onLoad').get();
    if (!adminDoc.data().adminUsers.includes(uid)) {
      return;
    } 
  }

  // Approved
  const serverDoc = await db.collection('users').doc(guildUID).collection('servers').doc(guildID).get();
  if (!serverDoc.exists) {
    return;
  }

  await db.collection('users').doc(guildUID).collection('servers').doc(guildID).delete();
  await db.collection('users').doc(guildUID).update({
    guilds: admin.firestore.FieldValue.arrayRemove(`${guildUID}.${guildID}`)
  });

  if (serverDoc.channels && serverDoc.channels.length) {
    for (let i = 0; i < serverDoc.channels.length; i++) {
      const channelID = serverDoc.channels[i].split('.')[0];
      
      await rtdb.ref(`channels/${guildUID}${guildID}${channelID}`).remove();
    }
  }

  return true;
});

exports.deleteLounge = functions.https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }
  
  const uid = context.auth.uid;
  const guildUID = data.guildUID;
  const guildID = data.guildID;
  const loungeID = data.loungeID;
  const loungeName = data.loungeName

  const db = admin.firestore();
  const rtdb = admin.database();

  if (uid !== guildUID) {
    const guildDoc = await db.collection('users').doc(guildUID).collection('servers').doc(guildID).get();
    if (!guildDoc.data().staff.includes(uid)) {
      return;
    } 
  }

  // Approved
  await db.collection('users').doc(guildUID).collection('servers').doc(guildID).update({
    channels: admin.firestore.FieldValue.arrayRemove(`${loungeID}.${loungeName}`)
  });
    
  await rtdb.ref(`channels/${guildUID}${guildID}${loungeID}`).remove();

  return true;
});