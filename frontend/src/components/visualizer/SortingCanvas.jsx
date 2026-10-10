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
    : 'card relative w-full h-[300px] p-6 md:p-8 flex items-end justify-center gap-3 sm:gap-4 md:gap-5 bg-surface/90 border border-line rounded-2xl shadow-e1 select-none'

  const ariaSummary = `Array visualization containing ${values.length} elements: ${values.join(', ')}`

  return (
    <div className={containerClasses} role="img" aria-label={ariaSummary}>
      {values.map((val, idx) => {
        // Compute height percentage strictly proportional to element value
        const heightPercent = Math.max(16, Math.min(100, Math.round((val / maxVal) * 100)))
        const state = highlightedIndices[idx] || 'default'

        // Determine bar background, rings, and icons based on algorithm state
        let barBgClass = 'bg-[#6366F1] text-white shadow-sm'
        let showSwapIcon = false
        let showCheckIcon = false
        let showPivotBadge = false

        switch (state) {
          case 'comparing':
            barBgClass =
              'bg-[#F59E0B] text-white ring-4 ring-[#F59E0B]/30 motion-safe:scale-[1.03] shadow-e2 border border-amber-300'
            break
          case 'swapping':
            barBgClass =
              'bg-[#EF4444] text-white ring-4 ring-rose-500/30 motion-safe:scale-[1.05] shadow-e3 border border-rose-400'
            showSwapIcon = true
            break
          case 'sorted':
          case 'match':
            barBgClass =
              'bg-[#10B981] text-white ring-2 ring-emerald-400/40 shadow-e1 border border-emerald-400'
            showCheckIcon = true
            break
          case 'pivot':
            barBgClass =
              'bg-[#8B5CF6] text-white ring-4 ring-purple-500/30 motion-safe:scale-[1.02] shadow-e2 border border-purple-300'
            showPivotBadge = true
            break
          case 'eliminated':
            barBgClass = 'bg-sunken text-ink-faint opacity-25 scale-95 border border-line/40'
            break
          default:
            barBgClass = 'bg-[#6366F1] text-white shadow-sm hover:bg-[#4F46E5]'
        }

        return (
          <div
            key={`bar-${idx}-${val}`}
            className="flex flex-col items-center flex-1 max-w-[60px] min-w-[24px] h-full justify-end transition-all duration-base ease-out-custom"
          >
            {/* Top Value Label & Indicators */}
            <div className="mb-2 flex flex-col items-center justify-end min-h-[32px] gap-0.5">
              {showSwapIcon && (
                <ArrowLeftRight className="w-3.5 h-3.5 text-[#EF4444] animate-bounce" />
              )}
              {showPivotBadge && (
                <span className="font-mono text-[9px] uppercase font-bold tracking-wider px-1 rounded bg-[#8B5CF6]/20 text-[#8B5CF6]">
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
                  <Check className="w-4 h-4 text-white/90 shrink-0" />
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
