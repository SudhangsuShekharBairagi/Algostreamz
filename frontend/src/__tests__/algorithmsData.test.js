import { describe, it, expect } from 'vitest'
import { ALGORITHMS, ALGORITHMS_MAP, getAlgorithmById } from '../data/algorithmsData'

describe('algorithmsData registry', () => {
  it('exports all 7 registered algorithms', () => {
    expect(ALGORITHMS).toHaveLength(7)
    const ids = ALGORITHMS.map((a) => a.id)
    expect(ids).toEqual([
      'bubble-sort',
      'selection-sort',
      'insertion-sort',
      'merge-sort',
      'quick-sort',
      'binary-search',
      'linear-search',
    ])
  })

  it('validates algorithm schema fields', () => {
    ALGORITHMS.forEach((algo) => {
      expect(algo).toHaveProperty('id')
      expect(algo).toHaveProperty('name')
      expect(algo).toHaveProperty('category')
      expect(algo).toHaveProperty('description')
      expect(algo).toHaveProperty('complexity')
      expect(algo.complexity).toHaveProperty('best')
      expect(algo.complexity).toHaveProperty('average')
      expect(algo.complexity).toHaveProperty('worst')
      expect(algo.complexity).toHaveProperty('space')
      expect(algo).toHaveProperty('properties')
      expect(typeof algo.properties.stable).toBe('boolean')
      expect(typeof algo.properties.inPlace).toBe('boolean')
      expect(typeof algo.properties.method).toBe('string')
      expect(Array.isArray(algo.pseudocode)).toBe(true)
      expect(Array.isArray(algo.supportedOperations)).toBe(true)
      expect(algo.defaultInput).toBeDefined()
    })
  })

  it('retrieves algorithm by id using getAlgorithmById', () => {
    const bubbleSort = getAlgorithmById('bubble-sort')
    expect(bubbleSort).toBeDefined()
    expect(bubbleSort?.name).toBe('Bubble Sort')

    const mergeSort = getAlgorithmById('merge-sort')
    expect(mergeSort).toBeDefined()
    expect(mergeSort?.name).toBe('Merge Sort')

    const quickSort = getAlgorithmById('quick-sort')
    expect(quickSort).toBeDefined()
    expect(quickSort?.name).toBe('Quick Sort')
  })

  it('returns undefined for unknown or invalid IDs', () => {
    expect(getAlgorithmById('unknown-algo')).toBeUndefined()
    expect(getAlgorithmById('')).toBeUndefined()
    expect(getAlgorithmById(null)).toBeUndefined()
  })
})
