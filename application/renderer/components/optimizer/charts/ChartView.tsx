import colorPalette from "../../generic/colorPallete";
import BarChart from "./BarChart";
export interface ChartViewProps {
  results: any;
  selectedMetrics: any;
  chartSize: any;
  print?: any;
}


export function ChartView({ results, selectedMetrics, chartSize, print }: ChartViewProps) {

  if (print) {
    return (
      selectedMetrics.map((metric) => {
        return (<>
          <BarChart
            plotdata={{
              labels: Object.keys(results).map((str) => {
                let label = str.split(",");
                label.forEach((element, index) => {
                  if (element.includes(".")) {
                    // Split the string by dots and get the last element
                    label[index] = element.split(".").pop();
                  }
                });
                return label;
              }),
              datasets: [
                {
                  label: "Average",
                  data: Object.values(results).map((val) =>
                    parseFloat(val[metric] && val[metric].toFixed(3))
                  ),
                  backgroundColor: colorPalette(),
                  borderColor: colorPalette(),
                },
              ],
            }}
            metric={metric}
            chartSize={chartSize}
            key={metric}
            print={print}
          />
          <div className="page-break"></div>
          </>
        );
      })
    )
  }


  return (
    <div className="flex flex-row flex-wrap mt-10 gap-8 justify-center">
      {selectedMetrics.map((metric) => {
        return (
          <BarChart
            plotdata={{
              labels: Object.keys(results).map((str) => {
                let label = str.split(",");
                label.forEach((element, index) => {
                  if (element.includes(".")) {
                    // Split the string by dots and get the last element
                    label[index] = element.split(".").pop();
                  }
                });
                return label;
              }),
              datasets: [
                {
                  label: "Average",
                  data: Object.values(results).map((val) =>
                    parseFloat(val[metric] && val[metric].toFixed(3))
                  ),
                  backgroundColor: colorPalette(),
                  borderColor: colorPalette(),
                },
              ],
            }}
            metric={metric}
            chartSize={chartSize}
            key={metric}
            print={print}
          />
        );
      })}
    </div>
  );
}
