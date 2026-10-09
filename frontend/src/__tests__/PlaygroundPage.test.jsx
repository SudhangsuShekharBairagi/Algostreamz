// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import PlaygroundPage from '../pages/PlaygroundPage'

const PRESETS_KEY = 'algostreamz.playground.presets.v1'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('PlaygroundPage', () => {
  it('runs sorting and searching traces on selected inputs', () => {
    render(<PlaygroundPage />)

    expect(screen.getByRole('heading', { name: 'Bubble Sort trace' })).toBeTruthy()
    expect(screen.getByText(/Input length: 8/)).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Algorithm'), { target: { value: 'binary-search' } })
    expect(screen.getByRole('heading', { name: 'Binary Search trace' })).toBeTruthy()
    expect(screen.getByLabelText('Search target')).toBeTruthy()

    fireEvent.change(screen.getByLabelText('Input pattern'), { target: { value: 'reversed' } })
    expect(screen.getByLabelText('Array values (2–100 integers)').value).toBe(
      '24, 21, 18, 15, 12, 9, 6, 3',
    )
    fireEvent.change(screen.getByLabelText('Array values (2–100 integers)'), {
      target: { value: '3, invalid' },
    })
    expect(screen.getByRole('alert').textContent).toContain('whole numbers')
  })

  it('saves, loads, and deletes local presets', () => {
    render(<PlaygroundPage />)

    fireEvent.change(screen.getByLabelText('Algorithm'), { target: { value: 'linear-search' } })
    fireEvent.change(screen.getByLabelText('Search target'), { target: { value: '21' } })
    fireEvent.change(screen.getByLabelText('Preset name'), { target: { value: 'linear demo' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save preset' }))

    expect(JSON.parse(localStorage.getItem(PRESETS_KEY))).toMatchObject([
      { name: 'linear demo', algorithmId: 'linear-search', target: 21 },
    ])

    fireEvent.change(screen.getByLabelText('Algorithm'), { target: { value: 'bubble-sort' } })
    fireEvent.change(screen.getByLabelText('Saved presets'), { target: { value: 'linear demo' } })
    fireEvent.click(screen.getByRole('button', { name: 'Load' }))
    expect(screen.getByRole('heading', { name: 'Linear Search trace' })).toBeTruthy()
    expect(screen.getByLabelText('Search target').value).toBe('21')

    fireEvent.click(screen.getByRole('button', { name: 'Delete selected preset' }))
    expect(JSON.parse(localStorage.getItem(PRESETS_KEY))).toEqual([])
  })
})
