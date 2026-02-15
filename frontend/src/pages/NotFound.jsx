import { Link } from 'react-router-dom'
import usePageTitle from '../hooks/usePageTitle'

export default function NotFound() {
  usePageTitle('Strona nie znaleziona')
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center animate-fade-in-up">
      <h1 className="text-6xl font-bold text-slate-300 dark:text-slate-600 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Strona nie znaleziona</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8">
        Adres, którego szukasz, nie istnieje lub został przeniesiony.
      </p>
      <Link
        to="/"
        className="inline-block px-6 py-3 rounded-xl font-medium text-white bg-brand-600 hover:bg-brand-500 transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-[0.98]"
      >
        Wróć na stronę główną
      </Link>
    </div>
  )
}
