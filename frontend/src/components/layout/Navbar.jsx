import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sun, Menu, ChevronRight, ArrowRight } from 'lucide-react'
import { FaGithub } from 'react-icons/fa'
import ZenToggle from '../common/ZenToggle'
import Logo from '../common/Logo'
import { SITE_NAME } from '../../config'
import { SITE_LINKS, LABELS, ROUTES } from '../../config/siteLinks'

export default function Navbar({ onToggleMobileSidebar, zenSlot, isZen = false }) {
  const location = useLocation()
  const currentPath = location.pathname
  const isLandingPage = currentPath === ROUTES.HOME

  const [scrolled, setScrolled] = useState(false)
  const [activeAnchor, setActiveAnchor] = useState('')

  // 1. Scroll listener for landing page header transparency
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 2. IntersectionObserver to highlight active anchor on Landing Page ('/')
  useEffect(() => {
    if (!isLandingPage) return undefined

    const sectionIds = SITE_LINKS.anchors.map((a) => a.targetId)
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveAnchor(`#${entry.target.id}`)
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    })

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [isLandingPage])

  // Helper to format breadcrumb from pathname
  const getBreadcrumbs = () => {
    if (isLandingPage) return null

    const segments = currentPath.split('/').filter(Boolean)
    const breadcrumbItems = []

    if (segments[0] === 'visualizer' && segments[1]) {
      const formattedName = segments[1]
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
      breadcrumbItems.push({ label: 'Visualizer', href: ROUTES.DEFAULT_VISUALIZER })
      breadcrumbItems.push({ label: formattedName, href: currentPath })
    } else if (segments[0]) {
      const formattedName = segments[0].charAt(0).toUpperCase() + segments[0].slice(1)
      breadcrumbItems.push({ label: formattedName, href: currentPath })
    }

    return breadcrumbItems
  }

  const breadcrumbs = getBreadcrumbs()

  // Smooth scroll helper for landing anchors
  const handleAnchorClick = (e, href) => {
    if (isLandingPage && href.startsWith('#')) {
      e.preventDefault()
      const targetId = href.replace('#', '')
      const el = document.getElementById(targetId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        window.history.pushState(null, '', href)
      }
    }
  }

  return (
    <header
      inert={isZen ? '' : undefined}
      aria-hidden={isZen}
      className={`sticky top-0 z-30 h-14 transition-all duration-300 ease-out-custom ${
        isZen
          ? '-translate-y-full opacity-0 pointer-events-none'
          : 'translate-y-0 opacity-100'
      } ${
        isLandingPage && !scrolled
          ? 'bg-transparent border-transparent'
          : 'bg-canvas/80 backdrop-blur-md border-b border-line'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Trigger + Logo + Breadcrumbs */}
        <div className="flex items-center gap-3">
          {!isLandingPage && (
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              aria-label={LABELS.SIDEBAR_TOGGLE}
              className="lg:hidden btn-ghost p-1.5 focus-ring"
            >
              <Menu className="w-5 h-5 text-ink" />
            </button>
          )}

          <Logo />

          {/* Breadcrumbs for internal routes */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-line text-caption font-medium">
              {breadcrumbs.map((item, index) => (
                <div key={`breadcrumb-${item.label}-${index}`} className="flex items-center gap-1.5">
                  {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-ink-faint" />}
                  <span
                    className={
                      index === breadcrumbs.length - 1
                        ? 'text-ink font-semibold'
                        : 'text-ink-muted hover:text-ink'
                    }
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Center/Right Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 h-full">
          {isLandingPage
            ? /* 1. Landing Page Section Anchor Links */
              SITE_LINKS.anchors.map((anchor) => {
                const isActive = activeAnchor === anchor.href
                return (
                  <a
                    key={anchor.href}
                    href={anchor.href}
                    onClick={(e) => handleAnchorClick(e, anchor.href)}
                    className={`relative flex items-center h-full text-caption font-medium transition-colors focus-ring px-1 ${
                      isActive
                        ? 'text-ink font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-accent'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    {anchor.label}
                  </a>
                )
              })
            : /* 2. Primary Application Navigation Links */
              SITE_LINKS.primary.map((link) => {
                const isActive =
                  currentPath === link.href ||
                  (link.href.startsWith('/visualizer') && currentPath.startsWith('/visualizer'))

                return (
                  <Link
                    key={link.id}
                    to={link.href}
                    className={`relative flex items-center h-full text-caption font-medium transition-colors focus-ring px-1 ${
                      isActive
                        ? 'text-ink font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-accent'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
        </nav>

        {/* Far Right Action Items */}
        <div className="flex items-center gap-2">
          {/* Landing CTA Button */}
          {isLandingPage ? (
            <Link
              to={ROUTES.ALGORITHMS}
              className="btn-primary flex items-center gap-1.5 text-caption font-semibold focus-ring shadow-e1"
            >
              <span>{LABELS.START_EXPLORING}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            /* Zen Toggle Button */
            <ZenToggle />
          )}

          {zenSlot}

          {/* Theme Placeholder Button */}
          <button
            type="button"
            aria-disabled="true"
            title={LABELS.THEME_COMING_SOON}
            className="btn-ghost p-2 opacity-60 cursor-not-allowed text-ink-muted focus-ring"
          >
            <Sun className="w-4 h-4" />
          </button>

          {/* GitHub Repository Link */}
          <a
            href={"https://github.com/SudhangsuShekharBairagi/Algostreamz"}
            target="_blank"
            rel="noopener noreferrer"
            title={`View ${SITE_NAME} on GitHub`}
            aria-label="GitHub Repository"
            className="btn-ghost p-2 text-ink-muted hover:text-ink focus-ring"
          >
            <FaGithub className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  )
}
