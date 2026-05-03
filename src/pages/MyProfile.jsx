import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, Save, ShieldCheck, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { upsertProfile } from '../lib/database'
import { usePageMeta } from '../lib/usePageMeta'

export default function MyProfile() {
  usePageMeta({ title: 'My Profile' })
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [deletionStatus, setDeletionStatus] = useState(null) // null | 'pending' | 'processing' | 'completed'
  const [deletionReason, setDeletionReason] = useState('')
  const [submittingDeletion, setSubmittingDeletion] = useState(false)
  const [confirmDeletion, setConfirmDeletion] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [profileLoading, setProfileLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user) {
      navigate('/login', { replace: true })
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', user.id)
          .maybeSingle()
        if (cancelled) return
        setFirstName(data?.first_name || user.user_metadata?.first_name || '')
        setLastName(data?.last_name || user.user_metadata?.last_name || '')
        setEmail(data?.email || user.email || '')
      } finally {
        if (!cancelled) setProfileLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [user, loading, navigate])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      const { data } = await supabase
        .from('data_deletion_requests')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle()
      if (!cancelled && data?.status) setDeletionStatus(data.status)
    })()
    return () => { cancelled = true }
  }, [user])

  const handleDeletionRequest = async () => {
    if (!confirmDeletion) {
      toast.error('Please tick the confirmation checkbox')
      return
    }
    setSubmittingDeletion(true)
    try {
      const { error } = await supabase.from('data_deletion_requests').insert({
        user_id: user.id,
        email: user.email,
        reason: deletionReason.trim() || null,
      })
      if (error) throw error
      setDeletionStatus('pending')
      toast.success('Deletion request submitted. We will process within 30 days.')
    } catch (err) {
      toast.error(err.message || 'Could not submit request')
    } finally {
      setSubmittingDeletion(false)
    }
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Please enter your full name')
      return
    }
    setSavingProfile(true)
    try {
      await upsertProfile({
        id: user.id,
        email: user.email,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      })
      await supabase.auth.updateUser({
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        },
      })
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.message || 'Could not save profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    if (!currentPassword) {
      toast.error('Please enter your current password')
      return
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    if (newPassword === currentPassword) {
      toast.error('New password must be different from your current password')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    setSavingPassword(true)
    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })
      if (signInErr) {
        toast.error('Current password is incorrect')
        setSavingPassword(false)
        return
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      toast.success('Password updated')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(err.message || 'Could not update password')
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading || profileLoading) {
    return <div className="myorders-loading"><span className="spinner" /> Loading profile...</div>
  }

  const initials = `${(firstName[0] || '').toUpperCase()}${(lastName[0] || '').toUpperCase()}` || (email[0] || '').toUpperCase()

  return (
    <div className="myorders-page">
      <div className="container">
        <div className="myorders-header">
          <h1>My Profile</h1>
          <p>Manage your account details and password</p>
        </div>

        <div className="profile-grid">
          <section className="profile-card">
            <div className="profile-card-head">
              <div className="profile-avatar">{initials || <User size={20} />}</div>
              <div>
                <h3>Account details</h3>
                <p>Update your name and view your account email</p>
              </div>
            </div>

            <form onSubmit={handleProfileSave} className="auth-form">
              <div className="auth-name-row">
                <div className="auth-input-group">
                  <label>First Name</label>
                  <div className="input-group">
                    <User size={16} />
                    <input
                      type="text"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="auth-input-group">
                  <label>Last Name</label>
                  <div className="input-group">
                    <User size={16} />
                    <input
                      type="text"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="auth-input-group">
                <label>Email Address</label>
                <div className="input-group input-readonly">
                  <Mail size={16} />
                  <input type="email" value={email} readOnly disabled />
                </div>
                <span className="field-hint">Contact support to change your email</span>
              </div>

              <button type="submit" className="btn btn-blue full-width auth-submit" disabled={savingProfile}>
                {savingProfile ? (
                  <span className="btn-loading"><span className="spinner" />Saving...</span>
                ) : (
                  <><Save size={16} /> Save changes</>
                )}
              </button>
            </form>
          </section>

          <section className="profile-card">
            <div className="profile-card-head">
              <div className="profile-avatar profile-avatar-secure"><ShieldCheck size={20} /></div>
              <div>
                <h3>Change password</h3>
                <p>Use a strong password you don't reuse anywhere else</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSave} className="auth-form">
              <div className="auth-input-group">
                <label>Current password</label>
                <div className="input-group">
                  <Lock size={16} />
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    required
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowCurrent(s => !s)} tabIndex={-1}>
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="auth-input-group">
                <label>New password</label>
                <div className="input-group">
                  <Lock size={16} />
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    minLength={6}
                    required
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowNew(s => !s)} tabIndex={-1}>
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="auth-input-group">
                <label>Confirm new password</label>
                <div className={`input-group ${confirmPassword && newPassword !== confirmPassword ? 'input-error' : ''}`}>
                  <Lock size={16} />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    minLength={6}
                    required
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowConfirm(s => !s)} tabIndex={-1}>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <span className="field-error">Passwords do not match</span>
                )}
              </div>

              <button type="submit" className="btn btn-blue full-width auth-submit" disabled={savingPassword}>
                {savingPassword ? (
                  <span className="btn-loading"><span className="spinner" />Updating...</span>
                ) : (
                  <><ShieldCheck size={16} /> Update password</>
                )}
              </button>
            </form>
          </section>

          <section className="profile-card profile-card-danger">
            <div className="profile-card-head">
              <div className="profile-avatar profile-avatar-danger"><Trash2 size={20} /></div>
              <div>
                <h3>Delete my account</h3>
                <p>Right to erasure under India's DPDP Act, 2023</p>
              </div>
            </div>

            {deletionStatus ? (
              <div className="deletion-status">
                <p>
                  <strong>Request status:</strong> {deletionStatus}
                </p>
                <p className="field-hint">
                  We process deletion requests within 30 days of submission, as
                  required by law. You will receive a confirmation email once
                  complete.
                </p>
              </div>
            ) : (
              <div className="auth-form">
                <p className="field-hint" style={{ marginBottom: 12 }}>
                  Submitting this request will permanently delete your account,
                  orders, courses, and personal data. This cannot be undone.
                </p>
                <div className="auth-input-group">
                  <label>Reason (optional)</label>
                  <textarea
                    value={deletionReason}
                    onChange={(e) => setDeletionReason(e.target.value)}
                    rows={3}
                    placeholder="Help us improve — what made you decide to leave?"
                    style={{ width: '100%', padding: 10, borderRadius: 8 }}
                  />
                </div>
                <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.88rem' }}>
                  <input
                    type="checkbox"
                    checked={confirmDeletion}
                    onChange={(e) => setConfirmDeletion(e.target.checked)}
                    style={{ marginTop: 3 }}
                  />
                  <span>I understand this will permanently delete all my data within 30 days.</span>
                </label>
                <button
                  type="button"
                  className="btn full-width auth-submit"
                  style={{ background: '#7a1a1a', color: '#fff', marginTop: 12 }}
                  onClick={handleDeletionRequest}
                  disabled={submittingDeletion || !confirmDeletion}
                >
                  {submittingDeletion ? (
                    <span className="btn-loading"><span className="spinner" />Submitting...</span>
                  ) : (
                    <><Trash2 size={16} /> Request account deletion</>
                  )}
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
