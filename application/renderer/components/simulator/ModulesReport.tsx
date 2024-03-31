import { useContext } from "react";
import { ReportContext } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook";
import { Chart } from "primereact/chart";
import { IReportObject } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook-provider";
import BorderHeader from "../../UI/BorderHeader";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import ReportItemCard from "../../UI/ReportItemCard";
import { Panel } from "primereact/panel";
import { Divider } from "primereact/divider";
import colorPalette from "../generic/colorPallete";
import { convertUnderlineToTitleCase } from "../../utils/convertStringFunctions";

const ModulesReport = () => {
  const reportCtx = useContext(ReportContext);

  const modulesContent = reportCtx.reportData[reportCtx.reportShown];

  const pieData = (layerPieData, index: number) => {
    return {
      labels: layerPieData.map((item) => {
        return convertUnderlineToTitleCase(item[0]);
      }),
      datasets: [
        {
          data: layerPieData.map((item) => {
            return item[1][index];
          }),
          backgroundColor: colorPalette(),
          borderColor: colorPalette(),
        },
      ],
    };
  };

  const tableData = (modulesData: IReportObject) => {
    let counter = 0;
    const data = Object.entries(modulesData.rows).map((item) => {
      if (item[1].every((element) => element === null || element === 0)) {
        counter++;
      }
      return {
        label: item[0],
        count:
          item[1][0] !== null
            ? Number.isInteger(item[1][0])
              ? item[1][0]
              : item[1][0].toFixed(3)
            : "-",
        totalBytes:
          item[1][1] !== null
            ? Number.isInteger(item[1][1])
              ? item[1][1]
              : item[1][1].toFixed(3)
            : "-",
        totalTime:
          item[1][2] !== null
            ? Number.isInteger(item[1][2])
              ? item[1][2]
              : item[1][2].toFixed(3)
            : "-",
        latency:
          item[1][3] !== null
            ? Number.isInteger(item[1][3])
              ? item[1][3]
              : item[1][3].toFixed(3)
            : "-",
        iops:
          item[1][4] !== null
            ? Number.isInteger(item[1][4])
              ? item[1][4]
              : item[1][4].toFixed(3)
            : "-",
        throughput:
          item[1][5] !== null
            ? Number.isInteger(item[1][5])
              ? item[1][5]
              : item[1][5].toFixed(3)
            : "-",
      };
    });
    return counter === Object.keys(modulesData.rows).length ? [] : data;
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

  const pieLabels = [...modulesContent[0].header];
  pieLabels.shift();

  const bytes = Object.entries(modulesContent[0].rows).filter((item) => {
    return item[0].toLocaleLowerCase().endsWith("bytes");
  });

  const operations = Object.entries(modulesContent[0].rows).filter((item) => {
    return item[0].toLocaleLowerCase().endsWith("operations");
  });

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
    <div>
      {pieLabels.map((moduleName, index) => {
        const operationsZero = operations
          .map((arrayItem) => {
            return arrayItem[1][index];
          })
          .every((element) => element === 0);

        console.log(operationsZero);

        const bytesZero = bytes
          .map((arrayItem) => {
            return arrayItem[1][index];
          })
          .every((element) => element === 0);

        return (
          <div className="mb-20">
            <Panel
              header={moduleName}
              style={{
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              <div
                className="flex justify-between"
                style={{
                  padding: "20px",
                }}
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
                  <ReportItemCard key={moduleName} width={"49%"}>
                    <h1
                      className="text-l font-bold text-black"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      Operations
                    </h1>
                    <Chart
                      type="pie"
                      data={pieData(operations, index)}
                      options={options}
                    />
                  </ReportItemCard>
                )}

                {bytesZero ? (
                  <p
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                    }}
                  >
                    No Results for Bytes
                  </p>
                ) : (
                  <ReportItemCard key={moduleName + "1"} width={"49%"}>
                    <h1
                      className="text-l font-bold text-black"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      Bytes
                    </h1>
                    <Chart
                      type="pie"
                      data={pieData(bytes, index)}
                      options={options}
                    />
                  </ReportItemCard>
                )}
              </div>

              <div className="flex justify-center my-5">
                <Divider className="h-[1px] bg-gray-400 w-2/4" />
              </div>
              <DataTable
                value={tableData(modulesContent[1][moduleName])}
                showGridlines
                tableStyle={{
                  width: "100%",
                  marginBottom: "10px",
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                  fontFamily: "Montserrat, sans-serif",
                }}
                emptyMessage={`No data to display for ${moduleName}`}
                size="small"
              >
                <Column
                  header=""
                  field="label"
                  body={(rowData) => {
                    return convertUnderlineToTitleCase(rowData.label);
                  }}
                />
                <Column
                  header="Count"
                  field="count"
                  style={{ textAlign: "right" }}
                  body={formatNumber}
                />
                <Column
                  header="Total Bytes"
                  field="totalBytes"
                  style={{ textAlign: "right" }}
                  body={formatNumber}
                />
                <Column
                  header="Total Time (ms)"
                  field="totalTime"
                  style={{ textAlign: "right" }}
                  body={formatNumber}
                />
                <Column
                  header="Latency (ms)"
                  field="latency"
                  style={{ textAlign: "right" }}
                  body={formatNumber}
                />
                <Column
                  header="IOPS"
                  field="iops"
                  style={{ textAlign: "right" }}
                  body={formatNumber}
                />
                <Column
                  header="Throughput(MB/s)"
                  field="throughput"
                  style={{ textAlign: "right" }}
                  body={formatNumber}
                />
              </DataTable>
            </Panel>
          </div>
        );
      })}
    </div>
  );
};

export default ModulesReport;
