import { useEffect, useRef, useState } from 'react'

// Klucz testowy Cloudflare (zawsze przechodzi) – gdy brak VITE_TURNSTILE_SITE_KEY; na produkcji ustaw prawdziwy klucz
const TURNSTILE_TEST_SITE_KEY = '1x00000000000000000000AA'
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || TURNSTILE_TEST_SITE_KEY

export function TurnstileWidget({ onVerify, onExpire }) {
  const container = useRef(null)
  const widgetIdRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!SITE_KEY) return
    if (window.turnstile) {
      setReady(true)
      return
    }
    const t = setInterval(() => {
      if (window.turnstile) {
        setReady(true)
        clearInterval(t)
      }
    }, 100)
    return () => clearInterval(t)
  }, [SITE_KEY])

  useEffect(() => {
    if (!SITE_KEY || !ready || !container.current) return
    widgetIdRef.current = window.turnstile.render(container.current, {
      sitekey: SITE_KEY,
      callback: (token) => onVerify?.(token),
      'expired-callback': () => onExpire?.()
    })
    return () => {
      if (widgetIdRef.current != null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }
    }
  }, [SITE_KEY, ready])

  return (
    <div className="flex flex-col items-center gap-1">
      <div ref={container} className="turnstile-widget min-h-[65px] [&_.cf-turnstile]:mx-0" />
      {!import.meta.env.VITE_TURNSTILE_SITE_KEY && (
        <span className="text-xs text-slate-500">Weryfikacja (tryb testowy)</span>
      )}
    </div>
  )
}
