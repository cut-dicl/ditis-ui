import { useContext,useEffect,useState } from "react";
import { AppController } from "../useContext-hooks/appcontroller-hook/appcontroller-hook";
import { ConfFormContext } from "../useContext-hooks/conf-form-hook/conf-form-hook";
import Swal from "sweetalert2";

interface IUseVarianceFormProps {
    showForm:(val)=>void,
    varianceSettings:{
        confObject:IVarianceObject,
        confId:number
    },
    setShowDialog: (val) => void;
    resetVarianceSettings: () => void;
}

interface IVarianceObject {
    parameters: any[],
    groupings: any[]
}

interface varianceObject {
    id: number,
    param?: string,
    layer?: string,
    value?: any,
    type?: string,
    domain?: string
    disabled?: boolean
}

export const useVarianceForm = ({ showForm, varianceSettings, setShowDialog, resetVarianceSettings }: IUseVarianceFormProps) => {
    
    const confFormCtx = useContext(ConfFormContext);

    
    const handleVarianceOption = (item:{key:string,value:string}) =>{
        let properties  ={};
        //if its a class
        if(!item.key || !item.value){
            return;
        }
        if(item.key.includes("class")){
            const leftGone = item.value.replace('[','')
            const valueString = leftGone.replace(']','').replace(/ /g, "").replace("\r", "")

            // const inputObject = {
            //     value: valueString,
            //     header: item.key
            // }
            //confFormCtx.handleVarianceObject(inputObject)
            properties["type"] = "class"
            properties["domain"] = "";
            properties["value"] = valueString;
        }else if(item.key === ("grouping")){
            const leftGone = item.value.replace('[','')
            const valueString = leftGone.replace(']','').replace(/ /g, "").replace("\r", "")

            // const inputObject = {
            //     value: valueString,
            //     header: item.key
            // }
            //confFormCtx.handleVarianceObject(inputObject)
            properties["type"] = "grouping";
            properties["value"] = valueString;
        }else if(item.value.includes('*')){
            //{2G:*2G:128G}
            const string = item.value.replace("\r", "").split(':')
            const start = string[0].replace('{','')
            const jump = string[1].replace('*','')
            const end = string[2].replace('}','')
            // const inputObject = {
            //     start,
            //     jump,
            //     end,
            //     header:item.key,
            //     mode:"Multiplication",
            //     value:""
            // }
            //confFormCtx.handleVarianceObject(inputObject)
            properties["type"] = "number";
            properties["domain"] = "Multiplication";
            properties["value"] = {start,jump,end}
        }else if(item.value.includes('+')){
            const string = item.value.replace("\r", "").split(':')
            const start = string[0].replace('{','')
            const jump = string[1].replace('+','')
            const end = string[2].replace('}','')
            // const inputObject = {
            //     start,
            //     jump,
            //     end,
            //     header:item.key,
            //     mode:"Addition",
            //     value:""
            // }
            //confFormCtx.handleVarianceObject(inputObject)
            
            properties["type"] = "number";
            properties["domain"] = "Addition";
            properties["value"] = {start,jump,end}
        }else{
            const leftGone = item.value.replace('[','')
            const valueString = leftGone.replace(']','').replace("\r", "")

            //confFormCtx.handleVarianceObject(inputObject)
            
            properties["type"] = "number";
            properties["domain"] = "List";
            properties["value"] = valueString
        }
        return properties;
    }

    const convertSettings = () => {
        //console.log(varianceSettings.confObject);

        let parameters = [];
        let groupings = [];

        varianceSettings.confObject &&
        Object.entries(varianceSettings.confObject).map((item) => {            
            let properties:any = handleVarianceOption(item[1]);
            if(!properties){
                return;
            }
            if (item[1].key !== "grouping") {
                parameters.push({
                    layer: "",
                    parameter: item[1].key,
                    value: properties.value ?? item[1].value,
                    type: properties? properties.type : "",
                    domain: properties? properties.domain : "",
                    disabled: false
                });
            } else {
                //push string of array 
                let val = properties.value;
                groupings.push(val.split(','));
            }
        });
        if (parameters.length > 0) {
            parameters = parameters.map((item) => {
                if (groupings.some((group) => group.includes(item.parameter))) {
                    return { ...item, disabled: true };
                }
                return { ...item, disabled: false };
            });
        }

        if (parameters.length === 0) {
            parameters = [{ layer: "", parameter: "", value: "", type: "", domain: "", disabled: false }];
        }

        return {
            parameters,
            groupings
        }
    }

    const [varianceObject, setVarianceObject] = useState<IVarianceObject>(convertSettings());
    const [varianceFileInformation,setVarianceFileInformation] = useState({name:"",description:""})
    const app = useContext(AppController)

    useEffect(() => {
        if (Object.keys(varianceSettings).length > 0) {
            if (Object.entries(varianceSettings.confObject).length > 0) {
                confFormCtx.handleInitialUpdateState(varianceSettings.confObject);
            }
        }

        return () => {
            resetVarianceForm();
        }

    }, []);

    
    const editVarianceParameter = ({ id, param, value, type, domain, layer, disabled }: varianceObject) => {
        setVarianceObject((prev) => {
            let newParams = prev.parameters.map((item, index) => {
                if (index === id) {
                    return {
                        ...item,
                        parameter: param ?? item.parameter,
                        value: value ?? item.value,
                        type: type ?? item.type,
                        domain: domain ?? item.domain,
                        layer: layer ?? item.layer,
                        disabled: disabled ?? item.disabled
                    };
                }
                return item;
            });

            let newGroups = prev.groupings.map(grouping => 
                grouping.filter(item => 
                    // Check if the item exists in the parameters array
                    newParams.some(param => param.parameter === item)
                )
            )

            return { 
                parameters: newParams,                    
                groupings: newGroups
             };
        });
    }

    const deleteVarianceParameter = (id, param) => {
        const updatedParams = varianceObject.parameters.filter((item, index) => {
            return index !== id && item.parameter !== param;
        });

        //check if the paramater exists in any of the groupings and if so remove just that
        const updatedGrouping = varianceObject.groupings.map((item) => {
            if (item.includes(varianceObject.parameters[id].parameter)) {
                return item.filter((group) => group !== varianceObject.parameters[id].parameter);
            }
            return item;
        });


        setVarianceObject({
                parameters: updatedParams,
                groupings: updatedGrouping
            
        });
    }

    const editVarianceGrouping = (id, group) => {
        const updatedGrouping = varianceObject.groupings.map((item, index) => {
            if (index === id) {
                return group;
            }
            return item;
        });

        const updatedParams = varianceObject.parameters.map((item) => {
            //check if item.parameter exists in the updatedGrouping array of arrays
            if (updatedGrouping.some((group) => group.includes(item.parameter))) {
                return { ...item, disabled: true };
            }
            return { ...item, disabled: false };
        });

        setVarianceObject((prev) => {
            //go through all the param and enable disabled in parameters

            return {
                parameters: updatedParams,
                groupings: updatedGrouping
            };
        });
    }
    
    const resetVarianceForm = () => {
        resetVarianceSettings();
        setVarianceFileInformation({name:"",description:""});
    }

    const handleFormSubmission = (force?) =>{
        let varobj=[];
        varianceObject.parameters.map((item)=>{
            let val = item.value;
            
            if (!item.value || !item.parameter || (Array.isArray(item.value) && item.value.length === 0)) {
                if (!force) {
                    setShowDialog(false);
                    throw new Error("1");
                }
            } else if (item.type === "number" && ( item.domain==="Multiplication" || item.domain==="Addition" ) && (item.value.start === "" || item.value.jump === "" || item.value.end === "")) {
                if (!force) {
                    setShowDialog(false);
                    throw new Error("1");
                }
            } else {
                if(item.type === "number"){
                    if(item.domain === "List"){
                        val = `[${val}]`
                    } else {
                    val = `{${val.start}:${item.domain
                        .replace("Multiplication", "*")
                        .replace("Addition", "+")
                    }${val.jump}:${val.end}}`
                    }
                } else if (item.type === "class") {
                    if (!val.includes("[")) 
                        val = `[${val}]`
                }
                varobj.push({key:item.parameter,value:val.toString()})
            }
        });

        varianceObject.groupings.forEach((item)=>{
            if (item.length === 0) {
                if (!force) {
                    setShowDialog(false);
                    throw new Error("2");
                }
            } else {
                //Check if items are in the parameters
                let group = item.map((group, index) => {
                    if (!varobj.some((param) => param.key === group)) {
                        console.log(index);
                        if (force) {
                            //remove item from groupings without mutating
                            return
                        }
                    } else {
                        return group;
                    }
                });

                group = group.filter((item) => item !== undefined );
                varobj.push({ key: "grouping", value: `[${group.toString()}]` });
            }
        });

        if (Object.keys(varianceSettings).length > 0) {
            window.ipc.invoke("update-config-file",{confObject:{ variance:varobj}, confName:varianceFileInformation.name,description:varianceFileInformation.description,confId:varianceSettings.confId,appMode:app.mode,type:"variance"}).then((result)=>{
                setShowDialog(false)
                handleSwalEvents(result)
                resetVarianceForm()
            })
        }else{
            window.ipc.invoke("create-config-file",{confObject:{ variance:varobj},formType:"Variance",confName:varianceFileInformation.name,description:varianceFileInformation.description,mode:app.mode,type:"variance"}).then((result)=>{
                setShowDialog(false)
                handleSwalEvents(result);
                resetVarianceForm()
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

    const handleVarianceAdd = () => {
        // if(Object.keys(varianceSettings).length > 0){
        //     const combinedArray = [...varianceOptionsCounter,...groupingCounter]
        //     const maxId = combinedArray.reduce((max, obj) => obj.id > max ? obj.id : max, -Infinity);
        //     setVarianceOptionsCounter((prev)=>{
        //         return [...prev,{id:maxId+1}]
        //     })
        //     return;
        // }
        // const {id} = varianceOptionsCounter[varianceOptionsCounter.length-1]
        // setVarianceOptionsCounter((prev)=>{
        //     return [...prev,{id:id+1}]
        // })
        setVarianceObject((prev) => {
            return {
                ...prev,
                parameters: [...prev.parameters, { layer: "", parameter: "", value: "", type: "", domain: "", disabled: false}],
            };
    });
    }

    const handleGroupingAdd = () => {
        // if(Object.keys(varianceSettings).length > 0){
        //     const combinedArray = [...varianceOptionsCounter,...groupingCounter]
        //     const maxId = combinedArray.reduce((max, obj) => obj.id > max ? obj.id : max, -Infinity);
        //     setGroupingCounter((prev)=>{
        //         return [...prev,{id:maxId+1}]
        //     })
        //     return;
        // }
        // const {id} = groupingCounter[groupingCounter.length-1]
        // setGroupingCounter((prev)=>{
        //     return [...prev,{id:id+1}]
        // })
        setVarianceObject((prev) => {
            return {
                ...prev,
                groupings: [...prev.groupings, []],
            };
        });
    }

    const removeGroupingOption = (id) =>{
        // if(groupingCounter.length === 1){
        //     setGroupingCounter([])
        // }
        // const reference = groupingCounter.filter((item) => item.id !== id);
        // console.log(reference)
        // setGroupingCounter(reference)
        setVarianceObject((prev) => {
            return {
                ...prev,
                groupings: prev.groupings.filter((item, index) => index !== id),
            };
        });
    }

    const handleVarianceFileInformation = (event) =>{
        setVarianceFileInformation((prev)=>{
            return {...prev,[event.target.name]:event.target.value}
        })
    }


    return {
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
    }
}