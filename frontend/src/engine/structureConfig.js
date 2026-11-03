export const MAX_ITEMS = 20
export const MAX_VALUE_LENGTH = 32

export const STRUCTURE_TERMINOLOGY = {
  stackTop: 'TOP',
  queueFront: 'FRONT',
  queueRear: 'REAR',
  head: 'HEAD',
  tail: 'TAIL',
  null: 'NULL',
}

export const structureMessages = {
  overflow: (structure) => `The ${structure.toLowerCase()} is limited to ${MAX_ITEMS} items.`,
  underflow: (action, structure) =>
    `Cannot ${action} because the ${structure.toLowerCase()} is empty.`,
  empty: (structure) => `${structure} is empty and ready for operations.`,
  invalidValue: `Enter a value between 1 and ${MAX_VALUE_LENGTH} characters.`,
}
