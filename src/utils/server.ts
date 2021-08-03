import StoreService from "../services/store/service";
import os from "os";
import url from "url";
import path from "path";

/**
 * Get protocol
 */
export const getProtocol = () => StoreService.get("twake_protocol") || "https";

/**
 * Get domain
 */
export const getDomain = () =>
  StoreService.get("twake_domain") || "web.twake.app";

/**
 * Get current os
 * @returns "aix" | "android" | "darwin" | "freebsd" | "linux" | "openbsd" | "sunos" | "win32" | "cygwin" | "netbsd"
 */
export const getCurrentOS = (): NodeJS.Platform => os.platform();

export const getUrlFormat = (domain: string, protocol: string): string =>
  url.format({
    pathname: `//${domain}`,
    protocol: `${protocol}:`,
    slashes: true,
    hash: "/",
  });

/**
 * Get icon path
 * @param dir string
 * @param iconPath string
 */
export const getIconPath = (dir: string, iconPath: string) =>
  path.join(dir, iconPath);
