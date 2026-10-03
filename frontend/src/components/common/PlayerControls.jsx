import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react'

export default function PlayerControls({ onNext, onPrev, onReset, playing, onTogglePlay }) {
  return (
    <div className="inline-flex items-center gap-1.5 p-1.5 bg-surface border border-line rounded-lg shadow-e1">
      <button
        type="button"
        onClick={onReset}
        title="Reset Visualizer"
        aria-label="Reset visualizer step to start"
        className="btn-ghost p-2 focus-ring"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={onPrev}
        title="Previous Step"
        aria-label="Step backward"
        className="btn-ghost p-2 focus-ring"
      >
        <SkipBack className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={onTogglePlay}
        title={playing ? 'Pause' : 'Play'}
        aria-label={playing ? 'Pause algorithm visualization' : 'Play algorithm visualization'}
        className="btn-primary p-2 flex items-center justify-center focus-ring"
      >
        {playing ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
      </button>

      <button
        type="button"
        onClick={onNext}
        title="Next Step"
        aria-label="Step forward"
        className="btn-ghost p-2 focus-ring"
      >
        <SkipForward className="w-4 h-4" />
      </button>
    </div>
  )
}
