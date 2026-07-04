import ProfileSection from './ProfileSection.jsx'
import ProfilePhotoUploader from './ProfilePhotoUploader.jsx'
import LifestyleSelector from './LifestyleSelector.jsx'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']
const BIOLOGICAL_SEX_OPTIONS = ['Male', 'Female', 'Intersex', 'Prefer not to say']

// Section 1 — Personal info: full name, DOB, biological sex, blood group, photo.
//
// Props:
//   user, formData, setField — see ProfilePage
//   avatarUrl, onAvatarUploaded — passed through to ProfilePhotoUploader
function PersonalInfoSection({ user, formData, setField, avatarUrl, onAvatarUploaded }) {
  return (
    <ProfileSection label="Personal info" title="About you">
      <ProfilePhotoUploader
        user={user}
        avatarUrl={avatarUrl}
        displayName={formData.full_name}
        onUploaded={onAvatarUploaded}
      />

      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">Full name</label>
        <input
          type="text"
          value={formData.full_name}
          onChange={(e) => setField('full_name', e.target.value)}
          placeholder="Your full name"
          className="w-full rounded-card border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">Date of birth</label>
          <input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => setField('date_of_birth', e.target.value)}
            className="w-full rounded-card border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">Blood group</label>
          <select
            value={formData.blood_group}
            onChange={(e) => setField('blood_group', e.target.value)}
            className="w-full rounded-card border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
          >
            <option value="">Select…</option>
            {BLOOD_GROUPS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      <LifestyleSelector
        label="Biological sex"
        options={BIOLOGICAL_SEX_OPTIONS}
        value={formData.biological_sex}
        onChange={(v) => setField('biological_sex', v)}
      />
    </ProfileSection>
  )
}

export default PersonalInfoSection
