import type { IHttpClient } from '../interfaces/IHttpClient';
import { logger } from './Logger';

class HttpClient implements IHttpClient {
  async get<T>(url: string, headers: Record<string, string> = {}): Promise<T> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorText || errorMessage;
        } catch {
          if (errorText) {
            errorMessage = errorText;
          }
        }
        
        throw new Error(errorMessage);
      }

      return await response.json() as T;
    } catch (error) {
      logger.error('HTTP request failed', { url, error });
      throw error;
    }
  }
}

export const httpClient: IHttpClient = new HttpClient();

