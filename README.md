# ClubMatch

Dead-simple anonymous club matching app. Pick a club, get a random username, get matched with the closest-age person there looking for the same thing. No chat, no photos — find each other in person. Everything resets nightly.

## Stack
- React + Vite (frontend)
- Supabase (Postgres + RPC functions for matching, quota, stats)
- Deployed on Vercel

## Setup
1. `npm install`
2. Supabase project is already provisioned — connection details live in `src/supabase.js`. Swap in your own project's URL/anon key if you fork the backend too.
3. `npm run dev`

## Database
Schema + functions are in Supabase (not checked into this repo yet — see `supabase/` if you export migrations). Core tables:
- `clubs` — venues
- `checkins` — nightly check-ins, expire ~18h after creation
- `matches` — permanent match history (used for stats + no-repeat-same-night logic)
- `usage_quota` — per-device monthly freemium quota (3 free matches/month)

Key RPC functions:
- `try_match(checkin_id)` — atomic matching, excludes same-night repeat matches
- `check_and_use_quota(device_id)` — freemium gate, called on check-in submit
- `club_stats(club_id, date)` — live searching/matched/total counts per club

## TODO before real launch
- Wire Stripe for premium upgrade (AccountTab.jsx has the placeholder button)
- Schedule `cleanup_expired_checkins()` via pg_cron or a Vercel cron
- Age-tolerance widening if no match found after N minutes
- Basic anti-abuse / rate limiting on check-ins
