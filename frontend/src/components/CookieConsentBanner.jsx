import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'secure_app_cookie_consent'

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === null) setVisible(true)
    } catch (_) {
      setVisible(true)
    }
  }, [])

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: true, date: new Date().toISOString() }))
    } catch (_) {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Informacja o plikach cookies"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] animate-fade-in-up"
      style={{ animationDuration: '0.3s' }}
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="flex-1 text-sm text-slate-600 dark:text-slate-300">
          Ta strona używa plików cookies w celu działania logowania, zapamiętania ustawień oraz zabezpieczenia przed spamem (reCAPTCHA).
          <Link to="/polityka-cookies" className="ml-1 text-brand-600 dark:text-brand-400 hover:underline font-medium">
            Dowiedz się więcej
          </Link>
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            type="button"
            onClick={accept}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-500 transition-colors"
          >
            Akceptuję
          </button>
        </div>
      </div>
    </div>
  )
}
