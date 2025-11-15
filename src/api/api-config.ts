export const TimeCampApiConfig = {
  baseUrl: 'https://app.timecamp.com/third_party/api',
} as const;

export function buildApiUrl(endpoint: string, params?: Record<string, string>): string {
  const url = new URL(`${TimeCampApiConfig.baseUrl}/${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  
  return url.toString();
}

