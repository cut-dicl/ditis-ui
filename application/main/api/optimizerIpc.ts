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
  refreshOnlineOptimization,
  saveOnlineOptimizerConfig,
  getOnlineOptimizerConfig,
} from "../helpers/optimizer-manager";
import { parseCSV } from "../helpers/parse-csv";
import { killProccess } from "../helpers/util";
import { checkLocalSimulator, refreshOnlineSimulator,checkOnlineSimulator, deleteLocalSimulation, refreshLocalSimulator } from "../helpers/simulator-manager";
import axios from "axios";
import { getPreference } from "./preferences";

export function optimizerIpc() {
  ipcMain.handle("run-optimizer", async (event, arg) => {
    try {
      let mode = getPreference("simulationPreference");
      if (mode === "Online") {
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
      let mode = getPreference("simulationPreference");
      if (mode == "Online") {
        return await getOnlineOptimizerData(arg.id);
      } else {
        return await getLocalOptimizerData(arg.id);
      }
    } catch (err) {
      console.log(err);
      return { code: 500, data: null, error: err.message };
    }
  });

  ipcMain.handle("download-optimizer-csv", async (event, arg) => {
    try {
      let mode = getPreference("simulationPreference");
      let {address} = getPreference("onlineServer");
      if (mode == "Online") {
        let res = await axios.post(`${address}/api/optimizer/download`, { id: arg.optID });
        if (res && res.status != 200)
          return { code: 500, data: null, error: res.data.message };

        //Get sent file
        const file = res.data;
        let path = await dialog.showSaveDialog({
          title: "Select location to store the report",
          defaultPath: app.getPath("downloads") + `/optimizer_${arg.optID}_report.csv`   
        })

        if (path.canceled)
          return { code: 418 };

        const fs = require("fs");
        fs.writeFileSync(path.filePath, file);
        return { code: 200, data: null };      
      } else {
        const fs = require("fs");
        const path = app.getPath("userData") + `/optimizations/${arg.optID}/final_report.csv`;
        if (!fs.existsSync) return { code: 500, data: null, error: "File not found" };

        let path2 = await dialog.showSaveDialog({ 
          title: "Select location to store the report",
          defaultPath: app.getPath("downloads") + `/optimizer_${arg.optID}_report.csv` 
        })
        
        if (path2.canceled)
          return { code: 418 };


        fs.copyFileSync(path, path2.filePath);
        return { code: 200, data: null };     
      }
    } catch (err) {
      return { code: 500, data: null, error: err.message };
    }
  });

  ipcMain.handle("get-optimizations-list", async (event, arg) => {
    try {
      let mode = getPreference("simulationPreference");

      if (mode == "Online") {
        return await getOnlineOptimizationList();
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
      let mode = await getPreference("simulationPreference");
      if (mode == "Online")
      {
        if(arg.simulationMode === "Simulator"){
          return await checkOnlineSimulator();
      }
        else if(arg.simulationMode === "Optimizer"){
          return await checkOnlineOptimizer();
        }
      }
      else {
        if(arg.simulationMode === "Simulator"){
            return {code:200,data: await checkLocalSimulator()};
        }
        else if(arg.simulationMode === "Optimizer"){
          return await checkLocalOptimizer();
        }
      }
    } catch (err) {
      console.log(err);
      return {code:500,message:err.message};
    }
  });

  ipcMain.handle("get-optimizer-best-config", async (event, arg) => {
    try {
        let mode = getPreference("simulationPreference");
        if (mode == "Online") {
          return await getOnlineOptimizerConfig(arg.id);
        } else {
            return await getLocalOptimizerConfig(arg.id);
        }
    } catch (err) {
      console.log(err);
      return { code: 500, data: null, error: err.message };
    }
  });

ipcMain.handle("save-optimizer-config", async (event, arg) => {
  try {
        let mode = getPreference("simulationPreference");
        if (mode == "Online") {
            return await saveOnlineOptimizerConfig(arg.id, arg.config);
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
    let mode = getPreference("simulationPreference");
    if (mode == "Online") {
      return await deleteOnlineOptimization(arg.id);
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
    let mode = getPreference("simulationPreference");
    if (mode == "Online") {
      if(arg.simulationMode === "Simulator"){
        return await refreshOnlineSimulator(arg.id);
      }else if(arg.simulationMode === "Optimizer"){
        return await refreshOnlineOptimization(arg.id);
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
    let mode = getPreference("simulationPreference");
    let {address} = getPreference("onlineServer");
    if (mode == "Online") {
      if (arg.simulationMode === "Simulator") {
        let res = await axios.post(`${address}/api/simulator/terminate`, {
          id: arg.id
        });
        if (res && res.status != 200)
          return { code: 500, data: null, error: res.data.message };
        return { code: 200, data: null };
      } else if (arg.simulationMode === "Optimizer") {
        let res = await axios.post(`${address}/api/optimizer/terminate`, {
          id: arg.id
        });
        if (res && res.status != 200)
          return { code: 500, data: null, error: res.data.message };
        return { code: 200, data: null };
      }
    } else {
      if (!(await killProccess(arg.id, arg.pid)))
        return { code: 500, data: null, error: "Process not found" };

        if(arg.simulationMode === "Simulator"){
          return await deleteLocalSimulation(arg.id);
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
    let mode = getPreference("simulationPreference");

    if(mode === "Online"){
      try{
        let {address} = getPreference("onlineServer");
        let response = await axios
            .post(address + "/api/optimizer/fetch-report", {
              id: arg.id,
            })

            if(response.status === 200){
              return response.data
            }else{
              throw new Error("Could not fetch report")
            }
      }catch(err){
        return { code: 500, msg: err.message,data:null }
      }
    }else if(mode === "Local"){
      try{
        const fs = require('fs');
        const filePath = app.getPath("userData") + `/optimizations/${arg.id}/optimizer_report.json`
        if (!fs.existsSync(filePath)) return { code: 500, msg: "File not found" }
        const reportString = fs.readFileSync(filePath, "utf8")
        const reportJson = JSON.parse(reportString)
        return { code: 200, data: reportJson }
      }catch(err){
        return { code: 500, msg: err }
      }
      
    }
});
  
  ipcMain.handle("get-optimizer-metadata", async (event, arg) => {
    let mode = getPreference("simulationPreference");

    if (mode === "Online") {
      try {
        let { address } = getPreference("onlineServer");
        let response = await axios.get(address + "/api/optimizer/metadata", { params: { id: arg.id } });

        if (response.status === 200) {
          return { code: 200, data: response.data }
        } else {
          throw new Error("Could not fetch metadata")
        }
      } catch (err) {
        return { code: 500, msg: err.message, data: null }
      }
    } else if (mode === "Local") {
      try {
        const fs = require('fs');
        const filePath = app.getPath("userData") + `/optimizations/optimizations.json`
        if (!fs.existsSync(filePath)) return { code: 500 }
        const metadataString = fs.readFileSync(filePath, "utf8")
        const metadataJson = (JSON.parse(metadataString)).optimizations.find((opt) => opt.id === arg.id);
        return { code: 200, data: metadataJson }
      } catch (err) {
        return { code: 500, msg: err }
      }
      
    }
  }); 
}

