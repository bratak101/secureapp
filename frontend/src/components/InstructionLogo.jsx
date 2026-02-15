// Loga SVG: Linux (Tux-style), Windows. Kolory Linux: pomarańczowy + ciemny.
const sizeDefault = 48

// Stylizowany pingwin Linux (Tux) – głowa, brzuch, skrzydła, łapy w kolorystyce Linux
export function LinuxDesktopLogo({ className = '', size = sizeDefault }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {/* Głowa */}
      <circle cx="24" cy="14" r="10" fill="currentColor" />
      {/* Białe oko (odwrócone – wycięcie) */}
      <circle cx="20" cy="12" r="2.5" className="fill-white dark:fill-slate-900" />
      <circle cx="28" cy="12" r="2.5" className="fill-white dark:fill-slate-900" />
      {/* Tułów */}
      <ellipse cx="24" cy="32" rx="14" ry="16" fill="currentColor" />
      {/* Brzuch (biały) */}
      <ellipse cx="24" cy="34" rx="9" ry="12" className="fill-white dark:fill-slate-800" />
      {/* Skrzydło lewe */}
      <ellipse cx="11" cy="30" rx="6" ry="10" fill="currentColor" />
      {/* Skrzydło prawe */}
      <ellipse cx="37" cy="30" rx="6" ry="10" fill="currentColor" />
      {/* Łapy (Linux orange) */}
      <ellipse cx="18" cy="46" rx="5" ry="3" className="fill-linux" />
      <ellipse cx="30" cy="46" rx="5" ry="3" className="fill-linux" />
    </svg>
  )
}

// Serwer z akcentem Linux (pomarańczowe diody + ciemna ramka)
export function LinuxServerLogo({ className = '', size = sizeDefault }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="8" y="6" width="32" height="10" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="8" y="20" width="32" height="10" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="8" y="34" width="32" height="10" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
      {/* Diody w kolorze Linux */}
      <circle cx="14" cy="11" r="2" className="fill-linux" />
      <circle cx="14" cy="25" r="2" className="fill-linux" />
      <circle cx="14" cy="39" r="2" className="fill-linux" />
      {/* Mały Tux na obudowie (uproszczony) */}
      <circle cx="36" cy="28" r="4" fill="currentColor" />
      <ellipse cx="36" cy="29.5" rx="2.5" ry="3" className="fill-white dark:fill-slate-800" />
    </svg>
  )
}

export function WindowsDesktopLogo({ className = '', size = sizeDefault }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="6" y="8" width="36" height="28" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="6" y1="18" x2="42" y2="18" stroke="currentColor" strokeWidth="1.5" />
      <rect x="8" y="10" width="8" height="6" rx="0.5" fill="currentColor" opacity="0.25" />
      <rect x="10" y="22" width="12" height="10" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  )
}

export function WindowsServerLogo({ className = '', size = sizeDefault }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="6" y="4" width="36" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="6" y="22" width="36" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="6" y="40" width="36" height="6" rx="1" fill="currentColor" opacity="0.2" />
      <rect x="10" y="8" width="6" height="6" rx="0.5" fill="currentColor" opacity="0.3" />
      <rect x="10" y="26" width="6" height="6" rx="0.5" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

export default function InstructionLogo({ slug, className = '', size = sizeDefault }) {
  switch (slug) {
    case 'linux-desktop':
      return <LinuxDesktopLogo className={className} size={size} />
    case 'linux-server':
      return <LinuxServerLogo className={className} size={size} />
    case 'windows-desktop':
      return <WindowsDesktopLogo className={className} size={size} />
    case 'windows-server':
      return <WindowsServerLogo className={className} size={size} />
    default:
      return null
  }
}
