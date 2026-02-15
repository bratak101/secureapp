import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/useToast'
import * as api from '../api/client'
import { APP_VERSION } from '../config/version'
import Skeleton from '../components/Skeleton'
import Modal from '../components/Modal'

export default function Konto() {
  const { isAuthenticated, user, logout } = useAuth()
  const toast = useToast()
  const [me, setMe] = useState(null)
  const [meLoading, setMeLoading] = useState(true)
  const [changePwOpen, setChangePwOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
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
            onClick={() => setChangePwOpen(true)}
            className="px-5 py-2.5 rounded-lg font-medium text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200 active:scale-[0.98]"
            aria-haspopup="dialog"
            aria-expanded={changePwOpen}
          >
            Zmień hasło
          </button>
        </div>
        <Modal open={changePwOpen} onClose={() => { setChangePwOpen(false); setChangePwError(''); setChangePwSuccess(false) }} title="Zmień hasło" aria-label="Formularz zmiany hasła">
          <form onSubmit={handleChangePassword} className="space-y-3">
            {changePwError && <p className="text-red-400 text-sm" role="alert">{changePwError}</p>}
            {changePwSuccess && <p className="text-emerald-400 text-sm" role="status">Hasło zmienione.</p>}
            <label className="block">
              <span className="sr-only">Obecne hasło</span>
              <input
                type="password"
                placeholder="Obecne hasło"
                value={oldPw}
                onChange={(e) => setOldPw(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </label>
            <label className="block">
              <span className="sr-only">Nowe hasło (min. 8 znaków)</span>
              <input
                type="password"
                placeholder="Nowe hasło (min. 8 zn.)"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </label>
            <label className="block">
              <span className="sr-only">Powtórz nowe hasło</span>
              <input
                type="password"
                placeholder="Powtórz nowe hasło"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </label>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => { setChangePwOpen(false); setChangePwError('') }} className="px-4 py-2 rounded-lg font-medium text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">
                Anuluj
              </button>
              <button type="submit" disabled={changePwLoading} className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-60">
                {changePwLoading ? 'Zapisywanie…' : 'Zapisz'}
              </button>
            </div>
          </form>
        </Modal>
        <Modal open={logoutConfirmOpen} onClose={() => setLogoutConfirmOpen(false)} title="Wylogowanie" aria-label="Potwierdzenie wylogowania">
          <p className="text-slate-600 dark:text-slate-300 mb-6">Czy na pewno chcesz się wylogować?</p>
          <div className="flex gap-3">
            <button type="button" onClick={() => setLogoutConfirmOpen(false)} className="flex-1 px-4 py-2.5 rounded-lg font-medium text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">
              Anuluj
            </button>
            <button type="button" onClick={() => { setLogoutConfirmOpen(false); logout() }} className="flex-1 px-4 py-2.5 rounded-lg font-medium text-white bg-red-600 hover:bg-red-500">
              Wyloguj się
            </button>
          </div>
        </Modal>
        <button
          onClick={() => setLogoutConfirmOpen(true)}
          className="block px-5 py-2.5 rounded-lg font-medium text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200 active:scale-[0.98]"
          aria-label="Wyloguj się z konta"
        >
          Wyloguj się
        </button>
      </div>

      <p className="mt-12 text-slate-500 text-xs">Wersja aplikacji: {APP_VERSION}</p>
    </div>
  )
}
