import { generateMergeSortSteps, generateQuickSortSteps } from './advancedSorting'

/**
 * Pure JavaScript step generators for Sorting Algorithms.
 *
 * Algorithms MUST NOT mutate React state or touch the DOM directly.
 * Every function takes an initial array and returns an immutable array of step objects
 * describing atomic comparisons, swaps, selections, overwrites, and sorting milestones.
 */

/**
 * Generate execution steps for Bubble Sort.
 *
 * @param {number[]} initialArray
 * @returns {Array<import('./stepTypes').Step>}
 */
export function generateBubbleSortSteps(initialArray = []) {
  const arr = [...initialArray]
  const n = arr.length
  const steps = []
  let stepIndex = 0
  let comparisons = 0
  let swaps = 0
  let arrayAccesses = 0

  const sortedSet = new Set()

  const addStep = (type, indices, pseudocodeLine, beginner, technical, extraHighlights = {}) => {
    const highlightedIndices = {}
    sortedSet.forEach((idx) => {
      highlightedIndices[idx] = 'sorted'
    })
    Object.assign(highlightedIndices, extraHighlights)

    steps.push({
      stepIndex: stepIndex++,
      type,
      indices: [...indices],
      values: [...arr],
      highlightedIndices,
      pseudocodeLine,
      explanation: {
        beginner,
        technical,
      },
      stats: {
        comparisons,
        swaps,
        arrayAccesses,
      },
    })
  }

  if (n === 0) {
    addStep('mark-sorted', [], 1, 'Array is empty.', 'Initial array length is 0; sorting completed.')
    return steps
  }

  if (n === 1) {
    sortedSet.add(0)
    addStep(
      'mark-sorted',
      [0],
      1,
      'Array with 1 element is already sorted.',
      'Initial array length is 1; element at index 0 is inherently sorted.'
    )
    return steps
  }

  for (let i = 0; i < n - 1; i++) {
    let swapped = false
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++
      arrayAccesses += 2
      addStep(
        'compare',
        [j, j + 1],
        6,
        `Comparing ${arr[j]} at index ${j} with ${arr[j + 1]} at index ${j + 1}.`,
        `Evaluating condition A[${j}] (${arr[j]}) > A[${j + 1}] (${arr[j + 1]}).`,
        { [j]: 'comparing', [j + 1]: 'comparing' }
      )

      if (arr[j] > arr[j + 1]) {
        const temp = arr[j]
        arr[j] = arr[j + 1]
        arr[j + 1] = temp
        swaps++
        arrayAccesses += 4
        swapped = true

        addStep(
          'swap',
          [j, j + 1],
          7,
          `Swapping ${arr[j + 1]} and ${arr[j]} because ${arr[j + 1]} < ${arr[j]}.`,
          `Condition satisfied. Swapped elements at indices ${j} and ${j + 1}. Array state: [${arr.join(', ')}].`,
          { [j]: 'swapping', [j + 1]: 'swapping' }
        )
      }
    }

    const sortedIdx = n - 1 - i
    sortedSet.add(sortedIdx)
    addStep(
      'mark-sorted',
      [sortedIdx],
      3,
      `Pass ${i + 1} complete. Value ${arr[sortedIdx]} at index ${sortedIdx} is now locked in its final sorted position.`,
      `Pass ${i + 1} completed. Invariant maintained: A[${sortedIdx}] is locked in sorted position.`,
      { [sortedIdx]: 'sorted' }
    )

    if (!swapped) {
      for (let k = 0; k < n; k++) {
        sortedSet.add(k)
      }
      addStep(
        'mark-sorted',
        Array.from({ length: n }, (_, k) => k),
        9,
        `No swaps occurred during pass ${i + 1}. The entire array is sorted!`,
        `Optimization break trigger: swapped == false. Entire array is verified sorted.`,
        Object.fromEntries(Array.from({ length: n }, (_, k) => [k, 'sorted']))
      )
      break
    }
  }

  if (!sortedSet.has(0)) {
    for (let k = 0; k < n; k++) sortedSet.add(k)
    addStep(
      'mark-sorted',
      Array.from({ length: n }, (_, k) => k),
      1,
      'Bubble Sort complete! All elements are sorted.',
      'Algorithm completed loop iterations. Final array state verified.',
      Object.fromEntries(Array.from({ length: n }, (_, k) => [k, 'sorted']))
    )
  }

  return steps
}

