import { describe, it, expect } from 'vitest'
import React from 'react'
import PseudocodePanel from '../components/visualizer/PseudocodePanel'

describe('PseudocodePanel Component', () => {
  it('exports default component function', () => {
    expect(PseudocodePanel).toBeTypeOf('function')
  })
})
