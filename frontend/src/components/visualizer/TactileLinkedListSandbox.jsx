import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  ArrowRight,
  RotateCcw,
  Search,
  Maximize2,
  GitCommit,
  AlertCircle,
  CheckCircle2,
  Trash2,
  RefreshCw,
} from 'lucide-react'
import { useZen } from '../../hooks/useZen'
import ZenDock from './ZenDock'

const MAX_NODES = 10

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
}

export default function TactileLinkedListSandbox() {
  const { isZen, enterZen, exitZen } = useZen()
  const [listType, setListType] = useState('singly') // 'singly' | 'doubly'
  const [items, setItems] = useState([
    { id: 'node-101', value: '14' },
    { id: 'node-102', value: '38' },
    { id: 'node-103', value: '72' },
  ])
  const [valueInput, setValueInput] = useState('')
  const [indexInput, setIndexInput] = useState('')
  const [alert, setAlert] = useState(null)
  const [activeSearchIndex, setActiveSearchIndex] = useState(null)
  const [reversingIndex, setReversingIndex] = useState(null)
  const [isReversing, setIsReversing] = useState(false)
  const [highlightAll, setHighlightAll] = useState(false)
  const inputRef = useRef(null)

  const focusInput = useCallback(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 50)
  }, [])

  const triggerAlert = (type, message) => {
    setAlert({ type, message, id: Date.now() })
  }

  const generateDefaultValue = () => {
    return String(Math.floor(Math.random() * 89) + 10)
  }

  // --- LINKED LIST OPERATIONS ---
  const handleInsertHead = () => {
    if (items.length >= MAX_NODES) {
      triggerAlert('overflow', `Capacity alert: Maximum ${MAX_NODES} nodes allowed.`)
      focusInput()
      return
    }
    const val = valueInput.trim() || generateDefaultValue()
    const newNode = { id: generateId(), value: val }
    setItems((prev) => [newNode, ...prev])
    setValueInput('')
    triggerAlert('info', `Inserted "${val}" at HEAD (index 0).`)
    focusInput()
  }

  const handleInsertTail = () => {
    if (items.length >= MAX_NODES) {
      triggerAlert('overflow', `Capacity alert: Maximum ${MAX_NODES} nodes allowed.`)
      focusInput()
      return
    }
    const val = valueInput.trim() || generateDefaultValue()
    const newNode = { id: generateId(), value: val }
    setItems((prev) => [...prev, newNode])
    setValueInput('')
    triggerAlert('info', `Inserted "${val}" at TAIL (index ${items.length}).`)
    focusInput()
  }

  const handleInsertAtIndex = () => {
    if (items.length >= MAX_NODES) {
      triggerAlert('overflow', `Capacity alert: Maximum ${MAX_NODES} nodes allowed.`)
      focusInput()
      return
    }
    const val = valueInput.trim() || generateDefaultValue()
    const targetIdx = indexInput.trim() === '' ? Math.floor(items.length / 2) : Number(indexInput)
    const validIdx = Math.max(0, Math.min(items.length, Number.isNaN(targetIdx) ? 0 : targetIdx))

    const newNode = { id: generateId(), value: val }
    setItems((prev) => [...prev.slice(0, validIdx), newNode, ...prev.slice(validIdx)])
    setValueInput('')
    setIndexInput('')
    triggerAlert('info', `Inserted "${val}" at index ${validIdx}.`)
    focusInput()
  }

  const handleDeleteValue = () => {
    if (items.length === 0) {
      triggerAlert('underflow', 'Underflow alert: Cannot delete from an empty Linked List!')
      focusInput()
      return
    }
    const searchTarget = valueInput.trim()
    let targetIdx = -1

    if (searchTarget !== '') {
      targetIdx = items.findIndex((item) => item.value.toLowerCase() === searchTarget.toLowerCase())
    }

    if (targetIdx === -1 && indexInput.trim() !== '') {
      const parsedIdx = Number(indexInput)
      if (!Number.isNaN(parsedIdx) && parsedIdx >= 0 && parsedIdx < items.length) {
        targetIdx = parsedIdx
      }
    }

    // Default to deleting head if neither matches
    if (targetIdx === -1) {
      if (searchTarget === '') {
        targetIdx = 0
      } else {
        triggerAlert('underflow', `Value "${searchTarget}" not found in Linked List.`)
        focusInput()
        return
      }
    }

    const removedNode = items[targetIdx]
    setItems((prev) => prev.filter((_, idx) => idx !== targetIdx))
    setValueInput('')
    setIndexInput('')
    triggerAlert('underflow', `Deleted node "${removedNode.value}" at index ${targetIdx}.`)
    focusInput()
  }

  const handleSearchValue = () => {
    if (items.length === 0) {
      triggerAlert('underflow', 'Linked List is empty! Nothing to search.')
      focusInput()
      return
    }

    const query = valueInput.trim() || items[Math.floor(Math.random() * items.length)].value
    const foundIdx = items.findIndex((item) => item.value.toLowerCase() === query.toLowerCase())

    let currentStep = 0
    triggerAlert('info', `Searching for value "${query}" starting from HEAD…`)
    setActiveSearchIndex(0)

    const interval = setInterval(() => {
      currentStep++
      if (currentStep < items.length && (foundIdx === -1 || currentStep <= foundIdx)) {
        setActiveSearchIndex(currentStep)
      } else {
        clearInterval(interval)
        if (foundIdx !== -1) {
          setActiveSearchIndex(foundIdx)
          triggerAlert('info', `Found value "${query}" at index ${foundIdx}!`)
        } else {
          setActiveSearchIndex(null)
          triggerAlert('underflow', `Value "${query}" not found in Linked List.`)
        }
        setTimeout(() => setActiveSearchIndex(null), 2000)
      }
    }, 450)

    focusInput()
  }

  const handleReverseList = () => {
    if (items.length <= 1) {
      triggerAlert('info', 'Linked List has 1 or 0 nodes; already reversed.')
      focusInput()
      return
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      setItems((prev) => [...prev].reverse())
      setHighlightAll(true)
      triggerAlert('info', 'Reversed the Linked List links.')
      setTimeout(() => setHighlightAll(false), 1200)
      focusInput()
      return
    }

    setIsReversing(true)
    let idx = 0

    const interval = setInterval(() => {
      if (idx < items.length - 1) {
        setReversingIndex(idx)
        idx++
      } else {
        clearInterval(interval)
        setReversingIndex(null)
        setIsReversing(false)
        setItems((prev) => [...prev].reverse())
        setHighlightAll(true)
        triggerAlert('info', 'Reversed the Linked List links successfully!')
        setTimeout(() => setHighlightAll(false), 1200)
      }
    }, 350)

    focusInput()
  }

  const handleReset = () => {
    setItems([
      { id: generateId(), value: '14' },
      { id: generateId(), value: '38' },
      { id: generateId(), value: '72' },
    ])
    setValueInput('')
    setIndexInput('')
    setActiveSearchIndex(null)
    setReversingIndex(null)
    setIsReversing(false)
    triggerAlert('info', 'Reset Linked List to initial state.')
    focusInput()
  }

  const actionControlsMarkup = (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {/* Singly / Doubly Toggle (.segmented) */}
      <div className="segmented" role="tablist" aria-label="Linked List variant selection">
        <button
          type="button"
          role="tab"
          aria-selected={listType === 'singly'}
          onClick={() => {
            setListType('singly')
            focusInput()
          }}
          className={`segmented-option focus-ring ${listType === 'singly' ? 'selected' : ''}`}
        >
          Singly List
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={listType === 'doubly'}
          onClick={() => {
            setListType('doubly')
            focusInput()
          }}
          className={`segmented-option focus-ring ${listType === 'doubly' ? 'selected' : ''}`}
        >
          Doubly List
        </button>
      </div>

      {/* Input Fields */}
      <div className="flex items-center gap-1.5">
        <label htmlFor="ll-val-input" className="sr-only">
          Node value
        </label>
        <input
          id="ll-val-input"
          ref={inputRef}
          type="text"
          value={valueInput}
          onChange={(e) => setValueInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleInsertHead()
            }
          }}
          placeholder="Val (e.g. 42)"
          maxLength={8}
          className="h-9 w-24 sm:w-28 rounded-md border border-line-strong bg-surface px-2.5 font-mono text-caption text-ink focus-ring shadow-e1"
        />
        <label htmlFor="ll-idx-input" className="sr-only">
          Target index
        </label>
        <input
          id="ll-idx-input"
          type="number"
          value={indexInput}
          onChange={(e) => setIndexInput(e.target.value)}
          placeholder="Idx"
          min={0}
          max={MAX_NODES}
          className="h-9 w-14 rounded-md border border-line-strong bg-surface px-2 font-mono text-caption text-ink focus-ring shadow-e1"
        />
      </div>

      <div className="h-6 w-px bg-line hidden sm:block" />

      {/* Operations Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={handleInsertHead}
          className="btn-ghost h-9 border border-line px-2.5 text-caption font-semibold text-accent hover:bg-accent-soft inline-flex items-center gap-1 focus-ring"
        >
          <Plus className="w-3.5 h-3.5" />
          Head
        </button>
        <button
          type="button"
          onClick={handleInsertTail}
          className="btn-ghost h-9 border border-line px-2.5 text-caption font-semibold text-accent hover:bg-accent-soft inline-flex items-center gap-1 focus-ring"
        >
          <Plus className="w-3.5 h-3.5" />
          Tail
        </button>
        <button
          type="button"
          onClick={handleInsertAtIndex}
          className="btn-ghost h-9 border border-line px-2.5 text-caption font-semibold text-ink-muted hover:text-ink focus-ring"
        >
          Insert @
        </button>
        <button
          type="button"
          onClick={handleDeleteValue}
          className="btn-ghost h-9 border border-line px-2.5 text-caption font-semibold text-state-swap hover:bg-state-swap-ring/20 inline-flex items-center gap-1 focus-ring"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
        <button
          type="button"
          onClick={handleSearchValue}
          className="btn-ghost h-9 border border-line px-2.5 text-caption font-semibold text-ink-muted hover:text-ink inline-flex items-center gap-1 focus-ring"
        >
          <Search className="w-3.5 h-3.5" />
          Search
        </button>
        <button
          type="button"
          onClick={handleReverseList}
          disabled={isReversing}
          className="btn-ghost h-9 border border-line px-2.5 text-caption font-semibold text-accent hover:bg-accent-soft inline-flex items-center gap-1 focus-ring disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isReversing ? 'animate-spin' : ''}`} />
          Reverse
        </button>
      </div>

      {/* Reset */}
      <button
        type="button"
        onClick={handleReset}
        title="Reset Linked List"
        className="btn-ghost h-9 w-9 p-0 border border-line rounded-md inline-flex items-center justify-center text-ink-muted hover:text-ink focus-ring"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>

      {/* Zen Mode */}
      {!isZen && (
        <button
          type="button"
          onClick={enterZen}
          title="Enter Zen Mode (Z)"
          className="btn-ghost h-9 px-3 border border-line text-caption font-semibold text-accent hover:bg-accent-soft inline-flex items-center gap-1 focus-ring"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          Zen Mode
        </button>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Screen Reader Announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {alert?.message}
      </div>

      {/* Controls & Toast Banner (Non-Zen) */}
      {!isZen && (
        <div className="card p-4 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {actionControlsMarkup}
          </div>

          {alert && (
            <div
              role="alert"
              className={`rounded-md p-3 text-caption font-medium flex items-center justify-between gap-2 shadow-e1 transition-all duration-200 ${
                alert.type === 'overflow'
                  ? 'bg-state-compare-ring/40 border border-state-compare text-state-compare-text'
                  : alert.type === 'underflow'
                  ? 'bg-state-swap-ring/40 border border-state-swap text-ink'
                  : 'bg-accent-soft border border-accent/30 text-accent-strong'
              }`}
            >
              <div className="flex items-center gap-2">
                {alert.type === 'overflow' || alert.type === 'underflow' ? (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                )}
                <span>{alert.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setAlert(null)}
                className="text-micro font-mono uppercase underline hover:opacity-80 focus-ring"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}

      {/* Visual Canvas Stage */}
      <div
        className={`flex flex-col items-center justify-center transition-all duration-300 ${
          isZen ? 'min-h-[75vh] py-6' : 'card p-6 min-h-[400px]'
        }`}
      >
        {/* Stage Header */}
        <div className="w-full max-w-4xl flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <span className="chip font-mono text-micro uppercase tracking-wider bg-sunken">
              {listType === 'singly' ? 'Singly Linked List' : 'Doubly Linked List'}
            </span>
            <span className="text-caption font-semibold text-ink">Pointer Topology</span>
          </div>
          <span className="font-mono text-caption text-ink-muted tabular-nums">
            Nodes: {items.length} / {MAX_NODES}
          </span>
        </div>

        {/* Scaled Linked List Horizontal Pipeline */}
        <div
          className={`w-full max-w-5xl flex items-center justify-start overflow-x-auto py-8 px-4 transition-transform duration-300 ${
            isZen ? 'scale-110 sm:scale-120 my-6' : 'my-2'
          }`}
        >
          {items.length === 0 ? (
            <div className="mx-auto text-center py-10 space-y-2">
              <GitCommit className="w-8 h-8 text-ink-faint mx-auto opacity-50" />
              <p className="text-caption font-mono text-ink-faint italic">Linked List is empty</p>
              <p className="text-micro text-ink-muted">Use Insert Head or Insert Tail to create nodes</p>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 min-w-max mx-auto px-2">
              {/* NULL Badge at Front for Doubly Linked List */}
              {listType === 'doubly' && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="chip bg-sunken border-line text-ink-faint font-mono text-micro uppercase px-2.5 py-1">
                    NULL
                  </div>
                  <div className="flex flex-col items-center justify-center shrink-0 text-ink-faint">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              )}

              {/* Node Sequence */}
              <AnimatePresence initial={false}>
                {items.map((node, index) => {
                  const isHead = index === 0
                  const isTail = index === items.length - 1
                  const isSearching = activeSearchIndex === index
                  const isConnectionReversing = reversingIndex === index
                  const currAddr = `0x${node.id.slice(-3)}`
                  const nextNode = items[index + 1]
                  const prevNode = items[index - 1]
                  const nextAddr = nextNode ? `0x${nextNode.id.slice(-3)}` : 'NULL'
                  const prevAddr = prevNode ? `0x${prevNode.id.slice(-3)}` : 'NULL'

                  return (
                    <div key={node.id} className="flex items-center gap-1.5 shrink-0">
                      {/* Node Container with Badges */}
                      <div className="flex flex-col items-center relative">
                        {/* HEAD / TAIL Badge Above Node */}
                        <div className="h-6 flex items-center justify-center mb-1">
                          {isHead && isTail ? (
                            <span className="chip border-accent bg-accent text-white font-mono text-[10px] font-bold uppercase tracking-wider shadow-e1">
                              HEAD / TAIL
                            </span>
                          ) : isHead ? (
                            <span className="chip border-accent bg-accent text-white font-mono text-[10px] font-bold uppercase tracking-wider shadow-e1">
                              HEAD
                            </span>
                          ) : isTail ? (
                            <span className="chip border-line-strong bg-sunken text-ink-muted font-mono text-[10px] font-bold uppercase tracking-wider">
                              TAIL
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-ink-faint">[{index}]</span>
                          )}
                        </div>

                        {/* Visual Node Box */}
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0, y: 15 }}
                          animate={{
                            scale: isSearching || highlightAll ? 1.08 : 1,
                            y: 0,
                            opacity: 1,
                          }}
                          exit={{ scale: 0.8, opacity: 0, y: -15 }}
                          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                          className={`card p-0 border bg-surface rounded-xl shadow-e1 overflow-hidden transition-all duration-200 font-mono text-caption ${
                            isSearching
                              ? 'ring-2 ring-accent bg-accent-soft border-accent shadow-e2'
                              : highlightAll
                              ? 'ring-2 ring-state-sorted border-state-sorted'
                              : 'border-line hover:border-line-strong'
                          }`}
                        >
                          {listType === 'singly' ? (
                            /* Singly Mode Card: [ Value | next: 0x... ] */
                            <div className="flex items-center min-w-[130px]">
                              {/* Part 1: Value */}
                              <div className="flex-1 py-3 px-4 font-mono font-bold text-body text-ink text-center bg-surface tabular-nums">
                                {node.value}
                              </div>
                              {/* Part 2: Pointer Cell displaying Next Node's Address */}
                              <div className="py-2.5 px-3 bg-sunken border-l border-line font-mono text-[11px] flex items-center justify-center gap-1.5 shrink-0">
                                <span className="text-[9px] font-sans font-semibold uppercase tracking-wider text-ink-muted/50">
                                  next
                                </span>
                                <span
                                  className={`font-mono font-bold ${
                                    nextAddr === 'NULL' ? 'text-ink-faint' : 'text-accent'
                                  }`}
                                >
                                  {nextAddr}
                                </span>
                              </div>
                            </div>
                          ) : (
                            /* Doubly Mode Card: [ prev: 0x... | Value | next: 0x... ] */
                            <div className="flex items-center min-w-[170px]">
                              {/* Part 1: Prev Address Cell */}
                              <div className="py-2.5 px-3 bg-sunken border-r border-line font-mono text-[10px] flex flex-col items-center justify-center min-w-[52px]">
                                <span className="text-[9px] font-sans font-semibold uppercase tracking-wider text-ink-muted/50 mb-0.5">
                                  prev
                                </span>
                                <span
                                  className={`font-mono font-semibold ${
                                    prevAddr === 'NULL' ? 'text-ink-faint' : 'text-ink-muted'
                                  }`}
                                >
                                  {prevAddr}
                                </span>
                              </div>

                              {/* Part 2: Value */}
                              <div className="flex-1 py-3 px-4 font-mono font-bold text-body text-ink text-center bg-surface tabular-nums">
                                {node.value}
                              </div>

                              {/* Part 3: Next Address Cell */}
                              <div className="py-2.5 px-3 bg-sunken border-l border-line font-mono text-[10px] flex flex-col items-center justify-center min-w-[52px]">
                                <span className="text-[9px] font-sans font-semibold uppercase tracking-wider text-ink-muted/50 mb-0.5">
                                  next
                                </span>
                                <span
                                  className={`font-mono font-bold ${
                                    nextAddr === 'NULL' ? 'text-ink-faint' : 'text-accent'
                                  }`}
                                >
                                  {nextAddr}
                                </span>
                              </div>
                            </div>
                          )}
                        </motion.div>

                        {/* Current Node's Own Address (Outside Below Node Box) */}
                        <div className="mt-1 text-[10px] font-mono text-ink-faint text-center tracking-tight select-none">
                          addr: <span className="font-semibold text-ink-muted">{currAddr}</span>
                        </div>
                      </div>

                      {/* SVG Connector Arrow between Nodes */}
                      {!isTail && (
                        <div className="flex items-center justify-center shrink-0 px-1 py-4">
                          {listType === 'singly' ? (
                            <svg
                              className={`w-8 h-8 text-ink-faint transition-transform duration-300 ${
                                isConnectionReversing ? 'rotate-180 text-accent stroke-[3]' : ''
                              }`}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="4" y1="12" x2="20" y2="12" />
                              <polyline points="14 6 20 12 14 18" />
                            </svg>
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-1">
                              <svg
                                className={`w-7 h-3.5 text-ink-faint transition-transform duration-300 ${
                                  isConnectionReversing ? 'rotate-180 text-accent stroke-[3]' : ''
                                }`}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <polyline points="15 6 21 12 15 18" />
                              </svg>
                              <svg
                                className={`w-7 h-3.5 text-ink-faint transition-transform duration-300 ${
                                  isConnectionReversing ? 'rotate-180 text-accent stroke-[3]' : ''
                                }`}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <line x1="21" y1="12" x2="3" y2="12" />
                                <polyline points="9 6 3 12 9 18" />
                              </svg>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </AnimatePresence>

              {/* Terminating NULL Badge */}
              <div className="flex items-center gap-1.5 shrink-0 pl-1">
                <svg
                  className="w-6 h-6 text-ink-faint"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <polyline points="14 6 20 12 14 18" />
                </svg>
                <div className="chip bg-sunken border-line text-ink-faint font-mono text-micro uppercase px-2.5 py-1">
                  NULL
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quiet Caption Line in Zen Mode */}
        {isZen && alert && (
          <div
            role="status"
            className="mt-6 text-caption font-mono text-ink-muted text-center max-w-lg px-4 py-2 rounded-full bg-surface/90 border border-line shadow-e2 animate-in fade-in"
          >
            {alert.message}
          </div>
        )}
      </div>

      {/* Zen Dock Embedding */}
      {isZen && (
        <ZenDock controlsVisible={true} onExitZen={exitZen}>
          {actionControlsMarkup}
        </ZenDock>
      )}
    </div>
  )
}
