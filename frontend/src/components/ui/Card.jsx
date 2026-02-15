export default function Card({ title, subtitle, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/80 shadow-xl shadow-slate-200/50 dark:shadow-black/20 p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-300/30 dark:hover:shadow-black/30 hover:-translate-y-1 ${className}`}>
      {title && <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-1">{title}</h1>}
      {subtitle && <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{subtitle}</p>}
      {children}
    </div>
  )
}
