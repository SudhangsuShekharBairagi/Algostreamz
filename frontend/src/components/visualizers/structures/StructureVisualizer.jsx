import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES, LABELS } from '../../../config/siteLinks'
import { useZen } from '../../../context/ZenContext'
import {
  generateLinkedListSteps,
  generateQueueSteps,
  generateStackSteps,
  MAX_STRUCTURE_OPERATIONS,
  MAX_STRUCTURE_VALUE_LENGTH,
} from '../../../engine/structureGenerators'
import { useVisualizer } from '../../../hooks/useVisualizer'
import ExplanationPanel from '../../visualizer/ExplanationPanel'
import PlaybackControls from '../../visualizer/PlaybackControls'
import PseudocodePanel from '../../visualizer/PseudocodePanel'
import StructureCanvas from './StructureCanvas'

const GENERATORS = {
  stack: { generate: generateStackSteps, actions: ['push', 'pop', 'peek'] },
  queue: {
    generate: generateQueueSteps,
    actions: ['enqueue', 'dequeue', 'peek'],
  },
  'linked-list': {
    generate: generateLinkedListSteps,
    actions: ['insert-head', 'insert-tail', 'insert-at', 'delete-at', 'search'],
  },
}

const ACTION_LABELS = {
  push: 'Push',
  pop: 'Pop',
  peek: 'Peek',
  enqueue: 'Enqueue',
  dequeue: 'Dequeue',
  'insert-head': 'Insert at head',
  'insert-tail': 'Insert at tail',
  'insert-at': 'Insert at index',
  'delete-at': 'Delete at index',
  search: 'Search',
}

