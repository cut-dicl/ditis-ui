import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { ConfigurationObjectType } from "../../../hooks/useContext-hooks/conf-form-hook/conf-form-hook-provider";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Content } from "../FormInput";
import { VarianceClassOption } from "./VarianceClassOption";
import { VarianceNumberOption } from "./VarianceNumberOption";
import { VarianceFormContext } from "../../../hooks/useContext-hooks/variance-form-hook/variance-form-hook";
import { Tooltip } from "primereact/tooltip";
import { Button } from "primereact/button";
import VarianceBoolean from "./VarianceBoolean";

interface IVarianceOptions {
  id: number;
  remove: any;
  varianceSettings: any;
}

export const VarianceOptions = ({
  remove,
  id,
  varianceSettings,
}: IVarianceOptions) => {
  const [selectedLayer, setSelectedLayer] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [layerOptions, setLayerOptions] = useState([]);
  const [hasAlternatives, setHasAlternatives] = useState(false);
  const [isClass, setIsClass] = useState(false);
  const [isBoolean, setIsBoolean] = useState(false);
  const [classOptions, setClassOptions] = useState([]);
  const VarFormCtx = useContext(VarianceFormContext);
  const options = VarFormCtx.varianceOptions;
  const firstRender = useRef(true);

  const dropdownValues = Object.entries(options).map((item) => {
    return item[0];
  });

  const optionItem = VarFormCtx.varianceObject.variance[id - 1];

  useLayoutEffect(() => {
    if (optionItem && Object.keys(varianceSettings).length > 0) {
      if (optionItem.key.includes("storage.system.report")) {
        handleLayerChange({ target: { value: "Report" } }, true);
      } else if (optionItem.key.includes("storage.system")) {
        handleLayerChange({ target: { value: "Storage" } }, true);
      } else if (optionItem.key.includes("data.profiler")) {
        handleLayerChange({ target: { value: "Profiler" } }, true);
      } else if (optionItem.key.includes("network")) {
        handleLayerChange({ target: { value: "Network" } }, true);
      } else if (optionItem.key.includes("workload")) {
        handleLayerChange({ target: { value: "Workload" } }, true);
      } else if (optionItem.key.includes("access")) {
        handleLayerChange({ target: { value: "Access" } }, true);
      } else if (optionItem.key.includes("file.home")) {
        handleLayerChange({ target: { value: "FileHome" } }, true);
      } else if (optionItem.key.includes("storage.tiering")) {
        handleLayerChange({ target: { value: "Tiering" } }, true);
      } else if (optionItem.key.includes("redundancy")) {
        handleLayerChange({ target: { value: "Redundancy" } }, true);
      } else if (optionItem.key.includes("hot.tier")) {
        handleLayerChange({ target: { value: "Hot Tier" } }, true);
      } else if (optionItem.key.includes("warm.tier")) {
        handleLayerChange({ target: { value: "Warm Tier" } }, true);
      } else if (optionItem.key.includes("cold.tier")) {
        handleLayerChange({ target: { value: "Cold Tier" } }, true);
      } else if (optionItem.key.includes("persistence.layer")) {
        handleLayerChange({ target: { value: "Persistence" } }, true);
      }
    }
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
    } else {
      if (optionItem && Object.keys(varianceSettings).length > 0) {
        console.log("this ran");
        handleOptionChange({ target: { value: optionItem.key } });
      }
    }
  }, [selectedLayer]);

  const handleLayerChange = (event, skipRemoval?): void => {
    setSelectedLayer(event.target.value);
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

  const handleOptionChange = (event): void => {
    console.log("this ran");
    VarFormCtx.handleVarianceOptionsChange(
      selectedLayer,
      event.target.value,
      selectedOption
    );

    if (selectedLayer !== "Storage") {
      const answer = Object.entries(options).find((item) => {
        if (item[0] === selectedLayer) {
          return item;
        }
      });

      // and here im getting the array of alternatives that has to do with the selected option
      const alternativesExist = answer[1].find((item) => {
        if (item.label === event.target.value) {
          return item;
        }
      });

      if ("alternatives" in alternativesExist) {
        setClassOptions(alternativesExist.alternatives);
        setHasAlternatives(true);
        if (event.target.value.includes("class")) setIsClass(true);
      } else if (event.target.value.includes("enabled")) {
        setIsBoolean(true);
      } else {
        setIsBoolean(false);
        setHasAlternatives(false);
        setIsClass(false);
      }
    }

    // Here i remove the previous option because the state will update in the code below
    VarFormCtx.handleRemoval(selectedOption, selectedLayer);
    setSelectedOption(event.target.value);
  };

  const handleOptionRemoval = () => {
    remove(id);
    setSelectedLayer("");
    setSelectedOption("");
    setLayerOptions([]);
    VarFormCtx.handleRemoval(selectedOption, selectedLayer);
  };

  console.log(VarFormCtx.varianceObject);

  const parameterOptionsTemplate = (availableOptions) => {
    return (
      <div style={availableOptions.disabled ? { color: "#ccc" } : {}}>
        {availableOptions.label}
      </div>
    );
  };

  return (
    <div className="flex justify-between items-end mt-5">
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
            value={selectedLayer}
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
            value={selectedOption}
            options={layerOptions}
            placeholder="Select a parameter"
            onChange={handleOptionChange}
            itemTemplate={parameterOptionsTemplate}
            disabled={varianceSettings.readOnly}
          />
        </div>
        {selectedOption.length > 0 ? (
          hasAlternatives ? (
            <VarianceClassOption
              readOnly={varianceSettings.readOnly}
              selected={selectedOption}
              foundOption={classOptions}
              isClass={isClass}
              editValue={
                optionItem &&
                Object.keys(varianceSettings).length > 0 &&
                optionItem.value
              }
            />
          ) : isBoolean ? (
            <VarianceBoolean
              readOnly={varianceSettings.readOnly}
              selected={selectedOption}
              editValue={
                optionItem &&
                Object.keys(varianceSettings).length > 0 &&
                optionItem.value
              }
            />
          ) : (
            <VarianceNumberOption
              readOnly={varianceSettings.readOnly}
              varianceOption={selectedOption}
              editValue={
                optionItem &&
                Object.keys(varianceSettings).length > 0 &&
                optionItem.value
              }
            />
          )
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
