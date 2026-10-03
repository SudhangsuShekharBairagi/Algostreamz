import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Cpu, Play, CheckCircle2, HelpCircle } from 'lucide-react'
import { ROUTES } from '../../config/siteLinks'

const STEPS = [
  {
    number: '01',
    title: 'Pick an algorithm',
    desc: 'Each one ships with pseudocode and complexity.',
    highlightStage: 'input',
  },
  {
    number: '02',
    title: 'We generate every step',
    desc: 'A pure step generator turns your input into a list of states, with no animation code involved.',
    highlightStage: 'generator',
  },
  {
    number: '03',
    title: 'Play it your way',
    desc: 'Play, pause, step back, scrub or change speed. Bars, pseudocode and explanation always stay in sync.',
    highlightStage: 'timeline',
  },
  {
    number: '04',
    title: 'Test yourself',
    desc: 'Predict the next move, race another algorithm, then try a challenge.',
    highlightStage: 'outputs',
  },
]

export default function HowItWorksSection() {
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [userInteracted, setUserInteracted] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const tabRefs = useRef([])

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Auto-advance every 5 seconds until user interacts or reduced motion is active
  useEffect(() => {
    if (userInteracted || prefersReducedMotion) return undefined

    const timer = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % STEPS.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [userInteracted, prefersReducedMotion])

  const handleStepClick = (index) => {
    setUserInteracted(true)
    setActiveStepIndex(index)
  }

  // Roving tabindex keyboard navigation (ArrowLeft / ArrowRight)
  const handleKeyDown = (e, index) => {
    let nextIndex = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      nextIndex = (index + 1) % STEPS.length
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      nextIndex = (index - 1 + STEPS.length) % STEPS.length
    } else if (e.key === 'Home') {
      e.preventDefault()
      nextIndex = 0
    } else if (e.key === 'End') {
      e.preventDefault()
      nextIndex = STEPS.length - 1
    }

    if (nextIndex !== null) {
      setUserInteracted(true)
      setActiveStepIndex(nextIndex)
      tabRefs.current[nextIndex]?.focus()
    }
  }

  const activeStep = STEPS[activeStepIndex]

  return (
    <section
      id="how"
      aria-labelledby="how-heading"
      className="space-y-12 scroll-mt-24 font-sans"
    >
      {/* Header */}
      <div className="space-y-3 max-w-[72ch]">
        <div className="inline-flex items-center gap-2 chip border-accent/20 bg-accent-soft text-accent font-semibold text-micro uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          HOW IT WORKS
        </div>
        <h2 id="how-heading" className="text-h1 font-display font-semibold text-ink">
          How the visualization works
        </h2>
        <p className="text-body text-ink-muted text-pretty">
          Algostreamz decouples algorithm state generation from UI rendering. Watch how inputs transform into deterministic step timelines.
        </p>
      </div>

      {/* Stepper (Horizontal row on desktop, vertical on mobile, joined by dashed line) */}
      <div className="space-y-4">
        <div
          role="tablist"
          aria-label="How visualization works steps"
          className="grid grid-cols-1 md:grid-cols-4 gap-4 relative"
        >
          {/* Dashed connector line background (Desktop) */}
          <div className="hidden md:block absolute top-7 left-12 right-12 h-0.5 border-t-2 border-dashed border-line -z-0 pointer-events-none" />

          {STEPS.map((step, idx) => {
            const isActive = activeStepIndex === idx
            return (
              <button
                key={step.number}
                ref={(el) => (tabRefs.current[idx] = el)}
                role="tab"
                id={`step-tab-${idx}`}
                aria-selected={isActive}
                aria-controls={`step-panel-${idx}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => handleStepClick(idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`card p-5 text-left relative z-10 transition-all duration-200 focus-ring cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'border-accent bg-accent-soft/40 shadow-e2 ring-2 ring-accent/20'
                    : 'hover:border-line-strong hover:bg-sunken/30 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-xl font-bold tabular-nums w-8 h-8 rounded-full flex items-center justify-center ${
                        isActive
                          ? 'bg-accent text-white shadow-e1'
                          : 'bg-sunken text-ink-muted border border-line'
                      }`}
                    >
                      {step.number}
                    </span>
                    {isActive && (
                      <span className="chip bg-accent-soft text-accent-strong border-accent/20 text-micro uppercase font-semibold">
                        Active
                      </span>
                    )}
                  </div>
                  <h3 className={`text-h3 font-semibold ${isActive ? 'text-ink' : 'text-ink-muted'}`}>
                    {step.title}
                  </h3>
                  <p className="text-caption text-ink-muted leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Pipeline Diagram (Inline SVG, Tokens Only) */}
      <div className="card p-6 md:p-8 bg-surface border border-line space-y-4 shadow-e1">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <span className="text-caption font-bold text-ink flex items-center gap-2 font-mono">
            <Cpu className="w-4 h-4 text-accent" />
            Pure Step Generation Pipeline
          </span>
          <span className="text-micro font-mono text-ink-faint uppercase">
            Stage: {activeStep.highlightStage}
          </span>
        </div>

        {/* Inline SVG Pipeline Diagram */}
        <div className="w-full overflow-x-auto py-2">
          <svg
            viewBox="0 0 800 180"
            className="w-full min-w-[640px] h-auto font-mono text-xs select-none"
            aria-label="Algorithm execution pipeline diagram"
          >
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="rgb(var(--line-strong))" />
              </marker>
              <marker id="arrow-active" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="rgb(var(--accent))" />
              </marker>
            </defs>

            {/* Stage 1: Input Array */}
            <g className={`transition-all duration-300 ${activeStep.highlightStage === 'input' ? 'opacity-100 scale-105' : 'opacity-60'}`}>
              <rect
                x="20"
                y="55"
                width="130"
                height="70"
                rx="8"
                fill={activeStep.highlightStage === 'input' ? 'rgb(var(--accent-soft))' : 'rgb(var(--sunken))'}
                stroke={activeStep.highlightStage === 'input' ? 'rgb(var(--accent))' : 'rgb(var(--line))'}
                strokeWidth={activeStep.highlightStage === 'input' ? '2.5' : '1.5'}
              />
              <text x="85" y="85" textAnchor="middle" fill="rgb(var(--ink))" fontWeight="bold">Input Data</text>
              <text x="85" y="105" textAnchor="middle" fill="rgb(var(--ink-muted))" fontSize="10">[45, 18, 85, 32]</text>
            </g>

            {/* Arrow 1 -> 2 */}
            <path
              d="M 150 90 L 210 90"
              stroke={activeStep.highlightStage === 'input' || activeStep.highlightStage === 'generator' ? 'rgb(var(--accent))' : 'rgb(var(--line-strong))'}
              strokeWidth="2"
              markerEnd={activeStep.highlightStage === 'input' || activeStep.highlightStage === 'generator' ? 'url(#arrow-active)' : 'url(#arrow)'}
            />

            {/* Stage 2: Step Generator */}
            <g className={`transition-all duration-300 ${activeStep.highlightStage === 'generator' ? 'opacity-100' : 'opacity-60'}`}>
              <rect
                x="210"
                y="55"
                width="150"
                height="70"
                rx="8"
                fill={activeStep.highlightStage === 'generator' ? 'rgb(var(--accent-soft))' : 'rgb(var(--sunken))'}
                stroke={activeStep.highlightStage === 'generator' ? 'rgb(var(--accent))' : 'rgb(var(--line))'}
                strokeWidth={activeStep.highlightStage === 'generator' ? '2.5' : '1.5'}
              />
              <text x="285" y="85" textAnchor="middle" fill="rgb(var(--ink))" fontWeight="bold">Step Generator</text>
              <text x="285" y="105" textAnchor="middle" fill="rgb(var(--accent-strong))" fontSize="10">Pure Trace Function</text>
            </g>

            {/* Arrow 2 -> 3 */}
            <path
              d="M 360 90 L 420 90"
              stroke={activeStep.highlightStage === 'generator' || activeStep.highlightStage === 'timeline' ? 'rgb(var(--accent))' : 'rgb(var(--line-strong))'}
              strokeWidth="2"
              markerEnd={activeStep.highlightStage === 'generator' || activeStep.highlightStage === 'timeline' ? 'url(#arrow-active)' : 'url(#arrow)'}
            />

            {/* Stage 3: Steps Timeline */}
            <g className={`transition-all duration-300 ${activeStep.highlightStage === 'timeline' ? 'opacity-100' : 'opacity-60'}`}>
              <rect
                x="420"
                y="55"
                width="150"
                height="70"
                rx="8"
                fill={activeStep.highlightStage === 'timeline' ? 'rgb(var(--accent-soft))' : 'rgb(var(--sunken))'}
                stroke={activeStep.highlightStage === 'timeline' ? 'rgb(var(--accent))' : 'rgb(var(--line))'}
                strokeWidth={activeStep.highlightStage === 'timeline' ? '2.5' : '1.5'}
              />
              <text x="495" y="85" textAnchor="middle" fill="rgb(var(--ink))" fontWeight="bold">Steps Timeline</text>
              <text x="495" y="105" textAnchor="middle" fill="rgb(var(--ink-muted))" fontSize="10">[State 0, State 1, ...]</text>
            </g>

            {/* Arrow 3 -> 4 Outputs */}
            <path
              d="M 570 90 L 630 90"
              stroke={activeStep.highlightStage === 'timeline' || activeStep.highlightStage === 'outputs' ? 'rgb(var(--accent))' : 'rgb(var(--line-strong))'}
              strokeWidth="2"
              markerEnd={activeStep.highlightStage === 'timeline' || activeStep.highlightStage === 'outputs' ? 'url(#arrow-active)' : 'url(#arrow)'}
            />

            {/* Stage 4: Four Synchronized UI Outputs */}
            <g className={`transition-all duration-300 ${activeStep.highlightStage === 'outputs' ? 'opacity-100' : 'opacity-60'}`}>
              {/* Output 1: Canvas */}
              <rect
                x="630"
                y="15"
                width="150"
                height="32"
                rx="6"
                fill={activeStep.highlightStage === 'outputs' ? 'rgb(var(--accent-soft))' : 'rgb(var(--surface))'}
                stroke={activeStep.highlightStage === 'outputs' ? 'rgb(var(--accent))' : 'rgb(var(--line))'}
                strokeWidth="1.5"
              />
              <text x="705" y="36" textAnchor="middle" fill="rgb(var(--ink))" fontWeight="bold">1. Sorting Canvas</text>

              {/* Output 2: Pseudocode */}
              <rect
                x="630"
                y="55"
                width="150"
                height="32"
                rx="6"
                fill={activeStep.highlightStage === 'outputs' ? 'rgb(var(--accent-soft))' : 'rgb(var(--surface))'}
                stroke={activeStep.highlightStage === 'outputs' ? 'rgb(var(--accent))' : 'rgb(var(--line))'}
                strokeWidth="1.5"
              />
              <text x="705" y="76" textAnchor="middle" fill="rgb(var(--ink))" fontWeight="bold">2. Pseudocode</text>

              {/* Output 3: Explanation */}
              <rect
                x="630"
                y="95"
                width="150"
                height="32"
                rx="6"
                fill={activeStep.highlightStage === 'outputs' ? 'rgb(var(--accent-soft))' : 'rgb(var(--surface))'}
                stroke={activeStep.highlightStage === 'outputs' ? 'rgb(var(--accent))' : 'rgb(var(--line))'}
                strokeWidth="1.5"
              />
              <text x="705" y="116" textAnchor="middle" fill="rgb(var(--ink))" fontWeight="bold">3. Explanation</text>

              {/* Output 4: Stats */}
              <rect
                x="630"
                y="135"
                width="150"
                height="32"
                rx="6"
                fill={activeStep.highlightStage === 'outputs' ? 'rgb(var(--accent-soft))' : 'rgb(var(--surface))'}
                stroke={activeStep.highlightStage === 'outputs' ? 'rgb(var(--accent))' : 'rgb(var(--line))'}
                strokeWidth="1.5"
              />
              <text x="705" y="156" textAnchor="middle" fill="rgb(var(--ink))" fontWeight="bold">4. Operation Stats</text>
            </g>
          </svg>
        </div>
      </div>

      {/* Short Note Card */}
      <div className="card p-5 bg-accent-soft/50 border border-accent/20 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div className="space-y-1 text-caption">
          <span className="font-semibold text-accent-strong block">Why this design?</span>
          <p className="text-ink-muted">
            The algorithm logic never touches screen rendering code, so every step can be replayed, rewound, bookmarked, and tested deterministically.
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <div className="text-center pt-2">
        <Link
          to={ROUTES.ALGORITHMS}
          className="btn-primary inline-flex items-center gap-2 text-body font-semibold focus-ring shadow-e1 group"
        >
          <span>Open the visualizer</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  )
}