export default function StructureVisualizer({ algorithm }) {
  const structure = algorithm.name
  const config = GENERATORS[algorithm.id]
  const [operations, setOperations] = useState([])
  const [value, setValue] = useState('')
  const [index, setIndex] = useState('')
  const [error, setError] = useState('')
  const { isZen, toggleZen, exitZen, announceMessage } = useZen()

  const steps = useMemo(() => config.generate(operations), [config, operations])
  const visualizer = useVisualizer(steps)
  const {
    currentStepIndex,
    currentStep,
    isPlaying,
    speed,
    isAtStart,
    isAtEnd,
    togglePlay,
    stepForward,
    stepBackward,
    goToStep,
    reset,
    setSpeed,
  } = visualizer

  useEffect(() => {
    goToStep(steps.length - 1)
  }, [steps, goToStep])

  const values = currentStep?.values || []
  const activeLine = currentStep?.pseudocodeLine || 1
  const needsValue = (action) =>
    ['push', 'enqueue', 'insert-head', 'insert-tail', 'insert-at', 'search'].includes(action)
  const needsIndex = (action) => ['insert-at', 'delete-at'].includes(action)

  const runOperation = (action) => {
    const trimmedValue = value.trim()
    if (needsValue(action) && (!trimmedValue || trimmedValue.length > MAX_STRUCTURE_VALUE_LENGTH)) {
      setError(`Enter a value between 1 and ${MAX_STRUCTURE_VALUE_LENGTH} characters.`)
      return
    }
    if (needsIndex(action) && index.trim() === '') {
      setError('Enter a list index.')
      return
    }
    if (operations.length >= MAX_STRUCTURE_OPERATIONS) {
      setError(
        `Operation history is limited to ${MAX_STRUCTURE_OPERATIONS} actions. Reset the page to start a new history.`
      )
      return
    }

    const operation = { action }
    if (needsValue(action)) operation.value = trimmedValue
    if (needsIndex(action)) operation.index = Number(index)
    setOperations((previous) => [...previous, operation])
    setError('')
    if (needsValue(action)) setValue('')
  }

  const clearStructure = () => {
    setOperations([])
    setValue('')
    setIndex('')
    setError('')
  }

  const operationsPanel = (
    <section className="space-y-3 border-y border-line py-4" aria-labelledby="structure-operations-heading">
      <h2 id="structure-operations-heading" className="font-display text-body font-semibold text-ink">
        Operations
      </h2>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1 space-y-1.5 text-caption font-medium text-ink-muted">
          <span>Value</span>
          <input
            type="text"
            value={value}
            maxLength={MAX_STRUCTURE_VALUE_LENGTH}
            onChange={(event) => setValue(event.target.value)}
            aria-label="Value"
            className="h-11 w-full rounded-md border border-line-strong bg-surface px-3 text-body text-ink focus-ring"
          />
        </label>
        {algorithm.id === 'linked-list' && (
          <label className="w-full space-y-1.5 text-caption font-medium text-ink-muted sm:w-32">
            <span>Index</span>
            <input
              type="number"
              min="0"
              step="1"
              value={index}
              onChange={(event) => setIndex(event.target.value)}
              aria-label="List index"
              className="h-11 w-full rounded-md border border-line-strong bg-surface px-3 font-mono text-body text-ink focus-ring"
            />
          </label>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {config.actions.map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => runOperation(action)}
            className="btn-ghost min-h-10 border border-line bg-surface px-3 text-caption font-semibold text-ink hover:border-accent/50 focus-ring"
          >
            {ACTION_LABELS[action]}
          </button>
        ))}
        <button
          type="button"
          onClick={clearStructure}
          disabled={operations.length === 0}
          className="btn-ghost min-h-10 border border-line px-3 text-caption font-semibold text-ink-muted focus-ring disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear structure
        </button>
      </div>
      {error && (
        <p className="text-caption font-medium text-state-swap" role="alert">
          {error}
        </p>
      )}
    </section>
  )

  const playback = (
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
    />
  )

  if (isZen) {
    return (
      <main className="fixed inset-0 z-30 flex min-h-dvh flex-col justify-between overflow-auto bg-zen-canvas p-4 md:p-8">
        {announceMessage && (
          <div className="sr-only" aria-live="polite">
            {announceMessage}
          </div>
        )}
        <header className="flex items-center justify-between gap-4">
          <h1 className="font-display text-h2 font-semibold text-ink">{structure}</h1>
          <button
            type="button"
            onClick={exitZen}
            className="btn-ghost border border-line px-3 py-2 text-caption focus-ring"
          >
            Exit Zen Mode
          </button>
        </header>
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-5 py-6">
          <StructureCanvas
            structure={structure}
            values={values}
            highlightedIndices={currentStep?.highlightedIndices}
            variant="zen"
          />
          <ExplanationPanel currentStep={currentStep} variant="strip" />
          {playback}
        </div>
      </main>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-2">
        <Link
          to={ROUTES.ALGORITHMS}
          className="inline-flex items-center gap-1.5 text-caption font-medium text-ink-muted hover:text-ink focus-ring rounded"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Algorithms</span>
        </Link>
      </div>
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-8">
          <header className="flex flex-col justify-between gap-3 border-b border-line pb-4 sm:flex-row sm:items-center">
            <div>
              <span className="chip text-micro font-semibold uppercase text-accent">{algorithm.category}</span>
              <h1 className="mt-2 font-display text-h1 font-semibold text-ink">{structure}</h1>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="chip font-mono text-micro">Best: {algorithm.complexity.best}</span>
                <span className="chip font-mono text-micro">Avg: {algorithm.complexity.average}</span>
                <span className="chip font-mono text-micro">Worst: {algorithm.complexity.worst}</span>
                <span className="chip font-mono text-micro">Space: {algorithm.complexity.space}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleZen}
              title="Enter Zen Mode (Z)"
              className="btn-ghost inline-flex min-h-10 items-center gap-2 border border-line px-3 text-caption font-medium text-ink-muted focus-ring"
            >
              <Sparkles className="h-4 w-4 text-accent" />
              <span>{LABELS.ZEN_MODE}</span>
            </button>
          </header>
          <p className="text-body leading-relaxed text-ink-muted">{algorithm.description}</p>
          <StructureCanvas structure={structure} values={values} highlightedIndices={currentStep?.highlightedIndices} />
          {operationsPanel}
          {playback}
        </div>
        <aside className="space-y-6 xl:sticky xl:top-20 xl:col-span-4">
          <ExplanationPanel currentStep={currentStep} />
          <PseudocodePanel pseudocode={algorithm.pseudocode} activeLine={activeLine} />
        </aside>
      </div>
    </div>
  )
}
