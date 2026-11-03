import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { STRUCTURE_TERMINOLOGY } from '../../../engine/structureConfig'

export default function StackView({ items = [], highlight = {}, variant = 'default' }) {
  const reduceMotion = useReducedMotion()
  const isZen = variant === 'zen'

  return (
    <div className={`relative mx-auto w-full max-w-sm ${isZen ? 'max-h-[70vh]' : ''}`}>
      {items.length > 0 && (
        <span className="absolute -top-3 right-2 z-10 rounded-full border border-accent bg-accent px-2.5 py-1 font-mono text-micro font-bold text-on-accent shadow-e2">
          {STRUCTURE_TERMINOLOGY.stackTop}
        </span>
      )}
      <ol
        aria-label="Stack items"
        className="flex max-h-[min(70vh,32rem)] min-h-48 flex-col-reverse items-center gap-2 overflow-y-auto rounded-b-2xl border-2 border-line-strong bg-sunken p-3 shadow-e2"
      >
        {items.length === 0 ? (
          <li className="my-auto py-10 text-center text-caption text-ink-muted" role="status">Stack is empty</li>
        ) : (
          <AnimatePresence initial={false}>
            {items.map((item, index) => {
              const state = highlight[item.id]
              return (
                <motion.li
                  key={item.id}
                  initial={reduceMotion ? false : { y: -24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reduceMotion ? undefined : { y: -24, opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.18 }}
                  className={`flex w-full shrink-0 items-center justify-between rounded-xl border px-4 py-3 font-mono text-body font-bold shadow-e1 ${
                    state === 'found'
                      ? 'border-state-sorted bg-state-sorted/10 text-ink'
                      : state
                        ? 'border-accent bg-accent-soft text-ink'
                        : index === items.length - 1
                          ? 'border-accent bg-accent-soft text-accent-strong'
                          : 'border-node-border bg-node-bg text-node-text'
                  } motion-reduce:transition-none`}
                >
                  <span className="break-all">{item.value}</span>
                  <span className="font-mono text-micro font-normal text-ink-muted">
                    {index === items.length - 1 ? `${STRUCTURE_TERMINOLOGY.stackTop} [index ${index}]` : `[${index}]`}
                  </span>
                </motion.li>
              )
            })}
          </AnimatePresence>
        )}
      </ol>
    </div>
  )
}
