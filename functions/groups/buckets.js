const functions = require('firebase-functions')
const admin = require("firebase-admin");
const enforceAppCheck = false;

exports.manageUploads = functions.storage.bucket('parallel-archive.appspot.com').object().onFinalize(async (object) => {
  const spawn = require("child-process-promise").spawn;
  const path = require("path");
  const os = require("os");
  const mkdirp = require("mkdirp");
  const fs = require("fs-extra");

  if (!object.size) { return }

  const filePath = object.name;
  const fileDir = path.dirname(filePath);

  const baseFileName = path.basename(filePath, path.extname(filePath));
  const JPEGFilePath = path.normalize(path.format({ dir: fileDir, name: baseFileName, ext: '.png' }));

  // Ensure PNGs in specific locations.
  if (filePath.includes("pfp/") || filePath.includes("covers/") || filePath.includes('groups/') || filePath.includes('playlists/')) {
    if (object.contentType.startsWith("image/png")) {
      console.log("Already a PNG.");
      return null;
    }
  
    const bucket = admin.storage().bucket(object.bucket);
    await mkdirp(path.dirname(path.join(os.tmpdir(), filePath)));
    await bucket.file(filePath).download({ destination: path.join(os.tmpdir(), filePath) });
    await spawn("convert", [path.join(os.tmpdir(), filePath), path.join(os.tmpdir(), JPEGFilePath)]);
    await bucket.upload(path.join(os.tmpdir(), JPEGFilePath), { destination: JPEGFilePath });

    if (filePath.includes('groups/')) {
      await admin.firestore().collection('users').doc(filePath.split('/')[1]).collection('servers').doc(filePath.split('/')[2]).update({
        url: `https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/${JPEGFilePath.replace(/\//g, '%2F')}?alt=media&ts=${new Date().getTime()}`
      })
    }

    if (filePath.includes('users/')) {
      await admin.firestore().collection('users').doc(filePath.split('/')[1]).update({
        url: `https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/users%2F/${filePath.split('/')[1]}/profile.png?alt=media&ts=${new Date().getTime()}`
      })
    }

    if (filePath.includes('playlists/')) {
      await admin.firestore().collection('users').doc(filePath.split('/')[1]).collection('playlists').doc(filePath.split('/')[2]).update({
        imageURL: `https://firebasestorage.googleapis.com/v0/b/parallel-archive.appspot.com/o/${JPEGFilePath.replace(/\//g, '%2F')}?alt=media&ts=${new Date().getTime()}`,
        dateModified: admin.firestore.FieldValue.serverTimestamp(),
      })
    }

    await fs.remove(path.join(os.tmpdir(), JPEGFilePath));
    await fs.remove(path.join(os.tmpdir(), filePath));

    return {data: true}
  }

  // Catch attachments :)
  if (filePath.includes("attachments/")) {
    const uID = filePath.split('/')[2];
    const fileSize = object.size;
    const db = admin.firestore();

    // Add file size to user who uploaded it.
    await db.collection('users').doc(uID).collection('sensitive').doc('storage').set({
      files: admin.firestore.FieldValue.arrayUnion({
        filePath: filePath,
        fileSize: fileSize,
      }),
      totalSize: admin.firestore.FieldValue.increment(parseInt(fileSize))
    }, {merge: true});

    const newDoc = await db.collection('users').doc(uID).collection('sensitive').doc('storage').get();

    if (newDoc.data().totalSize > 9000000000) { // 9 gigabytes
      await db.collection('users').doc(uID).update({
        blockUploads: true,
        blockUploadsPremium: true
      });
    }

    else if (newDoc.data().totalSize > 3000000000) { // 3 gigabytes
      await db.collection('users').doc(uID).update({
        blockUploads: true,
      });
    }
  }
});

