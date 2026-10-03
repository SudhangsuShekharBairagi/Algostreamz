/**
 * Pure JavaScript step generators for Searching Algorithms.
 *
 * Algorithms MUST NOT mutate React state or touch the DOM directly.
 * Emits serialized step objects representing atomic search operations:
 * 'pointer-move', 'compare', 'match-found', 'eliminate-left', 'eliminate-right', 'not-found'.
 */

/**
 * Generate execution steps for Linear Search.
 *
 * @param {number[]} inputArray - Target search array
 * @param {number} target - Element to search for
 * @returns {Array<import('./stepTypes').Step>}
 */
export function generateLinearSearchSteps(inputArray = [], target) {
  const arr = [...inputArray]
  const n = arr.length
  const steps = []
  let stepIndex = 0
  let comparisons = 0
  let arrayAccesses = 0

  const addStep = (type, indices, pseudocodeLine, beginner, technical, extraHighlights = {}) => {
    steps.push({
      stepIndex: stepIndex++,
      type,
      indices: [...indices],
      values: [...arr],
      highlightedIndices: { ...extraHighlights },
      pseudocodeLine,
      explanation: {
        beginner,
        technical,
      },
      stats: {
        comparisons,
        arrayAccesses,
      },
    })
  }

  if (n === 0) {
    addStep(
      'not-found',
      [],
      6,
      `Array is empty. Target ${target} cannot be found.`,
      'Input array length is 0. Returning -1.'
    )
    return steps
  }

  for (let i = 0; i < n; i++) {
    arrayAccesses++
    addStep(
      'pointer-move',
      [i],
      3,
      `Inspecting position ${i} containing value ${arr[i]}.`,
      `Iterating loop counter i = ${i}, accessing A[${i}].`,
      { [i]: 'pivot' }
    )

    comparisons++
    addStep(
      'compare',
      [i],
      4,
      `Comparing current value ${arr[i]} with target value ${target}.`,
      `Evaluating condition A[${i}] (${arr[i]}) == target (${target}).`,
      { [i]: 'comparing' }
    )

    if (arr[i] === target) {
      addStep(
        'match-found',
        [i],
        5,
        `Match found! Target ${target} is located at index ${i}.`,
        `Condition A[${i}] == target evaluates to true. Returning index ${i}.`,
        { [i]: 'sorted' }
      )
      return steps
    }
  }

  addStep(
    'not-found',
    [],
    6,
    `Search complete. Target ${target} was not found in the array after checking all ${n} elements.`,
    `Exhausted loop from index 0 to ${n - 1} without a match. Returning -1.`,
    {}
  )

  return steps
}

/**
 * Generate execution steps for Binary Search.
 * Auto-sorts input copy if unsorted to guarantee binary search invariant.
 *
 * @param {number[]} inputArray - Search array (auto-sorted internally)
 * @param {number} target - Element to search for
 * @returns {Array<import('./stepTypes').Step>}
 */
