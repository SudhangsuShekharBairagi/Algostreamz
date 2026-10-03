import { Maximize2, Minimize2 } from 'lucide-react'
import { useZen } from '../../context/ZenContext'

export default function ZenToggle({ className = '' }) {
  const { isZen, toggleZen, zenAvailable } = useZen()

  if (!zenAvailable) return null

  return (
    <button
      type="button"
      onClick={toggleZen}
      aria-pressed={isZen}
      aria-label="Zen mode"
      title="Zen mode (Z)"
      className={`btn-ghost p-2 text-ink-muted hover:text-ink focus-ring relative ${
        isZen ? 'text-accent bg-accent-soft' : ''
      } ${className}`}
    >
      {isZen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
    </button>
  )
}
