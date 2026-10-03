import { Play, Pause, SkipBack, SkipForward, RotateCcw, Shuffle } from 'lucide-react'

const SPEED_OPTIONS = [
  { label: '0.5x', ms: 800 },
  { label: '1x', ms: 400 },
  { label: '2x', ms: 200 },
  { label: '4x', ms: 100 },
]

/**
 * Reusable Playback Controls Component.
 * Supports 'bar' (white toolbar) and 'dock' (floating Zen Mode dock) variants.
 */
export default function PlaybackControls({
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
  onGenerateRandom,
  variant = 'bar',
}) {
  const isDock = variant === 'dock'

  const containerClasses = isDock
    ? 'bg-surface/90 backdrop-blur-md border border-line shadow-e3 rounded-pill px-4 py-2.5 flex items-center justify-between gap-4 max-w-2xl mx-auto'
    : 'bg-surface border border-line rounded-lg p-3 md:p-4 shadow-e1 flex flex-wrap md:flex-nowrap items-center justify-between gap-4 w-full'

  const maxStep = Math.max(0, totalSteps - 1)

  return (
    <div className={containerClasses} role="toolbar" aria-label="Algorithm playback controls">
      {/* Primary Action Buttons */}
      <div className="flex items-center gap-1.5 md:gap-2">
        <button
          type="button"
          onClick={onReset}
          disabled={isAtStart && currentStepIndex === 0}
          title="Reset algorithm (R)"
          aria-label="Reset visualizer to step 0"
          className="btn-ghost min-w-[40px] min-h-[40px] md:min-w-[44px] md:min-h-[44px] p-2.5 flex items-center justify-center focus-ring disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-4 h-4 text-ink-muted" />
        </button>

        <button
          type="button"
          onClick={onStepBackward}
          disabled={isAtStart}
          title="Step backward (Left Arrow)"
          aria-label="Step backward"
          className="btn-ghost min-w-[40px] min-h-[40px] md:min-w-[44px] md:min-h-[44px] p-2.5 flex items-center justify-center focus-ring disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <SkipBack className="w-4 h-4 text-ink-muted" />
        </button>

        <button
          type="button"
          onClick={onTogglePlay}
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          aria-label={isPlaying ? 'Pause algorithm visualization' : 'Play algorithm visualization'}
          className="btn-primary min-w-[40px] min-h-[40px] md:min-w-[44px] md:min-h-[44px] px-4 flex items-center justify-center gap-2 focus-ring"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-white" />
              <span className="sr-only md:not-sr-only text-xs font-medium">Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white ml-0.5" />
              <span className="sr-only md:not-sr-only text-xs font-medium">
                {isAtEnd ? 'Replay' : 'Play'}
              </span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onStepForward}
          disabled={isAtEnd}
          title="Step forward (Right Arrow)"
          aria-label="Step forward"
          className="btn-ghost min-w-[40px] min-h-[40px] md:min-w-[44px] md:min-h-[44px] p-2.5 flex items-center justify-center focus-ring disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <SkipForward className="w-4 h-4 text-ink-muted" />
        </button>
      </div>

      {/* Scrubber Timeline Slider */}
      <div className="flex-1 min-w-[160px] flex items-center gap-3">
        <label htmlFor="timeline-scrubber" className="sr-only">
          Timeline Scrubber
        </label>
        <input
          id="timeline-scrubber"
          type="range"
          min={0}
          max={maxStep}
          value={currentStepIndex}
          onChange={(e) => onGoToStep && onGoToStep(Number(e.target.value))}
          disabled={totalSteps <= 1}
          aria-valuemin={0}
          aria-valuemax={maxStep}
          aria-valuenow={currentStepIndex}
          aria-valuetext={`Step ${currentStepIndex + 1} of ${totalSteps}`}
          className="w-full h-2 bg-sunken rounded-lg appearance-none cursor-pointer accent-accent focus-ring disabled:opacity-40 disabled:cursor-not-allowed"
        />
        <span className="font-mono text-xs text-ink-muted tabular-nums whitespace-nowrap min-w-[48px] text-right">
          {totalSteps > 0 ? `${currentStepIndex + 1}/${totalSteps}` : '0/0'}
        </span>
      </div>

      {/* Speed Multiplier Segmented Control */}
      <div className="flex items-center gap-2">
        <div className="segmented" role="radiogroup" aria-label="Playback speed">
          {SPEED_OPTIONS.map((opt) => {
            const isSelected = Math.abs(speed - opt.ms) < 30
            return (
              <button
                key={opt.label}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSetSpeed && onSetSpeed(opt.ms)}
                className={`segmented-option min-w-[36px] min-h-[36px] text-xs font-mono font-medium focus-ring ${
                  isSelected ? 'selected' : ''
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        {/* Random Dataset Generator */}
        {onGenerateRandom && (
          <button
            type="button"
            onClick={onGenerateRandom}
            title="Generate random array dataset"
            aria-label="Generate new random array"
            className="btn-ghost min-w-[40px] min-h-[40px] md:min-w-[44px] md:min-h-[44px] p-2.5 flex items-center justify-center focus-ring border border-line"
          >
            <Shuffle className="w-4 h-4 text-ink-muted" />
          </button>
        )}
      </div>
    </div>
  )
}
