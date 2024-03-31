import InitializerLayerReport from "./InitializerLayerReport";
import CacheHitMissRatioReport from "./CacheHitMissRatioReport";
import WallClockTimesReport from "./WallClockTimesReport";
import AdmissionMetricsReport from "./AdmissionMetricsReport";
import PrefetchMetricsReport from "./PrefetchMetricsReport";
import ApplicationsSummaryReport from "./ApplicationsSummaryReport";
import InitialTierStateReport from "./InitialTierStateReport";
import LayersStatisticsTotalReport from "./LayersTotalTable";
import TiersTableReport from "./TiersTableReport";
import WorkloadReplayReport from "./WorkloadReplayReport";
import TierMigrationTableReport from "./TierMigrationTableReport";
import DataProfilerEvaluationMetrics from "./DataProfilerEvaluationMetrics";
import SimulationEvaluationReports from "./SimulationEvaluationReports";
import StorageNodesReport from "./StorageNodesReport";
import ModulesReport from "./ModulesReport";
import React from "react";

const ExportReport = React.forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div ref={ref}>
      <CacheHitMissRatioReport ref={ref} />
    </div>
  );
});

export default ExportReport;
