const { ipcRenderer } = require('electron')

global.ipcRenderer = {};
global.ipcRenderer.on = ipcRenderer.on;
global.ipcRenderer.send = ipcRenderer.send;
global.ipcRenderer.sendToHost = ipcRenderer.sendToHost;
