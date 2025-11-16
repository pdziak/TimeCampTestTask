import { ipcMain } from 'electron';
import type { ICacheStorage } from '../interfaces/ICacheStorage.js';
import { normalizeToken } from './token-normalizer.js';

export function registerCacheHandlers(cache: ICacheStorage): void {
  ipcMain.handle('cache:has', async (_event, date: string, apiToken: string) => {
    try {
      const normalizedToken = normalizeToken(apiToken);
      return cache.hasCache(date, normalizedToken);
    } catch {
      return false;
    }
  });

  ipcMain.handle('cache:get', async (_event, date: string, apiToken: string) => {
    try {
      const normalizedToken = normalizeToken(apiToken);
      return cache.getCache(date, normalizedToken);
    } catch {
      return null;
    }
  });

  ipcMain.handle('cache:set', async (_event, date: string, apiToken: string, data: string) => {
    const normalizedToken = normalizeToken(apiToken);
    cache.setCache(date, normalizedToken, data);
  });

  ipcMain.handle('cache:isPastDate', async (_event, date: string) => {
    try {
      return cache.isPastDate(date);
    } catch {
      return false;
    }
  });

  ipcMain.handle('cache:getAllDates', async (_event, apiToken: string) => {
    try {
      const normalizedToken = normalizeToken(apiToken);
      return cache.getAllCachedDates(normalizedToken);
    } catch {
      return [];
    }
  });

  ipcMain.handle('cache:delete', async (_event, date: string, apiToken: string) => {
    try {
      cache.deleteCache(date, apiToken);
    } catch {
    }
  });

  ipcMain.handle('cache:clearAll', async (_event, apiToken: string) => {
    try {
      cache.clearAllCache(apiToken);
    } catch {
    }
  });

  ipcMain.handle('cache:getStats', async (_event, apiToken: string) => {
    try {
      const normalizedToken = normalizeToken(apiToken);
      return cache.getCacheStats(normalizedToken);
    } catch {
      return { totalEntries: 0, oldestDate: null, newestDate: null };
    }
  });

  ipcMain.handle('cache:listAll', async () => {
    try {
      return cache.listAllCacheEntries();
    } catch {
      return [];
    }
  });
}

