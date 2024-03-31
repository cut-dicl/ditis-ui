import { DataTable } from "primereact/datatable";
import BorderHeader from "../../UI/BorderHeader";
import { Column } from "primereact/column";
import { Chart } from "primereact/chart";
import { Panel } from "primereact/panel";
import colorPalette from "../generic/colorPallete";
import { convertUnderlineToTitleCase } from "../../utils/convertStringFunctions";

const PieWithTableReport = ({
  content,
  tableData,
  pieTitle = "",
  tableTitle = "",
}) => {
  const titleHeaders = ["Counts", "Total Bytes", "Total Time(ms)"];

  const pieData = (index) => {
    return {
      labels: Object.keys(content.rows)
        .filter((item) => item !== "TOTAL_REQUESTS")
        .map((item) => convertUnderlineToTitleCase(item)),
      datasets: [
        {
          data: Object.entries(content.rows)
            .filter((item) => item[0] !== "TOTAL_REQUESTS")
            .map((item) => {
              return item[1][index] ? item[1][index] : 0;
            }),
          backgroundColor: colorPalette(),
          borderColor: colorPalette(),
        },
      ],
    };
  };

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
        },
      },
    },
  };

  const formatNumber = (rowData, column) => {
    const number = rowData[column.field];
    // Check if the number is an integer
    if (Number.isInteger(number)) {
      return number.toLocaleString(); // Integer, use regular formatting
    } else {
      const [integerPart, decimalPart] = number.toString().split("."); // Split into integer and decimal parts
      let formattedNumber = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ","); // Format integer part with separators
      if (decimalPart && parseInt(decimalPart) !== 0) {
        formattedNumber += `.${decimalPart}`; // Append decimal part if it's not zero
      }
      return formattedNumber;
    }
  };

  return (
    <>
      <Panel
        header={pieTitle}
        className="mb-20"
        style={{
          fontFamily: "Montserrat, sans-serif",
        }}
      >
        <div className="flex flex-wrap justify-between">
          {titleHeaders.map((item, index) => {
            return (
              <div
                key={index}
                style={{
                  background: "#f0f0f0",
                  borderRadius: "8px",
                  padding: "10px",
                  minHeight: "350px",
                  width: "32%",
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
                }}
              >
                <h1
                  className="text-xl font-bold text-black"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  {item}
                </h1>
                <Chart
                  type="pie"
                  data={pieData(index)}
                  options={options}
                  height="350px"
                />
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="mb-10">
        <Panel
          header={tableTitle}
          style={{
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          <DataTable
            value={tableData}
            tableStyle={{
              width: "100%",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
              fontFamily: "Montserrat, sans-serif",
            }}
            showGridlines
            stripedRows
            size="small"
          >
            <Column
              field="label"
              header={content.header[0]}
              className="font-bold"
              body={(rowData) => {
                return convertUnderlineToTitleCase(rowData.label);
              }}
            />
            <Column
              field="counts"
              header={content.header[1]}
              style={{ textAlign: "right" }}
              body={formatNumber}
            />
            <Column
              field="totalBytes"
              header={content.header[2]}
              style={{ textAlign: "right" }}
              body={formatNumber}
            />
            <Column
              field="totalTime"
              header={content.header[3]}
              style={{ textAlign: "right" }}
              body={formatNumber}
            />
            <Column
              field="latency"
              header={content.header[4]}
              style={{ textAlign: "right" }}
              body={formatNumber}
            />
            <Column
              field="iops"
              header={content.header[5]}
              style={{ textAlign: "right" }}
              body={formatNumber}
            />
            <Column
              field="throughput"
              header={content.header[6]}
              style={{ textAlign: "right" }}
              body={formatNumber}
            />
          </DataTable>
        </Panel>
      </div>
    </>
  );
};

export default PieWithTableReport;
