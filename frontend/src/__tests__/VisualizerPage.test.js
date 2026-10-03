import { describe, it, expect } from 'vitest'
import VisualizerPage from '../pages/VisualizerPage'

describe('VisualizerPage Component', () => {
  it('exports default component function', () => {
    expect(VisualizerPage).toBeTypeOf('function')
  })
})
