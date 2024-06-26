import axios from "axios";
import { app, dialog, ipcMain } from "electron";
import archiver from "archiver";
import { getPreference } from "./preferences";
const fs = require("fs");

interface ZipFiles {
  sim: "optimizer" | "simulator";
  type: string; //report/trace etc
  auth: string;
  address: string;
  mode: "Online" | "Local";
  id: number; //sim id
  name: string;
}

export function genericIpc() {
  ipcMain.handle("zip-files", async (event, arg: ZipFiles) => {
    try {
      let mode = getPreference("simulationPreference");
        let { address } = getPreference("onlineServer");
      if (mode === "Online") {
        // Handle extraction asynchronously
        const response = await axios.post(
          `${address}/api/${arg.sim}/zip`,
          { type: arg.type, id: arg.id },
          { responseType: "stream" }
        );
        if (response.status !== 200) {
          throw new Error("Failed to download file");
        }

        let name;
        let savename;

        if (arg.sim === "optimizer") {
          savename = arg.type === "reports" ? `Optimization_${arg.id}_reports` : `Optimization_${arg.id}_traces`;
        }

        if (arg.sim === "simulator") {
          savename = `${arg.name.replaceAll(/\s/g, "_")}_ML_files`;
        }

        //Open dialog to save the zip file
        const { canceled, filePath } = await dialog.showSaveDialog({
          title: `Select where to save the ${savename} zip`,
          defaultPath: app.getPath("downloads") + `/${savename}.zip`,
        });

        if (canceled || !filePath) {
          return { code: 418 };
        }

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer); // Pipe the stream directly to the file

        response.data.on("error", (error) => {
          writer.close(); // Close the file stream in case of errors
          // Handle download errors gracefully
          throw new Error("Failed to download file");
        });

        writer.on("error", (error) => {
          writer.close(); // Close the file stream in case of errors
          // Handle download errors gracefully
          throw new Error("Failed to download");
        });

        writer.on("finish", () => {
          writer.close();
        });
      } else {
        let name;
        let savename;
        let path;
        
        if (arg.sim === "optimizer") {
          path = app.getPath("userData") + `/optimizations/${arg.id}/`;
          name = arg.type === "report" ? `output_reports` : `output_traces`;
          path += name + "/";

          savename = arg.type === "reports" ? `Optimization_${arg.id}_reports` : `Optimization_${arg.id}_traces`;
        }

        if (arg.sim === "simulator") {
          savename = `${arg.name.replaceAll(/\s/g, "_")}_ML_files`;
        }


        
        const archive = archiver("zip", { zlib: { level: 9 } });
        
        if (arg.sim === "optimizer") {
          archive.directory(path, false);
        }

        if (arg.sim === "simulator") {
          path = app.getPath("userData") + `/simulations/${arg.id}`;
          let files = fs.readdirSync(path);

          const filesToZip = files.filter(
            (file) => file.endsWith(".arff") || file.endsWith(".csv")
          );

          if (filesToZip.length === 0) {
            return { code: 404 };
          }

          filesToZip.forEach((file) => {
            const filePath = `${path}/${file}`;
            archive.file(filePath, { name: file });
          });

        }


        const { canceled, filePath } = await dialog.showSaveDialog({
          defaultPath: app.getPath("downloads") + `/${savename}.zip`,
          title: `Select where to save the ${arg.type} zip`,
        });

        if (canceled || !filePath || filePath.length === 0) {
          return { code: 418 };
        }

        const output = fs.createWriteStream(filePath);
        archive.pipe(output);

        archive.on("error", (err) => {
            throw new Error("Failed to archive files");
        });

        archive.finalize();
      }

      return { code: 200};
    } catch (err) {
      if (err.message === "") return { code: 418 };
      if (err.response && err.response.status === 404) {
        return { code: 404 };
      }
      return { code: 500, error: err.message };
    }
  });
}
