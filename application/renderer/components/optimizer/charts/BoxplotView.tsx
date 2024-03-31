import { useEffect, useState } from "react";
import { convertUnderlineToTitleCase } from "../../../utils/convertStringFunctions";
import BoxplotChart from "./BoxplotChart";
import colorPalette from "../../generic/colorPallete";

export function BoxplotView({
  selectedColumn,
  selectedMetrics,
  groupBy,
  chartSize,
}) {
  const [plotdata, setPlotdata] = useState(groupBy(selectedColumn));

  useEffect(() => {
    setPlotdata(groupBy(selectedColumn));
  }, [selectedColumn, selectedMetrics]);

  return (
    <div className="flex flex-row flex-wrap mt-10 gap-8 justify-center">
      {selectedMetrics &&
        selectedMetrics.map((metric) => {
          return (
            <BoxplotChart
              plotdata={{
                labels: Object.keys(plotdata).map((str) => {
                  if (str.includes(".")) {
                    // Split the string by dots and get the last element
                    return str.split(".").pop();
                  } else {
                    // If there are no dots, return the original string
                    return str;
                  }
                }),
                datasets: [
                  {
                    label: "",
                    itemRadius: 0,
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
            />
          );
        })}
    </div>
  );
}
