/**
 * Pure JavaScript step generators for Advanced Sorting Algorithms (Merge Sort & Quick Sort).
 *
 * Algorithms MUST NOT mutate React state or touch the DOM directly.
 * Every step contains a complete, immutable snapshot of array state to allow seamless
 * backward and forward stepping without desynchronization.
 */

/**
 * Generate execution steps for Merge Sort.
 *
 * @param {number[]} initialArray
 * @returns {Array<import('./stepTypes').Step>}
 */
export function generateMergeSortSteps(initialArray = []) {
  const arr = [...initialArray]
  const n = arr.length
  const steps = []
  let stepIndex = 0
  let comparisons = 0
  let swaps = 0
  let arrayAccesses = 0

  const sortedSet = new Set()

  const addStep = (
    type,
    indices,
    pseudocodeLine,
    beginner,
    technical,
    extraHighlights = {},
    auxiliarySubarrays = null
  ) => {
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
      auxiliarySubarrays: auxiliarySubarrays ? { ...auxiliarySubarrays } : null,
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
      'Array with 1 element is inherently sorted.',
      'Base case reached: length is 1.'
    )
    return steps
  }

  function merge(low, mid, high) {
    const leftArr = arr.slice(low, mid + 1)
    const rightArr = arr.slice(mid + 1, high + 1)
    arrayAccesses += (mid - low + 1) + (high - mid)

    addStep(
      'select',
      Array.from({ length: high - low + 1 }, (_, k) => low + k),
      6,
      `Merging sorted left subarray [${leftArr.join(', ')}] and right subarray [${rightArr.join(', ')}].`,
      `Invoking merge(A, low=${low}, mid=${mid}, high=${high}).`,
      Object.fromEntries(Array.from({ length: high - low + 1 }, (_, k) => [low + k, 'comparing'])),
      { left: [...leftArr], right: [...rightArr], activeRange: [low, high] }
    )

    let i = 0
    let j = 0
    let k = low

    while (i < leftArr.length && j < rightArr.length) {
      comparisons++
      arrayAccesses += 2

      addStep(
        'compare',
        [low + i, mid + 1 + j],
        8,
        `Comparing left element ${leftArr[i]} with right element ${rightArr[j]}.`,
        `Evaluating condition left[${i}] (${leftArr[i]}) <= right[${j}] (${rightArr[j]}).`,
        { [low + i]: 'comparing', [mid + 1 + j]: 'comparing' },
        { left: [...leftArr.slice(i)], right: [...rightArr.slice(j)], activeRange: [low, high] }
      )

      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i]
        arrayAccesses++
        swaps++

        addStep(
          'overwrite',
          [k],
          9,
          `Placing smaller element ${leftArr[i]} into main array position ${k}.`,
          `Overwriting A[${k}] = ${leftArr[i]}.`,
          { [k]: 'swapping' },
          { left: [...leftArr.slice(i + 1)], right: [...rightArr.slice(j)], activeRange: [low, high] }
        )
        i++
      } else {
        arr[k] = rightArr[j]
        arrayAccesses++
        swaps++

        addStep(
          'overwrite',
          [k],
          9,
          `Placing smaller element ${rightArr[j]} into main array position ${k}.`,
          `Overwriting A[${k}] = ${rightArr[j]}.`,
          { [k]: 'swapping' },
          { left: [...leftArr.slice(i)], right: [...rightArr.slice(j + 1)], activeRange: [low, high] }
        )
        j++
      }
      k++
    }

    while (i < leftArr.length) {
      arr[k] = leftArr[i]
      arrayAccesses++
      addStep(
        'overwrite',
        [k],
        10,
        `Copying remaining left element ${leftArr[i]} to position ${k}.`,
        `Overwriting A[${k}] = ${leftArr[i]}.`,
        { [k]: 'swapping' }
      )
      i++
      k++
    }

    while (j < rightArr.length) {
      arr[k] = rightArr[j]
      arrayAccesses++
      addStep(
        'overwrite',
        [k],
        10,
        `Copying remaining right element ${rightArr[j]} to position ${k}.`,
        `Overwriting A[${k}] = ${rightArr[j]}.`,
        { [k]: 'swapping' }
      )
      j++
      k++
    }
  }

  function mergeSortRecursive(low, high) {
    if (low < high) {
      const mid = Math.floor((low + high) / 2)
      addStep(
        'select',
        [low, mid, high],
        3,
        `Splitting subarray range [${low}..${high}] at midpoint index ${mid}.`,
        `Calculated mid = Math.floor((${low} + ${high}) / 2) = ${mid}.`,
        { [mid]: 'pivot', [low]: 'comparing', [high]: 'comparing' }
      )

      mergeSortRecursive(low, mid)
      mergeSortRecursive(mid + 1, high)
      merge(low, mid, high)
    }
  }

  mergeSortRecursive(0, n - 1)

  for (let idx = 0; idx < n; idx++) {
    sortedSet.add(idx)
  }

  addStep(
    'mark-sorted',
    Array.from({ length: n }, (_, k) => k),
    1,
    'Merge Sort complete! All subarrays merged into final sorted sequence.',
    'Recursion tree fully processed. Final array state verified.',
    Object.fromEntries(Array.from({ length: n }, (_, k) => [k, 'sorted']))
  )

  return steps
}

