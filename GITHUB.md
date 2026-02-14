# Jak dodać projekt na GitHub

## Krok 0: Zainstaluj Git (jeśli nie masz)

- Pobierz: **https://git-scm.com/download/win**
- Zainstaluj (domyślne opcje OK).
- Albo w PowerShell (Chocolatey): `choco install git -y`
- Zamknij i otwórz ponownie terminal.

---

## Krok 1: Utwórz repozytorium na GitHubie

1. Wejdź na **https://github.com** i zaloguj się.
2. Kliknij **+** (prawy górny róg) → **New repository**.
3. **Repository name:** np. `secure-app`.
4. **Public**, bez zaznaczania "Add a README" (projekt już go ma).
5. Kliknij **Create repository**.

---

## Krok 2: Wypchnij kod z komputera

W **PowerShell** (w folderze projektu):

```powershell
cd c:\Users\Administrator\Documents\1

git init
git add .
git commit -m "Secure App: auth, Turnstile, rate limit"

git remote add origin https://github.com/TWOJA_NAZWA_NA_GITHUB/secure-app.git
git branch -M main
git push -u origin main
```

**Zamień `TWOJA_NAZWA_NA_GITHUB`** na swoją nazwę użytkownika z GitHub (np. jan-kowalski).

Przy pierwszym `git push` może pojawić się logowanie do GitHub (przeglądarka lub token).

---

## Uwaga

- Pliki z **.gitignore** (np. `node_modules`, `.env`) nie trafią na GitHub – to dobrze.
- **Nie wrzucaj** haseł ani kluczy (np. `TURNSTILE_SECRET_KEY`, `JWT_SECRET`) do repo – ustawiaj je w zmiennych środowiskowych na serwerze (Vercel, Render itd.).

Po wypchnięciu kodu możesz podłączyć repo do **Vercel** lub **Netlify**, żeby dostać darmowy hosting – opis jest w **DEPLOY.md**.
