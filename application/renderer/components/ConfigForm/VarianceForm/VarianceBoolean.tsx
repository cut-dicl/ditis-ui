import { Dropdown } from "primereact/dropdown";
import { useContext, useEffect, useState } from "react";
import { Tooltip } from "primereact/tooltip";
import { ConfFormContext } from "../../../hooks/useContext-hooks/conf-form-hook/conf-form-hook";

const VarianceBoolean = ({ selected, editValue, readOnly, editVarianceParameter, parameter, id, varianceObject }) => {
  const [varianceBooleanValue, setVarianceBooleanValue] = useState(varianceObject.value);
  const VarFormCtx = useContext(ConfFormContext);
  const [firstRender, setFirstRender] = useState(true);

  const dropdownOptions = ["true", "false"];


  useEffect(() => {
    if (firstRender) {
      setFirstRender(false);
    } else {
      // const inputObject = {
      //   value: varianceBooleanValue.toString(),
      //   header: selected,
      // };
      // VarFormCtx.handleVarianceObject(inputObject);

      editVarianceParameter({ id, param:parameter, value:varianceBooleanValue, type:"boolean"});
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
          onSelect={(e) => setVarianceBooleanValue(e.target.value)}
          disabled={readOnly}
        />
      </div>
    </div>
  );
};

export default VarianceBoolean;
