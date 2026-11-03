/** Labelled input with an optional hint and inline field error. */
export default function Field({ id, label, hint, error, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="block text-caption font-medium mb-1 text-ink">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={error ? `${id}-error` : undefined}
        className="w-full rounded-md bg-surface border border-line px-3 py-2 text-body text-ink placeholder:text-ink-faint focus-ring"
        {...inputProps}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-caption text-state-swap">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1 text-caption text-ink-faint">{hint}</p>
      )}
    </div>
  )
}
