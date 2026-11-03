import { useRef, useState } from 'react'
import { Maximize2, Plus, RefreshCw, RotateCcw, Search, Trash2 } from 'lucide-react'
import { useZen } from '../../hooks/useZen'
import { MAX_ITEMS, MAX_VALUE_LENGTH, structureMessages } from '../../engine/structureConfig'
import LinkedListView from '../visualizers/structures/LinkedListView'
import ZenDock from './ZenDock'

function generateId() {
  return globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export default function TactileLinkedListSandbox() {
  const { isZen, enterZen, exitZen } = useZen()
  const [listType, setListType] = useState('singly')
  const [items, setItems] = useState([])
  const [valueInput, setValueInput] = useState('')
  const [indexInput, setIndexInput] = useState('')
  const [alert, setAlert] = useState(null)
  const [highlightedId, setHighlightedId] = useState(null)
  const inputRef = useRef(null)

  const announce = (type, message) => setAlert({ type, message, id: Date.now() })
  const readValue = () => {
    const value = valueInput.trim()
    if (!value || value.length > MAX_VALUE_LENGTH) {
      announce('info', structureMessages.invalidValue)
      return null
    }
    return value
  }
  const ensureCapacity = () => {
    if (items.length < MAX_ITEMS) return true
    announce('overflow', structureMessages.overflow('Linked List'))
    return false
  }
  const addNode = (position) => {
    if (!ensureCapacity()) return
    const value = readValue()
    if (value === null) return
    let index = position === 'head' ? 0 : items.length
    if (position === 'index') {
      index = Number(indexInput)
      if (indexInput.trim() === '' || !Number.isInteger(index) || index < 0 || index > items.length) {
        announce('info', `Choose an insertion index from 0 to ${items.length}.`)
        return
      }
    }
    setItems((previous) => [...previous.slice(0, index), { id: generateId(), value }, ...previous.slice(index)])
    setValueInput('')
    setIndexInput('')
    announce('info', `Inserted ${value} at index ${index}.`)
    inputRef.current?.focus()
  }

  const deleteAtIndex = () => {
    if (!items.length) {
      announce('underflow', structureMessages.underflow('delete', 'Linked List'))
      return
    }
    const index = Number(indexInput)
    if (indexInput.trim() === '' || !Number.isInteger(index) || index < 0 || index >= items.length) {
      announce('info', `Choose a deletion index from 0 to ${items.length - 1}.`)
      return
    }
    const removed = items[index]
    setItems((previous) => previous.filter((_, currentIndex) => currentIndex !== index))
    setIndexInput('')
    announce('info', `Deleted ${removed.value} from index ${index}.`)
  }

  const deleteByValue = () => {
    if (!items.length) {
      announce('underflow', structureMessages.underflow('delete', 'Linked List'))
      return
    }
    const value = readValue()
    if (value === null) return
    const index = items.findIndex((item) => item.value === value)
    if (index < 0) {
      announce('info', `${value} is not in the linked list.`)
      return
    }
    setItems((previous) => previous.filter((_, currentIndex) => currentIndex !== index))
    setValueInput('')
    announce('info', `Deleted ${value} from index ${index}.`)
  }

  const search = () => {
    if (!items.length) {
      announce('underflow', structureMessages.underflow('search', 'Linked List'))
      return
    }
    const value = readValue()
    if (value === null) return
    const index = items.findIndex((item) => item.value === value)
    if (index < 0) {
      setHighlightedId(null)
      announce('info', `${value} is not in the linked list.`)
    } else {
      setHighlightedId(items[index].id)
      announce('info', `Found ${value} at index ${index}.`)
    }
  }

  const reverse = () => {
    setItems((previous) => [...previous].reverse())
    setHighlightedId(null)
    announce('info', 'Reversed the linked list.')
  }
  const reset = () => {
    setItems([])
    setValueInput('')
    setIndexInput('')
    setHighlightedId(null)
    announce('info', structureMessages.empty('Linked List'))
  }
  const loadSampleData = () => {
    setItems(['14', '38', '72'].map((value) => ({ id: generateId(), value })))
    setAlert(null)
  }

  const controls = (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      <div className="segmented" role="tablist" aria-label="Linked List variant selection">
        <button type="button" role="tab" aria-selected={listType === 'singly'} onClick={() => setListType('singly')} className={`segmented-option focus-ring ${listType === 'singly' ? 'selected' : ''}`}>Singly List</button>
        <button type="button" role="tab" aria-selected={listType === 'doubly'} onClick={() => setListType('doubly')} className={`segmented-option focus-ring ${listType === 'doubly' ? 'selected' : ''}`}>Doubly List</button>
      </div>
      <div className="flex items-center gap-1.5">
        <label htmlFor="ll-val-input" className="sr-only">Node value</label>
        <input
          id="ll-val-input"
          ref={inputRef}
          value={valueInput}
          onChange={(event) => setValueInput(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addNode('head') } }}
          maxLength={MAX_VALUE_LENGTH}
          placeholder="Value"
          className="h-9 w-28 rounded-md border border-line-strong bg-surface px-2.5 font-mono text-caption text-ink focus-ring"
        />
        <label htmlFor="ll-idx-input" className="sr-only">List index</label>
        <input
          id="ll-idx-input"
          type="number"
          min="0"
          max={MAX_ITEMS}
          step="1"
          value={indexInput}
          onChange={(event) => setIndexInput(event.target.value)}
          placeholder="Index"
          className="h-9 w-16 rounded-md border border-line-strong bg-surface px-2 font-mono text-caption text-ink focus-ring"
        />
      </div>
      <button type="button" onClick={() => addNode('head')} className="btn-ghost inline-flex h-9 items-center gap-1 border border-line px-2.5 text-caption font-semibold text-accent focus-ring"><Plus className="h-3.5 w-3.5" />Head</button>
      <button type="button" onClick={() => addNode('tail')} className="btn-ghost inline-flex h-9 items-center gap-1 border border-line px-2.5 text-caption font-semibold text-accent focus-ring"><Plus className="h-3.5 w-3.5" />Tail</button>
      <button type="button" onClick={() => addNode('index')} className="btn-ghost h-9 border border-line px-2.5 text-caption font-semibold text-ink-muted focus-ring">Insert at index</button>
      <button type="button" onClick={deleteAtIndex} className="btn-ghost inline-flex h-9 items-center gap-1 border border-line px-2.5 text-caption font-semibold text-state-swap focus-ring"><Trash2 className="h-3.5 w-3.5" />Delete at index</button>
      <button type="button" onClick={deleteByValue} className="btn-ghost h-9 border border-line px-2.5 text-caption font-semibold text-state-swap focus-ring">Delete by value</button>
      <button type="button" onClick={search} className="btn-ghost inline-flex h-9 items-center gap-1 border border-line px-2.5 text-caption font-semibold text-ink-muted focus-ring"><Search className="h-3.5 w-3.5" />Search</button>
      <button type="button" onClick={reverse} disabled={items.length < 2} className="btn-ghost inline-flex h-9 items-center gap-1 border border-line px-2.5 text-caption font-semibold text-accent focus-ring disabled:opacity-40"><RefreshCw className="h-3.5 w-3.5" />Reverse</button>
      {items.length === 0 && <button type="button" onClick={loadSampleData} className="btn-ghost h-9 border border-line px-3 text-caption font-semibold text-ink focus-ring">Load sample data</button>}
      <button type="button" onClick={reset} title="Reset Linked List" aria-label="Reset Linked List" className="btn-ghost inline-flex h-9 w-9 items-center justify-center rounded-md border border-line text-ink-muted focus-ring"><RotateCcw className="h-3.5 w-3.5" /></button>
      {!isZen && <button type="button" onClick={enterZen} title="Enter Zen Mode (Z)" className="btn-ghost inline-flex h-9 items-center gap-1 border border-line px-3 text-caption font-semibold text-accent focus-ring"><Maximize2 className="h-3.5 w-3.5" />Zen Mode</button>}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="sr-only" aria-live="polite" aria-atomic="true">{alert?.message}</div>
      {!isZen && (
        <div className="card space-y-4 p-4">
          {controls}
          {alert && (
            <div role="alert" className={`flex items-center justify-between gap-2 rounded-md border p-3 text-caption font-medium ${alert.type === 'overflow' || alert.type === 'underflow' ? 'border-state-swap bg-state-swap-ring/20 text-ink' : 'border-accent/30 bg-accent-soft text-accent-strong'}`}>
              <span>{alert.message}</span>
              <button type="button" onClick={() => setAlert(null)} className="focus-ring text-micro underline">Dismiss</button>
            </div>
          )}
        </div>
      )}
      <section className={`flex min-h-[400px] flex-col items-center justify-center ${isZen ? 'min-h-[75vh] py-6' : 'card p-6'}`} aria-label="Linked List visualization">
        <div className="mb-4 flex w-full max-w-5xl items-center justify-between gap-2 px-2">
          <div className="flex items-center gap-2">
            <span className="chip bg-sunken font-mono text-micro uppercase">{listType === 'singly' ? 'Singly Linked List' : 'Doubly Linked List'}</span>
            <span className="text-caption font-semibold text-ink">Pointer Topology</span>
          </div>
          <span className="font-mono text-caption text-ink-muted" aria-label={`${items.length} of ${MAX_ITEMS} items`}>Nodes: {items.length} / {MAX_ITEMS}</span>
        </div>
        <LinkedListView
          items={items}
          highlight={highlightedId ? { [highlightedId]: 'found' } : {}}
          variant={isZen ? 'zen' : 'default'}
          meta={{ variant: listType }}
        />
        {isZen && alert && <p role="status" className="mt-4 rounded-full border border-line bg-surface/90 px-4 py-2 text-center font-mono text-caption text-ink-muted">{alert.message}</p>}
      </section>
      {isZen && <ZenDock controlsVisible onExitZen={exitZen}>{controls}</ZenDock>}
    </div>
  )
}
