import { contextBridge, ipcRenderer } from 'electron';

interface IpcRendererAPI {
  on(channel: string, listener: (...args: any[]) => void): void;
  off(channel: string, listener: (...args: any[]) => void): void;
  send(channel: string, ...args: any[]): void;
  invoke(channel: string, ...args: any[]): Promise<any>;
}

contextBridge.exposeInMainWorld('ipcRenderer', {
  on(channel: string, listener: (...args: any[]) => void): void {
    ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
  },
  off(channel: string, listener: (...args: any[]) => void): void {
    ipcRenderer.off(channel, listener);
  },
  send(channel: string, ...args: any[]): void {
    ipcRenderer.send(channel, ...args);
  },
  invoke(channel: string, ...args: any[]): Promise<any> {
    return ipcRenderer.invoke(channel, ...args);
  },
} as IpcRendererAPI);
