import { createPortal } from 'react-dom'
import { useToast } from '../context/useToast'

const typeStyles = {
  success: 'bg-emerald-500/95 text-white border-emerald-400/30 shadow-lg shadow-emerald-900/20',
  error: 'bg-red-500/95 text-white border-red-400/30 shadow-lg shadow-red-900/20',
  info: 'bg-slate-700/95 text-white border-slate-500/30 shadow-lg shadow-black/20',
}

const typeIcons = {
  success: (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

function ToastItem({ id, message, type, onDismiss }) {
  const style = typeStyles[type] ?? typeStyles.info
  const icon = typeIcons[type] ?? typeIcons.info
  return (
    <div
      role="alert"
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${style} animate-slide-in-right min-w-[280px] max-w-[420px]`}
    >
      {icon}
      <p className="text-sm font-medium flex-1 text-left">{message}</p>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        className="p-1 rounded-lg hover:bg-white/20 transition-colors"
        aria-label="Zamknij"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()
  if (toasts.length === 0) return null
  const container = (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      style={{ maxWidth: 'calc(100vw - 2rem)' }}
    >
      <div className="flex flex-col gap-2 pointer-events-auto">
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} onDismiss={removeToast} />
        ))}
      </div>
    </div>
  )
  return createPortal(container, document.body)
}
