// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import tokenStore from '../services/tokenStore'

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

import api from '../services/api'
import progressApi from '../services/progressApi'

describe('progressApi', () => {
  beforeEach(() => {
    localStorage.clear()
    tokenStore.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
    tokenStore.clear()
  })

  it('keeps anonymous completions in local storage without calling the API', async () => {
    await progressApi.completeVisualizer('bubble-sort')

    expect(await progressApi.getProgress()).toEqual({
      completedVisualizers: ['bubble-sort'],
      masteredChallenges: [],
    })
    expect(api.post).not.toHaveBeenCalled()
  })

  it('writes authenticated completions to the API and clears the pending local copy', async () => {
    tokenStore.set('test-token')
    api.post.mockResolvedValue({ status: 204 })

    await progressApi.completeVisualizer('bubble-sort')

    expect(api.post).toHaveBeenCalledWith('/progress/visualizer/bubble-sort')
    expect(progressApi.hasLocalProgress()).toBe(false)
  })

  it('preserves queued local completions when synchronization fails', async () => {
    await progressApi.completeVisualizer('bubble-sort')
    tokenStore.set('test-token')
    api.post.mockRejectedValue(new Error('offline'))

    await expect(progressApi.syncLocalProgress()).rejects.toThrow('offline')
    expect(progressApi.getLocalProgress().completedVisualizers).toEqual(['bubble-sort'])
  })
})
