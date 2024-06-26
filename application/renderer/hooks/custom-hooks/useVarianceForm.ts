import { useContext,useEffect,useState } from "react"
import {ipcRenderer} from "electron";
import { AppController } from "../useContext-hooks/appcontroller-hook/appcontroller-hook";
import { ConfFormContext } from "../useContext-hooks/conf-form-hook/conf-form-hook";
import Swal from "sweetalert2";

interface IUseVarianceFormProps {
    showForm:(val)=>void,
    varianceSettings:{
        confObject:[
            {
                key:string,
                value:string
            } 
        ],
        confId:number
    },
    setShowDialog:(val)=>void;
}

export const useVarianceForm = ({showForm,varianceSettings,setShowDialog}:IUseVarianceFormProps) =>{

    const [varianceOptionsCounter,setVarianceOptionsCounter] = useState([{id:1}])
    const [groupingCounter,setGroupingCounter] = useState([{id:1}])
    const [varianceFileInformation,setVarianceFileInformation] = useState({name:"",description:""})
    const [varianceFetchedItems,setVarianceFetchedItems] = useState([]);
    const confFormCtx = useContext(ConfFormContext)
    const app = useContext(AppController)

    useEffect(()=>{
        if(Object.keys(varianceSettings).length > 0){
            if(Object.entries(varianceSettings.confObject).length > 0){
                const optionsCounterArr = Object.entries(varianceSettings.confObject).map((item,index)=>{
                    if(item[1].key !== "grouping")
                        return {id:index+1}
                }).filter((item)=> item !== undefined)

                const groupingCounterArr = Object.entries(varianceSettings.confObject).map((item,index)=>{
                    if(item[1].key === "grouping")
                        return {id:index+1}
                }).filter((item)=> item !== undefined)

                confFormCtx.handleInitialUpdateState(varianceSettings.confObject)
                setVarianceOptionsCounter(optionsCounterArr)
                setGroupingCounter(groupingCounterArr)
            }
        }
    },[])

    const handleVarianceOption = (item:{key:string,value:string}) =>{
        //if its a class
        if(item.key.includes("class")){
            const leftGone = item.value.replace('[','')
            const valueString = leftGone.replace(']','')

            const inputObject = {
                value: valueString,
                header: item.key
            }
            confFormCtx.handleVarianceObject(inputObject)
        }else if(item.key === ("grouping")){
            const leftGone = item.value.replace('[','')
            const valueString = leftGone.replace(']','')

            const inputObject = {
                value: valueString,
                header: item.key
            }
            confFormCtx.handleVarianceObject(inputObject)
        }else if(item.value.includes('*')){
            //{2G:*2G:128G}
            const string = item.value.split(':')
            const start = string[0].replace('{','')
            const jump = string[1].replace('*','')
            const end = string[2].replace('}','')
            const inputObject = {
                start,
                jump,
                end,
                header:item.key,
                mode:"Multiplication",
                value:""
            }
            confFormCtx.handleVarianceObject(inputObject)
        }else if(item.value.includes('+')){
            const string = item.value.split(':')
            const start = string[0].replace('{','')
            const jump = string[1].replace('+','')
            const end = string[2].replace('}','')
            const inputObject = {
                start,
                jump,
                end,
                header:item.key,
                mode:"Addition",
                value:""
            }
            confFormCtx.handleVarianceObject(inputObject)
        }else{
            const leftGone = item.value.replace('[','')
            const valueString = leftGone.replace(']','')

            const inputObject = {
                value: valueString,
                header: item.key
            }
            confFormCtx.handleVarianceObject(inputObject)
        }
    }

    const handleFormSubmission = () =>{
        if(Object.keys(varianceSettings).length > 0){
            ipcRenderer.invoke("update-config-file",{confObject:confFormCtx.varianceObject, confName:varianceFileInformation.name,description:varianceFileInformation.description,confId:varianceSettings.confId,appMode:app.mode,type:"variance"}).then((result)=>{
                setShowDialog(false)
                handleSwalEvents(result)
            })
        }else{
            console.log("the correct one fot called")
            ipcRenderer.invoke("create-config-file",{confObject:confFormCtx.varianceObject,formType:"Variance",confName:varianceFileInformation.name,description:varianceFileInformation.description,mode:app.mode,type:"variance"}).then((result)=>{
                setShowDialog(false)
                handleSwalEvents(result)
            })
        }
    }

    const handleSwalEvents = (result) => {
        if (result.code === 200) {
          Swal.fire({
            icon: "success",
            title: result.message,
            timer: 1500,
            color: document.documentElement.className.includes("dark") ? "white" : "",
            background:
              document.documentElement.className.includes("dark") ? "#1f2937" : "",
            showConfirmButton: false,
          }).then(() => {
            confFormCtx.handleConfTabIndex(2)
            showForm("none");
          });
        } else {
          Swal.fire({
            icon: "error",
            title: result.message,
            color: document.documentElement.className.includes("dark") ? "white" : "",
            background:
              document.documentElement.className.includes("dark") ? "#1f2937" : "",
            showConfirmButton: true,
          });
        }
      };

    const handleVarianceAdd = () =>{
        if(Object.keys(varianceSettings).length > 0){
            const combinedArray = [...varianceOptionsCounter,...groupingCounter]
            const maxId = combinedArray.reduce((max, obj) => obj.id > max ? obj.id : max, -Infinity);
            setVarianceOptionsCounter((prev)=>{
                return [...prev,{id:maxId+1}]
            })
            return;
        }
        const {id} = varianceOptionsCounter[varianceOptionsCounter.length-1]
        setVarianceOptionsCounter((prev)=>{
            return [...prev,{id:id+1}]
        })
    }

    const handleGroupingAdd = () =>{
        if(Object.keys(varianceSettings).length > 0){
            const combinedArray = [...varianceOptionsCounter,...groupingCounter]
            const maxId = combinedArray.reduce((max, obj) => obj.id > max ? obj.id : max, -Infinity);
            setGroupingCounter((prev)=>{
                return [...prev,{id:maxId+1}]
            })
            return;
        }
        const {id} = groupingCounter[groupingCounter.length-1]
        setGroupingCounter((prev)=>{
            return [...prev,{id:id+1}]
        })
    }

    const removeVarianceOption = (id) =>{
        if(varianceOptionsCounter.length === 1){
            return
        }
        const reference = varianceOptionsCounter.filter((item)=>item.id !== id);
        setVarianceOptionsCounter(reference)
    }

    const removeGroupingOption = (id) =>{
        if(groupingCounter.length === 1){
            return
        }
        const reference = groupingCounter.filter((item)=>item.id !== id);
        setGroupingCounter(reference)
    }

    const handleVarianceFileInformation = (event) =>{
        setVarianceFileInformation((prev)=>{
            return {...prev,[event.target.name]:event.target.value}
        })
    }


    return {
        varianceOptionsCounter,
        groupingCounter,
        varianceFileInformation,
        varianceFetchedItems,
        handleFormSubmission,
        handleVarianceAdd,
        handleGroupingAdd,
        removeVarianceOption,
        removeGroupingOption,
        handleVarianceFileInformation,
    }
}