import { app, dialog, ipcMain } from "electron";
import { convertJSON_Properties,convertJSON_Properties_Variance } from "../helpers/convertJSON_Properties";
import {
  addConfigToJson,
  createConfigFile,
  deleteConfig,
  duplicateConfig,
  getConfigById,
  getConfigurationList,
  updateConfig,
  uploadConfig, //createOptimizerConfig
} from "../helpers/configuration-manager";
import {
  getDefaultConfig,
  getDefaultOptimizerConfig,
} from "../service/configurations";
import axios from "axios";

const path = require("path");
const fs = require("fs");

export function configurationIpc() {
  ipcMain.handle("create-config-file", async (event, arg) => {
    try {
      let response;
      if (arg.mode === "Online") {
        await axios
          .post(arg.address + "/api/configuration/create", {
            confObject: arg.confObject,
            confName: arg.confName,
            confDescription: arg.confDescription,
            configType: arg.formType,
            auth: arg.auth,
            type: arg.type,
          })
          .then((res) => {
            response = res.data.message
          });
          return { code: 200, message: response };
      } else if (arg.mode === "Local") {
        const confFile = arg.confObject;
        const confName = arg.confName;
        const confDescription = arg.description
          ? arg.description
          : "No description added for this configuration file";
        const configType = arg.formType;
        const propertiesText =
          arg.type === "simulator"
            ? await convertJSON_Properties(confFile)
            : await convertJSON_Properties_Variance(confFile);
        let filePath =
          app.getPath("userData") + `/configurations/${confName}.properties`;
        const path =
          app.getPath("userData") + "/configurations/configurations.json";
        if (
          await addConfigToJson({
            configPath: filePath,
            configName: confName,
            confDescription,
            configType,
            path: path,
          })
        ) {
          createConfigFile(filePath, propertiesText);
          return {
            code: 200,
            message: "Configuration file created successfully",
          };
        }
      }
    } catch (err) {
      return { code: 500, message: err };
    }
  });
  // not sure
  ipcMain.handle("get-configs", async (event, arg) => {
    try {

      let response;
      if (arg.mode === "Online") {
        await axios
          .post(arg.address + "/api/configuration/getList", { auth: arg.auth })
          .then((res) => {
            if (!res || res.status !== 200) {
              response = { code: 500, data: null, error: "Server did not respond" };
            } else if (res.data === null || res.data === undefined) {
              response =  {
                code: 500,
                data: null,
                error: "Error getting configuration list",
              };
            }
            response = { code: 200, content: res.data};
          });
          return response
      } else if (arg.mode === "Local") {
        return { code: 200, content: await getConfigurationList() };
      }
    } catch (err) {
      return { code: 500, message: err.message };
    }
  });
  // not sure
  ipcMain.handle("get-default-config", async (event, arg) => {
    try {
      let data = "";
      if (arg.mode === "Online") {
        await axios
          .post(arg.address + "/api/configuration/getDefaultStorage", {
            auth: arg.auth,
          })
          .then((res) => {
            data= res.data
          });

          return { code: 200, content: data };
      } else if (arg.mode === "Local") {
        return { code: 200, content: await getDefaultConfig(arg.javaPath) };
      }
    } catch (err) {
      return { code: 500 ,message:err};
    }
  });

  ipcMain.handle("get-config-by-id", async (event, arg) => {
    try {
      if (arg.mode === "Online") {
        let response ;
        await axios
          .post(arg.address + "/api/configuration/get", {
            auth: arg.auth,
            id: arg.id,
          })
          .then((res) => {
            response =  res.data
          });

          return  { code: 200, content: response };
      } else if (arg.mode === "Local") {
        return {
          code: 200,
          content: await getConfigById(arg.id, arg.javaPath),
        };
      }
    } catch (err) {
      return { code: 500, message: err };
    }
  });

  ipcMain.handle("upload-config", async (event, arg) => {
    try {
      if (arg.mode === "Online") {
        let file = fs.createReadStream(arg.path);
        const formData = new FormData();
        formData.append("file", file);

        let res = await axios.post(
          arg.address + "/api/configuration/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            params: {
              auth: arg.auth,
              name: arg.name,
              configType:arg.configType
            },
          }
        );

        if (res.status !== 200) {
          throw new Error("Error creating configuration file");
        }

        return { code: 200, data: null };
      } else if (arg.mode === "Local") {
        return await uploadConfig(arg.configType);
      }
    } catch (err) {
      return { code: 500, message: err };
    }
  });

  ipcMain.handle("update-config-file", async (event, arg) => {
    try {
      const { confObject, confName, description, confId, appMode, type } = arg;

      if (appMode === "Online") {

        let response;
        await axios
          .post(arg.address + "/api/configuration/update", {
            auth: arg.auth,
            confObject,
            confName,
            description,
            confId,
            type,
          })
          .then((res) => {
            response =  res.data;
          });

          return response
      } else if (appMode === "Local") {
        const jsonPath =
          app.getPath("userData") + "/configurations/configurations.json";
        return await updateConfig(
          confId,
          confObject,
          confName,
          description,
          jsonPath,
          appMode,
          type
        );
      }
    } catch (err) {
      return { code: 500, message: err };
    }
  });

  ipcMain.handle("delete-config", async (event, arg) => {
    try {
      if (arg.mode === "Online") {
        let response;
        await axios
          .post(arg.address + "/api/configuration/delete", {
            id: arg.id,
            auth: arg.auth,
          })
          .then((res) => {
            response =  res.data;
          });
          return response
      } else if (arg.mode === "Local") {
        const path =
          app.getPath("userData") + "/configurations/configurations.json";
        return await deleteConfig(arg.id, path);
      }
    } catch (err) {
      return { code: 500, message: err };
    }
  });

  ipcMain.handle("get-default-optimizer-config", async (event, arg) => {
    try {
      if (arg.mode === "Online") {
        let response;
        await axios
          .post(arg.address + "/api/configuration/getDefaultOptimizer")
          .then((res) => {
            response = res.data 
          });

          return { code: 200, content: response };
      } else if (arg.mode === "Local") {
        return {
          code: 200,
          content: await getDefaultOptimizerConfig(arg.javaPath),
        };
      }
    } catch (err) {
      return { code: 500, message: err };
    }
  });

  ipcMain.handle("download-configuration", async (event, arg) => {
    const path = require("path");
    try {
      if (arg.mode === "Online") {
        let res = await axios.get(arg.address + "/api/configuration/download", {
          params: {
            auth: arg.auth,
            trace: arg.trace,
          },
          responseType: "arraybuffer",
        });

        if (res.status !== 200) {
          throw new Error("Failed to download trace");
        }
        const fileData = Buffer.from(res.data, "binary");
        // fs.writeFileSync(
        //   app.getPath("downloads") + `/${arg.trace + arg.extension}`,
        //   fileData,
        //   { encoding: "binary" }
        // );
      } else if (arg.mode === "Local") {
        const { filePath: chosenPath } = await dialog.showSaveDialog({
          defaultPath: arg.path,
        });

        if (!chosenPath) {
          return { code: 200 };
        }

        fs.copyFile(arg.path, chosenPath, (err) => {
          if (err) {
            throw new Error(
              "Something went wrong in the download process. Please try again"
            );
          }
        });
        return {
          code: 200,
          message: "Configuration file downloaded successfully",
        };
      }
    } catch (err) {
      return { code: 500, message: err };
    }
  });

  ipcMain.handle("duplicate-config",async (event,arg)=>{
    if(arg.mode==="Online"){
      //
    }else if(arg.mode === "Local"){
      return await duplicateConfig(arg.path,arg.configName,arg.confDescription,arg.type)
    }
  })
}
