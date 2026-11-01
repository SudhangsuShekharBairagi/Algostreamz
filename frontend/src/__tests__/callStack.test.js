import { describe, expect, it } from 'vitest'
import { generateDfsSteps, createDefaultGraph } from '../engine/graphGenerators'
import { getCallStackAtStep } from '../utils/callStack'

describe('DFS call events', () => {
  it('keep the stack non-negative and empty when traversal completes', () => {
    const { nodes, edges } = createDefaultGraph()
    const steps = generateDfsSteps(nodes, edges, 'A')
    let depth = 0

    steps.forEach((step) => {
      if (step.callEvent?.type === 'enter') depth += 1
      if (step.callEvent?.type === 'exit') depth -= 1
      expect(depth).toBeGreaterThanOrEqual(0)
    })

    expect(depth).toBe(0)
    expect(getCallStackAtStep(steps, steps.length - 1).totalDepth).toBe(0)
  })
})
