import { Dropdown } from "primereact/dropdown";
import React, { useEffect } from "react";
import {
  convertDotToTitleCase,
  convertUnderlineToTitleCase,
} from "../../utils/convertStringFunctions";
import { MultiSelect } from "primereact/multiselect";
import TableView from "./charts/TableView";
import { ChartView } from "./charts/ChartView";
import { BoxplotView } from "./charts/BoxplotView";
import { Button } from "primereact/button";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

export default function ResultsDetailed({
  data,
  columns,
  selectedColumn,
  setSelectedColumn,
  chartMode,
  setChartMode,
  selectedMetrics,
  setSelectedMetrics,
  chartSize,
  setChartSize,
}) {

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });



  const groupBy = (keys) => {
    return data.reduce((result, obj) => {
      // Get the values of the keys
      let groupingKeys = keys.map(key => obj[key]);
      // Create a unique key for the combination of values
      let combinedKey = groupingKeys.join(', ');      
      // If the key is not present in the result, add it with an empty array
      result[combinedKey] = result[combinedKey] || [];      
      // Push the object to the array
      result[combinedKey].push(obj);      
      return result;
    }, {});
  };

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

  const generateResults = () => {
    const metrics = columns.filter((col) => col.includes("_"));
    
    const arr = groupBy(selectedColumn);

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

  // Dropdown templates //
  const viewTemplate = (option) => {
    if (!option) return;

    let icon = "pi pi-table";
    if (option.value === "chart") icon = "pi pi-chart-bar";
    else if (option.value === "boxplot") icon = "pi pi-box";

    return (
      <div className="flex flex-row">
        <i className={icon + " mr-2"}></i>
        <span className="text-sm font-bold">{option.label}</span>
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row">
          <span className="p-float-label mt-5">
            <MultiSelect
              className={"w-[300px] "+(selectedColumn.length>0?"":"p-invalid")}
              options={getConfigs()}
              onChange={(e) => setSelectedColumn(e.value)}
              value={selectedColumn}
              showSelectAll={false}
            />
            <label htmlFor="ms-properties">Select parameters</label>
          </span>
          <span className="p-float-label mt-5 ml-10 ">
            <MultiSelect
              className={"w-[300px] "+(selectedMetrics.length>0?"":"p-invalid")}
              options={getMetrics()}
              onChange={(e) => {
                setSelectedMetrics((prev) => {
                  return columns.filter((metric) => e.value.includes(metric));
                });
              }}
              value={selectedMetrics}
              selectAllLabel="Select all metrics"
            />
            <label htmlFor="ms-metrics">Select metrics</label>
          </span>
        </div>
        <div className="flex flex-row">
        <span className="p-float-label mt-5">
          <Dropdown
            options={[
              { label: "Small", value: "20%" },
              { label: "Medium", value: "30%" },
              { label: "Large", value: "45%" },
              { label: "Extra Large", value: "95%" },
            ]}
            optionLabel="label"
            placeholder="Select size"
            onChange={(e) => setChartSize(e.value)}
            value={chartSize}
          />
          <label htmlFor="ms-view">Select chart size</label>
        </span>
        {/* <Button label="Print" icon="pi pi-print" className="p-button-rounded p-button-success p-mr-2" onClick={handlePrint} /> */}
        <span className="p-float-label mt-5 ml-5">
          <Dropdown
            options={[
              { label: "Table", value: "table" },
              { label: "Chart", value: "chart" },
              { label: "Boxplot", value: "boxplot" },
            ]}
            optionLabel="label"
            placeholder="Select view"
            onChange={(e) => setChartMode(e.value)}
            value={chartMode}
            valueTemplate={viewTemplate}
            itemTemplate={viewTemplate}
          />
          <label htmlFor="ms-view">Select view</label>
        </span>
        </div>
        
      </div>
      <div className="flex flex-col" ref={componentRef}>
        {chartMode === "table" && selectedColumn.length>0 && <TableView selectedMetrics={selectedMetrics} results={generateResults()}/>}
        {chartMode === "chart" && selectedColumn.length > 0 && <ChartView selectedMetrics={selectedMetrics} results={generateResults()} chartSize={chartSize}/>}
        {chartMode === "boxplot" && selectedColumn.length>0 && <BoxplotView selectedMetrics={selectedMetrics} selectedColumn={selectedColumn} groupBy={groupBy} chartSize={chartSize}/>}
      </div>
    </div>
  );
}
