import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function Home() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-white mb-3">Secure App</h1>
        <p className="text-slate-400 text-lg mb-10">
          Zaloguj się lub załóż konto, aby uzyskać dostęp do plików i panelu.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            to="/login"
            className="px-8 py-3.5 rounded-xl font-medium text-white bg-brand-600 hover:bg-brand-500 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors"
          >
            Logowanie
          </Link>
          <Link
            to="/register"
            className="px-8 py-3.5 rounded-xl font-medium text-slate-200 border border-slate-600 hover:bg-slate-800 hover:border-slate-500 transition-colors"
          >
            Rejestracja
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Hero */}
      <section className="mb-12">
        <h1 className="text-3xl font-bold text-white mb-2">
          Witaj, {user.username}
        </h1>
        <p className="text-slate-400 mb-4">
          Użyj menu po lewej: instrukcje dla <strong className="text-slate-300">Linux Desktop</strong>, <strong className="text-slate-300">Linux Server</strong>, <strong className="text-slate-300">Windows Desktop</strong> i <strong className="text-slate-300">Windows Server</strong>. Na każdej podstronie są <strong className="text-slate-300">pliki i obrazy do pobrania</strong> dopasowane do danej instrukcji. Konto w prawym górnym rogu.
        </p>
      </section>

      {/* Konto */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Konto</h2>
        <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-800/50">
          <p className="text-slate-300">
            Zarządzaj danymi konta, hasłem i ustawieniami.
          </p>
          <Link
            to="/konto"
            className="inline-block mt-3 px-4 py-2 rounded-lg text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 transition-colors"
          >
            Przejdź do konta
          </Link>
        </div>
      </section>
    </div>
  )
}
