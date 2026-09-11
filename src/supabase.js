import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ecwdeyiwwzwlhgtdvmjy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjd2RleWl3d3p3bGhndGR2bWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNjIzNDgsImV4cCI6MjEwNDczODM0OH0.4Wevd5OsaIR95nl_YOfB2trfAvjugu2WDbHqu7ZXBao'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export function getDeviceId() {
  let id = localStorage.getItem('cm_device_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('cm_device_id', id)
  }
  return id
}
