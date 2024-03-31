import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import React, { useContext, useState } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { ipcRenderer } from "electron";
import Swal from "sweetalert2";

import { ConfFormContext } from "../../hooks/useContext-hooks/conf-form-hook/conf-form-hook";
import { NextPreviousButtonContext } from "../../hooks/useContext-hooks/next-previous-buttons-hook/next-previous-buttons-hook";
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

  const handleConfigFileCreation = () => {
    ipcRenderer
      .invoke("create-config-file", {
        confObject: confFormCtx.configurationObject,
        confName: name,
        description,
        formType: formType === "simulator" ? "Storage" : "Optimizer",
        mode: app.mode,
        type: "simulator",
        auth: app.onlineServer.auth,
        address: app.onlineServer.address,
      })
      .then((result) => {
        console.log(result);
        handleSwalEvents(result);
      });
  };

  const handleConfigFileUpdate = () => {
    ipcRenderer
      .invoke("update-config-file", {
        confObject: confFormCtx.configurationObject,
        confName: name,
        description,
        confId,
        appMode: app.mode,
        type: "simulator",
        auth: app.onlineServer.auth,
        address: app.onlineServer.address,
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
    if (result.code === 200) {
      Swal.fire({
        icon: "success",
        title: result.message,
        timer: 1000,
        color: document.documentElement.className == "dark" ? "white" : "",
        target: document.getElementById("save-config-dialog"),
        background:
          document.documentElement.className == "dark" ? "#1f2937" : "",
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
        color: document.documentElement.className == "dark" ? "white" : "",
        target: document.getElementById("save-config-dialog"),
        background:
          document.documentElement.className == "dark" ? "#1f2937" : "",
        showConfirmButton: true,
      });
    }
  };

  const footerContent: React.JSX.Element = (
    <Button
      severity="secondary"
      onClick={mode ? handleConfigFileCreation : handleConfigFileUpdate}
      disabled={name.length === 0}
    >
      {mode ? "Create configuration file" : "Save Changes"}
    </Button>
  );

  return (
    <>
      <button
        className={`shadow-md text-black font-bold py-2 px-4 border rounded border-gray-900 ${
          readOnly && !optimizerView
            ? "bg-gray-800 text-gray-500 cursor-not-allowed"
            : "bg-gray-100 hover:bg-gray-400 hover:dark:bg-gray-600"
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
