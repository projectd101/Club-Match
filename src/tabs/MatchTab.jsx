import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase, getDeviceId } from '../supabase'
import { generateUsername } from '../username'

const STAGE = { PICK_CLUB: 'pick_club', FORM: 'form', SEARCHING: 'searching', MATCHED: 'matched', LOCKED: 'locked' }

export default function MatchTab({ onMatchComplete }) {
  const [stage, setStage] = useState(STAGE.PICK_CLUB)
  const [clubs, setClubs] = useState([])
  const [selectedClub, setSelectedClub] = useState(null)
  const [gender, setGender] = useState('')
  const [lookingFor, setLookingFor] = useState('')
  const [age, setAge] = useState('')
  const [bio, setBio] = useState('')
  const [types, setTypes] = useState('')
  const [checkin, setCheckin] = useState(null)
  const [matchedUsername, setMatchedUsername] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [quota, setQuota] = useState(null)
  const pollRef = useRef(null)

  useEffect(() => {
    supabase.from('clubs').select('*').order('name').then(({ data }) => {
      if (data) setClubs(data)
    })
  }, [])

  const attemptMatch = useCallback(async (checkinId) => {
    const { data, error } = await supabase.rpc('try_match', { p_checkin_id: checkinId })
    if (error) return
    const result = data?.[0]
    if (result?.matched) {
      setMatchedUsername(result.matched_username)
      setStage(STAGE.MATCHED)
      clearInterval(pollRef.current)
      onMatchComplete?.()
    }
  }, [onMatchComplete])

  useEffect(() => {
    if (stage === STAGE.SEARCHING && checkin) {
      attemptMatch(checkin.id)
      pollRef.current = setInterval(() => attemptMatch(checkin.id), 3000)
      return () => clearInterval(pollRef.current)
    }
  }, [stage, checkin, attemptMatch])

  async function handleSubmitForm(e) {
    e.preventDefault()
    setError('')
    const ageNum = parseInt(age, 10)
    if (!gender || !lookingFor) return setError("Pick your gender and who you're looking for.")
    if (!ageNum || ageNum < 18 || ageNum > 99) return setError('Enter a valid age (18+).')

    setLoading(true)
    const deviceId = getDeviceId()

    const { data: quotaData, error: quotaError } = await supabase.rpc('check_and_use_quota', { p_device_id: deviceId })
    if (quotaError) {
      setLoading(false)
      return setError('Something went wrong checking your plan. Try again.')
    }
    const q = quotaData?.[0]
    if (!q?.allowed) {
      setLoading(false)
      setQuota(q)
      setStage(STAGE.LOCKED)
      return
    }
    setQuota(q)

    const username = generateUsername()
    const { data, error: insertError } = await supabase
      .from('checkins')
      .insert({
        device_id: deviceId,
        club_id: selectedClub.id,
        username,
        gender,
        looking_for: lookingFor,
        age: ageNum,
        bio: bio.trim() || null,
        types: types.trim() || null,
      })
      .select()
      .single()

    setLoading(false)
    if (insertError) return setError('Something went wrong. Try again.')
    setCheckin(data)
    setStage(STAGE.SEARCHING)
  }

  async function cancelSearch() {
    clearInterval(pollRef.current)
    if (checkin) {
      await supabase.from('checkins').update({ status: 'left' }).eq('id', checkin.id)
    }
    setCheckin(null)
    setStage(STAGE.PICK_CLUB)
    setSelectedClub(null)
  }

  function startOver() {
    setCheckin(null)
    setMatchedUsername(null)
    setSelectedClub(null)
    setGender('')
    setLookingFor('')
    setAge('')
    setBio('')
    setTypes('')
    setStage(STAGE.PICK_CLUB)
  }

  return (
    <div className="tab-panel">
      {stage === STAGE.PICK_CLUB && (
        <div className="panel">
          <p className="eyebrow">where are you tonight</p>
          <h1 className="headline">pick your club</h1>
          <div className="club-list">
            {clubs.map((c) => (
              <button
                key={c.id}
                className="club-item"
                onClick={() => {
                  setSelectedClub(c)
                  setStage(STAGE.FORM)
                }}
              >
                <span className="club-name">{c.name}</span>
                <span className="club-city">{c.city}</span>
              </button>
            ))}
            {clubs.length === 0 && <p className="muted">Loading clubs…</p>}
          </div>
        </div>
      )}

      {stage === STAGE.FORM && selectedClub && (
        <div className="panel">
          <button className="back-link" onClick={() => setStage(STAGE.PICK_CLUB)}>
            ← {selectedClub.name}
          </button>
          <h1 className="headline small">a few details</h1>
          <form className="form" onSubmit={handleSubmitForm}>
            <div className="field-row">
              <label>I am</label>
              <div className="pill-group">
                <button type="button" className={`pill ${gender === 'male' ? 'active' : ''}`} onClick={() => setGender('male')}>
                  Male
                </button>
                <button type="button" className={`pill ${gender === 'female' ? 'active' : ''}`} onClick={() => setGender('female')}>
                  Female
                </button>
              </div>
            </div>
            <div className="field-row">
              <label>Looking for</label>
              <div className="pill-group">
                <button type="button" className={`pill ${lookingFor === 'male' ? 'active' : ''}`} onClick={() => setLookingFor('male')}>
                  Male
                </button>
                <button type="button" className={`pill ${lookingFor === 'female' ? 'active' : ''}`} onClick={() => setLookingFor('female')}>
                  Female
                </button>
              </div>
            </div>
            <div className="field-row">
              <label htmlFor="age">Age</label>
              <input
                id="age"
                type="number"
                min="18"
                max="99"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="24"
                className="text-input"
              />
            </div>
            <div className="field-row">
              <label htmlFor="bio">
                Bio <span className="optional">optional</span>
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Two sentences, tops."
                className="text-area"
                maxLength={140}
              />
            </div>
            <div className="field-row">
              <label htmlFor="types">
                What you're into <span className="optional">optional</span>
              </label>
              <input
                id="types"
                type="text"
                value={types}
                onChange={(e) => setTypes(e.target.value)}
                placeholder="e.g. tall, funny, into house music"
                className="text-input"
              />
            </div>
            {error && <p className="error-text">{error}</p>}
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Checking in…' : 'Check in & find a match'}
            </button>
          </form>
        </div>
      )}

      {stage === STAGE.SEARCHING && (
        <div className="panel panel-center">
          <div className="pulse-ring" />
          <p className="eyebrow">at {selectedClub?.name}</p>
          <h1 className="headline">looking for your match…</h1>
          <p className="muted">Keep this open. We'll match you the second someone right shows up.</p>
          {quota && quota.remaining >= 0 && (
            <p className="fine-print">{quota.remaining} free match{quota.remaining === 1 ? '' : 'es'} left this month</p>
          )}
          <button className="ghost-btn" onClick={cancelSearch}>
            Leave the search
          </button>
        </div>
      )}

      {stage === STAGE.MATCHED && (
        <div className="panel panel-center matched">
          <p className="eyebrow">it's a match</p>
          <h1 className="headline huge">{matchedUsername}</h1>
          <p className="muted">
            That's their name for tonight, at {selectedClub?.name}. Find them yourself — grab a mic, ask around, whatever it takes.
          </p>
          <p className="fine-print">This disappears in the morning. No chat, no photos, just the hunt.</p>
          <button className="ghost-btn" onClick={startOver}>
            Done for tonight
          </button>
        </div>
      )}

      {stage === STAGE.LOCKED && (
        <div className="panel panel-center">
          <p className="eyebrow">out of free matches</p>
          <h1 className="headline">you've used your 3 free matches this month</h1>
          <p className="muted">Go premium for unlimited matching, every night.</p>
          <button className="primary-btn" style={{ marginTop: 20 }} onClick={() => setStage(STAGE.PICK_CLUB)}>
            See premium
          </button>
        </div>
      )}
    </div>
  )
}
