import { createContext } from "react";

interface reportType {
  reportData: any;
  handleReportData: (fetchedReportDat: any) => void;
  reportShown: string;
  handleReportShown: (selectedReport: any) => void;
}

export const reportDefaultBehavior: reportType = {
  reportData: {},
  handleReportData: (fetchedReportData: any) => {},
  reportShown: "",
  handleReportShown: (selectedReport: any) => {},
};

export const ReportContext = createContext(reportDefaultBehavior);
