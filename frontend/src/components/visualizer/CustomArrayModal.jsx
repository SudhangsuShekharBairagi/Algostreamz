import { useState, useEffect, useRef } from 'react'
import { X, Check, SlidersHorizontal } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

/**
 * Accessible Modal for Parsing & Applying Custom Array Datasets.
 * Includes validation toast feedback for parsed array lengths & limit clamping.
 */
export default function CustomArrayModal({
  open = false,
  onClose,
  currentDataset = [],
  currentTarget,
  isSearching = false,
  onApply,
  isZen = false,
}) {
  const { showToast } = useToast()
  const [arrayInput, setArrayInput] = useState('')
  const [targetInput, setTargetInput] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setArrayInput(currentDataset.join(', '))
      setTargetInput(currentTarget !== undefined ? String(currentTarget) : '')
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus()
      }, 50)
    }
  }, [open, currentDataset, currentTarget])

  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()

    // Parse array input split by commas or spaces
    const tokens = arrayInput
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter(Boolean)

    const parsedNumbers = tokens.map(Number).filter((n) => !isNaN(n) && Number.isFinite(n))

    if (parsedNumbers.length === 0) {
      showToast('Please enter at least one valid number', 'warning', isZen)
      return
    }

    let finalArray = parsedNumbers
    if (parsedNumbers.length > 25) {
      finalArray = parsedNumbers.slice(0, 25)
      showToast('Max 25 elements allowed for clarity', 'warning', isZen)
    } else {
      showToast(`Array input parsed: ${finalArray.length} elements`, 'success', isZen)
    }

    let finalTarget = currentTarget
    if (isSearching) {
      const parsedTarget = Number(targetInput)
      if (!isNaN(parsedTarget)) {
        finalTarget = parsedTarget
      }
    }

    onApply(finalArray, finalTarget)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
    >
      {/* Scrim */}
      <button
        type="button"
        className="absolute inset-0 bg-ink/30 backdrop-blur-xs animate-in fade-in duration-fast"
        onClick={onClose}
        aria-label="Close custom input dialog"
      />

      {/* Modal Dialog Card */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 card bg-surface p-6 max-w-lg w-full shadow-e3 space-y-5 border border-line"
        role="dialog"
        aria-labelledby="custom-input-title"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-accent" />
            <h3 id="custom-input-title" className="font-display font-semibold text-h3 text-ink">
              Custom Dataset Input
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="btn-ghost p-1.5 focus-ring rounded-md"
          >
            <X className="w-4 h-4 text-ink-muted" />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-caption font-medium text-ink-muted">
              Array Elements (comma or space separated, max 25)
            </span>
            <textarea
              ref={inputRef}
              rows={3}
              value={arrayInput}
              onChange={(e) => setArrayInput(e.target.value)}
              placeholder="e.g. 44, 27, 89, 15, 62, 38, 71, 10"
              className="w-full rounded-md border border-line-strong bg-surface p-3 font-mono text-xs text-ink focus-ring shadow-e1 leading-relaxed"
            />
          </label>

          {isSearching && (
            <label className="block space-y-1.5">
              <span className="text-caption font-medium text-ink-muted">Search Target Value</span>
              <input
                type="number"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                placeholder="Target number to search"
                className="w-full h-10 rounded-md border border-line-strong bg-surface px-3 font-mono text-xs text-ink focus-ring shadow-e1"
              />
            </label>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost border border-line text-xs font-semibold px-4 py-2 focus-ring rounded-md"
          >
            Cancel (Esc)
          </button>
          <button
            type="submit"
            className="btn-primary text-xs font-semibold px-4 py-2 inline-flex items-center gap-1.5 focus-ring rounded-md"
          >
            <Check className="w-4 h-4" />
            <span>Apply Input</span>
          </button>
        </div>
      </form>
    </div>
  )
}
