import { InputText } from "primereact/inputtext";
import { Tooltip } from "primereact/tooltip";
import { useContext } from "react";
import { Dropdown } from "primereact/dropdown";
import { Content } from "next/dist/compiled/@next/font/dist/google";

import { ConfFormContext } from "../../hooks/useContext-hooks/conf-form-hook/conf-form-hook";
import { NextPreviousButtonContext } from "../../hooks/useContext-hooks/next-previous-buttons-hook/next-previous-buttons-hook";
import { convertToLabel } from "../../utils/convertStringFunctions";

export interface Content {
  key: string;
  description: string;
  defaultValue: string;
  alternatives?: string[];
}

type stepDataType = [string, Array<Content>];

const booleanValues: string[] = ["true", "false"];

interface IFormInput {
  readOnly?: boolean;
}

export const FormInput = ({ readOnly }: IFormInput) => {
  const confFormCtx = useContext(ConfFormContext);
  const nextPrevBtnCtx = useContext(NextPreviousButtonContext);
  const stepData: stepDataType = Object.entries(
    confFormCtx.configurationObject
  )[nextPrevBtnCtx.activeIndex];

  console.log(stepData);

  const handleInput = (event) => {
    const inputObject = {
      name: event.target.name,
      value: event.target.value,
      header: stepData[0],
    };
    confFormCtx.handleConfigurationObject(inputObject);
  };

  console.log(readOnly);

  return (
    <>
      <h1 className="text-2xl mt-5">{stepData[0]}</h1>
      <div className="grid gap-4 grid-cols-2">
        {stepData[1].map((item) => {
          return (
            <div className="flex flex-col mt-5 space-y-2" key={item.key}>
              <Tooltip target=".pi-question-circle" />
              <label htmlFor={item.key}>
                {convertToLabel(item.key, stepData[0])}
                <i
                  className="pi pi-question-circle ml-1"
                  data-pr-tooltip={item.description}
                  data-pr-position="right"
                />
              </label>
              {"alternatives" in item ? (
                <Dropdown
                  name={item.key}
                  value={item.defaultValue}
                  onChange={handleInput}
                  options={item.alternatives}
                  disabled={readOnly}
                />
              ) : item.defaultValue === "false" ||
                item.defaultValue === "true" ? (
                <Dropdown
                  name={item.key}
                  value={item.defaultValue}
                  onChange={handleInput}
                  options={booleanValues}
                  disabled={readOnly}
                />
              ) : (
                <InputText
                  id={item.key}
                  value={item.defaultValue}
                  name={item.key}
                  onChange={handleInput}
                  disabled={readOnly}
                />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};
