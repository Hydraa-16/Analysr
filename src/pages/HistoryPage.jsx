import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../services/supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useDebounce } from '../hooks/useDebounce.js'
import Sidebar from '../components/dashboard/Sidebar.jsx'
import BottomNav from '../components/dashboard/BottomNav.jsx'
import HistoryList from '../components/history/HistoryList.jsx'
import Disclaimer from '../components/common/Disclaimer.jsx'

const PAGE_SIZE = 10

const URGENCY_FILTERS = ['All', 'Routine', 'Follow up soon', 'Seek care promptly']

// Escapes characters that would otherwise break a Supabase ilike/or() pattern.
function sanitizeSearchTerm(term) {
  return term.trim().replace(/[%,]/g, '')
}

// HistoryPage — full browsable list of a user's past analyses.
// Supports server-side search (report type, specialty, filename), urgency
// filtering, and range-based pagination so the query stays cheap as a
// user's history grows.
function HistoryPage() {
  const { user } = useAuth()

  const [analyses, setAnalyses] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  const [hasMore, setHasMore] = useState(false)

  const [searchInput, setSearchInput] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState('All')
  const debouncedSearch = useDebounce(searchInput, 400)

  // Guards against a slow, stale request overwriting a newer one when the
  // user types quickly or switches filters mid-flight.
  const requestId = useRef(0)

  const buildQuery = useCallback(
    (from, to) => {
      let query = supabase
        .from('analyses')
        .select('id, report_type, specialty, urgency, created_at, original_filename', {
          count: 'exact',
        })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to)

      const term = sanitizeSearchTerm(debouncedSearch)
      if (term) {
        query = query.or(
          `report_type.ilike.%${term}%,specialty.ilike.%${term}%,original_filename.ilike.%${term}%`
        )
      }

      if (urgencyFilter !== 'All') {
        query = query.eq('urgency', urgencyFilter)
      }

      return query
    },
    [user, debouncedSearch, urgencyFilter]
  )

  // Initial fetch + refetch whenever search term or urgency filter changes.
  useEffect(() => {
    if (!user) return

    const thisRequest = ++requestId.current
    setLoading(true)
    setFetchError(null)

    const fetchFirstPage = async () => {
      const { data, error, count } = await buildQuery(0, PAGE_SIZE - 1)

      if (thisRequest !== requestId.current) return // stale response, ignore

      if (error) {
        console.error('Failed to load analysis history:', error.message)
        setFetchError('Could not load your history. Please refresh the page.')
        setAnalyses([])
        setTotalCount(0)
        setHasMore(false)
      } else {
        const rows = data ?? []
        setAnalyses(rows)
        setTotalCount(count ?? rows.length)
        setHasMore((count ?? 0) > rows.length)
      }

      setLoading(false)
    }

    fetchFirstPage()
  }, [user, buildQuery])

  const handleLoadMore = async () => {
    setLoadingMore(true)
    const from = analyses.length
    const to = from + PAGE_SIZE - 1

    const { data, error, count } = await buildQuery(from, to)

    if (error) {
      console.error('Failed to load more analyses:', error.message)
      setFetchError('Could not load more analyses. Please try again.')
    } else {
      const rows = data ?? []
      setAnalyses((prev) => [...prev, ...rows])
      setTotalCount(count ?? 0)
      setHasMore((count ?? 0) > analyses.length + rows.length)
    }

    setLoadingMore(false)
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setUrgencyFilter('All')
  }

  const hasActiveFilters = debouncedSearch.trim() !== '' || urgencyFilter !== 'All'

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 px-5 py-6 lg:px-10 lg:py-8 pb-24 lg:pb-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto lg:mx-0">

          {/* Header */}
          <header className="mb-6">
            <span className="section-label mb-3 inline-block">History</span>
            <h1 className="text-2xl font-display font-bold text-text-primary leading-tight">
              Your analyses
            </h1>
            {!loading && (
              <p className="text-sm text-text-secondary mt-1">
                {totalCount === 0
                  ? 'No analyses yet'
                  : `${totalCount} analysis${totalCount === 1 ? '' : 'es'} total`}
              </p>
            )}
          </header>

          {/* Search */}
          <div className="relative mb-4">
            <svg
              width="16"
              height="16"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            >
              <circle cx="8" cy="8" r="6" stroke="#6B7A8D" strokeWidth="1.5" />
              <path d="M15 15l-3-3" stroke="#6B7A8D" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by report type, specialty, or filename"
              className="w-full bg-surface border border-border rounded-card pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
              aria-label="Search analysis history"
            />
          </div>

          {/* Urgency filter chips */}
          <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Filter by urgency">
            {URGENCY_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setUrgencyFilter(filter)}
                className={`btn-hover text-xs font-medium px-3.5 py-1.5 rounded-full border transition-colors duration-150 ${
                  urgencyFilter === filter
                    ? 'bg-nav-bg text-white border-nav-bg'
                    : 'bg-surface text-text-secondary border-border hover:border-accent/40'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Results */}
          {fetchError ? (
            <div className="bg-flag-high/8 border border-flag-high/20 rounded-card px-5 py-4">
              <p className="text-sm text-flag-high">{fetchError}</p>
            </div>
          ) : (
            <HistoryList
              analyses={analyses}
              loading={loading}
              loadingMore={loadingMore}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
            />
          )}

          <div className="mt-10">
            <Disclaimer compact />
          </div>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  )
}

export default HistoryPage
