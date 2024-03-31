import { VarianceFormContext } from "./variance-form-hook";
import { useState } from "react";
import { Content } from "../../../components/ConfigForm/FormInput";
import { ConfigurationObjectType } from "../conf-form-hook/conf-form-hook-provider";

export const VarianceFormProvider = ({ children }) => {
  const [varianceObject, setVarianceObject] = useState({ variance: [] });
  const [varianceOptions, setVarianceOptions] = useState({});
  const [varianceGroupings, setVarianceGroupings] = useState([]);

  const setInitialVarianceOptions = (varOptions) => {
    setVarianceOptions(varOptions);
  };

  const handleVarianceOptionsChange = (
    layerName,
    chosenOption,
    previousOption
  ) => {
    if (previousOption) {
      if (layerName === "Storage") {
        varianceOptions[layerName].disabled = true;
      } else {
        varianceOptions[layerName].forEach((item) => {
          if (item.label === chosenOption) {
            item.disabled = true;
          }

          if (item.label === previousOption) {
            item.disabled = false;
          }
        });
      }
    } else {
      if (layerName === "Storage") {
        varianceOptions[layerName].disabled = true;
      } else {
        varianceOptions[layerName].forEach((item) => {
          if (item.label === chosenOption) {
            item.disabled = true;
          }
        });
      }
    }
  };

  const handleVarianceObject = (inputObject): void => {
    let text;

    console.log(inputObject);
    if (
      "start" in inputObject &&
      inputObject.start.length > 0 &&
      inputObject.jump.length > 0 &&
      inputObject.end.length > 0
    ) {
      const { mode } = inputObject;
      text =
        "{" +
        inputObject.start +
        `:${mode === "Addition" ? "+" : "*"}` +
        inputObject.jump +
        ":" +
        inputObject.end +
        "}";
    } else {
      text = "[" + inputObject.value + "]";
    }

    const dummyObject = { ...varianceObject };
    const found = dummyObject.variance.find(
      (item) => item.key === inputObject.header
    );

    if (found) {
      dummyObject.variance.forEach((item) => {
        if (item.key === inputObject.header) {
          item.value = text;
        }
      });
    } else {
      dummyObject.variance.push({
        value: text,
        key: inputObject.header,
      });
    }

    setVarianceGroupings((prev) => {
      if (!prev.some((grouping) => grouping.label === inputObject.header))
        return [
          ...prev,
          {
            label: inputObject.header,
            value: inputObject.header,
            disabled: false,
          },
        ];
      return prev;
    });
    setVarianceObject({ ...dummyObject });
  };

  const handleGroupingAdd = (inputObject) => {
    const dummy = { ...varianceObject };
    const found = dummy.variance.find((item) => {
      if (
        inputObject.value.includes(item.value.replace(/[\[\]]/g, "")) ||
        item.value.replace(/[\[\]]/g, "").includes(inputObject.value)
      )
        return item;
    });

    if (found) {
      dummy.variance.forEach((item) => {
        if (
          inputObject.value.includes(item.value.replace(/[\[\]]/g, "")) ||
          item.value.replace(/[\[\]]/g, "").includes(inputObject.value)
        ) {
          item.value = "[" + inputObject.value + "]";
        }
      });
    } else {
      dummy.variance.push({
        value: "[" + inputObject.value + "]",
        key: inputObject.header,
      });
    }
    setVarianceObject({ ...dummy });
  };

  const handleRemoval = (key, selectedLayer) => {
    const dummy = { ...varianceObject };
    dummy.variance = dummy.variance.filter((item) => item.key !== key);

    dummy.variance.forEach((item) => {
      if (item.key === "grouping") {
        if (item.value.includes(key)) {
          if (item.value.replace(/[\[\]]/g, "").split(",").length > 1) {
            let arr = item.value
              .replace(/[\[\]]/g, "")
              .split(",")
              .filter((item) => item !== key);
            item.value = "[" + arr.join(",") + "]";
          } else {
            dummy.variance = dummy.variance.filter(
              (item) => item.value !== "[" + key + "]"
            );
          }
        }
      }
    });

    if (selectedLayer === "Storage") {
      //todo
    } else {
      if (selectedLayer) {
        varianceOptions[selectedLayer].forEach((item) => {
          if (item.label === key) {
            item.disabled = false;
          }
        });
      }
    }

    const removed = varianceGroupings.filter((item) => item.label !== key);

    setVarianceGroupings(removed);
    setVarianceObject({ ...dummy });
  };

  const handleGroupingOptionsChange = (optionKey, previousOption) => {
    if (optionKey.length < previousOption.length) {
      const keyRemoved = previousOption.filter(
        (element) => !optionKey.includes(element)
      );

      varianceGroupings.forEach((item) => {
        if (item.label === keyRemoved[0]) {
          item.disabled = false;
        }
      });
    } else {
      varianceGroupings.forEach((item) => {
        optionKey.forEach((val) => {
          if (val === item.label) {
            item.disabled = true;
          }
        });
      });
    }
  };

  const handleGroupingRemoval = (props) => {
    const dummy = { ...varianceObject };
    dummy.variance = dummy.variance.filter(
      (item) => item.value !== "[" + props + "]"
    );

    setVarianceObject({ ...dummy });

    props.forEach((val) => {
      varianceGroupings.forEach((item) => {
        if (item.label === val) item.disabled = false;
      });
    });
  };

  const handleInitialUpdateState = (varianceSettingsObject) => {
    let groupingsArr = [];

    varianceSettingsObject
      .filter((item) => item.key === "grouping")
      .map((item) => {
        const values = item.value.replace(/[\[\]]/g, "").split(",");
        values.forEach((val) => {
          groupingsArr.push({ label: val, value: val, disabled: true });
        });
      });

    setVarianceGroupings(groupingsArr);
    setVarianceObject({ ...varianceObject, variance: varianceSettingsObject });
  };

  const resetVarianceObject = () => {
    setVarianceObject({ variance: [] });
  };

  return (
    <VarianceFormContext.Provider
      value={{
        varianceOptions,
        varianceGroupings,
        varianceObject,
        setInitialVarianceOptions,
        handleVarianceOptionsChange,
        handleGroupingOptionsChange,
        handleVarianceObject,
        handleRemoval,
        resetVarianceObject,
        handleInitialUpdateState,
        handleGroupingRemoval,
        handleGroupingAdd,
      }}
    >
      {children}
    </VarianceFormContext.Provider>
  );
};

