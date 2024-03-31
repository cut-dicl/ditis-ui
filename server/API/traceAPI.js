const express = require("express");
const app = express();
const jc = require("java-caller");
const fs = require("fs");
const { getFile, getLines } = require("../util/util");
const { checkAuth } = require("../util/userUtil");
const storage = process.env.STORAGE_PATH;
const multer = require("multer");
const { analyzeTrace, testTrace } = require("../service/traces");
app.use(express.json({ limit: '2gb' }));
app.use(express.urlencoded({ limit: '2gb', extended: true }));

const upload = multer({
  storage: multer.diskStorage({
      destination: (req, file, cb) => {
          const user = checkAuth(req.query.auth); // Example: Access user ID from request body
          const path = storage + `/userdata/${user}/traces/`;
          cb(null, path);
      },
      filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
  })
});

app.post("/upload", upload.single('file'), async (req, res) => {
  try {
    const user = checkAuth(req.query.auth);
    if (typeof user === "undefined") return res.sendStatus(401);
    
    const name = req.query.name;
    
      let type = await testTrace(`${storage}/userdata/${user}/traces/${name}.txt`, process.env.JAVA_PATH); 
        if (!type) {
          throw new Error("Invalid trace file");
      }
      type = JSON.parse(type).type;
      if (type == null) {
          throw new Error("Invalid trace file");
      }
    
      let data = fs.readFileSync(`${storage}/userdata/${user}/traces/traces.json`);
      
      data = JSON.parse(data);
    data.traces.push({
      path: name + ".txt",
      name,
      type,
      lines: getLines(storage + `/userdata/${user}/traces/${name}.txt`),
      date: Date.now(),
      extension: req.query.extension ? req.query.extension : "txt"
    });
    fs.writeFileSync(`${storage}/userdata/${user}/traces/traces.json`,JSON.stringify(data));
    res.status(200).send({ message: "Trace uploaded successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
});

app.post("/get", async (req, res) => {
  try {
    const user = checkAuth(req.body.auth);
    if (typeof user === "undefined") return res.sendStatus(401);
    let path = `${storage}/userdata/${user}/traces/`;
    let data = await fs.readFileSync(path+"traces.json");
    data = JSON.parse(data);
    let unchanged = true;
    data.traces.forEach((trace) => {
      if (!trace.extension)
        fs.readdirSync(path).forEach((file) => {
          if (file.includes(trace.name)) {
            if (file.split(".")[1] === "json") return;
            trace.extension = "." + file.split(".")[1];
            unchanged = false;
          }
        });
    });
    if (!unchanged)
        fs.writeFileSync(path+"traces.json", JSON.stringify(data));

    res.status(200).send(data.traces);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
});

app.post("/analyze", async (req, res) => {
  try {
    const user = checkAuth(req.body.auth);
    const trace = req.body.trace;
    let ext = "." + trace.split(".").pop();
    let path = `${storage}/userdata/${user}/traces/${trace}`;
    path = path.slice(0, -ext.length);
    if (fs.existsSync(path+".json")) {
      res.send(fs.readFileSync(path + ".json"));
      return;
    }
    res.send(await analyzeTrace(path+ext, process.env.JAVA_PATH));
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
});

app.post("/delete", async (req, res) => {
  try {
    const user = checkAuth(req.body.auth);
    const trace = req.body.trace;
    fs.unlinkSync(`${storage}/userdata/${user}/traces/${trace}.txt`);
    fs.unlinkSync(`${storage}/userdata/${user}/traces/${trace}.json`);
    let data = fs.readFileSync(`${storage}/userdata/${user}/traces/traces.json`);
    data = JSON.parse(data);
    data.traces = data.traces.filter((t) => t.name !== trace);
    fs.writeFileSync(`${storage}/userdata/${user}/traces/traces.json`,JSON.stringify(data));
    res.status(200).send({ message: "Trace deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
});

app.get("/download", async(req, res) => {
  try {
    const user = checkAuth(req.query.auth);
    const trace = req.query.trace;
    const file = `${storage}/userdata/${user}/traces/${trace}.txt`;
    res.download(file);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
});

app.post("/getlines", async (req, res) => {
  
  try {
    const user = checkAuth(req.body.auth);
    const trace = req.body.trace;
    const file = `${storage}/userdata/${user}/traces/${trace}`;
    res.status(200).send(getNLines(file));
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
});


function getNLines(path) {
  try {
      const linebyline = require("n-readlines");
      const liner = new linebyline(path);
      let counter = 0;
      let line;
      let result = "";
      while ((line = liner.next())) {
          if (counter < 100) {
              result += line.toString("ascii") + "\n";
          } else {
              liner.close();
              break;
          }
          counter++;
      }
      return result;
  } catch (err) {
      return err;
  }
}

module.exports = app;
