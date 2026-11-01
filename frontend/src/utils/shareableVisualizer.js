const DEFAULT_SPEED = 400
const MIN_SPEED = 50
const MAX_SPEED = 1200
const MAX_QUERY_LENGTH = 2048
const MAX_INPUT_LENGTH = 256
const MAX_INPUT_ITEMS = 25
const NUMERIC_VALUE_PATTERN = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i

function getSingleValue(params, name) {
  const values = params.getAll(name)
  return values.length === 1 ? values[0] : null
}

function parseNumber(value) {
  if (typeof value !== 'string' || !NUMERIC_VALUE_PATTERN.test(value)) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function parseInput(value, fallback) {
  if (value === null || value.length === 0 || value.length > MAX_INPUT_LENGTH) return fallback

  const tokens = value.split(',')
  if (tokens.length > MAX_INPUT_ITEMS || tokens.some((token) => token.trim() === '')) return fallback

  const parsed = tokens.map((token) => parseNumber(token.trim()))
  return parsed.some((number) => number === null) ? fallback : parsed
}

export function parseVisualizerSearch(search, {
  defaultInput = [],
  defaultTarget = 60,
  totalSteps,
} = {}) {
  const searchString = search instanceof URLSearchParams ? search.toString() : String(search || '').replace(/^\?/, '')
  const params = new URLSearchParams(searchString)
  const queryTooLong = searchString.length > MAX_QUERY_LENGTH
  const input = queryTooLong ? defaultInput : parseInput(getSingleValue(params, 'input'), defaultInput)
  const parsedSpeed = queryTooLong ? null : parseNumber(getSingleValue(params, 'speed'))
  const parsedStepValue = queryTooLong ? null : getSingleValue(params, 'step')
  const parsedStep = parsedStepValue !== null && /^\d{1,10}$/.test(parsedStepValue)
    ? Number(parsedStepValue)
    : 0
  const parsedTarget = queryTooLong ? null : parseNumber(getSingleValue(params, 'target'))
  const step = Number.isSafeInteger(parsedStep)
    ? Number.isInteger(totalSteps) && totalSteps >= 0
      ? Math.min(parsedStep, Math.max(0, totalSteps - 1))
      : parsedStep
    : 0

  return {
    input,
    speed: parsedSpeed === null ? DEFAULT_SPEED : Math.min(MAX_SPEED, Math.max(MIN_SPEED, parsedSpeed)),
    step,
    target: parsedTarget === null ? defaultTarget : parsedTarget,
  }
}

export function createVisualizerSearch({ input, speed, step, target, includeTarget = false }) {
  const params = new URLSearchParams()
  params.set('input', input.join(','))
  params.set('speed', String(speed))
  params.set('step', String(step))
  if (includeTarget) params.set('target', String(target))
  return params
}
