import axios from "axios";
import { app } from "electron";
import { runOptimizer as optimizer } from "../service/optimizer";
import { parseCSV } from "./parse-csv";
import { addConfigToJson } from "./configuration-manager";
import { convertProperties_Json } from "./convertJSON_Properties";
import { getTraceExtension } from "./trace-manager";
import { getPreference } from "../api/preferences";
const fs = require("fs");


//TODO: Implement account check
export async function runOnlineOptimizer(arg) {
    try {
        let {address} = getPreference("onlineServer");


        let res = await axios.post(address+"/api/optimizer/run", { trace: arg.trace, configuration: arg.configuration, name: arg.name,
            reportsEnabled: arg.reportsEnabled, tracesEnabled: arg.tracesEnabled, maxMemory: arg.maxMemory, maxEvents: arg.maxEvents 
        })
        if(res && res.status === 200 && res.data !== null)
            return { code: 200, data: res.data };
        else
            return { code: 500, data: -1, error: "Error running optimizer" };
    } catch (err) {
        console.log(err);
        return { code: 500, data: -1, error: "Error running optimizer" };
    }
}

export async function runLocalOptimizer(arg) {
    try {
        const fs = require("fs");
        const json = fs.readFileSync(app.getPath("userData") + "/optimizations/optimizations.json");
        const javaPath = getPreference("javaPath");
        const optimizations = JSON.parse(json);
        let id = 1;
        if (optimizations.optimizations.length > 0) {
            id = optimizations.optimizations[optimizations.optimizations.length - 1].id + 1;
        } //Get last id and increment

        //Create directory
        const path = app.getPath("userData") + "/optimizations/" + id

        if (!fs.existsSync(path))
            fs.mkdirSync(path);
        
        //Start optimizer and check pid
        let pid = await optimizer(app.getPath("userData") + "/traces/" + arg.trace + await getTraceExtension(arg.trace), arg.configuration, path, arg.reportsEnabled, arg.tracesEnabled, arg.maxEvents, arg.maxMemory, javaPath,
            app.getPath('userData'), arg.debugEnabled);
        if (pid === -1 || pid === undefined || pid === 0)
            return { code: 500, data: -1, error: "Error running optimizer" };

        //Add to json
        optimizations.optimizations.push({
            id: id,
            name: arg.name === "" ? "Optimization " + id : arg.name,
            date: Date.now(),
            trace: arg.trace,
            configuration: arg.configuration,
            path: path,
            reportsEnabled: arg.reportsEnabled,
            tracesEnabled: arg.tracesEnabled,
            pid: pid
        });
        
        fs.writeFileSync(app.getPath("userData") + "/optimizations/optimizations.json", JSON.stringify(optimizations));
        
        return { code: 200, data: { id, pid, name: arg.name === "" ? "Optimization " + id : arg.name } };
    } catch (err) {
        console.log(err.message);
        let error = JSON.parse(err.message);
        return { code: 500, data: -1, error: error.exception? error.exception : "Error running optimizer" };
    }
}


//checkOptimizer is a function to check the optimizations with pid > 0 in json and check if they are still running
export async function checkOnlineOptimizer() {
    try {
        let { address } = getPreference("onlineServer");
        if (address === "")
            return { code: 500, data: null, error: "Server is not set" };

        let res = await axios.post(`${address}/api/optimizer/running`)
        return { code: 200, data: res.data };
    } catch (err) {
        return { code: 500, data: null, error: "Server did not respond" };
    }
}

export async function checkLocalOptimizer() {
    const fs = require('fs');
    const path = app.getPath('userData') + "/optimizations";
    const json = fs.readFileSync(path + "/optimizations.json");
    const optimizations = JSON.parse(json);

    if (optimizations.optimizations.length === 0)
        return { code: 200, data: [] };
    
    //Get running optimizations
    const running = optimizations.optimizations.filter((opt: any) => opt.pid > 0);
    if (running.length === 0) 
        return { code: 200, data: [] };
    
    running.forEach((opt: any) => {
        if (process.kill(opt.pid, 0))
            //If process is running, continue
            return;
        else if (fs.existsSync(path + "/" + opt.id + "/final_report.csv") && fs.statSync(path + "/" + opt.id + "/final_report.csv").size > 0) {
            //Check if final report exists and is not empty, if yes then set pid to 0 as optimizer finished
            opt.pid = 0;
            optimizations.optimizations[optimizations.optimizations.findIndex((o: any) => o.id === opt.id)] = opt;
        } else {
            //This means the optimizer was killed and no final report was generated, so we delete from json
            fs.rmSync(path + "/" + opt.id, { recursive: true }); //Cleanup directory
            optimizations.optimizations = optimizations.optimizations.filter((o: any) => o.id !== opt.id);
        }

    });
    fs.writeFileSync(path + "/optimizations.json", JSON.stringify(optimizations));
    return { code: 200, data: running };
}



