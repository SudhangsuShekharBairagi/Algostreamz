import { Link } from 'react-router-dom'
import {
  Check,
  Minus,
  ArrowRight,
  ShieldCheck,
  Activity,
  Sparkles,
  Play,
} from 'lucide-react'
import { SITE_NAME } from '../../config'
import { ROUTES } from '../../config/siteLinks'

const COMPARISON_ROWS = [
  {
    feature: 'Learning style',
    typical: 'Passive animation you watch',
    algostreamz: 'Predict the next step, then see why',
  },
  {
    feature: 'Code connection',
    typical: 'Separate code, or none',
    algostreamz: 'Pseudocode highlights the exact line, live',
  },
  {
    feature: 'Explanations',
    typical: 'One level of text, or none',
    algostreamz: 'Beginner and technical modes',
  },
  {
    feature: 'Control',
    typical: 'Play and pause',
    algostreamz: 'Step back, scrub, speed 0.5x to 4x, keyboard shortcuts',
  },
  {
    feature: 'Comparison',
    typical: 'One algorithm at a time',
    algostreamz: 'Race two algorithms on identical data with operation counts',
  },
  {
    feature: 'Evidence',
    typical: 'Wall-clock time',
    algostreamz: 'Operation counts that match Big-O',
  },
  {
    feature: 'Focus',
    typical: 'Cluttered panels',
    algostreamz: 'Zen mode with one caption and a floating dock',
  },
  {
    feature: 'Progress',
    typical: 'None',
    algostreamz: 'Challenges, bug spotter and progress tracking',
  },
]

export default function WhySection() {
  return (
    <section
      id="why"
      aria-labelledby="why-heading"
      className="space-y-12 scroll-mt-24 font-sans"
    >
      {/* Header Section */}
      <div className="space-y-3 max-w-[72ch]">
        <div className="inline-flex items-center gap-2 chip border-accent/20 bg-accent-soft text-accent font-semibold text-micro uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          WHY ALGOSTREAMZ
        </div>
        <h2 id="why-heading" className="text-h1 font-display font-semibold text-ink">
          Most visualizers show you the answer. We help you understand it.
        </h2>
        <p className="text-body text-ink-muted text-pretty">
          {SITE_NAME} is an educational workbench designed from first principles to connect algorithm theory directly to execution step traces.
        </p>
      </div>

      {/* Part A: Accessible Comparison Table (Desktop: Table, Mobile: Stacked Cards) */}
      <div className="space-y-6">
        {/* Desktop Table View (≥768px) */}
        <div className="hidden md:block card overflow-hidden shadow-e1 border border-line">
          <table className="w-full text-left border-collapse" aria-label={`Comparison of typical visualizers versus ${SITE_NAME}`}>
            <thead>
              <tr className="border-b border-line bg-sunken/60 text-caption font-semibold">
                <th scope="col" className="p-4 text-ink-muted w-1/4">
                  Feature
                </th>
                <th scope="col" className="p-4 text-ink-muted w-1/3">
                  Typical visualizers
                </th>
                <th scope="col" className="p-4 bg-accent-soft/70 border-l border-r border-accent/20 text-accent-strong w-5/12 font-bold">
                  <div className="flex items-center justify-between">
                    <span>{SITE_NAME}</span>
                    <span className="chip bg-accent text-white border-none text-[11px] font-mono uppercase">
                      Highlighted
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-caption">
              {COMPARISON_ROWS.map((row, idx) => (
                <tr key={idx} className="hover:bg-sunken/30 transition-colors">
                  <th scope="row" className="p-4 font-semibold text-ink font-sans">
                    {row.feature}
                  </th>
                  <td className="p-4 text-ink-muted">
                    <div className="flex items-start gap-2">
                      <Minus className="w-4 h-4 text-ink-faint shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{row.typical}</span>
                    </div>
                  </td>
                  <td className="p-4 bg-accent-soft/30 border-l border-r border-accent/10 font-medium text-ink">
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[2.5]" aria-hidden="true" />
                      </div>
                      <span className="text-ink font-semibold">{row.algostreamz}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Card View (<768px) */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {COMPARISON_ROWS.map((row, idx) => (
            <div key={idx} className="card p-5 space-y-3">
              <span className="text-micro font-bold uppercase tracking-wider text-accent">
                {row.feature}
              </span>
              <div className="space-y-2 border-t border-line pt-2 text-caption">
                <div className="p-2.5 bg-sunken/50 rounded-md space-y-1">
                  <span className="text-micro text-ink-faint uppercase font-semibold block">
                    Typical visualizers
                  </span>
                  <div className="flex items-center gap-2 text-ink-muted">
                    <Minus className="w-3.5 h-3.5 text-ink-faint shrink-0" />
                    <span>{row.typical}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-accent-soft/60 border border-accent/20 rounded-md space-y-1">
                  <span className="text-micro text-accent-strong uppercase font-bold block">
                    {SITE_NAME}
                  </span>
                  <div className="flex items-center gap-2 text-ink font-semibold">
                    <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 stroke-[2.5]" />
                    <span>{row.algostreamz}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Part B: Three Proof Cards Under Table */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="card p-6 space-y-3">
          <div className="w-10 h-10 rounded-md bg-accent-soft text-accent flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-h3 font-semibold text-ink">Deterministic by design</h3>
          <p className="text-caption text-ink-muted">
            Algorithm step generators are pure, unit-tested trace functions guaranteed to execute predictably without side-effects.
          </p>
        </div>

        <div className="card p-6 space-y-3">
          <div className="w-10 h-10 rounded-md bg-accent-soft text-accent flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="text-h3 font-semibold text-ink">Operation-level metrics</h3>
          <p className="text-caption text-ink-muted">
            Track exact comparisons, swaps, pointer moves, and array accesses that accurately match theoretical Big-O complexity bounds.
          </p>
        </div>

        <div className="card p-6 space-y-3">
          <div className="w-10 h-10 rounded-md bg-accent-soft text-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-h3 font-semibold text-ink">Accessible by design</h3>
          <p className="text-caption text-ink-muted">
            Full keyboard navigation, dual-signal state badges, 4.5:1 contrast ratios, and prefers-reduced-motion support baked into every component.
          </p>
        </div>
      </div>

      {/* CTA Row */}
      <div className="pt-2 text-center">
        <Link
          to={ROUTES.DEFAULT_VISUALIZER}
          className="btn-primary inline-flex items-center gap-2 text-body font-semibold focus-ring shadow-e1 group"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>See the difference live</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  )
}
