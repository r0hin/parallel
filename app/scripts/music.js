const app = require('express')();
const request = require('request');
var cors = require('cors')
const ytcog = require('ytcog')
const links = require('./link');
let session = null;

app.use(cors({credentials: true, origin: true}));

const cookiee = "VISITOR_INFO1_LIVE=NL1Pxd-JeY8; GPS=1; YSC=B1Cvm2oa4h8; PREF=f4=4000000&tz=America.Toronto; SID=LgiD1ar7Ah7dVBLF-jMfrWDSwB7BSTS872GUg15eUVvCI_wgwAlL4I7xsxnL4tNKEv3QeA.; __Secure-1PSID=LgiD1ar7Ah7dVBLF-jMfrWDSwB7BSTS872GUg15eUVvCI_wgYSDOvLikJCqGaHcTauJZSg.; __Secure-3PSID=LgiD1ar7Ah7dVBLF-jMfrWDSwB7BSTS872GUg15eUVvCI_wga6INvd_rZX8GWuOUQoPA2A.; HSID=A0awAFC94rzw5MRho; SSID=A8x_VdWBkd3cOEbjO; APISID=qDQW2HAXawjWO2AL/AhEg4kAuVX-ebXXt-; SAPISID=mHRbzuzLUdPfWarq/ASiYhSZ3g-sOmlWrw; __Secure-1PAPISID=mHRbzuzLUdPfWarq/ASiYhSZ3g-sOmlWrw; __Secure-3PAPISID=mHRbzuzLUdPfWarq/ASiYhSZ3g-sOmlWrw; LOGIN_INFO=AFmmF2swRQIgFSgvU4CNrSODJmA-0xhPq0RBrm-Gc_1NaRpmyB6WZJACIQCQzdDP1wjxfmcGnc-E-oOUdwozJ3rcgLNzcPPAg5odRg:QUQ3MjNmeEFPY2ZuYmtIZU9lTFNSUVloMVh0a2x5N3NHRV9mdUl4SG9TSElESVAwUWFvdXVGR2VaYmtWTUVveHc2TFdPTVZHUmZOY0pORU1JT0ZCNnc1SnpHQnZLaEZWNm5CMFBpRFc1SmV1VUxsdWk5YWFDN05NX2kySDNaS1JLZk5YaHpJRWE5SExvMXlTMm1jcm5qMmZaUmdOeXRKWUdjblB1YlA0bFM2SWp1emExQTRPZE9GbTRmZVpDMDg4UXFzSWhzZEVfRjM4OVJtN0RPeGIzX29DRGppd3ZuMzZyZw==; CONSISTENCY=ALOGzFws5dJtqFjwWYYmG2KuZiQApLi7p1gnc_nuA6fl2AEaOwHgPsh5l_2FBllle0XxZTWyw7GZD4MZoDo6B7pLn1p9znDkWTjo2ENOL3W2EsGgAk8xf_6ZU18gnq0zTRZc9s99qgThoX5uhQC674bD; SIDCC=AJi4QfHvXLiV4TMWuRJEsKNCNYsKmIhuq5YprN956W041Ac5S02HzUN47SlWzrZ5PuAehwVm; __Secure-1PSIDCC=AJi4QfHdB8dnLTFrPpe3W1SWDYGd6GdMMkhaPhwfpbUjQi15p3JmxG9H3LAeVK_FSNISP_1bYA; __Secure-3PSIDCC=AJi4QfFWmlCi56tJWgfdqNoEQTu-ZWhT8kisxjBA7FloNQ-Wpds0fX-w_fCSI3tka-YI4ZrH";

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

    let video = new ytcog.Video(session, {
      id: videoID
    });

    await video.fetch();
    console.log(Math.abs(video.duration - (parseInt(req.query.duration) / 1000)) > 5)
    if (Math.abs(video.duration - (parseInt(req.query.duration) / 1000)) > 5) {
      const search3 = new ytcog.Search(session, {
        query: `${req.query.artist} ${req.query.title} audio`,
        period: 'any',
        quantity: 1
      });
  
      await search3.fetch();
  
      if (!search3.videos.length) {
        res.send("Error 0x03");
        return;
      }
      else {
        video = new ytcog.Video(session, {
          id: search3.videos[0].id
        });

        await video.fetch();
      }
    }

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