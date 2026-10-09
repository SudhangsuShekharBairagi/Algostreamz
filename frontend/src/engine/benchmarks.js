import { ALGORITHMS } from '../data/algorithmsData'

export const BENCHMARK_SIZES = [10, 50, 100, 500]

const SORTING_ALGORITHMS = ALGORITHMS.filter((algorithm) => algorithm.category === 'Sorting')

function createInput(size) {
  let seed = size * 7919 + 17
  return Array.from({ length: size }, () => {
    seed = (seed * 48271) % 2147483647
    return seed
  })
}

function countBubble(values) {
  const array = [...values]
  let comparisons = 0
  let swaps = 0
  for (let end = array.length - 1; end > 0; end--) {
    let changed = false
    for (let index = 0; index < end; index++) {
      comparisons++
      if (array[index] > array[index + 1]) {
        ;[array[index], array[index + 1]] = [array[index + 1], array[index]]
        swaps++
        changed = true
      }
    }
    if (!changed) break
  }
  return { comparisons, swaps }
}

function countSelection(values) {
  const array = [...values]
  let comparisons = 0
  let swaps = 0
  for (let start = 0; start < array.length - 1; start++) {
    let minimum = start
    for (let index = start + 1; index < array.length; index++) {
      comparisons++
      if (array[index] < array[minimum]) minimum = index
    }
    if (minimum !== start) {
      ;[array[start], array[minimum]] = [array[minimum], array[start]]
      swaps++
    }
  }
  return { comparisons, swaps }
}

function countInsertion(values) {
  const array = [...values]
  let comparisons = 0
  let swaps = 0
  for (let index = 1; index < array.length; index++) {
    const key = array[index]
    let cursor = index - 1
    while (cursor >= 0) {
      comparisons++
      if (array[cursor] <= key) break
      array[cursor + 1] = array[cursor]
      swaps++
      cursor--
    }
    array[cursor + 1] = key
  }
  return { comparisons, swaps }
}

function countMerge(values) {
  const array = [...values]
  let comparisons = 0
  let swaps = 0

  function mergeSort(start, end) {
    if (start >= end) return
    const middle = Math.floor((start + end) / 2)
    mergeSort(start, middle)
    mergeSort(middle + 1, end)
    const left = array.slice(start, middle + 1)
    const right = array.slice(middle + 1, end + 1)
    let leftIndex = 0
    let rightIndex = 0
    let output = start
    while (leftIndex < left.length && rightIndex < right.length) {
      comparisons++
      if (left[leftIndex] <= right[rightIndex]) {
        array[output++] = left[leftIndex++]
      } else {
        array[output++] = right[rightIndex++]
      }
      swaps++
    }
    while (leftIndex < left.length) array[output++] = left[leftIndex++]
    while (rightIndex < right.length) array[output++] = right[rightIndex++]
  }

  mergeSort(0, array.length - 1)
  return { comparisons, swaps }
}

function countQuick(values) {
  const array = [...values]
  let comparisons = 0
  let swaps = 0

  function partition(low, high) {
    const pivot = array[high]
    let boundary = low - 1
    for (let index = low; index < high; index++) {
      comparisons++
      if (array[index] < pivot) {
        boundary++
        if (boundary !== index) {
          ;[array[boundary], array[index]] = [array[index], array[boundary]]
          swaps++
        }
      }
    }
    const pivotIndex = boundary + 1
    if (pivotIndex !== high) {
      ;[array[pivotIndex], array[high]] = [array[high], array[pivotIndex]]
      swaps++
    }
    return pivotIndex
  }

  function quickSort(low, high) {
    if (low >= high) return
    const pivot = partition(low, high)
    quickSort(low, pivot - 1)
    quickSort(pivot + 1, high)
  }

  quickSort(0, array.length - 1)
  return { comparisons, swaps }
}

const COUNTERS = {
  'bubble-sort': countBubble,
  'selection-sort': countSelection,
  'insertion-sort': countInsertion,
  'merge-sort': countMerge,
  'quick-sort': countQuick,
}

export function countAlgorithmOperations(algorithmId, input) {
  const count = COUNTERS[algorithmId]
  if (!count) throw new Error(`Unsupported benchmark algorithm ID: "${algorithmId}"`)
  const { comparisons, swaps } = count(input)
  return { comparisons, swaps, operations: comparisons + swaps }
}

function theoreticalModel(complexity) {
  if (/n²|n\^2/.test(complexity)) return (size) => size * size
  if (/n\s*log\s*n/i.test(complexity)) return (size) => size * Math.log2(size)
  if (/log\s*n/i.test(complexity)) return (size) => Math.log2(size)
  return (size) => size
}

/**
 * Counts engine-equivalent comparisons and swaps/writes without creating step snapshots
 * or relying on machine-dependent wall-clock timings.
 */
export function benchmarkAlgorithms(algorithmIds = SORTING_ALGORITHMS.map((algorithm) => algorithm.id)) {
  const algorithms = SORTING_ALGORITHMS.filter((algorithm) => algorithmIds.includes(algorithm.id))
  const measured = algorithms.map((algorithm) => ({
    algorithm,
    samples: BENCHMARK_SIZES.map((size) => {
      return { size, ...countAlgorithmOperations(algorithm.id, createInput(size)) }
    }),
  }))

  const chartData = BENCHMARK_SIZES.map((size, index) => {
    const point = { size }
    for (const result of measured) {
      point[`${result.algorithm.id}-measured`] = result.samples[index].operations
      const model = theoreticalModel(result.algorithm.complexity.worst)
      const maxModel = model(BENCHMARK_SIZES.at(-1))
      const maxMeasured = result.samples.at(-1).operations
      point[`${result.algorithm.id}-theoretical`] = maxModel
        ? Math.round((model(size) / maxModel) * maxMeasured)
        : 0
    }
    return point
  })

  return { results: measured, chartData }
}

export default benchmarkAlgorithms
