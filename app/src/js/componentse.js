import { getFunctions, httpsCallable } from '@firebase/functions';
import { checkAppInitialized } from './firebaseChecks';
import cosha from "cosha";

checkAppInitialized();
const functions = getFunctions();

window.musicCatalogue = {};

export function createAlbum(album, targetElementID, customID) {
  const temporaryAlbumID = customID || `ALBUM${new Date().getTime()}${album.id}`;

  let likeSnippet = `<button onclick="addToLibrary('albums', '${album.id}')" class="btn roundedButton likedButtonalbums${album.id}"><i class="bx bx-heart"></i></button>`;
  if (cacheLibraryAlbums.includes(album.id)) {
    likeSnippet = `<button onclick="removeFromLibrary('albums', '${album.id}')" class="btn roundedButton likedButtonalbums${album.id}"><i class="bx bxs-heart"></i></button> `;
  }

  let explicitSnippet = '';
  if (album.attributes.contentRating && album.attributes.contentRating == 'explicit') {
    explicitSnippet = `<div class="music-album-explicit">E</div>`;
  }

  const a = document.createElement('div');
  a.id = temporaryAlbumID;
  a.setAttribute('class', 'music-album invisible fadeIn faster');
  a.innerHTML = `
    <img onclick="openAlbum('${album.id}')" draggable="false" id="${temporaryAlbumID}Photo" class="${temporaryAlbumID}Photo invisible animated"/>
    ${explicitSnippet}
    <div class="music-album-details">
      <p title="${album.attributes.name}" onclick="openAlbum('${album.id}')" class="music-album-title">${album.attributes.name}</p>
      ${likeSnippet}
    </div>
    <div class="music-album-details">
      <p id="Album${temporaryAlbumID}Artist" class="music-album-artist" title="${album.attributes.artistName }">${album.attributes.artistName}</p>
      <p class="music-album-date">${album.attributes.releaseDate}</p>
    </div>
  `

  $(`#${targetElementID}`).append(a);

  $(`#Album${temporaryAlbumID}Artist`).get(0).onclick = async (event) => {
    const artist = await makeMusicRequest(`albums/${album.id}/artists`);
    setContextSelectArtistItems(null, null, null, artist.data, event)
  }

  $(`#${temporaryAlbumID}Photo`).get(0).setAttribute('src', album.attributes.artwork.url.replace('{w}', '500').replace('{h}', '500'));
  $(`#${temporaryAlbumID}Photo`).get(0).onload = () => {
    $(`#${temporaryAlbumID}Photo`).addClass('zoomIn');
    $(`#${temporaryAlbumID}`).removeClass('invisible');
    $(`#${temporaryAlbumID}Photo`).removeClass('invisible');
    cosha(`${temporaryAlbumID}Photo`);
    window.setTimeout(() => {
      $(`#${temporaryAlbumID}`).removeClass('animated');
      $(`#${temporaryAlbumID}Photo`).removeClass('animated');
    }, 999);
  }
}

export async function createArtist(artist, targetElementID, customID) {
  const temporaryArtistID = customID || `ARTIST${new Date().getTime()}${artist.id}`;

  let likeSnippet = `<button onclick="addToLibrary('artists', '${artist.id}')" class="btn roundedButton likedButtonartists${artist.id}"><i class="bx bx-heart"></i></button>`;
  if (cacheLibraryArtists.includes(artist.id)) {
    likeSnippet = `<button onclick="removeFromLibrary('artists', '${artist.id}')" class="btn roundedButton likedButtonartists${artist.id}"><i class="bx bxs-heart"></i></button> `;
  }

  const a = document.createElement('div');
  a.setAttribute('class', 'music-artist invisible animated fadeIn faster');
  a.id = temporaryArtistID;
  a.innerHTML = `
    <img onclick="openArtist('${artist.id}')" draggable="false" id="${temporaryArtistID}Photo" class="${temporaryArtistID}Photo invisible animated"/>
    <p onclick="openArtist('${artist.id}')" class="music-artist-name" title="${artist.attributes.name}">${artist.attributes.name}</p>
    ${likeSnippet}
  `
  $(`#${targetElementID}`).append(a);

  const getArtistProfilePhoto = httpsCallable(functions, 'getArtistProfilePhoto');
  const artistURL = (await getArtistProfilePhoto({artistID: artist.id})).data.data.replace('cw.png', 'cc.webp').replace('{w}', 240).replace('{h}', 240);

  $(`#${temporaryArtistID}Photo`).get(0).setAttribute('src', artistURL);
  $(`#${temporaryArtistID}Photo`).get(0).onload = () => {
    $(`#${temporaryArtistID}Photo`).addClass('zoomIn');
    $(`#${temporaryArtistID}Photo`).removeClass('invisible');
    $(`#${temporaryArtistID}`).removeClass('invisible');
    cosha(`${temporaryArtistID}Photo`);
    window.setTimeout(() => {
      $(`#${temporaryArtistID}`).removeClass('animated');
      $(`#${temporaryArtistID}Photo`).removeClass('animated');
    }, 999);
  }
}

