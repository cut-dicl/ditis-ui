import { DataTable } from "primereact/datatable";
import BorderHeader from "../../UI/BorderHeader";
import { Column } from "primereact/column";
import { Chart } from "primereact/chart";
import { Panel } from "primereact/panel";
import colorPalette from "../generic/colorPallete";
import { convertUnderlineToTitleCase } from "../../utils/convertStringFunctions";
import { useTheme } from "next-themes";

const PieWithTableReport = ({
  content,
  tableData,
  pieTitle = "",
  tableTitle = "",
  printMode,
}) => {
  const titleHeaders = ["Counts", "Total Bytes", "Total Time(ms)"];
  const theme = useTheme();

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
          color: theme.theme === "dark" ? "lightgrey" : "black",
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
      {!printMode && (
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
                    borderRadius: "8px",
                    padding: "10px",
                    borderColor: "rgba(0, 0, 0, 0.1)",
                    borderWidth: "2px",
                    minWidth: "32%",
                  }}
                >
                  <h1
                    className="text-xl font-bold"
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
      )}
      {printMode && (
        <div className="avoid-page-break w-full">
          <div className="flex flex-wrap justify-center gap-5 mb-10">
            {titleHeaders.map((item, index) => {
              return (
                <div style={{ width: "48%" }}>
                  <div
                    key={index}
                    style={{
                      borderRadius: "8px",
                      padding: "10px",
                      borderColor: "rgba(0, 0, 0, 0.1)",
                      borderWidth: "2px",
                    }}
                  >
                    <h1
                      className="text-xl font-bold"
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                      }}
                    >
                      {item}
                    </h1>
                    <div className="flex justify-center">
                      <Chart
                        type="pie"
                        className="big-vertical-bar-chart"
                        data={pieData(index)}
                        options={options}
                        height="280px"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="page-break"></div>
        </div>
      )}

      <div className="mb-10">
        {!printMode && (
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
        )}
        {printMode && (
          <>
            <div className="avoid-page-break">
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
                className="text-xs"
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
            </div>
            <div className="page-break"></div>
          </>
        )}
      </div>
    </>
  );
};

export default PieWithTableReport;
