import React from "react";
import ConfigurationForm from "../ConfigForm/ConfigurationForm";
import { IConfSettings } from "../../pages/configurations";
import { ConfigurationMode } from "../../hooks/custom-hooks/useConfForm";
import { ipcRenderer } from "electron";
import { AppController } from "../../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook";

export default function ResultsConfig({ id }) {
  const [loaded, setLoaded] = React.useState(false);
  const [confSettings, setConfSettings] = React.useState<IConfSettings>({
    confObject: {},
    mode: ConfigurationMode.New,
    formType: "simulator",
    readOnly: true,
  });
  const controller = React.useContext(AppController);

  React.useEffect(() => {
    ipcRenderer
      .invoke("get-optimizer-best-config", {
        id,
        javaPath: controller.javaPath,
      })
      .then((result) => {
        if (!result) return;
        else if (result.code === 500) return;
        setConfSettings({...confSettings, confObject: result.data});
        setLoaded(true);
      });
  }, [id]);


  return (

    <div className="flex flex-row relative h-[100%] mr-2">
      {loaded && (
        <div className="w-[100%] h-full">
          {confSettings.confObject && Object.entries(confSettings.confObject).length > 0 ? (
            <ConfigurationForm
              confSettings={confSettings}
              showForm={(param) => { }}
              showBackButton={false}
              optimizerView={true}
            />
          ) : (
            <p>There wasn't any best_conf file generated</p>
          )}
        </div> 
      )}
    </div>
  );
}
