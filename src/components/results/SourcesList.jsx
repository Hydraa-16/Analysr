// SourcesList — renders the "Sources referenced" section from the Gemini
// response. Sources are plain text references (not guaranteed to be URLs),
// so render as a simple list rather than assuming linkable content.

function SourcesList({ sources = [], blurred = false }) {
  if (!sources.length) return null

  return (
    <div
      className={`bg-surface border border-border rounded-card p-5 transition-all duration-700 ${
        blurred ? 'blur-md opacity-0' : 'blur-0 opacity-100'
      }`}
    >
      <span className="section-label mb-3 inline-block">Sources referenced</span>
      <ul className="flex flex-col gap-2">
        {sources.map((source, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-text-secondary">
            <span className="text-accent mt-0.5 shrink-0">•</span>
            <span className="leading-relaxed">{source}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SourcesList
