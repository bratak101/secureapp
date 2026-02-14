import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { DOWNLOAD_FILES } from '../config/downloads'

export default function Pobierz() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-white mb-2">Pliki do pobrania</h1>
      <p className="text-slate-400 mb-8">
        Pobierz dokumenty i materiały dostępne dla zalogowanych użytkowników.
      </p>
      <ul className="space-y-3">
        {DOWNLOAD_FILES.map((file) => (
          <li key={file.id}>
            <a
              href={file.url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-700/60 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600 transition-colors group"
            >
              <span className="shrink-0 w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-slate-400 group-hover:text-brand-400">
                ↓
              </span>
              <div className="min-w-0 flex-1">
                <span className="font-medium text-white group-hover:text-brand-400">
                  {file.name}
                </span>
                {file.description && (
                  <p className="text-sm text-slate-500 mt-0.5">{file.description}</p>
                )}
              </div>
              {file.size && (
                <span className="text-sm text-slate-500">{file.size}</span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
