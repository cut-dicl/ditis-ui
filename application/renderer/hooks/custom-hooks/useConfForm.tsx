import { useContext, useEffect, useState } from "react";

import { ConfFormContext } from "../useContext-hooks/conf-form-hook/conf-form-hook";
import { ConfigurationObjectType } from "../useContext-hooks/conf-form-hook/conf-form-hook-provider";
import { formTypes } from "../../pages/configurations";
import { AppController } from "../useContext-hooks/appcontroller-hook/appcontroller-hook";

export enum ConfigurationMode {
  Update = 0,
  New = 1,
}

export interface useConfFormProps {
  formType: formTypes;
  mode: ConfigurationMode;
  confObject?: ConfigurationObjectType;
}

export const useConfForm = (props: useConfFormProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [longNames, setLongNames] = useState<string[]>([]);

  const confFormCtx = useContext(ConfFormContext);
  const appmode = useContext(AppController);

  const setConfigurationObject = (content) => {
    confFormCtx.handleConfigurationObject(content.descriptors);
    setLongNames(content.longNames.longNames);
    let keys: string[] = Object.keys(content.descriptors);
    confFormCtx.setStepNames(keys);
    confFormCtx.setNextStepName(keys[1] ? keys[1] : "Next step doesn't exist");
    confFormCtx.setMaxIndex(keys.length);
    setIsLoading(false);
  };

  useEffect(() => {
    if (props.mode) {
      // if mode is new
      if (props.formType === "simulator") {
        // if i already have the configuration file because of the optimizer
        if (props.confObject) {
          setConfigurationObject(props.confObject);
        } else {
          window.ipc
            .invoke("get-default-config")
            .then((result) => {
              const { code, content } = result;
              if (code === 200) {
                setConfigurationObject(content);
              } else if (code === 500) {
                console.log("Failed to fetch default config");
              } else {
                console.log("undefined approach");
              }
            });
        }
      } else if (props.formType === "optimizer") {
        window.ipc
          .invoke("get-default-optimizer-config")
          .then((result) => {
            const { code, content } = result;

            if (code === 200) {
              setConfigurationObject(content);
            } else if (code === 500) {
              console.log("Fail");
            } else {
              console.log("undefined approach");
            }
          });
      }
    } else {
      // if mode is update
      setConfigurationObject(props.confObject);
    }

    return () => {
      setIsLoading(true);
      confFormCtx.resetFormState();
      confFormCtx.resetIndexStates();
    };
  }, []);

  return { isLoading, longNames };
};
