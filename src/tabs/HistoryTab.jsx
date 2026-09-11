import { useState, useEffect } from 'react'
import { supabase, getDeviceId } from '../supabase'

export default function HistoryTab() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const deviceId = getDeviceId()
    supabase
      .from('matches')
      .select('*, clubs(name)')
      .or(`device_a.eq.${deviceId},device_b.eq.${deviceId}`)
      .order('matched_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setMatches(data || [])
        setLoading(false)
      })
  }, [])

  const deviceId = getDeviceId()

  return (
    <div className="tab-panel">
      <div className="panel">
        <p className="eyebrow">your nights</p>
        <h1 className="headline small">match history</h1>
        {loading && <p className="muted">Loading…</p>}
        {!loading && matches.length === 0 && (
          <p className="muted">No matches yet. Go check in somewhere.</p>
        )}
        <div className="history-list">
          {matches.map((m) => {
            const theirUsername = m.device_a === deviceId ? m.username_b : m.username_a
            const clubName = m.clubs?.name || 'Unknown club'
            const date = new Date(m.matched_at)
            return (
              <div key={m.id} className="history-item">
                <div className="history-main">
                  <span className="history-username">{theirUsername}</span>
                  <span className="history-club">{clubName}</span>
                </div>
                <span className="history-date">
                  {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
