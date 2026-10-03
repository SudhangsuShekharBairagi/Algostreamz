import { useParams } from 'react'
import { useStepPlayer } from '../hooks/useStepPlayer'
import PlayerControls from '../components/common/PlayerControls'
import { Sparkles, Info } from 'lucide-react'

// Dummy step trace data to drive visualizer frame until Prompt 1.3 pure generators arrive
const DUMMY_STEPS = [
  { index: 0, array: [45, 12, 89, 34, 67], comparing: [0, 1], action: 'Comparing elements 45 and 12' },
  { index: 1, array: [12, 45, 89, 34, 67], swapping: [0, 1], action: 'Swapping 45 and 12' },
  { index: 2, array: [12, 45, 89, 34, 67], comparing: [1, 2], action: 'Comparing elements 45 and 89' },
  { index: 3, array: [12, 45, 34, 89, 67], swapping: [2, 3], action: 'Swapping 89 and 34' },
  { index: 4, array: [12, 45, 34, 67, 89], sorted: [4], action: 'Element 89 placed in sorted position' },
]

export default function VisualizerPage() {
  const { algorithmId = 'bubble-sort' } = useParams()
  const { current, playing, setPlaying, next, prev, reset } = useStepPlayer(DUMMY_STEPS)

  const currentStep = DUMMY_STEPS[current] || DUMMY_STEPS[0]
  const formattedTitle = algorithmId
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="chip text-accent font-semibold text-micro uppercase tracking-wider">
              Visualizer Stage
            </span>
            <span className="chip font-mono text-micro">O(N²) Time</span>
          </div>
          <h1 className="text-h1 font-display font-semibold text-ink mt-1">
            {formattedTitle}
          </h1>
        </div>

        {/* Player Controls Component */}
        <PlayerControls
          onNext={next}
          onPrev={prev}
          onReset={reset}
          playing={playing}
          onTogglePlay={() => setPlaying(!playing)}
        />
      </div>

      {/* Main Interactive Stage */}
      <div className="card p-8 bg-surface space-y-8 min-h-[360px] flex flex-col justify-between">
        {/* Step Action Banner */}
        <div className="flex items-center justify-between bg-accent-soft/60 border border-accent/20 px-4 py-2.5 rounded-md">
          <div className="flex items-center gap-2 text-caption font-medium text-accent-strong">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>{currentStep.action}</span>
          </div>
          <span className="font-mono text-caption text-accent-strong font-bold tabular-nums">
            Step {current + 1} / {DUMMY_STEPS.length}
          </span>
        </div>

        {/* Bar Visualizer Presentation */}
        <div className="flex items-end justify-center gap-4 h-48 py-4 px-8 bg-sunken/40 rounded-lg border border-line">
          {currentStep.array.map((val, idx) => {
            const isComparing = currentStep.comparing?.includes(idx)
            const isSwapping = currentStep.swapping?.includes(idx)
            const isSorted = currentStep.sorted?.includes(idx)

            let barColor = 'bg-accent/80'
            let ringStyle = ''

            if (isComparing) {
              barColor = 'bg-state-compare'
              ringStyle = 'ring-4 ring-state-compare-ring'
            } else if (isSwapping) {
              barColor = 'bg-state-swap'
              ringStyle = 'ring-4 ring-state-swap-ring'
            } else if (isSorted) {
              barColor = 'bg-state-sorted'
              ringStyle = 'ring-4 ring-state-sorted-ring'
            }

            return (
              <div key={idx} className="flex flex-col items-center gap-2">
                <span className="font-mono text-caption font-semibold text-ink tabular-nums">
                  {val}
                </span>
                <div
                  className={`w-12 ${barColor} ${ringStyle} rounded-t-md transition-all duration-200 shadow-e1`}
                  style={{ height: `${val * 1.8}px` }}
                />
                <span className="font-mono text-micro text-ink-faint">[{idx}]</span>
              </div>
            );
          })}
        </div>

        {/* Info Footer */}
        <div className="flex items-center gap-2 text-caption text-ink-muted border-t border-line pt-4">
          <Info className="w-4 h-4 text-accent" />
          <span>
            Use player controls above or press <kbd className="kbd">Space</kbd> to play/pause.
          </span>
        </div>
      </div>
    </div>
  )
}
