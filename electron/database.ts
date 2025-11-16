import { DatabaseConnection } from './services/DatabaseConnection.js';
import { CacheRepository } from './repositories/CacheRepository.js';
import { logger } from './services/Logger.js';
import type { ICacheStorage } from './interfaces/ICacheStorage.js';

let cacheInstance: ICacheStorage | null = null;

export function getCache(): ICacheStorage {
  if (!cacheInstance) {
    const dbConnection = new DatabaseConnection(logger);
    cacheInstance = new CacheRepository(dbConnection, logger);
  }
  return cacheInstance;
}
