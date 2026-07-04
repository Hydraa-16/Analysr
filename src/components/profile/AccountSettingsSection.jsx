import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabaseClient.js'
import { useAuth } from '../../context/AuthContext.jsx'
import ProfileSection from './ProfileSection.jsx'

// Password change form.
function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState(null) // null | 'submitting' | 'success' | error string

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newPassword.length < 8) {
      setStatus('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setStatus('Passwords do not match.')
      return
    }

    setStatus('submitting')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      console.error('Password update failed:', error.message)
      setStatus('Could not update password. Please try again.')
    } else {
      setStatus('success')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="block text-sm font-semibold text-text-primary">Change password</label>
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="New password"
        className="w-full rounded-card border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
      />
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm new password"
        className="w-full rounded-card border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
      />
      {status && status !== 'submitting' && status !== 'success' && (
        <p className="text-xs text-flag-high">{status}</p>
      )}
      {status === 'success' && <p className="text-xs text-flag-normal">Password updated.</p>}
      <button
        type="submit"
        disabled={status === 'submitting' || !newPassword}
        className="btn-hover self-start bg-nav-bg text-white text-sm font-medium px-5 py-2.5 rounded-full disabled:opacity-50"
      >
        {status === 'submitting' ? 'Updating…' : 'Update password'}
      </button>
    </form>
  )
}

// Destructive delete-account flow — two-step confirm before firing.
// Calls a Postgres RPC function rather than any client-side admin call,
// since the anon/browser client can never delete an auth user directly.
// Requires a `delete_user_account()` SECURITY DEFINER function in Supabase —
// see setup note from the build.
function DeleteAccountControl() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)
    const { error: rpcError } = await supabase.rpc('delete_user_account')
    if (rpcError) {
      console.error('Account deletion failed:', rpcError.message)
      setError('Could not delete your account. Please try again or contact support.')
      setDeleting(false)
      return
    }
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-flag-high mb-1">Delete account</label>
      <p className="text-xs text-text-secondary mb-3 leading-relaxed">
        Permanently deletes your account, profile, and all saved analyses. This cannot be undone.
      </p>

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="btn-hover text-sm font-medium text-flag-high border border-flag-high/30 px-4 py-2 rounded-full hover:bg-flag-high/8 transition-colors duration-150"
        >
          Delete my account
        </button>
      ) : (
        <div className="flex flex-col gap-2.5 bg-flag-high/6 border border-flag-high/20 rounded-card p-4">
          <p className="text-sm text-text-primary font-medium">
            Are you absolutely sure? This is permanent.
          </p>
          {error && <p className="text-xs text-flag-high">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="btn-hover bg-flag-high text-white text-sm font-semibold px-4 py-2 rounded-full disabled:opacity-60"
            >
              {deleting ? 'Deleting…' : 'Yes, delete permanently'}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={deleting}
              className="btn-hover text-sm font-medium text-text-secondary border border-border px-4 py-2 rounded-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Section 4 — Account: email (read-only), change password, delete account.
//
// Props: user — current authenticated user (from useAuth)
function AccountSettingsSection({ user }) {
  return (
    <ProfileSection label="Account" title="Account settings">
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">Email</label>
        <input
          type="email"
          value={user?.email ?? ''}
          readOnly
          disabled
          className="w-full rounded-card border border-border bg-border/30 px-4 py-2.5 text-sm text-text-secondary cursor-not-allowed"
        />
      </div>

      <div className="h-px bg-border" />
      <ChangePasswordForm />
      <div className="h-px bg-border" />
      <DeleteAccountControl />
    </ProfileSection>
  )
}

export default AccountSettingsSection
