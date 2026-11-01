export const MAX_DISPLAYED_CALL_DEPTH = 8

export function getCallStackAtStep(steps, stepIndex, maxDepth = MAX_DISPLAYED_CALL_DEPTH) {
  const stack = []
  const lastIndex = Math.min(stepIndex, steps.length - 1)

  for (let index = 0; index <= lastIndex; index += 1) {
    const event = steps[index]?.callEvent
    if (!event) continue
    if (event.type === 'enter') {
      stack.push({
        functionName: event.functionName,
        args: event.args,
        depth: event.depth,
      })
    } else if (event.type === 'exit' && stack.length > 0) {
      stack.pop()
    }
  }

  const visibleDepth = Math.max(1, maxDepth)
  return {
    frames: stack.slice(-visibleDepth),
    overflow: Math.max(0, stack.length - visibleDepth),
    totalDepth: stack.length,
  }
}
