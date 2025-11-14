/**
 * TimeCamp API client
 * Documentation: https://developer.timecamp.com/#/operations/get--activity
 */

const API_BASE_URL = 'https://app.timecamp.com/third_party/api';

export interface Activity {
  id: number;
  name: string;
  [key: string]: unknown;
}

export interface ApiError {
  message: string;
  status?: number;
}

/**
 * Fetches activity data from TimeCamp API
 * @param apiToken - Your TimeCamp API token (Bearer token)
 * @returns Promise with activity data array
 */
export async function fetchActivity(apiToken: string): Promise<Activity[]> {
  if (!apiToken) {
    throw new Error('API token is required');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/activity`, {
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

