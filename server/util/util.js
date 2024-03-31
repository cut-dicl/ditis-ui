const fs = require("fs");
const { deleteOptimization } = require("./optimizerUtil");

function checkJava() {
    const javaPath = process.env.JAVA_PATH;

    if (!javaPath) {
        console.log("JAVA_PATH has not been set in the environment variables. Please set it and try again.");
        return false;
    }

    if (!fs.existsSync(javaPath)) {
        console.log("JAVA_PATH has been set to a non-existent path. Please set it and try again.");
        return false;
    }

    if (javaPath.endsWith(".jar") && javaPath.includes("service")) {
        return true;
    }

    if (!javaPath.endsWith(".jar")) {
        let unchanged = true;
        const files = fs.readdirSync(javaPath);
        files.some((file) => {
            if(file.includes("service") && file.endsWith(".jar")){
                process.env["JAVA_PATH"] = javaPath + "\\" + file;
                unchanged = false;
            }
        });
        if(unchanged){
            console.log("JAVA_PATH has been set to a path that does not contain the service jar. Please set it and try again.");
            return false;
        }
        return true;
    }

    return false;
}


function checkStorage() {
    const storagePath = process.env.STORAGE_PATH;

    if (!storagePath) {
        console.log("STORAGE_PATH has not been set in the environment variables. Please set it and try again.");
        return false;
    }

    if (!fs.existsSync(storagePath)) {
        console.log("STORAGE_PATH has been set to a non-existent path. Please set it and try again.");
        return false;
    }

    if (fs.statSync(storagePath).isDirectory()) {
        if (!fs.existsSync(storagePath + "/userdata")) {
            fs.mkdirSync(storagePath + "/userdata", { recursive: true });
        }
    }

    if(!fs.existsSync(storagePath+"/userdata/users.json")){
        fs.writeFileSync(storagePath+"/userdata/users.json","{}");
    }

    if (!fs.existsSync(storagePath + "/userdata/log.txt")){
        fs.writeFileSync(storagePath + "/userdata/log.txt", "");
    }

    if(!fs.existsSync(storagePath+"/userdata/keys.csv")){
        fs.writeFileSync(storagePath+"/userdata/keys.csv","");
    }

    return true;
}

function killProcess(pid, id, user) {
    try {
        const kill = require("tree-kill");
        return kill(pid, 'SIGKILL', (err) => {
            if (err) {
                console.log(err);
                return false;
            }
            deleteOptimization(id, user)
            
            return true;
        });
    } catch (err) {
        return false;
    }  
}

async function getFile(path, type) {
    try {
        if (!fs.existsSync(path))
            fs.writeFileSync(path, JSON.stringify({ [type]: [] }));
        let data = fs.readFileSync(path, 'utf-8');
        if (data.length === 0) {
            fs.writeFileSync(path, JSON.stringify({ [type]: [] }));
        }
        return JSON.parse(data[type]);
    } catch (err) {
        console.log(err);
        return null;
    }
}

function getLines(path) {
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

async function logging(message) {
    const date = new Date();
    const log = `${date.toISOString()} - ${message}`;
    fs.appendFileSync(`${process.env.STORAGE_PATH}/log.txt`, log + "\n");
}


module.exports = {
    checkJava: checkJava,
    checkStorage: checkStorage,
    killProcess: killProcess,
    getFile: getFile,
    getLines: getLines,
    logging: logging
}