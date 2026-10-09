// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { generateChallengeQuestions } from '../engine/challengeQuestions'
import ChallengesPage from '../pages/ChallengesPage'
import progressApi from '../services/progressApi'

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}))

vi.mock('../services/progressApi', () => ({
  default: {
    completeChallenge: vi.fn().mockResolvedValue(undefined),
  },
}))

function seededRandom(seed = 73) {
  let value = seed
  return () => {
    value = (value * 48271) % 2147483647
    return value / 2147483647
  }
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('ChallengesPage', () => {
  it('gives instant feedback, calculates score, and submits mastered answers', async () => {
    const randomSpy = vi.spyOn(Math, 'random').mockImplementation(seededRandom())
    const questions = generateChallengeQuestions(seededRandom())
    render(<ChallengesPage />)
    randomSpy.mockRestore()

    for (const [index, question] of questions.entries()) {
      if (index === 0) {
        const wrong = question.options.find((option) => option.id !== question.answerId)
        fireEvent.click(screen.getByText(wrong.label, { exact: true }).closest('button'))
        expect(screen.getByText('Not quite.')).toBeTruthy()
        expect(screen.getByText(question.explanation)).toBeTruthy()
      } else {
        const correct = question.options.find((option) => option.id === question.answerId)
        fireEvent.click(screen.getByText(correct.label, { exact: true }).closest('button'))
        expect(screen.getByText('Correct!')).toBeTruthy()
      }

      fireEvent.click(screen.getByRole('button', {
        name: index === questions.length - 1 ? 'View score' : 'Next question',
      }))
    }

    expect(await screen.findByRole('heading', { name: 'Quiz results' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: /3\s*\/\s*4/ })).toBeTruthy()
    expect(progressApi.completeChallenge).toHaveBeenCalledTimes(3)
    expect(screen.getByText('Your mastered challenges were saved to your account.')).toBeTruthy()
  })
})
