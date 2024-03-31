import AdmissionPrefetchMetricsReportLayer from "./AdmissionMetricsReportLayer";
import { ReportContext } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook";
import { IReportObject } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook-provider";
import { useContext } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import BorderHeader from "../../UI/BorderHeader";
import { Divider } from "primereact/divider";
import { Panel } from "primereact/panel";

const PrefetchMetricsReport = () => {
  const reportCtx = useContext(ReportContext);

  const verticalBarLabels = [
    {
      label: "Prefetch Hits to Total Prefetches",
      first: 0,
      second: 2,
    },
    {
      label: "Prefetch Byte Hits to Byte Prefetches",
      first: 1,
      second: 3,
    },
    {
      label: "Prefetch Hits To Reads",
      first: 0,
      second: 4,
    },
    {
      label: "Prefetch Byte Hits to Byte Reads",
      first: 1,
      second: 5,
    },
  ];

  const prefetchMetricsReportContent: IReportObject =
    reportCtx.reportData["Cache Prefetching"];

  const options = {
    maintainAspectRatio: false,
    aspectRatio: 0.8,
  };

  const tableData = (filteredLabels: string[], layerName: string) => {
    let counter = 0;

    const data = Object.entries(prefetchMetricsReportContent.rows)
      .map((item) => {
        const found = filteredLabels.indexOf(item[0]) !== -1;
        if (found) {
          if (!item[1][6] && !item[1][7] && !item[1][8] && !item[1][9]) {
            console.log("in counter");
            counter++;
          }

          return {
            label: item[0].includes(" ")
              ? item[0]
              : item[0].replace(layerName, ""),
            precision:
              item[1][6] !== null
                ? Number.isInteger(item[1][6])
                  ? item[1][6]
                  : item[1][6].toFixed(3)
                : "-",
            bytePrecision:
              item[1][7] !== null
                ? Number.isInteger(item[1][7])
                  ? item[1][7]
                  : item[1][7].toFixed(3)
                : "-",
            recall:
              item[1][8] !== null
                ? Number.isInteger(item[1][8])
                  ? item[1][8]
                  : item[1][8].toFixed(3)
                : "-",
            byteRecall:
              item[1][9] !== null
                ? Number.isInteger(item[1][9])
                  ? item[1][9]
                  : item[1][9].toFixed(3)
                : "-",
          };
        }
      })
      .filter((element) => element !== undefined);

    console.log(data);
    console.log(counter);
    return counter === 4 ? [] : data;
  };

  const keys = Object.keys(prefetchMetricsReportContent.rows).filter((item) =>
    item.includes(" ")
  );

  return (
    <div>
      {verticalBarLabels.map((item) => {
        return (
          <div key={item.label} className="mb-20">
            <Panel
              header={item.label}
              style={{
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              <AdmissionPrefetchMetricsReportLayer
                barLabelsIndexes={item}
                reportContent={prefetchMetricsReportContent}
                options={options}
                keys={keys}
              />
            </Panel>
          </div>
        );
      })}

      <div className="flex justify-center mb-10">
        <Divider className="h-[1px] bg-gray-400 w-1/2" />
      </div>
      <div>
        <div className="flex justify-center">
          <h1
            className="text-2xl font-bold text-black mb-3 w-fit p-2"
            style={{
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            Prefetch Metrics
          </h1>
        </div>

        <div className="mb 20 flex justify-center">
          <div style={{ width: "75%" }}>
            {keys.map((item) => {
              const layerName = item.split(" ")[0];
              const layerLabels = Object.keys(
                prefetchMetricsReportContent.rows
              ).filter((item) => item.includes(layerName));

              return (
                <div key={layerName}>
                  <Panel header={layerName + " Layer"} className="mb-20 h-fit">
                    <DataTable
                      value={tableData(layerLabels, layerName)}
                      showGridlines
                      tableStyle={{
                        width: "100%",
                        fontFamily: "Montserrat, sans-serif",
                      }}
                      emptyMessage={`No data to display for ${layerName} Layer`}
                    >
                      <Column
                        header="Layers"
                        field="label"
                        style={{ textAlign: "right" }}
                      />
                      <Column
                        header={prefetchMetricsReportContent.header[7]}
                        field="precision"
                        style={{ textAlign: "right" }}
                      />
                      <Column
                        header={prefetchMetricsReportContent.header[8]}
                        field="bytePrecision"
                        style={{ textAlign: "right" }}
                      />
                      <Column
                        header={prefetchMetricsReportContent.header[9]}
                        field="recall"
                        style={{ textAlign: "right" }}
                      />
                      <Column
                        header={prefetchMetricsReportContent.header[10]}
                        field="byteRecall"
                        style={{ textAlign: "right" }}
                      />
                    </DataTable>
                  </Panel>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrefetchMetricsReport;
