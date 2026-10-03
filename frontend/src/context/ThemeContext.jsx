import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext(null)

/**
 * Optional Theme Context for future dark theme extension.
 * Defaults strictly to 'light' per non-negotiable editorial light rules.
 */
export function ThemeProvider({ children }) {
  const [theme] = useState('light')

  const toggleTheme = () => {
    // Light mode is currently non-negotiable. Dark mode coming in future version.
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default ThemeProvider
