import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/useToast'
import * as api from '../api/client'
import { APP_VERSION } from '../config/version'
import Skeleton from '../components/Skeleton'

export default function Konto() {
  const { isAuthenticated, user, logout } = useAuth()
  const toast = useToast()
  const [me, setMe] = useState(null)
  const [meLoading, setMeLoading] = useState(true)
  const [changePwOpen, setChangePwOpen] = useState(false)
  const [oldPw, setOldPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [changePwLoading, setChangePwLoading] = useState(false)
  const [changePwError, setChangePwError] = useState('')
  const [changePwSuccess, setChangePwSuccess] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      setMeLoading(true)
      api.me()
        .then(setMe)
        .catch(() => setMe(null))
        .finally(() => setMeLoading(false))
    }
  }, [isAuthenticated])

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  const role = user.role || me?.role || 'user'

  async function handleChangePassword(e) {
    e.preventDefault()
    setChangePwError('')
    if (newPw !== confirmPw) {
      setChangePwError('Nowe hasła muszą być identyczne')
      return
    }
    if (newPw.length < 8) {
      setChangePwError('Nowe hasło min. 8 znaków')
      return
    }
    setChangePwLoading(true)
    try {
      await api.changePassword(oldPw, newPw)
      setChangePwSuccess(true)
      setOldPw('')
      setNewPw('')
      setConfirmPw('')
      setChangePwOpen(false)
      toast.success('Hasło zmienione')
    } catch (err) {
      const msg = err.message || 'Nie udało się zmienić hasła'
      setChangePwError(msg)
      toast.error(msg)
    } finally {
      setChangePwLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12 animate-fade-in-up">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Moje konto</h1>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
        <dl className="divide-y divide-slate-700/60">
          <div className="px-5 py-4 flex justify-between items-center gap-4">
            <dt className="text-sm text-slate-500">Nazwa użytkownika</dt>
            <dd className="text-slate-900 dark:text-white font-medium">{user.username}</dd>
          </div>
          {meLoading && !me ? (
            <div className="px-5 py-4 flex justify-between items-center gap-4">
              <dt className="text-sm text-slate-500">E-mail</dt>
              <dd><Skeleton className="h-4 w-32" /></dd>
            </div>
          ) : me?.email ? (
            <div className="px-5 py-4 flex justify-between items-center gap-4">
              <dt className="text-sm text-slate-500">E-mail</dt>
              <dd className="text-slate-300">{me.email}</dd>
            </div>
          ) : null}
          <div className="px-5 py-4 flex justify-between items-center gap-4">
            <dt className="text-sm text-slate-500">ID konta</dt>
            <dd className="text-slate-300 font-mono text-sm">{user.user_id}</dd>
          </div>
          <div className="px-5 py-4 flex justify-between items-center gap-4">
            <dt className="text-sm text-slate-500">Rola</dt>
            <dd className="text-slate-300 capitalize">{role}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 space-y-4">
        <div>
          <button
            type="button"
            onClick={() => setChangePwOpen(!changePwOpen)}
            className="px-5 py-2.5 rounded-lg font-medium text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200 active:scale-[0.98]"
          >
            {changePwOpen ? 'Anuluj' : 'Zmień hasło'}
          </button>
        </div>
        {changePwOpen && (
          <form onSubmit={handleChangePassword} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/30 space-y-3">
            {changePwError && <p className="text-red-400 text-sm">{changePwError}</p>}
            {changePwSuccess && <p className="text-emerald-400 text-sm">Hasło zmienione.</p>}
            <input
              type="password"
              placeholder="Obecne hasło"
              value={oldPw}
              onChange={(e) => setOldPw(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500"
            />
            <input
              type="password"
              placeholder="Nowe hasło (min. 8 zn.)"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500"
            />
            <input
              type="password"
              placeholder="Powtórz nowe hasło"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500"
            />
            <button type="submit" disabled={changePwLoading} className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-60">
              {changePwLoading ? 'Zapisywanie…' : 'Zapisz'}
            </button>
          </form>
        )}
        <button
          onClick={logout}
          className="block px-5 py-2.5 rounded-lg font-medium text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200 active:scale-[0.98]"
        >
          Wyloguj się
        </button>
      </div>

      <p className="mt-12 text-slate-500 text-xs">Wersja aplikacji: {APP_VERSION}</p>
    </div>
  )
}
