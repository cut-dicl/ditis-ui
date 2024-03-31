import React, { cache, useContext } from "react";
import { ReportContext } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook";
import { Chart } from "primereact/chart";
import { IReportObject } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook-provider";
import AdmissionPrefetchMetricsReportLayer from "./AdmissionMetricsReportLayer";
import { Divider } from "primereact/divider";
import BorderHeader from "../../UI/BorderHeader";
import { Panel } from "primereact/panel";

const CacheHitMissRatioReport = React.forwardRef<HTMLDivElement>(
  (props, ref) => {
    const reportCtx = useContext(ReportContext);

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

    const cacheHitMissContent: IReportObject =
      reportCtx.reportData["Cache Hits"];

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 1,
      plugins: {
        tooltips: {
          mode: "index",
        },
        shadowBlur: 10,
        shadowColor: "rgba(0, 0, 0, 0.5)",
      },
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
        },
      },
    };

    const keys = Object.keys(cacheHitMissContent.rows).filter((item) =>
      item.includes(" ")
    );

    console.log(keys);
    return (
      <div ref={ref}>
        {stackedBarCarts.map((item) => {
          return (
            <div key={item.label} className="mb-20">
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
                />
              </Panel>
            </div>
          );
        })}
      </div>
    );
  }
);

export default CacheHitMissRatioReport;
