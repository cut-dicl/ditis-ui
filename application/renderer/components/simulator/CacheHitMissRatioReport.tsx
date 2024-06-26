import React, { cache, useContext } from "react";
import { ReportContext } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook";
import { Chart } from "primereact/chart";
import { IReportObject } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook-provider";
import AdmissionPrefetchMetricsReportLayer from "./AdmissionMetricsReportLayer";
import { Divider } from "primereact/divider";
import BorderHeader from "../../UI/BorderHeader";
import { Panel } from "primereact/panel";
import { useTheme } from "next-themes";

const CacheHitMissRatioReport = (props) => {
  const reportCtx = useContext(ReportContext);
  const theme = useTheme();

  const stackedBarCarts = [
    {
      label: "Hits to Misses",
      first: 0,
      second: 1,
    },
    {
      label: "Hit to Miss Ratio",
      first: 2,
      second: 3,
    },
    {
      label: "Byte Hits Misses",
      first: 4,
      second: 5,
    },
    {
      label: "Byte Hit to Miss Ratio",
      first: 6,
      second: 7,
    },
  ];

  const cacheHitMissContent: IReportObject = reportCtx.reportData["Cache Hits"];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1.1,
    plugins: {
      tooltips: {
        mode: "index",
      },
      shadowBlur: 10,
      shadowColor: "rgba(0, 0, 0, 0.5)",
      legend: {
        labels: {
          color: theme.theme === "dark" ? "lightgrey" : "black",
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: theme.theme === "dark" ? "lightgrey" : "black",
        },
      },
      y: {
        stacked: true,
        ticks: {
          color: theme.theme === "dark" ? "lightgrey" : "black",
        },
      },
    },
  };

  const keys = Object.keys(cacheHitMissContent.rows).filter((item) =>
    item.includes(" ")
  );

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
            Cache Hits/Misses
          </span>
        </div>
      )}
      {stackedBarCarts.map((item) => {
        return (
          <div key={item.label} className="mb-20 avoid-page-break">
            {!props.printMode && (
              <Panel
                header={item.label}
                style={{
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                <AdmissionPrefetchMetricsReportLayer
                  barLabelsIndexes={item}
                  reportContent={cacheHitMissContent}
                  options={chartOptions}
                  keys={keys}
                  printMode={props.printMode}
                />
              </Panel>
            )}
            {props.printMode && (
              <div key={item.label} className="avoid-page-break">
                <div className="w-full mb-4 flex justify-center">
                  <span className="text-center font-bold text-xl border-y-2 border-slate-300 py-1 px-4">
                    {item.label}
                  </span>
                </div>
                <AdmissionPrefetchMetricsReportLayer
                  barLabelsIndexes={item}
                  reportContent={cacheHitMissContent}
                  options={chartOptions}
                  keys={keys}
                  printMode={props.printMode}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CacheHitMissRatioReport;
