import { app } from "electron";
import fs from "fs";
import { fetchMaxID } from "../helpers/fetchMaxID"
import { config } from "./configuration-manager";

export function refreshConfigurationList(path: string) {
  const confFilePath =
    app.getPath("userData") + "/configurations/configurations.json";
  let configFileString = fs.readFileSync(confFilePath, "utf8");
  let configFile: { configurations: config[] } = JSON.parse(configFileString);

  const newConfiguration = {
    configurations: [],
  };

  fs.readdirSync(path + "/").forEach((file) => {
    if (file.includes("properties")) {
      const fileName = file.split(".");
      const found = configFile.configurations.find((item) => {
        if (item.name === fileName[0]) {
          return item;
        }
      });

      if (found) {
        newConfiguration.configurations.push(found);
      } else {
        let id = fetchMaxID(configFile);
        let filePath = app.getPath("userData") + `/configurations/${file}`;
        newConfiguration.configurations.push({
          id,
          path: filePath,
          name: fileName[0],
          date: Date.now() / 1000,
        });
      }
    }
  });
  fs.writeFileSync(
    path + "/configurations.json",
    JSON.stringify(newConfiguration)
  );
}
