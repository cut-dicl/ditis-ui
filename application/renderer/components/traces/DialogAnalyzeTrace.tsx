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
import PieWithTableReport from "../simulator/PieWithTableReport";
import FileStatistics from "./charts/FileStatistics";
import { TabMenu } from "primereact/tabmenu";

interface DialogAnalyzeTraceProps {
  analyzeDialogVisible: boolean;
  handleClose: any;
  type: string;
  id: string | number;
  showToast?: any;
  simID?: number;
}

export default function DialogAnalyzeTrace({
  analyzeDialogVisible,
  handleClose,
  type,
  id,
  showToast,
  simID
}: DialogAnalyzeTraceProps) {
  const controller = useContext(AppController);
  const [selectedLines, setSelectedLines] = useState(25);
  const [analyzeText, setAnalyzeText] = useState([]);
  const [analyzeResults, setAnalyzeResults] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const items = [
    { label: "Statistics", icon: "pi pi-fw pi-chart-bar" },
    { label: "File Preview", icon: "pi pi-fw pi-list" },
  ];

  useEffect(() => {
    if (id === null || id === undefined || id === "" || id === -1) return;
    if (id === null || id === undefined) return;
      ipcRenderer
        .invoke("analyze-trace", {
          id,
          type,
          simID: simID? simID : null,
          javaPath: controller.javaPath,
          mode: controller.mode,
          address: controller.onlineServer.address,
          auth: controller.onlineServer.auth,
        })
        .then((result) => {
          if (!result || result.code === 500) {
            showToast("error", "Error", result.error);
            handleClose();
            return;
          }
          setAnalyzeResults(result.data);

          ipcRenderer.invoke("get-trace-lines", {
            id, type,
            simID: simID? simID : null,
            mode: controller.mode,
            address: controller.onlineServer.address,
            auth: controller.onlineServer.auth,
          }).then((result) => {
            if (!result || result.code === 500)
              setAnalyzeText(["Error: Could not read trace file."]);
            else if(result.data && result.data.length === 0)
              setAnalyzeText(["Failed to read trace"]);
            else setAnalyzeText(result.data && result.data.split(/\r?\n/));
            
            setLoaded(true);
          });
        });
    return () => {
      setAnalyzeText([]);
      setAnalyzeResults(null);
      setLoaded(false);
    };
  }, [id]);

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
              value={selectedLines}
              onChange={(e) => {
                setSelectedLines(e.value);
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
                    analyzeText &&
                    analyzeText.slice(0, selectedLines).join("\n")
                  }
                  rows={20}
                  readOnly
                  className="w-full h-full"
                ></InputTextarea>
              </Panel>
            )}
          </div>
        </>
      )}
    </Dialog>
  );
}
