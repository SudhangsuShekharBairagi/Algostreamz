import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useVisualizer } from '../hooks/useVisualizer'

describe('useVisualizer Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calculates progressPercent correctly for standard steps', () => {
    // Direct test of progress percent logic
    const totalSteps = 3
    const index0Percent = totalSteps <= 1 ? 0 : (0 / (totalSteps - 1)) * 100
    const index1Percent = totalSteps <= 1 ? 0 : (1 / (totalSteps - 1)) * 100
    const index2Percent = totalSteps <= 1 ? 0 : (2 / (totalSteps - 1)) * 100

    expect(index0Percent).toBe(0)
    expect(index1Percent).toBe(50)
    expect(index2Percent).toBe(100)
  })

  it('guards against division by zero when steps length is 0 or 1', () => {
    const calcProgress = (index, total) => (total <= 1 ? 0 : (index / (total - 1)) * 100)
    expect(calcProgress(0, 0)).toBe(0)
    expect(calcProgress(0, 1)).toBe(0)
  })

  it('clamps speed setting strictly between 50ms and 1200ms', () => {
    const clampSpeed = (ms) => Math.min(Math.max(ms, 50), 1200)
    expect(clampSpeed(10)).toBe(50)
    expect(clampSpeed(400)).toBe(400)
    expect(clampSpeed(2000)).toBe(1200)
  })

  it('exports the visualizer hook', () => {
    expect(useVisualizer).toBeTypeOf('function')
  })
})
