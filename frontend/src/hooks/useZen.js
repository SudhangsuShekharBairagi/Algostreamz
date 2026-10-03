import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook to toggle and control Zen Mode across visualizer pages.
 * Hides app chrome, centers stage, renders floating dock, and handles auto-hiding controls.
 */
export function useZen(initialState = false) {
  const [isZen, setIsZen] = useState(initialState)

  const toggleZen = useCallback(() => {
    setIsZen((prev) => !prev)
  }, [])

  const enterZen = useCallback(() => setIsZen(true), [])
  const exitZen = useCallback(() => setIsZen(false), [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape key exits Zen Mode
      if (e.key === 'Escape' && isZen) {
        setIsZen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isZen])

  return {
    isZen,
    toggleZen,
    enterZen,
    exitZen,
  }
}

export default useZen
