import type { ICacheService } from '../interfaces/ICacheService';
import { logger } from './Logger';

class CacheService implements ICacheService {
  private isCacheAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.cache;
  }

  async has(date: string, apiToken: string): Promise<boolean> {
    if (!this.isCacheAvailable()) {
      return false;
    }

    try {
      return await window.cache!.has(date, apiToken);
    } catch (error) {
      logger.warn('Cache check failed', { date, error });
      return false;
    }
  }

  async get(date: string, apiToken: string): Promise<string | null> {
    if (!this.isCacheAvailable()) {
      return null;
    }

    try {
      return await window.cache!.get(date, apiToken);
    } catch (error) {
      logger.warn('Cache retrieval failed', { date, error });
      return null;
    }
  }

  async set(date: string, apiToken: string, data: string): Promise<void> {
    if (!this.isCacheAvailable()) {
      return;
    }

    try {
      await window.cache!.set(date, apiToken, data);
    } catch (error) {
      logger.warn('Cache storage failed', { date, error });
    }
  }
}

export const cacheService: ICacheService = new CacheService();

