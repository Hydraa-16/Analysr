// UrgencyBadge — color-coded pill showing analysis urgency level.
// Three states per spec: Routine / Follow up soon / Seek care promptly.
// Maps to design system flag colors (normal/borderline/high).

const URGENCY_CONFIG = {
  routine: {
    label: 'Routine',
    bg: 'bg-flag-normal/10',
    text: 'text-flag-normal',
    dot: '#27AE8F',
  },
  'follow up soon': {
    label: 'Follow up soon',
    bg: 'bg-flag-borderline/10',
    text: 'text-flag-borderline',
    dot: '#F5A623',
  },
  'seek care promptly': {
    label: 'Seek care promptly',
    bg: 'bg-flag-high/10',
    text: 'text-flag-high',
    dot: '#E84D4D',
  },
}

function normaliseUrgency(urgency) {
  const key = (urgency || '').trim().toLowerCase()
  return URGENCY_CONFIG[key] || URGENCY_CONFIG.routine
}

function UrgencyBadge({ urgency, blurred = false }) {
  const config = normaliseUrgency(urgency)

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config.bg} transition-all duration-700 ${
        blurred ? 'blur-md opacity-0' : 'blur-0 opacity-100'
      }`}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: config.dot }}
        aria-hidden="true"
      />
      <span className={`text-sm font-semibold ${config.text}`}>{config.label}</span>
    </div>
  )
}

export default UrgencyBadge
