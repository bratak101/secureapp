import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useTheme } from '../context/useTheme'
import { setCurrentPath } from '../api/client'
import InstructionLogo from './InstructionLogo'

const PAGE_TITLES = {
  '/': 'Strona główna',
  '/login': 'Logowanie',
  '/register': 'Rejestracja',
  '/konto': 'Moje konto',
  '/admin': 'Panel administratora',
  '/pobierz': 'Pobierz pliki',
  '/polityka-cookies': 'Polityka cookies',
}
function getPageTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  if (pathname.startsWith('/linux-') || pathname.startsWith('/windows-')) {
    const slug = pathname.slice(1)
    return slug.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') || null
  }
  return null
}


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

function AdminIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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

  useEffect(() => {
    const title = getPageTitle(location.pathname)
    document.title = title ? `${title} – Secure App` : 'Secure App'
  }, [location.pathname])

  useEffect(() => {
    setCurrentPath(location.pathname)
  }, [location.pathname])

  const isActive = (path) => location.pathname === path
  const isLinuxPath = (path) => path === '/linux-desktop' || path === '/linux-server'
  const isWindowsPath = (path) => path === '/windows-desktop' || path === '/windows-server'
  const linkClass = (path) =>
    `block px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
      isActive(path)
        ? 'bg-brand-600 text-white'
        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
    }`
  const subLinkClass = (path) => {
    const active = isActive(path)
    if (active && isLinuxPath(path)) {
      return 'block pl-6 pr-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 bg-linux/35 dark:bg-linux/40 text-white dark:text-white border-l-2 border-linux'
    }
    if (active && isWindowsPath(path)) {
      return 'block pl-6 pr-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 bg-blue-500/20 dark:bg-blue-500/25 text-blue-700 dark:text-blue-300 border-l border-blue-500'
    }
    return `block pl-6 pr-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
      active
        ? 'bg-slate-200 dark:bg-slate-700 text-brand-600 dark:text-brand-300 font-medium'
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
    }`
  }

  const navContent = (
    <>
      <Link to="/" className={linkClass('/')} onClick={() => setSidebarOpen(false)}>Strona główna</Link>
      <div className="pt-4">
        <p className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Linux</p>
        <Link to="/linux-desktop" className={`${subLinkClass('/linux-desktop')} flex items-center gap-2 ${isActive('/linux-desktop') ? 'nav-link-active-linux' : ''}`} onClick={() => setSidebarOpen(false)}>
          <InstructionLogo slug="linux-desktop" size={22} className="shrink-0 text-slate-800 dark:text-slate-100" />
          Linux Desktop
        </Link>
        <Link to="/linux-server" className={`${subLinkClass('/linux-server')} flex items-center gap-2 ${isActive('/linux-server') ? 'nav-link-active-linux' : ''}`} onClick={() => setSidebarOpen(false)}>
          <InstructionLogo slug="linux-server" size={22} className="shrink-0 text-slate-800 dark:text-slate-100" />
          Linux Server
        </Link>
      </div>
      <div className="pt-2">
        <p className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Windows</p>
        <Link to="/windows-desktop" className={`${subLinkClass('/windows-desktop')} flex items-center gap-2`} onClick={() => setSidebarOpen(false)}>
          <InstructionLogo slug="windows-desktop" size={20} className="shrink-0 text-blue-500 dark:text-blue-400" />
          Windows Desktop
        </Link>
        <Link to="/windows-server" className={`${subLinkClass('/windows-server')} flex items-center gap-2`} onClick={() => setSidebarOpen(false)}>
          <InstructionLogo slug="windows-server" size={20} className="shrink-0 text-blue-600 dark:text-blue-400" />
          Windows Server
        </Link>
      </div>
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <Link to="/pobierz" className={linkClass('/pobierz')} onClick={() => setSidebarOpen(false)}>Pobierz pliki</Link>
      </div>
      {user?.role === 'admin' && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <Link to="/admin" className={linkClass('/admin')} onClick={() => setSidebarOpen(false)}>Admin</Link>
        </div>
      )}
    </>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <header className="shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-900/80 transition-shadow duration-200">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setSidebarOpen((o) => !o)}
                className="lg:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 active:scale-95"
                aria-label="Menu"
              >
                <MenuIcon className="w-6 h-6" />
              </button>
            )}
            <Link to="/" className="text-lg font-semibold text-slate-900 dark:text-white hover:text-brand-500 dark:hover:text-brand-400 transition-colors duration-200">Secure App</Link>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 active:scale-95"
              title={theme === 'dark' ? 'Jasny motyw' : 'Ciemny motyw'}
            >
              <ThemeIcon theme={theme} className="w-5 h-5" />
            </button>
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors duration-200 border border-amber-300/50 dark:border-amber-600/50"
                    title="Panel administratora"
                  >
                    <AdminIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Panel admin</span>
                  </Link>
                )}
                <Link to="/konto" className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200" title="Moje konto">
                  <UserIcon className="w-5 h-5" />
                  <span className="text-sm font-medium hidden sm:inline">Konto</span>
                </Link>
              </>
            ) : location.pathname !== '/' ? (
              <>
                <Link to="/login" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200">Logowanie</Link>
                <Link to="/register" className="px-3 py-2 rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-500 transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-[0.98]">Rejestracja</Link>
              </>
            ) : null}
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 relative">
        {isAuthenticated && (
          <>
            <aside className="hidden lg:flex w-56 shrink-0 flex-col py-4 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 px-2 space-y-1">
              {navContent}
            </aside>
            {sidebarOpen && (
              <div className="lg:hidden fixed inset-0 z-40 bg-black/50 animate-fade-in" onClick={() => setSidebarOpen(false)} aria-hidden style={{ animationDuration: '0.15s' }} />
            )}
            <aside className={`lg:hidden fixed top-14 left-0 z-50 w-56 h-[calc(100vh-3.5rem)] border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-2 transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              {navContent}
            </aside>
          </>
        )}

        <main className="flex-1 min-w-0 overflow-auto">
          <div key={location.pathname} className="animate-slide-in-right min-h-full">
            {children}
          </div>
        </main>
      </div>

      <footer className="shrink-0 border-t border-slate-200 dark:border-slate-800 py-3 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
          <Link to="/polityka-cookies" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
            Polityka cookies
          </Link>
        </div>
      </footer>
    </div>
  )
}
