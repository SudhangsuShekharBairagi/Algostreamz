import { Link } from 'react-router-dom'
import { ArrowRight, HelpCircle } from 'lucide-react'
import { ROUTES } from '../../config/siteLinks'

export default function FinalCta() {
  const handleScrollToFaq = (e) => {
    const el = document.getElementById('faq')
    if (el) {
      e.preventDefault()
      el.scrollIntoView({ behavior: 'smooth' })
      window.history.pushState(null, '', '#faq')
    }
  }

  return (
    <section id="final-cta" aria-labelledby="cta-heading" className="scroll-mt-24 font-sans">
      <div className="bg-gradient-to-r from-accent to-accent-strong rounded-lg p-8 md:p-12 text-white text-center space-y-6 max-w-[800px] mx-auto shadow-e3">
        <h2 id="cta-heading" className="text-display-xl font-display font-semibold text-white tracking-tight">
          Ready to watch an algorithm think?
        </h2>

        <p className="text-body text-white/90 text-pretty max-w-[56ch] mx-auto">
          Explore interactive step-by-step visualizations, synchronized pseudocode, and distraction-free Zen mode.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {/* Start Exploring (White Button) */}
          <Link
            to={ROUTES.ALGORITHMS}
            className="btn-primary bg-surface text-ink hover:bg-canvas font-semibold px-5 py-2.5 rounded-md flex items-center gap-2 focus-ring shadow-e2 group cursor-pointer"
          >
            <span>Start exploring</span>
            <ArrowRight className="w-4 h-4 text-accent group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Read the FAQ (Ghost on Dark Button) */}
          <a
            href="#faq"
            onClick={handleScrollToFaq}
            className="btn-ghost text-white border border-white/30 hover:bg-white/10 font-semibold px-5 py-2.5 rounded-md flex items-center gap-2 focus-ring cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-white" />
            <span>Read the FAQ</span>
          </a>
        </div>
      </div>
    </section>
  )
}
