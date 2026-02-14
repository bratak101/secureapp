import { useAuth } from '../context/useAuth'
import RequireAdmin from '../components/RequireAdmin'

export default function Admin() {
  return (
    <RequireAdmin>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-white mb-2">Panel administratora</h1>
        <p className="text-slate-400 mb-6">
          Dostęp tylko dla użytkowników z rolą admin. Tu można dodać zarządzanie użytkownikami, statystyki itp.
        </p>
        <div className="p-4 rounded-xl border border-slate-700/60 bg-slate-800/50 text-slate-300">
          Aby nadać rolę admin w bazie MySQL: <code className="text-brand-400">UPDATE users SET role='admin' WHERE id=1;</code>
        </div>
      </div>
    </RequireAdmin>
  )
}
