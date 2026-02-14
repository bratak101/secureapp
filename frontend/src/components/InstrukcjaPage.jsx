import { Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { INSTRUKCJE } from '../config/instrukcje'
import { getDownloadsForSlug } from '../config/downloads'

const VALID_SLUGS = ['linux-desktop', 'linux-server', 'windows-desktop', 'windows-server']

export default function InstrukcjaPage() {
  const { isAuthenticated } = useAuth()
  const { slug } = useParams()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!slug || !VALID_SLUGS.includes(slug)) {
    return <Navigate to="/" replace />
  }

  const data = INSTRUKCJE[slug]
  if (!data) return <Navigate to="/" replace />

  const files = getDownloadsForSlug(slug)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-white mb-1">{data.title}</h1>
      <p className="text-slate-400 text-sm mb-8">{data.subtitle}</p>
      <article className="instrukcja-content text-slate-300 text-sm leading-relaxed">
        {(() => {
          const lines = data.content.split('\n')
          const out = []
          let inCode = false
          let codeBuf = []
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            if (line.trim() === '```' || line.trim().startsWith('```')) {
              if (inCode) {
                out.push(<pre key={out.length} className="my-3 rounded-lg bg-slate-800/80 border border-slate-700 p-3 font-mono text-xs overflow-x-auto">{codeBuf.join('\n')}</pre>)
                codeBuf = []
              }
              inCode = !inCode
              continue
            }
            if (inCode) {
              codeBuf.push(line)
              continue
            }
            if (line.startsWith('## ')) {
              out.push(<h2 key={out.length} className="text-lg font-semibold text-white mt-8 mb-2 first:mt-0">{line.slice(3)}</h2>)
            } else if (line.startsWith('### ')) {
              out.push(<h3 key={out.length} className="text-base font-medium text-white mt-4 mb-1">{line.slice(4)}</h3>)
            } else if (line.startsWith('- ')) {
              out.push(<li key={out.length} className="ml-4 list-disc my-0.5">{line.slice(2)}</li>)
            } else if (line.trim() === '') {
              out.push(<br key={out.length} />)
            } else {
              out.push(<p key={out.length} className="my-1">{line}</p>)
            }
          }
          if (codeBuf.length) {
            out.push(<pre key={out.length} className="my-3 rounded-lg bg-slate-800/80 border border-slate-700 p-3 font-mono text-xs overflow-x-auto">{codeBuf.join('\n')}</pre>)
          }
          return out
        })()}
      </article>

      {files.length > 0 && (
        <section className="mt-12 pt-8 border-t border-slate-700/60">
          <h2 className="text-xl font-semibold text-white mb-4">Pliki do pobrania</h2>
          <p className="text-slate-500 text-sm mb-4">Obrazy i pliki do tej instrukcji.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {files.map((file) => (
              <a
                key={file.id}
                href={file.url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-slate-700/60 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600 transition-colors overflow-hidden group"
              >
                {file.type === 'image' ? (
                  <div className="aspect-video bg-slate-800 flex items-center justify-center relative">
                    <img
                      src={file.url}
                      alt=""
                      className="max-h-full w-full object-contain group-hover:opacity-90"
                      onError={(e) => { e.target.style.display = 'none'; const next = e.target.nextElementSibling; if (next) next.classList.remove('hidden') }}
                    />
                    <span className="hidden absolute inset-0 flex items-center justify-center text-slate-500 text-sm">Obraz (dodaj plik)</span>
                  </div>
                ) : null}
                <div className="p-3">
                  <span className="font-medium text-white group-hover:text-brand-400">{file.name}</span>
                  {file.description && <p className="text-sm text-slate-500 mt-0.5">{file.description}</p>}
                  {file.size && file.size !== '—' && <p className="text-xs text-slate-600 mt-1">{file.size}</p>}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
