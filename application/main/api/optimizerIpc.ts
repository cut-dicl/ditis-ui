import { app, dialog, ipcMain } from "electron";
import {
  checkLocalOptimizer,
  checkOnlineOptimizer,
  deleteLocalOptimization,
  getLocalOptimizationList,
  getLocalOptimizerConfig,
  getLocalOptimizerData,
  getOnlineOptimizationList,
  getOnlineOptimizerData,
  refreshLocalOptimization,
  resyncLocalOptimizations,
  runOnlineOptimizer,
  runLocalOptimizer,
  saveLocalOptimizerConfig,
  deleteOnlineOptimization,
} from "../helpers/optimizer-manager";
import { parseCSV } from "../helpers/parse-csv";
import { killProccess } from "../helpers/util";
import { checkLocalSimulator, checkOnlineSimulator, deleteLocalSimulation, refreshLocalSimulator } from "../helpers/simulator-manager";
import axios from "axios";

export function optimizerIpc() {
  ipcMain.handle("run-optimizer", async (event, arg) => {
    try {
      if (arg.mode == "Online") {
        return await runOnlineOptimizer(arg);
      } else {
        return await runLocalOptimizer(arg);
      }
    } catch (err) {
      console.log(err);
      return { code: 500, data: null };
    }
  });

  ipcMain.handle("get-optimizer-csv-file", async (event, arg) => {
    try {
      if (arg.mode == "Online") {
        return await getOnlineOptimizerData(arg.address, arg.id, arg.auth);
      } else {
        return await getLocalOptimizerData(arg.id);
      }
    } catch (err) {
      return { code: 500, data: null, error: err.message };
    }
  });

  ipcMain.handle("get-optimizations-list", async (event, arg) => {
    try {
      if (arg.mode == "Online") {
        return await getOnlineOptimizationList(arg.address, arg.auth);
      } else {
        await resyncLocalOptimizations();
        return await getLocalOptimizationList();
      }
    } catch (err) {
      return { code: 500, data: null, error: err.message };
    }
  });

  ipcMain.handle("get-running-simulations", async (event, arg) => {
    try {
      if (arg.mode == "Online")
      {
        if(arg.simulationMode === "Simulator"){
          //
      }
        else if(arg.simulationMode === "Optimizer"){
          return await checkOnlineOptimizer(arg.address, arg.id, arg.auth);
        }
      }
      else {
        if(arg.simulationMode === "Simulator"){
            return await {code:200,data:checkLocalSimulator()};
        }
        else if(arg.simulationMode === "Optimizer"){
          return await checkLocalOptimizer();
        }
      }
    } catch (err) {
      console.log(err);
      return {code:500,msg:err};
    }
  });

  ipcMain.handle("get-optimizer-best-config", async (event, arg) => {
      try {
        if (arg.mode == "Online") {
          return await getOnlineOptimizerConfig(arg.serverAddress, arg.user, arg.id);
        } else {
            return await getLocalOptimizerConfig(arg.id,arg.javaPath);
        }
    } catch (err) {
      console.log(err);
      return { code: 500, data: null, error: err.message };
    }
  });
}

ipcMain.handle("save-optimizer-config", async (event, arg) => {
    try {
        if (arg.mode == "Online") {
            return await saveOnlineOptimizerConfig(arg.address, arg.user, arg.id, arg.config);
        } else {
            return await saveLocalOptimizerConfig(arg.id,
                arg.configName ? arg.configName : `Best of optimization ${arg.id}`,
                arg.configDescription ? arg.configDescription : `Best configuration of optimization ${arg.id}`);
        }
    } catch (err) {
        console.log(err);
        return { code: 500, data: null, error: err.message };
    }
});

ipcMain.handle("delete-optimization", async (event, arg) => {
    try {
        if (arg.mode == "Online") {
            return await deleteOnlineOptimization(arg.address, arg.auth, arg.id);
        } else {
            return await deleteLocalOptimization(arg.id);
        }
    } catch (err) {
        console.log(err);
        return { code: 500, data: null, error: err.message };
    }
});

ipcMain.handle("refresh-simulation", async (event, arg) => {
  try {
    if (arg.mode == "Online") {
      if(arg.simulationMode === "Simulator"){
        return await checkOnlineSimulator(arg.address,arg.id,arg.auth);
      }else if(arg.simulationMode === "Optimizer"){
        return await checkOnlineOptimizer(arg.address, arg.id, arg.auth);
      }
    } else {
      if(arg.simulationMode === "Simulator"){
        return await refreshLocalSimulator(arg.id)
      }else if(arg.simulationMode === "Optimizer"){
        return await refreshLocalOptimization(arg.id);
      }
    }
  } catch (err) {
    console.log(err);
    return { code: 500, data: null, error: err.message };
  }
});

ipcMain.handle("terminate-simulation", async (event, arg) => {
  const fs = require("fs");
  
  try {
    if (arg.mode == "Online") {
      if (arg.simulationMode === "Simulator") {
        //
      } else if (arg.simulationMode === "Optimizer") {
        console.log(arg);
        let res = await axios.post(`${arg.address}/api/optimizer/terminate`, {
          id: arg.id,
          auth: arg.auth,
        });
        if (res && res.status != 200)
          return { code: 500, data: null, error: res.data.message };
        return { code: 200, data: null };
      }
    } else {
      if (!(await killProccess(arg.id, arg.pid)))
        return { code: 500, data: null, error: "Process not found" };

        if(arg.simulationMode === "Simulator"){
          return await deleteLocalSimulation(arg.id,arg.name);
        }
        else 
          return await deleteLocalOptimization(arg.id);

    }
  } catch (err) {
    console.log(err);
    return {
      code: 500, data: null, error:
        (err.response && err.response.data && err.response.data.message ? err.response.data.message : err.message)
    };
  }
});

ipcMain.handle("fetch-optimizer-report", async (event, arg) => {
  try {
    const fs = require('fs');
    const filePath = app.getPath("userData") + `/optimizations/${arg.id}/optimizer_report.json`
    const reportString = fs.readFileSync(filePath, "utf8")
    const reportJson = JSON.parse(reportString)
    return { code: 200, data: reportJson }
  } catch (err) {
    return { code: 500, msg: err }
  }
});
