import { useState } from 'react'

/**
 * Zen Mode Caption Component.
 * Renders cross-fading beginner/technical step explanation without layout shifts.
 */
export default function ZenCaption({
  currentStep,
  isAtEnd = false,
  explanationLevel = 'beginner',
  stats,
}) {
  const showTechnical = explanationLevel === 'technical'

  if (isAtEnd) {
    return (
      <div
        className="max-w-[60ch] mx-auto text-center min-h-[56px] flex flex-col items-center justify-center space-y-1 transition-opacity duration-[160ms]"
        aria-live="polite"
        aria-atomic="true"
      >
        <h2 className="font-display text-[20px] md:text-[22px] font-semibold text-state-sorted leading-tight">
          {currentStep?.explanation?.beginner || 'Completed'}
        </h2>
        {stats && (stats.comparisons > 0 || stats.swaps > 0 || stats.arrayAccesses > 0) && (
          <p className="font-mono text-xs text-ink-muted tabular-nums pt-0.5">
            Comparisons: {stats?.comparisons ?? 0} &bull; Swaps: {stats?.swaps ?? 0} &bull; Accesses:{' '}
            {stats?.arrayAccesses ?? 0}
          </p>
        )}
      </div>
    )
  }

  return (
    <div
      className="max-w-[60ch] mx-auto text-center min-h-[56px] flex flex-col items-center justify-center space-y-1 transition-opacity duration-[160ms]"
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
