import { useMemo } from 'react'
import { ArrowLeftRight, Check } from 'lucide-react'

/**
 * Editorial Light Sorting & Searching Canvas Component.
 * Matches design specification with value-proportional bar heights,
 * top number labels, vibrant indigo/amber state palette, and smooth transitions.
 */
export default function SortingCanvas({
  values = [],
  highlightedIndices = {},
  variant = 'default',
  maxVal: customMaxVal,
}) {
  const isZen = variant === 'zen'

  // Compute maximum value for proportional height calculations
  const maxVal = useMemo(() => {
    if (customMaxVal) return customMaxVal
    if (!values.length) return 100
    const peak = Math.max(...values)
    return Math.max(peak, 10)
  }, [values, customMaxVal])

  const containerClasses = isZen
    ? 'relative w-full h-[320px] p-6 flex items-end justify-center gap-3 sm:gap-4 md:gap-5 bg-transparent select-none'
    : 'card relative w-full h-[300px] min-w-0 p-2 sm:p-4 md:p-8 flex items-end justify-center gap-1 sm:gap-2 md:gap-5 bg-surface/90 border border-line rounded-2xl shadow-e1 select-none'

  const ariaSummary = `Array visualization containing ${values.length} elements: ${values.join(', ')}`

  return (
    <div className={containerClasses} role="img" aria-label={ariaSummary}>
      {values.map((val, idx) => {
        // Compute height percentage strictly proportional to element value
        const heightPercent = Math.max(16, Math.min(100, Math.round((val / maxVal) * 100)))
        const state = highlightedIndices[idx] || 'default'

        // Determine bar background, rings, and icons based on algorithm state
        let barBgClass = 'bg-accent text-on-accent shadow-sm'
        let showSwapIcon = false
        let showCheckIcon = false
        let showPivotBadge = false

        switch (state) {
          case 'comparing':
            barBgClass =
              'bg-state-compare text-state-compare-text ring-4 ring-state-compare-ring/30 motion-safe:scale-[1.03] shadow-e2 border border-state-compare-ring'
            break
          case 'swapping':
            barBgClass =
              'bg-state-swap text-state-swap-text ring-4 ring-state-swap-ring/30 motion-safe:scale-[1.05] shadow-e3 border border-state-swap-ring'
            showSwapIcon = true
            break
          case 'sorted':
          case 'match':
            barBgClass =
              'bg-state-sorted text-state-sorted-text ring-2 ring-state-sorted-ring/40 shadow-e1 border border-state-sorted-ring'
            showCheckIcon = true
            break
          case 'pivot':
            barBgClass =
              'bg-state-pivot text-state-pivot-text ring-4 ring-state-pivot-ring/30 motion-safe:scale-[1.02] shadow-e2 border border-state-pivot-ring'
            showPivotBadge = true
            break
          case 'eliminated':
            barBgClass = 'bg-sunken text-ink-faint opacity-25 scale-95 border border-line/40'
            break
          default:
            barBgClass = 'bg-accent text-on-accent shadow-sm hover:bg-accent-hover'
        }

        return (
          <div
            key={`bar-${idx}-${val}`}
            className="flex flex-col items-center flex-1 max-w-[60px] min-w-0 sm:min-w-[24px] h-full justify-end transition-all duration-base ease-out-custom"
          >
            {/* Top Value Label & Indicators */}
            <div className="mb-2 flex flex-col items-center justify-end min-h-[32px] gap-0.5">
              {showSwapIcon && (
                <ArrowLeftRight className="w-3.5 h-3.5 text-state-swap motion-reduce:animate-none" />
              )}
              {showPivotBadge && (
                <span className="font-mono text-[9px] uppercase font-bold tracking-wider px-1 rounded bg-state-pivot/20 text-state-pivot">
                  pivot
                </span>
              )}
              <span className="font-mono text-sm font-bold tabular-nums text-ink">
                {val}
              </span>
            </div>

            {/* Main Bar Element (Height is strictly proportional to element value) */}
            <div className="w-full flex-1 flex items-end justify-center">
              <div
                className={`w-full rounded-xl transition-all duration-base ease-out-custom flex flex-col items-center justify-end pb-2 ${barBgClass}`}
                style={{ height: `${heightPercent}%` }}
              >
                {showCheckIcon && (
                  <Check className="w-4 h-4 text-state-sorted-text shrink-0" />
                )}
              </div>
            </div>

            {/* Bottom Index Label */}
            <div className="mt-2 text-center">
              <span className="font-mono text-[11px] font-medium text-ink-faint tabular-nums">
                [{idx}]
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