export function createTrack(track, targetElementID, index, customID, attributes, prependInstead, customOnclick, backupID) {
  if (!track) {
    const a = document.createElement('div');
    a.id = customID || `TRACK${new Date().getTime()}${track.id}`;
    a.setAttribute('class', 'erroredTrack');
    if (attributes[attributes.indexOf('playlistUID') + 1] == user.uid) {
      // My playlist, offer to delete it.
      a.innerHTML = `<p>Unable to load this track. <a id="${a.id}removeFromPlaylistButton">Remove from playlist?</a></p>`;
      $(`#${targetElementID}`).append(a);
      $(`#${a.id}removeFromPlaylistButton`).get(0).onclick = async () => {
        $(`#${a.id}`).html('<p>Removing...</p>');
        removeBrokenTrackFromPlaylist(attributes[attributes.indexOf('playlistID') + 1], backupID, attributes[attributes.indexOf('playlistRandomID') + 1]);
      }
    }
    else {
      a.innerHTML = `<p>Unable to load this track.</p>`;
      $(`#${targetElementID}`).append(a);
    }
    return;
  }

  const temporaryTrackID = customID || `TRACK${new Date().getTime()}${track.id}`;
  const ms = track.attributes.durationInMillis;
  const minutes = Math.floor(ms / 60000);
  let seconds = ((ms % 60000) / 1000).toFixed(0);
  if (`${seconds}`.length == 1) {
    seconds = `0${seconds}`;
  }
  musicCatalogue[`${track.id}`] = track;

  let likeSnippet = `<button onclick="event.stopPropagation(); addToLibrary('tracks', '${track.id}')" class="btn roundedButton likedButtontracks${track.id}"><i class="bx bx-heart"></i></button>`;
  if (cacheLibraryTracks.includes(track.id)) {
    likeSnippet = `<button onclick="event.stopPropagation(); removeFromLibrary('tracks', '${track.id}')" class="btn roundedButton likedButtontracks${track.id}"><i class="bx bxs-heart"></i></button> `;
  }

  const a = document.createElement('div');
  a.setAttribute('class', `music-track trackContext music-track-${track.id}`);
  a.setAttribute('trackID', track.id);
  
  if (customOnclick) {
    a.setAttribute('onclick', customOnclick)
  }
  else {
    a.onclick = () => { playTrack(track.id, targetElementID, index) };
  }

  if (attributes) {
    for (let i = 0; i < attributes.length; i = i + 2) {
      const key = attributes[i];
      const value = attributes[i + 1];
      a.setAttribute(key, value);
    }
  }

  let indexSnippet = `<div id="music-track-icon-${temporaryTrackID}" class="music-track-icon ${((typeof(index) == 'object' || typeof(index) == 'boolean') ? 'hidden' : '')}">${index+1}</div>`
  if (a.getAttribute('playlistUID') == user.uid) {
    indexSnippet = `<div onclick="event.stopPropagation(); prepareSetTrackIndexByInput('${user.uid}', '${a.getAttribute('playlistID')}', ${index})" id="music-track-icon-${temporaryTrackID}" class="music-track-icon music-track-icon-hover ${((typeof(index) == 'object' || typeof(index) == 'boolean') ? 'hidden' : '')}">${index+1}</div>`
  }

  a.id = temporaryTrackID;
  a.innerHTML = `
    <div class="music-track-left">
      <div class="music-track-index-container ${((typeof(index) == 'object' || typeof(index) == 'boolean') ? 'hidden' : '')}" onclick="event.stopPropagation();">
        ${indexSnippet}  
      </div>
      <div class="music-track-cover">
        <img src="${track.attributes.artwork.url.replace('{h}', '128').replace('{w}', '128')}"></img>
      </div>
      <div class="music-track-title-container">
        <div class="music-track-title ${`${musicPlaying.id}` == `${track.id}` ? 'nowPlayingTitle' : ''} trackTitle${track.id}" title="${track.attributes.name}">${track.attributes.name}</div>
        <div class="music-track-album" onclick="event.stopPropagation(); openAlbum('${track.relationships ? track.relationships.albums.data[0].id : null}', '${track.id}')" title="${track.attributes.albumName}">${track.attributes.albumName}</div>
      </div>
    </div>
    <div id="${temporaryTrackID}ArtistName" trackID="${track.id}" class="music-track-artist artistButtonContext acceptLeftClick" title="${track.attributes.artistName}">${track.attributes.artistName}</div>
    <div class="music-track-details" onclick="event.stopPropagation();">
      <div class="music-track-explicit ${track.attributes.contentRating == 'explicit' ? '' : 'hidden'}">E</div>
      ${likeSnippet}
      <div class="music-track-duration">${minutes}:${seconds}</div>
      <button id="${temporaryTrackID}DropdownButton" class="btn roundedButton"><i class="bx bx-dots-horizontal-rounded"></i></button>
    </div>
  
  `;

  if (prependInstead) {
    $(`#${targetElementID}`).prepend(a);
  }
  else {
    $(`#${targetElementID}`).append(a);
  }

  $(`#${temporaryTrackID}ArtistName`).get(0).onclick = () => {
    event.stopPropagation();
    checkElements(event);
  }

  $(`#${temporaryTrackID}DropdownButton`).get(0).onclick = () => {
    event.stopPropagation();
    showContextOf('track', event, $(`#${temporaryTrackID}`).get(0), track.id);
  }
}

