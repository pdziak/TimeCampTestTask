interface ActivitySummaryProps {
  totalTime: string
  totalActivities: number
  date: string
}

export function ActivitySummary({ totalTime, totalActivities, date }: ActivitySummaryProps) {
  const formattedDate = date 
    ? new Date(date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : ''

  return (
    <div className="summary-section">
      <h2>Time Summary</h2>
      <div className="summary-card">
        <div className="summary-item">
          <span className="summary-label">Total Time on Computer:</span>
          <span className="summary-value">{totalTime}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total Activities:</span>
          <span className="summary-value">{totalActivities}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Date:</span>
          <span className="summary-value">{formattedDate}</span>
        </div>
      </div>
    </div>
  )
}

