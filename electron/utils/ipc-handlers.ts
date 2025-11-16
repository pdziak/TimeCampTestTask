import type { ICacheStorage } from '../interfaces/ICacheStorage.js';
import { IpcHandlerService } from '../services/IpcHandlerService.js';
import { logger } from '../services/Logger.js';

export function registerCacheHandlers(cache: ICacheStorage): void {
  const ipcHandlerService = new IpcHandlerService(cache, logger);
  ipcHandlerService.registerHandlers();
}

