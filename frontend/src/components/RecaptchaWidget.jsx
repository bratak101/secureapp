import { useEffect, useRef, useState } from 'react'

const RECAPTCHA_TEST_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || RECAPTCHA_TEST_SITE_KEY

export function RecaptchaWidget({ onVerify, onExpire }) {
  const container = useRef(null)
  const [ready, setReady] = useState(false)
  const [widgetError, setWidgetError] = useState(null)

  useEffect(() => {
    if (!SITE_KEY) return
    if (window.grecaptcha?.ready) {
      window.grecaptcha.ready(() => setReady(true))
      return
    }
    const t = setInterval(() => {
      if (window.grecaptcha?.ready) {
        window.grecaptcha.ready(() => setReady(true))
        clearInterval(t)
      }
    }, 100)
    return () => clearInterval(t)
  }, [SITE_KEY])

  useEffect(() => {
    if (!SITE_KEY || !ready || !container.current) return
    setWidgetError(null)
    let wid
    try {
      wid = window.grecaptcha.render(container.current, {
        sitekey: SITE_KEY,
        callback: (token) => {
          setWidgetError(null)
          onVerify?.(token)
        },
        'expired-callback': () => onExpire?.(),
        'error-callback': () => setWidgetError('invalid_domain')
      })
    } catch (e) {
      setWidgetError('render_failed')
    }
    return () => {
      if (typeof wid === 'number' && window.grecaptcha?.reset) window.grecaptcha.reset(wid)
    }
  }, [SITE_KEY, ready])

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : ''

  return (
    <div className="flex flex-col items-center gap-1">
      <div ref={container} className="g-recaptcha" />
      {widgetError === 'invalid_domain' && (
        <p className="text-xs text-amber-400 max-w-xs text-center mt-1">
          Invalid domain. W reCAPTCHA Admin dodaj dokladnie te domeny: <strong className="break-all">{currentDomain}</strong> (oraz localhost jesli testujesz lokalnie). Klucz w Vercel musi byc Site Key z tego samego klucza.
        </p>
      )}
      {widgetError === 'render_failed' && (
        <p className="text-xs text-amber-400">Nie udalo sie zaladowac reCAPTCHA. Sprawdz konsole (F12).</p>
      )}
      {import.meta.env.VITE_RECAPTCHA_SITE_KEY && currentDomain && !widgetError && (
        <span className="text-xs text-slate-500">Domena: {currentDomain}</span>
      )}
      {!import.meta.env.VITE_RECAPTCHA_SITE_KEY && (
        <span className="text-xs text-slate-500">reCAPTCHA (tryb testowy)</span>
      )}
    </div>
  )
}
