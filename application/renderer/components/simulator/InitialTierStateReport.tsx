import { useContext } from "react";
import { ReportContext } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook";
import { IReportObject } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook-provider";
import { Chart } from "primereact/chart";
import BlockSplitOperationsBytesTime from "./BlockSplitOperationsBytesTime";
import BorderHeader from "../../UI/BorderHeader";
import { Panel } from "primereact/panel";

const InitialTierStateReport = () => {
  const reportCtx = useContext(ReportContext);

  const initialTierStateReportContent: IReportObject =
    reportCtx.reportData["Initial Tier State"];

  const initialTierStateCharts = ["HOT", "WARM", "COLD"];

  return (
    <div>
      {initialTierStateCharts.map((item, index) => {
        return (
          <div key={item} className="mb-20">
            <Panel
              header={`${item} Tier`}
              style={{
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              <BlockSplitOperationsBytesTime
                blockSelection={index}
                reportContent={initialTierStateReportContent}
              />
            </Panel>
          </div>
        );
      })}
    </div>
  );
};

export default InitialTierStateReport;
