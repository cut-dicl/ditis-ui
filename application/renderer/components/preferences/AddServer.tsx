import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Tooltip } from "primereact/tooltip";
import React, { use } from "react";
import { showSwalWithButton } from "../../utils/SwalFunctions";
import { Panel } from "primereact/panel";
import { Dialog } from "primereact/dialog";
import { AppController } from "../../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook";

export default function AddServer({ setServers, showToast }) {
  const [visible, setVisible] = React.useState(false);
  const [reqSent, setReqSent] = React.useState(false);
  const [err, setErr] = React.useState("");
  const controller = React.useContext(AppController);


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
    window.ipc
      .invoke("add-server", { serverName, username, password, address })
      .then((result) => {
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


        if (result.code == 200) {
          showToast("success", "Success", "Logged in successfully");

          setServers((prev) => [
            ...prev,
            { label: serverName, value: serverName, status: "online", address },
          ]);
          
          (document.getElementById("server-name") as HTMLInputElement).value = "";
          (document.getElementById("username") as HTMLInputElement).value = "";
          (document.getElementById("password") as HTMLInputElement).value = "";
          (document.getElementById("server-address") as HTMLInputElement).value = "";
        }
        else if (result.code == 201) {
          setVisible(true);
        }
      });
  };

  const createAccount = (key) => {
    setReqSent(true);
    setErr("");
    const serverName = (document.getElementById("server-name") as HTMLInputElement).value;
    const username = (document.getElementById("username") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement).value;
    const address = (document.getElementById("server-address") as HTMLInputElement).value;
    if (
      serverName.length == 0 ||
      username.length == 0 ||
      password.length == 0
    ) {
      return;
    }
    window.ipc
      .invoke("create-account", {
        key,
        username,
        password,
        address,
        serverName,
      })
      .then((result) => {
        if (result === undefined) return;
        if (result.code == 500) {
          setErr(result.error);
          setReqSent(false);
          return;
        }

        setServers((prev) => [
          ...prev,
          { label: serverName, value: serverName, status: "online", address },
        ]);

        setVisible(false);
        setReqSent(false);
        setErr("");
        showToast("success", "Success", "Account created successfully");
        (document.getElementById("server-name") as HTMLInputElement).value = "";
        (document.getElementById("username") as HTMLInputElement).value = "";
        (document.getElementById("password") as HTMLInputElement).value = "";
        (document.getElementById("server-address") as HTMLInputElement).value = "";
      });
  }

  React.useEffect(() => {
    setErr("");
  }, [visible]);

  return (
    <Panel header="Add new server">
    
    <div className=" flex flex-row flex-wrap">
        <div className="flex flex-col gap-1">
          <span>Step 1:</span>
          <div className="flex flex-row items-center space-x-3">
            <h1>Server address:</h1>
            <Tooltip target=".online-server">
              Set the server address for the online simulation (Does not affect
              Local mode)
            </Tooltip>
            <i className="pi pi-info-circle mr-2 online-server" />
          </div>
          <InputTextarea cols={50} rows={1} id="server-address" placeholder="Address..."/>
          <Button
            label="Ping Server"
            className="w-[200px] mt-5"
            onClick={() => {
              window.ipc
                .invoke("ping-server", {
                  address: (document.getElementById("server-address") as HTMLInputElement).value,
                })
                .then((result) => {
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
          <InputText id="username" placeholder="Username..." />
          <span>Password:</span>
          <span className="p-input-icon-right">
            <i className="pi pi-eye cursor-pointer" onClick={() => {
              (document.getElementById("password") as HTMLInputElement).type === "password" ?
                ((document.getElementById("password") as HTMLInputElement).type = "text") :
                 ((document.getElementById("password") as HTMLInputElement).type = "password");
            }} />
            <InputText id="password" placeholder="Password..." type="password" />
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
      <Dialog
        header="Enter key to create account"
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
              createAccount((document.getElementById("keyinput") as HTMLInputElement).value)
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
