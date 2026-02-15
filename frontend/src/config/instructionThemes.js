// Motywy kolorystyczne – Linux (pomarańczowy), Windows (niebieski)
export const INSTRUCTION_THEMES = {
  'linux-desktop': {
    family: 'linux',
    variant: 'desktop',
    accent: 'linux',
    accentBg: 'bg-linux/30 dark:bg-linux/35',
    accentBorder: 'border-2 border-linux',
    accentText: 'text-linux-dark dark:text-linux',
    accentHover: 'hover:text-linux-dark dark:hover:text-linux-light',
    badge: 'Desktop',
  },
  'linux-server': {
    family: 'linux',
    variant: 'server',
    accent: 'linux',
    accentBg: 'bg-linux/35 dark:bg-linux/40',
    accentBorder: 'border-2 border-linux',
    accentText: 'text-linux-dark dark:text-linux',
    accentHover: 'hover:text-linux dark:hover:text-linux-light',
    badge: 'Server',
  },
  'windows-desktop': {
    family: 'windows',
    variant: 'desktop',
    accent: 'blue',
    accentBg: 'bg-blue-500/15 dark:bg-blue-500/20',
    accentBorder: 'border-blue-400/40 dark:border-blue-500/40',
    accentText: 'text-blue-700 dark:text-blue-300',
    accentHover: 'hover:text-blue-600 dark:hover:text-blue-400',
    badge: 'Desktop',
  },
  'windows-server': {
    family: 'windows',
    variant: 'server',
    accent: 'blue',
    accentBg: 'bg-blue-600/20 dark:bg-blue-600/25',
    accentBorder: 'border-blue-500/50 dark:border-blue-500/50',
    accentText: 'text-blue-800 dark:text-blue-200',
    accentHover: 'hover:text-blue-600 dark:hover:text-blue-400',
    badge: 'Server',
  },
}

export function getThemeForSlug(slug) {
  return INSTRUCTION_THEMES[slug] || null
}
