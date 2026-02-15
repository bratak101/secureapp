export default function Button({
  type = 'button',
  variant = 'primary',
  disabled,
  loading,
  children,
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed'
  const variants = {
    primary: 'text-white bg-brand-600 hover:bg-brand-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-brand-500 hover:shadow-lg',
    secondary: 'text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600',
    danger: 'text-white bg-red-600 hover:bg-red-500 focus:ring-2 focus:ring-red-500',
  }
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {loading ? 'Ładowanie…' : children}
    </button>
  )
}
