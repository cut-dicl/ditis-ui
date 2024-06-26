import AdmissionPrefetchMetricsReportLayer from "./AdmissionMetricsReportLayer";
import { ReportContext } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook";
import { IReportObject } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook-provider";
import { useContext } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Divider } from "primereact/divider";
import { Panel } from "primereact/panel";
import { useTheme } from "next-themes";

const AdmissionMetricsReport = (props) => {
  const reportCtx = useContext(ReportContext);
  const theme = useTheme();
  const verticalBarLabels = [
    {
      label: "Admission Hits to Total Admissions",
      first: 0,
      second: 2,
    },
    {
      label: "Admission Byte Hits to Byte Admissions",
      first: 1,
      second: 3,
    },
    {
      label: "Admission Hits To Reads",
      first: 0,
      second: 4,
    },
    {
      label: "Admission Byte Hits to Byte Reads",
      first: 1,
      second: 5,
    },
  ];

  const admissionMetricsReportContent: IReportObject =
    reportCtx.reportData["Cache Admissions"];

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1.1,
    plugins: {
      legend: {
        labels: {
          color: theme.theme === "dark" ? "lightgrey" : "black",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: theme.theme === "dark" ? "lightgrey" : "black",
        },
      },
      y: {
        ticks: {
          color: theme.theme === "dark" ? "lightgrey" : "black",
        },
      },
    },
  };

  const tableData = (filteredLabels: string[], layerName: string) => {
    let counter = 0;

    const data = Object.entries(admissionMetricsReportContent.rows)
      .map((item) => {
        const found = filteredLabels.indexOf(item[0]) !== -1;
        if (found) {
          if (!item[1][6] && !item[1][7] && !item[1][8] && !item[1][9]) {
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

    return counter === 4 ? [] : data;
  };

  const keys = Object.keys(admissionMetricsReportContent.rows).filter((item) =>
    item.includes(" ")
  );

  return (
    <div>
      <div>
        {verticalBarLabels.map((item) => {
          return (
            <div key={item.label} className="mb-5 avoid-page-break">
              {!props.printMode && (
                <Panel
                  header={item.label}
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  <AdmissionPrefetchMetricsReportLayer
                    barLabelsIndexes={item}
                    reportContent={admissionMetricsReportContent}
                    options={options}
                    keys={keys}
                    printMode={props.printMode}
                  />
                </Panel>
              )}
              {props.printMode && (
                <div key={item.label} className="force-break w-full">
                  <div className="flex justify-center mb-5">
                    <span
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                      }}
                      className="font-bold text-center text-2xl"
                    >
                      Cache Admissions
                    </span>
                  </div>
                  <div className="w-full mb-4 flex justify-center">
                    <span className="text-center font-bold text-xl border-y-2 border-slate-300 py-1 px-4">
                      {item.label}
                    </span>
                  </div>
                  <AdmissionPrefetchMetricsReportLayer
                    barLabelsIndexes={item}
                    reportContent={admissionMetricsReportContent}
                    options={options}
                    keys={keys}
                    printMode={props.printMode}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!props.printMode && (
        <div className="flex justify-center mb-10">
          <Divider className="h-[1px] bg-gray-400 w-2/4" />
        </div>
      )}

      <div>
        <div className="flex justify-center">
          <h1
            className="text-2xl font-bold text-black mb-3 w-fit p-2"
            style={{
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            Admission Metrics
          </h1>
        </div>
        <div className="mb 20 flex justify-center">
          <div style={{ width: "75%" }}>
            {keys.map((item) => {
              const layerName = item.split(" ")[0];
              const layerLabels = Object.keys(
                admissionMetricsReportContent.rows
              ).filter((item) => item.includes(layerName));

              return (
                <>
                  {!props.printMode && (
                    <>
                      <Panel
                        header={layerName + " Layer"}
                        className="mb-20 h-fit"
                        key={layerName}
                      >
                        <DataTable
                          value={tableData(layerLabels, layerName)}
                          showGridlines
                          tableStyle={{
                            width: "100%",
                            marginBottom: "100px",
                            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
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
                            header={admissionMetricsReportContent.header[7]}
                            field="precision"
                            style={{ textAlign: "right" }}
                          />
                          <Column
                            header={admissionMetricsReportContent.header[8]}
                            field="bytePrecision"
                            style={{ textAlign: "right" }}
                          />
                          <Column
                            header={admissionMetricsReportContent.header[9]}
                            field="recall"
                            style={{ textAlign: "right" }}
                          />
                          <Column
                            header={admissionMetricsReportContent.header[10]}
                            field="byteRecall"
                            style={{ textAlign: "right" }}
                          />
                        </DataTable>
                      </Panel>
                    </>
                  )}
                  {props.printMode && (
                    <>
                      <div className="avoid-page-break">
                        <DataTable
                          value={tableData(layerLabels, layerName)}
                          showGridlines
                          className="text-xs"
                          size={"small"}
                          tableStyle={{
                            width: "100%",
                            marginBottom: "100px",
                            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
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
                            header={admissionMetricsReportContent.header[7]}
                            field="precision"
                            style={{ textAlign: "right" }}
                          />
                          <Column
                            header={admissionMetricsReportContent.header[8]}
                            field="bytePrecision"
                            style={{ textAlign: "right" }}
                          />
                          <Column
                            header={admissionMetricsReportContent.header[9]}
                            field="recall"
                            style={{ textAlign: "right" }}
                          />
                          <Column
                            header={admissionMetricsReportContent.header[10]}
                            field="byteRecall"
                            style={{ textAlign: "right" }}
                          />
                        </DataTable>
                      </div>

                      <div className="page-break"></div>
                    </>
                  )}
                </>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionMetricsReport;
