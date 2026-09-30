import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Alert from '../components/common/Alert'
import { useAuth } from '../context/AuthContext'
import { errorMessage, fieldErrors } from '../services/api'

const MODES = {
  signin: { title: 'Sign in', cta: 'Sign in', switchTo: 'signup', switchLabel: 'Need an account? Sign up' },
  signup: { title: 'Create your account', cta: 'Create account', switchTo: 'signin', switchLabel: 'Already have an account? Sign in' },
}

export default function Login() {
  const [mode, setMode] = useState('signin')
  const [form, setForm] = useState({ email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [fields, setFields] = useState(null)
  const { login, register, requestLoginOtp } = useAuth()
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
        navigate('/verify-email', { state: { email: form.email, notice: message } })
      } else {
        await login({ email: form.email, password: form.password })
        navigate('/')
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
      navigate('/verify-email', { state: { email: form.email, intent: 'login', notice: message } })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2">{copy.title}</h1>
        <p className="text-sm text-slate-400 text-center mb-8">
          Track your progress through every visualised algorithm.
        </p>

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

          {error && <Alert tone="error">{error}</Alert>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-2.5 font-medium transition"
          >
            {busy ? 'Working...' : copy.cta}
          </button>
        </form>

        {mode === 'signin' && (
          <button
            type="button"
            onClick={sendCodeInstead}
            disabled={busy}
            className="mt-4 w-full text-sm text-slate-400 hover:text-slate-200 disabled:opacity-50"
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
          className="mt-6 w-full text-sm text-indigo-400 hover:text-indigo-300"
        >
          {copy.switchLabel}
        </button>

        <p className="mt-8 text-center text-xs text-slate-500">
          <Link to="/" className="hover:text-slate-300">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  )
}

function Field({ id, label, hint, error, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1.5">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={error ? `${id}-error` : undefined}
        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-indigo-500"
        {...inputProps}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-400">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  )
}
