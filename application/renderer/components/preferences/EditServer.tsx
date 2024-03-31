import { ipcRenderer } from "electron";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Tooltip } from "primereact/tooltip";
import React, { useContext } from "react";
import { showSwalWithButton } from "../../utils/SwalFunctions";
import { Divider } from "primereact/divider";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { AppController } from "../../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook";
import { Panel } from "primereact/panel";

export default function EditServer({ servers, setServers, toast, showToast }) {
  const controller = useContext(AppController);

  const [selectedServer, setSelectedServer] = React.useState(null);

  const handleSimulationPreference = (newPreference) => {
    controller.setSimulationPreference(newPreference);
    ipcRenderer.invoke("edit-preferences-file", {
      key: "simulationPreference",
      value: newPreference,
    });
    controller.setMode(newPreference);
  };

  const confirm = (event) => {
    confirmPopup({
      target: event.currentTarget,
      message: "Are you sure you want to delete this server?",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      accept: () => confirm2(),
    });
  };

  const confirm2 = () => {
    confirmDialog({
      message: "Do you want to clear your data on the server?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      acceptIcon: "pi pi-trash",
      acceptLabel: "Delete and clear",
      rejectLabel: "Delete but don't clear",
      accept: () => deleteServer(true),
      reject: () => deleteServer(false),
    });
  };

  const deleteServer = (clearData) => {
    ipcRenderer
      .invoke("remove-server", {
        server: selectedServer,
        clearData,
      })
      .then((result) => {
        if (result.code == 500) {
          showSwalWithButton(
            "Error",
            result.error ? result.error : "Could not delete server",
            "error",
            "Ok"
          );
          return;
        }
        if (selectedServer === controller.onlineServer.serverName) {
          controller.setOnlineServer({ serverName: "", address: "", auth: "" });
          handleSimulationPreference("Local");
          showToast(
            "warn",
            "Deleted Successfully",
            "Switched to Local mode as deleted server was in use"
          );
        } else {
          showToast("success", "Server deleted", "success");
        }

        setServers((prev) =>
          prev.filter((server) => server.label !== selectedServer)
        );
        setSelectedServer(null);
      });
  };

  const editServer = () => {
    let newServerName = (document.getElementById("edit-server-name") as HTMLInputElement).value;
    let newAddress = (document.getElementById("edit-server-address") as HTMLInputElement).value;
    ipcRenderer
      .invoke("edit-server", {
        serverName: selectedServer,
        newServerName,
        newAddress,
      })
      .then((result) => {
        if (result.code == 500) {
          showSwalWithButton(
            "Error",
            result.error ? result.error : "Could not edit server",
            "error",
            "Ok"
          );
          return;
        }

        ipcRenderer.invoke("ping-server", { address: newAddress }).then((result) => {
          if (!result || result.code == 500) {
            showToast("warn", "Server Edited", "Edit successful but server is offline");
          } else {
            showToast("success", "Successful Edit", "Server edited successfully");
          }
          
          if (selectedServer === controller.onlineServer.serverName) {
            controller.setOnlineServer({
              serverName: newServerName,
              address: newAddress,
              auth: controller.onlineServer.auth,
            });
          }
          setSelectedServer(null);
          setServers((prev) =>
            prev.map((server) => {
              if (server.value === selectedServer) {
                server.label = newServerName;
                server.value = newServerName;
                server.address = newAddress;
                server.status = result.code == 500 ? "offline" : "online";
              }
              return server;
            })
          );
        });
      });
  

  };

  return (
    <Panel header="Edit Server">
      <div className="mt-5 mb-5 flex flex-row">
        <div className="flex flex-col">
          <div className="flex flex-row">
            <Dropdown
              placeholder="Select server"
              options={servers}
              id="edit-server"
              value={selectedServer}
              onChange={(e) => setSelectedServer(e.target.value)}
              className="w-[200px]"
              showClear
            />
            {selectedServer && (
              <>
                <ConfirmDialog />
                <ConfirmPopup />
                <Divider layout="vertical" className='w-[1px] bg-gray-400'/>
                <Button
                  label="Change user"
                  className=""
                  icon="pi pi-user"
                />
                <Divider layout="vertical" />
                <Button
                  label="Delete Saved Server"
                  className="p-button-danger"
                  icon="pi pi-trash"
                  onClick={confirm}
                  />
              </>
            )}
          </div>
          {selectedServer && (
            <div className="flex flex-row mt-5">
              <div className="flex flex-col">
                <div className="flex flex-row items-center space-x-3">
                  <h1>Server address</h1>
                  <Tooltip target=".online-server">
                    Set the server address for the online simulation (Does not
                    affect Local mode)
                  </Tooltip>
                  <i className="pi pi-info-circle mr-2 online-server" />
                </div>
                <InputTextarea cols={50} rows={1} id="edit-server-address" defaultValue={
                  servers.filter(serv => serv.value == selectedServer)[0] &&
                  servers.filter(serv => serv.value == selectedServer)[0].address
                } />
                <Button
                  label="Ping Server"
                  className="mt-5 w-[200px]"
                  onClick={() => {
                    ipcRenderer
                      .invoke("ping-server", {
                        address:
                          (document.getElementById("edit-server-address") as HTMLInputElement).value,
                      })
                      .then((result) => {
                        console.log(result);
                        if (result === undefined) return;
                        if (result.code == 500) {
                          showSwalWithButton(
                            "Error",
                            result.error
                              ? result.error
                              : "Could not reach server",
                            "error",
                            "Ok"
                          );
                          return;
                        }
                        showSwalWithButton(
                          "Success",
                          "Server is online",
                          "success",
                          "Ok"
                        );
                      });
                  }}
                />
              </div>
              <Divider layout="vertical" className='w-[1px] bg-gray-400'/>
              <div className="flex flex-col ml-10">
                <span>Server name:</span>
                <InputText id="edit-server-name" placeholder="Server name" defaultValue={
                  servers.filter(serv => serv.value == selectedServer)[0] &&
                  servers.filter(serv => serv.value == selectedServer)[0].value
                } />
                <Button label="Save Changes" className="mt-5" onClick={() => editServer()} />
              </div>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
