import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import RequireAdmin from '../components/RequireAdmin'
import * as api from '../api/client'
import { useToast } from '../context/useToast'
import Skeleton from '../components/Skeleton'
import Button from '../components/ui/Button'
import Modal from '../components/Modal'

export default function Admin() {
  const location = useLocation()
  const currentPath = location.pathname || '/admin'
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingRole, setUpdatingRole] = useState(null)
  const [resetUser, setResetUser] = useState(null)
  const [emailUser, setEmailUser] = useState(null)
  const [resetPassword, setResetPassword] = useState('')
  const [resetConfirm, setResetConfirm] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [logs, setLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [logFilters, setLogFilters] = useState({ ip: '', action: '' })
  const [logins, setLogins] = useState([])
  const [loginsLoading, setLoginsLoading] = useState(false)
  const [loginFilters, setLoginFilters] = useState({ ip: '' })
  const [activity, setActivity] = useState([])
  const [activityLoading, setActivityLoading] = useState(false)
  const [activityFilters, setActivityFilters] = useState({ user_id: '', path: '', ip: '' })

  async function load() {
    setError('')
    setLoading(true)
    try {
      const list = await api.listUsers()
      setUsers(list)
    } catch (err) {
      setError(err.message || 'Nie udało się załadować listy użytkowników')
    } finally {
      setLoading(false)
    }
  }

  async function loadLogs() {
    setLogsLoading(true)
    try {
      const list = await api.getAdminLogs({
        ip: logFilters.ip.trim() || undefined,
        action: logFilters.action.trim() || undefined,
        limit: 100,
      })
      setLogs(list)
    } catch {
      setLogs([])
    } finally {
      setLogsLoading(false)
    }
  }

  async function loadLogins() {
    setLoginsLoading(true)
    try {
      const list = await api.getAdminLogins({
        ip: loginFilters.ip.trim() || undefined,
        limit: 100,
      })
      setLogins(list)
    } catch {
      setLogins([])
    } finally {
      setLoginsLoading(false)
    }
  }

  async function loadActivity() {
    setActivityLoading(true)
    try {
      const uid = activityFilters.user_id.trim() ? parseInt(activityFilters.user_id, 10) : null
      const list = await api.getAdminActivity({
        user_id: uid != null && !Number.isNaN(uid) && uid > 0 ? uid : undefined,
        path: activityFilters.path.trim() || undefined,
        ip: activityFilters.ip.trim() || undefined,
        limit: 100,
      })
      setActivity(Array.isArray(list) ? list : [])
    } catch {
      setActivity([])
    } finally {
      setActivityLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    loadLogs()
    loadLogins()
    loadActivity()
  }, [])

  async function handleRoleChange(u, newRole) {
    if (u.role === newRole) return
    setUpdatingRole(u.id)
    try {
      await api.adminUpdateUserRole(u.id, newRole, currentPath)
      toast.success(`Rola użytkownika ${u.username} zmieniona na ${newRole}`)
      await load()
      loadLogs()
      loadLogins()
    } catch (err) {
      toast.error(err.message || 'Nie udało się zmienić roli')
    } finally {
      setUpdatingRole(null)
    }
  }

  function openResetModal(u) {
    setResetUser(u)
    setResetPassword('')
    setResetConfirm('')
    setResetError('')
  }

  async function handleResetPassword(e) {
    e.preventDefault()
    setResetError('')
    if (resetPassword.length < 8) {
      setResetError('Hasło musi mieć min. 8 znaków')
      return
    }
    if (resetPassword !== resetConfirm) {
      setResetError('Hasła muszą być identyczne')
      return
    }
    setResetLoading(true)
    try {
      await api.adminResetUserPassword(resetUser.id, resetPassword, currentPath)
      toast.success('Hasło zresetowane')
      setResetUser(null)
      await load()
      loadLogs()
      loadLogins()
    } catch (err) {
      setResetError(err.message || 'Nie udało się zresetować hasła')
    } finally {
      setResetLoading(false)
    }
  }

  function openEmailModal(u) {
    setEmailUser(u)
    setNewEmail(u.email || '')
    setEmailError('')
  }

  async function handleUpdateEmail(e) {
    e.preventDefault()
    setEmailError('')
    const email = newEmail.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Nieprawidłowy format e-mail')
      return
    }
    setEmailLoading(true)
    try {
      await api.adminUpdateUserEmail(emailUser.id, email, currentPath)
      toast.success('E-mail zaktualizowany')
      setEmailUser(null)
      await load()
      loadLogs()
      loadLogins()
    } catch (err) {
      setEmailError(err.message || 'Nie udało się zmienić e-mail')
    } finally {
      setEmailLoading(false)
    }
  }

  return (
    <RequireAdmin>
      <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Panel administratora</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Zarządzaj użytkownikami: zmiana roli, reset hasła, edycja e-mail.
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30" role="alert">
            <p>{error}</p>
            <Button variant="secondary" className="mt-2" onClick={load}>Spróbuj ponownie</Button>
          </div>
        )}

        <section className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 overflow-hidden">
          <h2 className="sr-only">Lista użytkowników</h2>
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                    <th className="px-4 py-3 font-semibold text-slate-900 dark:text-white">ID</th>
                    <th className="px-4 py-3 font-semibold text-slate-900 dark:text-white">Nazwa</th>
                    <th className="px-4 py-3 font-semibold text-slate-900 dark:text-white">E-mail</th>
                    <th className="px-4 py-3 font-semibold text-slate-900 dark:text-white">Rola</th>
                    <th className="px-4 py-3 font-semibold text-slate-900 dark:text-white">Data</th>
                    <th className="px-4 py-3 font-semibold text-slate-900 dark:text-white">Akcje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {users.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        Brak użytkowników
                      </td>
                    </tr>
                  )}
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">{u.id}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{u.username}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{u.email}</td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u, e.target.value)}
                          disabled={updatingRole === u.id}
                          className="rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs py-1 px-2 capitalize"
                          aria-label={`Zmiana roli dla ${u.username}`}
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                        {updatingRole === u.id && <span className="ml-1 text-xs text-slate-500">…</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{u.created_at || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            onClick={() => openResetModal(u)}
                            className="px-2 py-1 rounded text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600"
                          >
                            Reset hasła
                          </button>
                          <button
                            type="button"
                            onClick={() => openEmailModal(u)}
                            className="px-2 py-1 rounded text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600"
                          >
                            E-mail
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        {!loading && users.length > 0 && (
          <p className="mt-4 text-slate-500 text-sm">Liczba użytkowników: {users.length}</p>
        )}

        <section className="mt-10 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 overflow-hidden">
          <h2 className="px-4 py-3 text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">
            Logi administracji
          </h2>
          <p className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">
            Akcje administratorów z adresem IP i dokładną stroną. Filtruj po IP lub typie akcji.
          </p>
          <div className="px-4 py-2 flex flex-wrap gap-2 items-center">
            <label className="flex items-center gap-1">
              <span className="text-sm text-slate-600 dark:text-slate-400">IP</span>
              <input
                type="text"
                value={logFilters.ip}
                onChange={(e) => setLogFilters((f) => ({ ...f, ip: e.target.value }))}
                placeholder="np. 192.168."
                className="rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm py-1.5 px-2 w-36"
              />
            </label>
            <label className="flex items-center gap-1">
              <span className="text-sm text-slate-600 dark:text-slate-400">Akcja</span>
              <select
                value={logFilters.action}
                onChange={(e) => setLogFilters((f) => ({ ...f, action: e.target.value }))}
                className="rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm py-1.5 px-2"
              >
                <option value="">Wszystkie</option>
                <option value="update_role">Zmiana roli</option>
                <option value="reset_password">Reset hasła</option>
                <option value="update_email">Zmiana e-mail</option>
              </select>
            </label>
            <Button variant="secondary" onClick={loadLogs} disabled={logsLoading}>
              {logsLoading ? '…' : 'Filtruj'}
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                  <th className="px-4 py-2 font-semibold text-slate-900 dark:text-white">Data</th>
                  <th className="px-4 py-2 font-semibold text-slate-900 dark:text-white">Admin</th>
                  <th className="px-4 py-2 font-semibold text-slate-900 dark:text-white">Akcja</th>
                  <th className="px-4 py-2 font-semibold text-slate-900 dark:text-white">IP</th>
                  <th className="px-4 py-2 font-semibold text-slate-900 dark:text-white">Strona</th>
                  <th className="px-4 py-2 font-semibold text-slate-900 dark:text-white">Cel / szczegóły</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {logsLoading && logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                      Ładowanie…
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                      Brak wpisów
                    </td>
                  </tr>
                ) : (
                  logs.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {entry.created_at || '—'}
                      </td>
                      <td className="px-4 py-2 font-medium text-slate-900 dark:text-white">
                        {entry.admin_name || `ID ${entry.admin_id}`}
                      </td>
                      <td className="px-4 py-2 text-slate-700 dark:text-slate-300">
                        {entry.action === 'update_role' && 'Zmiana roli'}
                        {entry.action === 'reset_password' && 'Reset hasła'}
                        {entry.action === 'update_email' && 'Zmiana e-mail'}
                        {!['update_role', 'reset_password', 'update_email'].includes(entry.action) && entry.action}
                      </td>
                      <td className="px-4 py-2 font-mono text-slate-600 dark:text-slate-400">{entry.ip_address || '—'}</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400 font-mono text-xs">{entry.page || '—'}</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                        {entry.target_user_id != null && `User ID ${entry.target_user_id}`}
                        {entry.details && ` ${entry.details}`}
                        {!entry.target_user_id && !entry.details && '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 overflow-hidden">
          <h2 className="px-4 py-3 text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">
            Wejścia (logowania)
          </h2>
          <p className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">
            Kto i kiedy się logował, z jakiego IP oraz z jakiej dokładnej strony.
          </p>
          <div className="px-4 py-2 flex flex-wrap gap-2 items-center">
            <label className="flex items-center gap-1">
              <span className="text-sm text-slate-600 dark:text-slate-400">IP</span>
              <input
                type="text"
                value={loginFilters.ip}
                onChange={(e) => setLoginFilters((f) => ({ ...f, ip: e.target.value }))}
                placeholder="np. 192.168."
                className="rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm py-1.5 px-2 w-36"
              />
            </label>
            <Button variant="secondary" onClick={loadLogins} disabled={loginsLoading}>
              {loginsLoading ? '…' : 'Filtruj'}
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                  <th className="px-4 py-2 font-semibold text-slate-900 dark:text-white">Data</th>
                  <th className="px-4 py-2 font-semibold text-slate-900 dark:text-white">Użytkownik</th>
                  <th className="px-4 py-2 font-semibold text-slate-900 dark:text-white">IP</th>
                  <th className="px-4 py-2 font-semibold text-slate-900 dark:text-white">Strona</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {loginsLoading && logins.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                      Ładowanie…
                    </td>
                  </tr>
                ) : logins.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                      Brak wejść
                    </td>
                  </tr>
                ) : (
                  logins.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {entry.created_at || '—'}
                      </td>
                      <td className="px-4 py-2 font-medium text-slate-900 dark:text-white">
                        {entry.username || `ID ${entry.user_id}`}
                      </td>
                      <td className="px-4 py-2 font-mono text-slate-600 dark:text-slate-400">{entry.ip_address || '—'}</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400 font-mono text-xs">{entry.page || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 overflow-hidden">
          <h2 className="px-4 py-3 text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">
            Aktywność (każda akcja)
          </h2>
          <p className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">
            Wszystkie wywołania API zalogowanych użytkowników: metoda, ścieżka, IP, strona.
          </p>
          <div className="px-4 py-2 flex flex-wrap gap-2 items-center">
            <label className="flex items-center gap-1">
              <span className="text-sm text-slate-600 dark:text-slate-400">User ID</span>
              <input
                type="text"
                value={activityFilters.user_id}
                onChange={(e) => setActivityFilters((f) => ({ ...f, user_id: e.target.value }))}
                placeholder="np. 1"
                className="rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm py-1.5 px-2 w-20"
              />
            </label>
            <label className="flex items-center gap-1">
              <span className="text-sm text-slate-600 dark:text-slate-400">Ścieżka</span>
              <input
                type="text"
                value={activityFilters.path}
                onChange={(e) => setActivityFilters((f) => ({ ...f, path: e.target.value }))}
                placeholder="np. /admin"
                className="rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm py-1.5 px-2 w-32"
              />
            </label>
            <label className="flex items-center gap-1">
              <span className="text-sm text-slate-600 dark:text-slate-400">IP</span>
              <input
                type="text"
                value={activityFilters.ip}
                onChange={(e) => setActivityFilters((f) => ({ ...f, ip: e.target.value }))}
                placeholder="np. 192.168."
                className="rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm py-1.5 px-2 w-28"
              />
            </label>
            <Button variant="secondary" onClick={loadActivity} disabled={activityLoading}>
              {activityLoading ? '…' : 'Filtruj'}
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                  <th className="px-4 py-2 font-semibold text-slate-900 dark:text-white">Data</th>
                  <th className="px-4 py-2 font-semibold text-slate-900 dark:text-white">Użytkownik</th>
                  <th className="px-4 py-2 font-semibold text-slate-900 dark:text-white">Metoda</th>
                  <th className="px-4 py-2 font-semibold text-slate-900 dark:text-white">Ścieżka API</th>
                  <th className="px-4 py-2 font-semibold text-slate-900 dark:text-white">IP</th>
                  <th className="px-4 py-2 font-semibold text-slate-900 dark:text-white">Strona</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {activityLoading && activity.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                      Ładowanie…
                    </td>
                  </tr>
                ) : activity.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                      Brak wpisów
                    </td>
                  </tr>
                ) : (
                  activity.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {entry.created_at || '—'}
                      </td>
                      <td className="px-4 py-2 font-medium text-slate-900 dark:text-white">
                        {entry.username || `ID ${entry.user_id}`}
                      </td>
                      <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{entry.method || '—'}</td>
                      <td className="px-4 py-2 font-mono text-slate-600 dark:text-slate-400 text-xs">{entry.path || '—'}</td>
                      <td className="px-4 py-2 font-mono text-slate-600 dark:text-slate-400">{entry.ip_address || '—'}</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400 font-mono text-xs">{entry.page || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <Modal open={!!resetUser} onClose={() => setResetUser(null)} title="Reset hasła" aria-label="Reset hasła użytkownika">
          {resetUser && (
            <form onSubmit={handleResetPassword} className="space-y-3">
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Użytkownik: <strong>{resetUser.username}</strong> (ID {resetUser.id})
              </p>
              {resetError && <p className="text-red-500 text-sm" role="alert">{resetError}</p>}
              <label className="block">
                <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nowe hasło (min. 8 zn.)</span>
                <input
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  minLength={8}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  autoComplete="new-password"
                />
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Powtórz hasło</span>
                <input
                  type="password"
                  value={resetConfirm}
                  onChange={(e) => setResetConfirm(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  autoComplete="new-password"
                />
              </label>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setResetUser(null)}>Anuluj</Button>
                <Button type="submit" loading={resetLoading}>Zapisz hasło</Button>
              </div>
            </form>
          )}
        </Modal>

        <Modal open={!!emailUser} onClose={() => setEmailUser(null)} title="Zmień e-mail" aria-label="Zmiana e-mail użytkownika">
          {emailUser && (
            <form onSubmit={handleUpdateEmail} className="space-y-3">
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Użytkownik: <strong>{emailUser.username}</strong> (ID {emailUser.id})
              </p>
              {emailError && <p className="text-red-500 text-sm" role="alert">{emailError}</p>}
              <label className="block">
                <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nowy e-mail</span>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="uzytkownik@example.com"
                  required
                />
              </label>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setEmailUser(null)}>Anuluj</Button>
                <Button type="submit" loading={emailLoading}>Zapisz e-mail</Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </RequireAdmin>
  )
}
