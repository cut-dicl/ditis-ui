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

const LayersStatisticsTotalReport = () => {
  const reportCtx = useContext(ReportContext);

  const layersTotalTableContent: IReportObject =
    reportCtx.reportData["Layer Statistics"];

  console.log(layersTotalTableContent);

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
    },
    scales: {
      y: {
        type: "logarithmic",
      },
    },
  };

  return (
    <>
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
          <div key={item.label} className="mb-20">
            <Panel
              header={`${item.label}`}
              style={{
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              <ReportCard>
                <ReportItemCard key={"Operations"} width={"30%"}>
                  <h1
                    className="text-l font-bold text-black"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    Operations
                  </h1>

                  <Chart
                    type="bar"
                    data={verticalBarsDataHandler(operationsLabels, operations)}
                    options={chartOptions}
                    style={{minHeight: "350px"}}
                  />
                </ReportItemCard>
                <ReportItemCard key={"Bytes"} width={"30%"}>
                  <h1
                    className="text-l font-bold text-black"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    Bytes
                  </h1>

                  <Chart
                    type="bar"
                    data={verticalBarsDataHandler(bytesLabels, bytes)}
                    options={chartOptions}
                    style={{minHeight: "350px"}}
                    />
                </ReportItemCard>
                <ReportItemCard key={"Time"} width={"30%"}>
                  <h1
                    className="text-l font-bold text-black"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    Time
                  </h1>

                  <Chart
                    type="bar"
                    data={verticalBarsDataHandler(timeLabels, time)}
                    options={chartOptions}
                    style={{minHeight: "350px"}}
                  />
                </ReportItemCard>
              </ReportCard>
            </Panel>
          </div>
        );
      })}
      <div>
        <Panel
          header={otherData.label}
          style={{
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          <div
            key={otherData.label}
            style={{
              background: "#f0f0f0",
              borderRadius: "8px",
              padding: "16px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
            }}
          >
            <h1
              className="text-l font-bold text-black"
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
      </div>
    </>
  );
};

export default LayersStatisticsTotalReport;
