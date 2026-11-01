// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import VisualizerPage from '../pages/VisualizerPage'
import { ZenProvider } from '../context/ZenContext'
import progressApi from '../services/progressApi'

function LocationSearch() {
  return <output data-testid="location-search">{useLocation().search}</output>
}

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
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

  it('loads shared URL state and replaces the query as playback changes', async () => {
    render(
      <MemoryRouter initialEntries={['/visualizer/bubble-sort?input=5,2,9,1&speed=200&step=7']}>
        <ZenProvider>
          <LocationSearch />
          <Routes>
            <Route path="/visualizer/:algorithmId" element={<VisualizerPage />} />
          </Routes>
        </ZenProvider>
      </MemoryRouter>,
    )

    const scrubber = await screen.findByRole('slider', { name: 'Timeline Scrubber' })
    expect(scrubber.value).toBe('7')
    expect(screen.getByRole('radio', { name: '2x' }).getAttribute('aria-checked')).toBe('true')

    fireEvent.change(scrubber, { target: { value: '3' } })

    await waitFor(() => {
      const query = new URLSearchParams(screen.getByTestId('location-search').textContent)
      expect(query.get('input')).toBe('5,2,9,1')
      expect(query.get('speed')).toBe('200')
      expect(query.get('step')).toBe('3')
    })
  })

  it('announces playback steps and supports keyboard stepping', async () => {
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
    fireEvent.keyDown(window, { key: 'ArrowRight' })

    await waitFor(() => {
      expect(scrubber.value).toBe('1')
      expect(document.querySelector('[aria-live="polite"][aria-atomic="true"]').textContent).toContain('Step 2')
    })
  })

  it('offers an opt-in sound toggle with a persistent setting', async () => {
    vi.stubGlobal('AudioContext', class {
      state = 'running'
      close() {}
    })
    render(
      <MemoryRouter initialEntries={['/visualizer/bubble-sort']}>
        <ZenProvider>
          <Routes>
            <Route path="/visualizer/:algorithmId" element={<VisualizerPage />} />
          </Routes>
        </ZenProvider>
      </MemoryRouter>,
    )

    const soundToggle = await screen.findByRole('button', { name: 'Enable visualizer sounds' })
    fireEvent.click(soundToggle)

    expect(localStorage.getItem('algostreamz:visualizer-sound-enabled')).toBe('true')
    expect(screen.getByRole('button', { name: 'Mute visualizer sounds' }).getAttribute('aria-pressed')).toBe('true')
  })
})
