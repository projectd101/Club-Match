import { useState } from 'react'
import MatchTab from './tabs/MatchTab'
import HistoryTab from './tabs/HistoryTab'
import StatsTab from './tabs/StatsTab'
import AccountTab from './tabs/AccountTab'
import './app.css'

const TABS = [
  { id: 'match', label: 'Match' },
  { id: 'history', label: 'History' },
  { id: 'stats', label: 'Clubs' },
  { id: 'account', label: 'Account' },
]

export default function App() {
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [activeTab, setActiveTab] = useState('match')
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)

  if (!ageConfirmed) {
    return (
      <div className="stage-root">
        <div className="panel panel-center">
          <p className="eyebrow">before you go in</p>
          <h1 className="headline">this app is for adults at clubs, 18 and over.</h1>
          <label className="check-row">
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) setAgeConfirmed(true)
              }}
            />
            <span>I confirm I'm 18 or older</span>
          </label>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="app-content">
        {activeTab === 'match' && <MatchTab onMatchComplete={() => setHistoryRefreshKey((k) => k + 1)} />}
        {activeTab === 'history' && <HistoryTab key={historyRefreshKey} />}
        {activeTab === 'stats' && <StatsTab />}
        {activeTab === 'account' && <AccountTab />}
      </div>
      <nav className="tab-bar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
