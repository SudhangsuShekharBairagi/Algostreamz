import { useState, useEffect } from 'react'
import { Play, Pause, Maximize2, Sparkles, Code2 } from 'lucide-react'

// 12 pre-computed step snapshots for 8 bars Bubble Sort simulation
const HERO_STEPS = [
  {
    array: [45, 18, 85, 32, 60, 24, 75, 50],
    comparing: [0, 1],
    swapping: [],
    sorted: [],
    caption: 'Comparing 45 and 18...',
    codeLine: 2,
  },
  {
    array: [18, 45, 85, 32, 60, 24, 75, 50],
    comparing: [],
    swapping: [0, 1],
    sorted: [],
    caption: '45 > 18. Swapping adjacent elements.',
    codeLine: 3,
  },
  {
    array: [18, 45, 85, 32, 60, 24, 75, 50],
    comparing: [1, 2],
    swapping: [],
    sorted: [],
    caption: 'Comparing 45 and 85 (in correct order)...',
    codeLine: 2,
  },
  {
    array: [18, 45, 85, 32, 60, 24, 75, 50],
    comparing: [2, 3],
    swapping: [],
    sorted: [],
    caption: 'Comparing 85 and 32...',
    codeLine: 2,
  },
  {
    array: [18, 45, 32, 85, 60, 24, 75, 50],
    comparing: [],
    swapping: [2, 3],
    sorted: [],
    caption: '85 > 32. Swapping elements.',
    codeLine: 3,
  },
  {
    array: [18, 45, 32, 60, 85, 24, 75, 50],
    comparing: [],
    swapping: [3, 4],
    sorted: [],
    caption: '85 > 60. Swapping elements.',
    codeLine: 3,
  },
  {
    array: [18, 45, 32, 60, 24, 85, 75, 50],
    comparing: [],
    swapping: [4, 5],
    sorted: [],
    caption: '85 > 24. Swapping elements.',
    codeLine: 3,
  },
  {
    array: [18, 45, 32, 60, 24, 75, 85, 50],
    comparing: [],
    swapping: [5, 6],
    sorted: [],
    caption: '85 > 75. Swapping elements.',
    codeLine: 3,
  },
  {
    array: [18, 45, 32, 60, 24, 75, 50, 85],
    comparing: [],
    swapping: [6, 7],
    sorted: [],
    caption: '85 > 50. Swapping elements to right.',
    codeLine: 3,
  },
  {
    array: [18, 45, 32, 60, 24, 75, 50, 85],
    comparing: [],
    swapping: [],
    sorted: [7],
    caption: 'Element 85 locked into final sorted position!',
    codeLine: 1,
  },
  {
    array: [18, 32, 45, 60, 24, 75, 50, 85],
    comparing: [1, 2],
    swapping: [],
    sorted: [7],
    caption: 'Next pass: Comparing 32 and 45...',
    codeLine: 2,
  },
  {
    array: [18, 32, 45, 24, 60, 75, 50, 85],
    comparing: [],
    swapping: [3, 4],
    sorted: [7],
    caption: 'Swapping 60 and 24 to continue pass.',
    codeLine: 3,
  },
]

const PSEUDOCODE_LINES = [
  { line: 1, code: 'for i = 0 to n-1:' },
  { line: 2, code: '  for j = 0 to n-i-1:' },
  { line: 3, code: '    if A[j] > A[j+1]: swap()' },
]

