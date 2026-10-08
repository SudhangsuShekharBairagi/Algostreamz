export const MAX_STRUCTURE_ITEMS = 20
export const MAX_STRUCTURE_OPERATIONS = 100
export const MAX_STRUCTURE_VALUE_LENGTH = 32

const EMPTY_STATS = { comparisons: 0, swaps: 0, arrayAccesses: 0 }

function makeStep(
  stepIndex,
  type,
  values,
  indices,
  pseudocodeLine,
  beginner,
  technical,
  highlightedIndices = {},
  stats = EMPTY_STATS
) {
  return {
    stepIndex,
    type,
    indices,
    values: [...values],
    highlightedIndices,
    pseudocodeLine,
    explanation: { beginner, technical },
    stats: { ...stats },
  }
}

function createSteps(structure, operations) {
  const values = []
  const history = Array.isArray(operations) ? operations.slice(0, MAX_STRUCTURE_OPERATIONS) : []
  const steps = [
    makeStep(
      0,
      'initialize',
      values,
      [],
      1,
      `${structure} is empty and ready for operations.`,
      `Initialize an empty ${structure.toLowerCase()} state.`
    ),
  ]
  const stats = { ...EMPTY_STATS }

  history.forEach((operation) => {
    const action = operation?.action
    const value = typeof operation?.value === 'string' ? operation.value.trim() : ''
    const index = operation?.index
    let type = action || 'invalid-operation'
    let pseudocodeLine = 1
    let explanation = 'Choose a valid operation.'
    let technical = 'The operation descriptor is missing or unsupported.'
    let indices = []
    let highlightedIndices = {}

    const validValue = value.length > 0 && value.length <= MAX_STRUCTURE_VALUE_LENGTH
    const addValue = (position, line, description, detail) => {
      if (!validValue) {
        type = 'invalid-operation'
        pseudocodeLine = line
        explanation = `Enter a value between 1 and ${MAX_STRUCTURE_VALUE_LENGTH} characters.`
        technical = 'The operation value must be a non-empty string within the supported length.'
        return
      }
      if (values.length >= MAX_STRUCTURE_ITEMS) {
        type = 'limit-reached'
        pseudocodeLine = line
        explanation = `The ${structure.toLowerCase()} is limited to ${MAX_STRUCTURE_ITEMS} items.`
        technical = `The maximum supported collection size is ${MAX_STRUCTURE_ITEMS}.`
        return
      }
      values.splice(position, 0, value)
      type = action
      pseudocodeLine = line
      explanation = description
      technical = detail
      indices = [position]
      highlightedIndices = { [position]: 'active' }
      stats.arrayAccesses++
    }

    if (structure === 'Stack') {
      if (action === 'push') {
        addValue(
          values.length,
          2,
          `Pushed ${value} onto the top of the stack.`,
          `Append ${value} at index ${values.length}, the stack top.`
        )
      } else if (action === 'pop' || action === 'peek') {
        pseudocodeLine = action === 'pop' ? 3 : 4
        if (values.length === 0) {
          type = 'underflow'
          explanation = `Cannot ${action} because the stack is empty.`
          technical = `The ${action} operation requires a non-empty stack.`
        } else if (action === 'peek') {
          indices = [values.length - 1]
          highlightedIndices = { [values.length - 1]: 'active' }
          explanation = `The top of the stack is ${values.at(-1)}.`
          technical = `Read stack[${values.length - 1}] without changing the stack.`
          stats.arrayAccesses++
        } else {
          const removed = values.pop()
          explanation = `Popped ${removed} from the top of the stack.`
          technical = `Remove the last element (${removed}) from the stack.`
          stats.arrayAccesses++
        }
      }
    } else if (structure === 'Queue') {
      if (action === 'enqueue') {
        addValue(
          values.length,
          2,
          `Enqueued ${value} at the rear of the queue.`,
          `Append ${value} at index ${values.length}, the queue rear.`
        )
      } else if (action === 'dequeue' || action === 'peek') {
        pseudocodeLine = action === 'dequeue' ? 3 : 4
        if (values.length === 0) {
          type = 'underflow'
          explanation = `Cannot ${action} because the queue is empty.`
          technical = `The ${action} operation requires a non-empty queue.`
        } else if (action === 'peek') {
          indices = [0]
          highlightedIndices = { 0: 'active' }
          explanation = `The front of the queue is ${values[0]}.`
          technical = 'Read queue[0] without changing the queue.'
          stats.arrayAccesses++
        } else {
          const removed = values.shift()
          explanation = `Dequeued ${removed} from the front of the queue.`
          technical = `Remove the first element (${removed}) from the queue.`
          stats.arrayAccesses++
        }
      }
    } else if (structure === 'Linked List') {
      if (action === 'insert-head') {
        addValue(
          0,
          2,
          `Inserted ${value} at the head of the list.`,
          `Create a node with value ${value} and link it before the current head.`
        )
      } else if (action === 'insert-tail') {
        addValue(
          values.length,
          3,
          `Inserted ${value} at the tail of the list.`,
          `Traverse to the final node and link a node containing ${value}.`
        )
      } else if (action === 'insert-at') {
        pseudocodeLine = 4
        if (!Number.isInteger(index) || index < 0 || index > values.length) {
          type = 'invalid-operation'
          explanation = `Choose an insertion index from 0 to ${values.length}.`
          technical = 'A valid insertion index is in the inclusive range [0, list length].'
        } else {
          addValue(
            index,
            4,
            `Inserted ${value} at index ${index}.`,
            `Link a new node containing ${value} at position ${index}.`
          )
        }
      } else if (action === 'delete-at') {
        pseudocodeLine = 5
        if (!Number.isInteger(index) || index < 0 || index >= values.length) {
          type = 'invalid-operation'
          explanation = `Choose a deletion index from 0 to ${Math.max(0, values.length - 1)}.`
          technical = 'A valid deletion index must identify an existing node.'
        } else {
          const [removed] = values.splice(index, 1)
          explanation = `Deleted ${removed} from index ${index}.`
          technical = `Unlink the node at position ${index} and reconnect its neighbors.`
          indices = values.length > 0 ? [Math.min(index, values.length - 1)] : []
          highlightedIndices = indices.length ? { [indices[0]]: 'active' } : {}
          stats.arrayAccesses++
        }
      } else if (action === 'search') {
        pseudocodeLine = 6
        if (!validValue) {
          type = 'invalid-operation'
          explanation = `Enter a value between 1 and ${MAX_STRUCTURE_VALUE_LENGTH} characters.`
          technical = 'Search values must be non-empty strings within the supported length.'
        } else {
          const foundIndex = values.indexOf(value)
          const comparisons = foundIndex === -1 ? values.length : foundIndex + 1
          stats.comparisons += comparisons
          stats.arrayAccesses += comparisons
          if (foundIndex === -1) {
            type = 'not-found'
            explanation = `${value} is not in the linked list.`
            technical = `A linear scan completed without finding ${value}.`
          } else {
            type = 'found'
            indices = [foundIndex]
            highlightedIndices = { [foundIndex]: 'found' }
            explanation = `Found ${value} at index ${foundIndex}.`
            technical = `The first matching node is at position ${foundIndex}.`
          }
        }
      }
    }

    const allowedActions = {
      Stack: ['push', 'pop', 'peek'],
      Queue: ['enqueue', 'dequeue', 'peek'],
      'Linked List': ['insert-head', 'insert-tail', 'insert-at', 'delete-at', 'search'],
    }
    if (!allowedActions[structure].includes(action)) {
      type = 'invalid-operation'
      explanation = 'Choose an operation available for this data structure.'
      technical = `The action ${String(action)} is not supported for ${structure}.`
    }

    steps.push(
      makeStep(steps.length, type, values, indices, pseudocodeLine, explanation, technical, highlightedIndices, stats)
    )
  })

  return steps
}

export function generateStackSteps(operations = []) {
  return createSteps('Stack', operations)
}

export function generateQueueSteps(operations = []) {
  return createSteps('Queue', operations)
}

export function generateLinkedListSteps(operations = []) {
  return createSteps('Linked List', operations)
}
