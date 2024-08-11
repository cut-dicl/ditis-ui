import React from "react";
import { convertUnderlineToTitleCase } from "../../../utils/convertStringFunctions";
import Table from "./Table";

interface TableViewProps {
  results: any;
  selectedMetrics: string[];
  print?: boolean;
  slice?: number;
}

export default function TableView({ results, selectedMetrics, print, slice }: TableViewProps) {
  const [groups, setGroups] = React.useState([]);

  const grouping = () => {
    let groups = [];
    selectedMetrics.forEach((val) => {
      let metric = convertUnderlineToTitleCase(val).split(" ")[0];
      if (!groups.includes(metric)) {
        groups.push(metric);
      }
    });
    return groups;
  };

  React.useEffect(() => {
    setGroups(grouping());
  }, [selectedMetrics]);


  if (print) {
    return (
        groups.map((group) => {
          return (<div key={group}>
            <Table
              props={{
                header: group, data: results, columns:
                  selectedMetrics
                    .filter((val) => convertUnderlineToTitleCase(val).split(" ")[0] === group)
                    .map((val) => {
                      return { field: val, header: convertUnderlineToTitleCase(val).slice(group.length).trim() };
                    }), print, slice
              }}
            />
            <div className="page-break"></div>
            </div>
          );
        })
    );
  }

  return (
    <div>
      {groups.map((group) => {
        return (
          <Table
            props={{
              header: group, data: results, columns:
                selectedMetrics
                  .filter((val) => convertUnderlineToTitleCase(val).split(" ")[0] === group)
                  .map((val) => {
                    return { field: val, header: convertUnderlineToTitleCase(val).slice(group.length).trim() };
                  }), print
            }}
            key={group}
          />
        );
      })}
    </div>
  );
}
