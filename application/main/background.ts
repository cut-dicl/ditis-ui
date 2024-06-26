import { configurationIpc } from "./api/configurationFile";

const fs = require("fs");
import { Menu, app, ipcMain } from "electron";
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
  const isMac = process.platform === "darwin";

  const template = [
    // { role: 'appMenu' }
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: "about" },
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideOthers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" },
            ],
          },
        ]
      : []),
    // { role: 'fileMenu' }
    {
      label: "Application",
      submenu: [isMac ? { role: "close" } : { role: "quit" }],
    },
    // { role: 'editMenu' }
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        ...(isMac
          ? [
              { role: "pasteAndMatchStyle" },
              { role: "delete" },
              { role: "selectAll" },
              { type: "separator" },
              {
                label: "Speech",
                submenu: [{ role: "startSpeaking" }, { role: "stopSpeaking" }],
              },
            ]
          : [{ role: "delete" }, { type: "separator" }, { role: "selectAll" }]),
      ],
    },
    // { role: 'viewMenu' }
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
        ...(isProd? [] : [{ role: "toggleDevTools" }])
      ],
    },
    // { role: 'windowMenu' }
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        ...(isMac
          ? [
              { type: "separator" },
              { role: "front" },
              { type: "separator" },
              { role: "window" },
            ]
          : [{ role: "close" }]),
      ],
    },
    {
      role: "About",
      submenu: [
        {
          label: "Learn More about ditis",
          click: async () => {
            const { shell } = require("electron");
            await shell.openExternal(
              "https://dicl.cut.ac.cy/research/projects/smml"
            );
          },
        },
        {
          label: "Manual",
          click: async () => {
            let win = createWindow("manual", {
              width: 1000,
              height: 600,
              icon: "resources/icon.png",
              autoHideMenuBar: true,
            });
            win.loadFile('manual.pdf')
          }
        }
      ],
    },
  ];

  // @ts-ignore
  const menu = Menu.buildFromTemplate(template);
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
    autoHideMenuBar: true,
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
