import { ipcRenderer } from "electron";
import { useContext, useEffect, useState } from "react";
import { AppController } from "../useContext-hooks/appcontroller-hook/appcontroller-hook";

export const useTraces = () => {
  const [traces, setTraces] = useState([]);
  const [isLoadingTraces, setIsLoading] = useState<boolean>(true);
  const appController = useContext(AppController);

  useEffect(() => {
    ipcRenderer
      .invoke("get-trace-list")
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
