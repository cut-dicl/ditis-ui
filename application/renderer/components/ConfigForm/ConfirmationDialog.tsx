import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import React, { useContext, useState } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { ipcRenderer } from "electron";
import Swal from "sweetalert2";

import { ConfFormContext } from "../../hooks/useContext-hooks/conf-form-hook/conf-form-hook";
import classes from "./confdialog.module.css";
import { IConfigurationFormProps } from "./ConfigurationForm";
import { fileEvent, showSwalWithTimer } from "../../utils/SwalFunctions";
import { AppController } from "../../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook";

interface IConfigurationDialogProps extends IConfigurationFormProps {
  readOnly: boolean;
}

export const ConfirmationDialog = (props: IConfigurationDialogProps) => {
  const {
    showForm,
    confSettings: { confId, mode, fileDescription, fileName, formType },
    readOnly,
    optimizerView,
  } = props;

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const confFormCtx = useContext(ConfFormContext);
  const app = useContext(AppController);

  const handleConfigFileCreation = (event) => {
    ipcRenderer
      .invoke("create-config-file", {
        confObject: confFormCtx.configurationObject,
        confName: name,
        description,
        formType: formType === "simulator" ? "Storage" : "Optimizer",
        type: "simulator",
      })
      .then((result) => {
        handleSwalEvents(result);
      });
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("saveButton").click();
    }
  };

  const handleConfigFileUpdate = () => {
    ipcRenderer
      .invoke("update-config-file", {
        confObject: confFormCtx.configurationObject,
        confName: name,
        description,
        confId,
        type: "simulator",
      })
      .then((result) => {
        handleSwalEvents(result);
      });
  };

  const handleUpdatedDialogContents = () => {
    console.log("this got called");
    setName(fileName);
    setDescription(fileDescription);
    setShowDialog(true);
  };

  const handleSwalEvents = (result) => {
    console.log(document.documentElement.className);
    if (result.code === 200) {
      Swal.fire({
        icon: "success",
        title: result.message,
        timer: 1000,
        color: document.documentElement.className.includes("dark")
          ? "white"
          : "",
        target: document.getElementById("save-config-dialog"),
        background: document.documentElement.className.includes("dark")
          ? "#1f2937"
          : "",
        showConfirmButton: false,
      }).then(() => {
        confFormCtx.handleConfTabIndex(formType === "simulator" ? 0 : 1);
        showForm("none");
        setShowDialog(false);
      });
    } else {
      Swal.fire({
        icon: "error",
        title: result.message,
        color: document.documentElement.className.includes("dark")
          ? "white"
          : "",
        target: document.getElementById("save-config-dialog"),
        background: document.documentElement.className.includes("dark")
          ? "#1f2937"
          : "",
        showConfirmButton: true,
      });
    }
  };

  const footerContent: React.JSX.Element = (
    <Button
      severity="secondary"
      onClick={mode ? handleConfigFileCreation : handleConfigFileUpdate}
      disabled={name.length === 0}
      id="saveButton"
      className="bg-gray-100 shadow-md hover:bg-gray-400 hover:dark:bg-gray-600 text-black dark:text-white dark:bg-[#313e4f] font-bold py-2 px-4 border border-gray-900 rounded"
    >
      {mode ? "Create configuration file" : "Save Changes"}
    </Button>
  );

  return (
    <>
      <button
        className={`bg-gray-100 shadow-md hover:bg-gray-400 hover:dark:bg-gray-600 text-black dark:text-white dark:bg-[#313e4f] font-bold py-2 px-4 border border-gray-900 rounded ${
          readOnly && !optimizerView
            ? " text-gray-500 cursor-not-allowed"
            : " hover:bg-gray-400 hover:dark:bg-gray-600"
        }`}
        onClick={() =>
          mode === 1 ? setShowDialog(true) : handleUpdatedDialogContents()
        }
        disabled={readOnly && !optimizerView}
      >
        <div className="flex justify-center items-center">
          <span className="px-1">Save</span>
        </div>
      </button>

      <Dialog
        onHide={() => setShowDialog(false)}
        visible={showDialog}
        header="Configuration file name"
        footer={footerContent}
        id="save-config-dialog"
        style={{ width: "50vw", height: "30vw" }}
      >
        <div className="flex flex-col mt-5 space-y-2">
          <label>Enter a name for the configuration file</label>
          <InputText
            onChange={(event) => setName(event.target.value)}
            value={name}
            onKeyDown={handleKeyPress}
          />
        </div>
        <div className="flex flex-col mt-5 space-y-2">
          <label>Enter a short description</label>
          <InputTextarea
            onChange={(event) => setDescription(event.target.value)}
            value={description}
          />
        </div>
        <br />
      </Dialog>
    </>
  );
};
