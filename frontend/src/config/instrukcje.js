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

## Gdzie zmienić wszystkie nazwy w terminalu (Linux Desktop)

### Użytkownik i grupa (konto systemowe)
| Miejsce | Ścieżka / pole | Co zmienić |
|---------|-----------------|------------|
| Nazwa użytkownika | \`/etc/passwd\` (pierwsze pole w linii), \`/etc/shadow\` | Użyj \`usermod -l nowy stary\` zamiast edycji ręcznej. |
| Katalog domowy | \`/etc/passwd\` (pole 6), \`/home/stary-uzytkownik\` | \`usermod -d /home/nowy stary\`, potem \`mv /home/stary /home/nowy\`, \`chown -R nowy:nowy /home/nowy\`. |
| Nazwa grupy | \`/etc/group\`, \`/etc/gshadow\` | \`groupmod -n nowa-grupa stara-grupa\` (użytkownicy muszą być wylogowani). |
| Powłoka użytkownika | \`/etc/passwd\` (ostatnie pole) | \`chsh -s /bin/bash uzytkownik\`. |

Przykład w terminalu (zamień \`stary\` / \`nowy\` na swoje nazwy):
\`\`\`bash
# Zmiana nazwy użytkownika (wyloguj użytkownika wcześniej)
sudo usermod -l nowy stary
sudo usermod -d /home/nowy nowy
sudo mv /home/stary /home/nowy
sudo chown -R nowy:nowy /home/nowy
# Zmiana nazwy grupy
sudo groupmod -n nowa-grupa stara-grupa
\`\`\`

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

## Gdzie zmienić wszystkie nazwy w terminalu (Linux Server)

### Użytkownik i grupa (konto usługi / systemowe)
| Miejsce | Ścieżka / pole | Co zmienić |
|---------|----------------|------------|
| Użytkownik usługi | \`/etc/passwd\`, w pliku .service: \`User=secure-app\` | \`useradd -r -s /bin/false twoja-usluga\` lub \`usermod -l nowy stary\` dla istniejącego. |
| Grupa użytkownika | \`/etc/group\`, \`Group=\` w .service | \`groupadd -r twoja-grupa\`, \`usermod -g twoja-grupa twoja-usluga\` lub \`groupmod -n nowa stara\`. |
| Katalog domowy / dane | \`/var/lib/secure-app/\`, \`/home/secure-app\` (jeśli używane) | Po zmianie użytkownika: \`chown -R nowy:nowa /var/lib/moja-usluga\`. |
| Właściciel plików konfiguracji | \`/etc/secure-app/\`, \`/var/log/secure-app/\` | \`chown -R uzytkownik-uslugi:grupa /etc/moja-usluga\`. |

Przykład w terminalu:
\`\`\`bash
# Nowy użytkownik i grupa pod usługę
sudo groupadd -r moja-usluga
sudo useradd -r -g moja-usluga -s /bin/false -d /var/lib/moja-usluga moja-usluga
# Zmiana nazwy istniejącego użytkownika usługi
sudo usermod -l moja-usluga secure-app
sudo groupmod -n moja-usluga secure-app
sudo chown -R moja-usluga:moja-usluga /etc/moja-usluga /var/log/moja-usluga
\`\`\`

## Bezpieczeństwo
- Używaj zapory (firewall) i ogranicz porty.
- Regularnie aktualizuj system i aplikację.
- Logi: \`/var/log/secure-app/\`

## Logi administracji (panel web)
W aplikacji webowej zaloguj się jako administrator i wejdź w **Panel admin** → sekcja **Logi administracji**. Lista zawiera akcje (zmiana roli, reset hasła, zmiana e-mail) z datą, administratorem, **adresem IP** i szczegółami. Filtruj wpisy po **IP** (np. \`192.168.\`) lub **typie akcji** i kliknij „Filtruj”.
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

## Logi administracji (panel web)
W aplikacji webowej zaloguj się jako administrator → **Panel admin** → **Logi administracji**. Akcje adminów (zmiana roli, reset hasła, e-mail) są zapisywane z **adresem IP**. Filtruj listę po IP lub typie akcji.
    `.trim(),
  },
}
