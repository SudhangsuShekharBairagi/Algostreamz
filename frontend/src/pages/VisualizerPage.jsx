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
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useToast } from '../context/ToastContext'
import CustomArrayModal from '../components/visualizer/CustomArrayModal'
import StructureVisualizer from '../components/visualizers/structures/StructureVisualizer'
import GraphVisualizer from '../components/visualizer/GraphVisualizer'
import NotFoundPage from './NotFoundPage'

function StandardArrayVisualizer({ algorithm }) {
  const { isZen, toggleZen, exitZen, controlsVisible, announceMessage } = useZen()
  const { showToast } = useToast()
  const [progressError, setProgressError] = useState('')

  // Local Zen toggle states for overlay elements
  const [showPseudocodeSheet, setShowPseudocodeSheet] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showCustomModal, setShowCustomModal] = useState(false)
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
    showToast(`Generated random dataset (${newArr.length} elements)`, 'info', isZen)
  }, [algorithm, loadSteps, showToast, isZen])

  // Custom Dataset Input Apply Handler
  const handleApplyCustomInput = useCallback(
    (newArray, newTarget) => {
      setDataset(newArray)
      let newSteps = []
      if (algorithm?.category === 'Searching') {
        const target = newTarget !== undefined ? newTarget : searchTarget
        setSearchTarget(target)
        newSteps = generateSearchingSteps(algorithm.id, newArray, target)
      } else {
        newSteps = generateSortingSteps(algorithm?.id || 'bubble-sort', newArray)
      }
      loadSteps(newSteps)
    },
    [algorithm, searchTarget, loadSteps]
  )

  // Centralized Global Keyboard Shortcuts
  useKeyboardShortcuts({
    onTogglePlay: togglePlay,
    onStepForward: stepForward,
    onStepBackward: stepBackward,
    onReset: reset,
    onSpeedUp: () => setSpeed((s) => Math.max(100, s - 100)),
    onSlowDown: () => setSpeed((s) => Math.min(1000, s + 100)),
    onToggleZen: toggleZen,
    onEscape: () => {
      if (showCustomModal) setShowCustomModal(false)
      else if (showShortcuts) setShowShortcuts(false)
      else if (showPseudocodeSheet) setShowPseudocodeSheet(false)
      else if (isZen) exitZen()
    },
    onTogglePseudocode: () => setShowPseudocodeSheet((prev) => !prev),
    onToggleTechnical: () => setExplanationLevel((prev) => (prev === 'beginner' ? 'technical' : 'beginner')),
    onToggleStats: () => setShowStats((prev) => !prev),
    onToggleFullscreen: () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {})
      } else {
        document.exitFullscreen?.().catch(() => {})
      }
    },
    onToggleShortcuts: () => setShowShortcuts((prev) => !prev),
    isZen,
    enabled: true,
  })

  const values = currentStep?.values || dataset
  const highlightedIndices = currentStep?.highlightedIndices || {}
  const activeLine = currentStep?.pseudocodeLine || 1

  // ================= ZEN LAYOUT (isZen === true) =================
  if (isZen) {
    return (
      <div
        className={`fixed inset-0 min-h-dvh bg-zen-canvas p-4 md:p-8 flex flex-col justify-between relative select-none z-30 transition-all duration-300 ${
          isAtEnd ? 'overflow-y-auto pb-40 scroll-smooth' : 'overflow-hidden pb-20'
        }`}
      >
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
            onOpenCustomInput={() => setShowCustomModal(true)}
            onToggleShortcuts={() => setShowShortcuts(true)}
            variant="bar"
          />
        </div>

        {/* Right Column (4 cols on XL, sticky top-20): Explanation & Pseudocode Panels */}
        <div className="xl:col-span-4 space-y-6 xl:sticky xl:top-20">
          <ExplanationPanel currentStep={currentStep} explanationLevel={explanationLevel} />

          <PseudocodePanel pseudocode={algorithm.pseudocode} activeLine={activeLine} variant="card" />
        </div>
      </div>

      {/* Custom Array Input Modal */}
      <CustomArrayModal
        open={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        currentDataset={dataset}
        currentTarget={searchTarget}
        isSearching={algorithm.category === 'Searching'}
        onApply={handleApplyCustomInput}
        isZen={isZen}
      />

      {/* Keyboard Shortcuts Modal */}
      <ZenShortcutsOverlay open={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  )
}

export default function VisualizerPage() {
  const { algorithmId = 'bubble-sort' } = useParams()
  const algorithm = getAlgorithmById(algorithmId)

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

  if (algorithm.category === 'Graphs' || ['bfs', 'dfs', 'dijkstra'].includes(algorithm.id)) {
    return <GraphVisualizer key={algorithm.id} algorithm={algorithm} />
  }

  return <StandardArrayVisualizer algorithm={algorithm} />
}
