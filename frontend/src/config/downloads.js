// Pliki do pobrania osobno dla każdej podstrony (obrazy, PDF itd.).
// url: ścieżka w public/downloads/<slug>/ lub pełny URL.
// type: 'image' | 'file' – obraz pokazany jako miniatura, file jako link.

export const DOWNLOADS_BY_SLUG = {
  'linux-desktop': [
    { id: 'img1', name: 'Zrzut ekranu – instalator', description: 'Krok 1 instalacji', url: '/downloads/linux-desktop/instalator.png', type: 'image', size: '—' },
    { id: 'img2', name: 'Menu główne', description: 'Widok po pierwszym uruchomieniu', url: '/downloads/linux-desktop/menu.png', type: 'image', size: '—' },
  ],
  'linux-server': [
    { id: 'img1', name: 'Konfiguracja serwera', description: 'Przykład pliku config', url: '/downloads/linux-server/config.png', type: 'image', size: '—' },
    { id: 'img2', name: 'Status usługi', description: 'systemctl status', url: '/downloads/linux-server/status.png', type: 'image', size: '—' },
  ],
  'windows-desktop': [
    { id: 'img1', name: 'Kreator instalacji', description: 'Krok 1', url: '/downloads/windows-desktop/instalator.png', type: 'image', size: '—' },
    { id: 'img2', name: 'Skrót na pulpicie', description: 'Uruchomienie aplikacji', url: '/downloads/windows-desktop/skrot.png', type: 'image', size: '—' },
  ],
  'windows-server': [
    { id: 'img1', name: 'Usługa Windows', description: 'services.msc', url: '/downloads/windows-server/usluga.png', type: 'image', size: '—' },
    { id: 'img2', name: 'Konfiguracja', description: 'config.json', url: '/downloads/windows-server/config.png', type: 'image', size: '—' },
  ],
}

// Dla stron, które nie mają slug (np. strona główna) – pusta lista
export function getDownloadsForSlug(slug) {
  return DOWNLOADS_BY_SLUG[slug] || []
}
