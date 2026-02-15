package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strings"

	"secure-app/backend/internal/auth"
	"secure-app/backend/internal/database"
	"secure-app/backend/internal/middleware"
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
	Page           string `json:"page"` // dokładna strona (path) w momencie logowania
}

// AuthResponse odpowiedź z tokenem.
type AuthResponse struct {
	Token    string `json:"token"`
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role,omitempty"`
}

// MeResponse dane użytkownika z /me.
type MeResponse struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Role     string `json:"role"`
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
	if xri := r.Header.Get("X-Real-IP"); xri != "" {
		return strings.TrimSpace(xri)
	}
	return r.RemoteAddr
}

// logAdminAction zapisuje akcję admina do admin_audit_log (admin_id, action, target_user_id, details, IP, page).
func logAdminAction(r *http.Request, adminID uint, action string, targetUserID *uint, details, page string) {
	if database.DB == nil {
		return
	}
	ip := remoteIP(r)
	if page == "" {
		page = strings.TrimSpace(r.Header.Get("X-Current-Path"))
	}
	var targetID interface{}
	if targetUserID != nil {
		targetID = *targetUserID
	} else {
		targetID = nil
	}
	_, err := database.DB.Exec(
		`INSERT INTO admin_audit_log (admin_id, action, target_user_id, details, ip_address, page) VALUES (?, ?, ?, ?, ?, ?)`,
		adminID, action, targetID, details, ip, truncatePage(page),
	)
	if err != nil {
		log.Printf("[ADMIN_AUDIT] insert: %v", err)
	}
}

func truncatePage(s string) string {
	if len(s) > 512 {
		return s[:512]
	}
	return s
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
		`INSERT INTO users (username, email, password_hash, salt, role, created_at) VALUES (?, ?, ?, ?, 'user', NOW())`,
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
		Role:     "user",
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
	var username, passwordHash, salt, role string
	err := database.DB.QueryRow(
		`SELECT id, username, password_hash, salt, COALESCE(role, 'user') FROM users WHERE email = ? LIMIT 1`,
		req.Email,
	).Scan(&id, &username, &passwordHash, &salt, &role)
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
	// Zapis wejścia (logowania) do login_log
	if database.DB != nil {
		page := truncatePage(strings.TrimSpace(req.Page))
		_, _ = database.DB.Exec(
			`INSERT INTO login_log (user_id, ip_address, page) VALUES (?, ?, ?)`,
			id, remoteIP(r), page,
		)
	}
	respondJSON(w, http.StatusOK, AuthResponse{
		Token:    token,
		UserID:   id,
		Username: username,
		Role:     role,
	})
}

// Me zwraca dane zalogowanego użytkownika (wymaga Bearer token).
func Me(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		respondError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	userID := middleware.GetUserID(r)
	var username, email, role string
	err := database.DB.QueryRow(
		`SELECT username, email, COALESCE(role, 'user') FROM users WHERE id = ? LIMIT 1`,
		userID,
	).Scan(&username, &email, &role)
	if err != nil {
		respondError(w, http.StatusNotFound, "User not found")
		return
	}
	respondJSON(w, http.StatusOK, MeResponse{
		UserID:   userID,
		Username: username,
		Email:    email,
		Role:     role,
	})
}

// ChangePasswordRequest body zmiany hasła.
type ChangePasswordRequest struct {
	OldPassword string `json:"old_password"`
	NewPassword string `json:"new_password"`
}

// ChangePassword zmienia hasło zalogowanego użytkownika.
func ChangePassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respondError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	userID := middleware.GetUserID(r)
	var req ChangePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid JSON")
		return
	}
	req.NewPassword = strings.TrimSpace(req.NewPassword)
	if len(req.NewPassword) < 8 {
		respondError(w, http.StatusBadRequest, "Nowe haslo musi miec min. 8 znakow")
		return
	}
	var passwordHash, salt string
	err := database.DB.QueryRow(`SELECT password_hash, salt FROM users WHERE id = ?`, userID).Scan(&passwordHash, &salt)
	if err != nil {
		respondError(w, http.StatusNotFound, "User not found")
		return
	}
	if !auth.VerifyPassword(salt, passwordHash, req.OldPassword) {
		respondError(w, http.StatusUnauthorized, "Obecne haslo jest nieprawidlowe")
		return
	}
	newSalt, err := auth.GenerateSalt()
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Server error")
		return
	}
	newHash := auth.HashPassword(newSalt, req.NewPassword)
	_, err = database.DB.Exec(`UPDATE users SET password_hash = ?, salt = ? WHERE id = ?`, newHash, newSalt, userID)
	if err != nil {
		log.Printf("[CHANGE_PASSWORD] %v", err)
		respondError(w, http.StatusInternalServerError, "Server error")
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"ok": "Haslo zmienione"})
}

