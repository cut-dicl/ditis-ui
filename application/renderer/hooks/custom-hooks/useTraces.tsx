import { ipcRenderer } from "electron";
import { useContext, useEffect, useState } from "react";
import { AppController } from "../useContext-hooks/appcontroller-hook/appcontroller-hook";

export const useTraces = () => {
  const [traces, setTraces] = useState([]);
  const [isLoadingTraces, setIsLoading] = useState<boolean>(true);
  const appController = useContext(AppController);

  useEffect(() => {
    console.log(appController);
    ipcRenderer
      .invoke("get-trace-list", {
        mode: appController.mode,
        auth: appController.onlineServer.auth,
        address: appController.onlineServer.address,
      })
      .then((result) => {
        console.log(result);
        setTraces(result.data);
        setIsLoading(false);
      });

    return () => {
      setTraces([]);
    };
  }, []);

  return {
    traces,
    isLoadingTraces,
  };
};
