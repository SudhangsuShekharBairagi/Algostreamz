// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import ExperimentPage from '../pages/ExperimentPage'

afterEach(cleanup)

describe('ExperimentPage', () => {
  it('shows measured and theoretical operation growth by input size', () => {
    render(<ExperimentPage />)

    expect(screen.getByRole('heading', { name: 'Operation growth' })).toBeTruthy()
    expect(screen.getByRole('img', { name: /Line chart of measured and theoretical operations/ })).toBeTruthy()
    const rows = screen.getByRole('table').querySelectorAll('tbody tr')
    expect(rows).toHaveLength(3)
    expect(screen.getByText('n=500')).toBeTruthy()

    fireEvent.click(screen.getByRole('checkbox', { name: 'Bubble Sort' }))
    expect(screen.getByRole('table').querySelectorAll('tbody tr')).toHaveLength(2)
    expect(within(screen.getByRole('table')).queryByText('Bubble Sort')).toBeNull()
  })
})
