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
	mux.HandleFunc("/me", middleware.RequireAuth(handlers.Me))
	mux.HandleFunc("/change-password", middleware.RateLimit(middleware.RequireAuth(handlers.ChangePassword)))

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
