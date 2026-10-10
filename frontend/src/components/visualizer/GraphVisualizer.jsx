import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  Plus,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Share2,
  Trash2,
  Table as TableIcon,
  X,
  Check,
  MousePointer,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES, LABELS } from '../../config/siteLinks'
import { useZen } from '../../context/ZenContext'
import { useVisualizer } from '../../hooks/useVisualizer'
import progressApi from '../../services/progressApi'
import {
  createDefaultGraph,
  generateBfsSteps,
  generateDfsSteps,
  generateDijkstraSteps,
  GRAPH_PSEUDOCODES,
} from '../../engine/graphGenerators'
import PlaybackControls from './PlaybackControls'
import ExplanationPanel from './ExplanationPanel'
import PseudocodePanel from './PseudocodePanel'
import ZenDock from './ZenDock'
import ZenCaption from './ZenCaption'

/**
 * Interactive Graph Laboratory & Visualizer.
 * Supports Graph Creation (spawning nodes, dragging, connecting weighted edges)
 * and Algorithm Execution (BFS, DFS, Dijkstra Shortest Path).
 * Features Live Distance Table, green 3px shortest path with direction arrowheads, and Zen Mode.
 */
export default function GraphVisualizer({ algorithm, variant: propVariant }) {
  const { isZen: globalZen, toggleZen, exitZen, announceMessage } = useZen()
  const isZen = propVariant === 'zen' || globalZen

  // Graph topology state
  const [graph, setGraph] = useState(() => createDefaultGraph())
  const { nodes, edges } = graph

  // Canvas Mode: 'select' (drag & move) | 'add-node' | 'add-edge' | 'delete'
  const [canvasMode, setCanvasMode] = useState('select')
  const [edgeSource, setEdgeSource] = useState(null) // Source node ID when adding edge
  const [edgeModalOpen, setEdgeModalOpen] = useState(false)
  const [pendingEdge, setPendingEdge] = useState(null) // { source, target }
  const [weightInput, setWeightInput] = useState('1')
  const weightInputRef = useRef(null)

  // Node Drag state
  const [draggingNodeId, setDraggingNodeId] = useState(null)
  const svgRef = useRef(null)

  // Algorithm setup - initialize from algorithm prop if present
  const [algoType, setAlgoType] = useState(() => {
    if (algorithm && ['bfs', 'dfs', 'dijkstra'].includes(algorithm.id)) {
      return algorithm.id
    }
    return 'dijkstra'
  })
  const [startNodeId, setStartNodeId] = useState('A')
  const [targetNodeId, setTargetNodeId] = useState('F')

  // Zen Mode peek overlay state (S key)
  const [showDistanceOverlay, setShowDistanceOverlay] = useState(false)

  // Sync algoType with algorithm prop when navigating between graph algorithm routes
  useEffect(() => {
    if (algorithm && ['bfs', 'dfs', 'dijkstra'].includes(algorithm.id)) {
      setAlgoType(algorithm.id)
    }
  }, [algorithm?.id])

  // Keep startNodeId and targetNodeId referencing valid graph nodes
  useEffect(() => {
    if (!nodes.length) return
    if (!nodes.some((n) => n.id === startNodeId)) {
      setStartNodeId(nodes[0].id)
    }
    if (!nodes.some((n) => n.id === targetNodeId)) {
      setTargetNodeId(nodes[nodes.length - 1].id)
    }
  }, [nodes, startNodeId, targetNodeId])

  // Generate steps from engine
  const steps = useMemo(() => {
    if (!nodes.length) return []
    if (algoType === 'bfs') return generateBfsSteps(nodes, edges, startNodeId)
    if (algoType === 'dfs') return generateDfsSteps(nodes, edges, startNodeId)
    return generateDijkstraSteps(nodes, edges, startNodeId, targetNodeId)
  }, [nodes, edges, algoType, startNodeId, targetNodeId])

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

  // Complete visualizer progress tracking
  useEffect(() => {
    const activeId = algorithm?.id || algoType
    if (!activeId || !steps.length || !isAtEnd) return
    let cancelled = false
    progressApi.completeVisualizer(activeId).then(
      () => {},
      () => {}
    )
    return () => {
      cancelled = true
    }
  }, [algorithm?.id, algoType, isAtEnd, steps.length])

  // Step state snapshots
  const currentNodes = currentStep?.nodes ?? nodes
  const currentEdges = currentStep?.edges ?? edges
  const activeNodeId = currentStep?.activeNodeId ?? null
  const activeEdgeId = currentStep?.activeEdgeId ?? null
  const nodeStates = currentStep?.nodeStates ?? {}
  const edgeStates = currentStep?.edgeStates ?? {}
  const distances = currentStep?.distances ?? {}
  const predecessors = currentStep?.predecessors ?? {}
  const shortestPathEdges = currentStep?.shortestPathEdges ?? []
  const activeLine = currentStep?.pseudocodeLine ?? 1

  // Handle Keyboard Shortcuts for Graph Visualizer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return
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
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault()
        setShowDistanceOverlay((prev) => !prev)
      } else if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault()
        toggleZen()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePlay, stepForward, stepBackward, reset, toggleZen])

  // Focus modal weight input when opened
  useEffect(() => {
    if (edgeModalOpen) {
      setTimeout(() => {
        if (weightInputRef.current) weightInputRef.current.focus()
      }, 50)
    }
  }, [edgeModalOpen])

  // --- CANVAS INTERACTION HANDLERS ---
  const generateNextLabel = () => {
    const existingLabels = new Set(nodes.map((n) => n.label))
    for (let i = 0; i < 26; i++) {
      const label = String.fromCharCode(65 + i)
      if (!existingLabels.has(label)) return label
    }
    return `N${nodes.length + 1}`
  }

  const handleCanvasClick = (e) => {
    if (canvasMode !== 'add-node') return
    if (!svgRef.current) return

    const rect = svgRef.current.getBoundingClientRect()
    const x = Math.round(e.clientX - rect.left)
    const y = Math.round(e.clientY - rect.top)

    const newLabel = generateNextLabel()
    const newNode = { id: newLabel, label: newLabel, x, y }

    setGraph((prev) => ({
      nodes: [...prev.nodes, newNode],
      edges: prev.edges,
    }))
  }

  const handleNodeClick = (e, nodeId) => {
    e.stopPropagation()
    if (canvasMode === 'delete') {
      // Delete node and associated edges
      setGraph((prev) => ({
        nodes: prev.nodes.filter((n) => n.id !== nodeId),
        edges: prev.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
      }))
      return
    }

    if (canvasMode === 'add-edge') {
      if (!edgeSource) {
        setEdgeSource(nodeId)
      } else if (edgeSource !== nodeId) {
        // Check if edge already exists
        const exists = edges.some(
          (edge) =>
            (edge.source === edgeSource && edge.target === nodeId) ||
            (edge.target === edgeSource && edge.source === nodeId)
        )
        if (!exists) {
          setPendingEdge({ source: edgeSource, target: nodeId })
          setWeightInput('1')
          setEdgeModalOpen(true)
        }
        setEdgeSource(null)
      } else {
        setEdgeSource(null)
      }
    }
  }

  const handleConfirmEdgeWeight = (e) => {
    if (e) e.preventDefault()
    if (!pendingEdge) return

    const weightNum = Math.max(1, Number(weightInput) || 1)
    const newEdge = {
      id: `${pendingEdge.source}-${pendingEdge.target}`,
      source: pendingEdge.source,
      target: pendingEdge.target,
      weight: weightNum,
    }

    setGraph((prev) => ({
      nodes: prev.nodes,
      edges: [...prev.edges, newEdge],
    }))

    setPendingEdge(null)
    setEdgeModalOpen(false)
  }

  // --- NODE DRAGGING ---
  const handleMouseDownNode = (e, nodeId) => {
    if (canvasMode !== 'select') return
    e.stopPropagation()
    setDraggingNodeId(nodeId)
  }

  const handleMouseMove = (e) => {
    if (!draggingNodeId || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = Math.round(Math.max(30, Math.min(rect.width - 30, e.clientX - rect.left)))
    const y = Math.round(Math.max(30, Math.min(rect.height - 30, e.clientY - rect.top)))

    setGraph((prev) => ({
      nodes: prev.nodes.map((n) => (n.id === draggingNodeId ? { ...n, x, y } : n)),
      edges: prev.edges,
    }))
  }

  const handleMouseUp = () => {
    setDraggingNodeId(null)
  }

  const handleResetDefaultGraph = () => {
    const defaultG = createDefaultGraph()
    setGraph(defaultG)
    setStartNodeId('A')
    setTargetNodeId('F')
    setEdgeSource(null)
    const newSteps = generateDijkstraSteps(defaultG.nodes, defaultG.edges, 'A', 'F')
    loadSteps(newSteps)
  }

  const currentPseudocode = useMemo(() => {
    return GRAPH_PSEUDOCODES[algoType] || GRAPH_PSEUDOCODES.dijkstra
  }, [algoType])

  // --- LIVE DISTANCE TABLE MARKUP ---
  const distanceTableMarkup = (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-micro font-semibold uppercase tracking-wider text-ink-muted">
          Live Distance Table
        </span>
      </div>
      <div className="overflow-x-auto rounded-lg border border-line bg-surface shadow-e1">
        <table className="w-full text-left font-mono text-xs">
          <thead className="border-b border-line bg-sunken text-ink-muted uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-3 py-2 font-semibold">Node</th>
              <th className="px-3 py-2 font-semibold">Shortest Distance</th>
              <th className="px-3 py-2 font-semibold">Predecessor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60 text-ink">
            {currentNodes.map((n) => {
              const distVal = distances[n.id]
              const predVal = predecessors[n.id]
              const isVisited = currentStep?.visitedNodes?.includes(n.id)
              const isActive = activeNodeId === n.id

              return (
                <tr
                  key={n.id}
                  className={`transition-colors ${
                    isActive
                      ? 'bg-accent-soft text-accent-strong font-bold'
                      : isVisited
                      ? 'bg-sunken/50'
                      : ''
                  }`}
                >
                  <td className="px-3 py-2 font-bold">{n.label}</td>
                  <td className="px-3 py-2 tabular-nums">
                    {distVal === Infinity || distVal === undefined ? '∞' : distVal}
                  </td>
                  <td className="px-3 py-2 font-medium">{predVal || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )

  // --- CONTROLS TOOLBAR MARKUP (Standard Card Mode) ---
  const actionControlsMarkup = (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {/* Algorithm Selector */}
      <div className="segmented" role="tablist" aria-label="Graph algorithm selection">
        {['bfs', 'dfs', 'dijkstra'].map((a) => (
          <button
            key={a}
            type="button"
            role="tab"
            aria-selected={algoType === a}
            onClick={() => setAlgoType(a)}
            className={`segmented-option focus-ring uppercase text-[11px] tracking-wider ${
              algoType === a ? 'selected' : ''
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      <div className="h-6 w-px bg-line hidden sm:block" />

      {/* Start & Target Node Selectors */}
      <div className="flex items-center gap-2 text-caption font-medium text-ink-muted">
        <label className="flex items-center gap-1">
          <span>Start:</span>
          <select
            value={startNodeId}
            onChange={(e) => setStartNodeId(e.target.value)}
            className="h-8 rounded border border-line bg-surface px-2 font-mono text-xs text-ink focus-ring shadow-e1"
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </label>

        {algoType === 'dijkstra' && (
          <label className="flex items-center gap-1">
            <span>Target:</span>
            <select
              value={targetNodeId}
              onChange={(e) => setTargetNodeId(e.target.value)}
              className="h-8 rounded border border-line bg-surface px-2 font-mono text-xs text-ink focus-ring shadow-e1"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="h-6 w-px bg-line hidden sm:block" />

      {/* Canvas Tool Modes */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setCanvasMode('select')}
          aria-selected={canvasMode === 'select'}
          title="Drag Nodes Mode"
          className={`btn-ghost h-8 px-2.5 text-xs font-semibold flex items-center gap-1 focus-ring ${
            canvasMode === 'select' ? 'bg-sunken border border-line-strong text-ink' : ''
          }`}
        >
          <MousePointer className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Move</span>
        </button>

        <button
          type="button"
          onClick={() => setCanvasMode('add-node')}
          aria-selected={canvasMode === 'add-node'}
          title="Click canvas to spawn Node"
          className={`btn-ghost h-8 px-2.5 text-xs font-semibold flex items-center gap-1 focus-ring ${
            canvasMode === 'add-node' ? 'bg-accent-soft text-accent border border-accent/40' : ''
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden md:inline">+ Node</span>
        </button>

        <button
          type="button"
          onClick={() => setCanvasMode('add-edge')}
          aria-selected={canvasMode === 'add-edge'}
          title="Click 2 nodes to connect Edge"
          className={`btn-ghost h-8 px-2.5 text-xs font-semibold flex items-center gap-1 focus-ring ${
            canvasMode === 'add-edge' ? 'bg-accent-soft text-accent border border-accent/40' : ''
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">+ Edge</span>
        </button>

        <button
          type="button"
          onClick={() => setCanvasMode('delete')}
          aria-selected={canvasMode === 'delete'}
          title="Click Node to delete"
          className={`btn-ghost h-8 px-2.5 text-xs font-semibold flex items-center gap-1 focus-ring ${
            canvasMode === 'delete' ? 'bg-state-swap/10 text-state-swap border border-state-swap/40' : ''
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Delete</span>
        </button>

        <button
          type="button"
          onClick={handleResetDefaultGraph}
          title="Reset to default graph topology"
          className="btn-ghost h-8 w-8 p-0 border border-line rounded-md inline-flex items-center justify-center text-ink-muted hover:text-ink focus-ring"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {!isZen && (
        <button
          type="button"
          onClick={toggleZen}
          title="Enter Zen Mode (Z)"
          className="btn-ghost h-8 px-3 border border-line text-xs font-semibold text-accent hover:bg-accent-soft inline-flex items-center gap-1 focus-ring"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{LABELS.ZEN_MODE}</span>
        </button>
      )}
    </div>
  )

  // --- SINGLE-LINE ZEN DOCK MARKUP ---
  const zenDockContent = (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 whitespace-nowrap py-0.5 px-1 w-full max-w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {/* Algo Selector */}
      <div className="segmented shrink-0" role="tablist">
        {['bfs', 'dfs', 'dijkstra'].map((a) => (
          <button
            key={a}
            type="button"
            role="tab"
            aria-selected={algoType === a}
            onClick={() => setAlgoType(a)}
            className={`segmented-option focus-ring uppercase text-[10px] sm:text-[11px] tracking-wider px-2 py-1 ${
              algoType === a ? 'selected' : ''
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      <div className="h-4 w-px bg-line shrink-0" />

      {/* Start / Target Selectors */}
      <div className="flex items-center gap-1.5 text-xs text-ink-muted shrink-0">
        <label className="flex items-center gap-1">
          <span>Start:</span>
          <select
            value={startNodeId}
            onChange={(e) => setStartNodeId(e.target.value)}
            className="h-7 rounded border border-line bg-surface px-1.5 font-mono text-xs text-ink focus-ring shadow-e1"
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </label>

        {algoType === 'dijkstra' && (
          <label className="flex items-center gap-1">
            <span>Target:</span>
            <select
              value={targetNodeId}
              onChange={(e) => setTargetNodeId(e.target.value)}
              className="h-7 rounded border border-line bg-surface px-1.5 font-mono text-xs text-ink focus-ring shadow-e1"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="h-4 w-px bg-line shrink-0" />

      {/* Table Peek Toggle Button (S) */}
      <button
        type="button"
        onClick={() => setShowDistanceOverlay((prev) => !prev)}
        className="btn-ghost h-7 px-2 text-xs font-semibold text-accent hover:bg-accent-soft inline-flex items-center gap-1 shrink-0 focus-ring"
        title="Toggle Live Distance Table (S)"
      >
        <TableIcon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Table (S)</span>
      </button>

      <button
        type="button"
        onClick={handleResetDefaultGraph}
        title="Reset graph"
        className="btn-ghost h-7 w-7 p-0 border border-line rounded-md inline-flex items-center justify-center text-ink-muted hover:text-ink shrink-0 focus-ring"
      >
        <RotateCcw className="w-3 h-3" />
      </button>

      <div className="h-4 w-px bg-line shrink-0" />

      {/* Stepping controls */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={stepBackward}
          disabled={isAtStart}
          title="Step Backward"
          className="btn-ghost h-7 w-7 p-0 rounded-full inline-flex items-center justify-center focus-ring disabled:opacity-30"
        >
          <SkipBack className="w-3 h-3 text-ink-muted" />
        </button>

        <button
          type="button"
          onClick={togglePlay}
          title={isPlaying ? 'Pause' : 'Play'}
          className="w-7 h-7 rounded-full bg-accent hover:bg-accent-hover text-white flex items-center justify-center focus-ring shadow-e1 transition-transform active:scale-95"
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-white" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={stepForward}
          disabled={isAtEnd}
          title="Step Forward"
          className="btn-ghost h-7 w-7 p-0 rounded-full inline-flex items-center justify-center focus-ring disabled:opacity-30"
        >
          <SkipForward className="w-3 h-3 text-ink-muted" />
        </button>
      </div>
    </div>
  )

  // --- SVG GRAPH STAGE ---
  const svgStageMarkup = (
    <div
      className={`relative w-full rounded-xl transition-colors duration-300 ${
        isZen ? 'bg-transparent' : 'bg-surface bg-dots border border-line p-4 shadow-e1'
      }`}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 800 380"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="w-full h-auto min-h-[340px] select-none cursor-crosshair"
        role="img"
        aria-label="Interactive Graph Canvas Stage"
      >
        <defs>
          {/* Arrowhead markers for shortest path direction */}
          <marker
            id="arrow-sorted"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-state-sorted" />
          </marker>

          <marker
            id="arrow-active"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-accent" />
          </marker>
        </defs>

        {/* 1. Edges */}
        <g className="edges">
          {currentEdges.map((edge) => {
            const sNode = currentNodes.find((n) => n.id === edge.source)
            const tNode = currentNodes.find((n) => n.id === edge.target)
            if (!sNode || !tNode) return null

            const isShortestPath = shortestPathEdges.includes(edge.id)
            const isEdgeActive = activeEdgeId === edge.id
            const edgeState = edgeStates[edge.id] || 'default'

            let strokeClass = 'stroke-line-strong'
            let strokeWidth = '2'
            let markerEnd = undefined

            if (isShortestPath || edgeState === 'sorted') {
              strokeClass = 'stroke-state-sorted'
              strokeWidth = '3'
              markerEnd = 'url(#arrow-sorted)'
            } else if (isEdgeActive || edgeState === 'comparing') {
              strokeClass = 'stroke-accent'
              strokeWidth = '3'
              markerEnd = 'url(#arrow-active)'
            }

            const midX = Math.round((sNode.x + tNode.x) / 2)
            const midY = Math.round((sNode.y + tNode.y) / 2)

            return (
              <g key={edge.id} className="transition-all duration-fast">
                <line
                  x1={sNode.x}
                  y1={sNode.y}
                  x2={tNode.x}
                  y2={tNode.y}
                  className={`transition-all duration-base ${strokeClass}`}
                  strokeWidth={strokeWidth}
                  markerEnd={markerEnd}
                />

                {/* Edge Weight Pill Badge */}
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x="-12"
                    y="-9"
                    width="24"
                    height="18"
                    rx="4"
                    className="fill-surface stroke-line shadow-e1"
                  />
                  <text
                    textAnchor="middle"
                    y="3.5"
                    className="font-mono text-[10px] font-bold fill-ink tabular-nums select-none"
                  >
                    {edge.weight}
                  </text>
                </g>
              </g>
            )
          })}
        </g>

        {/* 2. Nodes */}
        <g className="nodes">
          {currentNodes.map((node) => {
            const isActive = activeNodeId === node.id
            const isSourceSelected = edgeSource === node.id
            const state = nodeStates[node.id] || 'default'

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
              case 'sorted':
                nodeCircleClass = 'fill-state-sorted stroke-state-sorted-ring'
                nodeTextClass = 'fill-white'
                break
              default:
                if (isActive) {
                  nodeCircleClass = 'fill-accent-soft stroke-accent'
                  nodeTextClass = 'fill-accent-strong'
                } else if (isSourceSelected) {
                  nodeCircleClass = 'fill-accent-soft stroke-accent ring-4 ring-accent/30'
                }
            }

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseDown={(e) => handleMouseDownNode(e, node.id)}
                onClick={(e) => handleNodeClick(e, node.id)}
                className="transition-transform duration-fast cursor-grab active:cursor-grabbing focus-ring"
              >
                {/* Active Pulse Ring */}
                {isActive && (
                  <circle
                    r="28"
                    className="fill-none stroke-accent/50 animate-ping motion-reduce:animate-none"
                    strokeWidth="2"
                  />
                )}

                {/* Node Circle */}
                <circle
                  r="22"
                  className={`transition-colors duration-base ${nodeCircleClass}`}
                  strokeWidth="2"
                />

                {/* Node Label */}
                <text
                  textAnchor="middle"
                  y="4"
                  className={`font-mono text-xs font-bold tabular-nums select-none ${nodeTextClass}`}
                >
                  {node.label}
                </text>
              </g>
            )
          })}
        </g>
      </svg>
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
              Graph Laboratory
            </span>
            <h1 className="font-display text-h2 font-semibold text-ink">Graph Visualizer</h1>
          </div>
          <button
            type="button"
            onClick={exitZen}
            className="btn-ghost border border-line px-3 py-2 text-caption font-medium focus-ring"
          >
            {LABELS.EXIT_ZEN}
          </button>
        </header>

        {/* Centered Borderless Zen Stage */}
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center py-4">
          {svgStageMarkup}
        </div>

        {/* Zen Caption */}
        <div className="pt-1 pb-2">
          <ZenCaption currentStep={currentStep} isAtEnd={isAtEnd} stats={currentStep?.stats} />
        </div>

        {/* Floating Zen Dock */}
        <ZenDock controlsVisible={true} onExitZen={exitZen}>
          {zenDockContent}
        </ZenDock>

        {/* Zen Distance Table Peek Overlay (Triggered by S key or Table button) */}
        {showDistanceOverlay && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4 animate-in fade-in"
            role="dialog"
            aria-modal="true"
            aria-label="Live Distance Table Overlay"
          >
            <div className="card w-full max-w-md p-5 bg-surface border border-line shadow-e3 space-y-4">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <h3 className="font-display text-body font-semibold text-ink flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-accent" />
                  <span>Live Distance Table</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowDistanceOverlay(false)}
                  className="btn-ghost p-1 rounded-md text-ink-muted hover:text-ink focus-ring"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {distanceTableMarkup}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowDistanceOverlay(false)}
                  className="btn-ghost border border-line text-xs font-semibold px-3 py-1.5 focus-ring"
                >
                  Close (S)
                </button>
              </div>
            </div>
          </div>
        )}
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
        {/* Left Column (8 cols): Header, Canvas, Distance Table, Controls, Playback */}
        <div className="space-y-6 xl:col-span-8">
          <header className="flex flex-col justify-between gap-3 border-b border-line pb-4 sm:flex-row sm:items-center">
            <div>
              <span className="chip text-micro font-semibold uppercase text-accent">Graph Laboratory</span>
              <h1 className="mt-2 font-display text-h1 font-semibold text-ink">Graph Visualizer</h1>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="chip font-mono text-micro">BFS: O(V + E)</span>
                <span className="chip font-mono text-micro">DFS: O(V + E)</span>
                <span className="chip font-mono text-micro">Dijkstra: O((V + E) log V)</span>
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
            Interactive graph visualizer. Spawn nodes by clicking the dotted canvas, drag nodes to position,
            and connect weighted edges. Run BFS, DFS, or Dijkstra to inspect live distance updates and shortest paths.
          </p>

          {/* Canvas & Controls Card */}
          <div className="card p-4 space-y-4">
            {actionControlsMarkup}
            {svgStageMarkup}
          </div>

          {/* Live Distance Table */}
          {distanceTableMarkup}

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

      {/* Light Edge Weight Input Modal */}
      {edgeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-xs p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edge-weight-modal-title"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setEdgeModalOpen(false)
          }}
        >
          <form
            onSubmit={handleConfirmEdgeWeight}
            className="card w-full max-w-sm p-5 bg-surface border border-line shadow-e3 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-line pb-2">
              <h3 id="edge-weight-modal-title" className="font-display text-body font-semibold text-ink">
                Connect Edge ({pendingEdge?.source} → {pendingEdge?.target})
              </h3>
              <button
                type="button"
                onClick={() => setEdgeModalOpen(false)}
                className="btn-ghost p-1 rounded-md text-ink-muted hover:text-ink focus-ring"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <label className="block space-y-1.5 text-caption font-medium text-ink-muted">
              <span>Edge Weight (numeric)</span>
              <input
                ref={weightInputRef}
                type="number"
                min="1"
                max="99"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleConfirmEdgeWeight()
                  }
                }}
                className="h-10 w-full rounded-md border border-line-strong bg-surface px-3 font-mono text-body text-ink focus-ring shadow-e1"
              />
            </label>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEdgeModalOpen(false)}
                className="btn-ghost border border-line text-xs font-semibold px-3 py-2 focus-ring"
              >
                Cancel (Esc)
              </button>
              <button
                type="submit"
                className="btn-primary text-xs font-semibold px-4 py-2 inline-flex items-center gap-1 focus-ring"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm (Enter)</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
