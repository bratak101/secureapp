import { Component } from 'react'
import { Link } from 'react-router-dom'

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-md w-full text-center animate-fade-in-up">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Coś poszło nie tak
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                Wystąpił nieoczekiwany błąd. Odśwież stronę lub wróć na stronę główną.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-brand-600 hover:bg-brand-500 transition-colors"
                >
                  Odśwież stronę
                </button>
                <Link
                  to="/"
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Strona główna
                </Link>
              </div>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
