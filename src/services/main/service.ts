import electron, {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  ipcMain,
  Menu,
  shell,
} from "electron";
import url from "url";
import path from "path";
import prompt from "electron-prompt";
import StoreService from "../store/service";
import electronLocalshortcut from "electron-localshortcut";
import { Event, Size } from "electron/main";
import {
  getCurrentOS,
  getDomain,
  getIconPath,
  getProtocol,
  getUrlFormat,
} from "../../utils/server";
import { DomainType, ProtocolType, Template } from "./types";
import { download } from "electron-dl";

type CustomBrowserWindowEntriesType = {
  config_disable_buttons?: boolean;
  config_disable_move?: boolean;
  config_button_space?: boolean;
};

/**
 * Main service of the app
 * 1. Import the file
 * 2. Call the init method
 */
class MainService {
  protocol: ProtocolType;
  domain: DomainType;
  currentWindow?: BrowserWindow & CustomBrowserWindowEntriesType;

  constructor() {
    this.protocol = getProtocol();
    this.domain = getDomain();
  }

  public init() {
    app.on("ready", this.onReady);
  }

  private changeServer = () => {
    prompt({
      title: "Change server url",
      label: "URL:",
      value: `${this.protocol}://${this.domain}`,
      inputAttrs: {
        type: "url",
      },
    })
      .then((r) => {
        if (r !== null) {
          const data = r.split("://");
          if (data.length === 1) {
            this.protocol = "https";
            this.domain = data;
          } else {
            this.protocol = data[0];
            this.domain = data[1];
          }
          this.domain = this.domain.split("/");
          this.domain = this.domain[0];

          StoreService.set("twake_domain", this.domain);
          StoreService.set("twake_protocol", this.protocol);

          app.relaunch();
          app.exit();
        }
      })
      .catch(console.error);
  };

  /**
   * Create window
   */
  private createWindow() {
    const mainScreen = electron.screen.getPrimaryDisplay();
    const mainScreenSize = mainScreen.size;

    const template = this.getMenuTemplate();
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    const data = this.getBrowserWindowConstructorOptions(mainScreenSize);

    console.log(data);

    switch (getCurrentOS()) {
      case "darwin":
        data.frame = false;
        data.titleBarStyle = "hidden";
        data.icon = getIconPath(
          __dirname,
          "../../../static/icons/mac/icon.icns"
        );
      case "win32":
        data.icon = getIconPath(
          __dirname,
          "../../../static/icons/win/icon.ico"
        );
      case "linux":
      default:
        data.icon = getIconPath(
          __dirname,
          "../../../static/icons/png/512x512.png"
        );
    }

    if (this.currentWindow) {
      this.currentWindow.config_disable_buttons = true;
      this.setConfigDisableMove(true);
      this.currentWindow.config_button_space = false;

      if (getCurrentOS() === "darwin") {
        this.setConfigDisableMove(false);
        this.currentWindow.config_button_space = true;
      } else {
        this.currentWindow.setMenu(null);
      }
    }
    this.setCurrentWindow(data);

    this.showWindow();

    if (getCurrentOS() != "darwin" && this.currentWindow) {
      electronLocalshortcut.register(
        this.currentWindow,
        "CmdOrCtrl+Alt+Shift+S",
        () => this.changeServer()
      );
    }

    this.currentWindow?.setTitle("Twake");

    this.currentWindow?.setBackgroundColor("#1452F4");

    this.currentWindow?.loadURL(getUrlFormat(this.domain, this.protocol));

    this.currentWindow?.webContents.on("did-fail-load", this.onDidFailLoad);

    this.currentWindow?.on("closed", this.onClosed);

    this.currentWindow?.webContents.on("new-window", this.onNewWindow);
  }

  private getMenuTemplate = (): Template => [
    {
      label: "Twake",
      submenu: [
        {
          label: "About",
          selector: "orderFrontStandardAboutPanel:",
          click: () => shell.openExternal("https://twake.app/en/"),
        },
        { type: "separator" },
        {
          label: "Close",
          accelerator: "CmdOrCtrl+Q",
          click: app.quit,
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        {
          label: "Redo",
          accelerator: "CmdOrCtrl+Shift+Z",
          selector: "redo:",
        },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        {
          label: "Select All",
          accelerator: "CmdOrCtrl+A",
          selector: "selectAll:",
        },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Reload application",
          accelerator: "CmdOrCtrl+R",
          click: this.currentWindow?.reload,
        },
        {
          label: "Change server",
          accelerator: "CmdOrCtrl+Alt+Shift+S",
          click: this.changeServer,
        },
        {
          label: "Open developer tools",
          accelerator: "CmdOrCtrl+Alt+I",
          click: () => this.currentWindow?.webContents.openDevTools(),
        },
      ],
    },
  ];

  /**
   * Get browser window constructor options
   * @param mainScreenSize Size
   */
  private getBrowserWindowConstructorOptions(
    mainScreenSize: Size
  ): BrowserWindowConstructorOptions {
    return {
      show: false,
      width: Math.ceil(mainScreenSize.width * 0.8),
      height: Math.ceil(mainScreenSize.height * 0.8),
      frame: true,
      title: "Twake",
      transparent: false,
      titleBarStyle: "customButtonsOnHover",
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    };
  }

  private onReady = (): void => {
    getCurrentOS() === "win32" && app.setAppUserModelId("com.twake.twakeapp");

    this.createWindow();

    ipcMain.on("application:update_badge", (event, arg) => {
      app.setBadgeCount(parseInt(arg));
    });
  };

  /**
   * Set current window
   * @param data BrowserWindowConstructorOptions
   */
  private setCurrentWindow(data: BrowserWindowConstructorOptions): void {
    this.currentWindow = new BrowserWindow(data);
  }

  /**
   * Set config disable move
   * @param bool
   */
  private setConfigDisableMove = (bool: boolean) =>
    this.currentWindow && (this.currentWindow.config_disable_move = bool);

  private onDidFailLoad = (): void => {
    console.log("did-fail-load");
    setTimeout(() => {
      this.currentWindow?.loadURL(getUrlFormat(this.domain, this.protocol));
    }, 1000);
  };

  private onClosed = () => getCurrentOS() !== "darwin" && app.quit();

  /**
   * On new window event
   * @param e Event
   * @param url string
   */
  private onNewWindow(event: Event, url: string): void {
    event.preventDefault();
    if (
      !(
        url.indexOf("download=1") > 0 &&
        url.indexOf(`${this.protocol}://${this.domain}/ajax/`) == 0
      )
    ) {
      shell.openExternal(url);
    } else {
      download(BrowserWindow.getFocusedWindow() as BrowserWindow, url, {
        saveAs: true,
        showBadge: false,
      })
        .then((dl) => console.log(dl.getSavePath()))
        .catch(console.error);
    }
  }

  private showWindow(): void {
    this.currentWindow?.show();
  }
}

export default new MainService();
