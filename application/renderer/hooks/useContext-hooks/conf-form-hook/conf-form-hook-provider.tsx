import { useState } from "react";

import { ConfFormContext } from "./conf-form-hook";
import { Content } from "../../../components/ConfigForm/FormInput";

export interface ConfigurationObjectType {
  [key: string]: Array<Content>;
}

export const ConfFormContextProvider = ({ children }) => {
  const [configurationObject, setConfigurationObject] =
    useState<ConfigurationObjectType>({});
  const [confTabIndex, setConfTabIndex] = useState(0);

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [stepNamesKeys, setStepNames] = useState<string[]>([]);
  const [previousStepName, setPreviousStepName] = useState<string>("");
  const [nextStepName, setNextStepName] = useState<string>("");
  const [maxIndex, setMaxIndex] = useState<number>(0);

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

  const handlePreviousButton = (): void => {
    if (activeIndex === 0) {
      return;
    }

    setActiveIndex((prev: number) => {
      if (prev - 2 >= 0) {
        setPreviousStepName(stepNamesKeys[prev - 2]);
      }
      setNextStepName(stepNamesKeys[prev]);

      return prev - 1;
    });
  };

  const handleNextButton = (): void => {
    if (activeIndex === maxIndex) {
      return;
    }
    setActiveIndex((prev: number) => {
      if (prev + 2 <= maxIndex) {
        setPreviousStepName(stepNamesKeys[prev]);
        setNextStepName(stepNamesKeys[prev + 2]);
      }

      return prev + 1;
    });
  };

  const handleSelect = (index): void => {
    setActiveIndex(index);
    setPreviousStepName(stepNamesKeys[index - 1]);
    setNextStepName(stepNamesKeys[index + 1]);
  };

  const resetIndexStates = () => {
    setActiveIndex(0);
    setMaxIndex(0);
  };

  const resetFormState = (): void => {
    setConfigurationObject({});
  };

  const handleConfTabIndex = (indexValue: number): void => {
    setConfTabIndex(indexValue);
  };

  const handleConfigurationObject = (obj: any): void => {
    if ("name" in obj) {
      const dummyObject = { ...configurationObject };

      Object.entries(dummyObject).forEach((item: [string, Array<any>]) => {
        if (item[0] === obj.header) {
          item[1].forEach((x) => {
            if (x.key === obj.name) {
              x.defaultValue = obj.value;
            }
          });
        }
      });
      setConfigurationObject({ ...dummyObject });
      return;
    }

    setConfigurationObject((prev) => {
      return { ...prev, ...obj };
    });
  };

  return (
    <ConfFormContext.Provider
      value={{
        configurationObject,
        confTabIndex,
        handleConfTabIndex,
        handleConfigurationObject,
        resetFormState,
        activeIndex,
        handleSelect,
        handlePreviousButton,
        handleNextButton,
        previousStepName,
        nextStepName,
        setNextStepName,
        setStepNames,
        maxIndex,
        setMaxIndex,
        resetIndexStates,
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
    </ConfFormContext.Provider>
  );
};

interface parameter {
  [key: string]: Array<{
    label?: string;
    alternatives?: string[];
    disabled?: boolean;
  }>;
}

interface confFormDefaultType {
  configurationObject: ConfigurationObjectType;
  confTabIndex: number;
  handleConfTabIndex: (indexValue: number) => void;
  handleConfigurationObject: (obj: any) => void;
  resetFormState: () => void;
  activeIndex: number;
  handleSelect: (param: number) => void;
  handlePreviousButton: () => void;
  handleNextButton: () => void;
  previousStepName: string;
  nextStepName: string;
  setNextStepName: (param: string) => void;
  setStepNames: (keys: string[]) => void;
  maxIndex: number;
  setMaxIndex: (param: number) => void;
  resetIndexStates: () => void;
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

export const confFormDefaultBehavior: confFormDefaultType = {
  configurationObject: {},
  confTabIndex: 0,
  handleConfTabIndex: () => {},
  handleConfigurationObject: (): void => {},
  resetFormState: (): void => {},
  activeIndex: 0,
  handleSelect: (): void => {},
  handlePreviousButton: (): void => {},
  handleNextButton: (): void => {},
  previousStepName: "",
  nextStepName: "",
  setNextStepName: (): void => {},
  setStepNames: (): void => {},
  maxIndex: 0,
  setMaxIndex: (): void => {},
  resetIndexStates: () => {},
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
