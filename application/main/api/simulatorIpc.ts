import { app, ipcMain } from "electron";
import { runSimulator } from "../service/simulator";
import {
  deleteLocalSimulation,
  runLocalSimulator,
  runOnlineSimulator,
} from "../helpers/simulator-manager";
import { traceAnalyzer } from "../helpers/trace-manager";
import axios from "axios";
import { getPreference } from "./preferences";

export function simulatorIpc() {
  ipcMain.handle("run-simulator", async (event, arg) => {
    try {
      let mode = getPreference("simulationPreference");
      if (mode === "Online") {
        return await runOnlineSimulator(arg);
      } else if (mode === "Local") {
        return await runLocalSimulator(arg);
      }
    } catch (err) {
      console.log(err)
      return { code: 500, data: null, error: err.message };
    }
  });

  ipcMain.handle("fetch-report", async (event, arg) => {
    try {
      let mode = getPreference("simulationPreference");
      let {address} = getPreference("onlineServer");
      if (mode === "Online") {
        let response = await axios
            .post(address + "/api/simulator/fetch-report", {
              id: arg.id,
            })

            if(response.status === 200){
              return response.data
            }else{
              throw new Error("Could not fetch report")
            }
      } else if (mode === "Local") {
        const fs = require("fs");
        const filePath =
          app.getPath("userData") +
          `/simulations/${arg.id}`;
        if (fs.existsSync(filePath + `/error.json`)) {
          const errorString = fs.readFileSync(filePath + `/error.json`, "utf8");
          const errorJson = JSON.parse(errorString);
          return { code: 500, data: null, error: errorJson.exception? errorJson.exception : errorJson};
        } 

        if (!fs.existsSync(filePath + `/report_${arg.id}.json`)) {
          return { code: 500, data: null, error: "No report exists for this simulation" };
        }
        const reportString = fs.readFileSync(filePath+`/report_${arg.id}.json`, "utf8");
        const reportJson = JSON.parse(reportString);
        return { code: 200, data: reportJson };
      }
    } catch (err) {
      return { code: 500, error: "Could not fetch report" };
    }
  });

  ipcMain.handle("fetch-simulations-list", async (event, arg) => {
    try {
      let mode = getPreference("simulationPreference");
      let {address} = getPreference("onlineServer");
      if (mode === "Online") {
        let response;
        await axios
          .post(address + "/api/simulator/fetch-simulations-list", {
          })
          .then((res) => {
            if(res.status === 200)
              response = {code:200, data:res.data};
            else
              response = {code:500,error:res.data}
          });

          return response
      } else if (mode === "Local") {
        const fs = require("fs");
        const filePath =
          app.getPath("userData") + "/simulations/simulations.json";
        const simulationsListString = fs.readFileSync(filePath, "utf8");
        const simulationsList = JSON.parse(simulationsListString);
        return { code: 200, data: simulationsList };
      }
    } catch (err) {
      return { code: 500, message: err.message };
    }
  });

  ipcMain.handle("delete-simulation", async (event, arg) => {
    try {
      let mode = getPreference("simulationPreference");
      let {address} = getPreference("onlineServer");
      if (mode === "Online") {
        let response;
        await axios
          .post(address + "/api/simulator/delete-simulation", {
            id: arg.id,
          }).then((res) => {
            response = {code:200,data:res.data};
          });
          
          return response
      } else if (mode === "Local") {
          return await deleteLocalSimulation(arg.id);}
    }catch (err) {
        return { code: 500, message: err };
      }
  });

  ipcMain.handle("fetch-sim-metadata",async(event,arg)=>{
    let mode = getPreference("simulationPreference");

    if (mode === "Online") {
      try {
        console.log("dame irta pantws")
        let { address } = getPreference("onlineServer");
        console.log(address)
        let response = await axios.get(address + "/api/simulator/metadata", { params: { id: arg.id } });
        console.log(response)
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
        const filePath = app.getPath("userData") + `/simulations/simulations.json`
        if (!fs.existsSync(filePath)) return { code: 500 }
        const metadataString = fs.readFileSync(filePath, "utf8")
        const metadataJson = (JSON.parse(metadataString)).simulations.find((sim) => sim.id === arg.id);
        return { code: 200, data: metadataJson }
      } catch (err) {
        return { code: 500, msg: err }
      }
      
    }
  })
}
