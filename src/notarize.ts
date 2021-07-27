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
    appleId: "",
    appleIdPassword: "", // To be regenerated each time on https://appleid.apple.com/account/manage in password for the application section
  });
}
