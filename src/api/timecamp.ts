/**
 * TimeCamp API client
 * Documentation: https://developer.timecamp.com/#/operations/get--activity
 */

const API_BASE_URL = 'https://app.timecamp.com/third_party/api';

export interface Activity {
  id?: number;
  name?: string;
  duration?: number; // Duration in seconds
  time?: number; // Time in seconds
  duration_seconds?: number;
  time_spent?: number;
  time_span?: number; // Duration in seconds (TimeCamp API field)
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

/**
 * Fetches activity data from TimeCamp API
 * @param apiToken - Your TimeCamp API token (Bearer token)
 * @param date - Date in format YYYY-MM-DD (e.g., "2013-03-20")
 * @returns Promise with activity data array
 */
export async function fetchActivity(apiToken: string, date: string): Promise<Activity[]> {
  if (!apiToken) {
    throw new Error('API token is required');
  }

  if (!date) {
    throw new Error('Date is required');
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw new Error('Date must be in format YYYY-MM-DD (e.g., 2013-03-20)');
  }

  try {
    const url = new URL(`${API_BASE_URL}/activity`);
    url.searchParams.append('date', date);

    const response = await fetch(url.toString(), {
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
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch activity data');
  }
}

/**
 * Calculates total time spent from activities (in seconds)
 * @param activities - Array of activity objects
 * @returns Total time in seconds
 */
export function calculateTotalTime(activities: Activity[]): number {
  return activities.reduce((total, activity) => {
    // Try different possible field names for duration/time
    // time_span is the actual field used by TimeCamp API
    const duration = 
      activity.time_span ?? 
      activity.duration ?? 
      activity.time ?? 
      activity.duration_seconds ?? 
      activity.time_spent ?? 
      0;
    
    // If duration is in a different format, try to calculate from start/end times
    if (duration === 0 && activity.start_time && activity.end_time) {
      const start = new Date(activity.start_time).getTime();
      const end = new Date(activity.end_time).getTime();
      if (!isNaN(start) && !isNaN(end) && end > start) {
        return total + Math.floor((end - start) / 1000); // Convert to seconds
      }
    }
    
    return total + (typeof duration === 'number' ? duration : 0);
  }, 0);
}

/**
 * Formats seconds into a human-readable string (e.g., "2h 30m 15s")
 * @param seconds - Total seconds
 * @returns Formatted time string
 */
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

