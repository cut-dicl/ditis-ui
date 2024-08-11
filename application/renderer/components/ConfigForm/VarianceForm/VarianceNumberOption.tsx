import { useContext, useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Tooltip } from "primereact/tooltip";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { ConfFormContext } from "../../../hooks/useContext-hooks/conf-form-hook/conf-form-hook";

interface IVarianceNumberOption {
  varianceOption: string;
  readOnly: boolean;
  editVarianceParameter: any;
  id: number;
  varianceObject: any;
  parameter: string;
  saveDisabled?: boolean;
  setSaveDisabled?: any;
}

enum NumberOptions {
  List = "List",
  Addition = "Addition",
  Multiplication = "Multiplication",
}

export const VarianceNumberOption = ({
  varianceOption,
  readOnly,
  editVarianceParameter,
  id,
  varianceObject,
  parameter,
  saveDisabled,
  setSaveDisabled,
}: IVarianceNumberOption) => {
  //Variables
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
        start: varianceObject.value.start || "",
        jump: varianceObject.value.jump || "",
        end: varianceObject.value.end || "",
        header: varianceOption,
        //mode: setting,
        value: "",
      };
      VarFormCtx.handleVarianceObject(inputObject);
    }
  }, [varianceObject.value]);

  //Functions
  const handleInput = (event) => {
    const input: string = event.target.value;
    editVarianceParameter({ id, param: parameter, value: event.target.value });

    const regex = /^[\s]*[0-9]+[.]?[0-9]*[\skmgtpe]*$/i;

    let testArray = input.split(",");
    let error = { status: false, message: "" };
    
    
    testArray.forEach((item,index) => {
    if (testArray.length === 1 && item.length === 0) {
      error = {
        status: false,
        message: "",
      };
      setSaveDisabled(true);
    } else if (index === 0) {
      if (item.length === 0) {
        error = {
          status: true,
          message: "Invalid input. List cannot start with a comma",
        };
        setSaveDisabled(true);
      } else if (!regex.test(item)) {
        error = {
          status: true,
          message: "Invalid input",
        };
        setSaveDisabled(true);
      }
    } else if ((index === testArray.length-1 && index !== 0)) {
      if (item.length === 0) {
        error = {
          status: true,
          message: "Invalid input. List cannot end with a comma",
        };
        setSaveDisabled(true);
      } else if (!regex.test(item)) {
        error = {
          status: true,
          message: "Invalid input",
        };
        setSaveDisabled(true);
      }
    } else {
      if (item.length === 0) {
        error = {
          status: true,
          message: "Invalid input, empty item",
        };
        setSaveDisabled(true);
      } else if (!regex.test(item)) {
        error = {
          status: true,
          message: "Invalid input",
        };
        setSaveDisabled(true);
      } else {
        error = {
          status: false,
          message: "",
        };
        setSaveDisabled(false);
      }
    }
    });

    if (error.status) {
      setSaveDisabled(true);
    } else {
      setSaveDisabled(false);
    }
    setError(error);
  };

  useEffect(() => {
    if (!saveDisabled)
      error.status !== saveDisabled && setSaveDisabled(error.status);
  }, [error.status, saveDisabled]);

  const extractNumberFromString = (str) => {
    const match = str.match(/^-?\d+/);
    if (match) {
      return parseInt(match[0]);
    }
  };

  const handleInputWithJump = (event) => {
    const name = event.target.name;
    let newValue = {
      start: varianceObject.value.start || "",
      jump: varianceObject.value.jump || "",
      end: varianceObject.value.end || "",
    };
    let error = { status: false, message: "" };

    if (extractNumberFromString(event.target.value) < 0) {
      error = {
        status: true,
        message: `Invalid input. ${
          name.charAt(0).toUpperCase() + name.slice(1)
        } must be a positive number`,
      };
      setSaveDisabled(true);
    } else if (
      name.includes("start") &&
      newValue.end.length > 0 &&
      extractNumberFromString(event.target.value) >
        extractNumberFromString(newValue.end)
    ) {
      error = {
        status: true,
        message: "Invalid input. Start must be smaller than end",
      };
      setSaveDisabled(true);
    } else if (
      name.includes("end") &&
      newValue.start.length > 0 &&
      extractNumberFromString(event.target.value) <
        extractNumberFromString(newValue.start)
    ) {
      error = {
        status: true,
        message: "Invalid input. End must be bigger than start",
      };
      setSaveDisabled(true);
    } else if (
      name.includes("jump") &&
      newValue.start.length > 0 &&
      newValue.end.length > 0 &&
      extractNumberFromString(newValue.start) +
        extractNumberFromString(event.target.value) >
        extractNumberFromString(newValue.end)
    ) {
      error = {
        status: true,
        message:
          "Invalid input. Jump addition with start must not exceed the end",
      };
      setSaveDisabled(true);
    } else if (
      name.includes("end") &&
      newValue.start.length > 0 &&
      newValue.jump.length > 0 &&
      extractNumberFromString(event.target.value) <
        extractNumberFromString(newValue.start) +
          extractNumberFromString(newValue.jump)
    ) {
      error = {
        status: true,
        message:
          "Invalid input. Jump addition with start must not exceed the end",
      };
      setSaveDisabled(true);
    } else {
      error = {
        status: false,
        message: "",
      };
      setSaveDisabled(false);
      //editVarianceParameter(id,parameter, , "List", varianceObject.domain);
    }

    if (name.includes("start")) {
      newValue.start = event.target.value;
      editVarianceParameter({ id, param: parameter, value: newValue });
    }
    if (name.includes("end")) {
      newValue.end = event.target.value;
      editVarianceParameter({ id, param: parameter, value: newValue });
    } else if (name.includes("jump")) {
      newValue.jump = event.target.value;
      editVarianceParameter({ id, param: parameter, value: newValue });
    }

    if (error.status) {
      setSaveDisabled(true);
    } else {
      setSaveDisabled(false);
    }
    setError(error);
  };

  const handleTypeChange = (e: DropdownChangeEvent) => {
    editVarianceParameter({
      id,
      param: parameter,
      domain: e.value,
    }); // edit 3rd parameter to be the value of the selected option
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
            value={(varianceObject.value && varianceObject.value.start) || ""}
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
            value={(varianceObject.value && varianceObject.value.jump) || ""}
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
            value={(varianceObject.value && varianceObject.value.end) || ""}
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
          value={varianceObject.domain}
          style={{ width: "160.57px" }}
          options={typeOptions}
          placeholder="Type"
          onChange={handleTypeChange}
          disabled={readOnly}
        />
      </div>
      <div>
        {varianceObject.domain === NumberOptions.List && (
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
              value={
                typeof varianceObject.value === "object"
                  ? ""
                  : varianceObject.value || ""
              }
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

        {(varianceObject.domain === NumberOptions.Addition ||
          varianceObject.domain === NumberOptions.Multiplication) &&
          JumpJSX}
      </div>
    </div>
  );
};
