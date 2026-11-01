import { Layers3 } from 'lucide-react'

function formatArguments(args) {
  return Object.entries(args ?? {})
    .map(([name, value]) => `${name}=${Array.isArray(value) ? `[${value.join(', ')}]` : value}`)
    .join(', ')
}

export default function CallStackPanel({ frames = [], overflow = 0, variant = 'card' }) {
  const flat = variant === 'flat'

  return (
    <section
      aria-label="Call stack"
      className={flat
        ? 'rounded-lg border border-line bg-surface/90 p-3 shadow-e2'
        : 'card space-y-3 rounded-lg border border-line bg-surface p-4 shadow-e1'}
    >
      <div className="flex items-center gap-2 border-b border-line pb-2">
        <Layers3 className="h-4 w-4 text-accent" />
        <h2 className="font-semibold text-body text-ink">Call Stack</h2>
        <span className="ml-auto font-mono text-[10px] text-ink-faint">{frames.length + overflow} frames</span>
      </div>
      <div className="max-h-48 space-y-1 overflow-y-auto font-mono text-xs">
        {overflow > 0 && (
          <p className="rounded bg-sunken px-2 py-1 text-center text-ink-muted" role="status">
            +{overflow} deeper frame{overflow === 1 ? '' : 's'}
          </p>
        )}
        {frames.length === 0 ? (
          <p className="px-2 py-2 text-center text-ink-faint">Call stack is empty</p>
        ) : (
          frames.map((frame, index) => {
            const active = index === frames.length - 1
            return (
              <div
                key={`${frame.functionName}-${frame.depth}-${index}`}
                aria-current={active ? 'step' : undefined}
                className={`rounded px-2 py-1.5 ${
                  active
                    ? 'border-l-4 border-accent bg-accent-soft text-ink font-medium'
                    : 'border-l-4 border-transparent bg-sunken text-ink-muted'
                }`}
              >
                <span>{frame.functionName}</span>
                <span className="ml-1 text-ink-muted">({formatArguments(frame.args)})</span>
                <span className="float-right text-[10px] text-ink-muted">d{frame.depth}</span>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
