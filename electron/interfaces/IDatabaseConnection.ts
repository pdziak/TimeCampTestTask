import type Database from 'better-sqlite3';

export interface IDatabaseConnection {
  getConnection(): Database.Database;
  close(): void;
}

