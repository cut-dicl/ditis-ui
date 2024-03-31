import { Chart } from "primereact/chart";
import ReportCard from "../../UI/ReportCard";
import ReportItemCard from "../../UI/ReportItemCard";

const AdmissionPrefetchMetricsReportLayer = ({
  reportContent,
  barLabelsIndexes,
  options,
  keys,
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

  return (
    <ReportCard>
      {keys.map((item) => {
        const layerName = item.split(" ")[0];
        const layerLabels = Object.keys(reportContent.rows).filter((item) =>
          item.includes(layerName)
        );

        return (
          <ReportItemCard key={layerName} width={"30%"}>
            <h1
              className="text-l font-bold text-black"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {layerName} Layer
            </h1>
            <Chart
              type="bar"
              data={verticalBarsDataHandler(
                barLabelsIndexes.first,
                barLabelsIndexes.second,
                layerLabels,
                layerName
              )}
              options={options}
              style={{minHeight: "350px"}}
            />
          </ReportItemCard>
        );
      })}
    </ReportCard>
  );
};

export default AdmissionPrefetchMetricsReportLayer;
