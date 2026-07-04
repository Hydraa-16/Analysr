// Editable list of current medications, each stored as { name, dosage }.
// Matches the Supabase schema: current_medications is a JSON array of
// {name, dosage} objects — do not change this shape.
//
// Props:
//   value — array of { name, dosage }
//   onChange(newArray) — called whenever a row is edited, added, or removed
function MedicationInput({ value = [], onChange }) {
  const updateRow = (index, field, fieldValue) => {
    const next = value.map((row, i) =>
      i === index ? { ...row, [field]: fieldValue } : row
    )
    onChange(next)
  }

  const addRow = () => {
    onChange([...value, { name: '', dosage: '' }])
  }

  const removeRow = (index) => {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-text-primary mb-2">
        Current medications
      </label>

      {value.length === 0 && (
        <p className="text-sm text-text-secondary mb-3">No medications added yet.</p>
      )}

      <div className="flex flex-col gap-2.5 mb-3">
        {value.map((row, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={row.name}
              onChange={(e) => updateRow(index, 'name', e.target.value)}
              placeholder="Medication name"
              className="flex-1 min-w-0 rounded-card border border-border bg-background px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none transition-colors duration-150 focus:border-accent focus:ring-1 focus:ring-accent/30"
            />
            <input
              type="text"
              value={row.dosage}
              onChange={(e) => updateRow(index, 'dosage', e.target.value)}
              placeholder="Dosage (e.g. 500mg)"
              className="w-36 shrink-0 rounded-card border border-border bg-background px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none transition-colors duration-150 focus:border-accent focus:ring-1 focus:ring-accent/30"
            />
            <button
              type="button"
              onClick={() => removeRow(index)}
              aria-label="Remove medication"
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-text-secondary hover:text-flag-high hover:bg-flag-high/8 transition-colors duration-150"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="btn-hover inline-flex items-center gap-1.5 text-sm font-medium text-accent border border-accent/30 px-3.5 py-2 rounded-full hover:bg-accent/8 transition-colors duration-150"
      >
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Add medication
      </button>
    </div>
  )
}

export default MedicationInput
