// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider } from '../context/ToastContext'
import useVisualizerAudio from '../hooks/useVisualizerAudio'

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('useVisualizerAudio', () => {
  it('persists opt-in and plays a pitch for compare and swap steps', () => {
    const oscillator = { frequency: {}, connect: vi.fn(), start: vi.fn(), stop: vi.fn() }
    const gain = {
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    }
    const audioContext = {
      state: 'running',
      currentTime: 0,
      destination: {},
      createOscillator: vi.fn(() => oscillator),
      createGain: vi.fn(() => gain),
      close: vi.fn(),
    }
    vi.stubGlobal('AudioContext', class {
      constructor() {
        return audioContext
      }
    })
    const wrapper = ({ children }) => <ToastProvider>{children}</ToastProvider>
    const { result, rerender } = renderHook(({ step }) => useVisualizerAudio(step), {
      initialProps: { step: null },
      wrapper,
    })

    expect(result.current.soundEnabled).toBe(false)
    act(() => result.current.toggleSound())
    expect(localStorage.getItem('algostreamz:visualizer-sound-enabled')).toBe('true')

    rerender({ step: { type: 'compare', values: [1, 5], indices: [1] } })
    expect(oscillator.start).toHaveBeenCalledOnce()
    expect(oscillator.frequency.value).toBe(880)

    rerender({ step: { type: 'swap', values: [1, 5], indices: [0, 1] } })
    expect(oscillator.start).toHaveBeenCalledTimes(2)
  })

  it('suppresses audio when reduced motion is requested', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })))
    const audioContext = { createOscillator: vi.fn() }
    vi.stubGlobal('AudioContext', vi.fn(() => audioContext))
    const wrapper = ({ children }) => <ToastProvider>{children}</ToastProvider>
    const { result, rerender } = renderHook(({ step }) => useVisualizerAudio(step), {
      initialProps: { step: null },
      wrapper,
    })

    act(() => result.current.toggleSound())
    rerender({ step: { type: 'compare', values: [1, 5], indices: [1] } })

    expect(result.current.soundSuppressed).toBe(true)
    expect(audioContext.createOscillator).not.toHaveBeenCalled()
  })
})