/**
 * Generate execution steps for Quick Sort (Lomuto Partitioning).
 *
 * @param {number[]} initialArray
 * @returns {Array<import('./stepTypes').Step>}
 */
export function generateQuickSortSteps(initialArray = []) {
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
      'Single element array is inherently sorted.',
      'Base case reached: length is 1.'
    )
    return steps
  }

  function partition(low, high) {
    const pivot = arr[high]
    arrayAccesses++
    addStep(
      'select',
      [high],
      7,
      `Selected pivot ${pivot} at index ${high} for partitioning subarray [${low}..${high}].`,
      `Set pivot = A[${high}] (${pivot}), i = ${low - 1}.`,
      { [high]: 'pivot' }
    )

    let i = low - 1

    for (let j = low; j < high; j++) {
      comparisons++
      arrayAccesses++

      addStep(
        'compare',
        [j, high],
        9,
        `Comparing element ${arr[j]} at index ${j} with pivot ${pivot}.`,
        `Evaluating A[${j}] (${arr[j]}) < pivot (${pivot}).`,
        { [j]: 'comparing', [high]: 'pivot', ...(i >= low ? { [i]: 'comparing' } : {}) }
      )

      if (arr[j] < pivot) {
        i++
        if (i !== j) {
          const temp = arr[i]
          arr[i] = arr[j]
          arr[j] = temp
          swaps++
          arrayAccesses += 4

          addStep(
            'swap',
            [i, j],
            9,
            `Swapping element ${arr[i]} at index ${j} into left partition index ${i}.`,
            `Executed swap A[${i}] <-> A[${j}]. Array: [${arr.join(', ')}].`,
            { [i]: 'swapping', [j]: 'swapping', [high]: 'pivot' }
          )
        }
      }
    }

    const pivotTargetIdx = i + 1
    if (pivotTargetIdx !== high) {
      const temp = arr[pivotTargetIdx]
      arr[pivotTargetIdx] = arr[high]
      arr[high] = temp
      swaps++
      arrayAccesses += 4

      addStep(
        'swap',
        [pivotTargetIdx, high],
        10,
        `Placing pivot ${arr[pivotTargetIdx]} into its final sorted position at index ${pivotTargetIdx}.`,
        `Executed swap between A[${pivotTargetIdx}] and pivot at A[${high}].`,
        { [pivotTargetIdx]: 'swapping', [high]: 'swapping' }
      )
    }

    sortedSet.add(pivotTargetIdx)
    addStep(
      'mark-sorted',
      [pivotTargetIdx],
      10,
      `Pivot ${arr[pivotTargetIdx]} is now locked at index ${pivotTargetIdx}.`,
      `Partition completed. Index ${pivotTargetIdx} is locked in final position.`,
      { [pivotTargetIdx]: 'sorted' }
    )

    return pivotTargetIdx
  }

  function quickSortRecursive(low, high) {
    if (low < high) {
      const pivotIdx = partition(low, high)
      quickSortRecursive(low, pivotIdx - 1)
      quickSortRecursive(pivotIdx + 1, high)
    } else if (low === high) {
      sortedSet.add(low)
      addStep(
        'mark-sorted',
        [low],
        1,
        `Subarray at index ${low} contains 1 element and is sorted.`,
        `Base case low == high == ${low}.`,
        { [low]: 'sorted' }
      )
    }
  }

  quickSortRecursive(0, n - 1)

  for (let k = 0; k < n; k++) {
    sortedSet.add(k)
  }

  addStep(
    'mark-sorted',
    Array.from({ length: n }, (_, k) => k),
    1,
    'Quick Sort complete! All pivots partitioned and elements sorted.',
    'Recursion completed. Final array state verified.',
    Object.fromEntries(Array.from({ length: n }, (_, k) => [k, 'sorted']))
  )

  return steps
}

/**
 * Dispatcher function to generate steps for advanced sorting algorithms.
 *
 * @param {'merge-sort' | 'quick-sort'} algorithmId
 * @param {number[]} initialArray
 * @returns {Array<import('./stepTypes').Step>}
 */
export function generateAdvancedSortingSteps(algorithmId, initialArray) {
  switch (algorithmId) {
    case 'merge-sort':
      return generateMergeSortSteps(initialArray)
    case 'quick-sort':
      return generateQuickSortSteps(initialArray)
    default:
      throw new Error(`Unsupported advanced sorting algorithm ID: "${algorithmId}"`)
  }
}

export default {
  generateMergeSortSteps,
  generateQuickSortSteps,
  generateAdvancedSortingSteps,
}
