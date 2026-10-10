// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import TreeVisualizer from '../components/visualizer/TreeVisualizer'
import {
  createDefaultBst,
  calculateTreeLayout,
  generateBstInsertSteps,
  generateBstSearchSteps,
  generateBstDeleteSteps,
  generateBstTraversalSteps,
} from '../engine/bstGenerators'
import { ZenProvider } from '../context/ZenContext'

const mockAlgorithm = {
  id: 'binary-search-tree',
  name: 'Binary Search Tree',
  category: 'Data Structures',
  description: 'Interactive BST visualizer.',
}

function renderTreeVisualizer(props = {}) {
  return render(
    <MemoryRouter>
      <ZenProvider>
        <TreeVisualizer algorithm={mockAlgorithm} {...props} />
      </ZenProvider>
    </MemoryRouter>
  )
}

describe('bstGenerators', () => {
  it('calculates tree layout with coordinates and edges', () => {
    const root = createDefaultBst()
    const layout = calculateTreeLayout(root, 800, 380, 22)

    expect(layout.nodes.length).toBe(7)
    expect(layout.links.length).toBe(6)
    layout.nodes.forEach((node) => {
      expect(typeof node.x).toBe('number')
      expect(typeof node.y).toBe('number')
    })
  })

  it('generates steps for inserting a new value', () => {
    const root = createDefaultBst()
    const steps = generateBstInsertSteps(root, 25)

    expect(steps.length).toBeGreaterThan(1)
    const finalStep = steps[steps.length - 1]
    expect(finalStep.tree).toBeDefined()
  })

  it('generates steps for searching a value', () => {
    const root = createDefaultBst()
    const foundSteps = generateBstSearchSteps(root, 60)
    expect(foundSteps.some((s) => s.type === 'found')).toBe(true)

    const notFoundSteps = generateBstSearchSteps(root, 999)
    expect(notFoundSteps.some((s) => s.type === 'not-found')).toBe(true)
  })

  it('generates steps for deleting a node with 2 children', () => {
    const root = createDefaultBst()
    const deleteSteps = generateBstDeleteSteps(root, 30)

    expect(deleteSteps.length).toBeGreaterThan(2)
    expect(deleteSteps.some((s) => s.type === 'successor-found' || s.type === 'completed-deletion')).toBe(true)
  })

  it('generates steps for all tree traversals', () => {
    const root = createDefaultBst()
    const traversals = ['inorder', 'preorder', 'postorder', 'levelorder']

    traversals.forEach((type) => {
      const steps = generateBstTraversalSteps(root, type)
      expect(steps.length).toBeGreaterThan(5)
      const lastStep = steps[steps.length - 1]
      expect(lastStep.visitedOrder.length).toBe(7)
    })
  })
})

describe('TreeVisualizer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(cleanup)

  it('renders SVG tree stage, nodes, and operations bar', () => {
    renderTreeVisualizer()

    expect(screen.getByText('Binary Search Tree')).toBeTruthy()
    expect(screen.getByRole('img')).toBeTruthy()
    expect(screen.getByPlaceholderText(/Val/)).toBeTruthy()
    expect(screen.getByRole('button', { name: /Insert/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Search/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Delete/i })).toBeTruthy()
  })

  it('allows inserting a new node into the BST', () => {
    renderTreeVisualizer()

    const input = screen.getByPlaceholderText(/Val/)
    fireEvent.change(input, { target: { value: '45' } })
    fireEvent.click(screen.getByRole('button', { name: /Insert/i }))

    expect(input.value).toBe('')
  })

  it('allows switching traversal modes', () => {
    renderTreeVisualizer()

    const preorderBtn = screen.getByRole('tab', { name: /PREORDER/i })
    fireEvent.click(preorderBtn)

    expect(preorderBtn.getAttribute('aria-selected')).toBe('true')
  })
})
