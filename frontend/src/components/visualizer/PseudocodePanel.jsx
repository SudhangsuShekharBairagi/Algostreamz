import { useEffect, useRef } from 'react'
import { Code, ChevronRight } from 'lucide-react'

/**
 * Editorial Pseudocode Panel Component.
 * Displays step-synchronized algorithm pseudocode with line gutter, active highlight, and auto-scroll.
 *
 * @param {Object} props
 * @param {Array<{line: number, indent: number, text: string}>} [props.pseudocode=[]] - Pseudocode lines array
 * @param {number} [props.activeLine=1] - 1-based line number of current execution step
 * @param {'card' | 'flat'} [props.variant='card'] - Container variant ('card' for standard, 'flat' for Zen)
 */
export default function PseudocodePanel({ pseudocode = [], activeLine = 1, variant = 'card' }) {
  const isFlat = variant === 'flat'
  const activeLineRef = useRef(null)

  // Auto-scroll active line into view smoothly
  useEffect(() => {
    if (activeLineRef.current) {
      try {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        activeLineRef.current.scrollIntoView({
          block: 'center',
          behavior: prefersReduced ? 'auto' : 'smooth',
        })
      } catch {
        // Fallback for non-standard environments
      }
    }
  }, [activeLine])

  const containerClasses = isFlat
    ? 'p-4 bg-transparent space-y-3'
    : 'card p-4 bg-surface border border-line rounded-lg shadow-e1 space-y-3'

  return (
    <div className={containerClasses}>
      {!isFlat && (
        <div className="flex items-center gap-2 border-b border-line pb-2.5">
          <Code className="w-4 h-4 text-accent" />
          <h3 className="font-semibold text-body text-ink">Pseudocode</h3>
        </div>
      )}

      <div className="font-mono text-[13px] leading-[1.7] bg-sunken/60 p-3 rounded-lg border border-line/50 max-h-[320px] overflow-y-auto overflow-x-auto select-text">
        {pseudocode.map((item) => {
          const { line, indent = 0, text } = item
          const isActive = line === activeLine
          const indentPadding = `${indent * 1.25}rem`

          return (
            <div
              key={`pseudocode-line-${line}`}
              ref={isActive ? activeLineRef : null}
              aria-current={isActive ? 'step' : undefined}
              className={`flex items-center py-0.5 px-2 rounded text-[13px] leading-[1.7] transition-colors duration-fast ${
                isActive
                  ? 'bg-accent-soft border-l-4 border-accent text-ink font-medium shadow-e1'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {/* Gutter: Line Number */}
              <span className="w-6 text-right text-ink-faint font-mono text-xs tabular-nums border-r border-line pr-3 mr-3 select-none shrink-0">
                {line}
              </span>

              {/* Active Indicator Icon */}
              <div className="w-4 flex items-center justify-center shrink-0">
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-accent animate-pulse" />}
              </div>

              {/* Code Line Text with Indent */}
              <span style={{ paddingLeft: indentPadding }} className="whitespace-pre flex-1">
                {text}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
