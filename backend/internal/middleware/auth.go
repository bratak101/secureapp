package middleware

import (
	"context"
	"database/sql"
	"log"
	"net/http"
	"strings"

	"secure-app/backend/internal/auth"
	"secure-app/backend/internal/database"
)

type contextKey string

const (
	UserIDKey   contextKey = "user_id"
	UsernameKey contextKey = "username"
	UserRoleKey contextKey = "user_role"
)

// remoteIP zwraca adres IP klienta (X-Forwarded-For, X-Real-IP lub RemoteAddr).
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

// LogActivity zapisuje każde żądanie zalogowanego użytkownika do activity_log (method, path, IP, page).
// Użyj po RequireAuth/RequireAdmin: RequireAuth(LogActivity(handler)).
func LogActivity(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := GetUserID(r)
		if userID != 0 && database.DB != nil {
			path := r.URL.Path
			if len(path) > 512 {
				path = path[:512]
			}
			method := r.Method
			if len(method) > 16 {
				method = method[:16]
			}
			page := strings.TrimSpace(r.Header.Get("X-Current-Path"))
			if len(page) > 512 {
				page = page[:512]
			}
			_, err := database.DB.Exec(
				`INSERT INTO activity_log (user_id, method, path, ip_address, page) VALUES (?, ?, ?, ?, ?)`,
				userID, method, path, remoteIP(r), page,
			)
			if err != nil {
				log.Printf("[ACTIVITY_LOG] insert: %v", err)
			}
		}
		next(w, r)
	}
}

// RequireAuth weryfikuje Bearer token i zapisuje user_id, username w kontekście.
func RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			respond401(w, "Brak tokenu")
			return
		}
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			respond401(w, "Nieprawidłowy format tokenu")
			return
		}
		claims, err := auth.ParseToken(parts[1])
		if err != nil {
			respond401(w, "Token nieprawidłowy lub wygasły")
			return
		}
		ctx := context.WithValue(r.Context(), UserIDKey, claims.UserID)
		ctx = context.WithValue(ctx, UsernameKey, claims.Username)
		next(w, r.WithContext(ctx))
	}
}

// RequireAdmin wymaga zalogowania (RequireAuth) i roli admin. Zapisuje rolę w kontekście.
func RequireAdmin(next http.HandlerFunc) http.HandlerFunc {
	return RequireAuth(func(w http.ResponseWriter, r *http.Request) {
		userID := GetUserID(r)
		var role string
		err := database.DB.QueryRow(`SELECT COALESCE(role, 'user') FROM users WHERE id = ? LIMIT 1`, userID).Scan(&role)
		if err != nil {
			if err == sql.ErrNoRows {
				respond401(w, "User not found")
				return
			}
			http.Error(w, `{"error":"Server error"}`, http.StatusInternalServerError)
			return
		}
		if role != "admin" {
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			w.WriteHeader(http.StatusForbidden)
			_, _ = w.Write([]byte(`{"error":"Dostep tylko dla administratora"}`))
			return
		}
		ctx := context.WithValue(r.Context(), UserRoleKey, role)
		next(w, r.WithContext(ctx))
	})
}

func GetUserID(r *http.Request) uint {
	v, _ := r.Context().Value(UserIDKey).(uint)
	return v
}

func GetUsername(r *http.Request) string {
	v, _ := r.Context().Value(UsernameKey).(string)
	return v
}

func respond401(w http.ResponseWriter, msg string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusUnauthorized)
	_, _ = w.Write([]byte(`{"error":"` + msg + `"}`))
}