interface parameter {
  [key: string]: Array<{
    label?: string;
    alternatives?: string[];
    disabled?: boolean;
  }>;
}

interface varFormDefaultType {
  varianceOptions:
    | parameter
    | { label?: string; alternatives?: string[]; disabled?: boolean };
  varianceGroupings: any;
  varianceObject: { variance: Array<{ key: string; value: string }> };
  setInitialVarianceOptions: (varOptions) => void;
  handleGroupingOptionsChange: (groupings, previousOption) => void;
  handleVarianceOptionsChange: (
    layerName,
    chosenOption,
    previousOption
  ) => void;
  handleInitialUpdateState: (inputObject) => void;
  handleVarianceObject: (inputObject) => void;
  resetVarianceObject: () => void;
  handleRemoval: (key, selectedLayer) => void;
  handleGroupingRemoval: (props) => void;
  handleGroupingAdd: (inputObject) => void;
}

export const varFormDefaultBehavior: varFormDefaultType = {
  varianceOptions: { label: "" },
  varianceGroupings: [],
  varianceObject: { variance: [] },
  setInitialVarianceOptions: (varOptions): void => {},
  handleGroupingOptionsChange: (groupings, previousOption): void => {},
  handleVarianceOptionsChange: (
    layerName,
    chosenOption,
    previousOption
  ): void => {},
  handleInitialUpdateState: (inputObject): void => {},
  resetVarianceObject: (): void => {},
  handleVarianceObject: (inputObject): void => {},
  handleRemoval: (key, selectedLayer): void => {},
  handleGroupingRemoval: (props): void => {},
  handleGroupingAdd: (inputObject): void => {},
};
