import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

/**
 * Custom hook to manage algorithm playback timeline.
 * Drives single visualizers and multi-instance race mode comparisons.
 *
 * @param {Array} initialSteps - Array of step objects from algorithm engine
 * @param {Object} [options]
 * @param {number} [options.initialSpeed=400] - Default playback interval in ms (50ms - 1200ms)
 * @param {boolean} [options.autoPlay=false] - Auto start playing on load
 * @returns {Object} Playback controller and state snapshot
 */
export function useVisualizer(initialSteps = [], options = {}) {
  const { initialSpeed = 400, autoPlay = false } = options

  const [steps, setSteps] = useState(initialSteps)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [speed, setSpeedState] = useState(() => Math.min(Math.max(initialSpeed, 50), 1200))

  const timerRef = useRef(null)

  // Synchronize internal steps if initialSteps prop changes
  useEffect(() => {
    setSteps(initialSteps)
    setCurrentStepIndex(0)
    setIsPlaying(autoPlay)
  }, [initialSteps, autoPlay])

  // Computed state properties
  const totalSteps = steps.length
  const currentStep = useMemo(
    () => (steps.length > 0 && currentStepIndex < steps.length ? steps[currentStepIndex] : null),
    [steps, currentStepIndex]
  )

  const isAtStart = currentStepIndex === 0
  const isAtEnd = totalSteps === 0 || currentStepIndex >= totalSteps - 1

  const progressPercent = useMemo(() => {
    if (totalSteps <= 1) return 0
    return Math.min(100, Math.max(0, (currentStepIndex / (totalSteps - 1)) * 100))
  }, [currentStepIndex, totalSteps])

  // Clear active playback timer
  const clearPlaybackTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Controller methods
  const pause = useCallback(() => {
    setIsPlaying(false)
    clearPlaybackTimer()
  }, [clearPlaybackTimer])

  const play = useCallback(() => {
    if (totalSteps === 0) return
    if (currentStepIndex >= totalSteps - 1) {
      setCurrentStepIndex(0)
    }
    setIsPlaying(true)
  }, [totalSteps, currentStepIndex])

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }, [isPlaying, pause, play])

  const goToStep = useCallback(
    (targetIndex) => {
      if (totalSteps === 0) return
      const clampedIndex = Math.min(Math.max(0, targetIndex), totalSteps - 1)
      setCurrentStepIndex(clampedIndex)
    },
    [totalSteps]
  )

  const stepForward = useCallback(() => {
    pause()
    setCurrentStepIndex((prev) => Math.min(prev + 1, Math.max(0, totalSteps - 1)))
  }, [pause, totalSteps])

  const stepBackward = useCallback(() => {
    pause()
    setCurrentStepIndex((prev) => Math.max(0, prev - 1))
  }, [pause])

  const reset = useCallback(() => {
    pause()
    setCurrentStepIndex(0)
  }, [pause])

  const setSpeed = useCallback((newSpeedMs) => {
    const clampedSpeed = Math.min(Math.max(newSpeedMs, 50), 1200)
    setSpeedState(clampedSpeed)
  }, [])

  const loadSteps = useCallback(
    (newSteps) => {
      pause()
      setSteps(newSteps)
      setCurrentStepIndex(0)
    },
    [pause]
  )

  // Playback timer effect
  useEffect(() => {
    if (isPlaying && totalSteps > 0) {
      clearPlaybackTimer()

      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prevIndex) => {
          if (prevIndex >= totalSteps - 1) {
            setIsPlaying(false)
            clearPlaybackTimer()
            return prevIndex
          }
          return prevIndex + 1
        })
      }, speed)
    } else {
      clearPlaybackTimer()
    }

    return () => clearPlaybackTimer()
  }, [isPlaying, speed, totalSteps, clearPlaybackTimer])

  return {
    steps,
    currentStepIndex,
    currentStep,
    isPlaying,
    speed,
    progressPercent,
    isAtStart,
    isAtEnd,
    play,
    pause,
    togglePlay,
    stepForward,
    stepBackward,
    goToStep,
    reset,
    setSpeed,
    loadSteps,
  }
}

export default useVisualizer
