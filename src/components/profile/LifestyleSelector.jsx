// Segmented single-select control. Reused for smoking status, alcohol
// consumption, and activity level — the three lifestyle fields in the spec.
// Each renders as a row of pill buttons; exactly one is active at a time.
//
// Props:
//   label   — field label shown above the control
//   options — array of option strings, exact values match the DB spec
//             (e.g. ['Never', 'Former', 'Current'])
//   value   — currently selected option (or '' if unset)
//   onChange(option) — called when the user picks a different option
function LifestyleSelector({ label, options, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-text-primary mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = value === option
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              aria-pressed={isActive}
              className={`btn-hover px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-150 ${
                isActive
                  ? 'bg-nav-bg text-white border-nav-bg'
                  : 'bg-background text-text-secondary border-border hover:border-accent/40 hover:text-text-primary'
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default LifestyleSelector
