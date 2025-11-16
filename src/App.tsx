import { useState, useEffect, useMemo, useRef } from 'react'
import './App.css'
import { fetchActivity, calculateTotalTime, formatTime, type Activity } from './api/timecamp'
import { ActivityForm } from './components/ActivityForm'
import { ActivitySummary } from './components/ActivitySummary'
import { ActivityList } from './components/ActivityList'
import { ErrorMessage } from './components/ErrorMessage'
import { LoadingMessage } from './components/LoadingMessage'
import { InfoMessage } from './components/InfoMessage'

function App() {
  const [apiToken, setApiToken] = useState<string>('')
  const [date, setDate] = useState<string>(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [fetchedDate, setFetchedDate] = useState<string>('')
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [hasFetched, setHasFetched] = useState<boolean>(false)
  const fetchingRef = useRef<string | null>(null)

  useEffect(() => {
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

    const requestKey = `${apiToken}-${date}`
    
    if (fetchingRef.current === requestKey) {
      return
    }

    if (loading) {
      return
    }

    fetchingRef.current = requestKey
    setLoading(true)
    setError(null)
    setActivities([])
    setHasFetched(false)

    try {
      const data = await fetchActivity(apiToken, date)
      setActivities(data)
      setFetchedDate(date)
      setHasFetched(true)
      localStorage.setItem('timecamp_api_token', apiToken)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activity data')
      setActivities([])
      setHasFetched(false)
    } finally {
      setLoading(false)
      fetchingRef.current = null
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
        
        <ActivityForm
          apiToken={apiToken}
          date={date}
          loading={loading}
          onTokenChange={handleTokenChange}
          onDateChange={handleDateChange}
          onFetch={handleFetchData}
        />

        {error && <ErrorMessage message={error} />}

        {loading && <LoadingMessage />}

        {activities.length > 0 && (
          <>
            <ActivitySummary
              totalTime={formattedTime}
              totalActivities={activities.length}
              date={fetchedDate}
            />
            <ActivityList activities={activities} />
          </>
        )}

        {!loading && !error && activities.length === 0 && hasFetched && (
          <InfoMessage message="No activities recorded" />
        )}

        {!loading && !error && activities.length === 0 && !hasFetched && apiToken && (
          <InfoMessage message='Click "Fetch Activity" to load data from TimeCamp API' />
        )}
      </div>
    </div>
  )
}

export default App
