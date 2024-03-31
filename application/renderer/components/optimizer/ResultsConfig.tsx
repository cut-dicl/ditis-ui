import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import React from "react";
import ConfigurationForm from "../ConfigForm/ConfigurationForm";
import { IConfSettings } from "../../pages/configurations";
import { ConfigurationMode } from "../../hooks/custom-hooks/useConfForm";

export default function ResultsConfig({ id, analyzeConfig, showToast }) {
  const [confSettings, setConfSettings] = React.useState<IConfSettings>({
    confObject: analyzeConfig,
    mode: ConfigurationMode.New,
    formType: "simulator",
    readOnly: true,
  });

  return (
    <div className="flex flex-row relative h-[100%] mr-2">
      <div className="w-[100%] h-full">
        <ConfigurationForm
          confSettings={confSettings}
          showForm={(param) => {}}
          showBackButton={false}
          optimizerView={true}
        />
      </div>
    </div>
  );
}
