import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function Home() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated || !user) {
    return (
      <div className="home-hero-section relative flex flex-col items-center justify-center overflow-hidden" style={{ minHeight: 'calc(100dvh - 3.5rem)' }}>
        {/* === Warstwa 1: Animowany gradient === */}
        <div
          className="absolute inset-0 home-hero-bg"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0c4a6e 25%, #164e63 50%, #1e3a5f 75%, #0f172a 100%)' }}
          aria-hidden
        />

        {/* === Warstwa 2: Siatka (grid overlay) === */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
          aria-hidden
        />

        {/* === Warstwa 3: Pływające kule (glow orbs) === */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <div className="absolute w-[500px] h-[500px] rounded-full bg-brand-500/20 blur-[120px] home-hero-float" style={{ top: '10%', left: '15%' }} />
          <div className="absolute w-[600px] h-[600px] rounded-full bg-cyan-500/15 blur-[140px] home-hero-float" style={{ top: '50%', right: '10%', animationDelay: '-6s' }} />
          <div className="absolute w-[400px] h-[400px] rounded-full bg-indigo-500/20 blur-[100px] home-hero-float" style={{ bottom: '10%', left: '40%', animationDelay: '-12s' }} />
          <div className="absolute w-[300px] h-[300px] rounded-full bg-emerald-500/10 blur-[80px] home-hero-float" style={{ top: '30%', right: '35%', animationDelay: '-3s' }} />
          <div className="absolute w-[350px] h-[350px] rounded-full bg-purple-500/10 blur-[100px] home-hero-float" style={{ bottom: '30%', left: '10%', animationDelay: '-9s' }} />
        </div>

        {/* === Warstwa 4: Animowane linie (beams) === */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <div className="home-hero-beam absolute h-[1px] w-[40%] bg-gradient-to-r from-transparent via-brand-400/40 to-transparent" style={{ top: '25%', left: '-10%' }} />
          <div className="home-hero-beam absolute h-[1px] w-[35%] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" style={{ top: '65%', left: '-10%', animationDelay: '-4s' }} />
          <div className="home-hero-beam absolute h-[1px] w-[30%] bg-gradient-to-r from-transparent via-indigo-400/25 to-transparent" style={{ top: '45%', left: '-10%', animationDelay: '-8s' }} />
        </div>

        {/* === Warstwa 5: Drobne cząstki (particles) === */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white/20 home-hero-particle"
              style={{
                top: `${10 + (i * 7) % 80}%`,
                left: `${5 + (i * 11) % 90}%`,
                animationDelay: `${-i * 1.5}s`,
                animationDuration: `${8 + (i % 4) * 3}s`,
              }}
            />
          ))}
        </div>

        {/* === Treść === */}
        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
          <h1
            className="text-5xl sm:text-6xl font-bold text-white mb-5 drop-shadow-lg"
            style={{ animation: 'fade-in-up 0.7s ease-out both' }}
          >
            Secure App
          </h1>
          <p
            className="text-slate-300 text-lg sm:text-xl mb-12 max-w-lg mx-auto leading-relaxed"
            style={{ animation: 'fade-in-up 0.7s ease-out 0.3s both' }}
          >
            Zaloguj się lub załóż konto, aby uzyskać dostęp do plików i panelu.
          </p>
          <div
            className="flex gap-5 justify-center flex-wrap"
            style={{ animation: 'fade-in-up 0.7s ease-out 0.6s both' }}
          >
            <Link
              to="/login"
              className="px-9 py-4 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/30 hover:scale-105 hover:-translate-y-1 active:scale-[0.98]"
            >
              Logowanie
            </Link>
            <Link
              to="/register"
              className="px-9 py-4 rounded-xl font-semibold text-white/90 border border-white/20 hover:bg-white/10 hover:border-white/40 transition-all duration-300 hover:shadow-lg hover:shadow-white/5 hover:scale-105 hover:-translate-y-1 active:scale-[0.98] backdrop-blur-sm"
            >
              Rejestracja
            </Link>
          </div>
        </div>

        {/* === Dolny gradient fade === */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" aria-hidden />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <section className="mb-12" style={{ animation: 'fade-in-up 0.6s ease-out both' }}>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Witaj, {user.username}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-4">
          Użyj menu po lewej: instrukcje dla <strong className="text-slate-700 dark:text-slate-300">Linux Desktop</strong>, <strong className="text-slate-700 dark:text-slate-300">Linux Server</strong>, <strong className="text-slate-700 dark:text-slate-300">Windows Desktop</strong> i <strong className="text-slate-700 dark:text-slate-300">Windows Server</strong>. Na każdej podstronie są <strong className="text-slate-700 dark:text-slate-300">pliki i obrazy do pobrania</strong> dopasowane do danej instrukcji.
        </p>
      </section>

      <section style={{ animation: 'fade-in-up 0.6s ease-out 0.2s both' }}>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Konto</h2>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
          <p className="text-slate-600 dark:text-slate-300">
            Zarządzaj danymi konta, hasłem i ustawieniami.
          </p>
          <Link
            to="/konto"
            className="inline-block mt-3 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-white bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200 hover:shadow active:scale-[0.98]"
          >
            Przejdź do konta
          </Link>
        </div>
      </section>
    </div>
  )
}
