import { app } from "electron";

export function createOptimizations(){
    try {
        let path = app.getPath('userData') + "/optimizations";      
        const fs = require('fs');

        if (!fs.existsSync(path))
            fs.mkdirSync(path);
         
        path += "/optimizations.json";
        if (!fs.existsSync(path)) {
            let defaultFile = {
                optimizations: []
            };
            fs.writeFileSync(path, JSON.stringify(defaultFile));
        }
    } catch (err) {
        throw new Error("Failed to create optimizations file");
    }
}

export function createPreferences() {
    try {
        const path = app.getPath('userData') + "/preferences.json";
        const fs = require('fs');

        if (fs.existsSync(path)) 
            return;
        
        const defaultPreferences = {
            theme: "light",
            simulationPreference: "Online",
            hardwareAcceleration: "true",
            javaPath: "",
            optimizer: {
                selectedColumn: [],
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
        fs.writeFileSync(path, JSON.stringify(defaultPreferences));
        

    } catch (err) {
        throw new Error("Failed to create preferences file");
    }
}

export function createTraces() {
    try {
        let path = app.getPath("userData") + "/traces";
        const fs = require("fs");
        if (!fs.existsSync(path)) 
            fs.mkdirSync(path);
        
        
        path += "/traces.json";
        if (!fs.existsSync(path)) {
            let defaultTrace = {
                traces: [],
            };
            fs.writeFileSync(path, JSON.stringify(defaultTrace));
        }
    } catch (err) {
        throw new Error("Failed to create traces file");
    }
}

export function createConfigurations(){
    try {
        let path = app.getPath('userData') + "/configurations";

        const fs = require('fs');
        if(!fs.existsSync(path)){
            fs.mkdirSync(path);
        }

        path += "/configurations.json";
        
        if (!fs.existsSync(path)) {
            let defaultFile = {
                configurations: {
                    Storage: [],
                    Variance: [],
                    Optimizer: []
                }
            };
            fs.writeFileSync(path, JSON.stringify(defaultFile));
        }
    } catch (err) {
        throw new Error("Failed to create configurations file");
    }
}


export function createSimulations(){
    try {
        const fs = require('fs');
        let path = app.getPath('userData') + "/simulations";
        if(!fs.existsSync(path))
            fs.mkdirSync(path);
    
        path += "/simulations.json";
        if (!fs.existsSync(path)) {
            let defaultFile = {
                simulations: []
            };
            fs.writeFileSync(path, JSON.stringify(defaultFile));
        }
    } catch (err) {
        throw new Error("Failed to create simulations file");
    }
}

export function createServer() {
    try {
        const path = app.getPath('userData') + "/servers.json";
        const fs = require('fs');
        if (fs.existsSync(path))
            return;

        const defaultServer = {
            servers: []
        };

        fs.writeFileSync(path, JSON.stringify(defaultServer));
    } catch (err) {
        throw new Error("Failed to create servers file");
    }
}

export function integrityVerification() {
    try {
        createPreferences();
        createOptimizations();
        createTraces();
        createConfigurations();
        createSimulations();
        createServer();
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}

export function disableAcceleration() {
    try {
        const fs = require("fs");
        // If the file contains the value true, the hardware acceleration is disabled
        if (fs.existsSync(app.getPath("userData") + "/acceleration.txt") === false) {
            fs.writeFileSync(app.getPath("userData") + "/acceleration.txt", "false");
            return false;
        } else {
            const disableHardwareAcceleration = fs.readFileSync(
                app.getPath("userData") + "/acceleration.txt",
                "utf8"
            );
            return disableHardwareAcceleration === "true";
        }
    } catch (err) {
        return false;
    }
}