/**
 * Generate execution steps for Selection Sort.
 *
 * @param {number[]} initialArray
 * @returns {Array<import('./stepTypes').Step>}
 */
export function generateSelectionSortSteps(initialArray = []) {
  const arr = [...initialArray]
  const n = arr.length
  const steps = []
  let stepIndex = 0
  let comparisons = 0
  let swaps = 0
  let arrayAccesses = 0

  const sortedSet = new Set()

  const addStep = (type, indices, pseudocodeLine, beginner, technical, extraHighlights = {}) => {
    const highlightedIndices = {}
    sortedSet.forEach((idx) => {
      highlightedIndices[idx] = 'sorted'
    })
    Object.assign(highlightedIndices, extraHighlights)

    steps.push({
      stepIndex: stepIndex++,
      type,
      indices: [...indices],
      values: [...arr],
      highlightedIndices,
      pseudocodeLine,
      explanation: {
        beginner,
        technical,
      },
      stats: {
        comparisons,
        swaps,
        arrayAccesses,
      },
    })
  }

  if (n === 0) {
    addStep('mark-sorted', [], 1, 'Array is empty.', 'Initial array length is 0; sorting completed.')
    return steps
  }

  if (n === 1) {
    sortedSet.add(0)
    addStep(
      'mark-sorted',
      [0],
      1,
      'Array with 1 element is already sorted.',
      'Initial array length is 1; element at index 0 is inherently sorted.'
    )
    return steps
  }

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i
    arrayAccesses++
    addStep(
      'select',
      [i],
      4,
      `Starting search for minimum element from index ${i} (current candidate: ${arr[i]}).`,
      `Set minIdx = ${i} (value ${arr[i]}).`,
      { [i]: 'pivot' }
    )

    for (let j = i + 1; j < n; j++) {
      comparisons++
      arrayAccesses += 2
      addStep(
        'compare',
        [j, minIdx],
        6,
        `Comparing element ${arr[j]} at index ${j} with current minimum ${arr[minIdx]} at index ${minIdx}.`,
        `Evaluating A[${j}] (${arr[j]}) < A[${minIdx}] (${arr[minIdx]}).`,
        { [j]: 'comparing', [minIdx]: 'pivot' }
      )

      if (arr[j] < arr[minIdx]) {
        minIdx = j
        addStep(
          'select',
          [j],
          7,
          `Found a new minimum element ${arr[j]} at index ${j}.`,
          `Updated minIdx = ${j} (new minimum value: ${arr[j]}).`,
          { [j]: 'pivot' }
        )
      }
    }

    if (minIdx !== i) {
      const temp = arr[i]
      arr[i] = arr[minIdx]
      arr[minIdx] = temp
      swaps++
      arrayAccesses += 4

      addStep(
        'swap',
        [i, minIdx],
        9,
        `Swapping minimum element ${arr[i]} from index ${minIdx} into position ${i}.`,
        `Executed swap between A[${i}] and A[${minIdx}]. Array is now [${arr.join(', ')}].`,
        { [i]: 'swapping', [minIdx]: 'swapping' }
      )
    }

    sortedSet.add(i)
    addStep(
      'mark-sorted',
      [i],
      3,
      `Position ${i} is now locked with sorted value ${arr[i]}.`,
      `Index ${i} added to sorted partition.`,
      { [i]: 'sorted' }
    )
  }

  sortedSet.add(n - 1)
  addStep(
    'mark-sorted',
    Array.from({ length: n }, (_, k) => k),
    1,
    'Selection Sort complete! All elements are sorted in ascending order.',
    'Selection sort loop exhausted. Entire array state verified sorted.',
    Object.fromEntries(Array.from({ length: n }, (_, k) => [k, 'sorted']))
  )

  return steps
}

/**
 * Generate execution steps for Insertion Sort.
 *
 * @param {number[]} initialArray
 * @returns {Array<import('./stepTypes').Step>}
 */
