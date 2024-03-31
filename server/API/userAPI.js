const express = require("express");
const app = express();
const fs = require("fs");
const { logging } = require("../util/util");
const { checkAuth } = require("../util/userUtil");
const archiver = require('archiver');
const path = require('path');

app.post("/login", async (req, res) => {
  
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .send({ message: "Username and password are required" });
    }
    const path = `${process.env.STORAGE_PATH}/userdata/users.json`;
    if (!fs.existsSync(path)) {
      fs.writeFileSync (path, "{}");
    }
	  let users = fs.readFileSync(path, "utf-8");
	  if (users.length > 0) {
	  		users = JSON.parse(users);
	  
        //Check if username exists
      const entries = Object.entries(users);
      let found = false;
      let auth;
      for (const [key, value] of entries) {
        if (value.username === username) {
          found = true;
          if(value.password === await hashing(password))
            auth = key;
          break;
        }
      }
      if (found) {
        if(auth)
          res.status(200).send({ message: "Login successful", auth });
        else 
          res.status(401).send({ message: "Username already exists" });
        return;
      }
      

	  } else {
		  users = {};
	  }

    //Create folders
	fs.mkdirSync(`${process.env.STORAGE_PATH}/userdata/${username}`);
    fs.mkdirSync(`${process.env.STORAGE_PATH}/userdata/${username}/traces`);
    fs.mkdirSync(`${process.env.STORAGE_PATH}/userdata/${username}/configurations`);
    fs.mkdirSync(`${process.env.STORAGE_PATH}/userdata/${username}/simulations`);
    fs.mkdirSync(`${process.env.STORAGE_PATH}/userdata/${username}/optimizations`);	  

    //Create files
    fs.writeFileSync(`${process.env.STORAGE_PATH}/userdata/${username}/traces/traces.json`, JSON.stringify({ traces: [] }));
    fs.writeFileSync(`${process.env.STORAGE_PATH}/userdata/${username}/configurations/configurations.json`, JSON.stringify({ configurations: [] }));
    fs.writeFileSync(`${process.env.STORAGE_PATH}/userdata/${username}/simulations/simulations.json`, JSON.stringify({ simulations: [] }));
    fs.writeFileSync(`${process.env.STORAGE_PATH}/userdata/${username}/optimizations/optimizations.json`, JSON.stringify({ optimizations: [] }));
    
	
	  const auth = await hashing(username + password);

	  users[auth] = { username, password: await hashing(password) };
    fs.writeFileSync(`${process.env.STORAGE_PATH}/userdata/users.json`, JSON.stringify(users));

    res.status(200).send({ message: "User created successfully", auth });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
});

app.get("/requestjars", async (req, res) => {
  //Get user and key
  const user = checkAuth(req.query.auth);
  if (typeof user === "undefined") return res.status(401).send({ message: "User does not exist" });
  const key = req.query.key;
  if (typeof key === "undefined") return res.status(400).send({ message: "Key is required" });


  //Check if key is valid
  let auth = fs.readFileSync(`${process.env.STORAGE_PATH}/userdata/keys.csv`, "utf-8");
  auth = auth.split(",");
  if (!auth.includes(key)) {
    res.status(401).send({ message: "Unable to verify, please contact your administrator." });
    await logging(`User ${user} tried to use an invalid key.`);
    return;
  }

  //Send jar folder
  //TODO: use archiver to send the folder

  const folderPath = `${process.env.JAVA_PATH}/..`;

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(res); // Stream directly to the client response

  archive.on('error', (err) => {
    console.error('Error archiving:', err);
    res.status(500).send('Internal Server Error');
  });

  archive.directory(folderPath, false);
  archive.finalize();
});


async function hashing(password) {
  const crypto = require("crypto");
	return crypto.createHash("sha256").update(password).digest("hex");

}



module.exports = app;