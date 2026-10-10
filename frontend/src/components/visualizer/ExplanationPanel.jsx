import { useMemo } from 'react'
import {
  Sparkles,
  ArrowLeftRight,
  Check,
  Target,
  Info,
  ArrowRight,
  MinusCircle,
  BarChart2,
} from 'lucide-react'
import { useZen } from '../../context/ZenContext'

/**
 * Editorial Explanation Panel Component.
 * Supports 'card' (full narrative & telemetry grid) and 'strip' (quiet Zen telemetry line).
 *
 * @param {Object} props
 * @param {Object} [props.currentStep] - Active step object from algorithm generator
 * @param {'card' | 'strip'} [props.variant='card'] - Presentation layout variant
 * @param {'beginner' | 'technical'} [props.explanationLevel] - Override level choice
 * @param {Function} [props.onExplanationLevelChange] - Handler for level toggle
 */
export default function ExplanationPanel({
  currentStep,
  variant = 'card',
  explanationLevel,
  onExplanationLevelChange,
}) {
  const zenContext = useZen()

  // Shared explanation level choice between Standard and Zen layouts
  const activeLevel =
    explanationLevel || zenContext?.prefs?.explanationLevel || 'beginner'

  const handleLevelToggle = (newLevel) => {
    if (onExplanationLevelChange) {
      onExplanationLevelChange(newLevel)
    }
    if (zenContext?.setPref) {
      zenContext.setPref('explanationLevel', newLevel)
    }
  }

  const { type = '', explanation = {}, stats = {}, indices = [], values = [] } =
    currentStep || {}

  const comparisons = stats.comparisons ?? 0
  const swaps = stats.swaps ?? 0
  const accesses = stats.arrayAccesses ?? 0
  const totalOps = (currentStep?.stepIndex ?? 0) + 1

  // Operational Badge Configuration
  const badgeConfig = useMemo(() => {
    switch (type) {
      case 'compare':
        return {
          label: 'COMPARING',
          style: 'bg-state-compare/15 text-[#451A03] ring-1 ring-state-compare/40',
          Icon: Sparkles,
        }
      case 'swap':
        return {
          label: 'SWAPPING',
          style: 'bg-state-swap/15 text-state-swap ring-1 ring-state-swap/40',
          Icon: ArrowLeftRight,
        }
      case 'select':
      case 'pivot':
        return {
          label: 'PIVOT SELECTION',
          style: 'bg-state-pivot/15 text-state-pivot ring-1 ring-state-pivot/40',
          Icon: Target,
        }
      case 'sorted':
      case 'mark-sorted':
        return {
          label: 'SORTED',
          style: 'bg-state-sorted/15 text-state-sorted ring-1 ring-state-sorted/40',
          Icon: Check,
        }
      case 'eliminate-left':
      case 'eliminate-right':
        return {
          label: 'RANGE ELIMINATION',
          style: 'bg-amber-500/15 text-amber-800 ring-1 ring-amber-500/40',
          Icon: MinusCircle,
        }
      case 'pointer-move':
        return {
          label: 'POINTER MOVE',
          style: 'bg-accent-soft text-accent-strong ring-1 ring-accent/20',
          Icon: ArrowRight,
        }
      default:
        return {
          label: (type || 'OPERATION').toUpperCase(),
          style: 'bg-accent-soft text-accent-strong ring-1 ring-accent/20',
          Icon: Info,
        }
    }
  }, [type])

  // Quiet strip variant for Zen mode
  if (variant === 'strip') {
    return (
      <div className="font-mono text-xs text-ink-faint tabular-nums text-center py-1 select-none">
        Comparisons <span className="font-semibold text-ink">{comparisons}</span> &bull; Swaps{' '}
        <span className="font-semibold text-ink">{swaps}</span> &bull; Operations{' '}
        <span className="font-semibold text-ink">{totalOps}</span> &bull; Accesses{' '}
        <span className="font-semibold text-ink">{accesses}</span>
      </div>
    )
  }

  const { label: badgeLabel, style: badgeStyle, Icon: BadgeIcon } = badgeConfig

  return (
    <div className="card p-5 bg-surface border border-line rounded-lg shadow-e1 space-y-5">
      {/* 1. Operational Header */}
      <div className="flex items-center justify-between border-b border-line pb-3.5">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-accent" />
          <h3 className="font-display font-semibold text-body text-ink">
            Step Explanation
          </h3>
        </div>

        {/* Operational Pill Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[11px] font-bold tracking-wider ${badgeStyle}`}
        >
          <BadgeIcon className="w-3.5 h-3.5" />
          <span>{badgeLabel}</span>
        </span>
      </div>

      {/* 2. 'Why It Happened' Card */}
      <div className="space-y-3.5">
        {/* Headline & Level Toggle */}
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-micro uppercase tracking-wider font-semibold text-ink-faint">
            Evaluation Breakdown
          </span>

          {/* Segmented Level Toggle */}
          <div className="segmented" role="radiogroup" aria-label="Explanation level">
            <button
              type="button"
              role="radio"
              aria-checked={activeLevel === 'beginner'}
              onClick={() => handleLevelToggle('beginner')}
              className={`segmented-option text-xs font-medium focus-ring ${
                activeLevel === 'beginner' ? 'selected' : ''
              }`}
            >
              Beginner
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={activeLevel === 'technical'}
              onClick={() => handleLevelToggle('technical')}
              className={`segmented-option text-xs font-medium focus-ring ${
                activeLevel === 'technical' ? 'selected' : ''
              }`}
            >
              Technical
            </button>
          </div>
        </div>

        {/* Narrative Headline & Content */}
        <div className="p-3.5 rounded-lg bg-sunken/60 border border-line/60 space-y-1.5 min-h-[76px] flex flex-col justify-center">
          <p className="font-display text-body font-semibold text-ink leading-relaxed">
            {activeLevel === 'technical'
              ? explanation?.technical || explanation?.beginner || 'Step evaluation completed.'
              : explanation?.beginner || 'Analyzing algorithm step execution.'}
          </p>

          {activeLevel === 'beginner' && explanation?.technical && (
            <p className="font-mono text-xs text-ink-muted leading-normal pt-1 border-t border-line/40">
              {explanation.technical}
            </p>
          )}
        </div>

        {/* Comparative Element Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 min-h-[32px]">
          {indices.length > 0 && values.length > 0 ? (
            <>
              <span className="text-micro font-mono text-ink-faint">Inspected:</span>
              {indices.map((idx) => {
                const val = values[idx]
                if (val === undefined) return null
                return (
                  <span
                    key={`chip-${idx}-${val}`}
                    className="chip font-mono text-xs bg-surface border-line text-ink font-semibold shadow-e1"
                  >
                    [Index {idx}: Value {val}]
                  </span>
                )
              })}
            </>
          ) : (
            <span className="text-micro font-mono text-ink-faint opacity-50">&mdash;</span>
          )}
        </div>
      </div>

      {/* 3. Real-Time Telemetry Bar */}
      <div className="pt-2 border-t border-line space-y-2">
        <span className="font-mono text-micro uppercase tracking-wider font-semibold text-ink-faint">
          Real-Time Telemetry
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Metric 1: Comparisons */}
          <div className="card p-3 bg-surface border border-line/80 rounded-lg flex flex-col justify-between shadow-e1">
            <span className="font-mono text-[10px] text-ink-faint uppercase font-semibold">
              Comparisons
            </span>
            <span className="font-mono text-lg font-bold text-ink tabular-nums transition-all duration-base">
              {comparisons}
            </span>
          </div>

          {/* Metric 2: Swaps */}
          <div className="card p-3 bg-surface border border-line/80 rounded-lg flex flex-col justify-between shadow-e1">
            <span className="font-mono text-[10px] text-ink-faint uppercase font-semibold">
              Swaps
            </span>
            <span className="font-mono text-lg font-bold text-ink tabular-nums transition-all duration-base">
              {swaps}
            </span>
          </div>

          {/* Metric 3: Total Operations */}
          <div className="card p-3 bg-surface border border-line/80 rounded-lg flex flex-col justify-between shadow-e1">
            <span className="font-mono text-[10px] text-ink-faint uppercase font-semibold">
              Total Ops
            </span>
            <span className="font-mono text-lg font-bold text-accent tabular-nums transition-all duration-base">
              {totalOps}
            </span>
          </div>

          {/* Metric 4: Array Accesses */}
          <div className="card p-3 bg-surface border border-line/80 rounded-lg flex flex-col justify-between shadow-e1">
            <span className="font-mono text-[10px] text-ink-faint uppercase font-semibold">
              Accesses
            </span>
            <span className="font-mono text-lg font-bold text-ink tabular-nums transition-all duration-base">
              {accesses}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
