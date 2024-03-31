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

            if (arg.mode === "Online") {
                let file = fs.createReadStream(filepath);
                const formData = new FormData();
                formData.append("file", file);
                
                let res = await axios.post(arg.address + "/api/trace/upload", formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    params: {
                        auth: arg.auth,
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

            let type = await testTrace(filepath, arg.javaPath);
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
            return { code: 500, error: err.message };
        }
    });

    ipcMain.handle("get-trace-list", async (event, arg) => {
        try {
            let response = { code: 200, data: null };
            let list;
            if (arg.mode === "Online") {
                await axios.post(arg.address + "/api/trace/get", { auth: arg.auth }).then((res) => {
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

            if (arg.mode === "Online") {
                let res = await axios.post(arg.address + "/api/trace/delete", {
                    auth: arg.auth,
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
            console.log(arg);
            if (arg.mode === "Online") {
                let res = await axios.post(arg.address + "/api/trace/getlines", {
                    auth: arg.auth,
                    trace: arg.id
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
                console.log(path);
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
            return { code: 200, data: result };``
        } catch (err) {
            console.log(err);
            return { code: 500, error: err.message };
        }
    });

    ipcMain.handle("analyze-trace", async (event, arg) => {
        try {
            if (arg.mode === "Online") {
                let res = await axios.post(arg.address + "/api/trace/analyze", {
                    auth: arg.auth,
                    trace: arg.id
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
        
            let data = await traceAnalyzer(path, arg.javaPath);
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
            if (arg.mode === "Local") {
                fs.copyFileSync(app.getPath("userData") + "/traces/" + arg.trace + arg.extension, app.getPath("downloads") + `/${arg.trace + arg.extension}`);
                return { code: 200 };
            }

            let res = await axios.get(arg.address + "/api/trace/download", {
                params: {
                    auth: arg.auth,
                    trace: arg.trace
                },
                responseType: 'arraybuffer'
            });

            if (res.status !== 200) {
                throw new Error("Failed to download trace");
            }
            const fileData = Buffer.from(res.data, 'binary');
            fs.writeFileSync(app.getPath("downloads") + `/${arg.trace + arg.extension}`, fileData, { encoding: 'binary' });
            
            return { code: 200 };
        } catch (err) {
            console.log(err);
            return false;
        }
    });
}
