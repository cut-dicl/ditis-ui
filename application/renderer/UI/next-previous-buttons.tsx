import {useContext} from "react";
import {
    NextPreviousButtonContext
} from "../hooks/useContext-hooks/next-previous-buttons-hook/next-previous-buttons-hook";

export const NextPreviousButtons = () => {
    const nextPrevBtnCtx = useContext(NextPreviousButtonContext);

    return (
        <>
            {nextPrevBtnCtx.activeIndex === 0 ? null : (
                <button
                    className="bg-gray-100 shadow-md hover:bg-gray-400 hover:dark:bg-gray-600 text-black dark:text-white dark:bg-[#313e4f] font-bold py-2 px-4 border border-gray-900 rounded"
                    onClick={() => nextPrevBtnCtx.handlePreviousButton()}
                >
                    <div className="flex justify-center items-center">
                        <i className="pi pi-arrow-left"/>
                        <span className="px-1">{nextPrevBtnCtx.previousStepName}</span>
                    </div>
                </button>
            )}

            {nextPrevBtnCtx.activeIndex === nextPrevBtnCtx.maxIndex - 1 ? null : (<button
                    className="bg-gray-100 shadow-md hover:bg-gray-400 hover:dark:bg-gray-600 text-black dark:text-white dark:bg-[#313e4f] font-bold py-2 px-4 border border-gray-900 rounded"
                    onClick={() => nextPrevBtnCtx.handleNextButton()}
                >
                    <div className="flex justify-center items-center">
                        <span className="px-1">{nextPrevBtnCtx.nextStepName}</span>
                        <i className="pi pi-arrow-right"/>
                    </div>
                </button>
            )}
        </>
    );
};
