// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider, useTheme } from '../context/ThemeContext'

function ThemeControls() {
  const { theme, preference, setPreference, toggleTheme } = useTheme()
  return (
    <div>
      <span>{theme}</span>
      <span>{preference}</span>
      <button type="button" onClick={toggleTheme}>Toggle</button>
      <button type="button" onClick={() => setPreference('system')}>Use system</button>
    </div>
  )
}

function renderTheme() {
  return render(<ThemeProvider><ThemeControls /></ThemeProvider>)
}

describe('ThemeContext', () => {
  afterEach(() => {
    cleanup()
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    vi.unstubAllGlobals()
  })

  it('defaults to and follows the system color scheme', async () => {
    let changeListener
    const mediaQuery = {
      matches: true,
      addEventListener: vi.fn((_, listener) => { changeListener = listener }),
      removeEventListener: vi.fn(),
    }
    vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))

    renderTheme()
    expect(screen.getByText('dark')).toBeTruthy()
    expect(screen.getByText('system')).toBeTruthy()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    mediaQuery.matches = false
    changeListener({ matches: false })
    await waitFor(() => expect(document.documentElement.getAttribute('data-theme')).toBe('light'))
  })

  it('persists an explicit theme preference and applies it to the document', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
    renderTheme()

    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }))
    await waitFor(() => expect(document.documentElement.getAttribute('data-theme')).toBe('dark'))
    expect(localStorage.getItem('algostreamz.theme')).toBe('dark')

    fireEvent.click(screen.getByRole('button', { name: 'Use system' }))
    await waitFor(() => expect(localStorage.getItem('algostreamz.theme')).toBe('system'))
  })
})
