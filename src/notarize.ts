import { config } from "dotenv";
import { notarize } from "electron-notarize";

export default async function notarizing(context: any) {
  config();
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== "darwin") {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    appBundleId: "com.twake.twake",
    appPath: `${appOutDir}/${appName}.app`,
    ascProvider: process.env.APPLE_PROVIDER || "",
    appleId: process.env.APPLE_ID || "",
    appleIdPassword: process.env.APPLE_ID_PASSWORD || "", //À regénérer à chaque fois sur https://appleid.apple.com/account/manage dans mot de passe pour l'application
  });
}
