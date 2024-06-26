import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
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

export const GroupingOptions = ({ id, remove, varianceSettings }) => {
  const [selectedGroupingOptions, setSelectedGroupingOptions] = useState([]);
  const VarFormCtx = useContext(ConfFormContext);

  const handleGrouping = (e: MultiSelectChangeEvent) => {
    VarFormCtx.handleGroupingOptionsChange(
      e.target.value,
      selectedGroupingOptions
    );
    setSelectedGroupingOptions(e.target.value);
    const inputObject = {
      header: "grouping",
      value: e.target.value.toString(),
    };

    VarFormCtx.handleGroupingAdd(inputObject);
  };

  useEffect(() => {
    let updatedOptions = [];

    selectedGroupingOptions.map((item) => {
      VarFormCtx.varianceGroupings.forEach((elem) => {
        if (item === elem.label) {
          updatedOptions.push(item);
        }
      });
    });

    setSelectedGroupingOptions(updatedOptions);
  }, [VarFormCtx.varianceGroupings]);

  useEffect(() => {
    if (
      varianceSettings &&
      VarFormCtx.varianceObject.variance.length > 0 &&
      Object.keys(varianceSettings).length > 0
    ) {
      const optionItem = VarFormCtx.varianceObject.variance[id - 1];
      if (optionItem) {
        const values = optionItem.value.replace(/[\[\]]/g, "").split(",");
        setSelectedGroupingOptions(values);
      }
    }
  }, []);

  const options = () => {
    const myOptions = JSON.parse(JSON.stringify(VarFormCtx.varianceGroupings));

    myOptions.forEach((item) => {
      selectedGroupingOptions.forEach((val) => {
        if (val === item.label) {
          item.disabled = false;
        }
      });
    });

    return myOptions;
  };

  const handleGroupingRemoval = () => {
    remove(id);
    VarFormCtx.handleGroupingRemoval(selectedGroupingOptions);
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
          value={selectedGroupingOptions}
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
