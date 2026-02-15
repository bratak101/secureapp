import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as api from '../api/client'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/useToast'
import { RecaptchaWidget } from '../components/RecaptchaWidget'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { validateEmail, validateUsername, validatePassword, passwordStrength } from '../lib/validation'

export default function Register() {
  const navigate = useNavigate()
  const { setToken } = useAuth()
  const toast = useToast()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [usernameError, setUsernameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmError, setConfirmError] = useState('')

  useEffect(() => {
    setUsernameError(username ? validateUsername(username) : '')
  }, [username])
  useEffect(() => {
    setEmailError(email ? validateEmail(email) : '')
  }, [email])
  useEffect(() => {
    setPasswordError(password ? validatePassword(password, 'Hasło') : '')
  }, [password])
  useEffect(() => {
    setConfirmError(confirmPassword && password !== confirmPassword ? 'Hasła muszą być identyczne' : '')
  }, [password, confirmPassword])

  const pwStrength = passwordStrength(password)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const uErr = validateUsername(username)
    const eErr = validateEmail(email)
    const pErr = validatePassword(password, 'Hasło')
    if (uErr) { setUsernameError(uErr); return }
    if (eErr) { setEmailError(eErr); return }
    if (pErr) { setPasswordError(pErr); return }
    if (password !== confirmPassword) {
      setConfirmError('Hasła muszą być identyczne')
      return
    }
    setLoading(true)
    try {
      const data = await api.register(username, email, password, recaptchaToken)
      setToken(data.token, { user_id: data.user_id, username: data.username, role: data.role || 'user' })
      setSuccess(true)
      toast.success('Konto utworzone pomyślnie')
      setTimeout(() => navigate('/'), 600)
    } catch (err) {
      const msg = err.message || 'Rejestracja nie powiodła się'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-scale-in">
        <Card title="Utwórz konto" subtitle="Wypełnij formularz rejestracji">
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
              Konto utworzone. Przekierowanie…
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="username"
              label="Nazwa użytkownika"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="jan_kowalski"
              error={usernameError}
              minLength={3}
              maxLength={64}
              required
            />
            <Input
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="twoj@email.pl"
              error={emailError}
              required
            />
            <Input
              id="password"
              label="Hasło"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="min. 8 znaków"
              error={passwordError}
              hint={pwStrength.label ? `Siła hasła: ${pwStrength.label}` : ''}
              minLength={8}
              required
            />
            <Input
              id="confirmPassword"
              label="Powtórz hasło"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              error={confirmError}
              required
            />
            <div className="flex justify-center">
              <RecaptchaWidget
                onVerify={setRecaptchaToken}
                onExpire={() => setRecaptchaToken('')}
              />
            </div>
            <Button type="submit" loading={loading} className="w-full py-3">
              Zarejestruj się
            </Button>
          </form>

          <p className="mt-6 text-center text-slate-500 dark:text-slate-400 text-sm">
            Masz już konto?{' '}
            <Link to="/login" className="text-brand-600 dark:text-brand-400 hover:text-brand-500 dark:hover:text-brand-300 font-medium">
              Zaloguj się
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
