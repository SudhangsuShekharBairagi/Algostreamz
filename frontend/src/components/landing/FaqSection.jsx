import { useState } from 'react'
import { ChevronDown, Sparkles, MessageSquare } from 'lucide-react'
import { FAQ_ITEMS } from '../../data/faq'

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0) // Default first item open

  const toggleItem = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  const handleScrollToContact = (e) => {
    const el = document.getElementById('contact-section')
    if (el) {
      e.preventDefault()
      el.scrollIntoView({ behavior: 'smooth' })
      window.history.pushState(null, '', '#contact-section')
    }
  }

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="space-y-10 scroll-mt-24 font-sans"
    >
      {/* Header */}
      <div className="space-y-3 max-w-[68ch]">
        <div className="inline-flex items-center gap-2 chip border-accent/20 bg-accent-soft text-accent font-semibold text-micro uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          FAQ
        </div>
        <h2 id="faq-heading" className="text-h1 font-display font-semibold text-ink">
          Questions, answered
        </h2>
        <p className="text-body text-ink-muted">
          Clear, honest answers about Algostreamz capabilities, accounts, and educational features.
        </p>
      </div>

      {/* Accessible Accordion List */}
      <div className="space-y-3 max-w-[800px]">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx
          const headerId = `faq-header-${idx}`
          const panelId = `faq-panel-${idx}`

          return (
            <div
              key={item.id}
              className={`card border transition-all duration-200 ${
                isOpen
                  ? 'border-accent/40 bg-surface shadow-e2'
                  : 'border-line bg-surface hover:border-line-strong'
              }`}
            >
              <h3>
                <button
                  id={headerId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleItem(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 focus-ring rounded-lg cursor-pointer"
                >
                  <span className={`text-h3 font-semibold transition-colors ${isOpen ? 'text-accent' : 'text-ink'}`}>
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-ink-muted shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-accent' : ''
                    }`}
                  />
                </button>
              </h3>

              {/* Accordion Region Panel */}
              <div
                id={panelId}
                role="region"
                aria-labelledby={headerId}
                className={`overflow-hidden transition-all duration-200 ease-out-custom ${
                  isOpen ? 'max-h-48 opacity-100 pb-5 px-5' : 'max-h-0 opacity-0 px-5 pb-0'
                }`}
              >
                <p className="text-caption text-ink-muted leading-relaxed border-t border-line/60 pt-3">
                  {item.a}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom Link */}
      <div className="pt-2 text-center">
        <a
          href="#contact-section"
          onClick={handleScrollToContact}
          className="btn-ghost border border-line bg-surface text-caption font-semibold text-accent hover:text-accent-hover inline-flex items-center gap-2 focus-ring shadow-e1"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Still stuck? Talk to us ↓</span>
        </a>
      </div>
    </section>
  )
}
