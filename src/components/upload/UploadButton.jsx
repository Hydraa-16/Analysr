// The primary CTA button on the upload screen. Shows a spinner while the
// analysis request is in flight and disables itself to prevent double-submit.

/**
 * Props:
 *   onClick()  — called when the user clicks (upload + navigate to /analysing)
 *   loading    — show spinner and disable interaction
 *   disabled   — disable without spinner (e.g. no file selected)
 */
function UploadButton({ onClick, loading = false, disabled = false }) {
  const isInert = loading || disabled

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isInert}
      aria-busy={loading}
      className={`
        btn-hover w-full flex items-center justify-center gap-2.5
        bg-nav-bg text-white text-sm font-semibold
        px-6 py-4 rounded-full transition-all duration-200
        ${isInert ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {loading ? (
        <>
          {/* Spinner */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="animate-spin shrink-0"
          >
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke="white"
              strokeWidth="2"
              strokeOpacity="0.25"
            />
            <path
              d="M8 2a6 6 0 0 1 6 6"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Uploading…
        </>
      ) : (
        <>
          {/* Upload arrow icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
          >
            <path
              d="M8 10.5V3M4.5 6.5L8 3l3.5 3.5"
              stroke="white"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 13h12"
              stroke="white"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
          Analyse report
        </>
      )}
    </button>
  )
}

export default UploadButton
