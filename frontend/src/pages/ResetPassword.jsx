import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Alert from '../components/common/Alert'
import Field from '../components/common/Field'
import { useAuth } from '../context/AuthContext'
import { errorMessage, fieldErrors } from '../services/api'
import pendingReset from '../services/pendingReset'
import { ROUTES } from '../config/siteLinks'

const RESEND_COOLDOWN_SECONDS = 60

export default function ResetPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  const { resetPassword, requestPasswordReset } = useAuth()

  // Router state is the fast path; sessionStorage keeps the address across a reload.
  // When neither is present (opened directly or from the email in a new tab) the form
  // asks for the address instead of bouncing the user back to the request screen.
  const [knownEmail] = useState(() => location.state?.email || pendingReset.get())
  const [email, setEmail] = useState(knownEmail)
  const { notice } = location.state ?? {}

  const [form, setForm] = useState({ code: '', newPassword: '', confirmPassword: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [fields, setFields] = useState(null)
  const [info, setInfo] = useState(notice ?? null)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const timer = setTimeout(() => setCooldown((n) => n - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const update = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }))

  async function submit(event) {
    event.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      setError('The two passwords do not match.')
      return
    }
    setBusy(true)
    setError(null)
    setFields(null)
    try {
      await resetPassword({ email, code: form.code, newPassword: form.newPassword })
      pendingReset.clear()
      navigate(ROUTES.HOME, { replace: true })
    } catch (err) {
      setError(errorMessage(err))
      setFields(fieldErrors(err))
      setForm((prev) => ({ ...prev, code: '' }))
    } finally {
      setBusy(false)
    }
  }

  async function resend() {
    if (!email) {
      setError('Enter your email address first.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const message = await requestPasswordReset(email)
      pendingReset.set(email)
      setInfo(message)
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const canSubmit =
    email && form.code.length === 6 && form.newPassword && form.confirmPassword

  return (
    <main className="min-h-screen bg-canvas bg-dots text-ink flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-sm card p-8 space-y-6 shadow-e2">
        <div>
          <h1 className="text-h2 font-display text-center mb-1.5">Choose a new password</h1>
          <p className="text-caption text-ink-muted text-center">
            {knownEmail ? (
              <>
                We sent a 6-digit code to{' '}
                <span className="font-semibold text-ink">{knownEmail}</span>. Enter it below with
                your new password.
              </>
            ) : (
              <>Enter the email address you requested the code for, then the code and your new password.</>
            )}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {!knownEmail && (
            <Field
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={fields?.email}
              required
            />
          )}
          <Field
            id="code"
            label="6-digit code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={form.code}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, code: event.target.value.replace(/\D/g, '') }))
            }
            error={fields?.code}
            required
          />
          <Field
            id="newPassword"
            label="New password"
            type="password"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={update('newPassword')}
            error={fields?.newPassword}
            hint="At least 8 characters."
            required
          />
          <Field
            id="confirmPassword"
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={update('confirmPassword')}
            required
          />

          {error && <Alert tone="error">{error}</Alert>}
          {info && !error && <Alert tone="info">{info}</Alert>}

          <button
            type="submit"
            disabled={busy || !canSubmit}
            className="w-full btn-primary focus-ring font-medium py-2.5 disabled:opacity-50"
          >
            {busy ? 'Updating...' : 'Reset password'}
          </button>
        </form>

        {knownEmail && (
          <div className="text-center">
            <button
              type="button"
              onClick={resend}
              disabled={busy || cooldown > 0}
              className="text-caption text-accent hover:text-accent-hover disabled:text-ink-faint disabled:cursor-not-allowed focus-ring rounded px-1"
            >
              {cooldown > 0 ? `Resend available in ${cooldown}s` : "Didn't get it? Send a new code"}
            </button>
          </div>
        )}

        <p className="pt-2 text-center text-caption text-ink-faint border-t border-line">
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            onClick={() => pendingReset.clear()}
            className="hover:text-ink focus-ring rounded px-1"
          >
            Use a different email
          </Link>
        </p>
      </div>
    </main>
  )
}
