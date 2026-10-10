import { useState, useRef, useEffect } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  MoreVertical,
  Code,
  Sparkles,
  Maximize,
  HelpCircle,
  LogOut,
  BarChart2,
  FileText,
} from 'lucide-react'

const SPEED_OPTIONS = [
  { label: '0.5x', ms: 800 },
  { label: '1x', ms: 400 },
  { label: '2x', ms: 200 },
  { label: '4x', ms: 100 },
]

/**
 * Zen Dock Floating Control Bar.
 * Responsive pill dock fixed at viewport bottom with overflow options sheet.
 */
export default function ZenDock({
  children,
  controlsVisible = true,
  isPlaying = false,
  isAtStart = true,
  isAtEnd = false,
  currentStepIndex = 0,
  totalSteps = 0,
  speed = 400,
  onTogglePlay,
  onStepForward,
  onStepBackward,
  onReset,
  onGoToStep,
  onSetSpeed,
  onTogglePseudocode,
  onToggleTechnical,
  onToggleStats,
  onToggleCaption,
  onToggleShortcuts,
  onExitZen,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const maxStep = Math.max(0, totalSteps - 1)

  // Close overflow menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      window.addEventListener('mousedown', handleClickOutside)
    }
    return () => window.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {})
      } else {
        document.exitFullscreen().catch(() => {})
      }
    } catch {
      // Fallback if unsupported
    }
    setMenuOpen(false)
  }

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-opacity duration-200 ${
        controlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className="bg-surface/90 backdrop-blur-md border border-line rounded-full shadow-e3 min-h-[56px] px-3 md:px-5 py-1.5 flex items-center justify-between gap-2 md:gap-4 max-w-[95vw] md:max-w-4xl"
        role="toolbar"
        aria-label="Zen Mode controls"
      >
        {children ? (
          <div className="flex items-center justify-center gap-2 md:gap-3 w-full py-1 overflow-x-auto">
            {children}
          </div>
        ) : (
          <>
            {/* Step Backward */}
            <button
              type="button"
              onClick={onStepBackward}
              disabled={isAtStart}
              title="Step Backward (Left Arrow)"
              aria-label="Step backward"
              className="btn-ghost w-11 h-11 rounded-full p-0 flex items-center justify-center focus-ring disabled:opacity-30"
            >
              <SkipBack className="w-4 h-4 text-ink-muted" />
            </button>

            {/* Primary Action Button: 44px Accent Circle */}
            <button
              type="button"
              onClick={onTogglePlay}
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              aria-label={isPlaying ? 'Pause algorithm visualization' : 'Play algorithm visualization'}
              className="w-11 h-11 rounded-full bg-accent hover:bg-accent-hover text-white flex items-center justify-center focus-ring transition-transform duration-fast active:scale-95 shadow-e2"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : (
                <Play className="w-5 h-5 fill-white ml-0.5" />
              )}
            </button>

            {/* Step Forward */}
            <button
              type="button"
              onClick={onStepForward}
              disabled={isAtEnd}
              title="Step Forward (Right Arrow)"
              aria-label="Step forward"
              className="btn-ghost w-11 h-11 rounded-full p-0 flex items-center justify-center focus-ring disabled:opacity-30"
            >
              <SkipForward className="w-4 h-4 text-ink-muted" />
            </button>

            {/* Scrubber Timeline */}
            <div className="hidden sm:flex items-center gap-2 min-w-[140px] max-w-[240px]">
              <input
                type="range"
                min={0}
                max={maxStep}
                value={currentStepIndex}
                onChange={(e) => onGoToStep && onGoToStep(Number(e.target.value))}
                disabled={totalSteps <= 1}
                aria-label="Zen Timeline Scrubber"
                className="w-full h-1.5 bg-sunken rounded-lg appearance-none cursor-pointer accent-accent focus-ring"
              />
            </div>

            {/* Speed Segmented Controls (Desktop) */}
            <div className="hidden md:flex items-center gap-1 bg-sunken p-1 rounded-full">
              {SPEED_OPTIONS.map((opt) => {
                const isSelected = Math.abs(speed - opt.ms) < 30
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => onSetSpeed && onSetSpeed(opt.ms)}
                    className={`min-w-[32px] h-8 rounded-full text-micro font-mono font-medium transition-colors ${
                      isSelected
                        ? 'bg-surface text-ink shadow-e1'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>

            {/* Reset Button */}
            <button
              type="button"
              onClick={onReset}
              disabled={isAtStart && currentStepIndex === 0}
              title="Reset (R)"
              aria-label="Reset visualizer"
              className="btn-ghost w-11 h-11 rounded-full p-0 flex items-center justify-center focus-ring disabled:opacity-30"
            >
              <RotateCcw className="w-4 h-4 text-ink-muted" />
            </button>

            {/* Overflow Menu Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                title="More Options"
                aria-label="Zen mode settings and shortcuts menu"
                aria-expanded={menuOpen}
                className="btn-ghost w-11 h-11 rounded-full p-0 flex items-center justify-center focus-ring"
              >
                <MoreVertical className="w-4 h-4 text-ink-muted" />
              </button>

              {menuOpen && (
                <div className="absolute bottom-14 right-0 w-64 bg-surface border border-line rounded-lg shadow-e3 py-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-fast">
                  <button
                    type="button"
                    onClick={() => {
                      onTogglePseudocode && onTogglePseudocode()
                      setMenuOpen(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-medium text-ink hover:bg-sunken flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Code className="w-4 h-4 text-accent" />
                      <span>Pseudocode</span>
                    </div>
                    <kbd className="kbd">P</kbd>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onToggleTechnical && onToggleTechnical()
                      setMenuOpen(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-medium text-ink hover:bg-sunken flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-accent" />
                      <span>Technical Explanation</span>
                    </div>
                    <kbd className="kbd">T</kbd>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onToggleCaption && onToggleCaption()
                      setMenuOpen(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-medium text-ink hover:bg-sunken flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-accent" />
                      <span>Toggle Caption</span>
                    </div>
                    <kbd className="kbd">C</kbd>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onToggleStats && onToggleStats()
                      setMenuOpen(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-medium text-ink hover:bg-sunken flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <BarChart2 className="w-4 h-4 text-accent" />
                      <span>Toggle Stats</span>
                    </div>
                    <kbd className="kbd">S</kbd>
                  </button>

                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="w-full px-4 py-2.5 text-left text-xs font-medium text-ink hover:bg-sunken flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Maximize className="w-4 h-4 text-accent" />
                      <span>Fullscreen</span>
                    </div>
                    <kbd className="kbd">F</kbd>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onToggleShortcuts && onToggleShortcuts()
                      setMenuOpen(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-medium text-ink hover:bg-sunken flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-accent" />
                      <span>Keyboard Shortcuts</span>
                    </div>
                    <kbd className="kbd">?</kbd>
                  </button>

                  <div className="my-1 border-t border-line" />

                  <button
                    type="button"
                    onClick={() => {
                      onExitZen && onExitZen()
                      setMenuOpen(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-medium text-state-swap hover:bg-state-swap/10 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <LogOut className="w-4 h-4" />
                      <span>Exit Zen Mode</span>
                    </div>
                    <kbd className="kbd">Esc</kbd>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
