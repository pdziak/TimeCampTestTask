import { contextBridge, ipcRenderer } from 'electron';

interface IpcRendererAPI {
  on(channel: string, listener: (...args: any[]) => void): void;
  off(channel: string, listener: (...args: any[]) => void): void;
  send(channel: string, ...args: any[]): void;
  invoke(channel: string, ...args: any[]): Promise<any>;
}

interface CacheAPI {
  has(date: string, apiToken: string): Promise<boolean>;
  get(date: string, apiToken: string): Promise<string | null>;
  set(date: string, apiToken: string, data: string): Promise<void>;
  isPastDate(date: string): Promise<boolean>;
  getAllDates(apiToken: string): Promise<string[]>;
  delete(date: string, apiToken: string): Promise<void>;
  clearAll(apiToken: string): Promise<void>;
  getStats(apiToken: string): Promise<{ totalEntries: number; oldestDate: string | null; newestDate: string | null }>;
  listAll(): Promise<Array<{ date: string; apiToken: string; dataLength: number; cachedAt: number }>>;
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

contextBridge.exposeInMainWorld('cache', {
  has(date: string, apiToken: string): Promise<boolean> {
    return ipcRenderer.invoke('cache:has', date, apiToken);
  },
  get(date: string, apiToken: string): Promise<string | null> {
    return ipcRenderer.invoke('cache:get', date, apiToken);
  },
  set(date: string, apiToken: string, data: string): Promise<void> {
    return ipcRenderer.invoke('cache:set', date, apiToken, data);
  },
  isPastDate(date: string): Promise<boolean> {
    return ipcRenderer.invoke('cache:isPastDate', date);
  },
  getAllDates(apiToken: string): Promise<string[]> {
    return ipcRenderer.invoke('cache:getAllDates', apiToken);
  },
  delete(date: string, apiToken: string): Promise<void> {
    return ipcRenderer.invoke('cache:delete', date, apiToken);
  },
  clearAll(apiToken: string): Promise<void> {
    return ipcRenderer.invoke('cache:clearAll', apiToken);
  },
  getStats(apiToken: string): Promise<{ totalEntries: number; oldestDate: string | null; newestDate: string | null }> {
    return ipcRenderer.invoke('cache:getStats', apiToken);
  },
  listAll(): Promise<Array<{ date: string; apiToken: string; dataLength: number; cachedAt: number }>> {
    return ipcRenderer.invoke('cache:listAll');
  },
} as CacheAPI);
