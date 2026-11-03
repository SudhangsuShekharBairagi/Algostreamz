import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Alert from '../components/common/Alert'
import Field from '../components/common/Field'
import { useAuth } from '../context/AuthContext'
import { errorMessage, fieldErrors } from '../services/api'
import pendingReset from '../services/pendingReset'
import { SITE_NAME } from '../config'
import { ROUTES } from '../config/siteLinks'

export default function ForgotPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  const { requestPasswordReset } = useAuth()

  const [email, setEmail] = useState(location.state?.email ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [fields, setFields] = useState(null)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setFields(null)
    try {
      const notice = await requestPasswordReset(email)
      pendingReset.set(email)
      navigate(ROUTES.RESET_PASSWORD, { state: { email, notice } })
    } catch (err) {
      setError(errorMessage(err))
      setFields(fieldErrors(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-canvas bg-dots text-ink flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-sm card p-8 space-y-6 shadow-e2">
        <div>
          <h1 className="text-h2 font-display text-center mb-1.5">Reset your password</h1>
          <p className="text-caption text-ink-muted text-center">
            Enter the email address on your {SITE_NAME} account and we&apos;ll send you a 6-digit code.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
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

          {error && <Alert tone="error">{error}</Alert>}

          <button
            type="submit"
            disabled={busy}
            className="w-full btn-primary focus-ring font-medium py-2.5 disabled:opacity-50"
          >
            {busy ? 'Sending...' : 'Send reset code'}
          </button>
        </form>

        <p className="pt-2 text-center text-caption text-ink-faint border-t border-line">
          <Link to={ROUTES.LOGIN} className="hover:text-ink focus-ring rounded px-1">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
