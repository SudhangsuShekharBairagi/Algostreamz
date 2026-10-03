import { Mail, Clock, Sparkles } from 'lucide-react'
import { FaGithub } from 'react-icons/fa'
import ContactForm from '../common/ContactForm'
import { SITE_NAME, CONTACT_EMAIL, GITHUB_URL } from '../../config'

export default function ContactSection() {
  return (
    <section
      id="contact-section"
      aria-labelledby="contact-heading"
      className="space-y-10 scroll-mt-24 font-sans"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Left Column: Info & Contact Cards */}
        <div className="space-y-6 max-w-[56ch]">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 chip border-accent/20 bg-accent-soft text-accent font-semibold text-micro uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              TALK TO US
            </div>
            <h2 id="contact-heading" className="text-h1 font-display font-semibold text-ink">
              Talk to us
            </h2>
            <p className="text-body text-ink-muted text-pretty">
              Questions, feedback, a bug, or an algorithm you want added? We read every message.
            </p>
          </div>

          {/* Contact Details Cards */}
          <div className="space-y-4 pt-2">
            {/* Email Card */}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="card p-4 border border-line hover:border-accent/40 flex items-center gap-4 transition-all hover:-translate-y-0.5 shadow-e1 group focus-ring"
            >
              <div className="w-10 h-10 rounded-md bg-accent-soft text-accent flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-micro font-bold uppercase tracking-wider text-ink-faint">
                  Email Support
                </span>
                <span className="block text-body font-semibold text-ink group-hover:text-accent transition-colors">
                  {CONTACT_EMAIL}
                </span>
              </div>
            </a>

            {/* GitHub Issues Card */}
            <a
              href={`${GITHUB_URL}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-4 border border-line hover:border-accent/40 flex items-center gap-4 transition-all hover:-translate-y-0.5 shadow-e1 group focus-ring"
            >
              <div className="w-10 h-10 rounded-md bg-accent-soft text-accent flex items-center justify-center shrink-0">
                <FaGithub className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-micro font-bold uppercase tracking-wider text-ink-faint">
                  GitHub Repository
                </span>
                <span className="block text-body font-semibold text-ink group-hover:text-accent transition-colors">
                  Report issues on GitHub
                </span>
              </div>
            </a>

            {/* Response Time Card */}
            <div className="card p-4 border border-line bg-sunken/40 flex items-center gap-4 shadow-e1">
              <div className="w-10 h-10 rounded-md bg-surface text-ink-muted border border-line flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <div className="space-y-0.5">
                <span className="text-micro font-bold uppercase tracking-wider text-ink-faint">
                  Response SLA
                </span>
                <span className="block text-caption font-semibold text-ink">
                  Typical reply: within 2 days
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Contact Form */}
        <ContactForm />
      </div>
    </section>
  )
}
