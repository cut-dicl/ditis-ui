import { MultiSelect } from "primereact/multiselect";
import { useContext, useEffect, useState } from "react";
import { Tooltip } from "primereact/tooltip";
import { ConfFormContext } from "../../../hooks/useContext-hooks/conf-form-hook/conf-form-hook";

interface IVarianceClassOption {
  selected: any;
  foundOption: string[];
  isClass: boolean;
  readOnly: boolean;
  editVarianceParameter: any;
  id: number;
  varianceObject: any;
  parameter: string;
}

export const VarianceClassOption = ({
  selected,
  foundOption,
  isClass,
  readOnly,
  editVarianceParameter,
  id,
  parameter,
  varianceObject
}: IVarianceClassOption) => {

  const handleClasses = (e): void => {
    editVarianceParameter({ id, param: parameter, value: e.target.value, type: "class" });
  };


  const getValue = (value) => {
    let arr = [];
    if (value && typeof value === "string") {
      value = value.replace("[", "").replace("]", "");
      arr = value.split(",");
    } else if (value && Array.isArray(value)){
      arr = value;
    }
    return arr;
  }


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
          value={getValue(varianceObject.value)}
          onChange={handleClasses}
          disabled={readOnly}
        />
      </div>
    </>
  );
};
