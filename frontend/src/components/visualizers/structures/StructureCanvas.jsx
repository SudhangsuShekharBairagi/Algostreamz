import { MAX_STRUCTURE_ITEMS } from '../../../engine/structureGenerators'

const STATE_LABELS = {
  active: 'Active',
  found: 'Found',
}

export default function StructureCanvas({ structure, values = [], highlightedIndices = {}, variant = 'default' }) {
  const isZen = variant === 'zen'
  const listClasses =
    structure === 'Stack'
      ? 'flex min-h-62.5 flex-col-reverse items-center justify-start gap-2 border-b-4 border-line-strong pb-3'
      : 'flex min-h-62.5 flex-wrap items-center justify-center gap-3 overflow-x-auto py-5'

  return (
    <section
      className={isZen ? 'w-full bg-transparent p-4 md:p-8' : 'card w-full border border-line bg-surface/80 p-4 md:p-6'}
      aria-label={`${structure} visualization`}
    >
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-line pb-3">
        <h2 className="font-display text-h3 font-semibold text-ink">{structure}</h2>
        <span
          className="font-mono text-xs tabular-nums text-ink-muted"
          aria-label={`${values.length} of ${MAX_STRUCTURE_ITEMS} items`}
        >
          {values.length} / {MAX_STRUCTURE_ITEMS}
        </span>
      </div>

      {values.length === 0 ? (
        <p className="flex min-h-62.5 items-center justify-center text-caption text-ink-muted" role="status">
          Empty structure
        </p>
      ) : (
        <ol className={listClasses} aria-label={`${structure} items`}>
          {values.map((value, index) => {
            const state = highlightedIndices[index]
            const highlighted = Boolean(state)
            const node = (
              <div
                className={`relative flex min-h-14 min-w-20 items-center justify-center gap-2 border px-4 py-3 font-mono text-sm font-semibold shadow-e1 transition-colors motion-reduce:transition-none ${
                  state === 'found'
                    ? 'border-state-sorted bg-state-sorted/10 text-ink'
                    : highlighted
                      ? 'border-accent bg-accent-soft text-ink'
                      : 'border-line-strong bg-surface text-ink'
                } ${structure === 'Linked List' ? 'rounded-md' : ''}`}
              >
                <span>{value}</span>
                {structure === 'Linked List' && <span className="font-mono text-xs text-ink-faint">{index}</span>}
                {highlighted && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-surface px-1 text-[10px] font-sans font-semibold text-ink">
                    {STATE_LABELS[state] || 'Selected'}
                  </span>
                )}
              </div>
            )

            return (
              <li key={`${index}-${value}`} className="flex shrink-0 items-center gap-3">
                {structure === 'Queue' && index === 0 && (
                  <span className="font-mono text-[10px] font-semibold uppercase text-ink-muted">Front</span>
                )}
                {node}
                {structure === 'Linked List' && index < values.length - 1 && (
                  <span aria-hidden="true" className="text-xl text-ink-muted">
                    -&gt;
                  </span>
                )}
                {structure === 'Stack' && index === values.length - 1 && (
                  <span className="font-mono text-[10px] font-semibold uppercase text-ink-muted">Top</span>
                )}
                {structure === 'Queue' && index === values.length - 1 && (
                  <span className="font-mono text-[10px] font-semibold uppercase text-ink-muted">Rear</span>
                )}
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
