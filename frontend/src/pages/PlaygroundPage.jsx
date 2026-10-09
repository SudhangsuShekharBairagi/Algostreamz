import { useMemo, useState } from 'react'
import { Code, Play, Save, Trash2 } from 'lucide-react'
import { ALGORITHMS } from '../data/algorithmsData'
import { generateSortingSteps } from '../engine/sortingGenerators'
import { generateSearchingSteps } from '../engine/searchingGenerators'
import { useVisualizer } from '../hooks/useVisualizer'
import SortingCanvas from '../components/visualizer/SortingCanvas'
import PlaybackControls from '../components/visualizer/PlaybackControls'

const PLAYGROUND_ALGORITHMS = ALGORITHMS.filter(
  (algorithm) => algorithm.category === 'Sorting' || algorithm.category === 'Searching',
)
const PRESETS_KEY = 'algostreamz.playground.presets.v1'
const INITIAL_VALUES = [44, 27, 89, 15, 62, 38, 71, 10]
const MAX_VALUES = 100
const INPUT_PATTERNS = ['typed', 'random', 'nearly-sorted', 'reversed', 'duplicates']

function parsePresetStorage() {
  const saved = localStorage.getItem(PRESETS_KEY)
  if (!saved) return []
  const presets = JSON.parse(saved)
  if (!Array.isArray(presets) || presets.some((preset) =>
    typeof preset.name !== 'string' ||
    !PLAYGROUND_ALGORITHMS.some((algorithm) => algorithm.id === preset.algorithmId) ||
    !Array.isArray(preset.values) ||
    !preset.values.every((value) => Number.isInteger(value)) ||
    !Number.isFinite(preset.target)
  )) {
    throw new Error('Saved playground presets are invalid.')
  }
  return presets
}

function makeValues(pattern, currentValues) {
  if (pattern === 'typed') return currentValues
  const size = Math.max(2, Math.min(currentValues.length || 8, MAX_VALUES))
  if (pattern === 'random') {
    return Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1)
  }
  if (pattern === 'nearly-sorted') {
    const values = Array.from({ length: size }, (_, index) => (index + 1) * 3)
    for (let swap = 0; swap < Math.max(1, Math.floor(size / 10)); swap++) {
      const index = Math.floor(Math.random() * (size - 1))
      ;[values[index], values[index + 1]] = [values[index + 1], values[index]]
    }
    return values
  }
  if (pattern === 'reversed') {
    return Array.from({ length: size }, (_, index) => (size - index) * 3)
  }
  const pool = [5, 10, 15, 20]
  return Array.from({ length: size }, () => pool[Math.floor(Math.random() * pool.length)])
}

