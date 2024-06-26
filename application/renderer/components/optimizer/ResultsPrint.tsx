import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Divider } from "primereact/divider";
import { Panel } from "primereact/panel";
import React from "react";
import { useReactToPrint } from "react-to-print";
import TableView from "./charts/TableView";
import { ChartView } from "./charts/ChartView";
import { BoxplotView } from "./charts/BoxplotView";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import {
  convertDotToTitleCase,
  convertUnderlineToTitleCase,
} from "../../utils/convertStringFunctions";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tooltip } from "primereact/tooltip";
import { ipcRenderer } from "electron";

export default function ResultsPrint({
  optimization,
  data,
  columns,
  selectedColumn,
  selectedMetrics,
  name
}) {
  const [checked, setChecked] = React.useState({
    tables: true,
    barchart: true,
    boxplot: true,
    parameters: selectedColumn,
    metrics: selectedMetrics,
    chartSize: "45%",
    slice: 6,
  });

  const [opt, setOpt] = React.useState({
    date: optimization.date || "Loading...",
    trace: optimization.trace || "Loading...",
    configuration: optimization.configuration || {
      storage: "Loading...",
      optimizer: "Loading...",
      variance: "Loading...",
    }
  });
  

  const printRef = React.useRef();

  const handlePrint = useReactToPrint({
    pageStyle: `
    @media all {
      .page-break {
        display: none;
      }
    }
    
    @media print {
      html, body {
        height: initial !important;
        overflow: initial !important;
        -webkit-print-color-adjust: exact;
      }
    }
    
    @media print {
      .page-break {
        margin-top: 1rem;
        display: block;
        page-break-before: auto;
      }
    }

    @media print {
      .force-break {
        break-after: page;
      }
    }
    
    @page {
      size: auto;
      margin: 20mm;
    }
        `,
    content: () => printRef.current,
  });

  const getConfigs = () => {
    return columns
      .filter((col) => col.includes("."))
      .map((col) => {
        return { label: convertDotToTitleCase(col), value: col };
      });
  };

  const getMetrics = () => {
    return columns
      .filter((col) => col.includes("_"))
      .map((col) => {
        return { label: convertUnderlineToTitleCase(col), value: col };
      });
  };

  const groupBy = (keys) => {
    return data.reduce((result, obj) => {
      // Get the values of the keys
      let groupingKeys = keys.map((key) => obj[key]);
      // Create a unique key for the combination of values
      let combinedKey = groupingKeys.join(", ");
      // If the key is not present in the result, add it with an empty array
      result[combinedKey] = result[combinedKey] || [];
      // Push the object to the array
      result[combinedKey].push(obj);
      return result;
    }, {});
  };

  const generateResults = () => {
    const metrics = columns.filter((col) => col.includes("_"));

    const arr = groupBy(checked.parameters);

    const result = {};
    // Iterate over each group
    for (const groupKey in arr) {
      if (arr.hasOwnProperty(groupKey)) {
        const group = arr[groupKey];

        // Initialize accumulators for the group
        const sumAccumulator = {};
        const countAccumulator = {};

        // Iterate over each subobject in the group
        for (const subobject of group) {
          // Iterate over each key to calculate the sum
          for (const key of metrics) {
            sumAccumulator[key] =
              (sumAccumulator[key] || 0) + Number(subobject[key]);
            countAccumulator[key] = (countAccumulator[key] || 0) + 1;
          }
        }

        // Calculate the average for each key in the group
        result[groupKey] = {};
        for (const key of metrics) {
          result[groupKey][key] = sumAccumulator[key] / countAccumulator[key];
        }
      }
    }
    return result;
  };

  const convertDate = (row: any) => {
    if (row.date === "Loading...") return row.date;
    const d = new Date(row.date);
    return `${d.toLocaleDateString("en-UK")} ${d.getHours()}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  };

  const getParameters = () => {
    let obj = [];
    checked.parameters.forEach((param) => {
      let values = [];
      data.some((e) => {
        if(!values.includes(e[param]))
          values.push(e[param]);
        else 
          return false;
      })

      obj.push({
        parameters: convertDotToTitleCase(param),
        value: values.toString(),
      });
    });

    return obj;
  }

  const [parameters, setParameters] = React.useState(getParameters());

  React.useEffect(() => {
    setParameters(getParameters());
  }, [checked.parameters]);

  const bodyTemplate = (rowData, column) => {
    let val = rowData[column.field].split(",");
    if (val.length > 1) {
      return (
        <div className="flex flex-wrap">
          {val.map((v, i) => (
            <span key={i}>{v}{i < val.length-1 && "," }</span>     
          ))}
        </div>
      );
    } else {
      return val;
    }
  }


  React.useEffect(() => {
    if (optimization.id === undefined) return;
    if (!optimization.date || !optimization.trace || !optimization.configuration) {
      ipcRenderer.invoke("get-optimizer-metadata", {
        id: optimization.id
      }).then((result) => {
        if (result.code === 200) {
          setOpt(result.data);
        }
      });
    }
  }, [optimization]);

  return (
    <div className="flex flex-row">
      <Panel header="Preview" className="w-2/3 h-full">
        <div ref={printRef} className="space-y-10">
          <p className="font-bold text-2xl text-center">{name + " Report"}</p>

          <div>
            <DataTable value={[opt]} className="p-datatable-sm w-full" showGridlines>            
              <Column field="trace" header="Trace"/>
              <Column field="configuration.storage" header="Storage Configuration"/>
              <Column field="configuration.optimizer" header="Optimizer Configuration" />
              <Column field="configuration.variance" header="Variance Configuration"/>
              <Column field="date" header="Date" body={convertDate} />
            </DataTable>

            <DataTable value={parameters} className="p-datatable-sm" style={{width:"100%"}} showGridlines>
              <Column field="parameters" header="Parameters" style={{width:"50%"}} />
              <Column field="value" header="Variance Values" body={bodyTemplate} />
            </DataTable>
          </div>


          {checked.tables && (
            <>
              <Divider className="h-[1px] bg-gray-400" />
              <TableView
                results={generateResults()}
                selectedMetrics={checked.metrics}
                print
                slice={checked.slice}
              />
              <div className="force-break"></div>
            </>
            
          )}
          {checked.barchart && (
            <>
              <Divider className="h-[1px] bg-gray-400" />
              <p className="font-bold text-xl">Metric Averages</p>
              <ChartView
                results={generateResults()}
                selectedMetrics={checked.metrics}
                chartSize={checked.chartSize}
                print
              />
              <div className="force-break"></div>
            </>
          )}
          {checked.boxplot && (
            <>              
              <Divider className="h-[1px] bg-gray-400" />
              <p className="font-bold text-xl">Box-plots</p>
              <BoxplotView
                plotdata={groupBy(checked.parameters)}
                selectedMetrics={checked.metrics}
                chartSize={checked.chartSize}
                print
              />
              <div className="force-break"></div>
            </>
          )}
          {((!checked.tables && !checked.barchart && !checked.boxplot) ||
            ((checked.metrics.length === 0 ||
              checked.parameters.length === 0))) && (
              <div className="flex flex-col items-center justify-center">
                <h1 className="text-2xl">No data to display</h1>
                <p className="text-sm">
                  Please select at least one{" "}
                  {checked.metrics.length === 0 ||
                  checked.parameters.length === 0
                    ? "Metric and Parameter"
                    : "Module"}{" "}
                  to display
                </p>
              </div>
            )}
        </div>
      </Panel>
      <Divider layout="vertical" />
      <div className="flex flex-grow flex-col space-y-10">
        <div>
          Select modules to print:
          <div>
            <Checkbox
              value="tables"
              inputId="cb1"
              checked={checked.tables}
              className="ml-2"
              onChange={(e) => {
                setChecked({
                  ...checked,
                  tables: e.checked,
                });
              }}
            />
            <label htmlFor="cb1" className="ml-2">
              Table View
            </label>
          </div>
          <div>
            <Checkbox
              value="barchart"
              inputId="cb2"
              checked={checked.barchart}
              className="ml-2"
              onChange={(e) => {
                setChecked({
                  ...checked,
                  barchart: e.checked,
                });
              }}
            />
            <label htmlFor="cb2" className="ml-2">
              Bar Charts
            </label>
          </div>
          <div>
            <Checkbox
              value="boxplot"
              inputId="cb3"
              checked={checked.boxplot}
              className="ml-2"
              onChange={(e) => {
                setChecked({
                  ...checked,
                  boxplot: e.checked,
                });
              }}
            />
            <label htmlFor="cb3" className="ml-2">
              Boxplots
            </label>
          </div>
              </div>
              <Divider className="h-[1px] bg-gray-400" />
        <div className="space-y-8">
          Select Parameters and Metrics:
          <div>
            <span className="p-float-label mt-5">
              <MultiSelect
                className={
                  "w-[300px] " +
                  (checked.parameters.length > 0 ? "" : "p-invalid")
                }
                options={getConfigs()}
                onChange={(e) => {
                    setChecked({ ...checked, parameters: e.value });
                }}
                value={checked.parameters}
                showSelectAll={false}
                id="ms-parameters"
              />
              <label htmlFor="ms-parameters">Select Parameters</label>
            </span>
          </div>
          <div>
            <span className="p-float-label mt-5">
              <MultiSelect
                className={
                  "w-[300px] " + (checked.metrics.length > 0 ? "" : "p-invalid")
                }
                options={getMetrics()}
                              onChange={(e) => {
                  setChecked({
                    ...checked,
                    metrics: e.value
                  });
                }}
                value={checked.metrics}
                showSelectAll={true}
                selectAllLabel="Select all metrics"
                id="ms-metrics"
              />
              <label htmlFor="ms-metrics">Select Metrics</label>
            </span>
          </div>

          {checked.tables && (
          <div>
          <span className="p-float-label mt-5">
              <Dropdown 
                value={checked.slice}
                options={Array.from({length: checked.metrics.length}, (_, i) => i+1)}
                onChange={(e) => {
                  setChecked({ ...checked, slice: e.value });
                }}
                id="ms-slice"
                className="drop-slice"
              />
              <label htmlFor="ms-slice">Select Table Slice</label>
              <Tooltip target=".drop-slice" position="top" content="Splits a table at this column into two" />
            </span>
          </div>
          )}
          <Button label="Print" className="mt-10 w-1/4" onClick={handlePrint}
            disabled={((!checked.tables && !checked.barchart && !checked.boxplot) ||
              ((checked.metrics.length === 0 ||
                checked.parameters.length === 0)))} />
        </div>
      </div>
    </div>
  );
}
