import Head from "next/head";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import React, {
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  use,
} from "react";
import { AppController } from "../../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook";
import { Button } from "primereact/button";
import { ipcRenderer } from "electron";
import { Divider } from "primereact/divider";
import { DialogResult } from "../../components/optimizer/DialogResult";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { Toast } from "primereact/toast";
import { Row } from "primereact/row";
import { ColumnGroup } from "primereact/columngroup";
import { ReportProvider } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook-provider";
import { reportWithProvider } from "../../hooks/HOC/withReportProvider";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

function OptimizerRuns() {
  const controller = useContext(AppController);
  const [optimizations, setOptimizations] = useState([] as any[]);
  const [optimizationSelected, setOptimizationSelected] = useState({
    name: "",
    id: -1,
  });
  const [dialogVisible, setDialogVisible] = useState(false);
  const toast = useRef(null);
  const showToast = (severity, summary, detail) => {
    toast.current.show &&
      toast.current.show({ severity, summary, detail, life: 3000 });
  };
  const router = useRouter();

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
      .invoke("delete-optimization", {id: row.id})
      .then((result) => {
        if (result.code === 500) {
          showToast("error", "Error", result.error);
          return;
        }
        reloadOptimizations();
        showToast(
          "success",
          "Success",
          `${row.name} deleted succesfully`
        );
      });
  };

  useLayoutEffect(() => {
    reloadOptimizations();
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
          color: document.documentElement.className.includes("dark") ? "white" : "",
          background:
            document.documentElement.className.includes("dark") ? "#1f2937" : "",
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
        color: document.documentElement.className.includes("dark") ? "white" : "",
        background: document.documentElement.className.includes("dark") ? "#1f2937" : "",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/preferences");
        }
      });
    }
  }, []);

  useEffect(() => {
    setDialogVisible(true);
  }, [optimizationSelected]);

  const openResultDialog = (row) => {
    if (row.id === optimizationSelected.id) setDialogVisible(true);
    else setOptimizationSelected(row);
  };

  //Table functions

  const reloadOptimizations = () => {
    ipcRenderer
      .invoke("get-optimizations-list")
      .then((result) => {
        console.log(result);
        if (result.code === 500) showToast("error", "Error", result.error);
        setOptimizations(result.data);
      });
  };

  const Buttons = (row: any) => {
    if (row.pid > 0) {
      showToast("info", "Info", `${row.name} in progress`)
      return (
        <div className="flex flex-wrap justify-center">
          <Button
            icon="pi pi-refresh"
            severity="info"
            text
            tooltip="Refresh"   
            tooltipOptions={{ position: "left" }}
            onClick={() => reloadOptimizations()} />
        {/* <Button
          icon="pi pi-trash"
          severity="danger"
          className="delete-button"
          tooltip="Terminate"
          text
          onClick={(e) => confirm(e, row)}
          tooltipOptions={{ position: "left" }}
          /> */}
        </div>
      );
    } else if (row.pid === -1) {
      showToast("error", "Error", `${row.name} had a fatal error!`)
      return (
        <div className="flex flex-wrap justify-center">
          <Button
            icon="pi pi-times"
            severity="danger"
            text
            tooltip="Error, click me"
            tooltipOptions={{ position: "left" }}
            onClick={() => 
              Swal.fire({
                title: "Error",
                text: "There was an unknown error with the optimization",
                icon: "error",
                showCancelButton: true,
                cancelButtonText: "Cancel",
                confirmButtonText: "Remove optimization",
                reverseButtons: true,
                color: document.documentElement.className.includes("dark") ? "white" : "",
                background:
                  document.documentElement.className.includes("dark") ? "#1f2937" : "",
              }).then((result) => {
                if (result.isConfirmed) {
                  ipcRenderer
                    .invoke("delete-optimization", {id: row.id})
                    .then((result) => {
                      if (result.code === 500) {
                        showToast("error", "Error", result.error);
                        return;
                      }
                      
                      reloadOptimizations();
                    });
                }
              })
            }
          />
        </div>
      );
    } else if (row.pid === -2){
      return (
        <div className="flex justify-evenly">
          <Button
            icon="pi pi-exclamation-triangle"
            severity="danger"
            text
            tooltip="View Error"
            onClick={() => openResultDialog(row)}
            tooltipOptions={{ position: "left" }}
          />
          <Button
          icon="pi pi-trash"
          severity="danger"
          className="delete-button"
          tooltip="Delete"
          text
          onClick={(e) => confirm(e, row)}
          tooltipOptions={{ position: "left" }}
          />
        </div>
      );
    }
    return (
      <div className="flex justify-evenly">
        <Button
          icon="pi pi-eye"
          severity="info"
          text
          tooltip="Analyze"
          onClick={() => openResultDialog(row)}
          tooltipOptions={{ position: "left" }}
        />
        <Button
          icon="pi pi-trash"
          severity="danger"
          className="delete-button"
          tooltip="Delete"
          text
          onClick={(e) => confirm(e, row)}
          tooltipOptions={{ position: "left" }}
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
    optimizations ? optimizations.length : 0
  } optimizer simulations stored.`;

  const reportsEnabled = (row: any) => {
    return (
      <div className="text-center">
        {row.reportsEnabled ? (
          <Button
            icon="pi pi-download"
            text
            tooltip="Download"
            severity="secondary"
            disabled={row.pid !==0}
            onClick={() => handleDownload(row.id, "reports", row.name)}
          />
        ) : (
          <i className={"pi pi-times text-red-500"} />
        )}
      </div>
    );
  };

  const tracesEnabled = (row: any) => {
    return (
      <div className="text-center ">
        {row.tracesEnabled ? (
          <Button
            icon="pi pi-download"
            text
            tooltip="Download"
            severity="secondary"
            disabled={row.pid !==0}
            onClick={() => handleDownload(row.id, "traces", row.name)}
          />
        ) : (
          <i className={"pi pi-times text-red-500"} />
        )}
      </div>
    );
  };

  const handleDownload = (id: number, type: string, name: string) => {
    ipcRenderer
      .invoke("zip-files", {
        id,
        type,
        sim: "optimizer",
        name,
      })
      .then((result) => {
        
        console.log(result);
        if (!result || result.code === 500)
          showToast("error", "Error", "Error downloading files");
        else if (result.code === 200)
          showToast("success", "Success", "Files downloaded successfully");
        else
          return;
      });
  };

  return (
    <div className="flex flex-col p-5 w-full h-full">
      <Head>
        <title>DITIS Simulator: Optimizer</title>
      </Head>
      <div className="flex flex-col justify-between mt-5 mb-5">
        <Toast ref={toast} />
        <ConfirmPopup />
        <h1 className="text-3xl font-bold">Completed Optimizations</h1>
        <div className="mt-10">
          <DataTable
            value={optimizations}
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
            emptyMessage="No Completed Optimizations found"
          >
            <Column field="id" header="ID" sortable></Column>
            <Column field="name" header="Name" sortable></Column>
            <Column
              field="date"
              header="Date"
              sortable
              body={convertDate}
            ></Column>
            <Column field="trace" header="Trace" sortable />
            <Column
              field="configuration.storage"
              header="Storage Configuration"
              sortable
            />
            <Column
              field="configuration.optimizer"
              header="Optimizer Configuration"
              sortable
            />
            <Column
              field="configuration.variance"
              header="Variance Configuration"
              sortable
            />
            <Column
              field="reportsEnabled"
              body={reportsEnabled}
              header="Reports"
              style={{ maxWidth: "70px" }}
            />
            <Column
              field="tracesEnabled"
              body={tracesEnabled}
              header="Traces"
              style={{ maxWidth: "70px" }}
            />
            <Column field="View" header="Actions" body={Buttons}></Column>
          </DataTable>
        </div>
      </div>
      {optimizationSelected.id !== -1 && (
        <DialogResult
          opt={optimizationSelected}
          setOptimizationSelected={setOptimizationSelected}
          dialogVisible={dialogVisible}
          setDialogVisible={setDialogVisible}
          deleteOptimization={accept}
        />
      )}
    </div>
  );
}

export default reportWithProvider(OptimizerRuns);
