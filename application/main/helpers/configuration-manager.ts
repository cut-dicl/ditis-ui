import { app, dialog } from "electron";
import fs from "fs";
import path from "path";
import { fetchMaxID } from "./fetchMaxID";
import { refreshConfigurationList } from "./refreshConfigurationList";
import {
  convertJSON_Properties,
  convertJSON_Properties_Variance,
  convertProperties_Json,
  convertProperties_Json_Variance,
} from "./convertJSON_Properties";
import { configurationFileTypes } from "../../renderer/components/ConfigForm/ConfigurationPage";

const storage = process.env.STORAGE_PATH;

export interface config {
  id: number;
  path: string;
  name: string;
  description: string;
  date: number;
  dateModified: number;
  type: string;
}

interface createConfigFileProps {
  configPath: string;
  configName: string;
  confDescription?: string;
  configType: configurationFileTypes;
  path: string;
}

// not sure
export function configurationManager() {
  const path = app.getPath("userData") + "/configurations";
  const defaultConfiguration = {
    configurations: [],
  };
  const fs = require("fs");

  if (!fs.existsSync(path)) {
    fs.mkdirSync(app.getPath("userData") + "/configurations");
    fs.writeFileSync(
      path + "/configurations.json",
      JSON.stringify(defaultConfiguration)
    );
  } else {
    refreshConfigurationList(path);
  }
}

export async function addConfigToJson({
  configPath,
  configName,
  confDescription,
  configType,
  path,
}: createConfigFileProps): Promise<any> {
  let configFileString = fetchConfigJson(path);
  let configFile: { configurations: config[] } = JSON.parse(configFileString);

  const found = configFile.configurations.find((item) => {
    if (item.name === configName) {
      return item;
    }
  });

  if (found) {
    throw new Error("A configuration file with this name already exists");
  }

  let id = fetchMaxID(configFile);

  configFile.configurations.push({
    id,
    path: configPath,
    name: configName,
    description: confDescription,
    date: Date.now() / 1000,
    dateModified: Date.now() / 1000,
    type: configType,
  });

  try {
    await fs.promises.writeFile(path, JSON.stringify(configFile));
    return true;
  } catch (error) {
    console.log("failed to write to file");
    return false;
  }
}

//not sure

// not sure
export async function getConfigurationList() {
  const confFolderPath = app.getPath("userData") + "/configurations";
  refreshConfigurationList(confFolderPath);
  const path = app.getPath("userData") + "/configurations/configurations.json";

  const confList = fetchConfigJson(path);

  console.log(confList)
  if (confList) {
    return JSON.parse(confList);
  } else {
    throw new Error("Error, failed to get configuration file list");
  }
}

export async function getConfigById(id, javaPath) {
  const path = app.getPath("userData") + "/configurations/configurations.json";
  const content = fetchConfigJson(path);
  let configFile: { configurations: config[] } = JSON.parse(content);

  const propertyFile = configFile.configurations.find((item) => {
    if (item.id === id) return item;
  });

  if (propertyFile) {
    const propertiesString = fs.readFileSync(
      app.getPath("userData") +
        `/configurations/${propertyFile.name}.properties`
    );
    if (propertyFile.type === "Storage" || propertyFile.type === "Optimizer") {
      return await convertProperties_Json(
        propertiesString,
        propertyFile.type,
        javaPath
      );
    } else if (propertyFile.type === "Variance") {
      return await convertProperties_Json_Variance(propertiesString);
    }
  } else {
    throw new Error("Could not fetch configuration file, please try again");
  }
}

