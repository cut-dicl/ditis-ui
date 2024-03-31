import React, { createContext, useEffect, useLayoutEffect, useState } from 'react';
import {useTheme} from "next-themes";
import { ipcRenderer } from 'electron';


export const AppController = createContext({
    mode: "",
    appTheme: "",
    javaPath: "",
    simulationPreference: "",
    isSimulatorInstalled: true,
    onlineServer: {
        serverName: "",
        address: "",
        auth: "",
    },
    appLoaded: false,
    debugEnabled: false,
    setMode: (mode:string) => {},
    setAppTheme: (appTheme:string) => {},
    setSimulationPreference: (simulationPreference:string) => {},
    setJavaPath: (javaPath:string) => {},
    setIsSimulatorInstalled: (isSimulatorInstalled:boolean) => {},
    setOnlineServer: (onlineServer: object) => { },
    setDebugEnabled: (debugEnabled: boolean) => {},
});

export const AppControllerProvider = (props) =>{
    const [mode, setMode] = useState("Local");
    const {theme, setTheme} = useTheme();
    const [javaPath, setJavaPath] = useState("");
    const [appTheme, setAppTheme] = useState("light");
    const [simulationPreference, setSimulationPreference] = useState("");
    const [isSimulatorInstalled, setIsSimulatorInstalled] = useState(false);
    const [onlineServer, setOnlineServer] = useState({
        serverName: "",
                address: "",
                auth: "",
    });
    const [appLoaded, setAppLoaded] = useState(false);
    const [debugEnabled, setDebugEnabled] = useState(false);


    const handleSimulationPreference = (newPreference) => {
        setSimulationPreference(newPreference);
        ipcRenderer.invoke('edit-preferences-file', {key: "simulationPreference", value: newPreference});
        setMode(newPreference);
    }

    useLayoutEffect(() => {
        ipcRenderer.invoke('open-preferences-file').then((result) => {
            result.javaPath ? setJavaPath(result.javaPath) : setJavaPath("");
            if (result.javaPath.length > 0)
                setIsSimulatorInstalled(true);
            if (typeof result.simulationPreference !== "undefined") {
                if (result.simulationPreference == "Local" && result.javaPath.length> 0) {
                    setSimulationPreference("Local");
                    setMode("Local");
                } else {
                    setSimulationPreference("Online");
                    setMode("Online");
                }
                
            } else {
                handleSimulationPreference("Online");
                setSimulationPreference("Online");
                setIsSimulatorInstalled(false);
            }
            result.theme ? setAppTheme(result.theme) : setAppTheme("light");
            result.onlineServer ? setOnlineServer(result.onlineServer) : setOnlineServer({
                serverName: "",
                address: "",
                auth: "",
            });
            result.debugEnabled ? setDebugEnabled(result.debugEnabled) : setDebugEnabled(false);
            setAppLoaded(true);
        });
    },[]);

    useEffect(() => {
        let themeLink = document.getElementById('prime-theme') as HTMLLinkElement;
        if (appTheme === "light") 
            themeLink.href = 'themes/lara-light-blue/theme.css';
         else 
            themeLink.href = 'themes/vela-blue/theme.css';
        setTheme(appTheme === "dark" ? "dark" : "light");
    }, [appTheme]);

    useEffect(() => {
        ipcRenderer.invoke('edit-preferences-file', {key: "onlineServer", value: onlineServer});
    }, [onlineServer]);

    return (
        <AppController.Provider value={{mode: mode, setMode: setMode, appTheme: appTheme,
             setAppTheme: setAppTheme, simulationPreference: simulationPreference, isSimulatorInstalled: isSimulatorInstalled,
             javaPath: javaPath, onlineServer: onlineServer, setJavaPath: setJavaPath,
            setSimulationPreference: setSimulationPreference, setIsSimulatorInstalled: setIsSimulatorInstalled,
            setOnlineServer: setOnlineServer,appLoaded: appLoaded, debugEnabled: debugEnabled, setDebugEnabled: setDebugEnabled
        }}>
            {props.children}
        </AppController.Provider>
    )
}

