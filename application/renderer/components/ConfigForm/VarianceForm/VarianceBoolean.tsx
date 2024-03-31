import { Dropdown } from "primereact/dropdown";
import { useContext, useEffect, useState } from "react";
import { VarianceFormContext } from "../../../hooks/useContext-hooks/variance-form-hook/variance-form-hook";
import { Tooltip } from "primereact/tooltip";

const VarianceBoolean = ({ selected, editValue, readOnly }) => {
  const [varianceBooleanValue, setVarianceBooleanValue] = useState("");
  const VarFormCtx = useContext(VarianceFormContext);
  const [firstRender, setFirstRender] = useState(true);

  const dropdownOptions = ["true", "false"];

  const handleDropdownChange = (e) => {
    setVarianceBooleanValue(e.target.value);
  };

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false);
    } else {
      const inputObject = {
        value: varianceBooleanValue.toString(),
        header: selected,
      };
      VarFormCtx.handleVarianceObject(inputObject);
    }
  }, [varianceBooleanValue]);

  useEffect(() => {
    if (editValue) {
      editValue = editValue.replace("[", "");
      editValue = editValue.replace("]", "");
      setVarianceBooleanValue(editValue);
    }
  }, []);

  return (
    <div className="flex gap-10">
      <div className="flex flex-col">
        <Tooltip target=".pi-question-circle" />
        <label>
          Domain Type
          <i
            className="pi pi-question-circle ml-1"
            data-pr-tooltip="Specify if parameter should be enabled or not."
            data-pr-position="right"
          />
        </label>
        <Dropdown
          value={varianceBooleanValue}
          options={dropdownOptions}
          placeholder="Select..."
          style={{ width: "160.57px" }}
          onChange={handleDropdownChange}
          disabled={readOnly}
        />
      </div>
    </div>
  );
};

export default VarianceBoolean;
