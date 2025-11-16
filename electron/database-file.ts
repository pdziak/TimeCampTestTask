import * as fs from 'node:fs';
import * as path from 'node:path';
import { app } from 'electron';

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

class ActivityCache {
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
    return `${date}:${apiToken.trim()}`;
  }

  hasCache(date: string, apiToken: string): boolean {
    try {
      const trimmedToken = apiToken.trim();
      const cache = this.readCache();
      const key = this.getCacheKey(date, trimmedToken);
      return key in cache;
    } catch (error) {
      return false;
    }
  }

  getCache(date: string, apiToken: string): string | null {
    try {
      const trimmedToken = apiToken.trim();
      const cache = this.readCache();
      const key = this.getCacheKey(date, trimmedToken);
      return cache[key]?.data ?? null;
    } catch (error) {
      return null;
    }
  }

  setCache(date: string, apiToken: string, data: string): void {
    const trimmedToken = apiToken.trim();
    const cache = this.readCache();
    const key = this.getCacheKey(date, trimmedToken);
    cache[key] = {
      date,
      apiToken: trimmedToken,
      data,
      cachedAt: Date.now()
    };
    this.writeCache(cache);
  }

  isPastDate(date: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    return targetDate < today;
  }

  getAllCachedDates(apiToken: string): string[] {
    try {
      const trimmedToken = apiToken.trim();
      const cache = this.readCache();
      const dates = new Set<string>();
      
      for (const entry of Object.values(cache)) {
        if (entry.apiToken === trimmedToken) {
          dates.add(entry.date);
        }
      }
      
      return Array.from(dates).sort().reverse();
    } catch (error) {
      return [];
    }
  }

  deleteCache(date: string, apiToken: string): void {
    try {
      const trimmedToken = apiToken.trim();
      const cache = this.readCache();
      const key = this.getCacheKey(date, trimmedToken);
      delete cache[key];
      this.writeCache(cache);
    } catch (error) {
    }
  }

  clearAllCache(apiToken: string): void {
    try {
      const trimmedToken = apiToken.trim();
      const cache = this.readCache();
      const keysToDelete: string[] = [];
      
      for (const [key, entry] of Object.entries(cache)) {
        if (entry.apiToken === trimmedToken) {
          keysToDelete.push(key);
        }
      }
      
      for (const key of keysToDelete) {
        delete cache[key];
      }
      
      this.writeCache(cache);
    } catch (error) {
    }
  }

  clearOldCache(olderThanDays: number = 90): void {
    try {
      const cache = this.readCache();
      const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
      const keysToDelete: string[] = [];
      
      for (const [key, entry] of Object.entries(cache)) {
        if (entry.cachedAt < cutoffTime) {
          keysToDelete.push(key);
        }
      }
      
      for (const key of keysToDelete) {
        delete cache[key];
      }
      
      this.writeCache(cache);
    } catch (error) {
    }
  }

  listAllCacheEntries(): Array<{ date: string; apiToken: string; dataLength: number; cachedAt: number }> {
    try {
      const cache = this.readCache();
      return Object.values(cache).map(entry => ({
        date: entry.date,
        apiToken: entry.apiToken,
        dataLength: entry.data.length,
        cachedAt: entry.cachedAt
      }));
    } catch (error) {
      return [];
    }
  }

  getCacheStats(apiToken: string): { totalEntries: number; oldestDate: string | null; newestDate: string | null } {
    try {
      const trimmedToken = apiToken.trim();
      const cache = this.readCache();
      const entries = Object.values(cache).filter(e => e.apiToken === trimmedToken);
      
      if (entries.length === 0) {
        return { totalEntries: 0, oldestDate: null, newestDate: null };
      }
      
      const dates = entries.map(e => e.date).sort();
      return {
        totalEntries: entries.length,
        oldestDate: dates[0] || null,
        newestDate: dates[dates.length - 1] || null
      };
    } catch (error) {
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
