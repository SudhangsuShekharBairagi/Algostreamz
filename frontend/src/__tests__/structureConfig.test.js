import { describe, expect, it } from 'vitest'
import { MAX_ITEMS, MAX_VALUE_LENGTH, STRUCTURE_TERMINOLOGY, structureMessages } from '../engine/structureConfig'

describe('structure configuration', () => {
  it('defines shared item and value limits and terminology', () => {
    expect(MAX_ITEMS).toBe(20)
    expect(MAX_VALUE_LENGTH).toBe(32)
    expect(STRUCTURE_TERMINOLOGY).toMatchObject({
      stackTop: 'TOP',
      queueFront: 'FRONT',
      queueRear: 'REAR',
      head: 'HEAD',
      tail: 'TAIL',
      null: 'NULL',
    })
  })

  it('formats the shared overflow, underflow, and empty messages', () => {
    expect(structureMessages.overflow('Stack')).toBe('The stack is limited to 20 items.')
    expect(structureMessages.underflow('pop', 'Stack')).toBe('Cannot pop because the stack is empty.')
    expect(structureMessages.empty('Queue')).toBe('Queue is empty and ready for operations.')
    expect(structureMessages.invalidValue).toBe('Enter a value between 1 and 32 characters.')
  })
})
