const server = require('express')();
const { app } = require('electron');
const path = require('path');
const tcpPortUsed = require('tcp-port-used');

exports.startServer = async (win, URLARGUMENTS) => {
  const appPath = app.getAppPath();
  server.use(require('express').static(path.join(appPath, "/output")));
  server.get('/', (_, res) => res.sendFile(path.join(appPath, `/output/app.html${URLARGUMENTS}`)));

  const inUse1 = await tcpPortUsed.check(42132);
  const inUse2 = await tcpPortUsed.check(41133);
  const inUse3 = await tcpPortUsed.check(40134);
  const inUse4 = await tcpPortUsed.check(39135);
  const inUse5 = await tcpPortUsed.check(38136);
  const inUse6 = await tcpPortUsed.check(37137);
  const inUse7 = await tcpPortUsed.check(36138);
  const inUse8 = await tcpPortUsed.check(35139);
  const inUse9 = await tcpPortUsed.check(34140);
  const inUse10 = await tcpPortUsed.check(33141);

  console.log(`inUse1: ${inUse1}`);
  console.log(`inUse2: ${inUse2}`);
  console.log(`inUse3: ${inUse3}`);
  console.log(`inUse4: ${inUse4}`);
  console.log(`inUse5: ${inUse5}`);
  console.log(`inUse6: ${inUse6}`);
  console.log(`inUse7: ${inUse7}`);
  console.log(`inUse8: ${inUse8}`);
  console.log(`inUse9: ${inUse9}`);
  console.log(`inUse10: ${inUse10}`);

  // Use any port that is not in use
  let thePort = 42132;
  if (inUse1) {
    thePort = 41133;
  }
  if (inUse2) {
    thePort = 40134;
  }
  if (inUse3) {
    thePort = 39135;
  }
  if (inUse4) {
    thePort = 38136;
  }
  if (inUse5) {
    thePort = 37137;
  }
  if (inUse6) {
    thePort = 36138;
  }
  if (inUse7) {
    thePort = 35139;
  }
  if (inUse8) {
    thePort = 34140;
  }
  if (inUse9) {
    thePort = 33141;
  }
  if (inUse10) {
    thePort = 0;
  }

  
  const instance = server.listen(thePort, () => {
    console.log('Server started on port ' + instance.address().port);
    win.loadURL('http://localhost:' + instance.address().port);
  });
}