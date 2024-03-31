const fs = require('fs');
import {app, ipcMain} from 'electron';
import { createPreferences } from '../helpers/create-files';

export function preferencesIpc() {
    ipcMain.handle('open-preferences-file', async (event, arg) => {
           
        try {
            const filePath = `${app.getPath('userData')}/preferences.json`;
            let contents = await fs.promises.readFile(filePath, 'utf8');
            if (contents === "")
                createPreferences();
            contents = JSON.parse(contents);
            if (!fs.existsSync(contents.javaPath)) {
                contents.javaPath = "";
            } else if (!contents.javaPath.endsWith(".jar")) {
                const files = fs.readdirSync(contents.javaPath);
                files.some((file: string) => {
                    if(file.includes("service") && file.endsWith(".jar")){
                        contents.javaPath = contents.javaPath + "/" + file;
                        return true;
                    }
                });
            }
            if (arg && arg.key)
                return contents[arg.key];
            return contents;
        } catch (err) {
            console.log(err);
            return false;
        }
    });

    //Insert other ipcMain's here
    ipcMain.handle('edit-preferences-file', async (event, arg) => {
        try {
            const key = arg.key;
            const value = arg.value;
            const filePath = `${app.getPath('userData')}/preferences.json`;
            let content = await fs.promises.readFile(filePath, 'utf8');
            content = JSON.parse(content);
            if (key === "javaPath") {
                let unchanged = true;
                if (!fs.existsSync(value)) {
                    content.javaPath = "";
                } else if (!value.endsWith(".jar")) {
                    const files = fs.readdirSync(value);
                    files.some((file: string) => {
                        if(file.includes("service") && file.endsWith(".jar")){
                            content.javaPath = value + "/" + file;
                            unchanged = false;
                            return true;
                        }
                    });
                }
                if (content.javaPath === "" || unchanged) {
                    return false;
                }
                await fs.promises.writeFile(`${app.getPath('userData')}/preferences.json`, JSON.stringify(content), 'utf8');
                return content.javaPath;
            }

            if (typeof value === "object" && !Array.isArray(value))
                Object.keys(value).forEach((element: string) => {
                    content[key] === undefined ? content[key] = {} : content[key];
                    content[key][element] = value[element];
                });
            else
                content[key] = value;
            
            if (typeof content === "object" && !Array.isArray(content)) {
                await fs.promises.writeFile(`${app.getPath('userData')}/preferences.json`, JSON.stringify(content), 'utf8');
                return true;
            }
            
            return false;
        } catch (err) {
            console.log(err);
            return false;
        }
    });

    ipcMain.handle('browse-folder', async (event,arg) => {
        try{
            const { dialog } = require('electron');
            const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
            return result.filePaths[0];
        } catch(err){
            console.log(err);
            return "";
        }
    });

    ipcMain.handle('get-preferences-key', async (event, arg) => {
        try {
            const filePath = `${app.getPath('userData')}/preferences.json`;
            let contents = await fs.readFileSync(filePath, 'utf8');
            contents = JSON.parse(contents);
            return contents[arg.key];
        } catch (err) {
            console.log(err);
            return false;
        }
    });

    ipcMain.handle('set-hardware-acceleration', async (event, arg) => {
        fs.writeFileSync(app.getPath('userData') + '/acceleration.txt', String(!Boolean(arg.enabled)));
        let pref = fs.readFileSync(app.getPath('userData') + '/preferences.json', 'utf8');
        pref = JSON.parse(pref);
        pref.hardwareAcceleration = Boolean(arg.enabled);
        fs.writeFileSync(app.getPath('userData') + '/preferences.json', JSON.stringify(pref));

        app.relaunch()
        app.exit()
    });
}