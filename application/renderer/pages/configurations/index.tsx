import { useEffect, useRef, useState } from "react";

import ConfigurationForm from "../../components/ConfigForm/ConfigurationForm";
import { ConfFormContextProvider } from "../../hooks/useContext-hooks/conf-form-hook/conf-form-hook-provider";
import { ConfigurationPage } from "../../components/ConfigForm/ConfigurationPage";
import {
  ConfigurationMode,
  useConfFormProps,
} from "../../hooks/custom-hooks/useConfForm";
import { VarianceForm } from "../../components/ConfigForm/VarianceForm/VarianceForm";
import Head from "next/head";

export interface IConfSettings extends useConfFormProps {
  fileDescription?: string;
  fileName?: string;
  confId?: number;
  readOnly?: boolean;
}

export type formTypes = "simulator" | "optimizer";
export type configurationContentShown = "none" | "form" | "variance";

const Configurations = () => {
  const [contentShown, setContentShown] =
    useState<configurationContentShown>("none");
  const [confSettings, setConfSettings] = useState<IConfSettings>({
    mode: ConfigurationMode.New,
    formType: "simulator",
  });
  const [varianceSettings, setVarianceSettings] = useState({});
  const ref = useRef(null);

  const setEditMode = (result: Partial<IConfSettings>): void => {
    const {
      fileName,
      fileDescription,
      confObject,
      confId,
      readOnly,
      formType,
    } = result;

    setConfSettings({
      mode: ConfigurationMode.Update,
      confObject,
      fileName,
      fileDescription,
      confId,
      formType,
      readOnly: readOnly ? readOnly : false,
    });
    ref.current = "show";
  };

  const setCreateForm = (formType: formTypes): void => {
    setConfSettings({
      mode: ConfigurationMode.New,
      formType: formType,
    });
    ref.current = "show";
  };

  const setVarianceCreateForm = () => {
    setVarianceSettings({});
    setContentShown("variance");
  };

  const setVarianceEditMode = (props: Partial<IConfSettings>) => {
    const { fileName, fileDescription, confObject, confId, readOnly } = props;
    setVarianceSettings({
      confObject,
      fileName,
      fileDescription,
      confId,
      readOnly: readOnly ? readOnly : false,
    });
    setContentShown("variance");
  };

  useEffect(() => {
    if (ref.current === "show") {
      setContentShown("form");
    }
  }, [confSettings]);

  return (
    <ConfFormContextProvider>
      <div className="w-full p-5 h-full">
        <Head>
          <title>DITIS Simulator: Configurations</title>
        </Head>
        {contentShown === "none" && (
          <>
            <ConfigurationPage
              setContent={setVarianceCreateForm}
              showForm={setCreateForm}
              setEditMode={setEditMode}
              setVarianceEditMode={setVarianceEditMode}
            />
          </>
        )}
        {contentShown === "form" && (
          <ConfigurationForm
            confSettings={confSettings}
            showForm={setContentShown}
          />
        )}
        {contentShown === "variance" && (
          <VarianceForm
            showForm={setContentShown}
            varianceSettings={varianceSettings}
            resetVarianceSettings={() => setVarianceSettings({})}
          />
        )}
      </div>
    </ConfFormContextProvider>
  );
};

export default Configurations;
