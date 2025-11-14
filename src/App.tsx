import { useState, useEffect, useMemo } from 'react'
import './App.css'
import { fetchActivity, calculateTotalTime, formatTime, type Activity } from './api/timecamp'

function App() {
  const [apiToken, setApiToken] = useState<string>('')
  const [date, setDate] = useState<string>(() => {
    // Default to today's date in YYYY-MM-DD format
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load API token from localStorage if available
    const savedToken = localStorage.getItem('timecamp_api_token')
    if (savedToken) {
      setApiToken(savedToken)
    }
  }, [])

  const handleFetchData = async () => {
    if (!apiToken.trim()) {
      setError('Please enter your API token')
      return
    }

    if (!date.trim()) {
      setError('Please select a date')
      return
    }

    setLoading(true)
    setError(null)
    setActivities([])

    try {
      const data = await fetchActivity(apiToken, date)
      setActivities(data)
      // Save token to localStorage for convenience
      localStorage.setItem('timecamp_api_token', apiToken)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activity data')
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiToken(e.target.value)
    setError(null)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value)
    setError(null)
  }

  // Calculate total time spent
  const totalTimeSeconds = useMemo(() => {
    return calculateTotalTime(activities)
  }, [activities])

  const formattedTime = useMemo(() => {
    return formatTime(totalTimeSeconds)
  }, [totalTimeSeconds])

  return (
    <div className="app">
      <div className="container">
        <h1>TimeCamp Activity Fetcher</h1>
        
        <div className="api-token-section">
          <label htmlFor="api-token">API Token:</label>
          <input
            id="api-token"
            type="password"
            value={apiToken}
            onChange={handleTokenChange}
            placeholder="Enter your TimeCamp API token"
            disabled={loading}
          />
          <label htmlFor="date">Date:</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={handleDateChange}
            disabled={loading}
            required
          />
          <button 
            onClick={handleFetchData} 
            disabled={loading || !apiToken.trim() || !date.trim()}
          >
            {loading ? 'Loading...' : 'Fetch Activity'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading && (
          <div className="loading-message">Loading activity data...</div>
        )}

        {activities.length > 0 && (
          <>
            <div className="summary-section">
              <h2>Time Summary</h2>
              <div className="summary-card">
                <div className="summary-item">
                  <span className="summary-label">Total Time on Computer:</span>
                  <span className="summary-value">{formattedTime}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Activities:</span>
                  <span className="summary-value">{activities.length}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Date:</span>
                  <span className="summary-value">{new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>
            </div>

            <div className="activities-section">
              <h2>Activities ({activities.length})</h2>
            <div className="activities-list">
              {activities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <h3>{activity.name || `Activity #${activity.id}`}</h3>
                  <pre>{JSON.stringify(activity, null, 2)}</pre>
                </div>
              ))}
            </div>
          </div>
          </>
        )}

        {!loading && !error && activities.length === 0 && apiToken && (
          <div className="info-message">
            Click "Fetch Activity" to load data from TimeCamp API
          </div>
        )}
      </div>
    </div>
  )
}

export default App
