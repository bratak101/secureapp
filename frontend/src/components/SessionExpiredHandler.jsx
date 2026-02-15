import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/useToast'

const SESSION_EXPIRED_EVENT = 'secure_app_401'

export default function SessionExpiredHandler() {
  const logout = useAuth().logout
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const handle = () => {
      logout()
      toast.error('Sesja wygasła. Zaloguj się ponownie.')
      navigate('/login', { replace: true })
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, handle)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handle)
  }, [logout, toast, navigate])

  return null
}
