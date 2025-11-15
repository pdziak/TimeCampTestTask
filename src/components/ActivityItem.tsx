import type { Activity } from '../api/timecamp'

interface ActivityItemProps {
  activity: Activity
  index: number
}

export function ActivityItem({ activity, index }: ActivityItemProps) {
  const displayName = activity.name || `Activity ${index + 1}`

  return (
    <div className="activity-item">
      <h3>{displayName}</h3>
      <pre>{JSON.stringify(activity, null, 2)}</pre>
    </div>
  )
}

