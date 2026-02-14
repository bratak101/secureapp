-- Migracja: dodanie role i kolumn reset hasła (dla istniejącej bazy).
ALTER TABLE users
  ADD COLUMN role                      VARCHAR(20)  NOT NULL DEFAULT 'user' AFTER salt,
  ADD COLUMN password_reset_code       VARCHAR(10)  NULL DEFAULT NULL AFTER created_at,
  ADD COLUMN password_reset_expires_at TIMESTAMP    NULL DEFAULT NULL AFTER password_reset_code;