export function generateBinarySearchSteps(inputArray = [], target) {
  // Binary Search operates on a sorted baseline
  const arr = [...inputArray].sort((a, b) => a - b)
  const n = arr.length
  const steps = []
  let stepIndex = 0
  let comparisons = 0
  let arrayAccesses = 0

  const eliminatedIndices = new Set()

  const addStep = (
    type,
    indices,
    pointers,
    activeRange,
    pseudocodeLine,
    beginner,
    technical,
    extraHighlights = {}
  ) => {
    const highlightedIndices = {}
    eliminatedIndices.forEach((idx) => {
      highlightedIndices[idx] = 'eliminated'
    })
    Object.assign(highlightedIndices, extraHighlights)

    steps.push({
      stepIndex: stepIndex++,
      type,
      indices: [...indices],
      values: [...arr],
      pointers: { ...pointers },
      activeRange: [...activeRange],
      highlightedIndices,
      pseudocodeLine,
      explanation: {
        beginner,
        technical,
      },
      stats: {
        comparisons,
        arrayAccesses,
      },
    })
  }

  if (n === 0) {
    addStep(
      'not-found',
      [],
      { low: 0, mid: null, high: -1 },
      [0, -1],
      11,
      `Array is empty. Target ${target} cannot be found.`,
      'Input array length is 0. Returning -1.'
    )
    return steps
  }

  let low = 0
  let high = n - 1

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    arrayAccesses++

    addStep(
      'pointer-move',
      [mid],
      { low, mid, high },
      [low, high],
      4,
      `Calculated middle index ${mid} = Math.floor((${low} + ${high}) / 2) with value ${arr[mid]}.`,
      `Updated search window pointers: low = ${low}, high = ${high}, mid = ${mid} (value ${arr[mid]}).`,
      { [mid]: 'pivot', [low]: 'comparing', [high]: 'comparing' }
    )

    comparisons++
    addStep(
      'compare',
      [mid],
      { low, mid, high },
      [low, high],
      5,
      `Comparing middle element ${arr[mid]} at index ${mid} with target ${target}.`,
      `Evaluating condition A[${mid}] (${arr[mid]}) == target (${target}).`,
      { [mid]: 'comparing', [low]: 'comparing', [high]: 'comparing' }
    )

    if (arr[mid] === target) {
      addStep(
        'match-found',
        [mid],
        { low, mid, high },
        [low, high],
        6,
        `Match found! Target ${target} is located at middle index ${mid}.`,
        `Condition A[${mid}] == target holds true. Returning index ${mid}.`,
        { [mid]: 'sorted' }
      )
      return steps
    } else if (arr[mid] < target) {
      const discardedRange = Array.from({ length: mid - low + 1 }, (_, k) => low + k)
      discardedRange.forEach((idx) => eliminatedIndices.add(idx))

      addStep(
        'eliminate-left',
        discardedRange,
        { low, mid, high },
        [low, high],
        8,
        `Middle element ${arr[mid]} is smaller than target ${target}. Discarding left half (indices ${low} to ${mid}).`,
        `A[${mid}] (${arr[mid]}) < target (${target}). Eliminating subarray A[${low}..${mid}]. Updating low = ${mid + 1}.`,
        { [mid]: 'eliminated' }
      )

      low = mid + 1
    } else {
      const discardedRange = Array.from({ length: high - mid + 1 }, (_, k) => mid + k)
      discardedRange.forEach((idx) => eliminatedIndices.add(idx))

      addStep(
        'eliminate-right',
        discardedRange,
        { low, mid, high },
        [low, high],
        10,
        `Middle element ${arr[mid]} is larger than target ${target}. Discarding right half (indices ${mid} to ${high}).`,
        `A[${mid}] (${arr[mid]}) > target (${target}). Eliminating subarray A[${mid}..${high}]. Updating high = ${mid - 1}.`,
        { [mid]: 'eliminated' }
      )

      high = mid - 1
    }
  }

  addStep(
    'not-found',
    [],
    { low, mid: null, high },
    [low, high],
    11,
    `Search range collapsed (low ${low} > high ${high}). Target ${target} is not in the array.`,
    `Search window bounds exhausted: low (${low}) > high (${high}). Target not present. Returning -1.`,
    {}
  )

  return steps
}

/**
 * Dispatcher function to generate steps for any supported searching algorithm.
 *
 * @param {'linear-search' | 'binary-search'} algorithmId
 * @param {number[]} inputArray
 * @param {number} target
 * @returns {Array<import('./stepTypes').Step>}
 */
export function generateSearchingSteps(algorithmId, inputArray, target) {
  switch (algorithmId) {
    case 'linear-search':
      return generateLinearSearchSteps(inputArray, target)
    case 'binary-search':
      return generateBinarySearchSteps(inputArray, target)
    default:
      throw new Error(`Unsupported searching algorithm ID: "${algorithmId}"`)
  }
}

export default {
  generateLinearSearchSteps,
  generateBinarySearchSteps,
  generateSearchingSteps,
}
