import Head from "next/head";
import React, { useContext, useEffect, useState } from "react";
import { AppController } from "../../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { useConfPage } from "../../hooks/custom-hooks/useConfPage";
import { ProgressSpinner } from "primereact/progressspinner";
import { useTraces } from "../../hooks/custom-hooks/useTraces";
import { Tooltip } from "primereact/tooltip";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { reportWithProvider } from "../../hooks/HOC/withReportProvider";
import SimulationsTable from "../../components/generic/SimulationsTable";
import { showSwalWithButton } from "../../utils/SwalFunctions";
import { useSimulationsTable } from "../../hooks/custom-hooks/useSimulationsTable";
import { Toast } from "primereact/toast";
import { Panel } from "primereact/panel";
import { Divider } from "primereact/divider";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

interface ISimulatorData {
  selectedConfig: string;
  configsList: string[];
  selectedTrace: string;
  tracesList: string[];
  name: string;
  maxEvents: string;
  maxMemory: string;
}

const Simulator = () => {
  const controller = useContext(AppController);
  const { traces, isLoadingTraces } = useTraces();
  const [areMLFilesEnabled, setAreMLFilesEnabled] = useState(false);
  const [simulatorFormData, setSimulatorFormData] = useState<ISimulatorData>({
    selectedConfig: "",
    configsList: ["Default Storage Configuration"],
    selectedTrace: "",
    tracesList: [],
    name: "",
    maxEvents: "",
    maxMemory: "",
  });
  const {
    toast,
    simulations,
    dialogVisible,
    simulationSelected,
    simulationMode,
    terminateSimulation,
    reloadSimulations,
    handleSimulationsTableData,
    setDialogVisible,
    openResultDialog,
    clearSimulation,
    deleteSimulation,
  } = useSimulationsTable("Simulator");
  const { data, isLoading } = useConfPage(undefined, undefined, toast);
  const [error, setError] = useState({ maxevents: "", maxmemory: "" });
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const router = useRouter();
  const showToast = (severity, summary, detail) => {
    toast.current.show({ severity, summary, detail, life: 3000 });
  };

  useEffect(() => {
    const storageConfigs = data.filter((item) => item.type === "Storage");
    setSimulatorFormData((prevState) => ({
      ...prevState,
      configsList: [
        ...prevState.configsList,
        ...storageConfigs.map((item) => {
          return item.name;
        }),
      ],
    }));
  }, [data]);

  useEffect(() => {
    if (!traces || traces.length === 0) return;
    setSimulatorFormData((prevState) => ({
      ...prevState,
      tracesList: traces.map((item) => {
        return item.name;
      }),
    }));
  }, [traces]);

  useEffect(() => {
    reloadSimulations();
    if (controller.javaPath === "" && controller.mode === "Local") {
      if (controller.appLoaded === true)
        Swal.fire({
          title: "Local mode is set without simulator installed",
          text: "Please configure the simulator in preferences",
          icon: "warning",
          showCancelButton: true,
          cancelButtonText: "Cancel",
          confirmButtonText: "Configure",
          reverseButtons: true,
          color: document.documentElement.className.includes("dark")
            ? "white"
            : "",
          background: document.documentElement.className.includes("dark")
            ? "#1f2937"
            : "",
        }).then((result) => {
          if (result.isConfirmed) {
            router.push("/preferences");
          }
        });
    } else if (
      controller.mode === "Online" &&
      controller.onlineServer.address === ""
    ) {
      Swal.fire({
        title: "Online mode is set without a server selected",
        text: "Please configure the server to use in preferences",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Configure",
        reverseButtons: true,
        color: document.documentElement.className.includes("dark")
          ? "white"
          : "",
        background: document.documentElement.className.includes("dark")
          ? "#1f2937"
          : "",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/preferences");
        }
      });
    }
  }, []);

  const handleSimulatorFormDataChange = (eventChange: any) => {
    if (
      eventChange.target.name === "selectedTrace" &&
      eventChange.target.value === "Add new"
    ) {
      router.push("/traces");
    } else if (
      eventChange.target.name === "selectedConfig" &&
      eventChange.target.value === "Add new"
    ) {
      router.push("/configurations");
    }
    if (
      eventChange.target.name === "maxEvents" ||
      eventChange.target.name === "maxMemory"
    ) {
      if (!eventChange.target.value.match(/^\d*$/)) setButtonDisabled(true);
      else setButtonDisabled(false);
    }

    setSimulatorFormData((prevState) => ({
      ...prevState,
      [eventChange.target.name]: eventChange.target.value,
    }));
  };

  const startSimulation = () => {
    Swal.fire({
      title: "Setting up Simulation...",
      allowOutsideClick: false,
      showConfirmButton: false,
      color: document.documentElement.className.includes("dark") ? "white" : "",
      background: document.documentElement.className.includes("dark")
        ? "#1f2937"
        : "",
      didOpen: () => {
        Swal.showLoading();
      },
    });
    window.ipc
      .invoke("run-simulator", {
        trace: simulatorFormData.selectedTrace,
        configuration: simulatorFormData.selectedConfig,
        areMLFilesEnabled: areMLFilesEnabled,
        name: simulatorFormData.name ? simulatorFormData.name : "",
        maxEvents: simulatorFormData.maxEvents,
        maxMemory: simulatorFormData.maxMemory,
      })
      .then((result) => {
        Swal.close();
        if (result.code === 200 || !result) {
          handleSimulationsTableData(result);
        } else if (result.code === 500) {
          showSwalWithButton("Error", result.error.message, "error", "OK");
        }
      });
  };

  if (isLoadingTraces || isLoading) {
    // add isLoading
    // @ts-ignore
    return (
      <div style={{ textAlign: "center", padding: "25% 0" }}>
        <ProgressSpinner />
        <Toast ref={toast} />
        <h1>Setting up simulation form...</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-5 w-full">
      <Head>
        <title>DITIS Simulator: Simulator</title>
      </Head>
      <div className="flex flex-col justify-between mt-5 mb-5">
        <h1 className="text-3xl font-bold">New Simulation</h1>
        <Toast ref={toast} />

        <div className="justify-between flex flex-col mt-10">
          <div className="flex flex-row flex-wrap gap-5">
            <Panel header="Configurations" className="grow">
              <div className="flex flex-row">
                <span className="p-float-label mt-5">
                  <Dropdown
                    inputId="dd-configuration"
                    className="w-[20rem]"
                    name="selectedConfig"
                    value={simulatorFormData.selectedConfig}
                    options={[
                      ...simulatorFormData.configsList,
                      { label: "+ Add new", value: "Add new" },
                    ]}
                    onChange={handleSimulatorFormDataChange}
                  />
                  <label htmlFor="dd-configuration">
                    Select Storage Configuration
                  </label>
                </span>
              </div>
            </Panel>

            <Panel header="Trace" className="grow">
              <span className="p-float-label mt-5">
                <Dropdown
                  inputId="dd-trace"
                  className="w-[20rem]"
                  name="selectedTrace"
                  value={simulatorFormData.selectedTrace}
                  options={[
                    ...simulatorFormData.tracesList,
                    { label: "+ Add new", value: "Add new" },
                  ]}
                  onChange={handleSimulatorFormDataChange}
                />
                <label htmlFor="dd-configuration">Select Trace</label>
              </span>
            </Panel>
          </div>

          <Panel header="Options" className="mt-5">
            <div className="flex flex-wrap gap-10">
              <div className="flex flex-col">
                <span className="text-xl">Name of Simulation</span>
                <InputText
                  className="w-[25rem] mt-2"
                  name="name"
                  placeholder="Enter a simulation name..."
                  value={simulatorFormData.name}
                  onChange={handleSimulatorFormDataChange}
                />
                <small
                  className={error.maxmemory === "" ? "" : "text-[#dc2626]"}
                >
                  {error.maxmemory === ""
                    ? "Leave blank for default name."
                    : "Please enter a valid number."}
                </small>
              </div>

              <div className="flex flex-col">
                <span className="text-xl">
                  Max Events:
                  <i
                    className="tt-maxevents pi pi-question-circle ml-2"
                    data-pr-tooltip="Limits the optimizer to these number of events of the trace, leave blank to execute entire trace"
                  ></i>
                  <Tooltip
                    target=".tt-maxevents"
                    className="w-[500px]"
                    position="top"
                  />
                </span>
                <InputText
                  className="mt-2"
                  name="maxEvents"
                  placeholder="Max number of events"
                  value={simulatorFormData.maxEvents}
                  onChange={handleSimulatorFormDataChange}
                />
                <small
                  className={error.maxmemory === "" ? "" : "text-[#dc2626]"}
                >
                  {error.maxmemory === ""
                    ? "Leave blank for no limit."
                    : "Please enter a valid number."}
                </small>
              </div>

              <div className="flex flex-col">
                <span className="text-xl">
                  Max JVM Memory (GB):
                  <i
                    className="tt-maxevents pi pi-question-circle ml-2"
                    data-pr-tooltip="Changes the max memory allocated to the JVM, leave blank for default value. Positive Integer, e.g. 2 for 2GB."
                  ></i>
                  <Tooltip
                    target=".tt-maxmemory"
                    className="w-[500px]"
                    position="top"
                  />
                </span>
                <InputText
                  className={"mt-2 " + error.maxmemory}
                  placeholder="Max JVM Memory (GB)"
                  name="maxMemory"
                  onChange={handleSimulatorFormDataChange}
                  value={simulatorFormData.maxMemory}
                />
                <small
                  className={error.maxmemory === "" ? "" : "text-[#dc2626]"}
                >
                  {error.maxmemory === ""
                    ? "Leave blank for default max."
                    : "Please enter a valid number."}
                </small>
              </div>

              <div className="flex flex-col justify-center">
                <div>
                  <Checkbox
                    inputId="cb-ml-files"
                    checked={areMLFilesEnabled}
                    onChange={() => setAreMLFilesEnabled((prev) => !prev)}
                    className="mt-2"
                  />
                  <label htmlFor="cb-ml-files" className="ml-2">
                    Export ml files
                  </label>
                  <i
                    className="tt-mlFiles pi pi-question-circle ml-2"
                    data-pr-tooltip="Enables the generation of the ML files.
                    (Requires data profiler to be enabled in the configuration)"
                  ></i>
                  <Tooltip
                    target=".tt-mlFiles"
                    className="w-[500px]"
                    position="top"
                  />
                </div>
              </div>
            </div>
          </Panel>

          <div className="my-5">
            <Button
              id="simulatorButton"
              disabled={
                simulatorFormData.selectedConfig.length === 0 ||
                simulatorFormData.selectedTrace.length === 0 ||
                buttonDisabled
              }
              label="Start Simulation"
              onClick={startSimulation}
            ></Button>
          </div>
        </div>
        <Divider className="h-[1px] bg-gray-400" />
        <SimulationsTable
          simulationMode={simulationMode}
          simulations={simulations}
          terminateSimulation={terminateSimulation}
          openResultDialog={openResultDialog}
          dialogVisible={dialogVisible}
          setDialogVisible={setDialogVisible}
          simulationSelected={simulationSelected}
          clearSimulation={clearSimulation}
          deleteSimulation={deleteSimulation}
          showToast={showToast}
        />
      </div>
    </div>
  );
};

export default reportWithProvider(Simulator);
