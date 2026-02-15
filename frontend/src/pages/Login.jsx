import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as api from '../api/client'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/useToast'
import { RecaptchaWidget } from '../components/RecaptchaWidget'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { validateEmail } from '../lib/validation'

const SAVED_EMAIL_KEY = 'secure_app_login_email'

export default function Login() {
  const navigate = useNavigate()
  const { setToken } = useAuth()
  const toast = useToast()
  const [email, setEmail] = useState(() => {
    try { return localStorage.getItem(SAVED_EMAIL_KEY) || '' } catch { return '' }
  })
  const [password, setPassword] = useState('')
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [emailError, setEmailError] = useState('')

  useEffect(() => {
    if (email && validateEmail(email)) setEmailError(validateEmail(email))
    else setEmailError('')
  }, [email])

  async function handleSubmit(e) {
    e.preventDefault()
    const eErr = validateEmail(email)
    if (eErr) { setEmailError(eErr); setError(''); return }
    setError('')
    setLoading(true)
    try {
      const data = await api.login(email, password, recaptchaToken, window.location.pathname || '/login')
      try { localStorage.setItem(SAVED_EMAIL_KEY, email.trim()) } catch (_) {}
      setToken(data.token, { user_id: data.user_id, username: data.username, role: data.role })
      setSuccess(true)
      toast.success('Zalogowano pomyślnie')
      setTimeout(() => navigate('/'), 600)
    } catch (err) {
      const msg = err.message || 'Logowanie nie powiodło się'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-scale-in">
        <Card title="Zaloguj się" subtitle="Wprowadź dane do konta">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/15 text-red-400 text-sm border border-red-500/30 animate-shake" role="alert">
              <p>{error}</p>
              <button type="button" onClick={() => setError('')} className="mt-2 text-sm font-medium underline hover:no-underline">
                Spróbuj ponownie
              </button>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/15 text-emerald-400 text-sm border border-emerald-500/30" role="status">
              Zalogowano pomyślnie. Przekierowanie…
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="twoj@email.pl"
              error={emailError}
            />
            <Input
              id="password"
              label="Hasło"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <div className="flex justify-center">
              <RecaptchaWidget
                onVerify={setRecaptchaToken}
                onExpire={() => setRecaptchaToken('')}
              />
            </div>
            <Button type="submit" loading={loading} className="w-full py-3">
              Zaloguj się
            </Button>
          </form>

          <p className="mt-6 text-center text-slate-500 dark:text-slate-400 text-sm">
            <Link to="/register" className="text-brand-600 dark:text-brand-400 hover:text-brand-500 dark:hover:text-brand-300 font-medium">Zarejestruj się</Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
