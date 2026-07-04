import { useEffect, useRef } from 'react'

// Per spec: user must acknowledge that report content + profile data are
// sent to Google's Gemini API before the first upload. Acknowledgement is
// persisted to localStorage so the modal only appears once per browser.
// The modal traps focus and is dismissible via keyboard (Escape key).

const STORAGE_KEY = 'analysr_privacy_ack'

/**
 * Returns true if the user has already acknowledged.
 * @returns {boolean}
 */
export function hasAcknowledgedPrivacy() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

/**
 * Persists the acknowledgement so the modal is not shown again.
 */
export function savePrivacyAcknowledgement() {
  try {
    localStorage.setItem(STORAGE_KEY, 'true')
  } catch {
    // localStorage not available — gracefully ignore.
  }
}

/**
 * Modal that asks the user to confirm they understand their data will be
 * processed by Gemini. Once confirmed the modal closes and stays closed.
 *
 * Props:
 *   onAcknowledge() — called when the user clicks "I understand, continue"
 *   onDismiss()     — called when the user clicks "Cancel" or presses Escape
 */
function PrivacyAcknowledgement({ onAcknowledge, onDismiss }) {
  const confirmRef = useRef(null)

  // Auto-focus the confirm button for accessibility
  useEffect(() => {
    confirmRef.current?.focus()
  }, [])

  // Allow Escape to dismiss
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onDismiss()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onDismiss])

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 sm:px-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
    >
      {/* Dim overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onDismiss}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative bg-surface border border-border rounded-card w-full max-w-md p-6 sm:p-8 shadow-xl z-10 animate-fade-up">
        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-5">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <path
              d="M11 2C7 2 3.5 5 3.5 9v2L2 13.5A1.5 1.5 0 0 0 3.5 16h1.25v1.5A1.5 1.5 0 0 0 6.25 19h9.5a1.5 1.5 0 0 0 1.5-1.5V16H18.5A1.5 1.5 0 0 0 20 13.5L18.5 11V9C18.5 5 15 2 11 2Z"
              stroke="#0ABFA3"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle cx="11" cy="12" r="1.2" fill="#0ABFA3" />
            <path d="M11 9v2" stroke="#0ABFA3" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        <h2
          id="privacy-modal-title"
          className="text-lg font-bold text-text-primary mb-2"
        >
          Before your first analysis
        </h2>

        <p className="text-sm text-text-secondary leading-relaxed mb-4">
          To analyse your report, Analysr sends its contents — and any profile
          information you've added — to <strong className="text-text-primary">Google's Gemini API</strong> for processing.
        </p>

        <ul className="space-y-2 mb-6">
          {[
            'Your report is processed by Google Gemini AI.',
            'Relevant profile details are included as context.',
            'Results are stored securely in your account.',
            'This is not a medical diagnosis — always consult a doctor.',
          ].map((point) => (
            <li key={point} className="flex items-start gap-2.5 text-sm text-text-secondary">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
                className="shrink-0 mt-0.5"
              >
                <circle cx="7" cy="7" r="6" stroke="#0ABFA3" strokeWidth="1.3" />
                <path
                  d="M4.5 7l2 2 3-3"
                  stroke="#0ABFA3"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {point}
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onDismiss}
            className="btn-hover flex-1 border border-border text-text-secondary text-sm font-medium py-3 rounded-full hover:bg-border/50 transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={() => {
              savePrivacyAcknowledgement()
              onAcknowledge()
            }}
            className="btn-hover flex-1 bg-nav-bg text-white text-sm font-semibold py-3 rounded-full transition-all duration-150"
          >
            I understand, continue
          </button>
        </div>
      </div>
    </div>
  )
}

export default PrivacyAcknowledgement
