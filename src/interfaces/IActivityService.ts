import type { Activity } from '../api/types';

export interface IActivityService {
  fetchActivities(apiToken: string, date: string, forceRefresh?: boolean): Promise<Activity[]>;
}