export async function uploadConfig(configType:configurationFileTypes) {
  try {
    const { filePaths, canceled } = await dialog.showOpenDialog({
      properties: ["openFile"],
    });

    if (!canceled && filePaths && filePaths.length > 0) {
      const fileName = path.basename(filePaths[0], path.extname(filePaths[0]));
      let filePath =
        app.getPath("userData") + `/configurations/${fileName}.properties`;

      if (
        await addConfigToJson({
          configPath: filePath,
          configName: fileName,
          confDescription: "No description added for this configuration file",
          configType: configType,
          path: app.getPath("userData") + "/configurations/configurations.json",
        })
      ) {
        fs.copyFile(filePaths[0], filePath, (err) => {
          if (err) {
            console.log(err);
            throw new Error("Error copying file");
          }
        });
        return {
          code: 200,
          message: "Configuration file has been uploaded successfully",
        };
      }
    } else {
      return { code: 200 };
    }
  } catch (err) {
    return { code: 500, message: err };
  }
}

export async function deleteConfig(id, path) {
  let configFile: { configurations: config[] } = JSON.parse(
    fetchConfigJson(path)
  );
  const found = configFile.configurations.find((item) => {
    if (item.id === id) {
      return item;
    }
  });

  if (found) {
    fs.unlink(found.path, (error: NodeJS.ErrnoException) => {
      console.log(error);
    });

    configFile.configurations = configFile.configurations.filter(
      (item) => item.id !== id
    );

    await fs.promises.writeFile(path, JSON.stringify(configFile));

    return {
      code: 200,
      message: "Configuration file has been deleted successfully",
    };
  } else {
    throw new Error(
      "Configuration file could not be deleted, please try again"
    );
  }
}

export async function updateConfig(
  id,
  confObject,
  confName,
  description,
  jsonPath,
  appMode,
  type,
  user?
) {
  let configFile: { configurations: config[] } = JSON.parse(
    fetchConfigJson(jsonPath)
  );

  const found = configFile.configurations.find((item) => {
    if (item.id === id) {
      return item;
    }
  });

  let oldFileName = found.name;

  if (found) {
    let filePath;
    let newFilePath;

    if (appMode === "Online") {
      filePath = `${storage}/userdata/${user}/configurations/${oldFileName}.properties`;
      newFilePath = `${storage}/userdata/${user}/configurations/${confName}.properties`;
    } else if (appMode === "Local") {
      filePath =
        app.getPath("userData") + `/configurations/${oldFileName}.properties`;
      newFilePath =
        app.getPath("userData") + `/configurations/${confName}.properties`;
    }

    configFile.configurations.forEach((item) => {
      if (item.id === id) {
        item.name = confName;
        item.description = description;
        item.path = newFilePath;
      }
    });

    await fs.promises.writeFile(jsonPath, JSON.stringify(configFile));

    const newPropertiesText =
      type === "simulator"
        ? await convertJSON_Properties(confObject)
        : await convertJSON_Properties_Variance(confObject);
    fs.rename(filePath, newFilePath, (error: NodeJS.ErrnoException) => {
      console.log(error);
    });

    fs.writeFile(
      newFilePath,
      newPropertiesText,
      (err: NodeJS.ErrnoException) => {
        if (err) throw err;
      }
    );

    return { code: 200, message: "Configuration file updated successfully" };
  } else {
    throw new Error("Configuration file failed to update,please try again");
  }
}

export function createConfigFile(filePath, propertiesText) {
  fs.writeFileSync(filePath, propertiesText);
}

function fetchConfigJson(path) {
  const fs = require("fs");

  if (!fs.existsSync(path)) {
    configurationManager();
  }

  return fs.readFileSync(path, "utf8");
}

export async function duplicateConfig(path,configName,confDescription,type){
  const newPath = app.getPath("userData") +`/configurations/${configName}.properties`

  try{
    fs.copyFileSync(path,newPath)
    const jsonPath = app.getPath("userData") + `/configurations/configurations.json`;
  if(await addConfigToJson({configPath:newPath,configName,confDescription,configType:type,path:jsonPath}))
  {
    return {code:200,message:"File copied successfully"}
  }else{
    return {code:500,message:`Error duplicating file. Please try again`}
  }
  }catch(err){
    return {code:500,message:`Error duplicating file: ${err}`}
  }
}