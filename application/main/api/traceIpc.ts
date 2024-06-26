const fs = require("fs");
const FormData = require("form-data")
import path from "path";
import {app, dialog, ipcMain} from "electron";
import {
    getTraceList,
    createTrace,
    deleteTrace,
    getLines,
    getNLines,
    traceAnalyzer,
} from "../helpers/trace-manager";
import axios from "axios";
import { testTrace } from "../service/traces";
import { getPreference } from "./preferences";

export function traceIpc() {
    ipcMain.handle("open-trace-file", async (event, arg) => {
        try {
            const { filePaths } = await dialog.showOpenDialog({
                properties: ["openFile"],
            });
            const fileName = path.basename(filePaths[0], path.extname(filePaths[0]));
            return { path: filePaths[0], fileName: fileName };
        } catch (err) {
            console.log(err);
            return false;
        }
    });

    //Insert other ipcMain's here
    ipcMain.handle("store-trace-file", async (event, arg) => {
        try {          
            const name = arg.name;
            let filepath = arg.path;
            filepath = filepath.replace(/\\/g, "/");
            
            let extension = filepath.split(".")[1];
            extension = "." + extension;
            let mode = getPreference("simulationPreference");

            if (mode === "Online") {
                let {address} = getPreference("onlineServer");
                let file = fs.createReadStream(filepath);
                const formData = new FormData();
                formData.append("file", file);
                
                let res = await axios.post(address + "/api/trace/upload", formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    params: {
                        name: arg.name,
                        extension
                    }
                }
                )
                if (res.status !== 200) {
                    throw new Error("Failed to upload trace");
                }
                
                return { code: 200, data: null }

            }



            //Check if trace with same name exists



            if (fs.existsSync(app.getPath("userData") + "/traces/" + name + extension)) {
                throw new Error("Trace file already exists");
            }

            let javaPath = getPreference("javaPath");
            let type = await testTrace(filepath, javaPath);
            if (type == "error")
                throw new Error("Invalid trace file");
            else if (type === "")
                type = "Unknown";
            else
                type = JSON.parse(type).type;

            if (type == null || type == "") {
                type = "Unknown";
            }
            const counter = await getLines(filepath);

            //Wait for trace to be inserted into log before writing file
            if (
                await createTrace({
                    lines: counter,
                    name: name,
                    type,
                    extension
                })
            ) {
                if (fs.existsSync(filepath)) {
                    fs.copyFile(
                        filepath,
                        `${app.getPath("userData")}/traces/${name + extension}`,
                        (err) => {
                            if (err) {
                                console.log(err);
                                throw new Error("Error copying file");
                            }
                        }
                    );
                }
            } else {
                throw new Error("Error inserting trace into log");
            }
            return { code: 200, data: null };
        } catch (err) {
            console.log(err);
            if (err.response) {
                return { code: 500, error: err.response.data.message };
            }
            return { code: 500, error: err.message };
        }
    });

    ipcMain.handle("get-trace-list", async (event, arg) => {
        try {
            let response = { code: 200, data: null };
            let list;
            let mode = getPreference("simulationPreference");

            if (mode === "Online") {
                let {address} = getPreference("onlineServer");
                await axios.post(address + "/api/trace/get").then((res) => {
                    response.data = res.data;
                }).catch((err) => {
                    console.log(err);
                    throw new Error("Failed to get trace list");
                });
            } else {
                list = await getTraceList();
            
                let unchanged = true;
                list.forEach((trace) => {
                    if (!trace.extension)
                        fs.readdirSync(app.getPath("userData") + "/traces").forEach((file) => {
                            if (file.includes(trace.name)) {
                                if (file.split(".")[1] === "json")
                                    return;
                                trace.extension = "." + file.split(".")[1];
                                unchanged = false;
                            }
                        });
                });
                if (!unchanged)
                    fs.writeFileSync(app.getPath("userData") + "/traces/traces.json", JSON.stringify({ traces: list }));

                response.data = list;
            }
            return response;
        } catch (err) {
            console.log(err);
            return { code: 500, error: err.message };
        }
    });

    ipcMain.handle("delete-trace-file", async (event, arg) => {
        try {
            let trace = arg.trace;
            let response = { code: 200, data: null };
            let mode = getPreference("simulationPreference");

            if (mode === "Online") {
                let {address} = getPreference("onlineServer");
                let res = await axios.post(address + "/api/trace/delete", {
                    trace: trace
                })
                if (res.status !== 200) {
                    throw new Error("Failed to delete trace");
                }
                return response;
            }

            const path = app.getPath("userData") + "/traces/" + trace + ".txt";
            if (!fs.existsSync(path)) {
                throw new Error("Trace file does not exist");
            }
            if (!deleteTrace({ trace: trace }))
                throw new Error("Error deleting trace");
            return { code: 200, data: null };
        } catch (err) {
            console.log(err);
            return { code: 500, error: err.message };
        }
    });

    ipcMain.handle("get-trace-lines", async (event, arg) => {
        try {
            let mode = getPreference("simulationPreference");
            if (mode === "Online") {
                let {address} = getPreference("onlineServer");
                let res = await axios.post(address + "/api/trace/getlines", {
                    id: arg.id,
                    type: arg.type? arg.type : null
                }
                );
                if (res.status !== 200) {
                    throw new Error("Failed to get trace lines");
                }
                return { code: 200, data: res.data };
            }


            let path;
            if (arg.type && arg.type === "simulator") {
                const nodepath = require("path");
                let trace = fs.readdirSync(nodepath.join(app.getPath("userData"), `simulations/${arg.id}`)).find((file) => /output.*\.txt/.test(file));
                path = app.getPath("userData") + `/simulations/${arg.id}/${trace}`;
            }
            else if (arg.type && arg.type === "optimizer")
                path = app.getPath("userData") + "/optimizations/" + arg.id + ".txt";
            else
                path = app.getPath("userData") + "/traces/" + arg.id;
            if (!fs.existsSync(path)) {
                throw new Error("Trace file does not exist");
            }

            const result = await getNLines(path);
            if (result === "error")
                throw new Error("Error reading trace file");
            return { code: 200, data: {report: result, lines: await getLines(path)} };``
        } catch (err) {
            return { code: 500, error: err.response? err.response.data.message || "Failed to read trace" : err.message};
        }
    });

    ipcMain.handle("analyze-trace", async (event, arg) => {
        try {
            let mode = getPreference("simulationPreference");
            if (mode === "Online") {
                let {address} = getPreference("onlineServer");
                let res = await axios.post(address + "/api/trace/analyze", {
                    id: arg.id,
                    type: arg.type? arg.type : null
                });
                if (res.status !== 200) {
                    throw new Error("Failed to analyze trace");
                }
                return { code: 200, data: res.data };
            }
            let path;
            if (arg.type && arg.type === "simulator") {
                const nodepath = require("path");
                let trace = fs.readdirSync(nodepath.join(app.getPath("userData"), `simulations/${arg.id}`)).find((file) => /output.*\.txt/.test(file));
                if(!trace)
                    throw new Error('Trace file was not generated')
                let ext = "." + trace.split(".").pop();
                path = app.getPath("userData") + `/simulations/${arg.id}/${trace}`;
                path = path.slice(0, -ext.length);
                if (fs.existsSync(path + ".json")) {
                    let data = fs.readFileSync(path + ".json");
                    if (data)
                        return { code: 200, data: JSON.parse(data) };
                }
                path = path + ext;
            } else if (arg.type && arg.type === "optimizer")
                path = app.getPath("userData") + "/optimizations/" + arg.id + ".txt";
            else {
                path = app.getPath("userData") + "/traces/" + arg.id;
                let ext = "." + path.split(".").pop();
                path = path.slice(0, -ext.length);
                if (fs.existsSync(path + ".json")) {
                    let data = fs.readFileSync(path + ".json");
                    if (data)
                        return { code: 200, data: JSON.parse(data) };
                }
                path = path + ext;
            }
        
            let data = await traceAnalyzer(path);
            if (!data) {
                throw new Error("Error analyzing trace");
            }
            return { code: 200, data: JSON.parse(data) };
        } catch (err) {
            console.log(err);
            return { code: 500, error: err.message };
        }
    });

    ipcMain.handle("download-trace", async (event, arg) => {
        try {
            let mode = getPreference("simulationPreference");
            if (mode === "Local") {
                //select location to store
                let { canceled, filePath } = await dialog.showSaveDialog({
                    title: "Select location to store trace file",
                    defaultPath: app.getPath("downloads") + `/${arg.trace + arg.extension}`
                });
                
                if (canceled || !filePath) {
                    return { code: 418 };
                }

                fs.copyFileSync(app.getPath("userData") + "/traces/" + arg.trace + arg.extension, filePath);
                fs.utimesSync(filePath, new Date(), new Date());
                return { code: 200 };
            }

            let {address} = getPreference("onlineServer");
            let res = await axios.get(address + "/api/trace/download", {
                params: {
                    trace: arg.trace
                },
                responseType: 'arraybuffer'
            });

            if (res.status !== 200) {
                throw new Error("Failed to download trace");
            }
            const fileData = Buffer.from(res.data, 'binary');
            //select location to store
            let { filePath } = await dialog.showSaveDialog({
                title: "Select location to store trace file",
                defaultPath: app.getPath("downloads") + `/${arg.trace + arg.extension}`
            });

            fs.writeFileSync(filePath, fileData, { encoding: 'binary' });
            
            return { code: 200 };
        } catch (err) {
            console.log(err);
            return false;
        }
    });
}
