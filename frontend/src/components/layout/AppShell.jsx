import { useState, useEffect, useRef } from 'react'
import { useLocation, Outlet } from 'react-router-dom'
import { Minimize2 } from 'lucide-react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import SiteFooter from './SiteFooter'
import ErrorBoundary from '../common/ErrorBoundary'
import { useZen } from '../../context/ZenContext'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { LABELS, ROUTES } from '../../config/siteLinks'

export default function AppShell() {
  const location = useLocation()
  const currentPath = location.pathname
  const mainRef = useRef(null)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [fadeIn, setFadeIn] = useState(true)

  // Dynamically update document.title and meta description per route
  useDocumentTitle()

  const {
    isZen,
    exitZen,
    controlsVisible,
    nudgeControls,
    announceMessage,
    isHoveredOrFocusedRef,
  } = useZen()

  // Hide sidebar structural space on Landing Page '/' and Contact Page '/contact'
  const hideSidebarSpace = currentPath === ROUTES.HOME || currentPath === ROUTES.CONTACT

  // Accessibility: Move focus to main container on route change & trigger fade-in
  useEffect(() => {
    setFadeIn(false)
    const timeout = setTimeout(() => setFadeIn(true), 20)

    if (mainRef.current) {
      mainRef.current.focus()
    }

    setMobileSidebarOpen(false)

    return () => clearTimeout(timeout)
  }, [location.pathname])

  return (
    <div
      className={`min-h-screen text-ink font-sans transition-colors duration-300 ${
        isZen ? 'bg-zen-canvas' : 'bg-canvas bg-dots'
      }`}
    >
      {/* Screen Reader Live Region Announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announceMessage}
      </div>

      {/* Skip to Content Link */}
      <a
        href="#main"
        inert={isZen ? '' : undefined}
        className={`sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 btn-primary focus-ring shadow-e2 text-caption font-semibold ${
          isZen ? 'hidden' : ''
        }`}
      >
        {LABELS.SKIP_TO_CONTENT}
      </a>

      {/* Persistent 'Exit Zen' Ghost Button Fixed at Top-Right */}
      {isZen && (
        <button
          type="button"
          onClick={exitZen}
          onMouseEnter={() => {
            if (isHoveredOrFocusedRef) isHoveredOrFocusedRef.current = true
            nudgeControls()
          }}
          onMouseLeave={() => {
            if (isHoveredOrFocusedRef) isHoveredOrFocusedRef.current = false
            nudgeControls()
          }}
          onFocus={() => {
            if (isHoveredOrFocusedRef) isHoveredOrFocusedRef.current = true
            nudgeControls()
          }}
          onBlur={() => {
            if (isHoveredOrFocusedRef) isHoveredOrFocusedRef.current = false
            nudgeControls()
          }}
          aria-label={LABELS.EXIT_ZEN}
          title={`${LABELS.EXIT_ZEN} (Z)`}
          className={`fixed top-4 right-4 z-50 btn-ghost border border-line bg-surface/90 backdrop-blur-md px-3 py-1.5 text-caption font-semibold text-ink-muted hover:text-ink shadow-e2 flex items-center gap-1.5 focus-ring transition-all duration-300 ${
            controlsVisible
              ? 'opacity-40 hover:opacity-100 focus:opacity-100'
              : 'opacity-0 pointer-events-none'
          }`}
        >
          <Minimize2 className="w-4 h-4 text-accent" />
          <span>Exit Zen (Z)</span>
        </button>
      )}

      {/* Animated Navbar */}
      <Navbar
        isZen={isZen}
        onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
      />

      {/* Layout Shell Container */}
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        {!hideSidebarSpace && (
          <Sidebar
            isZen={isZen}
            mobileOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
          />
        )}

        <main
          id="main"
          tabIndex={-1}
          ref={mainRef}
          className={`flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 outline-none transition-opacity duration-200 ${
            fadeIn ? 'opacity-100' : 'opacity-0'
          } ${isZen ? 'py-4 max-w-full' : ''}`}
        >
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Site Footer (Hidden in Zen Mode) */}
      <SiteFooter />
    </div>
  )
}
