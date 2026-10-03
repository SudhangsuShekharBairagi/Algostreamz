import { RefreshCw, LogOut } from 'lucide-react'

/**
 * Zen Mode Caption Component.
 * Renders cross-fading beginner/technical step explanation without layout shifts.
 */
export default function ZenCaption({
  currentStep,
  isAtEnd = false,
  explanationLevel = 'beginner',
  stats,
  onReplay,
  onExitZen,
}) {
  const showTechnical = explanationLevel === 'technical'

  if (isAtEnd) {
    return (
      <div
        className="max-w-[60ch] mx-auto text-center min-h-[72px] flex flex-col items-center justify-center space-y-3 transition-opacity duration-[160ms]"
        aria-live="polite"
        aria-atomic="true"
      >
        <h2 className="font-display text-[26px] font-semibold text-state-sorted leading-tight">
          Sorted
        </h2>
        <p className="font-mono text-xs text-ink-muted tabular-nums">
          Comparisons: {stats?.comparisons ?? 0} &bull; Swaps: {stats?.swaps ?? 0} &bull; Accesses:{' '}
          {stats?.arrayAccesses ?? 0}
        </p>
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={onReplay}
            className="btn-primary min-h-[44px] px-5 text-xs flex items-center gap-2 focus-ring"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Replay</span>
          </button>
          <button
            type="button"
            onClick={onExitZen}
            className="btn-ghost min-h-[44px] px-4 text-xs flex items-center gap-2 border border-line focus-ring"
          >
            <LogOut className="w-3.5 h-3.5 text-ink-muted" />
            <span>Exit Zen</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="max-w-[60ch] mx-auto text-center min-h-[64px] flex flex-col items-center justify-center space-y-1 transition-opacity duration-[160ms]"
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="font-display text-[20px] md:text-[22px] leading-[1.4] text-ink">
        {currentStep?.explanation?.beginner || 'Ready to step through algorithm execution.'}
      </p>

      {showTechnical && currentStep?.explanation?.technical && (
        <p className="font-mono text-[13px] text-ink-muted pt-1">
          {currentStep.explanation.technical}
        </p>
      )}
    </div>
  )
}
