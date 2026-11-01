// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import CallStackPanel from '../components/visualizer/CallStackPanel'
import { getCallStackAtStep } from '../utils/callStack'

afterEach(cleanup)

describe('CallStackPanel', () => {
  it('caps visible frames and reports omitted recursion depth', () => {
    const steps = Array.from({ length: 10 }, (_, depth) => ({
      callEvent: { type: 'enter', functionName: 'recurse', args: { depth }, depth },
    }))
    const stack = getCallStackAtStep(steps, 9, 4)

    render(<CallStackPanel {...stack} />)

    expect(screen.getByRole('status').textContent).toContain('+6 deeper frames')
    expect(screen.getAllByText('recurse').length).toBe(4)
    expect(document.querySelectorAll('[aria-current="step"]')).toHaveLength(1)
    expect(document.querySelector('[aria-current="step"]').textContent).toContain('depth=9')
  })
})
