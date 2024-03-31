import { useContext,useEffect,useState } from "react"
import { VarianceFormContext } from "../useContext-hooks/variance-form-hook/variance-form-hook"
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
    const VarFormCtx = useContext(VarianceFormContext)
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

                VarFormCtx.handleInitialUpdateState(varianceSettings.confObject)
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
            VarFormCtx.handleVarianceObject(inputObject)
        }else if(item.key === ("grouping")){
            const leftGone = item.value.replace('[','')
            const valueString = leftGone.replace(']','')

            const inputObject = {
                value: valueString,
                header: item.key
            }
            VarFormCtx.handleVarianceObject(inputObject)
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
            VarFormCtx.handleVarianceObject(inputObject)
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
            VarFormCtx.handleVarianceObject(inputObject)
        }else{
            const leftGone = item.value.replace('[','')
            const valueString = leftGone.replace(']','')

            const inputObject = {
                value: valueString,
                header: item.key
            }
            VarFormCtx.handleVarianceObject(inputObject)
        }
    }

    const handleFormSubmission = () =>{
        if(Object.keys(varianceSettings).length > 0){
            console.log("this got called")
            ipcRenderer.invoke("update-config-file",{confObject:VarFormCtx.varianceObject, confName:varianceFileInformation.name,description:varianceFileInformation.description,confId:varianceSettings.confId,appMode:app.mode,type:"variance"}).then((result)=>{
                setShowDialog(false)
                handleSwalEvents(result)
            })
        }else{
            console.log("the correct one fot called")
            ipcRenderer.invoke("create-config-file",{confObject:VarFormCtx.varianceObject,formType:"Variance",confName:varianceFileInformation.name,description:varianceFileInformation.description,mode:app.mode,type:"variance"}).then((result)=>{
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
            color: document.documentElement.className == "dark" ? "white" : "",
            background:
              document.documentElement.className == "dark" ? "#1f2937" : "",
            showConfirmButton: false,
          }).then(() => {
            confFormCtx.handleConfTabIndex(2)
            showForm("none");
          });
        } else {
          Swal.fire({
            icon: "error",
            title: result.message,
            color: document.documentElement.className == "dark" ? "white" : "",
            background:
              document.documentElement.className == "dark" ? "#1f2937" : "",
            showConfirmButton: true,
          });
        }
      };

    const handleVarianceAdd = () =>{
        const {id} = varianceOptionsCounter[varianceOptionsCounter.length-1]
        setVarianceOptionsCounter((prev)=>{
            return [...prev,{id:id+1}]
        })
    }

    const handleGroupingAdd = () =>{
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