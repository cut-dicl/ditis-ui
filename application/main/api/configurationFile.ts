import { app, dialog, ipcMain } from "electron";
import {
  convertJSON_Properties,
  convertJSON_Properties_Variance,
} from "../helpers/convertJSON_Properties";
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
import { getPreference } from "./preferences";

const path = require("path");
const fs = require("fs");
const FormData = require("form-data");

export function configurationIpc() {
  ipcMain.handle("create-config-file", async (event, arg) => {
    let response;
    let mode = getPreference("simulationPreference");
    let { address } = getPreference("onlineServer");
    if (mode === "Online") {
      try {
        await axios
          .post(address + "/api/configuration/create", {
            confObject: arg.confObject,
            confName: arg.confName,
            confDescription: arg.confDescription,
            configType: arg.formType,
            type: arg.type,
          })
          .then((res) => {
            response = res.data.message;
          });
        return { code: 200, message: response };
      } catch (err) {
        return { code: 500, message: err.response.data.message };
      }
    } else if (mode === "Local") {
      try {
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
      } catch (err) {
        return { code: 500, message: err };
      }
    }
  });
  // not sure
  ipcMain.handle("get-configs", async (event, arg) => {
    try {
      let mode = getPreference("simulationPreference");
      let { address } = getPreference("onlineServer");
      let response;
      if (mode === "Online") {
        await axios.post(address + "/api/configuration/getList").then((res) => {
          if (!res || res.status !== 200) {
            response = {
              code: 500,
              data: null,
              error: "Server did not respond",
            };
          } else if (res.data === null || res.data === undefined) {
            response = {
              code: 500,
              data: null,
              error: "Error getting configuration list",
            };
          }
          response = { code: 200, content: res.data };
        });
        return response;
      } else if (mode === "Local") {
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
      let mode = getPreference("simulationPreference");
      let { address } = getPreference("onlineServer");
      const javaPath = await getPreference("javaPath");
      if (mode === "Online") {
        await axios
          .post(address + "/api/configuration/getDefaultStorage")
          .then((res) => {
            data = res.data;
          });

        return { code: 200, content: data };
      } else if (mode === "Local") {
        return { code: 200, content: await getDefaultConfig(javaPath) };
      }
    } catch (err) {
      return { code: 500, message: err };
    }
  });

  ipcMain.handle("get-config-by-id", async (event, arg) => {
    try {
      let mode = getPreference("simulationPreference");
      let { address } = getPreference("onlineServer");
      if (mode === "Online") {
        let response;
        await axios
          .post(address + "/api/configuration/get", {
            id: arg.id,
          })
          .then((res) => {
            response = res.data;
          });

        return { code: 200, content: response };
      } else if (mode === "Local") {
        return {
          code: 200,
          content: await getConfigById(arg.id),
        };
      }
    } catch (err) {
      return { code: 500, message: err };
    }
  });

  ipcMain.handle("upload-config", async (event, arg) => {
    try {
      let mode = getPreference("simulationPreference");
      let { address } = getPreference("onlineServer");
      if (mode === "Online") {
        let response;
        const { filePaths, canceled } = await dialog.showOpenDialog({
          properties: ["openFile"],
        });

        if (canceled || !filePaths || filePaths.length == 0)
          return { code: 200 };

        let fileName = path.basename(filePaths[0], path.extname(filePaths[0]));
        let file = fs.createReadStream(filePaths[0]);
        const formData = new FormData();
        formData.append("file", file);

        await axios
          .post(address + "/api/configuration/upload", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            params: {
              name: fileName,
              configType: arg.configType,
              configDescription: arg.configDescription
                ? arg.configDescription
                : "No description added for this configuration file",
            },
          })
          .then((res) => {
            response = res.data.message;
          });

        console.log(response);

        return { code: 200, data: null, message: response };
      } else if (mode === "Local") {
        return await uploadConfig(arg.configType);
      }
    } catch (err) {
      console.log(err);
      return {
        code: 500,
        message:
          getPreference("simulationPreference") === "Local"
            ? err.message
            : err.response?.data?.message || "",
      };
    }
  });

  ipcMain.handle("update-config-file", async (event, arg) => {
    try {
      const { confObject, confName, description, confId, type } = arg;
      let mode = getPreference("simulationPreference");
      let { address } = getPreference("onlineServer");
      if (mode === "Online") {
        let response;
        await axios
          .post(address + "/api/configuration/update", {
            confObject,
            confName,
            description,
            confId,
            type,
          })
          .then((res) => {
            response = res.data;
          });

        return response;
      } else if (mode === "Local") {
        const jsonPath =
          app.getPath("userData") + "/configurations/configurations.json";
        return await updateConfig(
          confId,
          confObject,
          confName,
          description,
          jsonPath,
          mode,
          type
        );
      }
    } catch (err) {
      return { code: 500, message: err };
    }
  });

  ipcMain.handle("delete-config", async (event, arg) => {
    try {
      let mode = getPreference("simulationPreference");
      let { address } = getPreference("onlineServer");
      if (mode === "Online") {
        let response;
        await axios
          .post(address + "/api/configuration/delete", {
            id: arg.id,
          })
          .then((res) => {
            response = res.data;
          });
        console.log(response);
        return response;
      } else if (mode === "Local") {
        const path =
          app.getPath("userData") + "/configurations/configurations.json";
        return await deleteConfig(arg.id, path);
      }
    } catch (err) {
      console.log(err);
      return { code: 500, message: err.message };
    }
  });

  ipcMain.handle("get-default-optimizer-config", async (event, arg) => {
    try {
      let mode = getPreference("simulationPreference");
      let { address } = getPreference("onlineServer");
      let javaPath = getPreference("javaPath");
      if (mode === "Online") {
        let response;
        await axios
          .post(address + "/api/configuration/getDefaultOptimizer")
          .then((res) => {
            response = res.data;
          });

        return { code: 200, content: response };
      } else if (mode === "Local") {
        return {
          code: 200,
          content: await getDefaultOptimizerConfig(javaPath),
        };
      }
    } catch (err) {
      return { code: 500, message: err };
    }
  });

  ipcMain.handle("download-configuration", async (event, arg) => {
    let mode = getPreference("simulationPreference");
    let { address } = getPreference("onlineServer");
    try {
      if (mode === "Online") {
        let res = await axios.get(address + "/api/configuration/download", {
          params: {
            configurationName: arg.confName,
          },
          responseType: "arraybuffer",
        });

        if (res.status !== 200) {
          throw new Error("Failed to download configuration");
        }
        const fileData = Buffer.from(res.data, "binary");

        let { filePath } = await dialog.showSaveDialog({
          defaultPath: app.getPath("downloads") + `${arg.confName}.properties`,
        });

        fs.writeFileSync(filePath, fileData, { encoding: "binary" });
        return {
          code: 200,
          message: "Configuration file downloaded successfully",
        };
      } else if (mode === "Local") {
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

  ipcMain.handle("duplicate-config", async (event, arg) => {
    let mode = getPreference("simulationPreference");
    let { address } = getPreference("onlineServer");
    if (mode === "Online") {
      let response;
      await axios
        .post(address + "/api/configuration/duplicate", {
          configName: arg.configName,
          path: arg.path,
          confDescription: arg.confDescription,
          type: arg.type,
        })
        .then((res) => {
          response = res.data;
        });
      return {
        code: 200,
        message: "Configuration file duplicated successfully",
      };
    } else if (mode === "Local") {
      return await duplicateConfig(
        arg.path,
        arg.configName,
        arg.confDescription,
        arg.type
      );
    }
  });
}