//getLocalOptimizationList is a function to get the list of optimizations from the json file
export async function getLocalOptimizationList() {
    const fs = require('fs');
    const path = app.getPath('userData') + "/optimizations";
    const json = fs.readFileSync(path + "/optimizations.json");
    const optimizations = JSON.parse(json);
    const files = await fs.readdirSync(path);
    //Check if files are in the json
    return { code: 200, data: optimizations.optimizations};
}

export async function getOnlineOptimizationList() {
    let {address} = getPreference("onlineServer");

    return await axios.post(`${address}/api/optimizer/optimizations`).then((res) => {
        if(res.status === 200)
            return { code: 200, data: res.data };
        else
            return { code: 500, data: null, error: "Something went wrong."};
    }).catch((err) => {
        return { code: 500, data: null, error: "Server did not respond." };
    });    
}


//getLocalOptimizerData is a function to get the final report from the optimization directory
export async function getLocalOptimizerData(id) {
    if(id == null){
        return{code: 500, data: null, error: "Optimization not specified"};
    }

    const errorFile = app.getPath('userData') + "/optimizations/" + id + "/error.json";
    if (fs.existsSync(errorFile)) {
        let error = fs.readFileSync(errorFile, 'utf8');
        try {
            error = JSON.parse(error);
        } catch (err) {
            //
        }
        return { code: 500, data: null, error: error.exception };
    }
    const file = app.getPath('userData') + "/optimizations/" + id + "/final_report.csv";

    //Check if file exists
    if (!fs.existsSync(file))
        return { code: 500, data: null, error: "Optimization not found" };

    
    const results = await parseCSV(file);
    if (!results)
        return { code: 500, data: null, error: "Optimization not found" };
    return { code: 200, data: results};
}

export async function getOnlineOptimizerData(id) {
    let {address} = getPreference("onlineServer");

    let res = await axios.post(`${address}/api/optimizer/getdata`, { id });
    if (res.status === 200) {
        if (res.data.error)
            return { code: 500, data: null, error: res.data.error.exception };
        return { code: 200, data: res.data };
    }
    else
        return { code: 500, data: null, error: res.data.error? res.data.error : "Error getting data"};
}


//getLocalOptimizerConfig is a function to get the best configuration from the optimization directory
export async function getLocalOptimizerConfig(id) {
    const javaPath = getPreference("javaPath");
    if(id == null){
        return{code: 500, data: null, error: "Optimization not specified"};
    }

    const file = app.getPath('userData')+"/optimizations/"+id+"/best_conf.properties";
    const config = fs.readFileSync(file, 'utf8');

    if (!config)
        return { code: 500, data: null, error: "Optimization not found" };
    return { code: 200, data: await convertProperties_Json(config,"Storage",javaPath)};
}

export async function getOnlineOptimizerConfig(id) {
    let {address} = getPreference("onlineServer");

    let res = await axios.get(`${address}/api/optimizer/config/get`, { params: { id: id } })
    if (res.status === 200)
        return { code: 200, data: res.data };
    else
        return { code: 500, data: null };
}



//saveLocalOptimizerConfig is a function to save the best configuration to the configurations directory
export async function saveLocalOptimizerConfig(id, configName, configDescription) {
    if(id == null){
        return{code: 500, data: null, error: "Optimization not specified"};
    }
    let filePath = app.getPath('userData') + `/configurations/`
    const file = app.getPath('userData') + "/optimizations/" + id + "/best_conf.properties";
    if (await addConfigToJson({
        configPath: filePath + `${configName}.properties`,
        configName: configName,
        confDescription: configDescription,
        configType: "Storage",
        path:  filePath + "configurations.json"
        })) {
        fs.copyFileSync(file, filePath + `${configName}.properties`, (err) => {
            if (err) {
                console.log(err)
                throw new Error("Error copying file")
            }
        });

        return { code: 200, data: null};
    } else
        return { code: 500, data: null, error: "Error saving configuration file" };
}


export async function saveOnlineOptimizerConfig(id, config) {
    let {address} = getPreference("onlineServer");
    let res = await axios.post(`${address}/api/optimizer/config/save`, { id,config})
    if (res.status === 200)
        return { code: 200, data: null };
    else
        return { code: 500, data: null };
}

export async function deleteOnlineOptimization(id) {
    let {address} = getPreference("onlineServer");

    let res = await axios.post(`${address}/api/optimizer/delete`, { id })
    if (res.status === 200)
        return { code: 200, data: null };
    else
        return { code: 500, data: null };
}


