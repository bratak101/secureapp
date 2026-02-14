-- Migracja: dodanie kolumny role (dla istniejącej bazy).
ALTER TABLE users
  ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user' AFTER salt;
