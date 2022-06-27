import { getPerformance } from "firebase/performance";
import { checkAppInitialized } from "./firebaseChecks";
import { decode } from "./displays";

checkAppInitialized();
const perf = getPerformance();

export function getPlaybackURL(trackDetails) {
  return new Promise(async (resolve, reject) => {
    const timerOne = new Date().getTime();
    const fetched = await fetch(`http://localhost:${serverPort}/play?isrc=${trackDetails.attributes.isrc}&title=${trackDetails.attributes.name}&artist=${trackDetails.attributes.artistName}&duration=${trackDetails.attributes.durationInMillis}`);
    console.log(`Done stage 1 in ${(new Date().getTime() - timerOne) / 1000}s.`);
    const response = await fetched.json();
    resolve(response.url);
    return;
  });
}

export async function sendTrackToPlayerRevamp(trackDetails, audioElementSelector, guildOffset, guildTrackURL) {
  if (!playback) { snac('No Playback Available', 'This feature has been temporarily disabled. Please try again later.', 'danger'); return }
  
  let trackURL = guildTrackURL;
  if (!trackURL) {
    trackURL = await getPlaybackURL(trackDetails);
  }
  
  const audio = $(`${audioElementSelector}`).get(0);
  audio.src = decode(trackURL);

  // When audio is loaded, set the offset
  audio.onloadedmetadata = () => {
    if (guildOffset) {
      setOffset(guildOffset, audio);
    }
  }

  audio.play();
}

function setOffset(offset, audio) {
  console.log(`Implementing offset of ${audio.duration - (offset / 1000)}`);
  audio.currentTime = audio.duration - (offset / 1000);
  audio.play();
}
