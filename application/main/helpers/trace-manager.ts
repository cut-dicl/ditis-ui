import { createTraces } from "./create-files";

const app = require("electron").app;
const fs = require("fs");
const service = require("../service/traces");

//Insert new trace into trace log
export async function createTrace({name, lines, type, extension}) {
    try {
        const path = app.getPath("userData") + "/traces/traces.json";
        if (!fs.existsSync(path)) {
            createTraces();
        }
        let traces = fs.readFileSync(path, "utf8");
        traces = JSON.parse(traces);
        traces.traces.push({
            name,
            lines,
            type,
            date: Date.now() / 1000,
            extension
        });
        await fs.promises.writeFile(path, JSON.stringify(traces));

        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}

export async function deleteTrace({trace}) {
    try {
        const path = app.getPath("userData") + "/traces";
        if (!fs.existsSync(path + "/traces.json")) {
            throw new Error("Trace file does not exist");
        }
        let traces = fs.readFileSync(path + "/traces.json", "utf8");
        traces = JSON.parse(traces);
        traces.traces = traces.traces.filter((t) => t.name !== trace);
        fs.writeFileSync(path + "/traces.json", JSON.stringify(traces));
        fs.unlinkSync(path + "/" + trace + ".txt");
        fs.unlinkSync(path + "/" + trace + ".json");
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}

export async function getTraceList() {
    try {
        const path = app.getPath("userData") + "/traces/traces.json";
        const fs = require("fs");
        //Check if trace file exists, if not create
        if (!fs.existsSync(path)) {
            createTraces();
        }
        const content = fs.readFileSync(path, "utf8");
        return (JSON.parse(content)).traces;
    } catch (err) {
        console.log(err);
        return false;
    }
}

export async function getLines(path: String) {
    try {
        const linebyline = require("n-readlines");
        const liner = new linebyline(path);
        let counter = 0;
        while (liner.next()) {
            counter++;
        }
        return counter;
    } catch (err) {
        return err;
    }
}

export async function getNLines(path: String) {
    try {
        const linebyline = require("n-readlines");
        const liner = new linebyline(path);
        let counter = 0;
        let line: any;
        let result = "";
        while ((line = liner.next())) {
            if (counter < 100) {
                result += line.toString("ascii") + "\n";
            } else {
                break;
            }
            counter++;
        }
        return result;
    } catch (err) {
        console.log(err);
        return "error";
    }
}

export async function traceAnalyzer(path: String, javaPath: String) {
    return await service.analyzeTrace(path, javaPath);
}

export async function getTraceExtension(name: String) {
    try {
        const path = app.getPath("userData") + "/traces";
        let json = fs.readFileSync(path + "/traces.json", "utf8");
        json = JSON.parse(json);
        let trace = json.traces.filter((t) => t.name === name);
        return trace[0].extension;
    } catch (err) {
        console.log(err);
        return false;
    }
}