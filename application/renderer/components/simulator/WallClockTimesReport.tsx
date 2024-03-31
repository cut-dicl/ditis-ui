import { useContext } from "react";
import { ReportContext } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook";
import { IReportObject } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook-provider";
import { Chart } from "primereact/chart";
import BorderHeader from "../../UI/BorderHeader";
import { Panel } from "primereact/panel";

const WallClockTimesReport = () => {
  const reportCtx = useContext(ReportContext);

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
        },
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: "Components",
        },
      },
    },
  };

  return (
    <>
      <Panel header={"Execution Times"}>
        <Chart type="bar" data={countData} options={chartOptions} />
      </Panel>
    </>
  );
};

export default WallClockTimesReport;
