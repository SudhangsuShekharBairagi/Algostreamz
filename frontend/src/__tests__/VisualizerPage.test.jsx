// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import VisualizerPage from '../pages/VisualizerPage'
import { ZenProvider } from '../context/ZenContext'
import progressApi from '../services/progressApi'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('VisualizerPage Component', () => {
  it('exports default component function', () => {
    expect(VisualizerPage).toBeTypeOf('function')
  })

  it('records an algorithm when the timeline reaches its final step', async () => {
    render(
      <MemoryRouter initialEntries={['/visualizer/bubble-sort']}>
        <ZenProvider>
          <Routes>
            <Route path="/visualizer/:algorithmId" element={<VisualizerPage />} />
          </Routes>
        </ZenProvider>
      </MemoryRouter>,
    )

    const scrubber = await screen.findByRole('slider', { name: 'Timeline Scrubber' })
    expect(progressApi.getLocalProgress().completedVisualizers).not.toContain('bubble-sort')
    fireEvent.change(scrubber, { target: { value: scrubber.getAttribute('max') } })

    await waitFor(() => {
      expect(progressApi.getLocalProgress().completedVisualizers).toContain('bubble-sort')
    })
  })

  it('renders a 404 when the algorithm id is not in the catalog', () => {
    render(
      <MemoryRouter initialEntries={['/visualizer/not-a-real-algorithm']}>
        <ZenProvider>
          <Routes>
            <Route path="/visualizer/:algorithmId" element={<VisualizerPage />} />
          </Routes>
        </ZenProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: '404 - Algorithm Not Found' })).toBeTruthy()
    expect(screen.getByText(/not-a-real-algorithm/)).toBeTruthy()
  })
})
