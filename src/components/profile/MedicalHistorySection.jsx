import ProfileSection from './ProfileSection.jsx'
import ConditionTagInput from './ConditionTagInput.jsx'
import MedicationInput from './MedicationInput.jsx'

const COMMON_CONDITIONS = ['Diabetes', 'Hypertension', 'Asthma', 'Thyroid disorder']
const COMMON_ALLERGIES = ['Penicillin', 'Peanuts', 'Pollen', 'Dust']

// Section 2 — Medical history: conditions, medications, allergies,
// previous surgeries, family history. This is the data passed silently to
// Gemini on every analysis (per spec) to improve contextual accuracy.
//
// Props: formData, setField — see ProfilePage
function MedicalHistorySection({ formData, setField }) {
  return (
    <ProfileSection
      label="Medical history"
      title="Health background"
      description="Shared privately with Gemini during analysis to improve accuracy."
    >
      <ConditionTagInput
        label="Known conditions"
        value={formData.known_conditions}
        onChange={(v) => setField('known_conditions', v)}
        placeholder="e.g. Diabetes, Hypertension"
        suggestions={COMMON_CONDITIONS}
      />

      <MedicationInput
        value={formData.current_medications}
        onChange={(v) => setField('current_medications', v)}
      />

      <ConditionTagInput
        label="Known allergies"
        value={formData.known_allergies}
        onChange={(v) => setField('known_allergies', v)}
        placeholder="e.g. Penicillin, Peanuts"
        suggestions={COMMON_ALLERGIES}
      />

      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Previous surgeries <span className="text-text-secondary font-normal">(optional)</span>
        </label>
        <textarea
          value={formData.previous_surgeries}
          onChange={(e) => setField('previous_surgeries', e.target.value)}
          rows={2}
          placeholder="Any previous surgeries or procedures…"
          className="w-full resize-none rounded-card border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Family medical history <span className="text-text-secondary font-normal">(optional)</span>
        </label>
        <textarea
          value={formData.family_history}
          onChange={(e) => setField('family_history', e.target.value)}
          rows={2}
          placeholder="Relevant conditions in your immediate family…"
          className="w-full resize-none rounded-card border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
        />
      </div>
    </ProfileSection>
  )
}

export default MedicalHistorySection
