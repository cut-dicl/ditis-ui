import React, { useContext, useEffect, useState } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import { ConfigurationObjectType } from "../../../hooks/useContext-hooks/conf-form-hook/conf-form-hook-provider";
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import { Divider } from "primereact/divider";
import { VarianceOptions } from "./VarianceOptions";
import { Button } from "primereact/button";
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
import { ConfFormContext } from "../../../hooks/useContext-hooks/conf-form-hook/conf-form-hook";

interface IVarianceForm {
  showForm: React.Dispatch<React.SetStateAction<configurationContentShown>>;
  varianceSettings: any;
  resetVarianceSettings: () => void;
}

export const VarianceForm = ({
  showForm,
  varianceSettings,
  resetVarianceSettings,
}: IVarianceForm) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showDialog, setShowDialog] = useState(false);
  const VarFormCtx = useContext(ConfFormContext);
  const appmode = useContext(AppController);
  const [saveDisabled, setSaveDisabled] = useState(false);

  const {
    varianceObject,
    varianceFileInformation,
    editVarianceParameter,
    editVarianceGrouping,
    deleteVarianceParameter,
    handleFormSubmission,
    handleVarianceAdd,
    handleGroupingAdd,
    removeGroupingOption,
    handleVarianceFileInformation,
  } = useVarianceForm({
    showForm,
    varianceSettings,
    setShowDialog,
    resetVarianceSettings,
  });

  useEffect(() => {
    window.ipc
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
                  label: item.key.trim(),
                  value: item.key.trim(),
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
      color: document.documentElement.className.includes("dark") ? "white" : "",
      background: document.documentElement.className.includes("dark")
        ? "#1f2937"
        : "",
      showDenyButton: true,
      showConfirmButton: true,
      confirmButtonText: "Yes",
      confirmButtonColor: "#50C878",
      denyButtonText: `Cancel`,
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        VarFormCtx.resetVarianceObject();
        resetVarianceSettings();
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
    <Button
      severity="secondary"
      onClick={() => {
        try {
          handleFormSubmission();
        } catch (e) {
          Swal.fire({
            icon: "warning",
            title: "Invalid Configuration",
            html:
              e.message === "1"
                ? `<b>One or more parameters are invalid.</b> <br/> 
            (e.g. a parameter has an empty value or a category was selected but without a parameter)<br/><br/> 
            Ignoring will save the configuration without the invalid parameters.<br/>
            <i>Note: If the parameter is in a group, it will be removed from the grouping.</i>`
                : `<b>One or more groupings are invalid.</b> <br/>
            (e.g. a grouping was left empty)
            <br/><br/>
            Ignoring will save the configuration without the invalid groupings.`,
            color: document.documentElement.className.includes("dark")
              ? "white"
              : "",
            background: document.documentElement.className.includes("dark")
              ? "#1f2937"
              : "",
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: "Ignore",
            confirmButtonColor: "#f59542",
            reverseButtons: true,
          }).then((result) => {
            if (result.isConfirmed) handleFormSubmission(true);
          });
        }
      }}
      disabled={varianceFileInformation.name.length === 0}
    >
      Save
    </Button>
  );

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="h-full overflow-auto">
        <h1 className="text-4xl">Parameter Space Variance</h1>
        <Divider />
        <h1 className="text-4xl mb-5">Specify parameter domains</h1>

        {Object.keys(varianceObject.parameters).map((key, index) => {
          return (
            <VarianceOptions
              key={index}
              id={index}
              varianceSettings={varianceSettings}
              editVarianceParameter={editVarianceParameter}
              deleteVarianceParameter={deleteVarianceParameter}
              varianceObject={varianceObject}
              saveDisabled={saveDisabled}
              setSaveDisabled={setSaveDisabled}
            />
          );
        })}
        <Button
          text
          className="hover:!bg-slate-300"
          style={{
            color: document.documentElement.className.includes("dark")
              ? "white"
              : "black",
            marginTop: "10px",
            marginBottom: "20px",
            marginLeft: "5px",
          }}
          label="Add"
          icon="pi pi-plus"
          onClick={handleVarianceAdd}
          disabled={varianceSettings.readOnly}
        />

        <h1 className="text-4xl mb-5">Specify parameter groupings</h1>
        {varianceObject.groupings.map((item, index) => {
          return (
            <GroupingOptions
              key={index}
              id={index}
              remove={removeGroupingOption}
              varianceSettings={varianceSettings}
              varianceObject={varianceObject}
              editVarianceGrouping={editVarianceGrouping}
            />
          );
        })}
        <Button
          text
          style={{
            color: document.documentElement.className.includes("dark")
              ? "white"
              : "black",
            marginTop: "10px",
            marginBottom: "20px",
            marginLeft: "5px",
          }}
          className="hover:!bg-slate-300"
          label="Add"
          icon="pi pi-plus"
          onClick={handleGroupingAdd}
          disabled={varianceSettings.readOnly}
        />
        <Divider />
      </div>
      <Divider />
      <div className="flex justify-center space-x-8">
        <button
          className="bg-gray-100 shadow-md hover:bg-gray-400 hover:dark:bg-gray-600 text-black dark:text-white dark:bg-[#313e4f] font-bold py-2 px-4 border border-gray-900 rounded"
          onClick={
            varianceSettings.readOnly
              ? () => showForm("none")
              : () => handleCancelButton()
          }
        >
          {varianceSettings.readOnly ? "Back" : "Cancel"}
        </button>
        <Button
          className="bg-gray-100 shadow-md hover:bg-gray-400 hover:dark:bg-gray-600 text-black dark:text-white dark:bg-[#313e4f] font-bold py-2 px-4 border border-gray-900 rounded"
          label="Save"
          disabled={
            varianceObject.parameters.length === 0 ||
            varianceSettings.readOnly ||
            saveDisabled
          }
          tooltip={"Save Configuration"}
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
