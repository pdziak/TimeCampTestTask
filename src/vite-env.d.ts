/// <reference types="vite/client" />

interface Window {
  ipcRenderer: {
    on(channel: string, listener: (...args: any[]) => void): void;
    off(channel: string, listener: (...args: any[]) => void): void;
    send(channel: string, ...args: any[]): void;
    invoke(channel: string, ...args: any[]): Promise<any>;
  };
  cache: {
    has(date: string, apiToken: string): Promise<boolean>;
    get(date: string, apiToken: string): Promise<string | null>;
    set(date: string, apiToken: string, data: string): Promise<void>;
    isPastDate(date: string): Promise<boolean>;
    getAllDates(apiToken: string): Promise<string[]>;
    delete(date: string, apiToken: string): Promise<void>;
    clearAll(apiToken: string): Promise<void>;
    getStats(apiToken: string): Promise<{ totalEntries: number; oldestDate: string | null; newestDate: string | null }>;
    listAll(): Promise<Array<{ date: string; apiToken: string; dataLength: number; cachedAt: number }>>;
  };
}

