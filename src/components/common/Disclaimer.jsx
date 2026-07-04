// Reusable medical disclaimer — required on landing, upload, results, and PDF export per spec.
// Accepts a `compact` prop for tighter layouts (results screen, upload screen).
function Disclaimer({ compact = false }) {
  if (compact) {
    return (
      <p className="text-xs text-text-secondary text-center leading-relaxed">
        Analysr provides AI-generated preliminary analysis. This is{' '}
        <strong className="font-semibold text-text-primary">not</strong> a substitute for
        professional medical advice, diagnosis, or treatment. Always consult a licensed physician.
      </p>
    )
  }

  return (
    <div className="border border-border rounded-card bg-surface px-5 py-4">
      <p className="text-xs text-text-secondary leading-relaxed text-center">
        <span className="font-semibold text-text-primary">Medical disclaimer: </span>
        Analysr provides AI-generated preliminary medical report analysis. This tool is
        informational only. It is{' '}
        <span className="font-semibold text-text-primary">NOT</span> a substitute for
        professional medical advice, diagnosis, or treatment. Always consult a licensed physician.
      </p>
    </div>
  )
}

export default Disclaimer
