// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import ErrorBoundary from '../components/common/ErrorBoundary'

afterEach(cleanup)

describe('ErrorBoundary', () => {
  it('shows a recoverable fallback when a child fails to render', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    function BrokenPage() {
      throw new Error('render failed')
    }

    render(
      <MemoryRouter>
        <ErrorBoundary>
          <BrokenPage />
        </ErrorBoundary>
      </MemoryRouter>,
    )

    expect(screen.getByRole('alert').textContent).toContain('unexpected error')
    expect(screen.getByRole('button', { name: 'Try again' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Go home' })).toBeTruthy()
    error.mockRestore()
  })
})
