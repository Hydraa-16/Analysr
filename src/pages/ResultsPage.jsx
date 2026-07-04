// ResultsPage — the dual-language analysis results screen.
// Loads by /results/:analysisId from Supabase so a refresh never loses state
// (Risk mitigation: analysis ID in URL). Special case: /results/local handles
// the DB-save-failed fallback, reading the result from router nav state instead.
//
// Renders sections in the locked order:
// 1. Report type + specialty   2. Urgency badge   3. Values table
// 4. Key findings   5. What this may indicate (+ disclaimer)
// 6. Recommended next steps   7. Sources referenced
//
// Signature animation: on load, all sections render blurred and resolve into
// sharp focus in a staggered sequence — values "coming into focus" motif.

import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'
import Sidebar from '../components/dashboard/Sidebar.jsx'
import BottomNav from '../components/dashboard/BottomNav.jsx'
import Disclaimer from '../components/common/Disclaimer.jsx'
import UrgencyBadge from '../components/results/UrgencyBadge.jsx'
import ResultsTable from '../components/results/ResultsTable.jsx'
import FindingsCard from '../components/results/FindingsCard.jsx'
import SourcesList from '../components/results/SourcesList.jsx'
import DownloadPDFButton from '../components/results/DownloadPDFButton.jsx'

const MAY_INDICATE_DISCLAIMER =
  'This reflects possibilities based on the values above, not a diagnosis. Only a licensed physician can confirm what these results mean for you.'

// ── Skeleton shown while fetching from Supabase ──────────────────────────────
function ResultsSkeleton() {
  return (
    <div className="max-w-2xl mx-auto lg:mx-0 animate-pulse">
      <div className="h-3 w-24 bg-border rounded mb-4" />
      <div className="h-8 w-2/3 bg-border rounded mb-8" />
      <div className="h-8 w-40 bg-border rounded-full mb-8" />
      <div className="h-48 bg-border rounded-card mb-6" />
      <div className="h-28 bg-border rounded-card mb-6" />
      <div className="h-28 bg-border rounded-card" />
    </div>
  )
}

// ── Not-found / error state ──────────────────────────────────────────────────
function ResultsNotFound({ message }) {
  return (
    <div className="max-w-md mx-auto lg:mx-0 text-center py-16">
      <div className="w-12 h-12 rounded-full bg-flag-high/10 flex items-center justify-center mx-auto mb-4">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="9" stroke="#E84D4D" strokeWidth="1.5" />
          <path d="M10 6v5M10 12.5v.5" stroke="#E84D4D" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <h1 className="font-semibold text-text-primary text-lg mb-2">Results not found</h1>
      <p className="text-text-secondary text-sm leading-relaxed mb-6">{message}</p>
      <Link
        to="/dashboard"
        className="btn-hover inline-block px-6 py-2.5 bg-nav-bg text-white rounded-full text-sm font-medium"
      >
        Back to dashboard
      </Link>
    </div>
  )
}

