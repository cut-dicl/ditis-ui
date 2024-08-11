import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import {
  useContext,
} from "react";
import { Tooltip } from "primereact/tooltip";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { ConfFormContext } from "../../../hooks/useContext-hooks/conf-form-hook/conf-form-hook";

interface IGroupingOptions {
  id: number;
  remove: any;
  varianceSettings: any;
}

export const GroupingOptions = ({ id, remove, varianceSettings, varianceObject, editVarianceGrouping }) => {
  const VarFormCtx = useContext(ConfFormContext);

  const handleGrouping = (e: MultiSelectChangeEvent) => {
    editVarianceGrouping(id, e.target.value);
    // VarFormCtx.handleGroupingOptionsChange(
    //   e.target.value,
    //   selectedGroupingOptions
    // );
    // const inputObject = {
    //   header: "grouping",
    //   value: e.target.value.toString(),
    // };

    // VarFormCtx.handleGroupingAdd(inputObject);
  };



  const options = () => {
    // const myOptions = JSON.parse(JSON.stringify(VarFormCtx.varianceGroupings));

    // let availableOptions = [];
    // let takenOptions = [];
    // VarFormCtx.varianceObject.variance.forEach(
    //   (item) => item.key !== "grouping"? availableOptions.push(item.key): takenOptions.push(item.value)
    // );
    
    // takenOptions = takenOptions.map((item) =>
    //   item.replace(/[\[\]]/g, "").split(",")
    // )[0];
    // availableOptions.forEach((item) => {
    //   if (!myOptions.find((elem) => elem.label === item)) {
    //     myOptions.push({
    //       label: item, value: item, disabled: 
    //       takenOptions.includes(item) ? true : false,
    //      });
    //   }
    // });
    // myOptions.forEach((item) => {
    //   selectedGroupingOptions.forEach((val) => {
    //     if (val === item.label) {
    //       item.disabled = false;
    //     }
    //   });
    // });

    // return myOptions;
    let options = [];
    varianceObject.parameters.forEach((item) => {
      if (item.parameter.length == 0) return;
      options.push({
        label: item.parameter, value: item.parameter, disabled: 
        //check if the parameter exists in the groupings index with this id
        varianceObject.groupings[id] && varianceObject.groupings[id].includes(item.parameter) ? false : item.disabled,
         });
    })
    return options;
  };

  const handleGroupingRemoval = () => {
    remove(id);
    VarFormCtx.handleGroupingRemoval(id);
  };

  const groupingOptionsTemplate = (availableOptions) => {
    return (
      <div style={availableOptions.disabled ? { color: "#ccc" } : {}}>
        {availableOptions.label}
      </div>
    );
  };

  return (
    <div className="flex gap-3 mt-5 items-end">
      <div className="flex flex-col grow">
        <Tooltip target=".pi-question-circle" />
        <label>
          Group
          <i
            className="pi pi-question-circle ml-1"
            data-pr-tooltip="Specify parameters to vary together. The parameter domains must have the same dimension."
            data-pr-position="right"
          />
        </label>
        <MultiSelect
          placeholder="Select options to group"
          value={varianceObject.groupings[id]}
          options={options()}
          onChange={handleGrouping}
          itemTemplate={groupingOptionsTemplate}
          disabled={varianceSettings.readOnly}
        />
      </div>
      <Button
        onClick={handleGroupingRemoval}
        severity="secondary"
        icon="pi pi-times"
        className="h-10.5"
        disabled={varianceSettings.readOnly}
      />
    </div>
  );
};
