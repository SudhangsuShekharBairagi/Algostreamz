import { describe, it, expect } from 'vitest'
import React from 'react'
import ExplanationPanel from '../components/visualizer/ExplanationPanel'

describe('ExplanationPanel Component', () => {
  it('exports default component function', () => {
    expect(ExplanationPanel).toBeTypeOf('function')
  })
})
