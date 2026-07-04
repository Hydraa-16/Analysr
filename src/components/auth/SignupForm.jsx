import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import OAuthButton from './OAuthButton.jsx'

// Email + password signup form with Google OAuth option.
// On success, user goes straight to /dashboard — no profile gate (Option B per spec).
function SignupForm() {
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    const { error: authError } = await signUp(email.trim(), password)

    if (authError) {
      setError(mapAuthError(authError.message))
      setSubmitting(false)
      return
    }

    setSuccess(true)
    setSubmitting(false)
    setTimeout(() => navigate('/dashboard', { replace: true }), 1200)
  }

  const handleGoogle = async () => {
    setError(null)
    setOauthLoading(true)

    const { error: authError } = await signInWithGoogle()

    if (authError) {
      setError(
        authError.message.includes('provider is not enabled') ||
        authError.message.includes('not configured')
          ? 'Google sign-in is not yet enabled. Please use email and password.'
          : 'Could not connect to Google. Please try again.'
      )
      setOauthLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-sm mx-auto text-center">
        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 13l4 4L19 7" stroke="#0ABFA3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-text-primary font-medium">Account created!</p>
        <p className="text-sm text-text-secondary mt-1">Taking you to your dashboard…</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <OAuthButton onClick={handleGoogle} loading={oauthLoading} />

      <div className="flex items-center gap-3 my-6">
        <hr className="flex-1 border-border" />
        <span className="text-xs text-text-secondary font-mono">or</span>
        <hr className="flex-1 border-border" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="signup-email" className="text-sm font-medium text-text-primary">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="signup-password" className="text-sm font-medium text-text-primary">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="signup-confirm" className="text-sm font-medium text-text-primary">
            Confirm password
          </label>
          <input
            id="signup-confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-flag-high bg-flag-high/8 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || !email || !password || !confirm}
          className="btn-hover w-full rounded-full bg-nav-bg text-white text-sm font-medium py-3.5 mt-1 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {submitting ? 'Creating account…' : 'Create free account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link to="/login" className="text-text-primary font-medium hover:text-accent transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}

function mapAuthError(message) {
  if (!message) return 'Something went wrong. Please try again.'
  const m = message.toLowerCase()
  if (m.includes('already registered') || m.includes('user already exists'))
    return 'An account with this email already exists. Try signing in instead.'
  if (m.includes('invalid email'))
    return 'Please enter a valid email address.'
  if (m.includes('password') && m.includes('weak'))
    return 'Please choose a stronger password.'
  if (m.includes('too many requests') || m.includes('rate limit'))
    return 'Too many attempts. Please wait a moment and try again.'
  if (m.includes('network') || m.includes('fetch'))
    return 'Network error. Check your connection and try again.'
  return 'Sign-up failed. Please try again.'
}

export default SignupForm
