import { useState } from 'react'
import { Link } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
]

function Navbar({ ctaPath = '/signup' }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
      <nav className="max-w-6xl mx-auto px-5 md:px-8 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" className="font-display text-xl md:text-2xl font-semibold text-text-primary">
          Analysr
        </Link>

        {/* Center nav links — desktop only */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Log in
          </Link>
          <Link
            to={ctaPath}
            className="btn-hover inline-flex items-center rounded-full bg-nav-bg text-white text-sm font-medium px-5 py-2.5"
          >
            Analyse a report
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
          className="md:hidden flex flex-col gap-1.5 p-2 -mr-2"
        >
          <span className="block w-5 h-0.5 bg-text-primary" />
          <span className="block w-5 h-0.5 bg-text-primary" />
        </button>
      </nav>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-5 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-sm text-text-secondary"
            >
              {link.label}
            </a>
          ))}
          <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm text-text-secondary">
            Log in
          </Link>
          <Link
            to={ctaPath}
            onClick={() => setMobileOpen(false)}
            className="inline-flex items-center justify-center rounded-full bg-nav-bg text-white text-sm font-medium px-5 py-3"
          >
            Analyse a report
          </Link>
        </div>
      )}
    </header>
  )
}

export default Navbar
