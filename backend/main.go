package main

import (
	"log"
	"net/http"
	"os"

	"secure-app/backend/internal/database"
	"secure-app/backend/internal/handlers"
	"secure-app/backend/internal/middleware"
)

func main() {
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = os.Getenv("MYSQLHOST")
	}
	if dbHost != "" {
		log.Printf("DB_HOST/MYSQLHOST is set (len=%d)", len(dbHost))
	} else {
		log.Printf("DB_HOST and MYSQLHOST are both empty - using default 127.0.0.1:3306")
	}
	if err := database.Init(); err != nil {
		log.Fatalf("Database: %v", err)
	}
	defer database.Close()

	mux := http.NewServeMux()
	mux.HandleFunc("/health", handlers.Health)
	mux.HandleFunc("/register", middleware.RateLimit(handlers.Register))
	mux.HandleFunc("/login", middleware.RateLimit(handlers.Login))
	mux.HandleFunc("/me", middleware.RequireAuth(middleware.LogActivity(handlers.Me)))
	mux.HandleFunc("/change-password", middleware.RateLimit(middleware.RequireAuth(middleware.LogActivity(handlers.ChangePassword))))
	mux.HandleFunc("/admin/users", middleware.RequireAdmin(middleware.LogActivity(handlers.ListUsers)))
	mux.HandleFunc("/admin/users/role", middleware.RequireAdmin(middleware.LogActivity(handlers.UpdateUserRole)))
	mux.HandleFunc("/admin/users/reset-password", middleware.RequireAdmin(middleware.LogActivity(handlers.ResetUserPassword)))
	mux.HandleFunc("/admin/users/email", middleware.RequireAdmin(middleware.LogActivity(handlers.UpdateUserEmail)))
	mux.HandleFunc("/admin/logs", middleware.RequireAdmin(middleware.LogActivity(handlers.ListAdminLogs)))
	mux.HandleFunc("/admin/logins", middleware.RequireAdmin(middleware.LogActivity(handlers.ListLoginLogs)))
	mux.HandleFunc("/admin/activity", middleware.RequireAdmin(middleware.LogActivity(handlers.ListActivityLogs)))

	handler := middleware.CORS(mux)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	addr := ":" + port
	log.Printf("Backend listening on http://localhost%s", addr)
	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatal(err)
	}
}
