import { useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../api/client'
import { RecaptchaWidget } from '../components/RecaptchaWidget'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.forgotPassword(email, recaptchaToken)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Wysyłka nie powiodła się')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 p-8">
        <h1 className="text-2xl font-semibold text-white mb-1">Przypomnij hasło</h1>
        <p className="text-slate-400 text-sm mb-6">
          Wpisz adres e-mail konta. Wyślemy na niego 6-cyfrowy kod do zresetowania hasła.
        </p>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/15 text-red-400 text-sm border border-red-500/30">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/15 text-emerald-400 text-sm border border-emerald-500/30">
            Jeśli konto istnieje, kod został wysłany na podany adres. Sprawdź skrzynkę (i spam). Następnie przejdź do <Link to="/reset-password" className="underline">Reset hasła</Link>.
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800/80 border border-slate-600/60 text-white"
            />
          </div>
          <div className="flex justify-center">
            <RecaptchaWidget onVerify={setRecaptchaToken} onExpire={() => setRecaptchaToken('')} />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-medium text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-60"
          >
            {loading ? 'Wysyłanie…' : 'Wyślij kod'}
          </button>
        </form>
        <p className="mt-6 text-center text-slate-400 text-sm">
          <Link to="/login" className="text-brand-400 hover:underline">Wróć do logowania</Link>
        </p>
      </div>
    </div>
  )
}
