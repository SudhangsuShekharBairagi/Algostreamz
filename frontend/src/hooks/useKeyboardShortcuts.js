import { useEffect } from 'react'

/**
 * Global Keyboard Shortcuts Hook for Visualizers.
 * Supports playback, navigation, speed adjustment, Zen mode, and overlay controls.
 *
 * Rules:
 * 1. Ignores input, textarea, select, or contenteditable elements.
 * 2. Ignores shortcuts when Ctrl, Meta (Cmd), or Alt key is held.
 * 3. Prevents default scroll/browser action ONLY when a matching shortcut fires.
 *
 * @param {Object} handlers - Event handlers for keyboard triggers
 * @param {Function} [handlers.onTogglePlay] - Space
 * @param {Function} [handlers.onStepForward] - ArrowRight
 * @param {Function} [handlers.onStepBackward] - ArrowLeft
 * @param {Function} [handlers.onReset] - R
 * @param {Function} [handlers.onSpeedUp] - ArrowUp
 * @param {Function} [handlers.onSlowDown] - ArrowDown
 * @param {Function} [handlers.onToggleZen] - Z
 * @param {Function} [handlers.onEscape] - Escape
 * @param {Function} [handlers.onTogglePseudocode] - P
 * @param {Function} [handlers.onToggleCaption] - C
 * @param {Function} [handlers.onToggleTechnical] - T
 * @param {Function} [handlers.onToggleStats] - S
 * @param {Function} [handlers.onToggleFullscreen] - F
 * @param {Function} [handlers.onToggleShortcuts] - ?
 * @param {boolean} [handlers.isZen=false] - Whether Zen mode is currently active
 * @param {boolean} [handlers.enabled=true] - Whether hook listener is enabled
 */
export function useKeyboardShortcuts({
  onTogglePlay,
  onStepForward,
  onStepBackward,
  onReset,
  onSpeedUp,
  onSlowDown,
  onToggleZen,
  onEscape,
  onTogglePseudocode,
  onToggleCaption,
  onToggleTechnical,
  onToggleStats,
  onToggleFullscreen,
  onToggleShortcuts,
  isZen = false,
  enabled = true,
} = {}) {
  useEffect(() => {
    if (!enabled) return undefined

    const handleKeyDown = (e) => {
      // 1. Ignore if modifier key (Ctrl, Cmd/Meta, Alt) is held
      if (e.ctrlKey || e.metaKey || e.altKey) return

      // 2. Ignore if active element is an input, textarea, select, or contenteditable
      const activeEl = document.activeElement
      const target = e.target
      const isInput =
        target.isContentEditable ||
        activeEl?.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl?.tagName)

      if (isInput) return

      const key = e.key

      // Global Shortcuts (Available in both Standard & Zen modes)
      if (key === ' ' || e.code === 'Space') {
        if (onTogglePlay) {
          e.preventDefault()
          onTogglePlay()
        }
      } else if (key === 'ArrowRight') {
        if (onStepForward) {
          e.preventDefault()
          onStepForward()
        }
      } else if (key === 'ArrowLeft') {
        if (onStepBackward) {
          e.preventDefault()
          onStepBackward()
        }
      } else if (key === 'r' || key === 'R') {
        if (onReset) {
          e.preventDefault()
          onReset()
        }
      } else if (key === 'ArrowUp') {
        if (onSpeedUp) {
          e.preventDefault()
          onSpeedUp()
        }
      } else if (key === 'ArrowDown') {
        if (onSlowDown) {
          e.preventDefault()
          onSlowDown()
        }
      } else if (key === 'z' || key === 'Z') {
        if (onToggleZen) {
          e.preventDefault()
          onToggleZen()
        }
      } else if (key === 'Escape') {
        if (onEscape) {
          e.preventDefault()
          onEscape()
        }
      } else if (key === '?') {
        if (onToggleShortcuts) {
          e.preventDefault()
          onToggleShortcuts()
        }
      }

      // Mode-specific / Zen Overlays Shortcuts
      if (key === 'p' || key === 'P') {
        if (onTogglePseudocode) {
          e.preventDefault()
          onTogglePseudocode()
        }
      } else if (key === 'c' || key === 'C') {
        if (onToggleCaption) {
          e.preventDefault()
          onToggleCaption()
        }
      } else if (key === 't' || key === 'T') {
        if (onToggleTechnical) {
          e.preventDefault()
          onToggleTechnical()
        }
      } else if (key === 's' || key === 'S') {
        if (onToggleStats) {
          e.preventDefault()
          onToggleStats()
        }
      } else if (key === 'f' || key === 'F') {
        if (onToggleFullscreen) {
          e.preventDefault()
          onToggleFullscreen()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    onTogglePlay,
    onStepForward,
    onStepBackward,
    onReset,
    onSpeedUp,
    onSlowDown,
    onToggleZen,
    onEscape,
    onTogglePseudocode,
    onToggleCaption,
    onToggleTechnical,
    onToggleStats,
    onToggleFullscreen,
    onToggleShortcuts,
    isZen,
    enabled,
  ])
}

export default useKeyboardShortcuts
