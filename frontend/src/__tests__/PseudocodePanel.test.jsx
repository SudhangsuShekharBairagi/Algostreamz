// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import PseudocodePanel from '../components/visualizer/PseudocodePanel'

afterEach(cleanup)

describe('PseudocodePanel code snippets', () => {
  it('switches languages and highlights the mapped source line', () => {
    render(
      <PseudocodePanel
        pseudocode={[
          { line: 1, indent: 0, text: 'loop' },
          { line: 2, indent: 1, text: 'compare' },
        ]}
        activeLine={2}
        codeSnippets={{
          java: { code: 'first();\nsecond();', lineMap: [1, 2] },
          python: { code: 'first()\nsecond()', lineMap: [1, 1] },
          cpp: { code: 'first();\nsecond();', lineMap: [2, 1] },
        }}
      />,
    )

    expect(screen.getByRole('tab', { name: 'Java' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByText('second();').getAttribute('aria-current')).toBe('step')

    fireEvent.click(screen.getByRole('tab', { name: 'Python' }))

    expect(screen.getByRole('tab', { name: 'Python' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByText('first()').getAttribute('aria-current')).toBe('step')
  })
})
