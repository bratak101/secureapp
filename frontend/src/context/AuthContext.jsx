import { createContext, useState, useCallback } from 'react'

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
      localStorage.setItem(TOKEN_KEY, newToken)
      localStorage.setItem(USER_KEY, JSON.stringify(newUser))
      setTokenState(newToken)
      setUser(newUser)
    } else {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      setTokenState(null)
      setUser(null)
    }
  }, [])

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
