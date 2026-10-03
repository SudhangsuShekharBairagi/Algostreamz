/**
 * Centralized Algorithms Registry for Algostreamz.
 * Single source of truth for visualizers, pseudocode viewers, and explanation engines.
 */

export const ALGORITHMS = [
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'Sorting',
    description:
      'Bubble Sort repeatedly steps through the input list, comparing adjacent elements and swapping them if they are in the wrong order. This process is repeated until no swaps are needed, effectively bubbling the largest unsorted element to its correct position in each pass.',
    complexity: {
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)',
      space: 'O(1)',
    },
    properties: {
      stable: true,
      inPlace: true,
      method: 'Exchanging',
    },
    pseudocode: [
      { line: 1, indent: 0, text: 'procedure bubbleSort(A : list of sortable items)' },
      { line: 2, indent: 1, text: 'n := length(A)' },
      { line: 3, indent: 1, text: 'for i := 0 to n - 2 do' },
      { line: 4, indent: 2, text: 'swapped := false' },
      { line: 5, indent: 2, text: 'for j := 0 to n - i - 2 do' },
      { line: 6, indent: 3, text: 'if A[j] > A[j + 1] then' },
      { line: 7, indent: 4, text: 'swap(A[j], A[j + 1])' },
      { line: 8, indent: 4, text: 'swapped := true' },
      { line: 9, indent: 2, text: 'if not swapped then break' },
    ],
    supportedOperations: ['compare', 'swap', 'sorted', 'revert'],
    defaultInput: [44, 27, 89, 15, 62, 38, 71, 10],
  },
  {
    id: 'selection-sort',
    name: 'Selection Sort',
    category: 'Sorting',
    description:
      'Selection Sort divides the list into a sorted and an unsorted region, continuously finding the minimum element from the unsorted segment. It swaps that minimum element with the leftmost unsorted element, expanding the sorted section step by step.',
    complexity: {
      best: 'O(n²)',
      average: 'O(n²)',
      worst: 'O(n²)',
      space: 'O(1)',
    },
    properties: {
      stable: false,
      inPlace: true,
      method: 'Selection',
    },
    pseudocode: [
      { line: 1, indent: 0, text: 'procedure selectionSort(A : list of sortable items)' },
      { line: 2, indent: 1, text: 'n := length(A)' },
      { line: 3, indent: 1, text: 'for i := 0 to n - 2 do' },
      { line: 4, indent: 2, text: 'minIdx := i' },
      { line: 5, indent: 2, text: 'for j := i + 1 to n - 1 do' },
      { line: 6, indent: 3, text: 'if A[j] < A[minIdx] then' },
      { line: 7, indent: 4, text: 'minIdx := j' },
      { line: 8, indent: 2, text: 'if minIdx != i then' },
      { line: 9, indent: 3, text: 'swap(A[i], A[minIdx])' },
    ],
    supportedOperations: ['compare', 'swap', 'sorted', 'pivot'],
    defaultInput: [53, 19, 82, 41, 12, 67, 34],
  },
  {
    id: 'insertion-sort',
    name: 'Insertion Sort',
    category: 'Sorting',
    description:
      'Insertion Sort builds a sorted array one item at a time by repeatedly taking the next element from the unsorted section. It shifts all larger elements in the sorted portion to the right until the correct position for the current element is found.',
    complexity: {
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)',
      space: 'O(1)',
    },
    properties: {
      stable: true,
      inPlace: true,
      method: 'Insertion',
    },
    pseudocode: [
      { line: 1, indent: 0, text: 'procedure insertionSort(A : list of sortable items)' },
      { line: 2, indent: 1, text: 'n := length(A)' },
      { line: 3, indent: 1, text: 'for i := 1 to n - 1 do' },
      { line: 4, indent: 2, text: 'key := A[i]' },
      { line: 5, indent: 2, text: 'j := i - 1' },
      { line: 6, indent: 2, text: 'while j >= 0 and A[j] > key do' },
      { line: 7, indent: 3, text: 'A[j + 1] := A[j]' },
      { line: 8, indent: 3, text: 'j := j - 1' },
      { line: 9, indent: 2, text: 'A[j + 1] := key' },
    ],
    supportedOperations: ['compare', 'swap', 'shift', 'sorted'],
    defaultInput: [38, 27, 43, 3, 9, 82, 10],
  },
  {
    id: 'merge-sort',
    name: 'Merge Sort',
    category: 'Sorting',
    description:
      'Merge Sort is an efficient, stable, divide-and-conquer algorithm. It recursively splits the input array into equal halves until single elements remain, then merges the sorted halves back together in ascending order.',
    complexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
      space: 'O(n)',
    },
    properties: {
      stable: true,
      inPlace: false,
      method: 'Merging',
    },
    pseudocode: [
      { line: 1, indent: 0, text: 'procedure mergeSort(A : list, low : int, high : int)' },
      { line: 2, indent: 1, text: 'if low < high then' },
      { line: 3, indent: 2, text: 'mid := floor((low + high) / 2)' },
      { line: 4, indent: 2, text: 'mergeSort(A, low, mid)' },
      { line: 5, indent: 2, text: 'mergeSort(A, mid + 1, high)' },
      { line: 6, indent: 2, text: 'merge(A, low, mid, high)' },
      { line: 7, indent: 1, text: 'procedure merge(A, low, mid, high)' },
      { line: 8, indent: 2, text: 'while left <= mid and right <= high do' },
      { line: 9, indent: 3, text: 'A[k] := min(leftVal, rightVal)' },
      { line: 10, indent: 2, text: 'copy remaining elements to A' },
    ],
    supportedOperations: ['compare', 'swap', 'overwrite', 'select', 'sorted'],
    defaultInput: [38, 27, 43, 3, 9, 82, 10],
  },
  {
    id: 'quick-sort',
    name: 'Quick Sort',
    category: 'Sorting',
    description:
      'Quick Sort is a highly efficient divide-and-conquer algorithm that selects a pivot element and partitions the array such that smaller elements move to the left and larger elements move to the right.',
    complexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n²)',
      space: 'O(log n)',
    },
    properties: {
      stable: false,
      inPlace: true,
      method: 'Partitioning',
    },
    pseudocode: [
      { line: 1, indent: 0, text: 'procedure quickSort(A : list, low : int, high : int)' },
      { line: 2, indent: 1, text: 'if low < high then' },
      { line: 3, indent: 2, text: 'pivotIdx := partition(A, low, high)' },
      { line: 4, indent: 2, text: 'quickSort(A, low, pivotIdx - 1)' },
      { line: 5, indent: 2, text: 'quickSort(A, pivotIdx + 1, high)' },
      { line: 6, indent: 1, text: 'procedure partition(A, low, high)' },
      { line: 7, indent: 2, text: 'pivot := A[high], i := low - 1' },
      { line: 8, indent: 2, text: 'for j := low to high - 1 do' },
      { line: 9, indent: 3, text: 'if A[j] < pivot then i++, swap(A[i], A[j])' },
      { line: 10, indent: 2, text: 'swap(A[i + 1], A[high]), return i + 1' },
    ],
    supportedOperations: ['compare', 'swap', 'select', 'pivot', 'sorted'],
    defaultInput: [44, 27, 89, 15, 62, 38, 71, 10],
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'Searching',
    description:
      'Binary Search efficiently locates a target value within a sorted array by repeatedly halving the search interval. It compares the target with the middle element, narrowing the search space to either the left or right half until the element is found or the search space is exhausted.',
    complexity: {
      best: 'O(1)',
      average: 'O(log n)',
      worst: 'O(log n)',
      space: 'O(1)',
    },
    properties: {
      stable: true,
      inPlace: true,
      method: 'Decrease & Conquer',
    },
    pseudocode: [
      { line: 1, indent: 0, text: 'procedure binarySearch(A : sorted list, target : value)' },
      { line: 2, indent: 1, text: 'low := 0, high := length(A) - 1' },
      { line: 3, indent: 1, text: 'while low <= high do' },
      { line: 4, indent: 2, text: 'mid := floor((low + high) / 2)' },
      { line: 5, indent: 2, text: 'if A[mid] == target then' },
      { line: 6, indent: 3, text: 'return mid' },
      { line: 7, indent: 2, text: 'else if A[mid] < target then' },
      { line: 8, indent: 3, text: 'low := mid + 1' },
      { line: 9, indent: 2, text: 'else' },
      { line: 10, indent: 3, text: 'high := mid - 1' },
      { line: 11, indent: 1, text: 'return -1' },
    ],
    supportedOperations: ['compare', 'sorted', 'pivot', 'match'],
    defaultInput: { array: [12, 24, 36, 48, 60, 72, 84, 96], target: 60 },
  },
  {
    id: 'linear-search',
    name: 'Linear Search',
    category: 'Searching',
    description:
      'Linear Search checks each element of a collection sequentially from start to end until a match for the target value is found. It requires no prior sorting and works on arbitrary arrays, making it straightforward but inefficient for large datasets.',
    complexity: {
      best: 'O(1)',
      average: 'O(n)',
      worst: 'O(n)',
      space: 'O(1)',
    },
    properties: {
      stable: true,
      inPlace: true,
      method: 'Sequential',
    },
    pseudocode: [
      { line: 1, indent: 0, text: 'procedure linearSearch(A : list, target : value)' },
      { line: 2, indent: 1, text: 'n := length(A)' },
      { line: 3, indent: 1, text: 'for i := 0 to n - 1 do' },
      { line: 4, indent: 2, text: 'if A[i] == target then' },
      { line: 5, indent: 3, text: 'return i' },
      { line: 6, indent: 1, text: 'return -1' },
    ],
    supportedOperations: ['compare', 'match', 'sorted'],
    defaultInput: { array: [45, 12, 89, 33, 77, 21, 64], target: 33 },
  },
]

/** Map indexed by algorithm id for O(1) direct lookups */
export const ALGORITHMS_MAP = ALGORITHMS.reduce((acc, algo) => {
  acc[algo.id] = algo
  return acc
}, {})

/**
 * Retrieve algorithm metadata by unique ID.
 * Returns `undefined` for unknown IDs to allow views to render 404 / NotFound states.
 *
 * @param {string} id - Unique algorithm identifier
 * @returns {import('./algorithmsData').Algorithm | undefined}
 */
export function getAlgorithmById(id) {
  if (!id || typeof id !== 'string') return undefined
  return ALGORITHMS_MAP[id]
}

export default ALGORITHMS
