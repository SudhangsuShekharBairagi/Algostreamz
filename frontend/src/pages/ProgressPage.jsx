import { useEffect, useMemo, useState } from 'react'
import { Activity, CheckCircle2, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ALGORITHMS } from '../data/algorithmsData'
import progressApi from '../services/progressApi'
import { errorMessage } from '../services/api'

export default function ProgressPage() {
  const { user } = useAuth()
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    progressApi.getProgress().then(
      (data) => {
        if (!cancelled) setProgress(data)
      },
      (requestError) => {
        if (!cancelled) setError(errorMessage(requestError, 'Unable to load your progress.'))
      },
    ).finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [user?.id, reload])

  const completedIds = useMemo(
    () => new Set(progress?.completedVisualizers ?? []),
    [progress],
  )
  const completedCount = ALGORITHMS.filter((algorithm) => completedIds.has(algorithm.id)).length
  const challengeCount = progress?.masteredChallenges.length ?? 0
  const masteryPercent = ALGORITHMS.length
    ? Math.round((completedCount / ALGORITHMS.length) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <span className="chip text-accent font-semibold text-micro uppercase tracking-wider">
          User Dashboard
        </span>
        <h1 className="text-h1 font-display font-semibold text-ink mt-2">
          Your Learning Progress
        </h1>
        <p className="text-body text-ink-muted text-pretty max-w-[68ch] mt-1">
          Track completed algorithm visualizers and mastered challenges as you learn.
        </p>
      </div>

      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <h2 className="text-h3 font-semibold text-ink">Account Status</h2>
            <p className="text-caption text-ink-muted">{user?.email || 'Logged in student'}</p>
          </div>
          <span className="chip border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold text-caption">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {user?.emailVerified ? 'Verified Account' : 'Email Not Verified'}
          </span>
        </div>

        {loading ? (
          <p className="flex items-center gap-2 py-6 text-caption text-ink-muted" role="status">
            <Activity className="w-4 h-4 animate-pulse" />
            Loading your progress…
          </p>
        ) : error ? (
          <div className="flex flex-col items-start gap-3 py-4" role="alert">
            <p className="text-caption text-state-swap">{error}</p>
            <button
              type="button"
              onClick={() => setReload((count) => count + 1)}
              className="btn-ghost inline-flex items-center gap-2 border border-line px-3 py-2 text-caption font-medium text-ink focus-ring"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-sunken rounded-md space-y-1">
                <span className="text-micro font-bold uppercase text-ink-faint">Completed Visualizers</span>
                <span className="block font-mono text-h2 font-bold text-ink tabular-nums">
                  {completedCount} / {ALGORITHMS.length}
                </span>
              </div>
              <div className="p-4 bg-sunken rounded-md space-y-1">
                <span className="text-micro font-bold uppercase text-ink-faint">Challenges Mastered</span>
                <span className="block font-mono text-h2 font-bold text-accent tabular-nums">
                  {challengeCount}
                </span>
              </div>
              <div className="p-4 bg-sunken rounded-md space-y-1">
                <span className="text-micro font-bold uppercase text-ink-faint">Visualizer Mastery</span>
                <span className="block font-mono text-h2 font-bold text-emerald-700 tabular-nums">
                  {masteryPercent}%
                </span>
              </div>
            </div>
            {completedCount === 0 && challengeCount === 0 ? (
              <p className="border-t border-line pt-4 text-caption text-ink-muted" role="status">
                No progress yet. Complete a visualizer to start building your learning record.
              </p>
            ) : (
              <p className="border-t border-line pt-4 text-caption text-ink-muted" role="status">
                Your progress is up to date.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
