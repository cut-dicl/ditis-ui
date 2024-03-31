import {useState} from "react";
import {NextPreviousButtonContext} from "./next-previous-buttons-hook";

export const NextPreviousButtonContextProvider = ({children}) => {

    const [activeIndex, setActiveIndex] = useState<number>(0)
    const [stepNamesKeys, setStepNames] = useState<string[]>([])
    const [previousStepName, setPreviousStepName] = useState<string>("")
    const [nextStepName, setNextStepName] = useState<string>("")
    const [maxIndex, setMaxIndex] = useState<number>(0)


    const handlePreviousButton = (): void => {
        if (activeIndex === 0) {
            return
        }

        setActiveIndex((prev: number) => {
            if (prev - 2 >= 0) {
                setPreviousStepName(stepNamesKeys[prev - 2])
            }
            setNextStepName(stepNamesKeys[prev])

            return prev - 1
        })
    }

    const handleNextButton = (): void => {
        if (activeIndex === maxIndex) {
            return
        }
        setActiveIndex((prev: number) => {
            if (prev + 2 <= maxIndex) {
                setPreviousStepName(stepNamesKeys[prev])
                setNextStepName(stepNamesKeys[prev + 2])
            }

            return prev + 1
        })
    }

    const handleSelect = (index):void =>{
        setActiveIndex(index);
        setPreviousStepName(stepNamesKeys[index-1])
        setNextStepName(stepNamesKeys[index+1])
    }

    const resetIndexStates = () => {
        setActiveIndex(0)
        setMaxIndex(0)
    }

    return (
        <NextPreviousButtonContext.Provider value={{
            activeIndex,
            handleSelect,
            handlePreviousButton,
            handleNextButton,
            previousStepName,
            nextStepName,
            setNextStepName,
            setStepNames,
            maxIndex,
            setMaxIndex,
            resetIndexStates
        }}>
            {children}
        </NextPreviousButtonContext.Provider>
    )

}

interface nextPreviousButtonDefaultType {
    activeIndex: number,
    handleSelect:(param:number)=>void,
    handlePreviousButton: () => void,
    handleNextButton: () => void,
    previousStepName: string,
    nextStepName: string,
    setNextStepName: (param: string) => void
    setStepNames: (keys: string[]) => void
    maxIndex: number,
    setMaxIndex: (param: number) => void,
    resetIndexStates: () => void
}

export const nextPreviousButtonDefaultBehavior: nextPreviousButtonDefaultType = {
    activeIndex: 0,
    handleSelect:():void=>{},
    handlePreviousButton: (): void => {},
    handleNextButton: (): void => {},
    previousStepName: "",
    nextStepName: "",
    setNextStepName: (): void => {},
    setStepNames: (): void => {},
    maxIndex: 0,
    setMaxIndex: (): void => {},
    resetIndexStates: () => {}
}
