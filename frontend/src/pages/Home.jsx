import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full rounded-2xl border border-slate-700/60 bg-slate-900/80 p-8 text-center">
        {isAuthenticated && user ? (
          <>
            <h1 className="text-2xl font-semibold text-white mb-2">
              Witaj, {user.username}
            </h1>
            <p className="text-slate-400 mb-6">Jesteś zalogowany.</p>
            <button
              onClick={logout}
              className="px-6 py-2.5 rounded-lg font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 focus:ring-2 focus:ring-brand-500"
            >
              Wyloguj się
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-white mb-2">Secure App</h1>
            <p className="text-slate-400 mb-6">Zaloguj się lub załóż konto.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                to="/login"
                className="px-6 py-2.5 rounded-lg font-medium text-white bg-brand-600 hover:bg-brand-500"
              >
                Logowanie
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 rounded-lg font-medium text-slate-200 border border-slate-600 hover:bg-slate-800"
              >
                Rejestracja
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
