import type { IActivityService } from '../interfaces/IActivityService';
import type { ICacheService } from '../interfaces/ICacheService';
import type { IHttpClient } from '../interfaces/IHttpClient';
import type { Activity } from '../api/types';
import { buildApiUrl } from '../api/api-config';
import { validateApiToken, validateDate } from '../utils/date-utils';
import { normalizeToken } from '../utils/token-normalizer';
import { logger } from './Logger';

class ActivityService implements IActivityService {
  private pendingRequests = new Map<string, Promise<Activity[]>>();
  private httpClient: IHttpClient;
  private cacheService: ICacheService;

  constructor(
    httpClient: IHttpClient,
    cacheService: ICacheService
  ) {
    this.httpClient = httpClient;
    this.cacheService = cacheService;
  }

  async fetchActivities(
    apiToken: string,
    date: string,
    forceRefresh: boolean = false
  ): Promise<Activity[]> {
    validateApiToken(apiToken);
    validateDate(date);

    const normalizedToken = normalizeToken(apiToken);
    const requestKey = `${normalizedToken}-${date}-${forceRefresh}`;
    
    if (!forceRefresh) {
      const cachedData = await this.getCachedData(date, normalizedToken);
      if (cachedData) {
        return cachedData;
      }
    }

    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey)!;
    }

    const apiRequest = this.fetchFromApi(date, apiToken, normalizedToken)
      .finally(() => {
        this.pendingRequests.delete(requestKey);
      });

    this.pendingRequests.set(requestKey, apiRequest);
    return apiRequest;
  }

  private async getCachedData(
    date: string,
    normalizedToken: string
  ): Promise<Activity[] | null> {
    try {
      const hasCache = await this.cacheService.has(date, normalizedToken);
      if (!hasCache) {
        return null;
      }

      const cachedData = await this.cacheService.get(date, normalizedToken);
      if (!cachedData) {
        return null;
      }

      const parsed = JSON.parse(cachedData);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      logger.warn('Failed to retrieve cached data', { date, error });
      return null;
    }
  }

  private async fetchFromApi(
    date: string,
    apiToken: string,
    normalizedToken: string
  ): Promise<Activity[]> {
    const url = buildApiUrl('activity', { date });
    const data = await this.httpClient.get<Activity | Activity[]>(url, {
      'Authorization': `Bearer ${apiToken}`,
    });

    const activities = Array.isArray(data) ? data : [data];

    await this.cacheService.set(date, normalizedToken, JSON.stringify(activities));

    return activities;
  }
}

export function createActivityService(
  httpClient: IHttpClient,
  cacheService: ICacheService
): IActivityService {
  return new ActivityService(httpClient, cacheService);
}

