import { Link } from 'react-router-dom'
import { HelpCircle, ArrowRight } from 'lucide-react'
import ContactSection from '../components/landing/ContactSection'
import { SITE_NAME } from '../config'
import { ROUTES } from '../config/siteLinks'

export default function ContactPage() {
  return (
    <div className="space-y-10 py-4 font-sans">
      {/* Header Banner */}
      <div className="space-y-3 max-w-[68ch]">
        <span className="chip text-accent font-semibold text-micro uppercase tracking-wider">
          Get In Touch
        </span>
        <h1 className="text-display-xl font-display font-semibold text-ink">
          Talk to the {SITE_NAME} Team
        </h1>
        <p className="text-body text-ink-muted text-pretty">
          Whether you have feedback, feature requests, bug reports, or collaboration proposals, we read every submission.
        </p>

        {/* Link to FAQ */}
        <div className="pt-2">
          <Link
            to={`${ROUTES.HOME}#faq`}
            className="btn-ghost border border-line bg-surface text-caption font-semibold text-ink hover:text-accent inline-flex items-center gap-2 focus-ring shadow-e1"
          >
            <HelpCircle className="w-4 h-4 text-accent" />
            <span>Have a quick question? Check our FAQ</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Renders the full two-column ContactSection */}
      <ContactSection />
    </div>
  )
}
