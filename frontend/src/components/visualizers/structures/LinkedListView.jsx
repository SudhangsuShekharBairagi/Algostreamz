import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { STRUCTURE_TERMINOLOGY } from '../../../engine/structureConfig'

export default function LinkedListView({
  items = [],
  highlight = {},
  variant = 'default',
  meta = {},
}) {
  const reduceMotion = useReducedMotion()
  const listVariant = meta.variant ?? 'singly'
  const doubly = listVariant === 'doubly'

  return (
    <div className={`w-full overflow-x-auto py-6 ${variant === 'zen' ? 'max-w-6xl' : 'max-w-5xl'}`}>
      {items.length === 0 ? (
        <p className="py-10 text-center text-caption text-ink-muted" role="status">Linked List is empty</p>
      ) : (
        <ol aria-label="Linked List items" className="mx-auto flex min-w-max items-center gap-1.5 px-2">
          {doubly && (
            <li className="flex shrink-0 items-center gap-1.5 font-mono text-micro text-ink-faint">
              <span className="chip bg-sunken font-mono">{STRUCTURE_TERMINOLOGY.null}</span>
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </li>
          )}
          <AnimatePresence initial={false}>
            {items.map((item, index) => {
              const state = highlight[item.id]
              const address = `0x${String(item.id).slice(-3)}`
              const prevAddress = index > 0 ? `0x${String(items[index - 1].id).slice(-3)}` : STRUCTURE_TERMINOLOGY.null
              const nextAddress = index < items.length - 1 ? `0x${String(items[index + 1].id).slice(-3)}` : STRUCTURE_TERMINOLOGY.null
              return (
                <li key={item.id} className="flex shrink-0 items-center gap-1.5">
                  <div className="flex flex-col items-center">
                    <span className="mb-1 font-mono text-[10px] font-bold text-accent">
                      {index === 0 ? `${STRUCTURE_TERMINOLOGY.head}${items.length === 1 ? ' / TAIL' : ''}` : index === items.length - 1 ? STRUCTURE_TERMINOLOGY.tail : `[${index}]`}
                    </span>
                    <motion.div
                      initial={reduceMotion ? false : { scale: 0.9, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { scale: 0.9, opacity: 0, y: -10 }}
                      transition={{ duration: reduceMotion ? 0 : 0.18 }}
                      className={`overflow-hidden rounded-xl border bg-surface font-mono text-caption shadow-e1 ${
                        state === 'found'
                          ? 'border-state-sorted ring-2 ring-state-sorted'
                          : state
                            ? 'border-accent ring-2 ring-accent'
                            : 'border-line'
                      } motion-reduce:transition-none`}
                    >
                      <div className="flex items-center">
                        {doubly && (
                          <PointerCell label="prev" address={prevAddress} leading />
                        )}
                        <span className="break-all bg-node-bg px-4 py-3 text-center font-bold text-node-text">{item.value}</span>
                        <PointerCell label="next" address={nextAddress} />
                      </div>
                    </motion.div>
                    <span className="mt-1 text-center font-mono text-[10px] text-ink-faint">addr: {address}</span>
                  </div>
                  {index < items.length - 1 && <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-muted" />}
                </li>
              )
            })}
          </AnimatePresence>
          <li className="flex shrink-0 items-center gap-1.5 font-mono text-micro text-ink-faint">
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
            <span className="chip bg-sunken font-mono">{STRUCTURE_TERMINOLOGY.null}</span>
          </li>
        </ol>
      )}
    </div>
  )
}

function PointerCell({ label, address, leading = false }) {
  return (
    <span className={`flex flex-col items-center justify-center bg-sunken px-2 py-2 text-[10px] ${leading ? 'border-r border-line' : 'border-l border-line'}`}>
      <span className="font-sans text-[9px] uppercase text-ink-muted">{label}</span>
      <span className={address === STRUCTURE_TERMINOLOGY.null ? 'text-ink-faint' : 'text-accent'}>{address}</span>
    </span>
  )
}
