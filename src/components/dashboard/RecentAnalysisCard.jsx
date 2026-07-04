import { Link } from 'react-router-dom'

// Maps urgency strings from Gemini JSON to badge colors and display labels.
const URGENCY_STYLES = {
  Routine: {
    bg: 'bg-flag-normal/12',
    text: 'text-flag-normal',
    dot: 'bg-flag-normal',
  },
  'Follow up soon': {
    bg: 'bg-flag-borderline/12',
    text: 'text-flag-borderline',
    dot: 'bg-flag-borderline',
  },
  'Seek care promptly': {
    bg: 'bg-flag-high/12',
    text: 'text-flag-high',
    dot: 'bg-flag-high',
  },
}

// Formats an ISO timestamp into a friendly relative label.
// e.g. "2 hours ago", "Yesterday", "14 Jun"
function formatRelativeDate(isoString) {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// Specialty icon — small SVG indicator per report specialty.
// Keeps the card visually distinct without relying on external icon libraries.
function SpecialtyIcon({ specialty }) {
  // Generic beaker/report icon used for all specialties in this milestone.
  // Milestone 6/7 may introduce per-specialty icons.
  return (
    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path
          d="M6.5 2v5.5L3 14.5A1 1 0 0 0 4 16h10a1 1 0 0 0 .866-1.5L11.5 7.5V2"
          stroke="#0ABFA3"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M6 2h6" stroke="#0ABFA3" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  )
}

// A single card in the dashboard's recent analyses list.
// Links through to the full results page via the analysis ID.
// Props:
//   analysis — row from the analyses Supabase table:
//     { id, report_type, specialty, urgency, created_at, original_filename }
function RecentAnalysisCard({ analysis }) {
  const { id, report_type, specialty, urgency, created_at, original_filename } = analysis
  const urgencyStyle = URGENCY_STYLES[urgency] || URGENCY_STYLES.Routine

  return (
    <Link
      to={`/results/${id}`}
      className="group block bg-surface border border-border rounded-card p-4 hover:border-accent/40 hover:shadow-sm transition-all duration-200"
      aria-label={`View ${report_type} analysis from ${formatRelativeDate(created_at)}`}
    >
      <div className="flex items-start gap-3">
        <SpecialtyIcon specialty={specialty} />

        <div className="flex-1 min-w-0">
          {/* Report type + specialty */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">
                {report_type || 'Medical Report'}
              </p>
              {specialty && (
                <p className="text-xs text-text-secondary truncate">{specialty}</p>
              )}
            </div>
            {/* Urgency badge */}
            <span
              className={`shrink-0 inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${urgencyStyle.bg} ${urgencyStyle.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${urgencyStyle.dot}`} />
              {urgency || 'Routine'}
            </span>
          </div>

          {/* File name + date row */}
          <div className="flex items-center justify-between gap-2 mt-2">
            {original_filename && (
              <p className="text-xs text-text-secondary truncate max-w-[60%]">
                {original_filename}
              </p>
            )}
            <p className="text-xs text-text-secondary ml-auto shrink-0">
              {formatRelativeDate(created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Hover arrow indicator */}
      <div className="flex justify-end mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M3 7h8M7 3l4 4-4 4" stroke="#0ABFA3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  )
}

export default RecentAnalysisCard
