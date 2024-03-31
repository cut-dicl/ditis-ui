import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable'
import { Panel } from 'primereact/panel'
import React from 'react'
import { convertUnderlineToTitleCase } from '../../../utils/convertStringFunctions';

export default function Table({ props }) {
    let header = props.header;
    if(props.columns === undefined)
        return;
    if (header === undefined) 
        return;

    if(header === "Access"){
        header = "Access Cache";
    }

    let data = [];

    Object.keys(props.data).forEach((key) => {
        data.push({ variables: key, ...props.data[key] });
    });

    const template = (rowData, column) => {
        return (Number(rowData[column.field]).toFixed(2));
    }

    const varTemplate = (rowData, column) => {
        let cell = rowData[column.field].split(', ');
        cell = cell.map((val) => {
            if (val.includes('.')) {
                // Split the string by dots and get the last element
                return val.split('.').pop();
            } else {
                // If there are no dots, return the original string
                return val;
            }
        });
        return cell.join(', ');
    }

    return (
      <Panel header={header} className="p-4">
          <DataTable value={data} stripedRows size='small' className='border-2 drop-shadow-md dark:border-slate-600'>
              <Column field="variables" header="Variables" frozen sortable className="bg-zinc-200 dark:bg-slate-800" body={varTemplate} />
              {props.columns.map((column) => {
                return <Column field={column.field} header={column.header} body={template} sortable/>;
                })
            }  
            </DataTable>
        </Panel>
  )
}
