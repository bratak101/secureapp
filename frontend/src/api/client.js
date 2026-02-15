const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'
const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'
const SESSION_EXPIRED_EVENT = 'secure_app_401'

function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

async function apiError(res, fallback) {
  let data = {}
  const text = await res.text()
  try {
    if (text) data = JSON.parse(text)
  } catch (_) {}
  const msg = data.error || (text && text.length < 200 ? text : fallback)
  return new Error(msg ? `[${res.status}] ${msg}` : `[${res.status}] ${fallback}`)
}

function clearAuthAndNotify() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  } catch (_) {}
  try {
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT))
  } catch (_) {}
}

async function authFetch(url, opts = {}) {
  const res = await fetch(url, opts)
  if (res.status === 401) {
    clearAuthAndNotify()
    throw await apiError(res, 'Sesja wygasła. Zaloguj się ponownie.')
  }
  return res
}

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`)
    const data = await res.json().catch(() => ({}))
    return res.ok && data.ok
  } catch (_) {
    return false
  }
}

export async function register(username, email, password, recaptchaToken = '') {
  let res
  try {
    res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, recaptcha_token: recaptchaToken }),
    })
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Brak polaczenia z serwerem. Uruchom backend (port 8080) i sprawdz, czy XAMPP/MySQL dziala.')
    }
    throw err
  }
  if (!res.ok) throw await apiError(res, 'Rejestracja nie powiodla sie')
  return res.json()
}

export async function login(email, password, recaptchaToken = '', page = '') {
  let res
  try {
    res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        recaptcha_token: recaptchaToken,
        page: typeof page === 'string' ? page : '',
      }),
    })
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Brak polaczenia z serwerem. Uruchom backend (port 8080).')
    }
    throw err
  }
  if (!res.ok) throw await apiError(res, 'Logowanie nie powiodlo sie')
  return res.json()
}

export async function me() {
  const res = await authFetch(`${API_BASE}/me`, { headers: getAuthHeaders() })
  if (!res.ok) throw await apiError(res, 'Blad pobierania danych')
  return res.json()
}

export async function changePassword(oldPassword, newPassword) {
  const res = await authFetch(`${API_BASE}/change-password`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
  })
  if (!res.ok) throw await apiError(res, 'Zmiana hasla nie powiodla sie')
  return res.json()
}

let _currentPath = ''

/** Ustawia bieżącą ścieżkę (używane do logowania każdej akcji). Wywołaj np. w Layout z useLocation().pathname */
export function setCurrentPath(p) {
  _currentPath = typeof p === 'string' ? p : ''
}

export function getAuthHeaders() {
  const token = getToken()
  const h = token ? { Authorization: `Bearer ${token}` } : {}
  if (_currentPath) h['X-Current-Path'] = _currentPath
  return h
}

export async function listUsers() {
  const res = await authFetch(`${API_BASE}/admin/users`, { headers: getAuthHeaders() })
  if (!res.ok) throw await apiError(res, 'Blad pobierania listy uzytkownikow')
  const data = await res.json()
  return data.users || []
}

function getAdminHeaders(page = '') {
  const h = { ...getAuthHeaders(), 'Content-Type': 'application/json' }
  if (typeof page === 'string' && page) h['X-Current-Path'] = page
  return h
}

export async function adminUpdateUserRole(userId, role, page = '') {
  const res = await authFetch(`${API_BASE}/admin/users/role`, {
    method: 'PATCH',
    headers: getAdminHeaders(page),
    body: JSON.stringify({ user_id: userId, role }),
  })
  if (!res.ok) throw await apiError(res, 'Blad zmiany roli')
  return res.json()
}

export async function adminResetUserPassword(userId, newPassword, page = '') {
  const res = await authFetch(`${API_BASE}/admin/users/reset-password`, {
    method: 'POST',
    headers: getAdminHeaders(page),
    body: JSON.stringify({ user_id: userId, new_password: newPassword }),
  })
  if (!res.ok) throw await apiError(res, 'Blad resetu hasla')
  return res.json()
}

export async function adminUpdateUserEmail(userId, email, page = '') {
  const res = await authFetch(`${API_BASE}/admin/users/email`, {
    method: 'PATCH',
    headers: getAdminHeaders(page),
    body: JSON.stringify({ user_id: userId, email: email.trim().toLowerCase() }),
  })
  if (!res.ok) throw await apiError(res, 'Blad zmiany e-mail')
  return res.json()
}

/**
 * Pobiera logi administracji (tylko admin).
 * @param {{ ip?: string, action?: string, limit?: number }} params - ip (filtr po adresie), action (np. update_role, reset_password, update_email), limit (domyślnie 100, max 500)
 */
export async function getAdminLogs(params = {}) {
  const sp = new URLSearchParams()
  if (params.ip) sp.set('ip', params.ip)
  if (params.action) sp.set('action', params.action)
  if (params.limit != null) sp.set('limit', String(params.limit))
  const q = sp.toString()
  const url = `${API_BASE}/admin/logs${q ? `?${q}` : ''}`
  const res = await authFetch(url, { headers: getAuthHeaders() })
  if (!res.ok) throw await apiError(res, 'Blad pobierania logow')
  const data = await res.json()
  return data.logs || []
}

/**
 * Pobiera wejścia (logowania) użytkowników (tylko admin).
 * @param {{ ip?: string, limit?: number }} params
 */
export async function getAdminLogins(params = {}) {
  const sp = new URLSearchParams()
  if (params.ip) sp.set('ip', params.ip)
  if (params.limit != null) sp.set('limit', String(params.limit))
  const q = sp.toString()
  const url = `${API_BASE}/admin/logins${q ? `?${q}` : ''}`
  const res = await authFetch(url, { headers: getAuthHeaders() })
  if (!res.ok) throw await apiError(res, 'Blad pobierania wejsc')
  const data = await res.json()
  return data.logins || []
}

/**
 * Pobiera log aktywności (każda akcja API). Tylko admin.
 * @param {{ user_id?: number, path?: string, ip?: string, limit?: number }} params
 */
export async function getAdminActivity(params = {}) {
  const sp = new URLSearchParams()
  if (params.user_id != null) sp.set('user_id', String(params.user_id))
  if (params.path) sp.set('path', params.path)
  if (params.ip) sp.set('ip', params.ip)
  if (params.limit != null) sp.set('limit', String(params.limit))
  const q = sp.toString()
  const url = `${API_BASE}/admin/activity${q ? `?${q}` : ''}`
  const res = await authFetch(url, { headers: getAuthHeaders() })
  if (!res.ok) throw await apiError(res, 'Błąd pobierania aktywności')
  const data = await res.json()
  return data.activity || []
}

export { getToken }
