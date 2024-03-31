import React, { useContext, useEffect, useRef, useState } from "react";
import InitializerLayerReport from "./InitializerLayerReport";
import { ReportContext } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook";
import CacheHitMissRatioReport from "./CacheHitMissRatioReport";
import WallClockTimesReport from "./WallClockTimesReport";
import AdmissionMetricsReport from "./AdmissionMetricsReport";
import PrefetchMetricsReport from "./PrefetchMetricsReport";
import ApplicationsSummaryReport from "./ApplicationsSummaryReport";
import InitialTierStateReport from "./InitialTierStateReport";
import LayersStatisticsTotalReport from "./LayersTotalTable";
import TiersTableReport from "./TiersTableReport";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import WorkloadReplayReport from "./WorkloadReplayReport";
import TierMigrationTableReport from "./TierMigrationTableReport";
import DataProfilerEvaluationMetrics from "./DataProfilerEvaluationMetrics";
import SimulationEvaluationReports from "./SimulationEvaluationReports";
import StorageNodesReport from "./StorageNodesReport";
import ModulesReport from "./ModulesReport";
import ReactToPrint, { useReactToPrint } from "react-to-print";
import { Button } from "primereact/button";
import ExportReport from "./ExportReport";

interface IReportDialog {
  showReportDialog: boolean;
  setShowReportDialog: (value: React.SetStateAction<boolean>) => void;
  dialogMode: boolean;
}

const ReportDialog = ({
  showReportDialog,
  setShowReportDialog,
  dialogMode,
}) => {
  const reportCtx = useContext(ReportContext);
  const reportRef = useRef(null);
  const [printMode, setPrintMode] = useState(false);

  const nameToComponentAssociation = {
    "Cache Admissions": AdmissionMetricsReport, // done
    Applications: ApplicationsSummaryReport, // only above thing left do stacked bar
    "Cache Hits": CacheHitMissRatioReport, // done
    "Data Profiler": DataProfilerEvaluationMetrics, // done
    "Initial Tier State": InitialTierStateReport, // done
    Initializer: InitializerLayerReport, // done
    "Layer Statistics": LayersStatisticsTotalReport, // split by type
    "Cache Prefetching": PrefetchMetricsReport, // done
    "Data Migration": TierMigrationTableReport, // done make 2 of them
    "Simulation Evaluation": SimulationEvaluationReports,
    "Storage Tiers": TiersTableReport, // done
    "Wall Clock Runtimes": WallClockTimesReport, // done
    "Workload Replay": WorkloadReplayReport, // done
    "Storage Nodes": StorageNodesReport,
    "Modules - AccessLayer": ModulesReport,
    "Modules - FileHomeLayer": ModulesReport,
    "Modules - PersistenceLayer": ModulesReport,
  };

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
  });

  const dialogHeaderContent = () => (
    <div>
      <Dropdown
        className="w-[20rem]"
        value={reportCtx.reportShown}
        placeholder="Select Report..."
        options={Object.keys(reportCtx.reportData).sort()}
        onChange={handleReportType}
        scrollHeight="350px"
      />
      {/* <Button label="Success" severity="success" onClick={handlePrint} /> */}
    </div>
  );

  const handleReportType = (e) => {
    reportCtx.handleReportShown(e.target.value);
  };

  if (Object.entries(reportCtx.reportData).length === 0) {
    return (
      <div>
        {!dialogMode && <p>Something went wrong. No reports were generated</p>}
        {dialogMode && (
          <Dialog
            onHide={() => setShowReportDialog(false)}
            visible={showReportDialog}
            header="File not found"
          >
            <p>Something went wrong. No reports were generated</p>
          </Dialog>
        )}
      </div>
    );
  }

  return (
    <div>
      {!dialogMode && !printMode && (
        <div>
          <Dropdown
            className="w-[20rem] mb-10"
            value={reportCtx.reportShown}
            placeholder="Select Report..."
            options={Object.keys(reportCtx.reportData).sort()}
            onChange={handleReportType}
          />
          {React.createElement(
            nameToComponentAssociation[reportCtx.reportShown]
          )}
        </div>
      )}
      {dialogMode && !printMode && (
        <Dialog
          onHide={() => setShowReportDialog(false)}
          visible={showReportDialog}
          style={{ width: "92.5%", height: "90%" }}
          header={dialogHeaderContent}
        >
          {React.createElement(
            nameToComponentAssociation[reportCtx.reportShown]
          )}
        </Dialog>
      )}
    </div>
  );
};

export default ReportDialog;
