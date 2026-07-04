// AnalysisLoadingPage — receives file + notes from UploadPage navigation state,
// calls aiService, saves the result to Supabase, then redirects to /results/:id.
// Handles quota errors, analysis failures, DB save failures, and retry logic.

import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { analyseReport } from '../services/aiService.js'
import { supabase } from '../services/supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useProfile } from '../context/ProfileContext.jsx'
import Disclaimer from '../components/common/Disclaimer.jsx'

// ── Loading steps shown to the user during analysis ──────────────────────────
const LOADING_STEPS = [
  { id: 1, label: 'Reading your report…' },
  { id: 2, label: 'Detecting report type…' },
  { id: 3, label: 'Running AI analysis…' },
  { id: 4, label: 'Structuring results…' },
]

// ── Step durations (ms) — cosmetic pacing so steps feel real ─────────────────
const STEP_DELAYS = [800, 1400, 2200, 3200]

// ── Spinning teal ring ────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="relative w-16 h-16 mx-auto mb-8">
      <svg
        className="animate-spin"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="#E8E8E6"
          strokeWidth="4"
        />
        <path
          d="M60 32a28 28 0 0 0-28-28"
          stroke="#0ABFA3"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

// ── Error card ────────────────────────────────────────────────────────────────
function ErrorCard({ title, message, onRetry, canRetry, onGoBack }) {
  return (
    <div className="bg-surface border border-border rounded-card p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-flag-high/10 flex items-center justify-center mx-auto mb-4">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="9" stroke="#E84D4D" strokeWidth="1.5" />
          <path d="M10 6v5M10 12.5v.5" stroke="#E84D4D" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="font-semibold text-text-primary text-lg mb-2">{title}</h2>
      <p className="text-text-secondary text-sm leading-relaxed mb-6">{message}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {canRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2.5 bg-nav-bg text-white rounded-full text-sm font-medium
                       hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
        )}
        <button
          onClick={onGoBack}
          className="px-6 py-2.5 border border-border rounded-full text-sm font-medium
                     text-text-secondary hover:text-text-primary transition-colors"
        >
          Go back to upload
        </button>
      </div>
    </div>
  )
}