// UserListItem pojedynczy użytkownik na liście admina.
type UserListItem struct {
	ID        uint   `json:"id"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	Role      string `json:"role"`
	CreatedAt string `json:"created_at"`
}

// ListUsers zwraca listę użytkowników (tylko admin).
func ListUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		respondError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	rows, err := database.DB.Query(
		`SELECT id, username, email, COALESCE(role, 'user'), created_at FROM users ORDER BY id ASC`,
	)
	if err != nil {
		log.Printf("[LIST_USERS] %v", err)
		respondError(w, http.StatusInternalServerError, "Server error")
		return
	}
	defer rows.Close()
	var list []UserListItem
	for rows.Next() {
		var u UserListItem
		var createdAt []byte
		if err := rows.Scan(&u.ID, &u.Username, &u.Email, &u.Role, &createdAt); err != nil {
			log.Printf("[LIST_USERS] scan: %v", err)
			continue
		}
		u.CreatedAt = string(createdAt)
		list = append(list, u)
	}
	respondJSON(w, http.StatusOK, map[string]interface{}{"users": list})
}

// UpdateUserRoleRequest zmiana roli użytkownika (tylko admin).
type UpdateUserRoleRequest struct {
	UserID uint   `json:"user_id"`
	Role   string `json:"role"`
}

// UpdateUserRole ustawia rolę użytkownika (user | admin).
func UpdateUserRole(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch && r.Method != http.MethodPut && r.Method != http.MethodPost {
		respondError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	var req UpdateUserRoleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid JSON")
		return
	}
	req.Role = strings.TrimSpace(strings.ToLower(req.Role))
	if req.Role != "user" && req.Role != "admin" {
		respondError(w, http.StatusBadRequest, "Rola musi byc 'user' lub 'admin'")
		return
	}
	if req.UserID == 0 {
		respondError(w, http.StatusBadRequest, "user_id jest wymagany")
		return
	}
	result, err := database.DB.Exec(`UPDATE users SET role = ? WHERE id = ?`, req.Role, req.UserID)
	if err != nil {
		log.Printf("[UPDATE_USER_ROLE] %v", err)
		respondError(w, http.StatusInternalServerError, "Server error")
		return
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		respondError(w, http.StatusNotFound, "Uzytkownik nie znaleziony")
		return
	}
	logAdminAction(r, middleware.GetUserID(r), "update_role", &req.UserID, "role="+req.Role, "")
	respondJSON(w, http.StatusOK, map[string]string{"ok": "Rola zaktualizowana"})
}

// ResetUserPasswordRequest reset hasła przez admina.
type ResetUserPasswordRequest struct {
	UserID      uint   `json:"user_id"`
	NewPassword string `json:"new_password"`
}

// ResetUserPassword ustawia nowe hasło użytkownikowi (tylko admin).
func ResetUserPassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respondError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	var req ResetUserPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid JSON")
		return
	}
	req.NewPassword = strings.TrimSpace(req.NewPassword)
	if len(req.NewPassword) < 8 {
		respondError(w, http.StatusBadRequest, "Nowe haslo musi miec min. 8 znakow")
		return
	}
	if req.UserID == 0 {
		respondError(w, http.StatusBadRequest, "user_id jest wymagany")
		return
	}
	newSalt, err := auth.GenerateSalt()
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Server error")
		return
	}
	newHash := auth.HashPassword(newSalt, req.NewPassword)
	result, err := database.DB.Exec(`UPDATE users SET password_hash = ?, salt = ? WHERE id = ?`, newHash, newSalt, req.UserID)
	if err != nil {
		log.Printf("[RESET_USER_PASSWORD] %v", err)
		respondError(w, http.StatusInternalServerError, "Server error")
		return
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		respondError(w, http.StatusNotFound, "Uzytkownik nie znaleziony")
		return
	}
	logAdminAction(r, middleware.GetUserID(r), "reset_password", &req.UserID, "", "")
	respondJSON(w, http.StatusOK, map[string]string{"ok": "Haslo zresetowane"})
}

// UpdateUserEmailRequest zmiana e-mail użytkownika (tylko admin).
type UpdateUserEmailRequest struct {
	UserID uint   `json:"user_id"`
	Email  string `json:"email"`
}

// UpdateUserEmail ustawia nowy e-mail użytkownikowi (tylko admin).
func UpdateUserEmail(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch && r.Method != http.MethodPut && r.Method != http.MethodPost {
		respondError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	var req UpdateUserEmailRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid JSON")
		return
	}
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if !emailRegex.MatchString(req.Email) {
		respondError(w, http.StatusBadRequest, "Nieprawidlowy format e-mail")
		return
	}
	if req.UserID == 0 {
		respondError(w, http.StatusBadRequest, "user_id jest wymagany")
		return
	}
	var count int
	if err := database.DB.QueryRow(`SELECT COUNT(*) FROM users WHERE email = ? AND id != ?`, req.Email, req.UserID).Scan(&count); err != nil || count > 0 {
		respondError(w, http.StatusConflict, "Ten e-mail jest juz uzywany")
		return
	}
	result, err := database.DB.Exec(`UPDATE users SET email = ? WHERE id = ?`, req.Email, req.UserID)
	if err != nil {
		log.Printf("[UPDATE_USER_EMAIL] %v", err)
		respondError(w, http.StatusInternalServerError, "Server error")
		return
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		respondError(w, http.StatusNotFound, "Uzytkownik nie znaleziony")
		return
	}
	logAdminAction(r, middleware.GetUserID(r), "update_email", &req.UserID, "email="+req.Email, "")
	respondJSON(w, http.StatusOK, map[string]string{"ok": "E-mail zaktualizowany"})
}

// AdminLogEntry pojedynczy wpis z admin_audit_log.
type AdminLogEntry struct {
	ID           uint   `json:"id"`
	AdminID      uint   `json:"admin_id"`
	AdminName    string `json:"admin_name,omitempty"`
	Action       string `json:"action"`
	TargetUserID *uint  `json:"target_user_id,omitempty"`
	Details      string `json:"details,omitempty"`
	IPAddress    string `json:"ip_address,omitempty"`
	Page         string `json:"page,omitempty"` // dokładna strona w momencie akcji
	CreatedAt    string `json:"created_at"`
}

// ListAdminLogs zwraca logi administracji (tylko admin). Query: ip=, action=, limit= (domyślnie 100).
func ListAdminLogs(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		respondError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	q := r.URL.Query()
	ipFilter := strings.TrimSpace(q.Get("ip"))
	actionFilter := strings.TrimSpace(strings.ToLower(q.Get("action")))
	limit := 100
	if l := q.Get("limit"); l != "" {
		if n, err := parseInt(l); err == nil && n > 0 && n <= 500 {
			limit = n
		}
	}
	args := []interface{}{}
	where := []string{}
	if ipFilter != "" {
		where = append(where, "l.ip_address LIKE ?")
		args = append(args, "%"+ipFilter+"%")
	}
	if actionFilter != "" {
		where = append(where, "l.action = ?")
		args = append(args, actionFilter)
	}
	whereSQL := ""
	if len(where) > 0 {
		whereSQL = "WHERE " + strings.Join(where, " AND ")
	}
	args = append(args, limit)
	query := `
		SELECT l.id, l.admin_id, u.username, l.action, l.target_user_id, l.details, l.ip_address, l.page, l.created_at
		FROM admin_audit_log l
		LEFT JOIN users u ON u.id = l.admin_id
		` + whereSQL + `
		ORDER BY l.created_at DESC
		LIMIT ?
	`
	rows, err := database.DB.Query(query, args...)
	if err != nil {
		log.Printf("[LIST_ADMIN_LOGS] %v", err)
		respondError(w, http.StatusInternalServerError, "Server error")
		return
	}
	defer rows.Close()
	var list []AdminLogEntry
	for rows.Next() {
		var e AdminLogEntry
		var adminName sql.NullString
		var targetID sql.NullInt64
		var details, ipAddr, page sql.NullString
		if err := rows.Scan(&e.ID, &e.AdminID, &adminName, &e.Action, &targetID, &details, &ipAddr, &page, &e.CreatedAt); err != nil {
			log.Printf("[LIST_ADMIN_LOGS] scan: %v", err)
			continue
		}
		if adminName.Valid {
			e.AdminName = adminName.String
		}
		if targetID.Valid {
			u := uint(targetID.Int64)
			e.TargetUserID = &u
		}
		if details.Valid {
			e.Details = details.String
		}
		if ipAddr.Valid {
			e.IPAddress = ipAddr.String
		}
		if page.Valid {
			e.Page = page.String
		}
		list = append(list, e)
	}
	respondJSON(w, http.StatusOK, map[string]interface{}{"logs": list})
}

// LoginLogEntry pojedynczy wpis z login_log (wejście użytkownika).
type LoginLogEntry struct {
	ID         uint   `json:"id"`
	UserID     uint   `json:"user_id"`
	Username   string `json:"username,omitempty"`
	IPAddress  string `json:"ip_address,omitempty"`
	Page       string `json:"page,omitempty"`
	CreatedAt  string `json:"created_at"`
}

// ListLoginLogs zwraca wejścia (logowania). Tylko admin. Query: ip=, limit= (domyślnie 100).
func ListLoginLogs(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		respondError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	q := r.URL.Query()
	ipFilter := strings.TrimSpace(q.Get("ip"))
	limit := 100
	if l := q.Get("limit"); l != "" {
		if n, err := parseInt(l); err == nil && n > 0 && n <= 500 {
			limit = n
		}
	}
	args := []interface{}{}
	where := "WHERE 1=1"
	if ipFilter != "" {
		where += " AND ll.ip_address LIKE ?"
		args = append(args, "%"+ipFilter+"%")
	}
	args = append(args, limit)
	query := `
		SELECT ll.id, ll.user_id, u.username, ll.ip_address, ll.page, ll.created_at
		FROM login_log ll
		LEFT JOIN users u ON u.id = ll.user_id
		` + where + `
		ORDER BY ll.created_at DESC
		LIMIT ?
	`
	rows, err := database.DB.Query(query, args...)
	if err != nil {
		log.Printf("[LIST_LOGIN_LOGS] %v", err)
		respondError(w, http.StatusInternalServerError, "Server error")
		return
	}
	defer rows.Close()
	var list []LoginLogEntry
	for rows.Next() {
		var e LoginLogEntry
		var username, ipAddr, page sql.NullString
		if err := rows.Scan(&e.ID, &e.UserID, &username, &ipAddr, &page, &e.CreatedAt); err != nil {
			log.Printf("[LIST_LOGIN_LOGS] scan: %v", err)
			continue
		}
		if username.Valid {
			e.Username = username.String
		}
		if ipAddr.Valid {
			e.IPAddress = ipAddr.String
		}
		if page.Valid {
			e.Page = page.String
		}
		list = append(list, e)
	}
	respondJSON(w, http.StatusOK, map[string]interface{}{"logins": list})
}

// ActivityLogEntry pojedynczy wpis z activity_log (każda akcja API).
type ActivityLogEntry struct {
	ID         uint   `json:"id"`
	UserID     uint   `json:"user_id"`
	Username   string `json:"username,omitempty"`
	Method     string `json:"method"`
	Path       string `json:"path"`
	IPAddress  string `json:"ip_address,omitempty"`
	Page       string `json:"page,omitempty"`
	CreatedAt  string `json:"created_at"`
}

// ListActivityLogs zwraca log aktywności (każda akcja). Tylko admin. Query: user_id=, path=, ip=, limit=.
func ListActivityLogs(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		respondError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	q := r.URL.Query()
	userIDFilter := strings.TrimSpace(q.Get("user_id"))
	pathFilter := strings.TrimSpace(q.Get("path"))
	ipFilter := strings.TrimSpace(q.Get("ip"))
	limit := 100
	if l := q.Get("limit"); l != "" {
		if n, err := parseInt(l); err == nil && n > 0 && n <= 500 {
			limit = n
		}
	}
	args := []interface{}{}
	where := []string{}
	if userIDFilter != "" {
		if uid, err := parseInt(userIDFilter); err == nil && uid > 0 {
			where = append(where, "a.user_id = ?")
			args = append(args, uid)
		}
	}
	if pathFilter != "" {
		where = append(where, "a.path LIKE ?")
		args = append(args, "%"+pathFilter+"%")
	}
	if ipFilter != "" {
		where = append(where, "a.ip_address LIKE ?")
		args = append(args, "%"+ipFilter+"%")
	}
	whereSQL := ""
	if len(where) > 0 {
		whereSQL = "WHERE " + strings.Join(where, " AND ")
	}
	args = append(args, limit)
	query := `
		SELECT a.id, a.user_id, u.username, a.method, a.path, a.ip_address, a.page, a.created_at
		FROM activity_log a
		LEFT JOIN users u ON u.id = a.user_id
		` + whereSQL + `
		ORDER BY a.created_at DESC
		LIMIT ?
	`
	rows, err := database.DB.Query(query, args...)
	if err != nil {
		log.Printf("[LIST_ACTIVITY_LOGS] %v", err)
		respondError(w, http.StatusInternalServerError, "Server error")
		return
	}
	defer rows.Close()
	var list []ActivityLogEntry
	for rows.Next() {
		var e ActivityLogEntry
		var username, ipAddr, page sql.NullString
		if err := rows.Scan(&e.ID, &e.UserID, &username, &e.Method, &e.Path, &ipAddr, &page, &e.CreatedAt); err != nil {
			log.Printf("[LIST_ACTIVITY_LOGS] scan: %v", err)
			continue
		}
		if username.Valid {
			e.Username = username.String
		}
		if ipAddr.Valid {
			e.IPAddress = ipAddr.String
		}
		if page.Valid {
			e.Page = page.String
		}
		list = append(list, e)
	}
	respondJSON(w, http.StatusOK, map[string]interface{}{"activity": list})
}

func parseInt(s string) (int, error) {
	var n int
	_, err := fmt.Sscanf(s, "%d", &n)
	return n, err
}
