import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Layers, Sliders, ShieldCheck, Cpu } from 'lucide-react'
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from '../config'
import { ROUTES, LABELS, NAV_LINKS } from '../config/siteLinks'

export default function Home() {
  return (
    <div className="min-h-screen bg-canvas bg-dots text-ink flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={ROUTES.HOME} className="flex items-center gap-3 focus-ring rounded-md">
            <span className="font-display font-bold text-xl text-accent tracking-tight">
              {SITE_NAME}
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            {NAV_LINKS.map((link) => (
              <Link key={link.id} to={link.href} className="btn-ghost text-caption font-medium focus-ring">
                {link.label}
              </Link>
            ))}
            <Link to={ROUTES.LOGIN} className="btn-primary text-caption font-medium focus-ring ml-2">
              {LABELS.SIGN_IN}
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-16">
        <section className="space-y-6 max-w-[68ch]">
          <div className="inline-flex items-center gap-2 chip border-accent/20 bg-accent-soft text-accent font-semibold text-micro uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Step-by-Step Visualization
          </div>
          <h1 className="text-display-xl font-display font-semibold tracking-tight text-ink">
            {SITE_TAGLINE}
          </h1>
          <p className="text-body text-ink-muted text-pretty">
            {SITE_DESCRIPTION}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link to={ROUTES.DESIGN_SYSTEM} className="btn-primary flex items-center gap-2 text-body focus-ring">
              Explore Design System
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to={ROUTES.LOGIN} className="btn-ghost border border-line bg-surface text-body focus-ring">
              Get Started Free
            </Link>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <div className="card p-6 space-y-3">
            <div className="w-10 h-10 rounded-md bg-accent-soft text-accent flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-h3 font-semibold text-ink">Pure Step Engine</h3>
            <p className="text-caption text-ink-muted">
              Algorithms generate complete trace snapshots upfront. Components perform zero algorithm computation during render.
            </p>
          </div>

          <div className="card p-6 space-y-3">
            <div className="w-10 h-10 rounded-md bg-accent-soft text-accent flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-h3 font-semibold text-ink">Zen Mode Stage</h3>
            <p className="text-caption text-ink-muted">
              Strip away UI chrome and focus entirely on visual execution with a centered stage and auto-hiding floating controls.
            </p>
          </div>

          <div className="card p-6 space-y-3">
            <div className="w-10 h-10 rounded-md bg-accent-soft text-accent flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-h3 font-semibold text-ink">Accessible Signals</h3>
            <p className="text-caption text-ink-muted">
              Dual-signal color tokens ensure comparing, swapping, sorted, and pivot states are always paired with distinct icons and labels.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-surface py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-caption text-ink-muted">
          <p>© 2026 {SITE_NAME}. Editorial Light Visualization Platform.</p>
          <div className="flex gap-4">
            <Link to={ROUTES.DESIGN_SYSTEM} className="hover:text-ink focus-ring">
              Design Tokens
            </Link>
            <Link to={ROUTES.HOME} className="hover:text-ink focus-ring">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
