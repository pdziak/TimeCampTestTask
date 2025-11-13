import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('ipcRenderer', {
  on(channel: string, listener: (...args: any[]) => void) {
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
  },
  off(channel: string, listener: (...args: any[]) => void) {
    return ipcRenderer.off(channel, listener);
  },
  send(channel: string, ...args: any[]) {
    return ipcRenderer.send(channel, ...args);
  },
  invoke(channel: string, ...args: any[]) {
    return ipcRenderer.invoke(channel, ...args);
  },
});

