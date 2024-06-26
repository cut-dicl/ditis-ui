import { useContext } from "react";
import { ConfFormContext } from "../hooks/useContext-hooks/conf-form-hook/conf-form-hook";

export const NextPreviousButtons = () => {
  const confFormCtx = useContext(ConfFormContext);

  return (
    <>
      {confFormCtx.activeIndex === 0 ? null : (
        <button
          className="bg-gray-100 shadow-md hover:bg-gray-400 hover:dark:bg-gray-600 text-black dark:text-white dark:bg-[#313e4f] font-bold py-2 px-4 border border-gray-900 rounded"
          onClick={() => confFormCtx.handlePreviousButton()}
        >
          <div className="flex justify-center items-center">
            <i className="pi pi-arrow-left" />
            <span className="px-1">{confFormCtx.previousStepName}</span>
          </div>
        </button>
      )}

      {confFormCtx.activeIndex === confFormCtx.maxIndex - 1 ? null : (
        <button
          className="bg-gray-100 shadow-md hover:bg-gray-400 hover:dark:bg-gray-600 text-black dark:text-white dark:bg-[#313e4f] font-bold py-2 px-4 border border-gray-900 rounded"
          onClick={() => confFormCtx.handleNextButton()}
        >
          <div className="flex justify-center items-center">
            <span className="px-1">{confFormCtx.nextStepName}</span>
            <i className="pi pi-arrow-right" />
          </div>
        </button>
      )}
    </>
  );
};
