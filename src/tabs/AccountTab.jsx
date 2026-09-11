import { useState, useEffect } from 'react'
import { supabase, getDeviceId } from '../supabase'

export default function AccountTab() {
  const [quota, setQuota] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const deviceId = getDeviceId()
    supabase
      .from('usage_quota')
      .select('*')
      .eq('device_id', deviceId)
      .maybeSingle()
      .then(({ data }) => {
        setQuota(data)
        setLoading(false)
      })
  }, [])

  const used = quota?.matches_used || 0
  const isPremium = quota?.is_premium && (!quota.premium_until || new Date(quota.premium_until) > new Date())
  const remaining = isPremium ? null : Math.max(0, 3 - used)

  return (
    <div className="tab-panel">
      <div className="panel">
        <p className="eyebrow">your plan</p>
        <h1 className="headline small">account</h1>

        {loading && <p className="muted">Loading…</p>}

        {!loading && (
          <div className="account-card">
            <div className="account-status">
              <span className="account-status-label">{isPremium ? 'Premium' : 'Free'}</span>
              {!isPremium && <span className="account-status-sub">{remaining} of 3 matches left this month</span>}
              {isPremium && <span className="account-status-sub">Unlimited matches</span>}
            </div>
          </div>
        )}

        {!isPremium && (
          <div className="premium-card">
            <p className="eyebrow">go premium</p>
            <h2 className="headline small" style={{ marginBottom: 10 }}>
              unlimited matches, every night
            </h2>
            <p className="muted">3 free check-ins a month is plenty to try it. Premium removes the cap entirely.</p>
            <button className="primary-btn" style={{ marginTop: 18 }} disabled>
              Upgrade — coming soon
            </button>
            <p className="fine-print" style={{ marginTop: 10 }}>
              Payments aren't wired up yet — plug in Stripe here when ready.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
