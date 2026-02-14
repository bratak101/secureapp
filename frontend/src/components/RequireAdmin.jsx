import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function RequireAdmin({ children }) {
  const { isAuthenticated, user } = useAuth()
  const isAdmin = user?.role === 'admin'
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}
