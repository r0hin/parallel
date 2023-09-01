import { getAuth, onAuthStateChanged } from '@firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, deleteField, FieldPath} from '@firebase/firestore';
import { getFunctions, httpsCallable } from '@firebase/functions';
import { startMainElectronProcesses } from './electron';
import { checkAppInitializedAdmin } from './firebaseAdmin';

checkAppInitializedAdmin();
const db = getFirestore();
const functions = getFunctions();
const auth = getAuth();

onAuthStateChanged(auth, async (user) => {
  if (user) {
    window.user = auth.currentUser;
    if (window.require) {
      console.log("Electron detected.");
      startMainElectronProcesses();
    }
  }
  else {
    // window.location.replace('https://parallelsocial.net')
  }
});

window.showTab = (tab) => {
  $(`.reportView`).addClass('hidden');
  $(`#${tab}`).removeClass('hidden');

  console.log($(`#${tab}`).children().length)

  if ($(`#${tab}`).children().length <= 1) {
    switch (tab) {
      case 'groupReports':
        loadGroupReports();
        break;
      case 'loungeReports':
        loadLoungeReports();
        break;
      case 'userReports':
        loadUserReports();
        break;
      case 'trackReports':
        loadTrackReports();
        break;
      case 'missingTrackReports':
        loadMissingTrackReports();
      default:
        break;
    }
  }
}

async function loadGroupReports() {
  const groupReports = await getDoc(doc(db, `reports/groups`))
  const keys = Object.keys(groupReports.data());

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]; // LNetswVcJ2NNpHLB0kOeVAYkioD2.Whaspurrs Summer Band Camp.UyFEkZ0qXdWKJorBR6pS
    const value = groupReports.data()[key];
    const serverUID = `${key.split('.')[0]}`
    const serverID = `${key.split('.')[2]}`

    const a = document.createElement('div');
    a.id = serverUID + serverID + 'report'
    a.setAttribute('class', 'groupReportItem');
    a.innerHTML = `
      <div class="preview">
        <p><b>${key.split('.')[1]}</b> reported by <b>${value.length}</b> users.</p>
        <div>
        <button onclick="disposeGroupReport('${serverUID}', '${serverID}', '${key}')" class="btn b-1">Dispose Report</button>
          <button id="${serverUID}${serverID}detailsButton" onclick="getServerDetails('${serverUID}', '${serverID}')" class="btn b-1">Get Details</button>
        </div>
      </div>
      <div id="${serverUID}${serverID}nonPreview" class="nonPreview"></div>
    `
    $('#groupReports').get(0).appendChild(a);
  }
}

window.disposeGroupReport = async (uid, id, key) => {
  $(`#${uid}${id}report`).remove();

  const field = new FieldPath(key)

  await updateDoc(doc(db, `reports/groups`), field, deleteField());
}


window.getServerDetails = async (UID, ID) => {
  $(`#${UID}${ID}detailsButton`).addClass('disabled');

  const detailsDoc = await getDoc(doc(db, `users/${UID}/servers/${ID}`));
  console.log(detailsDoc)

  let channelsSnippet = ``;
  for (let i = 0; i < detailsDoc.data().channels.length; i++) {
    const channel = detailsDoc.data().channels[i];
    channelsSnippet = channelsSnippet + `
      <li>"${channel.split('.')[1]}" of ID "${channel.split('.')[0]}"</li>
    `  
  }

  let membersSnippet = ``;
  for (let i = 0; i < detailsDoc.data().members.length; i++) {
    const member = detailsDoc.data().members[i];
    membersSnippet = membersSnippet + `
      <li>"${member.split('.')[0]}" of ID "${member.split('.')[1]}"</li>
    `  
  }

  let staffSnippet = ``;
  for (let i = 0; i < detailsDoc.data().staff.length; i++) {
    const staff = detailsDoc.data().staff[i];
    staffSnippet = staffSnippet + `
      <li>ID of "${staff}"</li>
    `  
  }

  $(`#${UID}${ID}nonPreview`).html(`
    <pre class="prettyprint">${JSON.stringify(detailsDoc.data()).replaceAll('<', '')}</pre>
    <br>
    <b>Channels</b>
    <ul>${channelsSnippet}</ul>
    <br>
    <b>Members</b>
    <ul>${membersSnippet}</ul>
    <br>
    <b>Staff</b>
    <ul>${staffSnippet}</ul>
    <br>
    <center class="elevated">ID "${UID}.${ID}"</center>
    <br>
  `)

  PR.prettyPrint();
}