export default function PlaygroundPage() {
  const [algorithmId, setAlgorithmId] = useState('bubble-sort')
  const [pattern, setPattern] = useState('typed')
  const [values, setValues] = useState(INITIAL_VALUES)
  const [inputText, setInputText] = useState(INITIAL_VALUES.join(', '))
  const [target, setTarget] = useState(62)
  const [inputError, setInputError] = useState('')
  const [presetName, setPresetName] = useState('')
  const [selectedPreset, setSelectedPreset] = useState('')
  const [presets, setPresets] = useState(() => {
    try {
      return parsePresetStorage()
    } catch {
      return []
    }
  })
  const [presetError, setPresetError] = useState(() => {
    try {
      parsePresetStorage()
      return ''
    } catch (error) {
      return error instanceof Error ? error.message : 'Unable to read saved presets.'
    }
  })

  const algorithm = PLAYGROUND_ALGORITHMS.find((item) => item.id === algorithmId)
  const steps = useMemo(() => algorithm.category === 'Sorting'
    ? generateSortingSteps(algorithmId, values)
    : generateSearchingSteps(algorithmId, values, target), [algorithm.category, algorithmId, target, values])
  const visualizer = useVisualizer(steps)
  const currentStep = visualizer.currentStep
  const finalStats = steps.at(-1)?.stats ?? {}

  const applyTypedInput = (text) => {
    setInputText(text)
    const parts = text.split(',').map((part) => part.trim())
    const parsed = parts.map(Number)
    if (
      parts.length < 2 ||
      parts.length > MAX_VALUES ||
      parts.some((part, index) => !part || !Number.isInteger(parsed[index]) || parsed[index] < 1 || parsed[index] > 999)
    ) {
      setInputError(`Enter 2–${MAX_VALUES} whole numbers from 1 to 999, separated by commas.`)
      return
    }
    setInputError('')
    setValues(parsed)
    setPattern('typed')
  }

  const choosePattern = (nextPattern) => {
    const nextValues = makeValues(nextPattern, values)
    setPattern(nextPattern)
    setValues(nextValues)
    setInputText(nextValues.join(', '))
    setInputError('')
  }

  const savePreset = () => {
    const name = presetName.trim()
    if (!name) {
      setPresetError('Enter a name for this preset.')
      return
    }
    const nextPresets = [
      ...presets.filter((preset) => preset.name.toLowerCase() !== name.toLowerCase()),
      { name, algorithmId, values, target },
    ].sort((left, right) => left.name.localeCompare(right.name))
    try {
      localStorage.setItem(PRESETS_KEY, JSON.stringify(nextPresets))
      setPresets(nextPresets)
      setSelectedPreset(name)
      setPresetName('')
      setPresetError('')
    } catch (error) {
      setPresetError(error instanceof Error ? error.message : 'Unable to save this preset.')
    }
  }

  const loadPreset = () => {
    try {
      const latest = parsePresetStorage()
      setPresets(latest)
      const preset = latest.find((item) => item.name === selectedPreset)
      if (!preset) throw new Error('Select a saved preset to load.')
      setAlgorithmId(preset.algorithmId)
      setValues(preset.values)
      setInputText(preset.values.join(', '))
      setTarget(preset.target)
      setPattern('typed')
      setInputError('')
      setPresetError('')
    } catch (error) {
      setPresetError(error instanceof Error ? error.message : 'Unable to load this preset.')
    }
  }

  const deletePreset = () => {
    try {
      const nextPresets = parsePresetStorage().filter((preset) => preset.name !== selectedPreset)
      localStorage.setItem(PRESETS_KEY, JSON.stringify(nextPresets))
      setPresets(nextPresets)
      setSelectedPreset('')
      setPresetError('')
    } catch (error) {
      setPresetError(error instanceof Error ? error.message : 'Unable to delete this preset.')
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <header>
        <span className="chip text-accent font-semibold text-micro uppercase tracking-wider">Custom Playground</span>
        <h1 className="text-h1 font-display font-semibold text-ink mt-2">Algorithm Sandbox &amp; Input Editor</h1>
        <p className="text-body text-ink-muted text-pretty max-w-[68ch] mt-1">
          Choose a sorting or searching algorithm, create edge-case inputs, and save reusable local presets.
        </p>
      </header>

      <section className="card p-5 space-y-5" aria-label="Playground setup">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1.5 text-caption font-semibold text-ink-muted">
            <span>Algorithm</span>
            <select value={algorithmId} onChange={(event) => setAlgorithmId(event.target.value)}
              className="h-11 w-full rounded-md border border-line-strong bg-surface px-3 text-body text-ink focus-ring">
              {PLAYGROUND_ALGORITHMS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label className="space-y-1.5 text-caption font-semibold text-ink-muted">
            <span>Input pattern</span>
            <select value={pattern} onChange={(event) => choosePattern(event.target.value)}
              className="h-11 w-full rounded-md border border-line-strong bg-surface px-3 text-body text-ink focus-ring">
              {INPUT_PATTERNS.map((item) => (
                <option key={item} value={item}>
                  {item === 'nearly-sorted' ? 'Nearly sorted' : `${item[0].toUpperCase()}${item.slice(1)}`}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label htmlFor="playground-values" className="block space-y-1.5 text-caption font-semibold text-ink-muted">
          <span>Array values (2–{MAX_VALUES} integers)</span>
          <input id="playground-values" value={inputText} onChange={(event) => applyTypedInput(event.target.value)}
            aria-invalid={Boolean(inputError)} aria-describedby={inputError ? 'playground-input-error' : undefined}
            className="h-11 w-full rounded-md border border-line-strong bg-surface px-3 font-mono text-body text-ink focus-ring" />
        </label>
        {inputError && <p id="playground-input-error" className="text-caption text-state-swap" role="alert">{inputError}</p>}
        {algorithm.category === 'Searching' && (
          <label className="block max-w-xs space-y-1.5 text-caption font-semibold text-ink-muted">
            <span>Search target</span>
            <input type="number" value={target} onChange={(event) => setTarget(Number(event.target.value))}
              className="h-11 w-full rounded-md border border-line-strong bg-surface px-3 font-mono text-body text-ink focus-ring" />
          </label>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 border-t border-line pt-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <label className="sr-only" htmlFor="preset-name">Preset name</label>
            <input id="preset-name" value={presetName} onChange={(event) => setPresetName(event.target.value)}
              placeholder="Name this setup" maxLength={60}
              className="h-10 min-w-0 flex-1 rounded-md border border-line-strong bg-surface px-3 text-caption text-ink focus-ring" />
            <button type="button" onClick={savePreset}
              className="btn-ghost inline-flex min-h-10 items-center justify-center gap-2 border border-line px-3 text-caption font-semibold text-ink focus-ring">
              <Save className="h-4 w-4" /> Save preset
            </button>
          </div>
          <div className="flex gap-2">
            <label className="sr-only" htmlFor="preset-list">Saved presets</label>
            <select id="preset-list" value={selectedPreset} onChange={(event) => setSelectedPreset(event.target.value)}
              className="h-10 min-w-0 flex-1 rounded-md border border-line-strong bg-surface px-2 text-caption text-ink focus-ring">
              <option value="">Saved presets ({presets.length})</option>
              {presets.map((preset) => <option key={preset.name} value={preset.name}>{preset.name}</option>)}
            </select>
            <button type="button" onClick={loadPreset} disabled={!selectedPreset}
              className="btn-ghost min-h-10 border border-line px-3 text-caption font-semibold disabled:opacity-40 focus-ring">Load</button>
            <button type="button" onClick={deletePreset} disabled={!selectedPreset} aria-label="Delete selected preset"
              className="btn-ghost inline-flex min-h-10 items-center border border-line px-3 text-ink-muted disabled:opacity-40 focus-ring">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        {presetError && <p className="text-caption text-state-swap" role="alert">{presetError}</p>}
      </section>

      <section className="space-y-4" aria-label="Algorithm trace">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-h3 font-semibold text-ink">{algorithm.name} trace</h2>
            <p className="text-caption text-ink-muted">{algorithm.description}</p>
          </div>
          <span className="chip font-mono text-caption">Input length: {values.length}</span>
        </div>
        <SortingCanvas values={currentStep?.values ?? values} highlightedIndices={currentStep?.highlightedIndices ?? {}} />
        <PlaybackControls
          isPlaying={visualizer.isPlaying}
          isAtStart={visualizer.isAtStart}
          isAtEnd={visualizer.isAtEnd}
          currentStepIndex={visualizer.currentStepIndex}
          totalSteps={steps.length}
          speed={visualizer.speed}
          onTogglePlay={visualizer.togglePlay}
          onStepForward={visualizer.stepForward}
          onStepBackward={visualizer.stepBackward}
          onReset={visualizer.reset}
          onGoToStep={visualizer.goToStep}
          onSetSpeed={visualizer.setSpeed}
        />
        <div className="card p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-caption font-semibold text-ink">Current step</h3>
            <span className="font-mono text-micro text-ink-muted">
              {visualizer.currentStepIndex + 1} / {steps.length}
            </span>
          </div>
          <p className="text-caption text-ink-muted">
            {currentStep?.explanation?.beginner ?? 'Ready to generate the trace.'}
          </p>
          <p className="font-mono text-micro text-ink-faint">
            Comparisons: {currentStep?.stats?.comparisons ?? 0}
            {' · '}Swaps/writes: {currentStep?.stats?.swaps ?? 0}
          </p>
          {algorithm.category === 'Searching' && (
            <p className="text-micro text-ink-faint">
              Binary Search sorts a copy of the input before tracing; Linear Search keeps the supplied order.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
