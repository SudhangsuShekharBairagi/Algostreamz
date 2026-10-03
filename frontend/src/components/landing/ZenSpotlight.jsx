import { Link } from 'react-router-dom'
import { Maximize2, Check, Sparkles, Play, SkipForward, RotateCcw } from 'lucide-react'
import { ROUTES } from '../../config/siteLinks'

export default function ZenSpotlight() {
  return (
    <div className="card p-8 bg-zen-canvas border border-line shadow-e1 lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center space-y-8 lg:space-y-0 my-8">
      {/* Left Column: Copy & Actions */}
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 chip border-accent/20 bg-accent-soft text-accent font-semibold text-micro uppercase tracking-wider">
          <Maximize2 className="w-3.5 h-3.5" />
          ZEN MODE
        </div>

        <h2 className="text-h1 font-display font-semibold text-ink">
          Just you and the algorithm.
        </h2>

        {/* Three Short Points */}
        <ul className="space-y-3 text-caption text-ink-muted">
          <li className="flex items-start gap-2.5">
            <div className="w-4 h-4 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3 stroke-[2.5]" />
            </div>
            <span>No clutter or distracting navigation menus.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="w-4 h-4 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3 stroke-[2.5]" />
            </div>
            <span>One plain-English explanation sentence at a time.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="w-4 h-4 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3 stroke-[2.5]" />
            </div>
            <span>Controls fade away automatically when you stop moving.</span>
          </li>
        </ul>

        {/* Action Button & Keyboard Hint */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link
            to={`${ROUTES.DEFAULT_VISUALIZER}?zen=1`}
            className="btn-primary flex items-center gap-2 text-caption font-semibold focus-ring shadow-e1 group"
          >
            <Maximize2 className="w-4 h-4 text-white" />
            <span>Try Zen mode</span>
          </Link>

          <span className="text-caption text-ink-muted flex items-center gap-1.5">
            Press <kbd className="kbd">Z</kbd> any time
          </span>
        </div>
      </div>

      {/* Right Column: Static Miniature Zen Layout (aria-hidden with SR description) */}
      <div className="relative">
        <div className="sr-only">
          Demonstration preview of Zen Mode layout with borderless algorithm bars, a Fraunces caption line, and a floating dock control pill.
        </div>

        <div
          aria-hidden="true"
          className="card p-6 bg-zen-canvas border border-line-strong shadow-e2 space-y-6 select-none relative overflow-hidden"
        >
          {/* Top Stage: Borderless Array Bars */}
          <div className="h-32 bg-surface/50 rounded-lg p-3 border border-line flex items-end justify-center gap-2">
            <div className="w-6 h-12 bg-accent/70 rounded-t" />
            <div className="w-6 h-20 bg-state-compare ring-2 ring-state-compare-ring rounded-t" />
            <div className="w-6 h-28 bg-state-compare ring-2 ring-state-compare-ring rounded-t" />
            <div className="w-6 h-16 bg-accent/70 rounded-t" />
            <div className="w-6 h-24 bg-state-sorted ring-2 ring-state-sorted-ring rounded-t" />
          </div>

          {/* Fraunces Caption Line */}
          <div className="text-center font-display text-caption font-medium text-ink italic">
            &quot;Comparing 45 and 85 at indices 1 and 2...&quot;
          </div>

          {/* Floating Dock Pill Miniature */}
          <div className="w-max mx-auto px-4 py-1.5 bg-surface border border-line rounded-full shadow-e2 flex items-center gap-3 text-caption text-ink-muted font-mono text-xs">
            <RotateCcw className="w-3.5 h-3.5" />
            <Play className="w-3.5 h-3.5 fill-accent text-accent" />
            <SkipForward className="w-3.5 h-3.5" />
            <span className="border-l border-line pl-2 text-ink font-semibold">1.0x</span>
          </div>
        </div>
      </div>
    </div>
  )
}
