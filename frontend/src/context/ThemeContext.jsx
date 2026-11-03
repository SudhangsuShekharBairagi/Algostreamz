import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)
const STORAGE_KEY = 'algostreamz.theme'
const THEMES = ['light', 'dark', 'system']

function readPreference() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return THEMES.includes(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

function getSystemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(readPreference)
  const [systemTheme, setSystemTheme] = useState(getSystemTheme)
  const theme = preference === 'system' ? systemTheme : preference

  const setPreference = useCallback((nextPreference) => {
    if (THEMES.includes(nextPreference)) setPreferenceState(nextPreference)
  }, [])

  const toggleTheme = useCallback(() => {
    setPreference(theme === 'dark' ? 'light' : 'dark')
  }, [setPreference, theme])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, preference)
    } catch {
      // Theme selection still works when storage is unavailable.
    }
  }, [preference])

  useEffect(() => {
    if (preference !== 'system') return undefined
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mediaQuery) return undefined
    const updateSystemTheme = (event) => setSystemTheme(event.matches ? 'dark' : 'light')
    updateSystemTheme(mediaQuery)
    mediaQuery.addEventListener?.('change', updateSystemTheme)
    return () => mediaQuery.removeEventListener?.('change', updateSystemTheme)
  }, [preference])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    const themeColor = document.querySelector('meta[name="theme-color"]')
    if (themeColor) themeColor.setAttribute('content', theme === 'dark' ? '#0B0F19' : '#F8FAFC')
  }, [theme])

  const value = useMemo(() => ({ theme, preference, setPreference, toggleTheme }), [
    theme,
    preference,
    setPreference,
    toggleTheme,
  ])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}

export default ThemeProvider
