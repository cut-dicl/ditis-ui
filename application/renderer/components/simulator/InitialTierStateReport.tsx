import { useContext } from "react";
import { ReportContext } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook";
import { IReportObject } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook-provider";
import { Chart } from "primereact/chart";
import BlockSplitOperationsBytesTime from "./BlockSplitOperationsBytesTime";
import BorderHeader from "../../UI/BorderHeader";
import { Panel } from "primereact/panel";

const InitialTierStateReport = (props) => {
  const reportCtx = useContext(ReportContext);

  const initialTierStateReportContent: IReportObject =
    reportCtx.reportData["Initial Tier State"];

  const initialTierStateCharts = ["HOT", "WARM", "COLD"];

  return (
    <div className="avoid-page-break">
      {props.printMode && (
        <div className="flex justify-center mb-10">
          <span
            style={{
              fontFamily: "Montserrat, sans-serif",
            }}
            className="font-bold text-center text-2xl"
          >
            Initial Tier State
          </span>
        </div>
      )}
      {initialTierStateCharts.map((item, index) => {
        return (
          <div key={item} className="mb-20 avoid-page-break">
            {!props.printMode && (
              <Panel
                header={`${item} Tier`}
                style={{
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                <BlockSplitOperationsBytesTime
                  blockSelection={index}
                  reportContent={initialTierStateReportContent}
                  printMode={props.printMode}
                />
              </Panel>
            )}
            {props.printMode && (
              <>
                <div className="avoid-page-break">
                  <div className="flex justify-center mb-5">
                    <span
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                      }}
                      className="font-bold text-center text-xl"
                    >
                      {item} Tier
                    </span>
                  </div>
                  <BlockSplitOperationsBytesTime
                    blockSelection={index}
                    reportContent={initialTierStateReportContent}
                    printMode={props.printMode}
                  />
                </div>
                <div className="page-break"></div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default InitialTierStateReport;
