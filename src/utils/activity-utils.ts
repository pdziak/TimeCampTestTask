import type { Activity } from '../api/types';
import { calculateTimeDifference } from './date-utils';

function extractDuration(activity: Activity): number {
  const duration = 
    activity.time_span ?? 
    activity.duration ?? 
    activity.time ?? 
    activity.duration_seconds ?? 
    activity.time_spent ?? 
    0;
  
  if (duration > 0) {
    return typeof duration === 'number' ? duration : 0;
  }

  if (activity.start_time && activity.end_time) {
    return calculateTimeDifference(activity.start_time, activity.end_time);
  }
  
  return 0;
}

export function calculateTotalTime(activities: Activity[]): number {
  return activities.reduce((total, activity) => {
    return total + extractDuration(activity);
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

