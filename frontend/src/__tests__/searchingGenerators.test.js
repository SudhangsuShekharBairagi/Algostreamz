import { describe, it, expect } from 'vitest'
import {
  generateLinearSearchSteps,
  generateBinarySearchSteps,
  generateSearchingSteps,
} from '../engine/searchingGenerators'

describe('Searching Generators (Pure Step Engines)', () => {
  describe('Linear Search', () => {
    it('never mutates input array', () => {
      const input = [10, 50, 30, 20]
      const copy = [...input]
      generateLinearSearchSteps(input, 30)
      expect(input).toEqual(copy)
    })

    it('generates match-found step when target exists', () => {
      const input = [45, 12, 89, 33, 77]
      const steps = generateLinearSearchSteps(input, 33)
      const lastStep = steps[steps.length - 1]
      expect(lastStep.type).toBe('match-found')
      expect(lastStep.indices).toEqual([3])
    })

    it('generates not-found step when target does not exist', () => {
      const input = [1, 2, 3]
      const steps = generateLinearSearchSteps(input, 99)
      const lastStep = steps[steps.length - 1]
      expect(lastStep.type).toBe('not-found')
      expect(lastStep.indices).toEqual([])
    })

    it('handles empty array cleanly', () => {
      const steps = generateLinearSearchSteps([], 10)
      expect(steps.length).toBe(1)
      expect(steps[0].type).toBe('not-found')
    })
  })

  describe('Binary Search', () => {
    it('auto-sorts unsorted input array for binary search baseline', () => {
      const input = [90, 10, 50, 30, 70]
      const steps = generateBinarySearchSteps(input, 50)
      // Array in steps should be sorted: [10, 30, 50, 70, 90]
      expect(steps[0].values).toEqual([10, 30, 50, 70, 90])
    })

    it('tracks pointers and activeRange at every step', () => {
      const input = [10, 20, 30, 40, 50, 60, 70]
      const steps = generateBinarySearchSteps(input, 60)
      steps.forEach((step) => {
        expect(step.pointers).toBeDefined()
        expect(typeof step.pointers.low).toBe('number')
        expect(Array.isArray(step.activeRange)).toBe(true)
      })
    })

    it('generates eliminate-left when mid < target', () => {
      const input = [10, 20, 30, 40, 50]
      const steps = generateBinarySearchSteps(input, 50)
      const eliminateStep = steps.find((s) => s.type === 'eliminate-left')
      expect(eliminateStep).toBeDefined()
      expect(eliminateStep?.explanation.beginner).toContain('smaller than target')
    })

    it('generates eliminate-right when mid > target', () => {
      const input = [10, 20, 30, 40, 50]
      const steps = generateBinarySearchSteps(input, 10)
      const eliminateStep = steps.find((s) => s.type === 'eliminate-right')
      expect(eliminateStep).toBeDefined()
      expect(eliminateStep?.explanation.beginner).toContain('larger than target')
    })

    it('generates match-found when target is located', () => {
      const input = [12, 24, 36, 48, 60]
      const steps = generateBinarySearchSteps(input, 48)
      const matchStep = steps.find((s) => s.type === 'match-found')
      expect(matchStep).toBeDefined()
      expect(matchStep?.indices).toEqual([3])
    })

    it('generates not-found when target is missing', () => {
      const input = [10, 20, 30]
      const steps = generateBinarySearchSteps(input, 99)
      const lastStep = steps[steps.length - 1]
      expect(lastStep.type).toBe('not-found')
    })
  })

  describe('Dispatcher generateSearchingSteps', () => {
    it('dispatches to linear-search and binary-search', () => {
      const linear = generateSearchingSteps('linear-search', [5, 3, 1], 3)
      expect(linear.some((s) => s.type === 'match-found')).toBe(true)

      const binary = generateSearchingSteps('binary-search', [5, 3, 1], 3)
      expect(binary.some((s) => s.type === 'match-found')).toBe(true)
    })

    it('throws error for unsupported search algorithm ID', () => {
      expect(() => generateSearchingSteps('unknown-search', [1, 2], 1)).toThrow()
    })
  })
})
