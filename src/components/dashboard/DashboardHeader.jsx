import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useProfile } from '../../context/ProfileContext.jsx'

// Derives a time-appropriate greeting (Good morning / afternoon / evening).
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

// Top header bar inside the main content area.
// Shows a personalised greeting using the user's profile name (or email fallback)
// and a primary CTA to start a new analysis.
function DashboardHeader() {
  const { user } = useAuth()
  const { profile } = useProfile()

  // Prefer profile name → email local part → generic fallback
  const displayName = profile?.full_name?.split(' ')[0]
    || user?.email?.split('@')[0]
    || 'there'

  return (
    <header className="flex items-center justify-between gap-4 mb-8">
      <div>
        <p className="text-sm text-text-secondary font-mono mb-0.5">
          {getGreeting()},
        </p>
        <h1 className="text-2xl font-display font-bold text-text-primary leading-tight capitalize">
          {displayName}
        </h1>
      </div>

      <Link
        to="/upload"
        className="btn-hover shrink-0 inline-flex items-center gap-2 bg-nav-bg text-white text-sm font-medium px-5 py-2.5 rounded-full"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="6.25" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 4.5v5M4.5 7h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        New analysis
      </Link>
    </header>
  )
}

export default DashboardHeader
