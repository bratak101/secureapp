package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"regexp"
	"strings"

	"secure-app/backend/internal/auth"
	"secure-app/backend/internal/database"
	"secure-app/backend/internal/recaptcha"
)

var (
	emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
)

// RegisterRequest body rejestracji.
type RegisterRequest struct {
	Username       string `json:"username"`
	Email          string `json:"email"`
	Password       string `json:"password"`
	RecaptchaToken string `json:"recaptcha_token"`
}

// LoginRequest body logowania.
type LoginRequest struct {
	Email          string `json:"email"`
	Password       string `json:"password"`
	RecaptchaToken string `json:"recaptcha_token"`
}

// AuthResponse odpowiedź z tokenem.
type AuthResponse struct {
	Token    string `json:"token"`
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
}

// ErrorResponse błąd API.
type ErrorResponse struct {
	Error string `json:"error"`
}

func respondJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func respondError(w http.ResponseWriter, status int, msg string) {
	respondJSON(w, status, ErrorResponse{Error: msg})
}

func remoteIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		if i := strings.Index(xff, ","); i >= 0 {
			return strings.TrimSpace(xff[:i])
		}
		return strings.TrimSpace(xff)
	}
	return r.RemoteAddr
}

// Health sprawdza, czy backend i baza działają.
func Health(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		respondError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	if database.DB == nil {
		respondError(w, http.StatusServiceUnavailable, "Database not connected")
		return
	}
	if err := database.DB.Ping(); err != nil {
		log.Printf("[HEALTH] DB Ping: %v", err)
		respondError(w, http.StatusServiceUnavailable, "Database error")
		return
	}
	respondJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

// Register rejestruje nowego użytkownika (Prepared Statement, walidacja, SHA-256+salt).
func Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respondError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid JSON")
		return
	}
	req.Username = strings.TrimSpace(req.Username)
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	req.Password = strings.TrimSpace(req.Password)

	if len(req.Username) < 3 || len(req.Username) > 64 {
		respondError(w, http.StatusBadRequest, "Username must be 3–64 characters")
		return
	}
	if !emailRegex.MatchString(req.Email) {
		respondError(w, http.StatusBadRequest, "Invalid email")
		return
	}
	if len(req.Password) < 8 {
		respondError(w, http.StatusBadRequest, "Password must be at least 8 characters")
		return
	}
	if !recaptcha.Verify(req.RecaptchaToken, remoteIP(r)) {
		respondError(w, http.StatusBadRequest, "Weryfikacja reCAPTCHA nie powiodla sie. Odswiez strone i sprobuj ponownie.")
		return
	}

	salt, err := auth.GenerateSalt()
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Server error")
		return
	}
	passwordHash := auth.HashPassword(salt, req.Password)

	// Prepared Statement – ochrona przed SQL Injection (created_at jawnie – działa przy TIMESTAMP i DATE)
	res, err := database.DB.Exec(
		`INSERT INTO users (username, email, password_hash, salt, created_at) VALUES (?, ?, ?, ?, NOW())`,
		req.Username,
		req.Email,
		passwordHash,
		salt,
	)
	if err != nil {
		log.Printf("[REGISTER] DB error: %v", err)
		if strings.Contains(err.Error(), "Duplicate entry") {
			respondError(w, http.StatusConflict, "Username or email already exists")
			return
		}
		if strings.Contains(err.Error(), "Unknown database") || strings.Contains(err.Error(), "doesn't exist") {
			respondError(w, http.StatusServiceUnavailable, "Database not ready. Run schema.sql in phpMyAdmin.")
			return
		}
		if strings.Contains(err.Error(), "Unknown column") {
			respondError(w, http.StatusServiceUnavailable, "Tabela users ma zla strukture. Uruchom database/schema.sql (kolumna created_at TIMESTAMP).")
			return
		}
		if strings.Contains(err.Error(), "Access denied") || strings.Contains(err.Error(), "connection refused") {
			respondError(w, http.StatusServiceUnavailable, "Cannot connect to MySQL. Start XAMPP and check DB_USER/DB_PASS.")
			return
		}
		respondError(w, http.StatusInternalServerError, "Registration failed")
		return
	}
	id, _ := res.LastInsertId()
	token, err := auth.CreateToken(uint(id), req.Username)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Server error")
		return
	}
	respondJSON(w, http.StatusCreated, AuthResponse{
		Token:    token,
		UserID:   uint(id),
		Username: req.Username,
	})
}

// Login loguje użytkownika (Prepared Statement, weryfikacja hasła).
func Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respondError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid JSON")
		return
	}
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if req.Email == "" || req.Password == "" {
		respondError(w, http.StatusBadRequest, "Email and password required")
		return
	}
	if !recaptcha.Verify(req.RecaptchaToken, remoteIP(r)) {
		respondError(w, http.StatusBadRequest, "Weryfikacja reCAPTCHA nie powiodla sie. Odswiez strone i sprobuj ponownie.")
		return
	}

	var id uint
	var username, passwordHash, salt string
	// Prepared Statement – ochrona przed SQL Injection
	err := database.DB.QueryRow(
		`SELECT id, username, password_hash, salt FROM users WHERE email = ? LIMIT 1`,
		req.Email,
	).Scan(&id, &username, &passwordHash, &salt)
	if err != nil {
		respondError(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}
	if !auth.VerifyPassword(salt, passwordHash, req.Password) {
		respondError(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}
	token, err := auth.CreateToken(id, username)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Server error")
		return
	}
	respondJSON(w, http.StatusOK, AuthResponse{
		Token:    token,
		UserID:   id,
		Username: username,
	})
}
