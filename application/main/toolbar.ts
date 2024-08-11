import { app } from "electron";
import { createWindow } from "./helpers";

export function getToolbar() {
    const isMac = process.platform === "darwin";
    const isProd: boolean = process.env.NODE_ENV === "production";

    const toolbar = [
        // { role: 'appMenu' }
        ...(isMac
            ? [
                {
                    label: app.name,
                    submenu: [
                        { role: "about" },
                        { type: "separator" },
                        { role: "services" },
                        { type: "separator" },
                        { role: "hide" },
                        { role: "hideOthers" },
                        { role: "unhide" },
                        { type: "separator" },
                        { role: "quit" },
                    ],
                },
            ]
            : []),
        // { role: 'fileMenu' }
        {
            label: "Application",
            submenu: [isMac ? { role: "close" } : { role: "quit" }],
        },
        // { role: 'editMenu' }
        {
            label: "Edit",
            submenu: [
                { role: "undo" },
                { role: "redo" },
                { type: "separator" },
                { role: "cut" },
                { role: "copy" },
                { role: "paste" },
                ...(isMac
                    ? [
                        { role: "pasteAndMatchStyle" },
                        { role: "delete" },
                        { role: "selectAll" },
                        { type: "separator" },
                        {
                            label: "Speech",
                            submenu: [{ role: "startSpeaking" }, { role: "stopSpeaking" }],
                        },
                    ]
                    : [{ role: "delete" }, { type: "separator" }, { role: "selectAll" }]),
            ],
        },
        // { role: 'viewMenu' }
        {
            label: "View",
            submenu: [
                { role: "reload" },
                { type: "separator" },
                { role: "resetZoom" },
                { role: "zoomIn" },
                { role: "zoomOut" },
                { type: "separator" },
                { role: "togglefullscreen" },
                ...(isProd ? [] : [{ role: "toggleDevTools" }])
            ],
        },
        // { role: 'windowMenu' }
        {
            label: "Window",
            submenu: [
                { role: "minimize" },
                { role: "zoom" },
                ...(isMac
                    ? [
                        { type: "separator" },
                        { role: "front" },
                        { type: "separator" },
                        { role: "window" },
                    ]
                    : [{ role: "close" }]),
            ],
        },
        {
            role: "About",
            submenu: [
                {
                    label: "Learn More about DITIS",
                    click: async () => {
                        const { shell } = require("electron");
                        await shell.openExternal(
                            "https://dicl.cut.ac.cy/research/projects/smml"
                        );
                    },
                },
                {
                    label: "Open Manual",
                    click: async () => {
                        let win = createWindow("manual", {
                            width: 1000,
                            height: 600,
                            icon: "resources/icon.png",
                            autoHideMenuBar: true,
                        });
                        win.loadFile('manual.pdf')
                    }
                }
            ],
        },
    ];


    return toolbar;
}