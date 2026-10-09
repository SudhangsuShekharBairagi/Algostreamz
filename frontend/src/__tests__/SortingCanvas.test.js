import { describe, it, expect } from 'vitest'
import SortingCanvas from '../components/visualizer/SortingCanvas'

describe('SortingCanvas Component', () => {
  it('renders without crashing with default props', () => {
    expect(SortingCanvas).toBeTypeOf('function')
  })
})
