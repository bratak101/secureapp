export default function Input({
  id,
  label,
  type = 'text',
  error,
  hint,
  className = '',
  labelClass = '',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className={`block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5 ${labelClass}`}>
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow duration-200 ${
          error ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      )}
    </div>
  )
}
