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
      }}
    >
      {children}
    </ConfFormContext.Provider>
  );
};

interface confFormDefaultType {
  configurationObject: ConfigurationObjectType;
  confTabIndex: number;
  handleConfTabIndex: (indexValue: number) => void;
  handleConfigurationObject: (obj: any) => void;
  resetFormState: () => void;
}

export const confFormDefaultBehavior: confFormDefaultType = {
  configurationObject: {},
  confTabIndex: 0,
  handleConfTabIndex: () => {},
  handleConfigurationObject: (): void => {},
  resetFormState: (): void => {},
};
