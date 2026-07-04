import { useRef, useState } from 'react'
import { supabase } from '../../services/supabaseClient.js'

const MAX_PHOTO_MB = 5
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg']

// Profile photo is optional (per spec) and is NOT part of the locked
// `profiles` table schema, so it is not written there. Instead it's stored
// in Supabase Storage (bucket: "avatars") and referenced via Supabase Auth's
// own user_metadata (`supabase.auth.updateUser({ data: { avatar_url } })`).
// This keeps the DB schema untouched while still persisting the photo
// properly across sessions. Requires an "avatars" storage bucket to exist —
// see setup note from the build.
//
// Props:
//   user        — current authenticated user (from useAuth)
//   avatarUrl   — current photo URL, or null
//   displayName — used to derive fallback initials
//   onUploaded(url) — called with the new public URL after a successful upload
function ProfilePhotoUploader({ user, avatarUrl, displayName, onUploaded }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const initials = (displayName || user?.email || '?')
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return

    setError(null)

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please upload a PNG or JPG image.')
      return
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_PHOTO_MB}MB.`)
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, cacheControl: '3600' })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(path)
      // Cache-bust so the new photo shows immediately even though the path is unchanged.
      const freshUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`

      const { error: authError } = await supabase.auth.updateUser({
        data: { avatar_url: freshUrl },
      })
      if (authError) throw authError

      onUploaded(freshUrl)
    } catch (err) {
      console.error('Photo upload failed:', err)
      setError('Could not upload photo. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-16 h-16 shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Profile photo"
            className="w-16 h-16 rounded-full object-cover border border-border"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-accent/10 border border-border flex items-center justify-center text-accent font-semibold text-lg">
            {initials}
          </div>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          aria-label="Change profile photo"
          className="btn-hover absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-nav-bg text-white flex items-center justify-center border-2 border-surface disabled:opacity-60"
        >
          {uploading ? (
            <span className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          ) : (
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 11.5V10a2 2 0 012-2h.5l1-1.5h3l1 1.5H10a2 2 0 012 2v1.5a1 1 0 01-1 1H3a1 1 0 01-1-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              <circle cx="7" cy="8.5" r="1.6" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div>
        <p className="text-sm font-semibold text-text-primary">Profile photo</p>
        <p className="text-xs text-text-secondary mt-0.5">PNG or JPG, up to {MAX_PHOTO_MB}MB. Optional.</p>
        {error && <p className="text-xs text-flag-high mt-1">{error}</p>}
      </div>
    </div>
  )
}

export default ProfilePhotoUploader
