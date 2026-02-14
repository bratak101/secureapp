import { useEffect, useRef, useState } from 'react'

// Klucz testowy Google (zawsze przechodzi) – gdy brak VITE_RECAPTCHA_SITE_KEY; na produkcji ustaw prawdziwy klucz
const RECAPTCHA_TEST_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || RECAPTCHA_TEST_SITE_KEY

export function RecaptchaWidget({ onVerify, onExpire }) {
  const container = useRef(null)
  const [ready, setReady] = useState(false)

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
    const wid = window.grecaptcha.render(container.current, {
      sitekey: SITE_KEY,
      callback: (token) => onVerify?.(token),
      'expired-callback': () => onExpire?.()
    })
    return () => {
      if (typeof wid === 'number' && window.grecaptcha?.reset) window.grecaptcha.reset(wid)
    }
  }, [SITE_KEY, ready])

  return (
    <div className="flex flex-col items-center gap-1">
      <div ref={container} className="g-recaptcha" />
      {!import.meta.env.VITE_RECAPTCHA_SITE_KEY && (
        <span className="text-xs text-slate-500">reCAPTCHA (tryb testowy)</span>
      )}
    </div>
  )
}
