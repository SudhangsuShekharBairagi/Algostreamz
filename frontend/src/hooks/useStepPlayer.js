import { useVisualizer } from './useVisualizer'

/**
 * Legacy wrapper / alias for useVisualizer hook.
 */
export function useStepPlayer(steps = [], options = {}) {
  const visualizer = useVisualizer(steps, options)
  return {
    ...visualizer,
    current: visualizer.currentStepIndex,
    playing: visualizer.isPlaying,
    next: visualizer.stepForward,
    prev: visualizer.stepBackward,
  }
}

export { useVisualizer }
export default useVisualizer
