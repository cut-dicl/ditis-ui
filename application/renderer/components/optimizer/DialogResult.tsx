import React, { useEffect, useContext, useState, useRef, useLayoutEffect } from "react";
import { Dialog } from "primereact/dialog";
import { ipcRenderer } from "electron";
import { TabMenu } from "primereact/tabmenu";
import { Toast } from "primereact/toast";
import { AppController } from "../../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook";
import { ProgressSpinner } from "primereact/progressspinner";
import ResultsTable from "./ResultsTable";
import ResultsConfig from "./ResultsConfig";
import ResultsDetailed from "./ResultsDetailed";
import ReportDialog from "../simulator/ReportDialog";
import { ReportContext } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook";
import { ConfFormContextProvider } from "../../hooks/useContext-hooks/conf-form-hook/conf-form-hook-provider";
import { NextPreviousButtonContextProvider } from "../../hooks/useContext-hooks/next-previous-buttons-hook/next-previous-buttons-hook-provider";

export function DialogResult({
  opt,
  dialogVisible,
  setDialogVisible,
}) {
  const controller = useContext(AppController);
  const reportCtx = useContext(ReportContext);

  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  const [bestReportVisible, setBestReportVisible] = useState(false);
  const [analyzeConfig, setAnalyzeConfig] = useState("");
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
      ]

  const toast = useRef(null);
  const showToast = (severity, summary, detail) => {
    toast.current && toast.current.show({
      severity: severity,
      summary: summary,
      detail: detail,
      life: 3000,
    });
  };

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
          mode: controller.mode,
          address: controller.onlineServer.address,
          auth: controller.onlineServer.auth,
         })
        .then((result) => {
          if (!result) return;
          if (!result.data || !result.data.data || !result.data.columns) {
            console.log("aa");
            setData([]);
            setColumns([]);
            showToast("error", "Error", "No data found");
            setNoData(true);
            setIsLoaded(true);
            return;
          }
          else if (result.code === 500) return;
          setData(result.data.data);
          setColumns(result.data.columns);
          setIsLoaded(true);
        });
      ipcRenderer
        .invoke("get-optimizer-best-config", {
          id: opt.id,
          javaPath: controller.javaPath,
        })
        .then((result) => {
          if (!result) return;
          else if (result.code === 500) return;
          setAnalyzeConfig(result.data);
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

  useEffect(() => {
    if (activeIndex === 3) {
      ipcRenderer.invoke("fetch-optimizer-report", { id: opt.id }).then((result) => {
        console.log(result);
        reportCtx.handleReportData(result.data);
        setReportsLoaded(true);
      });
    }
  }, [activeIndex]);

  return (
    <Dialog
      header={"Optimization Results"}
      style={{
        height: "90%",
        width: "90%",
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
    >
      <Toast ref={toast} />
      <TabMenu
        model={items}
        activeIndex={activeIndex}
        onTabChange={(e) => setActiveIndex(e.index)}
        className="mb-3"
      />
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

      {(isLoaded && !noData) && activeIndex === 0 && (
        <ResultsTable columns={columns} data={data} />
      )}
      {(isLoaded && !noData) && activeIndex === 1 && (
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
      {(isLoaded && !noData) && activeIndex === 2 && (
        <div className="grow">
        <ConfFormContextProvider>
          <NextPreviousButtonContextProvider>
            <ResultsConfig
              id={opt.id}
              analyzeConfig={analyzeConfig}
              showToast={showToast}
            />
          </NextPreviousButtonContextProvider>
          </ConfFormContextProvider>
          </div>
      )}
      {(isLoaded && !noData) && activeIndex === 3 && reportsLoaded && (
        <ReportDialog
          showReportDialog={bestReportVisible}
          setShowReportDialog={setBestReportVisible}
          dialogMode={false}
        />
        )}
        </div>
    </Dialog>
  );
}