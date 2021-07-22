import { ipcRenderer } from "electron";

(global as any).ipcRenderer = {};
(global as any).ipcRenderer.on = ipcRenderer.on;
(global as any).ipcRenderer.send = ipcRenderer.send;
(global as any).ipcRenderer.sendToHost = ipcRenderer.sendToHost;
