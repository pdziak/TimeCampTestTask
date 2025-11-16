import { differenceInSeconds, parseISO, isValid } from 'date-fns';

export function validateDate(date: string): void {
  if (!date || !date.trim()) {
    throw new Error('Date is required');
  }
  
  const parsedDate = parseISO(date);
  if (!isValid(parsedDate) || date.length !== 10) {
    throw new Error('Date must be in format YYYY-MM-DD (e.g., 2013-03-20)');
  }
}

export function validateApiToken(token: string): void {
  if (!token || !token.trim()) {
    throw new Error('API token is required');
  }
}

export function calculateTimeDifference(startTime: string, endTime: string): number {
  try {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    return differenceInSeconds(end, start);
  } catch {
    return 0;
  }
}

