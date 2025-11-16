import type { Activity } from './types';
import { createActivityService } from '../services/ActivityService';
import { httpClient } from '../services/HttpClient';
import { cacheService } from '../services/CacheService';
import { calculateTotalTime, formatTime } from '../utils/activity-utils';

export type { Activity } from './types';
export { calculateTotalTime, formatTime };

const activityService = createActivityService(httpClient, cacheService);

export async function fetchActivity(
  apiToken: string,
  date: string,
  forceRefresh: boolean = false
): Promise<Activity[]> {
  return activityService.fetchActivities(apiToken, date, forceRefresh);
}
