import {
  MAX_ITEMS,
  MAX_VALUE_LENGTH,
  structureMessages,
} from './structureConfig'

export const MAX_STRUCTURE_ITEMS = MAX_ITEMS
export const MAX_STRUCTURE_OPERATIONS = 100
export const MAX_STRUCTURE_VALUE_LENGTH = MAX_VALUE_LENGTH

const EMPTY_STATS = { comparisons: 0, swaps: 0, arrayAccesses: 0 }

function makeStep(stepIndex, type, values, indices, pseudocodeLine, beginner, technical, highlightedIndices = {}, stats = EMPTY_STATS) {
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
    makeStep(0, 'initialize', values, [], 1, structureMessages.empty(structure), `Initialize an empty ${structure.toLowerCase()} state.`),
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
    const validValue = value.length > 0 && value.length <= MAX_VALUE_LENGTH

    const addValue = (position, line, description, detail) => {
      pseudocodeLine = line
      if (!validValue) {
        type = 'invalid-operation'
        explanation = structureMessages.invalidValue
        technical = 'The operation value must be a non-empty string within the supported length.'
        return
      }
      if (values.length >= MAX_ITEMS) {
        type = 'limit-reached'
        explanation = structureMessages.overflow(structure)
        technical = `The maximum supported collection size is ${MAX_ITEMS}.`
        return
      }
      values.splice(position, 0, value)
      type = action
      explanation = description
      technical = detail
      indices = [position]
      highlightedIndices = { [position]: 'active' }
      stats.arrayAccesses++
    }

    if (structure === 'Stack') {
      if (action === 'push') {
        addValue(values.length, 2, `Pushed ${value} onto the top of the stack.`, `Append ${value} at index ${values.length}, the stack top.`)
      } else if (action === 'pop' || action === 'peek') {
        pseudocodeLine = action === 'pop' ? 3 : 4
        if (values.length === 0) {
          type = 'underflow'
          explanation = structureMessages.underflow(action, structure)
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
        addValue(values.length, 2, `Enqueued ${value} at the rear of the queue.`, `Append ${value} at index ${values.length}, the queue rear.`)
      } else if (['dequeue', 'peek', 'front', 'rear'].includes(action)) {
        pseudocodeLine = action === 'dequeue' ? 3 : action === 'rear' ? 5 : 4
        if (values.length === 0) {
          type = 'underflow'
          explanation = structureMessages.underflow(action === 'peek' ? 'peek' : action, structure)
          technical = `The ${action} operation requires a non-empty queue.`
        } else if (action === 'peek' || action === 'front' || action === 'rear') {
          const targetIndex = action === 'rear' ? values.length - 1 : 0
          indices = [targetIndex]
          highlightedIndices = { [targetIndex]: 'active' }
          explanation = action === 'rear'
            ? `The rear of the queue is ${values[targetIndex]}.`
            : `The front of the queue is ${values[targetIndex]}.`
          technical = `Read queue[${targetIndex}] without changing the queue.`
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
        addValue(0, 2, `Inserted ${value} at the head of the list.`, `Create a node with value ${value} and link it before the current head.`)
      } else if (action === 'insert-tail') {
        addValue(values.length, 3, `Inserted ${value} at the tail of the list.`, `Traverse to the final node and link a node containing ${value}.`)
      } else if (action === 'insert-at') {
        pseudocodeLine = 4
        if (!Number.isInteger(index) || index < 0 || index > values.length) {
          type = 'invalid-operation'
          explanation = `Choose an insertion index from 0 to ${values.length}.`
          technical = 'A valid insertion index is in the inclusive range [0, list length].'
        } else {
          addValue(index, 4, `Inserted ${value} at index ${index}.`, `Link a new node containing ${value} at position ${index}.`)
        }
      } else if (action === 'delete-at') {
        pseudocodeLine = 5
        if (values.length === 0) {
          type = 'underflow'
          explanation = structureMessages.underflow('delete', structure)
          technical = 'The delete operation requires a non-empty linked list.'
        } else if (!Number.isInteger(index) || index < 0 || index >= values.length) {
          type = 'invalid-operation'
          explanation = `Choose a deletion index from 0 to ${Math.max(0, values.length - 1)}.`
          technical = 'A valid deletion index must identify an existing node.'
        } else {
          const [removed] = values.splice(index, 1)
          explanation = `Deleted ${removed} from index ${index}.`
          technical = `Unlink the node at position ${index} and reconnect its neighbors.`
          indices = values.length ? [Math.min(index, values.length - 1)] : []
          highlightedIndices = indices.length ? { [indices[0]]: 'active' } : {}
          stats.arrayAccesses++
        }
      } else if (action === 'delete-value' || action === 'search') {
        pseudocodeLine = action === 'search' ? 6 : 7
        if (!validValue) {
          type = 'invalid-operation'
          explanation = structureMessages.invalidValue
          technical = `${action === 'search' ? 'Search' : 'Delete'} values must be non-empty strings within the supported length.`
        } else {
          const foundIndex = values.indexOf(value)
          if (values.length === 0) {
            type = 'underflow'
            explanation = structureMessages.underflow(action === 'search' ? 'search' : 'delete', structure)
            technical = `The ${action} operation requires a non-empty linked list.`
          } else {
            stats.comparisons += foundIndex === -1 ? values.length : foundIndex + 1
            stats.arrayAccesses += foundIndex === -1 ? values.length : foundIndex + 1
            if (foundIndex === -1) {
              type = 'not-found'
              explanation = `${value} is not in the linked list.`
              technical = `A linear scan completed without finding ${value}.`
            } else if (action === 'delete-value') {
              values.splice(foundIndex, 1)
              type = action
              explanation = `Deleted ${value} from index ${foundIndex}.`
              technical = `Unlink the first node containing ${value} and reconnect its neighbors.`
              indices = values.length ? [Math.min(foundIndex, values.length - 1)] : []
              highlightedIndices = indices.length ? { [indices[0]]: 'active' } : {}
            } else {
              type = 'found'
              indices = [foundIndex]
              highlightedIndices = { [foundIndex]: 'found' }
              explanation = `Found ${value} at index ${foundIndex}.`
              technical = `The first matching node is at position ${foundIndex}.`
            }
          }
        }
      } else if (action === 'reverse') {
        pseudocodeLine = 8
        values.reverse()
        type = 'reverse'
        explanation = 'Reversed the linked list.'
        technical = 'Reverse the direction of each link in the list.'
        indices = values.map((_, currentIndex) => currentIndex)
        highlightedIndices = Object.fromEntries(indices.map((currentIndex) => [currentIndex, 'active']))
        stats.arrayAccesses += values.length
      }
    }

    const allowedActions = {
      Stack: ['push', 'pop', 'peek'],
      Queue: ['enqueue', 'dequeue', 'peek', 'front', 'rear'],
      'Linked List': ['insert-head', 'insert-tail', 'insert-at', 'delete-at', 'delete-value', 'search', 'reverse'],
    }
    if (!allowedActions[structure].includes(action)) {
      type = 'invalid-operation'
      explanation = 'Choose an operation available for this data structure.'
      technical = `The action ${String(action)} is not supported for ${structure}.`
    }

    steps.push(makeStep(steps.length, type, values, indices, pseudocodeLine, explanation, technical, highlightedIndices, stats))
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
