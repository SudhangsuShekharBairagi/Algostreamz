import { Link } from 'react-router-dom'
import { ArrowRight, Maximize2, Check, Sparkles } from 'lucide-react'
import HeroDemo from './HeroDemo'
import { SITE_NAME } from '../../config'
import { ROUTES, SIDEBAR_CATEGORIES } from '../../config/siteLinks'

export default function HeroSection() {
  // Compute total algorithms dynamically from categories dataset
  const totalAlgorithms = SIDEBAR_CATEGORIES.reduce(
    (acc, cat) => acc + cat.items.length,
    0
  )

  const handleScrollToHow = (e) => {
    e.preventDefault()
    const el = document.getElementById('how')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      window.history.pushState(null, '', '#how')
    }
  }

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative min-h-[75dvh] flex flex-col justify-center scroll-mt-24 font-sans"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-16">
        {/* Left Copy Column */}
        <div className="space-y-6 max-w-[62ch]">
          {/* Eyebrow Chip with Pulsing Dot */}
          <div className="inline-flex items-center gap-2 chip border-accent/20 bg-accent-soft text-accent font-semibold text-micro uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Interactive DSA visualizer
          </div>

          {/* H1 Heading with Hand-Drawn Accent Underline */}
          <h1
            id="hero-heading"
            className="text-display-xl font-display font-semibold tracking-tight text-ink leading-[1.08]"
          >
            Watch algorithms{' '}
            <span className="relative inline-block text-accent">
              think.
              {/* Hand-drawn SVG stroke underline under 'think' */}
              <svg
                className="absolute -bottom-1.5 left-0 w-full h-3 text-accent overflow-visible"
                viewBox="0 0 120 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M3 9C30 3 85 2 117 8"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-body text-ink-muted text-pretty max-w-[52ch]">
            {SITE_NAME} turns sorting, searching, trees and graphs into step-by-step visual stories, with pseudocode that follows along, plain-English explanations, and a Zen mode for deep focus.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {/* Primary Action */}
            <Link
              to={ROUTES.ALGORITHMS}
              className="btn-primary flex items-center gap-2 text-body font-semibold focus-ring shadow-e1 group"
            >
              <span>Start exploring</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Secondary Zen Mode Link */}
            <Link
              to={`${ROUTES.DEFAULT_VISUALIZER}?zen=1`}
              className="btn-ghost border border-line bg-surface text-body font-medium focus-ring flex items-center gap-2 shadow-e1"
            >
              <Maximize2 className="w-4 h-4 text-accent" />
              <span>Try Zen mode</span>
            </Link>

            {/* Text Link */}
            <a
              href="#how"
              onClick={handleScrollToHow}
              className="text-caption font-semibold text-accent hover:text-accent-hover hover:underline focus-ring rounded px-1 py-1"
            >
              See how it works ↓
            </a>
          </div>

          {/* Trust Row Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-line/60">
            <span className="chip font-medium text-ink bg-surface shadow-e1">
              <strong>{totalAlgorithms}</strong> algorithms
            </span>
            <span className="chip font-medium text-ink-muted bg-surface shadow-e1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Step back and forward
            </span>
            <span className="chip font-medium text-ink-muted bg-surface shadow-e1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Beginner and technical explanations
            </span>
            <span className="chip font-medium text-ink-muted bg-surface shadow-e1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              Keyboard friendly
            </span>
          </div>
        </div>

        {/* Right Live Demo Column */}
        <div className="flex justify-center lg:justify-end w-full">
          <HeroDemo />
        </div>
      </div>
    </section>
  )
}
