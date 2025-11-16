import { ipcMain } from 'electron';
import type { ICacheStorage } from '../interfaces/ICacheStorage.js';
import { normalizeToken } from '../utils/token-normalizer.js';
import type { ILogger } from '../interfaces/ILogger.js';

interface IpcHandler {
  channel: string;
  handler: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => Promise<any> | any;
}

export class IpcHandlerService {
  constructor(
    private readonly cache: ICacheStorage,
    private readonly logger: ILogger
  ) {}

  registerHandlers(): void {
    const handlers = this.createHandlers();
    handlers.forEach(({ channel, handler }) => {
      ipcMain.handle(channel, handler);
    });
    this.logger.info('IPC handlers registered', { count: handlers.length });
  }

  private createHandlers(): IpcHandler[] {
    return [
      {
        channel: 'cache:has',
        handler: async (_event, date: string, apiToken: string) => {
          return this.handleWithError(() => {
            const normalizedToken = normalizeToken(apiToken);
            return this.cache.hasCache(date, normalizedToken);
          }, false);
        },
      },
      {
        channel: 'cache:get',
        handler: async (_event, date: string, apiToken: string) => {
          return this.handleWithError(() => {
            const normalizedToken = normalizeToken(apiToken);
            return this.cache.getCache(date, normalizedToken);
          }, null);
        },
      },
      {
        channel: 'cache:set',
        handler: async (_event, date: string, apiToken: string, data: string) => {
          return this.handleWithError(() => {
            const normalizedToken = normalizeToken(apiToken);
            this.cache.setCache(date, normalizedToken, data);
          }, undefined);
        },
      },
      {
        channel: 'cache:isPastDate',
        handler: async (_event, date: string) => {
          return this.handleWithError(() => {
            return this.cache.isPastDate(date);
          }, false);
        },
      },
      {
        channel: 'cache:getAllDates',
        handler: async (_event, apiToken: string) => {
          return this.handleWithError(() => {
            const normalizedToken = normalizeToken(apiToken);
            return this.cache.getAllCachedDates(normalizedToken);
          }, []);
        },
      },
      {
        channel: 'cache:delete',
        handler: async (_event, date: string, apiToken: string) => {
          return this.handleWithError(() => {
            this.cache.deleteCache(date, apiToken);
          }, undefined);
        },
      },
      {
        channel: 'cache:clearAll',
        handler: async (_event, apiToken: string) => {
          return this.handleWithError(() => {
            this.cache.clearAllCache(apiToken);
          }, undefined);
        },
      },
      {
        channel: 'cache:getStats',
        handler: async (_event, apiToken: string) => {
          return this.handleWithError(() => {
            const normalizedToken = normalizeToken(apiToken);
            return this.cache.getCacheStats(normalizedToken);
          }, { totalEntries: 0, oldestDate: null, newestDate: null });
        },
      },
      {
        channel: 'cache:listAll',
        handler: async () => {
          return this.handleWithError(() => {
            return this.cache.listAllCacheEntries();
          }, []);
        },
      },
    ];
  }

  private handleWithError<T>(fn: () => T, defaultValue: T): T {
    try {
      return fn();
    } catch (error) {
      this.logger.error('IPC handler error', { error });
      return defaultValue;
    }
  }
}

