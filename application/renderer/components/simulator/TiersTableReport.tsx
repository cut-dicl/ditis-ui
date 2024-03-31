import { useContext } from "react";
import { ReportContext } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook";
import { IReportObject } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook-provider";
import { Chart } from "primereact/chart";
import BlockSplitOperationsBytesTime from "./BlockSplitOperationsBytesTime";
import BorderHeader from "../../UI/BorderHeader";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Divider } from "primereact/divider";
import { Panel } from "primereact/panel";
import { convertUnderlineToTitleCase } from "../../utils/convertStringFunctions";

const TiersTableReport = () => {
  const tierTableLabels = ["HOT", "WARM", "COLD"];

  const reportCtx = useContext(ReportContext);

  const tierStateReportContent: IReportObject =
    reportCtx.reportData["Storage Tiers"][0];

  const tiersThroughputContent = reportCtx.reportData["Storage Tiers"][1];

  const tableData = (tierThroughputData: IReportObject) => {
    console.log(tierThroughputData);
    let counter = 0;
    const data = Object.entries(tierThroughputData.rows).map((item) => {
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
    return counter === 3 ? [] : data;
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
    <div>
      {tierTableLabels.map((item, index) => {
        return (
          <div key={item} className="mb-20">
            <Panel
              header={`${item} Tier`}
              style={{
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              <BlockSplitOperationsBytesTime
                blockSelection={index}
                reportContent={tierStateReportContent}
              />

              <div className="flex justify-center my-10">
                <Divider className="h-[1px] bg-gray-400 w-2/4" />
              </div>

              <div className="mt-10">
                {/* <div className="flex justify-center">
                  <h1
                    className="text-2xl font-bold text-black mb-3 w-fit p-2"
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                    }}
                  >
                    {item} Tier Throughput
                  </h1>
                </div> */}
                <DataTable
                  value={tableData(tiersThroughputContent[item])}
                  showGridlines
                  tableStyle={{
                    width: "100%",
                    marginBottom: "20px",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                    fontFamily: "Montserrat, sans-serif",
                  }}
                  size="small"
                  emptyMessage={`No data to display for ${item} Throughput`}
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
              </div>
            </Panel>
          </div>
        );
      })}
    </div>
  );
};

export default TiersTableReport;
