import Head from "next/head";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import React, { useContext, useLayoutEffect, useRef, useState } from "react";
import { AppController } from "../../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook";
import { Button } from "primereact/button";
import ReportDialog from "../../components/simulator/ReportDialog";
import { reportWithProvider } from "../../hooks/HOC/withReportProvider";
import { ReportContext } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook";
import { Toast } from "primereact/toast";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import DialogAnalyzeTrace from "../../components/traces/DialogAnalyzeTrace";

function SimulatorRuns() {
  const reportCtx = useContext(ReportContext);
  const [simulationsList, setSimulationList] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [analyzeDialogVisible, setAnalyzeDialogVisible] = useState(false);
  const [trace, setTrace] = useState({});
  const [simInfo, setSimInfo] = useState({
    id: null,
    name: "",
    date: "",
    configName: "",
    traceName: "",
  });
  const controller = useContext(AppController);
  const toast = useRef(null);
  const router = useRouter();

  const showToast = (severity, summary, detail) => {
    toast.current.show &&
      toast.current.show({ severity, summary, detail, life: 3000 });
  };

  const openResultDialog = (
    id: number,
    name: string,
    date: string,
    config: string,
    trace: string
  ) => {
    setSimInfo({
      id: id,
      name: name,
      date: date,
      configName: config,
      traceName: trace,
    });
    window.ipc
      .invoke("fetch-report", {
        id,
      })
      .then((result) => {
        if (result.code === 500) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: result.error,
            showCancelButton: true,
            confirmButtonText: "Delete Simulation",
            confirmButtonColor: "#d33",
            reverseButtons: true,
            color: document.documentElement.className.includes("dark")
              ? "white"
              : "",
            background: document.documentElement.className.includes("dark")
              ? "#1f2937"
              : "",
            denyButtonText: "Go to Configurations",
            showDenyButton: true,
            denyButtonColor: "#3085d6",
          }).then((result) => {
            if (result.isDenied) {
              router.push("/configurations");
              return;
            }

            if (result.isConfirmed) {
              accept({ id, name });
              return;
            }
          });
        } else if (result.code === 200) {
          reportCtx.handleReportData(result.data);
          setDialogVisible(true);
        } else {
          setDialogVisible(true);
        }
      });
  };

  const openAnalyzeDialog = (row) => {
    setTrace(row);
    setAnalyzeDialogVisible(true);
  };

  const confirm = (event, row) => {
    confirmPopup({
      target: event.currentTarget,
      message: `Are you sure you want to delete ${row.name}?`,
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      accept: () => accept(row),
    });
  };

  const accept = (row) => {
    window.ipc
      .invoke("delete-simulation", {
        id: row.id,
      })
      .then((result) => {
        if (!result || result.code === 500) {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: result.message
              ? result.message
              : "Error deleting simulation",
            life: 3000,
          });
          return;
        }
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: `${row.name} deleted successfully`,
          life: 3000,
        });
        reload();
      });
  };

  const reloadSimulation = (id) => {
    window.ipc.invoke("refresh-simulation", {
      id,
      simulationMode: "Simulator",
    });
    reload();
  };

  const Buttons = (row: any) => {
    if (row.pid > 0) {
      showToast("info", "Info", `${row.name} in progress`);
      return (
        <div className="flex flex-wrap justify-center">
          <Button
            icon="pi pi-refresh"
            severity="info"
            text
            tooltip="Refresh"
            tooltipOptions={{ position: "left" }}
            onClick={() => reloadSimulation(row.id)}
          />
        </div>
      );
    } else if (row.pid === -2)
      return (
        <div className="flex justify-evenly">
          <Button
            icon="pi pi-exclamation-triangle"
            severity="danger"
            text
            tooltip="View Error"
            onClick={() =>
              openResultDialog(
                row.id,
                row.name,
                row.date,
                row.configuration,
                row.trace
              )
            }
            tooltipOptions={{ position: "left" }}
          />
        </div>
      );

    return (
      <div className="flex justify-between">
        <Button
          icon="pi pi-eye"
          severity="info"
          text
          tooltip="Analyze"
          onClick={() =>
            openResultDialog(
              row.id,
              row.name,
              row.date,
              row.configuration,
              row.trace
            )
          }
        />
        <Button
          icon="pi pi-search"
          severity="help"
          text
          tooltip="Analyze Output Trace"
          onClick={() => openAnalyzeDialog(row)}
        />
        <Button
          icon="pi pi-trash"
          severity="danger"
          text
          tooltip="Delete"
          onClick={(e) => confirm(e, row)}
        />
      </div>
    );
  };

  const convertDate = (row: any) => {
    const d = new Date(row.date);
    return `${d.toLocaleDateString("en-UK")} ${d.getHours()}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  };

  const footer = `In total there are ${
    simulationsList ? simulationsList.length : 0
  } simulator runs stored.`;

  useLayoutEffect(() => {
    reload();
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

  const reload = () => {
    window.ipc.invoke("fetch-simulations-list").then((result) => {
      if (result.code === 500) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Server did not respond",
          life: 3000,
        });
        return;
      }
      setSimulationList(result.data.simulations);
    });
  };

  const handleMLFilesDownload = (row) => {
    window.ipc
      .invoke("zip-files", {
        sim: "simulator",
        type: "ML files",
        id: row.id,
        name: row.name,
      })
      .then((result) => {
        if (!result || result.code === 500) {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: result.error ? result.error : "Error downloading ML files",
            life: 3000,
          });
        } else if (result.code === 404) {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "No ML files found/generated",
            life: 3000,
          });
        } else if (result.code === 200) {
          toast.current.show({
            severity: "success",
            summary: "Success",
            detail: "ML files downloaded",
            life: 3000,
          });
        }
      });
  };

  const mlFilesEnabled = (row: any) => {
    return (
      <>
        {row.areMLFilesEnabled ? (
          <div className="flex justify-around items-center px-4">
            <Button
              icon="pi pi-download"
              severity="secondary"
              className="download-button"
              text
              onClick={() => handleMLFilesDownload(row)}
            />
          </div>
        ) : (
          <div className="text-center">
            <i className={"pi pi-times text-red-500"} />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col p-5 w-full h-full">
      <Head>
        <title>DITIS Simulator: Simulator</title>
      </Head>
      <Toast ref={toast} />
      <ConfirmPopup />
      <div className="flex flex-col justify-between mt-5 mb-5">
        <h1 className="text-3xl font-bold">Completed Simulations</h1>
        <div className="mt-10">
          <DataTable
            value={simulationsList}
            footer={footer}
            paginator
            rows={10}
            rowsPerPageOptions={[10, 25, 50]}
            tableStyle={{ minWidth: "90%" }}
            showGridlines
            scrollable
            sortField="id"
            sortOrder={-1}
            size="small"
          >
            <Column field="id" header="ID" sortable />
            <Column field="name" header="Name" sortable />
            <Column field="date" sortable body={convertDate} header="Date" />
            <Column field="trace" header="Trace" sortable />
            <Column field="configuration" header="Configuration" sortable />
            <Column
              field="areMLFilesEnabled"
              body={mlFilesEnabled}
              header="ML Files Enabled"
            />
            <Column body={Buttons} header="Actions" />
          </DataTable>
        </div>
      </div>
      <ReportDialog
        simInfo={simInfo}
        showReportDialog={dialogVisible}
        setShowReportDialog={setDialogVisible}
        dialogMode={true}
      />
      {analyzeDialogVisible && (
        <DialogAnalyzeTrace
          analyzeDialogVisible={analyzeDialogVisible}
          handleClose={() => {
            setAnalyzeDialogVisible(false);
            setTrace({});
          }}
          type="simulator"
          trace={trace}
          showToast={showToast}
        />
      )}
    </div>
  );
}

export default reportWithProvider(SimulatorRuns);