function ResultsPage() {
  const { analysisId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [resultJson, setResultJson] = useState(null)
  const [originalFilename, setOriginalFilename] = useState('')
  const [createdAt, setCreatedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [unsaved, setUnsaved] = useState(false)

  // Blur-resolve reveal: starts true, flips false shortly after data is ready
  // so the browser paints the blurred state first, then transitions to sharp.
  const [resolved, setResolved] = useState(false)

  useEffect(() => {
    let cancelled = false
    setResolved(false)

    const loadLocal = () => {
      const navResult = location.state?.resultJson
      if (!navResult) {
        setLoadError(
          'This unsaved result is no longer available. Unsaved results only persist for the current browser session.'
        )
        setLoading(false)
        return
      }
      setResultJson(navResult)
      setUnsaved(true)
      setOriginalFilename(location.state?.originalFilename || 'report')
      setCreatedAt(new Date().toISOString())
      setLoading(false)
    }

    const loadFromDb = async () => {
      if (!user) return

      const { data, error } = await supabase
        .from('analyses')
        .select('result_json, original_filename, created_at, user_id')
        .eq('id', analysisId)
        .single()

      if (cancelled) return

      if (error || !data) {
        console.error('Failed to load analysis:', error?.message)
        setLoadError(
          'We could not find this analysis. It may have been deleted, or the link may be incorrect.'
        )
        setLoading(false)
        return
      }

      // RLS already restricts rows to the owner, but double-check defensively.
      if (data.user_id !== user.id) {
        setLoadError('This analysis does not belong to your account.')
        setLoading(false)
        return
      }

      setResultJson(data.result_json)
      setOriginalFilename(data.original_filename || 'report')
      setCreatedAt(data.created_at)
      setLoading(false)
    }

    setLoading(true)
    setLoadError(null)

    if (analysisId === 'local') {
      loadLocal()
    } else {
      loadFromDb()
    }

    return () => {
      cancelled = true
    }
  }, [analysisId, user, location.state])

  // Trigger the blur-to-sharp resolve once data is in and painted.
  useEffect(() => {
    if (loading || loadError || !resultJson) return
    const timer = setTimeout(() => setResolved(true), 120)
    return () => clearTimeout(timer)
  }, [loading, loadError, resultJson])

  const blurred = !resolved

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 px-5 py-6 lg:px-10 lg:py-8 pb-24 lg:pb-8 overflow-y-auto">
        {loading ? (
          <ResultsSkeleton />
        ) : loadError ? (
          <ResultsNotFound message={loadError} />
        ) : (
          <div className="max-w-2xl mx-auto lg:mx-0 flex flex-col gap-6">

            {/* Unsaved-result banner */}
            {unsaved && (
              <div className="bg-flag-borderline/10 border border-flag-borderline/30 rounded-card px-4 py-3 text-sm text-text-secondary">
                This result wasn't saved to your history. Refreshing this page will lose it.
              </div>
            )}

            {/* ── 1. Report type + specialty ── */}
            <div
              className={`transition-all duration-700 ${
                blurred ? 'blur-md opacity-0' : 'blur-0 opacity-100'
              }`}
            >
              <span className="section-label mb-4 inline-block">
                {resultJson.specialty || 'General Medicine'}
              </span>
              <h1 className="font-display text-2xl sm:text-3xl leading-tight mb-1">
                <span className="headline-muted block">Your</span>
                <span className="headline-strong block">
                  {resultJson.report_type || 'Report'} results.
                </span>
              </h1>
              {createdAt && (
                <p className="text-xs text-text-secondary mt-2">
                  {originalFilename} · {new Date(createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}
            </div>

            {/* ── 2. Urgency badge ── */}
            <UrgencyBadge urgency={resultJson.urgency} blurred={blurred} />

            {/* ── 3. Values table ── */}
            <section aria-labelledby="values-heading">
              <span id="values-heading" className="section-label mb-3 inline-block">
                Your values
              </span>
              <ResultsTable parameters={resultJson.parameters} blurred={blurred} />
            </section>

            {/* ── 4. Key findings ── */}
            <FindingsCard
              label="Key findings"
              plain={resultJson.key_findings?.plain}
              medical={resultJson.key_findings?.medical}
              blurred={blurred}
            />

            {/* ── 5. What this may indicate ── */}
            <FindingsCard
              label="What this may indicate"
              plain={resultJson.what_this_may_indicate?.plain}
              medical={resultJson.what_this_may_indicate?.medical}
              disclaimer={MAY_INDICATE_DISCLAIMER}
              blurred={blurred}
            />

            {/* ── 6. Recommended next steps ── */}
            <FindingsCard
              label="Recommended next steps"
              plain={resultJson.next_steps?.plain}
              medical={resultJson.next_steps?.medical}
              blurred={blurred}
            />

            {/* ── 7. Sources referenced ── */}
            <SourcesList sources={resultJson.sources} blurred={blurred} />

            {/* ── Download PDF ── */}
            <div
              className={`transition-all duration-700 ${
                blurred ? 'blur-md opacity-0 pointer-events-none' : 'blur-0 opacity-100'
              }`}
            >
              <DownloadPDFButton
                resultJson={resultJson}
                originalFilename={originalFilename}
                createdAt={createdAt}
              />
            </div>

            <Disclaimer />
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

export default ResultsPage
