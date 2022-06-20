const server = require('express')();
const { app } = require('electron');
const path = require('path');

exports.startServer = (win, URLARGUMENTS) => {
  const appPath = app.getAppPath();
  server.use(require('express').static(path.join(appPath, "/output")));
  server.get('/', (_, res) => res.sendFile(path.join(appPath, `/output/app.html${URLARGUMENTS}`)));
  const instance = server.listen(0, () => {
    console.log('Server started on port ' + instance.address().port);
    win.loadURL('http://localhost:' + instance.address().port);
  });
}