import axios from "axios";
import { app, dialog, ipcMain } from "electron";
import archiver from "archiver";
const fs = require("fs");

interface ZipFiles {
    sim: "optimizations" | "simulations"; 
    type: string; //report/trace etc
    auth: string;
    address: string;
    mode: "Online" | "Local";
    id: number; //sim id
    name: string;
}

export function genericIpc() {

    ipcMain.handle("zip-files", async (event, arg:ZipFiles) => {
        if (arg.mode === "Online") {
            let res = await axios.post(`${arg.address}/api/common/zip-files`, { sim:arg.sim, type:arg.type, auth: arg.auth });
            if (res.status === 200) {
                return { code: 200, data: res.data };
            }
            return { code: 500, error: "Could not download files" };
        }

        let name;
        let savename;
        let path = app.getPath("userData") + `/${arg.sim}/${arg.id}/`
        if (arg.sim === "optimizations") {
            name = arg.type === "report" ? `output_reports` : `output_traces`
            path += name+"/";

            savename = arg.type === "report" ? `${arg.name.replaceAll(/\s/g, '_')}_reports` : `${arg.name.replaceAll(/\s/g, '_')}_traces`
        }

        if (arg.sim === "simulations") {
            savename = `${arg.name.replaceAll(/\s/g, '_')}_ML_files`
        }

        const {filePaths} = await dialog.showOpenDialog({
            properties: ["openDirectory"],
            title: `Select the folder to save the ${arg.type} files`,
        });

        if (!filePaths || filePaths.length === 0) {
            return { code: 418 };
        }
        
        let result;
        const archive = archiver('zip', { zlib: { level: 9 } });
        const output = fs.createWriteStream(`${filePaths[0]}/${savename}.zip`);
        archive.pipe(output);
            
        archive.on('error', (err) => {
            console.error('Error archiving:', err);
            result = { code: 500, error: "Error archiving" };
        });
        
        archive.on('end', () => {
            result = { code: 200 };
        });

        if(arg.sim === "optimizations"){
            archive.directory(path, false);
            await archive.finalize();
        }  
       
        if(arg.sim === "simulations"){
            let files = fs.readdirSync(path);

            const filesToZip = files.filter(file => file.endsWith('.arff') || file.endsWith('.csv'))

            if (filesToZip.length === 0) {
                return { code: 500, error: "No files were generated for this simulation"};
            }

            filesToZip.forEach(file=>{
                const filePath = `${path}/${file}`
                archive.file(filePath,{name:file})
            })

            await archive.finalize();
        }

        return result;
    });
}
