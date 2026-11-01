import { describe, it, expect } from 'vitest'
import { ALGORITHMS, getAlgorithmById } from '../data/algorithmsData'
import { CODE_SNIPPETS } from '../data/codeSnippets'

describe('algorithmsData registry', () => {
  it('exports the registered sorting, searching, and data structure algorithms', () => {
    expect(ALGORITHMS).toHaveLength(14)
    const ids = ALGORITHMS.map((a) => a.id)
    expect(ids).toEqual([
      'bubble-sort',
      'selection-sort',
      'insertion-sort',
      'merge-sort',
      'quick-sort',
      'binary-search',
      'linear-search',
      'stack',
      'queue',
      'linked-list',
      'binary-search-tree',
      'bfs',
      'dfs',
      'dijkstra',
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

  it('provides all language snippets with valid pseudocode-to-code line mappings', () => {
    const languages = ['java', 'python', 'cpp']

    ALGORITHMS.forEach((algorithm) => {
      const snippets = CODE_SNIPPETS[algorithm.id]
      expect(snippets, `${algorithm.id} snippets`).toBeDefined()

      languages.forEach((language) => {
        const languageSnippet = snippets[language]
        expect(languageSnippet?.code, `${algorithm.id} ${language} code`).toBeTruthy()
        const codeLineCount = languageSnippet.code.split('\n').length
        expect(languageSnippet.lineMap, `${algorithm.id} ${language} line map`).toHaveLength(
          algorithm.pseudocode.length,
        )
        languageSnippet.lineMap.forEach((line) => {
          expect(line, `${algorithm.id} ${language} mapped line`).toBeGreaterThan(0)
          expect(line, `${algorithm.id} ${language} mapped line`).toBeLessThanOrEqual(codeLineCount)
        })
      })
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

    expect(getAlgorithmById('stack')?.category).toBe('Data Structures')
    expect(getAlgorithmById('queue')?.category).toBe('Data Structures')
    expect(getAlgorithmById('linked-list')?.category).toBe('Data Structures')
  })

  it('returns undefined for unknown or invalid IDs', () => {
    expect(getAlgorithmById('unknown-algo')).toBeUndefined()
    expect(getAlgorithmById('')).toBeUndefined()
    expect(getAlgorithmById(null)).toBeUndefined()
  })
})
