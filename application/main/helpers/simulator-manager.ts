import { app } from "electron";
import { runSimulator } from "../service/simulator";
import axios from "axios";
import { getTraceExtension } from "./trace-manager";

const fs = require("fs");

export async function checkOnlineSimulator(address,id,auth){
  let res = await axios.post(`${address}/api/simulator/check`, { id, auth }).then((res) => {
    return res;
});
return { code: 200, data: res.data};
}

export async function refreshLocalSimulator(id) {
  const path = app.getPath("userData") + "/simulations";
  const json = fs.readFileSync(path + "/simulations.json");
  const simulations = JSON.parse(json);

  //Check if files are in the json
  if (simulations.simulations.findIndex((opt) => opt.id === id) === -1) {
    return { code: 500, data: null, error: "Simulation not found" };
  }
  let obj =
    simulations.simulations[
      simulations.simulations.findIndex((o) => o.id === id)
    ];

  //Check pid status
  if (obj.pid > 0) {
    try {
      if (process.kill(obj.pid, 0))
        return { code: 200, data: { id: id, pid: obj.pid, date: obj.date } };
    } catch (err) {
      obj.pid = 0;
      fs.writeFileSync(path + "/simulations.json", JSON.stringify(simulations));
      return { code: 200, data: { id: id, pid: 0, date: obj.date } };
    }
  }
  return;
}

export async function checkLocalSimulator() {
  const path = app.getPath("userData") + "/simulations";
  const json = fs.readFileSync(path + "/simulations.json");
  const simulations = JSON.parse(json);
  if (simulations.simulations.length === 0) return { code: 200, data: [] };
  const running = simulations.simulations.filter((opt) => opt.pid > 0);
  if (running.length === 0) return { code: 200, data: [] };

  fs.writeFileSync(path + "/simulations.json", JSON.stringify(simulations));
  return { code: 200, data: running };
}

export async function deleteLocalSimulation(id) {
  let path = app.getPath("userData") + "/simulations/" + id;
  //Check if directory exists and we have access, if yes then delete
  fs.access(path, (err) => {
    if (err) {
      console.log(err);
      throw new Error("Error accessing file");
    }
    fs.rm(path, { recursive: true }, (err) => {
      if (err) {
        console.log(err);
        throw new Error("Error deleting file");
      }
    });
  });

  //Remove from json
  const json = fs.readFileSync(
    app.getPath("userData") + "/simulations/simulations.json"
  );
  const simulations = JSON.parse(json);
  simulations.simulations = simulations.simulations.filter(
    (opt: any) => opt.id !== id
  );
  fs.writeFileSync(
    app.getPath("userData") + "/simulations/simulations.json",
    JSON.stringify(simulations)
  );
  return { code: 200, data: null, message: "Simulation deleted successfully" };
}

export async function runOnlineSimulator(arg) {
  try {
    console.log(arg);
    let res = await axios
      .post(arg.serverAddress + "/api/simulator/run", {
        params: {
          trace: arg.trace,
          configuration: arg.configuration,
          maxEvents: arg.maxEvents,
          areMLFilesEnabled: arg.areMLFilesEnabled,
          name: arg.name,
          auth: arg.auth,
          maxMemory: arg.maxMemory,
        },
      })
      .then((res) => {
        return res;
      });
    return { code: 200, data: res.data };
  } catch (err) {
    console.log(err.response);
    return { code: 500, data: -1, error: err.response.data.message };
  }
}

interface localSimulatorProps {
  javaPath: string;
  configuration: string;
  trace: string;
  maxEvents: number;
  areMLFilesEnabled: boolean;
  maxMemory: number;
  name: string;
}

export async function runLocalSimulator(arg: localSimulatorProps) {
  const fs = require("fs");

  const json = fs.readFileSync(
    app.getPath("userData") + "/simulations/simulations.json"
  );
  const simulations = JSON.parse(json);
  let id = 1;
  if (simulations.simulations.length > 0) {
    id = simulations.simulations[simulations.simulations.length - 1].id + 1;
  }

  const path = app.getPath("userData") + `/simulations/${id}`;

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }

  console.log(arg.javaPath);
  const configuration =
    arg.configuration === "Default Storage Configuration"
      ? arg.javaPath.replace("ditis-service-2.0-SNAPSHOT.jar", "") +
        "conf/storage.properties"
      : app.getPath("userData") +
        `/configurations/${arg.configuration}.properties`;
  const trace = app.getPath("userData") + `/traces/${arg.trace + await getTraceExtension(arg.trace)}`;

  const childJavaProcess = await runSimulator(
    trace,
    configuration,
    path,
    arg.maxEvents,
    arg.areMLFilesEnabled,
    arg.javaPath,
    arg.maxMemory
  );
  if (
    childJavaProcess === -1 ||
    childJavaProcess === undefined ||
    childJavaProcess === 0
  ) {
    throw new Error("Error running simulator. Please try again.");
  }

  simulations.simulations.push({
    id: id,
    name: arg.name ? arg.name : "Simulation " + id,
    date: Date.now(),
    trace: arg.trace,
    configuration: arg.configuration,
    path: path,
    pid: childJavaProcess,
    areMLFilesEnabled: arg.areMLFilesEnabled,
  });

  fs.writeFileSync(
    app.getPath("userData") + "/simulations/simulations.json",
    JSON.stringify(simulations)
  );

  return {
    code: 200,
    data: {
      id,
      pid: childJavaProcess,
      name: arg.name ? arg.name : "Simulation " + id,
    },
  };
}
