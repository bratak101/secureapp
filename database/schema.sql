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
  id                         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username                   VARCHAR(64)  NOT NULL,
  email                      VARCHAR(255) NOT NULL,
  password_hash              VARCHAR(64)  NOT NULL COMMENT 'SHA-256(salt+password) hex',
  salt                       VARCHAR(64)  NOT NULL COMMENT 'Unikalna sól w hex',
  role                       VARCHAR(20)  NOT NULL DEFAULT 'user',
  created_at                 TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_username (username),
  UNIQUE KEY uk_email (email),
  KEY idx_email (email),
  KEY idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- BLOK 3: Tabela logów administracji (admin audit log) ----------
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  admin_id        INT UNSIGNED NOT NULL,
  action          VARCHAR(64)  NOT NULL COMMENT 'np. update_role, reset_password, update_email',
  target_user_id  INT UNSIGNED NULL COMMENT 'ID użytkownika, którego dotyczy akcja',
  details         VARCHAR(512) NULL COMMENT 'np. role=admin, nowy email',
  ip_address      VARCHAR(64)  NULL,
  page            VARCHAR(512) NULL COMMENT 'Dokładna strona (path) w momencie akcji',
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_admin_id (admin_id),
  KEY idx_action (action),
  KEY idx_ip_address (ip_address),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Jeśli tabela admin_audit_log już istniała (bez kolumny page), wykonaj:
-- ALTER TABLE admin_audit_log ADD COLUMN page VARCHAR(512) NULL AFTER ip_address;

-- ---------- BLOK 4: Tabela wejść (logowania użytkowników) ----------
CREATE TABLE IF NOT EXISTS login_log (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED NOT NULL,
  ip_address VARCHAR(64)  NULL,
  page       VARCHAR(512) NULL COMMENT 'Dokładna strona (path) w momencie logowania',
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id),
  KEY idx_ip_address (ip_address),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- BLOK 5: Tabela aktywności (każda akcja API zalogowanego użytkownika) ----------
CREATE TABLE IF NOT EXISTS activity_log (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED NOT NULL,
  method     VARCHAR(16)  NOT NULL,
  path       VARCHAR(512) NOT NULL COMMENT 'Ścieżka API, np. /me, /admin/users',
  ip_address VARCHAR(64)  NULL,
  page       VARCHAR(512) NULL COMMENT 'Strona w aplikacji (X-Current-Path)',
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id),
  KEY idx_path (path(128)),
  KEY idx_ip_address (ip_address),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
