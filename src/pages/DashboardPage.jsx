import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'
import Sidebar from '../components/dashboard/Sidebar.jsx'
import BottomNav from '../components/dashboard/BottomNav.jsx'
import DashboardHeader from '../components/dashboard/DashboardHeader.jsx'
import RecentAnalysisCard from '../components/dashboard/RecentAnalysisCard.jsx'
import Disclaimer from '../components/common/Disclaimer.jsx'

const RECENT_LIMIT = 5

// Skeleton card shown while analyses are loading.
function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-card p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-border shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-border rounded w-1/2" />
          <div className="h-3 bg-border rounded w-1/3" />
          <div className="h-3 bg-border rounded w-2/3 mt-3" />
        </div>
      </div>
    </div>
  )
}

// Empty state shown when a user has no analyses yet.
function EmptyState() {
  return (
    <div className="bg-surface border border-dashed border-border rounded-card p-10 flex flex-col items-center text-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
          <path
            d="M9.5 3v8L5 20.5A1.5 1.5 0 0 0 6.5 23h13a1.5 1.5 0 0 0 1.299-2.25L16.5 11V3"
            stroke="#0ABFA3"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M9 3h8" stroke="#0ABFA3" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <p className="font-semibold text-text-primary mb-1">No analyses yet</p>
        <p className="text-sm text-text-secondary max-w-xs">
          Upload a medical report or test result and Analysr will break it down in plain language.
        </p>
      </div>
      <Link
        to="/upload"
        className="btn-hover inline-flex items-center gap-2 bg-nav-bg text-white text-sm font-medium px-5 py-2.5 rounded-full mt-1"
      >
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="6.25" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 4.5v5M4.5 7h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Analyse your first report
      </Link>
    </div>
  )
}

// Stat pill — small at-a-glance number shown in the summary row.
function StatPill({ label, value, color }) {
  return (
    <div className="bg-surface border border-border rounded-card px-4 py-3 flex items-center gap-3">
      <span className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
      <div>
        <p className="text-lg font-bold text-text-primary leading-none">{value}</p>
        <p className="text-xs text-text-secondary mt-0.5">{label}</p>
      </div>
    </div>
  )
}

// DashboardPage — the main post-login home screen.
// Fetches the user's recent analyses from Supabase and renders them.
// Composes the shared app shell (Sidebar on desktop, BottomNav on mobile).
function DashboardPage() {
  const { user } = useAuth()
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  useEffect(() => {
    if (!user) return

    const fetchAnalyses = async () => {
      setLoading(true)
      setFetchError(null)

      const { data, error } = await supabase
        .from('analyses')
        .select('id, report_type, specialty, urgency, created_at, original_filename')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(RECENT_LIMIT)

      if (error) {
        console.error('Failed to load analyses:', error.message)
        setFetchError('Could not load your recent analyses. Please refresh the page.')
      } else {
        setAnalyses(data ?? [])
      }

      setLoading(false)
    }

    fetchAnalyses()
  }, [user])

  // Derive counts for the stat pills
  const totalCount = analyses.length
  const urgentCount = analyses.filter((a) => a.urgency === 'Seek care promptly').length
  const followUpCount = analyses.filter((a) => a.urgency === 'Follow up soon').length

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 px-5 py-6 lg:px-10 lg:py-8 pb-24 lg:pb-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto lg:mx-0">

          <DashboardHeader />

          {/* Stat summary row — only rendered once data is loaded and non-empty */}
          {!loading && analyses.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-8">
              <StatPill label="Recent reports" value={totalCount} color="bg-accent" />
              <StatPill label="Follow up" value={followUpCount} color="bg-flag-borderline" />
              <StatPill label="Urgent" value={urgentCount} color="bg-flag-high" />
            </div>
          )}

          {/* Recent analyses section */}
          <section aria-labelledby="recent-heading" className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="section-label">Recent</span>
                <h2
                  id="recent-heading"
                  className="text-base font-semibold text-text-primary"
                >
                  Your analyses
                </h2>
              </div>
              {!loading && analyses.length > 0 && (
                <Link
                  to="/history"
                  className="text-sm text-accent hover:text-accent/80 font-medium transition-colors"
                >
                  View all
                </Link>
              )}
            </div>

            {fetchError ? (
              <div className="bg-flag-high/8 border border-flag-high/20 rounded-card px-5 py-4">
                <p className="text-sm text-flag-high">{fetchError}</p>
              </div>
            ) : loading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : analyses.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="flex flex-col gap-3">
                {analyses.map((analysis, i) => (
                  <div
                    key={analysis.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <RecentAnalysisCard analysis={analysis} />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Quick action cards */}
          {!loading && (
            <section aria-label="Quick actions" className="mb-8">
              <span className="section-label mb-4 block">Quick actions</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  to="/upload"
                  className="group bg-surface border border-border rounded-card p-5 hover:border-accent/40 hover:shadow-sm transition-all duration-200 flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                      <path d="M9 2v10M5 6l4-4 4 4" stroke="#0ABFA3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 14h14" stroke="#0ABFA3" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary mb-0.5">Upload a report</p>
                    <p className="text-xs text-text-secondary">PDF, PNG, or JPG — up to 10 MB</p>
                  </div>
                </Link>

                <Link
                  to="/history"
                  className="group bg-surface border border-border rounded-card p-5 hover:border-accent/40 hover:shadow-sm transition-all duration-200 flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                      <circle cx="9" cy="9" r="7.5" stroke="#0ABFA3" strokeWidth="1.5" />
                      <path d="M9 5v4l2.5 2.5" stroke="#0ABFA3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary mb-0.5">View history</p>
                    <p className="text-xs text-text-secondary">Browse all past analyses</p>
                  </div>
                </Link>
              </div>
            </section>
          )}

          <Disclaimer />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  )
}

export default DashboardPage
