import { ipcRenderer } from "electron";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Tooltip } from "primereact/tooltip";
import React from "react";
import { AppController } from "../../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook";
import { Divider } from "primereact/divider";
import { Panel } from "primereact/panel";

export default function InstallSimulator(props) {
  const controller = React.useContext(AppController);

  const [visible, setVisible] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [reqSent, setReqSent] = React.useState(false);

  const installSimulator = (key) => {
    setReqSent(true);
    setErr("");

    ipcRenderer
      .invoke("request-jars", {
        address: props.server.address,
        auth: props.server.auth,
        key,
      })
      .then((result) => {
        if (result === undefined) return;
        if (result.code === 500) {
          setErr(result.error);
          props.showToast("Error", result.error, "error", "Ok");
        }
        if (result.code === 200) {
          controller.setJavaPath(result.data);
          controller.setIsSimulatorInstalled(true);

          setVisible(false);
          setReqSent(false);
          //props.setIsSimulatorInstalled(true);
          props.showToast(
            "success",
            "Success",
            "Simulator downloaded and installed",
            "Ok"
          );
        }
      });
  };

  const deleteSimulator = () => {
    ipcRenderer
      .invoke("delete-jars")
      .then((result) => {
        if (result === undefined) return;
        if (result.code === 500) {
          props.showToast("Error", result.error, "error", "Ok");
        }
        if (result.code === 200) {
          props.showToast("success", "Success", "Simulator deleted", "Ok");
          controller.setIsSimulatorInstalled(false);
        }
        controller.setJavaPath("");
      });
  }

  const headerTemplate = (options) => {
    return (
      <div className={options.className}>
        <div className="flex flex-row items-center space-x-3">
        <h1 className="font-bold">Simulator Manager</h1>
        <Tooltip target=".simulation-install">
          This section is about handling the Local simulator, here you can
          download the simulator from the server and install it on your machine.
          You will need a key provided by the server administrator.
        </Tooltip>
        <i className="pi pi-info-circle mr-2 simulation-install" />
      </div>
      </div>
    )
    
  }

  return (
    <Panel  headerTemplate={headerTemplate}>
      <div className="flex flex-col">
        {(props.mode === "Local" && props.isSimulatorInstalled) && (
          <div className="flex flex-row space-x-4">
            <div className="flex flex-col">
              <Button
                disabled
                label="Simulator Installed"
              />
            </div>
            <Divider layout="vertical" className="w-[1px] bg-gray-400"/>
            <div className="flex flex-col">
              <Button
                label="Check for updates"
                severity="secondary"
                tooltip="This validates the simulator version with the server and updates if necessary"
                tooltipOptions={{ position: "top" }}
              />
            </div>
            <Divider layout="vertical" className="w-[1px] bg-gray-400"/>
            <div className="flex flex-col">
              <Button
                label="Remove Simulator"
                severity="danger"
                tooltip="This will remove the simulator from your machine and the ability of Local simulations"
                tooltipOptions={{ position: "top" }}
                onClick={() => {
                  deleteSimulator();
                }}
              />
            </div>
          </div>
        )}
        {(props.mode === "online" || !props.isSimulatorInstalled) && (
          <>
            <Button
              label="Request access"
              className="w-[200px]"
              onClick={() => {
                setVisible(true);
              }}
            />
            <div className="space-x-1">
              <i className="pi pi-info-circle mr-2" />
              <span className="italic">Requires ~78mb of storage space</span>
            </div>
          </>
        )}
      </div>
      <Dialog
        header="Install Simulator"
        visible={visible}
        style={{ width: "50vw" }}
        modal
        onHide={() => {
          setVisible(false);
        }}
      >
        <div className="flex flex-col space-y-3">
          <span>Please enter the key provided by your administrator:</span>
          <InputText id="keyinput" />
          <small>
            Please enter the key provided by your administrator (Server:{" "}
            {props.server.serverName} )
          </small>

          {err && <span className="text-red-500 italic">{err}</span>}
          <Button
            label={!reqSent ? "Submit" : "Processing"}
            className="w-[200px]"
            onClick={() =>
              installSimulator(
                (document.getElementById("keyinput") as HTMLInputElement).value
              )
            }
            disabled={reqSent}
            iconPos="right"
            icon={!reqSent ? "pi pi-arrow-right" : "pi pi-spinner pi-spin"}
          />
        </div>
      </Dialog>
    </Panel>
  );
}
