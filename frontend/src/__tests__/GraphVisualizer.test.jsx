// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import GraphVisualizer from '../components/visualizer/GraphVisualizer'
import {
  createDefaultGraph,
  generateBfsSteps,
  generateDfsSteps,
  generateDijkstraSteps,
} from '../engine/graphGenerators'
import { ZenProvider } from '../context/ZenContext'

const mockAlgorithm = {
  id: 'dijkstra',
  name: 'Dijkstra Algorithm',
  category: 'Graphs',
  description: 'Interactive Dijkstra Shortest Path visualizer.',
}

function renderGraphVisualizer(props = {}) {
  return render(
    <MemoryRouter>
      <ZenProvider>
        <GraphVisualizer algorithm={mockAlgorithm} {...props} />
      </ZenProvider>
    </MemoryRouter>
  )
}

describe('graphGenerators', () => {
  it('creates default graph with nodes and weighted edges', () => {
    const { nodes, edges } = createDefaultGraph()
    expect(nodes.length).toBe(6)
    expect(edges.length).toBe(10)
    expect(edges[0]).toHaveProperty('weight')
  })

  it('generates steps for BFS traversal', () => {
    const { nodes, edges } = createDefaultGraph()
    const steps = generateBfsSteps(nodes, edges, 'A')
    expect(steps.length).toBeGreaterThan(2)
    const lastStep = steps[steps.length - 1]
    expect(lastStep.visitedNodes.length).toBe(6)
  })

  it('generates steps for DFS traversal', () => {
    const { nodes, edges } = createDefaultGraph()
    const steps = generateDfsSteps(nodes, edges, 'A')
    expect(steps.length).toBeGreaterThan(2)
    const lastStep = steps[steps.length - 1]
    expect(lastStep.visitedNodes.length).toBe(6)
  })

  it('generates steps for Dijkstra shortest path', () => {
    const { nodes, edges } = createDefaultGraph()
    const steps = generateDijkstraSteps(nodes, edges, 'A', 'F')
    expect(steps.length).toBeGreaterThan(2)
    const pathStep = steps.find((s) => s.type === 'shortest-path')
    expect(pathStep).toBeDefined()
    expect(pathStep?.shortestPathEdges.length).toBeGreaterThan(0)
  })
})

describe('GraphVisualizer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(cleanup)

  it('renders SVG canvas, distance table, and algorithm runner toolbar', () => {
    renderGraphVisualizer()

    expect(screen.getByText('Graph Visualizer')).toBeTruthy()
    expect(screen.getByRole('img', { name: /Graph Canvas Stage/i })).toBeTruthy()
    expect(screen.getByText('Live Distance Table')).toBeTruthy()
    expect(screen.getByRole('tab', { name: /DIJKSTRA/i })).toBeTruthy()
  })

  it('allows switching algorithm modes to BFS and DFS', () => {
    renderGraphVisualizer()

    const bfsTab = screen.getByRole('tab', { name: /BFS/i })
    fireEvent.click(bfsTab)
    expect(bfsTab.getAttribute('aria-selected')).toBe('true')
  })

  it('allows spawning a new node by clicking canvas when + Node mode is selected', () => {
    renderGraphVisualizer()

    const addNodeBtn = screen.getByTitle('Click canvas to spawn Node')
    fireEvent.click(addNodeBtn)

    const canvas = screen.getByRole('img', { name: /Graph Canvas Stage/i })
    fireEvent.click(canvas, { clientX: 200, clientY: 200 })

    expect(screen.getByText('G')).toBeTruthy()
  })

  it('toggles distance table peek overlay on S key in Zen mode', () => {
    renderGraphVisualizer({ variant: 'zen' })

    fireEvent.keyDown(window, { key: 's' })
    expect(screen.getByRole('dialog', { name: /Live Distance Table Overlay/i })).toBeTruthy()

    fireEvent.keyDown(window, { key: 's' })
    expect(screen.queryByRole('dialog', { name: /Live Distance Table Overlay/i })).toBeNull()
  })
})
