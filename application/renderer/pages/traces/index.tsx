import React, { useContext, useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { ipcRenderer, shell } from "electron";
import Head from "next/head";
import DialogNewTrace from "../../components/traces/DialogNewTrace";
import DialogAnalyzeTrace from "../../components/traces/DialogAnalyzeTrace";
import { AppController } from "../../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function Page() {
  const controller = useContext(AppController);
  const [traces, setTraces] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [path, setPath] = useState<string>("");
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const [traceName, setTraceName] = useState<string>("");
  const [analyzeDialogVisible, setAnalyzeDialogVisible] = useState<boolean>(false);
  const [traceSelected, setTraceSelected] = useState(null);
  const router = useRouter();


  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const toast = useRef(null);
  const showToast = (severity, summary, detail) => {
    toast.current.show && toast.current.show({ severity, summary, detail, life: 3000 });
  }

    const confirm = (event,row) => {
        confirmPopup({
            target: event.currentTarget,
            message: `Do you want to delete trace ${row.name}?`,
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: () => accept(row)
        });
    };

    const accept = (row) => {
        //add ipcRenderer to delete optimization
        submitDeleteTrace(row);
    };
  

  useEffect(() => {
    reloadTraces();
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
        background: document.documentElement.className == "dark" ? "#1f2937" : "",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/preferences");
        }
      });
    }
  }, []);

  const reloadTraces = () => {
    ipcRenderer.invoke("get-trace-list", {mode: controller.mode, address: controller.onlineServer.address, auth: controller.onlineServer.auth }).then((result) => {
      console.log(result);
      if (result === undefined || result === false) return;
      if (result.code === 500) {
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'Server did not respond', life: 3000 });
        
    setDataLoaded(true);
        return;
      }
      setTraces(result.data);
      setDataLoaded(true);
    });
  };

  const footer = `In total there are ${
    traces ? traces.length : 0
  } trace files stored.`;

  const analyzeButton = (row: any) => {
    return (
      <div className="flex justify-between">
        <Button
          icon="pi pi-eye"
          severity="info" text
          tooltip="Analyze"
          onClick={() => {
            handleAnalyze(row);
          }}
        ></Button>
        <Button
          icon="pi pi-trash"
          severity="danger" text
          tooltip="Delete"
          onClick={e => confirm(e,row)}
        ></Button>
        <Button
          icon="pi pi-download"
          severity="info" text
          tooltip="Download"
          onClick={() => {
            ipcRenderer.invoke("download-trace", { mode: controller.mode, trace: row.name, address: controller.onlineServer.address, auth: controller.onlineServer.auth }).then((result) => {
              if (result === undefined || result === false) return;
              if (result.code && result.code === 200) {
                showToast('success', 'Trace downloaded successfully', 'File has been saved in your downloads folder');
                return;
              }
              showToast('error', 'Error', result.error);
            });
           }}
        ></Button>
      </div>
    );
  };

  const convertDate = (row: any) => {
    const d = new Date(row.date * 1000);
    return `${d.toLocaleDateString("en-UK")} ${d.getHours()}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  };

  const submitDeleteTrace = (row) => {
    ipcRenderer
      .invoke("delete-trace-file", {
        trace: row.name,
        mode: controller.mode,
        address: controller.onlineServer.address ? controller.onlineServer.address : null,
        auth: controller.onlineServer.auth ? controller.onlineServer.auth : null,
      })
      .then((result) => {
        if (result === undefined || result === false || result.code === 500) {
          showToast('error', 'Error', result.error);
          return;
        }
        setTraces((prev) => prev.filter((trace) => trace.name !== row.name));
        showToast('success', 'Trace deleted successfully', '');
      });
  };

  const handleAnalyze = (row: any) => {
    setTraceSelected(row.name+row.extension);
    setAnalyzeDialogVisible(true);
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const AddTrace = () => {
    const handleClick = () => {
      ipcRenderer.invoke("open-trace-file").then((result) => {
        if (result === undefined || result === false) return;
        setPath(result.path);
        setTraceName(result.fileName);
        setDialogVisible(true);
      });
    };

    return (
      <Button
        icon="pi pi-plus"
        className="p-mr-1"
        onClick={handleClick}
        label="Add New Trace"
      />
    );
  };

  const TransferTrace = () => {
    const handleClick = () => {
      // ipcRenderer.invoke("open-trace-file").then((result) => {
      //   if (result === undefined || result === false) return;
      //   ipcRenderer
      //     .invoke("store-trace-file", { name: result.fileName, path: result.path })
      //     .then((result) => {
      //       setTimeout(reloadTraces, 10);
      //       Swal.fire({
      //         icon: "success",
      //         title: "Trace imported successfully",
      //         timer: 900,
      //         color: document.documentElement.className == "dark" ? "white" : "",
      //         background:
      //           document.documentElement.className == "dark" ? "#1f2937" : "",
      //         showConfirmButton: false,
      //       });
      //     });
      // });
    };
    return (
      <Button
        icon="pi pi-upload"
        className="ml-[20px]"
        onClick={handleClick}
        label="Transfer Trace"
      />
    );
  }

  return (
    <div className="flex flex-col p-5 w-full">
      <Head>
        <title>DITIS Simulator: Traces</title>
      </Head>
      <Toast ref={toast} />
        <ConfirmPopup />  
      <div className="mt-5 mb-5">
      <h1 className="text-3xl font-bold">Traces</h1>
      {!dataLoaded && (
        <div className="flex flex-col justify-center items-center h-[90%]">
          <ProgressSpinner />
          <h1>Loading...</h1>
        </div>
      )}
        {dataLoaded && (<>
          <div className="flex nowrap justify-between mb-2">
        <div></div>
        <div className="justify-between flex nowrap space-x-4">
          <AddTrace />
              {controller.mode === "Online" && <TransferTrace />}
              <span className="p-input-icon-right">
                <i className="pi pi-search" />
                <InputText
                  value={globalFilterValue}
                  onChange={onGlobalFilterChange}
                  placeholder="Keyword Search"
                />
              </span>
        </div>
      </div>
        <DataTable
            value={traces}
            footer={footer}
            filters={filters}
            paginator
            rows={10}
            rowsPerPageOptions={[10, 25, 50]}
            tableStyle={{ minWidth: "90%" }}
            showGridlines
            size="small"
            globalFilterFields={["name","type"]}
            sortField="date"
            sortOrder={-1}
        >
          <Column field="name" sortable header="Name" ></Column>
            <Column field="type" sortable header="Type" ></Column>
            <Column field="extension" sortable header="File Type" body={
              (row) => {
                return row.extension? row.extension.slice(1): "";
              }
            }></Column>
          <Column field="lines" sortable header="Lines"></Column>
          <Column
            field="date"
            sortable
            header="Date Added"
            body={convertDate}
            style={{width: "15%"}}
          ></Column>
          <Column
            field="Analyze"
            header="Actions"
            body={analyzeButton}
            style={{width: "12%"}}
          ></Column>
          </DataTable>
          </>
      )}
      </div>

      {/* Dialogs */}

      <DialogNewTrace
        dialogVisible={dialogVisible}
        setDialogVisible={setDialogVisible}
        traceName={traceName}
        setTraceName={setTraceName}
        reloadTraces={reloadTraces}
        showToast={showToast}
        path={path}
      />
      <DialogAnalyzeTrace
        analyzeDialogVisible={analyzeDialogVisible}
        handleClose={() => { setAnalyzeDialogVisible(false); setTraceSelected(""); }}
        type=""
        id={traceSelected}
        showToast={showToast}
      />
    </div>
  );
}
