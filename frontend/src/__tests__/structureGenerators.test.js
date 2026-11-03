import { describe, expect, it } from 'vitest'
import { generateLinkedListSteps, generateQueueSteps, generateStackSteps } from '../engine/structureGenerators'

const generators = [
  { name: 'stack', generate: generateStackSteps },
  { name: 'queue', generate: generateQueueSteps },
  { name: 'linked list', generate: generateLinkedListSteps },
]

describe('data structure step generators', () => {
  it.each(generators)('$name emits the shared step shape for empty input', ({ generate }) => {
    const steps = generate()
    expect(steps).toHaveLength(1)
    expect(steps[0]).toMatchObject({
      stepIndex: 0,
      type: 'initialize',
      indices: [],
      values: [],
      highlightedIndices: {},
      pseudocodeLine: 1,
      explanation: {
        beginner: expect.any(String),
        technical: expect.any(String),
      },
      stats: { comparisons: 0, swaps: 0, arrayAccesses: 0 },
    })
  })

  it('records stack push, peek, pop, duplicates, and empty underflow', () => {
    const steps = generateStackSteps([
      { action: 'pop' },
      { action: 'push', value: 'same' },
      { action: 'push', value: 'same' },
      { action: 'peek' },
      { action: 'pop' },
    ])
    expect(steps.map(({ type }) => type)).toEqual(['initialize', 'underflow', 'push', 'push', 'peek', 'pop'])
    expect(steps.at(-2).values).toEqual(['same', 'same'])
    expect(steps.at(-1).values).toEqual(['same'])
    expect(steps.at(-1).stepIndex).toBe(steps.length - 1)
  })

  it('records queue FIFO behavior and preserves the final-state invariant', () => {
    const steps = generateQueueSteps([
      { action: 'enqueue', value: 'first' },
      { action: 'enqueue', value: 'second' },
      { action: 'peek' },
      { action: 'dequeue' },
    ])
    expect(steps[3].values).toEqual(['first', 'second'])
    expect(steps[4].values).toEqual(['second'])
    expect(steps[4].explanation.beginner).toContain('first')
  })

  it('preserves single-element and duplicate queue values', () => {
    const single = generateQueueSteps([{ action: 'enqueue', value: 'same' }, { action: 'dequeue' }])
    const duplicates = generateQueueSteps([
      { action: 'enqueue', value: 'same' },
      { action: 'enqueue', value: 'same' },
      { action: 'dequeue' },
    ])
    expect(single[1].values).toEqual(['same'])
    expect(single.at(-1).values).toEqual([])
    expect(duplicates.at(-1).values).toEqual(['same'])
  })

  it('supports queue front and rear reads without changing the queue', () => {
    const steps = generateQueueSteps([
      { action: 'enqueue', value: 'first' },
      { action: 'enqueue', value: 'last' },
      { action: 'front' },
      { action: 'peek' },
      { action: 'rear' },
    ])
    expect(steps.slice(-3).map((step) => step.values)).toEqual([
      ['first', 'last'],
      ['first', 'last'],
      ['first', 'last'],
    ])
    expect(steps.slice(-3).map((step) => step.indices)).toEqual([[0], [0], [1]])
  })

  it('handles linked-list head, tail, indexed insert/delete, search, and duplicates', () => {
    const steps = generateLinkedListSteps([
      { action: 'insert-head', value: 'same' },
      { action: 'insert-tail', value: 'same' },
      { action: 'insert-at', value: 'middle', index: 1 },
      { action: 'search', value: 'same' },
      { action: 'delete-at', index: 1 },
    ])
    expect(steps[3].values).toEqual(['same', 'middle', 'same'])
    expect(steps[4]).toMatchObject({
      type: 'found',
      indices: [0],
      highlightedIndices: { 0: 'found' },
    })
    expect(steps.at(-1).values).toEqual(['same', 'same'])
  })

  it('handles missing values, invalid indices, and single-element removal', () => {
    const steps = generateLinkedListSteps([
      { action: 'search', value: 'missing' },
      { action: 'delete-at', index: 0 },
      { action: 'insert-tail', value: 'only' },
      { action: 'delete-at', index: 0 },
    ])
    expect(steps[1].type).toBe('underflow')
    expect(steps[2].type).toBe('underflow')
    expect(steps.at(-1).values).toEqual([])
  })

  it('supports linked-list reverse and delete by value', () => {
    const steps = generateLinkedListSteps([
      { action: 'insert-tail', value: 'first' },
      { action: 'insert-tail', value: 'second' },
      { action: 'insert-tail', value: 'first' },
      { action: 'reverse' },
      { action: 'delete-value', value: 'first' },
    ])
    expect(steps.at(-2).values).toEqual(['first', 'second', 'first'])
    expect(steps.at(-1).values).toEqual(['second', 'first'])
  })

  it('uses the same underflow wording for empty linked-list operations', () => {
    const steps = generateLinkedListSteps([
      { action: 'delete-at', index: 0 },
      { action: 'delete-value', value: 'missing' },
      { action: 'search', value: 'missing' },
    ])
    expect(steps.slice(1).map((step) => step.explanation.beginner)).toEqual([
      'Cannot delete because the linked list is empty.',
      'Cannot delete because the linked list is empty.',
      'Cannot search because the linked list is empty.',
    ])
  })

  it('does not mutate the operation history and enforces the item cap', () => {
    const operations = Array.from({ length: 21 }, (_, index) => ({
      action: 'push',
      value: String(index),
    }))
    const original = structuredClone(operations)
    const steps = generateStackSteps(operations)
    expect(operations).toEqual(original)
    expect(steps.at(-2).values).toHaveLength(20)
    expect(steps.at(-1).type).toBe('limit-reached')
    expect(steps.at(-1).values).toHaveLength(20)
  })

  it('treats a malformed operation history as empty', () => {
    expect(generateStackSteps(null)).toHaveLength(1)
  })

  it.each(generators)('$name gives every step a contiguous index and explanation', ({ generate }) => {
    const steps = generate([{ action: 'invalid' }])
    steps.forEach((step, index) => {
      expect(step.stepIndex).toBe(index)
      expect(step.explanation.beginner).toEqual(expect.any(String))
      expect(step.explanation.technical).toEqual(expect.any(String))
      expect(step.pseudocodeLine).toEqual(expect.any(Number))
      expect(step.values).toEqual(expect.any(Array))
      expect(step.highlightedIndices).toEqual(expect.any(Object))
    })
  })
})
