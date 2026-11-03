import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Alert from '../components/common/Alert'
import Field from '../components/common/Field'
import { useAuth } from '../context/AuthContext'
import { errorMessage, fieldErrors } from '../services/api'
import { SITE_NAME } from '../config'
import { ROUTES } from '../config/siteLinks'

const MODES = {
  signin: { title: 'Sign in to ' + SITE_NAME, cta: 'Sign in', switchTo: 'signup', switchLabel: 'Need an account? Sign up' },
  signup: { title: 'Create your account', cta: 'Create account', switchTo: 'signin', switchLabel: 'Already have an account? Sign in' },
}

export default function Login() {
  const [mode, setMode] = useState('signin')
  const [form, setForm] = useState({ email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [fields, setFields] = useState(null)
  const { login, register, requestLoginOtp, isAuthenticated, initialising } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const copy = MODES[mode]
  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setFields(null)
    try {
      if (mode === 'signup') {
        const message = await register({ email: form.email, password: form.password })
        navigate(ROUTES.VERIFY_EMAIL, { state: { email: form.email, notice: message } })
      } else {
        await login({ email: form.email, password: form.password })
        navigate(location.state?.from?.pathname ?? ROUTES.HOME, { replace: true })
      }
    } catch (err) {
      setError(errorMessage(err))
      setFields(fieldErrors(err))
    } finally {
      setBusy(false)
    }
  }

  async function sendCodeInstead() {
    if (!form.email) {
      setError('Enter your email address first.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const message = await requestLoginOtp(form.email)
      navigate(ROUTES.VERIFY_EMAIL, { state: { email: form.email, intent: 'login', notice: message } })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  if (initialising) {
    return <p className="py-8 text-caption text-ink-muted" role="status">Checking your session…</p>
  }
  if (isAuthenticated) return <Navigate to={ROUTES.HOME} replace />

  return (
    <main className="min-h-screen bg-canvas bg-dots text-ink flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-sm card p-8 space-y-6 shadow-e2">
        <div>
          <h1 className="text-h2 font-display text-center mb-1.5">{copy.title}</h1>
          <p className="text-caption text-ink-muted text-center">
            Track your progress through every visualised algorithm.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Field
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={update('email')}
            error={fields?.email}
            required
          />
          <Field
            id="password"
            label="Password"
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            value={form.password}
            onChange={update('password')}
            error={fields?.password}
            hint={mode === 'signup' ? 'At least 8 characters.' : undefined}
            required
          />

          {mode === 'signin' && (
            <div className="flex justify-end -mt-1">
              <button
                type="button"
                onClick={() =>
                  navigate(ROUTES.FORGOT_PASSWORD, { state: { email: form.email } })
                }
                className="text-caption text-accent hover:text-accent-hover focus-ring rounded px-1"
              >
                Forgot password?
              </button>
            </div>
          )}

          {error && <Alert tone="error">{error}</Alert>}

          <button
            type="submit"
            disabled={busy}
            className="w-full btn-primary focus-ring font-medium py-2.5 disabled:opacity-50"
          >
            {busy ? 'Working...' : copy.cta}
          </button>
        </form>

        {mode === 'signin' && (
          <button
            type="button"
            onClick={sendCodeInstead}
            disabled={busy}
            className="w-full text-caption text-ink-muted hover:text-ink focus-ring rounded py-1 disabled:opacity-50"
          >
            Email me a sign-in code instead
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setMode(copy.switchTo)
            setError(null)
            setFields(null)
          }}
          className="w-full text-caption text-accent hover:text-accent-hover font-medium focus-ring rounded py-1"
        >
          {copy.switchLabel}
        </button>

        <p className="pt-2 text-center text-caption text-ink-faint border-t border-line">
          <Link to={ROUTES.HOME} className="hover:text-ink focus-ring rounded px-1">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  )
}


