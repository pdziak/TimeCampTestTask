export interface Activity {
  id?: number;
  name?: string;
  duration?: number;
  time?: number;
  duration_seconds?: number;
  time_spent?: number;
  time_span?: number;
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

