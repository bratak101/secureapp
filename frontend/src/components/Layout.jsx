import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useTheme } from '../context/useTheme'
import { APP_VERSION } from '../config/version'

function UserIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function MenuIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function ThemeIcon({ theme, className }) {
  if (theme === 'light') {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  }
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  )
}

export default function Layout({ children }) {
  const { isAuthenticated, user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isActive = (path) => location.pathname === path
  const linkClass = (path) =>
    `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive(path) ? 'bg-brand-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
    }`
  const subLinkClass = (path) =>
    `block pl-6 pr-3 py-2 rounded-lg text-sm transition-colors ${
      isActive(path) ? 'bg-slate-700 text-brand-300 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
    }`

  const navContent = (
    <>
      <Link to="/" className={linkClass('/')} onClick={() => setSidebarOpen(false)}>Strona główna</Link>
      <div className="pt-4">
        <p className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Linux</p>
        <Link to="/linux-desktop" className={subLinkClass('/linux-desktop')} onClick={() => setSidebarOpen(false)}>Linux Desktop</Link>
        <Link to="/linux-server" className={subLinkClass('/linux-server')} onClick={() => setSidebarOpen(false)}>Linux Server</Link>
      </div>
      <div className="pt-2">
        <p className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Windows</p>
        <Link to="/windows-desktop" className={subLinkClass('/windows-desktop')} onClick={() => setSidebarOpen(false)}>Windows Desktop</Link>
        <Link to="/windows-server" className={subLinkClass('/windows-server')} onClick={() => setSidebarOpen(false)}>Windows Server</Link>
      </div>
      {user?.role === 'admin' && (
        <div className="pt-4 border-t border-slate-700">
          <Link to="/admin" className={linkClass('/admin')} onClick={() => setSidebarOpen(false)}>Admin</Link>
        </div>
      )}
    </>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <header className="shrink-0 border-b border-slate-800 bg-slate-900/95">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setSidebarOpen((o) => !o)}
                className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                aria-label="Menu"
              >
                <MenuIcon className="w-6 h-6" />
              </button>
            )}
            <Link to="/" className="text-lg font-semibold text-white hover:text-brand-400 transition-colors">Secure App</Link>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={theme === 'dark' ? 'Jasny motyw' : 'Ciemny motyw'}
            >
              <ThemeIcon theme={theme} className="w-5 h-5" />
            </button>
            {isAuthenticated ? (
              <Link to="/konto" className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors" title="Moje konto">
                <UserIcon className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">Konto</span>
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800">Logowanie</Link>
                <Link to="/register" className="px-3 py-2 rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-500">Rejestracja</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 relative">
        {isAuthenticated && (
          <>
            <aside className="hidden lg:flex w-56 shrink-0 flex-col py-4 border-r border-slate-800 bg-slate-900/50 px-2 space-y-1">
              {navContent}
            </aside>
            {sidebarOpen && (
              <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} aria-hidden />
            )}
            <aside className={`lg:hidden fixed top-14 left-0 z-50 w-56 h-[calc(100vh-3.5rem)] border-r border-slate-800 bg-slate-900 py-4 px-2 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              {navContent}
            </aside>
          </>
        )}

        <main className="flex-1 min-w-0 overflow-auto">
          {children}
        </main>
      </div>
      <footer className="shrink-0 py-2 px-4 border-t border-slate-800 text-center text-slate-500 text-xs">
        Secure App v{APP_VERSION}
      </footer>
    </div>
  )
}
