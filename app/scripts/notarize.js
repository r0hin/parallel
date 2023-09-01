require('dotenv').config();
const electron_notarize = require('electron-notarize');
const fs = require('fs');
const path = require('path');

module.exports = async function (params) {
  if (process.platform !== 'darwin') {
    return;
  }
  
  console.log('afterSign hook triggered', params);
  console.log('Notarizing...')
  console.log(process.env.APPLE_ID);
  console.log(process.env.APPLE_ID_PASSWORD);
  console.log(process.env.APPLE_TEAM_ID);

  let appId = 'net.parallelsocial.parallel';
  
  let appPath = path.join(params.appOutDir, `${params.packager.appInfo.productFilename}.app`);
  if (!fs.existsSync(appPath)) {
      console.log('skip');
      return;
  }

  console.log(`Notarizing ${appId} found at ${appPath}`);

  try {
    await electron_notarize.notarize({
      tool: "notarytool",
      appBundleId: appId,
      appPath: appPath,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID,
    });
  } catch (error) {
    console.error(error);
  }

  console.log(`Done notarizing ${appId}`);
}