export interface CacheStats {
  totalEntries: number;
  oldestDate: string | null;
  newestDate: string | null;
}

export interface CacheEntryInfo {
  date: string;
  apiToken: string;
  dataLength: number;
  cachedAt: number;
}

export interface ICacheStorage {
  hasCache(date: string, apiToken: string): boolean;
  getCache(date: string, apiToken: string): string | null;
  setCache(date: string, apiToken: string, data: string): void;
  deleteCache(date: string, apiToken: string): void;
  clearAllCache(apiToken: string): void;
  clearOldCache(olderThanDays?: number): void;
  getAllCachedDates(apiToken: string): string[];
  getCacheStats(apiToken: string): CacheStats;
  listAllCacheEntries(): CacheEntryInfo[];
  isPastDate(date: string): boolean;
  close(): void;
}

