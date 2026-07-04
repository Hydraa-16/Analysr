import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar.jsx'
import BottomNav from '../components/dashboard/BottomNav.jsx'
import Disclaimer from '../components/common/Disclaimer.jsx'
import PrivacyAcknowledgement, {
  hasAcknowledgedPrivacy,
} from '../components/common/PrivacyAcknowledgement.jsx'
import UploadDropzone from '../components/upload/UploadDropzone.jsx'
import FilePreview from '../components/upload/FilePreview.jsx'
import ContextInputFields from '../components/upload/ContextInputFields.jsx'
import UploadButton from '../components/upload/UploadButton.jsx'
import { isPdf } from '../components/upload/MimeTypeValidator.js'
import { validatePdfPageCount } from '../components/upload/FileSizeValidator.js'
import { checkImageQuality } from '../components/upload/ImageQualityChecker.js'
import { useScrollReveal } from '../hooks/useScrollReveal.js'

// ── Supported report type hints shown to the user ─────────────────────────────
const REPORT_TYPES = [
  'Blood / CBC',
  'Thyroid Panel',
  'Liver Function (LFT)',
  'Kidney Function (KFT)',
  'ECG',
  'MRI / X-Ray',
  'Lipid Panel',
  'HbA1c / Glucose',
]

// ── Main page ─────────────────────────────────────────────────────────────────

function UploadPage() {
  const navigate = useNavigate()

  // File state
  const [file, setFile] = useState(null)
  const [pageCount, setPageCount] = useState(0)
  const [qualityWarning, setQualityWarning] = useState(null)
  const [validationError, setValidationError] = useState(null)

  // Context notes
  const [notes, setNotes] = useState('')

  // UI state
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Scroll reveal refs
  const [heroRef, heroVisible] = useScrollReveal()
  const [formRef, formVisible] = useScrollReveal({ threshold: 0.05 })

  // ── File selection ──────────────────────────────────────────────────────────

  const handleFile = useCallback(async (incoming) => {
    // Reset previous state
    setFile(null)
    setPageCount(0)
    setQualityWarning(null)
    setValidationError(null)

    if (isPdf(incoming)) {
      const result = await validatePdfPageCount(incoming)
      if (!result.valid) {
        setValidationError(result.reason)
        return
      }
      setPageCount(result.pageCount)
    } else {
      // Image — check quality (non-blocking warn)
      const quality = await checkImageQuality(incoming)
      if (quality.warning) setQualityWarning(quality.warning)
    }

    setFile(incoming)
  }, [])

  const handleRemove = () => {
    setFile(null)
    setPageCount(0)
    setQualityWarning(null)
    setValidationError(null)
  }

  // ── Submit flow ─────────────────────────────────────────────────────────────

  const handleAnalyseClick = () => {
    if (!file) return

    // Show privacy modal on first use; go straight to upload if already ack'd
    if (!hasAcknowledgedPrivacy()) {
      setShowPrivacy(true)
    } else {
      startUpload()
    }
  }

  const startUpload = () => {
    setShowPrivacy(false)
    setUploading(true)

    // Pass file + context to the loading/analysis page via navigation state.
    // Milestone 5 (serverless function) reads this state and kicks off Gemini.
    navigate('/analysing', {
      state: { file, notes: notes.trim() },
    })
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      {/* Privacy acknowledgement modal */}
      {showPrivacy && (
        <PrivacyAcknowledgement
          onAcknowledge={startUpload}
          onDismiss={() => setShowPrivacy(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto pb-24 lg:pb-0">
        <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 lg:py-12">

          {/* ── Page header ── */}
          <div
            ref={heroRef}
            className={`mb-10 transition-all duration-700 ${
              heroVisible
                ? 'opacity-100 blur-none translate-y-0'
                : 'opacity-0 blur-sm translate-y-4'
            }`}
          >
            <span className="section-label text-text-secondary mb-3 block">
              NEW ANALYSIS
            </span>
            <h1 className="font-display text-3xl sm:text-4xl leading-tight mb-3">
              <span className="headline-muted block">Upload your</span>
              <span className="headline-strong block">medical report.</span>
            </h1>
            <p className="text-text-secondary text-sm leading-relaxed max-w-md">
              Analysr reads your report and returns a clear, dual-language
              breakdown — plain English first, clinical detail second.
            </p>
          </div>

          {/* ── Report type hints ── */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-3">
              Supported report types
            </p>
            <div className="flex flex-wrap gap-2">
              {REPORT_TYPES.map((type) => (
                <span key={type} className="section-label text-text-secondary">
                  {type}
                </span>
              ))}
            </div>
          </div>

          {/* ── Upload form ── */}
          <div
            ref={formRef}
            className={`flex flex-col gap-6 transition-all duration-700 delay-100 ${
              formVisible
                ? 'opacity-100 blur-none translate-y-0'
                : 'opacity-0 blur-sm translate-y-4'
            }`}
          >
            {/* Drop zone — hidden once a file is selected */}
            {!file && (
              <UploadDropzone onFile={handleFile} disabled={uploading} />
            )}

            {/* PDF page-count hard error */}
            {validationError && !file && (
              <div className="flex items-start gap-2.5 bg-flag-high/8 border border-flag-high/30 rounded-card px-4 py-3">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  aria-hidden="true"
                  className="shrink-0 mt-0.5"
                >
                  <circle cx="7.5" cy="7.5" r="6.5" stroke="#E84D4D" strokeWidth="1.3" />
                  <path
                    d="M7.5 5v3M7.5 9.5v.5"
                    stroke="#E84D4D"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
                <p className="text-xs text-flag-high leading-relaxed">
                  {validationError}
                </p>
              </div>
            )}

            {/* File preview */}
            {file && (
              <FilePreview
                file={file}
                pageCount={pageCount}
                warning={qualityWarning}
                onRemove={handleRemove}
              />
            )}

            {/* Context notes */}
            <ContextInputFields
              value={notes}
              onChange={setNotes}
              disabled={uploading}
            />

            {/* Submit */}
            <UploadButton
              onClick={handleAnalyseClick}
              loading={uploading}
              disabled={!file}
            />

            {/* Disclaimer — required on upload screen per spec */}
            <Disclaimer compact />
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

export default UploadPage
