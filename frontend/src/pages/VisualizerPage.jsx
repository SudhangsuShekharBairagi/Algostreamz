import { useState, useMemo, useCallback, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Sparkles, ArrowLeft } from 'lucide-react'
import { getAlgorithmById } from '../data/algorithmsData'
import { generateSortingSteps } from '../engine/sortingGenerators'
import { generateSearchingSteps } from '../engine/searchingGenerators'
import { useVisualizer } from '../hooks/useVisualizer'
import { useZen } from '../context/ZenContext'
import progressApi from '../services/progressApi'
import { errorMessage } from '../services/api'
import { ROUTES, LABELS } from '../config/siteLinks'
import SortingCanvas from '../components/visualizer/SortingCanvas'
import PlaybackControls from '../components/visualizer/PlaybackControls'
import ExplanationPanel from '../components/visualizer/ExplanationPanel'
import PseudocodePanel from '../components/visualizer/PseudocodePanel'
import ZenCaption from '../components/visualizer/ZenCaption'
import ZenDock from '../components/visualizer/ZenDock'
import ZenPseudocodeSheet from '../components/visualizer/ZenPseudocodeSheet'
import ZenShortcutsOverlay from '../components/visualizer/ZenShortcutsOverlay'
import StructureVisualizer from '../components/visualizers/structures/StructureVisualizer'
import NotFoundPage from './NotFoundPage'

