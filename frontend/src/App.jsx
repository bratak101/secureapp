import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Layout from './components/Layout'
import GuestRoute from './components/GuestRoute'
import ErrorBoundary from './components/ErrorBoundary'
import PageLoader from './components/PageLoader'
import ToastContainer from './components/ToastContainer'
import SessionExpiredHandler from './components/SessionExpiredHandler'
import CookieConsentBanner from './components/CookieConsentBanner'

const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Konto = lazy(() => import('./pages/Konto'))
const Admin = lazy(() => import('./pages/Admin'))
const Pobierz = lazy(() => import('./pages/Pobierz'))
const InstrukcjaPage = lazy(() => import('./components/InstrukcjaPage'))
const NotFound = lazy(() => import('./pages/NotFound'))
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'))

function LazyRoute({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <SessionExpiredHandler />
            <CookieConsentBanner />
            <Routes>
              <Route path="/" element={<Layout><LazyRoute><Home /></LazyRoute></Layout>} />
              <Route path="/login" element={<Layout><GuestRoute><LazyRoute><Login /></LazyRoute></GuestRoute></Layout>} />
              <Route path="/register" element={<Layout><GuestRoute><LazyRoute><Register /></LazyRoute></GuestRoute></Layout>} />
              <Route path="/admin" element={<Layout><LazyRoute><Admin /></LazyRoute></Layout>} />
              <Route path="/konto" element={<Layout><LazyRoute><Konto /></LazyRoute></Layout>} />
              <Route path="/pobierz" element={<Layout><LazyRoute><Pobierz /></LazyRoute></Layout>} />
              <Route path="/polityka-cookies" element={<Layout><LazyRoute><CookiePolicy /></LazyRoute></Layout>} />
              <Route path="/:slug" element={<Layout><LazyRoute><InstrukcjaPage /></LazyRoute></Layout>} />
              <Route path="*" element={<Layout><LazyRoute><NotFound /></LazyRoute></Layout>} />
            </Routes>
          </BrowserRouter>
          <ToastContainer />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
