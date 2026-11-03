import { useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Eye, Layers, ListOrdered, Maximize2, RotateCcw } from 'lucide-react'
import { useZen } from '../../hooks/useZen'
import { MAX_ITEMS, MAX_VALUE_LENGTH, structureMessages } from '../../engine/structureConfig'
import StackView from '../visualizers/structures/StackView'
import QueueView from '../visualizers/structures/QueueView'
import ZenDock from './ZenDock'

function generateId() {
  return globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export default function TactileDataStructureSandbox({ initialMode = 'stack' }) {
  const { isZen, enterZen, exitZen } = useZen()
  const [mode, setMode] = useState(initialMode)
  const [items, setItems] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [alert, setAlert] = useState(null)
  const [highlightedId, setHighlightedId] = useState(null)
  const inputRef = useRef(null)
  const structure = mode === 'stack' ? 'Stack' : 'Queue'

  const announce = (type, message) => setAlert({ type, message, id: Date.now() })
  const focusInput = () => inputRef.current?.focus()

  const addItem = () => {
    const value = inputValue.trim()
    if (!value || value.length > MAX_VALUE_LENGTH) {
      announce('info', structureMessages.invalidValue)
      focusInput()
      return
    }
    if (items.length >= MAX_ITEMS) {
      announce('overflow', structureMessages.overflow(structure))
      focusInput()
      return
    }
    setItems((previous) => [...previous, { id: generateId(), value }])
    setInputValue('')
    announce('info', mode === 'stack'
      ? `Pushed ${value} onto the top of the stack.`
      : `Enqueued ${value} at the rear of the queue.`)
    focusInput()
  }

  const removeItem = () => {
    if (!items.length) {
      announce('underflow', structureMessages.underflow(mode === 'stack' ? 'pop' : 'dequeue', structure))
      focusInput()
      return
    }
    const removed = mode === 'stack' ? items.at(-1) : items[0]
    setItems((previous) => mode === 'stack' ? previous.slice(0, -1) : previous.slice(1))
    announce('info', mode === 'stack'
      ? `Popped ${removed.value} from the top of the stack.`
      : `Dequeued ${removed.value} from the front of the queue.`)
    focusInput()
  }

  const peekItem = (end = 'front') => {
    if (!items.length) {
      const action = mode === 'stack' ? 'peek' : end
      announce('underflow', structureMessages.underflow(action, structure))
      focusInput()
      return
    }
    const item = mode === 'stack' || end === 'rear' ? items.at(-1) : items[0]
    setHighlightedId(item.id)
    announce('info', mode === 'stack'
      ? `The top of the stack is ${item.value}.`
      : `The ${end} of the queue is ${item.value}.`)
    window.setTimeout(() => setHighlightedId(null), 1200)
    focusInput()
  }

  const reset = () => {
    setItems([])
    setInputValue('')
    setHighlightedId(null)
    announce('info', structureMessages.empty(structure))
    focusInput()
  }

  const loadSampleData = () => {
    setItems(['24', '68', '91'].map((value) => ({ id: generateId(), value })))
    setAlert(null)
  }

  const controls = (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      <div className="segmented" role="tablist" aria-label="Data structure mode selection">
        <button type="button" role="tab" aria-selected={mode === 'stack'} onClick={() => setMode('stack')} className={`segmented-option focus-ring ${mode === 'stack' ? 'selected' : ''}`}>
          <Layers className="mr-1 inline h-3.5 w-3.5" />Stack (LIFO)
        </button>
        <button type="button" role="tab" aria-selected={mode === 'queue'} onClick={() => setMode('queue')} className={`segmented-option focus-ring ${mode === 'queue' ? 'selected' : ''}`}>
          <ListOrdered className="mr-1 inline h-3.5 w-3.5" />Queue (FIFO)
        </button>
      </div>
      <form onSubmit={(event) => { event.preventDefault(); addItem() }} className="flex items-center gap-1.5">
        <label htmlFor="ds-value-input" className="sr-only">Value to add</label>
        <input
          id="ds-value-input"
          ref={inputRef}
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          maxLength={MAX_VALUE_LENGTH}
          placeholder="Value"
          className="h-9 w-28 rounded-md border border-line-strong bg-surface px-3 font-mono text-caption text-ink focus-ring"
        />
        <button type="submit" className="btn-primary h-9 px-3 text-caption font-semibold focus-ring">Insert</button>
      </form>
      <button type="button" onClick={addItem} className="btn-ghost inline-flex h-9 items-center gap-1 border border-line px-3 text-caption font-semibold text-accent focus-ring">
        <ArrowDown className="h-3.5 w-3.5" />{mode === 'stack' ? 'Push' : 'Enqueue'}
      </button>
      <button type="button" onClick={removeItem} className="btn-ghost inline-flex h-9 items-center gap-1 border border-line px-3 text-caption font-semibold text-state-swap focus-ring">
        <ArrowUp className="h-3.5 w-3.5" />{mode === 'stack' ? 'Pop' : 'Dequeue'}
      </button>
      {mode === 'stack' ? (
        <button type="button" onClick={() => peekItem()} className="btn-ghost inline-flex h-9 items-center gap-1 border border-line px-3 text-caption font-semibold text-ink-muted focus-ring"><Eye className="h-3.5 w-3.5" />Peek</button>
      ) : (
        <>
          <button type="button" onClick={() => peekItem('front')} className="btn-ghost h-9 border border-line px-2.5 text-caption font-semibold text-ink-muted focus-ring">Front</button>
          <button type="button" onClick={() => peekItem('front')} className="btn-ghost h-9 border border-line px-2.5 text-caption font-semibold text-ink-muted focus-ring">Peek</button>
          <button type="button" onClick={() => peekItem('rear')} className="btn-ghost h-9 border border-line px-2.5 text-caption font-semibold text-ink-muted focus-ring">Rear</button>
        </>
      )}
      {items.length === 0 && <button type="button" onClick={loadSampleData} className="btn-ghost h-9 border border-line px-3 text-caption font-semibold text-ink focus-ring">Load sample data</button>}
      <button type="button" onClick={reset} aria-label="Clear structure" title="Clear structure" className="btn-ghost inline-flex h-9 w-9 items-center justify-center rounded-md border border-line text-ink-muted focus-ring"><RotateCcw className="h-3.5 w-3.5" /></button>
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
      <section className={`flex flex-col items-center justify-center ${isZen ? 'min-h-[75vh] py-6' : 'card min-h-[420px] p-6'}`} aria-label={`${structure} visualization`}>
        <div className="mb-4 flex w-full max-w-4xl items-center justify-between gap-2 px-2">
          <div className="flex items-center gap-2">
            <span className="chip bg-sunken font-mono text-micro uppercase">{mode === 'stack' ? 'LIFO Principle' : 'FIFO Principle'}</span>
            <span className="text-caption font-semibold text-ink">{structure} Structure</span>
          </div>
          <span className="font-mono text-caption text-ink-muted" aria-label={`${items.length} of ${MAX_ITEMS} items`}>Items: {items.length} / {MAX_ITEMS}</span>
        </div>
        <div className={`flex w-full items-center justify-center ${isZen ? 'my-6' : 'my-2'}`}>
          {mode === 'stack'
            ? <StackView items={items} highlight={highlightedId ? { [highlightedId]: 'active' } : {}} variant={isZen ? 'zen' : 'default'} />
            : <QueueView items={items} highlight={highlightedId ? { [highlightedId]: 'active' } : {}} variant={isZen ? 'zen' : 'default'} />}
        </div>
        {isZen && alert && <p role="status" className="mt-4 rounded-full border border-line bg-surface/90 px-4 py-2 text-center font-mono text-caption text-ink-muted">{alert.message}</p>}
      </section>
      {isZen && <ZenDock controlsVisible onExitZen={exitZen}>{controls}</ZenDock>}
    </div>
  )
}
