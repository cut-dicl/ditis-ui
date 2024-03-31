import Head from "next/head";
import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { AppController } from "../../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Tooltip } from "primereact/tooltip";
import { ipcRenderer } from "electron";
import { Divider } from "primereact/divider";
import { Checkbox } from "primereact/checkbox";
import { showSwalWithButton } from "../../utils/SwalFunctions";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import SimulationsTable from "../../components/generic/SimulationsTable";
import { useSimulationsTable } from "../../hooks/custom-hooks/useSimulationsTable";
import { Panel } from "primereact/panel";
import { ReportProvider } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook-provider";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function Optimizer() {
  const controller = useContext(AppController);
  const {
    toast,
    simulations,
    terminateSimulation,
    reloadSimulations,
    handleSimulationsTableData,
    dialogVisible,
    setDialogVisible,
    simulationSelected,
    openResultDialog,
    simulationMode,
    deleteSimulation,
    clearSimulation,
  } = useSimulationsTable("Optimizer");
  const [traceList, setTraceList] = useState([]);
  const [configurationList, setConfigurationList] = useState({
    variance: [],
    optimizer: [],
    storage: [],
  });
  const [options, setOptions] = useState({
    reportsEnabled: false,
    tracesEnabled: false,
    name: "",
    maxEvents: "",
    maxMemory: "",
    configuration: {
      variance: "",
      optimizer: "",
      storage: "",
    },
    trace: "",
  });
  const [error, setError] = useState({ maxEvents: "", maxMemory: "" });
  const [running, setRunning] = useState(false);
  const router = useRouter();
  const startRef = useRef(null);
  const showToast = (severity, summary, detail) => {
    toast.current.show({ severity, summary, detail, life: 3000 });
  };
  

  useLayoutEffect(() => {
    getTraceList();
    reloadSimulations();
    getConfigurationList();
  }, []);

  useEffect(() => {
    if (controller.javaPath === "" && controller.mode === "Local") {
      if(controller.appLoaded === true)
      Swal.fire({
        title: "Local mode is set without simulator installed",
        text: "Please configure the simulator in preferences",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Configure",
        reverseButtons: true,
        color: document.documentElement.className == "dark" ? "white" : "",
        background:
          document.documentElement.className == "dark" ? "#1f2937" : "",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/preferences");
        }
      });
    } else if(controller.mode === "Online" && controller.onlineServer.address === "") {
      Swal.fire({
        title: "Online mode is set without a server selected",
        text: "Please configure the server to use in preferences",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Configure",
        reverseButtons: true,
        color: document.documentElement.className == "dark" ? "white" : "",
        background:
          document.documentElement.className == "dark" ? "#1f2937" : "",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/preferences");
        }
      });
    }
  }, []);

  useEffect(() => {
    if (
      (options.maxEvents.length > 0 && isNaN(Number(options.maxEvents))) ||
      (options.maxEvents.length > 0 && Number(options.maxEvents) <= 0)
    ) {
      setError((prev) => ({ ...prev, maxEvents: "border-red-500" }));
    } else {
      setError((prev) => ({ ...prev, maxEvents: "" }));
    }
  }, [options.maxEvents]);

  useEffect(() => {
    if (
      (options.maxMemory.length > 0 && isNaN(Number(options.maxMemory))) ||
      (options.maxMemory.length > 0 && Number(options.maxMemory) <= 0)
    ) {
      setError((prev) => ({ ...prev, maxMemory: "border-red-500" }));
    } else {
      setError((prev) => ({ ...prev, maxMemory: "" }));
    }
  }, [options.maxMemory]);

  const getTraceList = () => {
    ipcRenderer
      .invoke("get-trace-list", {
        mode: controller.mode,
        address: controller.onlineServer.address,
        auth: controller.onlineServer.auth,
      })
      .then((result) => {
        if (!result || result.code !== 200) {
          showToast("error", "Error", result.error);
          return;
        }

        const arr = [];
        result.data.forEach((trace) => {
          arr.push(trace.name);
        });
        setTraceList(arr);
      });
  };

  const getConfigurationList = () => {
    const conflist = {
      variance: [{ id: 0, name: "Default Variance Configuration" }],
      optimizer: [{ id: 0, name: "Default Optimizer Configuration" }],
      storage: [{ id: 0, name: "Default Storage Configuration" }],
    };

    ipcRenderer.invoke('get-configs', {
      mode: controller.mode,
      address: controller.onlineServer.address ? controller.onlineServer.address : null,
      auth: controller.onlineServer.auth ? controller.onlineServer.auth : null,
    }).then((result) => {
      if (!result) {
        showToast("error", "Error", "Failed to get configurations");
        return;
      }
      if (result.code !== 200) {
        showToast("error", "Error", result.error);
      }


      if (result.content && result.content.configurations) {
        let data = result.content.configurations.reduce((result, current) => {
          if (current && current.type) {
            const lowercaseType = (current.type).toLowerCase();
            result[lowercaseType] = result[lowercaseType] || [];
            result[lowercaseType].push(current);
          }
          return result;
        }, {});

        Object.keys(data).forEach((key) => {
          data[key].forEach((item) => {
            conflist[key].push({ id: item.id, name: item.name });
          });
        });
      }
      setConfigurationList(conflist);
      });
  };

  const startOptimizer = async (e) => {
    e.preventDefault();
    setRunning(true);
    await ipcRenderer
      .invoke("run-optimizer", {
        trace: options.trace,
        configuration: options.configuration,
        reportsEnabled: options.reportsEnabled,
        tracesEnabled: options.tracesEnabled,
        name: options.name,
        mode: controller.mode,
        javaPath: controller.javaPath,
        maxEvents: options.maxEvents,
        maxMemory: options.maxMemory,
        address: controller.onlineServer.address ? controller.onlineServer.address : null,
        auth: controller.onlineServer.auth ? controller.onlineServer.auth : null,
        debugEnabled: controller.debugEnabled,
      })
      .then((result) => {
        setRunning(false);
        if (!result) {
          showSwalWithButton(
            "Error",
            "An unknown error occured",
            "error",
            "Ok"
          );
          return;
        } else if (!result.data || result.data.id === -1 || result.code !== 200) {
          showSwalWithButton("Error", result.error ? result.error : "An unknown error Occured", "error", "Ok", null, "80%");
          return;
        }
        handleSimulationsTableData(result);
      });
    
  };

  return (
    <div className="flex flex-col p-5 w-full">
      <Head>
        <title>DITIS Simulator: Optimizer</title>
      </Head>
      <div className="flex flex-col justify-between mt-5 mb-5">
        <h1 className="text-3xl font-bold">New Optimization </h1>
        <Toast ref={toast} />

        <div className="justify-between flex flex-col mt-10">
          <div className="flex flex-row flex-wrap gap-5">
            <Panel header="Configurations">
              {/*Configurations*/}
              <div className="flex flex-row flex-wrap gap-5">
                <span className="p-float-label mt-5">
                  <Dropdown
                    inputId="dd-configuration"
                    className="w-[20rem]"
                    value={options.configuration.storage}
                    options={configurationList.storage.map((item) => {
                      return { label: item.name, value: item.name };
                    })}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        configuration: {
                          ...options.configuration,
                          storage: e.value,
                        },
                      })
                    }
                  />
                  <label htmlFor="dd-configuration">
                    Select Storage Configuration
                  </label>
                </span>                
                <span className="p-float-label mt-5">
                  <Dropdown
                    inputId="dd-optimizer"
                    className="w-[20rem]"
                    options={configurationList.optimizer.map((item) => {
                      return { label: item.name, value: item.name };
                    })}
                    value={options.configuration.optimizer}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        configuration: {
                          ...options.configuration,
                          optimizer: e.value,
                        },
                      })
                    }
                  />
                  <label htmlFor="dd-optimizer">
                    Select Optimizer Configuration
                  </label>
                </span>
                <span className="p-float-label mt-5">
                  <Dropdown
                    inputId="dd-variance"
                    className="w-[20rem]"
                    options={configurationList.variance.map((item) => {
                      return { label: item.name, value: item.name };
                    })}
                    value={options.configuration.variance}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        configuration: {
                          ...options.configuration,
                          variance: e.value,
                        },
                      })
                    }
                  />
                  <label htmlFor="dd-variance">
                    Select Variance Configuration
                  </label>
                </span>
              </div>
            </Panel>

            {/*Trace*/}
            <Panel header="Trace" className="flex-1">
              <span className="p-float-label mt-5">
                <Dropdown
                  inputId="dd-trace"
                  className="w-[20rem]"
                  showClear={options.trace !== ""}
                  options={traceList}
                  value={options.trace}
                  onChange={(e) =>
                    setOptions({ ...options, trace: e.value })
                  }
                />
                <label htmlFor="dd-trace">Select Trace</label>
              </span>
            </Panel>
          </div>

          {/*Options*/}
          <Panel header="Options" className="mt-5">
            <div className="flex flex-row flex-wrap gap-10">
              {/*Name of simulation*/}
              <div className="flex flex-col">
                <span className="text-xl">Name of Optimization:</span>
                <InputText
                  className="w-[300px] mt-2"
                  placeholder="Please enter name"
                  onChange={(e) => setOptions({ ...options, name: e.target.value })}
                  value={options.name}
                />
              </div>

              <div className="flex flex-col">
                <span className="text-xl">
                  Max Events:
                  <i
                    className="tt-maxEvents pi pi-question-circle ml-2"
                    data-pr-tooltip="Limits the optimizer to these number of events of the trace, leave blank to execute entire trace"
                  ></i>
                  <Tooltip
                    target=".tt-maxEvents"
                    className="w-[500px]"
                    position="top"
                  />
                </span>
                <InputText
                  className={"mt-2 " + error.maxEvents}
                  placeholder="Max Events"
                  onChange={(e) => setOptions({ ...options, maxEvents: e.target.value })}
                  value={options.maxEvents}
                />
                <small
                  className={error.maxEvents === "" ? "" : "text-[#dc2626]"}
                >
                  {error.maxEvents === ""
                    ? "Leave blank for no limit."
                    : "Please enter a valid number."}
                </small>
              </div>
              <div className="flex flex-col">
                <span className="text-xl">
                  Max JVM Memory (GB):
                  <i
                    className="tt-maxEvents pi pi-question-circle ml-2"
                    data-pr-tooltip="Changes the max memory allocated to the JVM, leave blank for default value. Positive Integer, e.g. 2 for 2GB."
                  ></i>
                  <Tooltip
                    target=".tt-maxMemory"
                    className="w-[500px]"
                    position="top"
                  />
                </span>
                <InputText
                  className={"mt-2 " + error.maxMemory}
                  placeholder="Max JVM Memory (GB)"
                  onChange={(e) => setOptions({ ...options, maxMemory: e.target.value })}
                  value={options.maxMemory}
                />
                <small
                  className={error.maxMemory === "" ? "" : "text-[#dc2626]"}
                >
                  {error.maxMemory === ""
                    ? "Leave blank for default max."
                    : "Please enter a valid number."}
                </small>
              </div>

              <div className="flex flex-col justify-center">
                <div>
                  <Checkbox
                    inputId="cb-reports"
                    name="reports"
                    className="mt-2"
                    checked={options.reportsEnabled}
                    onChange={(e) => setOptions({ ...options, reportsEnabled: e.checked })}
                  />
                  <label htmlFor="cb-reports" className="ml-2">
                    Generate report files
                  </label>
                  <i
                    className="tt-reports pi pi-question-circle ml-2"
                    data-pr-tooltip="Enables the generation of simulation report files of each simulation.
            Warning: This can create a lot of files!"
                  ></i>
                  <Tooltip
                    target=".tt-reports"
                    className="w-[500px]"
                    position="top"
                  />
                </div>
                <div className="mt-2">
                  <Checkbox
                    inputId="cb-traces"
                    name="trace"
                    checked={options.tracesEnabled}
                    onChange={(e) => setOptions({ ...options, tracesEnabled: e.checked })}
                  />
                  <label htmlFor="cb-traces" className="ml-2">
                    Generate output trace files
                  </label>
                  <i
                    className="tt-traces pi pi-question-circle ml-2"
                    data-pr-tooltip="Enables the generation of output trace files of each simulation.
            Warning: This can create a lot of files!"
                  ></i>
                  <Tooltip
                    target=".tt-traces"
                    className="w-[500px]"
                    position="top"
                  />
                </div>
              </div>
            </div>
          </Panel>

          {/*Start Button*/}
          <div className="flex flex-col my-5">
            <Button
              id="optimizerButton"
              disabled={
                options.trace.length == 0 ||
                (options.configuration.storage && options.configuration.storage.length == 0)
              }
              label={running ? "Optimization Running" : "Start Optimizer"}
              onClick={startOptimizer}
              loading={running}
              style={{ width: "fit-content" }}
              ref={startRef}
            ></Button>
            <small className="italic">
              {controller.debugEnabled ? "Debug mode enabled" : ""}
            </small>
          </div>
        </div>
        <Divider className="h-[1px] bg-gray-400" />
        <ReportProvider>
          <SimulationsTable
            simulationMode={simulationMode}
            simulations={simulations}
            terminateSimulation={terminateSimulation}
            openResultDialog={openResultDialog}
            dialogVisible={dialogVisible}
            setDialogVisible={setDialogVisible}
            simulationSelected={simulationSelected}
            deleteSimulation={deleteSimulation}
            clearSimulation={clearSimulation}
            showToast={showToast}
          />
        </ReportProvider>
      </div>
    </div>
  );
}
