import { useContext } from "react";
import { ReportContext } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook";
import { IReportObject } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook-provider";
import { Chart } from "primereact/chart";
import BorderHeader from "../../UI/BorderHeader";
import ReportItemCard from "../../UI/ReportItemCard";
import ReportCard from "../../UI/ReportCard";
import { Panel } from "primereact/panel";
import colorPalette from "../generic/colorPallete";
import { convertUnderlineToTitleCase } from "../../utils/convertStringFunctions";
import { useTheme } from "next-themes";

const LayersStatisticsTotalReport = (props) => {
  const reportCtx = useContext(ReportContext);
  const theme = useTheme();

  const layersTotalTableContent: IReportObject =
    reportCtx.reportData["Layer Statistics"];

  const titles = [
    {
      label: "Data Statistics",
      data: Object.entries(layersTotalTableContent.rows).filter((item) =>
        item[0].toLocaleLowerCase().startsWith("data")
      ),
    },
    {
      label: "Cache Statistics",
      data: Object.entries(layersTotalTableContent.rows).filter((item) =>
        item[0].toLocaleLowerCase().startsWith("cache")
      ),
    },
    {
      label: "Block Statistics",
      data: Object.entries(layersTotalTableContent.rows).filter((item) =>
        item[0].toLocaleLowerCase().startsWith("block")
      ),
    },
  ];

  const otherData = {
    label: "Other Statistics",
    data: Object.entries(layersTotalTableContent.rows).filter(
      (item) =>
        !item[0].toLocaleLowerCase().startsWith("block") &&
        !item[0].toLocaleLowerCase().startsWith("cache") &&
        !item[0].toLocaleLowerCase().startsWith("data")
    ),
    filteredLabels: Object.entries(layersTotalTableContent.rows)
      .filter(
        (item) =>
          !item[0].toLocaleLowerCase().startsWith("block") &&
          !item[0].toLocaleLowerCase().startsWith("cache") &&
          !item[0].toLocaleLowerCase().startsWith("data")
      )
      .map((item) => item[0]),
  };

  const colorPaletteArray = colorPalette();
  const verticalBarsDataHandler = (filteredLabels: string[], data) => {
    //console.log(filteredLabels);
    return {
      labels: filteredLabels.map((item) => convertUnderlineToTitleCase(item)),
      datasets: [
        {
          label: layersTotalTableContent.header[1],
          data: data.map((item) => {
            return item[1][0];
          }),
          backgroundColor: colorPaletteArray[0],
          borderColor: colorPaletteArray[0],
        },
        {
          label: layersTotalTableContent.header[2],
          data: data.map((item) => {
            return item[1][1];
          }),
          backgroundColor: colorPaletteArray[1],
          borderColor: colorPaletteArray[1],
        },
        {
          label: layersTotalTableContent.header[3],
          data: data.map((item) => {
            return item[1][2];
          }),
          backgroundColor: colorPaletteArray[2],
          borderColor: colorPaletteArray[2],
        },
        {
          label: layersTotalTableContent.header[4],
          data: data.map((item) => {
            return item[1][3];
          }),
          backgroundColor: colorPaletteArray[3],
          borderColor: colorPaletteArray[3],
        },
      ],
    };
  };

  const chartOptions = {
    aspectRatio: 1,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltips: {
        mode: "index",
      },
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
        type: "logarithmic",
        ticks: {
          color: theme.theme === "dark" ? "lightgrey" : "black",
        },
      },
    },
  };

  return (
    <>
      <div className="avoid-page-break">
        {props.printMode && (
          <div className="flex justify-center mb-5">
            <span
              style={{
                fontFamily: "Montserrat, sans-serif",
              }}
              className="font-bold text-center text-2xl"
            >
              Layer Statistics
            </span>
          </div>
        )}
        {titles.map((item) => {
          const operationsLabels = item.data
            .filter((item) => {
              if (item[0].toLocaleLowerCase().endsWith("operations")) {
                return item[0];
              }
            })
            .map((item) => {
              return item[0].replace(/^[^_]*_|_[^_]*$/g, "");
            });

          const bytesLabels = item.data
            .filter((item) => {
              if (item[0].toLocaleLowerCase().endsWith("bytes")) {
                return item[0];
              }
            })
            .map((item) => {
              return item[0].replace(/^[^_]*_|_[^_]*$/g, "");
            });
          const timeLabels = item.data
            .filter((item) => {
              if (item[0].toLocaleLowerCase().endsWith("time")) {
                return item[0].replace(/^[^_]*_|_[^_]*$/g, "");
              }
            })
            .map((item) => {
              return item[0];
            });

          const operations = item.data.filter((val) =>
            val[0].toLocaleLowerCase().endsWith("operations")
          );
          const bytes = item.data.filter((val) =>
            val[0].toLocaleLowerCase().endsWith("bytes")
          );
          const time = item.data.filter((val) =>
            val[0].toLocaleLowerCase().endsWith("time")
          );

          return (
            <div key={item.label} className="mb-20 avoid-page-break">
              {!props.printMode && (
                <Panel
                  header={`${item.label}`}
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                  }}
                >
                  <ReportCard>
                    <ReportItemCard key={"Operations"} style={{ width: "30%" }}>
                      <h1
                        className="text-l font-bold"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        Operations
                      </h1>

                      <Chart
                        type="bar"
                        data={verticalBarsDataHandler(
                          operationsLabels,
                          operations
                        )}
                        options={chartOptions}
                        style={{ minHeight: "350px" }}
                      />
                    </ReportItemCard>
                    <ReportItemCard key={"Bytes"} style={{ width: "30%" }}>
                      <h1
                        className="text-l font-bold "
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        Bytes
                      </h1>

                      <Chart
                        type="bar"
                        data={verticalBarsDataHandler(bytesLabels, bytes)}
                        options={chartOptions}
                        style={{ minHeight: "350px" }}
                      />
                    </ReportItemCard>
                    <ReportItemCard key={"Time"} style={{ width: "30%" }}>
                      <h1
                        className="text-l font-bold "
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        Time
                      </h1>

                      <Chart
                        type="bar"
                        data={verticalBarsDataHandler(timeLabels, time)}
                        options={chartOptions}
                        style={{ minHeight: "350px" }}
                      />
                    </ReportItemCard>
                  </ReportCard>
                </Panel>
              )}
              {props.printMode && (
                <>
                  <ReportCard>
                    <div className="w-full mb-4 flex justify-center">
                      <span className="text-center font-bold text-xl border-y-2 border-slate-300 py-1 px-4">
                        {item.label}
                      </span>
                    </div>
                    <ReportItemCard key={"Operations"} style={{ width: "48%" }}>
                      <h1
                        className="text-l font-bold"
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        Operations
                      </h1>

                      <Chart
                        type="bar"
                        className="layer-vertical-bar-chart"
                        data={verticalBarsDataHandler(
                          operationsLabels,
                          operations
                        )}
                        options={chartOptions}
                        style={{ minHeight: "300px" }}
                      />
                    </ReportItemCard>
                    <ReportItemCard key={"Bytes"} style={{ width: "48%" }}>
                      <h1
                        className="text-l font-bold "
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        Bytes
                      </h1>

                      <Chart
                        type="bar"
                        className="layer-vertical-bar-chart"
                        data={verticalBarsDataHandler(bytesLabels, bytes)}
                        options={chartOptions}
                        style={{ minHeight: "300px" }}
                      />
                    </ReportItemCard>
                    <ReportItemCard key={"Time"} style={{ width: "48%" }}>
                      <h1
                        className="text-l font-bold "
                        style={{ fontFamily: "Montserrat, sans-serif" }}
                      >
                        Time
                      </h1>

                      <Chart
                        type="bar"
                        className="layer-vertical-bar-chart"
                        data={verticalBarsDataHandler(timeLabels, time)}
                        options={chartOptions}
                        style={{ minHeight: "300px" }}
                      />
                    </ReportItemCard>
                  </ReportCard>
                  <div className="force-break"></div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div>
        {!props.printMode && (
          <Panel
            header={otherData.label}
            style={{
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            <div
              key={otherData.label}
              style={{
                borderRadius: "8px",
                padding: "10px",
                borderColor: "rgba(0, 0, 0, 0.1)",
                borderWidth: "2px",
              }}
            >
              <h1
                className="text-l font-bold"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Other Data
              </h1>

              <Chart
                type="bar"
                data={verticalBarsDataHandler(
                  otherData.filteredLabels,
                  otherData.data
                )}
                options={{ ...chartOptions, aspectRatio: 0.5 }}
                style={{ minHeight: "600px" }}
              />
            </div>
          </Panel>
        )}
        {props.printMode && (
          <>
            <div
              key={otherData.label}
              style={{
                borderRadius: "8px",
                padding: "10px",
                borderColor: "rgba(0, 0, 0, 0.1)",
                borderWidth: "2px",
              }}
              className="dark:text-white avoid-page-break"
            >
              <h1
                className="text-l font-bold"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Other Data
              </h1>

              <Chart
                type="bar"
                className="big-vertical-bar-chart"
                data={verticalBarsDataHandler(
                  otherData.filteredLabels,
                  otherData.data
                )}
                options={chartOptions}
                style={{ minHeight: "600px" }}
              />
            </div>
            <div className="page-break"></div>
          </>
        )}
      </div>
    </>
  );
};

export default LayersStatisticsTotalReport;
