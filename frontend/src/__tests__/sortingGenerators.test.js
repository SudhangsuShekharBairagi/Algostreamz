import { describe, it, expect } from 'vitest'
import {
  generateBubbleSortSteps,
  generateSelectionSortSteps,
  generateInsertionSortSteps,
  generateSortingSteps,
} from '../engine/sortingGenerators'

const GENERATORS = [
  { name: 'Bubble Sort', fn: generateBubbleSortSteps, id: 'bubble-sort' },
  { name: 'Selection Sort', fn: generateSelectionSortSteps, id: 'selection-sort' },
  { name: 'Insertion Sort', fn: generateInsertionSortSteps, id: 'insertion-sort' },
]

describe('Sorting Generators (Pure Step Engines)', () => {
  GENERATORS.forEach(({ name, fn, id }) => {
    describe(name, () => {
      it('never mutates the input array', () => {
        const original = [44, 27, 89, 15, 62]
        const copy = [...original]
        fn(original)
        expect(original).toEqual(copy)
      })

      it('handles empty array cleanly', () => {
        const steps = fn([])
        expect(steps.length).toBeGreaterThan(0)
        expect(steps[0].type).toBe('mark-sorted')
        expect(steps[0].values).toEqual([])
      })

      it('handles 1-element array cleanly', () => {
        const steps = fn([42])
        expect(steps.length).toBeGreaterThan(0)
        const lastStep = steps[steps.length - 1]
        expect(lastStep.values).toEqual([42])
        expect(lastStep.highlightedIndices[0]).toBe('sorted')
      })

      it('sorts already sorted array', () => {
        const input = [10, 20, 30, 40]
        const steps = fn(input)
        const lastStep = steps[steps.length - 1]
        expect(lastStep.values).toEqual([10, 20, 30, 40])
      })

      it('sorts reverse sorted array', () => {
        const input = [50, 40, 30, 20, 10]
        const steps = fn(input)
        const lastStep = steps[steps.length - 1]
        expect(lastStep.values).toEqual([10, 20, 30, 40, 50])
      })

      it('conforms to Step Object specification', () => {
        const steps = fn([3, 1, 2])
        steps.forEach((step, idx) => {
          expect(step.stepIndex).toBe(idx)
          expect(['compare', 'swap', 'overwrite', 'select', 'mark-sorted']).toContain(step.type)
          expect(Array.isArray(step.indices)).toBe(true)
          expect(Array.isArray(step.values)).toBe(true)
          expect(typeof step.highlightedIndices).toBe('object')
          expect(typeof step.pseudocodeLine).toBe('number')
          expect(typeof step.explanation.beginner).toBe('string')
          expect(typeof step.explanation.technical).toBe('string')
          expect(typeof step.stats.comparisons).toBe('number')
          expect(typeof step.stats.swaps).toBe('number')
          expect(typeof step.stats.arrayAccesses).toBe('number')
        })
      })

      it('works with generateSortingSteps dispatcher', () => {
        const steps = generateSortingSteps(id, [3, 2, 1])
        expect(steps.length).toBeGreaterThan(0)
        const lastStep = steps[steps.length - 1]
        expect(lastStep.values).toEqual([1, 2, 3])
      })
    })
  })

  it('throws error for unsupported algorithm in dispatcher', () => {
    expect(() => generateSortingSteps('unknown-algo', [1, 2, 3])).toThrow()
  })
})
