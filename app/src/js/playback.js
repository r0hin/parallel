import { reportTrack } from "./app";
import { decode, encode } from "./display";
import { checkValidSubscription } from "./stripe";

import { getPerformance, trace } from "firebase/performance";
import { forwardSong } from "./music";
import { checkAppInitialized } from "./firebaseChecks";

checkAppInitialized();
const perf = getPerformance();

window.musicErrored = false;
window.playingMP4 = false;
window.playingDuration = null;

export function getPlaybackURL(trackDetails, regenerate) {
  return new Promise(async (resolve, reject) => {
    const timerOne = new Date().getTime();
    const playTrace = trace(perf, "MUSIC_FETCH_PLAY");
    playTrace.start();
    const fetched = await fetch(`https://parallelcloud-y3wxrl53eq-uc.a.run.app/play?trackID=${trackDetails.id}&trackTitle=${trackDetails.attributes.name}&trackArtist=${trackDetails.attributes.artistName}&trackISRC=${trackDetails.attributes.isrc}&trackDuration=${trackDetails.attributes.durationInMillis/1000}${checkValidSubscription(cacheUser.subscription) ? '&premium=true' : ''}${regenerate ? '&regenerate=true' : ''}${trackDetails.attributes.contentRating == 'explicit' ? '&explicit=true' : ''}`);
    playTrace.stop();
    console.log(`Done stage 1 in ${(new Date().getTime() - timerOne) / 1000}s.`);

    const response = await fetched.json();
    playingMP4 = response.mp4s == 'true' ? true : false;
    playingDuration = response.duration || 0;

    resolve([response.url, response.url2]);
    return;
  });
}

export async function sendTrackToPlayerRevamp(trackDetails, audioElementSelector, guildOffset, guildTrackURL, guildTrackURL2) {
  if (!playback) { snac('No Playback Available', 'This feature has been temporarily disabled. Please try again later.', 'danger'); return }
  
  musicErrored = false;
  let trackURL = guildTrackURL;
  let trackURL2 = guildTrackURL2;
  if (!trackURL) {
    const [url, url2] = await getPlaybackURL(trackDetails, false);
    trackURL = decode(url);
    trackURL2 = decode(url2);
  }
  else {
    trackURL = decode(trackURL);
    trackURL2 = decode(trackURL2);
  }
  
  const timerTwo = new Date().getTime();

  const audio = $(`${audioElementSelector}`).get(0);
  audio.src = "";
  audio.onloadeddata = () => {};
  audio.onerror = () => {};
  audio.onloadeddata = () => {
    audio.onloadeddata = () => { };
    audio.onerror = () => { };
  
    console.log(`Done stage 2 in ${(new Date().getTime() - timerTwo) / 1000}s.`);
    if (guildOffset) { setOffset(guildOffset, audio) };
    audio.play();
  }
    
  audio.onerror = async () => {
    audio.onloadeddata = () => { };
    audio.onerror = () => { };

    if (playingDuration > 960) { // 960 seconds.

      // TODO: Find a solution to play the song more cost effectively.

      snac('Playback Error', `We could not stream this track for you because it is too long. We working to fix the issue as soon as possible`, 'danger');
      reportTrack(trackDetails.id, true);
      forwardSong();
      return;
    }

    const mediaSource = new MediaSource();

    try { audio.src = window.URL.createObjectURL(mediaSource); } catch (error) { };

    mediaSource.addEventListener('sourceopen', async () => {
      libraryPlayer.play();
      let sourceBuffer = null;
      if (playingMP4) {
        alert('Unsupported codec. We are currently working to support this.');
        snac('Failed', 'Failed to stream audio.', 'error');
        return;
      }
      else {
        sourceBuffer = mediaSource.addSourceBuffer('audio/webm; codecs="opus"');
      }
      
      let response;
      function requestTimeout(e,t){return new Promise((r,o)=>{const n=setTimeout(()=>{o(new Error("TIMEOUT"))},e);t.then(e=>{clearTimeout(n),r(e)}).catch(e=>{clearTimeout(n),o(e)})})};
      
      const timerTwo = new Date().getTime();
      const streamTrace = trace(perf, "MUSIC_FETCH_STREAM");
      streamTrace.start();

      try {
        response = await requestTimeout(4200, fetch(`https://parallelcloud-y3wxrl53eq-uc.a.run.app/stream?audioURL=${encode(trackURL2)}`));
        if (!response.ok) { throw new Error('false') }
      } catch (error) {
        console.log(error)
        console.log(`https://parallelcloud-y3wxrl53eq-uc.a.run.app/stream?audioURL=${encode(trackURL2)}`)
        snac('Failed', 'Failed to stream audio.', 'error');
        reportTrack(trackDetails.id, true);
        streamTrace.stop();
        return;
      }
      
      streamTrace.stop();
      console.log(`Done stage 2 in ${(new Date().getTime() - timerTwo) / 1000}s.`);
      const timerThree = new Date().getTime();

      const body = response.body
      const reader = body.getReader()
      
      let streamNotDone = true;

      while (streamNotDone) {
        const {value, done} = await reader.read();
  
        if (done) {
          streamNotDone = false; 
          console.log(`Done stage 3 in ${(new Date().getTime() - timerThree) / 1000}s.`);
          break;
        }
  
        await new Promise((resolve, reject) => {
          sourceBuffer.appendBuffer(value)
  
          sourceBuffer.onupdateend = (() => {
            resolve(true);
          });
        });
      }

      if (guildOffset) {
        setOffset(guildOffset, audio);
      }
    })
  }
  
  audio.src = trackURL;
}

function setOffset(offset, audio) {
  console.log(`Implementing offset of ${audio.duration - (offset / 1000)}`);
  audio.currentTime = audio.duration - (offset / 1000);
  audio.play();
}
