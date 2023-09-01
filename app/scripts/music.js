const app = require('express')();
const request = require('request');
var cors = require('cors')
const ytcog = require('ytcog')
const links = require('./link');
let session = null;

app.use(cors({credentials: true, origin: true}));

const cookiee = "VISITOR_INFO1_LIVE=c1oiABcBzA4; yt-dev.storage-integrity=true; LOGIN_INFO=AFmmF2swRAIgCzICK9QnrZYS9m0KF_1y01wBdS829xFQN4C544k3920CIGvVHZg2v7BIeLavYoy5D9eSQ6XH5h2jqklsQSHFXV9u:QUQ3MjNmd0FQXzQwRXhGRF82bHJoV0FTV3B1OTlCNkprRWtWQjh2MWt0eFh0SWtYcFZLTDJJa051eE9DNzMyakJuY3RXb1I2cFk3dnNXYkhLeVMxZUY0MGNRbGl1UVoxUWQ5REVweDBBWDNOU3RyQW1ibHR2RFJXaW9iR3V2YU5Cc0NPdlY3YmE5S2MxdndzelRmOTJyRXBmeVZqTWp5TGNR; NID=511=hlhjL7m6WBH0TdUZxrrdI8i0s2kIrkZqY8RDZF4YxIUBdVUKldaISsrUcAH20xAql0gqccnQ3FMa5W6KUbv3aLUPTTXmtzS-XiMPY_9V3186mgig5J59aw04HEd6IhGvni4CU_K_Pw4KUSnFCw5XoQ-bpIc7-0k3nJ9kqXwuvNw; HSID=AGDhjxleD5jEEk1-W; SSID=A3kCZchcjMzL7x8x_; APISID=31KwA5V49ysQ_eq9/A5dJKcYv1WY2TisVE; SAPISID=6UOkcEWo9MDSN40C/A7CRyEaPnPcZDS1TK; __Secure-1PAPISID=6UOkcEWo9MDSN40C/A7CRyEaPnPcZDS1TK; __Secure-3PAPISID=6UOkcEWo9MDSN40C/A7CRyEaPnPcZDS1TK; PREF=tz=America.New_York&f6=40080000&f3=10&f7=1&f5=20000; SID=NgiD1cDeBY-SE2vMYyMOFa-rgot07uxADNmpQyiwKoSyRp2KlbVElZ4RYM1POx8ityOmoA.; __Secure-1PSID=NgiD1cDeBY-SE2vMYyMOFa-rgot07uxADNmpQyiwKoSyRp2KzkvxMkon7RsjedB2nRZZzQ.; __Secure-3PSID=NgiD1cDeBY-SE2vMYyMOFa-rgot07uxADNmpQyiwKoSyRp2KgYl3LphvmvjY4rd-TO148w.; YSC=rblKOgJPpyk; SIDCC=AEf-XMR8VxLnKueaAcq_C5CFidZdnf2rRVyHfE8AF22lLF7zH-ZfKHwUUzypeLSBtSKrhKPMXcDq; __Secure-1PSIDCC=AEf-XMRaDdrCYYj0OsBUZdygwWbIRlnGunwsECMccropGZ_CPuiO1artQdKLBZWU1BTzcY1rwu8; __Secure-3PSIDCC=AEf-XMQxw6hZNUxY6EmiiAxGagSH4JEO_dfZjUI02XiewMeoYPLDnIwbqv8RBPuMYHGPGGAZ3wE";

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
      console.log("Switching to backup option.")
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
      console.log(video.streamInfo)
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