import { createClient } from '@supabase/supabase-js'

// Single Supabase client instance shared across the entire app.
// Keys come from environment variables only — never hardcoded (per project rules).
// The anon key is safe to expose in frontend code by design (Supabase's model);
// it is NOT the same as the Gemini key, which must stay server-side only (see api/analyse.js).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Check .env.local for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})