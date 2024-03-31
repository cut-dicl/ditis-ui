const express = require("express");
const app = express();
const fs = require("fs");
const { runOptimizer } = require("../service/optimizer");
const { checkAuth } = require("../util/userUtil");
const { deleteOptimization } = require("../util/optimizerUtil");
const { getOptimizationID } = require("../util/userUtil");
const { parseCSV } = require("../util/parse-csv");
const { logging, killProcess } = require("../util/util");

app.post("/run", async function (req, res) {
    try {
        const data = req.body;
        const user = checkAuth(data.auth);
        if (typeof user === "undefined")
            return res.sendStatus(401);

        const id = getOptimizationID(user);
        if (id < 0)
            return res.sendStatus(500);
        const path = process.env.STORAGE_PATH + `/userdata/${user}/optimizations/`

        let trace = process.env.STORAGE_PATH + `/userdata/${user}/traces/` + data.trace;
        let configuration = data.configuration;
        if (configuration.optimizer !== "Default Optimizer Configuration") {
            configuration.optimizer = process.env.STORAGE_PATH + `/userdata/${user}/configurations/` + configuration.optimizer;
        }
        if (configuration.storage !== "Default Storage Configuration") {
            configuration.storage = process.env.STORAGE_PATH + `/userdata/${user}/configurations/` + configuration.storage;
        }
        if (configuration.variance !== "Default Variance Configuration") {
            configuration.variance = process.env.STORAGE_PATH + `/userdata/${user}/configurations/` + configuration.variance;
        }


        //TODO: FIX
        const pid = await runOptimizer(
            trace,
            configuration,
            path+id,
            data.reportsEnabled,
            data.tracesEnabled,
            data.maxEvents,
            data.maxMemory,
            process.env.JAVA_PATH,
            process.env.STORAGE_PATH + `/userdata/${user}`
        );

        if (pid < 0)
            return res.sendStatus(500);

        let optimizations = fs.readFileSync(path + "optimizations.json", "utf-8");
        if (optimizations.length === 0)
            optimizations = { optimizations: [] };
        else
            optimizations = JSON.parse(optimizations);


        //Add to json
        optimizations.optimizations.push({
            id,
            name: data.name,
            date: Date.now(),
            trace: data.trace,
            configuration: data.configuration,
            path: path+id,
            reportsEnabled: data.reportsEnabled,
            tracesEnabled: data.tracesEnabled,
            pid
        });

        fs.writeFileSync(path + "optimizations.json", JSON.stringify(optimizations));
        
        res.status(200).send({ id, pid, name: data.name });
    } catch (error) {
        console.log(error);
        res.sendStatus(500).send({ error: error});
    }

});


app.post("/optimizations", async function (req, res) {
    try {
        const user = checkAuth(req.body.auth);
        if (typeof user === "undefined")
            return res.sendStatus(401);
        const path = process.env.STORAGE_PATH + `/userdata/${user}/optimizations/optimizations.json`;
        if (!fs.existsSync(path)) 
            fs.writeFileSync(path, JSON.stringify({ optimizations: [] }));
        let data = fs.readFileSync(path, "utf-8");
        data = JSON.parse(data);
        res.status(200).send(data.optimizations);
        return;
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});


app.post("/check", async function (req, res) {
    try {
        const user = checkAuth(req.body.auth);
        if (typeof user === "undefined")
            return res.sendStatus(401);
        const path = process.env.STORAGE_PATH + `/userdata/${user}/optimizations/optimizations.json`;
        let id = req.body.id;
        if (!fs.existsSync(path)) 
            fs.writeFileSync(path, JSON.stringify({ optimizations: [] }));
        const data = fs.readFileSync(path, "utf-8");
        const optimizations = JSON.parse(data);
        let obj = optimizations.optimizations[optimizations.optimizations.findIndex((o) => o.id === id)];
        //Special case in case the optimization was terminated
        if (typeof obj === "undefined")
            return res.sendStatus(500);
        //Check pid status
        if (obj.pid > 0) {
            try {
                if (process.kill(obj.pid, 0))
                    res.status(200).send({ id: id, pid: obj.pid, date: obj.date });
            } catch (err) {
                obj.pid = 0;
                res.status(200).send({ id: id, pid: 0, date: obj.date });
            }       
            return;
        }
        res.status(200).send({ id: id, pid: 0, date: obj.date });
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});


app.post("/terminate", async function (req, res) {
    try {
        const user = checkAuth(req.body.auth);
        if (typeof user === "undefined")
            return res.sendStatus(401);
        let id = req.body.id;
        const path = process.env.STORAGE_PATH + `/userdata/${user}/optimizations/optimizations.json`;
        if (!fs.existsSync(path)) 
            fs.writeFileSync(path, JSON.stringify({ optimizations: [] }));
        const data = fs.readFileSync(path, "utf-8");
        const optimizations = JSON.parse(data);
        let obj = optimizations.optimizations[optimizations.optimizations.findIndex((o) => o.id === id)];
        //Check pid status
        if (obj.pid > 0) {
            const kill = require("tree-kill");
            kill(obj.pid, 'SIGKILL', (err) => {
                if (err) {
                    if (err.code === 128)
                        return res.status(418).send({ message: "Process already finished"});
                    return res.status(418).send({ message: "Error killing process"});
                }
                deleteOptimization(id, user)
                return res.status(200).send({ id: id, pid: 0, date: obj.date });
            });
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.post("/delete", async function (req, res) {
    try {
        const user = checkAuth(req.body.auth);
        if (typeof user === "undefined")
            return res.sendStatus(401);
        if (deleteOptimization(req.body.id, user))
            return res.sendStatus(200);
        res.sendStatus(500);
    } catch (error) {
        logging("Error: " + error, "error")
        res.sendStatus(500);
    }
});

app.post("/getdata", async function (req, res) {
    try {
        const user = checkAuth(req.body.auth);
        if (typeof user === "undefined")
            return res.sendStatus(401);
        const path = process.env.STORAGE_PATH + `/userdata/${user}/optimizations/` + req.body.id + "/final_report.csv";
        if (!fs.existsSync(path)) 
            return res.sendStatus(500);
        let data = await parseCSV(path);
        res.status(200).send(data);
    } catch (error) {
        logging("Error: " + error, "error")
        res.sendStatus(500);
    }
});

app.post("/saveconfig", async function (req, res) {
    try {
        const user = checkAuth(req.body.auth);
        if (typeof user === "undefined")
            return res.sendStatus(401);

        //TODO
        res.sendStatus(200);
        return;
        
        const path = process.env.STORAGE_PATH + `/userdata/${user}/`;
        fs.copyFileSync(path + "optimizations/" + req.body.id + "/best_conf.properties", path + "configurations/" + req.body.name + ".properties");

        let configurations = fs.readFileSync(path + "configurations/configurations.json", "utf-8");
        if (configurations.length === 0)
            configurations = { configurations: [] };
        else
            configurations = JSON.parse(configurations);
        configurations.configurations.push(
            
        );
        fs.writeFileSync(path + "configurations/configurations.json", JSON.stringify(configurations));
        res.sendStatus(200);
        
    } catch (error) {
        logging("Error: " + error, "error")
        res.sendStatus(500);
    }

});


module.exports = app;