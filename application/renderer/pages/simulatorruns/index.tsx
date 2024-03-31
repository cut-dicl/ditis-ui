import Head from "next/head";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import React, { useContext, useLayoutEffect, useRef, useState } from "react";
import { AppController } from "../../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook";
import { Button } from "primereact/button";
import ReportDialog from "../../components/simulator/ReportDialog";
import { ipcRenderer } from "electron";
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
  const [trace, setTrace] = useState(-1);
  const controller = useContext(AppController);
  const toast = useRef(null);
  const router = useRouter();

  const showToast = (severity, summary, detail) => {
    toast.current.show &&
      toast.current.show({ severity, summary, detail, life: 3000 });
  };

  const openResultDialog = (id: number, name: string) => {
    ipcRenderer
      .invoke("fetch-report", {
        id,
        name,
        auth: controller.onlineServer.auth,
        address: controller.onlineServer.address,
        mode: controller.mode,
      })
      .then((result) => {
        if (result.code === 200 || !result) {
          reportCtx.handleReportData(result.data);
          setDialogVisible(true);
        } else {
          setDialogVisible(true);
        }
      });
  };

  const openAnalyzeDialog = (id: any) => {
    setTrace(id);
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
    ipcRenderer
      .invoke("delete-simulation", {
        id: row.id,
        name: row.name,
        auth: controller.onlineServer.auth,
        address: controller.onlineServer.address,
        mode: controller.mode,
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
          detail: result.message,
          life: 3000,
        });
        reload();
      });
  };

  const Buttons = (row: any) => {
    return (
      <div className="flex justify-between">
        <Button
          icon="pi pi-eye"
          severity="info"
          text
          tooltip="Analyze"
          onClick={() => openResultDialog(row.id, row.name)}
        />
        <Button
          icon="pi pi-search"
          severity="help"
          text
          tooltip="Analyze Output Trace"
          onClick={() => openAnalyzeDialog(row.id)}
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
          color: document.documentElement.className == "dark" ? "white" : "",
          background:
            document.documentElement.className == "dark" ? "#1f2937" : "",
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
        color: document.documentElement.className == "dark" ? "white" : "",
        background:
          document.documentElement.className == "dark" ? "#1f2937" : "",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/preferences");
        }
      });
    } else {
      reload();
    }
  }, []);

  const reload = () => {
    ipcRenderer
      .invoke("fetch-simulations-list", {
        auth: controller.onlineServer.auth,
        mode: controller.mode,
        address: controller.onlineServer.address,
      })
      .then((result) => {
        console.log(result);
        if (result.code === 500) {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: result.error
              ? result.error
              : "Error fetching simulation list",
            life: 3000,
          });
          return;
        }
        setSimulationList(result.data.simulations);
      });
  };

  const handleMLFilesDownload = (row) => {
    ipcRenderer
      .invoke("zip-files", {
        sim: "simulations",
        type: "ML files",
        auth: controller.onlineServer.auth,
        address: controller.onlineServer.address,
        mode: controller.mode,
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
        showReportDialog={dialogVisible}
        setShowReportDialog={setDialogVisible}
        dialogMode={true}
      />
      <DialogAnalyzeTrace
        analyzeDialogVisible={analyzeDialogVisible}
        handleClose={() => {
          setAnalyzeDialogVisible(false);
          setTrace(-1);
        }}
        type="simulator"
        id={trace}
        showToast={showToast}
      />
    </div>
  );
}

export default reportWithProvider(SimulatorRuns);
