// Treści instrukcji dla każdej podstrony (można później przenieść do CMS lub API).
export const INSTRUKCJE = {
  'linux-desktop': {
    title: 'Linux Desktop',
    subtitle: 'Instrukcja konfiguracji i obsługi wersji desktop',
    content: `
## Wymagania
- Dystrybucja z graficznym środowiskiem (Ubuntu, Fedora, Debian itp.)
- Połączenie z internetem

## Instalacja
1. Pobierz pakiet instalacyjny z sekcji „Pobierz pliki”.
2. Nadaj uprawnienia: \`chmod +x installer-desktop.sh\`
3. Uruchom: \`./installer-desktop.sh\`
4. Postępuj według kreatora instalacji.

## Pierwsze uruchomienie
- Uruchom aplikację z menu lub z terminala: \`secure-app-desktop\`
- Zaloguj się danymi konta utworzonego na stronie.

## Rozwiązywanie problemów
- Brak bibliotek: zainstaluj zależności podane w komunikacie błędu (np. \`apt install libxyz\`).
- Problem z wyświetlaniem: sprawdź sterowniki grafiki i tryb kompatybilności.
    `.trim(),
  },
  'linux-server': {
    title: 'Linux Server',
    subtitle: 'Instrukcja wdrożenia i konfiguracji wersji serwerowej',
    content: `
## Wymagania
- Serwer z systemem Linux (Debian, Ubuntu Server, CentOS itp.)
- Dostęp SSH z uprawnieniami administratora

## Instalacja
1. Skopiuj pakiet na serwer (scp lub rsync).
2. Zainstaluj zależności systemowe (skrypt \`deps.sh\` w paczce).
3. Uruchom instalator: \`sudo ./install-server.sh\`
4. Skonfiguruj port, użytkownika usługi i ścieżki w \`/etc/secure-app/config.conf\`.

## Uruchomienie usługi
\`\`\`bash
sudo systemctl start secure-app
sudo systemctl enable secure-app
\`\`\`

## Bezpieczeństwo
- Używaj zapory (firewall) i ogranicz porty.
- Regularnie aktualizuj system i aplikację.
- Logi: \`/var/log/secure-app/\`
    `.trim(),
  },
  'windows-desktop': {
    title: 'Windows Desktop',
    subtitle: 'Instrukcja instalacji i użytkowania wersji na Windows',
    content: `
## Wymagania
- Windows 10 lub 11 (64-bit)
- Uprawnienia administratora do instalacji

## Instalacja
1. Pobierz instalator z sekcji „Pobierz pliki” (plik .msi lub .exe).
2. Uruchom instalator i postępuj według kroków kreatora.
3. Opcjonalnie: wybierz skrót na pulpicie i w menu Start.

## Pierwsze uruchomienie
- Uruchom „Secure App” z menu Start lub ze skrótu.
- Zaloguj się danymi konta z serwisu.

## Aktualizacje
- Aplikacja sprawdza aktualizacje przy starcie. Możesz też pobrać nową wersję ręcznie ze strony i zainstalować nad istniejącą.

## Odinstalowanie
- Panel sterowania → Programy i funkcje → Secure App → Odinstaluj (lub Ustawienia → Aplikacje).
    `.trim(),
  },
  'windows-server': {
    title: 'Windows Server',
    subtitle: 'Instrukcja wdrożenia wersji serwerowej na Windows Server',
    content: `
## Wymagania
- Windows Server 2019 lub nowszy (64-bit)
- Uprawnienia administratora

## Instalacja
1. Skopiuj pakiet instalacyjny na serwer.
2. Uruchom instalator jako administrator.
3. Wybierz katalog instalacji i port usługi.
4. Usługa zostanie zarejestrowana w systemie (Windows Service).

## Zarządzanie usługą
- \`services.msc\` → Secure App → Uruchom / Zatrzymaj / Restart
- Lub z PowerShell: \`Start-Service SecureApp\`, \`Stop-Service SecureApp\`

## Konfiguracja
- Plik konfiguracyjny: \`%ProgramFiles%\\Secure App\\config.json\`
- Po zmianach: zrestartuj usługę.

## Zapora i sieć
- Otwórz wybrany port TCP w Zaporze systemu Windows (Zapora Windows z zaawansowanymi zabezpieczeniami).
    `.trim(),
  },
}
