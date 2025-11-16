import type Database from 'better-sqlite3';
import type { ICacheStorage, CacheStats, CacheEntryInfo } from '../interfaces/ICacheStorage.js';
import type { IDatabaseConnection } from '../interfaces/IDatabaseConnection.js';
import type { ILogger } from '../interfaces/ILogger.js';
import { normalizeToken } from '../utils/token-normalizer.js';

export class CacheRepository implements ICacheStorage {
  constructor(
    private readonly dbConnection: IDatabaseConnection,
    private readonly logger: ILogger
  ) {}

  private getDatabase(): Database.Database {
    return this.dbConnection.getConnection();
  }

  hasCache(date: string, apiToken: string): boolean {
    try {
      const db = this.getDatabase();
      const normalizedToken = normalizeToken(apiToken);
      const stmt = db.prepare('SELECT 1 FROM activity_cache WHERE date = ? AND api_token = ?');
      const result = stmt.get(date, normalizedToken);
      return result !== undefined;
    } catch (error) {
      this.logger.error('Error checking cache', { date, error });
      return false;
    }
  }

  getCache(date: string, apiToken: string): string | null {
    try {
      const db = this.getDatabase();
      const normalizedToken = normalizeToken(apiToken);
      const stmt = db.prepare('SELECT data FROM activity_cache WHERE date = ? AND api_token = ?');
      const result = stmt.get(date, normalizedToken) as { data: string } | undefined;
      return result?.data ?? null;
    } catch (error) {
      this.logger.error('Error retrieving cache', { date, error });
      return null;
    }
  }

  setCache(date: string, apiToken: string, data: string): void {
    try {
      const db = this.getDatabase();
      const normalizedToken = normalizeToken(apiToken);
      const stmt = db.prepare(
        'INSERT OR REPLACE INTO activity_cache (date, api_token, data, cached_at) VALUES (?, ?, ?, ?)'
      );
      stmt.run(date, normalizedToken, data, Date.now());
      db.pragma('wal_checkpoint(TRUNCATE)');
    } catch (error) {
      this.logger.error('Error storing cache', { date, error });
      throw error;
    }
  }

  deleteCache(date: string, apiToken: string): void {
    try {
      const db = this.getDatabase();
      const normalizedToken = normalizeToken(apiToken);
      const stmt = db.prepare('DELETE FROM activity_cache WHERE date = ? AND api_token = ?');
      stmt.run(date, normalizedToken);
    } catch (error) {
      this.logger.error('Error deleting cache', { date, error });
    }
  }

  clearAllCache(apiToken: string): void {
    try {
      const db = this.getDatabase();
      const normalizedToken = normalizeToken(apiToken);
      const stmt = db.prepare('DELETE FROM activity_cache WHERE api_token = ?');
      stmt.run(normalizedToken);
    } catch (error) {
      this.logger.error('Error clearing cache', { error });
    }
  }

  clearOldCache(olderThanDays: number = 90): void {
    try {
      const db = this.getDatabase();
      const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
      const stmt = db.prepare('DELETE FROM activity_cache WHERE cached_at < ?');
      stmt.run(cutoffTime);
    } catch (error) {
      this.logger.error('Error clearing old cache', { error });
    }
  }

  getAllCachedDates(apiToken: string): string[] {
    try {
      const db = this.getDatabase();
      const normalizedToken = normalizeToken(apiToken);
      const stmt = db.prepare('SELECT DISTINCT date FROM activity_cache WHERE api_token = ? ORDER BY date DESC');
      const results = stmt.all(normalizedToken) as { date: string }[];
      return results.map(r => r.date);
    } catch (error) {
      this.logger.error('Error getting cached dates', { error });
      return [];
    }
  }

  getCacheStats(apiToken: string): CacheStats {
    try {
      const db = this.getDatabase();
      const normalizedToken = normalizeToken(apiToken);
      const stmt = db.prepare(`
        SELECT 
          COUNT(*) as total,
          MIN(date) as oldest,
          MAX(date) as newest
        FROM activity_cache 
        WHERE api_token = ?
      `);
      const result = stmt.get(normalizedToken) as { total: number; oldest: string | null; newest: string | null } | undefined;
      return {
        totalEntries: result?.total ?? 0,
        oldestDate: result?.oldest ?? null,
        newestDate: result?.newest ?? null,
      };
    } catch (error) {
      this.logger.error('Error getting cache stats', { error });
      return { totalEntries: 0, oldestDate: null, newestDate: null };
    }
  }

  listAllCacheEntries(): CacheEntryInfo[] {
    try {
      const db = this.getDatabase();
      const stmt = db.prepare('SELECT date, api_token, LENGTH(data) as data_length, cached_at FROM activity_cache ORDER BY cached_at DESC LIMIT 20');
      const results = stmt.all() as Array<{ date: string; api_token: string; data_length: number; cached_at: number }>;
      return results.map(r => ({
        date: r.date,
        apiToken: r.api_token,
        dataLength: r.data_length,
        cachedAt: r.cached_at
      }));
    } catch (error) {
      this.logger.error('Error listing cache entries', { error });
      return [];
    }
  }

  isPastDate(date: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    return targetDate < today;
  }

  close(): void {
    this.dbConnection.close();
  }
}

