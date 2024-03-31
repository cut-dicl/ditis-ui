import { Chart } from "primereact/chart";
import colorPalette from "../generic/colorPallete";
import { convertUnderlineToTitleCase } from "../../utils/convertStringFunctions";

const StorageNodesPieCharts = ({ reportContent, blockSelection }) => {
  console.log(reportContent);

  const pieData = (index) => {
    return {
      labels: Object.keys(reportContent.rows).map((item) => convertUnderlineToTitleCase(item)),
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
        },
      },
    },
  };
  return (
    <>
      <div
        className="flex justify-between"
      >
        <div style={{ width: "33%" }}>
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
              Counts
            </h1>
            <Chart type="pie" data={pieData(0)} options={options} />
          </div>
        </div>
        <div style={{ width: "33%" }}>
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
              Total Bytes
            </h1>
            <Chart type="pie" data={pieData(1)} options={options} />
          </div>
        </div>
        <div style={{ width: "33%" }}>
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
              Total Time
            </h1>
            <Chart type="pie" data={pieData(2)} options={options} />
          </div>
        </div>
      </div>
    </>
  );
};

export default StorageNodesPieCharts;