export default function HeroDemo() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isHoveredOrFocused, setIsHoveredOrFocused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Auto-play loop logic with 1.5s rest before restart
  useEffect(() => {
    if (!isPlaying || isHoveredOrFocused || prefersReducedMotion) {
      return undefined
    }

    const isLastStep = currentStepIndex === HERO_STEPS.length - 1
    const delay = isLastStep ? 1500 : 700

    const timer = setTimeout(() => {
      setCurrentStepIndex((prev) => (prev + 1) % HERO_STEPS.length)
    }, delay)

    return () => clearTimeout(timer)
  }, [currentStepIndex, isPlaying, isHoveredOrFocused, prefersReducedMotion])

  const step = HERO_STEPS[currentStepIndex] || HERO_STEPS[0]

  return (
    <div
      onMouseEnter={() => setIsHoveredOrFocused(true)}
      onMouseLeave={() => setIsHoveredOrFocused(false)}
      onFocus={() => setIsHoveredOrFocused(true)}
      onBlur={() => setIsHoveredOrFocused(false)}
      className="relative w-full max-w-[540px] mx-auto min-h-[420px] flex flex-col justify-between card p-5 sm:p-6 bg-surface border border-line shadow-e2 select-none"
    >
      {/* Decorative Floating Chips (aria-hidden) */}
      <div
        aria-hidden="true"
        className="absolute -top-3 -right-3 z-10 chip bg-surface border-line-strong shadow-e2 text-caption text-ink font-semibold flex items-center gap-1.5 pointer-events-none"
      >
        <Maximize2 className="w-3.5 h-3.5 text-accent" />
        Zen Mode
      </div>

      <div
        aria-hidden="true"
        className="absolute -bottom-3 -left-3 z-10 chip bg-surface border-line-strong shadow-e2 font-mono text-micro text-ink font-bold tabular-nums pointer-events-none"
      >
        Step {currentStepIndex + 1} / {HERO_STEPS.length}
      </div>

      {/* Demo Header / Play-Pause Trigger */}
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
          <span className="text-caption font-semibold font-mono text-ink">
            Bubble Sort Interactive Trace
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsPlaying((prev) => !prev)}
          title={isPlaying ? 'Pause animation' : 'Play animation'}
          aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
          className="btn-ghost p-1.5 focus-ring text-ink-muted hover:text-ink"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-accent text-accent" />}
        </button>
      </div>

      {/* Mini 8-Bar Sorting Canvas Stage */}
      <div className="h-40 my-3 bg-sunken/40 rounded-lg border border-line p-3 flex items-end justify-center gap-2 sm:gap-3">
        {step.array.map((val, idx) => {
          const isComparing = step.comparing.includes(idx)
          const isSwapping = step.swapping.includes(idx)
          const isSorted = step.sorted.includes(idx)

          let barBg = 'bg-accent/80'
          let ringClass = ''

          if (isComparing) {
            barBg = 'bg-state-compare'
            ringClass = 'ring-2 ring-state-compare-ring'
          } else if (isSwapping) {
            barBg = 'bg-state-swap'
            ringClass = 'ring-2 ring-state-swap-ring'
          } else if (isSorted) {
            barBg = 'bg-state-sorted'
            ringClass = 'ring-2 ring-state-sorted-ring'
          }

          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <span className="font-mono text-micro font-bold text-ink tabular-nums">
                {val}
              </span>
              <div
                className={`w-full max-w-[32px] ${barBg} ${ringClass} rounded-t transition-all duration-200 shadow-e1`}
                style={{ height: `${(val / 85) * 100}%` }}
              />
            </div>
          )
        })}
      </div>

      {/* One-line Plain-English Caption */}
      <div className="bg-accent-soft/60 border border-accent/20 px-3 py-2 rounded-md flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-accent shrink-0" />
        <p className="text-caption font-medium text-accent-strong truncate">
          {step.caption}
        </p>
      </div>

      {/* Pseudocode Strip Highlighting Active Line */}
      <div className="bg-sunken rounded-md border border-line p-2.5 font-mono text-[11px] space-y-1">
        <div className="flex items-center gap-1.5 text-ink-faint border-b border-line/60 pb-1 mb-1 font-sans text-micro uppercase font-bold">
          <Code2 className="w-3.5 h-3.5 text-accent" />
          Active Pseudocode Line
        </div>
        {PSEUDOCODE_LINES.map((item) => {
          const isActive = step.codeLine === item.line
          return (
            <div
              key={item.line}
              className={`px-2 py-0.5 rounded transition-colors ${
                isActive
                  ? 'bg-accent text-white font-semibold shadow-e1'
                  : 'text-ink-muted'
              }`}
            >
              <span>{item.code}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