async function loadTrackReports() {
  const trackReports = await getDoc(doc(db, `reports/tracks`))
  const keys = Object.keys(trackReports.data());

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = trackReports.data()[key];

    const a = document.createElement('div');
    a.id = key + 'report'
    a.setAttribute('class', 'trackReportItem');
    a.innerHTML = `
    <div class="preview">
        <p><b>${key}</b> reported by <b>${value.length}</b> users.</p>
        <div>
          <button onclick="disposeTrackReport('${key}')" class="btn b-1">dispose</button>
        </div>
      </div>
    `
    $('#trackReports').get(0).appendChild(a);
    
  }
}

window.disposeTrackReport = async (key) => {
  $(`#${key}report`).remove();

  const field = new FieldPath(key)

  await updateDoc(doc(db, `reports/tracks`), field, deleteField());
}

async function loadMissingTrackReports() {
  const trackReports = await getDoc(doc(db, `reports/missingTracks`))
  const keys = Object.keys(trackReports.data());

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = trackReports.data()[key];

    const a = document.createElement('div');
    a.id = key.replaceAll('.', '') + 'report'
    a.setAttribute('class', 'trackReportItem');
    a.innerHTML = `
    <div class="preview">
        <p><b>${value}</b> requested by <b>${key.split('.')[0]}</b>. Notify ${key.split('.')[1]}</p>
        <div>
          <button onclick="disposeMissingTrackReport('${key}')" class="btn b-1">dispose</button>
        </div>
      </div>
    `
    $('#missingTrackReports').get(0).appendChild(a);
    
  }
}

window.disposeMissingTrackReport = async (key) => {
  $(`#${key.replaceAll('.', '')}report`).remove();

  const field = new FieldPath(key)

  await updateDoc(doc(db, `reports/missingTracks`), field, deleteField());
}

async function loadLoungeReports() {
  const loungeReports = await getDoc(doc(db, `reports/lounges`))
  const keys = Object.keys(loungeReports.data()); 

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i].replaceAll('<', '');
    const value = loungeReports.data()[key];

    console.log(key)

    const UID = key.split('.')[0];
    const ID = key.split('.')[1];
    const loungeName = key.split('.')[2];
    const channelID = key.split('.')[3];
    const channelName = key.split('.')[4];

 
    const a = document.createElement('div');
    a.setAttribute('class', 'groupReportItem');
    a.id = `${UID}${ID}${channelID}report`;
    a.innerHTML = `
      <div class="preview">
        <p><b>${loungeName}</b> reported by <b>${value.length}</b> users.</p>
        <div>
          <button onclick="disposeLoungeReport('${UID}', '${ID}', '${channelID}', '${key}')" class="btn b-1">dispose</button>
          <button id="${UID}${ID}${channelID}detailsButton" onclick="getLoungeDetails('${UID}', '${ID}', '${channelID}')" class="btn b-1">Get Details</button>
        </div>
      </div>
      <div id="${UID}${ID}${channelID}nonPreview" class="nonPreview"></div>
    `
    $('#loungeReports').get(0).appendChild(a);

  }
}

window.disposeLoungeReport = async (uid, id, channelid, key) => {
  $(`#${uid}${id}${channelid}report`).remove();

  const field = new FieldPath(key)

  await updateDoc(doc(db, `reports/lounges`), field, deleteField());
}

