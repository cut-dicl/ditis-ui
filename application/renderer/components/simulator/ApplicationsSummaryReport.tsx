import { useContext, useRef, useState } from "react";
import { ReportContext } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook";
import { IReportObject } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook-provider";
import { Chart } from "primereact/chart";
import { Panel } from "primereact/panel";
import { useTheme } from "next-themes";

const ApplicationsSummaryReport = (props) => {
  const reportCtx = useContext(ReportContext);
  const theme = useTheme();

  const applicationSummaryContent: IReportObject =
    reportCtx.reportData.Applications[0];

  const stackedBarData = {
    labels: Object.entries(applicationSummaryContent.rows).map((item) => {
      return item[0] + " | Requests - " + item[1][0];
    }),
    datasets: [
      {
        label: "Open Count",
        data: Object.entries(applicationSummaryContent.rows).map((item) => {
          return item[1][1];
        }),
      },
      {
        label: "Close Count",
        data: Object.entries(applicationSummaryContent.rows).map((item) => {
          return item[1][2];
        }),
      },
      {
        label: "Read Count",
        data: Object.entries(applicationSummaryContent.rows).map((item) => {
          return item[1][3];
        }),
      },
      {
        label: "Write Count",
        data: Object.entries(applicationSummaryContent.rows).map((item) => {
          return item[1][6];
        }),
      },
    ],
  };
  //
  const stackedBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio:
      Object.entries(applicationSummaryContent.rows).length > 10 ? 0.2 : 2,
    indexAxis: "y",
    animation: {
      onComplete: function () {
        var chartInstance = this.chart;
        if (chartInstance) {
          var ctx = chartInstance.ctx;
          if (ctx) {
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";

            this.data.datasets.forEach(function (dataset, i) {
              var meta = chartInstance.controller.getDatasetMeta(i);
              meta.data.forEach(function (bar, index) {
                var data = dataset.data[index];
                ctx.fillText(data, bar._model.x, bar._model.y - 5);
              });
            });
          }
        }
      },
    },
    plugins: {
      tooltips: {
        mode: "index",
        intersect: false,
      },
      legend: {
        labels: {
          color: theme.theme === "dark" ? "lightgrey" : "black",
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: theme.theme === "dark" ? "lightgrey" : "black",
        },
      },
      y: {
        stacked: true,
        ticks: {
          color: theme.theme === "dark" ? "lightgrey" : "black",
        },
      },
    },
  };

  const executionTimesContent: IReportObject =
    reportCtx.reportData.Applications[1];

  const executionData = () => {
    let data = Object.entries(executionTimesContent.rows)
      .filter((item) => {
        if (
          item[0] !== "Storage Initializer" &&
          item[0] !== "Trace Parser" &&
          item[0] !== "Workload Replay"
        ) {
          return item;
        }
      })
      .map((item) => {
        return [item[1][0], item[1][1]];
      });

    let firstApp = data[0][0];

    data.forEach((time: any) => {
      if (time[0] < firstApp) {
        firstApp = time[0];
      }
    });

    data.forEach((time: any) => {
      time[0] -= firstApp;
      time[0] /= 1000000;
      time[0] = Math.round(time[0]);
      time[1] = time[1] - firstApp;
      time[1] /= 1000000;
      time[1] = Math.round(time[1]);
    });
    return data;
  };

  // Prepare data for PrimeReact chart
  const countData = {
    labels: Object.keys(executionTimesContent.rows).filter((item) => {
      if (
        item !== "Storage Initializer" &&
        item !== "Trace Parser" &&
        item !== "Workload Replay"
      ) {
        return item;
      }
    }),
    datasets: [
      {
        label: "Execution Time",
        data: executionData(),
        backgroundColor: `rgba(54, 162, 235, 0.2)`,
        borderColor: "rgb(54, 162, 235)",
        borderWidth: 1,
        borderSkipped: false, //Apply setting only to this bar dataset
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    plugins: {
      legend: {
        display: true,
        labels: {
          color: theme.theme === "dark" ? "lightgrey" : "black",
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: "Time(s)",
          color: theme.theme === "dark" ? "lightgrey" : "black",
        },
        ticks: {
          color: theme.theme === "dark" ? "lightgrey" : "black",
        },
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: "Applications",
          color: theme.theme === "dark" ? "lightgrey" : "black",
        },
        ticks: {
          color: theme.theme === "dark" ? "lightgrey" : "black",
        },
      },
    },
  };

  if (!props.printMode)
    return (
      <>
        <Panel
          header={"Application Request Counts"}
          style={{
            fontFamily: "Montserrat, sans-serif",
          }}
          className="mb-20"
        >
          <div>
            <Chart
              type="bar"
              data={stackedBarData}
              options={stackedBarOptions}
              height={`${stackedBarData.labels.length > 1
                  ? stackedBarData.labels.length * 30 + 150
                  : 200
                }px`}
            />
          </div>
        </Panel>

        <Panel
          header={"Application Runtimes"}
          style={{
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          <Chart
            type="bar"
            data={countData}
            options={chartOptions}
            height={`${countData.labels.length > 1
                ? countData.labels.length * 30 + 150
                : 200
              }px`}
          />
        </Panel>
      </>
    );

  return (
    <>
      <div className="flex flex-col avoid-page-break">
      <span
        style={{
          fontFamily: "Montserrat, sans-serif",
        }}
        className="font-bold text-center text-2xl"
      >
        Application Summary
      </span>
      <Chart
        type="bar"
        className="application-summary w-full"
        data={stackedBarData}
        options={{
          ...chartOptions, plugins: {
            title: {
              display: true,
              text: "Application Request Counts",
              font: { size: 20}
            }
          }
        }}
        height={`${stackedBarData.labels.length > 1
            ? stackedBarData.labels.length * 25 + 150
            : 150
          }px`}
        width="100%"
        />
        <Chart
          type="bar"
          className="application-summary w-full"
          data={countData}
            options={{
              ...chartOptions, plugins: {
                title: {
                  display: true,
                  text: "Application Runtimes",
                  font: { size: 20}
                }
              }
            }}
          height={`${countData.labels.length > 1
              ? countData.labels.length * 25 + 150
              : 150
            }px`}
          width="100%"
          />
      </div>
      </>
  );
};

export default ApplicationsSummaryReport;
