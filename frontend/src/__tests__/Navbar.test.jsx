// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { ZenProvider } from '../context/ZenContext'
import { ThemeProvider } from '../context/ThemeContext'

const authState = vi.hoisted(() => ({
  initialising: false,
  isAuthenticated: false,
  user: null,
  signOut: vi.fn(),
}))
const showToast = vi.hoisted(() => vi.fn())

vi.mock('../context/AuthContext', () => ({
  useAuth: () => authState,
}))
vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ showToast }),
}))

function renderNavbar(path = '/algorithms') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ZenProvider>
        <ThemeProvider>
          <Routes>
            <Route path="*" element={<><Navbar /><h1>Current page</h1></>} />
            <Route path="/login" element={<h1>Login page</h1>} />
            <Route path="/" element={<h1>Home page</h1>} />
          </Routes>
        </ThemeProvider>
      </ZenProvider>
    </MemoryRouter>,
  )
}

describe('Navbar authentication actions', () => {
  beforeEach(() => {
    localStorage.clear()
    authState.initialising = false
    authState.isAuthenticated = false
    authState.user = null
    authState.signOut.mockReset()
    authState.signOut.mockResolvedValue(undefined)
    showToast.mockReset()
  })

  afterEach(() => {
    cleanup()
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('shows sign in when logged out', () => {
    renderNavbar()
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeTruthy()
  })

  it('signs out, shows feedback, and returns home', async () => {
    authState.isAuthenticated = true
    authState.user = { displayName: 'Ada' }
    renderNavbar()

    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))

    await waitFor(() => expect(authState.signOut).toHaveBeenCalledOnce())
    expect(showToast).toHaveBeenCalledWith('Signed out', 'success')
    expect(await screen.findByRole('heading', { name: 'Home page' })).toBeTruthy()
  })

  it('toggles and persists the theme', async () => {
    renderNavbar()
    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark theme' }))
    await waitFor(() => expect(document.documentElement.getAttribute('data-theme')).toBe('dark'))
    expect(localStorage.getItem('algostreamz.theme')).toBe('dark')
    expect(screen.getByRole('button', { name: 'Switch to light theme' }).getAttribute('aria-pressed')).toBe('true')
  })

})
