const TONES = {
  error: 'bg-red-500/10 border-red-500/40 text-red-300',
  success: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300',
}

/** Inline status banner. `error` is announced assertively for screen readers. */
export default function Alert({ tone = 'error', children }) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-lg border px-3 py-2 text-sm ${TONES[tone]}`}>
      {children}
    </div>
  )
}
