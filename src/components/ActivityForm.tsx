import React from 'react'

interface ActivityFormProps {
  apiToken: string
  date: string
  loading: boolean
  onTokenChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFetch: () => void
}

export function ActivityForm({
  apiToken,
  date,
  loading,
  onTokenChange,
  onDateChange,
  onFetch,
}: ActivityFormProps) {
  return (
    <div className="api-token-section">
      <label htmlFor="api-token">API Token:</label>
      <input
        id="api-token"
        type="password"
        value={apiToken}
        onChange={onTokenChange}
        placeholder="Enter your TimeCamp API token"
        disabled={loading}
      />
      <label htmlFor="date">Date:</label>
      <input
        id="date"
        type="date"
        value={date}
        onChange={onDateChange}
        disabled={loading}
        required
      />
      <button 
        onClick={onFetch} 
        disabled={loading || !apiToken.trim() || !date.trim()}
      >
        {loading ? 'Loading...' : 'Fetch Activity'}
      </button>
    </div>
  )
}

