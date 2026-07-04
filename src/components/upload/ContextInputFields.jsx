// Optional free-text field where the user can add context about the report
// (e.g. "fasting blood test", "follow-up after surgery"). This text is
// forwarded to Gemini alongside the file and profile data in Milestone 5.

/**
 * Props:
 *   value         — current textarea value
 *   onChange(val) — called with the new string whenever the user types
 *   disabled      — disables the field during upload
 */
function ContextInputFields({ value, onChange, disabled = false }) {
  const MAX_CHARS = 300
  const remaining = MAX_CHARS - value.length
  const nearLimit = remaining <= 50

  return (
    <div>
      <label
        htmlFor="upload-context"
        className="block text-sm font-semibold text-text-primary mb-1.5"
      >
        Additional context{' '}
        <span className="text-text-secondary font-normal">(optional)</span>
      </label>
      <p className="text-xs text-text-secondary mb-3 leading-relaxed">
        Help Analysr understand your report better — e.g. "fasting blood test",
        "follow-up after thyroid medication", "feeling fatigued for 3 weeks".
      </p>

      <div className="relative">
        <textarea
          id="upload-context"
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
          disabled={disabled}
          rows={3}
          placeholder="Add any relevant notes about this report…"
          className={`
            w-full resize-none rounded-card border bg-surface px-4 py-3
            text-sm text-text-primary placeholder:text-text-secondary/60
            leading-relaxed outline-none transition-colors duration-150
            focus:border-accent focus:ring-1 focus:ring-accent/30
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'border-border'}
          `}
        />
        {/* Character counter */}
        <span
          className={`
            absolute bottom-2.5 right-3 text-xs select-none
            ${nearLimit ? 'text-flag-borderline' : 'text-text-secondary/50'}
          `}
        >
          {remaining}
        </span>
      </div>
    </div>
  )
}

export default ContextInputFields
