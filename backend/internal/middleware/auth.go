package middleware

import (
	"context"
	"net/http"
	"strings"

	"secure-app/backend/internal/auth"
)

type contextKey string

const (
	UserIDKey   contextKey = "user_id"
	UsernameKey contextKey = "username"
)

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
