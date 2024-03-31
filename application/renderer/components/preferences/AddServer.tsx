import { ipcRenderer } from "electron";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Tooltip } from "primereact/tooltip";
import React from "react";
import { showSwalWithButton } from "../../utils/SwalFunctions";
import { Fieldset } from "primereact/fieldset";
import { Panel } from "primereact/panel";

export default function AddServer({ setServers, showToast }) {
    const [collapsed, setCollapsed] = React.useState(true);
  const handleServerForm = (e) => {
    e.preventDefault();
    const serverName = (document.getElementById("server-name") as HTMLInputElement).value;
    const username = (document.getElementById("username") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement).value;
    const address = (document.getElementById("server-address") as HTMLInputElement).value;
    if (
      serverName.length == 0 ||
      username.length == 0 ||
      password.length == 0
    ) {
      showSwalWithButton("Error", "Please fill in all fields", "error", "Ok");
      return;
    }
    ipcRenderer
      .invoke("add-server", { serverName, username, password, address })
      .then((result) => {
        console.log(result);
        if (result === undefined || result === true) return;
        if (result.code == 500) {
          showSwalWithButton(
            "Error",
            result.error ? result.error : "Failed to add server",
            "error",
            "Ok"
          );
          return;
        }
        setServers((prev) => [
          ...prev,
          { label: serverName, value: serverName, status: "online" },
        ]);
        showToast("success", "Success", "Server added successfully");

        (document.getElementById("server-name") as HTMLInputElement).value = "";
        (document.getElementById("username") as HTMLInputElement).value = "";
        (document.getElementById("password") as HTMLInputElement).value = "";
        (document.getElementById("server-address") as HTMLInputElement).value = "";
          setCollapsed(false);
      });
  };

  return (
    <Panel header="Add new server">
    
    <div className=" flex flex-row">
        <div className="flex flex-col gap-1">
          <span>Step 1:</span>
          <div className="flex flex-row items-center space-x-3">
            <h1>Server address</h1>
            <Tooltip target=".online-server">
              Set the server address for the online simulation (Does not affect
              Local mode)
            </Tooltip>
            <i className="pi pi-info-circle mr-2 online-server" />
          </div>
          <InputTextarea cols={50} rows={1} id="server-address" />
          <Button
            label="Ping Server"
            className="w-[200px] mt-5"
            onClick={() => {
              ipcRenderer
                .invoke("ping-server", {
                  address: (document.getElementById("server-address") as HTMLInputElement).value,
                })
                .then((result) => {
                  console.log(result);
                  if (result === undefined) return;
                  if (result.code == 500) {
                    showSwalWithButton(
                      "Error",
                      result.error ? result.error : "Could not reach server",
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
        <div className="flex flex-col gap-1">
          <span>Step 2:</span>
          <span>Username:</span>
          <InputText id="username" placeholder="Username" />
          <span>Password:</span>
          <span className="p-input-icon-right">
            <i className="pi pi-eye cursor-pointer" onClick={() => {
              (document.getElementById("password") as HTMLInputElement).type === "password" ?
                ((document.getElementById("password") as HTMLInputElement).type = "text") :
                 ((document.getElementById("password") as HTMLInputElement).type = "password");
            }} />
            <InputText id="password" placeholder="Password" type="password" />
          </span>
        </div>
        <Divider layout="vertical" className='w-[1px] bg-gray-400'/>
        <div className="flex flex-col gap-1">
          <span>Step 3:</span>
          <span>Server name:</span>
          <InputText id="server-name" placeholder="Server name" />
          <Button label="Add" className="mt-5" onClick={handleServerForm} />
        </div>
      </div>
      </Panel>
  );
}
