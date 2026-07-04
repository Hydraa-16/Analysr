import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import LoginForm from '../components/auth/LoginForm.jsx'
import Disclaimer from '../components/common/Disclaimer.jsx'

// Full login page — splits screen on desktop (brand left, form right).
// Redirects to /dashboard if user is already signed in.
function LoginPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, loading, navigate])

  if (loading) return null

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <div className="hidden md:flex flex-col justify-between bg-nav-bg text-white w-[420px] shrink-0 p-10">
        <Link to="/" className="font-display text-2xl font-semibold text-white">
          Analysr
        </Link>
        <div>
          <h2 className="font-display text-4xl leading-[1.15]">
            <span className="block text-white/40">Your results,</span>
            <span className="block font-bold text-white">explained clearly.</span>
          </h2>
          <p className="mt-4 text-sm text-white/50 leading-relaxed max-w-xs">
            Upload any medical report and get a plain-English breakdown alongside
            the clinical terms — free, instant, and private.
          </p>
        </div>
        <p className="text-xs text-white/30">Free to use. No credit card required.</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 md:px-12">
        <Link to="/" className="md:hidden font-display text-xl font-semibold text-text-primary mb-10">
          Analysr
        </Link>
        <div className="w-full max-w-sm">
          <div className="mb-8 scroll-reveal is-visible">
            <span className="section-label font-mono">Welcome back</span>
            <h1 className="font-display text-3xl mt-3 leading-tight">
              <span className="headline-muted block">Sign in to</span>
              <span className="headline-strong block">your account</span>
            </h1>
          </div>
          <LoginForm />
          <div className="mt-8">
            <Disclaimer compact />
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
