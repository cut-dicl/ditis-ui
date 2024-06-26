import { useContext } from "react";
import { ReportContext } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook";
import { IReportObject } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook-provider";
import PieWithTableReport from "./PieWithTableReport";

const InitializerLayerReport = (props) => {
  const reportCtx = useContext(ReportContext);

  const initializerReportContent: IReportObject =
    reportCtx.reportData["Initializer"];

  const initializerReportTableData = Object.entries(
    initializerReportContent.rows
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
    <div className="avoid-page-break">
      {props.printMode && (
        <div className="flex justify-center mb-5">
          <span
            style={{
              fontFamily: "Montserrat, sans-serif",
            }}
            className="font-bold text-center text-2xl"
          >
            Initializer Layer
          </span>
        </div>
      )}
      <PieWithTableReport
        content={initializerReportContent}
        tableData={initializerReportTableData}
        pieTitle="Initializer Request Statistics"
        tableTitle="Initializer Request Metrics"
        printMode={props.printMode}
      />
    </div>
  );
};

export default InitializerLayerReport;
