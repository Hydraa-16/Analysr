import { useEffect, useRef, useState } from 'react'
import { supabase } from '../services/supabaseClient.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useProfile } from '../context/ProfileContext.jsx'
import { useDebounce } from '../hooks/useDebounce.js'
import Sidebar from '../components/dashboard/Sidebar.jsx'
import BottomNav from '../components/dashboard/BottomNav.jsx'
import PersonalInfoSection from '../components/profile/PersonalInfoSection.jsx'
import MedicalHistorySection from '../components/profile/MedicalHistorySection.jsx'
import LifestyleSection from '../components/profile/LifestyleSection.jsx'
import AccountSettingsSection from '../components/profile/AccountSettingsSection.jsx'

// Empty-profile shape — mirrors the locked `profiles` table schema exactly.
// user_id and updated_at are attached at save time, not held in form state.
const BLANK_PROFILE = {
  full_name: '',
  date_of_birth: '',
  biological_sex: '',
  blood_group: '',
  known_conditions: [],
  current_medications: [],
  known_allergies: [],
  previous_surgeries: '',
  family_history: '',
  smoking_status: '',
  alcohol_consumption: '',
  activity_level: '',
}

// Small inline status pill shown next to the page title while autosave runs.
function SaveStatus({ status }) {
  if (status === 'idle') return null
  const config = {
    saving: { text: 'Saving…', className: 'text-text-secondary' },
    saved: { text: 'Saved', className: 'text-flag-normal' },
    error: { text: 'Could not save — retrying', className: 'text-flag-high' },
  }[status]

  return (
    <span className={`text-xs font-medium ${config.className} flex items-center gap-1.5`}>
      {status === 'saving' && (
        <span className="w-2.5 h-2.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
      {config.text}
    </span>
  )
}

// ProfilePage — Milestone 9.
// All fields autosave to Supabase 500ms after the user stops typing
// (useDebounce, per spec). No profile setup gate — this screen is reachable
// anytime and simply reflects whatever is currently saved. Section markup
// lives in components/profile/*Section.jsx; this file owns form state,
// initialization from the fetched profile, and the debounced autosave.
function ProfilePage() {
  const { user } = useAuth()
  const { profile, loading: profileLoading, updateLocalProfile } = useProfile()

  const [formData, setFormData] = useState(BLANK_PROFILE)
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url ?? null)
  const [saveStatus, setSaveStatus] = useState('idle')
  const [lastUpdated, setLastUpdated] = useState(profile?.updated_at ?? null)

  const initializedRef = useRef(false)
  const savedSnapshotRef = useRef(null)
  const debouncedFormData = useDebounce(formData, 500)

  // Initialize form state from the fetched profile exactly once (or fall
  // back to blanks for a brand-new user with no profile row yet).
  useEffect(() => {
    if (profileLoading || initializedRef.current) return

    const initial = profile
      ? {
          full_name: profile.full_name ?? '',
          date_of_birth: profile.date_of_birth ?? '',
          biological_sex: profile.biological_sex ?? '',
          blood_group: profile.blood_group ?? '',
          known_conditions: profile.known_conditions ?? [],
          current_medications: profile.current_medications ?? [],
          known_allergies: profile.known_allergies ?? [],
          previous_surgeries: profile.previous_surgeries ?? '',
          family_history: profile.family_history ?? '',
          smoking_status: profile.smoking_status ?? '',
          alcohol_consumption: profile.alcohol_consumption ?? '',
          activity_level: profile.activity_level ?? '',
        }
      : BLANK_PROFILE

    setFormData(initial)
    savedSnapshotRef.current = JSON.stringify(initial)
    setLastUpdated(profile?.updated_at ?? null)
    initializedRef.current = true
  }, [profile, profileLoading])

  // Autosave whenever the debounced form data actually differs from what's
  // already saved in Supabase (Risk 12 — avoid excessive writes).
  useEffect(() => {
    if (!initializedRef.current || !user) return

    const serialized = JSON.stringify(debouncedFormData)
    if (serialized === savedSnapshotRef.current) return

    const save = async () => {
      setSaveStatus('saving')
      const nowIso = new Date().toISOString()

      // date_of_birth is a Postgres `date` column — it accepts a real date
      // or null, but rejects an empty string with a syntax error. All other
      // fields are text/JSON columns where '' is valid, so only this one
      // needs the null coercion.
      const payload = {
        user_id: user.id,
        ...debouncedFormData,
        date_of_birth: debouncedFormData.date_of_birth || null,
        updated_at: nowIso,
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .maybeSingle()

      if (error) {
        console.error('Profile autosave failed:', error.message)
        setSaveStatus('error')
        return
      }

      savedSnapshotRef.current = serialized
      setLastUpdated(data?.updated_at ?? nowIso)
      updateLocalProfile(debouncedFormData)
      setSaveStatus('saved')
    }

    save()
  }, [debouncedFormData, user, updateLocalProfile])

  const setField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const formattedLastUpdated = lastUpdated
    ? new Date(lastUpdated).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : null

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 px-5 py-6 lg:px-10 lg:py-8 pb-24 lg:pb-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto lg:mx-0">
          <header className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-sm text-text-secondary font-mono mb-0.5">Settings</p>
              <h1 className="text-2xl font-display font-bold text-text-primary leading-tight">
                Profile
              </h1>
            </div>
            <SaveStatus status={saveStatus} />
          </header>

          {profileLoading ? (
            <div className="flex flex-col gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-surface border border-border rounded-card p-6 animate-pulse h-40" />
              ))}
            </div>
          ) : (
            <>
              <PersonalInfoSection
                user={user}
                formData={formData}
                setField={setField}
                avatarUrl={avatarUrl}
                onAvatarUploaded={setAvatarUrl}
              />
              <MedicalHistorySection formData={formData} setField={setField} />
              <LifestyleSection formData={formData} setField={setField} />
              <AccountSettingsSection user={user} />

              {formattedLastUpdated && (
                <p className="text-xs text-text-secondary text-center mt-2">
                  Last updated {formattedLastUpdated}
                </p>
              )}
            </>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

export default ProfilePage