import { ReportContext } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook";
import { IReportObject } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook-provider";
import { useContext } from "react";
import { Chart } from "primereact/chart";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const DataProfilerEvaluationMetrics = () => {
  const reportCtx = useContext(ReportContext);

  const dataProfilerEvaluationMetricsContent: IReportObject =
    reportCtx.reportData["Data Profiler"][1];
  const dataProfilerOverheadsContent: IReportObject =
    reportCtx.reportData["Data Profiler"][0];

  const dataProfilerEvaluationMetricsData = Object.entries(
    dataProfilerEvaluationMetricsContent.rows
  ).map((item) => {
    return { label: item[0], value: item[1] };
  });

  const dataProfilerOverheadsData = Object.entries(
    dataProfilerOverheadsContent.rows
  ).map((item) => {
    return {
      label: item[0],
      count: item[1][0] ? item[1][0] : 0,
      time: item[1][1] ? item[1][1] : 0,
      memory: item[1][2] ? item[1][2] : 0,
    };
  });

  const showTables = Object.entries(dataProfilerOverheadsContent.rows)
    .map((item) => {
      return {
        label: item[0],
        count: item[1][0] ? item[1][0] : 0,
        time: item[1][1] ? item[1][1] : 0,
        memory: item[1][2] ? item[1][2] : 0,
      };
    })
    .filter((item) => item.count !== 0 && item.time !== 0 && item.memory !== 0);

  console.log(showTables);

  return (
    <div>
      <div className="mb-10">
        <h1
          className="text-l font-bold text-black mb-5"
          style={{
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          Data Profiler Overheads
        </h1>
        {showTables.length === 0 ? (
          <h1
            className="text-l text-black mb-5"
            style={{
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            The data profiler was not enabled in the configuration file
          </h1>
        ) : (
          <DataTable
            value={dataProfilerOverheadsData}
            showGridlines
            tableStyle={{
              width: "75%",
              marginBottom: "100px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
              fontFamily: "Montserrat, sans-serif",
            }}
            emptyMessage="No data"
          >
            <Column
              field="label"
              header={dataProfilerOverheadsContent.header[0]}
              style={{ textAlign: "right" }}
            />
            <Column
              field="count"
              header={dataProfilerOverheadsContent.header[1]}
              style={{ textAlign: "right" }}
            />
            <Column
              field="time"
              header={dataProfilerOverheadsContent.header[2]}
              style={{ textAlign: "right" }}
            />
            <Column
              field="memory"
              header={dataProfilerOverheadsContent.header[3]}
              style={{ textAlign: "right" }}
            />
          </DataTable>
        )}
      </div>
      <div className="mb-10">
        <h1
          className="text-l font-bold text-black mb-5"
          style={{
            fontFamily: "Montserrat, sans-serif",
          }}
        >
          Data Profiler Evaluation Metrics
        </h1>
        {showTables.length === 0 ? (
          <h1
            className="text-l text-black mb-5"
            style={{
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            The data profiler was not enabled in the configuration file
          </h1>
        ) : (
          <DataTable
            value={dataProfilerEvaluationMetricsData}
            showGridlines
            tableStyle={{ width: "20%" }}
          >
            <Column
              field="label"
              header={dataProfilerEvaluationMetricsContent.header[0]}
              style={{ textAlign: "right" }}
            />
            <Column
              field="value"
              header={dataProfilerEvaluationMetricsContent.header[1]}
              style={{ textAlign: "right" }}
            />
          </DataTable>
        )}
      </div>
    </div>
  );
};

export default DataProfilerEvaluationMetrics;
