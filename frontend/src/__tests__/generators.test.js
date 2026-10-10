import { describe, it, expect } from 'vitest'
import {
  generateBubbleSortSteps,
  generateSelectionSortSteps,
  generateInsertionSortSteps,
  generateSortingSteps,
} from '../engine/sortingGenerators'
import {
  generateMergeSortSteps,
  generateQuickSortSteps,
} from '../engine/advancedSorting'
import {
  generateLinearSearchSteps,
  generateBinarySearchSteps,
  generateSearchingSteps,
} from '../engine/searchingGenerators'
import { getAlgorithmById } from '../data/algorithmsData'

const SORTING_ALGORITHMS = [
  { id: 'bubble-sort', name: 'Bubble Sort', fn: generateBubbleSortSteps },
  { id: 'selection-sort', name: 'Selection Sort', fn: generateSelectionSortSteps },
  { id: 'insertion-sort', name: 'Insertion Sort', fn: generateInsertionSortSteps },
  { id: 'merge-sort', name: 'Merge Sort', fn: generateMergeSortSteps },
  { id: 'quick-sort', name: 'Quick Sort', fn: generateQuickSortSteps },
]

describe('Complete Unit Test Coverage: Algorithm Step Generators', () => {
  // =========================================================================
  // 1. SORTING ALGORITHMS
  // =========================================================================
  describe('Sorting Generators', () => {
    SORTING_ALGORITHMS.forEach(({ id, name, fn }) => {
      describe(name, () => {
        it('sorts a standard unsorted array to ascending order', () => {
          const input = [44, 27, 89, 15, 62, 38, 71, 10]
          const expected = [...input].sort((a, b) => a - b)
          const steps = fn(input)

          expect(steps.length).toBeGreaterThan(0)
          const finalStep = steps[steps.length - 1]
          expect(finalStep.values).toEqual(expected)
        })

        it('handles an already sorted array', () => {
          const input = [10, 15, 27, 38, 44, 62, 71, 89]
          const expected = [...input]
          const steps = fn(input)

          expect(steps.length).toBeGreaterThan(0)
          const finalStep = steps[steps.length - 1]
          expect(finalStep.values).toEqual(expected)

          // Optimal early termination assert for Bubble Sort
          if (id === 'bubble-sort') {
            const swapSteps = steps.filter((s) => s.type === 'swap')
            expect(swapSteps.length).toBe(0)
            const earlyBreakStep = steps.find(
              (s) => s.explanation?.beginner?.includes('No swaps occurred') || s.pseudocodeLine === 9
            )
            expect(earlyBreakStep).toBeDefined()
          }
        })

        it('sorts a reverse sorted array', () => {
          const input = [89, 71, 62, 44, 38, 27, 15, 10]
          const expected = [...input].sort((a, b) => a - b)
          const steps = fn(input)

          expect(steps.length).toBeGreaterThan(0)
          const finalStep = steps[steps.length - 1]
          expect(finalStep.values).toEqual(expected)
        })

        it('handles negative numbers and duplicate values correctly', () => {
          const input = [-10, 5, -2, 5, 0, -10, 8, -25]
          const expected = [...input].sort((a, b) => a - b)
          const steps = fn(input)

          expect(steps.length).toBeGreaterThan(0)
          const finalStep = steps[steps.length - 1]
          expect(finalStep.values).toEqual(expected)
        })

        it('handles single-element and empty arrays cleanly', () => {
          // Single-element array
          const singleSteps = fn([42])
          expect(singleSteps.length).toBeGreaterThan(0)
          expect(singleSteps[singleSteps.length - 1].values).toEqual([42])

          // Empty array
          const emptySteps = fn([])
          expect(emptySteps.length).toBeGreaterThan(0)
          expect(emptySteps[0].values).toEqual([])
          expect(emptySteps[0].type).toBe('mark-sorted')
        })
      })
    })

    describe('Sorting Dispatcher (generateSortingSteps)', () => {
      it('dispatches sorting requests for all 5 sorting algorithms', () => {
        const testArr = [5, 2, 8, 1, 4]
        const expected = [1, 2, 4, 5, 8]

        SORTING_ALGORITHMS.forEach(({ id }) => {
          const steps = generateSortingSteps(id, testArr)
          expect(steps.length).toBeGreaterThan(0)
          expect(steps[steps.length - 1].values).toEqual(expected)
        })
      })

      it('throws an error for unsupported sorting algorithm ID', () => {
        expect(() => generateSortingSteps('bogosort', [1, 2, 3])).toThrow(
          'Unsupported sorting algorithm ID: "bogosort"'
        )
      })
    })
  })

  // =========================================================================
  // 2. STEP INTEGRITY ASSERTS
  // =========================================================================
  describe('Step Integrity Asserts', () => {
    SORTING_ALGORITHMS.forEach(({ name, fn }) => {
      it(`emits strict Step objects for ${name}`, () => {
        const input = [30, -5, 12, 0, 12]
        const nativeSorted = [...input].sort((a, b) => a - b)
        const steps = fn(input)

        steps.forEach((step, index) => {
          // Required step properties
          expect(step).toHaveProperty('stepIndex')
          expect(step.stepIndex).toBe(index)

          expect(step).toHaveProperty('type')
          expect(typeof step.type).toBe('string')
          expect(step.type.length).toBeGreaterThan(0)

          expect(step).toHaveProperty('indices')
          expect(Array.isArray(step.indices)).toBe(true)

          expect(step).toHaveProperty('values')
          expect(Array.isArray(step.values)).toBe(true)
          expect(step.values.length).toBe(input.length)

          expect(step).toHaveProperty('highlightedIndices')
          expect(typeof step.highlightedIndices).toBe('object')

          expect(step).toHaveProperty('pseudocodeLine')
          expect(typeof step.pseudocodeLine).toBe('number')

          expect(step).toHaveProperty('explanation')
          expect(typeof step.explanation.beginner).toBe('string')
          expect(typeof step.explanation.technical).toBe('string')
        })

        // Final step values must strictly equal native sort result
        const finalValues = steps[steps.length - 1].values
        expect(finalValues).toEqual(nativeSorted)
      })
    })
  })

  // =========================================================================
  // 3. METADATA CONSISTENCY & IMMUTABILITY
  // =========================================================================
  describe('Metadata Consistency & Immutability', () => {
    SORTING_ALGORITHMS.forEach(({ id, name, fn }) => {
      it(`validates pseudocodeLine mapping and input immutability for ${name}`, () => {
        const algoDef = getAlgorithmById(id)
        expect(algoDef).toBeDefined()
        const validLines = new Set(algoDef.pseudocode.map((p) => p.line))

        const input = [19, 82, 41, 12, 67]
        const inputCopy = [...input]
        const steps = fn(input)

        // Assert input array is never mutated
        expect(input).toEqual(inputCopy)

        // Assert every step.pseudocodeLine exists in algorithmsData.js
        steps.forEach((step) => {
          expect(validLines.has(step.pseudocodeLine)).toBe(true)
        })
      })
    })
  })

  // =========================================================================
  // 4. SEARCHING ALGORITHMS
  // =========================================================================
  describe('Searching Generators', () => {
    describe('Linear Search', () => {
      const input = [45, 12, 89, 33, 77, 12]

      it('locates target when present in middle of array', () => {
        const steps = generateLinearSearchSteps(input, 33)
        const matchStep = steps.find((s) => s.type === 'match-found')
        expect(matchStep).toBeDefined()
        expect(matchStep.indices).toEqual([3])
      })

      it('handles target absent from array', () => {
        const steps = generateLinearSearchSteps(input, 999)
        const lastStep = steps[steps.length - 1]
        expect(lastStep.type).toBe('not-found')
        expect(lastStep.indices).toEqual([])
      })

      it('locates first element target', () => {
        const steps = generateLinearSearchSteps(input, 45)
        const matchStep = steps.find((s) => s.type === 'match-found')
        expect(matchStep).toBeDefined()
        expect(matchStep.indices).toEqual([0])
      })

      it('locates last element target', () => {
        const steps = generateLinearSearchSteps(input, 12)
        // Returns first occurrence at index 1
        const matchStep = steps.find((s) => s.type === 'match-found')
        expect(matchStep).toBeDefined()
        expect(matchStep.indices).toEqual([1])
      })

      it('handles duplicates by returning first match', () => {
        const steps = generateLinearSearchSteps([10, 20, 20, 30], 20)
        const matchStep = steps.find((s) => s.type === 'match-found')
        expect(matchStep).toBeDefined()
        expect(matchStep.indices).toEqual([1])
      })

      it('handles empty input array cleanly', () => {
        const steps = generateLinearSearchSteps([], 5)
        expect(steps.length).toBe(1)
        expect(steps[0].type).toBe('not-found')
      })

      it('never mutates input array', () => {
        const copy = [...input]
        generateLinearSearchSteps(input, 89)
        expect(input).toEqual(copy)
      })
    })

    describe('Binary Search', () => {
      const input = [12, 24, 36, 48, 60, 72, 84]

      it('locates target when present in array', () => {
        const steps = generateBinarySearchSteps(input, 60)
        const matchStep = steps.find((s) => s.type === 'match-found')
        expect(matchStep).toBeDefined()
        expect(matchStep.values[matchStep.indices[0]]).toBe(60)
      })

      it('handles target absent from array', () => {
        const steps = generateBinarySearchSteps(input, 100)
        const lastStep = steps[steps.length - 1]
        expect(lastStep.type).toBe('not-found')
      })

      it('locates first element target', () => {
        const steps = generateBinarySearchSteps(input, 12)
        const matchStep = steps.find((s) => s.type === 'match-found')
        expect(matchStep).toBeDefined()
        expect(matchStep.values[matchStep.indices[0]]).toBe(12)
      })

      it('locates last element target', () => {
        const steps = generateBinarySearchSteps(input, 84)
        const matchStep = steps.find((s) => s.type === 'match-found')
        expect(matchStep).toBeDefined()
        expect(matchStep.values[matchStep.indices[0]]).toBe(84)
      })

      it('handles duplicates in binary search dataset', () => {
        const duplicateInput = [5, 10, 10, 20, 30]
        const steps = generateBinarySearchSteps(duplicateInput, 10)
        const matchStep = steps.find((s) => s.type === 'match-found')
        expect(matchStep).toBeDefined()
        expect(matchStep.values[matchStep.indices[0]]).toBe(10)
      })

      it('handles empty input array cleanly', () => {
        const steps = generateBinarySearchSteps([], 42)
        expect(steps.length).toBe(1)
        expect(steps[0].type).toBe('not-found')
      })

      it('never mutates input array', () => {
        const unsortedInput = [50, 10, 40, 20, 30]
        const copy = [...unsortedInput]
        generateBinarySearchSteps(unsortedInput, 30)
        expect(unsortedInput).toEqual(copy)
      })
    })

    describe('Searching Dispatcher (generateSearchingSteps)', () => {
      it('dispatches to linear-search and binary-search', () => {
        const linear = generateSearchingSteps('linear-search', [1, 2, 3, 4], 3)
        expect(linear.some((s) => s.type === 'match-found')).toBe(true)

        const binary = generateSearchingSteps('binary-search', [1, 2, 3, 4], 3)
        expect(binary.some((s) => s.type === 'match-found')).toBe(true)
      })

      it('throws error for unsupported searching algorithm ID', () => {
        expect(() => generateSearchingSteps('jump-search', [1, 2, 3], 2)).toThrow(
          'Unsupported searching algorithm ID: "jump-search"'
        )
      })
    })
  })
})
