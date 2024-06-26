import { RadioButton } from "primereact/radiobutton";
import { useContext, useEffect, useState } from "react";
import { Content } from "../FormInput";
import { InputText } from "primereact/inputtext";
import { Tooltip } from "primereact/tooltip";
import { convertToLabel } from "../../../utils/convertStringFunctions";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { ConfFormContext } from "../../../hooks/useContext-hooks/conf-form-hook/conf-form-hook";

interface IVarianceNumberOption {
  varianceOption: string;
  editValue: string;
  readOnly: boolean;
  setButtonDisabled: any;
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
  setButtonDisabled,
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
  const [error, setError] = useState({ status: false, message: "" });

  const typeOptions: NumberOptions[] = Object.values(NumberOptions);
  const VarFormCtx = useContext(ConfFormContext);

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
    console.log(editValue);
    if (editValue && editValue.includes(":*")) {
      const numbers = editValue.match(/\d+[kmgtpeKMGTPE]?/g);
      setSelectedSetting(NumberOptions.Multiplication);
      setValuesWithJumps({
        start: numbers[0],
        jump: numbers[1],
        end: numbers[2],
      });
    } else if (editValue && editValue.includes(":+")) {
      const numbers = editValue.match(/\d+[kmgtpeKMGTPE]?/g);
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

    const input: string = event.target.value;

    if (input.startsWith(",")) {
      setError({
        status: true,
        message: "Invalid input. List cannot start with a comma",
      });
      setButtonDisabled(true);
    } else if (input.includes(",,")) {
      setError({
        status: true,
        message:
          "Invalid input. Please remove or put a number between the consecutive commas",
      });
      setButtonDisabled(true);
    } else if (input.endsWith(",")) {
      setError({
        status: true,
        message:
          "Invalid input. Please remove the comma at the end of the input",
      });
      setButtonDisabled(true);
    } else {
      setError({
        status: false,
        message: "",
      });
      setButtonDisabled(false);
    }
  };

  const extractNumberFromString = (str) => {
    const match = str.match(/^-?\d+/);
    if (match) {
      return parseInt(match[0]);
    }
  };

  const handleInputWithJump = (event) => {
    const name = event.target.name;

    if (extractNumberFromString(event.target.value) < 0) {
      setError({
        status: true,
        message: `Invalid input. ${
          name.charAt(0).toUpperCase() + name.slice(1)
        } must be a positive number`,
      });
      setButtonDisabled(true);
    } else if (
      name.includes("start") &&
      valuesWithJumps.end.length > 0 &&
      extractNumberFromString(event.target.value) >
        extractNumberFromString(valuesWithJumps.end)
    ) {
      setError({
        status: true,
        message: "Invalid input. Start must be smaller than end",
      });
      setButtonDisabled(true);
    } else if (
      name.includes("end") &&
      valuesWithJumps.start.length > 0 &&
      extractNumberFromString(event.target.value) <
        extractNumberFromString(valuesWithJumps.start)
    ) {
      setError({
        status: true,
        message: "Invalid input. End must be bigger than start",
      });
      setButtonDisabled(true);
    } else if (
      name.includes("jump") &&
      valuesWithJumps.start.length > 0 &&
      valuesWithJumps.end.length > 0 &&
      extractNumberFromString(valuesWithJumps.start) +
        extractNumberFromString(event.target.value) >
        extractNumberFromString(valuesWithJumps.end)
    ) {
      setError({
        status: true,
        message:
          "Invalid input. Jump addition with start must not exceed the end",
      });
      setButtonDisabled(true);
    } else if (
      name.includes("end") &&
      valuesWithJumps.start.length > 0 &&
      valuesWithJumps.jump.length > 0 &&
      extractNumberFromString(event.target.value) <
        extractNumberFromString(valuesWithJumps.start) +
          extractNumberFromString(valuesWithJumps.jump)
    ) {
      setError({
        status: true,
        message:
          "Invalid input. Jump addition with start must not exceed the end",
      });
      setButtonDisabled(true);
    } else {
      setError({
        status: false,
        message: "",
      });
      setButtonDisabled(false);
    }

    if (name.includes("start")) {
      setValuesWithJumps((prev) => {
        return { ...prev, start: event.target.value };
      });
    }
    if (name.includes("end")) {
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
    <div>
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
            placeholder="Ex. 1g"
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
            placeholder="Ex. 2g"
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
            placeholder="Ex. 3g"
            onChange={handleInputWithJump}
            value={valuesWithJumps.end}
            disabled={readOnly}
          />
        </div>
      </div>
      {error.status && (
        <p style={{ color: "red" }}>
          <i>{error.message}</i>
        </p>
      )}
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
                data-pr-tooltip="Valid values are 1,2,3 or 1x,2x,3x, where x is the prefix (k,m,g,t,p,e)."
                data-pr-position="right"
              />
            </label>
            <InputText
              style={{ width: "300px" }}
              onChange={handleInput}
              value={values}
              placeholder="Ex. 1,2,3 or 1g,2g,3g"
              disabled={readOnly}
            />
            {error.status && (
              <p style={{ color: "red" }}>
                <i>{error.message}</i>
              </p>
            )}
          </div>
        )}

        {(setting === NumberOptions.Addition ||
          setting === NumberOptions.Multiplication) &&
          JumpJSX}
      </div>
    </div>
  );
};
