import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient.js'

const AuthContext = createContext(undefined)

// Handles the full auth lifecycle: checks for an existing session on load,
// listens for sign-in/sign-out events, and exposes auth methods to the whole app.
// This directly addresses Risk 9 — sessions disappearing after a page refresh.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // On first load, ask Supabase if a session already exists
    // (e.g. user refreshed the page or returned later).
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Keep state in sync with login/logout/token refresh events
    // that happen while the app is open.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // Email + password sign-in. Returns { error } — null error means success.
  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  // Email + password sign-up. Returns { error } — null error means success.
  // No profile setup gate — users go straight to /dashboard per spec Option B.
  const signUp = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  // Google OAuth — redirects the browser to Google then back to /dashboard.
  // Gracefully returns an error if OAuth is not yet configured in Supabase.
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — components call useAuth() instead of useContext(AuthContext) directly.
// Throws clearly if used outside the provider, catching mistakes early.
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
