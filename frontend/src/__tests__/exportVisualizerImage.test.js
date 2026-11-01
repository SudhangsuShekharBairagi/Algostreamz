// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { exportVisualizerImage } from '../utils/exportVisualizerImage'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('exportVisualizerImage', () => {
  it('draws the current values and downloads a PNG without a library', async () => {
    const fillText = vi.fn()
    const fillRect = vi.fn()
    const context = { fillText, fillRect, beginPath: vi.fn(), fill: vi.fn() }
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context)
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => {
      callback(new Blob(['image data'], { type: 'image/png' }))
    })
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:visualizer')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    await exportVisualizerImage({
      algorithmName: 'Quick Sort',
      values: [5, 2, 9],
      highlightedIndices: { 1: 'comparing' },
    })

    expect(fillText).toHaveBeenCalledWith('Quick Sort', 72, 88)
    expect(fillRect).toHaveBeenCalled()
    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.objectContaining({ type: 'image/png' }))
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled()
  })
})
