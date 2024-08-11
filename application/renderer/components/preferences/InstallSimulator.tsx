import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Tooltip } from "primereact/tooltip";
import React from "react";
import { AppController } from "../../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook";
import { Divider } from "primereact/divider";
import { Panel } from "primereact/panel";
import Swal from "sweetalert2";
import { Dropdown } from "primereact/dropdown";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";

export default function InstallSimulator(props) {
  const controller = React.useContext(AppController);

  const [visible, setVisible] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [reqSent, setReqSent] = React.useState(false);


  const confirm = (event) => {
    confirmPopup({
      target: event.currentTarget,
      message: `Are you sure you want to remove the simulator?`,
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      accept: () => accept(),
    });
  };

  const accept = () => {
    deleteSimulator();
  };


  const installSimulator = (key) => {
    setReqSent(true);
    setErr("");

    window.ipc
      .invoke("request-jars", {
        serverName: controller.onlineServer.serverName,
        key
      })
      .then((result) => {
        if (result === undefined) return;
        if (result.code === 500) {
          setErr(result.error);
          setReqSent(false);
          props.showToast("error","Error", result.error);
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
    window.ipc
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

  const checkUpdates = () => {
    window.ipc
      .invoke("check-simulator-version")
      .then((result) => {
        if (result === undefined) return;
        if (result.code === 500) {
          Swal.fire({
            icon: "error",
            title: result.error,
            color: document.documentElement.className.includes("dark") ? "white" : "",
            background: document.documentElement.className.includes("dark") ? "#1f2937" : "",
          });
        }
        if (result.code === 200) {
          Swal.fire({
            icon: "info",
            title: result.data,
            color: document.documentElement.className.includes("dark") ? "white" : "",
            background: document.documentElement.className.includes("dark") ? "#1f2937" : "",
          });
        } else if (result.code === 202) {
          Swal.fire({
            icon: "info",
            title: result.data,
            showCancelButton: true,
            confirmButtonText: "Install",
            cancelButtonText: "Cancel",
            reverseButtons: true,
            color: document.documentElement.className.includes("dark") ? "white" : "",
            background: document.documentElement.className.includes("dark") ? "#1f2937" : "",
          }).then((res) => {
            if (res.isConfirmed) {
              deleteSimulator();
              setVisible(true);
            }
          })
        }
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
        <div className="flex items-center gap-2">
            <span>Select server to use:</span>
            <Dropdown
              placeholder="Select server"
              options={props.servers}
              onChange={(e) => handleOnlineServer(e.target.value)}
              value={controller.onlineServer.serverName ? controller.onlineServer.serverName : null}
              itemTemplate={dropdownServerTemplate}
              valueTemplate={dropdownServerValueTemplate}
              className={(controller.onlineServer.address.length>0?"":"p-invalid")}
                />
          </div>
      </div>
    )
    
  }

  const dropdownServerTemplate = (option) => {
    return (
      <div className="flex flex-row items-center space-x-2">
        <span>{option.label}</span>
        <i
          className={
            option.status === ""
              ? "pi pi-spin pi-spinner"
              : option.status === "online"
              ? "pi pi-circle-fill text-green-600"
              : "pi pi-circle-fill text-red-500"
          }
          style={{ fontSize: "0.5rem" }}
        />
      </div>
    );
  };

  const dropdownServerValueTemplate = (option) => {
    if (!option) return <span>Select server</span>;
    return (
      <div className="flex flex-row items-center space-x-2">
        <span>{option.label}</span>
        <i
          className={
            option.status === ""
              ? "pi pi-spin pi-spinner"
              : option.status === "online"
              ? "pi pi-circle-fill text-green-600"
              : "pi pi-circle-fill text-red-500"
          }
          style={{ fontSize: "0.5rem" }}
        />
      </div>
    );
  };
  
  
  const handleOnlineServer = (newServer) => {
    window.ipc
      .invoke("get-server", { serverName: newServer })
      .then((result) => {
        if (result === undefined) return;
        if (result.code == 500) {
          return;
        }

        controller.setOnlineServer(result.data);
      });
  };


  return (
    <Panel headerTemplate={headerTemplate} className="w-1/2">
      <ConfirmPopup />
      <div className="flex flex-col">
        {props.mode === "Local" && props.isSimulatorInstalled && (
          <div className="flex flex-row space-x-4 items-center">
            <div className="flex flex-col">
              <Button disabled label="Simulator Installed" />
            </div>
            <Divider layout="vertical" className="w-[1px] bg-gray-400" />
            <div className="flex flex-row gap-5">
              <Button
                label="Check for updates"
                severity="secondary"
                tooltip="This validates the simulator version with the server and updates if necessary"
                tooltipOptions={{ position: "top" }}
                onClick={() => {
                  checkUpdates();
                }}
              />
            </div>
            <Divider layout="vertical" className="w-[1px] bg-gray-400" />
            <div className="flex flex-col">
              <Button
                label="Remove Simulator"
                severity="danger"
                tooltip="This will remove the simulator from your machine and the ability of Local simulations"
                tooltipOptions={{ position: "top" }}
                onClick={confirm}
              />
            </div>
          </div>
        )}
        {(props.mode === "online" || !props.isSimulatorInstalled) && (
          <>
            <Button
              label="Request access"
              onClick={() => {
                setVisible(true);
              }}
              disabled={controller.onlineServer.serverName.length === 0}
              className="w-[200px]"
            />
            <div className="mt-2">
              {controller.onlineServer.serverName.length === 0 && (
                <>
                  <i className="pi pi-times mr-2 text-red-500" />
                  <span className="text-red-500">
                    Please select a server to install the simulator from
                  </span>
                  <br />
                </>
              )}
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
            {controller.onlineServer.serverName} )
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
