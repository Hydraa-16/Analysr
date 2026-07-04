// FindingsCard — reusable section card used for "Key findings",
// "What this may indicate", and "Recommended next steps". Each renders
// plain language first (always visible), then medical detail behind a
// SectionToggle so the primary, accessible explanation leads.

import PlainExplanationBlock from './PlainExplanationBlock.jsx'
import MedicalExplanationBlock from './MedicalExplanationBlock.jsx'
import SectionToggle from './SectionToggle.jsx'

function FindingsCard({ label, plain, medical, disclaimer, blurred = false }) {
  if (!plain && !medical) return null

  return (
    <div
      className={`bg-surface border border-border rounded-card p-5 transition-all duration-700 ${
        blurred ? 'blur-md opacity-0' : 'blur-0 opacity-100'
      }`}
    >
      <span className="section-label mb-3 inline-block">{label}</span>

      <PlainExplanationBlock text={plain} />

      {medical && (
        <SectionToggle>
          <MedicalExplanationBlock text={medical} />
        </SectionToggle>
      )}

      {disclaimer && (
        <p className="mt-4 text-xs text-text-secondary leading-relaxed italic">{disclaimer}</p>
      )}
    </div>
  )
}

export default FindingsCard
