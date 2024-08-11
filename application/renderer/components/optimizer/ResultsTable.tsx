import { DataTable } from 'primereact/datatable'
import React from 'react'
import { convertDotToTitleCase, convertUnderlineToTitleCase } from '../../utils/convertStringFunctions'
import { Column } from 'primereact/column'
import { InputSwitch } from 'primereact/inputswitch'
import { MultiSelect } from 'primereact/multiselect'
import { useTheme } from 'next-themes'
import { Button } from 'primereact/button'
import { AppController } from '../../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook'

export default function ResultsTable({ data, columns, optID, showToast }) {
  const [selectedColumns, setSelectedColumns] = React.useState(columns);
  const [frozenColumns, setFrozenColumns] = React.useState(["SimulationID"]);
  const [extendedTable, setExtendedTable] = React.useState(true);
  const { theme } = useTheme();
  const controller = React.useContext(AppController);


  const downloadCSV = () => {
    window.ipc.invoke('download-optimizer-csv', {
      optID
    }).then((res) => {
      console.log(res);
      if (!res || res.code === 500)
        showToast('error', 'Error', res.error);
      else if (res.code === 200)
        showToast('success', 'Success', 'File downloaded');
    });
  }

    
    const tableHeader = () => {
        return (
          <div className="flex flex-row justify-between items-center">
            <div className='flex items-center'>
              Final Results
              <Button icon="pi pi-download" tooltip='Download as CSV' text onClick={() => downloadCSV()}/>
              </div>
            <div className='flex flex-row'>
              <div>Columns to Display:
                <MultiSelect className={"w-[300px] ml-2 " + (selectedColumns.length === 0 ? "p-invalid" : "")}
                  options={columns.map(col => {
                    return { label: col === "SimulationID" ? "SimulationID" : col.includes(".") ? convertDotToTitleCase(col) : convertUnderlineToTitleCase(col), value: col }
                  })}
                  value={selectedColumns}
                  onChange={(e) => {
                    setSelectedColumns((prev) => { return columns.filter(col => e.value.includes(col)) })
                    setFrozenColumns(["SimulationID"]);
                  }}
                  placeholder="Select columns"
                />
              </div>
              <div className='ml-10'>Columns to Freeze:
                <MultiSelect className="w-[300px] ml-2"
                  options={selectedColumns.map(col => {
                    return { label: col === "SimulationID"?"SimulationID":col.includes(".") ? convertDotToTitleCase(col) : convertUnderlineToTitleCase(col), value: col }
                  })}
                  value={frozenColumns}
                  onChange={(e) => {
                    setFrozenColumns((prev) => { return selectedColumns.filter(col => e.value.includes(col)) })
                    //Reorder the frozen columns to be the first ones
                    setSelectedColumns((prev) => { return selectedColumns.filter(col => e.value.includes(col)).concat(columns.filter(col => !e.value.includes(col))) })
                  }}
                  placeholder="Select columns" />
              </div>
            </div>
            <div className="flex justify-center">
              <label htmlFor="switch1" className="mr-2">Extended table</label>
              <InputSwitch id="switch1" onChange={(e) => {
                if (e.value === false) {
                  setSelectedColumns((prev) => { return columns.filter(col => !col.includes(".")) })
                  setExtendedTable(false);
                } else {
                  setSelectedColumns((prev) => { return columns })
                  setFrozenColumns(["SimulationID"]);
                  setExtendedTable(true);
                }
              }} checked={extendedTable} />
            </div>
            
          </div>
        )
  }
  
  const template = (rowData, column) => {
    //console.log(rowData, column);
    if (Number.isNaN(Number(rowData[column.field]))) 
      if (rowData[column.field].includes('.')) 
        // Split the string by dots and get the last element
        return rowData[column.field].split('.').pop();
      
    // If there are no dots, return the original string
    return rowData[column.field];
  };
    
  return (
    <DataTable
          scrollable
          showGridlines
          stripedRows
          scrollHeight="flex"
          virtualScrollerOptions={{ itemSize: 50 }}
          reorderableColumns
          value={data}
          size="small"
          header={tableHeader}
          resizableColumns
        >
          {selectedColumns.map((col) =>
            <Column
              key={col}
              field={col}
              header={col === "SimulationID"?"SimulationID":col.includes(".")?convertDotToTitleCase(col):convertUnderlineToTitleCase(col)}
              frozen={frozenColumns.includes(col)}
              alignFrozen='left'
              headerStyle={{
                backgroundColor: col === "SimulationID" ? (theme === "dark" ? "#1f2937" : "#f4f5f7"):
                  col.includes(".") ? (theme === "dark" ? "#262b38" : "#ebeffc") : (theme === "dark" ? "#263833" : "#ebfcf6"),
              }}
              body={template}
              sortable
            />
          )}
        </DataTable>
  )
}
