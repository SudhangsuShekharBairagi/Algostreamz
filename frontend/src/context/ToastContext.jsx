import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

/**
 * Toast Provider Component.
 * Renders light feedback toasts auto-dismissing after 3.5 seconds.
 * Positioned bottom-center normally and top-center in Zen mode.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info', isZen = false) => {
    const id = Date.now() + Math.random().toString()
    const newToast = { id, message, type, isZen }

    setToasts((prev) => [...prev, newToast])

    // Auto-dismiss after 3.5s (3500ms)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Separate standard layout (bottom-center) and Zen layout (top-center) toasts
  const standardToasts = toasts.filter((t) => !t.isZen)
  const zenToasts = toasts.filter((t) => t.isZen)

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}

      {/* Standard Layout Toasts (Bottom-Center) */}
      {standardToasts.length > 0 && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 max-w-md w-full px-4 pointer-events-none"
          role="status"
          aria-live="polite"
        >
          {standardToasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
          ))}
        </div>
      )}

      {/* Zen Layout Toasts (Top-Center - avoids colliding with floating dock) */}
      {zenToasts.length > 0 && (
        <div
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 max-w-md w-full px-4 pointer-events-none"
          role="status"
          aria-live="polite"
        >
          {zenToasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }) {
  const { type, message } = toast

  let icon = <Info className="w-4 h-4 text-accent shrink-0" />
  let borderStyle = 'border-line bg-surface text-ink'

  if (type === 'success') {
    icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
    borderStyle = 'border-emerald-200 bg-surface text-ink shadow-e2'
  } else if (type === 'warning' || type === 'error') {
    icon = <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
    borderStyle = 'border-amber-200 bg-surface text-ink shadow-e2'
  }

  return (
    <div
      className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-2.5 rounded-full border ${borderStyle} shadow-e3 max-w-full font-mono text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-fast`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {icon}
        <span className="truncate">{message}</span>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="btn-ghost p-1 rounded-full text-ink-muted hover:text-ink focus-ring shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    // Return fallback noop if used outside provider
    return {
      showToast: () => {},
      removeToast: () => {},
    }
  }
  return context
}

export default useToast
