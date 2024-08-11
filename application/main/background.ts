import { configurationIpc } from "./api/configurationFile";
import path from 'path'
import { Menu, app} from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import { traceIpc } from "./api/traceIpc";
import { getPreference, preferencesIpc } from "./api/preferences";
import { configurationManager } from "./helpers/configuration-manager";
import { optimizerIpc } from "./api/optimizerIpc";
import { simulatorIpc } from "./api/simulatorIpc";
import {
  integrityVerification,
  disableAcceleration,
} from "./helpers/create-files";
import { handleAxiosAuth, serverIpc } from "./api/serverIpc";
import { genericIpc } from "./api/genericIpc";
import { getToolbar } from "./toolbar";

const isProd: boolean = process.env.NODE_ENV === "production";

const unhandled = require("electron-unhandled");

unhandled();

traceIpc();
preferencesIpc();
configurationIpc();
configurationManager();
optimizerIpc();
simulatorIpc();
serverIpc();
genericIpc();

(async () => {

  // @ts-ignore
  const menu = Menu.buildFromTemplate(getToolbar());
  Menu.setApplicationMenu(menu);

  if (isProd) {
    serve({ directory: "app" });
  } else {
    app.setPath("userData", `${app.getPath("userData")}(development)`);
  }
  
  if (disableAcceleration()) {
    app.disableHardwareAcceleration();
  }

  await app.whenReady();

  let integrity = await integrityVerification();

  const splash = createWindow("splash", {
    width: 600,
    height: 320,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
  });
  await splash.loadFile("splash.html");
  splash.center();

  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
    show: false,
    icon: "resources/icon.png",
    autoHideMenuBar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isProd) {
    await mainWindow.loadURL("app://./index.html");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/`);
    //mainWindow.webContents.openDevTools();
  }
  await handleAxiosAuth(getPreference("onlineServer").auth? getPreference("onlineServer").auth : "");

  splash.close();
  mainWindow.show();
  mainWindow.maximize();
})();

app.on("window-all-closed", () => {
  app.quit();
});
