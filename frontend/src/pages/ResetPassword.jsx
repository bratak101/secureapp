import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as api from '../api/client'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Hasła muszą być identyczne')
      return
    }
    if (password.length < 8) {
      setError('Hasło min. 8 znaków')
      return
    }
    setLoading(true)
    try {
      await api.resetPassword(email, code.replace(/\D/g, '').slice(0, 6), password)
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.message || 'Reset nie powiódł się')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 p-8">
        <h1 className="text-2xl font-semibold text-white mb-1">Reset hasła</h1>
        <p className="text-slate-400 text-sm mb-6">
          Wpisz e-mail, 6-cyfrowy kod z maila i nowe hasło.
        </p>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/15 text-red-400 text-sm border border-red-500/30">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800/80 border border-slate-600/60 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Kod z e-maila</label>
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              required
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800/80 border border-slate-600/60 text-white text-center text-xl tracking-widest"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Nowe hasło (min. 8 zn.)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800/80 border border-slate-600/60 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Powtórz hasło</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800/80 border border-slate-600/60 text-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-medium text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-60"
          >
            {loading ? 'Zapisywanie…' : 'Zresetuj hasło'}
          </button>
        </form>
        <p className="mt-6 text-center text-slate-400 text-sm">
          <Link to="/login" className="text-brand-400 hover:underline">Wróć do logowania</Link>
        </p>
      </div>
    </div>
  )
}
