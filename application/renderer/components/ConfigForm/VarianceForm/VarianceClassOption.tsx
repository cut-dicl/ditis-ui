import { MultiSelect } from "primereact/multiselect";
import { useContext, useEffect, useState } from "react";
import { VarianceFormContext } from "../../../hooks/useContext-hooks/variance-form-hook/variance-form-hook";
import { Tooltip } from "primereact/tooltip";

interface IVarianceClassOption {
  selected: any;
  foundOption: string[];
  isClass: boolean;
  editValue: string;
  readOnly: boolean;
}

export const VarianceClassOption = ({
  selected,
  foundOption,
  editValue,
  isClass,
  readOnly,
}: IVarianceClassOption) => {
  const [varianceClassOptions, setVarianceClassOptions] = useState([]);
  const VarFormCtx = useContext(VarianceFormContext);

  const handleClasses = (e): void => {
    setVarianceClassOptions(e.target.value);
  };

  useEffect(() => {
    const inputObject = {
      value: varianceClassOptions.toString(),
      header: selected,
    };
    VarFormCtx.handleVarianceObject(inputObject);
  }, [varianceClassOptions]);

  useEffect(() => {
    if (editValue) {
      editValue = editValue.replace("[", "");
      editValue = editValue.replace("]", "");
      const arr = editValue.split(",");
      setVarianceClassOptions(arr);
    }
  }, []);

  return (
    <>
      <div className="flex flex-col">
        <Tooltip target=".pi-question-circle" />
        <label>
          {isClass ? "Classes" : "Domain Options"}
          <i
            className="pi pi-question-circle ml-1"
            data-pr-tooltip={
              isClass
                ? "Specify the list of classes to use"
                : "Specify the list of options to use"
            }
            data-pr-position="right"
          />
        </label>
        <MultiSelect
          maxSelectedLabels={2}
          style={{ width: "500px" }}
          placeholder={`Select ${isClass ? "Classes" : "Options"}`}
          name={selected}
          key={selected}
          options={foundOption}
          value={varianceClassOptions}
          onChange={handleClasses}
          disabled={readOnly}
        />
      </div>
    </>
  );
};
