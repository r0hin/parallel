const server = require('express')();
const net = require('net');
const { app } = require('electron');
const path = require('path');

exports.startServer = async (win, URLARGUMENTS) => {
  const appPath = app.getAppPath();
  server.use(require('express').static(path.join(appPath, "/output")));
  server.get('/', (_, res) => res.sendFile(path.join(appPath, `/output/app.html${URLARGUMENTS}`)));

  let portToUse = 42132;

  if (await checkPortUsed(portToUse)) {
    portToUse = 41133;

    if (await checkPortUsed(portToUse)) {
      portToUse = 40134;

      if (await checkPortUsed(portToUse)) {
        portToUse = 39135

        if (await checkPortUsed(portToUse)) {
          portToUse = 38136

          if (await checkPortUsed(portToUse)) {
            portToUse = 37137

            if (await checkPortUsed(portToUse)) {
              portToUse = 36138

              if (await checkPortUsed(portToUse)) {
                portToUse = 35139

                if (await checkPortUsed(portToUse)) {
                  portToUse = 34140

                  if (await checkPortUsed(portToUse)) {
                    portToUse = 33141

                    if (await checkPortUsed(portToUse)) {
                      portToUse = 0
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  const instance = server.listen(portToUse, () => {
    console.log('Server started on port ' + instance.address().port);
    win.loadURL('http://localhost:' + instance.address().port);
  });
}

function checkPortUsed(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once('error', (err) => {
      server.close();
      resolve(true);
    });

    server.once('listening', () => {
      server.close();
      resolve(false);
    });

    server.listen(port);
  });
}