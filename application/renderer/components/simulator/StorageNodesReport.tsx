import { useContext } from "react";
import { ReportContext } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook";
import { IReportObject } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook-provider";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Panel } from "primereact/panel";
import { Divider } from "primereact/divider";
import StorageNodesPieCharts from "./StorageNodesPieCharts";
import { convertUnderlineToTitleCase } from "../../utils/convertStringFunctions";

const StorageNodesReport = () => {
  const reportCtx = useContext(ReportContext);

  const storageNodeContent: { [key: string]: IReportObject } =
    reportCtx.reportData["Storage Nodes"];

  const tableData = (storageNodeData: IReportObject) => {
    console.log(storageNodeData);
    let counter = 0;
    const data = Object.entries(storageNodeData.rows).map((item) => {
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
    return counter === Object.keys(storageNodeData.rows).length ? [] : data;
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
      {Object.entries(storageNodeContent).map((item, index) => {
        return (
          <Panel header={`${item[0]}`} style={{ marginBottom: "30px" }}>
            <StorageNodesPieCharts
              blockSelection={index}
              reportContent={item[1]}
            />
            <div className="flex justify-center my-5">
              <Divider className="h-[1px] bg-gray-400 w-3/4" />
            </div>
            <DataTable
              value={tableData(item[1])}
              showGridlines
              tableStyle={{
                width: "100%",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                fontFamily: "Montserrat, sans-serif",
              }}
              emptyMessage={`No data to display for ${item[0]}`}
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
        );
      })}
    </>
  );
};

export default StorageNodesReport;
