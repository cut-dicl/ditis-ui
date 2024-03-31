import { useState } from "react";
import { ReportContext } from "./simulator-report-hook";

export interface IReportObject {
  header: string[];
  rows: {
    [key: string]: any;
  };
}

export const ReportProvider = ({ children }) => {
  const [reportData, setReportData] = useState({});
  const [reportShown, setReportShown] = useState("Workload Replay");

  const handleReportData = (fetchedReportData: any) => {
    setReportData(fetchedReportData);
  };

  const handleReportShown = (selectedReport) => {
    setReportShown(selectedReport);
  };

  return (
    <ReportContext.Provider
      value={{ reportData, handleReportData, reportShown, handleReportShown }}
    >
      {children}
    </ReportContext.Provider>
  );
};
