import { ipcRenderer } from "electron";
import { Divider } from "primereact/divider";
import { InputSwitch } from "primereact/inputswitch";
import React from "react";
import Swal from "sweetalert2";
import { AppController } from "../../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook";
import { Button } from "primereact/button";

export default function GeneralSettings() {
  const [hardwareAcceleration, setHardwareAcceleration] = React.useState(true);
  const controller = React.useContext(AppController);

  React.useEffect(() => {
    ipcRenderer
      .invoke("get-preferences-key", { key: "hardwareAcceleration" })
      .then((result) => {
        if (result == null)
          setHardwareAcceleration(true);
        else if (result != hardwareAcceleration.toString())
          setHardwareAcceleration(result);
      });
  }, []);
  
  const editHardwareAcceleration = () => {
    const enabled = !hardwareAcceleration;
    Swal.fire({
      title: "Requires restart",
      text: "This feature requires a restart to take effect. Do you want to restart now?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "Cancel",
      confirmButtonText: "Yes",
      color: document.documentElement.className.includes("dark") ? "white" : "",
      background: document.documentElement.className.includes("dark") ? "#1f2937" : "",
    }).then((result) => {
      if (result.isConfirmed)
        ipcRenderer.invoke("set-hardware-acceleration", { enabled });
    });
  };

  const editDebug = (value) => {
    controller.setDebugEnabled(value);
    ipcRenderer.invoke('edit-preferences-file', {key: "debugEnabled", value: value});
  }

  return (
    <div className="">
      <div>
        <div className="flex flex-row space-x-5">
          <h1>Hardware Acceleration</h1>
          <InputSwitch
            checked={hardwareAcceleration}
            id="hardware-acceleration"
            onClick={() => editHardwareAcceleration()}
          />
        </div>
        <small className="italic">
          Turns on Hardware Acceleration, which uses your GPU to make the
          application smoother.
        </small>
        <br />
        <small className="italic">On by default</small>
      </div>
      {/* <Divider className="h-[1px] bg-gray-400" />
      <div>
        <div className="flex flex-row space-x-5">
          <h1>Run Optimizer in debug mode</h1>
          <InputSwitch checked={controller.debugEnabled} onChange={(e)=>editDebug(e.value)}/>
        </div>
        <small className="italic">
          When enabled, the optimizer will run in debug mode which will print additional information in case of errors.<br/> However,
          only one optimization can be run at a time.
        </small>
      </div> */}
      {/* <div>
        <div className="flex flex-row space-x-5">
          <h1>Show simulation results on finish</h1>
          <InputSwitch checked={false} disabled />
        </div>
        <small className="italic">
          When enabled, the simulation results will automatically show up on
          screen.
        </small>
        <br />
        <small className="italic">Not implemented</small>
      </div> */}

      <Divider className="h-[1px] bg-gray-400" />
      <span>If you require any assistance, check out the manual below</span>
      <br />
      <Button className="mt-2" onClick={() => ipcRenderer.invoke("open-manual")}>Open Manual</Button>
    </div>
  );
}
