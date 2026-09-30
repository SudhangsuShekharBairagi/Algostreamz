import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Alert from '../components/common/Alert'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../services/api'

const RESEND_COOLDOWN_SECONDS = 60

export default function VerifyEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const { verifyEmail, verifyLoginOtp, resendVerification, requestLoginOtp } = useAuth()

  // Passed through router state so the address is not left in history or a referrer.
  const { email = '', intent = 'verify', notice } = location.state ?? {}

  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(notice ?? null)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (!email) navigate('/login', { replace: true })
  }, [email, navigate])

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const timer = setTimeout(() => setCooldown((n) => n - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  async function submit(event) {
    event.preventDefault()
    if (code.length !== 6) return
    setBusy(true)
    setError(null)
    try {
      const payload = { email, code }
      if (intent === 'login') {
        await verifyLoginOtp(payload)
      } else {
        await verifyEmail(payload)
      }
      navigate('/')
    } catch (err) {
      setError(errorMessage(err))
      setCode('')
    } finally {
      setBusy(false)
    }
  }

  async function resend() {
    setBusy(true)
    setError(null)
    try {
      const message =
        intent === 'login'
          ? await requestLoginOtp(email)
          : await resendVerification(email)
      setInfo(message)
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2">
          {intent === 'login' ? 'Enter your sign-in code' : 'Check your email'}
        </h1>
        <p className="text-sm text-slate-400 text-center mb-8">
          {intent === 'login' ? (
            <>We sent a 6-digit code to <span className="text-slate-200">{email}</span>.</>
          ) : (
            <>
              We sent a 6-digit code to <span className="text-slate-200">{email}</span>. Enter it to finish
              setting up your account.
            </>
          )}
        </p>

        <form onSubmit={submit} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            autoFocus
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            aria-label="6-digit code"
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-3 text-center font-mono text-2xl tracking-[0.5em] outline-none focus:border-indigo-500"
          />

          {error && <Alert tone="error">{error}</Alert>}
          {info && !error && <Alert tone="success">{info}</Alert>}

          <button
            type="submit"
            disabled={busy || code.length !== 6}
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-2.5 font-medium transition"
          >
            {busy ? 'Checking...' : 'Continue'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={resend}
            disabled={busy || cooldown > 0}
            className="text-sm text-indigo-400 hover:text-indigo-300 disabled:text-slate-600 disabled:cursor-not-allowed"
          >
            {cooldown > 0 ? `Resend available in ${cooldown}s` : "Didn't get it? Send a new code"}
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          <button type="button" onClick={() => navigate('/login')} className="hover:text-slate-300">
            Use a different account
          </button>
        </p>
      </div>
    </main>
  )
}