// ── DB-save warning (analysis succeeded but Supabase insert failed) ───────────
function DbSaveWarning({ analysisData, onRetryDbSave }) {
  return (
    <div className="bg-flag-borderline/10 border border-flag-borderline/30 rounded-card p-4 mt-4 text-sm text-text-secondary">
      <p className="font-semibold text-text-primary mb-1">Results ready — save failed</p>
      <p className="mb-3 leading-relaxed">
        Your analysis completed but couldn't be saved to your history. You can view results
        now or retry saving.
      </p>
      <button
        onClick={onRetryDbSave}
        className="text-accent text-sm font-medium underline underline-offset-2"
      >
        Retry save
      </button>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
function AnalysisLoadingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { profile } = useProfile()

  // ── State ──────────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState(null)        // { title, message, canRetry, isQuota }
  const [dbSaveFailed, setDbSaveFailed] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [originalFilename, setOriginalFilename] = useState('')

  // Guard against double-run in React StrictMode dev
  const hasStarted = useRef(false)

  // ── Extract nav state ──────────────────────────────────────────────────────
  const navState = location.state || {}
  const file = navState.file || null
  const notes = navState.notes || ''

  // ── Step ticker ────────────────────────────────────────────────────────────
  useEffect(() => {
    const timers = STEP_DELAYS.map((delay, i) =>
      setTimeout(() => setCurrentStep(i + 1), delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  // ── Save to Supabase ───────────────────────────────────────────────────────
  const saveToDb = async (resultJson, filename) => {
    if (!user) return null

    const { data, error: dbError } = await supabase
      .from('analyses')
      .insert({
        user_id: user.id,
        report_type: resultJson.report_type || 'Unknown',
        specialty: resultJson.specialty || 'General Medicine',
        urgency: resultJson.urgency || 'Routine',
        result_json: resultJson,
        original_filename: filename || 'report',
      })
      .select('id')
      .single()

    if (dbError) {
      console.error('Supabase insert failed:', dbError.message)
      return null
    }

    return data?.id || null
  }

  // ── Retry DB save after failure ────────────────────────────────────────────
  const handleRetryDbSave = async () => {
    if (!analysisResult) return
    setDbSaveFailed(false)

    const savedId = await saveToDb(analysisResult, originalFilename)
    if (savedId) {
      navigate(`/results/${savedId}`, { replace: true })
    } else {
      setDbSaveFailed(true)
    }
  }

  // ── Navigate to results with local backup when DB save fails ──────────────
  const handleViewWithoutSave = () => {
    if (!analysisResult) return
    // Pass result via nav state as local fallback — ResultsPage handles both
    navigate('/results/local', {
      state: { resultJson: analysisResult, originalFilename, unsaved: true },
      replace: true,
    })
  }

  // ── Main analysis flow ─────────────────────────────────────────────────────
  const runAnalysis = async () => {
    if (!file) {
      navigate('/upload', { replace: true })
      return
    }

    setOriginalFilename(file.name || 'report')
    setError(null)
    setDbSaveFailed(false)
    setAnalysisResult(null)

    try {
      const result = await analyseReport(file, notes, profile)
      setAnalysisResult(result)

      // Attempt Supabase save
      const savedId = await saveToDb(result, file.name)
      if (!savedId) {
        // Analysis succeeded but DB failed — show warning, don't crash
        setDbSaveFailed(true)
        return
      }

      // Success — redirect to results
      navigate(`/results/${savedId}`, { replace: true })
    } catch (err) {
      const isQuota = err.code === 'QUOTA_EXCEEDED' || err.status === 429

      setError({
        title: isQuota
          ? 'Analysis temporarily unavailable'
          : 'Analysis failed',
        message: isQuota
          ? err.message ||
            'Daily API limit has been reached. Please try again tomorrow.'
          : err.message ||
            'Something went wrong while analysing your report. Please try again.',
        canRetry: !isQuota,
        isQuota,
      })
    }
  }

  // ── Kick off analysis once on mount ───────────────────────────────────────
  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    // Redirect if no file passed — user probably navigated here directly
    if (!file) {
      navigate('/upload', { replace: true })
      return
    }

    runAnalysis()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* ── Loading state ── */}
        {!error && !dbSaveFailed && (
          <div className="text-center">
            <Spinner />

            <span className="section-label text-text-secondary mb-4 block">
              AI ANALYSIS
            </span>
            <h1 className="font-display text-2xl sm:text-3xl leading-tight mb-8">
              <span className="headline-muted block">Analysing your</span>
              <span className="headline-strong block">medical report.</span>
            </h1>

            {/* Step list */}
            <div className="flex flex-col gap-3 text-left bg-surface border border-border rounded-card p-5 mb-6">
              {LOADING_STEPS.map((step, index) => {
                const done = currentStep > index + 1
                const active = currentStep === index + 1
                const pending = currentStep < index + 1

                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                      done
                        ? 'text-flag-normal'
                        : active
                        ? 'text-text-primary font-medium'
                        : 'text-text-secondary opacity-40'
                    }`}
                  >
                    {/* Step indicator */}
                    <div className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center">
                      {done ? (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="7" fill="#27AE8F" />
                          <path
                            d="M5 8l2 2 4-4"
                            stroke="#fff"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : active ? (
                        <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                      ) : (
                        <div className="w-2 h-2 bg-border rounded-full" />
                      )}
                    </div>
                    {step.label}
                  </div>
                )
              })}
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              This usually takes 10–20 seconds. Please don't close the tab.
            </p>
          </div>
        )}

        {/* ── Error state ── */}
        {error && (
          <ErrorCard
            title={error.title}
            message={error.message}
            canRetry={error.canRetry}
            onRetry={() => {
              hasStarted.current = false
              runAnalysis()
            }}
            onGoBack={() => navigate('/upload')}
          />
        )}

        {/* ── DB save warning (analysis ok, save failed) ── */}
        {dbSaveFailed && !error && (
          <>
            <div className="text-center mb-4">
              <span className="section-label text-flag-normal mb-4 block">
                ANALYSIS COMPLETE
              </span>
              <h1 className="font-display text-2xl leading-tight">
                <span className="headline-muted block">Results are</span>
                <span className="headline-strong block">ready.</span>
              </h1>
            </div>
            <DbSaveWarning
              analysisData={analysisResult}
              onRetryDbSave={handleRetryDbSave}
            />
            <button
              onClick={handleViewWithoutSave}
              className="mt-4 w-full py-3 bg-nav-bg text-white rounded-full text-sm font-medium
                         hover:opacity-90 transition-opacity"
            >
              View results now
            </button>
          </>
        )}

        {/* Disclaimer — required on this screen per spec */}
        <div className="mt-8">
          <Disclaimer compact />
        </div>
      </div>
    </div>
  )
}

export default AnalysisLoadingPage
