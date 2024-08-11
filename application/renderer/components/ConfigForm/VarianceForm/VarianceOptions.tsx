import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { ConfigurationObjectType } from "../../../hooks/useContext-hooks/conf-form-hook/conf-form-hook-provider";
import {
  use,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Content } from "../FormInput";
import { VarianceClassOption } from "./VarianceClassOption";
import { VarianceNumberOption } from "./VarianceNumberOption";
import { Tooltip } from "primereact/tooltip";
import { Button } from "primereact/button";
import VarianceBoolean from "./VarianceBoolean";
import { ConfFormContext } from "../../../hooks/useContext-hooks/conf-form-hook/conf-form-hook";

interface IVarianceOptions {
  id: number;
  varianceSettings: any;
  editVarianceParameter: any;
  deleteVarianceParameter: any;
  varianceObject: any;
  saveDisabled?: boolean;
  setSaveDisabled?: any;
}

export const VarianceOptions = ({
  id,
  varianceSettings,
  editVarianceParameter,
  deleteVarianceParameter,
  varianceObject,
  saveDisabled,
  setSaveDisabled,
}: IVarianceOptions) => {
  const [layerOptions, setLayerOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const VarFormCtx = useContext(ConfFormContext);
  const options = VarFormCtx.varianceOptions;
  const firstRender = useRef(true);

  const dropdownValues = Object.entries(options).map((item) => {
    return item[0];
  });



  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
    } else {
      if (varianceObject.parameters[id] && Object.keys(varianceObject.parameters).length > 0) {
        if(varianceObject.parameters[id].parameter.length>0)
          handleOptionChange({ target: { value: varianceObject.parameters[id].parameter } }, true);
      }
    }
  }, [varianceObject.parameters[id].layer]);


  useEffect(() => {
    if (varianceObject.parameters[id] && Object.keys(varianceObject.parameters).length > 0) {
      if (varianceObject.parameters[id].parameter === "") {
        return;
      } else if (varianceObject.parameters[id].parameter.includes("storage.system.report")) {
        handleLayerChange({ target: { value: "Report" } }, true);
      } else if (varianceObject.parameters[id].parameter.includes("storage.system")) {
        handleLayerChange({ target: { value: "Storage" } }, true);
      } else if (varianceObject.parameters[id].parameter.includes("data.profiler")) {
        handleLayerChange({ target: { value: "Profiler" } }, true);
      } else if (varianceObject.parameters[id].parameter.includes("network")) {
        handleLayerChange({ target: { value: "Network" } }, true);
      } else if (varianceObject.parameters[id].parameter.includes("workload")) {
        handleLayerChange({ target: { value: "Workload" } }, true);
      } else if (varianceObject.parameters[id].parameter.includes("access")) {
        handleLayerChange({ target: { value: "Access" } }, true);
      } else if (varianceObject.parameters[id].parameter.includes("file.home")) {
        handleLayerChange({ target: { value: "FileHome" } }, true);
      } else if (varianceObject.parameters[id].parameter.includes("storage.tiering")) {
        handleLayerChange({ target: { value: "Tiering" } }, true);
      } else if (varianceObject.parameters[id].parameter.includes("redundancy")) {
        handleLayerChange({ target: { value: "Redundancy" } }, true);
      } else if (varianceObject.parameters[id].parameter.includes("hot.tier")) {
        handleLayerChange({ target: { value: "Hot Tier" } }, true);
      } else if (varianceObject.parameters[id].parameter.includes("warm.tier")) {
        handleLayerChange({ target: { value: "Warm Tier" } }, true);
      } else if (varianceObject.parameters[id].parameter.includes("cold.tier")) {
        handleLayerChange({ target: { value: "Cold Tier" } }, true);
      } else if (varianceObject.parameters[id].parameter.includes("persistence.layer")) {
        handleLayerChange({ target: { value: "Persistence" } }, true);
      }
    }
  }, [varianceObject.parameters[id].parameter]);

  // useEffect(() => {
  //   console.log("selectedOption", selectedOption);
  // }, [selectedOption]);

  const handleLayerChange = (event, skipRemoval?): void => {
    if (!skipRemoval) {
      VarFormCtx.handleRemoval(varianceObject.parameters[id].parameter, varianceObject.parameters[id].layer);
      editVarianceParameter({ id, layer: event.target.value, param: "", value: "", type: "", domain: "", disabled:false });
    } else 
      editVarianceParameter({id, layer: event.target.value });
    // if (varianceObject.parameters[id].parameter !=="")
      // editVarianceParameter({ id, param: "", value: "", type: "", domain: "" });
    Object.entries(options).map((item) => {
      if (item[0] === event.target.value) {
        if (Array.isArray(item[1])) {
          setLayerOptions(item[1]);
        } else {
          //Storage case
          setLayerOptions([item[1]]);
        }
      }
    });
  };

  const handleOptionChange = (event, load?): void => {

    let type;
    VarFormCtx.handleVarianceOptionsChange(
      varianceObject.parameters[id].layer,
      event.target.value,
      varianceObject.parameters[id].parameter
    );
    if (!load)
      editVarianceParameter({ id, param: event.target.value, value: "", type: "", domain: "", disabled:false });

    const answer = Object.entries(options).find((item) => {
      if (item[0] === varianceObject.parameters[id].layer) {
        return item;
      }
    });

    // and here im getting the array of alternatives that has to do with the selected option
    if (!Array.isArray(answer[1])) {
      setClassOptions([]);
      if (event.target.value)
        type = "number"
    } else {
      const alternativesExist = answer[1].find((item) => {
        if (item.label === event.target.value) {
          return item;
        }
      });
  
      if (alternativesExist) {
        if ("alternatives" in alternativesExist) {
          setClassOptions(alternativesExist.alternatives);
          if (event.target.value.includes("class"))
            type = "class";
          else type = "alternatives";
        
        } else if (event.target.value.includes("enabled")) {
          type = "boolean";
        } else {
          type = "number";
        }
      }
    }

    

    // Here i remove the previous option because the state will update in the code below
    //VarFormCtx.handleRemoval(selectedOption, varianceObject.parameters[id].layer);
    editVarianceParameter({ id, param: event.target.value, type});
  };

  const handleOptionRemoval = () => {
    deleteVarianceParameter(id, varianceObject.parameters[id].parameter);
    VarFormCtx.handleRemoval(varianceObject.parameters[id].parameter, varianceObject.parameters[id].layer);
  };

  const parameterOptionsTemplate = (availableOptions) => {
    return (
      <div style={availableOptions.disabled ? { color: "#ccc" } : {}}>
        {availableOptions.label}
      </div>
    );
  };

  return (
    <div className={"flex justify-between items-end mt-5"} key={id}>
      <div className="flex gap-10 grow">
        <div className="flex flex-col">
          <Tooltip target=".pi-question-circle" />
          <label>
            Category
            <i
              className="pi pi-question-circle ml-1"
              data-pr-tooltip="Specify the parameter’s category"
              data-pr-position="right"
            />
          </label>
          <Dropdown
            placeholder="Select a category"
            value={varianceObject.parameters[id].layer}
            options={dropdownValues}
            onChange={handleLayerChange}
            disabled={varianceSettings.readOnly}
          />
        </div>
        <div className="flex flex-col">
          <Tooltip target=".pi-question-circle" />
          <label>
            Parameter
            <i
              className="pi pi-question-circle ml-1"
              data-pr-tooltip="Specify the parameter to vary"
              data-pr-position="right"
            />
          </label>
          <Dropdown
            className="w-80"
            value={varianceObject.parameters[id].parameter}
            options={layerOptions}
            placeholder="Select a parameter"
            onChange={handleOptionChange}
            itemTemplate={parameterOptionsTemplate}
            disabled={varianceSettings.readOnly}
          />
        </div>
        {varianceObject.parameters[id].parameter.length > 0 ? (
          varianceObject.parameters[id].type === "alternatives" || varianceObject.parameters[id].type === "class" ? (
            <VarianceClassOption
              readOnly={varianceSettings.readOnly}
              selected={varianceObject.parameters[id].parameter}
              foundOption={classOptions}
              isClass={varianceObject.parameters[id].type === "class"}
              editVarianceParameter={editVarianceParameter}
              parameter={varianceObject.parameters[id].parameter}              
              id={id}
              varianceObject={varianceObject.parameters[id]}
            />
          ) : varianceObject.parameters[id].type === "boolean" ? (
            <VarianceBoolean
              readOnly={varianceSettings.readOnly}
              selected={varianceObject.parameters[id].parameter}
              editValue={
                varianceObject.parameters[id] &&
                Object.keys(varianceSettings).length > 0 &&
                varianceObject.parameters[id].value
              }
              editVarianceParameter={editVarianceParameter}
                parameter={varianceObject.parameters[id].parameter}                
                id={id}
                varianceObject={varianceObject.parameters[id]}
            />
          ) : varianceObject.parameters[id].type === "number" ? (
            <VarianceNumberOption
              readOnly={varianceSettings.readOnly}
              varianceOption={varianceObject.parameters[id].parameter}
              editVarianceParameter={editVarianceParameter}
                  parameter={varianceObject.parameters[id].parameter}
                  id={id}
                  varianceObject={varianceObject.parameters[id]}
                  saveDisabled={saveDisabled}
                  setSaveDisabled={setSaveDisabled}
            />
          ) : null
        ) : null}
      </div>
      <Button
        onClick={handleOptionRemoval}
        severity="secondary"
        icon="pi pi-times"
        className="h-10.5"
        disabled={varianceSettings.readOnly}
      />
    </div>
  );
};
