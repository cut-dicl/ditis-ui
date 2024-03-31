import { create } from "@mui/material/styles/createTransitions";
import { app, ipcMain } from "electron";
import { createServer } from "../helpers/create-files";
import axios from "axios";

const fs = require("fs");

export function serverIpc() {
    
    ipcMain.handle("add-server", async (event, arg) => {
        try {
            if (await checkServer(arg.address, arg.username))
                return { code: 500, data: null, error: "Server already exists with the same username" };

            const servers = await getServers();

            return axios.post(arg.address + "/api/auth/login", {
                username: arg.username,
                password: arg.password
            }).then((res) => {
                if (res.status !== 200)
                    return { code: 500, data: null, error: res.data.message };

                if (res.data.auth === null || res.data.auth === undefined)
                    return { code: 500, data: null, error: "Failed to add server" };

                const newEntry = {
                    serverName: arg.serverName,
                    address: arg.address,
                    username: arg.username,
                    password: arg.password,
                    auth: res.data.auth
    
                }
    
                if (!servers.servers)
                    servers["servers"] = [];
                servers.servers.push(newEntry);
                const path = app.getPath("userData") + "/servers.json";
                fs.writeFileSync(path, JSON.stringify(servers));
                
                return { code: 200, data: null }
            }).catch((err) => {
                if(err.response && err.response.status === 401)
                    return { code: 500, data: null, error: err.response.data.message };
                return { code: 500, data: null, error: err.response.data.message || "Failed to add server"};
            });         
        } catch (err) {
            console.log(err);
            return { code: 500, data: null, error: "Failed to add server" };
        }

    });

    ipcMain.handle("remove-server", async (event, arg) => {
        try {
            const servers = await getServers();
            if (arg.clearData) {
                let server = servers.servers.filter((server) => server.serverName === arg.name)[0];


                let res = await axios.post(server.address + "/api/auth/delete", {
                    username: server.username,
                    password: server.password,
                    auth: server.auth
                });

                if (res.status !== 200)
                    return { code: 500, data: null, error: res.data.message || "Failed to remove server" };
            }

            const newServers = servers.servers.filter((server) => server.serverName !== arg.server);
            servers.servers = newServers;
            const path = app.getPath("userData") + "/servers.json";
            fs.writeFileSync(path, JSON.stringify(servers));
            return { code: 200, data: null }
            
        } catch (err) {
            console.log(err);
            return { code: 500, data: null, error: "Failed to remove server" };
        }

    });

    ipcMain.handle("get-servers", async (event, arg) => {
        try {
            const servers = (await getServers()).servers;
            if (!servers) {
                createServer();
                return { code: 200, data: [] }
            }

            servers.forEach((server) => {
                delete server["password"];
                delete server["username"];
            });

            return { code: 200, data: servers }
        } catch (err) {
            console.log(err);
            return { code: 500, data: null, error: "Failed to get servers" };
        }
    });

    ipcMain.handle("get-server", async (event, arg) => {
        try {
            const servers = (await getServers()).servers;
            const server = (servers.filter((server) => server.serverName === arg.serverName))[0];
            delete server["password"];
            delete server["username"];
            return { code: 200, data: server }
        } catch (err) {
            console.log(err);
            return { code: 500, data: null, error: "Failed to get server" };
        }
    });

    ipcMain.handle("update-server", async (event, arg) => {
        try {
            const servers = (await getServers()).servers;
            const newServers = servers.map((server) => {
                if(server.serverName === arg.serverName){
                    return {
                        serverName: arg.serverName,
                        address: arg.address,
                        username: arg.username,
                        password: arg.password,
                        auth: server.auth
                    }
                }
                return server;
            });
            const path = app.getPath("userData") + "/servers.json";
            fs.writeFileSync(path, JSON.stringify(newServers));
            return { code: 200, data: null }
        } catch (err) {
            console.log(err);
            return { code: 500, data: null, error: "Failed to update server" };
        }
    });

    ipcMain.handle("ping-server", async (event, arg) => {
        try {
            return await axios.get(arg.address + "/api/ping", {timeout:3000}).then((res) => {
                if (res.status !== 200)
                    return { code: 500, data: null, error: "Server is Local" };
                return { code: 200, data: null }
            }).catch((err) => {
                console.log("err " + err);
                return { code: 500, data: null, error: "Server is Local or address is wrong" };
            });
        } catch (err) {
            console.log(err);
            return { code: 500, data: null, error: "Failed to ping server" };
        }
    });

    

    ipcMain.handle("request-jars", async (event, arg) => {
        try {
            let res = await new Promise<string>(async (resolve, reject) => { // Handle extraction asynchronously
                const response = await axios.get(arg.address + "/api/auth/requestjars", {
                    params: { auth: arg.auth, key: arg.key },
                    responseType: 'stream' // Important for large files
                });
          
                if (response.status !== 200) {
                    // Handle errors appropriately
                    return { code: 500, data: null, error: "Request was rejected" };
                }
          
                //TODO: Fix install
                let filePath = arg.option = app.getPath("userData") + "/java/ditis.zip"
                if(!fs.existsSync(app.getPath("userData") + "/java"))
                    fs.mkdirSync(app.getPath("userData") + "/java");
              
                const unzip = require('unzipper');
                const writer = fs.createWriteStream(filePath, { encoding: 'binary' });
                response.data.pipe(writer); // Pipe the stream directly to the file
          
                response.data.on('error', (error) => {
                    writer.close(); // Close the file stream in case of errors
                    // Handle download errors gracefully
                });
          
                writer.on('finish', () => {
                    fs.createReadStream(filePath).pipe(unzip.Extract({ path: app.getPath("userData") + "/java/ditis" })).on('close', () => {
                      
                        fs.unlinkSync(filePath)        
                        let jar = addToPreferences();
                        if(jar === "")
                            reject("Failed to add jar to preferences");
                        resolve(jar);
                    });

                });
            });
            return { code: 200, data: res };
        } catch (err) {
            console.log(err);
            if (err.response && err.response.status === 401)
                err = "Request was rejected";
            if (err.response)
                return { code: 500, data: null, error: err.response.data.message };
            return { code: 500, data: null, error: err };
        }
    });


    ipcMain.handle("delete-jars", async (event, arg) => {
        try {
            const path = require('path');
            const javapath = app.getPath("userData") + "/java";
            if (!fs.existsSync(javapath)) 
                fs.mkdirSync(javapath);
            
            let bin = fs.readdirSync(javapath);
            if(bin.length !== 0)
                fs.rmSync((javapath+"/"+bin[0]), { recursive: true, force: true }); 

            await fs.readFile(app.getPath("userData") + "/preferences.json", 'utf8', (err, data) => {
                if (err) {
                    console.log(err);
                    return { code: 500, data: null, error: "Failed to delete jars" };
                }
                data = JSON.parse(data);
                data["javaPath"] = "";
                fs.writeFileSync(app.getPath("userData") + "/preferences.json", JSON.stringify(data));
            });
            return { code: 200, data: null };
        } catch (err) {
            console.log(err);
            return { code: 500, data: null, error: "Failed to delete jars" };
        }

    });

    ipcMain.handle("edit-server", async (event, arg) => {
        try {
            const servers = await getServers();
            servers.servers = servers.servers.map((server) => {
                if(server.serverName === arg.serverName){
                    return {
                        serverName: arg.newServerName,
                        address: arg.newAddress,
                        username: server.username,
                        password: server.password
                    }
                }
                return server;
            });
            const path = app.getPath("userData") + "/servers.json";
            fs.writeFileSync(path, JSON.stringify(servers));
            return { code: 200, data: null }
        } catch (err) {
            console.log(err);
            return { code: 500, data: null, error: "Failed to update server" };
        }

    });

    async function getServers() {
        const path = app.getPath("userData") + "/servers.json";
        if (!fs.existsSync(path))
            await createServer();
        let servers = fs.readFileSync(path);
        if (!servers) {
            servers = { servers: [] };
            fs.writeFileSync(path, JSON.stringify(servers));
            return servers;
        }
        return JSON.parse(servers);
    };

    async function checkServer(address, username) {
        let servers = (await getServers()).servers;
        if (servers.length === 0)
            return false;
        const server = servers.filter((server) => server.address === address);
        if (server.username === username)
            return server.length > 0;
        return false;
    }

    function addToPreferences(){
        try {
            const path = app.getPath("userData") + "/preferences.json";
            let data = fs.readFileSync(path);
            data = JSON.parse(data);

            let bin = fs.readdirSync(app.getPath("userData") + "/java/ditis");
            let jar = bin.filter((file) => file.includes("service") && file.endsWith(".jar"));
            if(jar.length === 0)
                return "";
            jar = jar[0];
            data["javaPath"] = app.getPath("userData")+"/java/ditis/"+jar;
            fs.writeFileSync(path, JSON.stringify(data));
            return app.getPath("userData")+"/java/ditis/"+jar;
        } catch (err) {
            console.log(err);
            return "";
        }
    }
}