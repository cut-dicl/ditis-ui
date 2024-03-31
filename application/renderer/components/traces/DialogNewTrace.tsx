import React from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ipcRenderer } from "electron";
import { AppController } from "../../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook";

interface DialogNewTraceProps {
  dialogVisible: boolean;
  setDialogVisible: any;
  traceName: string;
  setTraceName: any;
  path: string;
  reloadTraces: any;
  showToast: any;
}

export default function DialogNewTrace({
  dialogVisible,
  setDialogVisible,
  traceName,
  setTraceName,
  path,
  reloadTraces,
  showToast
}:DialogNewTraceProps) {
  const controller = React.useContext(AppController);
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    return () => {
      setSubmitted(false);
    }
  }, []);
  
  const submitTrace = () => {
    setSubmitted(true);
    if (!traceName) {
      showToast('error', 'Error', 'Please enter a name for the trace');
      setSubmitted(false);
      return;
    } else if (traceName.toLocaleLowerCase() == "traces") {
      showToast('error', 'Error', 'The name "traces" is reserved. Please choose another name.');
      setSubmitted(false);
      return;
    }
    ipcRenderer
      .invoke("store-trace-file", {
        name: traceName, path: path,
        mode: controller.mode,
        javaPath: controller.javaPath,
        address: controller.onlineServer.address ? controller.onlineServer.address : null,
        auth: controller.onlineServer.auth ? controller.onlineServer.auth : null,})
      .then((result) => {        
        setSubmitted(false);
        setDialogVisible(false);
        if (result.code !== 200) {
          showToast('error', 'Error', result.error ? result.error : 'Failed to import trace');
          return; 
        }
        setTimeout(reloadTraces, 10);
        showToast('success', 'Trace imported successfully', '');
      });
  };


  return (
    <Dialog
      header="Enter name for trace"
      style={{
        height: "25%",
        minHeight: "250px",
        width: "20%",
        minWidth: "350px",
      }}
      visible={dialogVisible}
      onHide={() => setDialogVisible(false)}
    >
      <div className="flex flex-col pt-2 h-full justify-around">
        <span className="p-float-label mt-2">
          <InputText
            id="traceName"
            className="w-[75%]"
            defaultValue={traceName}
            onChange={(e) => setTraceName(e.target.value)}
          />
          <label htmlFor="traceName">Name</label>
        </span>
        <div className="flex nowrap justify-between">
          <Button
            label="Cancel"
            icon="pi pi-times"
            className="p-button-text"
            onClick={() => setDialogVisible(false)}
          />
          <Button label={submitted?"Submitting...":"Submit"} icon={submitted?"pi pi-spin pi-spinner":"pi pi-check"} onClick={()=>submitTrace()} 
          disabled={submitted}/>
        </div>
      </div>
    </Dialog>
  );
}
