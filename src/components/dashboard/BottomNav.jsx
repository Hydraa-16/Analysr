import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Home',
    icon: (
      <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="1" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    to: '/upload',
    label: 'Analyse',
    icon: (
      <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 6v6M6 9h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    primary: true,
  },
  {
    to: '/history',
    label: 'History',
    icon: (
      <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 5v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (
      <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 16c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

// Mobile bottom navigation — replaces the sidebar on screens below lg.
// Fixed to the bottom of the viewport with safe-area inset for iOS home bar.
function BottomNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-nav-bg border-t border-white/10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors duration-150 ${
                isActive
                  ? 'text-accent'
                  : item.primary
                  ? 'text-white'
                  : 'text-white/50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`p-1.5 rounded-xl transition-colors duration-150 ${
                    isActive ? 'bg-accent/15' : item.primary ? 'bg-white/10' : ''
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
