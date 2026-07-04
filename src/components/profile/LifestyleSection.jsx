import ProfileSection from './ProfileSection.jsx'
import LifestyleSelector from './LifestyleSelector.jsx'

// Section 3 — Lifestyle: smoking status, alcohol consumption, activity level.
// Option sets match the DB spec values exactly — do not reword them.
//
// Props: formData, setField — see ProfilePage
function LifestyleSection({ formData, setField }) {
  return (
    <ProfileSection label="Lifestyle" title="Daily habits">
      <LifestyleSelector
        label="Smoking status"
        options={['Never', 'Former', 'Current']}
        value={formData.smoking_status}
        onChange={(v) => setField('smoking_status', v)}
      />
      <LifestyleSelector
        label="Alcohol consumption"
        options={['None', 'Occasional', 'Regular']}
        value={formData.alcohol_consumption}
        onChange={(v) => setField('alcohol_consumption', v)}
      />
      <LifestyleSelector
        label="Activity level"
        options={['Sedentary', 'Moderate', 'Active']}
        value={formData.activity_level}
        onChange={(v) => setField('activity_level', v)}
      />
    </ProfileSection>
  )
}

export default LifestyleSection
