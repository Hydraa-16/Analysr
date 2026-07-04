import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import OAuthButton from './OAuthButton.jsx'

// Email + password login form with Google OAuth option.
// All auth calls go through AuthContext — this component owns only UI state.
function LoginForm() {
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error: authError } = await signIn(email.trim(), password)

    if (authError) {
      setError(mapAuthError(authError.message))
      setSubmitting(false)
      return
    }

    navigate('/dashboard', { replace: true })
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
          <label htmlFor="login-email" className="text-sm font-medium text-text-primary">
            Email
          </label>
          <input
            id="login-email"
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
          <label htmlFor="login-password" className="text-sm font-medium text-text-primary">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          disabled={submitting || !email || !password}
          className="btn-hover w-full rounded-full bg-nav-bg text-white text-sm font-medium py-3.5 mt-1 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        No account?{' '}
        <Link to="/signup" className="text-text-primary font-medium hover:text-accent transition-colors">
          Create one free
        </Link>
      </p>
    </div>
  )
}

function mapAuthError(message) {
  if (!message) return 'Something went wrong. Please try again.'
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials') || m.includes('invalid credentials'))
    return 'Incorrect email or password. Please try again.'
  if (m.includes('email not confirmed'))
    return 'Please check your email and confirm your account first.'
  if (m.includes('too many requests') || m.includes('rate limit'))
    return 'Too many attempts. Please wait a moment and try again.'
  if (m.includes('network') || m.includes('fetch'))
    return 'Network error. Check your connection and try again.'
  return 'Sign-in failed. Please try again.'
}

export default LoginForm
