require('dotenv').config();
const { notarize } = require('electron-notarize');


exports.default = async function(context) {
  const { appOutDir } = context;  

  // If on macos
  if (process.platform !== 'darwin') {
    console.log("No notorization required on this platform.");
    return;
  }

  console.log('Notarizing...')
  console.log(process.env.APPLE_ID);
  console.log(process.env.APPLE_ID_PASSWORD);
  console.log(process.env.APPLE_TEAM_ID);
  try {
    const value = await notarize({
      tool: "notarytool",
      appPath: `${appOutDir}/${context.packager.appInfo.productFilename}.app`,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID,
    });

    console.log('Notarization complete!')
    console.log(value);
  } catch (err) {
    console.log('Notorize Error');
    console.log(err);
  }
}