import { MAX_ITEMS } from '../../../engine/structureConfig'
import StackView from './StackView'
import QueueView from './QueueView'
import LinkedListView from './LinkedListView'

export default function StructureCanvas({
  structure,
  values = [],
  highlightedIndices = {},
  variant = 'default',
  listVariant = 'singly',
}) {
  const items = values.map((value, index) => ({ id: `${index}-${value}`, value }))
  const highlight = Object.fromEntries(
    Object.entries(highlightedIndices).map(([index, state]) => [`${index}-${values[index]}`, state]),
  )

  return (
    <section
      className={variant === 'zen' ? 'w-full bg-transparent p-4 md:p-8' : 'card w-full border border-line bg-surface/80 p-4 md:p-6'}
      aria-label={`${structure} visualization`}
    >
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-line pb-3">
        <h2 className="font-display text-h3 font-semibold text-ink">{structure}</h2>
        <span className="font-mono text-xs tabular-nums text-ink-muted" aria-label={`${values.length} of ${MAX_ITEMS} items`}>
          {values.length} / {MAX_ITEMS}
        </span>
      </div>
      {structure === 'Stack' ? (
        <StackView items={items} highlight={highlight} variant={variant} />
      ) : structure === 'Queue' ? (
        <QueueView items={items} highlight={highlight} variant={variant} />
      ) : (
        <LinkedListView items={items} highlight={highlight} variant={variant} meta={{ variant: listVariant }} />
      )}
    </section>
  )
}
