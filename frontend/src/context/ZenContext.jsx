import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'

const ZenContext = createContext(null)

const PREFS_STORAGE_KEY = 'dsa.zen.prefs'

const DEFAULT_PREFS = {
  showCaption: true,
  showPseudocode: false,
  showStats: false,
  explanationLevel: 'beginner',
}

// Routes eligible for Zen Mode
const ELIGIBLE_ROUTES = ['/visualizer', '/race', '/playground']

export function ZenProvider({ children }) {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [isZen, setIsZen] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [announceMessage, setAnnounceMessage] = useState('')
  const inactivityTimerRef = useRef(null)
  const isHoveredOrFocusedRef = useRef(false)

  // Persisted user preferences
  const [prefs, setPrefsState] = useState(() => {
    try {
      const stored = localStorage.getItem(PREFS_STORAGE_KEY)
      return stored ? { ...DEFAULT_PREFS, ...JSON.parse(stored) } : DEFAULT_PREFS
    } catch {
      return DEFAULT_PREFS
    }
  })

  // Determine if current route supports Zen Mode
  const zenAvailable = ELIGIBLE_ROUTES.some((route) => location.pathname.startsWith(route))

  const setPref = useCallback((key, value) => {
    setPrefsState((prev) => {
      const next = { ...prev, [key]: value }
      try {
        localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Fallback gracefully if storage fails
      }
      return next
    })
  }, [])

  // Nudge controls to reset 2500ms auto-hide timer
  const nudgeControls = useCallback(() => {
    setControlsVisible(true)
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
    }

    // Auto-hide controls after 2.5 seconds of inactivity if not hovered or focused
    inactivityTimerRef.current = setTimeout(() => {
      if (!isHoveredOrFocusedRef.current) {
        setControlsVisible(false)
      }
    }, 2500)
  }, [])

  const enterZen = useCallback(() => {
    if (!zenAvailable) return
    setIsZen(true)
    setAnnounceMessage('Zen mode on. Press Escape to exit.')
    nudgeControls()
  }, [zenAvailable, nudgeControls])

  const exitZen = useCallback(() => {
    setIsZen(false)
    setAnnounceMessage('Zen mode off.')
    setControlsVisible(true)
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
    }
  }, [])

  const toggleZen = useCallback(() => {
    if (isZen) {
      exitZen()
    } else {
      enterZen()
    }
  }, [isZen, enterZen, exitZen])

  // Automatically exit Zen Mode if navigating away from an eligible route
  useEffect(() => {
    if (!zenAvailable && isZen) {
      exitZen()
    }
  }, [location.pathname, zenAvailable, isZen, exitZen])

  // Check URL ?zen=1 query param on initial load or route change
  useEffect(() => {
    if (zenAvailable && searchParams.get('zen') === '1' && !isZen) {
      enterZen()
    }
  }, [location.pathname, searchParams, zenAvailable, isZen, enterZen])

  // Keyboard shortcut listeners (Z key for Zen, F key for Fullscreen, Escape for exit)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore key events when user is typing inside input, textarea, or contentEditable
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return
      }

      if (e.key === 'Escape' && isZen) {
        e.preventDefault()
        exitZen()
      } else if ((e.key === 'z' || e.key === 'Z') && !e.ctrlKey && !e.metaKey && zenAvailable) {
        e.preventDefault()
        toggleZen()
      } else if ((e.key === 'f' || e.key === 'F') && isZen && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        try {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {})
          } else {
            document.exitFullscreen().catch(() => {})
          }
        } catch {
          // Graceful fallback when fullscreen API is unsupported
        }
      }

      // Any keyboard activity nudges controls
      if (isZen) {
        nudgeControls()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isZen, zenAvailable, toggleZen, exitZen, nudgeControls])

  // Pointer activity listeners for auto-hide in Zen Mode
  useEffect(() => {
    if (!isZen) return undefined

    const handlePointerActivity = () => {
      nudgeControls()
    }

    window.addEventListener('mousemove', handlePointerActivity)
    window.addEventListener('touchstart', handlePointerActivity)

    return () => {
      window.removeEventListener('mousemove', handlePointerActivity)
      window.removeEventListener('touchstart', handlePointerActivity)
    }
  }, [isZen, nudgeControls])

  // HTML data-zen attribute sync
  useEffect(() => {
    document.documentElement.dataset.zen = isZen ? 'true' : 'false'
    return () => {
      delete document.documentElement.dataset.zen
    }
  }, [isZen])

  return (
    <ZenContext.Provider
      value={{
        isZen,
        enterZen,
        exitZen,
        toggleZen,
        controlsVisible,
        nudgeControls,
        prefs,
        setPref,
        zenAvailable,
        announceMessage,
        isHoveredOrFocusedRef,
      }}
    >
      {children}
    </ZenContext.Provider>
  )
}

export function useZen() {
  const context = useContext(ZenContext)
  if (!context) {
    throw new Error('useZen must be used within a ZenProvider')
  }
  return context
}

export default ZenProvider
