// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import StackView from '../components/visualizers/structures/StackView'
import QueueView from '../components/visualizers/structures/QueueView'
import LinkedListView from '../components/visualizers/structures/LinkedListView'

const items = [{ id: 'one', value: 'first' }, { id: 'two', value: 'second' }]

describe('shared data structure views', () => {
  it('renders the stack top and empty state', () => {
    const { rerender } = render(<StackView items={items} />)
    expect(screen.getByText('TOP [index 1]')).toBeTruthy()
    rerender(<StackView items={[]} />)
    expect(screen.getByRole('status').textContent).toBe('Stack is empty')
  })

  it('renders queue endpoints and highlights an item', () => {
    render(<QueueView items={items} highlight={{ two: 'found' }} />)
    expect(screen.getAllByText('FRONT').length).toBeGreaterThan(1)
    expect(screen.getAllByText('REAR').length).toBeGreaterThan(1)
    expect(screen.getByText('second').closest('li').className).toContain('border-state-sorted')
  })

  it('supports singly and doubly linked list pointer cards', () => {
    const { rerender } = render(<LinkedListView items={items} />)
    const singlyNullCount = screen.getAllByText('NULL').length
    rerender(<LinkedListView items={items} meta={{ variant: 'doubly' }} />)
    expect(screen.getAllByText('NULL').length).toBeGreaterThan(singlyNullCount)
    expect(screen.getAllByText('prev')).toHaveLength(2)
  })
})
