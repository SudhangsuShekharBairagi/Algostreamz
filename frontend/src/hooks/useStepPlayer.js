import { useState, useCallback } from 'react'

/**
 * Shared step-player hook: drives play/pause, step forward/back,
 * reset, and speed control for every visualizer.
 */
export function useStepPlayer(steps = []) {
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)

  const next = useCallback(
    () => setCurrent((c) => Math.min(c + 1, steps.length - 1)),
    [steps.length],
  )
  const prev = useCallback(() => setCurrent((c) => Math.max(c - 1, 0)), [])
  const reset = useCallback(() => setCurrent(0), [])

  return { current, playing, speed, setPlaying, setSpeed, next, prev, reset }
}
