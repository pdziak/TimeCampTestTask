import { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { fetchActivity } from '../api/timecamp';
import type { Activity } from '../api/types';
import { logger } from '../services/Logger';

interface UseActivityDataResult {
  apiToken: string;
  date: string;
  activities: Activity[];
  loading: boolean;
  error: string | null;
  hasFetched: boolean;
  setApiToken: (token: string) => void;
  setDate: (date: string) => void;
  fetchData: () => Promise<void>;
}

const STORAGE_KEY = 'timecamp_api_token';

export function useActivityData(): UseActivityDataResult {
  const [apiToken, setApiToken] = useState<string>('');
  const [date, setDate] = useState<string>(() => format(new Date(), 'yyyy-MM-dd'));
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState<boolean>(false);
  const fetchingRef = useRef<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEY);
    if (savedToken) {
      setApiToken(savedToken);
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!apiToken.trim()) {
      setError('Please enter your API token');
      return;
    }

    if (!date.trim()) {
      setError('Please select a date');
      return;
    }

    const requestKey = `${apiToken}-${date}`;
    
    if (fetchingRef.current === requestKey || loading) {
      return;
    }

    fetchingRef.current = requestKey;
    setLoading(true);
    setError(null);
    setActivities([]);
    setHasFetched(false);

    try {
      const data = await fetchActivity(apiToken, date);
      setActivities(data);
      setHasFetched(true);
      localStorage.setItem(STORAGE_KEY, apiToken);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch activity data';
      setError(errorMessage);
      logger.error('Failed to fetch activities', { error: err });
      setActivities([]);
      setHasFetched(false);
    } finally {
      setLoading(false);
      fetchingRef.current = null;
    }
  }, [apiToken, date, loading]);

  const handleTokenChange = useCallback((token: string) => {
    setApiToken(token);
    setError(null);
  }, []);

  const handleDateChange = useCallback((newDate: string) => {
    setDate(newDate);
    setError(null);
  }, []);

  return {
    apiToken,
    date,
    activities,
    loading,
    error,
    hasFetched,
    setApiToken: handleTokenChange,
    setDate: handleDateChange,
    fetchData,
  };
}

