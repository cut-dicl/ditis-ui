import React, { useContext, useLayoutEffect, useRef, useState } from "react";
import Head from "next/head";
import { useTheme } from "next-themes";
import { ipcRenderer } from "electron";
import { Divider } from "primereact/divider";
import { RadioButton } from 'primereact/radiobutton';
import { Tooltip } from "primereact/tooltip";
import { AppController } from "../../hooks/useContext-hooks/appcontroller-hook/appcontroller-hook";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Linebreak } from "../../UI/Linebreak";
import Swal from "sweetalert2";
import { showSwalWithButton, showSwalWithTimerAndMessage } from "../../utils/SwalFunctions";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import EditServer from "../../components/preferences/EditServer";
import AddServer from "../../components/preferences/AddServer";
import InstallSimulator from "../../components/preferences/InstallSimulator";
import { Panel } from "primereact/panel";
import SimulatorPath from "../../components/preferences/SimulatorPath";
import ThemeManager from "../../components/preferences/ThemeManager";
import SimulatorPreference from "../../components/preferences/SimulatorPreference";
import SettingsList from "../../components/preferences/SettingsList";
import GeneralSettings from "../../components/preferences/GeneralSettings";


function Preferences() {
    const controller = useContext(AppController);
    const [servers, setServers] = useState([]);
    const [selectedSetting, setSelectedSetting] = useState(0);
    const toast = useRef(null);
    const showToast = (severity, summary, detail) => {
        toast.current.show({ severity: severity, summary: summary, detail: detail });
    }

        
    React.useLayoutEffect(() => {
        getServers();
    }, []);

    const getServers = () => {
        ipcRenderer.invoke('get-servers').then((result) => {
            if (result === undefined) return;
            if (result.code == 500) {
                showToast("Error", "Failed to get servers", "error");
                return;
            }
            
            const servers = result.data.map((server) => {
                ipcRenderer.invoke('ping-server', { address: server.address }).then((result) => {
                    if (result === undefined) return;
                    if (result.code == 500) {
                        setServers((prev) => prev.map((serv) => {
                            if (serv.value == server.serverName) {
                                serv.status = "Local";
                            }
                            return serv;
                        }));
                    } else {
                        setServers((prev) => prev.map((serv) => {
                            if (serv.value == server.serverName) {
                                serv.status = "online";
                            }
                            return serv;
                        }));
                    }
                });
                return { label: server.serverName, value: server.serverName, status: "", address: server.address}
            });
            setServers((prev)=>servers);
        });
    }




    return (
        <div className="flex flex-col p-5 w-full">
            <Head>
                <title>DITIS Simulator: Preferences</title>
            </Head>
            <Toast ref={toast} />
            <div className="flex nowrap justify-between mt-5 mb-5">
                <h1 className="text-3xl font-bold">Preferences</h1>
                <div className="justify-between flex nowrap">
                </div>
            </div>


            <div className="p-5 flex flex-col">
                        
                    <SimulatorPreference showToast={showToast} servers={servers} />
                    <Divider className="h-[1px] bg-gray-400" />
                    {controller.mode === "Local" && <>
                        <InstallSimulator mode={controller.mode} isSimulatorInstalled={controller.isSimulatorInstalled} server={controller.onlineServer}
                            showToast={showToast} />
                        <Divider className="h-[1px] bg-gray-400"/>
                        <SimulatorPath />
                    </>
                    }
                    {controller.mode === "Online" &&<>

                        <AddServer setServers={setServers} showToast={showToast} />
                        <Divider className="h-[1px] bg-gray-400"/>
                        <EditServer servers={servers} setServers={setServers} toast={toast} showToast={showToast} />
                        </>
                }
                
                <Divider className="h-[1px] bg-gray-400" /> 
                    <ThemeManager />
                    <Divider className="h-[1px] bg-gray-400"/>
                    <GeneralSettings />
            </div>
        </div>
    );
}

export default Preferences;