//deleteLocalOptimization is a function to delete the optimization directory and remove it from the json
export async function deleteLocalOptimization(id) {
    let path = app.getPath('userData') + "/optimizations/" + id;
    //Check if directory exists and we have access, if yes then delete
    fs.access(path, (err) => {
        if (err) {
            console.log(err)
            throw new Error("Error accessing file")
        }
        fs.rm(path, { recursive: true }, (err) => {
            if (err) {
                console.log(err)
                throw new Error("Error deleting file")
            }
        });
    });

    //Remove from json
    const json = fs.readFileSync(app.getPath('userData') + "/optimizations/optimizations.json");
    const optimizations = JSON.parse(json);
    optimizations.optimizations = optimizations.optimizations.filter((opt: any) => opt.id !== id);
    fs.writeFileSync(app.getPath('userData') + "/optimizations/optimizations.json", JSON.stringify(optimizations));
    return { code: 200, data: null };
}


//resyncLocalOptimizations is a function to check if the files in the json are in the directory
export async function resyncLocalOptimizations() {
    const fs = require('fs');
    const path = app.getPath('userData') + "/optimizations";
    const json = fs.readFileSync(path + "/optimizations.json");
    const optimizations = JSON.parse(json);
    //Check if files are in the json
    // files.forEach((file: any) => {
    //     if (file !== "optimizations.json") {
    //         if (optimizations.optimizations.findIndex((opt: any) => opt.id === parseInt(file)) === -1) {
    //             fs.rmSync(path + "/" + file, { recursive: true });
    //         }
    //     }
    // });

    //Check entries in json exist
    optimizations.optimizations.forEach((opt: any) => {
        if (!fs.existsSync(path + "/" + opt.id)) {
            optimizations.optimizations = optimizations.optimizations.filter((o: any) => o.id !== opt.id);
        }
        try {
            if (opt.pid > 0 && !process.kill(opt.pid, 0)) {
                if (fs.existsSync(path + "/" + opt.id + "/final_report.csv") &&
                    fs.existsSync(path + "/" + opt.id + "/optimizer_report.json") &&
                    fs.existsSync(path + "/" + opt.id + "/best_conf.properties")) {
                    opt.pid = 0;
                    optimizations.optimizations[optimizations.optimizations.findIndex((o: any) => o.id === opt.id)] = opt;
                } else {
                    opt.pid = -1;
                    optimizations.optimizations[optimizations.optimizations.findIndex((o: any) => o.id === opt.id)] = opt;
                }
            }
        } catch (err) {
            if (fs.existsSync(path + "/" + opt.id + "/final_report.csv") &&
                    fs.existsSync(path + "/" + opt.id + "/optimizer_report.json") &&
                    fs.existsSync(path + "/" + opt.id + "/best_conf.properties")) {
                opt.pid = 0;
                optimizations.optimizations[optimizations.optimizations.findIndex((o: any) => o.id === opt.id)] = opt;
            } else {
                opt.pid = -1;
                optimizations.optimizations[optimizations.optimizations.findIndex((o: any) => o.id === opt.id)] = opt;
            }
        }
    });
    fs.writeFileSync(path + "/optimizations.json", JSON.stringify(optimizations));
    return { code: 200, data: null };
}


//refreshLocalOptimization is a function to check if a specific optimization is still running
export async function refreshLocalOptimization(id) {
    const fs = require('fs');
    const path = app.getPath('userData') + "/optimizations";
    const json = fs.readFileSync(path + "/optimizations.json");
    const optimizations = JSON.parse(json);
    //Check if files are in the json
    if (optimizations.optimizations.findIndex((opt: any) => opt.id === id) === -1) {
        return { code: 500, data: null, error: "Optimization not found" };
    }
    let obj = optimizations.optimizations[optimizations.optimizations.findIndex((o: any) => o.id === id)];
    //Check pid status
    if (obj.pid > 0) {
        try {
            if (process.kill(obj.pid, 0))
                return { code: 200, data: { id: id, pid: obj.pid, date: obj.date } };
        } catch (err) {
            let pid;
            if (fs.existsSync(path + "/" + id + "/error.json")) 
                pid = -2;
            else if (!fs.existsSync(path + "/" + id + "/final_report.csv"))
                pid = -2;
            else
                pid = 0;
        
            obj.pid = pid;
            fs.writeFileSync(path + "/optimizations.json", JSON.stringify(optimizations));
            return { code: 200, data: { id: id, pid , date: obj.date } };
        }       
    }
    return { code: 200, data: { id: id, pid: 0, date: obj.date } };
}

export async function refreshOnlineOptimization(id) {
    let {address} = getPreference("onlineServer");

    let res = await axios.post(`${address}/api/optimizer/check`, { id })
    console.log(res);
    if (res.status === 200)
        return { code: 200, data: res.data };
    else
        return { code: 500, data: null };
}