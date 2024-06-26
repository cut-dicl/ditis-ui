import { useEffect, useState } from "react";
import { ipcRenderer } from "electron";
import { configurationFileTypes } from "../../components/ConfigForm/ConfigurationPage";

export const useConfPage = (setEditMode?, setVarianceEditMode?, toast?) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    getConfigs();
    return () => {
      setData([]);
    };
  }, []);

  const getConfigs = () => {
    ipcRenderer.invoke("get-configs").then((result) => {
      if (result.code === 200) {
        console.log(result);
        setData(result.content.configurations);
        setIsLoading(false);
      } else {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Server did not respond",
          life: 3000,
        });
      }
    });
  };

  const deleteConfigHandler = async (row: any): Promise<void> => {
    const handleDelete = async () => {
        ipcRenderer
          .invoke("delete-config", {
            id: row.id,
          })
          .then((result) => {
            getConfigs();
            if (result.code === 200) {
              toast.current.show({
                severity: "success",
                summary: "Success",
                detail: result.message,
                life: 3000,
              });
            } else {
              toast.current.show({
                severity: "error",
                summary: "Error",
                detail: result.message,
                life: 3000,
              });
            }
          });
    };

    await handleDelete();
  };

  const uploadConfigHandler = (configType: configurationFileTypes) => {
    ipcRenderer
      .invoke("upload-config", {
        configType,
      })
      .then((result) => {
        // I need to handle the edge case
        if (result.code === 200 && result.message) {
          getConfigs();
          toast.current.show({
            severity: "success",
            summary: "Success",
            detail: "Configuration file uploaded successfully",
            life: 3000,
          });
        } else if (!result || result.code === 500) {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: result.message.toString(),
            life: 3000,
          });
        }
      });
  };

  const getConfigByIdHandler = (row: any, mode?, readOnly?) => {
    ipcRenderer
      .invoke("get-config-by-id", {
        id: row.id,
      })
      .then((result) => {
        if (result.code === 200) {
          if (mode === 0) {
            console.log(result);
            setEditMode({
              confObject: result.content,
              fileName: row.name,
              fileDescription: row.description,
              confId: row.id,
              readOnly: readOnly,
              formType: "simulator",
            });
          } else if (mode === 1) {
            console.log(result.content);
            setEditMode({
              confObject: result.content,
              fileName: row.name,
              fileDescription: row.description,
              confId: row.id,
              readOnly: readOnly,
              formType: "optimizer",
            });
          } else if (mode === 2) {
            console.log(result);
            setVarianceEditMode({
              confObject: result.content,
              fileName: row.name,
              fileDescription: row.description,
              confId: row.id,
              readOnly: readOnly,
            });
          }
        } else if (result.code === 500 || !result) {
        }
      });
  };

  const downloadToLocalFolder = (row: any) => {
    console.log(row);
    ipcRenderer
      .invoke("download-configuration", {
        confName: row.name,
        path: row.path,
      })
      .then((result) => {
        console.log(result);
        if (result && result.code === 200) {
          if (!result.hasOwnProperty("message")) return;
          else
            toast.current.show({
              severity: "success",
              summary: "Success",
              detail: result.message,
              life: 3000,
            });
          return;
        }
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: result.message,
          life: 3000,
        });
      });
  };

  const duplicateFile = (formData: any, formType: any) => {
    ipcRenderer
      .invoke("duplicate-config", {
        configName: formData.name,
        path: formData.path,
        confDescription: formData.description
          ? formData.description
          : "No description added for this configuration file",
        type: formType,
      })
      .then((result) => {
        getConfigs();
        if (result && result.code === 200) {
          if (!result.hasOwnProperty("message")) return;
          else
            toast.current.show({
              severity: "success",
              summary: "Success",
              detail: result.message,
              life: 3000,
            });
          return;
        }
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: result.message,
          life: 3000,
        });
      });
  };

  return {
    data,
    isLoading,
    deleteConfigHandler,
    uploadConfigHandler,
    getConfigByIdHandler,
    downloadToLocalFolder,
    duplicateFile,
  };
};
