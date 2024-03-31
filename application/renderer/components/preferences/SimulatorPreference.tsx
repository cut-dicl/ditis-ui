import { Divider } from "primereact/divider";
import { Dropdown } from "primereact/dropdown";
import { RadioButton } from "primereact/radiobutton";
import { Tooltip } from "primereact/tooltip";
import React from "react";
import { AppController } from "../../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook";
import { ipcRenderer } from "electron";

export default function SimulatorPreference(servers, showToast) {
  const controller = React.useContext(AppController);
  const [onlineServer, setOnlineServer] = React.useState(
    controller.onlineServer
  );

  const handleSimulationPreference = (newPreference) => {
    controller.setSimulationPreference(newPreference);
    ipcRenderer.invoke("edit-preferences-file", {
      key: "simulationPreference",
      value: newPreference,
    });
    controller.setMode(newPreference);
  };

  const handleIsSimulatorInstalled = (newPreference) => {
    controller.setIsSimulatorInstalled(newPreference);
    handleSimulationPreference("Online");
    //ipcRenderer.invoke('edit-preferences-file', { key: "isSimulatorInstalled", value: newPreference })
  };

  const handleOnlineServer = (newServer) => {
    ipcRenderer
      .invoke("get-server", { serverName: newServer })
      .then((result) => {
        if (result === undefined) return;
        if (result.code == 500) {
          showToast("Error", "Failed to get servers", "error", "Ok");
          return;
        }

        setOnlineServer(result.data);
        controller.setOnlineServer(result.data);
      });
  };

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

  return (
    <div className="mb-5 flex flex-row">
      <div>
        <div className="flex flex-row items-center space-x-3">
          <h1 className="font-bold">Simulation Preference</h1>
          <Tooltip target=".simulation-preference">
            Set the default simulation location for the simulation (Locally,
            requires simulator, or Online)
          </Tooltip>
          <i className="pi pi-info-circle mr-2 simulation-preference" />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center space-x-2">
            <RadioButton
              inputId="rb1"
              name="rb"
              value="Local"
              onChange={(e) => {
                handleSimulationPreference(e.target.value);
              }}
              checked={
                controller.simulationPreference == "Local" ? true : false
              }
            />
            {controller.isSimulatorInstalled ? (
              <label htmlFor="rb1" className="p-radiobutton-label">
                Local
              </label>
            ) : (
              <label htmlFor="rb1" className="p-radiobutton-label">
                Local{" "}
                <span className="italic">
                  (Please install simulator locally)
                </span>
              </label>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <RadioButton
              inputId="rb2"
              name="rb"
              value="Online"
              onChange={(e) => {
                handleSimulationPreference(e.target.value);
              }}
              checked={
                controller.simulationPreference == "Online" ? true : false
              }
            />
            <label htmlFor="rb2" className="p-radiobutton-label">
              Online <span className="italic">(Default)</span>
            </label>
          </div>

          <span className="italic">
            Note: Running the simulator locally is resource intensive. Only use
            if your computer is fast.
          </span>
        </div>
      </div>
      {controller.simulationPreference === "Online" && (
        <>
          <Divider layout="vertical" className="w-[1px] bg-gray-400" />
          <div className="flex flex-col gap-2">
            <span>Select server to use:</span>
            <Dropdown
              placeholder="Select server"
              options={servers.servers}
              onChange={(e) => handleOnlineServer(e.target.value)}
              value={onlineServer.serverName ? onlineServer.serverName : null}
              itemTemplate={dropdownServerTemplate}
              valueTemplate={dropdownServerValueTemplate}
            />
            <small className="flex flex-col">
              <span>Server Status:</span>
              <span className="pi text-red-500">
                <span
                  className="pi-circle-fill "
                  style={{ fontSize: "0.5rem" }}
                ></span>
                <span> = Offline</span>
              </span>
              <span className="pi text-green-600">
                <span
                  className="pi-circle-fill "
                  style={{ fontSize: "0.5rem" }}
                ></span>
                <span> = Online</span>
              </span>
            </small>
          </div>
        </>
      )}
    </div>
  );
}