export default function VisualizerPage() {
  const { algorithmId = 'bubble-sort' } = useParams()
  const algorithm = getAlgorithmById(algorithmId)

  const { isZen, toggleZen, exitZen, controlsVisible, announceMessage } = useZen()
  const [progressError, setProgressError] = useState('')

  // Local Zen toggle states for overlay elements
  const [showPseudocodeSheet, setShowPseudocodeSheet] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [explanationLevel, setExplanationLevel] = useState('beginner')

  // Dataset state management
  const [dataset, setDataset] = useState(() => {
    if (!algorithm) return [44, 27, 89, 15, 62, 38, 71, 10]
    if (Array.isArray(algorithm.defaultInput)) {
      return algorithm.defaultInput
    }
    if (algorithm.defaultInput && Array.isArray(algorithm.defaultInput.array)) {
      return algorithm.defaultInput.array
    }
    return [44, 27, 89, 15, 62, 38, 71, 10]
  })

  const [searchTarget, setSearchTarget] = useState(() => {
    if (algorithm && algorithm.defaultInput && algorithm.defaultInput.target !== undefined) {
      return algorithm.defaultInput.target
    }
    return 60
  })

  // Generate pure steps from engine
  const steps = useMemo(() => {
    if (!algorithm) return []
    if (algorithm.category === 'Sorting') {
      return generateSortingSteps(algorithm.id, dataset)
    }
    if (algorithm.category === 'Searching') {
      return generateSearchingSteps(algorithm.id, dataset, searchTarget)
    }
    return []
  }, [algorithm, dataset, searchTarget])

  // Shared useVisualizer instance - maintains playback index seamlessly across Standard & Zen modes
  const visualizer = useVisualizer(steps)

  const {
    currentStepIndex,
    currentStep,
    isPlaying,
    speed,
    progressPercent,
    isAtStart,
    isAtEnd,
    play,
    togglePlay,
    stepForward,
    stepBackward,
    goToStep,
    reset,
    setSpeed,
    loadSteps,
  } = visualizer

  useEffect(() => {
    if (!algorithm || !steps.length || !isAtEnd) return

    let cancelled = false
    progressApi.completeVisualizer(algorithm.id).then(
      () => {
        if (!cancelled) setProgressError('')
      },
      (error) => {
        if (!cancelled) {
          setProgressError(errorMessage(error, 'Unable to save your progress. Please try again.'))
        }
      },
    )
    return () => {
      cancelled = true
    }
  }, [algorithm, isAtEnd, steps.length])

  // Generate fresh random array dataset
  const handleGenerateRandom = useCallback(() => {
    const size = Math.floor(Math.random() * 8) + 6 // 6 to 13 items
    const newArr = Array.from({ length: size }, () => Math.floor(Math.random() * 85) + 12)
    setDataset(newArr)

    let newSteps = []
    if (algorithm?.category === 'Searching') {
      const target = newArr[Math.floor(Math.random() * newArr.length)]
      setSearchTarget(target)
      newSteps = generateSearchingSteps(algorithm.id, newArr, target)
    } else {
      newSteps = generateSortingSteps(algorithm?.id || 'bubble-sort', newArr)
    }
    loadSteps(newSteps)
  }, [algorithm, loadSteps])

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return
      }

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault()
        togglePlay()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        stepForward()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        stepBackward()
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        reset()
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        setShowPseudocodeSheet((prev) => !prev)
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault()
        setExplanationLevel((prev) => (prev === 'beginner' ? 'technical' : 'beginner'))
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault()
        setShowStats((prev) => !prev)
      } else if (e.key === '?') {
        e.preventDefault()
        setShowShortcuts((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePlay, stepForward, stepBackward, reset])

  // Return NotFound if algorithm ID is invalid
  if (!algorithm) {
    return (
      <NotFoundPage
        title="404 - Algorithm Not Found"
        message={`No algorithm with the ID "${algorithmId}" exists in the catalog.`}
      />
    )
  }

  if (algorithm.category === 'Data Structures') {
    return <StructureVisualizer key={algorithm.id} algorithm={algorithm} />
  }

  const values = currentStep?.values || dataset
  const highlightedIndices = currentStep?.highlightedIndices || {}
  const activeLine = currentStep?.pseudocodeLine || 1

  // ================= ZEN LAYOUT (isZen === true) =================
  if (isZen) {
    return (
      <div className="fixed inset-0 min-h-dvh bg-zen-canvas p-4 md:p-8 flex flex-col justify-between relative overflow-hidden select-none z-30">
        {/* Progress Hairline at top of viewport */}
        <div
          className="fixed top-0 left-0 right-0 h-[2px] bg-accent z-50 transition-transform duration-150 origin-left"
          style={{ transform: `scaleX(${progressPercent / 100})` }}
          aria-hidden="true"
        />

        {/* Screen Reader Announcement */}
        {announceMessage && (
          <div className="sr-only" aria-live="polite">
            {announceMessage}
          </div>
        )}

        {/* Header Line */}
        <div className="pt-4 text-center space-y-1">
          <h1 className="font-display text-lg md:text-xl font-semibold text-ink-muted">{algorithm.name}</h1>
          <p className="font-mono text-xs text-ink-faint tabular-nums">
            Step {currentStepIndex + 1} / {steps.length}
          </p>
        </div>

        {/* Stage Area */}
        <div className="flex-1 my-8 flex items-center justify-center max-w-[1100px] w-full mx-auto min-h-[360px]">
          <SortingCanvas values={values} highlightedIndices={highlightedIndices} variant="zen" />
        </div>

        {/* Zen Caption & Telemetry */}
        <div className="pb-24 space-y-2">
          <ZenCaption
            currentStep={currentStep}
            isAtEnd={isAtEnd}
            explanationLevel={explanationLevel}
            stats={currentStep?.stats}
            onReplay={play}
            onExitZen={exitZen}
          />

          {showStats && currentStep?.stats && (
            <p className="font-mono text-xs text-ink-faint text-center tabular-nums">
              Comparisons {currentStep.stats.comparisons ?? 0} &bull; Swaps {currentStep.stats.swaps ?? 0} &bull;
              Accesses {currentStep.stats.arrayAccesses ?? 0}
            </p>
          )}
        </div>

        {/* Zen Floating Dock */}
        <ZenDock
          controlsVisible={controlsVisible}
          isPlaying={isPlaying}
          isAtStart={isAtStart}
          isAtEnd={isAtEnd}
          currentStepIndex={currentStepIndex}
          totalSteps={steps.length}
          speed={speed}
          onTogglePlay={togglePlay}
          onStepForward={stepForward}
          onStepBackward={stepBackward}
          onReset={reset}
          onGoToStep={goToStep}
          onSetSpeed={setSpeed}
          onTogglePseudocode={() => setShowPseudocodeSheet(true)}
          onToggleTechnical={() => setExplanationLevel((prev) => (prev === 'beginner' ? 'technical' : 'beginner'))}
          onToggleStats={() => setShowStats((prev) => !prev)}
          onToggleShortcuts={() => setShowShortcuts(true)}
          onExitZen={exitZen}
        />

        {/* Zen Pseudocode Side Sheet */}
        <ZenPseudocodeSheet
          open={showPseudocodeSheet}
          onClose={() => setShowPseudocodeSheet(false)}
          pseudocode={algorithm.pseudocode}
          activeLine={activeLine}
        />

        {/* Zen Shortcuts Modal */}
        <ZenShortcutsOverlay open={showShortcuts} onClose={() => setShowShortcuts(false)} />
      </div>
    )
  }

  // ================= STANDARD LAYOUT (isZen === false) =================
  return (
    <div className="space-y-6 pb-12">
      {/* Back Link */}
      <div className="flex items-center gap-2">
        <Link
          to={ROUTES.ALGORITHMS}
          className="inline-flex items-center gap-1.5 text-caption font-medium text-ink-muted hover:text-ink transition-colors focus-ring rounded"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Algorithms</span>
        </Link>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols on XL): Header, Canvas, Playback Controls */}
        <div className="xl:col-span-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="chip text-accent font-semibold text-micro uppercase tracking-wider">
                  {algorithm.category}
                </span>
                <span className="chip font-mono text-micro">Best: {algorithm.complexity.best}</span>
                <span className="chip font-mono text-micro">Avg: {algorithm.complexity.average}</span>
                <span className="chip font-mono text-micro">Worst: {algorithm.complexity.worst}</span>
                <span className="chip font-mono text-micro">Space: {algorithm.complexity.space}</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-h1 font-display font-semibold text-ink">{algorithm.name}</h1>
                <button
                  type="button"
                  onClick={toggleZen}
                  title="Enter Zen Mode (Z)"
                  className="btn-ghost border border-line px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 text-ink-muted hover:text-ink focus-ring"
                >
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span>{LABELS.ZEN_MODE}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-body text-ink-muted leading-relaxed">{algorithm.description}</p>
          {progressError && (
            <p className="text-caption font-medium text-state-swap" role="status">
              {progressError}
            </p>
          )}

          {/* Interactive Sorting / Searching Stage */}
          <SortingCanvas values={values} highlightedIndices={highlightedIndices} variant="default" />

          {/* Playback Controls Toolbar */}
          <PlaybackControls
            isPlaying={isPlaying}
            isAtStart={isAtStart}
            isAtEnd={isAtEnd}
            currentStepIndex={currentStepIndex}
            totalSteps={steps.length}
            speed={speed}
            onTogglePlay={togglePlay}
            onStepForward={stepForward}
            onStepBackward={stepBackward}
            onReset={reset}
            onGoToStep={goToStep}
            onSetSpeed={setSpeed}
            onGenerateRandom={handleGenerateRandom}
            variant="bar"
          />
        </div>

        {/* Right Column (4 cols on XL, sticky top-20): Explanation & Pseudocode Panels */}
        <div className="xl:col-span-4 space-y-6 xl:sticky xl:top-20">
          <ExplanationPanel currentStep={currentStep} explanationLevel={explanationLevel} />

          <PseudocodePanel pseudocode={algorithm.pseudocode} activeLine={activeLine} variant="card" />
        </div>
      </div>

      {/* Zen Shortcuts Modal */}
      <ZenShortcutsOverlay open={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  )
}
