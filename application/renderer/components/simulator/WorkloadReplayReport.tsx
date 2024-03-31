import { ReportContext } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook";
import { IReportObject } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook-provider";
import { useContext } from "react";
import { Chart } from "primereact/chart";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import PieWithTableReport from "./PieWithTableReport";

const WorkloadReplayReport = () => {
  const reportCtx = useContext(ReportContext);

  const workloadReplayContent: IReportObject =
    reportCtx.reportData["Workload Replay"];

  const workloadReplayTableData = Object.entries(
    workloadReplayContent.rows
  ).map((item) => {
    return {
      label: item[0],
      counts:
        item[1][0] !== null
          ? Number.isInteger(item[1][0])
            ? item[1][0]
            : item[1][0].toFixed(3)
          : "-",
      totalBytes:
        item[1][1] !== null
          ? Number.isInteger(item[1][1])
            ? item[1][1]
            : item[1][1].toFixed(3)
          : "-",
      totalTime:
        item[1][2] !== null
          ? Number.isInteger(item[1][2])
            ? item[1][2]
            : item[1][2].toFixed(3)
          : "-",
      latency:
        item[1][3] !== null
          ? Number.isInteger(item[1][3])
            ? item[1][3]
            : item[1][3].toFixed(3)
          : "-",
      iops:
        item[1][4] !== null
          ? Number.isInteger(item[1][4])
            ? item[1][4]
            : item[1][4].toFixed(3)
          : "-",
      throughput:
        item[1][5] !== null
          ? Number.isInteger(item[1][5])
            ? item[1][5]
            : item[1][5].toFixed(3)
          : "-",
    };
  });

  return (
    <div>
      <PieWithTableReport
        content={workloadReplayContent}
        tableData={workloadReplayTableData}
        pieTitle="Workload Request Statistics"
        tableTitle="Workload Request Metrics"
      />
    </div>
  );
};

export default WorkloadReplayReport;
