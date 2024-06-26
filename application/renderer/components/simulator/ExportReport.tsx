import React, { useEffect, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "primereact/button";
import { Panel } from "primereact/panel";
import { Divider } from "primereact/divider";
import { MultiSelect } from "primereact/multiselect";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Checkbox } from "primereact/checkbox";
import { ipcRenderer } from "electron";

interface IExportReport {
  options: any;
  simInfo: any;
}

const ExportReport = ({ options, simInfo }: IExportReport) => {
  const reportOptions = Object.keys(options);
  const printRef = React.useRef();
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const toast = React.useRef(null);
  const [additionalInfo, setAdditionalInfo] = useState(simInfo);

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
        page-break-after: always;
      }
      
      .avoid-page-break {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .vertical-bar-chart canvas {
        max-width: 100% !important;
        max-height: 310px !important;
      }

      .layer-vertical-bar-chart canvas {
        width: 100% !important;
        max-height: 380px !important;
      }

      .big-vertical-bar-chart canvas {
        max-width: 100% !important;
      }

      .application-summary canvas {
        max-width: 100% !important;
        max-height:90% !important;
      }
    }
    
    @page {
      size: auto;
      margin: 20mm;
    }
  `,
    content: () => printRef.current,
    onAfterPrint: () =>
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Report printed successfully",
        life: 3000,
      }),
    onPrintError: () =>
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Something went wrong, report could not be created",
        life: 3000,
      }),
  });

  const convertDate = (row: any) => {
    if (row.date === "Loading...") return row.date;
    const d = new Date(row.date);
    return `${d.toLocaleDateString("en-UK")} ${d.getHours()}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  };

  const handleReportOptions = (e) => {
    let _options = [...selectedOptions];

    if (e.checked) _options.push(e.value);
    else _options.splice(_options.indexOf(e.value), 1);
    setSelectedOptions(_options);
  };

  useEffect(() => {
    if (typeof simInfo !== "object") {
      ipcRenderer
        .invoke("fetch-sim-metadata", {
          id: simInfo,
        })
        .then((result) => {
          console.log(result);
          setAdditionalInfo({
            name: result.data.name,
            traceName: result.data.trace,
            configName: result.data.configuration,
            date: result.data.date,
          });
        });
    }
  }, []);

  const handleAllSelection = () => {
    setSelectAll((prev) => {
      if (prev) {
        setSelectedOptions([]);
      } else {
        setSelectedOptions(reportOptions);
      }
      return !prev;
    });
  };

  return (
    <div className="flex flex-row">
      <Toast ref={toast} />
      <Panel header="Preview" className="w-2/3 h-full">
        <div ref={printRef}>
          <p className="font-bold text-2xl text-center">
            {additionalInfo.name + " Report"}
          </p>

          <div className="mb-5 mt-5">
            <DataTable
              value={[additionalInfo]}
              className="p-datatable-sm w-full"
              showGridlines
            >
              <Column field="traceName" header="Trace" />
              <Column field="configName" header="Storage Configuration" />
              <Column field="date" header="Date" body={convertDate} />
            </DataTable>
          </div>
          {selectedOptions.map((item) => {
            return (
              <>
                {React.createElement(options[item], {
                  printMode: true,
                  moduleLayer: item,
                })}
              </>
            );
          })}
        </div>
      </Panel>
      <Divider layout="vertical" />
      <div className="flex flex-grow flex-col space-y-1">
        <div>Select reports to print</div>
        <div className="flex align-items-center">
          <Checkbox
            inputId="selectAll"
            checked={selectAll}
            onChange={handleAllSelection}
          />
          <label htmlFor={"selectAll"} className="ml-2">
            Select all
          </label>
        </div>
        <Divider />
        {reportOptions.map((item, index) => {
          return (
            <div className="flex align-items-center">
              <Checkbox
                key={index}
                inputId={item + index}
                value={item}
                onChange={handleReportOptions}
                checked={selectedOptions.includes(item)}
              />
              <label htmlFor={item + index} className="ml-2">
                {item}
              </label>
            </div>
          );
        })}
        <Button
          label="Print"
          onClick={handlePrint}
          disabled={selectedOptions.length === 0}
        />
      </div>
    </div>
  );
};

export default ExportReport;
