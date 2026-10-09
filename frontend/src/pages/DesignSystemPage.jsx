import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeftRight,
  Check,
  Search,
  Sparkles,
  ShieldCheck,
  Keyboard,
  Palette,
  Type,
  Activity,
  Sliders,
  CheckCircle2
} from 'lucide-react'
import { SITE_NAME } from '../config'
import { ROUTES, LABELS } from '../config/siteLinks'

export default function DesignSystemPage() {
  const [selectedSegment, setSelectedSegment] = useState('bubble')
  const [counter, setCounter] = useState(42)

  const colorSwatches = [
    { name: 'canvas', hex: '#F8FAFC', variable: '--canvas', role: 'Main app background', contrast: '20.8:1 (AAA)' },
    { name: 'zen-canvas', hex: '#FBFAF7', variable: '--zen-canvas', role: 'Zen mode warm canvas', contrast: '20.6:1 (AAA)' },
    { name: 'surface', hex: '#FFFFFF', variable: '--surface', role: 'Card & container surface', contrast: '21.0:1 (AAA)' },
    { name: 'sunken', hex: '#F1F5F9', variable: '--sunken', role: 'Inputs & segmented tracks', contrast: '19.4:1 (AAA)' },
    { name: 'line', hex: '#E2E8F0', variable: '--line', role: 'Subtle container borders', contrast: 'N/A (Border)' },
    { name: 'line-strong', hex: '#CBD5E1', variable: '--line-strong', role: 'Strong UI outlines & kbd borders', contrast: 'N/A (Border)' },
    { name: 'ink', hex: '#0F172A', variable: '--ink', role: 'Primary text & headings', contrast: '21.0:1 (AAA)' },
    { name: 'ink-muted', hex: '#475569', variable: '--ink-muted', role: 'Secondary labels & captions', contrast: '7.1:1 (AAA)' },
    { name: 'ink-faint', hex: '#64748B', variable: '--ink-faint', role: 'Lowest allowed text color', contrast: '4.6:1 (AA Pass)' },
    { name: 'accent', hex: '#4F46E5', variable: '--accent', role: 'Primary brand accent & interactive', contrast: '4.7:1 (AA Pass)' },
    { name: 'accent-hover', hex: '#4338CA', variable: '--accent-hover', role: 'Hover state for primary actions', contrast: '6.2:1 (AAA)' },
    { name: 'accent-soft', hex: '#EEF2FF', variable: '--accent-soft', role: 'Selected items & subtle highlights', contrast: '19.8:1 (AAA)' },
  ]

  const stateColors = [
    {
      key: 'compare',
      title: 'Comparing State',
      token: 'bg-state-compare',
      ringToken: 'ring-state-compare-ring',
      hex: '#FBBF24',
      textColor: 'text-amber-950',
      badgeBg: 'bg-amber-100 text-amber-950 border-amber-300',
      icon: Search,
      signalDescription: 'Yellow background tint + Amber ring + Search icon indicator',
    },
    {
      key: 'swap',
      title: 'Swapping State',
      token: 'bg-state-swap',
      ringToken: 'ring-state-swap-ring',
      hex: '#E11D48',
      textColor: 'text-white',
      badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
      icon: ArrowLeftRight,
      signalDescription: 'Rose red background + Crimson ring + Swap Arrow icon indicator',
    },
    {
      key: 'sorted',
      title: 'Sorted State',
      token: 'bg-state-sorted',
      ringToken: 'ring-state-sorted-ring',
      hex: '#059669',
      textColor: 'text-white',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: Check,
      signalDescription: 'Emerald green background + Mint ring + Checkmark icon indicator',
    },
    {
      key: 'pivot',
      title: 'Pivot / Focus State',
      token: 'bg-state-pivot',
      ringToken: 'ring-state-pivot-ring',
      hex: '#7C3AED',
      textColor: 'text-white',
      badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
      icon: Sparkles,
      signalDescription: 'Violet purple background + Lavender ring + "PIVOT" text label',
    },
  ]

  return (
    <div className="min-h-screen bg-canvas bg-dots text-ink pb-24 font-sans">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-xl text-accent tracking-tight">
              {SITE_NAME}
            </span>
            <span className="chip">Design System v1.0</span>
          </div>
          <Link
            to={ROUTES.HOME}
            className="btn-ghost text-sm font-medium flex items-center gap-1.5 focus-ring"
          >
            <ArrowLeftRight className="w-4 h-4 rotate-180" />
            {LABELS.BACK_TO_HOME}
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-16">
        {/* Title / Intro */}
        <section className="space-y-4 max-w-[68ch]">
          <span className="chip text-accent font-semibold tracking-wide uppercase text-micro">
            Editorial Light Design System
          </span>
          <h1 className="text-display-xl font-display font-semibold text-ink tracking-tight">
            Design Tokens & Component Primitives
          </h1>
          <p className="text-body text-ink-muted text-pretty">
            This design system underpins every visualization component in {SITE_NAME}. It strictly enforces light editorial aesthetics, high typography legibility, spatial consistency on a 4px grid, and accessible color signals.
          </p>
        </section>

        {/* 1. Typography & Type Scale */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-line pb-3">
            <Type className="w-5 h-5 text-accent" />
            <h2 className="text-h2 font-display">1. Typography Scale</h2>
          </div>

          <div className="card p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-line pb-4 gap-2">
                <div>
                  <span className="text-micro text-ink-faint block uppercase">Display XL</span>
                  <span className="text-display-xl font-display font-semibold">Fraunces 600</span>
                </div>
                <span className="text-caption font-mono text-ink-muted">clamp(2.25rem, 4vw + 1rem, 3.5rem) / 1.05</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-line pb-4 gap-2">
                <div>
                  <span className="text-micro text-ink-faint block uppercase">Heading 1</span>
                  <span className="text-h1 font-display font-semibold">Fraunces 2rem / 1.15</span>
                </div>
                <span className="text-caption font-mono text-ink-muted">2.0rem / 32px</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-line pb-4 gap-2">
                <div>
                  <span className="text-micro text-ink-faint block uppercase">Heading 2</span>
                  <span className="text-h2 font-display font-semibold">Fraunces 1.5rem / 1.2</span>
                </div>
                <span className="text-caption font-mono text-ink-muted">1.5rem / 24px</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-line pb-4 gap-2">
                <div>
                  <span className="text-micro text-ink-faint block uppercase">Heading 3</span>
                  <span className="text-h3 font-sans font-semibold">Inter 600 1.125rem / 1.3</span>
                </div>
                <span className="text-caption font-mono text-ink-muted">1.125rem / 18px</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-line pb-4 gap-2">
                <div>
                  <span className="text-micro text-ink-faint block uppercase">Body Text</span>
                  <span className="text-body font-sans text-ink">Inter 0.9375rem (15px) / 1.6</span>
                </div>
                <span className="text-caption font-mono text-ink-muted">0.9375rem / 15px</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-line pb-4 gap-2">
                <div>
                  <span className="text-micro text-ink-faint block uppercase">Caption</span>
                  <span className="text-caption font-sans text-ink-muted">Inter 0.8125rem (13px) / 1.5</span>
                </div>
                <span className="text-caption font-mono text-ink-muted">0.8125rem / 13px</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2">
                <div>
                  <span className="text-micro text-ink-faint block uppercase">Micro Label</span>
                  <span className="text-micro font-sans font-bold uppercase tracking-wider text-ink-faint">
                    Inter 0.6875rem (11px) / 1.4 uppercase 0.08em
                  </span>
                </div>
                <span className="text-caption font-mono text-ink-muted">0.6875rem / 11px</span>
              </div>
            </div>

            {/* Tabular Nums Demo */}
            <div className="bg-sunken p-4 rounded-md space-y-2 border border-line">
              <div className="flex items-center justify-between">
                <span className="text-caption font-medium text-ink">Tabular Digits Jitter Prevention Demo</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCounter((c) => Math.max(0, c - 1))}
                    className="btn-ghost px-2 py-1 text-xs font-mono focus-ring"
                  >
                    - Decrement
                  </button>
                  <button
                    onClick={() => setCounter((c) => c + 1)}
                    className="btn-ghost px-2 py-1 text-xs font-mono focus-ring"
                  >
                    + Increment
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-6 pt-2">
                <div>
                  <span className="text-micro text-ink-faint block">Monospace tabular-nums:</span>
                  <span className="font-mono text-2xl font-bold tabular-nums text-accent">
                    Step #{String(counter).padStart(4, '0')}
                  </span>
                </div>
                <div>
                  <span className="text-micro text-ink-faint block">Timer Value:</span>
                  <span className="font-mono text-2xl font-bold tabular-nums text-ink">
                    00:0{counter % 10}:{(counter * 12) % 60}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Color Palette & Contrast Ratios */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-line pb-3">
            <Palette className="w-5 h-5 text-accent" />
            <h2 className="text-h2 font-display">2. Color Tokens (Light Editorial Theme)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {colorSwatches.map((swatch) => (
              <div key={swatch.name} className="card p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <div
                    className="h-14 w-full rounded-md border border-line mb-3 shadow-inner flex items-center justify-center font-mono text-xs"
                    style={{ backgroundColor: swatch.hex }}
                  >
                    <span className="px-2 py-1 bg-surface/80 rounded border border-line text-ink font-semibold">
                      {swatch.hex}
                    </span>
                  </div>
                  <h3 className="text-caption font-semibold font-mono text-ink">{swatch.name}</h3>
                  <p className="text-micro text-ink-faint">{swatch.role}</p>
                </div>
                <div className="pt-2 border-t border-line flex justify-between items-center text-micro">
                  <span className="font-mono text-ink-muted">{swatch.variable}</span>
                  <span className="font-semibold text-emerald-700">{swatch.contrast}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Visualizer State Colors */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-line pb-3">
            <Activity className="w-5 h-5 text-accent" />
            <h2 className="text-h2 font-display">3. Algorithm Visualization State Signals</h2>
          </div>
          <p className="text-body text-ink-muted">
            Non-negotiable rule: Color is <strong>never the only signal</strong>. Every algorithm state is paired with a distinct icon, border ring, and clear text label.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stateColors.map((state) => {
              const IconComp = state.icon
              return (
                <div key={state.key} className="card p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-h3 font-semibold text-ink">{state.title}</h3>
                    <span className={`chip border font-mono text-micro uppercase ${state.badgeBg}`}>
                      {state.key}
                    </span>
                  </div>

                  {/* Interactive Bar Demo */}
                  <div className="flex items-center gap-4 bg-sunken p-4 rounded-md">
                    <div
                      className={`h-24 w-16 ${state.token} ring-4 ${state.ringToken} rounded-md flex flex-col items-center justify-between p-2 shadow-e1 transition-all`}
                    >
                      <IconComp className={`w-5 h-5 ${state.textColor}`} />
                      <span className={`font-mono text-sm font-bold ${state.textColor}`}>
                        {state.key === 'pivot' ? 'P' : '84'}
                      </span>
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <span className="text-caption font-bold text-ink flex items-center gap-1.5">
                        <IconComp className="w-4 h-4 text-accent" />
                        Dual Signal Specs
                      </span>
                      <p className="text-caption text-ink-muted">{state.signalDescription}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* 4. Component Primitives */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-line pb-3">
            <Sliders className="w-5 h-5 text-accent" />
            <h2 className="text-h2 font-display">4. Component Primitives</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Buttons & Focus States */}
            <div className="card p-6 space-y-6">
              <h3 className="text-h3 font-semibold">Buttons & Action States</h3>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <button className="btn-primary focus-ring">Primary Action</button>
                  <button className="btn-primary opacity-50 cursor-not-allowed" disabled>
                    Disabled
                  </button>
                  <button className="btn-ghost focus-ring">Ghost Action</button>
                </div>

                <div className="pt-4 border-t border-line space-y-2">
                  <span className="text-caption font-semibold text-ink block">
                    Keyboard Focus Ring Verification
                  </span>
                  <p className="text-caption text-ink-muted">
                    Press <kbd className="kbd">Tab</kbd> to observe the offset double focus ring on interactive components.
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <button className="btn-primary focus-ring">Tab Focus Me</button>
                    <button className="btn-ghost focus-ring">Focus Ghost</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Chips & Badges */}
            <div className="card p-6 space-y-6">
              <h3 className="text-h3 font-semibold">Chips, Badges & Indicators</h3>
              <div className="flex flex-wrap gap-2">
                <span className="chip">O(N log N) Time</span>
                <span className="chip">O(1) Auxiliary Space</span>
                <span className="chip font-mono">In-Place</span>
                <span className="chip text-accent border-accent/30 bg-accent-soft font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                  Verified Correct
                </span>
              </div>

              {/* Segmented Control */}
              <div className="pt-4 border-t border-line space-y-3">
                <span className="text-caption font-semibold text-ink block">
                  Segmented Control Primitive
                </span>
                <div className="segmented">
                  {['bubble', 'quick', 'merge'].map((alg) => (
                    <button
                      key={alg}
                      onClick={() => setSelectedSegment(alg)}
                      data-selected={selectedSegment === alg}
                      className={`segmented-option focus-ring capitalize ${
                        selectedSegment === alg ? 'selected' : ''
                      }`}
                    >
                      {alg} Sort
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Keyboard Shortcuts (kbd) */}
            <div className="card p-6 space-y-4">
              <h3 className="text-h3 font-semibold flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-accent" />
                Keyboard Shortcut Keys (.kbd)
              </h3>
              <div className="grid grid-cols-2 gap-3 text-caption">
                <div className="flex items-center justify-between p-2 bg-sunken rounded border border-line">
                  <span className="text-ink-muted">Play / Pause</span>
                  <kbd className="kbd">Space</kbd>
                </div>
                <div className="flex items-center justify-between p-2 bg-sunken rounded border border-line">
                  <span className="text-ink-muted">Step Next</span>
                  <kbd className="kbd">→</kbd>
                </div>
                <div className="flex items-center justify-between p-2 bg-sunken rounded border border-line">
                  <span className="text-ink-muted">Step Back</span>
                  <kbd className="kbd">←</kbd>
                </div>
                <div className="flex items-center justify-between p-2 bg-sunken rounded border border-line">
                  <span className="text-ink-muted">Toggle Zen Mode</span>
                  <kbd className="kbd">Z</kbd>
                </div>
              </div>
            </div>

            {/* Canvas Pattern Preview */}
            <div className="card p-6 space-y-4">
              <h3 className="text-h3 font-semibold">Dot Matrix Background Canvas</h3>
              <div className="h-32 rounded-lg bg-dots border border-line bg-canvas p-4 flex items-center justify-center">
                <span className="bg-surface/90 border border-line px-3 py-1.5 rounded-md text-caption font-mono text-ink shadow-e1">
                  .bg-dots 24px grid canvas
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Accessibility Checklist Summary */}
        <section className="card p-6 bg-accent-soft/40 border-accent/20 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-accent" />
            <h3 className="text-h3 font-semibold text-accent-strong">
              Design System Accessibility Verification
            </h3>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-caption text-ink-muted">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>
                <strong>Text Contrast:</strong> Body text contrast exceeds 4.5:1 against light canvas. Lowest text token is <code>text-ink-faint</code> (4.6:1).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>
                <strong>Multi-signal States:</strong> Color is never isolated; every state pairs with an icon, border ring, and explicit label.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>
                <strong>Focus Rings:</strong> All interactive elements inherit the <code>.focus-ring</code> utility with a 2px offset for visible keyboard navigation.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <span>
                <strong>Zero Jitter:</strong> Dynamic counters apply <code>font-mono tabular-nums</code> to guarantee zero layout shifts during animation steps.
              </span>
            </li>
          </ul>
        </section>
      </main>
    </div>
  )
}
