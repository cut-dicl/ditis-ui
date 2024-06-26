import { Chart } from "chart.js";
import { SankeyController, Flow } from "chartjs-chart-sankey";
import { useEffect, useRef, useState } from "react";
import { ReportContext } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook";
import { IReportObject } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook-provider";
import { useContext } from "react";
import { Panel } from "primereact/panel";

const TierMigrationTableReport = (props) => {
  const canvasCountRef = useRef(null);
  const chartCountRef = useRef(null);
  const canvasBytesRef = useRef(null);
  const chartBytesRef = useRef(null);

  const reportCtx = useContext(ReportContext);

  const tierMigrationContent: IReportObject =
    reportCtx.reportData["Data Migration"];

  const dataMigrationEmpty = Object.entries(tierMigrationContent.rows).map(
    (item) => {
      if (item[1].every((item) => item === null || item === 0)) return true;
      return false;
    }
  );

  if (dataMigrationEmpty.every((item) => item === true))
    return (
      <>
        {props.printMode && (
          <>
            <div className="flex justify-center mb-5">
              <span
                style={{
                  fontFamily: "Montserrat, sans-serif",
                }}
                className="font-bold text-center text-2xl"
              >
                Data Migration
              </span>
            </div>
          </>
        )}
        <div className="flex justify-center">
          <h1>No data was generated for data migration.</h1>
        </div>
      </>
    );

  //if()

  useEffect(() => {
    if (canvasCountRef.current) {
      const ctx = canvasCountRef.current.getContext("2d");

      Chart.register(SankeyController, Flow);

      let chartdata = [];
      Object.entries(tierMigrationContent.rows).forEach((item) => {
        for (let i = 0; i < 6; i += 2) {
          if (!item[1][i]) continue;

          chartdata.push({
            from: item[0],
            to: tierMigrationContent.header[i + 1],
            flow: item[1][i],
          });
        }
      });

      chartCountRef.current = new Chart(ctx, {
        type: "sankey",
        data: {
          datasets: [
            {
              data: chartdata,
              colorFrom: (c) => getColor(c.dataset.data[c.dataIndex].from),
              colorTo: (c) => getColor(c.dataset.data[c.dataIndex].to),
              colorMode: "gradient", // or 'from' or 'to'
            },
          ],
        },
      });
    }

    if (canvasBytesRef.current) {
      const ctx = canvasBytesRef.current.getContext("2d");

      Chart.register(SankeyController, Flow);

      let chartdata = [];
      Object.entries(tierMigrationContent.rows).forEach((item) => {
        for (let i = 1; i < 6; i += 2) {
          if (!item[1][i]) continue;
          chartdata.push({
            from: item[0],
            to: tierMigrationContent.header[i + 1],
            flow: item[1][i],
          });
        }
      });

      chartBytesRef.current = new Chart(ctx, {
        type: "sankey",
        data: {
          datasets: [
            {
              data: chartdata,
              colorFrom: (c) => getColor(c.dataset.data[c.dataIndex].from),
              colorTo: (c) => getColor(c.dataset.data[c.dataIndex].to),
              colorMode: "gradient", // or 'from' or 'to'
            },
          ],
        },
      });
    }

    return () => {
      if (chartCountRef.current) {
        chartCountRef.current.destroy();
      }

      if (chartBytesRef.current) {
        chartBytesRef.current.destroy();
      }
    };
  }, []);

  const getColor = (key) => {
    const colorMap = {
      "From Hot Tier": "#ff0000",
      "From Warm Tier": "#FFA500",
      "From Cold Tier": "#0000FF",
      "To Hot (Count)": "#ff0000",
      "To Hot (bytes)": "#ff0000",
      "To Warm (Count)": "#FFA500",
      "To Warm (bytes)": "#FFA500",
      "To Cold (Count)": "#0000FF",
      "To Cold (Bytes)": "#0000FF",
    };
    return colorMap[key] || "#000000";
  };

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
            Data Migration
          </span>
        </div>
      )}
      <div style={{ height: "95%", width: "60%" }} className="avoid-page-break">
        <Panel
          header={"Data Migration from Tier to Tier(Count)"}
          style={{
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          <canvas ref={canvasCountRef} />
        </Panel>
      </div>

      <div
        style={{ height: "95%", width: "60%", marginTop: "100px" }}
        className="avoid-page-break"
      >
        <Panel
          header={"Data Migration from Tier to Tier(Bytes)"}
          style={{
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          <canvas ref={canvasBytesRef} />
        </Panel>
      </div>
    </div>
  );
};
export default TierMigrationTableReport;
