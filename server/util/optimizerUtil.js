const fs = require("fs");

function deleteOptimization(id, user) {
    try {
        const path = process.env.STORAGE_PATH + `/userdata/${user}/optimizations`;
        if (!fs.existsSync(path))
            return false;
        fs.accessSync(path + `/${id}`);
        fs.rmSync(path + `/${id}`, { recursive: true });
    
        let list = fs.readFileSync(path + "/optimizations.json", "utf-8");
        list = JSON.parse(list);
        list.optimizations = list.optimizations.filter((o) => o.id !== id);
        fs.writeFileSync(path + "/optimizations.json", JSON.stringify(list));
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

module.exports = { deleteOptimization };