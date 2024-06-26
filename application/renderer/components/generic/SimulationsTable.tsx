import { ipcRenderer } from "electron";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import React, { Dispatch, SetStateAction, useContext, useState } from "react";
import { DialogResult as OptimizerResults } from "../optimizer/DialogResult";
import { simulationModeType } from "../../hooks/custom-hooks/useSimulationsTable";
import ReportDialog from "../simulator/ReportDialog";
import { AppController } from "../../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook";
import DialogAnalyzeTrace from "../traces/DialogAnalyzeTrace";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";

interface ISimulationsTableProps {
  simulationMode: simulationModeType;
  simulations: any[];
  terminateSimulation: (pid: number, id: number, name?: string) => void;
  dialogVisible: boolean;
  setDialogVisible: Dispatch<SetStateAction<boolean>>;
  simulationSelected: { id: number; name: string };
  openResultDialog: (id: number, name?: string) => void;
  clearSimulation: (id: number, date?: number) => void;
  deleteSimulation: (id: number, name: string) => void;
  showToast: (severity: string, summary: string, detail: string) => void;
  setSimulationSelected?: Dispatch<
    SetStateAction<{ id: number; name: string }>
  >;
}

export default function SimulationsTable({
  simulationMode,
  simulations,
  terminateSimulation,
  dialogVisible,
  setDialogVisible,
  simulationSelected,
  setSimulationSelected,
  openResultDialog,
  clearSimulation,
  deleteSimulation,
  showToast,
}: ISimulationsTableProps) {
  const controller = useContext(AppController);
  const [analyzeDialogVisible, setAnalyzeDialogVisible] = useState(false);
  const [trace, setTrace] = useState({});
  const type = simulationMode === "Optimizer" ? "optimization" : "simulation";

  const handleAnalyzeTrace = (row) => {
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
    deleteSimulation(row.id, row.name);
  };

  const Buttons = (row: any) => {
    if (row.pid === "N/A" && row.status === "Terminated")
      return (
        <div className="flex">
          <Button
            icon="pi pi-trash"
            severity="secondary"
            text
            tooltip="Remove"
            onClick={() => clearSimulation(row.id)}
          />
        </div>
      );

    if (
      row.pid === "N/A" &&
      row.status === "Finished" &&
      simulationMode === "Optimizer"
    )
      return (
        <div className="flex">
          <Button
            icon="pi pi-search"
            severity="info"
            text
            tooltip="Analyze"
            onClick={() => openResultDialog(row.id, row.name)}
          />
          <Button
            icon="pi pi-eye-slash"
            severity="secondary"
            text
            tooltip="Clear"
            onClick={() => clearSimulation(row.id)}
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

    if (
      row.pid === -2 &&
      row.status === "Error" &&
      simulationMode === "Optimizer"
    )
      return (
        <div className="flex justify-evenly">
          <Button
            icon="pi pi-exclamation-triangle"
            severity="danger"
            text
            tooltip="View Error"
            onClick={() => openResultDialog(row.id, row.name)}
          />
          <Button
            icon="pi pi-eye-slash"
            severity="secondary"
            text
            tooltip="Clear"
            onClick={() => clearSimulation(row.id)}
          />
        </div>
      );

    if (
      row.pid === "N/A" &&
      row.status === "Finished" &&
      simulationMode === "Simulator"
    )
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
            severity="info"
            text
            tooltip="Analyze output trace"
            onClick={() => handleAnalyzeTrace(row)}
          />
          <Button
            icon="pi pi-eye-slash"
            severity="secondary"
            text
            tooltip="Clear"
            onClick={() => clearSimulation(row.id)}
          />
          <Button
            icon="pi pi-trash"
            severity="danger"
            text
            tooltipOptions={{ position: "left" }}
            tooltip="Delete"
            onClick={(e) => confirm(e, row)}
          />
        </div>
      );
    if (
      row.pid === -2 &&
      row.status === "Error" &&
      simulationMode === "Simulator"
    )
      return (
        <div className="flex justify-evenly">
          <Button
            icon="pi pi-exclamation-triangle"
            severity="danger"
            text
            tooltip="View Error"
            onClick={() => openResultDialog(row.id, row.name)}
          />
          <Button
            icon="pi pi-eye-slash"
            severity="secondary"
            text
            tooltip="Clear"
            onClick={() => clearSimulation(row.id)}
          />
        </div>
      );

    return (
      <div className="flex">
        <Button
          icon="pi pi-times"
          outlined
          label="Terminate"
          severity="danger"
          onClick={() => terminateSimulation(row.pid, row.id, row.name)}
        ></Button>
      </div>
    );
  };

  const convertDate = (row: any) => {
    const d = new Date(row.date);
    return `${d.toLocaleDateString("en-UK")} ${d.getHours()}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  };

  const header = (
    <div className="flex flex-wrap align-items-center justify-content-between gap-2">
      <span className="text-xl text-900 font-bold">
        Running {type.charAt(0).toUpperCase() + type.slice(1)}s
      </span>
    </div>
  );

  const footer = `In total there are ${
    simulations ? simulations.length : 0
  } ${type}s running.`;

  return (
    <div>
      <ConfirmPopup />
      <DataTable
        value={simulations}
        header={header}
        footer={footer}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
        tableStyle={{ minWidth: "90%" }}
        showGridlines
        sortField="id"
        sortOrder={-1}
      >
        <Column field="id" sortable header="ID"></Column>
        <Column field="name" sortable header="Name"></Column>
        <Column field="status" sortable header="Status"></Column>
        <Column
          field="date"
          sortable
          header={`Date of ${type}`}
          body={convertDate}
        ></Column>
        <Column field="pid" header="Process ID" />
        <Column field="View" header="Actions" body={Buttons}></Column>
      </DataTable>
      {simulationMode === "Optimizer" && simulationSelected.id !== -1 && (
        <OptimizerResults
          opt={simulationSelected}
          setOptimizationSelected={setSimulationSelected}
          dialogVisible={dialogVisible}
          setDialogVisible={setDialogVisible}
          deleteOptimization={accept}
        />
      )}
      {simulationMode === "Simulator" && simulationSelected.id !== -1 && (
        <>
          <ReportDialog
            simInfo={simulationSelected.id}
            showReportDialog={dialogVisible}
            setShowReportDialog={setDialogVisible}
            dialogMode={true}
          />
        </>
      )}
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
