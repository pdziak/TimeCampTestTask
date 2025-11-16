import * as fs from 'node:fs';
import * as path from 'node:path';
import { app } from 'electron';
import type { ICacheStorage, CacheStats, CacheEntryInfo } from './interfaces/ICacheStorage.js';
import { normalizeToken } from './utils/token-normalizer.js';
import { isPastDate as checkPastDate } from './utils/date-validator.js';

export interface CachedActivity {
  date: string;
  apiToken: string;
  data: string;
  cachedAt: number;
}

interface CacheEntry {
  date: string;
  apiToken: string;
  data: string;
  cachedAt: number;
}

class ActivityCache implements ICacheStorage {
  private cacheDir: string;
  private cacheFile: string;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.cacheDir = path.join(userDataPath, 'timecamp-cache');
    this.cacheFile = path.join(this.cacheDir, 'cache.json');
    this.ensureCacheDir();
    this.initializeCacheFile();
  }

  private ensureCacheDir(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  private initializeCacheFile(): void {
    if (!fs.existsSync(this.cacheFile)) {
      fs.writeFileSync(this.cacheFile, JSON.stringify({}), 'utf-8');
    }
  }

  private readCache(): Record<string, CacheEntry> {
    try {
      const content = fs.readFileSync(this.cacheFile, 'utf-8');
      return JSON.parse(content) as Record<string, CacheEntry>;
    } catch (error) {
      return {};
    }
  }

  private writeCache(cache: Record<string, CacheEntry>): void {
    fs.writeFileSync(this.cacheFile, JSON.stringify(cache, null, 2), 'utf-8');
  }

  private getCacheKey(date: string, apiToken: string): string {
    return `${date}:${normalizeToken(apiToken)}`;
  }

  hasCache(date: string, apiToken: string): boolean {
    try {
      const normalizedToken = normalizeToken(apiToken);
      const cache = this.readCache();
      const key = this.getCacheKey(date, normalizedToken);
      return key in cache;
    } catch {
      return false;
    }
  }

  getCache(date: string, apiToken: string): string | null {
    try {
      const normalizedToken = normalizeToken(apiToken);
      const cache = this.readCache();
      const key = this.getCacheKey(date, normalizedToken);
      return cache[key]?.data ?? null;
    } catch {
      return null;
    }
  }

  setCache(date: string, apiToken: string, data: string): void {
    const normalizedToken = normalizeToken(apiToken);
    const cache = this.readCache();
    const key = this.getCacheKey(date, normalizedToken);
    cache[key] = {
      date,
      apiToken: normalizedToken,
      data,
      cachedAt: Date.now()
    };
    this.writeCache(cache);
  }

  isPastDate(date: string): boolean {
    return checkPastDate(date);
  }

  getAllCachedDates(apiToken: string): string[] {
    try {
      const normalizedToken = normalizeToken(apiToken);
      const cache = this.readCache();
      const dates = new Set<string>();
      
      for (const entry of Object.values(cache)) {
        if (entry.apiToken === normalizedToken) {
          dates.add(entry.date);
        }
      }
      
      return Array.from(dates).sort().reverse();
    } catch {
      return [];
    }
  }

  deleteCache(date: string, apiToken: string): void {
    try {
      const normalizedToken = normalizeToken(apiToken);
      const cache = this.readCache();
      const key = this.getCacheKey(date, normalizedToken);
      delete cache[key];
      this.writeCache(cache);
    } catch {
    }
  }

  clearAllCache(apiToken: string): void {
    try {
      const normalizedToken = normalizeToken(apiToken);
      const cache = this.readCache();
      const keysToDelete = Object.keys(cache).filter(
        key => cache[key].apiToken === normalizedToken
      );
      keysToDelete.forEach(key => delete cache[key]);
      this.writeCache(cache);
    } catch {
    }
  }

  clearOldCache(olderThanDays: number = 90): void {
    try {
      const cache = this.readCache();
      const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
      const keysToDelete = Object.keys(cache).filter(
        key => cache[key].cachedAt < cutoffTime
      );
      keysToDelete.forEach(key => delete cache[key]);
      this.writeCache(cache);
    } catch {
    }
  }

  listAllCacheEntries(): CacheEntryInfo[] {
    try {
      const cache = this.readCache();
      return Object.values(cache).map(entry => ({
        date: entry.date,
        apiToken: entry.apiToken,
        dataLength: entry.data.length,
        cachedAt: entry.cachedAt
      }));
    } catch {
      return [];
    }
  }

  getCacheStats(apiToken: string): CacheStats {
    try {
      const normalizedToken = normalizeToken(apiToken);
      const cache = this.readCache();
      const entries = Object.values(cache).filter(
        e => e.apiToken === normalizedToken
      );
      
      if (entries.length === 0) {
        return { totalEntries: 0, oldestDate: null, newestDate: null };
      }
      
      const dates = entries.map(e => e.date).sort();
      return {
        totalEntries: entries.length,
        oldestDate: dates[0] || null,
        newestDate: dates[dates.length - 1] || null
      };
    } catch {
      return { totalEntries: 0, oldestDate: null, newestDate: null };
    }
  }

  close(): void {
  }
}

let cacheInstance: ActivityCache | null = null;

export function getCache(): ActivityCache {
  if (!cacheInstance) {
    cacheInstance = new ActivityCache();
  }
  return cacheInstance;
}
