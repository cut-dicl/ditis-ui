import { useContext } from "react";
import { ReportContext } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook";
import { IReportObject } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook-provider";
import { Chart } from "primereact/chart";
import BorderHeader from "../../UI/BorderHeader";
import { Panel } from "primereact/panel";
import { useTheme } from "next-themes";

const WallClockTimesReport = (props) => {
  const reportCtx = useContext(ReportContext);
  const theme = useTheme();

  const wallClockTimesReportContent: IReportObject =
    reportCtx.reportData["Wall Clock Runtimes"];

  const calculateRuntimes = () => {
    let data = Object.entries(wallClockTimesReportContent.rows).map((item) =>
      parseInt(item[1])
    );

    let currentTime = 0;
    let schedule = [];

    for (const runtime of data) {
      const startTime = currentTime;
      const endTime = currentTime + runtime;
      schedule.push([startTime, endTime]);
      currentTime = endTime;
    }

    return schedule;
  };

  // rows is an array of objects
  const countData = {
    labels: Object.keys(wallClockTimesReportContent.rows),
    datasets: [
      {
        label: "Execution Time",
        data: calculateRuntimes(),
        backgroundColor: `rgba(54, 162, 235, 0.2)`,
        borderColor: "rgb(54, 162, 235)",
        borderWidth: 1,
        borderSkipped: false, //Apply setting only to this bar dataset
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1,
    indexAxis: "y",
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: "Time (ms)",
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
          text: "Components",
          color: theme.theme === "dark" ? "lightgrey" : "black",
        },
        ticks: {
          color: theme.theme === "dark" ? "lightgrey" : "black",
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: theme.theme === "dark" ? "lightgrey" : "black",
        },
      },
    },
  };

  return (
    <>
      {!props.printMode && (
        <Panel header={"Execution Times"}>
          <Chart type="bar" data={countData} options={chartOptions} />
        </Panel>
      )}
      {props.printMode && (
        <div className="w-full">
          <div className="avoid-page-break w-full">
            <div className="flex justify-center mb-5">
              <span
                style={{
                  fontFamily: "Montserrat, sans-serif",
                }}
                className="font-bold text-center text-2xl"
              >
                Wall Clock Runtimes
              </span>
            </div>
            <Chart
              type="bar"
              data={countData}
              options={chartOptions}
              className="big-vertical-bar-chart"
            />
          </div>
          <div className="page-break"></div>
        </div>
      )}
    </>
  );
};

export default WallClockTimesReport;
