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
          const uniqueKey = activity.entry_id || activity.window_title_id || activity.id || `activity-${index}`
          return (
            <ActivityItem key={uniqueKey} activity={activity} index={index} />
          )
        })}
      </div>
    </div>
  )
}

