import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Chart } from "primereact/chart";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Dropdown } from "primereact/dropdown";
import { Panel } from 'primereact/panel';
import { useTheme } from 'next-themes';

export default function FileSizeChart({analyzeResults}) {

  interface appdata {
    count: number;
    value: number;
  }

  const [fileData, setFileData] = useState({
    labels: [],
    datasets: [{ label: "Files", data: [] }],
  } as object);

  const [unitPrecision, setUnitPrecision] = useState(2);
  const units = [{ name: "Bytes", value: 0 }, { name: "Kbytes", value: 1 }, { name: "Mbytes", value: 2 }, { name: "Gbytes", value: 3 }] as object[];

  const theme = useTheme();

  const convertSize = (value: any) => {
    const units = ["B", "KB", "MB", "GB", "TB"];
    value = parseFloat((value / Math.pow(10, (unitPrecision * 3))).toFixed(1));
    return `${value}${units[unitPrecision]}`;
  }
  
  function selectUnit(value) {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let unitIndex = 0;
    // Iterate through the units array until the value is smaller than 1024
    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex++;
    }

    return unitIndex > 0 ? unitIndex : 0;
  }
  
  const getFiles = () => {

    setFileData({
      labels: [],
      datasets: [{ label: "Files", data: [] }],
    });

    const files = { labels: [], data: [] } as any;
    let max = 0;
    analyzeResults &&
      analyzeResults.files &&
      typeof analyzeResults.files === "object" &&
      Object.values(analyzeResults.files).map((app:appdata) => {  
        max = Math.max(max, app.value);
        if (app.count == 0) return; //Dont show empty labels
        if (files.labels.includes(convertSize(app.value))) {
          files.data[files.labels.indexOf(convertSize(app.value))] += app.count;
        } else {
          files.labels.push(convertSize(app.value));
          files.data.push(app.count);
        }
      });

    for (let i = files.labels.length-1; i >= 0; i--) {
      if (i == 0)
        files.labels[i] = `0-${files.labels[i]}`;
      else
        files.labels[i] = `${files.labels[i-1]}-${files.labels[i]}`;
      }

    setFileData({
      labels: files.labels.reverse(),
      datasets: [
        {
          label: "Files",
          data: files.data.reverse(),
        },
      ],
    });
    
    return max;
  }

  useLayoutEffect(() => {
    let max = getFiles();
    setUnitPrecision(selectUnit(max));
  },[]);

  useEffect(() => {
    getFiles();
  },[unitPrecision,analyzeResults]);

  return (
    <Panel header="File Sizes" className="flex flex-col my-4">
      <div  >
        <span>Select unit precision: </span>
        {/* @ts-ignore*/}
        <Dropdown value={unitPrecision} onChange={(e) => setUnitPrecision(e.value)} options={units} optionLabel="name"
          placeholder="Select a Unit" className="w-[200px] mt-2" />
      </div>


      <Chart
        type="bar"
        data={fileData}
        options={{
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          aspectRatio: 1,
          scales: {
            x: {
              ticks: {
                autoSkip: false,
                color: theme.theme === "dark" ? "lightgrey" : "black"
              }
            },
            y: {
              beginAtZero: true,
              ticks: {
                color: theme.theme === "dark" ? "lightgrey" : "black"
              }
            },
          },
          plugins: {
            datalabels: {
              color: theme.theme === "dark" ? "lightgrey" : "black",
              font: {
                weight: 'bold'
              }
            },
            legend: {
              display: false
            },
            title: {
              display: true,
              text: "File sizes",
              color: theme.theme === "dark" ? "lightgrey" : "black"
            }
          }
        }}
        plugins={[ChartDataLabels]}
      />
    </Panel>
  )
}
