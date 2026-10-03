import { Zap, Activity } from 'lucide-react'

export default function RaceModePage() {
  return (
    <div className="space-y-6">
      <div>
        <span className="chip text-accent font-semibold text-micro uppercase tracking-wider">
          Performance Benchmarking
        </span>
        <h1 className="text-h1 font-display font-semibold text-ink mt-2">
          Race Mode: Side-by-Side Comparison
        </h1>
        <p className="text-body text-ink-muted text-pretty max-w-[68ch] mt-1">
          Run two algorithms concurrently on identical input datasets to compare step counts, comparisons, and time complexities side-by-side.
        </p>
      </div>

      <div className="card p-8 space-y-4 text-center py-16">
        <div className="w-12 h-12 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto">
          <Zap className="w-6 h-6" />
        </div>
        <h2 className="text-h2 font-display text-ink">Race Engine Initialized</h2>
        <p className="text-caption text-ink-muted max-w-[50ch] mx-auto">
          Dual canvas layout and step comparison synchronizer ready for algorithm racing.
        </p>
      </div>
    </div>
  )
}