export function createApplePlaylist(playlist, targetElementID) {
  playlist.id = playlist.id.replaceAll('.', '_');
  const temporaryPlaylistID = `PLAYLIST${new Date().getTime()}${playlist.id}`;

  const a = document.createElement('div');
  a.id = temporaryPlaylistID;
  a.setAttribute('class', 'music-playlist invisible fadeIn faster');
  a.innerHTML = `
    <img onclick="openApplePlaylist('${playlist.id}')" draggable="false" id="${temporaryPlaylistID}Photo" class="${temporaryPlaylistID}Photo invisible animated"/>
    <div class="music-playlist-details">
      <p title="${playlist.attributes.name}" onclick="openApplePlaylist('${playlist.id}')" class="music-playlist-title">${playlist.attributes.name}</p>
    </div>
  `

  $(`#${targetElementID}`).append(a);

  $(`#${temporaryPlaylistID}Photo`).get(0).setAttribute('src', playlist.attributes.artwork.url.replace('{w}', '500').replace('{h}', '500'));
  $(`#${temporaryPlaylistID}Photo`).get(0).onload = () => {
    $(`#${temporaryPlaylistID}Photo`).addClass('zoomIn');
    $(`#${temporaryPlaylistID}`).removeClass('invisible');
    $(`#${temporaryPlaylistID}Photo`).removeClass('invisible');
    cosha(`${temporaryPlaylistID}Photo`);
    window.setTimeout(() => {
      $(`#${temporaryPlaylistID}`).removeClass('animated');
      $(`#${temporaryPlaylistID}Photo`).removeClass('animated');
    }, 999);
  }
}

export function createGenre(genre, targetElementID) {
  const temporaryGenreID = `GENRE${new Date().getTime()}${genre.id}`;
  const a = document.createElement('div');
  a.onclick = () => { openGenre(genre.id) };
  a.setAttribute('class', 'music-genre');

  // Create randomized gradient:
  const valueOne = Math.floor(Math.random() * 256);
  const valueTwo = Math.floor(Math.random() * 256);
  const valueThree = Math.floor(Math.random() * 256);
  const valueFour = Math.floor(Math.random() * 256);
  const valueFive = Math.floor(Math.random() * 256);
  const valueSix = Math.floor(Math.random() * 256);

  a.setAttribute('style', `background: linear-gradient(to right, rgba(${valueOne}, ${valueTwo}, ${valueThree}, 0.2), rgba(${valueFour}, ${valueFive}, ${valueSix}, 0.2));`);

  a.id = temporaryGenreID;
  a.innerHTML = `
    <div class="music-genre-name" title="${genre.attributes.name}">${genre.attributes.name}</div>
  `
  $(`#${targetElementID}`).append(a);
}