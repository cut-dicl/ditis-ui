import Swal, {SweetAlertResult} from "sweetalert2";

export enum fileEvent {
    Update = "updated",
    Created = "created",
    Deleted = "deleted"
}

type fileType = "confirmation" | "trace";

export const showConfirmationSwal = async (title:string = ""):Promise<SweetAlertResult<any>> =>{

    return await Swal.fire({
        icon: "question",
        title: `Are you sure you want to delete this ${title} file`,
        color: document.documentElement.className.includes("dark") ? "white" : "",
        background: document.documentElement.className.includes("dark") ? "#1f2937" : "",
        showDenyButton: true,
        showConfirmButton: true,
        confirmButtonText: 'Yes',
        confirmButtonColor: "#50C878",
        denyButtonText: `Cancel`,
        reverseButtons:true
    })
}

export const showSwalWithTimer = async (title:fileType,event:fileEvent):Promise<SweetAlertResult<any>> =>{

    return await Swal.fire({
        icon:"success",
        timer:2000,
        color: document.documentElement.className.includes("dark") ? "white" : "",
        background: document.documentElement.className.includes("dark") ? "#1f2937" : "",
        title:`${title.charAt(0).toUpperCase() + title.slice(1)} file has been ${event} successfully`
    })
}

export const showSwalWithTimerAndMessage = async (title:string,message:string, icon:any, timer: number):Promise<SweetAlertResult<any>> =>{
    return await Swal.fire({
        icon: icon,
        timer:2000,
        color: document.documentElement.className.includes("dark") ? "white" : "",
        background: document.documentElement.className.includes("dark") ? "#1f2937" : "",
        title:title,
        text:message
    })
}

export const showSwalWithButton = async (title:string,message:string, icon:any, buttonConfirm: string, buttonReject?:string, width?:string):Promise<SweetAlertResult<any>> =>{
    console.log(typeof message)
    return await Swal.fire({
        icon: icon,
        color: document.documentElement.className.includes("dark") ? "white" : "",
        background: document.documentElement.className.includes("dark") ? "#1f2937" : "",
        title:title,
        html: message && message.replaceAll("\n","<br>"),
        showDenyButton: buttonReject ? true : false,
        showConfirmButton: true,
        confirmButtonText: buttonConfirm,
        denyButtonText: buttonReject,
        width: width? width : ""
    })
}