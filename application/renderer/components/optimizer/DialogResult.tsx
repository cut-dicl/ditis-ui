import React, {
  useEffect,
  useContext,
  useState,
  useRef,
  useLayoutEffect,
  Suspense,
} from "react";
import { Dialog } from "primereact/dialog";
import { ipcRenderer } from "electron";
import { TabMenu } from "primereact/tabmenu";
import { Toast } from "primereact/toast";
import { AppController } from "../../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook";
import { ProgressSpinner } from "primereact/progressspinner";
import ResultsConfig from "./ResultsConfig";
import ReportDialog from "../simulator/ReportDialog";
import { ReportContext } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook";
import { ConfFormContextProvider } from "../../hooks/useContext-hooks/conf-form-hook/conf-form-hook-provider";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export function DialogResult({
  opt,
  dialogVisible,
  setDialogVisible,
  setOptimizationSelected,
  deleteOptimization,
}) {
  const controller = useContext(AppController);
  const reportCtx = useContext(ReportContext);

  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  const [bestReportVisible, setBestReportVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState([]);
  const [chartMode, setChartMode] = useState("table");
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [chartSize, setChartSize] = useState("45%");
  const [reportsLoaded, setReportsLoaded] = useState(false);
  const [noData, setNoData] = useState(false);
  const items = [
    { label: "Results", icon: "pi pi-fw pi-list" },
    { label: "Analysis", icon: "pi pi-fw pi-chart-bar" },
    { label: "Best Config", icon: "pi pi-fw pi-file" },
    { label: "Best Report", icon: "pi pi-fw pi-chart-pie" },
    { label: "Print", icon: "pi pi-fw pi-print" },
  ];

  const toast = useRef(null);
  const router = useRouter();
  const showToast = (severity, summary, detail) => {
    toast.current &&
      toast.current.show({
        severity: severity,
        summary: summary,
        detail: detail,
        life: 3000,
      });
  };

  const ResultsTable = React.lazy(() => import("./ResultsTable"));
  const ResultsDetailed = React.lazy(() => import("./ResultsDetailed"));
  const ResultsPrint = React.lazy(() => import("./ResultsPrint"));

  useLayoutEffect(() => {
    ipcRenderer
      .invoke("open-preferences-file", { key: "optimizer" })
      .then((result) => {
        if (!result) return;
        if (result.selectedColumn) setSelectedColumn(result.selectedColumn);
        else setSelectedColumn([]);

        if (result.chartMode) setChartMode(result.chartMode);
        else setChartMode("table");

        if (result.selectedMetrics) setSelectedMetrics(result.selectedMetrics);
        else setSelectedMetrics(columns.filter((col) => col.includes("_")));

        if (result.chartSize) setChartSize(result.chartSize);
        else setChartSize("45%");
      });
  }, []);

  useEffect(() => {
    setNoData(false);
    if (opt != null) {
      ipcRenderer
        .invoke("get-optimizer-csv-file", {
          id: opt.id,
        })
        .then((result) => {
          if (!result) return;
          else if (result.code === 500) {
            let optSel = opt;
            setDialogVisible(false);
            setOptimizationSelected({
              name: "",
              id: -1,
            });
            Swal.fire({
              icon: "error",
              title: "Error",
              text: result.error,
              showCancelButton: true,
              confirmButtonText: "Delete Optimization",
              confirmButtonColor: "#d33",
              reverseButtons: true,
              color:
                document.documentElement.className.includes("dark") ? "white" : "",
              background:
                document.documentElement.className.includes("dark") ? "#1f2937" : "",
              denyButtonText: "Go to Configurations",
              showDenyButton: true,
              denyButtonColor: "#3085d6",
            }).then((result) => {
              if (result.isDenied) {
                router.push("/configurations");
                return;
              }

              if (result.isConfirmed) {
                deleteOptimization(optSel);
                return;
              }
            });
          }
          if (!result.data || !result.data.data || !result.data.columns) {
            setData([]);
            setColumns([]);
            showToast("error", "Error", "No data found");
            setNoData(true);
            setIsLoaded(true);
            return;
          }
          setData(result.data.data);
          setColumns(result.data.columns);
          setIsLoaded(true);
        });
        ipcRenderer
        .invoke("fetch-optimizer-report", { id: opt.id })
        .then((result) => {
          if (result.code === 200) {
            reportCtx.handleReportData(result.data);
            setReportsLoaded(true);
          } else if (result.code === 500) {
            reportCtx.handleReportData({});
            setReportsLoaded(true);
          }
        });
    }
  }, [opt]);

  const saveOptions = () => {
    ipcRenderer.invoke("edit-preferences-file", {
      key: "optimizer",
      value: {
        selectedColumn: selectedColumn,
        chartMode: chartMode,
        chartSize: chartSize,
        selectedMetrics: selectedMetrics,
      },
    });
  };

  return (
    <Dialog
      header={opt.name + " Results"}
      style={{
        height: "95%",
        width: "95%",
        display: "flex",
        flexDirection: "column",
      }}
      visible={dialogVisible}
      onHide={() => {
        saveOptions();
        setDialogVisible(false);
      }}
      className="dialog-optimizer-results "
      contentClassName="overflow-hidden"
      id="dialog-optimizer-results"
      headerClassName="h-[70px]"
      dismissableMask
      draggable={false}
    >
      <Toast ref={toast} />
      <TabMenu
        model={items}
        activeIndex={activeIndex}
        onTabChange={(e) => setActiveIndex(e.index)}
        className="mb-3"
      />
      <Suspense fallback={<ProgressSpinner />}>
        <div className="flex flex-col h-[90%] overflow-auto">
          {!isLoaded && (
            <div className="flex flex-col justify-center items-center h-[90%]">
              <ProgressSpinner />
              <h1>Loading...</h1>
            </div>
          )}
          {noData && (
            <div className="flex flex-col justify-center items-center h-[90%]">
              <h1>No data found</h1>
            </div>
          )}

          {isLoaded && !noData && activeIndex === 0 && (
            <ResultsTable
              columns={columns}
              data={data}
              optID={opt.id}
              showToast={showToast}
            />
          )}
          {isLoaded && !noData && activeIndex === 1 && (
            <ResultsDetailed
              columns={columns}
              data={data}
              selectedColumn={selectedColumn}
              setSelectedColumn={setSelectedColumn}
              selectedMetrics={selectedMetrics}
              setSelectedMetrics={setSelectedMetrics}
              chartMode={chartMode}
              setChartMode={setChartMode}
              chartSize={chartSize}
              setChartSize={setChartSize}
            />
          )}
          {isLoaded && !noData && activeIndex === 2 && (
            <div className="grow">
              <ConfFormContextProvider>
                <ResultsConfig
                  id={opt.id}
                />
              </ConfFormContextProvider>
            </div>
          )}
          {isLoaded && !noData && activeIndex === 3 && reportsLoaded && (
            <ReportDialog
              showReportDialog={bestReportVisible}
              setShowReportDialog={setBestReportVisible}
              dialogMode={false}
              simulationID={opt.id}
            />
          )}
          {isLoaded && !noData && activeIndex === 4 && (
            <ResultsPrint
              optimization={opt}
              data={data}
              columns={columns}
              selectedColumn={selectedColumn}
              selectedMetrics={selectedMetrics}
              name={opt.name}
            />
          )}
        </div>
      </Suspense>
    </Dialog>
  );
}
