require('dotenv').config();
const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    appBundleId: 'com.twake.twake',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: "romaric.mollard@gmail.com",
    appleIdPassword: "cnxv-mvrk-oion-eoog", //À regénérer à chaque fois sur https://appleid.apple.com/account/manage dans mot de passe pour l'application
  });
};
