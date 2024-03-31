const express = require("express");
const app = express();
const fs = require("fs");
const { checkAuth, getSimulationID } = require("../util/userUtil");
const { runSimulator } = require("../service/simulator");

app.post("/run", async (req, res) => {
  try {
    let javaPath = process.env.JAVA_PATH;
    let storagePath = process.env.STORAGE_PATH;
    const { trace, configuration, maxEvents, areMLFilesEnabled, name, auth } =
      req.body.params;
    const user = checkAuth(auth);
    if (typeof user === "undefined") return res.sendStatus(401);

    const configurationPath =
      configuration === "Default Storage Configuration"
        ? javaPath + "/../conf/storage.properties"
        : storagePath +
          `/userdata/${user}/configurations/` +
          `${configuration}.properties`;
    const tracePath =
      storagePath + `/userdata/${user}/traces/${trace}.txt`;

    const simID = getSimulationID(user);
    if (simID < 0) {
      return res.sendStatus(500);
    }
    const path = storagePath + `/userdata/${user}/simulations/`;

    const pid = await runSimulator(
      tracePath,
      configurationPath,
      path + simID,
      maxEvents,
      areMLFilesEnabled,
      process.env.JAVA_PATH
    );

    if (pid < 0) {
      return res.sendStatus(500);
    }

    let simulations = fs.readFileSync(path + "simulations.json", "utf-8");
    if (simulations.length === 0) simulations = { simulations: [] };
    else simulations = JSON.parse(simulations);

    simulations.simulations.push({
      id: simID,
      name: name ? name : "Simulation " + simID,
      date: Date.now(),
      trace: trace,
      configuration: configuration,
      path: path + simID,
      pid,
      areMLFilesEnabled: areMLFilesEnabled,
    });

    fs.writeFileSync(path + "simulations.json", JSON.stringify(simulations));

    res.status(200).send({ id: simID, pid, name: name ? name : "Simulation " + simID });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: err });
  }
});

module.exports = app;
