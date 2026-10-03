const TONES = {
  error: 'bg-rose-50 border-rose-200 text-rose-800',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  info: 'bg-accent-soft border-accent/20 text-accent-strong',
}

/** Inline status banner styled with editorial light tokens. `error` is announced assertively for screen readers. */
export default function Alert({ tone = 'error', children }) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-md border px-3.5 py-2.5 text-caption font-medium ${TONES[tone]}`}>
      {children}
    </div>
  )
}
