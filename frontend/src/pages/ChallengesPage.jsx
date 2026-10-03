import { ShieldCheck, Award } from 'lucide-react'

export default function ChallengesPage() {
  return (
    <div className="space-y-6">
      <div>
        <span className="chip text-accent font-semibold text-micro uppercase tracking-wider">
          Practice & Quizzes
        </span>
        <h1 className="text-h1 font-display font-semibold text-ink mt-2">
          Algorithm Challenges & Quizzes
        </h1>
        <p className="text-body text-ink-muted text-pretty max-w-[68ch] mt-1">
          Predict next array steps, spot worst-case inputs, and test your DSA intuition with interactive visual challenges.
        </p>
      </div>

      <div className="card p-8 space-y-4 text-center py-16">
        <div className="w-12 h-12 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto">
          <Award className="w-6 h-6" />
        </div>
        <h2 className="text-h2 font-display text-ink">Interactive Challenges Hub</h2>
        <p className="text-caption text-ink-muted max-w-[50ch] mx-auto">
          Interactive quiz prompts and step prediction challenges ready.
        </p>
      </div>
    </div>
  )
}
