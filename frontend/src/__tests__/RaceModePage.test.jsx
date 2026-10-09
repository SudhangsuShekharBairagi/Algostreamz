// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import RaceModePage from '../pages/RaceModePage'

afterEach(cleanup)

describe('RaceModePage', () => {
  it('runs selected algorithms on the same input with synchronized stepping and final totals', () => {
    render(<RaceModePage />)

    expect(screen.getByText('3 of 4 algorithms selected')).toBeTruthy()
    const lanes = screen.getByRole('region', { name: 'Algorithm race lanes' })
    const canvases = within(lanes).getAllByRole('img')
    expect(canvases).toHaveLength(3)
    expect(canvases[0].getAttribute('aria-label')).toBe(canvases[1].getAttribute('aria-label'))
    expect(canvases[1].getAttribute('aria-label')).toBe(canvases[2].getAttribute('aria-label'))

    const timeline = screen.getByRole('slider', { name: 'Race timeline' })
    const liveCount = screen.getByLabelText('Live total comparisons')
    expect(liveCount).toBeTruthy()
    fireEvent.change(timeline, { target: { value: timeline.getAttribute('max') } })

    expect(screen.getByText('Race finished')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Race results' })).toBeTruthy()
    expect(screen.getByRole('table').querySelectorAll('tbody tr')).toHaveLength(3)
    expect(screen.getByText('Fastest')).toBeTruthy()
    expect(Number(screen.getByLabelText('Live total comparisons').textContent)).toBeGreaterThan(0)
  })

  it('enforces two-to-four racers and blocks playback for invalid shared input', () => {
    render(<RaceModePage />)

    fireEvent.click(screen.getByRole('checkbox', { name: 'Insertion Sort' }))
    const bubble = screen.getByRole('checkbox', { name: 'Bubble Sort' })
    expect(bubble.disabled).toBe(true)

    fireEvent.click(screen.getByRole('checkbox', { name: 'Merge Sort' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Selection Sort' }))
    expect(screen.getByText('4 of 4 algorithms selected')).toBeTruthy()
    expect(screen.getByRole('checkbox', { name: 'Insertion Sort' }).disabled).toBe(true)

    fireEvent.change(screen.getByLabelText('Shared input (comma-separated numbers)'), {
      target: { value: '3, nope' },
    })
    expect(screen.getByRole('alert').textContent).toContain('whole numbers')
    expect(screen.getByRole('button', { name: 'Start race' }).disabled).toBe(true)
  })
})
