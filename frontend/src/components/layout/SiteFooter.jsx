import { Link, useLocation } from 'react-router-dom'
import { FaGithub } from 'react-icons/fa'
import { ArrowUp } from 'lucide-react'
import Logo from '../common/Logo'
import { useZen } from '../../context/ZenContext'
import { SITE_NAME, TAGLINE, GITHUB_URL } from '../../config'
import { ROUTES, SITE_LINKS } from '../../config/siteLinks'

export default function SiteFooter() {
  const { isZen } = useZen()
  const location = useLocation()
  const isLandingPage = location.pathname === ROUTES.HOME
  const currentYear = new Date().getFullYear()

  // Zen Mode hides footer
  if (isZen) return null

  const handleAnchorClick = (e, targetId) => {
    if (isLandingPage) {
      const el = document.getElementById(targetId)
      if (el) {
        e.preventDefault()
        el.scrollIntoView({ behavior: 'smooth' })
        window.history.pushState(null, '', `#${targetId}`)
      }
    }
  }

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="border-t border-line bg-surface py-12 font-sans">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Four Column Navigation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-line">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Logo size="md" showWordmark={true} />
            <p className="text-caption text-ink-muted leading-relaxed">
              {TAGLINE}
            </p>
            <div className="pt-1">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${SITE_NAME} GitHub Repository`}
                className="btn-ghost p-2 text-ink-muted hover:text-ink focus-ring inline-flex items-center gap-2 text-caption font-semibold"
              >
                <FaGithub className="w-4 h-4" />
                <span>GitHub Repository</span>
              </a>
            </div>
          </div>

          {/* Column 2: Learn */}
          <div className="space-y-3">
            <h3 className="text-micro font-bold uppercase tracking-wider text-ink-faint">
              Learn
            </h3>
            <ul className="space-y-2 text-caption font-medium text-ink-muted">
              <li>
                <Link to={ROUTES.ALGORITHMS} className="hover:text-ink focus-ring rounded">
                  Algorithms Catalog
                </Link>
              </li>
              <li>
                <Link to={ROUTES.DEFAULT_VISUALIZER} className="hover:text-ink focus-ring rounded">
                  Interactive Visualizer
                </Link>
              </li>
              <li>
                <Link to={ROUTES.PLAYGROUND} className="hover:text-ink focus-ring rounded">
                  Custom Sandbox
                </Link>
              </li>
              <li>
                <Link to={ROUTES.RACE} className="hover:text-ink focus-ring rounded">
                  Race Mode
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Practice */}
          <div className="space-y-3">
            <h3 className="text-micro font-bold uppercase tracking-wider text-ink-faint">
              Practice
            </h3>
            <ul className="space-y-2 text-caption font-medium text-ink-muted">
              <li>
                <Link to={ROUTES.EXPERIMENT} className="hover:text-ink focus-ring rounded">
                  Experiments
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CHALLENGES} className="hover:text-ink focus-ring rounded">
                  Challenges
                </Link>
              </li>
              <li>
                <Link to={ROUTES.PROGRESS} className="hover:text-ink focus-ring rounded">
                  Your Progress
                </Link>
              </li>
              <li>
                <Link to={ROUTES.DESIGN_SYSTEM} className="hover:text-ink focus-ring rounded">
                  Design System Tokens
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Company / Anchors */}
          <div className="space-y-3">
            <h3 className="text-micro font-bold uppercase tracking-wider text-ink-faint">
              Company
            </h3>
            <ul className="space-y-2 text-caption font-medium text-ink-muted">
              <li>
                {isLandingPage ? (
                  <a
                    href="#why"
                    onClick={(e) => handleAnchorClick(e, 'why')}
                    className="hover:text-ink focus-ring rounded"
                  >
                    Why {SITE_NAME}
                  </a>
                ) : (
                  <Link to="/#why" className="hover:text-ink focus-ring rounded">
                    Why {SITE_NAME}
                  </Link>
                )}
              </li>
              <li>
                {isLandingPage ? (
                  <a
                    href="#how"
                    onClick={(e) => handleAnchorClick(e, 'how')}
                    className="hover:text-ink focus-ring rounded"
                  >
                    How it works
                  </a>
                ) : (
                  <Link to="/#how" className="hover:text-ink focus-ring rounded">
                    How it works
                  </Link>
                )}
              </li>
              <li>
                {isLandingPage ? (
                  <a
                    href="#faq"
                    onClick={(e) => handleAnchorClick(e, 'faq')}
                    className="hover:text-ink focus-ring rounded"
                  >
                    FAQ
                  </a>
                ) : (
                  <Link to="/#faq" className="hover:text-ink focus-ring rounded">
                    FAQ
                  </Link>
                )}
              </li>
              <li>
                <Link to={ROUTES.CONTACT} className="hover:text-ink focus-ring rounded">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-caption text-ink-faint pt-2">
          <p>© {currentYear} {SITE_NAME}. Built as a minor project.</p>

          <button
            type="button"
            onClick={handleBackToTop}
            className="btn-ghost p-1.5 text-caption font-semibold text-ink-muted hover:text-ink inline-flex items-center gap-1.5 focus-ring"
          >
            <span>Back to top</span>
            <ArrowUp className="w-4 h-4 text-accent" />
          </button>
        </div>
      </div>
    </footer>
  )
}
