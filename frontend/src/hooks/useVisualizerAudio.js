import { useCallback, useEffect, useRef, useState } from 'react'
import { useToast } from '../context/ToastContext'

const STORAGE_KEY = 'algostreamz:visualizer-sound-enabled'

function readPreference() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export default function useVisualizerAudio(currentStep) {
  const [enabled, setEnabled] = useState(readPreference)
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  )
  const audioContextRef = useRef(null)
  const previousStepRef = useRef(currentStep)
  const audioFailureReportedRef = useRef(false)
  const { showToast } = useToast()

  useEffect(() => {
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!preference) return undefined
    const updatePreference = (event) => setReducedMotion(event.matches)
    preference.addEventListener?.('change', updatePreference)
    return () => preference.removeEventListener?.('change', updatePreference)
  }, [])

  useEffect(() => () => {
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
    }
  }, [])

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextConstructor = window.AudioContext ?? globalThis.AudioContext
      if (!AudioContextConstructor) throw new Error('Web Audio is not supported in this browser.')
      audioContextRef.current = new AudioContextConstructor()
    }
    return audioContextRef.current
  }, [])

  const toggleSound = useCallback(() => {
    const nextEnabled = !enabled
    setEnabled(nextEnabled)
    try {
      window.localStorage.setItem(STORAGE_KEY, String(nextEnabled))
    } catch {
      showToast('Sound preference could not be saved', 'warning')
    }

    if (nextEnabled && !reducedMotion) {
      try {
        const context = getAudioContext()
          if (context.state === 'suspended') {
            context.resume().catch(() => {
              setEnabled(false)
              showToast('Sound is unavailable in this browser', 'error')
            })
          }
        } catch {
          setEnabled(false)
          showToast('Sound is unavailable in this browser', 'error')
      }
    }
  }, [enabled, getAudioContext, reducedMotion, showToast])

  useEffect(() => {
    if (previousStepRef.current === currentStep) return
    previousStepRef.current = currentStep
    if (!enabled || reducedMotion || !['compare', 'swap'].includes(currentStep?.type)) return

    try {
      const context = getAudioContext()
      const values = currentStep.values ?? []
      const index = currentStep.indices?.[0] ?? 0
      const value = values[index] ?? 0
      const min = values.length ? Math.min(...values) : 0
      const max = values.length ? Math.max(...values) : 1
      const ratio = max === min ? 0.5 : (value - min) / (max - min)
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = 220 + ratio * 660
      gain.gain.setValueAtTime(0.035, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.09)
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start()
      oscillator.stop(context.currentTime + 0.09)
      if (context.state === 'suspended') {
        context.resume().catch(() => {
          if (!audioFailureReportedRef.current) {
            audioFailureReportedRef.current = true
            showToast('Unable to play visualizer sound', 'error')
          }
        })
      }
    } catch {
      if (!audioFailureReportedRef.current) {
        audioFailureReportedRef.current = true
        showToast('Unable to play visualizer sound', 'error')
      }
    }
  }, [currentStep, enabled, getAudioContext, reducedMotion, showToast])

  return { soundEnabled: enabled, soundSuppressed: reducedMotion, toggleSound }
}
