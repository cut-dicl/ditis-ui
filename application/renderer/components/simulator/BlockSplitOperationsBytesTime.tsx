import { Chart } from "primereact/chart";
import colorPalette from "../generic/colorPallete";
import { convertUnderlineToTitleCase } from "../../utils/convertStringFunctions";

const BlockSplitOperationsBytesTime = ({ reportContent, blockSelection }) => {
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
    aspectRatio: 0.8,
    plugins: {
      legend: {
        position: "right",
        labels: {
          usePointStyle: true,
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
    <div
      className="flex justify-between"
    >
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
              background: "#f0f0f0",
              borderRadius: "8px",
              padding: "16px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
              margin: "0 10px 0 10px",
            }}
          >
            <h1
              className="text-2xl font-bold text-black"
              style={{
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              Operations
            </h1>
            <Chart
              type="pie"
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
              background: "#f0f0f0",
              borderRadius: "8px",
              padding: "16px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
              margin: "0 10px 0 10px",
            }}
          >
            <h1
              className="text-2xl font-bold text-black"
              style={{
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              Bytes
            </h1>
            <Chart
              type="pie"
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
              background: "#f0f0f0",
              borderRadius: "8px",
              padding: "16px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
              margin: "0 10px 0 10px",
            }}
          >
            <h1
              className="text-2xl font-bold text-black"
              style={{
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              Time
            </h1>
            <Chart
              type="pie"
              data={tierStateHandler(time, blockSelection)}
              options={options}
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default BlockSplitOperationsBytesTime;