exports.resizeImages = functions.runWith({
  memory: '1GB'
}).https.onCall(async (data, context) => {
  // App check
  if (enforceAppCheck) {
    if (context.app == undefined) { throw new functions.https.HttpsError('failed-precondition', 'The function must be called from an App Check verified app.')};
  }

  const path = require("path");
  const os = require("os");
  const tmpdir = os.tmpdir();
  const mkdirp = require("mkdirp");
  const sharp = require("sharp");
  const fs = require("fs-extra");

  // Called after uploading an image attachment. 
  const filePath = data.filePath;
  const targetChannel = data.targetChannel;
  const uID = context.auth.uid;
  // const filePath = 'attachments/69MXwKvLvDQYc23kBTSYQ4nbsLz2hOC4lJbgBgTju0Wo5aENMuDNiK52/69MXwKvLvDQYc23kBTSYQ4nbsLz2/1640748810843.png'
  // const targetChannel = '69MXwKvLvDQYc23kBTSYQ4nbsLz2hOC4lJbgBgTju0Wo5aENMuDNiK52'
  // const uID = `69MXwKvLvDQYc23kBTSYQ4nbsLz2`;
  
  const bucket = admin.storage().bucket('parallel-archive.appspot.com');
  const fileName = path.basename(filePath);
  
  const workingDir = path.join(tmpdir, 'resize-images');
  const workingFilePath = path.join(workingDir, `resize-images${fileName}.` + filePath.split('.').pop());
  
  console.log(workingDir)
  console.log(workingFilePath)

  await mkdirp(workingDir);
  console.log(filePath)
  await bucket.file(filePath).download({ destination: workingFilePath });
  
  const resizedName = `${fileName.split('.')[0]}-resized.png`;
  const resizedPath = path.join(workingDir, resizedName);
  
  // await bucket.file(filePath).download({ destination: resizedPath });
  
  // Dont even touch the original file. Troubleshooting
  await sharp(workingFilePath).resize(150, 100, { fit: sharp.fit.cover }).toFile(resizedPath);

  await bucket.upload(resizedPath, {
    destination: `attachmentsPreview/${targetChannel}/${uID}/${resizedName}`
  });

  fs.unlink(workingFilePath, (err) => {
    if (err) { console.error(err) }
    fs.unlink(resizedPath, (err) => {
      if (err) { console.error(err) }
      return {data: true}
    });
  });
});

exports.manageDeletions = functions.storage.bucket('parallel-archive.appspot.com').object().onDelete(async (object) => {
  // Catch attachments
  const filePath = object.name;

  if (filePath.includes("attachments/")) {
    const uID = filePath.split('/')[2];
    const fileSize = object.size;
    const db = admin.firestore();

    await db.collection('users').doc(uID).collection('sensitive').doc('storage').set({
      files: admin.firestore.FieldValue.arrayRemove({
        filePath: filePath,
        fileSize: fileSize,
      }),
      totalSize: admin.firestore.FieldValue.increment(parseInt(`-${fileSize}`))
    }, {merge: true});

    const newDoc = await db.collection('users').doc(uID).collection('sensitive').doc('storage').get();

    if (newDoc.data().totalSize < 3000000000) { // 3 gigabytes
      await db.collection('users').doc(uID).update({
        blockUploads: false,
        blockUploadsPremium: false
      });
    }
    else if (newDoc.data().totalSize < 9000000000) { // 9 gigabytes
      await db.collection('users').doc(uID).update({
        blockUploads: true,
        blockUploadsPremium: false
      });
    }
  }
})

exports.manageLibraryKeywords = functions.firestore.document(`parallelTracks/{trackID}`).onUpdate(async (change, context) => {
  const db = admin.firestore();
  const trackID = context.params.trackID;
  const newValue = change.after.data();
  const oldValue = change.before.data();

  const createKeywords=e=>{const $=[];let r="";return e.split("").forEach(e=>{r+=e,$.push(r)}),$};

  if (newValue.title == oldValue.title && oldValue.artist == newValue.artist) { return };

  const keywords = createKeywords(newValue.title.toLowerCase());
  const keywordsArtist = createKeywords(newValue.artist.name.toLowerCase());

  await db.collection('parallelTracks').doc(trackID).update({
    id: trackID,
    parallel: true,
    zkeywords: keywords,
    zkeywordsArtist: keywordsArtist,
  });

  return;
});