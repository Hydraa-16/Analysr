// MedicalExplanationBlock — clinical terminology, smaller secondary style,
// rendered below a subtle separator beneath the plain explanation, per spec.

function MedicalExplanationBlock({ text, blurred = false }) {
  if (!text) return null

  return (
    <div
      className={`mt-3 pt-3 border-t border-border transition-all duration-700 ${
        blurred ? 'blur-md opacity-0' : 'blur-0 opacity-100'
      }`}
    >
      <span className="block text-[11px] font-semibold uppercase tracking-wide text-text-secondary mb-1.5">
        Medical terminology
      </span>
      <p className="text-sm text-text-secondary leading-relaxed">{text}</p>
    </div>
  )
}

export default MedicalExplanationBlock
