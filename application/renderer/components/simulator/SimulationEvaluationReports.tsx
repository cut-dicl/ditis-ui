import { useContext } from "react";
import { ReportContext } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook";
import { IReportObject } from "../../hooks/useContext-hooks/simulator-report-hook/simulator-report-hook-provider";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";

const SimulationEvaluationReports = (props) => {
  const reportCtx = useContext(ReportContext);

  const simulationEvaluationContent: IReportObject =
    reportCtx.reportData["Simulation Evaluation"][0];

  const simulationEvaluationRequestContent: [] =
    reportCtx.reportData["Simulation Evaluation"][1];

  const tableData = Object.entries(simulationEvaluationContent.rows).map(
    (item) => {
      let rowData = { label: item[0], value: item[1][0].toFixed(2) };
      simulationEvaluationRequestContent.forEach(
        (simVal: { header: string[]; rows: any }) => {
          rowData[simVal.header[2]] = simVal.rows[item[0]][0].toFixed(2);
        }
      );
      return rowData;
    }
  );

  const headerGroup = (
    <ColumnGroup>
      <Row>
        <Column
          header={
            <div style={{ fontSize: "20px" }}>
              {simulationEvaluationContent.header[0].toLocaleUpperCase()}
            </div>
          }
          rowSpan={2}
        />
        <Column
          header={
            <div style={{ fontSize: "20px" }}>
              {simulationEvaluationContent.header[1].toLocaleUpperCase()}
            </div>
          }
          colSpan={simulationEvaluationRequestContent.length + 1}
        />
      </Row>
      <Row>
        <Column
          header={<div style={{ fontSize: "20px" }}>TOTAL</div>}
          field="value"
        />
        {simulationEvaluationRequestContent.map(
          (item: { header: string[]; rows: any }) => {
            return (
              <Column
                key={item.header[2]}
                header={
                  <div style={{ fontSize: "20px" }}>{item.header[2]}</div>
                }
                field={item.header[2]}
              />
            );
          }
        )}
      </Row>
    </ColumnGroup>
  );

  const formatNumber = (rowData, column) => {
    const number = rowData[column.field];
    // Check if the number is an integer
    if (Number.isInteger(number)) {
      return number.toLocaleString(); // Integer, use regular formatting
    } else {
      const [integerPart, decimalPart] = number.toString().split("."); // Split into integer and decimal parts
      let formattedNumber = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ","); // Format integer part with separators
      if (decimalPart && parseInt(decimalPart) !== 0) {
        formattedNumber += `.${decimalPart}`; // Append decimal part if it's not zero
      }
      return formattedNumber;
    }
  };

  return (
    <div className="avoid-page-break">
      {props.printMode && (
        <div className="flex justify-center mb-5">
          <span
            style={{
              fontFamily: "Montserrat, sans-serif",
            }}
            className="font-bold text-center text-2xl"
          >
            Simulation Evaluation
          </span>
        </div>
      )}
      <DataTable
        value={tableData}
        showGridlines
        headerColumnGroup={headerGroup}
        stripedRows
        tableStyle={{
          marginBottom: "100px",
          fontFamily: "Montserrat, sans-serif",
          borderColor: "black",
        }}
        size="small"
      >
        <Column
          field="label"
          header={simulationEvaluationContent.header[0]}
          className="font-bold"
        />
        <Column
          field="value"
          header={simulationEvaluationContent.header[1]}
          style={{ textAlign: "right" }}
        />
        {simulationEvaluationRequestContent.map(
          (item: { header: string[]; rows: any }) => {
            return (
              <Column
                key={item.header[2]}
                field={item.header[2]}
                style={{ textAlign: "right" }}
                body={formatNumber}
              />
            );
          }
        )}
      </DataTable>
    </div>
  );
};

export default SimulationEvaluationReports;
