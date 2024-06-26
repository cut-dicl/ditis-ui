import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Dialog } from "primereact/dialog";

import { TabPanel, TabView } from "primereact/tabview";
import FileSizeChart from "./charts/FileSizeChart";
import AppTimeChart from "./charts/AppTimeChart";
import Statistics from "./charts/Statistics";
import { ProgressSpinner } from "primereact/progressspinner";
import { ipcRenderer } from "electron";
import { AppController } from "../../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook";
import { Panel } from "primereact/panel";
import FileStatistics from "./charts/FileStatistics";
import { TabMenu } from "primereact/tabmenu";
import { Divider } from "primereact/divider";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import PrintTrace from "./PrintTrace";

interface DialogAnalyzeTraceProps {
  trace: any;
  analyzeDialogVisible: boolean;
  handleClose: any;
  type?: string;
  showToast?: any;
  simID?: number;
}

export default function DialogAnalyzeTrace({
  trace,
  analyzeDialogVisible,
  handleClose,
  type,
  showToast,
  simID
}: DialogAnalyzeTraceProps) {
  const [traceLines, setTraceLines] = useState({
    selectedLines: 25,
    lines: null,
    text: [""],
  });
  const [analyzeResults, setAnalyzeResults] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const items = [
    { label: "Statistics", icon: "pi pi-fw pi-chart-bar" },
    { label: "File Preview", icon: "pi pi-fw pi-list" },
    { label: "Print", icon: "pi pi-fw pi-print"}
  ];

  useEffect(() => {
      ipcRenderer
        .invoke("analyze-trace", {
          id: type === "simulator"? trace.id : trace.name+trace.extension,
          type,
          simID: simID? simID : null,
        })
        .then((result) => {
          if (!result || result.code === 500) {
            showToast("error", "Error", result.error);
            handleClose();
            return;
          }
          setAnalyzeResults(result.data);

          ipcRenderer.invoke("get-trace-lines", {
            id: type === "simulator"? trace.id : trace.name+trace.extension, type,
            simID: simID? simID : null,
          }).then((result) => {
            if (!result || result.code === 500) {
              setTraceLines({ selectedLines: 25, lines: null, text: ["Error: Could not read trace file."] });
              showToast("error", "Error", result.error);
            }
            else if(result.data && result.data.report.length === 0)
              setTraceLines({ selectedLines: 25, lines: null, text: ["Error: Empty trace file."] });
            else
              setTraceLines({ selectedLines: 25, lines: result.data.lines, text: result.data.report && result.data.report.split(/\r?\n/) });
            
            setLoaded(true);
          });
        });
    return () => {
      setTraceLines({ selectedLines: 25, lines: null, text: [""] });
      setAnalyzeResults(null);
      setLoaded(false);
    };
  }, [trace]);

  const headerTemplate = (options) => {
    return (
      <div
        className={options.className}
        style={{ padding: "10px", paddingLeft: "20px" }}
      >
        <div className="flex flex-row flex-1 justify-between">
          <span className="self-center font-bold">File Preview</span>
          <span className="self-center">
            Select number of lines to preview:
            <Dropdown
              value={traceLines.selectedLines}
              onChange={(e) => {
                setTraceLines({ ...traceLines, selectedLines: e.value })
              }}
              options={[25, 50, 100]}
              className="ml-2"
            />
          </span>
        </div>
      </div>
    );
  };

  return (
    <Dialog
      header="Trace Analysis"
      style={{ height: "90%", width: "90%" }}
      visible={analyzeDialogVisible}
      onHide={handleClose}
      contentClassName="overflow-hidden flex flex-col"
    >
      {loaded === false && (
        <div className="flex flex-col justify-center items-center h-[90%]">
          <ProgressSpinner />
          <h1>Loading...</h1>
        </div>
      )}

      {loaded === true && (
        <>
          <TabMenu
            model={items}
            activeIndex={activeIndex}
            onTabChange={(e) => setActiveIndex(e.index)}
            className="mb-3"
          />
          <div className="flex flex-col h-[90%] overflow-auto">
            
          {activeIndex === 0 && (
              <>
                {/* <Statistics analyzeResults={analyzeResults} /> */}
                <FileStatistics data={analyzeResults} />

                <AppTimeChart analyzeResults={analyzeResults} />

                <FileSizeChart analyzeResults={analyzeResults} />
              </>
            )}
            {activeIndex === 1 && (
              <Panel headerTemplate={headerTemplate} className="p-2">
                <InputTextarea
                  value={
                    traceLines.text &&
                    traceLines.text.slice(0, traceLines.selectedLines).join("\n")
                  }
                  rows={20}
                  readOnly
                  className="w-full h-full"
                ></InputTextarea>
              </Panel>
            )}
            {activeIndex === 2 && (
              <>
                <PrintTrace analyzeResults={analyzeResults} trace={trace} type={type || null} lines={traceLines.lines} />
              </>
            )}
          </div>
        </>
      )}
    </Dialog>
  );
}
