import { differenceInSeconds, parseISO } from 'date-fns';
import { buildApiUrl } from './api-config';
import { validateApiToken, validateDate, normalizeToken } from '../utils/validation';

const pendingRequests = new Map<string, Promise<Activity[]>>();

function isCacheAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.cache;
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
  validateApiToken(apiToken);
  validateDate(date);

  const normalizedToken = normalizeToken(apiToken);
  const requestKey = `${normalizedToken}-${date}-${forceRefresh}`;
  
  if (!forceRefresh) {
    const cachedData = await getCachedData(date, normalizedToken);
    if (cachedData) {
      return cachedData;
    }
  }

  if (pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey)!;
  }

  const apiRequest = fetchFromApi(date, apiToken, normalizedToken)
    .finally(() => {
      pendingRequests.delete(requestKey);
    });

  pendingRequests.set(requestKey, apiRequest);
  return apiRequest;
}

async function getCachedData(date: string, normalizedToken: string): Promise<Activity[] | null> {
  if (!isCacheAvailable()) {
    return null;
  }

  try {
    const hasCache = await window.cache!.has(date, normalizedToken);
    if (!hasCache) {
      return null;
    }

    const cachedData = await window.cache!.get(date, normalizedToken);
    if (!cachedData) {
      return null;
    }

    const parsed = JSON.parse(cachedData);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return null;
  }
}

async function fetchFromApi(date: string, apiToken: string, normalizedToken: string): Promise<Activity[]> {
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
    throw new Error(`API request failed: ${response.status} ${response.statusText}. ${errorText}`);
  }

  const data = await response.json();
  const activities = Array.isArray(data) ? data : [data];

  if (isCacheAvailable()) {
    try {
      await window.cache!.set(date, normalizedToken, JSON.stringify(activities));
    } catch {
    }
  }

  return activities;
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
      try {
        const start = parseISO(activity.start_time);
        const end = parseISO(activity.end_time);
        const seconds = differenceInSeconds(end, start);
        if (seconds > 0) {
          return total + seconds;
        }
      } catch {
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
