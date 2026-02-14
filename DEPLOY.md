# Wdrożenie na GitHub i darmowy hosting

## 1. GitHub – repozytorium

### Inicjalizacja i pierwszy push

```powershell
cd c:\Users\Administrator\Documents\1
git init
git add .
git commit -m "Secure App: auth, Turnstile, rate limit"
```

Na [github.com](https://github.com) utwórz nowe repozytorium (np. `secure-app`), **bez** README. Potem:

```powershell
git remote add origin https://github.com/TWOJA_NAZWA/secure-app.git
git branch -M main
git push -u origin main
```

(Zamień `TWOJA_NAZWA` na swoją nazwę użytkownika GitHub.)

---

## 2. Darmowy hosting (Frontend + Backend + Baza)

| Część     | Serwis        | Darmowy plan |
|----------|----------------|--------------|
| Frontend | **Vercel**     | Automatyczny deploy z GitHub, HTTPS |
| Backend  | **Render** lub **Railway** | Web Service, ok. 750 h/mies. (Render) |
| Baza     | **PlanetScale** (MySQL) lub **Railway** (MySQL/Postgres) | Darmowy tier |

### Frontend (Vercel)

1. Wejdź na [vercel.com](https://vercel.com), zaloguj się przez GitHub.
2. **Add New** → **Project** → wybierz repozytorium `secure-app`.
3. **Root Directory**: ustaw `frontend`.
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Environment Variables**:
   - `VITE_API_URL` = URL Twojego backendu (np. `https://secure-app-xxx.onrender.com`)
   - `VITE_RECAPTCHA_SITE_KEY` = klucz publiczny reCAPTCHA (opcjonalnie)
7. Deploy.

### Backend (Render)

Szczegółowa instrukcja (w tym baza na Railway): **docs/RENDER_BACKEND.md**.

W skrócie:
1. [render.com](https://render.com) → **New** → **Web Service** → połącz repo.
2. **Root Directory**: `backend`
3. **Build Command**: `go build -o server .`
4. **Start Command**: `./server`
5. **Environment**: `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE` (dane z Railway – **publiczny** host i port), `RECAPTCHA_SECRET_KEY`. `PORT` ustawia Render.
6. Zapisz – Render zbuduje i uruchomi backend. Skopiuj URL (np. `https://secure-app-xxx.onrender.com`) i ustaw w Vercel jako `VITE_API_URL`.

### Baza (PlanetScale)

1. [planetscale.com](https://planetscale.com) – konto darmowe.
2. **Create database** → wybierz region.
3. W **Connect** wygeneruj hasło i skopiuj connection string (host, user, hasło).
4. Tabelę `users` utwórz przez **Console** (SQL) – skopiuj treść z `database/schema.sql` (dostosuj do PlanetScale jeśli trzeba).
5. W Render (backend) ustaw zmienne: `DB_HOST=...`, `DB_USER=...`, `DB_PASS=...`, `DB_NAME=...`.

### Google reCAPTCHA (darmowy)

1. [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin) → **Create**.
2. Wybierz **reCAPTCHA v2** (checkbox „I'm not a robot”), dodaj domeny (np. `*.vercel.app`, `localhost`).
3. Skopiuj **Site Key** (frontend) i **Secret Key** (backend).
4. **Frontend (Vercel)**: `VITE_RECAPTCHA_SITE_KEY` = Site Key.
5. **Backend (Render/Railway)**: `RECAPTCHA_SECRET_KEY` = Secret Key.

---

## 3. Ochrona DDoS i ataki – Cloudflare (darmowo)

1. Wejdź na [cloudflare.com](https://cloudflare.com), załóż konto.
2. **Add site** → wpisz domenę (np. domena Vercel lub własna).
3. Wybierz plan **Free**.
4. Cloudflare pokaże nameservery – u u dostawcy domeny ustaw te NS (dla *.vercel.app Vercel zwykle obsługuje domenę; dla własnej domeny podłączasz ją do Vercel, potem w DNS Cloudflare dodajesz CNAME na Vercel).
5. W panelu Cloudflare:
   - **Security** → **Settings**: włącz **Under Attack Mode** w razie silnego ataku.
   - **Security** → **WAF**: reguły rate limiting (np. limit requestów na IP).
   - **Caching** – opcjonalnie cache dla statyków.

Dla samego backendu (Render) Cloudflare można postawić przed nim tylko gdy masz własną domenę wskazującą na Render; wtedy w DNS Cloudflare ustawiasz proxy (pomarańczowa chmurka) na tę domenę.

---

## 4. Podsumowanie zabezpieczeń w projekcie

- **Google reCAPTCHA** – weryfikacja „nie jestem robotem” (rejestracja/logowanie).
- **Rate limiting** – 10 żądań/min na IP na `/register` i `/login` (ochrona przed brute force i spamem).
- **Cloudflare** – ochrona DDoS i dodatkowy rate limit na poziomie sieci (po podłączeniu domeny).

Lokalnie używany jest klucz testowy Google (widget zawsze widoczny). Na produkcji ustaw prawdziwe klucze. Rate limiting działa zawsze.
