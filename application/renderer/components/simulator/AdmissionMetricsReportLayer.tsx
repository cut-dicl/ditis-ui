import { Chart } from "primereact/chart";
import ReportCard from "../../UI/ReportCard";
import ReportItemCard from "../../UI/ReportItemCard";
import React from "react";

const AdmissionPrefetchMetricsReportLayer = ({
  reportContent,
  barLabelsIndexes,
  options,
  keys,
  printMode,
}) => {
  const verticalBarsDataHandler = (
    first: number,
    second: number,
    filteredLabels: string[],
    layerName: string
  ) => {
    return {
      labels: filteredLabels.map((item) => {
        return item.replace(layerName, "");
      }), // these are what appears on the bottom
      datasets: [
        {
          label: reportContent.header[first + 1], // these are the names of the actual bars so one will be the first one will be the second
          data: Object.entries(reportContent.rows)
            .map((item) => {
              const found = filteredLabels.indexOf(item[0]) !== -1;
              if (found) {
                return item[1][first];
              }
            })
            .filter((element) => element !== undefined),
          backgroundColor: "#50C878",
        },
        {
          label: reportContent.header[second + 1],
          data: Object.entries(reportContent.rows)
            .map((item) => {
              const found = filteredLabels.indexOf(item[0]) !== -1;
              if (found) {
                return item[1][second];
              }
            })
            .filter((element) => element !== undefined),
          backgroundColor: "#FF4D52",
        },
      ],
    };
  };
  const chartRef = React.useRef(null);

  React.useEffect(() => {
    if (chartRef.current) {
      let canvas = chartRef.current.getCanvas();
      canvas.style.width = "100%";
    }
  }, []);

  return (
    <ReportCard>
      {keys.map((item) => {
        const layerName = item.split(" ")[0];
        const layerLabels = Object.keys(reportContent.rows).filter((item) =>
          item.includes(layerName)
        );

        return (
          <ReportItemCard
            key={layerName}
            style={{ width: printMode ? "48%" : "30%" }}
          >
            <h1
              className="text-l font-bold text-black dark:text-white"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {layerName} Layer
            </h1>
            <Chart
              className="vertical-bar-chart"
              type="bar"
              data={verticalBarsDataHandler(
                barLabelsIndexes.first,
                barLabelsIndexes.second,
                layerLabels,
                layerName
              )}
              options={options}
              style={
                printMode ? { maxHeight: "260px" } : { minHeight: "450px" }
              }
              ref={chartRef}
            />
          </ReportItemCard>
        );
      })}
    </ReportCard>
  );
};

export default AdmissionPrefetchMetricsReportLayer;
