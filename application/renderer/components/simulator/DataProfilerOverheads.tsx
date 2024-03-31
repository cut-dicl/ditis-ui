import { useContext } from "react";
import { ReportContext } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook";
import { IReportObject } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook-provider";
import { Chart } from "primereact/chart";

const DataProfilerOverheadsReport = () => {
  const reportCtx = useContext(ReportContext);

  const dataProfilerOverheads: IReportObject =
    reportCtx.reportData.dataProfilerOverheads;

  return <div></div>;
};

export default DataProfilerOverheadsReport;
