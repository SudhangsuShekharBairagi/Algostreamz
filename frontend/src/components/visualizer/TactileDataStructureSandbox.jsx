import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  Eye,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Maximize2,
  Layers,
  ListOrdered,
} from 'lucide-react'
import { useZen } from '../../hooks/useZen'
import ZenDock from './ZenDock'

const MAX_ITEMS = 8

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
}

export default function TactileDataStructureSandbox() {
  const { isZen, enterZen, exitZen } = useZen()
  const [mode, setMode] = useState('stack') // 'stack' (LIFO) or 'queue' (FIFO)
  const [items, setItems] = useState([
    { id: 'item-1', value: '24' },
    { id: 'item-2', value: '68' },
    { id: 'item-3', value: '91' },
  ])
  const [inputValue, setInputValue] = useState('')
  const [alert, setAlert] = useState(null) // { type: 'overflow'|'underflow'|'info', message: string, id: number }
  const [highlightedId, setHighlightedId] = useState(null)
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

  const switchMode = (nextMode) => {
    if (nextMode === mode) return
    setMode(nextMode)
    setHighlightedId(null)
    setAlert(null)
    focusInput()
  }

  const generateDefaultValue = () => {
    return String(Math.floor(Math.random() * 89) + 10)
  }

  // --- STACK ACTIONS ---
  const handlePush = () => {
    if (items.length >= MAX_ITEMS) {
      triggerAlert('overflow', `Overflow alert: Stack limit of ${MAX_ITEMS} items reached! Cannot Push.`)
      focusInput()
      return
    }
    const val = inputValue.trim() || generateDefaultValue()
    const newItem = { id: generateId(), value: val }
    setItems((prev) => [...prev, newItem])
    setInputValue('')
    triggerAlert('info', `Pushed "${val}" onto top of Stack.`)
    focusInput()
  }

  const handlePop = () => {
    if (items.length === 0) {
      triggerAlert('underflow', 'Underflow alert: Cannot Pop from an empty Stack!')
      focusInput()
      return
    }
    const popped = items[items.length - 1]
    setItems((prev) => prev.slice(0, -1))
    triggerAlert('underflow', `Popped "${popped.value}" from Stack.`)
    focusInput()
  }

  const handlePeek = () => {
    if (items.length === 0) {
      triggerAlert('underflow', 'Underflow alert: Stack is empty! No top element to peek.')
      focusInput()
      return
    }
    const topItem = items[items.length - 1]
    setHighlightedId(topItem.id)
    triggerAlert('info', `Peek: Top element is "${topItem.value}"`)
    setTimeout(() => setHighlightedId(null), 1600)
    focusInput()
  }

  // --- QUEUE ACTIONS ---
  const handleEnqueue = () => {
    if (items.length >= MAX_ITEMS) {
      triggerAlert('overflow', `Overflow alert: Queue limit of ${MAX_ITEMS} items reached! Cannot Enqueue.`)
      focusInput()
      return
    }
    const val = inputValue.trim() || generateDefaultValue()
    const newItem = { id: generateId(), value: val }
    setItems((prev) => [...prev, newItem])
    setInputValue('')
    triggerAlert('info', `Enqueued "${val}" at REAR of Queue.`)
    focusInput()
  }

  const handleDequeue = () => {
    if (items.length === 0) {
      triggerAlert('underflow', 'Underflow alert: Cannot Dequeue from an empty Queue!')
      focusInput()
      return
    }
    const dequeued = items[0]
    setItems((prev) => prev.slice(1))
    triggerAlert('underflow', `Dequeued "${dequeued.value}" from FRONT of Queue.`)
    focusInput()
  }

  const handleFront = () => {
    if (items.length === 0) {
      triggerAlert('underflow', 'Underflow alert: Queue is empty! No FRONT element.')
      focusInput()
      return
    }
    const frontItem = items[0]
    setHighlightedId(frontItem.id)
    triggerAlert('info', `Front: Item at FRONT of Queue is "${frontItem.value}"`)
    setTimeout(() => setHighlightedId(null), 1600)
    focusInput()
  }

  const handleRear = () => {
    if (items.length === 0) {
      triggerAlert('underflow', 'Underflow alert: Queue is empty! No REAR element.')
      focusInput()
      return
    }
    const rearItem = items[items.length - 1]
    setHighlightedId(rearItem.id)
    triggerAlert('info', `Rear: Item at REAR of Queue is "${rearItem.value}"`)
    setTimeout(() => setHighlightedId(null), 1600)
    focusInput()
  }

  const handleReset = () => {
    setItems([])
    setInputValue('')
    triggerAlert('info', `Cleared all elements from ${mode === 'stack' ? 'Stack' : 'Queue'}.`)
    focusInput()
  }

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (mode === 'stack') {
        handlePush()
      } else {
        handleEnqueue()
      }
    }
  }

  // Common Action Controls markup (used both in standard card view & inside ZenDock)
  const actionControlsMarkup = (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {/* Mode Switcher */}
      <div className="segmented" role="tablist" aria-label="Data structure mode selection">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'stack'}
          onClick={() => switchMode('stack')}
          className={`segmented-option focus-ring ${mode === 'stack' ? 'selected' : ''}`}
        >
          <Layers className="w-3.5 h-3.5 inline mr-1" />
          Stack (LIFO)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'queue'}
          onClick={() => switchMode('queue')}
          className={`segmented-option focus-ring ${mode === 'queue' ? 'selected' : ''}`}
        >
          <ListOrdered className="w-3.5 h-3.5 inline mr-1" />
          Queue (FIFO)
        </button>
      </div>

      {/* Input Field + Insert Button */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (mode === 'stack') handlePush()
          else handleEnqueue()
        }}
        className="flex items-center gap-1.5"
      >
        <label htmlFor="ds-value-input" className="sr-only">
          Value to insert into {mode}
        </label>
        <input
          id="ds-value-input"
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="e.g. 42 or A"
          maxLength={10}
          className="h-9 w-28 sm:w-32 rounded-md border border-line-strong bg-surface px-3 font-mono text-caption text-ink focus-ring shadow-e1"
        />
        <button
          type="submit"
          className="btn-primary h-9 px-3 text-caption font-semibold inline-flex items-center gap-1 focus-ring"
          title={`Insert value into ${mode}`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Insert</span>
        </button>
      </form>

      <div className="h-6 w-px bg-line hidden sm:block" />

      {/* Specific Stack / Queue Operation Buttons */}
      {mode === 'stack' ? (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePush}
            className="btn-ghost h-9 border border-line px-3 text-caption font-semibold text-accent hover:bg-accent-soft inline-flex items-center gap-1 focus-ring"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            Push
          </button>
          <button
            type="button"
            onClick={handlePop}
            className="btn-ghost h-9 border border-line px-3 text-caption font-semibold text-state-swap hover:bg-state-swap-ring/20 inline-flex items-center gap-1 focus-ring"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            Pop
          </button>
          <button
            type="button"
            onClick={handlePeek}
            className="btn-ghost h-9 border border-line px-3 text-caption font-semibold text-ink-muted hover:text-ink inline-flex items-center gap-1 focus-ring"
          >
            <Eye className="w-3.5 h-3.5" />
            Peek
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleEnqueue}
            className="btn-ghost h-9 border border-line px-3 text-caption font-semibold text-accent hover:bg-accent-soft inline-flex items-center gap-1 focus-ring"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            Enqueue
          </button>
          <button
            type="button"
            onClick={handleDequeue}
            className="btn-ghost h-9 border border-line px-3 text-caption font-semibold text-state-swap hover:bg-state-swap-ring/20 inline-flex items-center gap-1 focus-ring"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Dequeue
          </button>
          <button
            type="button"
            onClick={handleFront}
            className="btn-ghost h-9 border border-line px-2.5 text-caption font-semibold text-ink-muted hover:text-ink focus-ring"
          >
            Front
          </button>
          <button
            type="button"
            onClick={handleRear}
            className="btn-ghost h-9 border border-line px-2.5 text-caption font-semibold text-ink-muted hover:text-ink focus-ring"
          >
            Rear
          </button>
        </div>
      )}

      {/* Reset Button */}
      <button
        type="button"
        onClick={handleReset}
        title="Clear structure"
        aria-label="Clear structure"
        className="btn-ghost h-9 w-9 p-0 border border-line rounded-md inline-flex items-center justify-center text-ink-muted hover:text-ink focus-ring"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>

      {/* Zen Mode Button */}
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
      {/* ARIA Live Region for Screen Reader Announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {alert?.message}
      </div>

      {/* Non-Zen Toolbar Controls & Toast Alert */}
      {!isZen && (
        <div className="card p-4 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {actionControlsMarkup}
          </div>

          {/* Toast Alert Banner */}
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

      {/* Main Tactile Visualization Container */}
      <div
        className={`flex flex-col items-center justify-center transition-all duration-300 ${
          isZen ? 'min-h-[75vh] py-6' : 'card p-6 min-h-[420px]'
        }`}
      >
        {/* Subtitle / Counter Header */}
        <div className="w-full max-w-2xl flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <span className="chip font-mono text-micro uppercase tracking-wider bg-sunken">
              {mode === 'stack' ? 'LIFO Principle' : 'FIFO Principle'}
            </span>
            <span className="text-caption font-semibold text-ink">
              {mode === 'stack' ? 'Stack Structure' : 'Queue Structure'}
            </span>
          </div>
          <span className="font-mono text-caption text-ink-muted tabular-nums">
            Items: {items.length} / {MAX_ITEMS}
          </span>
        </div>

        {/* Scaled Interactive Stage */}
        <div
          className={`w-full flex items-center justify-center transition-transform duration-300 ${
            isZen ? 'scale-110 sm:scale-125 my-8' : 'my-2'
          }`}
        >
          {mode === 'stack' ? (
            /* --- STACK VISUALIZATION (Vertical Container with Rounded Bottom) --- */
            <div className="relative flex flex-col items-center">
              {/* TOP Indicator Pointer Badge */}
              {items.length > 0 && (
                <div className="absolute -top-7 right-0 sm:-right-8 flex items-center gap-1 bg-accent text-white px-2.5 py-1 rounded-full text-micro font-mono font-bold shadow-e2 animate-bounce">
                  <ArrowDown className="w-3 h-3 stroke-[3]" /> TOP
                </div>
              )}

              {/* Vertical Stack Bin Container */}
              <div className="w-64 sm:w-72 h-80 sm:h-96 bg-surface border-2 border-line-strong rounded-b-2xl rounded-t-sm p-3 flex flex-col-reverse items-center gap-2 overflow-y-auto shadow-e2 relative">
                {items.length === 0 ? (
                  <div className="my-auto text-center py-10 space-y-1">
                    <Layers className="w-8 h-8 text-ink-faint mx-auto opacity-50" />
                    <p className="text-caption font-mono text-ink-faint italic">Stack is empty</p>
                    <p className="text-micro text-ink-muted">Use Push or Insert to add elements</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {items.map((item, index) => {
                      const isTop = index === items.length - 1
                      const isHighlighted = highlightedId === item.id
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ y: -50, opacity: 0, scale: 0.9 }}
                          animate={{
                            y: 0,
                            opacity: 1,
                            scale: isHighlighted ? 1.05 : 1,
                          }}
                          exit={{ y: -40, opacity: 0, scale: 0.85 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                          className={`w-full py-3 px-4 rounded-xl border font-mono font-bold text-body flex items-center justify-between shadow-e1 transition-colors ${
                            isHighlighted
                              ? 'bg-state-compare-ring/50 border-state-compare text-state-compare-text ring-2 ring-state-compare'
                              : isTop
                              ? 'bg-accent-soft border-accent text-accent-strong'
                              : 'bg-surface border-line text-ink'
                          }`}
                        >
                          <span className="tabular-nums">{item.value}</span>
                          <span className="text-micro font-mono text-ink-muted font-normal">
                            {isTop ? 'TOP [index ' + index + ']' : `[${index}]`}
                          </span>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>
          ) : (
            /* --- QUEUE VISUALIZATION (Horizontal Pipe with Clean Boundaries) --- */
            <div className="w-full max-w-3xl space-y-2">
              <div className="bg-surface border-y-2 border-line-strong rounded-xl p-4 min-h-[140px] flex items-center justify-start gap-3 overflow-x-auto relative shadow-e2">
                {/* FRONT Boundary Label */}
                <div className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-sunken border border-line text-micro font-mono font-semibold text-ink-muted uppercase tracking-wider shrink-0 select-none">
                  <ArrowLeft className="w-4 h-4 text-accent mb-0.5" />
                  <span>FRONT</span>
                  <span className="text-[10px] text-ink-faint font-normal">(Exit)</span>
                </div>

                {/* Queue Element Items */}
                {items.length === 0 ? (
                  <div className="flex-1 text-center py-6">
                    <p className="text-caption font-mono text-ink-faint italic">Queue is empty</p>
                    <p className="text-micro text-ink-muted">Use Enqueue or Insert to add elements</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 flex-1 overflow-x-auto py-2 px-1">
                    <AnimatePresence initial={false}>
                      {items.map((item, index) => {
                        const isFront = index === 0
                        const isRear = index === items.length - 1
                        const isHighlighted = highlightedId === item.id

                        return (
                          <motion.div
                            key={item.id}
                            initial={{ x: 60, opacity: 0, scale: 0.9 }}
                            animate={{
                              x: 0,
                              opacity: 1,
                              scale: isHighlighted ? 1.05 : 1,
                            }}
                            exit={{ x: -60, opacity: 0, scale: 0.85 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                            className={`min-w-[76px] h-16 rounded-xl border p-2 flex flex-col items-center justify-center font-mono text-body font-bold shrink-0 shadow-e1 transition-colors ${
                              isHighlighted
                                ? 'bg-state-compare-ring/50 border-state-compare text-state-compare-text ring-2 ring-state-compare'
                                : isFront
                                ? 'bg-accent-soft border-accent text-accent-strong'
                                : isRear
                                ? 'bg-sunken border-line-strong text-ink'
                                : 'bg-surface border-line text-ink'
                            }`}
                          >
                            <span className="tabular-nums">{item.value}</span>
                            <span className="text-[10px] font-mono font-medium text-ink-muted uppercase mt-0.5">
                              {isFront ? 'FRONT' : isRear ? 'REAR' : `[${index}]`}
                            </span>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                )}

                {/* REAR Boundary Label */}
                <div className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-sunken border border-line text-micro font-mono font-semibold text-ink-muted uppercase tracking-wider shrink-0 select-none">
                  <ArrowRight className="w-4 h-4 text-accent mb-0.5" />
                  <span>REAR</span>
                  <span className="text-[10px] text-ink-faint font-normal">(Entry)</span>
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

      {/* Zen Dock Slot Embedding when Zen Mode is Active */}
      {isZen && (
        <ZenDock controlsVisible={true} onExitZen={exitZen}>
          {actionControlsMarkup}
        </ZenDock>
      )}
    </div>
  )
}
