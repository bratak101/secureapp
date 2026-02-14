const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

function getToken() {
  return localStorage.getItem('auth_token')
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

export async function login(email, password, recaptchaToken = '') {
  let res
  try {
    res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, recaptcha_token: recaptchaToken }),
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

export function getAuthHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export { getToken }
