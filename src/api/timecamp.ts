import { buildApiUrl } from './api-config';

const pendingRequests = new Map<string, Promise<Activity[]>>();

function isCacheAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return !!window.cache;
}

export interface Activity {
  id?: number;
  name?: string;
  duration?: number;
  time?: number;
  duration_seconds?: number;
  time_spent?: number;
  time_span?: number;
  start_time?: string;
  end_time?: string;
  user_id?: string;
  application_id?: string;
  window_title_id?: string;
  end_date?: string;
  task_id?: string;
  entry_id?: string;
  updated_at?: string;
  update_date?: string;
  [key: string]: unknown;
}

export interface ApiError {
  message: string;
  status?: number;
}

export async function fetchActivity(apiToken: string, date: string, forceRefresh: boolean = false): Promise<Activity[]> {
  if (!apiToken) {
    throw new Error('API token is required');
  }

  if (!date) {
    throw new Error('Date is required');
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw new Error('Date must be in format YYYY-MM-DD (e.g., 2013-03-20)');
  }

  const requestKey = `${apiToken}-${date}-${forceRefresh}`;
  
  if (!forceRefresh) {
    try {
      if (isCacheAvailable()) {
        const trimmedToken = apiToken.trim();
        const hasCache = await window.cache!.has(date, trimmedToken);
        
        if (hasCache) {
          const cachedData = await window.cache!.get(date, trimmedToken);
          
          if (cachedData) {
            try {
              const parsed = JSON.parse(cachedData);
              return Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
              // Fall through to API call
            }
          }
        }
      }
    } catch (error) {
      // Continue to API call if cache check fails
    }
  }

  if (pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey)!;
  }

  const apiRequest = (async () => {
    try {
      const url = buildApiUrl('activity', { date });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}. ${errorText}`
        );
      }

      const data = await response.json();
      const activities = Array.isArray(data) ? data : [data];

      try {
        if (isCacheAvailable()) {
          const trimmedToken = apiToken.trim();
          await window.cache!.set(date, trimmedToken, JSON.stringify(activities));
        }
      } catch (error) {
        // Continue even if caching fails
      }

      return activities;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch activity data');
    } finally {
      pendingRequests.delete(requestKey);
    }
  })();

  pendingRequests.set(requestKey, apiRequest);
  
  return apiRequest;
}

export function calculateTotalTime(activities: Activity[]): number {
  return activities.reduce((total, activity) => {
    const duration = 
      activity.time_span ?? 
      activity.duration ?? 
      activity.time ?? 
      activity.duration_seconds ?? 
      activity.time_spent ?? 
      0;
    
    if (duration === 0 && activity.start_time && activity.end_time) {
      const start = new Date(activity.start_time).getTime();
      const end = new Date(activity.end_time).getTime();
      if (!isNaN(start) && !isNaN(end) && end > start) {
        return total + Math.floor((end - start) / 1000);
      }
    }
    
    return total + (typeof duration === 'number' ? duration : 0);
  }, 0);
}

export function formatTime(seconds: number): string {
  if (seconds === 0) {
    return '0s';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs}s`);
  }

  return parts.join(' ');
}
