import { app, BrowserWindow, Menu, shell } from "electron";
import electron from "electron";
import path from "path";
import url from "url";
import { download } from "electron-dl";
import os from "os";
import Store from "electron-store";
import prompt from "electron-prompt";
import electronLocalshortcut from "electron-localshortcut";
import { autoUpdater } from "electron-updater";

const store = new Store();

var domain: any = store.get("twake_domain");
var protocol: any = store.get("twake_protocol");
if (!domain) {
  domain = "web.twake.app";
}
if (!protocol) {
  protocol = "https";
}

var changeServer = function () {
  prompt({
    title: "Change server url",
    label: "URL:",
    value: protocol + "://" + domain,
    inputAttrs: {
      type: "url",
    },
  })
    .then((r) => {
      if (r === null) {
        console.log("user cancelled");
      } else {
        var data = r.split("://");
        if (data.length == 1) {
          protocol = "https";
          domain = data;
        } else {
          protocol = data[0];
          domain = data[1];
        }
        domain = domain.split("/");
        domain = domain[0];

        store.set("twake_domain", domain);
        store.set("twake_protocol", protocol);

        app.relaunch();
        app.exit();
      }
    })
    .catch(console.error);
};

var template: any = [
  {
    label: "Twake",
    submenu: [
      { label: "About Twake", selector: "orderFrontStandardAboutPanel:" },
      { type: "separator" },
      {
        label: "Quit",
        accelerator: "Command+Q",
        click: function () {
          app.quit();
        },
      },
    ],
  },
  {
    label: "Edit",
    submenu: [
      { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
      { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
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
        label: "Reload",
        accelerator: "CmdOrCtrl+R",
        click: function () {
          win.reload();
        },
      },
      {
        label: "Change server",
        accelerator: "CommandOrControl+alt+shift+S",
        click: function () {
          changeServer();
        },
      },
      {
        label: "Open developers tools",
        accelerator: "CmdOrCtrl+Alt+I",
        click: function () {
          win.webContents.openDevTools();
        },
      },
    ],
  },
];

var winUpdater: any;
var win: any;
app.on("ready", function () {
  if (os.platform() === "win32") {
    app.setAppUserModelId("com.twake.twakeapp");
  }
  createWindow();
  // autoUpdater.logger = require("electron-log")
  // autoUpdater.logger.transports.file.level = "info"
  // autoUpdater.checkForUpdates();
});

function sendStatusToWindow(text: string, e: any) {
  console.log("1.2.50 update : " + text);
  winUpdater.webContents.send("update", text, e);
}
autoUpdater.on("checking-for-update", (e) => {
  sendStatusToWindow("checking-for-update", e);
});
autoUpdater.on("update-available", (e, info) => {
  sendStatusToWindow("update-available", e);
});
autoUpdater.on("update-not-available", (e, info) => {
  sendStatusToWindow("update-not-available", e);
  createWindow();
});
autoUpdater.on("error", (ev, err) => {
  sendStatusToWindow("error", err);
  createWindow();
});
autoUpdater.on("download-progress", (ev) => {
  sendStatusToWindow("download-progress", ev);
});
autoUpdater.on("update-downloaded", (e, info) => {
  sendStatusToWindow("update-downloaded", e);
  setTimeout(function () {
    autoUpdater.quitAndInstall();
  }, 5000);
});

function createWindow() {
  var mainScreen = electron.screen.getPrimaryDisplay();
  var screenDimensions = mainScreen.size;

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  var data: any = {
    show: false,
    width: screenDimensions.width * 0.8,
    height: screenDimensions.height * 0.8,
    frame: true,
    title: "Twake",
    transparent: false,
    toolbar: false,
    titleBarStyle: "customButtonsOnHover",
    icon: "public/icons/png/64x64.png",
  };

  if (os.platform() == "darwin") {
    data.frame = false;
    data.titleBarStyle = "hidden";
  }

  win = new BrowserWindow(data);
  //setupScreenSharingForWindow(win);

  win.config_disable_buttons = true;
  win.config_disable_move = true;
  win.config_button_space = false;
  if (os.platform() == "darwin") {
    win.config_disable_move = false;
    win.config_button_space = true;
  } else {
    win.setMenu(null);
  }

  //win.maximize()
  win.show();

  if (os.platform() != "darwin") {
    electronLocalshortcut.register(win, "CommandOrControl+alt+shift+S", () => {
      changeServer();
    });
  }

  win.setTitle("Twake");

  // and load the index.html of the app.
  win.loadURL(
    url.format({
      pathname: "//" + domain,
      protocol: protocol + ":",
      slashes: true,
      hash: "/",
    })
  );

  win.webContents.on("did-fail-load", function () {
    console.log("did-fail-load");
    setTimeout(() => {
      win.loadURL(
        url.format({
          pathname: "//" + domain,
          protocol: protocol + ":",
          slashes: true,
          hash: "/",
        })
      );
    }, 1000);
  });

  win.on("closed", function () {
    if (os.platform() != "darwin") {
      app.quit();
    }
  });

  //win.webContents.openDevTools()

  win.webContents.on("new-window", function (event: any, url: any) {
    event.preventDefault();
    if (
      !(
        url.indexOf("download=1") > 0 &&
        url.indexOf(protocol + "://" + domain + "/ajax/") == 0
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
  });
  if (winUpdater != null) {
    winUpdater.close();
  }
}

function createWindowUpdater() {
  // Créer le browser window.
  winUpdater = new BrowserWindow({
    width: 400,
    height: 140,
  });
  // winUpdater.webContents.openDevTools()

  // et charge le index.html de l'application.
  winUpdater.loadFile("./version.html");

  // Émit lorsque la fenêtre est fermée.
  winUpdater.on("closed", () => {
    // Dé-référence l'objet window , normalement, vous stockeriez les fenêtres
    // dans un tableau si votre application supporte le multi-fenêtre. C'est le moment
    // où vous devez supprimer l'élément correspondant.
    winUpdater = null;
  });
}
