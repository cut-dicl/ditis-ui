const fs = require("fs");

function getOptimizationID(user) {
    try {
        const path = process.env.STORAGE_PATH + `/userdata/${user}/optimizations/`;
        let file = fs.readFileSync(path + "/optimizations.json", (err, file) => {
            if (err) {
                console.log(err);
                return err;
            }
        });
        
        file = JSON.parse(file);
        let id = 1;
        if (file.optimizations.length > 0) {
            id = file.optimizations[file.optimizations.length - 1].id + 1;
        }

        fs.mkdirSync(path + `/${id}`, { recursive: true });
        
        return id;
    } catch (error) {
        console.log(error);
        return -1;
    }
}


function checkAuth(auth) {
    const users = fs.readFileSync(process.env.STORAGE_PATH + "/userdata/users.json", "utf-8");
    if (users.length > 0) {
        let parsedUsers = JSON.parse(users);
        if (parsedUsers[auth]) {
            return parsedUsers[auth].username;
        }
    }
    return undefined;
}

function getSimulationID(user){
    try {
        const path = process.env.STORAGE_PATH + `/userdata/${user}/simulations/`;
        const file = fs.readFileSync(path + "/simulations.json");
        const fileData = JSON.parse(file);
        let id = 1;
        if (fileData.simulations.length > 0) {
            id = fileData.simulations[fileData.simulations.length - 1].id + 1;
        }

        fs.mkdirSync(path + `/${id}`, { recursive: true });
        
        return id;
    } catch (error) {
        console.log(error);
        return -1;
    }
}

module.exports = { getOptimizationID,getSimulationID, checkAuth };