import { ipcRenderer } from "electron";
import { InputTextarea } from "primereact/inputtextarea";
import { Tooltip } from "primereact/tooltip";
import React, { useEffect } from "react";
import { showSwalWithButton, showSwalWithTimerAndMessage } from "../../utils/SwalFunctions";
import { AppController } from "../../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook";
import { Button } from "primereact/button";
import { Panel } from "primereact/panel";

export default function SimulatorPath() {
    const controller = React.useContext(AppController);
    const [javaPath, setJavaPath] = React.useState(controller.javaPath);
    useEffect(() => {
      setJavaPath(controller.javaPath);
    }, [controller.javaPath]);

    const handleSimulatorPath = (newPath) => {
        ipcRenderer.invoke('edit-preferences-file', { key: "javaPath", value: newPath }).then((result) => {
            console.log(result);
            if (result === undefined || result === true) return;
            if (result === false) {
                showSwalWithButton("Error", "The path you entered does not contain jar files. Please select a valid path.", "error", "Ok");
                return;
            }
            setJavaPath(result);
          controller.setJavaPath(result);
          controller.setIsSimulatorInstalled(true);
            showSwalWithTimerAndMessage("Success", "Simulator found and path set successfully.", "success", 900);
        });
  }
  
  const headerTemplate = (options) => {
    return (
      <div className={options.className}>
        <div className="flex flex-row items-center space-x-3">
        <h1 className="font-bold">Simulator Path</h1>
        <Tooltip target=".simulation-preference">
          Set the simulator installation path
        </Tooltip>
        <i className="pi pi-info-circle mr-2 simulation-preference" />
      </div>
      </div>
    )
    
  }

  return (
    <Panel headerTemplate={headerTemplate} className="">
      
      <div className="flex flex-col w-[50%]">
        <InputTextarea
          id="outlined-basic"
          onChange={(e) => handleSimulatorPath(e.target.value)}
          cols={100}
          rows={2}
          value={javaPath}
        />

        <Button
          label="Browse Folder"
          onClick={() => {
            ipcRenderer.invoke("browse-folder").then((result) => {
              if (result === undefined || result === false) return;
              handleSimulatorPath(result);
            });
          }}
          className="mt-3 w-[200px]"
          tooltip="Opens a folder browser to select the simulator path"
          tooltipOptions={{ position: "bottom" }}
        />
      </div>
    </Panel>
  );
}
