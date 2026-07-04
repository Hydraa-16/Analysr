import { useState } from 'react'

// Tag-based multi-select input with free-text custom add.
// Used for both "known conditions" and "known allergies" (same interaction
// pattern, different label/placeholder/suggestions per the spec).
//
// Props:
//   label       — field label shown above the input
//   value       — array of strings (current tags)
//   onChange(newArray) — called whenever tags are added or removed
//   placeholder — input placeholder text
//   suggestions — optional array of common quick-add chips (e.g. "Diabetes")
function ConditionTagInput({ label, value = [], onChange, placeholder, suggestions = [] }) {
  const [draft, setDraft] = useState('')

  const addTag = (raw) => {
    const tag = raw.trim()
    if (!tag) return
    // Case-insensitive dedupe so "Asthma" and "asthma" don't both get added.
    const exists = value.some((t) => t.toLowerCase() === tag.toLowerCase())
    if (exists) {
      setDraft('')
      return
    }
    onChange([...value, tag])
    setDraft('')
  }

  const removeTag = (tag) => {
    onChange(value.filter((t) => t !== tag))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(draft)
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      // Quick-remove the last tag when backspacing on an empty input.
      removeTag(value[value.length - 1])
    }
  }

  const availableSuggestions = suggestions.filter(
    (s) => !value.some((t) => t.toLowerCase() === s.toLowerCase())
  )

  return (
    <div>
      <label className="block text-sm font-semibold text-text-primary mb-2">{label}</label>

      {/* Existing tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2.5">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 bg-accent/10 text-accent text-sm font-medium px-3 py-1.5 rounded-full"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Remove ${tag}`}
                className="hover:opacity-60 transition-opacity"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M3 3l6 6M9 3l-6 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Free-text add input */}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(draft)}
        placeholder={placeholder}
        className="w-full rounded-card border border-border bg-background px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none transition-colors duration-150 focus:border-accent focus:ring-1 focus:ring-accent/30"
      />
      <p className="text-xs text-text-secondary/70 mt-1.5">Press Enter or comma to add</p>

      {/* Quick-add suggestion chips */}
      {availableSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {availableSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="btn-hover text-xs text-text-secondary border border-border px-2.5 py-1 rounded-full hover:border-accent/40 hover:text-accent transition-colors duration-150"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ConditionTagInput
