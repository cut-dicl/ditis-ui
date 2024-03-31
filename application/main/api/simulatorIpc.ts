import { app, ipcMain } from "electron";
import { runSimulator } from "../service/simulator";
import {
  deleteLocalSimulation,
  runLocalSimulator,
  runOnlineSimulator,
} from "../helpers/simulator-manager";
import { traceAnalyzer } from "../helpers/trace-manager";
import axios from "axios";

export function simulatorIpc() {
  ipcMain.handle("run-simulator", async (event, arg) => {
    try {
      if (arg.mode === "Online") {
        return await runOnlineSimulator(arg);
      } else if (arg.mode === "Local") {
        return await runLocalSimulator(arg);
      }
    } catch (err) {
      return { code: 500, data: null, error: err };
    }
  });

  ipcMain.handle("fetch-report", async (event, arg) => {
    try {
      if (arg.mode === "Online") {
        let response;
        await axios
          .post(arg.address + "/api/simulator/fetch-report", {
            auth: arg.auth,
            id: arg.id,
          })
          .then((res) => {
            response = res;
          });
          
          return response.data
      } else if (arg.mode === "Local") {
        const fs = require("fs");
        const filePath =
          app.getPath("userData") +
          `/simulations/${arg.id}/report_${arg.id}.json`;
        const reportString = fs.readFileSync(filePath, "utf8");
        const reportJson = JSON.parse(reportString);
        return { code: 200, data: reportJson };
      }
    } catch (err) {
      return { code: 500, msg: err };
    }
  });

  ipcMain.handle("fetch-simulations-list", async (event, arg) => {
    try {
      console.log(arg)
      if (arg.mode === "Online") {
        let response;
        await axios
          .post(arg.address + "/api/simulator/fetch-simulations-list", {
            auth: arg.auth,
          })
          .then((res) => {
            if(res.status === 200)
              response = {code:200, data:res.data};
            else
              response = {code:500,error:res.data}
          });

          return response
      } else if (arg.mode === "Local") {
        const fs = require("fs");
        const filePath =
          app.getPath("userData") + "/simulations/simulations.json";
        const simulationsListString = fs.readFileSync(filePath, "utf8");
        const simulationsList = JSON.parse(simulationsListString);
        return { code: 200, data: simulationsList };
      }
    } catch (err) {
      return { code: 500, msg: err };
    }
  });

  ipcMain.handle("delete-simulation", async (event, arg) => {
    try{
      if (arg.mode === "Online") {
        console.log(arg)
        let response;
        await axios
          .post(arg.address + "/api/simulator/delete-simulation", {
            auth: arg.auth,
            id: arg.id,
          }).then((res) => {
            response = {code:200,data:res.data};
          });
          
          console.log(response)
          return response
      } else if (arg.mode === "Local") {
          return await deleteLocalSimulation(arg.id);}
    }catch (err) {
        return { code: 500, message: err };
      }
  });
}
