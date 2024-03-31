import { configurationIpc } from "./api/configurationFile";

const fs = require("fs");
import { app, ipcMain } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import { traceIpc } from "./api/traceIpc";
import { preferencesIpc } from "./api/preferences";
import { configurationManager } from "./helpers/configuration-manager";
import { optimizerIpc } from "./api/optimizerIpc";
import {simulatorIpc} from "./api/simulatorIpc";
import { createTraces, createConfigurations, createOptimizations, createPreferences,createSimulations } from "./helpers/create-files";
import { serverIpc } from "./api/serverIpc";
import { genericIpc } from "./api/genericIpc";

const isProd: boolean = process.env.NODE_ENV === "production";

const unhandled = require('electron-unhandled');

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

  if (isProd) {
    serve({ directory: "app" });
  } else {
    app.setPath("userData", `${app.getPath("userData")}(development)`);
  }
  if (fs.existsSync(app.getPath("userData") + "/acceleration.txt") === false) {
    fs.writeFileSync(app.getPath("userData") + "/acceleration.txt", "false");
  } else {
    const disableHardwareAcceleration = fs.readFileSync(app.getPath("userData") + "/acceleration.txt", "utf8");
    if (disableHardwareAcceleration === "true") {
      app.disableHardwareAcceleration();
    }
  }

  await app.whenReady();

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
  
  
  
  
  //Check if preferences file exists, if not create
  if (!fs.existsSync(app.getPath("userData") + "/preferences.json")) {
    createPreferences();
  }
  
  //Check if optimizations folder exists, if not create
  if (!fs.existsSync(app.getPath("userData") + "/optimizations")) {
    createOptimizations();
  }

  //Check if configurations folder exists,if not create
  if(!fs.existsSync(app.getPath("userData") + "/configurations")){
    createConfigurations();
  }

  //Check if traces folder exists, if not create
  if(!fs.existsSync(app.getPath("userData") + "/traces")){
    createTraces();
  }

  if(!fs.existsSync(app.getPath("userData") + "/simulations")){
    createSimulations()
  }


  if (isProd) {
    await mainWindow.loadURL("app://./index.html");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/`);
    //mainWindow.webContents.openDevTools();
  }
  splash.close();
  mainWindow.show();
  mainWindow.maximize();


})();


app.on("window-all-closed", () => {
  app.quit();
});
