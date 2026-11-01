import { describe, it, expect } from 'vitest'
import {
  generateMergeSortSteps,
  generateQuickSortSteps,
  generateAdvancedSortingSteps,
} from '../engine/advancedSorting'
import { getCallStackAtStep } from '../utils/callStack'

describe('Advanced Sorting Generators (Merge Sort & Quick Sort)', () => {
  it.each([
    ['Merge Sort', generateMergeSortSteps],
    ['Quick Sort', generateQuickSortSteps],
  ])('%s call events keep the stack non-negative and empty at completion', (_, generate) => {
    const steps = generate([8, 3, 6, 1, 7, 2, 5, 4])
    let depth = 0

    steps.forEach((step) => {
      if (step.callEvent?.type === 'enter') depth += 1
      if (step.callEvent?.type === 'exit') depth -= 1
      expect(depth).toBeGreaterThanOrEqual(0)
      if (step.callEvent) {
        expect(step.callEvent.functionName).toBeTruthy()
        expect(step.callEvent.args).toBeDefined()
        expect(step.callEvent.depth).toBeGreaterThanOrEqual(0)
      }
    })

    expect(depth).toBe(0)
    expect(getCallStackAtStep(steps, steps.length - 1).totalDepth).toBe(0)
  })

  describe('Merge Sort', () => {
    it('never mutates input array', () => {
      const input = [38, 27, 43, 3, 9, 82, 10]
      const copy = [...input]
      generateMergeSortSteps(input)
      expect(input).toEqual(copy)
    })

    it('sorts reverse sorted array to ascending order', () => {
      const input = [5, 4, 3, 2, 1]
      const steps = generateMergeSortSteps(input)
      const lastStep = steps[steps.length - 1]
      expect(lastStep.values).toEqual([1, 2, 3, 4, 5])
    })

    it('emits auxiliarySubarrays metadata during merge steps', () => {
      const input = [4, 2, 3, 1]
      const steps = generateMergeSortSteps(input)
      const mergeStep = steps.find((s) => s.auxiliarySubarrays !== null)
      expect(mergeStep).toBeDefined()
      expect(Array.isArray(mergeStep?.auxiliarySubarrays?.left)).toBe(true)
      expect(Array.isArray(mergeStep?.auxiliarySubarrays?.right)).toBe(true)
    })

    it('handles empty and 1-element arrays', () => {
      const emptySteps = generateMergeSortSteps([])
      expect(emptySteps[0].type).toBe('mark-sorted')

      const singleSteps = generateMergeSortSteps([99])
      expect(singleSteps[0].values).toEqual([99])
    })
  })

  describe('Quick Sort', () => {
    it('never mutates input array', () => {
      const input = [44, 27, 89, 15, 62]
      const copy = [...input]
      generateQuickSortSteps(input)
      expect(input).toEqual(copy)
    })

    it('sorts reverse sorted array to ascending order', () => {
      const input = [50, 40, 30, 20, 10]
      const steps = generateQuickSortSteps(input)
      const lastStep = steps[steps.length - 1]
      expect(lastStep.values).toEqual([10, 20, 30, 40, 50])
    })

    it('selects pivot and marks pivot locked upon partition', () => {
      const input = [10, 80, 30, 90, 40, 50, 70]
      const steps = generateQuickSortSteps(input)
      const selectStep = steps.find((s) => s.type === 'select')
      expect(selectStep).toBeDefined()
      expect(selectStep?.explanation.beginner).toContain('Selected pivot')
    })

    it('handles empty and 1-element arrays', () => {
      const emptySteps = generateQuickSortSteps([])
      expect(emptySteps[0].type).toBe('mark-sorted')

      const singleSteps = generateQuickSortSteps([77])
      expect(singleSteps[0].values).toEqual([77])
    })
  })

  describe('Dispatcher generateAdvancedSortingSteps', () => {
    it('dispatches to merge-sort and quick-sort', () => {
      const merge = generateAdvancedSortingSteps('merge-sort', [3, 2, 1])
      expect(merge[merge.length - 1].values).toEqual([1, 2, 3])

      const quick = generateAdvancedSortingSteps('quick-sort', [3, 2, 1])
      expect(quick[quick.length - 1].values).toEqual([1, 2, 3])
    })

    it('throws error for unsupported advanced sorting algorithm ID', () => {
      expect(() => generateAdvancedSortingSteps('unknown-sort', [1, 2])).toThrow()
    })
  })
})
