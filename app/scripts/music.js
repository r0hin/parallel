const app = require('express')();
const request = require('request');
var cors = require('cors')
const ytcog = require('ytcog')
const links = require('./link');
let session = null;

app.use(cors({credentials: true, origin: true}));

const cookiee = "VISITOR_INFO1_LIVE=93gRAP8R09A; __Secure-3PSID=LAjH2dcGPsdR_hw3zmv-7y4FzSB0s-0_xx3wzO8u91ncPoOPz-svTF-Y1J5OQLwoSHvmNw.; __Secure-3PAPISID=s6gm5HMcO9YOmw7j/AlnrlgJ1Be_gNfW43; LOGIN_INFO=AFmmF2swRQIgRTzM94qXS8BREC_RdRAKrG_k0xG4LMvo1BOnF8zDpS8CIQDKfAwIfbwIGBJI3Q94XxjbKFYBFOE-N-kC_6ofOaEaOw:QUQ3MjNmelNvY0c2Vmg5Um40dWJVbVhkck5CQWg4QV9uVkNQS1NUTVdaSVQxVl90d3I0Rmp1cXRRd3p1V0ZpMmxlWHpDQTZxU0Zpcmg5YVhOT3didjIycHBHelB2ME1qSFNtNk15WnhvaUtXNWw0V3RJSlp6QUlaLW52bFdCc3ZYNElLM013akxzLXdYYklWX1NJLWI1dmxxSU52TUFRXzRR; YSC=S_ejRR1tKkE; PREF=f4=4000000&tz=America.Toronto&f6=40000000; __Secure-3PSIDCC=AJi4QfFiMgH8_ePfskxXmlFGa5AJwLVu3cscztwePSH1-XpBlabQoBEWAa4YXkoyaiwPymosxA";

exports.startServer = (win) => {
  const server = app.listen(0, async () => {
    links.sendServerPort(win, server.address().port);
    console.log('Server started on port ' + server.address().port);

    session = new ytcog.Session(cookiee);
    await session.fetch();
    console.log(`Logged in: ${session.loggedIn}`);
  });

  app.get('/stream', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Accept-Ranges', "bytes");
    res.setHeader('Content-Type', "audio/webm");

    function decode(r){for(var e="",n=(r=r.slice(2)).length,o=0;o<n;){var t=r.slice(o,o+=2);e+=String.fromCharCode(parseInt(t,16))}return e};

    request.get(decode(req.query.audioURL), {headers: {'range': 'bytes=0-'}}, (err) => {
      if (err) {
        res.end();
        return;
      }
    }).pipe(res).on('finish', () => {
      res.end();
      return;
    });
  });

  app.get('/play', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', "*");
    let videoID = null;

    const search = new ytcog.Search(session, {
      query: `${req.query.isrc}`,
      period: 'any',
      quantity: 1
    });

    await search.fetch();

    if (!search.videos.length) {
      const search2 = new ytcog.Search(session, {
        query: `${req.query.artist} ${req.query.title} audio`,
        period: 'any',
        quantity: 1
      });
  
      await search2.fetch();
  
      if (!search2.videos.length) {
        res.send("Error 0x01");
        return;
      }
      else {
        videoID = search2.videos[0].id;
      }
    }
    else {
      videoID = search.videos[0].id;
    }

    const video = new ytcog.Video(session, {
      id: videoID
    });

    await video.fetch();

    if (!video.audioStreams.length) res.send("Error 0x02");

    const streams = video.audioStreams.sort((a, b) => {return a.size - b.size});
  
    if (!streams.length) {
      console.log(`No streams available for ${videoID} (https://youtu.be/${videoID})`);
      return;
    }
  
    function encode(n){for(var r="0x",t=n.length,e=0;e<t;e++)r+=n.charCodeAt(e).toString(16);return r}
  
    console.log("Playing https://youtu.be/" + videoID);

    res.json({
      url: encode(streams[streams.length - 1].url),
    });

    return;
  });
} 