import { useMemo } from 'react'
import './App.css'
import { calculateTotalTime, formatTime } from './api/timecamp'
import { useActivityData } from './hooks/useActivityData'
import { ActivityForm } from './components/ActivityForm'
import { ActivitySummary } from './components/ActivitySummary'
import { ActivityList } from './components/ActivityList'
import { ErrorMessage } from './components/ErrorMessage'
import { LoadingMessage } from './components/LoadingMessage'
import { InfoMessage } from './components/InfoMessage'

function App() {
  const {
    apiToken,
    date,
    activities,
    loading,
    error,
    hasFetched,
    setApiToken,
    setDate,
    fetchData,
  } = useActivityData()

  const totalTimeSeconds = useMemo(() => {
    return calculateTotalTime(activities)
  }, [activities])

  const formattedTime = useMemo(() => {
    return formatTime(totalTimeSeconds)
  }, [totalTimeSeconds])

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiToken(e.target.value)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value)
  }

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
          onFetch={fetchData}
        />

        {error && <ErrorMessage message={error} />}

        {loading && <LoadingMessage />}

        {activities.length > 0 && (
          <>
            <ActivitySummary
              totalTime={formattedTime}
              totalActivities={activities.length}
              date={date}
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
