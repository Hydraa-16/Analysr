import { Link } from 'react-router-dom'
import HistoryCard from './HistoryCard.jsx'

// Skeleton card shown while a page of analyses is loading.
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

// Empty state — two flavours: no analyses at all yet, or no results for the
// current search/filter combination.
function EmptyState({ hasActiveFilters, onClearFilters }) {
  if (hasActiveFilters) {
    return (
      <div className="bg-surface border border-dashed border-border rounded-card p-10 flex flex-col items-center text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" stroke="#0ABFA3" strokeWidth="1.5" />
            <path d="M20 20l-4.5-4.5" stroke="#0ABFA3" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-text-primary mb-1">No matching analyses</p>
          <p className="text-sm text-text-secondary max-w-xs">
            Try a different search term or clear your filters.
          </p>
        </div>
        <button
          onClick={onClearFilters}
          className="btn-hover text-sm font-medium text-accent hover:text-accent/80 mt-1"
        >
          Clear filters
        </button>
      </div>
    )
  }

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
          Once you analyse a report, it'll show up here so you can revisit it anytime.
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

// Buckets analyses into labeled date groups: Today, Yesterday, This week,
// This month, and Earlier (by month). Assumes analyses are already sorted
// newest-first, so groups come out in the right order naturally.
function groupByDate(analyses) {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfWeek.getDate() - 7)
  const startOfMonth = new Date(startOfToday)
  startOfMonth.setDate(startOfMonth.getDate() - 30)

  const groups = new Map()

  for (const analysis of analyses) {
    const date = new Date(analysis.created_at)
    let label

    if (date >= startOfToday) label = 'Today'
    else if (date >= startOfYesterday) label = 'Yesterday'
    else if (date >= startOfWeek) label = 'This week'
    else if (date >= startOfMonth) label = 'This month'
    else label = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

    if (!groups.has(label)) groups.set(label, [])
    groups.get(label).push(analysis)
  }

  return Array.from(groups.entries())
}

// HistoryList — presentational list of past analyses grouped by date.
// Handles its own loading skeleton, empty state, and "load more" affordance.
// All data-fetching (search, filters, pagination) lives in HistoryPage;
// this component just renders whatever it's given.
// Props:
//   analyses       — array of analysis rows to render
//   loading        — true during the initial fetch (shows skeletons)
//   loadingMore     — true while fetching an additional page
//   hasMore         — whether more pages exist
//   onLoadMore      — callback to fetch the next page
//   hasActiveFilters — whether a search term or urgency filter is applied
//   onClearFilters   — callback to reset search/filter state
function HistoryList({
  analyses,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  hasActiveFilters,
  onClearFilters,
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (analyses.length === 0) {
    return <EmptyState hasActiveFilters={hasActiveFilters} onClearFilters={onClearFilters} />
  }

  const groups = groupByDate(analyses)

  return (
    <div className="flex flex-col gap-6">
      {groups.map(([label, items]) => (
        <section key={label} aria-label={label}>
          <p className="section-label mb-3">{label}</p>
          <div className="flex flex-col gap-3">
            {items.map((analysis, i) => (
              <div
                key={analysis.id}
                className="animate-fade-up"
                style={{ animationDelay: `${Math.min(i, 6) * 80}ms` }}
              >
                <HistoryCard analysis={analysis} />
              </div>
            ))}
          </div>
        </section>
      ))}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="btn-hover text-sm font-medium px-5 py-2.5 rounded-full border border-border bg-surface text-text-primary hover:border-accent/40 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}

export default HistoryList
