/* eslint-disable @typescript-eslint/no-var-requires */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    reportUserToken: (token) => {
        console.log('SEND TOKEN', token);

        ipcRenderer.send('userToken', token);
    },
});
