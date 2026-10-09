import { useEffect, useMemo, useState } from 'react'
import { Pause, Play, RotateCcw, SkipBack, SkipForward, Shuffle, Trophy, Zap } from 'lucide-react'
import { ALGORITHMS } from '../data/algorithmsData'
import { generateSortingSteps } from '../engine/sortingGenerators'
import SortingCanvas from '../components/visualizer/SortingCanvas'

const SORTING_ALGORITHMS = ALGORITHMS.filter((algorithm) => algorithm.category === 'Sorting')
const DEFAULT_ALGORITHM_IDS = ['bubble-sort', 'insertion-sort', 'quick-sort']
const DEFAULT_INPUT = [44, 27, 89, 15, 62, 38, 71, 10]
const MAX_INPUT_SIZE = 12
const SPEEDS = [
  { label: '0.5x', delay: 800 },
  { label: '1x', delay: 400 },
  { label: '2x', delay: 200 },
  { label: '4x', delay: 100 },
]

function readStats(steps, index) {
  const stats = steps[Math.min(index, steps.length - 1)]?.stats
  return {
    comparisons: stats?.comparisons ?? 0,
    swaps: stats?.swaps ?? 0,
  }
}

export default function RaceModePage() {
  const [algorithmIds, setAlgorithmIds] = useState(DEFAULT_ALGORITHM_IDS)
  const [inputText, setInputText] = useState(DEFAULT_INPUT.join(', '))
  const [inputValues, setInputValues] = useState(DEFAULT_INPUT)
  const [inputError, setInputError] = useState('')
  const [raceIndex, setRaceIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(400)

  const racers = useMemo(
    () => algorithmIds.map((id) => {
      const algorithm = SORTING_ALGORITHMS.find((item) => item.id === id)
      return {
        algorithm,
        steps: generateSortingSteps(id, inputValues),
      }
    }),
    [algorithmIds, inputValues],
  )
  const longestRace = Math.max(1, ...racers.map((racer) => racer.steps.length))
  const maxRaceIndex = longestRace - 1
  const isAtStart = raceIndex === 0
  const isAtEnd = raceIndex >= maxRaceIndex
  const totalComparisons = racers.reduce(
    (total, racer) => total + readStats(racer.steps, raceIndex).comparisons,
    0,
  )
  const results = racers.map((racer) => ({
    ...racer,
    ...readStats(racer.steps, racer.steps.length - 1),
  }))
  const winner = results.reduce((best, result) =>
    !best || result.steps.length < best.steps.length ? result : best, null)

  useEffect(() => {
    if (!isPlaying) return undefined
    const timer = window.setInterval(() => {
      if (raceIndex >= maxRaceIndex) {
        setIsPlaying(false)
        return
      }
      setRaceIndex(raceIndex + 1)
      if (raceIndex + 1 >= maxRaceIndex) setIsPlaying(false)
    }, speed)
    return () => window.clearInterval(timer)
  }, [isPlaying, maxRaceIndex, raceIndex, speed])

  const toggleAlgorithm = (algorithmId) => {
    setAlgorithmIds((current) => {
      if (current.includes(algorithmId)) {
        if (current.length <= 2) return current
        return current.filter((id) => id !== algorithmId)
      }
      if (current.length >= 4) return current
      return [...current, algorithmId]
    })
    setRaceIndex(0)
    setIsPlaying(false)
  }

  const applyInput = (value) => {
    setInputText(value)
    const parts = value.split(',').map((part) => part.trim())
    const parsed = parts.map((part) => Number(part))
    if (
      !value.trim() ||
      parts.length < 2 ||
      parts.length > MAX_INPUT_SIZE ||
      parsed.some((number, index) => !parts[index] || !Number.isInteger(number) || number < 1 || number > 999)
    ) {
      setInputError(`Enter 2–${MAX_INPUT_SIZE} whole numbers from 1 to 999, separated by commas.`)
      setIsPlaying(false)
      setRaceIndex(0)
      return
    }
    setInputError('')
    setInputValues(parsed)
    setRaceIndex(0)
    setIsPlaying(false)
  }

  const randomizeInput = () => {
    const count = Math.floor(Math.random() * 6) + 6
    const values = Array.from({ length: count }, () => Math.floor(Math.random() * 99) + 1)
    setInputText(values.join(', '))
    setInputValues(values)
    setInputError('')
    setRaceIndex(0)
    setIsPlaying(false)
  }

  const resetRace = () => {
    setIsPlaying(false)
    setRaceIndex(0)
  }

  const advance = (amount) => {
    setIsPlaying(false)
    setRaceIndex((index) => Math.max(0, Math.min(index + amount, maxRaceIndex)))
  }

  return (
    <div className="space-y-6 pb-10">
      <header>
        <span className="chip text-accent font-semibold text-micro uppercase tracking-wider">
          Performance Benchmarking
        </span>
        <h1 className="text-h1 font-display font-semibold text-ink mt-2">
          Race Mode: Side-by-Side Comparison
        </h1>
        <p className="text-body text-ink-muted text-pretty max-w-[68ch] mt-1">
          Race two to four sorting algorithms on the same input with synchronized playback and live comparisons.
        </p>
      </header>

      <section className="card p-5 space-y-5" aria-labelledby="race-setup-heading">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="race-setup-heading" className="text-h3 font-semibold text-ink">Race setup</h2>
          <span className="text-caption text-ink-muted">{algorithmIds.length} of 4 algorithms selected</span>
        </div>
        <fieldset>
          <legend className="text-caption font-semibold text-ink-muted mb-3">Choose 2–4 sorting algorithms</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {SORTING_ALGORITHMS.map((algorithm) => {
              const checked = algorithmIds.includes(algorithm.id)
              const disabled = (!checked && algorithmIds.length >= 4) || (checked && algorithmIds.length <= 2)
              return (
                <label
                  key={algorithm.id}
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 text-caption ${
                    checked ? 'border-accent bg-accent-soft text-ink' : 'border-line text-ink-muted'
                  } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleAlgorithm(algorithm.id)}
                    aria-label={algorithm.name}
                    className="accent-accent"
                  />
                  {algorithm.name}
                </label>
              )
            })}
          </div>
        </fieldset>
        <div className="space-y-2">
          <label htmlFor="race-input" className="block text-caption font-semibold text-ink-muted">
            Shared input (comma-separated numbers)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="race-input"
              value={inputText}
              onChange={(event) => applyInput(event.target.value)}
              aria-invalid={Boolean(inputError)}
              aria-describedby={inputError ? 'race-input-error' : undefined}
              className="h-11 min-w-0 flex-1 rounded-md border border-line-strong bg-surface px-3 font-mono text-body text-ink focus-ring"
            />
            <button
              type="button"
              onClick={randomizeInput}
              className="btn-ghost inline-flex min-h-11 items-center justify-center gap-2 border border-line px-3 text-caption font-semibold text-ink focus-ring"
            >
              <Shuffle className="h-4 w-4" />
              Randomize input
            </button>
          </div>
          {inputError && <p id="race-input-error" className="text-caption text-state-swap" role="alert">{inputError}</p>}
          {!inputError && (
            <p className="text-micro text-ink-faint">All racers use this identical {inputValues.length}-value input.</p>
          )}
        </div>
      </section>

      <section className="card p-4 md:p-5 space-y-4" aria-label="Synchronized race controls">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button type="button" onClick={resetRace} disabled={isAtStart && !isPlaying} aria-label="Reset race"
              className="btn-ghost flex h-10 w-10 items-center justify-center border border-line rounded-md disabled:opacity-40 focus-ring">
              <RotateCcw className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => advance(-1)} disabled={isAtStart} aria-label="Step race backward"
              className="btn-ghost flex h-10 w-10 items-center justify-center border border-line rounded-md disabled:opacity-40 focus-ring">
              <SkipBack className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => {
              if (isPlaying) setIsPlaying(false)
              else {
                if (isAtEnd) setRaceIndex(0)
                setIsPlaying(true)
              }
            }} disabled={Boolean(inputError)} aria-label={isPlaying ? 'Pause race' : 'Start race'}
              className="btn-primary inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 focus-ring">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'Pause' : isAtEnd ? 'Replay race' : 'Start race'}
            </button>
            <button type="button" onClick={() => advance(1)} disabled={isAtEnd || Boolean(inputError)} aria-label="Step race forward"
              className="btn-ghost flex h-10 w-10 items-center justify-center border border-line rounded-md disabled:opacity-40 focus-ring">
              <SkipForward className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-micro font-semibold uppercase text-ink-faint">Speed</span>
            <div className="segmented" role="radiogroup" aria-label="Race speed">
              {SPEEDS.map((option) => (
                <button key={option.label} type="button" role="radio"
                  aria-checked={speed === option.delay}
                  onClick={() => setSpeed(option.delay)}
                  className={`segmented-option min-h-9 min-w-10 text-xs font-mono focus-ring ${speed === option.delay ? 'selected' : ''}`}>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label htmlFor="race-timeline" className="sr-only">Race timeline</label>
          <input id="race-timeline" type="range" min="0" max={maxRaceIndex} value={raceIndex}
            disabled={Boolean(inputError)}
            onChange={(event) => {
              setIsPlaying(false)
              setRaceIndex(Number(event.target.value))
            }}
            aria-valuetext={`Race step ${raceIndex + 1} of ${longestRace}`}
            className="w-full accent-accent focus-ring" />
          <span className="whitespace-nowrap font-mono text-caption tabular-nums text-ink-muted">
            Tick {raceIndex + 1} / {longestRace}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
          <p className="text-caption text-ink-muted">
            Live comparisons <strong aria-label="Live total comparisons" className="font-mono text-h3 text-accent tabular-nums" aria-live="polite">{totalComparisons}</strong>
          </p>
          {isAtEnd && <span className="chip border-emerald-300 bg-emerald-50 text-emerald-800 text-caption font-semibold">Race finished</span>}
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4" aria-label="Algorithm race lanes">
        {racers.map(({ algorithm, steps }) => {
          const step = steps[Math.min(raceIndex, steps.length - 1)]
          const stats = readStats(steps, raceIndex)
          return (
            <article key={algorithm.id} className="card min-w-0 p-4 space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-h3 font-display font-semibold text-ink">{algorithm.name}</h2>
                <span className="font-mono text-caption text-ink-muted tabular-nums">
                  Step {Math.min(raceIndex + 1, steps.length)} / {steps.length}
                </span>
              </div>
              <SortingCanvas values={step.values} highlightedIndices={step.highlightedIndices} />
              <div className="grid grid-cols-2 gap-3 text-caption">
                <p className="rounded-md bg-sunken p-3 text-ink-muted">Comparisons <strong className="font-mono text-ink tabular-nums">{stats.comparisons}</strong></p>
                <p className="rounded-md bg-sunken p-3 text-ink-muted">Swaps <strong className="font-mono text-ink tabular-nums">{stats.swaps}</strong></p>
              </div>
            </article>
          )
        })}
      </section>

      <section className="card p-5 space-y-4" aria-labelledby="race-results-heading">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-accent" />
          <h2 id="race-results-heading" className="text-h3 font-semibold text-ink">
            {isAtEnd ? 'Race results' : 'Results summary'}
          </h2>
        </div>
        <p className="text-caption text-ink-muted">
          {isAtEnd
            ? `${winner.algorithm.name} finished in the fewest visualization steps.`
            : 'Final run totals are calculated from each complete trace; finish the race to complete the comparison.'}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-caption">
            <thead className="border-b border-line text-micro uppercase text-ink-faint">
              <tr>
                <th className="py-2 pr-3">Algorithm</th>
                <th className="py-2 pr-3">Steps</th>
                <th className="py-2 pr-3">Comparisons</th>
                <th className="py-2">Swaps</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.algorithm.id} className="border-b border-line last:border-0">
                  <th scope="row" className="py-3 pr-3 font-semibold text-ink">
                    {result.algorithm.name}
                    {isAtEnd && result.algorithm.id === winner.algorithm.id && (
                      <span className="ml-2 inline-flex items-center gap-1 text-accent"><Zap className="h-3 w-3" /> Fastest</span>
                    )}
                  </th>
                  <td className="py-3 pr-3 font-mono tabular-nums">{result.steps.length}</td>
                  <td className="py-3 pr-3 font-mono tabular-nums">{result.comparisons}</td>
                  <td className="py-3 font-mono tabular-nums">{result.swaps}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
