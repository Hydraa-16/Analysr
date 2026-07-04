// ParameterRow — single row in the results values table.
// parameter | your value | normal range | status badge (High/Normal/Low).
// Supports the blur-resolve reveal: rows resolve in sequence as results render.

const STATUS_CONFIG = {
  high: { label: 'High', text: 'text-flag-high', bg: 'bg-flag-high/10' },
  low: { label: 'Low', text: 'text-flag-high', bg: 'bg-flag-high/10' },
  borderline: { label: 'Borderline', text: 'text-flag-borderline', bg: 'bg-flag-borderline/10' },
  normal: { label: 'Normal', text: 'text-flag-normal', bg: 'bg-flag-normal/10' },
}

function normaliseStatus(status) {
  const key = (status || '').trim().toLowerCase()
  return STATUS_CONFIG[key] || STATUS_CONFIG.normal
}

function ParameterRow({ parameter, value, normalRange, status, blurred = false, delay = 0 }) {
  const config = normaliseStatus(status)

  return (
    <tr
      className={`border-b border-border last:border-b-0 transition-all duration-700 ${
        blurred ? 'blur-md opacity-0' : 'blur-0 opacity-100'
      }`}
      style={{ transitionDelay: blurred ? '0ms' : `${delay}ms` }}
    >
      <td className="py-3.5 px-4 text-sm font-medium text-text-primary">{parameter}</td>
      <td className="py-3.5 px-4 text-sm text-text-primary">{value}</td>
      <td className="py-3.5 px-4 text-sm text-text-secondary">{normalRange}</td>
      <td className="py-3.5 px-4">
        <span
          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
        >
          {config.label}
        </span>
      </td>
    </tr>
  )
}

export default ParameterRow
