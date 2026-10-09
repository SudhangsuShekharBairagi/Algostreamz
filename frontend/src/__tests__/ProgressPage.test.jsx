// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ProgressPage from '../pages/ProgressPage'
import progressApi from '../services/progressApi'

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 3, email: 'learner@example.com', emailVerified: true },
  }),
}))

vi.mock('../services/progressApi', () => ({
  default: {
    getProgress: vi.fn(),
  },
}))

describe('ProgressPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(cleanup)

  it('shows loading and an empty state with totals from the catalog', async () => {
    let resolveProgress
    progressApi.getProgress.mockReturnValue(new Promise((resolve) => {
      resolveProgress = resolve
    }))

    render(<ProgressPage />)
    expect(screen.getByRole('status').textContent).toContain('Loading your progress')

    resolveProgress({ completedVisualizers: [], masteredChallenges: [] })

    expect(await screen.findByText('0 / 10')).toBeTruthy()
    expect(screen.getByText('0%')).toBeTruthy()
    expect(screen.getByText(/No progress yet/)).toBeTruthy()
    expect(screen.getByText('0', { selector: 'span' })).toBeTruthy()
  })

  it('computes completion and mastery from returned catalog IDs', async () => {
    progressApi.getProgress.mockResolvedValue({
      completedVisualizers: ['bubble-sort', 'unknown-entry'],
      masteredChallenges: ['challenge-one', 'challenge-two'],
    })
    render(<ProgressPage />)

    expect(await screen.findByText('1 / 10')).toBeTruthy()
    expect(screen.getByText('10%')).toBeTruthy()
    expect(screen.getByText('2', { selector: 'span' })).toBeTruthy()
  })

  it('shows request errors and retries on demand', async () => {
    progressApi.getProgress
      .mockRejectedValueOnce(new Error('Progress service unavailable'))
      .mockResolvedValueOnce({ completedVisualizers: [], masteredChallenges: [] })
    render(<ProgressPage />)

    expect(await screen.findByText('Progress service unavailable')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    await waitFor(() => expect(screen.getByText('0 / 10')).toBeTruthy())
    expect(progressApi.getProgress).toHaveBeenCalledTimes(2)
  })
})
