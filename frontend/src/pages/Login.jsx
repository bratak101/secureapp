import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as api from '../api/client'
import { useAuth } from '../context/useAuth'
import { TurnstileWidget } from '../components/TurnstileWidget'

export default function Login() {
  const navigate = useNavigate()
  const { setToken } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.login(email, password, turnstileToken)
      setToken(data.token, { user_id: data.user_id, username: data.username })
      setSuccess(true)
      setTimeout(() => navigate('/'), 600)
    } catch (err) {
      setError(err.message || 'Logowanie nie powiodło się')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 shadow-xl shadow-black/20 p-8">
          <h1 className="text-2xl font-semibold text-white mb-1">Zaloguj się</h1>
          <p className="text-slate-400 text-sm mb-6">Wprowadź dane do konta</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/15 text-red-400 text-sm border border-red-500/30">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/15 text-emerald-400 text-sm border border-emerald-500/30">
              Zalogowano pomyślnie. Przekierowanie…
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-slate-800/80 border border-slate-600/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            <div className="flex justify-center">
              <TurnstileWidget
                onVerify={setTurnstileToken}
                onExpire={() => setTurnstileToken('')}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium text-white bg-brand-600 hover:bg-brand-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-brand-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Logowanie…' : 'Zaloguj się'}
            </button>
          </form>

          <p className="mt-6 text-center text-slate-400 text-sm">
            Nie masz konta?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
              Zarejestruj się
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
