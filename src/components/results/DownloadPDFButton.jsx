// DownloadPDFButton — triggers client-side PDF generation via pdfService.js.
// Shows loading state during generation and surfaces any error inline.

import { useState } from 'react'
import { generateAnalysisPdf } from '../../services/pdfService.js'

function DownloadPDFButton({ resultJson, originalFilename, createdAt }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleDownload = async () => {
    if (loading) return
    setError(null)
    setLoading(true)

    // jsPDF is synchronous but can block the paint for large reports;
    // wrapping in setTimeout(0) lets React flush the loading state first.
    setTimeout(() => {
      const outcome = generateAnalysisPdf(resultJson, { originalFilename, createdAt })
      setLoading(false)
      if (!outcome.success) {
        setError(outcome.error || 'PDF export failed. Please try again.')
      }
    }, 0)
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={handleDownload}
        disabled={loading}
        aria-label="Download analysis as PDF"
        className="btn-hover inline-flex items-center gap-2 px-5 py-2.5 bg-nav-bg text-white rounded-full text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"
              />
              <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="currentColor" strokeWidth="3" strokeLinecap="round"
              />
            </svg>
            Generating PDF…
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M8 1v9M4.5 6.5 8 10l3.5-3.5"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              />
              <path
                d="M2 11v2a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
              />
            </svg>
            Download PDF
          </>
        )}
      </button>

      {error && (
        <p className="text-xs text-flag-high leading-relaxed">{error}</p>
      )}
    </div>
  )
}

export default DownloadPDFButton
