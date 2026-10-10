import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  Plus,
  Search,
  Trash2,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  ListTree,
  AlertCircle,
  Play,
  Pause,
  SkipBack,
  SkipForward,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES, LABELS } from '../../config/siteLinks'
import { useZen } from '../../context/ZenContext'
import { useVisualizer } from '../../hooks/useVisualizer'
import {
  createDefaultBst,
  calculateTreeLayout,
  generateBstInsertSteps,
  generateBstSearchSteps,
  generateBstDeleteSteps,
  generateBstTraversalSteps,
  BST_PSEUDOCODES,
} from '../../engine/bstGenerators'
import PlaybackControls from './PlaybackControls'
import ExplanationPanel from './ExplanationPanel'
import PseudocodePanel from './PseudocodePanel'
import ZenDock from './ZenDock'
import ZenCaption from './ZenCaption'

/**
 * Interactive SVG-based Binary Search Tree (BST) Visualizer.
 * Supports Insert, Search, Delete, and Traversals (Inorder, Preorder, Postorder, Level-order).
 * Calculates (x, y) coordinates with subtree layout math and animates nodes with CSS transitions.
 */
export default function TreeVisualizer({ algorithm, variant: propVariant }) {
  const { isZen: globalZen, toggleZen, exitZen, announceMessage } = useZen()
  const isZen = propVariant === 'zen' || globalZen

  // Core tree state (Root of current BST)
  const [treeRoot, setTreeRoot] = useState(() => createDefaultBst())
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')
  const [operationType, setOperationType] = useState('inorder')
  const inputRef = useRef(null)

  // Generate initial step sequence (defaults to Inorder traversal)
  const [steps, setSteps] = useState(() => generateBstTraversalSteps(createDefaultBst(), 'inorder'))

  // Shared visualizer engine hook
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
    loadSteps,
  } = visualizer

  // Step snapshots
  const currentTree = currentStep?.tree ?? treeRoot
  const activeNodeId = currentStep?.activeNodeId ?? null
  const visitedOrder = currentStep?.visitedOrder ?? []
  const visitSequenceMap = currentStep?.visitSequenceMap ?? {}
  const nodeStates = currentStep?.nodeStates ?? {}
  const activeLine = currentStep?.pseudocodeLine ?? 1

  // Compute Layout Math (X, Y coordinates and branch links)
  const { nodes, links, viewWidth, viewHeight } = useMemo(
    () => calculateTreeLayout(currentTree, 800, 380, 22),
    [currentTree]
  )

  const focusInput = useCallback(() => {
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus()
    }, 50)
  }, [])

  // Update tree root snapshot when an insert or delete operation step reaches completion
  useEffect(() => {
    if (isAtEnd && currentStep?.tree) {
      setTreeRoot(currentStep.tree)
    }
  }, [isAtEnd, currentStep])

  // --- OPERATIONS ---
  const handleInsert = (e) => {
    if (e) e.preventDefault()
    const val = inputValue.trim()
    if (!val || Number.isNaN(Number(val))) {
      setError('Please enter a valid numeric value.')
      focusInput()
      return
    }
    const num = Number(val)
    if (num < -999 || num > 9999) {
      setError('Enter a value between -999 and 9999.')
      focusInput()
      return
    }

    const newSteps = generateBstInsertSteps(treeRoot, num)
    setOperationType('insert')
    setSteps(newSteps)
    loadSteps(newSteps)
    setInputValue('')
    setError('')
    focusInput()
  }

  const handleSearch = () => {
    const val = inputValue.trim()
    if (!val || Number.isNaN(Number(val))) {
      setError('Please enter a valid search target.')
      focusInput()
      return
    }
    const num = Number(val)
    const newSteps = generateBstSearchSteps(treeRoot, num)
    setOperationType('search')
    setSteps(newSteps)
    loadSteps(newSteps)
    setError('')
    focusInput()
  }

  const handleDelete = () => {
    const val = inputValue.trim()
    if (!val || Number.isNaN(Number(val))) {
      setError('Please enter a value to delete.')
      focusInput()
      return
    }
    const num = Number(val)
    const newSteps = generateBstDeleteSteps(treeRoot, num)
    setOperationType('delete')
    setSteps(newSteps)
    loadSteps(newSteps)
    setInputValue('')
    setError('')
    focusInput()
  }

  const handleTraversal = (type) => {
    const newSteps = generateBstTraversalSteps(treeRoot, type)
    setOperationType(type)
    setSteps(newSteps)
    loadSteps(newSteps)
    setError('')
    focusInput()
  }

  const handleResetTree = () => {
    const freshRoot = createDefaultBst()
    setTreeRoot(freshRoot)
    const newSteps = generateBstTraversalSteps(freshRoot, 'inorder')
    setOperationType('inorder')
    setSteps(newSteps)
    loadSteps(newSteps)
    setInputValue('')
    setError('')
    focusInput()
  }

  // Determine active pseudocode lines based on operation
  const currentPseudocode = useMemo(() => {
    return BST_PSEUDOCODES[operationType] || BST_PSEUDOCODES.insert
  }, [operationType])

  // --- CONTROLS TOOLBAR MARKUP (Standard Mode Card) ---
  const actionControlsMarkup = (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {/* Traversal Selector */}
      <div className="segmented" role="tablist" aria-label="BST Traversal mode selection">
        {['inorder', 'preorder', 'postorder', 'levelorder'].map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={operationType === t}
            onClick={() => handleTraversal(t)}
            className={`segmented-option focus-ring uppercase text-[11px] tracking-wider ${
              operationType === t ? 'selected' : ''
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="h-6 w-px bg-line hidden md:block" />

      {/* Input Field & Main Action Buttons */}
      <form onSubmit={handleInsert} className="flex items-center gap-1.5">
        <label htmlFor="bst-value-input" className="sr-only">
          BST Node Value
        </label>
        <input
          id="bst-value-input"
          ref={inputRef}
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Val (e.g. 45)"
          className="h-9 w-24 sm:w-28 rounded-md border border-line-strong bg-surface px-2.5 font-mono text-caption text-ink focus-ring shadow-e1"
        />
        <button
          type="submit"
          className="btn-primary h-9 px-3 text-caption font-semibold inline-flex items-center gap-1 focus-ring"
          title="Insert node into BST"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Insert</span>
        </button>
      </form>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleSearch}
          className="btn-ghost h-9 border border-line px-3 text-caption font-semibold text-accent hover:bg-accent-soft inline-flex items-center gap-1 focus-ring"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search</span>
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="btn-ghost h-9 border border-line px-3 text-caption font-semibold text-state-swap hover:bg-state-swap-ring/20 inline-flex items-center gap-1 focus-ring"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
        <button
          type="button"
          onClick={handleResetTree}
          title="Reset BST to default balanced state"
          className="btn-ghost h-9 w-9 p-0 border border-line rounded-md inline-flex items-center justify-center text-ink-muted hover:text-ink focus-ring"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {!isZen && (
        <button
          type="button"
          onClick={toggleZen}
          title="Enter Zen Mode (Z)"
          className="btn-ghost h-9 px-3 border border-line text-caption font-semibold text-accent hover:bg-accent-soft inline-flex items-center gap-1 focus-ring"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{LABELS.ZEN_MODE}</span>
        </button>
      )}
    </div>
  )

  // --- SINGLE-LINE ZEN DOCK CONTROLS MARKUP (Zero scrollbar, all options visible at once) ---
  const zenDockContent = (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 whitespace-nowrap py-0.5 px-1 w-full max-w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {/* 1. Traversals */}
      <div className="segmented shrink-0" role="tablist" aria-label="BST Traversal mode selection">
        {['inorder', 'preorder', 'postorder', 'levelorder'].map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={operationType === t}
            onClick={() => handleTraversal(t)}
            className={`segmented-option focus-ring uppercase text-[10px] sm:text-[11px] tracking-wider px-2 py-1 ${
              operationType === t ? 'selected' : ''
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="h-5 w-px bg-line shrink-0" />

      {/* 2. Value Input & Insert */}
      <form onSubmit={handleInsert} className="flex items-center gap-1.5 shrink-0">
        <label htmlFor="zen-bst-input" className="sr-only">
          Node value
        </label>
        <input
          id="zen-bst-input"
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Val"
          className="h-8 w-16 sm:w-20 rounded-md border border-line-strong bg-surface px-2 font-mono text-xs text-ink focus-ring shadow-e1"
        />
        <button
          type="submit"
          className="btn-primary h-8 px-2.5 text-xs font-semibold inline-flex items-center gap-1 focus-ring"
          title="Insert node into BST"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Insert</span>
        </button>
      </form>

      {/* 3. Search & Delete */}
      <button
        type="button"
        onClick={handleSearch}
        className="btn-ghost h-8 border border-line px-2.5 text-xs font-semibold text-accent hover:bg-accent-soft inline-flex items-center gap-1 shrink-0 focus-ring"
        title="Search value"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Search</span>
      </button>

      <button
        type="button"
        onClick={handleDelete}
        className="btn-ghost h-8 border border-line px-2.5 text-xs font-semibold text-state-swap hover:bg-state-swap-ring/20 inline-flex items-center gap-1 shrink-0 focus-ring"
        title="Delete value"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Delete</span>
      </button>

      <button
        type="button"
        onClick={handleResetTree}
        title="Reset BST"
        className="btn-ghost h-8 w-8 p-0 border border-line rounded-md inline-flex items-center justify-center text-ink-muted hover:text-ink shrink-0 focus-ring"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>

      <div className="h-5 w-px bg-line shrink-0" />

      {/* 4. Integrated Single-Line Playback Step Buttons */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={stepBackward}
          disabled={isAtStart}
          title="Step Backward"
          className="btn-ghost h-8 w-8 p-0 rounded-full inline-flex items-center justify-center focus-ring disabled:opacity-30"
        >
          <SkipBack className="w-3.5 h-3.5 text-ink-muted" />
        </button>

        <button
          type="button"
          onClick={togglePlay}
          title={isPlaying ? 'Pause' : 'Play'}
          className="w-8 h-8 rounded-full bg-accent hover:bg-accent-hover text-white flex items-center justify-center focus-ring shadow-e1 transition-transform active:scale-95"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-white" />
          ) : (
            <Play className="w-4 h-4 fill-white ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={stepForward}
          disabled={isAtEnd}
          title="Step Forward"
          className="btn-ghost h-8 w-8 p-0 rounded-full inline-flex items-center justify-center focus-ring disabled:opacity-30"
        >
          <SkipForward className="w-3.5 h-3.5 text-ink-muted" />
        </button>
      </div>
    </div>
  )

  // --- SVG TREE STAGE MARKUP ---
  const svgStageMarkup = (
    <div className="w-full flex justify-center py-2">
      <svg
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        className="w-full max-w-4xl h-auto min-h-[320px] select-none"
        role="img"
        aria-label={`Binary Search Tree visualization containing ${nodes.length} nodes`}
      >
        {/* 1. Branch Edges */}
        <g className="branches">
          {links.map((link) => (
            <line
              key={link.id}
              x1={link.x1}
              y1={link.y1}
              x2={link.x2}
              y2={link.y2}
              className="stroke-line-strong transition-all duration-slow ease-out-custom"
              strokeWidth="2"
            />
          ))}
        </g>

        {/* 2. Nodes */}
        <g className="nodes">
          {nodes.map((node) => {
            const isActive = node.id === activeNodeId
            const state = nodeStates[node.id] || 'default'
            const visitOrder = visitSequenceMap[node.id]

            // Semantic styling map based on Tailwind design tokens
            let nodeCircleClass = 'fill-surface stroke-line-strong'
            let nodeTextClass = 'fill-ink'

            switch (state) {
              case 'comparing':
                nodeCircleClass = 'fill-state-compare stroke-state-compare-ring'
                nodeTextClass = 'fill-[#451A03]'
                break
              case 'active':
                nodeCircleClass = 'fill-accent-soft stroke-accent'
                nodeTextClass = 'fill-accent-strong'
                break
              case 'found':
                nodeCircleClass = 'fill-state-sorted stroke-state-sorted-ring'
                nodeTextClass = 'fill-white'
                break
              case 'pivot':
                nodeCircleClass = 'fill-state-pivot stroke-state-pivot-ring'
                nodeTextClass = 'fill-white'
                break
              default:
                if (isActive) {
                  nodeCircleClass = 'fill-accent-soft stroke-accent'
                  nodeTextClass = 'fill-accent-strong'
                }
            }

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="transition-transform duration-slow ease-out-custom cursor-pointer"
              >
                {/* Active Pulse Ring (Respects prefers-reduced-motion) */}
                {isActive && (
                  <circle
                    r="28"
                    className="fill-none stroke-accent/50 animate-ping motion-reduce:animate-none"
                    strokeWidth="2"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  r="22"
                  className={`transition-colors duration-base ${nodeCircleClass}`}
                  strokeWidth="2"
                />

                {/* Node Value Label */}
                <text
                  textAnchor="middle"
                  y="4"
                  className={`font-mono text-xs font-semibold tabular-nums select-none ${nodeTextClass}`}
                >
                  {node.value}
                </text>

                {/* Visited Order Badge */}
                {visitOrder !== undefined && (
                  <g transform="translate(14, -14)">
                    <circle r="9" className="fill-accent stroke-surface" strokeWidth="1.5" />
                    <text
                      textAnchor="middle"
                      y="3.5"
                      className="font-mono text-[10px] font-bold fill-white tabular-nums select-none"
                    >
                      {visitOrder}
                    </text>
                  </g>
                )}
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )

  // --- VISITED SEQUENCE RIBBON MARKUP ---
  const visitedRibbonMarkup = visitedOrder.length > 0 && (
    <div className="w-full max-w-4xl space-y-2 pt-3 border-t border-line">
      <div className="flex items-center justify-between">
        <span className="font-mono text-micro font-semibold uppercase tracking-wider text-ink-muted">
          Visited Sequence ({visitedOrder.length} nodes)
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 max-h-28 overflow-y-auto p-1">
        {visitedOrder.map((val, idx) => {
          const isLatest = idx === visitedOrder.length - 1 && activeNodeId !== null
          return (
            <div
              key={`visited-${idx}-${val}`}
              className={`px-3 py-1.5 rounded-full border text-caption font-mono transition-all duration-fast flex items-center gap-1.5 shadow-e1 ${
                isLatest
                  ? 'bg-accent-soft border-accent text-accent-strong font-semibold ring-2 ring-accent/30'
                  : 'bg-surface border-line text-ink'
              }`}
            >
              <span className="text-ink-faint text-[10px] font-bold">#{idx + 1}</span>
              <span className="tabular-nums font-semibold">{val}</span>
            </div>
          )
        })}
      </div>
    </div>
  )

  // ================= ZEN LAYOUT (isZen === true) =================
  if (isZen) {
    return (
      <main
        className={`fixed inset-0 z-30 flex min-h-dvh flex-col justify-between bg-zen-canvas p-4 md:p-8 select-none transition-all duration-300 ${
          isAtEnd ? 'overflow-y-auto pb-40 scroll-smooth' : 'overflow-hidden pb-20'
        }`}
      >
        {announceMessage && (
          <div className="sr-only" aria-live="polite">
            {announceMessage}
          </div>
        )}

        {/* Zen Header */}
        <header className="flex items-center justify-between gap-4 pt-2">
          <div>
            <span className="chip font-mono text-micro uppercase tracking-wider text-accent">
              Binary Search Tree
            </span>
            <h1 className="font-display text-h2 font-semibold text-ink">Tree Visualizer</h1>
          </div>
          <button
            type="button"
            onClick={exitZen}
            className="btn-ghost border border-line px-3 py-2 text-caption font-medium focus-ring"
          >
            {LABELS.EXIT_ZEN}
          </button>
        </header>

        {/* Centered Borderless Zen Stage & Visited Sequence Ribbon (Shifted Upwards) */}
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-start pt-1 pb-2 space-y-2">
          {svgStageMarkup}
          <div className="-mt-4 w-full flex justify-center">
            {visitedRibbonMarkup}
          </div>
        </div>

        {/* Zen Caption */}
        <div className="pt-1 pb-2">
          <ZenCaption
            currentStep={currentStep}
            isAtEnd={isAtEnd}
            stats={currentStep?.stats}
            onExitZen={exitZen}
          />
        </div>

        {/* Single-Line Zen Dock */}
        <ZenDock controlsVisible={true} onExitZen={exitZen}>
          {zenDockContent}
        </ZenDock>
      </main>
    )
  }

  // ================= STANDARD LAYOUT (isZen === false) =================
  return (
    <div className="space-y-6 pb-12">
      {/* Back Link */}
      <div className="flex items-center gap-2">
        <Link
          to={ROUTES.ALGORITHMS}
          className="inline-flex items-center gap-1.5 text-caption font-medium text-ink-muted hover:text-ink focus-ring rounded"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Algorithms</span>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        {/* Left Column (8 cols): Header, Canvas, Operations, Playback */}
        <div className="space-y-6 xl:col-span-8">
          <header className="flex flex-col justify-between gap-3 border-b border-line pb-4 sm:flex-row sm:items-center">
            <div>
              <span className="chip text-micro font-semibold uppercase text-accent">Data Structure</span>
              <h1 className="mt-2 font-display text-h1 font-semibold text-ink">Binary Search Tree</h1>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="chip font-mono text-micro">Insert: O(log n)</span>
                <span className="chip font-mono text-micro">Search: O(log n)</span>
                <span className="chip font-mono text-micro">Delete: O(log n)</span>
                <span className="chip font-mono text-micro">Space: O(n)</span>
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

          <p className="text-body leading-relaxed text-ink-muted">
            Interactive Binary Search Tree (BST) visualizer. Subtree coordinates are automatically
            calculated to prevent branch overlaps and animate during insertions, deletions, and traversals.
          </p>

          {/* SVG Tree Canvas Stage */}
          <div className="card p-6 min-h-[380px] flex flex-col items-center justify-center bg-surface/80 backdrop-blur-sm space-y-4">
            {svgStageMarkup}
            {visitedRibbonMarkup}
          </div>

          {/* Operations Panel Card */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <h2 className="font-display text-body font-semibold text-ink flex items-center gap-2">
                <ListTree className="w-4 h-4 text-accent" />
                <span>Tree Operations</span>
              </h2>
            </div>
            {actionControlsMarkup}

            {error && (
              <div role="alert" className="p-2.5 rounded-md bg-state-swap/10 border border-state-swap text-caption text-ink font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-state-swap shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Playback Controls */}
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
        </div>

        {/* Right Column (4 cols): Explanation & Pseudocode Panels */}
        <aside className="space-y-6 xl:sticky xl:top-20 xl:col-span-4">
          <ExplanationPanel currentStep={currentStep} />
          <PseudocodePanel pseudocode={currentPseudocode} activeLine={activeLine} />
        </aside>
      </div>
    </div>
  )
}
