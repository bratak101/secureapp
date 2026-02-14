import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as api from '../api/client'
import { useAuth } from '../context/useAuth'
import { RecaptchaWidget } from '../components/RecaptchaWidget'

export default function Register() {
  const navigate = useNavigate()
  const { setToken } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [backendOk, setBackendOk] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Hasła muszą być identyczne')
      return
    }
    setLoading(true)
    try {
      const data = await api.register(username, email, password, recaptchaToken)
      setToken(data.token, { user_id: data.user_id, username: data.username, role: data.role || 'user' })
      setSuccess(true)
      setTimeout(() => navigate('/'), 600)
    } catch (err) {
      setError(err.message || 'Rejestracja nie powiodła się')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 shadow-xl shadow-black/20 p-8">
          <h1 className="text-2xl font-semibold text-white mb-1">Utwórz konto</h1>
          <p className="text-slate-400 text-sm mb-6">Wypełnij formularz rejestracji</p>

          {backendOk === false && (
            <div className="mb-4 p-3 rounded-lg bg-amber-500/15 text-amber-400 text-sm border border-amber-500/30">
              Backend niedostepny. Uruchom: 1) XAMPP MySQL, 2) Backend (go run main.go w folderze backend).
            </div>
          )}
          {backendOk === true && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/15 text-emerald-400 text-sm border border-emerald-500/30">
              Polaczenie z backendem OK.
            </div>
          )}
          <button
            type="button"
            onClick={async () => {
              setBackendOk(null)
              const ok = await api.checkHealth()
              setBackendOk(ok)
            }}
            className="mb-4 text-sm text-slate-400 hover:text-slate-300 underline"
          >
            Sprawdz polaczenie z backendem
          </button>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/15 text-red-400 text-sm border border-red-500/30">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/15 text-emerald-400 text-sm border border-emerald-500/30">
              Konto utworzone. Przekierowanie…
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-1.5">
                Nazwa użytkownika
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={64}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-800/80 border border-slate-600/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="jan_kowalski"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-slate-800/80 border border-slate-600/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="twoj@email.pl"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
                Hasło
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-800/80 border border-slate-600/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="min. 8 znaków"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-1.5">
                Powtórz hasło
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-slate-800/80 border border-slate-600/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            <div className="flex justify-center">
              <RecaptchaWidget
                onVerify={setRecaptchaToken}
                onExpire={() => setRecaptchaToken('')}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium text-white bg-brand-600 hover:bg-brand-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-brand-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Rejestracja…' : 'Zarejestruj się'}
            </button>
          </form>

          <p className="mt-6 text-center text-slate-400 text-sm">
            Masz już konto?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
              Zaloguj się
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
