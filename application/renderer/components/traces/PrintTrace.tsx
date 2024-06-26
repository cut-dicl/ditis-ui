import { Panel } from 'primereact/panel'
import React from 'react'
import FileStatistics from './charts/FileStatistics'
import AppTimeChart from './charts/AppTimeChart'
import FileSizeChart from './charts/FileSizeChart'
import { Divider } from 'primereact/divider'
import { Checkbox } from 'primereact/checkbox'
import { Button } from 'primereact/button'
import { useReactToPrint } from 'react-to-print'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'

interface PrintTraceProps {
    trace: any;
    analyzeResults: any;
    type?: string;
    lines?: number;
}

export default function PrintTrace({ trace, analyzeResults, type, lines }: PrintTraceProps) {
    const [checked, setChecked] = React.useState({
        workload_statistics: true,
        app_time_chart: true,
        file_size_chart: true
    })
    const printRef = React.useRef();

    if (type === "simulator") {
        trace = {
            name: trace.name,
            lines: lines,
            date: trace.date
        }
    }

    const handlePrint = useReactToPrint({
        pageStyle: `
        @media print {
            html, body {
              height: 100vh; /* Use 100% here to support printing more than a single page*/
              margin: 0 !important;
              padding: 0 !important;
              divider: {break-after:always;}
            },
            div {
                break-after: always;
            }
          } 
        `,
        content: () => printRef.current
    });

    const convertDate = (row: any) => {
        const d = new Date(row.date* 1000);
        return `${d.toLocaleDateString("en-UK")} ${d.getHours()}:${String(
          d.getMinutes()
        ).padStart(2, "0")}`;
    };
    

    return (
        <div className="flex flex-row">
            <Panel header="Preview" className="w-2/3 h-full">
                <div ref={printRef} className='space-y-10'>
                    <div className="flex flex-col w-full items-center space-y-10">
                        <p className="font-bold text-2xl text-center">{
                            type === "simulator" ? "Output Trace Analysis":
                            "Trace Analysis"
                        }</p>
                        {type !== "simulator" && 
                            
                            <DataTable value={[trace]} className="p-datatable-sm w-1/2" showGridlines>
                                <Column field="name" header="Name" />
                                <Column field="type" header="Type" />
                                <Column field="lines" header="Lines" />
                                <Column field="date" header="Date" body={convertDate} />
                            </DataTable>
                            }
                        {type === "simulator" &&                             
                            <DataTable value={[trace]} className="p-datatable-sm w-1/2" showGridlines>
                                <Column field="name" header="Simulation" />
                                <Column field="lines" header="Lines" />
                                <Column field="date" header="Date" body={convertDate} />
                            </DataTable>
                            }
                    </div>

                    

                    {checked.workload_statistics && <div>
                        <Divider />
                        <FileStatistics data={analyzeResults} />
                    </div>}
                    {checked.app_time_chart && <div><Divider/><AppTimeChart analyzeResults={analyzeResults} print /></div>}
                    {checked.file_size_chart && <div><Divider/><FileSizeChart analyzeResults={analyzeResults} print/></div>}
                    {
                        !checked.workload_statistics && !checked.app_time_chart && !checked.file_size_chart &&
                        <div className="flex flex-col items-center justify-center">
                            <h1 className="text-2xl">No data to display</h1>
                            <p className="text-sm">Please select at least one module to display</p>
                        </div>
                    }
                </div>
            </Panel>
            <Divider layout="vertical" />
            <div className="flex flex-grow flex-col">
                Select modules to print:
                <div>
                    <Checkbox value="workload_statistics" inputId="cb1" checked={checked.workload_statistics} className="ml-2"
                        onChange={(e) => {
                            setChecked({
                                ...checked,
                                workload_statistics: e.checked
                            })
                        }}
                    />
                    <label htmlFor="cb1" className="ml-2">Workload Statistics</label>
                </div>
                <div>
                    <Checkbox value="app_time_chart" inputId="cb2" checked={checked.app_time_chart} className="ml-2"
                        onChange={(e) => {
                            setChecked({
                                ...checked,
                                app_time_chart: e.checked
                            })
                        }}
                    />
                    <label htmlFor="cb2" className="ml-2">App Time Chart</label>
                </div>
                <div>
                    <Checkbox value="file_size_chart" inputId="cb3" checked={checked.file_size_chart} className="ml-2"
                        onChange={(e) => {
                            setChecked({
                                ...checked,
                                file_size_chart: e.checked
                            })
                        }}
                    />
                    <label htmlFor="cb3" className="ml-2">File Size Chart</label>
                </div>

                <Button label="Print" className="mt-10 w-1/4" onClick={handlePrint}/>
            </div>

        </div>
    )
}
