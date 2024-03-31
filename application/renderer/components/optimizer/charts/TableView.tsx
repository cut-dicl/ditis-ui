import React, { use } from "react";
import { convertUnderlineToTitleCase } from "../../../utils/convertStringFunctions";
import Table from "./Table";
import { ScrollTop } from "primereact/scrolltop";

export default function TableView({ results, selectedMetrics }) {
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
                  }),
            }}
            key={group} />
        );
      })}
    </div>
  );
}
