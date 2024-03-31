import React, { useContext, useEffect, useState } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import { ipcRenderer } from "electron";
import { ConfigurationObjectType } from "../../../hooks/useContext-hooks/conf-form-hook/conf-form-hook-provider";
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import { Divider } from "primereact/divider";
import { VarianceOptions } from "./VarianceOptions";
import { Button } from "primereact/button";
import { VarianceFormContext } from "../../../hooks/useContext-hooks/variance-form-hook/variance-form-hook";
import { Dropdown } from "primereact/dropdown";
import { GroupingOptions } from "./GroupingOptions";
import { ConfirmationDialog } from "../ConfirmationDialog";
import { configurationContentShown } from "../../../pages/configurations";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useVarianceForm } from "../../../hooks/custom-hooks/useVarianceForm";
import { AppController } from "../../../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook";
import Swal from "sweetalert2";
import { Content } from "../FormInput";

interface IVarianceForm {
  showForm: React.Dispatch<React.SetStateAction<configurationContentShown>>;
  varianceSettings: any;
}

export const VarianceForm = ({ showForm, varianceSettings }: IVarianceForm) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showDialog, setShowDialog] = useState(false);
  const VarFormCtx = useContext(VarianceFormContext);
  const appmode = useContext(AppController);

  const {
    varianceOptionsCounter,
    groupingCounter,
    varianceFileInformation,
    handleFormSubmission,
    handleVarianceAdd,
    handleGroupingAdd,
    removeVarianceOption,
    removeGroupingOption,
    handleVarianceFileInformation,
  } = useVarianceForm({ showForm, varianceSettings, setShowDialog });

  let isButtonDisabled = VarFormCtx.varianceObject.variance.length === 0;

  useEffect(() => {
    ipcRenderer
      .invoke("get-default-config", {
        javaPath: appmode.javaPath,
        mode: appmode.mode,
      })
      .then((result) => {
        const arrayWithoutStorageName = Object.entries(
          result.content.descriptors
        ).map((item) => {
          if (item[0] === "Storage") {
            return {
              Storage: {
                label: item[1][1].key,
                value: item[1][1].key,
                disabled: false,
              },
            };
          } else {
            const formattedObject = (item[1] as any[]).map((item) => {
              if ("alternatives" in item)
                return {
                  label: item.key,
                  value: item.key,
                  alternatives: item.alternatives,
                  disabled: false,
                };
              return { label: item.key, value: item.key, disabled: false };
            });
            return { [item[0]]: formattedObject };
          }
        });

        let correctObject = {};

        for (let i = 0; i < arrayWithoutStorageName.length; i++) {
          if (arrayWithoutStorageName[i] !== undefined)
            correctObject = { ...correctObject, ...arrayWithoutStorageName[i] };
        }

        VarFormCtx.setInitialVarianceOptions(correctObject);
        setIsLoading(false);
      });

    if (Object.keys(varianceSettings).length > 0) {
      const name = {
        target: { name: "name", value: varianceSettings.fileName },
      };
      const desc = {
        target: {
          name: "description",
          value: varianceSettings.fileDescription,
        },
      };

      handleVarianceFileInformation(name);
      handleVarianceFileInformation(desc);
    }
  }, []);

  const handleCancelButton = () => {
    Swal.fire({
      icon: "question",
      title: `Are you sure you want go back`,
      color: document.documentElement.className == "dark" ? "white" : "",
      background: document.documentElement.className == "dark" ? "#1f2937" : "",
      showDenyButton: true,
      showConfirmButton: true,
      confirmButtonText: "Yes",
      confirmButtonColor: "#50C878",
      denyButtonText: `Cancel`,
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        VarFormCtx.resetVarianceObject();
        showForm("none");
      }
    });
  };

  if (isLoading) {
    // @ts-ignore
    return (
      <div style={{ textAlign: "center", padding: "25% 0" }}>
        <ProgressSpinner />
        <h1>Loading Variance Form...</h1>
      </div>
    );
  }

  const footerContent = (
    <Button severity="secondary" onClick={handleFormSubmission}>
      Save
    </Button>
  );

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="h-full overflow-auto">
        <h1 className="text-4xl">Parameter Space Variance</h1>
        <Divider />
        <h1 className="text-4xl mb-5">Specify parameter domains</h1>

        {varianceOptionsCounter.map((item, index) => {
          return (
            <VarianceOptions
              key={item.id}
              id={item.id}
              remove={removeVarianceOption}
              varianceSettings={varianceSettings}
            />
          );
        })}
        <Button
          text
          className="hover:!bg-slate-300"
          style={{
            color:
              document.documentElement.className == "dark" ? "white" : "black",
            marginTop: "10px",
            marginBottom: "20px",
          }}
          label="Add"
          icon="pi pi-plus"
          onClick={handleVarianceAdd}
          disabled={varianceSettings.readOnly}
        />

        <h1 className="text-4xl mb-5">Specify parameter groupings</h1>
        {groupingCounter.map((item) => {
          return (
            <GroupingOptions
              key={item.id}
              id={item.id}
              remove={removeGroupingOption}
              varianceSettings={varianceSettings}
            />
          );
        })}
        <Button
          text
          style={{
            color:
              document.documentElement.className == "dark" ? "white" : "black",
            marginTop: "10px",
            marginBottom: "20px",
          }}
          className="hover:!bg-slate-300"
          label="Add"
          icon="pi pi-plus"
          onClick={handleGroupingAdd}
          disabled={varianceSettings.readOnly}
        />
        <Divider />
      </div>
      <div className="flex justify-center space-x-8">
        <button
          className="bg-gray-100 shadow-md hover:bg-gray-400 hover:dark:bg-gray-600 text-black dark:text-white dark:bg-[#313e4f] font-bold py-2 px-4 border border-gray-900 rounded"
          onClick={handleCancelButton}
        >
          {varianceSettings.readOnly ? "Back" : "Cancel"}
        </button>
        <Button
          label="Save"
          disabled={isButtonDisabled || varianceSettings.readOnly}
          onClick={() => setShowDialog(true)}
        />
      </div>

      <Dialog
        onHide={() => setShowDialog(false)}
        visible={showDialog}
        header="Variance configuration file name"
        style={{ width: "50vw", height: "30vw" }}
        footer={footerContent}
      >
        <div className="flex flex-col mt-5 space-y-2">
          <label>Enter a name for the configuration file</label>
          <InputText
            name="name"
            onChange={handleVarianceFileInformation}
            value={varianceFileInformation.name}
          />
        </div>
        <div className="flex flex-col mt-5 space-y-2">
          <label>Enter a short description</label>
          <InputTextarea
            name="description"
            onChange={handleVarianceFileInformation}
            value={varianceFileInformation.description}
          />
        </div>
        <br />
      </Dialog>
    </div>
  );
};
