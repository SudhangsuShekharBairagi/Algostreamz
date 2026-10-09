import { ALGORITHMS } from '../data/algorithmsData'
import { generateSortingSteps } from './sortingGenerators'

const SORTING_ALGORITHMS = ALGORITHMS.filter((algorithm) => algorithm.category === 'Sorting')
function pick(items, random) {
  return items[Math.floor(random() * items.length)]
}

function shuffled(items, random) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

function makeOptions(correct, distractors, random, count = 4) {
  const choices = new Map([[correct.id, correct]])
  for (const option of shuffled(distractors, random)) {
    const labelExists = [...choices.values()].some((choice) => choice.label === option.label)
    if (!choices.has(option.id) && !labelExists) choices.set(option.id, option)
    if (choices.size >= count) break
  }
  return shuffled([...choices.values()], random)
}

function traceStats(steps) {
  return steps.at(-1)?.stats ?? { comparisons: 0, swaps: 0 }
}

function makePredictionQuestion(random) {
  const algorithm = pick(SORTING_ALGORITHMS, random)
  const steps = generateSortingSteps(algorithm.id, algorithm.defaultInput)
  const eligible = steps
    .map((step, index) => ({ step, index }))
    .filter(({ index }) => index < steps.length - 1)
  const { index } = pick(eligible, random)
  const current = steps[index]
  const answerStep = steps[index + 1]
  const describe = (step) => `${step.type}: [${step.values.join(', ')}]`
  const answer = { id: `step-${index + 1}`, label: describe(answerStep) }
  const distractors = steps
    .filter((step, stepIndex) => stepIndex !== index + 1 && describe(step) !== answer.label)
    .map((step, stepIndex) => ({ id: `step-option-${stepIndex}`, label: describe(step) }))

  return {
    id: `predict-next-${algorithm.id}-${index + 1}`,
    type: 'Predict the next step',
    algorithm,
    prompt: `What happens next in ${algorithm.name}?`,
    context: `Current step: ${current.type}. Array: [${current.values.join(', ')}]`,
    options: makeOptions(answer, distractors, random),
    answerId: answer.id,
    explanation: answerStep.explanation.beginner,
  }
}

function makeComplexityQuestion(random) {
  const algorithm = pick(ALGORITHMS.filter((item) => item.complexity?.worst), random)
  const answer = { id: `complexity-${algorithm.complexity.worst}`, label: algorithm.complexity.worst }
  const distractors = [...new Set(ALGORITHMS
    .map((item) => item.complexity?.worst)
    .filter((complexity) => complexity && complexity !== answer.label))]
    .map((complexity) => ({ id: `complexity-${complexity}`, label: complexity }))

  return {
    id: `identify-complexity-${algorithm.id}`,
    type: 'Identify the complexity',
    algorithm,
    prompt: `What is the worst-case time complexity of ${algorithm.name}?`,
    context: algorithm.description,
    options: makeOptions(answer, distractors, random),
    answerId: answer.id,
    explanation: `${algorithm.name} has worst-case time complexity ${algorithm.complexity.worst}, according to the algorithm catalog.`,
  }
}

function makePseudocodeQuestion(random) {
  const algorithm = pick(SORTING_ALGORITHMS, random)
  const steps = generateSortingSteps(algorithm.id, algorithm.defaultInput)
  const tracedSteps = steps.filter((step) =>
    algorithm.pseudocode.some((line) => line.line === step.pseudocodeLine),
  )
  const step = pick(tracedSteps, random)
  const correctLine = algorithm.pseudocode.find((line) => line.line === step.pseudocodeLine)
  const answer = {
    id: `line-${correctLine.line}`,
    label: `${correctLine.line}. ${correctLine.text}`,
  }
  const distractors = algorithm.pseudocode
    .filter((line) => line.line !== correctLine.line)
    .map((line) => ({ id: `line-option-${line.line}`, label: `${line.line}. ${line.text}` }))

  return {
    id: `pseudocode-line-${algorithm.id}-${correctLine.line}`,
    type: 'Pick the pseudocode line',
    algorithm,
    prompt: `Which pseudocode line is executed during this ${algorithm.name} step?`,
    context: `${step.type}: ${step.explanation.beginner}`,
    options: makeOptions(answer, distractors, random),
    answerId: answer.id,
    explanation: `The engine tags this step with pseudocode line ${correctLine.line}: ${correctLine.text}`,
  }
}

function makeWorstCaseQuestion(random) {
  const algorithm = SORTING_ALGORITHMS.find((item) => item.id === 'bubble-sort')
  const values = new Set()
  while (values.size < 8) values.add(Math.floor(random() * 90) + 10)
  const ascending = [...values].sort((left, right) => left - right)
  const candidates = [
    { id: 'ascending', name: 'Already sorted', values: ascending },
    { id: 'descending', name: 'Reverse sorted', values: [...ascending].reverse() },
  ].map((candidate) => ({
    ...candidate,
    comparisons: traceStats(generateSortingSteps(algorithm.id, candidate.values)).comparisons,
  }))
  const worst = candidates.reduce((best, candidate) =>
    candidate.comparisons > best.comparisons ? candidate : best,
  )
  const options = candidates.map((candidate) => ({
    id: candidate.id,
    label: `${candidate.name}: [${candidate.values.join(', ')}]`,
  }))

  return {
    id: `worst-case-input-${algorithm.id}`,
    type: 'Find the worst-case input',
    algorithm,
    prompt: `Which input produces more comparisons for ${algorithm.name}?`,
    context: 'Both candidate arrays contain the same values; the selected order determines how much work the engine records.',
    options,
    answerId: worst.id,
    explanation: `The ${worst.name.toLowerCase()} input produces ${worst.comparisons} comparisons in the Bubble Sort engine trace, the higher of the two totals.`,
  }
}

export function generateChallengeQuestions(random = Math.random) {
  const questions = [
    makePredictionQuestion(random),
    makeComplexityQuestion(random),
    makePseudocodeQuestion(random),
    makeWorstCaseQuestion(random),
  ]
  return shuffled(questions, random)
}

export default generateChallengeQuestions