window.getLoungeDetails = (UID, ID, channelID) => {
  $(`#${UID}${ID}${channelID}detailsButton`).addClass('disabled'); 

  $(`#${UID}${ID}${channelID}nonPreview`).html(`
  <ul>
    <li>Owner User ID: ${UID}</li>
    <li>Group ID: ${ID}</li>
    <li>Channel ID: ${channelID}</li>
  </ul>
  <br>
  `)
}

async function loadUserReports() {
  const userReports = await getDoc(doc(db, `reports/users`));
  const keys = Object.keys(userReports.data()); 

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = userReports.data()[key];

    const UID = key.split('.')[0];
    const username = key.split('.')[1];
 
    const a = document.createElement('div');
    a.id = UID + 'report'
    a.setAttribute('class', 'groupReportItem');
    a.innerHTML = `
      <div class="preview">
        <p><b>${username}</b> reported by <b>${value.length}</b> users.</p>
        <div>
          <button onclick="disposeUserReport('${UID}', '${key}')" class="btn b-1">dispose</button>
          <button id="${UID}detailsButton" onclick="getUserDetails('${UID}', '${username}')" class="btn b-1">Get Details</button>
        </div>
      </div>
      <div id="${UID}nonPreview" class="nonPreview"></div>
    `
    $('#userReports').get(0).appendChild(a);

  }
}

window.disposeUserReport = async (uid, key) => {
  $(`#${uid}report`).remove();

  const field = new FieldPath(key)

  await updateDoc(doc(db, `reports/users`), field, deleteField());
}

window.getUserDetails = async (UID, username) => {
  const detailsDoc = await getDoc(doc(db, `users/${UID}`));
  $(`#${UID}detailsButton`).addClass('disabled'); 

  $(`#${UID}nonPreview`).html(`

  <pre class="prettyprint">${JSON.stringify(detailsDoc.data()).replaceAll('<', '')}</pre>

  <ul>
    <li>User ID: ${UID}</li>
    <li>Username: ${username}</li>
  </ul>
  <br>
  `)

  PR.prettyPrint();
}

window.grouptakedownconfirm = async () => {
  const uid = $('#grouptakedowntext1').val();
  const id = $('#grouptakedowntext2').val();
  $('#grouptakedowntext1').val('');
  $('#grouptakedowntext2').val('');

  snac('sending request', '', '');

  const deleteGuild = httpsCallable(functions, "deleteGuild");
  const result = await deleteGuild({ guildUID: uid, guildID: id });

  alert('completed.')
}

window.loungetakedownconfirm = async () => {
  const uid = $('#loungetakedowntext1').val();
  const id = $('#loungetakedowntext2').val();
  const loungeid = $('#loungetakedowntext3').val();
  const loungename = $('#loungetakedowntext4').val();
  $('#grouptakedowntext1').val('');
  $('#grouptakedowntext2').val('');
  $('#grouptakedowntext3').val('');
  $('#grouptakedowntext4').val('');

  snac('sending request', '', '');

  const deleteLounge = httpsCallable(functions, "deleteLounge");
  const result = await deleteLounge({ guildUID: uid, guildID: id, loungeID: loungeid, loungeName: loungename });

  alert('completed.')
}

window.usertakedownconfirm = async () => {
  const uid = $('#usertakedowntext1').val();
  $('#usertakedowntext1').val('');

  const banUser = httpsCallable(functions, "banUser");
  const result = await banUser({ userID: uid });

  alert('completed');
}

window.unbanuser = async () => {
  const uid = $('#usertakedowntext2').val();
  $('#usertakedowntext2').val('');

  const unbanUser = httpsCallable(functions, "unbanUser");
  const result = await unbanUser({ userID: uid });

  alert('completed');

}

window.liveupdate = async (letter) => {
  await updateDoc(doc(db, `app/onLoad`), {
    liveActions: letter
  });
}

window.codeinject1 = async () => {
  const codeInject = $(`#codeinject1`).val()

  await updateDoc(doc(db, `app/onLoad`), {
    codeInject: codeInject
  });

  alert('Injected')
}

twemoji.parse(document.body, { base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/' });