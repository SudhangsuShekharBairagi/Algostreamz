import { useMemo } from 'react'
import { ArrowLeftRight, Check } from 'lucide-react'

/**
 * Editorial Light Sorting Canvas Component.
 * Renders array values as bars with state indicators, value badges, and index labels.
 *
 * @param {Object} props
 * @param {number[]} [props.values=[]] - Current snapshot of array values
 * @param {Object} [props.highlightedIndices={}] - Map of index -> 'comparing' | 'swapping' | 'sorted' | 'pivot'
 * @param {'default' | 'zen'} [props.variant='default'] - Card layout or borderless Zen stage
 * @param {number} [props.maxVal] - Maximum value for scaling (computed automatically if omitted)
 */
export default function SortingCanvas({
  values = [],
  highlightedIndices = {},
  variant = 'default',
  maxVal: customMaxVal,
}) {
  const isZen = variant === 'zen'

  const computedMax = useMemo(() => {
    if (customMaxVal) return customMaxVal
    if (!values.length) return 100
    return Math.max(...values, 1)
  }, [values, customMaxVal])

  const containerClasses = isZen
    ? 'relative w-full min-h-[360px] p-6 flex items-end justify-center gap-2 md:gap-3 bg-transparent select-none'
    : 'card relative w-full min-h-[340px] p-6 flex items-end justify-center gap-2 md:gap-3 bg-surface/80 backdrop-blur-sm select-none'

  const ariaSummary = `Array visualization containing ${values.length} elements: ${values.join(', ')}`

  return (
    <div
      className={containerClasses}
      role="img"
      aria-label={ariaSummary}
    >
      {values.map((val, idx) => {
        const heightPercent = Math.max(6, Math.round((val / computedMax) * 100))
        const state = highlightedIndices[idx] || 'default'

        // Determine state styles and badges
        let barBgClass = 'bg-line-strong/70 text-ink border border-line/80'
        let showSwapIcon = false
        let showCheckIcon = false
        let showPivotBadge = false

        switch (state) {
          case 'comparing':
            barBgClass =
              'bg-state-compare text-[#451A03] ring-4 ring-state-compare/40 motion-safe:scale-[1.03] shadow-e2'
            break
          case 'swapping':
            barBgClass =
              'bg-state-swap text-white ring-4 ring-state-swap/30 motion-safe:scale-[1.05] shadow-e3'
            showSwapIcon = true
            break
          case 'sorted':
            barBgClass =
              'bg-state-sorted text-white ring-2 ring-state-sorted-ring shadow-e1'
            showCheckIcon = true
            break
          case 'pivot':
            barBgClass =
              'bg-state-pivot text-white ring-4 ring-state-pivot-ring/40 motion-safe:scale-[1.02] shadow-e2'
            showPivotBadge = true
            break
          default:
            barBgClass = 'bg-line-strong/70 text-ink border border-line/80'
        }

        return (
          <div
            key={`bar-${idx}-${val}`}
            className="flex flex-col items-center flex-1 max-w-[56px] min-w-[24px] transition-all duration-base ease-out-custom"
            style={{ height: '100%' }}
          >
            {/* Top Indicator / Value Badge */}
            <div className="mb-2 flex flex-col items-center justify-end min-h-[28px] gap-0.5">
              {showSwapIcon && (
                <ArrowLeftRight className="w-3.5 h-3.5 text-state-swap animate-bounce" />
              )}
              {showPivotBadge && (
                <span className="font-mono text-[9px] uppercase font-bold tracking-wider px-1 py-0.2 rounded bg-state-pivot/20 text-state-pivot">
                  pivot
                </span>
              )}
              <span className="font-mono text-xs font-semibold tabular-nums text-ink">
                {val}
              </span>
            </div>

            {/* Main Bar Element */}
            <div className="w-full flex-1 flex items-end justify-center">
              <div
                className={`w-full rounded-t-md transition-all duration-base ease-out-custom flex flex-col items-center justify-end pb-1 ${barBgClass}`}
                style={{ height: `${heightPercent}%` }}
              >
                {showCheckIcon && (
                  <Check className="w-3.5 h-3.5 text-white/90 mb-1" />
                )}
              </div>
            </div>

            {/* Bottom Index Label */}
            <div className="mt-2 text-center">
              <span className="font-mono text-[11px] text-ink-faint tabular-nums">
                [{idx}]
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