export function generateInsertionSortSteps(initialArray = []) {
  const arr = [...initialArray]
  const n = arr.length
  const steps = []
  let stepIndex = 0
  let comparisons = 0
  let swaps = 0
  let arrayAccesses = 0

  const sortedSet = new Set()

  const addStep = (type, indices, pseudocodeLine, beginner, technical, extraHighlights = {}) => {
    const highlightedIndices = {}
    sortedSet.forEach((idx) => {
      highlightedIndices[idx] = 'sorted'
    })
    Object.assign(highlightedIndices, extraHighlights)

    steps.push({
      stepIndex: stepIndex++,
      type,
      indices: [...indices],
      values: [...arr],
      highlightedIndices,
      pseudocodeLine,
      explanation: {
        beginner,
        technical,
      },
      stats: {
        comparisons,
        swaps,
        arrayAccesses,
      },
    })
  }

  if (n === 0) {
    addStep('mark-sorted', [], 1, 'Array is empty.', 'Initial array length is 0; sorting completed.')
    return steps
  }

  sortedSet.add(0)
  addStep(
    'mark-sorted',
    [0],
    3,
    `Initial sorted partition contains element ${arr[0]} at index 0.`,
    `Base case: Subarray A[0..0] is sorted by definition.`,
    { [0]: 'sorted' }
  )

  for (let i = 1; i < n; i++) {
    const key = arr[i]
    arrayAccesses++
    addStep(
      'select',
      [i],
      4,
      `Picked key ${key} at index ${i} to insert into the sorted left portion.`,
      `Extracted key = A[${i}] (${key}).`,
      { [i]: 'pivot' }
    )

    let j = i - 1
    while (j >= 0) {
      comparisons++
      arrayAccesses++
      addStep(
        'compare',
        [j, i],
        6,
        `Comparing key ${key} with ${arr[j]} at index ${j}.`,
        `Evaluating condition A[${j}] (${arr[j]}) > key (${key}).`,
        { [j]: 'comparing', [i]: 'pivot' }
      )

      if (arr[j] > key) {
        arr[j + 1] = arr[j]
        arrayAccesses += 2
        swaps++
        addStep(
          'overwrite',
          [j + 1, j],
          7,
          `${arr[j]} is larger than key ${key}, so shifting ${arr[j]} right to index ${j + 1}.`,
          `Shifted A[${j}] to A[${j + 1}]. Array state is now [${arr.join(', ')}].`,
          { [j + 1]: 'swapping', [j]: 'comparing' }
        )
        j--
      } else {
        break
      }
    }

    arr[j + 1] = key
    arrayAccesses++
    addStep(
      'overwrite',
      [j + 1],
      9,
      `Inserted key ${key} into its correct sorted position at index ${j + 1}.`,
      `Placed key into A[${j + 1}]. Sorted subarray extended to length ${i + 1}.`,
      { [j + 1]: 'sorted' }
    )

    for (let k = 0; k <= i; k++) {
      sortedSet.add(k)
    }
  }

  addStep(
    'mark-sorted',
    Array.from({ length: n }, (_, k) => k),
    1,
    'Insertion Sort complete! All elements are sorted.',
    'Insertion sort completed for all n elements.',
    Object.fromEntries(Array.from({ length: n }, (_, k) => [k, 'sorted']))
  )

  return steps
}

/**
 * Dispatcher function to generate steps for any supported sorting algorithm.
 *
 * @param {'bubble-sort' | 'selection-sort' | 'insertion-sort' | 'merge-sort' | 'quick-sort'} algorithmId
 * @param {number[]} initialArray
 * @returns {Array<import('./stepTypes').Step>}
 */
export function generateSortingSteps(algorithmId, initialArray) {
  switch (algorithmId) {
    case 'bubble-sort':
      return generateBubbleSortSteps(initialArray)
    case 'selection-sort':
      return generateSelectionSortSteps(initialArray)
    case 'insertion-sort':
      return generateInsertionSortSteps(initialArray)
    case 'merge-sort':
      return generateMergeSortSteps(initialArray)
    case 'quick-sort':
      return generateQuickSortSteps(initialArray)
    default:
      throw new Error(`Unsupported sorting algorithm ID: "${algorithmId}"`)
  }
}

export default {
  generateBubbleSortSteps,
  generateSelectionSortSteps,
  generateInsertionSortSteps,
  generateMergeSortSteps,
  generateQuickSortSteps,
  generateSortingSteps,
}
