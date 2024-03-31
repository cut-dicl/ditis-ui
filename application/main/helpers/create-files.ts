import { app } from "electron";

export function createOptimizations(){
    try {
        let path = app.getPath('userData') + "/optimizations";
        const defaultFile = {
            optimizations: []
        };
        const fs = require('fs');
        if(!fs.existsSync(path)){
            fs.mkdirSync(path);
        }
        path += "/optimizations.json";
        if (!fs.existsSync(path)) {
            fs.writeFileSync(path, JSON.stringify(defaultFile));
        }
    } catch (err) {
        console.log(err);
        return false;
    }
}

export function createPreferences() {
    try {
        const path = app.getPath('userData') + "/preferences.json";
        const defaultPreferences = {
            theme: "light",
            simulationPreference: "Local",
            hardwareAcceleration: "true",
            javaPath: "",
            optimizer: {
                selectedColumn: [
                ],
                chartMode: "chart",
                selectedMetrics: [],
                chartSize: "30%"
            },
            onlineServer: {
                serverName: "",
                address: "",
                auth: "",
            },
        };
        const fs = require('fs');
        fs.writeFileSync(path, JSON.stringify(defaultPreferences));
        

    } catch (err) {
        console.log(err);
        return false;
    }
}

export function createTraces() {
    try {
        let path = app.getPath("userData") + "/traces";
        const defaultTrace = {
            traces: [],
        };
        const fs = require("fs");
        if(!fs.existsSync(path)){
            fs.mkdirSync(path);
        }
        path += "/traces.json";
        fs.writeFileSync(path, JSON.stringify(defaultTrace));
    } catch (err) {
        console.log(err);
        return false;
    }
}

export function createConfigurations(){
    try {
        let path = app.getPath('userData') + "/configurations";
        const defaultFile = {
            configurations: []
        };
        const fs = require('fs');
        if(!fs.existsSync(path)){
            fs.mkdirSync(path);
        }
        path += "/configurations.json";
        if (!fs.existsSync(path)) {
            fs.writeFileSync(path, JSON.stringify(defaultFile));
        }
    } catch (err) {
        console.log(err);
        return false;
    }
}


export function createSimulations(){
    try {
        let path = app.getPath('userData') + "/simulations";
        const defaultFile = {
            simulations: []
        };
        const fs = require('fs');
        if(!fs.existsSync(path)){
            fs.mkdirSync(path);
        }
        path += "/simulations.json";
        if (!fs.existsSync(path)) {
            fs.writeFileSync(path, JSON.stringify(defaultFile));
        }
    } catch (err) {
        console.log(err);
        return false;
    }
}

export function createServer() {
    try {
        const path = app.getPath('userData') + "/servers.json";
        const fs = require('fs');
        const defaultServer = {
            servers: []
        };
        if (!fs.existsSync(path)) {
            fs.writeFileSync(path, JSON.stringify(defaultServer));
        }
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}