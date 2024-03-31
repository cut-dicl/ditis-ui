import React, { useLayoutEffect, useState } from 'react';
import { Chart } from "primereact/chart";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Panel } from 'primereact/panel';
import { useTheme } from 'next-themes';

export default function AppTimeChart({ analyzeResults }) {

  interface appdata {
    appID: string;
    timeFirstRequest: number;
    timeLastRequest: number;
  }

  const [timeData, setTimeData] = useState({
    labels: [],
    datasets: [{ label: "Seconds", data: [] }],
  } as any);

  const theme = useTheme();

  useLayoutEffect(() => {


    setTimeData({
      labels: [],
      datasets: [{ label: "Seconds", data: [] }],
    });

    const apps = { appID: [], time: [] } as any;
    analyzeResults &&
      analyzeResults.files &&
      typeof analyzeResults.files === "object" &&
      Object.values(analyzeResults.apps).map((app: appdata) => {
        apps.appID.push(app.appID);
        apps.time.push([app.timeFirstRequest, app.timeLastRequest]);
      });
    if (apps && typeof apps.time !== "undefined" && apps.time.length > 0) {
      let firstApp = apps.time[0][0];
      apps.time.forEach((time: any) => {
        if (time[0] < firstApp) {
          firstApp = time[0];
        }
      });
      apps.time.forEach((time: any) => {
        time[0] -= firstApp;
        time[0] /= 1000000;
        time[0] = Math.round(time[0]);
        time[1] = time[1] - firstApp;
        time[1] /= 1000000;
        time[1] = Math.round(time[1]);
      });

      setTimeData(() => ({
        labels: apps.appID,
        datasets: [
          {
            label: "Seconds",
            data: apps.time,
          },
        ],
      }));

    }
  }, [analyzeResults]);

  return (
    <Panel header="Application run time" className='my-4'>
      <div className={"w-full overflow-auto"}>
        <Chart
          type="bar"
          data={timeData}
          options={{
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                beginAtZero: true,
                ticks: {
                  color: theme.theme === "dark" ? "lightgrey" : "black"
                }  
              },
              y: {
                ticks: {
                  autoSkip: false,
                  color: theme.theme === "dark" ? "lightgrey" : "black"
                }
              },
            },
            plugins: {
              legend: {
                display: false,
                color: theme.theme === "dark" ? "lightgrey" : "black"
              },
              title: {
                display: true,
                text: "Elapsed time for each application run (in seconds)",
                color: theme.theme === "dark" ? "lightgrey" : "black"
              },
              datalabels: {
                clamp: true,
                anchor: (value) => {
                  return value.dataset.data[value.dataIndex][1] - value.dataset.data[value.dataIndex][0] < 10 ? "end" : "";
                },
                align: (value) => {
                  return value.dataset.data[value.dataIndex][1] - value.dataset.data[value.dataIndex][0] < 10 ? "end" : "";
                },
                formatter: (value: any, context: any) => {
                  if (value[1] - value[0] === 0)
                    return "<1s";
                  return value[1]-value[0] + "s";
                },
                color: theme.theme === "dark" ? "white" : "black",
                font: {
                  weight: 'bold'
              }
              },
            },
            
          }}
          height={`${timeData.labels.length * 30 + 150}px"`}
          plugins={[ChartDataLabels]}
        />
      </div>
    </Panel>
  )
}
