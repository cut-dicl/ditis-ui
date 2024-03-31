import { Chart } from "chart.js";
import { SankeyController, Flow } from "chartjs-chart-sankey";
import { useEffect, useRef, useState } from "react";
import { ReportContext } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook";
import { IReportObject } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook-provider";
import { useContext } from "react";

const TierMigrationTableReport = () => {
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
  console.log(dataMigrationEmpty);

  if (dataMigrationEmpty.every((item) => item === true))
    return <p>No data was generated for data migration.</p>;

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

          console.log(item[0]);
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
    <div>
      <div style={{ height: "95%", width: "60%" }}>
        <h1
          className="text-l font-bold text-black mb-10"
          style={{
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          Data Migration from Tier to Tier(Count)
        </h1>
        <canvas ref={canvasCountRef} />
      </div>

      <div style={{ height: "95%", width: "60%", marginTop: "100px" }}>
        <h1
          className="text-l font-bold text-black mb-10"
          style={{
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          Data Migration from Tier to Tier(Bytes)
        </h1>
        <canvas ref={canvasBytesRef} />
      </div>
    </div>
  );
};
export default TierMigrationTableReport;
