import { describe, expect, it } from 'vitest'
import { benchmarkAlgorithms, BENCHMARK_SIZES, countAlgorithmOperations } from '../engine/benchmarks'
import { generateSortingSteps } from '../engine/sortingGenerators'

describe('benchmarkAlgorithms', () => {
  it('returns operation totals and theoretical curves for each requested algorithm and size', () => {
    const { results, chartData } = benchmarkAlgorithms(['bubble-sort', 'merge-sort'])

    expect(results.map((result) => result.algorithm.id)).toEqual(['bubble-sort', 'merge-sort'])
    expect(chartData.map((point) => point.size)).toEqual(BENCHMARK_SIZES)

    for (const result of results) {
      expect(result.samples).toHaveLength(BENCHMARK_SIZES.length)
      for (const sample of result.samples) {
        expect(sample.operations).toBe(sample.comparisons + sample.swaps)
        expect(sample.operations).toBeGreaterThan(0)
      }
      expect(chartData[0][`${result.algorithm.id}-theoretical`]).toBeGreaterThan(0)
      expect(chartData.at(-1)[`${result.algorithm.id}-theoretical`])
        .toBe(result.samples.at(-1).operations)
    }
  })

  it('matches trace-engine operation counters on representative input', () => {
    const input = [7, 2, 9, 1, 6]
    const cases = ['bubble-sort', 'selection-sort', 'insertion-sort', 'merge-sort', 'quick-sort']
    for (const algorithmId of cases) {
      const trace = generateSortingSteps(algorithmId, input).at(-1).stats
      const measured = countAlgorithmOperations(algorithmId, input)
      expect(measured.comparisons).toBe(trace.comparisons)
      expect(measured.swaps).toBe(trace.swaps)
    }
  })
})
