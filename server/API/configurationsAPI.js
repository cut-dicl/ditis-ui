const express = require("express");
const app = express();
const jc = require("java-caller");
const fs = require("fs");
const {checkAuth} = require("../util/userUtil");
const {fetchMaxID} = require("../../application/main/helpers/fetchMaxID")
const {convertJSON_Properties,convertProperties_Json,convertProperties_Json_Variance} = require("../../application/main/helpers/convertJSON_Properties")
const {getDefaultConfig,getDefaultOptimizerConfig} = require("../service/configurations")
const {addConfigToJson,updateConfig,deleteConfig} = require("../../application/main/helpers/configuration-manager")
const storage = process.env.STORAGE_PATH;

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const user = checkAuth(req.query.auth); // Example: Access user ID from request body
            const path = storage + `/userdata/${user}/configurations/`;
            cb(null, path);
        },
        filename: (req, file, cb) => {
          cb(null, file.originalname);
      }
    })
  });

  app.post("/getList",async (req,res)=>{
    try{
        const user = checkAuth(req.body.auth);
        if(typeof user === "undefined") return res.sendStatus(401)

        let data = await fs.readFileSync(`${storage}/userdata/${user}/configurations/configurations.json`)
        const configData = JSON.parse(data)
        res.status(200).send(configData.configurations)

    }catch(err){
        res.status(500).send({message:err.message})
    }
  })

  app.post("/create",async(req,res)=>{
    try{
        const user = checkAuth(req.body.auth);
        if(typeof user === "undefined") return res.sendStatus(401)

        const confObject = req.body.confObject
        const confName = req.body.confName
        const confDescription = req.body.description? req.body.description : "No description added for this configuration file"
        const configType = req.body.formType
        const propertiesText = convertJSON_Properties(confObject)
        const filePath = `${storage}/userdata/${user}/configurations/${confName}.properties`
        const storagePath = `${storage}/userdata/${user}/configurations/configurations.json`
        
        if(await addConfigToJson({configPath:storagePath,configName:confName,confDescription,configType,path:path})){
            fs.writeFileSync(filePath,propertiesText)
            res.status(200).send({message:"Configuration file created successfully"})
        }

        res.status(500).send({message:"A configuration file with this name already exists"})
    }catch(err){
        res.status(500).send({message:err.message})
    }
  })

  app.post("/getDefaultStorage",async(req,res)=>{
    res.status(200).send(await getDefaultConfig(process.env.JAVA_PATH))
  })

  app.post("/getDefaultOptimizer",async(req,res)=>{
    res.status(200).send(await getDefaultOptimizerConfig(process.env.JAVA_PATH))
  })

  app.post("/get",async(req,res)=>{
    const user = checkAuth(req.body.auth)
    const id = req.body.id
    if (typeof user === "undefined") return res.sendStatus(401);
    const storagePath = `${storage}/userdata/${user}/configurations/configurations.json`
    let configFile = {configurations:[]} = JSON.parse(fs.readFileSync(storagePath, 'utf8'));

    const propertyFile = configFile.configurations.find((item) => {
        if (item.id === id)
            return item
    })

    if (propertyFile) {
        const propertiesString = fs.readFileSync(app.getPath('userData') + `/configurations/${propertyFile.name}.properties`)
        if(propertyFile.type === "Storage" || propertyFile.type === "Optimizer"){
            res.send(await convertProperties_Json(propertiesString,propertyFile.type,process.env.JAVA_PATH))
        }else if(propertyFile.type === "Variance"){
            res.send(await convertProperties_Json_Variance(propertiesString))
        }
    } else {
        res.status(500).send({message:"Could not fetch configuration file, please try again"})
    }
  })

  app.post("/upload", upload.single("file"),async(req,res)=>{
   try{
    const user = checkAuth(req.query.auth)
    if (typeof user === "undefined") return res.sendStatus(401);

    const name = req.query.name
    const storagePath = `${storage}/userdata/${user}/configurations/configurations.json`

    let data = fs.readFileSync(storagePath)
    data = JSON.parse(data)

    data.configurations.push({
        id,
        path: configPath,
        name: configName,
        description: confDescription,
        date: Date.now() / 1000,
        dateModified:Date.now()/1000,
        type:configType
    })

    fs.writeFileSync(storagePath,JSON.stringify(data))
    res.status(200).send({message:"Configuration file has been uploaded successfully"})

   }catch(err){
    res.status(500).send({ message: err.message });
   }
  })

  app.post("/update",async(req,res)=>{
    try{
        const user = checkAuth(req.body.auth)
    if (typeof user === "undefined") return res.sendStatus(401);
        const {confObject, confName,description,confId,appMode} = req.body
        const storagePath = `${storage}/userdata/${user}/configurations/configurations.json`

        res.send(await updateConfig(confId,confObject, confName,description,storagePath,appMode,user))
    }catch(err){
        res.status(500).send({ message: err.message });
    }
  })

  app.post("/delete",async(req,res)=>{
    try{
        const id = req.body.id
        const user = checkAuth(req.query.auth)
        if (typeof user === "undefined") return res.sendStatus(401);
        const storagePath = `${storage}/userdata/${user}/configurations/configurations.json`

        res.status(200).send(await deleteConfig(id,storagePath))
    }catch(err){
        res.status(500).send({message:err.message})
    }
  })