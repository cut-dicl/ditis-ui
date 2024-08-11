import { InputTextarea } from "primereact/inputtextarea";
import { Tooltip } from "primereact/tooltip";
import React, { useEffect } from "react";
import { showSwalWithButton, showSwalWithTimerAndMessage } from "../../utils/SwalFunctions";
import { AppController } from "../../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook";
import { Button } from "primereact/button";
import { Panel } from "primereact/panel";
import Swal from "sweetalert2";

export default function SimulatorPath() {
    const controller = React.useContext(AppController);
  const [javaPath, setJavaPath] = React.useState(controller.javaPath);
  const [tempPath, setTempPath] = React.useState(controller.javaPath);
    useEffect(() => {
      setJavaPath(controller.javaPath);
      setTempPath(controller.javaPath);
    }, [controller.javaPath]);

  const handleSimulatorPath = (newPath) => {
      if (newPath === javaPath) return;
      window.ipc
        .invoke("edit-preferences-file", { key: "javaPath", value: newPath })
        .then((result) => {
          console.log(result);
          if (result === undefined || result === true) return;
          if (result === false) {
            Swal.fire({
              icon: "error",
              color:
                document.documentElement.className.includes("dark") ? "white" : "",
              background:
                document.documentElement.className.includes("dark") ? "#1f2937" : "",
              title: "Invalid Path",
              text:
                "The path you entered is not a valid path. Please select the service jar or the ditis folder.",
              showCancelButton: true,
              cancelButtonText: "Revert",
              showConfirmButton: true,
              confirmButtonText: "Ok",
              reverseButtons: true,
              focusCancel: true,
            }).then((result) => {
              if (result.isConfirmed) {
                return;
              }
              setTempPath(javaPath);
              return;
            });
            return;
          }
          setJavaPath(result);
          controller.setJavaPath(result);
          controller.setIsSimulatorInstalled(true);
          showSwalWithTimerAndMessage(
            "Success",
            "Simulator found and path set successfully.",
            "success",
            900
          );
        });
    };
  
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
    <Panel headerTemplate={headerTemplate} className="w-1/2">
      
      <div className="flex flex-col">
        <InputTextarea
          id="outlined-basic"
          onChange={(e) => setTempPath(e.target.value)}
          onBlur={(e)=>handleSimulatorPath(e.target.value)}
          rows={2}
          value={tempPath}
          autoResize
          className="w-full"
        />

        <Button
          label="Browse Folder"
          onClick={() => {
            window.ipc.invoke("browse-folder").then((result) => {
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
