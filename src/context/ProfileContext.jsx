import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../services/supabaseClient.js'
import { useAuth } from './AuthContext.jsx'

const ProfileContext = createContext(undefined)

// Holds the user's medical profile (conditions, medications, lifestyle, etc.).
// This data is fetched once per session and reused everywhere it's needed —
// most importantly, passed silently to Gemini on every analysis (per the locked spec).
export function ProfileProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    // AuthContext hasn't finished checking for an existing session yet
    // (e.g. right after a page refresh). `user` is momentarily null in this
    // window even for a logged-in person — treating that as "logged out"
    // would lock in a blank profile before the real session/profile loads.
    // Wait for auth to settle before deciding either way.
    if (authLoading) return

    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    // A missing profile row is expected for a brand new user (Option B —
    // no setup gate), so we don't treat "not found" as a hard error here.
    if (error) {
  console.log("SUPABASE FULL ERROR =", error)
    }

    setProfile(data ?? null)
    setLoading(false)
  }, [user, authLoading])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // Exposed so the Profile screen (Milestone 9) can refresh local state
  // immediately after a save, without refetching from Supabase every time.
  const updateLocalProfile = (updatedFields) => {
    setProfile((prev) => ({ ...prev, ...updatedFields }))
  }

  return (
    <ProfileContext.Provider value={{ profile, loading, refetchProfile: fetchProfile, updateLocalProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}