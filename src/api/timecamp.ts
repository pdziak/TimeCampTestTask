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

