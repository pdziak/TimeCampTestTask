import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import * as path from 'node:path';
import { app } from 'electron';

export interface CachedActivity {
  date: string;
  apiToken: string;
  data: string; // JSON stringified activities
  cachedAt: number; // Unix timestamp
}

class ActivityCache {
  private db: DatabaseType | null = null;

  private getDbPath(): string {
    const userDataPath = app.getPath('userData');
    return path.join(userDataPath, 'timecamp-cache.db');
  }

  private getDatabase(): DatabaseType {
    if (!this.db) {
      try {
        const dbPath = this.getDbPath();
        console.log('[DB] Initializing database at:', dbPath);
        this.db = new Database(dbPath);
        // Enable WAL mode for better concurrency
        this.db.pragma('journal_mode = WAL');
        this.initializeSchema();
        console.log('[DB] Database initialized successfully');
      } catch (error) {
        console.error('[DB] Error initializing database:', error);
        throw error;
      }
    }
    return this.db;
  }

  private initializeSchema(): void {
    if (!this.db) return;

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS activity_cache (
        date TEXT NOT NULL,
        api_token TEXT NOT NULL,
        data TEXT NOT NULL,
        cached_at INTEGER NOT NULL,
        PRIMARY KEY (date, api_token)
      );
      
      CREATE INDEX IF NOT EXISTS idx_date ON activity_cache(date);
      CREATE INDEX IF NOT EXISTS idx_cached_at ON activity_cache(cached_at);
    `);
  }

  /**
   * Check if data exists in cache for a given date and API token
   */
  hasCache(date: string, apiToken: string): boolean {
    try {
      const db = this.getDatabase();
      // Trim API token to handle potential whitespace issues
      const trimmedToken = apiToken.trim();
      console.log(`[DB] hasCache called - date="${date}", token="${trimmedToken.substring(0, 15)}..." (length: ${trimmedToken.length})`);
      
      // First, let's see ALL entries for this date
      const allForDateStmt = db.prepare('SELECT api_token, LENGTH(data) as data_len FROM activity_cache WHERE date = ?');
      const allForDate = allForDateStmt.all(date) as Array<{ api_token: string; data_len: number }>;
      console.log(`[DB] Total entries for date ${date}: ${allForDate.length}`);
      if (allForDate.length > 0) {
        allForDate.forEach((entry, i) => {
          console.log(`[DB] Entry ${i + 1}: token="${entry.api_token.substring(0, 15)}..." (length: ${entry.api_token.length}), data_len: ${entry.data_len}`);
          console.log(`[DB] Token match: ${entry.api_token === trimmedToken ? 'YES' : 'NO'}`);
          if (entry.api_token !== trimmedToken) {
            console.log(`[DB] Token diff - stored: [${Array.from(entry.api_token).map(c => c.charCodeAt(0)).join(',')}], searching: [${Array.from(trimmedToken).map(c => c.charCodeAt(0)).join(',')}]`);
          }
        });
      }
      
      const stmt = db.prepare('SELECT 1 FROM activity_cache WHERE date = ? AND api_token = ?');
      const result = stmt.get(date, trimmedToken);
      const hasCache = result !== undefined;
      console.log(`[DB] hasCache result: ${hasCache}`);
      return hasCache;
    } catch (error) {
      console.error('[DB] Error in hasCache:', error);
      return false;
    }
  }

  /**
   * Get cached data for a given date and API token
   */
  getCache(date: string, apiToken: string): string | null {
    try {
      const db = this.getDatabase();
      // Trim API token to handle potential whitespace issues
      const trimmedToken = apiToken.trim();
      const stmt = db.prepare('SELECT data FROM activity_cache WHERE date = ? AND api_token = ?');
      const result = stmt.get(date, trimmedToken) as { data: string } | undefined;
      const hasData = result?.data ?? null;
      console.log(`[DB] getCache(date="${date}", token="${trimmedToken.substring(0, 10)}..."): ${hasData ? 'found' : 'not found'}`);
      return hasData;
    } catch (error) {
      console.error('[DB] Error in getCache:', error);
      return null;
    }
  }

  /**
   * Store data in cache for a given date and API token
   */
  setCache(date: string, apiToken: string, data: string): void {
    try {
      const db = this.getDatabase();
      // Trim API token to handle potential whitespace issues
      const trimmedToken = apiToken.trim();
      console.log(`[DB] setCache called - date="${date}", token="${trimmedToken.substring(0, 15)}..." (length: ${trimmedToken.length}), data length: ${data.length}`);
      
      const stmt = db.prepare(
        'INSERT OR REPLACE INTO activity_cache (date, api_token, data, cached_at) VALUES (?, ?, ?, ?)'
      );
      const result = stmt.run(date, trimmedToken, data, Date.now());
      console.log(`[DB] INSERT result - changes: ${result.changes}, lastInsertRowid: ${result.lastInsertRowid}`);
      
      // Force a checkpoint to ensure WAL is written to disk
      db.pragma('wal_checkpoint(TRUNCATE)');
      
      // Verify it was stored immediately
      const verifyStmt = db.prepare('SELECT COUNT(*) as count FROM activity_cache WHERE date = ? AND api_token = ?');
      const verifyResult = verifyStmt.get(date, trimmedToken) as { count: number } | undefined;
      const count = verifyResult?.count ?? 0;
      console.log(`[DB] Verification: Found ${count} cache entry(ies) after store`);
      
      if (count === 0) {
        // Check total entries in table
        const totalStmt = db.prepare('SELECT COUNT(*) as total FROM activity_cache');
        const totalResult = totalStmt.get() as { total: number } | undefined;
        console.log(`[DB] WARNING: Total entries in table: ${totalResult?.total ?? 0}`);
        throw new Error(`Failed to store cache - verification found 0 entries for date=${date}`);
      }
      
      console.log(`[DB] setCache: Successfully stored data for date="${date}"`);
    } catch (error) {
      console.error('[DB] Error in setCache:', error);
      throw error;
    }
  }

  /**
   * Check if a date is in the past
   */
  isPastDate(date: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    return targetDate < today;
  }

  /**
   * Get all cached dates for a given API token
   */
  getAllCachedDates(apiToken: string): string[] {
    const db = this.getDatabase();
    const stmt = db.prepare('SELECT DISTINCT date FROM activity_cache WHERE api_token = ? ORDER BY date DESC');
    const results = stmt.all(apiToken) as { date: string }[];
    return results.map(r => r.date);
  }

  /**
   * Delete cache for a specific date and API token
   */
  deleteCache(date: string, apiToken: string): void {
    const db = this.getDatabase();
    const stmt = db.prepare('DELETE FROM activity_cache WHERE date = ? AND api_token = ?');
    stmt.run(date, apiToken);
  }

  /**
   * Clear all cache for a given API token
   */
  clearAllCache(apiToken: string): void {
    const db = this.getDatabase();
    const stmt = db.prepare('DELETE FROM activity_cache WHERE api_token = ?');
    stmt.run(apiToken);
  }

  /**
   * Clear old cache entries (optional: can be used for cleanup)
   */
  clearOldCache(olderThanDays: number = 90): void {
    const db = this.getDatabase();
    const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    const stmt = db.prepare('DELETE FROM activity_cache WHERE cached_at < ?');
    stmt.run(cutoffTime);
  }

  /**
   * List all cache entries for debugging
   */
  listAllCacheEntries(): Array<{ date: string; apiToken: string; dataLength: number; cachedAt: number }> {
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
      console.error('[DB] Error listing cache entries:', error);
      return [];
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(apiToken: string): { totalEntries: number; oldestDate: string | null; newestDate: string | null } {
    const db = this.getDatabase();
    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as total,
        MIN(date) as oldest,
        MAX(date) as newest
      FROM activity_cache 
      WHERE api_token = ?
    `);
    const result = stmt.get(apiToken) as { total: number; oldest: string | null; newest: string | null } | undefined;
    return {
      totalEntries: result?.total ?? 0,
      oldestDate: result?.oldest ?? null,
      newestDate: result?.newest ?? null,
    };
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Singleton instance
let cacheInstance: ActivityCache | null = null;

export function getCache(): ActivityCache {
  if (!cacheInstance) {
    cacheInstance = new ActivityCache();
  }
  return cacheInstance;
}

