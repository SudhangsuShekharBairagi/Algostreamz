import { describe, expect, it } from 'vitest'
import { createVisualizerSearch, parseVisualizerSearch } from '../utils/shareableVisualizer'

describe('shareable visualizer URL state', () => {
  it('parses valid input, speed, target, and clamps the step to the timeline', () => {
    expect(parseVisualizerSearch('?input=5%2C2%2C9%2C1&speed=200&step=99&target=9', {
      defaultInput: [44, 27],
      defaultTarget: 60,
      totalSteps: 8,
    })).toEqual({
      input: [5, 2, 9, 1],
      speed: 200,
      step: 7,
      target: 9,
    })
  })

  it('falls back safely for malformed and oversized parameter values', () => {
    expect(parseVisualizerSearch('?input=5%2CNaN&speed=fast&step=-2&target=Infinity', {
      defaultInput: [3, 1],
      defaultTarget: 8,
      totalSteps: 4,
    })).toEqual({
      input: [3, 1],
      speed: 400,
      step: 0,
      target: 8,
    })

    expect(parseVisualizerSearch(`?input=${'1'.repeat(2050)}`, {
      defaultInput: [7],
      defaultTarget: 4,
    })).toEqual({
      input: [7],
      speed: 400,
      step: 0,
      target: 4,
    })
  })

  it('round-trips a shareable URL state', () => {
    const params = createVisualizerSearch({
      input: [5, 2, 9, 1],
      speed: 200,
      step: 7,
      target: 9,
      includeTarget: true,
    })

    expect(parseVisualizerSearch(params, {
      defaultInput: [],
      defaultTarget: 60,
      totalSteps: 8,
    })).toEqual({
      input: [5, 2, 9, 1],
      speed: 200,
      step: 7,
      target: 9,
    })
  })
})
