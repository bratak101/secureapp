import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { INSTRUKCJE } from '../config/instrukcje'
import { getDownloadsForSlug } from '../config/downloads'
import { getThemeForSlug } from '../config/instructionThemes'
import InstructionLogo from './InstructionLogo'

const VALID_SLUGS = ['linux-desktop', 'linux-server', 'windows-desktop', 'windows-server']
const LAST_VIEWED_KEY = 'secure_app_last_viewed'
const LAST_VIEWED_MAX = 4

function getBreadcrumbParent(slug) {
  if (slug.startsWith('linux-')) return { label: 'Linux', path: '/' }
  if (slug.startsWith('windows-')) return { label: 'Windows', path: '/' }
  return { label: 'Strona główna', path: '/' }
}

function parseTable(lines, startIdx) {
  const rows = []
  let i = startIdx
  while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
    const cells = lines[i].split('|').map((c) => c.trim()).filter(Boolean)
    rows.push(cells)
    i++
  }
  if (rows.length < 2) return { table: null, nextIdx: startIdx }
  const header = rows[0]
  const sep = rows[1]
  const dataRows = rows.slice(2).filter((row) => row.some((c) => c.replace(/-/g, '').trim()))
  return { table: { header, dataRows }, nextIdx: i }
}

export default function InstrukcjaPage() {
  const { isAuthenticated } = useAuth()
  const { slug } = useParams()

  useEffect(() => {
    if (slug && VALID_SLUGS.includes(slug)) {
      try {
        const raw = localStorage.getItem(LAST_VIEWED_KEY)
        const arr = raw ? JSON.parse(raw) : []
        const next = [slug, ...arr.filter((s) => s !== slug)].slice(0, LAST_VIEWED_MAX)
        localStorage.setItem(LAST_VIEWED_KEY, JSON.stringify(next))
      } catch (_) {}
    }
  }, [slug])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!slug || !VALID_SLUGS.includes(slug)) {
    return <Navigate to="/" replace />
  }

  const data = INSTRUKCJE[slug]
  if (!data) return <Navigate to="/" replace />

  const theme = getThemeForSlug(slug)
  const files = getDownloadsForSlug(slug)
  const parent = getBreadcrumbParent(slug)
  const accentBorder = theme?.accentBorder || 'border-slate-200 dark:border-slate-700'
  const accentBg = theme?.accentBg || 'bg-slate-100 dark:bg-slate-800/50'
  const accentText = theme?.accentText || 'text-slate-900 dark:text-white'

  const isLinux = theme?.family === 'linux'
  const isWindows = theme?.family === 'windows'

  return (
    <div className={`max-w-3xl mx-auto px-4 py-10 sm:py-12 animate-fade-in-up instruction-page instruction-page-${slug}`} data-theme={slug}>
      {/* Nawigacja: breadcrumb + wstecz w jednej linii */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <nav aria-label="Breadcrumb">
          <ol className={`flex flex-wrap items-center gap-1.5 text-sm ${isLinux ? 'text-linux dark:text-linux' : isWindows ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
            <li><Link to="/" className={isLinux ? 'text-linux hover:text-linux-light transition-colors' : isWindows ? 'text-blue-600 dark:text-blue-400 hover:opacity-90' : 'hover:text-slate-900 dark:hover:text-white transition-colors'}>Strona główna</Link></li>
            <li aria-hidden className="select-none opacity-60">/</li>
            <li><Link to={parent.path} className={isLinux ? 'text-linux hover:text-linux-light transition-colors' : isWindows ? 'text-blue-600 dark:text-blue-400 hover:opacity-90' : 'hover:text-slate-900 dark:hover:text-white transition-colors'}>{parent.label}</Link></li>
            <li aria-hidden className="select-none opacity-60">/</li>
            <li className="font-semibold opacity-100" aria-current="page">{data.title}</li>
          </ol>
        </nav>
        <Link
          to="/"
          className={`instruction-back-link inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isLinux ? 'text-white bg-linux hover:bg-linux-light border border-linux dark:border-white/20' : isWindows ? 'text-white bg-blue-500 hover:bg-blue-400 border border-blue-400/50' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          <span aria-hidden className="text-base leading-none">←</span> Wróć
        </Link>
      </div>

      {/* Hero sekcji – logo, tytuł, badge w jednej kompozycji */}
      <div className={`instruction-header-box instruction-hero relative overflow-hidden rounded-2xl mb-12 sm:mb-14 shadow-xl shadow-slate-300/20 dark:shadow-black/30 ${isLinux ? 'bg-linux border-2 border-linux' : isWindows ? 'bg-blue-500 border-2 border-blue-500' : `${accentBorder} ${accentBg}`}`}>
        {/* Akcent kolorystyczny – pasek z lewej */}
        <div className={`instruction-hero-accent absolute left-0 top-0 bottom-0 w-1.5 sm:w-2 ${isLinux ? 'bg-linux' : isWindows ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`} aria-hidden />
        <div className="flex flex-wrap items-center gap-6 sm:gap-8 pl-6 pr-6 py-7 sm:py-9">
          {/* Logo w zaokrąglonym kontenerze */}
          <div className={`instruction-hero-logo-wrap flex shrink-0 items-center justify-center w-20 h-20 sm:w-28 sm:h-28 rounded-2xl shadow-inner ${isLinux ? 'bg-white/20 dark:bg-white/10 text-slate-800 dark:text-white' : isWindows ? 'bg-white/20 dark:bg-white/10 text-slate-800 dark:text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
            <InstructionLogo slug={slug} size={56} className={isLinux ? 'text-slate-800 dark:text-white' : ''} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isLinux ? 'text-white dark:text-white' : isWindows ? 'text-white dark:text-white' : accentText}`}>
                {data.title}
              </h1>
              {theme?.badge && (
                <span className={`instruction-badge inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${isLinux ? 'bg-white/25 text-white ring-2 ring-white/40 backdrop-blur-sm' : isWindows ? 'bg-white/25 text-white ring-2 ring-white/40 backdrop-blur-sm' : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200'}`}>
                  {theme.badge}
                </span>
              )}
            </div>
            <p className={`mt-2 text-sm sm:text-base max-w-xl leading-relaxed ${isLinux || isWindows ? 'text-white/90 dark:text-white/90' : 'text-slate-500 dark:text-slate-400'}`}>
              {data.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Delikatna linia oddzielająca hero od treści */}
      <div className={`h-px mb-10 ${isLinux ? 'bg-linux/30' : isWindows ? 'bg-blue-500/30' : 'bg-slate-200 dark:bg-slate-700'}`} aria-hidden />

      <article className="instrukcja-content text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
        {(() => {
          const lines = data.content.split('\n')
          const out = []
          let inCode = false
          let codeBuf = []
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            if (line.trim() === '```' || line.trim().startsWith('```')) {
              if (inCode) {
                out.push(<pre key={out.length} className={`my-3 rounded-lg ${accentBg} border ${accentBorder} p-3 font-mono text-xs overflow-x-auto`}>{codeBuf.join('\n')}</pre>)
                codeBuf = []
              }
              inCode = !inCode
              continue
            }
            if (inCode) {
              codeBuf.push(line)
              continue
            }
            const tableResult = parseTable(lines, i)
            if (tableResult.table) {
              const { header, dataRows } = tableResult.table
              out.push(
                <div key={out.length} className="my-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80">
                        {header.map((c, j) => <th key={j} className="px-3 py-2 font-semibold text-slate-900 dark:text-white">{c}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {dataRows.map((row, ri) => (
                        <tr key={ri} className="border-b border-slate-100 dark:border-slate-700/60">
                          {row.map((c, j) => <td key={j} className="px-3 py-2 text-slate-600 dark:text-slate-300">{c}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
              i = tableResult.nextIdx - 1
              continue
            }
            if (line.startsWith('## ')) {
              out.push(<h2 key={out.length} className={`text-lg font-semibold ${accentText} mt-8 mb-2 first:mt-0`}>{line.slice(3)}</h2>)
            } else if (line.startsWith('### ')) {
              out.push(<h3 key={out.length} className={`text-base font-medium ${accentText} mt-4 mb-1`}>{line.slice(4)}</h3>)
            } else if (line.startsWith('- ')) {
              out.push(<li key={out.length} className="ml-4 list-disc my-0.5 text-slate-600 dark:text-slate-300">{line.slice(2)}</li>)
            } else if (line.trim() === '') {
              out.push(<br key={out.length} />)
            } else {
              out.push(<p key={out.length} className="my-1 text-slate-600 dark:text-slate-300">{line}</p>)
            }
          }
          if (codeBuf.length) {
            out.push(<pre key={out.length} className={`my-3 rounded-lg ${accentBg} border ${accentBorder} p-3 font-mono text-xs overflow-x-auto`}>{codeBuf.join('\n')}</pre>)
          }
          return out
        })()}
      </article>

      {files.length > 0 && (
        <section className="mt-12 pt-8">
          <h2 className={`text-xl font-semibold ${accentText} mb-1`}>Pliki do pobrania</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Obrazy i pliki do tej instrukcji.</p>
          <ul className="space-y-1">
            {files.map((file) => (
              <li key={file.id}>
                <a
                  href={file.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors group"
                >
                  <span className="shrink-0 w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-brand-500 dark:group-hover:text-brand-400 text-sm" aria-hidden>↓</span>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-slate-900 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-400 block truncate">{file.name}</span>
                    {file.description && <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{file.description}</p>}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
