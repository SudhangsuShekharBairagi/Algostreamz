import { X } from 'lucide-react'
import PseudocodePanel from './PseudocodePanel'

/**
 * Zen Mode Translucent Overlay Pseudocode Sheet.
 * Desktop: 320px side sheet overlaying the stage without triggering reflows.
 * Mobile (<768px): 40vh bottom sheet overlay.
 */
export default function ZenPseudocodeSheet({
  open = false,
  onClose,
  pseudocode = [],
  activeLine = 1,
}) {
  if (!open) return null

  return (
    <>
      {/* Background scrim overlay */}
      <div
        className="fixed inset-0 bg-ink/20 backdrop-blur-xs z-40 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Container */}
      <div
        role="dialog"
        aria-label="Zen mode pseudocode viewer"
        aria-modal="true"
        className="fixed z-50 bg-surface/95 backdrop-blur-md border-line shadow-e3 overflow-y-auto transition-transform duration-200 bottom-0 left-0 right-0 h-[40vh] border-t md:top-0 md:bottom-0 md:left-auto md:right-0 md:h-full md:w-[320px] md:border-t-0 md:border-l"
      >
        <div className="p-4 flex items-center justify-between border-b border-line">
          <h3 className="font-display font-semibold text-body text-ink">Pseudocode</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close pseudocode sheet"
            className="btn-ghost p-2 rounded-full focus-ring"
          >
            <X className="w-4 h-4 text-ink-muted" />
          </button>
        </div>

        <PseudocodePanel pseudocode={pseudocode} activeLine={activeLine} variant="flat" />
      </div>
    </>
  )
}
