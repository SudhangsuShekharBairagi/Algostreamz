import { useState, useMemo, useCallback, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { Sparkles, ArrowLeft, Copy, ImageDown } from 'lucide-react'
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
import TreeVisualizer from '../components/visualizer/TreeVisualizer'
import NotFoundPage from './NotFoundPage'
import { createVisualizerSearch, parseVisualizerSearch } from '../utils/shareableVisualizer'
import { CODE_SNIPPETS } from '../data/codeSnippets'
import useVisualizerAudio from '../hooks/useVisualizerAudio'
import { exportVisualizerImage } from '../utils/exportVisualizerImage'
import CallStackPanel from '../components/visualizer/CallStackPanel'
import { getCallStackAtStep } from '../utils/callStack'

function StandardArrayVisualizer({ algorithm }) {
  const { isZen, toggleZen, exitZen, controlsVisible, announceMessage } = useZen()
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [progressError, setProgressError] = useState('')

  // Local Zen toggle states for overlay elements
  const [showPseudocodeSheet, setShowPseudocodeSheet] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [explanationLevel, setExplanationLevel] = useState('beginner')

  // Dataset state management
  const getDefaultDataset = () => {
    if (!algorithm) return [44, 27, 89, 15, 62, 38, 71, 10]
    if (Array.isArray(algorithm.defaultInput)) {
      return algorithm.defaultInput
    }
    if (algorithm.defaultInput && Array.isArray(algorithm.defaultInput.array)) {
      return algorithm.defaultInput.array
    }
    return [44, 27, 89, 15, 62, 38, 71, 10]
  }

  const defaultDataset = getDefaultDataset()
  const defaultTarget = algorithm?.defaultInput?.target ?? 60
  const [initialShareState] = useState(() => parseVisualizerSearch(searchParams, {
    defaultInput: defaultDataset,
    defaultTarget,
  }))
  const [dataset, setDataset] = useState(() => initialShareState.input)

  const [searchTarget, setSearchTarget] = useState(() => initialShareState.target)

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
  const visualizer = useVisualizer(steps, { initialSpeed: initialShareState.speed })

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
  const { soundEnabled, soundSuppressed, toggleSound } = useVisualizerAudio(currentStep)
  const handleExportImage = useCallback(async () => {
    try {
      await exportVisualizerImage({
        algorithmName: algorithm.name,
        values: currentStep?.values ?? dataset,
        highlightedIndices: currentStep?.highlightedIndices ?? {},
      })
      showToast('Current visualization exported as PNG', 'success', isZen)
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to export the visualization', 'error', isZen)
    }
  }, [algorithm.name, currentStep, dataset, isZen, showToast])
  const [urlReady, setUrlReady] = useState(false)

  useEffect(() => {
    goToStep(initialShareState.step)
    setUrlReady(true)
  }, [goToStep, initialShareState])

  useEffect(() => {
    if (!urlReady) return
    const nextParams = createVisualizerSearch({
      input: dataset,
      speed,
      step: currentStepIndex,
      target: searchTarget,
      includeTarget: algorithm.category === 'Searching',
    })
    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true })
    }
  }, [
    algorithm.category,
    currentStepIndex,
    dataset,
    searchParams,
    searchTarget,
    setSearchParams,
    speed,
    urlReady,
  ])

  const handleCopyLink = useCallback(async () => {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard access is unavailable in this browser.')
      }
      await navigator.clipboard.writeText(window.location.href)
      showToast('Shareable link copied', 'success', isZen)
    } catch {
      showToast('Unable to copy the shareable link', 'error', isZen)
    }
  }, [isZen, showToast])

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
    onToggleSound: toggleSound,
    onExportImage: handleExportImage,
    isZen,
    enabled: true,
  })

  const values = currentStep?.values || dataset
  const highlightedIndices = currentStep?.highlightedIndices || {}
  const activeLine = currentStep?.pseudocodeLine || 1
  const callStack = useMemo(
    () => getCallStackAtStep(steps, currentStepIndex),
    [currentStepIndex, steps],
  )
  const hasCallStack = ['merge-sort', 'quick-sort'].includes(algorithm.id)

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
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {algorithm.name}. Step {currentStepIndex + 1} of {steps.length}. {currentStep?.explanation?.beginner ?? ''}
        </p>

        {/* Header Line */}
        <div className="pt-4 text-center space-y-1">
          <h1 className="font-display text-lg md:text-xl font-semibold text-ink-muted">{algorithm.name}</h1>
          <p className="font-mono text-xs text-ink-faint tabular-nums">
            Step {currentStepIndex + 1} / {steps.length}
          </p>
          <button
            type="button"
            onClick={handleCopyLink}
            className="btn-ghost inline-flex items-center gap-1.5 border border-line px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink focus-ring"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy link
          </button>
          <button
            type="button"
            onClick={handleExportImage}
            className="btn-ghost inline-flex items-center gap-1.5 border border-line px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink focus-ring"
          >
            <ImageDown className="w-3.5 h-3.5" />
            Export PNG
          </button>
        </div>
        {hasCallStack && (
          <div className="fixed top-24 right-4 z-20 w-72 max-w-[calc(100vw-2rem)]">
            <CallStackPanel {...callStack} variant="flat" />
          </div>
        )}

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
          soundEnabled={soundEnabled}
          soundSuppressed={soundSuppressed}
          onToggleSound={toggleSound}
          onExitZen={exitZen}
        />

        {/* Zen Pseudocode Side Sheet */}
        <ZenPseudocodeSheet
          open={showPseudocodeSheet}
          onClose={() => setShowPseudocodeSheet(false)}
          pseudocode={algorithm.pseudocode}
          activeLine={activeLine}
          codeSnippets={CODE_SNIPPETS[algorithm.id]}
        />

        {/* Zen Shortcuts Modal */}
        <ZenShortcutsOverlay open={showShortcuts} onClose={() => setShowShortcuts(false)} />
      </div>
    )
  }

  // ================= STANDARD LAYOUT (isZen === false) =================
  return (
    <div className="space-y-4 pb-8">
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
      <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-12 xl:gap-5">
        {/* Left Column (8 cols on XL): Header, Canvas, Playback Controls */}
        <div className="min-w-0 space-y-4 xl:col-span-8">
          {/* Header */}
          <div className="flex flex-col gap-3 border-b border-line pb-3 sm:flex-row sm:items-center sm:justify-between">
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
              <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-h1 font-display font-semibold text-ink">{algorithm.name}</h1>
                <button
                  type="button"
                  onClick={handleExportImage}
                  className="btn-ghost border border-line px-3 py-1.5 text-xs font-medium inline-flex items-center gap-1.5 text-ink-muted hover:text-ink focus-ring"
                  aria-label="Export current visualization as PNG"
                >
                  <ImageDown className="w-3.5 h-3.5" />
                  Export PNG
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="btn-ghost border border-line px-3 py-1.5 text-xs font-medium inline-flex items-center gap-1.5 text-ink-muted hover:text-ink focus-ring"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy link
                </button>
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
          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {algorithm.name}. Step {currentStepIndex + 1} of {steps.length}. {currentStep?.explanation?.beginner ?? ''}
          </p>

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
            soundEnabled={soundEnabled}
            soundSuppressed={soundSuppressed}
            onToggleSound={toggleSound}
            variant="bar"
          />
        </div>

        {/* Right Column: explanation and telemetry */}
        <div className="min-w-0 space-y-4 xl:col-span-4">
          {hasCallStack && <CallStackPanel {...callStack} />}
          <ExplanationPanel currentStep={currentStep} explanationLevel={explanationLevel} />
        </div>
      </div>

      <PseudocodePanel
        pseudocode={algorithm.pseudocode}
        activeLine={activeLine}
        variant="card"
        codeSnippets={CODE_SNIPPETS[algorithm.id]}
      />

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

  if (algorithm.id === 'binary-search-tree') {
    return <TreeVisualizer key={algorithm.id} algorithm={algorithm} />
  }

  if (algorithm.category === 'Data Structures') {
    return <StructureVisualizer key={algorithm.id} algorithm={algorithm} />
  }

  if (algorithm.category === 'Graphs' || ['bfs', 'dfs', 'dijkstra'].includes(algorithm.id)) {
    return <GraphVisualizer key={algorithm.id} algorithm={algorithm} />
  }

  return <StandardArrayVisualizer key={algorithm.id} algorithm={algorithm} />
}
