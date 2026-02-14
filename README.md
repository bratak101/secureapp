# Secure App – pełny stos uwierzytelniania

System rejestracji i logowania: **MySQL**, **Go (backend)**, **React (frontend)** z hashowaniem SHA-256+sól, JWT i zabezpieczeniami (CORS, walidacja, Prepared Statements).

---

## Wymagania

- **XAMPP** (MySQL; domyślnie port 3306, w XAMPP można zmienić w configu)
- **Go 1.21+** (backend)
- **Node.js 18+** (frontend)

---

## 1. Baza danych (MySQL / XAMPP)

1. Uruchom **XAMPP** i włącz **MySQL**.
2. Otwórz **phpMyAdmin**: `http://localhost/phpmyadmin`
3. Zakładka **SQL** → wklej zawartość pliku `database/schema.sql` i wykonaj.

Alternatywnie w konsoli (jeśli masz `mysql` w PATH):

```bash
mysql -u root -p < database/schema.sql
```

Powstanie baza `secure_app` i tabela `users` (id, username, email, password_hash, salt, created_at).

---

## 2. Backend (Golang)

### Konfiguracja

Zmienne środowiskowe (opcjonalne):

| Zmienna    | Domyślnie          | Opis                    |
|-----------|---------------------|-------------------------|
| `DB_USER` | `root`              | Użytkownik MySQL        |
| `DB_PASS` | *(puste)*           | Hasło MySQL             |
| `DB_HOST` | `127.0.0.1:3306`    | Adres MySQL (host:port)  |
| `DB_NAME` | `secure_app`        | Nazwa bazy              |
| `JWT_SECRET` | *(wbudowany)*    | Sekret JWT (w produkcji ustaw!) |
| `RECAPTCHA_SECRET_KEY` | *(puste)* | Klucz Google reCAPTCHA; gdy pusty – weryfikacja wyłączona |
| `PORT` | `8080` | Port HTTP backendu |

Przykład (PowerShell):

```powershell
$env:DB_USER="root"
$env:DB_PASS=""
$env:JWT_SECRET="twoj-bardzo-bezpieczny-sekret"
```

### Uruchomienie

```bash
cd backend
go mod tidy
go run main.go
```

Backend nasłuchuje na **http://localhost:8080**.

### Endpointy

| Metoda | Endpoint   | Opis |
|--------|------------|------|
| POST   | `/register` | Rejestracja (username, email, password) |
| POST   | `/login`    | Logowanie (email, password) → zwraca JWT |

---

## 3. Frontend (React)

### Instalacja i uruchomienie

```bash
cd frontend
npm install
npm run dev
```

Aplikacja działa pod **http://localhost:5173**.

### Konfiguracja API

Domyślnie frontend wywołuje backend pod `http://localhost:8080`.  
Aby zmienić adres, utwórz plik `.env` w `frontend/`:

```
VITE_API_URL=http://localhost:8080
```

---

## 4. Uruchomienie jednym skryptem (PowerShell / CMD)

**Wymagania:** XAMPP z włączonym MySQL oraz wykonany `database/schema.sql`.

- **PowerShell:** w katalogu projektu uruchom:
  ```powershell
  .\start-all.ps1
  ```
- **Dwuklik:** uruchom plik **`start-all.cmd`**.

Skrypt:
- uruchomi **Backend** i **Frontend** w osobnych oknach (z widocznymi logami),
- wyświetli **status** (Backend/Frontend – OK lub CZEKA) oraz **Twoje adresy IP**,
- przy pierwszym uruchomieniu wykona `npm install` w katalogu frontendu.

Zatrzymanie: zamknij okna „Secure App - Backend” i „Secure App - Frontend”.

---

## 5. Kolejność uruchomienia (ręcznie)

1. **XAMPP** → włącz **MySQL**.
2. Wykonaj **database/schema.sql** (phpMyAdmin lub `mysql`).
3. W jednym terminalu: `cd backend` → `go run main.go`.
4. W drugim: `cd frontend` → `npm install` → `npm run dev`.
5. Otwórz przeglądarkę: **http://localhost:5173**.

---

## Bezpieczeństwo (zaimplementowane)

- **Hasła**: SHA-256 z **unikalną solą** per użytkownik (nieodwracalne, sól w tabeli `users`).
- **SQL Injection**: zapytania tylko przez **Prepared Statements** (`?`).
- **CORS**: middleware na backendzie (dozwolone metody i nagłówki).
- **Walidacja**: długość username/email/hasła, format email (regex).
- **Sesja**: JWT (24 h), przechowywany po stronie frontendu w **localStorage** (dla produkcji warto rozważyć httpOnly cookie).
- **Google reCAPTCHA**: weryfikacja „nie jestem robotem” na rejestracji i logowaniu (darmowa; klucze w env).
- **Rate limiting**: 10 żądań/min na IP dla `/register` i `/login` (ochrona przed brute force).

**Wdrożenie (GitHub, darmowy hosting, DDoS):** patrz **[DEPLOY.md](DEPLOY.md)**.

---

## Struktura projektu

```
1/
├── start-all.ps1          # Skrypt uruchamiający backend + frontend (status, IP)
├── start-all.cmd          # Uruchomienie skryptu przez dwuklik
├── database/
│   └── schema.sql          # Tworzenie bazy i tabeli users
├── backend/
│   ├── main.go
│   ├── go.mod
│   └── internal/
│       ├── auth/            # Hash (SHA-256+sól), JWT
│       ├── database/        # Połączenie MySQL
│       ├── handlers/        # POST /register, /login
│       └── middleware/      # CORS
├── frontend/
│   ├── src/
│   │   ├── api/             # client (register, login)
│   │   ├── context/         # AuthContext (token, user)
│   │   └── pages/           # Home, Login, Register
│   ├── package.json
│   └── vite.config.js
└── README.md
```
