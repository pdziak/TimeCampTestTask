import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import * as path from 'node:path';
import { app } from 'electron';
import type { IDatabaseConnection } from '../interfaces/IDatabaseConnection.js';
import type { ILogger } from '../interfaces/ILogger.js';

export class DatabaseConnection implements IDatabaseConnection {
  private db: DatabaseType | null = null;

  constructor(private readonly logger: ILogger) {}

  getConnection(): DatabaseType {
    if (!this.db) {
      this.initializeDatabase();
    }
    return this.db!;
  }

  private initializeDatabase(): void {
    try {
      const dbPath = this.getDbPath();
      this.logger.info('Initializing database', { path: dbPath });
      this.db = new Database(dbPath);
      this.db.pragma('journal_mode = WAL');
      this.initializeSchema();
      this.logger.info('Database initialized successfully');
    } catch (error) {
      this.logger.error('Error initializing database', { error });
      throw error;
    }
  }

  private getDbPath(): string {
    const userDataPath = app.getPath('userData');
    return path.join(userDataPath, 'timecamp-cache.db');
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

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

