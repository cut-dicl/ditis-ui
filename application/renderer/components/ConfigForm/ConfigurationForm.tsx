import { Steps } from "primereact/steps";
import { ProgressSpinner } from "primereact/progressspinner";
import React, { useContext } from "react";

import { NextPreviousButtons } from "../../UI/next-previous-buttons";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { FormInput } from "./FormInput";
import { useConfForm } from "../../hooks/custom-hooks/useConfForm";
import { ConfFormContext } from "../../hooks/useContext-hooks/conf-form-hook/conf-form-hook";
import { NextPreviousButtonContext } from "../../hooks/useContext-hooks/next-previous-buttons-hook/next-previous-buttons-hook";
import {
  configurationContentShown,
  IConfSettings,
} from "../../pages/configurations";
import { Tooltip } from "primereact/tooltip";
import Swal from "sweetalert2";

export interface IConfigurationFormProps {
  confSettings: IConfSettings;
  showForm?: React.Dispatch<React.SetStateAction<configurationContentShown>>;
  showBackButton?: boolean;
  optimizerView?: boolean;
}

const ConfigurationForm = ({
  confSettings,
  showForm,
  showBackButton = true,
  optimizerView = false,
}: IConfigurationFormProps) => {
  const { isLoading, longNames } = useConfForm(confSettings);

  const confFormCtx = useContext(ConfFormContext);
  const nextPrevCtx = useContext(NextPreviousButtonContext);

  if (isLoading) {
    // @ts-ignore
    return (
      <div style={{ textAlign: "center", padding: "25% 0" }}>
        <ProgressSpinner />
        <h1>Loading Form...</h1>
      </div>
    );
  }

  const stepsModel = Object.keys(confFormCtx.configurationObject).map(
    (item, index) => {
      return {
        label: item,
        className: `step-${index}`,
        tooltipContent: longNames[index],
      };
    }
  );

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
      console.log(result);
      if (result.isConfirmed) showForm("none");
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="h-full overflow-auto">
        {stepsModel.map((item, index) => {
          return (
            <Tooltip
              key={index}
              target={`.${item.className}`}
              content={item.tooltipContent}
              position="bottom"
            />
          );
        })}
        <Steps
          onSelect={(e) => nextPrevCtx.handleSelect(e.index)}
          model={stepsModel}
          activeIndex={nextPrevCtx.activeIndex}
          readOnly={false}
        />
        <FormInput
          readOnly={confSettings.readOnly ? confSettings.readOnly : false}
        />
      </div>
      <div className="inline-flex space-x-8 mt-10 justify-center">
        {showBackButton ? (
          <button
            className="bg-gray-100 shadow-md hover:bg-gray-400 hover:dark:bg-gray-600 text-black dark:text-white dark:bg-[#313e4f] font-bold py-2 px-4 border border-gray-900 rounded"
            onClick={handleCancelButton}
          >
            Cancel
          </button>
        ) : (
          <></>
        )}

        <NextPreviousButtons />
        <ConfirmationDialog
          confSettings={confSettings}
          showForm={showForm}
          readOnly={confSettings.readOnly}
          optimizerView={optimizerView}
        />
      </div>
    </div>
  );
};

export default ConfigurationForm;
