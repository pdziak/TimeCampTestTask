import { isBefore, startOfDay, parseISO } from 'date-fns';

export function isPastDate(date: string): boolean {
  const today = startOfDay(new Date());
  const targetDate = startOfDay(parseISO(date));
  return isBefore(targetDate, today);
}

