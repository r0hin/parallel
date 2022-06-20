const app = require('express')();
const request = require('request');
var cors = require('cors')
const ytcog = require('ytcog')
const links = require('./link');
let session = null;

app.use(cors({credentials: true, origin: true}));

exports.startServer = (win) => {
  const server = app.listen(0, async () => {
    links.sendServerPort(win, server.address().port);
    console.log('Server started on port ' + server.address().port);

    // Start session
    // const session = new ytcog.Session(cookies.cookie, cookies['user-agent']);
    session = new ytcog.Session();
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
      id: search.videos[0].id
    });

    await video.fetch();

    if (!video.audioStreams.length) res.send("Error 0x02");

    const streams = video.audioStreams.sort((a, b) => {return a.size - b.size});
  
    if (!streams.length) res.send("Error 0x03");
  
    function encode(n){for(var r="0x",t=n.length,e=0;e<t;e++)r+=n.charCodeAt(e).toString(16);return r}
  
    res.json({
      url: encode(streams[streams.length - 1].url),
    });

    return;
  });
} 