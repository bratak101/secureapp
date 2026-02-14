-- ============================================
-- Secure App - Skrypt tworzenia bazy danych
-- Uruchom w phpMyAdmin (XAMPP)
-- ============================================
--
-- INSTRUKCJA:
-- 1) Wklej i wykonaj PONIŻSZY BLOK 1 (tylko CREATE DATABASE).
-- 2) W lewym panelu phpMyAdmin kliknij bazę "secure_app", żeby ją wybrać.
-- 3) Przejdź do zakładki SQL i wklej oraz wykonaj BLOK 2 (CREATE TABLE).
-- ============================================

-- ---------- BLOK 1: Tworzenie bazy (wykonaj jako pierwszy) ----------
CREATE DATABASE IF NOT EXISTS secure_app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;


-- ---------- BLOK 2: Tabela users (najpierw wybierz bazę "secure_app" w lewym panelu) ----------
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username      VARCHAR(64)  NOT NULL,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(64)  NOT NULL COMMENT 'SHA-256(salt+password) hex',
  salt          VARCHAR(64)  NOT NULL COMMENT 'Unikalna sól w hex',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_username (username),
  UNIQUE KEY uk_email (email),
  KEY idx_email (email),
  KEY idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
