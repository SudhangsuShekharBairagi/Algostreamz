import { useEffect } from 'react'
import { X, Keyboard } from 'lucide-react'

const SHORTCUTS = [
  { key: 'Space', description: 'Play / Pause algorithm' },
  { key: '←', description: 'Step backward' },
  { key: '→', description: 'Step forward' },
  { key: 'R', description: 'Reset to step 0' },
  { key: 'Z', description: 'Toggle Zen Mode' },
  { key: 'P', description: 'Toggle Pseudocode sheet' },
  { key: 'T', description: 'Toggle Technical explanation' },
  { key: 'S', description: 'Toggle Stats telemetry' },
  { key: 'C', description: 'Toggle Caption narrative' },
  { key: 'F', description: 'Toggle Fullscreen' },
  { key: 'Esc', description: 'Exit Zen Mode / Close overlays' },
  { key: '?', description: 'Show keyboard shortcuts' },
]

/**
 * Minimal Keyboard Shortcuts Modal Overlay.
 * Dismissible via any key stroke or background click.
 */
export default function ZenShortcutsOverlay({ open = false, onClose }) {
  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (e) => {
      // Any key dismisses overlay
      if (e.key !== '?') {
        onClose && onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/30 backdrop-blur-xs animate-in fade-in duration-fast"
        onClick={onClose}
        aria-label="Close keyboard shortcuts"
      />
      <div
        className="relative z-10 card bg-surface p-6 max-w-md w-full shadow-e3 space-y-4 border border-line"
        role="dialog"
        aria-labelledby="shortcuts-heading"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-accent" />
            <h3 id="shortcuts-heading" className="font-display font-semibold text-h3 text-ink">Keyboard Shortcuts</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shortcuts overlay"
            className="btn-ghost p-1.5 focus-ring"
          >
            <X className="w-4 h-4 text-ink-muted" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {SHORTCUTS.map(({ key, description }) => (
            <div key={key} className="flex items-center justify-between p-2 rounded bg-sunken/60">
              <span className="text-ink-muted font-medium">{description}</span>
              <kbd className="kbd ml-2">{key}</kbd>
            </div>
          ))}
        </div>

        <p className="text-micro text-ink-faint text-center pt-2">
          Press any key or click outside to dismiss.
        </p>
      </div>
    </div>
  )
}
