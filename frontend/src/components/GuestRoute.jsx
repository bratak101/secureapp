import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/" replace />
  return children
}
