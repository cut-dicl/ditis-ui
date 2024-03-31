export async function validateUser(uid) {
    try {
        
        const fs = require("fs");
        fs.readdir(`/userdata/${uid}`, (err, files) => {
            if(err) {
                console.log(err);
                return false;
            }
            return true;
        });
    } catch (error) {
        console.log(error);
        return false;
    }
}