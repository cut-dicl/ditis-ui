import { ipcRenderer } from "electron";
import { AppController } from "../../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook";
import { useContext, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { ReportContext } from "../useContext-hooks/simulator-report-hook/simulator-report-hook";

export type simulationModeType = "Simulator" | "Optimizer";

export const useSimulationsTable = (simulationMode: simulationModeType) => {
  const controller = useContext(AppController);
  const reportCtx = useContext(ReportContext);
  const toast = useRef(null);
  const [simulations, setSimulations] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [simulationSelected, setSimulationSelected] = useState({
    name: "",
    id: -1,
  });

  const showToast = (severity, summary, detail) => {
    if (toast.current) {
      toast.current.show({ severity, summary, detail, life: 3000 });
    }
  };

  useEffect(() => {
    setDialogVisible(true);
  }, [simulationSelected]);

  const terminateSimulation = (pid: number, id: number, name?: string) => {
    Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Terminate",

      color: document.documentElement.className == "dark" ? "white" : "",
      background: document.documentElement.className == "dark" ? "#1f2937" : "",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Terminating...",
          text: "Please wait",
          allowOutsideClick: false,
          allowEscapeKey: false,

          color: document.documentElement.className == "dark" ? "white" : "",
          background:
            document.documentElement.className == "dark" ? "#1f2937" : "",
          didOpen: () => {
            Swal.showLoading();
          },
        });
        ipcRenderer
          .invoke("terminate-simulation", {
            mode: controller.mode,
            simulationMode,
            pid,
            id,
            name: name ?? null,
            auth: controller.onlineServer.auth,
            address: controller.onlineServer.address,
          })
          .then((result) => {
            if (result.code === 500) {
              showToast("error", "Error", result.error);
              Swal.close();
              return;
            }
            setSimulations((prevSimulations) => {
              const newSimulations = [...prevSimulations];
              newSimulations.forEach((sim, index) => {
                if (sim.id === id && sim.status !== "Terminated") {
                  newSimulations[index].status = "Terminated";
                  newSimulations[index].date = sim.date;
                  newSimulations[index].pid = "N/A";
                }
              });
              return newSimulations;
            });

            Swal.close();
            showToast(
              "success",
              "Success",
              "Successfully terminated simulation"
            );
          });
      }
    });
  };

  const refreshOptimization = (id: number, index) => {
    ipcRenderer
      .invoke("refresh-simulation", {
        mode: controller.mode,
        id,
        simulationMode,
        auth: controller.onlineServer.auth,
        address: controller.onlineServer.address,
      })
      .then((result) => {
        console.log(result);
        if (result && result.code && result.code === 500) {
          return;
        }
        if (result && result.data && result.data.id != id) return;

        if (result && result.data && result.data.pid > 0) {
          setTimeout(() => {
            refreshOptimization(id, index);
          }, 2000);
          return;
        }

        setSimulations((prevSimulations) => {
          if (prevSimulations[index].status === "Terminated")
            return prevSimulations;
          const newSimulations = [...prevSimulations];
          newSimulations[index].status =
            result.data.pid > 0 ? "Running" : "Finished";
          newSimulations[index].date = result.data.date;
          newSimulations[index].pid =
            result.data.pid === 0 ? "N/A" : result.data.pid;
          return newSimulations;
        });
      });
  };

  const reloadSimulations = () => {
    ipcRenderer
      .invoke("get-running-simulations", {
        running: simulations,
        simulationMode,
      })
      .then((result) => {
        if (result.code == 500 || !result.data) {
          setSimulations([]);
          showToast("error", "Error", "Failed to get running simulations");
        }
        let sim = result.data;
        if (!sim || sim.length === 0) return setSimulations([]);
        sim.forEach((sim) => {
          if (sim.pid > 0) {
            sim["status"] = "Running";
          }
        });
        setSimulations(sim);
        setTimeout(() => {
          result.data.forEach((sim) => {
            if (sim.pid > 0) refreshOptimization(sim.id, simulations.length);
          });
        }, 2000);
      });
  };

  const handleSimulationsTableData = (result) => {
    const newSimulations = [...simulations];
    newSimulations.push({
      id: result.data.id,
      name: result.data.name,
      status: result.data.pid > 0 ? "Running" : "Finished",
      date: Date.now(),
      pid: result.data.pid,
    });
    const index = simulations.length;
    setSimulations(newSimulations);
    showToast("success", "Success", "Successfully started simulation");
    setTimeout(() => {
      refreshOptimization(result.data.id, index);
    }, 2000);
  };

  const openResultDialog = (id: number, name?: string) => {
    if (simulationMode === "Simulator") {
      ipcRenderer
        .invoke("fetch-report", {
          id,
          name,
          auth: controller.onlineServer.auth,
          address: controller.onlineServer.address,
          mode: controller.mode,
        })
        .then((result) => {
          console.log(result);
          if (result.code === 200) reportCtx.handleReportData(result.data);
        });
    } else if (simulationMode === "Optimizer") {
      ipcRenderer.invoke("fetch-optimizer-report", { id }).then((result) => {
        if (result.code === 200) reportCtx.handleReportData(result.data);
      });
    }

    if (id === simulationSelected.id) setDialogVisible(true);
    else setSimulationSelected({ name, id });
  };

  const clearSimulation = (id: number, date?: number) => {
    let simulation;
    if (!date) simulation = simulations.filter((item) => item.id !== id);
    else
      simulation = simulations.filter(
        (item) => item.id === id && item.date === date
      );
    if (simulation.length === 0) return;
    setSimulations((prevSimulations) =>
      prevSimulations.filter((item) => item !== simulation[0])
    );
  };

  const deleteSimulation = (id: number, name: string) => {
    if (simulationMode === "Optimizer") {
      ipcRenderer
        .invoke("delete-optimization", {
          id: id,
          mode: controller.mode,
          address: controller.onlineServer.address
            ? controller.onlineServer.address
            : null,
          auth: controller.onlineServer.auth
            ? controller.onlineServer.auth
            : null,
        })
        .then((result) => {
          if (result.code === 500) {
            showToast("error", "Error", result.error);
            return;
          }

          clearSimulation(id);
          showToast(
            "success",
            "Success",
            `${name} Optimization deleted succesfully`
          );
        });
    } else {
      ipcRenderer.invoke("delete-simulation", { id, name }).then((result) => {
        if (!result || result.code === 500) return;
        clearSimulation(id);
      });
    }
  };

  return {
    toast,
    simulations,
    dialogVisible,
    simulationSelected,
    simulationMode,
    setDialogVisible,
    openResultDialog,
    terminateSimulation,
    refreshOptimization,
    reloadSimulations,
    handleSimulationsTableData,
    clearSimulation,
    deleteSimulation,
  };
};