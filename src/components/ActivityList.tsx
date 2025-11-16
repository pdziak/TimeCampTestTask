import type { Activity } from '../api/timecamp'
import { ActivityItem } from './ActivityItem'

interface ActivityListProps {
  activities: Activity[]
}

export function ActivityList({ activities }: ActivityListProps) {
  return (
    <div className="activities-section">
      <h2>Activities ({activities.length})</h2>
      <div className="activities-list">
        {activities.map((activity, index) => {
          // Create a truly unique key by combining multiple fields with index as fallback
          const keyParts = [
            activity.entry_id,
            activity.window_title_id,
            activity.id,
            activity.start_time,
            activity.end_time,
            index
          ].filter(Boolean);
          const uniqueKey = keyParts.length > 0 
            ? keyParts.join('-') 
            : `activity-${index}`;
          return (
            <ActivityItem key={uniqueKey} activity={activity} index={index} />
          )
        })}
      </div>
    </div>
  )
}

