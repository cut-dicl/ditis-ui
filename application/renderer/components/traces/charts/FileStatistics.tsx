import React from 'react'
import PieWithTableReport from '../../simulator/PieWithTableReport';

export default function FileStatistics(props) {
  let data = props.data.statistics;
  if (!data || !data.rows) return <></>;

    const workloadReplayTableData = Object.entries(
        data.rows
      ).map((item) => {
        return {
          label: item[0],
          counts:
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
    
    return (<>
        <PieWithTableReport
            content={data}
            tableData={workloadReplayTableData}
            pieTitle='Workload Statistics'
        tableTitle='Workload Metrics'
        printMode={false}
        />
    
    </>)
}
