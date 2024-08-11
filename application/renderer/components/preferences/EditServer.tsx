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
import { Dialog } from "primereact/dialog";
import Swal from "sweetalert2";

export default function EditServer({ servers, setServers, toast, showToast }) {
  const controller = useContext(AppController);

  const [selectedServer, setSelectedServer] = React.useState(null);
  const [changeUser, setChangeUser] = React.useState(false);
  const [createUser, setCreateUser] = React.useState(false);

  const handleSimulationPreference = (newPreference) => {
    controller.setSimulationPreference(newPreference);
    window.ipc.invoke("edit-preferences-file", {
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
      accept: () => confirm3(),
      reject: () => deleteServer(false,null),
    });
  };

  const confirm3 = () => {
    Swal.fire({
      title: "Enter password to delete:",
      input: "password",
      inputAttributes: {
        autocapitalize: "off",
      },
      showCancelButton: true,
      confirmButtonText: "Confirm",
      confirmButtonColor: "#d33",
      showLoaderOnConfirm: true,
      reverseButtons: true,
    })
      .then((result) => {
        if (result.isConfirmed) {
          deleteServer(true, result.value);
        }
      });
  }

  const deleteServer = (clearData, password) => {
    window.ipc
      .invoke("remove-server", {
        server: selectedServer,
        clearData,
        password: password || null,
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
          controller.setOnlineServer("");
          handleSimulationPreference("Local");
          showToast(
            "warn",
            "Deleted Successfully",
            "Switched to Local mode as deleted server was in use"
          );
        } else {
          showToast("success", "Success", "Server deleted successfully");
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
    window.ipc
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

        window.ipc.invoke("ping-server", { address: newAddress }).then((result) => {
          if (!result || result.code == 500) {
            showToast("warn", "Server Edited", "Edit successful but server is offline");
          } else {
            showToast("success", "Successful Edit", "Server edited successfully");
          }
          
          if (selectedServer === controller.onlineServer.serverName) {
            controller.setOnlineServer(newServerName);
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

  const handleChangeUser = () => {
    let username = (document.getElementById("edit-username") as HTMLInputElement).value;
    let password = (document.getElementById("edit-password") as HTMLInputElement).value;
    let key = (document.getElementById("keyinput") as HTMLInputElement)?.value;
    window.ipc
      .invoke("change-user", {
        serverName: selectedServer,
        username,
        password,
        key,
      })
      .then((result) => {
        console.log(result);
        if (result.code == 500) {
          Swal.fire({
            title: "Error",
            text: result.error ? result.error : "Could not change user",
            icon: "error",
            target: document.getElementById("change-user-dialog"),
            color: document.documentElement.className.includes("dark") ? "white" : "",
            background: document.documentElement.className.includes("dark") ? "#1f2937" : "",
          });
          return;
        }

        if (result.code == 201)
          setCreateUser(true);          
        else {
          showToast("success", "User changed", "User changed successfully");

          controller.setOnlineServer(selectedServer);
              
          setChangeUser(false);
        }
      });
  }

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
                  onClick={() => setChangeUser(true)}
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
                    window.ipc
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
      <Dialog header="Change user" visible={changeUser} style={{ width: "20vw" }} modal
        onHide={() => { setChangeUser(false); setCreateUser(false); }}
      >
        <div className="flex flex-col gap-3" id="change-user-dialog">
          <h2>Server: {selectedServer}</h2>
          <InputText placeholder="Username" id="edit-username"/>
          <span className="p-input-icon-right">
            <i className="pi pi-eye cursor-pointer" onClick={() => {
              (document.getElementById("edit-password") as HTMLInputElement).type === "password" ?
                ((document.getElementById("edit-password") as HTMLInputElement).type = "text") :
                 ((document.getElementById("edit-password") as HTMLInputElement).type = "password");
            }} />
            <InputText id="edit-password" placeholder="Password" type="password" className="w-full"/>
          </span>
          {!createUser &&
            <Button label="Change user" onClick={handleChangeUser} />
          }
          {createUser && <>
            <span>This account does not exist. To create it,
            please enter the key provided by your administrator:</span>
          <InputText id="keyinput" placeholder="Enter key..."/>
          <small>
            Please enter the key provided by your administrator (Server:{" "}
            {controller.onlineServer.serverName} )
            </small>
            
            <Button label="Create user" onClick={handleChangeUser} />
            </>
            
          }
        </div>
      </Dialog>

    </Panel>
  );
}
