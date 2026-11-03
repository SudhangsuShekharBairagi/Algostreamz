import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { STRUCTURE_TERMINOLOGY } from '../../../engine/structureConfig'

export default function QueueView({ items = [], highlight = {}, variant = 'default' }) {
  const reduceMotion = useReducedMotion()

  return (
    <div className={`w-full ${variant === 'zen' ? 'max-w-5xl' : 'max-w-4xl'}`}>
      <ol
        aria-label="Queue items"
        className="flex min-h-36 w-full items-center gap-2 overflow-x-auto rounded-xl border-y-2 border-line-strong bg-sunken p-4 shadow-e2"
      >
        <li className="flex shrink-0 flex-col items-center rounded-lg border border-line bg-surface px-3 py-2 font-mono text-micro font-semibold text-ink-muted">
          <ArrowLeft aria-hidden="true" className="mb-1 h-4 w-4 text-accent" />
          {STRUCTURE_TERMINOLOGY.queueFront}
          <span className="text-[10px] font-normal text-ink-faint">(Exit)</span>
        </li>
        {items.length === 0 ? (
          <li className="flex-1 py-6 text-center text-caption text-ink-muted" role="status">Queue is empty</li>
        ) : (
          <AnimatePresence initial={false}>
            {items.map((item, index) => {
              const state = highlight[item.id]
              return (
                <motion.li
                  key={item.id}
                  initial={reduceMotion ? false : { x: 24, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={reduceMotion ? undefined : { x: -24, opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.18 }}
                  className={`flex h-16 min-w-[76px] shrink-0 flex-col items-center justify-center rounded-xl border p-2 font-mono text-body font-bold shadow-e1 ${
                    state === 'found'
                      ? 'border-state-sorted bg-state-sorted/10 text-ink'
                      : state
                        ? 'border-accent bg-accent-soft text-accent-strong'
                        : index === 0
                          ? 'border-accent bg-accent-soft text-accent-strong'
                          : 'border-node-border bg-node-bg text-node-text'
                  } motion-reduce:transition-none`}
                >
                  <span className="break-all">{item.value}</span>
                  <span className="mt-0.5 font-mono text-[10px] font-medium text-ink-muted">
                    {index === 0 ? STRUCTURE_TERMINOLOGY.queueFront : index === items.length - 1 ? STRUCTURE_TERMINOLOGY.queueRear : `[${index}]`}
                  </span>
                </motion.li>
              )
            })}
          </AnimatePresence>
        )}
        <li className="flex shrink-0 flex-col items-center rounded-lg border border-line bg-surface px-3 py-2 font-mono text-micro font-semibold text-ink-muted">
          <ArrowRight aria-hidden="true" className="mb-1 h-4 w-4 text-accent" />
          {STRUCTURE_TERMINOLOGY.queueRear}
          <span className="text-[10px] font-normal text-ink-faint">(Entry)</span>
        </li>
      </ol>
    </div>
  )
}
