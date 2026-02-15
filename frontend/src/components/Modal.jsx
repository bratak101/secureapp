import { useEffect, useRef } from 'react'

const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export default function Modal({ open, onClose, title, children, role = 'dialog', 'aria-label': ariaLabel }) {
  const overlayRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const prevFocus = document.activeElement
    const el = contentRef.current
    if (el) {
      const focusable = el.querySelectorAll(focusableSelector)
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      first?.focus?.()

      function handleKeyDown(e) {
        if (e.key === 'Escape') {
          onClose()
          return
        }
        if (e.key !== 'Tab') return
        const focusableArr = [...el.querySelectorAll(focusableSelector)]
        if (focusableArr.length === 0) return
        const firstEl = focusableArr[0]
        const lastEl = focusableArr[focusableArr.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault()
            lastEl?.focus?.()
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault()
            firstEl?.focus?.()
          }
        }
      }
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        if (typeof prevFocus?.focus === 'function') prevFocus.focus()
      }
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      style={{ animationDuration: '0.15s' }}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      role={role}
      aria-modal="true"
      aria-label={ariaLabel || title}
    >
      <div
        ref={contentRef}
        className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  )
}
