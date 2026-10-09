import { describe, expect, it } from 'vitest'
import { ALGORITHMS } from '../data/algorithmsData'
import { generateChallengeQuestions } from '../engine/challengeQuestions'
import { generateSortingSteps } from '../engine/sortingGenerators'

function seededRandom(seed = 27) {
  let value = seed
  return () => {
    value = (value * 48271) % 2147483647
    return value / 2147483647
  }
}

describe('generateChallengeQuestions', () => {
  it('builds a complete set from current algorithm metadata and execution traces', () => {
    const questions = generateChallengeQuestions(seededRandom())
    expect(questions).toHaveLength(4)
    expect(new Set(questions.map((question) => question.type))).toEqual(new Set([
      'Predict the next step',
      'Identify the complexity',
      'Pick the pseudocode line',
      'Find the worst-case input',
    ]))

    for (const question of questions) {
      expect(question.options.length).toBeGreaterThanOrEqual(2)
      expect(question.options.length).toBeLessThanOrEqual(4)
      expect(question.options.some((option) => option.id === question.answerId)).toBe(true)
      expect(question.explanation).toBeTruthy()
    }

    const complexityQuestion = questions.find((question) => question.type === 'Identify the complexity')
    const complexityAlgorithm = ALGORITHMS.find((algorithm) => algorithm.id === complexityQuestion.algorithm.id)
    expect(complexityQuestion.options.find((option) => option.id === complexityQuestion.answerId).label)
      .toBe(complexityAlgorithm.complexity.worst)

    const lineQuestion = questions.find((question) => question.type === 'Pick the pseudocode line')
    const lineNumber = Number(lineQuestion.options
      .find((option) => option.id === lineQuestion.answerId).label.split('.')[0])
    expect(lineQuestion.algorithm.pseudocode.some((line) => line.line === lineNumber)).toBe(true)

    const inputQuestion = questions.find((question) => question.type === 'Find the worst-case input')
    const candidateCounts = inputQuestion.options.map((option) => {
      const values = option.label.match(/\[([^\]]+)\]/)[1].split(', ').map(Number)
      const steps = generateSortingSteps(inputQuestion.algorithm.id, values)
      return { id: option.id, comparisons: steps.at(-1).stats.comparisons }
    })
    expect(inputQuestion.answerId).toBe(
      candidateCounts.reduce((best, candidate) =>
        candidate.comparisons > best.comparisons ? candidate : best).id,
    )
  })
})
