const TONES = {
  error: 'bg-state-swap/10 border-state-swap/40 text-ink',
  success: 'bg-state-sorted/10 border-state-sorted/40 text-ink',
  info: 'bg-accent-soft border-accent/20 text-accent-strong',
}

/** Inline status banner. `error` is announced assertively for screen readers. */
export default function Alert({ tone = 'error', children }) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-md border px-3.5 py-2.5 text-caption font-medium ${TONES[tone]}`}>
      {children}
    </div>
  )
}
