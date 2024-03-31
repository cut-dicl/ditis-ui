import { ReportProvider } from "../useContext-hooks/simulator-report-hook/simulator-report-hook-provider";

export const reportWithProvider = (WrappedComponent) => {
  return (props) => (
    <ReportProvider>
      <WrappedComponent {...props} />
    </ReportProvider>
  );
};
