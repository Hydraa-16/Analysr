import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="1" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    to: '/upload',
    label: 'New Analysis',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 6v6M6 9h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/history',
    label: 'History',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 5v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 16c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

// Left sidebar navigation — visible on desktop (lg+), hidden on mobile.
// Deep charcoal background per the design spec. Active state highlighted
// with accent teal; inactive items in muted white/gray.
function Sidebar() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-nav-bg shrink-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/8">
        <span className="font-display text-xl font-bold text-white tracking-tight">
          Analysr
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 btn-hover ${
                isActive
                  ? 'bg-accent/15 text-accent'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-white/8">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/8 transition-all duration-150"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M6.5 15H3.5A1.5 1.5 0 0 1 2 13.5v-9A1.5 1.5 0 0 1 3.5 3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12 12l4-3-4-3M16 9H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
