# Jak ustawić backend na Renderze

Krok po kroku: wdrożenie backendu (Go) na Render i podłączenie bazy z Railway.

---

## 1. Nowy Web Service

1. Wejdź na [render.com](https://render.com) i zaloguj się (np. przez GitHub).
2. **Dashboard** → **New +** → **Web Service**.
3. Połącz **GitHub** (jeśli jeszcze nie) i wybierz repozytorium z projektem (np. `secureapp` / `secure-app`).
4. Kliknij **Connect** przy wybranym repo.

---

## 2. Ustawienia buildu i startu

| Pole | Wartość |
|------|--------|
| **Name** | np. `secureapp-backend` (dowolna nazwa serwisu) |
| **Region** | wybierz najbliższy (np. Frankfurt) |
| **Root Directory** | `backend` |
| **Runtime** | **Go** (albo Docker – wtedy poniżej ustaw Docker) |

**Build:**

| Pole | Wartość |
|------|--------|
| **Build Command** | `go build -o server .` |
| **Start Command** | `./server` |

(Render sam ustawia **PORT** – backend go czyta z zmiennej `PORT`.)

Jeśli w repo nie ma pliku `go.sum`, w katalogu `backend` uruchom lokalnie `go mod tidy` i wrzuć `go.sum` do repo, żeby build na Renderze się nie wywalał.

---

## 3. Zmienne środowiskowe (Environment)

W tym samym ekranie przewiń do **Environment** (Environment Variables) i dodaj zmienne.

### Baza MySQL (Railway – połączenie publiczne)

Backend jest na Renderze, baza na Railway – trzeba użyć **publicznego** hosta z Railway (nie `mysql.railway.internal`).

W **Railway** → projekt → serwis **MySQL** → **Variables**. Skopiuj:

| Na Renderze (Key) | Skąd wziąć (Railway Variables) |
|-------------------|----------------------------------|
| `MYSQLHOST` | **Nie** używaj `mysql.railway.internal`. Użyj hosta z **publicznego URL**. W Railway w Variables jest np. **MYSQLPUBLICURL** lub w Connect znajdziesz host – np. `crossover.proxy.rlwy.net`. Wpisz ten host. |
| `MYSQLPORT` | Port z publicznego URL (np. `19911`). W Railway czasem jest osobna zmienna, albo wyciągnij z URL: `...rlwy.net:19911/...` → port to `19911`. |
| `MYSQLUSER` | np. `root` (z Railway) |
| `MYSQLPASSWORD` | Skopiuj z Railway: **MYSQLPASSWORD** lub **MYSQL_ROOT_PASSWORD** |
| `MYSQLDATABASE` | Nazwa bazy (np. `railway`) |

**Przykład** (dostosuj do swoich wartości z Railway):

```
MYSQLHOST=crossover.proxy.rlwy.net
MYSQLPORT=19911
MYSQLUSER=root
MYSQLPASSWORD=twoje_haslo_z_railway
MYSQLDATABASE=railway
```

### reCAPTCHA

| Key | Wartość |
|-----|--------|
| `RECAPTCHA_SECRET_KEY` | Secret Key z [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin) (ten sam klucz, przy którym masz domeny Vercel) |

---

## 4. Zapisz i deploy

1. Kliknij **Create Web Service** (albo **Save** przy istniejącym serwisie).
2. Render zbuduje projekt (`go build -o server .` w katalogu `backend`) i uruchomi `./server`.
3. Po zakończeniu buildu skopiuj **URL** serwisu, np. `https://secureapp-p15d.onrender.com`.

---

## 5. Frontend (Vercel) – adres backendu

W **Vercel** → projekt frontendu → **Settings** → **Environment Variables** ustaw:

- **`VITE_API_URL`** = URL backendu z Render (np. `https://secureapp-p15d.onrender.com`)

Bez końcowego slasha. Zrób **Redeploy** frontendu, żeby build wziął nową wartość.

---

## 6. Sprawdzenie

- Backend: w przeglądarce otwórz `https://TWOJ-BACKEND.onrender.com/health`. Powinna być odpowiedź JSON: `{"ok":true}`.
- Rejestracja / logowanie: na stronie Vercel wypełnij formularz – żądania idą na Render.

---

## Uwagi

- **Variable Reference z Railway na Render:** jeśli w Renderze dodajesz zmienne przez „Variable Reference” i wybierasz MySQL z Railway, Render dostanie zmienne typu `MYSQLHOST=mysql.railway.internal`. Ten host działa **tylko wewnątrz Railway**. Backend na Renderze musi łączyć się **publicznie** – dlatego warto ustawić ręcznie `MYSQLHOST` i `MYSQLPORT` na wartości z **publicznego** URL (host i port z Railway).
- **go.sum:** w katalogu `backend` powinien być plik `go.sum`. Jeśli go nie ma, w folderze `backend` uruchom `go mod tidy` i dodaj `go.sum` do repozytorium.
