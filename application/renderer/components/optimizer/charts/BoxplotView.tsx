import { useEffect, useState } from "react";
import BoxplotChart from "./BoxplotChart";
import colorPalette from "../../generic/colorPallete";

export interface BoxPlotViewProps {
  selectedMetrics: any;
  plotdata: any;
  chartSize: any;
  print?: any;
  points?: any;
}

export function BoxplotView({
  selectedMetrics,
  plotdata,
  chartSize,
  print,
  points
}: BoxPlotViewProps) {
  if (print) {
    return (
      selectedMetrics &&
        selectedMetrics.map((metric) => {
          return (<div key={metric}>
            <BoxplotChart
              plotdata={{
                labels: Object.keys(plotdata).map((str) => {
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
                    label: "",
                    itemRadius: print? 4 : 0,
                    data: Object.keys(plotdata).map((key) =>
                      plotdata[key].map((val) => parseFloat(val[metric]))
                    ),
                    backgroundColor: colorPalette(),
                    borderColor: colorPalette(),
                  },
                ],
              }}
              metric={metric}
              chartSize={chartSize}
              print={print}
            />
            <div className="page-break"></div>
            </div>
          );
        })
    )
  }

  return (
    <div className="flex flex-row flex-wrap mt-10 gap-8 justify-center">
      {selectedMetrics &&
        selectedMetrics.map((metric) => {
          return (
            <BoxplotChart
              plotdata={{
                labels: Object.keys(plotdata).map((str) => {
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
                    label: "",
                    itemRadius: points ? 4 : 0,
                    data: Object.keys(plotdata).map((key) =>
                      plotdata[key].map((val) => parseFloat(val[metric]))
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
