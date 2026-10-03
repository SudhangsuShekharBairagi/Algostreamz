import { Activity, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function ProgressPage() {
  const { user } = useAuth()

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
          Track completed algorithm visualizers, quiz scores, and algorithm mastery metrics.
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
            Verified Account
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-sunken rounded-md space-y-1">
            <span className="text-micro font-bold uppercase text-ink-faint">Completed Visualizers</span>
            <span className="block font-mono text-h2 font-bold text-ink tabular-nums">12 / 14</span>
          </div>
          <div className="p-4 bg-sunken rounded-md space-y-1">
            <span className="text-micro font-bold uppercase text-ink-faint">Challenges Mastered</span>
            <span className="block font-mono text-h2 font-bold text-accent tabular-nums">28</span>
          </div>
          <div className="p-4 bg-sunken rounded-md space-y-1">
            <span className="text-micro font-bold uppercase text-ink-faint">Overall Mastery</span>
            <span className="block font-mono text-h2 font-bold text-emerald-700 tabular-nums">86%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
