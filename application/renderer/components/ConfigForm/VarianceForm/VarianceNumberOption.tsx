import { RadioButton } from "primereact/radiobutton";
import { useContext, useEffect, useState } from "react";
import { Content } from "../FormInput";
import { InputText } from "primereact/inputtext";
import { Tooltip } from "primereact/tooltip";
import { convertToLabel } from "../../../utils/convertStringFunctions";
import { VarianceFormContext } from "../../../hooks/useContext-hooks/variance-form-hook/variance-form-hook";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";

interface IVarianceNumberOption {
  varianceOption: string;
  editValue: string;
  readOnly: boolean;
}

enum NumberOptions {
  List = "List",
  Addition = "Addition",
  Multiplication = "Multiplication",
}

export const VarianceNumberOption = ({
  varianceOption,
  editValue,
  readOnly,
}: IVarianceNumberOption) => {
  //Variables
  const defaultValuesWithJumps = { start: "", jump: "", end: "" };
  const [setting, setSelectedSetting] = useState<NumberOptions>(
    NumberOptions.List
  );
  const [values, setValues] = useState("");
  const [valuesWithJumps, setValuesWithJumps] = useState(
    defaultValuesWithJumps
  );
  const [firstRender, setFirstRender] = useState(true);

  const typeOptions: NumberOptions[] = Object.values(NumberOptions);
  const VarFormCtx = useContext(VarianceFormContext);

  //Hook
  useEffect(() => {
    if (firstRender) {
      setFirstRender(false);
    } else {
      const inputObject = {
        start: valuesWithJumps.start,
        jump: valuesWithJumps.jump,
        end: valuesWithJumps.end,
        header: varianceOption,
        mode: setting,
        value: "",
      };
      VarFormCtx.handleVarianceObject(inputObject);
    }
  }, [valuesWithJumps]);

  useEffect(() => {
    setValues("");
    setValuesWithJumps(defaultValuesWithJumps);
  }, [varianceOption]);

  useEffect(() => {
    if (editValue && editValue.includes(":*")) {
      const numbers = editValue.match(/\d+/g);
      setSelectedSetting(NumberOptions.Multiplication);
      setValuesWithJumps({
        start: numbers[0],
        jump: numbers[1],
        end: numbers[2],
      });
    } else if (editValue && editValue.includes(":+")) {
      const numbers = editValue.match(/\d+/g);
      setSelectedSetting(NumberOptions.Addition);
      setValuesWithJumps({
        start: numbers[0],
        jump: numbers[1],
        end: numbers[2],
      });
    } else if (editValue) {
      editValue = editValue.replace("[", "");
      editValue = editValue.replace("]", "");
      setValues(editValue);
    }
  }, []);

  //Functions
  const handleInput = (event) => {
    setValues(event.target.value);
    const inputObject = {
      value: event.target.value,
      header: varianceOption,
    };
    VarFormCtx.handleVarianceObject(inputObject);
  };

  const handleInputWithJump = (event) => {
    const name = event.target.name;
    if (name.includes("start")) {
      setValuesWithJumps((prev) => {
        return { ...prev, start: event.target.value };
      });
    } else if (name.includes("end")) {
      setValuesWithJumps((prev) => {
        return { ...prev, end: event.target.value };
      });
    } else if (name.includes("jump")) {
      setValuesWithJumps((prev) => {
        return { ...prev, jump: event.target.value };
      });
    }
  };

  const handleTypeChange = (e: DropdownChangeEvent) => {
    setValuesWithJumps(defaultValuesWithJumps);
    setValues("");
    setSelectedSetting(e.value);
  };

  const JumpJSX = (
    <div className="flex gap-10">
      <div className="flex flex-col">
        <Tooltip target=".pi-question-circle" />
        <label>
          Start
          <i
            className="pi pi-question-circle ml-1"
            data-pr-tooltip="Example 1 or 1g"
            data-pr-position="right"
          />
        </label>
        <InputText
          style={{ width: "80px" }}
          name="start"
          onChange={handleInputWithJump}
          value={valuesWithJumps.start}
          disabled={readOnly}
        />
      </div>
      <div className="flex flex-col">
        <Tooltip target=".pi-question-circle" />
        <label>
          Jump
          <i
            className="pi pi-question-circle ml-1"
            data-pr-tooltip="Example 1 or 1g"
            data-pr-position="right"
          />
        </label>
        <InputText
          style={{ width: "80px" }}
          name="jump"
          onChange={handleInputWithJump}
          value={valuesWithJumps.jump}
          disabled={readOnly}
        />
      </div>
      <div className="flex flex-col">
        <Tooltip target=".pi-question-circle" />
        <label>
          End
          <i
            className="pi pi-question-circle ml-1"
            data-pr-tooltip="Example 1 or 1g"
            data-pr-position="right"
          />
        </label>
        <InputText
          style={{ width: "80px" }}
          name="end"
          onChange={handleInputWithJump}
          value={valuesWithJumps.end}
          disabled={readOnly}
        />
      </div>
    </div>
  );

  return (
    <div className="flex gap-10">
      <div className="flex flex-col">
        <Tooltip target=".pi-question-circle" />
        <label>
          Domain Type
          <i
            className="pi pi-question-circle ml-1"
            data-pr-tooltip="Specify the domain type: List for list of values, Addition for an arithmetic sequence, or Multiplication for a geometric sequence"
            data-pr-position="right"
          />
        </label>
        <Dropdown
          value={setting}
          style={{ width: "160.57px" }}
          options={typeOptions}
          placeholder="Type"
          onChange={handleTypeChange}
          disabled={readOnly}
        />
      </div>
      <div>
        {setting === NumberOptions.List && (
          <div className="flex flex-col">
            <Tooltip target=".pi-question-circle" />
            <label>
              Enter options separated by comma
              <i
                className="pi pi-question-circle ml-1"
                data-pr-tooltip="Example 1,2,3 or 1g,2g,3g"
                data-pr-position="right"
              />
            </label>
            <InputText
              style={{ width: "300px" }}
              onChange={handleInput}
              value={values}
              disabled={readOnly}
            />
          </div>
        )}

        {(setting === NumberOptions.Addition ||
          setting === NumberOptions.Multiplication) &&
          JumpJSX}
      </div>
    </div>
  );
};
