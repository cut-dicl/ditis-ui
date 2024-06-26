import { Chart } from "primereact/chart";
import colorPalette from "../generic/colorPallete";
import { convertUnderlineToTitleCase } from "../../utils/convertStringFunctions";
import { useTheme } from "next-themes";

const StorageNodesPieCharts = ({
  reportContent,
  blockSelection,
  printMode,
  itemName,
}) => {
  const theme = useTheme();

  const pieData = (index) => {
    return {
      labels: Object.keys(reportContent.rows).map((item) =>
        convertUnderlineToTitleCase(item)
      ),
      datasets: [
        {
          data: Object.entries(reportContent.rows).map((item) => {
            return item[1][index];
          }),
          backgroundColor: colorPalette(),
          borderColor: colorPalette(),
        },
      ],
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          usePointStyle: true,
          color: theme.theme === "dark" ? "lightgrey" : "black",
        },
      },
    },
  };
  return (
    <>
      <div className="avoid-page-break">
        {!printMode && (
          <div className="flex justify-between">
            <div style={{ width: "33%" }}>
              <div
                style={{
                  borderRadius: "8px",
                  padding: "10px",
                  borderColor: "rgba(0, 0, 0, 0.1)",
                  borderWidth: "2px",
                }}
              >
                <h1
                  className="text-2xl font-bold "
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  Counts
                </h1>
                <Chart
                  type="pie"
                  data={pieData(0)}
                  options={options}
                  className="big-vertical-bar-chart"
                />
              </div>
            </div>
            <div style={{ width: "33%" }}>
              <div
                style={{
                  borderRadius: "8px",
                  padding: "10px",
                  borderColor: "rgba(0, 0, 0, 0.1)",
                  borderWidth: "2px",
                }}
              >
                <h1
                  className="text-2xl font-bold "
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  Total Bytes
                </h1>
                <Chart
                  type="pie"
                  data={pieData(1)}
                  options={options}
                  className="big-vertical-bar-chart"
                />
              </div>
            </div>
            <div style={{ width: "33%" }}>
              <div
                style={{
                  borderRadius: "8px",
                  padding: "10px",
                  borderColor: "rgba(0, 0, 0, 0.1)",
                  borderWidth: "2px",
                }}
              >
                <h1
                  className="text-2xl font-bold "
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  Total Time
                </h1>
                <Chart
                  type="pie"
                  data={pieData(2)}
                  options={options}
                  className="big-vertical-bar-chart"
                />
              </div>
            </div>
          </div>
        )}
        {printMode && (
          <>
            <div className="flex justify-center mb-5 mt-5">
              <span
                style={{
                  fontFamily: "Montserrat, sans-serif",
                }}
                className="font-bold text-center text-xl"
              >
                {itemName}
              </span>
            </div>
            <div className="flex justify-center flex-wrap gap-5">
              <div style={{ width: "48%" }}>
                <div
                  style={{
                    borderRadius: "8px",
                    padding: "10px",
                    borderColor: "rgba(0, 0, 0, 0.1)",
                    borderWidth: "2px",
                  }}
                >
                  <h1
                    className="text-2xl font-bold "
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                    }}
                  >
                    Counts
                  </h1>
                  <div className="flex justify-center">
                    <Chart
                      type="pie"
                      data={pieData(0)}
                      options={options}
                      className="big-vertical-bar-chart"
                    />
                  </div>
                </div>
              </div>
              <div style={{ width: "48%" }}>
                <div
                  style={{
                    borderRadius: "8px",
                    padding: "10px",
                    borderColor: "rgba(0, 0, 0, 0.1)",
                    borderWidth: "2px",
                  }}
                >
                  <h1
                    className="text-2xl font-bold "
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                    }}
                  >
                    Total Bytes
                  </h1>
                  <div className="flex justify-center">
                    <Chart
                      type="pie"
                      data={pieData(1)}
                      options={options}
                      className="big-vertical-bar-chart"
                    />
                  </div>
                </div>
              </div>
              <div style={{ width: "48%" }}>
                <div
                  style={{
                    borderRadius: "8px",
                    padding: "10px",
                    borderColor: "rgba(0, 0, 0, 0.1)",
                    borderWidth: "2px",
                  }}
                >
                  <h1
                    className="text-2xl font-bold "
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                    }}
                  >
                    Total Time
                  </h1>
                  <div className="flex justify-center">
                    <Chart
                      type="pie"
                      data={pieData(2)}
                      options={options}
                      className="big-vertical-bar-chart"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default StorageNodesPieCharts;
