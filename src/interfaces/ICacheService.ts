export interface ICacheService {
  has(date: string, apiToken: string): Promise<boolean>;
  get(date: string, apiToken: string): Promise<string | null>;
  set(date: string, apiToken: string, data: string): Promise<void>;
}

