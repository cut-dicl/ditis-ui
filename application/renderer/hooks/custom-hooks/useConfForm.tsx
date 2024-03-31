import { useContext, useEffect, useState } from "react";
import { ipcRenderer } from "electron";

import { ConfFormContext } from "../useContext-hooks/conf-form-hook/conf-form-hook";
import { NextPreviousButtonContext } from "../useContext-hooks/next-previous-buttons-hook/next-previous-buttons-hook";
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
  const nextPreviousBtnCtx = useContext(NextPreviousButtonContext);
  const appmode = useContext(AppController);

  const setConfigurationObject = (content) => {
    confFormCtx.handleConfigurationObject(content.descriptors);
    setLongNames(content.longNames.longNames);
    let keys: string[] = Object.keys(content.descriptors);
    nextPreviousBtnCtx.setStepNames(keys);
    nextPreviousBtnCtx.setNextStepName(
      keys[1] ? keys[1] : "Next step doesn't exist"
    );
    nextPreviousBtnCtx.setMaxIndex(keys.length);
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
          ipcRenderer
            .invoke("get-default-config", {
              javaPath: appmode.javaPath,
              mode: appmode.mode,
              address: appmode.onlineServer.address,
              auth: appmode.onlineServer.auth,
            })
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
        ipcRenderer
          .invoke("get-default-optimizer-config", {
            javaPath: appmode.javaPath,
            mode: appmode.mode,
            address: appmode.onlineServer.address,
            auth: appmode.onlineServer.auth,
          })
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
      nextPreviousBtnCtx.resetIndexStates();
    };
  }, []);

  return { isLoading, longNames };
};
