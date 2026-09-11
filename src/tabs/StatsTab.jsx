import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function StatsTab() {
  const [clubs, setClubs] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let interval
    async function load() {
      const { data: clubData } = await supabase.from('clubs').select('*').order('name')
      if (!clubData) return
      setClubs(clubData)
      const results = {}
      for (const c of clubData) {
        const { data } = await supabase.rpc('club_stats', { p_club_id: c.id })
        results[c.id] = data?.[0] || { searching_now: 0, matched_now: 0, total_matches_today: 0 }
      }
      setStats(results)
      setLoading(false)
    }
    load()
    interval = setInterval(load, 8000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="tab-panel">
      <div className="panel">
        <p className="eyebrow">right now</p>
        <h1 className="headline small">club activity</h1>
        {loading && <p className="muted">Loading…</p>}
        <div className="stats-list">
          {clubs.map((c) => {
            const s = stats[c.id] || { searching_now: 0, matched_now: 0, total_matches_today: 0 }
            return (
              <div key={c.id} className="stats-item">
                <div className="stats-header">
                  <span className="club-name">{c.name}</span>
                  <span className="club-city">{c.city}</span>
                </div>
                <div className="stats-row">
                  <div className="stats-figure">
                    <span className="stats-number">{s.searching_now}</span>
                    <span className="stats-label">searching</span>
                  </div>
                  <div className="stats-figure">
                    <span className="stats-number mint">{s.matched_now}</span>
                    <span className="stats-label">matched</span>
                  </div>
                  <div className="stats-figure">
                    <span className="stats-number">{s.total_matches_today}</span>
                    <span className="stats-label">tonight</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
