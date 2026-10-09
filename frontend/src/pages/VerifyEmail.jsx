import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Alert from '../components/common/Alert'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../services/api'
import { ROUTES } from '../config/siteLinks'

const RESEND_COOLDOWN_SECONDS = 60

export default function VerifyEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const { verifyEmail, verifyLoginOtp, resendVerification, requestLoginOtp } = useAuth()

  const { email = '', intent = 'verify', notice } = location.state ?? {}

  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(notice ?? null)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (!email) navigate(ROUTES.LOGIN, { replace: true })
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
      navigate(ROUTES.HOME)
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
    <main className="min-h-screen bg-canvas bg-dots text-ink flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-sm card p-8 space-y-6 shadow-e2">
        <div>
          <h1 className="text-h2 font-display text-center mb-1.5">
            {intent === 'login' ? 'Enter your sign-in code' : 'Check your email'}
          </h1>
          <p className="text-caption text-ink-muted text-center">
            {intent === 'login' ? (
              <>We sent a 6-digit code to <span className="font-semibold text-ink">{email}</span>.</>
            ) : (
              <>
                We sent a 6-digit code to <span className="font-semibold text-ink">{email}</span>. Enter it to finish setting up your account.
              </>
            )}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            aria-label="6-digit code"
            className="w-full rounded-md bg-surface border border-line px-3 py-3 text-center font-mono text-2xl tracking-[0.5em] tabular-nums text-ink focus-ring"
          />

          {error && <Alert tone="error">{error}</Alert>}
          {info && !error && <Alert tone="info">{info}</Alert>}

          <button
            type="submit"
            disabled={busy || code.length !== 6}
            className="w-full btn-primary focus-ring font-medium py-2.5 disabled:opacity-50"
          >
            {busy ? 'Checking...' : 'Continue'}
          </button>
        </form>

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

        <p className="pt-2 text-center text-caption text-ink-faint border-t border-line">
          <button type="button" onClick={() => navigate(ROUTES.LOGIN)} className="hover:text-ink focus-ring rounded px-1">
            Use a different account
          </button>
        </p>
      </div>
    </main>
  )
}
