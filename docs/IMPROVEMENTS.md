# Nowe funkcje (v1.0)

## Backend

| Funkcja | Endpoint | Opis |
|---------|----------|------|
| **Role** | — | Kolumna `role` w `users` (domyślnie `user`). Aby nadać admin: `UPDATE users SET role='admin' WHERE id=1;` |
| **/me** | GET /me (Bearer token) | Zwraca dane użytkownika: user_id, username, email, role |
| **Zmiana hasła** | POST /change-password (Bearer) | Body: `{ "old_password", "new_password" }` |
| **Przypomnienie hasła** | POST /forgot-password | Body: `{ "email", "recaptcha_token" }` – wysyła 6-cyfrowy kod na e-mail (wymaga SENDGRID_API_KEY + MAIL_FROM) |
| **Reset hasła** | POST /reset-password | Body: `{ "email", "code", "new_password" }` |

## Frontend

- **Konto** – /me, e-mail, zmiana hasła
- **Zapomniane hasło** – link na logowaniu → /forgot-password → /reset-password
- **Role** – Admin widzi link „Admin” w menu (tylko gdy `user.role === 'admin'`)
- **Ochrona /admin** – tylko dla admin
- **Responsywność** – hamburger menu na mobile (lg: stały sidebar)
- **Dark/Light mode** – przełącznik w prawym górnym rogu
- **Loading** – skeleton przy ładowaniu /me na stronie Konto

## Migracja bazy

Dla istniejącej tabeli `users`:

```sql
ALTER TABLE users
  ADD COLUMN role                      VARCHAR(20)  NOT NULL DEFAULT 'user' AFTER salt,
  ADD COLUMN password_reset_code       VARCHAR(10)  NULL DEFAULT NULL AFTER created_at,
  ADD COLUMN password_reset_expires_at TIMESTAMP    NULL DEFAULT NULL AFTER password_reset_code;
```

Plik: `database/migrate-add-role-reset.sql`
