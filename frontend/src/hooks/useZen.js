import { useZen as useZenContext } from '../context/ZenContext'

/**
 * Shared useZen hook wrapper pointing to ZenContext API.
 * Returns: { isZen, enterZen, exitZen, toggleZen, controlsVisible, nudgeControls, prefs, setPref, zenAvailable }
 */
export function useZen() {
  return useZenContext()
}

export default useZen
