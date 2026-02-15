import { createContext, useState, useCallback, useEffect } from 'react'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

function loadStored() {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const user = localStorage.getItem(USER_KEY)
    if (token && user) return { token, user: JSON.parse(user) }
  } catch (_) {}
  return { token: null, user: null }
}

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStored().user)
  const [token, setTokenState] = useState(loadStored().token)

  const setToken = useCallback((newToken, newUser) => {
    if (newToken && newUser) {
      const userData = { ...newUser, role: newUser.role || 'user' }
      localStorage.setItem(TOKEN_KEY, newToken)
      localStorage.setItem(USER_KEY, JSON.stringify(userData))
      setTokenState(newToken)
      setUser(userData)
    } else {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      setTokenState(null)
      setUser(null)
    }
  }, [])

  // Po starcie aplikacji: odśwież dane użytkownika (w tym rolę admin) z backendu
  useEffect(() => {
    if (!token) return
    import('../api/client').then(({ me }) => {
      me()
        .then((data) => {
          const updated = {
            user_id: data.user_id,
            username: data.username,
            email: data.email,
            role: data.role || 'user',
          }
          setUser(updated)
          try {
            localStorage.setItem(USER_KEY, JSON.stringify(updated))
          } catch (_) {}
        })
        .catch(() => {})
    })
  }, [token])

  const logout = useCallback(() => {
    setToken(null, null)
  }, [setToken])

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    setToken,
    logout,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
