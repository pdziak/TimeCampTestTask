import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('ipcRenderer', {
    on(channel, listener) {
        ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
    },
    off(channel, listener) {
        ipcRenderer.off(channel, listener);
    },
    send(channel, ...args) {
        ipcRenderer.send(channel, ...args);
    },
    invoke(channel, ...args) {
        return ipcRenderer.invoke(channel, ...args);
    },
});
