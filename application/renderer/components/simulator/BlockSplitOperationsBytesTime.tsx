import { Chart } from "primereact/chart";
import colorPalette from "../generic/colorPallete";
import { convertUnderlineToTitleCase } from "../../utils/convertStringFunctions";
import { useTheme } from "next-themes";

const BlockSplitOperationsBytesTime = ({
  reportContent,
  blockSelection,
  printMode,
}) => {
  const theme = useTheme();
  const operations = Object.entries(reportContent.rows).filter((item) => {
    if (
      item.toString().toLocaleLowerCase().includes("operations") &&
      !item.toString().toLocaleLowerCase().includes("create")
    )
      return item;
  });

  const bytes = Object.entries(reportContent.rows).filter((item) => {
    if (item.toString().toLocaleLowerCase().includes("bytes")) return item;
  });

  const time = Object.entries(reportContent.rows).filter((item) => {
    if (item.toString().toLocaleLowerCase().includes("time")) return item;
  });

  const tierStateHandler = (selectedType, index) => {
    return {
      labels: selectedType.map((arrayItem) => {
        return convertUnderlineToTitleCase(arrayItem[0]);
      }),
      datasets: [
        {
          data: selectedType.map((arrayItem) => {
            return arrayItem[1][index];
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
        position: "bottom",
        labels: {
          usePointStyle: true,
          color: theme.theme === "dark" ? "lightgrey" : "black",
        },
      },
    },
  };

  const operationsZero = operations
    .map((arrayItem) => {
      return arrayItem[1][blockSelection];
    })
    .every((element) => element === 0);

  const bytesZero = bytes
    .map((arrayItem) => {
      return arrayItem[1][blockSelection];
    })
    .every((element) => element === 0);

  const timesZero = time
    .map((arrayItem) => {
      return arrayItem[1][blockSelection];
    })
    .every((element) => element === 0);

  return (
    <div className="avoid-page-break w-full">
      {!printMode && (
        <div className="flex justify-between w-full">
          <div style={{ width: "33%" }}>
            {operationsZero ? (
              <p
                style={{
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                No Results for Operations
              </p>
            ) : (
              <div
                style={{
                  borderRadius: "8px",
                  padding: "10px",
                  borderColor: "rgba(0, 0, 0, 0.1)",
                  borderWidth: "2px",
                }}
              >
                <h1
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  Operations
                </h1>
                <Chart
                  type="pie"
                  className="big-vertical-bar-chart"
                  data={tierStateHandler(operations, blockSelection)}
                  options={options}
                />
              </div>
            )}
          </div>
          <div style={{ width: "33%" }}>
            {bytesZero ? (
              <p
                style={{
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                No results for Bytes
              </p>
            ) : (
              <div
                style={{
                  borderRadius: "8px",
                  padding: "10px",
                  borderColor: "rgba(0, 0, 0, 0.1)",
                  borderWidth: "2px",
                }}
              >
                <h1
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  Bytes
                </h1>
                <Chart
                  type="pie"
                  className="big-vertical-bar-chart"
                  data={tierStateHandler(bytes, blockSelection)}
                  options={options}
                />
              </div>
            )}
          </div>
          <div style={{ width: "33%" }}>
            {timesZero ? (
              <p
                style={{
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                No Results for Time
              </p>
            ) : (
              <div
                style={{
                  borderRadius: "8px",
                  padding: "10px",
                  borderColor: "rgba(0, 0, 0, 0.1)",
                  borderWidth: "2px",
                }}
              >
                <h1
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  Time
                </h1>
                <Chart
                  type="pie"
                  className="big-vertical-bar-chart"
                  data={tierStateHandler(time, blockSelection)}
                  options={options}
                />
              </div>
            )}
          </div>
        </div>
      )}
      {printMode && (
        <div className="flex justify-center flex-wrap gap-5">
          <div
            style={{ width: operationsZero ? "25%" : "48%" }}
            className="avoid-page-break"
          >
            {operationsZero ? (
              <p
                style={{
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                No Results for Operations
              </p>
            ) : (
              <div
                style={{
                  borderRadius: "8px",
                  padding: "10px",
                  borderColor: "rgba(0, 0, 0, 0.1)",
                  borderWidth: "2px",
                }}
              >
                <h1
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  Operations
                </h1>
                <div className="flex justify-center">
                  <Chart
                    type="pie"
                    className=""
                    data={tierStateHandler(operations, blockSelection)}
                    options={options}
                  />
                </div>
              </div>
            )}
          </div>
          <div
            style={{ width: bytesZero ? "25%" : "48%" }}
            className="avoid-page-break"
          >
            {bytesZero ? (
              <p
                style={{
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                No results for Bytes
              </p>
            ) : (
              <div
                style={{
                  borderRadius: "8px",
                  padding: "10px",
                  borderColor: "rgba(0, 0, 0, 0.1)",
                  borderWidth: "2px",
                }}
              >
                <h1
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  Bytes
                </h1>
                <div className="flex justify-center">
                  <Chart
                    type="pie"
                    className=""
                    data={tierStateHandler(bytes, blockSelection)}
                    options={options}
                  />
                </div>
              </div>
            )}
          </div>
          <div
            style={{ width: timesZero ? "25%" : "48%" }}
            className="avoid-page-break"
          >
            {timesZero ? (
              <p
                style={{
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                No Results for Time
              </p>
            ) : (
              <div
                style={{
                  borderRadius: "8px",
                  padding: "10px",
                  borderColor: "rgba(0, 0, 0, 0.1)",
                  borderWidth: "2px",
                }}
              >
                <h1
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  Time
                </h1>
                <div className="flex justify-center">
                  <Chart
                    type="pie"
                    className=""
                    data={tierStateHandler(time, blockSelection)}
                    options={options}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default BlockSplitOperationsBytesTime;
